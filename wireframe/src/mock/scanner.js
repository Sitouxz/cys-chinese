import lexicon from "./lexicon.json" with { type: "json" };
const order = { unknown: 0, low: 1, mid: 2, high: 3 };
const traditional = {
  換: "换",
  匯: "汇",
  錢: "钱",
  幣: "币",
  騙: "骗",
  詐: "诈",
  證: "证",
  額: "额",
  稅: "税",
};
export function normalizeText(text) {
  return text
    .normalize("NFKC")
    .replace(/[換匯錢幣騙詐證額稅]/g, (c) => traditional[c])
    .replace(/[\s\u200B-\u200D\uFEFF\-·_]/g, "")
    .toLowerCase();
}
export function scanContent(text, scenario = "default") {
  const normalized = normalizeText(text);
  const evidence = [];
  const occupied = [];
  const contextual = ["反洗钱", "反诈骗", "识别骗子", "合法避税", "不做水货"];
  for (const item of [...lexicon.keywords]
    .filter((k) => k.active)
    .sort((a, b) => b.term.length - a.term.length)) {
    const term = normalizeText(item.term);
    let start = normalized.indexOf(term);
    while (start >= 0) {
      const end = start + term.length;
      if (!occupied.some(([a, b]) => start < b && end > a)) {
        occupied.push([start, end]);
        const context = contextual.some((phrase) => {
          const at = normalized.indexOf(phrase);
          return at >= 0 && start >= at && end <= at + phrase.length;
        });
        evidence.push({
          term: item.term,
          risk: context ? "unknown" : item.risk,
          category: item.category,
          context,
        });
      }
      start = normalized.indexOf(term, end);
    }
  }
  for (const rule of lexicon.patterns)
    if (new RegExp(rule.pattern, "i").test(normalized))
      evidence.push({
        term: rule.name,
        risk: rule.risk,
        category: rule.category,
      });
  for (const term of ["稳赚", "保本高收益", "保证收益"])
    if (normalized.includes(term))
      evidence.push({ term, risk: "mid", category: "financial_crime" });
  let risk = evidence.reduce(
    (risk, item) => (order[item.risk] > order[risk] ? item.risk : risk),
    "low",
  );
  if (["high", "mid", "low", "unknown"].includes(scenario)) risk = scenario;
  if (scenario === "mid-review") risk = order[risk] > order.mid ? risk : "mid";
  if (scenario === "scan-failure") risk = "unknown";
  const manual = /[a-z]/i.test(text.normalize("NFKC"));
  return {
    risk,
    evidence: evidence.map((e) => e.term),
    categories: [...new Set(evidence.map((e) => e.category))],
    status:
      !manual &&
      (risk === "high" || risk === "mid") &&
      !(scenario === "mid-review" && risk === "mid")
        ? "rejected"
        : "pending",
    policy:
      scenario === "mid-review"
        ? "alternative-mid-review-v1"
        : "demo-lexicon-v1",
    scanFailed: scenario === "scan-failure",
    manual,
  };
}
