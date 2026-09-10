"""Convert the client's 敏感词库.xlsx into the JSON the moderation filter loads.

Source: docs/client-inputs/sensitive-words-CN.xlsx (client attachment, ClickUp 86eyczra3, 4 Aug 2026)
Output: data/moderation-lexicon.json

Run: python scripts/build_lexicon.py
"""

import json
import re
from collections import Counter
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "client-inputs" / "sensitive-words-CN.xlsx"
OUT = ROOT / "data" / "moderation-lexicon.json"

# The spreadsheet encodes risk as an emoji-prefixed Chinese label. Normalise to
# stable machine values; the emoji is presentational and must not reach the code.
RISK = {"🔴 高风险": "high", "🟡 中风险": "mid", "🟢 低风险": "low"}

# Three source rows arrived with U+FFFD replacement characters in the term itself.
# Each is recovered from its own 违规原因 cell, which survived intact. Stripping the
# damaged bytes instead would truncate the term and turn it into a catastrophic
# false positive — 场外交易 → 场 would block every post containing 市场.
# Keyed by the row's 序号. `confident` rows are quoted verbatim in the reason text;
# row 104 is an inference and stays inactive until the client confirms it.
REPAIRS = {
    100: {"term": "大额换汇", "from": "涉及大额换汇，需确认不涉及逃汇套汇", "confident": True},
    161: {"term": "赌场", "from": "涉及赌博场所宣传或讨论", "confident": True},
    104: {"term": "报税", "from": "涉及税务申报话题", "confident": False},
}

# 分类说明 sheet maps Chinese category names to the codes we store.
def category_codes(wb):
    codes = {}
    for code, name, note in wb["分类说明"].iter_rows(min_row=2, values_only=True):
        if code and name:
            codes[name.strip()] = {"code": code.strip(), "note": (note or "").strip()}
    return codes


DAMAGE = "�"


def clean(value):
    """Normalise whitespace. Deliberately does NOT remove U+FFFD — damage must stay
    visible so it can be reported rather than silently changing a term's meaning."""
    return str(value or "").strip()


def build():
    wb = openpyxl.load_workbook(SRC)
    codes = category_codes(wb)

    keywords = []
    repaired = []
    for row in wb["敏感词库"].iter_rows(min_row=2, values_only=True):
        seq, term, category, risk, reason, basis = row
        if not term:
            continue
        cat = codes.get(clean(category), {})
        entry = {
            "seq": seq,
            "term": clean(term),
            "category": cat.get("code", "unmapped"),
            "category_cn": clean(category),
            "risk": RISK[risk],
            "reason": clean(reason),
            "basis": clean(basis),
            "active": True,
        }

        if DAMAGE in entry["term"]:
            fix = REPAIRS.get(seq)
            if not fix:
                # Unknown damage: never guess. Keep it out of matching entirely.
                entry.update(active=False, source_term=entry["term"], repair="unresolved")
            else:
                entry.update(
                    source_term=entry["term"],
                    term=fix["term"],
                    repair="confident" if fix["confident"] else "inferred",
                    repair_evidence=fix["from"],
                    # An inferred term must not silently start blocking posts.
                    active=fix["confident"],
                )
            repaired.append(entry)

        keywords.append(entry)

    patterns = []
    for row in wb["模式规则"].iter_rows(min_row=2, values_only=True):
        _, name, pattern, category, risk, reason, basis = row
        if not pattern:
            continue
        cat = codes.get(clean(category), {})
        compiled = clean(pattern)
        re.compile(compiled)  # fail the build on an invalid source pattern
        patterns.append(
            {
                "name": clean(name),
                "pattern": compiled,
                "category": cat.get("code", "unmapped"),
                "category_cn": clean(category),
                "risk": RISK[risk],
                "reason": clean(reason),
                "basis": clean(basis),
            }
        )

    # Longest term first. Chinese has no word boundaries, so a naive scan lets
    # 换汇 (mid) shadow 非法换汇 (high) and downgrade the verdict.
    keywords.sort(key=lambda k: (-len(k["term"]), k["term"]))

    nested = [
        {"inner": a["term"], "inner_risk": a["risk"], "outer": b["term"], "outer_risk": b["risk"]}
        for a in keywords
        for b in keywords
        if a["term"] != b["term"] and a["term"] in b["term"] and a["risk"] != b["risk"]
    ]
    active = [k for k in keywords if k["active"]]

    doc = {
        "source": {
            "file": "敏感词库.xlsx",
            "origin": "client attachment, ClickUp task 86eyczra3, comment 90180244034227",
            "received": "2026-08-04",
        },
        "generated_by": "scripts/build_lexicon.py",
        "match_rules": {
            "order": "longest active term first, then patterns",
            "note": "No word boundaries in Chinese. Match on the longest term so a "
            "shorter mid-risk term cannot shadow a longer high-risk one.",
            "single_char_terms": [k["term"] for k in active if len(k["term"]) == 1],
            "inactive_terms_excluded": [k["term"] for k in keywords if not k["active"]],
        },
        "risk_levels": ["high", "mid", "low"],
        "categories": {v["code"]: {"name_cn": k, "note": v["note"]} for k, v in codes.items()},
        "counts": {
            "keywords": len(keywords),
            "keywords_active": len(active),
            "patterns": len(patterns),
            "by_risk": dict(Counter(k["risk"] for k in active)),
            "nested_conflicts": len(nested),
            "damaged_rows": len(repaired),
        },
        "damaged_rows": repaired,
        "nested_conflicts": nested,
        "keywords": keywords,
        "patterns": patterns,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    return doc


if __name__ == "__main__":
    doc = build()
    c = doc["counts"]
    print(f"wrote {OUT.relative_to(ROOT)}")
    print(f"  keywords {c['keywords']} ({c['keywords_active']} active)  patterns {c['patterns']}")
    print(f"  by risk (active)  {c['by_risk']}")
    print(f"  single-char terms {doc['match_rules']['single_char_terms']}")
    print(f"  nested conflicts  {c['nested_conflicts']}")
    print(f"  damaged source rows {c['damaged_rows']}:")
    for r in doc["damaged_rows"]:
        state = "active" if r["active"] else "INACTIVE — needs client confirmation"
        print(f"    row {r['seq']}: {r['source_term']} -> {r['term']} [{r['repair']}, {state}]")
