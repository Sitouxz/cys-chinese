# Verification — CYS bilingual prototype

Verified locally on 11 September 2026. Scope: the interactive mock prototype in `plan.md`, with the visual system in `design.md`. No production integration or external publication is claimed.

## Results

| Check | Result and evidence |
|---|---|
| Lint | `npm run lint` — exit 0, no reported errors |
| Service/scanner tests | `npm test` — exit 0; 16/16 pass, including the supplied lexicon regression fixtures under explicitly separated policies |
| Production build | `npm run build` — exit 0; Vite generated `index-Br2Lrv3L.css` and `index-DsHf_mqa.js` |
| Main UI workflow | `node tests/browser.mjs` — exit 0; [18 checks](browser-workflows.json), no uncaught browser errors |
| Extended UI/keyboard workflow | `node tests/extended.mjs` — exit 0; [46 assertions](extended-workflows.json), including 22 consecutive Tab-focus checks in the mobile dialog |
| Built-app runtime | `node tests/runtime.mjs` — exit 0; [28 checks](runtime-smoke.json), third-party requests denied, no external dependency requests, failed required requests, console errors or uncaught errors |
| Responsive matrix | `node tests/visual.mjs` — exit 0; [290 page/locale/viewport checks](responsive-matrix.json), zero overflow/broken-image/runtime failures |
| Typecheck | Not applicable: existing JavaScript/JSX stack retained, no TypeScript configuration or typecheck script introduced |
| Git/deployment | Workspace is not a Git repository. No commit, push, hosted preview, DNS change or production deployment performed |

Viewport matrix: 29 route/layout representatives × Chinese/English × 1440×900, 1024×768, 768×1024, 390×844 and 320×844. Desktop/mobile viewport captures and longer-page captures are in [screenshots](screenshots). Representative layouts were also inspected visually with `view_image`: both Home locales, timeline, Corridor, both Business audiences, Individual, Contact, forum and moderation.

Browser verification began in the in-app browser, including the guest Save → sign-in → resumed action. Fixed-size captures used bundled Playwright/Chromium after the in-app browser's viewport selection proved inconsistent. The reflow stress check uses 640 CSS pixels, equivalent to a 1280-pixel viewport at 200% browser zoom; it does not claim a physical-device or OS zoom test. Chinese composition was tested with browser composition events, not a physical IME keyboard. No full assistive-technology certification or Safari/Firefox/device-lab coverage is claimed.

## Acceptance evidence

| Requirement | Verified implementation |
|---|---|
| Layout and content | Home order is Hero/currency → Forum → Values → Services → History → audiences → Contact/footer. About includes all five milestones; 2030 says Outlook. Corridor separates fictional partners and six illustrative articles. Business has two audience panels; Individual has three illustrated use cases. |
| Motion and keyboard | Local canvas globe, pointer response, observed counters, section transitions; reduced-motion style tested. Timeline hover/focus/click and arrow-key tab selection tested. Mobile dialog Tab containment, Escape and focus return tested. |
| Language and routes | Both locales captured; composer input survives locale switch. All ten required legacy section aliases tested in the built app. Refresh/back preserve search queries. Unknown/private routes render recovery views. |
| Forum | Search, combined industry/market/intent filters, sort/pagination controls, empty results, simulated loading/error/retry, profiles and contextual links share one store. Counts derive from approved records. |
| Moderation | Submit → pending privacy → approval → Home visibility → edit with old public version → rejection → correction → approval tested through UI. Comment approval/privacy and report removal/restoration tested. Service tests cover exact revision validation and one-level reply limits. |
| Policy | High/mid blocking, low/unknown/scan-failure queueing, English manual review, normalization and the explicitly alternative mid-review policy covered by service/scanner tests. Legacy `must_not_block` expectations remain separately labelled. |
| Ownership/state | Guest/member/moderator gates, other-member privacy, independent toggles and soft-delete/undo tested. Reset preserves an unrelated storage key and reseeds Guest/Chinese. Blocked storage shows the in-memory warning. |
| Forms | Boundary length/whitespace/structured-ID/consent checks; stable accessible field labels and linked errors; registration/verification refresh, forgot/reset/expired states, profile save/cancel, Chinese composition, same-tick duplicate submit and failure/retry tested. No entered passwords or enquiry contact fields retained. |
| Runtime/content honesty | Built app needs only local files, no remote fonts, AI or backend. Noindex/robots supplied. Fictional profiles/stories/badges and illustrative legal copy are labelled; supported currencies have no fabricated rates. |

