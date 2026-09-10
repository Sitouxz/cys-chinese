# CYS Chinese website high fidelity design specification

Prepared 10 September 2026. Companion to [plan.md](plan.md). This is the visual and interaction specification for the complete mock-data prototype, not a record of finished implementation or production approval.

## 1. Design direction

**Institutional, connective, culturally fluent.** A Chinese-speaking business owner reviews CYS at a desk or on a phone, comparing partnership opportunities and looking for evidence of credibility. Use a dark navy introduction for presence and an ivory reading surface for comfortable exploration. Community participation should feel clear and useful, without the urgency of a retail remittance funnel.

The primary reference is the client's [CYS Landing Page Mockup](docs/client-inputs/CYS_LandingPage_Mockup.html). Preserve its navy/brass/ivory palette, Chinese serif headings, restrained route lines, luminous globe, fine separators and measured spacing. The September [feedback](docs/client-inputs/CYS_Wireframe_Feedback_EN.docx) explicitly adds globe-backed history, interactive motion and content-specific layouts. These client directions take precedence over older generic style exclusions.

The reference was inspected as a local rendered page. Its logo file is missing, its hero topic strip can crowd the CTA, some links are unfinished and its section order predates the corrected brief. Those are defects to resolve, not details to reproduce. The high fidelity result must retain the visual character while fitting the approved content and flows.

Use one shared brand system with two treatments:

- **Public site:** expressive globe, Chinese display typography, dark-to-light rhythm and deliberate scroll motion.
- **Forum/member/moderation:** compact sans-serif reading and controls, strong alignment, restrained decoration, quick state transitions. Do not carry cinematic globe effects into forms or queues.

## 2. Tokens

### Confirmed brand colors

Copy these values from the client HTML without substituting an unrelated palette.

| Token | Value | Use |
|---|---|---|
| `--navy-950` | `#0C1626` | Hero base, footer, deep backgrounds |
| `--navy-900` | `#12213A` | Navigation and alternate dark sections |
| `--navy-800` | `#1A3358` | Dark interactive surfaces |
| `--navy-700` | `#24446F` | Dark selected/hover surfaces |
| `--brass-500` | `#B98D42` | Ornament, borders and accent fills |
| `--brass-300` | `#D9B877` | Dark-background text accents and primary hero CTA |
| `--brass-100` | `#F1E3C6` | Pale accent surfaces |
| `--ivory-50` | `#FAF8F3` | Main reading background |
| `--ivory-100` | `#F3EFE4` | Alternate sections and supporting surfaces |
| `--ink-900` | `#151C26` | Main text |
| `--ink-600` | `#4C5666` | Secondary readable text |
| `--ink-400` | `#8992A1` | Decorative/disabled treatment only until contrast passes |
| `--line` | `#E3DDCD` | Decorative separators, not sole control boundaries |
| `--teal-600` | `#3E6259` | Sparing positive/supporting accent |

Brass is not a universal small-text color on ivory. Use navy/ink for body and labels; dark navy text on brass CTA fills. Input boundaries and focus rings need stronger contrast than the decorative line token. Verify actual text/background pairs at implementation; body and small text require 4.5:1, large text and control boundaries 3:1 where applicable.

Proposed semantic colors: error `#9C2F32` on `#FCEDEC`, warning `#745014` on `#FFF3D6`, success `#285548` on `#EAF3EE`, information `#24446F` on `#EAF0F7`. Verify these pairings before use. Pair every state with an icon and text. A **low-risk** green marker still says “Needs review”; green must not imply publication.

### Typography

Preserve the reference's established type choices rather than introducing a different aesthetic. Chinese display: Noto Serif SC, then Songti SC/SimSun/serif. Chinese body/UI: locally hosted Noto Sans SC when practical, PingFang SC/Microsoft YaHei/system sans fallbacks. English UI/body: the reference's Inter if a licensed local file is available, then system sans. Do not rely on Google-hosted fonts. Subset CJK display fonts and ensure missing glyphs have a readable fallback.

| Role | Desktop | Mobile | Behavior |
|---|---|---|---|
| Home heading | 48–64px | 32–38px | Chinese serif, 600 weight; line-height 1.35 CN / 1.16 EN; max 3–4 balanced lines at intended desktop width. |
| Public section heading | 32–42px | 26–30px | Serif; 1.35 CN / 1.2 EN; never forced to a single line. |
| Public subheading | 22–26px | 20–22px | Serif or sans by content, consistent within the surface. |
| Forum page heading | 28–32px | 24–28px | Sans, 600; no decorative tracking. |
| Body | 16–18px | 16px | 1.8 CN / 1.65 EN; 60–72 Latin characters per line, roughly 30–36 Chinese glyphs. |
| Controls | 14–16px | 16px for inputs | Sans, 500–600; explicit labels. |
| Metadata | 13–14px | 13–14px | Readable contrast; wrap long company names and dates. |
| Counters/years | 42–64px | 32–44px | Tabular numbers; stable reserved width. |

