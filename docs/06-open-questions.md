# 06 — Open Questions, Gaps & Risks

Ordered by what blocks work soonest.

---

## A. Blocking — nothing starts until these clear

| # | Item | Owner | Detail |
|---|---|---|---|
| A1 | **Colour scheme confirmation** | Client → NE | Client, 30 Jul: *"Let us get confirmation on the color scheme with you before we get things started."* Deck mockups use navy + cream + CYS green, but nothing is approved. Send a palette proposal. |
| A2 | **Response on forum moderation** | Owen → Client | Client asked *"@Owen Ombuh can this be done?"* on 30 Jul. Still unanswered. Proposal drafted in [04-forum-spec.md](04-forum-spec.md) §5. |
| A3 | **Forum technical approach** | NE internal | The client's own deck ends with "Check: 1. Forum Technical approach 2. Timeline". Stack, auth, data model, moderation queue all undecided. |

## B. Scope & technical decisions

**B1, B2, B3 and B11 were resolved on 2 Aug 2026 — see [07-development-plan.md](07-development-plan.md).**

| # | Question | Status |
|---|---|---|
| B1 | **Stack.** | ✅ Next.js 15 App Router · TypeScript strict · Supabase · Sanity · Vercel. Full custom, no Wix. |
| B2 | **Site relationship.** | ✅ `cn.cys.com.sg` subdomain. A `cys.com.sg/zh` subdirectory is **impossible** — the apex is a Wix site (`Server: Pepyaka`, `generator: Wix.com Website Builder`) and Wix owns apex routing. |
| B3 | **Mainland China accessibility.** | ✅ Best-effort, no ICP filing. Designed defensively (no Google-hosted assets, no CAPTCHA vendors, server-side-only Supabase). **Still not discussed with the client** — if they later call mainland performance a hard requirement, that's a separate project needing a Chinese entity. |
| B11 | **CMS.** | ✅ Sanity Studio, bilingual, embedded at `/studio`. |

Still open:

| # | Question |
|---|---|
| B4 | **Regulatory review.** The client flagged that finance marketing is regulated in China. Who reviews the copy — CYS compliance, or does NE just avoid product-selling language? Get this in writing. |
| B5 | **Bilingual model.** Is EN a full mirror of CN, or a reduced set? Every deck screen has an EN pair, which implies full parity — confirm, because it doubles the content workload. |
| B6 | **Auth scope.** Registration/login sits in the header on every page from day one, but its only stated use is the forum — which is Phase 2. Does the Phase 1 demo ship auth, or stub it? |
| B7 | **Homepage forum feed in Phase 1.** The client wants forum posts on the landing page, but the forum is descoped from the demo. Does the demo show a static/seeded version of that module, or omit it? Recommend seeding it with the four sample posts so the community story still lands in the demo. |
| B8 | **Existing product brands.** IDT, CYSMobilePay, CYSGlobalPay, Blog, Gallery and Shop all exist on cys.com.sg and appear **nowhere** in the Chinese deck. Intentional omission, or oversight? |
| B9 | **Search scope.** A search field sits in the homepage hero. Site-wide search, or forum-only? |
| B10 | **Currency ticker.** Live rates or static display? Live rates mean a rate feed, refresh cadence, and a disclaimer — and arguably tip the site toward "financial product marketing", which the brief says to avoid. Recommend static/indicative with a clear disclaimer. |

## C. Content the client still owes

| # | Item |
|---|---|
| C1 | **WhatsApp number** — deck shows `123456` |
| C2 | **WeChat ID** — deck shows `23456` / `123456` |
| C3 | **Partnership stories** — deck copy is `我们与xx公司的交际始于2000年…` / `[Company XX]`. Need real partners, with permission to name them. |
| C4 | **Partner logos** — the four corridor cards are placeholder CYS logos |
| C5 | **FAQ content** — page is in the footer, no content exists |
| C6 | **Terms & Conditions** — no content |
| C7 | **Privacy statement** — no content. Non-trivial: the forum collects user accounts and user-generated content, so this needs real drafting, not a template. |
| C8 | **Hero imagery** — client wants a better expression of "connection" than the stock earth photo. Creative direction is open. |
| C9 | **Photography** — the bank/handshake/sky images are stock. Any real CYS office, team, or event photography? |
| C10 | **企业文化 / Culture page** — deck labels it "if need" / "（if）", i.e. the client is unsure whether to include it. Confirm in or out. |

## D. Copy errors in the deck to correct (English side)

The EN copy was written by the client and reads as machine-translated in places. Do not ship as-is; propose corrections.

| In deck | Should be |
|---|---|
| `Cross Board Payment` | Cross-Border Payment |
| `cross board business` | cross-border business |
| `Connect us` (nav + footer) | Contact us — deck uses both, inconsistently |
| `CN-SG corporate` (nav label for 中新合作走廊) | China–Singapore Corridor — "corporate" is wrong; the CN means "corridor" |
| `address you` (lead form field for 称呼) | Name / Salutation |
| `Reg \| log in` | Register \| Log in |
| `Help Business and Individual users to find optimise payment function` | grammatically broken |
| `泰铢THB` listed twice in the EN currency ticker | dedupe |
| `关注中新商业发展，于商业伙伴共建中新合作走廊` | 于 should be 与 (CN typo) |
| `CYS introduction / CYS history / Our culture` vs `CYS Introduction / CYS history / CYS culture` | header and footer disagree; pick one |

## E. IA inconsistencies to reconcile

| Item | Detail |
|---|---|
| E1 | **Footer vs mega menu grouping differs.** The footer files 伙伴故事 and 星威论坛 under 华商社群 (Chinese community); the header files them under 中新合作走廊 and 企业合作 respectively. Pick one taxonomy. |
| E2 | **华商社群 has no page.** It appears as a footer section heading but no screen was designed for it. Is it a landing page or just a grouping label? |
| E3 | **个人用户 has no dropdown children** in the mega menu but does have sub-content (3 use cases + customisation). Confirm it's a single page. |
| E4 | **常见问题 / FAQ** sits outside all four footer columns as a standalone item. Confirm placement. |

## F. Risks worth naming to the client

| # | Risk |
|---|---|
| F1 | **Pre-publication moderation is an operational commitment, not just a feature.** Someone at CYS has to actually review posts, in Chinese, on an ongoing basis. If that person isn't named and resourced, the forum stalls at launch regardless of how well it's built. Raise this before the forum build starts. |
| F2 | **"Blockchain platform" in the Partners & Investors copy.** Lifted from CYS's existing corporate vision. On a China-facing financial site this is a term that attracts scrutiny. Flag for removal or softening. |
| F3 | **The 2-month estimate predates the moderation requirement.** The moderation queue, admin surface, author-facing states and automation were added on 30 Jul, after the estimate was given on 27 Jul. The Phase 2 forum estimate should be revisited. |
| F4 | **Demo without the forum undersells the project.** The client's own stated purpose is community-building; the boss's priority is the community. A demo with no forum and no post feed is a demo of the half the client cares less about. Mitigate with B7 — seed the homepage feed module with the sample posts. |
| F5 | **China accessibility (B3) discovered late would be expensive.** If it turns out the site must work from inside mainland China, hosting, fonts, maps, analytics and CAPTCHA all need rethinking. Cheap to ask now, costly to retrofit. |
