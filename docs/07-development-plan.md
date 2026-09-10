# 07 — Development Plan

Decisions taken 2 Aug 2026. Supersedes the open items in [06-open-questions.md](06-open-questions.md) §B1–B3, B11.

---

## 1. Decisions locked

| Decision | Choice | Rationale |
|---|---|---|
| **Platform** | Full custom. **No Wix anywhere in this build.** | Forum is backend-heavy; Wix can't host it. Confirmed by Executor 2 Aug. |
| **Domain** | `cn.cys.com.sg` — CNAME to Vercel | The apex is a **Wix site** (`Server: Pepyaka`, `generator: Wix.com Website Builder`). Wix owns apex routing and won't sit behind a reverse proxy, so `cys.com.sg/zh` is **not possible**. Subdomain inherits domain trust with zero interference. |
| **China access** | Best-effort, no ICP filing | Costs almost nothing at build time if designed in from day one; a retrofit is expensive. No mainland hosting, no Chinese entity needed. |
| **Forum** | Custom, in the same Next.js + Supabase app | The deck's posts are structured business-matching listings, not general discussion. Pre-publication moderation, CN/EN parity, and the homepage feed all need custom work regardless — Discourse's strength (large-scale threaded discussion) isn't what this is. |
| **CMS** | Sanity Studio, bilingual, embedded at `/studio` | Client copy is visibly still in flux (placeholders, typos, unwritten pages). Worth ~1–2 weeks to stop every fix being a billable deploy. |

## 2. Stack

```
Next.js 15 (App Router, RSC default)  ·  TypeScript strict  ·  React 19
pnpm  ·  Node 20+
Vercel — cn.cys.com.sg
Supabase — Postgres + Auth + RLS + Storage
Sanity Studio — marketing copy, bilingual, embedded route
next-intl — /[locale] routing + message catalogues
Tailwind CSS — recommended; say if you want something else
Anthropic API — forum moderation classifier (Phase 2)
```

### Supabase stays server-side

**No browser → `supabase.co` calls.** All reads and writes go through Server Components, Server Actions, and Route Handlers; auth uses `@supabase/ssr` with cookie sessions. Two payoffs:

- **China reachability** — the browser only ever talks to `cn.cys.com.sg`. A blocked or slow `supabase.co` doesn't break the page.
- **Security** — the anon key never ships to the client, and RLS becomes defence-in-depth rather than the only control.

Consequence to accept: **Supabase Realtime is out** (it needs a direct WebSocket to `supabase.co`). Live-updating forum threads become revalidation or polling. Fine at this volume.

Storage and Sanity images proxy through `next/image` so asset fetches also originate from our domain rather than `cdn.sanity.io`.

### Styling — Tailwind v4 + CSS custom properties

Chosen for what this specific brief needs, not by default.

**The real constraint is bilingual typography.** The same component renders 连接中国与东南亚的可信支付桥梁 and *"A Trusted Payment Bridge Connecting China and Southeast Asia"* — which want different line-height, letter-spacing, and font stacks. Hardcoded utility classes force a fork per locale; CSS variables scoped by `:lang(zh)` / `:lang(en)` don't:

```css
:root { --leading-display: 1.15; --tracking-display: 0.02em; }
:lang(zh) { --leading-display: 1.4;  --tracking-display: 0.08em; }
```

The palette is small and fixed, so it's a token set rather than arbitrary values. Tokens in CSS variables, consumed by Tailwind, single source of truth for both locales.

#### Confirmed palette (client, 4 Aug 2026)

Client sent `CYS_LandingPage_Mockup.html` with the theme signed off — [docs/client-inputs/](client-inputs/). Lift these tokens verbatim; they are the decision, not a proposal:

```css
--navy-950:#0c1626;  --navy-900:#12213a;  --navy-800:#1a3358;  --navy-700:#24446f;
--brass-500:#b98d42; --brass-300:#d9b877; --brass-100:#f1e3c6;
--ivory-50:#faf8f3;  --ivory-100:#f3efe4;
--ink-900:#151c26;   --ink-600:#4c5666;   --ink-400:#8992a1;
--line:#e3ddcd;      --teal-600:#3e6259;
--serif:"Noto Serif SC","Songti SC",serif;
--sans:"Noto Sans SC","Inter",-apple-system,sans-serif;
```