Chinese tracking 0 to 0.02em; English display tracking no tighter than -0.03em. Body never uses spaced-out uppercase. Reserve a small gold origin label for the home hero; avoid repeating an eyebrow on every section. Set page language correctly and provide mixed-language spans when necessary.

### Layout and surfaces

- Public content maximum width: 1180px, matching the reference. Gutters: 32px desktop, 24px tablet, 20px mobile; 16px at 320px.
- Forum maximum width: 1200px; desktop sidebar 220–240px with flexible main content; detail body maximum 760px. Collapse navigation and filters on small screens.
- Public section spacing: 80–104px desktop, 48–64px mobile. Supporting pages use 48–72px rather than repeated viewport-height sections. Related labels and controls use 8/12/16px; modules 24/32px.
- Header: approximately 80px, compact to 64px after scroll; mobile 64px. Reserve its height and anchor offset. No content jump as it changes treatment.
- Cards and dialogs: 8–12px corner radius; input 6–8px; pills only for short tags and primary reference-style CTAs. Avoid huge rounded containers.
- Prefer fine borders or a compact shadow, not border plus broad decorative shadow. Use a solid readable navigation surface after scrolling.
- Layer scale: content 0, sticky header 10, menus 20, overlay 30, dialog 40, toast 50. No clipping of dropdowns in scrolling parents.

## 3. Header, navigation and preview framing

Logo links to Home. Desktop navigation includes About, China–Singapore Corridor, Business, Individual, Chinese Forum and Contact, plus language and account controls. Chinese Forum must be visible at top level per the corrected Lofi feedback. Use concise English labels when width is limited; switch to the mobile menu before links collide.

About menu: Introduction, History, Culture preview. Corridor: Partners & Investors, Partnership Stories. Business: Financial Institutions, Cross-border Corporates. Contact: Contact Details, Enquiry, Feedback. Footer may group Stories and Forum under Chinese Community, but links must resolve to the same canonical pages. Chinese Community is a grouping label, not an invented empty page.

Desktop dropdowns work by click and keyboard, with optional hover enhancement and Escape close. Mobile menu is a full-height sheet with expandable groups, language and account entry; focus is contained and returns to the trigger on close. Active page and selected locale are visible and announced.

Show a small persistent “演示预览 · 示例数据 / Demo preview · Sample data” notice. A separate `/preview` panel exposes role/scenario/reset/page-index controls. Remove the current “Brief Page”, “All Pages”, wireframe notes, layout counts and placeholder annotations from the branded site. Keep only the concise demo notice visible during a client walkthrough.

Footer includes navigation, readable company identity, demo notice and legal/help links. Contact launcher opens a local panel; it must not overlap form submit actions, cookie notices or the mobile keyboard. No fake WeChat QR code or fabricated WhatsApp number.

## 4. Home composition

Approved sequence: **Hero → Forum preview → Values → Product & Service → History → Business/Individual entrances → Contact → Footer**. Treat the supported-currency ribbon as the end of the hero. The reference's lower forum placement and the local Values-first order are superseded.

### Hero and currency ribbon

Navy full-width canvas with a roughly 55/45 text-to-visual split. Chinese serif headline on the left, concise supporting paragraph, origin line and two actions. Right: cropped technical globe with fine brass routes connecting China and Singapore and restrained atmospheric light. Keep the left text area calm and high contrast. Copy and action area must remain visible without waiting for animation.

Primary heading from the supplied brief: “连接中国与东南亚的可信支付桥梁，启迪跨境商业新可能。” English: “A trusted payment bridge connecting China and Southeast Asia.” Put the longer inspiration phrase in supporting copy if it cannot fit comfortably. Primary CTA: “进入华商论坛 / Enter the forum”; secondary: “了解合作方案 / Explore partnerships”.

Four topic chips form a separate row below the main hero content, with enough reserved vertical space to avoid the reference's CTA collision. Each links to a published fixture post. Topic text is static unless deliberately changed by demo actions; do not call it live market activity. A compact labelled search field routes to forum search.

At mobile width, text and CTAs come first, globe becomes a shallower cropped background or separate visual, and topics stack or use an accessible horizontal list. Do not require swipe to access the primary action. Currency ribbon shows eight unique currency labels, a pause control if animated and a static wrapped reduced-motion version. No live conversion behavior.