## Visual comparison and mismatch ledger

Accepted direction: [`design.md`](../../design.md), governed by [`plan.md`](../../plan.md), using the supplied [`CYS_LandingPage_Mockup.html`](../client-inputs/CYS_LandingPage_Mockup.html) as the visual reference rather than its obsolete section order. The [rendered reference](screenshots/reference-desktop.png) and [latest Chinese implementation](screenshots/home-1440-zh.png) were opened with `view_image` in the same final QA pass. Native 1440×900 and 390×844 implementation captures were checked, with narrower/tablet bounds covered by the matrix.

| Comparison point | Final result / intentional difference |
|---|---|
| Palette | Deep navy hero/header, warm ivory pages and brass accents faithfully follow the accepted palette. No gray wireframe blocks remain. |
| Typography | Chinese serif marketing display and restrained English serif headings preserve the institutional direction. Community/member/moderator titles use the compact sans hierarchy specified in the design. Body and controls remain sans-serif. Local font fallbacks are intentional. |
| Above-the-fold copy | Chinese headline preserves the reference wording: “连接中国与东南亚的可信支付桥梁，启迪跨境商业新可能。” Deliberate line breaks/brass emphasis differ. Supporting copy and topic titles were rewritten from the supplied brief/fictional listings; the old unverified financial-volume claim was not promoted into the hero. English is a complete locale, not clipped to Chinese line lengths. |
| Hero composition | Left editorial copy, two clear actions and right globe retain the reference relationship. The globe is deliberately bounded, fully visible and locally drawn; the reference's oversized clipped Three.js sphere is not reproduced. This follows the design's readable, responsive globe direction. |
| Route / asset treatment | Brass Singapore–China connection, geographic grid and small coordinate labels preserve the technical visual idea. Schematic routes do not claim actual CYS payment coverage. Existing corridor art is labelled illustrative; use cases use local line illustrations. |
| Container / spacing | Shared 1180px desktop container, aligned header/hero/body edges, deliberate section spacing and compact editorial/list treatment. Mobile stacks content without shrinking essential copy. |
| Homepage ordering | The supplied HTML's order is intentionally superseded by the latest approved Forum-before-Values order. The currency strip is the hero transition, not a live-price module. |
| Header / logo | Broken reference image removed. Readable CYS text is the explicitly permitted internal-development treatment. Approved logo lockups remain an external content requirement. |
| Supporting layouts | Five timeline milestones, two Corridor sections, distinct audience panels, three Individual uses, long forms, forum/sidebar and moderator list/detail were inspected as separate layouts. Mobile filters and navigation use dialogs. |

Material issues fixed during QA: hero first-viewport height, hidden hero-search input styling, awkward sort-label wrapping, tablet globe overflow, 320px industry-grid overflow, tiny list metadata, community heading hierarchy, field accessible names after errors, tab/panel relationships, verification refresh state, mobile focus escape, and saved-list empty recovery. Subsequent responsive/workflow checks passed.

The implementation was faithfully verified against the accepted `design.md` direction and its documented adaptations of the supplied reference. No known material, fixable prototype visual mismatch remains from this QA pass. This is an internal-preview assessment, not client sign-off. Approved logo files, final content/imagery rights and compliance approval remain explicit production inputs; see the [preview guide](../PROTOTYPE-GUIDE.md).

## Build identity

- CSS SHA-256: `B987F60652AE1966DDEC09D7BD8E674594717D0A8246E754E577DB8AC5DAC473`
- JavaScript SHA-256: `710F111CAFF8D4AA3F02813EDF9CB0788CC10F7F3E3D92542A32865E7B2469C7`
- The temporary reference review page and one-off inspection/edit scripts were removed from the deliverable. Original source reference and preserved Lofi remain in `docs/`.