**This is not the palette we proposed, and the delta matters.** Our design brief led with azure `#2E6FB7` and jade `#6DA544` — CYS's existing blue/green identity. The client's confirmed theme replaces the accent with **brass gold `#B98D42`** and demotes green to a muted teal used sparingly.

Consequences to act on, not litigate — the client has decided:

- **[PRODUCT.md](../PRODUCT.md) is now stale.** Its anti-references rule out "beige, parchment, or warm-cream page grounds that weaken CYS's institutional blue and green identity". The confirmed ground is ivory `#FAF8F3` and the accent is gold. Updated in place; noted here because the design brief was built on the old rule.
- **The palette page of [CYS-Chinese-Design-Brief.pdf](CYS-Chinese-Design-Brief.pdf) is superseded.** Do not re-send it as-is.
- **Fonts:** the mockup calls Noto Serif SC / Noto Sans SC from `fonts.googleapis.com`. Self-host both — see §3. The serif display face must be subset; full Noto Serif SC is multi-megabyte.
- The mockup also carries real interaction — canvas globe, corridor map, ticker, scroll reveals, language toggle. Heavier than the deck implied; factored into §8 W5–7.

**No component library.** shadcn/ui (Radix primitives, copied in) only for the few things where hand-rolling a11y is a mistake: the mega menu, the language switcher, dialogs, form controls. The deck's mega menu needs real keyboard and screen-reader handling.

**Fonts:** `next/font/local`, self-hosted (China constraint). CN body on a system stack — PingFang SC / Microsoft YaHei / Noto Sans SC — because a full CJK webfont is 3–10 MB. If the hifi stage wants a display face for headings, subset it.

## 3. China best-effort constraints

Design rules, not optimisations. Cheap now, painful later.

| Don't | Do |
|---|---|
| `next/font/google` | `next/font/local` with self-hosted files |
| Full CJK webfont (3–10 MB) | System CN stack for body — PingFang SC / Microsoft YaHei / Noto Sans SC. A **subset** display face for headings only, if the design needs one |
| reCAPTCHA / hCaptcha / Turnstile | Honeypot field + server-side rate limit + email verification. Good enough for a moderated forum |
| Google Maps | Static map image or plain address block (the deck has no map anyway) |
| Google Analytics | Vercel Analytics (served first-party from our domain) or self-hosted Umami |
| YouTube / Vimeo embeds | Self-hosted video, or omit |
| Anything on `googleapis.com` / `gstatic.com` | — |

Also: keep hero imagery weight down. Connections from the mainland are slow even when reachable, and the hero is a full-bleed photograph.

> Not doing: ICP filing, mainland/HK hosting, `.cn` domain. If the client later says mainland performance is a hard requirement, that's a separate project with a Chinese-entity prerequisite.

## 4. Data model — forum (Phase 2)

```sql
profiles          id (→auth.users), display_name, company_name, industry,
                  markets text[], locale, role (user|moderator|admin),
                  trust_tier int default 0, created_at

posts             id, author_id, locale, title, body,
                  intent (seeking_distributor|seeking_brand|seeking_investor
                          |seeking_partner|sharing),
                  industry, product_category, markets text[],
                  status (draft|pending|approved|rejected),
                  published_at, created_at, updated_at

post_revisions    id, post_id, title, body, created_at
comments          id, post_id, author_id, body, status, created_at
moderation_events id, subject_type, subject_id, actor_id (null = automated),
                  action, reason, model_verdict jsonb, lexicon_version,
                  matched_terms jsonb, created_at
reports           id, subject_type, subject_id, reporter_id, reason, status

reactions         id, subject_type, subject_id, user_id, kind ('useful')
                  unique (subject_type, subject_id, user_id, kind)
saves             id, user_id, post_id, created_at
                  unique (user_id, post_id)

lexicon_versions  id, version int, note, created_by, created_at
lexicon_terms     id, version_id, term, category, risk (high|mid|low),
                  reason, basis, active bool, is_pattern bool
                  -- seeded from data/moderation-lexicon.json
```

`reactions.kind` is an enum with one value today (`useful`). There is deliberately no `dislike` — reasoning in [10-forum-features.md](10-forum-features.md) §4. Keeping it an enum rather than a boolean means adding a kind later is a migration, not a rewrite.