### Forum preview

The first full section after the hero. A strong forum introduction and “Browse all” link alongside a readable three-listing preview with Latest and Featured selection. Default to the three most recently published listings so a newly approved demo submission appears immediately; Featured uses the seeded featured flags. Each listing includes meaningful title, company, industry/market, intent and a link to the detail. Read from the same published-post selector as `/forum`; do not maintain separate hardcoded homepage cards. Empty state invites browsing the community rules and creating a first post through the login gate.

### Values

Inclusion / 包容, Innovation / 创新, Inspiration / 启迪 in an airy three-part band. Short bilingual source-backed descriptions and fine separating rules; no redundant cards within cards. Mobile becomes a vertical sequence. Select/expand can reveal a longer value statement, but the three core meanings must already be visible.

### Product and Service

Retain the revised wireframe's tab row, three matching paths on the left and industry grid on the right. Tabs: Cross-border Payment, Solution Consulting, Business Forum. Each changes real content and destination links, not just its highlight. Payment and consulting paths lead to the relevant Business/Individual context; forum paths lead to intent-filtered listings. Industry links lead to filtered forum results. Active tab is shareable via query state and keyboard operable.

### History

A dark contrast section with a source-backed “Since 1981 / 40+ years” treatment, concise history summary and animated figures where source wording is settled. Use a compact milestone preview leading to `/about#history`. Never transform 2030 plans into completed history or invent counters to fill space. Avoid repeating all long history copy here.

### Audience entrances, contact and footer

Two complementary Business/Individual panels with different short content and one clear CTA each. Collapse to vertical on mobile. A concise contact band closes the narrative. Do not insert a financial quote calculator, aggressive sales countdown or additional decorative sections.

## 5. Supporting public pages

| Page | Composition | Interaction and content rules |
|---|---|---|
| About | Compact introduction and credentials; prominent globe-backed history; restrained culture/values section. | Five markers: 1981, 2011, 2020, 2025, 2030. Hover/focus reveals a year's full detail without requiring a click. Touch tap selects. One detail panel at a time, stable reading area, 1981 selected initially. Label 2030 “Outlook / 展望”. |
| Corridor | Section A: “40+ years” partnership experience, logo/identity showcase, Partners & Investors vision. Section B: clearly separate story articles with editorial imagery and summaries. | Partner panel and story article are distinct destinations. Eight partners and six stories are fictional preview examples; visible labels prevent assumed endorsements. Keep full story copy in detail pages. |
| Business | Compact title and introduction, two audience tabs, one content area with tailored copy/benefits and CTA. | Financial institutions and cross-border corporates have genuinely different content. Preselect enquiry audience; preserve tab on back navigation. No repeated generic image/text sections to extend page length. |
| Individual | Compact heading, three clearly illustrated use cases, one contact CTA. | Family/education, shopping FX, overseas investment. Select a use case for concise details or contextual enquiry. Treat investment text as supplied/proposed content, never advice or a promised return. |
| Contact | Contact details beside a clearly grouped form; separate Feedback view. | Validated local submission receipt and retry; enquiry topic follows incoming CTA. For missing social contacts, show a useful “Details to be confirmed” explanation and working enquiry alternative, not dead links. |
| Story article | Title, topic, demo attribution, intentional lead image, readable article body and related stories. | Six complete examples with beginning/context/outcome, explicitly fictional; avoid invented actual financial results or real partner quotations. |
| Help/legal | Compact heading, accessible tabs/anchors, FAQ search/category/accordion; readable terms/privacy sections. | Illustrative legal content clearly labelled for review. Never claim prototype copy is an approved legal agreement. All footer/help links lead here correctly. |
| Auth | Simple branded panel on ivory, calm navy support area, no distracting animation. | Distinct login/register/verification/reset states; password reveal, inline errors, pending button, local-only success and return destination. Demo credentials must be clearly synthetic. |

## 6. Forum, member and moderator design

### Listing and discovery

Navy compact forum header, ivory ground and white/near-ivory content surfaces. Use a search field, category navigation, clear filter labels, applied-filter chips and sort. Desktop sidebar holds categories and followed topics; mobile uses a horizontal category list and filter drawer. Show a visible Apply/Clear action in the drawer. Applied filters are reflected in the URL.

Listings emphasize **what is offered and what partner is wanted**. Anatomy: category, title, short summary, company, industry, markets, seeking intent, publication date and understated Useful/comment counts. Limit excerpt lines, never cut essential status or CTA text. Company badge must say demo verification; unverified examples do not look broken. Cards/rows link through using real semantic links; nested action buttons remain separately operable.

### Post detail and actions

