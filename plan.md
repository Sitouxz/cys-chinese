# CYS Chinese website high fidelity prototype implementation plan

Prepared 10 September 2026. Deliverable: a complete, responsive, bilingual, interactive client-preview website using fictional data and local simulated workflows. This document plans the implementation; it does not claim the prototype has been built. Read with [design.md](design.md).

## 1. Outcome and scope

The client should be able to explore CYS's positioning, browse partnership opportunities, register a demo account, submit a forum listing, review it as a moderator, and see the published result without encountering unfinished screens or dead buttons. Every visible action must have a meaningful result. Marketing pages require finished visual design; forum and moderator pages require the same visual quality plus connected state changes.

The current request includes the forum in the mock prototype, superseding the earlier agreement to omit it from the first demo. Production services remain a separate development phase. This preview does not transfer money, quote live rates, send messages, create real accounts, or use live AI moderation.

### Source order and decisions

1. This request: complete high fidelity mock prototype plan and design, with mock data.
2. [Chinese Website task](https://app.clickup.com/t/9018732219/86eyczra3) and [Hifi/mockup task](https://app.clickup.com/t/9018732219/86eyf6gtu). Both descriptions are empty; requirements are in comments and linked work.
3. [Lofi task](https://app.clickup.com/t/9018732219/86eyf6gt9): latest comment authorizes proceeding to Hifi; earlier feedback and replies provide the concrete layout corrections.
4. [Client feedback dated 1 September](docs/client-inputs/CYS_Wireframe_Feedback_EN.docx), downloaded from the Lofi attachment during this review: interactive backgrounds, counters, section transitions, hover-expand timeline, distinct Corridor sections, condensed Business and Individual pages.
5. [Client HTML reference](https://t9018732219.p.clickup-attachments.com/t9018732219/521b7c96-b3a8-4408-9a31-915f9e83cefa/CYS_LandingPage_Mockup.html), available locally as [CYS_LandingPage_Mockup.html](docs/client-inputs/CYS_LandingPage_Mockup.html): confirmed palette and visual language. The local copy was rendered and inspected; direct remote viewing was blocked. Use its style, not its outdated section order or incomplete links.
6. Existing [product context](PRODUCT.md), [content inventory](docs/03-content-inventory.md), [sitemap](docs/02-sitemap-ia.md), [development plan](docs/07-development-plan.md), [moderation proposal](docs/09-moderation-flow.md), and [forum feature proposal](docs/10-forum-features.md). These are source material; older unresolved labels and recommendations are not new client approvals.

The original and revised Canva links are referenced in the source material. Their full decks and all visual comments were not independently re-reviewed for this planning pass; the latest attached feedback and ClickUp corrections govern the specific requirements below.

| Requirement or conflict | Implementation decision |
|---|---|
| Approved homepage order | Hero → Forum preview → Values → Product & Service → History → Business/Individual entrances → Contact → Footer. Currency ribbon is part of the hero transition. ClickUp reply `90180250873211` explicitly puts the forum above Values. |
| Local homepage differs | Current `Home()` renders Values before Forum. Correct this; do not treat the local order as approved. |
| Landing versus homepage | Current project has one home surface: `/home`, with `/` as an alias. Treat landing/home as that same page unless the client supplies a distinct flow; do not invent a splash screen. |
| Reference globe versus older anti-references | The user selected this reference and the September feedback explicitly requests a rotating earth for History. Use its technical globe/route treatment; the old blanket globe exclusion does not override this direction. |
| Marketing interactivity | Deliver counters, hero pointer response, and distinct scroll transitions with keyboard, touch, and reduced-motion equivalents. |
| Moderation policy conflict | Default demo: high and mid risk blocked; low risk queued. Earlier documents recommend queuing mid risk. Show that alternative only in a clearly labelled reviewer scenario; do not silently replace the client rule. |
| English forum safety | Translate interface and seeded content; all newly entered English/mixed-language content goes to manual review in the demo. A Chinese lexicon is not English moderation. |
| Optional scope | Culture is a compact preview section using supplied values, marked as a production content decision. Useful, Report, Save, and category follows are the proposed demo behavior; public Dislike remains a documented decision, not an approved omission. |

## 2. Current implementation and technical boundary

The existing `wireframe/` is React + Vite, JavaScript/JSX and plain CSS. Its `package.json` defines `dev`, `build`, and `preview` only. `App.jsx` contains placeholder copy, route handling, numerous page shells and partial local interactions; `data.js` contains milestones and bilingual sample posts but the app currently imports only milestones. Existing route shells are not evidence that their workflows work.

No repository `AGENTS.md` or `CLAUDE.md` was found in this workspace. The directory is not currently a Git repository (`git rev-parse` reported that explicitly). Do not invent branch or commit status.

For this prototype, extend the existing Vite application, preserve its known preview routes, and replace placeholder content and disconnected state. Use React state/context plus a single local mock-service boundary. No new backend or architecture migration is needed for the requested fidelity. Existing production planning names Next.js, Supabase and Sanity; those remain production decisions and are not installed or connected by this prototype plan.

An alternative is to implement directly in the eventual production stack. That reduces later porting but expands this phase into infrastructure, auth and deployment setup. If a migration is requested, present that scope change before implementation. Do not migrate implicitly.

Proposed implementation files are new work, not existing assets:

- `wireframe/src/components/`: shared header/footer, buttons, forms, dialogs, status UI and motion primitives.
- `wireframe/src/pages/`: marketing, forum, member and moderation screens extracted as touched.
- `wireframe/src/content/`: Chinese and English approved/proposed copy and asset provenance.
- `wireframe/src/mock/`: seed records, mock service, reducer/selectors, moderation scenarios and storage version.
- `wireframe/src/styles/`: visual tokens and marketing/forum styles.

Keep native CSS and the current framework. Define explicit data contracts; if TypeScript tooling is introduced, use strict checks and pinned dependencies after inspecting the installed versions. Do not change dependencies tagged `latest` as an unrelated cleanup. Do not add a router or animation library unless native browser/React features cannot meet a specific requirement.

## 3. Complete screen inventory

Each row requires Chinese and English UI, responsive layouts, working links, keyboard access, relevant empty/loading/error/success states, and a refresh-safe URL. Proposed detail routes are explicitly additions. Existing numeric post/member/category URLs remain supported.

| Surface | Routes and page content | Required behavior |
|---|---|---|
| Home | `/home`, `/` alias; approved section order | Forum CTA, four topic links, eight-currency ribbon, three service tabs, matching paths and industry links, history counters, audience entrances, contact CTA. |
| About | `/about`, anchors `#intro`, `#history`, `#culture` | Intro/compliance copy; five milestone years with hover expansion, keyboard focus expansion and touch selection; complete narrative; compact values/culture. |
| Corridor | `/corridor#partners`, `/corridor#stories` | Partnership experience statement, eight clearly fictional partner identities, supplied vision copy; separately styled story list. Partner selection opens an informative local detail panel. |
| Story detail | New `/corridor/stories/:slug` | Six complete fictional story records, article body and related links; return to story list and contextual enquiry. |
| Business | `/business`, `/corporate` alias | Two audience tabs: financial institutions and cross-border corporates. Distinct source copy/benefits and an enquiry CTA with audience preselected. |
| Individual | `/individual` | Three use cases only: family/education remittance, shopping FX, overseas investment. Each opens contextual details or prefills enquiry; no transaction calculator. |
| Contact | `/contact` with details/enquiry/feedback selection | Contact channels, conditional corporate/individual enquiry, feedback chips and message; validation, submitting, success, failure/retry. Demo contact actions show/copy information without sending. |
| Legal/help | `/legal?tab=faq` with `faq`, `terms` or `privacy` selection; new `/faq`, `/terms`, `/privacy` aliases | Searchable FAQ, category selection, accordion, readable illustrative terms/privacy, enquiry link. Clearly identify unapproved legal copy. |
| Authentication | `/auth?mode=login` with `login`, `register`, `forgot`, `verify` or `reset` selection; new `/login`, `/register` aliases | Demo login/register, verification, duplicate account, invalid credentials, reset-link expired, reset complete, sign-out; return to intended action. No real email or password storage. |
| Forum listing | `/forum` | Featured and latest approved posts; category/industry/market/intent filters, sort, pagination, clear filters, followed topics, new-post entry. |
| Category views | `/forum/categories`, `/forum/category/:id` | Category counts from actual approved fixtures, follow/unfollow, filtered posts and empty category. |
| Forum search | `/forum/search?q=...` | Search title/body/company/product/service and bilingual seeded keywords; filter combinations, result count, no-results and clear search. Home search routes here. |
| Post detail | `/forum/post/:id` | Full listing, author/company, intent/markets, Useful toggle, Save toggle, copy/share fallback, Connect enquiry, report, comments and one reply level. |
| Composer | `/forum/new`, `/forum/edit/:id` | Structured fields, validation, save draft, preview, submit, unsaved-change confirmation, moderation result, correction/resubmission. |
| Company directory/profile | `/forum/members`, `/forum/member/:id` | Search/filter companies, complete profiles, approved posts, connect gate, unavailable profile state. Badge explicitly says demo verification. |
| Member area | `/me/forum`, `/me/posts`, `/me/replies`, `/me/saved`, `/me/notifications`, `/me/settings` | Own activity and states, edit/delete drafts/posts, saved content, own pending replies, mock notification receipts, mark-read, editable demo profile/preferences, empty/error states. |
| Report/rules | `/forum/report/:id`, `/forum/rules` | Report reason/details and receipt; rules linked from composer and report; duplicate-report feedback. |
| Moderation | `/moderation` with queue/reports/history views | Switch between pending posts/comments and reports; inspect submitted revision, risk category and evidence; approve, reject with reason, request edit, remove/restore reported content, audit history. |
| Preview controls | New `/preview` | Guest/member/moderator demo roles, language, named scenarios, simulated failure, complete reset, page index and demo walkthrough. Separate from branded primary navigation. |
| Recovery | Unknown routes/IDs, forbidden/private content | Proper not-found or unavailable view; guest login gate; no accidental fallback to Home or disclosure of pending content. |

Legacy section-style URLs from the sitemap should map to the corresponding compact page and anchor, rather than creating duplicate content pages. Explicitly implement mappings for `/about/intro`, `/about/history`, `/about/culture`, `/corridor/partners`, `/corridor/stories`, `/business/financial-institutions`, `/business/cross-border`, `/contact/details`, `/contact/enquiry`, and `/contact/feedback`.

Preserve current clean route paths. Use `lang=zh|en` for shareable prototype locale selection; default to Chinese and persist the preference. Parse locale, search and section/hash anchors separately; the existing hash-as-route helper must not confuse `#history` with a route. Future production locale paths are outside this phase.

## 4. Mock data and connected behavior

### Fixture inventory

| Dataset | Minimum useful fixture set |
|---|---|
| Company profiles | 8 fictional businesses spanning F&B, apparel, consumer goods, toys, logistics and professional services; industries, markets, introductions and optional demo verification. No real personal details. |
| Forum posts | 24 complete published bilingual examples, across all 4 existing categories; 3 featured; zero-engagement, long-title, no-comment and multi-market cases. Add 2 drafts, 3 pending, 2 rejected and 1 removed private fixture. |
| Comments | 18 published comments including 6 one-level replies; 2 pending and 1 rejected comment owned by the member persona. Never render deeper threads. |
| Partners and stories | 8 fictional partner identities and 6 finished story articles. Mark each as illustrative; no invented association with real businesses. |
| Accounts | Guest, member, another member for ownership tests, moderator. Deterministic session selector; registration creates only a temporary mock identity. |
| Notifications/reports | 8 mock receipts tied to actual submission/review/connect actions; 4 reports with open/resolved outcomes and relevant target IDs. |
| Marketing/help | Supplied bilingual company copy; all 5 milestones; 3 values; 2 business audiences; 3 individual uses; 12 useful bilingual FAQ entries; illustrative legal pages. |
| Currency display | SGD, CNY/CNH, USD, HKD, AUD, MYR, IDR, THB. Default shows supported currency labels, not invented tradable rates. A reviewer-only numeric scenario must say illustrative, with a fixed demo date. |

All records need stable IDs, timestamps, localized display content and explicit links to related records. Generate counts from records rather than independent decorative numbers. Use a fixed demo clock for repeatable ordering. Seed content may be fully translated; member-entered content remains in its original language and is never presented as automatically translated.

Use these record groups: profile, post, revision, comment, reaction, bookmark, category follow, report, enquiry, notification, moderation event, story and partner. A post has author ID, locale, title, body, category, industry, product/service, markets, intent, status, timestamps and revision ID. A revision records the submitted text and immutable review result. A comment has post ID and optional parent comment ID. Reports and actions reference real fixture targets.

### State rules

1. Single store for every screen. Approving a post updates the public forum, home preview, profile, member dashboard and counts; rejection must never update the public feed.
2. Guest can read approved posts. Posting, reacting, saving, following, commenting, connecting and reporting trigger demo authentication and resume the intended action afterward.
3. Save only synthetic preview data in a versioned local-storage namespace such as `cys-hifi-demo-v1`. Keep role/session in session storage. Never retain passwords or real contact data. In a storage-disabled browser, fall back to memory with a clear reset-on-refresh notice.
4. Draft → pending → approved/rejected. High/mid risk can resolve to rejected immediately. Low, unknown, English or failed-scan submissions remain pending. Preview scenario selection may supply a deterministic clean verdict; no live classifier is claimed.
5. Editing a published post creates a pending revision. The last approved version remains public until the new revision is approved. Rejected/pending text remains private; review attaches to the exact revision. Changes during review invalidate the old decision.
6. Comments/replies use the same moderation lifecycle. Pending comments are visible only to their author and demo moderator, never to other members or guests.
7. Useful, Save and Follow are reversible per-member toggles. Repeated clicks do not duplicate records or inflate counts. Trending uses a deterministic score derived from approved engagement, with a stable timestamp tie-breaker.
8. Delete is a confirmed local soft-delete with undo; public selectors exclude removed content. Reporting alone does not instantly remove a listing. Moderator removal must record a reason; restore is explicit.
9. Connect/contact/feedback submissions create local receipts only. Notifications show what a future email would contain and explicitly state that no email was sent.
10. Preview reset removes only this app's mock namespace, returns to Guest/Chinese and reseeds every dependent record. Never call `localStorage.clear()`.

### Form contracts

| Form | Fields and validation |
|---|---|
| Post | Title 8–100 characters; body 30–3,000; category, industry, product/service (2–100), 1–5 markets, intent; rules acknowledgement. Trim whitespace, reject empty values and out-of-list IDs; preserve Chinese composition while typing. |
| Comment/reply | 2–1,000 characters; existing approved post and valid parent; one reply level. |
| Enquiry/connect | Name 2–80, valid demo email up to 254, audience, message 10–2,000; company required for business; phone optional; enquiry consent required and marketing consent separate/unchecked. |
| Feedback/report | Reason/category required; message 10–2,000; optional reply email for feedback; valid target for report. |
| Demo register/login | Valid synthetic email; password display/validation only (8–128), confirmation on registration, demo terms acknowledgement. Never save the password; known persona fixtures drive outcomes. |
| Profile | Display name 2–80, company 2–120, industry, 1–5 markets, intro up to 600; allow cancellation and show saved state. |

Validate again at the mock-service boundary, not just in the field UI. Render user text as text, never raw HTML. All submission buttons disable during a single in-flight action; retries must not duplicate records. These are demonstration controls, not a production security boundary.

## 5. Implementation sequence and completion gates

No new calendar commitment is inferred from the old August–October timeline. Complete in the following dependency order; estimate dates after the route/content inventory is mapped to implementation tasks.

| Step | Work | Exit evidence |
|---|---|---|
| 1. Baseline and content | Preserve current Lofi; map routes, source copy, revised feedback and assets; capture baseline screens. Record missing logo/contact/legal/story content. | Every screen and visible action assigned a route, fixture and expected result. |
| 2. Shared design and routing | Implement tokens, typography, header, footer, responsive navigation, locale and route parsing, preview badge and reviewer controls. | Refresh/back/forward, language switch, section anchors and navigation work at desktop and mobile widths. |
| 3. Home design | Build reference-led hero, topic links, correct forum position, service interaction, animated counters and remaining approved sections. | Full Chinese/English Home screenshots; all three requested motion types verified; reduced-motion alternative works. |
| 4. Supporting public pages | About timeline; Corridor A/B and stories; compact Business/Individual; Contact; help/legal; auth states. | Every public route renders finished copy and imagery with meaningful interactions and contextual enquiry. |
| 5. Shared mock engine | Define fixtures, versioned persistence, role gates, forms, revisions and selectors. | Deterministic reset, no private-data leakage between demo roles, all mutation counts derived correctly. |
| 6. Forum and member flows | Listing/search/filter/detail, profiles, composer, reactions/saves/follows, comments, connect/report, member pages. | Guest → login → intended action and member submit/correct/resubmit journeys complete. |
| 7. Moderation and recovery | Queue, exact revision review, reports, audit, simulated notifications and error/retry scenarios. | Member submission → moderator approval → public visibility works across every dependent screen; blocked and rejected content stays private. |
| 8. Client-preview quality pass | Full interaction inventory, bilingual/responsive/visual/accessibility checks, asset and console audit. | Acceptance matrix below passes; remaining production decisions clearly separated from demo defects. |
| 9. Handoff | Preview guide with reset/roles/scenarios, route list, source/mock content register and screenshots. | Reproducible local preview instructions. A hosted preview is only published after authorization; verify any supplied hosted URL before calling it delivered. |

## 6. Acceptance matrix

| Check | Pass condition |
|---|---|
| Reference fidelity | Navy/brass/ivory palette, Chinese serif display, readable sans UI, globe/routes, compact institutional layout. No gray placeholders, Lorem ipsum, broken logos or wireframe notes. |
| Client layout feedback | Forum precedes Values; About has five hover/focus/tap milestones over globe; Corridor clearly splits partners from articles; Business has two audiences; Individual has three uses. |
| Interactivity | Counters settle at source values; hero responds without hiding text; transitions preserve normal scrolling; all visible buttons/links work. |
| Bilingual coverage | Every route, form validation message, empty state, modal, badge and notification has both locales; switch preserves entity, filters and entered draft. |
| Routes | Refresh and direct links work; browser history is correct; unknown IDs and URLs show recovery screens; legacy aliases reach the right section. |
| Search/filter | Combined filters, sort, pagination and query URLs agree; changing filters resets page; empty results have a clear recovery action. |
| End-to-end moderation | Submit private pending post → approve exact revision → show public → edit → old approved content remains → approve revision; reject another revision and verify privacy. Repeat for comments. |
| Policy scenarios | High blocked, mid blocked, low pending, English pending, uncertain/failed scan pending; alternate mid-review policy visibly separate. Existing moderation fixtures have policy-specific expectations instead of silently overwriting `must_not_block`. |
| Ownership | Guest/other member cannot open private drafts, edit another member's post or act as moderator through normal UI. Clearly document that local role gating is not production authorization. |
| Data consistency | Useful/save/follow reversible without duplicates; reset reseeds all dependent state; approved/public counts match rendered records. |
| Forms | Required/invalid/overlong values, IME, duplicate-submit, network simulation, retry and success all tested; entered values retained after failure. |
| Responsive | Inspect all distinct layouts at 1440×900, 1024×768, 768×1024 and 390×844; stress at 320px and 200% zoom. No overflow, cropped copy, hidden controls or sticky-widget collisions. |
| Accessibility | Complete key flows with keyboard; visible focus, correct labels/roles, focus return, status announcements, contrast and reduced motion. Touch timeline has no hover dependency. |
| Runtime | No uncaught console errors or failed required assets; deny third-party requests and confirm core preview remains usable. Simulated error states do not create actual unhandled errors. |
| Content honesty | Fictional companies/stories/badges labelled; sample rates never imply quotes; 2030 marked as outlook; no fake testimonials, contact channels or approved legal claims. |

For implementation, run the existing `npm run build` inside `wireframe/`. At this planning snapshot there are no `lint`, `test` or `typecheck` scripts and no TypeScript configuration was found. Add meaningful workflow tests and an agreed checking setup as part of implementation; use the installed underlying tools only when they exist. Do not report absent commands as passing. Capture command results, screenshots and a short manual flow report in the eventual handoff. This document-only task does not require running an unchanged application build.

## 7. Demonstration script

1. Reset preview, choose Chinese and Guest. Explore Home, hero interaction, forum preview, service tabs and counters.
2. Open About; expand every milestone by hover, then keyboard; show touch behavior and the 2030 outlook label.
3. Visit Corridor; distinguish partner showcase from full stories. Open Business and Individual to show their compact content-specific layouts.
4. Follow a contextual enquiry CTA; submit invalid values, correct them, demonstrate simulated failure/retry and a local-only success receipt.
5. Search the forum for apparel, combine market/intent filters, open a company and post, then save it through the demo login gate.
6. Compose a valid listing; show preview and pending status. Switch to Moderator, approve it, then return as Guest to see it in the forum and homepage feed.
7. Edit the approved listing, show that new text stays private, reject the revision with a reason, correct it and approve again. Demonstrate a blocked and a low-risk queued example.
8. Demonstrate a pending comment, Useful toggle, bookmark, category follow, report and Connect receipt. Open member activity and notification receipts.
9. Switch to English on the same record, show mobile layout and reduced motion, then reset to prove repeatability.

## 8. Production decisions and content follow-up

These do not prevent the mock design or simulated flows from being completed. Record each in the handoff with an owner and a demo default; do not describe them as confirmed client policy.

- CYS content owner: actual logo files, authorized partner identities/logos/stories, photography, current contact channels and final Chinese/English copy. The reference logo file is missing locally; do not ship its broken image or a guessed replacement.
- CYS policy owner: mid-risk block versus review; comment review; English/mixed-language moderation; public Dislike; verification badges; public engagement counts; moderation staffing and response expectation.
- CYS compliance/content owner: current licence wording, financial figures, investment phrasing, privacy/terms and contact/consent requirements. Existing brief figures are supplied copy, not freshly verified financial assertions.
- Neu Entity: production stack/version confirmation, real identity and access controls, CMS/database/storage integration, actual email delivery, search, rate limiting, abuse controls and operational monitoring.
- Deployment owner: client-preview hosting approval, production deployment, domain/DNS and mainland access requirements. No external publication, status change, email or ClickUp comment is part of creating these documents.