`moderation_events.lexicon_version` + `matched_terms` are what make a rejection explainable months later. The word list is client policy and will change; a verdict without its version is unauditable.

`intent` / `industry` / `markets` are what make "检索用户/产品/服务" (search users/product/service) actually work — the deck's four sample posts are all *"I am X, I want to meet Y"*, so the structure is inherent to the content.

`moderation_events` is insert-only and keeps the model's raw verdict. For a MAS-licensed client running a China-facing forum, an audit trail of why each post was approved or rejected is not optional.

### RLS — the load-bearing policies

- `posts` SELECT: anon and authenticated see `status = 'approved'` only. Authors additionally see their own rows at any status. Moderators see everything.
- `posts` INSERT: authenticated only. **Status is forced to `pending` by a `BEFORE INSERT` trigger** — never taken from the client payload.
- `posts` UPDATE: authors may edit only when status is `draft` or `rejected`; the update trigger sets status back to `pending`. Moderators may change status.
- `moderation_events`: insert-only; readable by moderators.

Edits re-enter the queue. An approve-then-edit hole would defeat the entire pre-publication requirement.

## 5. Moderation pipeline (Phase 2)

Implements the client's 30 Jul request — posts checked **before** going live, automated where possible.

> **Superseded in detail by [09-moderation-flow.md](09-moderation-flow.md).** The client sent a 220-term / 8-pattern word list on 4 Aug, which adds a deterministic lexicon stage ahead of the model and changes the economics (high-risk posts never reach an API call). Doc 09 is the client-facing answer and the implementation spec, including the matching rules Chinese requires and the three data-quality problems in the source file. This section keeps the model selection and cost analysis, which stand unchanged.

```
submit → status=pending → DB trigger → Edge Function / Route Handler
                                             ↓
                        lexicon scan — 219 terms + 8 patterns (~1ms, free)
                                             ↓
                    🔴 high → auto-reject   🟡 mid → queue*   🟢 low → queue
                                             ↓ (no hit)
                                    LLM classifier
                                             ↓
              ┌──────────────┬───────────────┴──────────────┐
       clearly benign            uncertain /            obvious spam
       + trust_tier ≥ 1        politically sensitive           ↓
              ↓                          ↓                auto-reject
        auto-approve              human queue            (reason shown)
                                         ↓
                              moderator approves / rejects
                                         ↓
                            moderation_events + email to author
```

\* `MID_RISK_ACTION=queue|block`, default `queue`. The client asked for mid-risk to hard-block; doc 09 §3 shows why that rejects legitimate business posts — including CYS's own 换汇 service — and why the switch exists so their answer isn't a blocker.

**Trust tiers:** tier 0 (new account) always gets a human look at anything the classifier doesn't clear confidently; tier 1 (N approved posts) runs classifier-only. A tier 2 that moves to post-publication review is a **client decision**, not ours to assume — they explicitly asked for pre-publication.

### Model choice — GLM-5.2 primary, provider-agnostic interface

**Decision: a Chinese-native model, `glm-5.2` via Z.ai, behind a swappable provider interface.**

The deciding factor is calibration, not price. This classifier judges what counts as politically sensitive in a PRC context. A Chinese-trained model has materially better instincts there than a US-trained one, and that gap is the whole reason the client asked for pre-publication moderation.

| Option | Price /1M in · out · cached | Per post | 50/day | Notes |
|---|---|---|---|---|
| **`glm-5.2`** (Z.ai) | $1.40 · $4.40 · $0.26 | ~$0.0015 | **~$2/mo** | Chinese-native. Singapore entity + Singapore processing |
| `kimi-k2.6` (Moonshot intl) | $0.95 · $4.00 · $0.16 | ~$0.0012 | ~$2/mo | Chinese-native. Intl entity/processing **not yet verified** |
| `claude-opus-5` | $5.00 · $25.00 · $0.50 | ~$0.011 | ~$17/mo | Best general reasoning; weakest PRC-context calibration |
| `claude-haiku-4-5` | $1.00 · $5.00 · — | ~$0.003 | ~$4/mo | 4,096-token cache minimum — a 1,500-token rubric **won't cache** |

Estimates assume ~1,500-token cached rubric + ~300-token post in, ~150-token JSON verdict out.