Main column: title, company/byline, business context, full description, intent and markets, actions, approved comments. Supporting column: company profile and Connect CTA. On mobile, company summary follows the title and actions wrap or group in an accessible overflow menu.

Useful and Save show text and pressed state. Share copies a canonical post link and displays a selectable-link fallback when clipboard is unavailable. Connect opens a short enquiry form and creates a local notification receipt. Report opens a reasoned private form. A pending own comment appears with “Under review — visible only to you”; all other visitors see only approved comments. Replies indent once and then flatten.

Public Dislike is not included by default in the proposed preview, consistent with the existing forum proposal; document it as a policy decision still open. If requested for review, add a separate reviewer scenario rather than silently changing the principal experience. DMs and media uploads remain outside the described forum scope; do not show dead controls for them.

### Composer and member area

Composer groups Business context, What you are seeking, and Post content. Include guidance, live character counts, required labels, draft save, preview and submit. Preview displays the actual composed listing. On submit, preserve content and clearly explain whether it is pending or blocked. Do not expose exact lexicon matches to authors; use a category-level reason and constructive revision guidance.

My Posts includes draft/pending/published/rejected states and revision notices; each status has the appropriate actions. My Replies shows pending comments in context. Saved shows actual bookmarks. Profile/settings edits propagate to the demo company card. The notifications view is a **preview receipt log**, with explicit “No email sent” wording; it is not a claim that production in-app notifications are committed.

### Moderation

Use a compact, readable work area rather than a marketing page. Queue tabs for posts, comments and reports; filters for risk/state; count, submitter and date in rows. Selecting a row opens the exact submitted revision beside review history and the mock scan result. Wide view uses list/detail split; narrow view uses separate list and detail screens with a clear Back action.

High/mid/low are risk classifications, separate from publication states. Label simulated classifier outcomes and lexicon policy version. Approve/reject actions are explicit; reject/request-edit requires a reason, and moving to the next item must not accidentally activate the previous action. Record each action in local audit history. Moderator can inspect matched evidence; member sees only the category and correction hint.

Show failed/uncertain scan as pending and recoverable, never implicitly safe. The alternative mid-risk review scenario must have a visible policy label so it cannot be mistaken for the default client-requested block rule.

## 7. Motion specification

| Element | Motion | Accessibility/performance behavior |
|---|---|---|
| Hero globe | Slow rotation, subtle pointer parallax capped around 6px/3°, quiet brass route pulses. | Pointer interaction is decorative; no information requires it. Touch uses automatic restrained movement. Pause offscreen/hidden; cap rendering resolution. Static globe fallback when unsupported. |
| Hero entry | Short opacity/position settle, approximately 500–700ms; visual and text may enter with a modest offset. | Content visible by default. No blocking intro or timed CTA enablement. |
| Section transitions | 450–650ms ease-out; vary by purpose: forum list reveal, values emphasis, history depth shift. | Preserve native scroll. No scroll hijacking, forced snap or full-screen pinning across short-content pages. |
| Counters | Once on entering view, 1.0–1.4s, ease-out to the supplied final figure. | Reserve width; screen reader sees final text once, not every tick. Reduced motion shows final value immediately. |
| Milestones | Hover/focus selection updates detail in 180–250ms; background rotates slowly. | Touch tap and keyboard supported. Active detail remains while reading; text does not vanish between marker and panel. Mobile accordion/list may grow naturally. |
| Tabs, menus, dialogs | 150–220ms opacity/short translate. | Focus management immediate; motion never delays input. |
| Save/Useful/submit feedback | 120–180ms icon/state update; announced confirmation. | No confetti, exaggerated bounce or count animation that suggests trading activity. |

Honor `prefers-reduced-motion` for every animation and the currency ribbon. Use IntersectionObserver and browser CSS/canvas capabilities before adding dependencies. Lazy-load visual effects, keep layout stable and avoid constant full-page repainting. Marketing motion must never run behind the moderation queue.

## 8. Shared component and state contract

| Component | Required states |
|---|---|
| Link/button | Default, hover, focus, active, disabled and pending. Real href for navigation; disabled control explains why where necessary. |
| Input/select/textarea | Label, optional help, empty, filled, focus, invalid, disabled and submitting. Error adjacent and linked with `aria-describedby`. |
| Tabs | Selected/unselected, keyboard focus, panel relationship, arrow navigation; label and panel change together. |
| Dialog/drawer | Open/close, Escape, labelled title, focus trap, restored focus, safe mobile height/scroll; unsaved-form close confirmation when needed. |
| Accordion | Open/closed, keyboard activation and `aria-expanded`; full content reachable without hover. |
| Post/status badge | Draft, Under review, Published, Not approved, Removed; icon plus text, not color alone. Pending revision differentiated from a new pending post. |
| List/search | Normal, initial skeleton, filtered, loading next page, no results, empty dataset, error/retry, end of list. Skeleton reserved for actual/simulated load, never permanent filler. |
| Notification/toast | Success/info/error, screen-reader announcement; important errors persist inline. Do not rely on a toast as the only submission result. |
| Not-found/access state | Explain unavailable/private content without leaking it; link to relevant list or demo sign-in. |

