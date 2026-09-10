## Interactive prototype

The high fidelity bilingual prototype is implemented in **wireframe/**. Start with the [preview guide](docs/PROTOTYPE-GUIDE.md) for local run instructions, demo roles, scenarios and routes. See [verification evidence](docs/verification/README.md) for tested workflows and desktop/mobile screenshots.

# CYS Chinese Website — Project Data Pack

Consolidated source data for the **CYS Global Remit (星威环球) Chinese-language website**.

| | |
|---|---|
| **Client** | CYS Global Remit Pte Ltd (星威环球) |
| **Existing site** | https://cys.com.sg |
| **ClickUp task** | [Chinese Website — 86eyczra3](https://app.clickup.com/t/86eyczra3) |
| **ClickUp location** | Space `90182536733` → Folder `CYS Global Remit` (`90183213431`) → List `cys Tasks` (`901804869484`) |
| **Status** | `focus` |
| **Assignee** | Owen Ombuh |
| **Requested by** | Muhammad Redzuan Azman (Neu Entity) |
| **Client contacts named** | Mr. Wan (client side), Maharani Muhaimin (NE), Owen Ombuh (NE dev lead) |
| **Task due date** | 31 Jul 2026 (for the current phase — Sitemap subtask shares this date) |
| **Time logged to date** | ~70 min on parent task, ~3 min on Sitemap subtask |
| **Primary source** | Canva deck `中文网站样本` — [view](https://www.canva.com/d/qcjWICroUTn2bog) · [edit](https://www.canva.com/d/TAznlO7M84DRJoj) · shortlink `canva.link/3aeym6j52ach89u` · design ID `DAHPU-DDUwU` · 52 pages · created 14 Jul 2026, last updated 27 Jul 2026 |
| **Data gathered** | 1 Aug 2026 |

## Documents

| File | Contents |
|---|---|
| [docs/01-brief-and-requirements.md](docs/01-brief-and-requirements.md) | Strategic brief, target audience, client decisions, platform decision, timeline, phasing |
| [docs/02-sitemap-ia.md](docs/02-sitemap-ia.md) | Navigation, mega menu, footer, full page tree (CN/EN), homepage section order |
| [docs/03-content-inventory.md](docs/03-content-inventory.md) | Verbatim bilingual copy from the deck, page by page |
| [docs/04-forum-spec.md](docs/04-forum-spec.md) | 星威华商论坛 requirements incl. the pre-publication moderation requirement |
| [docs/05-brand-and-facts.md](docs/05-brand-and-facts.md) | Verified company facts, figures, milestones, contact details, visual direction |
| [docs/06-open-questions.md](docs/06-open-questions.md) | Blockers, gaps, placeholder content, risks |
| [docs/07-development-plan.md](docs/07-development-plan.md) | **Stack, architecture, data model, moderation pipeline, phased build plan, timeline** |
| [docs/08-client-reply-draft.md](docs/08-client-reply-draft.md) | Draft client replies — **Message 3 answers the 4 Aug comment** |
| [docs/09-moderation-flow.md](docs/09-moderation-flow.md) | **Approval flow** built on the client's word list · lexicon analysis · Chinese matching rules · 3 data-quality problems |
| [docs/10-forum-features.md](docs/10-forum-features.md) | **User-facing feature set** · the likes/dislikes recommendation · post lifecycle · phasing |

## Client inputs

| File | Received | Contents |
|---|---|---|
| [client-inputs/CYS_LandingPage_Mockup.html](docs/client-inputs/CYS_LandingPage_Mockup.html) | 4 Aug 2026 | **Confirmed colour theme.** Tokens extracted into [07](docs/07-development-plan.md) §2 |
| [client-inputs/sensitive-words-CN.xlsx](docs/client-inputs/sensitive-words-CN.xlsx) | 4 Aug 2026 | `敏感词库.xlsx` — 220 terms + 8 pattern rules, 3 risk tiers, 8 categories |
| [data/moderation-lexicon.json](data/moderation-lexicon.json) | generated | Build asset, from the xlsx via [scripts/build_lexicon.py](scripts/build_lexicon.py) |

## Deliverables

| File | Source | For |
|---|---|---|
| [CYS-Chinese-Design-Brief.pdf](docs/CYS-Chinese-Design-Brief.pdf) — 15pp | [design-brief.html](docs/design-brief.html) | Designer + client. Includes the colour palette proposal that unblocks W0 |
| [CYS-Chinese-Sitemap.pdf](docs/CYS-Chinese-Sitemap.pdf) — 10pp | [sitemap.html](docs/sitemap.html) | **Sitemap subtask [86eyf6grv](https://app.clickup.com/t/86eyf6grv)** — full route tree, nav map, page inventory, i18n scheme |
| [CYS-Chinese-Sitemap-Diagram.png](docs/CYS-Chinese-Sitemap-Diagram.png) / [.pdf](docs/CYS-Chinese-Sitemap-Diagram.pdf) | [sitemap-diagram.html](docs/sitemap-diagram.html) | **Single-canvas diagram**, Whimsical style — 4680×6753px at 3×. The one to drop into a deck or print |
| [CYS-Chinese-Moderation-Flow.png](docs/CYS-Chinese-Moderation-Flow.png) / [.pdf](docs/CYS-Chinese-Moderation-Flow.pdf) | [moderation-flow-diagram.html](docs/moderation-flow-diagram.html) | **Post approval flow** — 4200×5118px at 3×. Answers the client's "give me the flow" ask. Confirmed palette |
| [CYS-Chinese-Forum-Features.png](docs/CYS-Chinese-Forum-Features.png) / [.pdf](docs/CYS-Chinese-Forum-Features.pdf) | [forum-features-diagram.html](docs/forum-features-diagram.html) | **Forum feature set** — 4200×5352px at 3×. Post anatomy, feature matrix, author states. Confirmed palette |
| [CYS-Chinese-Timeline.png](docs/CYS-Chinese-Timeline.png) / [.pdf](docs/CYS-Chinese-Timeline.pdf) | [timeline-diagram.html](docs/timeline-diagram.html) | **Project timeline** — 4200×3483px at 3×. **Two months, 10 Aug → 9 Oct, forum included.** Lofi → Hifi → Dev → Forum → UAT+QC, client sign-off gates, stated assumptions. Confirmed palette |

All regenerate from HTML at 3× DPI. Edit the HTML, re-run the script, same output:

```bash
python scripts/render_diagram.py docs/forum-features-diagram.html docs/CYS-Chinese-Forum-Features
```

## Decisions taken (2 Aug 2026)

| | |
|---|---|
| Platform | Full custom — **no Wix anywhere in this build** |
| Domain | `cn.cys.com.sg` (apex is a Wix site; a `/zh` subdirectory is not possible) |
| Stack | Next.js 15 App Router · TypeScript strict · Supabase · Sanity · Vercel |
| Forum | Custom, same codebase |
| China access | Best-effort, no ICP filing |
| CMS | Sanity Studio, bilingual |

Full reasoning in [docs/07-development-plan.md](docs/07-development-plan.md).

## Project subtasks (ClickUp)

| Subtask | ID | Status |
|---|---|---|
| Sitemap | [86eyf6grv](https://app.clickup.com/t/86eyf6grv) | admin (in progress — due 31 Jul 2026) |
| Lofi | [86eyf6gt9](https://app.clickup.com/t/86eyf6gt9) | admin |
| Hifi / mockup | [86eyf6gtu](https://app.clickup.com/t/86eyf6gtu) | admin |
| Development | [86eyf6guk](https://app.clickup.com/t/86eyf6guk) | admin |
| UAT | [86eyf6hbr](https://app.clickup.com/t/86eyf6hbr) | admin |
| Go Live | [86eyf6hby](https://app.clickup.com/t/86eyf6hby) | admin |

## Status (6 Aug 2026)

**Cleared:**

1. ~~Colour scheme not confirmed~~ — **confirmed by the client 4 Aug.** Navy + brass gold + ivory. Tokens in [07](docs/07-development-plan.md) §2. Note this replaced our proposed azure/jade palette, so the design brief's palette page is superseded and [PRODUCT.md](PRODUCT.md)'s anti-references were corrected.
2. ~~Forum technical approach undefined~~ — custom Next.js + Supabase, decided 2 Aug ([07](docs/07-development-plan.md) §1).
3. ~~Moderation automation owed to client~~ — client moved first and sent their word list. Flow specified in [09](docs/09-moderation-flow.md); reply drafted in [08](docs/08-client-reply-draft.md).

**Open — waiting on the client:**

1. **Who staffs the moderation queue.** Must read Chinese. Unanswered since 30 Jul and the only item that can stall the forum launch.
2. **Forum language** — CN-only or bilingual. The word list is Chinese-only, so if English posts are allowed the pre-publication guarantee covers half the forum. Genuine scope question.
3. **Comments pre-moderated too, or posts only.**
4. **Mid-risk terms: block or queue.** We recommend queue — hard-blocking rejects 换汇, CYS's own service ([09](docs/09-moderation-flow.md) §3). Ships as a switch, so not a blocker.
5. **Dislikes** — we recommend against ([10](docs/10-forum-features.md) §4).
6. Confirm damaged lexicon row 104, ideally re-export the xlsx ([09](docs/09-moderation-flow.md) §3.3).
7. Sitemap sign-off — subtask still in `review`, was due 31 Jul.

See [docs/06-open-questions.md](docs/06-open-questions.md) for the full list and [07](docs/07-development-plan.md) §13 for risks.