**Why the data-residency question resolved in GLM's favour.** Routing a MAS-licensed client's China-facing forum content through a mainland API would have been a real compliance problem. It isn't one here: **Z.ai's international service is operated by JINGSHENG HENGXING TECHNOLOGY PTE. LTD., a Singapore-registered entity, and personal data is generally processed in Singapore.** Their privacy policy does reserve the right to transfer data outside that jurisdiction with safeguards — so **CYS's compliance team should read the actual DPA before go-live**, not this summary. Flag it to them; don't let it block the build.

Moonshot is marginally cheaper but I haven't verified its international operating entity or processing location. Not recommending it for a regulated client on price alone.

### Build it provider-agnostic

```ts
interface ModerationProvider {
  classify(post: PostInput): Promise<Verdict>;
}
```

One thin interface, provider chosen by `MODERATION_PROVIDER` env var, every verdict written to `moderation_events` with the model ID and raw output.

This is not fence-sitting. The deciding factor — agreement with a human moderator on real Chinese posts about cross-border trade — **cannot be measured before that content exists**. Ship GLM-5.2 as default, run Claude as a shadow classifier over the same posts during Phase 2 UAT, and pick on measured disagreement rate. The audit log this needs is already required for the client's compliance story, so it costs nothing extra.

Practical bonus: Z.ai publishes OpenAI- and Anthropic-compatible endpoints alongside its native one, so the same SDK can drive both providers with a `baseURL` swap. **Verify those compatibility endpoints at build time** — they're documented by third parties but not in the section of Z.ai's own HTTP docs I checked, which lists only the native `https://api.z.ai/api/paas/v4/`.

Request shape, native form:

```ts
{
  model: "glm-5.2",
  temperature: 0,                       // classification, not generation
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: RUBRIC }, // stable → cached at $0.26/1M
    { role: "user", content: postText },
  ],
}
```

Claude shadow path (`claude-opus-5`): structured outputs via `output_config.format`, `effort: "low"`, thinking left **on** (disabling it on Opus 5 can leak `<thinking>` tags into output), `cache_control: { type: "ephemeral" }` on the rubric.

Both paths return the same `Verdict` shape: `{ decision, category, confidence, reason }`. Schema-validate on our side regardless of provider — never trust the model to have produced parseable JSON.

Open items to put to the client, listed in [04-forum-spec.md](04-forum-spec.md) §6: who moderates, comments in scope or not, review SLA, anonymous read access, forum language.

## 6. Search (Phase 2)

**Chinese full-text search is the sharp edge here.** Postgres's built-in FTS tokenises on whitespace and punctuation — it does not segment Chinese, so `to_tsvector` on 中文 produces near-useless results.

**Solution: PGroonga**, a Supabase-supported extension built precisely for this. Supabase's own docs: native Postgres full-text indexing *"is limited to alphabet and digit based languages. PGroonga offers a wider range of character support making it viable for a superset of languages supported by Postgres including Japanese, Chinese, etc."*

```sql
create extension pgroonga with schema extensions;
create index ix_posts_body on posts using pgroonga (title, body);
-- query with the &@~ operator
```

Launch with PGroonga keyword search plus the structured `intent` / `industry` / `markets` filters. That covers the deck's stated requirement literally.

**Semantic matching is a Phase 2.5 option, not launch scope.** "Find me a distributor for household products in Malaysia" is an intent match, not a keyword match, and `pgvector` + Supabase's documented hybrid-search pattern handles it well. Deferring it avoids picking an embeddings vendor at launch — Anthropic has no embeddings API, so it means adding OpenAI/Cohere or running a model in Supabase Edge Functions. Not a decision worth making before the forum has real content in it.

## 7. i18n

- Routes: `/[locale]/…` with **`zh` as default**, `en` secondary. Language switcher preserves the current path.
- `next-intl` for routing and UI strings; Sanity field-level i18n for CMS copy (right granularity at this document count).
- SEO: `hreflang` pairs, per-locale sitemaps, correct canonicals.
- **Full parity assumed** — every deck screen has a CN and EN version. Flag if the client wants EN reduced; it halves the content workload.

## 8. Phase 1 — demo, no forum

Client agreed 29–30 Jul: simple demo in months 1–2 without the forum.