Required microcopy, with equal English/Chinese coverage:

- Pending: “已提交，审核通过后将公开显示。” / “Submitted. Your post will appear after approval.”
- Rejected: “此内容未通过审核。请根据提示修改后重新提交。” / “This content was not approved. Review the guidance, edit and resubmit.”
- Mock enquiry: “演示提交成功，未发送任何消息。” / “Demo submission complete. No message was sent.”
- Empty search: “未找到符合条件的内容，请尝试其他关键词或清除筛选。” / “No matching results. Try another keyword or clear the filters.”
- Failed save: “暂时无法保存，内容已保留。请重试。” / “We could not save this. Your content is preserved. Try again.”

## 9. Assets and content integrity

| Asset/content | Existing evidence | Implementation requirement |
|---|---|---|
| Logo | Reference requests `cys-logo-white.png`, absent from the local reference directory. | Obtain approved light/dark lockups. For internal development only, use readable CYS text; final visual review must explicitly disclose any unresolved logo asset. Never show a broken image or invent a brand mark. |
| Globe/routes | Client HTML has an implemented globe and Singapore/China line composition. | Reuse the visual idea and inspect its dependency/assets before adapting. Package locally, no remote runtime dependency; do not claim arbitrary lines are actual CYS payment routes. |
| Corridor imagery | Existing `docs/assets/cys-signal-corridor-*` and `cys-corridor-hero.*`. | Inspect before use; treat as conceptual art, not photographs of actual CYS infrastructure. Preserve reference direction if these older assets conflict. |
| Partner identities | Original partner content contains placeholders. | Create polished fictional identities and illustrative stories, clearly labelled. Do not use actual bank logos to imply partner consent. |
| Use-case/article imagery | No approved role-specific photography established in this pass. | Acquire licensed/client-approved imagery or create explicitly illustrative art. Maintain an asset source/permission register. No gray boxes, stock handshakes or guessed image URLs. |
| Company facts | Supplied content inventory and older facts document. | Source wording is not fresh verification. Keep draft/proposed status for disputed figures; do not claim live rate, volume or licence verification. |
| Contact details | Supplied office/public contact copy exists; social channel values in older deck are placeholders. | Confirm before real linking. Preview uses simulated contact panels/receipts and fictional `.example` member emails. |
| Legal copy | FAQ/terms/privacy were missing in original brief. | Write finished illustrative preview text with an explicit review label; client approval remains required before production. |

Use actual supplied copy wherever available. Mock data permission applies to example community/partner content, not invented claims about CYS. The preview must remain polished when content is pending: use a labelled, meaningful illustrative example rather than Lorem ipsum or a fake testimonial. Decorative globe canvas has an accessible text equivalent where it communicates connection; other imagery gets contextual alt text or empty alt for decoration.

## 10. Responsive and verification requirements

- Desktop: preserve asymmetric hero, forum list/sidebar and moderator list/detail composition without making shorter public pages look empty.
- Tablet: shorten navigation and reorganize columns before text becomes narrow; Business audience content may stack while tabs remain visible.
- Mobile: readable single column, at least 44px touch targets, no required hover, usable long forms, safe-area padding for fixed elements, filters in a drawer, stable primary actions.
- At 320px and 200% zoom, headings wrap, tables become readable labelled rows or contained scroll regions, and no essential content is clipped. Do not solve overflow with `overflow-x:hidden` hiding content.
- On locale switch, preserve route/entity, query/filter state and unsaved user input; update document language/title and all UI messages. English text must not shrink below the type scale to imitate Chinese line lengths.
- Every route needs a useful document title and description. Prototype pages should be marked noindex; final canonical/OG/sitemap/robots and any structured data must use the actual deployment and approved facts, never fictional ratings or reviews.

The implementation handoff must include desktop and mobile screenshots for Home, timeline, Corridor, both business audiences, Individual, forms, forum list/detail/composer, member states and moderation; Chinese and English coverage; a keyboard/reduced-motion pass; clean console and asset checks; and results for the complete interaction matrix in [plan.md](plan.md). A beautiful homepage alone is not acceptance of this prototype.
