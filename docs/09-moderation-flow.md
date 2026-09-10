# 09 — Forum moderation flow

Answers the client's first ask in [comment 90180244034227](https://app.clickup.com/t/9018732219/86eyczra3?comment=90180244034227) (4 Aug 2026):

> As mention in the meeting can give me the flow on the automation of approving of the threads in the forum.

Supersedes the pipeline sketch in [07-development-plan.md](07-development-plan.md) §5, which predated the client's word list.

---

## 1. What the client sent

`敏感词库.xlsx` → [docs/client-inputs/sensitive-words-CN.xlsx](client-inputs/sensitive-words-CN.xlsx), converted to [data/moderation-lexicon.json](../data/moderation-lexicon.json) by [scripts/build_lexicon.py](../scripts/build_lexicon.py).

| | |
|---|---|
| Keywords | **220** (219 usable — see §3.3) |
| Regex pattern rules | **8** |
| Risk levels | 🔴 high · 🟡 mid · 🟢 low |
| Categories | 8, each with a cited legal basis (《外汇管理条例》, 《广告法》, PBOC/SAFE rules, 论坛运营规范) |

Keywords by category and risk:

| Category | 🔴 high | 🟡 mid | 🟢 low | Total |
|---|---|---|---|---|
| 通用违禁内容 General prohibited | 38 | 5 | 1 | 44 |
| 外汇管制合规 FX control | 23 | 18 | 4 | 45 |
| 金融监管合规 Financial regulation | 26 | 9 | 1 | 36 |
| 公司业务风险 Company/brand risk | 0 | 4 | 19 | 23 |
| 政治敏感 Politically sensitive | 18 | 4 | 0 | 22 |
| 互联网内容合规 PRC internet rules | 13 | 8 | 0 | 21 |
| 跨境贸易合规 Cross-border trade | 5 | 7 | 5 | 17 |
| 新加坡本地风险 Singapore-local | 6 | 6 | 0 | 12 |
| **Total** | **129** | **61** | **30** | **220** |

The 8 pattern rules are the strongest part of the file — they already encode *combinations* rather than words: `(\d{2,})\s*万.*(换|兑|汇|转)` (large sum + exchange), virtual currency + cash-out, guaranteed-return promises. These carry far lower false-positive risk than bare keywords and should run at full strength.

## 2. The client's stated rule

> The idea here is to straight out ban the high and mid risk words but low risk words we can get the system to prompt us to review

Taken literally: **190 of 220 terms hard-block a post at submission.** We should not build it that way, for three reasons — all three are properties of the file itself, not opinions about moderation policy.

## 3. Three problems with hard-blocking mid risk

### 3.1 The spreadsheet's own reasons say mid risk needs context

Every mid-risk row's 违规原因 cell asks for a judgement call. Quoted from the file:

| Term | Risk | The file's own stated reason |
|---|---|---|
| 换汇 | 🟡 mid | 涉及货币兑换话题，**需结合上下[文]判断**是否涉及私下换汇/场外交易 † |
| 发票 | 🟡 mid | 可能涉及虚开发票等违法行为，**需结合上下文** |
| 佣金 | 🟡 mid | 涉及返佣/佣金等商业利益话题，**需确认**不涉及非法返佣 |
| 代付 | 🟡 mid | 涉及第三方代付服务，**可能**涉及洗钱 |
| 骗子 | 🟡 mid | 涉及欺诈指控，**可能**对公司或他人造成名誉影响 |

† This cell carries encoding damage (`需结合上下�判断`); the bracketed 文 is ours. The phrase appears **undamaged** on the 发票 row, so the argument doesn't rest on the repair. See §3.3.

"需结合上下文判断" — *requires context to judge* — is a description of a review queue, not a block list. The mid tier was authored as *flag for a human*, and the instruction to hard-block it contradicts the file.

### 3.2 Hard-blocking mid risk blocks ordinary business posts — including CYS's own service

Eight realistic posts, run against the actual lexicon. All eight are legitimate. All eight are rejected under the stated rule:

| Post | Term hit | Risk | Outcome |
|---|---|---|---|
| 我们提供合规换汇服务 *(we provide compliant FX services)* | 换汇 | 🟡 | **blocked** |
| 我们严格遵守反洗钱规定 *(we strictly follow AML rules)* | 洗钱 | 🔴 | **blocked** |
| 需要开具发票 *(we need an invoice issued)* | 发票 | 🟡 | **blocked** |
| 按行业标准支付佣金 *(commission at industry standard)* | 佣金 | 🟡 | **blocked** |
| 反诈骗宣传 *(anti-fraud awareness)* | 诈骗 | 🔴 | **blocked** |
| 防骗指南：识别骗子 *(anti-scam guide)* | 骗子 | 🟡 | **blocked** |
| 合法避税与税务规划 *(lawful tax planning)* | 避税 | 🔴 | **blocked** |
| 我们不做水货 *(we don't deal in parallel imports)* | 水货 | 🟡 | **blocked** |

Two of these deserve special attention:

- **换汇 is CYS's core business.** A remittance company's business forum that rejects the phrase "currency exchange" is not viable. The forum's stated audience — per the deck's own four sample posts — is cross-border traders, distributors, and manufacturers. 换汇, 发票, 佣金, 代付 are their working vocabulary.
- **A negation reverses the meaning but not the match.** 反洗钱 (*anti*-money-laundering) contains 洗钱. 防骗 contains 骗. 合法避税 contains 避税. Substring matching cannot see the negation; the compliance-conscious post is punished hardest.

This is a false-positive problem, and the cost lands on the client: a good post from a real business is silently rejected, the author has no recourse, and CYS never finds out it happened.

### 3.3 The source file has encoding damage

Three rows arrived with U+FFFD replacement characters inside the keyword itself. Each is recoverable from its own reason cell, which survived:

| Row | Damaged term | Recovered | Evidence | Status |
|---|---|---|---|---|
| 100 | `��额换汇` | 大额换汇 | reason reads 涉及**大额换汇** | active |
| 161 | `��场` | 赌场 | reason reads 涉及**赌博场所**宣传 | active |
| 104 | `��税` | 报税 *(inferred)* | reason reads 涉及**税务申报**话题 | **inactive — needs confirmation** |

Row 104 is an inference, so it stays out of matching until the client confirms. Row 100 and 161 are quoted verbatim in their own reason text and are safe to activate.

**Why this matters more than it looks.** The naive fix — strip the bad characters — silently truncates the term. `场外交易` reduced to `场` would match 市场 (market), 现场, 工厂, 商场: every second business post on the forum. The build script therefore refuses to strip, repairs only from documented evidence, and deactivates anything it cannot justify. Rebuild and the report prints itself:

```bash
python scripts/build_lexicon.py
```

Worth asking the client for a clean re-export regardless — if three terms are damaged, the file has been through a lossy round-trip and other cells may be subtly wrong.

## 4. Recommended flow

Same guarantee the client asked for on 30 Jul — **nothing reaches the forum without passing review** — with the automation doing the volume work.

**Client-facing diagram:** [CYS-Chinese-Moderation-Flow.png](CYS-Chinese-Moderation-Flow.png) / [.pdf](CYS-Chinese-Moderation-Flow.pdf) — single canvas, 4200×5118 at 3×, drawn in the client's confirmed palette. Regenerate after editing [moderation-flow-diagram.html](moderation-flow-diagram.html):

```bash
python scripts/render_diagram.py docs/moderation-flow-diagram.html docs/CYS-Chinese-Moderation-Flow
```

The ASCII version below is the same pipeline, kept for reviewing in-repo.

```
author submits
      │
      ▼
status = pending          ← forced by DB trigger, never from the client payload
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 1 — lexicon scan        deterministic · ~1ms · £0 │
│ 219 keywords (longest-match) + 8 pattern rules          │
└─────────────────────────────────────────────────────────┘
      │
      ├── 🔴 high hit ────────────────────► auto-reject
      │                                     author sees category + rewrite hint
      │
      ├── 🟡 mid hit ─────────────────────► human queue   ◄── configurable
      │                                     (client asked: block)
      │
      ├── 🟢 low hit ─────────────────────► human queue, flagged low
      │
      └── no hit
             │
             ▼
      ┌──────────────────────────────────────────────────────┐
      │ STAGE 2 — LLM classifier    glm-5.2 · ~2s · ~$0.0015 │
      │ judges intent and context, not vocabulary            │
      └──────────────────────────────────────────────────────┘
             │
             ├── clearly benign + trust_tier ≥ 1 ──► auto-approve → live
             ├── uncertain / sensitive ───────────► human queue
             └── obvious spam ───────────────────► auto-reject
                        │
                        ▼
             ┌────────────────────────┐
             │ STAGE 3 — human queue  │  moderator approves / rejects
             └────────────────────────┘
                        │
                        ▼
      moderation_events (insert-only audit)  +  email to author
```

**Why the lexicon runs before the model, not instead of it.** The lexicon is free, instant, and legally legible — when CYS has to explain a rejection to a regulator, "matched 逃汇, 《外汇管理条例》" is a better answer than a model's opinion. It handles the 129 high-risk terms where there is no defensible context. The model handles what a word list structurally cannot: negation, intent, and the 129-term list's own blind spot — a post that is sensitive without using any listed word.

### The mid-risk decision is the client's, and we build it as a switch

`MID_RISK_ACTION = queue | block`, one env var, default `queue`.

This is not fence-sitting — it means the client's answer stops being a blocker. Recommendation stays `queue`: it delivers the identical "checked before it goes live" guarantee, loses no legitimate posts, and costs only moderator attention the client has already said they can absorb ("there shouldn't be too much at the earlier stages"). If mid-risk volume proves unmanageable in UAT, flip the switch then, with real numbers instead of a guess.

## 5. Matching rules the implementation must honour

Chinese has no word boundaries, so a naive `if term in text` scan is wrong in ways that only show up in production.

| Rule | Why |
|---|---|
| **Longest match wins** | 换汇 (mid) is a substring of 非法换汇, 私下换汇, 帮人换汇 (all high). First-match-wins downgrades a high-risk post to mid. 3 such conflicts exist in the file today; the JSON lists them under `nested_conflicts`. |
| **Single-character terms need a pattern, not a substring** | 枪 is the only 1-char term. Bare substring matching hits 水枪, 枪手, 打气枪. Give it a context pattern or promote it to the 模式规则 sheet. |
| **Negation allowlist runs before the block** | 反洗钱, 反诈, 防骗, 合法避税, 打击走私 and similar reverse the meaning. Without this layer the compliance-minded author is the one who gets rejected. |
| **Normalise before matching** | Full-width/half-width, simplified/traditional, and inserted separators (`换-汇`, `换 汇`) are the standard evasions. Cheap to handle at normalisation; impossible to patch later without reprocessing history. |
| **Never echo the matched term to the author** | Telling a bad actor exactly which word tripped hands them an oracle to iterate against. Show the category and a rewrite hint. This matters most for the 18 high-risk political terms, where echoing the term back is itself a liability. |

## 6. Lexicon governance

The word list is client policy, not code. It will change, and it must change without a deploy.

- Lives in a Supabase table, seeded from `data/moderation-lexicon.json`, editable by an admin in the moderator UI.
- Every version numbered; every `moderation_events` row records which lexicon version judged it. Without this, "why was my post rejected in September?" is unanswerable.
- Term edits are themselves audited — the list encodes legal exposure, and a silent deletion is a compliance gap.
- Adding a term never retro-rejects live posts. It applies to new submissions and to edits.

## 7. Cost and latency

| Stage | Latency | Cost |
|---|---|---|
| Lexicon scan | ~1 ms | £0 |
| LLM classifier | ~2 s | ~$0.0015/post → **~$2/month at 50 posts/day** |
| Human queue | client's SLA | moderator time |

The lexicon materially cuts the model bill: high-risk posts are rejected before any API call. Full model rationale — and why a Chinese-native model, plus the Z.ai data-residency position CYS compliance must sign off — is in [07-development-plan.md](07-development-plan.md) §5.

## 8. Still needed from the client

Carried forward from [04-forum-spec.md](04-forum-spec.md) §6, plus what the word list newly raises.

| # | Question | Blocks |
|---|---|---|
| 1 | **Mid risk — block, or queue?** Recommendation and reasoning in §4. | Nothing (switch defaults to `queue`) |
| 2 | **Who staffs the review queue?** Must read Chinese. Still unanswered from 30 Jul. | Phase 2 launch |
| 3 | **Comments pre-moderated too, or posts only?** | Phase 2 data model |
| 4 | Confirm row 104 (`��税` → 报税?) and ideally re-export the file | 1 term inactive |
| 5 | Review SLA — what the author is told, and how long they wait | Author-facing UI copy |
| 6 | Should 换汇/发票/佣金/代付 be **removed** from mid risk, given they are the forum's core vocabulary? | Tuning, not architecture |
| 7 | Is the forum CN-only or bilingual? An EN post needs an EN lexicon — the current file has none | Phase 2 scope |

Item 7 is a genuine scope question, not a detail: the file is Chinese-only. If the forum accepts English posts, either the moderation guarantee is Chinese-only, or an English word list has to exist. The site is bilingual everywhere else, so the default assumption is that this gap is real.