**Client-facing diagram:** [CYS-Chinese-Timeline.png](CYS-Chinese-Timeline.png) / [.pdf](CYS-Chinese-Timeline.pdf) — 4200×3672 at 3×. Answers the client's "update me on the timeline from Lofi to Hifi to Dev to UAT+QC" ask: Gantt across Aug–Dec, a today marker, the four client sign-off gates that actually move the dates, and the phase 2 band drawn as an estimate. Regenerate:

```bash
python scripts/render_diagram.py docs/timeline-diagram.html docs/CYS-Chinese-Timeline
```

The table below is the working version — the diagram is what goes to the client.

> **Revised 7 Aug 2026 — compressed to two months with the forum included.** Executor's call. The two-phase split below (demo in October, forum in December) is superseded: website **and** forum now go live together on **9 Oct 2026**. What that costs is set out in §8a.

| Week | Dates | Work | ClickUp |
|---|---|---|---|
| **W0** | 3–9 Aug | **Decision gate.** ~~Colour scheme~~ **✅ confirmed by client 4 Aug** (§2). Sitemap sign-off *(in review)*. Copy-error list to client. Repo scaffold, Vercel + Supabase + Sanity projects, `cn.cys.com.sg` DNS | [Sitemap](https://app.clickup.com/t/86eyf6grv) *(overdue — was due 31 Jul)* |
| **W1–2** | 10–23 Aug | Lofi wireframes, all screens CN+EN. Sanity schemas. i18n routing + layout shell. **Auth + forum data model land here**, not later | [Lofi](https://app.clickup.com/t/86eyf6gt9) |
| **W3–4** | 24 Aug–6 Sep | Hifi mockups CN + EN. Design tokens, type scale, self-hosted font decision. **Forum screens designed in the same pass** | [Hifi/mockup](https://app.clickup.com/t/86eyf6gtu) |
| **W5–6** | 7–20 Sep | Build: all marketing pages, CMS wiring, contact + feedback forms, currency ticker, responsive | [Development](https://app.clickup.com/t/86eyf6guk) |
| **W7–8** | 21 Sep–4 Oct | Forum: accounts, profiles, structured posting, comments, RLS + policy tests, moderation queue + admin UI, lexicon + classifier, PGroonga search, reactions/reports, notifications | *(new subtask needed)* |
| **W9** | 5–9 Oct | Internal QA, Lighthouse, China-constraint audit, RLS test suite, client UAT | [UAT](https://app.clickup.com/t/86eyf6hbr) |

**Website + forum live 9 October 2026.** That is 2.4 months from the 27 Jul quote — inside the 2–3 months given.

## 8a. What the two-month compression costs

The forum was estimated at **6–8 weeks standalone** (§9). It now has **2 weeks of dedicated build**. That is only survivable because of three things, and all three must hold:

| Lever | Detail |
|---|---|
| **Front-load** | Auth, profiles, and the forum data model move into W1–2 alongside the wireframes; forum screens are designed in the W3–4 pass rather than a separate one. Roughly 2 weeks of the original forum estimate is absorbed before W7 starts. |
| **Trim launch scope** | In: accounts, profiles, structured posting, comments + 1-level replies, moderation pipeline, queue + admin UI, search, 有用/举报, save, follow-topic, Connect, email notifications. **Out until after launch:** image uploads, follow-a-poster, in-app notification centre, semantic matching, trust tiers (everything is human-reviewed at launch, which is what the client asked for anyway). |
| **Sign-off discipline** | Three working days per gate, one feedback round per stage. Stated on the face of the client timeline so a slip is visibly theirs, not silently ours. |

**Residual risk is real and should be tracked as R11.** If any gate slips a week, or the forum language question (§12) comes back "bilingual", 9 Oct does not hold. The mitigation is that the website alone is complete at **20 Sep** — so the fallback is the original arrangement: ship the site, follow with the forum. Do not let that fallback go unspoken internally just because the client timeline shows one date.

Phase 1 scope: Home · About (intro/history/culture) · Corridor (partners/stories) · Business (FI/cross-border) · Individual · Contact (details/enquiry/feedback) · FAQ · Terms · Privacy. Bilingual throughout.

**Auth in Phase 1:** header shows `注册 | 登录` on every deck screen but its only use is the forum. Build the routes and Supabase Auth in Phase 1 (they're cheap and the header would otherwise be a dead link), gate everything behind them in Phase 2.

**Homepage forum feed:** seed the module with the four sample posts from the deck. The client's stated purpose is community-building and their boss's priority is the community — a demo with no trace of it demos the half they care less about.

## 9. Forum — original standalone estimate

> **Superseded 7 Aug** by the compressed schedule in §8. Kept because it is the basis for the 6–8 week figure quoted in §8a, and because it is the fallback plan if a gate slips: ship the website on 20 Sep, run this afterwards.

Starts after demo sign-off. 6–8 weeks.

| Week | Work |
|---|---|
| 1–2 | Auth hardening, profiles, registration flow, email verification |
| 3–4 | Posts CRUD (structured fields), RLS policies + policy test suite, moderation queue, moderator admin UI incl. lexicon editor |
| 5 | Lexicon scan stage + LLM classifier, trust tiers, author-facing status + notification emails |
| 6 | PGroonga search, structured filters, reactions/saves/reports, homepage feed wired to live data |
| 7–8 | UAT, load sanity check, abuse hardening, go-live | [Go Live](https://app.clickup.com/t/86eyf6hby) |

~~Ships around December 2026.~~ **Superseded — forum now ships 9 Oct 2026 with the website (§8).** This December figure only applies if the compressed plan is abandoned and the fallback in R11 is taken.

## 10. Environment variables

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_DEFAULT_LOCALE

SUPABASE_URL                      # server-only — no NEXT_PUBLIC_
SUPABASE_ANON_KEY                 # server-only under our access model
SUPABASE_SERVICE_ROLE_KEY         # server-only, bypasses RLS, never in a client component

SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_READ_TOKEN

MODERATION_PROVIDER               # Phase 2 — "zai" (default) | "anthropic"
MID_RISK_ACTION                   # Phase 2 — "queue" (default) | "block"
ZAI_API_KEY                       # Phase 2 — primary classifier
ANTHROPIC_API_KEY                 # Phase 2 — shadow classifier during UAT
RESEND_API_KEY                    # Phase 2 — moderation notifications
```

`.env.example` tracks these with placeholder values from day one.

## 11. Verification

Every claim of "done" backed by a command that ran:

- `pnpm typecheck` — TS strict, zero `any`
- `pnpm lint`
- `pnpm build` — catches RSC/client boundary violations
- **RLS policy tests** — the critical suite. A `pending` post must not be readable by an anonymous session. An author must not be able to self-approve. Assert these; don't assume them.
- **Lexicon fixture tests** — the false-positive corpus from [09](09-moderation-flow.md) §3.2 becomes a test file. 我们提供合规换汇服务 and 我们严格遵守反洗钱规定 must not auto-reject; 非法换汇 must resolve to **high**, not to the mid-risk 换汇 nested inside it. These are the regressions a word list produces, and they're only catchable by assertion.
- Playwright smoke: both locales, language switcher, contact form, forum post → pending → approve → visible
- China-constraint audit: grep the built output for `googleapis.com`, `gstatic.com`, `supabase.co`, `cdn.sanity.io` in client bundles. Should be zero hits.
- Lighthouse on a throttled connection — the proxy for mainland conditions we can actually measure

## 12. Blocked on

**From the client, before W0 closes:**
1. ~~Colour scheme sign-off~~ — **✅ done 4 Aug.** Tokens in §2
2. ~~Answer on forum moderation~~ — **client moved first**, sending the word list on 4 Aug. What's owed now is our reply: flow ([09](09-moderation-flow.md)), features ([10](10-forum-features.md)), timeline (§8/§9). Draft in [08](08-client-reply-draft.md)
3. WhatsApp number, WeChat ID (deck has `123456`)
4. Real partnership stories + partner logos
5. FAQ / T&Cs / Privacy content — Privacy needs real drafting, the forum collects UGC
6. Approval of the English copy corrections in [06-open-questions.md](06-open-questions.md) §D
7. Confirmation that the Chinese site should or shouldn't link to IDT / CYSMobilePay / CYSGlobalPay (they appear nowhere in the deck)

**Decided 2 Aug, no further input needed:**
- Styling → Tailwind v4 + CSS custom properties, shadcn/Radix for a11y primitives (§2)
- Classifier → `glm-5.2` via Z.ai, provider-agnostic interface, Claude as UAT shadow (§5)
- Timeline → reset with the client in W0, bundled into one message with the colour scheme and moderation answers (§13 R1)

**Now decided by the client, no further input needed:**
- Colour theme → the mockup's tokens, verbatim (§2)

**To add to the W0 client message:**
- Ask CYS compliance to review the Z.ai DPA before Phase 2 go-live (§5). Not a blocker for the build.
- Mid-risk terms: block or queue? Ships as `MID_RISK_ACTION`, default `queue`, so it doesn't block ([09](09-moderation-flow.md) §4).
- Confirm damaged lexicon row 104, and ideally re-export the file ([09](09-moderation-flow.md) §3.3).
- Recommend against dislikes; propose 有用 + 举报 instead ([10](10-forum-features.md) §4).

## 13. Risks

| # | Risk |
|---|---|
| R1 | ~~**The 2–3 month estimate overruns on the forum.**~~ **Closed 7 Aug — resolved by compressing rather than resetting.** Quoted 27 Jul, so the window runs to **27 Sep (2 mo) / 27 Oct (3 mo)**. The revised plan (§8) lands website + forum on **9 Oct = 2.4 months**, inside it. No reset conversation is needed and the timeline reset paragraph has been removed from the client reply. The overrun risk did not vanish, it moved — see **R11**. |
| R11 | **Two weeks of dedicated forum build against a 6–8 week standalone estimate.** Survives only on front-loading, a trimmed launch scope, and three-day sign-offs (§8a). Any gate slipping a week, or "bilingual" coming back on the forum-language question, breaks 9 Oct. **Mitigation: the website alone is complete on 20 Sep**, so the fallback is the original two-phase arrangement. Decide by the **W3–4 design review**, not in the UAT week — by then it is too late to be graceful about it. |
| R6 | **Third-party AI provider in a regulated client's stack.** Z.ai's international arm is a Singapore entity processing in Singapore, which is why this is workable — but their policy permits onward transfer with safeguards, and CYS is MAS-licensed. Get compliance to read the DPA before Phase 2 go-live. The provider-agnostic interface is the mitigation: if compliance says no, it's an env-var change to Claude, not a rewrite. |
| R2 | **Moderation is an operational commitment the client hasn't staffed.** Someone at CYS has to review Chinese-language posts, indefinitely. If that person isn't named and resourced, the forum stalls at launch no matter how well it's built. |
| R3 | **China accessibility has never been discussed with the client.** We're designing defensively at near-zero cost, but if they later say mainland performance is a *requirement*, that's ICP filing, a Chinese entity, and different hosting. Confirm the expectation now. |
| R4 | **"Blockchain platform" in the Partners & Investors copy.** Lifted from CYS's existing corporate vision. On a China-facing financial site that word attracts scrutiny. Flag for removal. |
| R5 | **Two Wix sites, one brand.** The English site stays on Wix while the Chinese site is custom. Divergent design systems, two publishing workflows, no shared components. Acceptable for now; worth a conversation about migrating the English site later. |
| R7 | **Hard-blocking mid-risk terms would reject legitimate business posts, invisibly.** 换汇 — CYS's own service — plus 发票, 佣金, 代付, 水货 are the working vocabulary of the cross-border traders this forum is for. Under the client's stated rule they never publish and nobody at CYS learns it happened. Mitigation: `MID_RISK_ACTION` defaults to `queue`; recommendation and evidence in [09](09-moderation-flow.md) §3. |
| R8 | **The word list is Chinese-only; the site is bilingual.** If English posts are permitted, the pre-publication guarantee silently applies to Chinese only. Needs a client answer on forum language before Phase 2 scope is fixed ([09](09-moderation-flow.md) §8 item 7). |
| R9 | **The lexicon arrived with encoding damage** — 3 of 220 terms carried U+FFFD. Two were recovered from their own reason cells, one is inactive pending confirmation. The concern is not those three: a lossy round-trip may have corrupted cells less visibly. Ask for a clean re-export ([09](09-moderation-flow.md) §3.3). |
| R10 | **Moderation is now a policy surface, not just code.** The word list encodes legal exposure and will be edited over time. It needs versioning, an audit trail on term changes, and a named owner at CYS — otherwise a silent deletion becomes a compliance gap nobody can date ([09](09-moderation-flow.md) §6). |
