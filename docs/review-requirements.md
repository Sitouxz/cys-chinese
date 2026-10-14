# Review requirement matrix

Source task: https://app.clickup.com/t/9018732219/86eyf6gtu?comment=1100580000097331&threadedComment=1100580000098602

Implementation baseline: `bba9c3d`, the consulting/matchmaking revision on GitHub main. The October reply supersedes older branding requirements. The newer copy PDF supersedes financial-service positioning in the September design and membership documents. This remains a resettable local review mockup.

## Inputs read

- `First version design adjustment (1).pdf`: all nine pages, including the connection diagram and the final blank page.
- `CYS_V1文案去金融化清单 (1).pdf`: all eight pages and drawn annotations. Both copies attached to the latest reply are identical (SHA-256 `f9d96e182e720d6a89ec9c743ee9b07e0528a94dc68cc5b602fd162ed7ff1f70`).
- `Screenshot 2026-10-05 at 7.12.19 AM.png`: the entire globe-control row, not the forum or partnership CTA.
- Company and individual registration field PDFs: each one-page specification.
- Advertising pricing deck: all four slides and speaker notes.
- Six-tier membership deck: all three slides and speaker notes.
- Natural ranking deck: all seven slides, including validation examples.

## Branding, pages and motion

| Source | Requirement | Result |
| --- | --- | --- |
| Latest reply | Remove all CYS names and logos | Fixed: neutral Home/首页 identity; no old logos, favicon, rendered names, metadata or accessibility labels. Original reference files, unused assets and internal storage keys are preserved. |
| Latest screenshot | Remove hero control buttons | Fixed: complete arrow/zoom/pause/reset row removed; forum and partnership CTA links preserved. |
| Design p1; copy p2 | Real Earth, larger presentation, rotate/drag/zoom | Fixed: local Earth texture, display/DPR-aware Canvas, projected HTML labels, pointer rotation, keyboard controls, focused wheel zoom and touch pinch. |
| Latest reply | Correct Chinese hero typography/reveal | Fixed: exact approved copy; intact China/Southeast Asia phrase; consistent sans-serif typography and restrained phrase reveal. |
| Design p1 | Scroll animations are too fast | Fixed: existing 1.15-second section settling retained; About text follows scroll progress instead of an immediate whole-paragraph fade. Reduced motion exposes complete text. |
| Design p1, Skiper38 | Animated navigation | Existing dropdown/underline transitions verified, with keyboard and mobile navigation in the browser suites. No licensed component code copied. |
| Design p1 | Milestone number font | Existing sans-serif tabular counter retained and visually inspected. |
| Design p2 | Crowded services and homepage history | Existing interactive homepage timeline retained; service tabs keep distinct content and destinations. English grid overflow at 360px fixed. |
| Design p3, Skiper70 | About text reveal | Fixed: locale-aware word segmentation, Unicode fallback, punctuation/spacing preserved and one accessible reading copy. |
| Design p3 | About video | Pending client asset. Empty film frame hidden; no invented replacement media. |
| Design p4 | Blue Corridor introduction/partners | Existing navy introduction and partner section verified. Stories remain a distinct section. |
| Design p5 | Livelier Business/Individual photography | Pending approved client photography. Existing illustrations retained. |
| Design p7 | Contact form; FAQ/T&C | Existing connected demo forms and FAQ retained. Old operator telephone/email removed; replacement contacts and final operator terms remain pending. |
| Copy p1–2 | Remove remittance/FX/payment-service content and financial-institution navigation | Existing consulting/matchmaking revision retained and audited. Advertising payment remains explicitly simulated. |
| Copy p2–3 | Home hero, services and audience entrances | Approved Chinese copy and matching English retained; tabs, links and timeline verified. |
| Copy p4 | About and five history milestones | Client-supplied review copy retained with a notice that the new operator's history/licensing remains unverified. No new entity name invented. |
| Copy p5 | Corridor introduction and story heading | Existing updated bilingual copy verified. Stories remain labelled as demonstrations. |
| Copy p6 | Business partner introductions, supply-chain and compliance support | Existing updated bilingual content and consultation flow verified. |
| Copy p7 | Individual education, property/car/household support, industry insights | Existing service selection and contextual enquiry flow verified. |
| Copy p8 | Forum business-community positioning | Existing bilingual introduction and connected community flows retained. |

## Community behavior

| Source | Requirement | Result |
| --- | --- | --- |
| Company field PDF p1 | Required names/email/dial code/phone/company/seniority | Verified; seniority uses the five specified choices. Optional profile URL, industry, region and intent are bounded and retained in the private demo account record. |
| Individual field PDF p1 | Required names/email/dial code/phone; optional occupation/inquiry | Verified; company fields omitted. Optional fields retained privately. Registration grants Silver; verification/login remain simulated. |
| Both field PDFs | Other dial code | Existing editable international-code input retained and validated. Phone numbers and passwords are not persisted. |
| Tier deck slides 1–3 | Six badges, Bronze read-only, Silver actions | Verified. Higher demo tiers are staff-assigned; old financial account/deal qualification language is superseded. |
| Tier deck slide 3 | Diamond/Black transaction thresholds | Pending client replacement eligibility rules. No numeric thresholds invented. |
| Design p1; ranking slides 2–5 | Engagement, decay and cold start | Existing formula verified: `E = 1 + log10(1+views) + 1.5 log10(1+likes) + 2 log10(1+approved comments) + 2.5 log10(1+connection requests)`; `D = (1 + days since last activity)^0.2`; score `E/D + bonus`. |
| Ranking slides 4–5 | Activity refresh and rolling cold-start boundaries | Verified: latest qualifying activity controls decay; bonuses 20/10/5/0 at exact 24/48/72-hour boundaries. Refresh cannot renew the original publish-time bonus. |
| Design p8 | Sender consent, recipient acceptance, staff notification | Verified: pending/declined/accepted/introduced states, recipient-only decisions, duplicate prevention and one simulated staff outbox receipt. |
| Design p8 | Contact privacy | Verified in rendered request flows. Other members' phone/email remain undisclosed before and after acceptance. Local role switching is a demonstration tool, not production authorization. |
| Ad deck slides 2–3 | DAU phases, slot counts and daily prices | Verified: below 200: one slot/S$2; 200–799: three/S$8; 800–1599: three/S$16; 1600+: three/S$20 until CPC conditions are met. At exactly 2000 DAU, Phase 2 remains active. |
| Ad deck slides 2–3 | Phase 3 requires >2000 DAU and >=3 bidders | Verified; auction booking disabled with an explicit pending-rules explanation. Below three bidders, fixed-price Phase 2 remains the demo default. |
| Ad deck slide 3 | Promoted badge, scheduled booking, payment then review | Verified with simulated payment, staff approval, capacity enforcement and scheduled homepage visibility. |
| Design p1; ad deck | Click and connection-request conversion reporting | Verified end-to-end. Existing demo assumption: last member promotion click within seven days attributes the connection request. No real third-party analytics. |
| Tier slide 3; ad slide 4 | Phase 1 A/S/SS benefits | Verified as Platinum/Diamond/Black: 1 random day / 2 selected days / 3 selected days per month. |
| Ad slide 4 | Phase 2 allowances | Fixed: Platinum fixed allowance disappears from the form; Diamond/Black retain two/three days. |
| Ad slide 4 | Points redemption | Pending conversion rules. Explain the unavailable action; no points ledger or exchange rate invented. |

## Verification and limits

Run `npm run lint`, `npm test`, `npm run build`, and the browser, extended, runtime, revision, visual and review-browser scripts from `wireframe/`. The project has no typecheck script and remains JavaScript; no dependency or framework was added.

Browser evidence is written outside the repository through `CYS_QA_OUTPUT`. Playwright Chromium is used because the Browser plugin is unavailable. The responsive sweep covers 35 routes, both languages and 320/360/390/768/1024/1440px. The dedicated review script additionally exercises motion, DPR 2, drag/zoom, touch pinch, reduced motion, texture failure and staff phase/tier controls.

Final client inputs: new operator/name/logo/contact channels, legal text, confirmation of historical/licensing claims, film and photographs, higher-tier eligibility, points conversion and CPC auction rules. No production deployment, real payment/email/account service, client content publication or ClickUp comment submission is included.

Verified 2026-10-06: lint, 30/30 unit tests, production build and diff whitespace checks passed. Browser workflow suites passed 18 basic + 46 extended + 28 built-runtime + 15 revision + 34 review checks (141 total), with zero recorded errors. The 420-route responsive matrix passed with zero failures, including rendered legacy-brand checks. Built routes passed with remote requests denied. Tests for obsolete financial tabs and aliases were updated to the current neutral business page. Chromium emulation does not replace physical-device or assistive-technology review.

## Round 2 (12 Oct 2026)

Source: [threaded comment 1100580000185601](https://app.clickup.com/t/9018732219/86eyf6gtu?comment=1100580000097331&threadedComment=1100580000185601), `Round 2 Updates.zip` (`round2.pdf` 6 pages, three photos, an About photo and `Contact Us.docx`). The PDF was created on 23 Sep 2026, before the 30 Sep de-financialisation meeting and the 5 Oct rebranding instruction, so its screenshots show an older build. Where it conflicts with those newer decisions, the newer decision is kept and the item is listed as pending.

| Source | Requirement | Result |
| --- | --- | --- |
| p1 | Page-to-page animation too fast | Fixed: each route change now settles over 0.95s (fade and 28px rise). Disabled under reduced motion. |
| p1 | Layout does not stretch on wide screens | Fixed: content width grows to 1400px at 1500px+ and 1640px at 1800px+, with larger nav, hero and heading type. |
| p1 | Move Forum before Corporate User | Fixed: 首页 · 关于我们 · 中新合作走廊 · 华商论坛 · 企业合作 · 个人用户 · 联系我们. |
| p1 | Remove 查看全部 from dropdowns | Fixed on desktop and mobile navigation. |
| p1 | Hero items ticked (CTA, forum, globe) | No change requested. |
| p2 | Strike the forum preview heading and intro; promotion takes 1/3 | Fixed: heading and intro removed; promotion fills the left third at a larger size, list takes two thirds. Stacks on mobile. |
| p2 | Change the typeface of "40+" | Fixed: counters, timeline years and milestone year use a display serif (Didot / Bodoni 72 on macOS, Georgia fallback). |
| p2, Skiper70 | About text animation, both scroll directions | Fixed: About heading and paragraphs reveal word by word as solid boxes resolving into text, tied to scroll position so it rewinds on scroll up. |
| p3 | Remove the video section | Already removed in round 1. |
| p3 | Corporate page: show Financial and Cross-border users | Decided: not re-added. The 30 Sep brief removes 金融机构 from navigation (p2) and strikes the tab (p6) so a non-financial operator can run the site without the China blocking risk. The page shows the cross-border audience without tabs, and 企业合作 is now a direct link because its dropdown had a single item. |
| p4 | Do not hide 补充企业资料（选填） | Fixed: optional company fields are always visible. |
| p4 | Home audience photos | Fixed: business and individual photos added to both cards. |
| p5 | About page photo | Fixed: full-width city photo below the introduction. |
| p5 | Business page photo | Fixed: photo beside the page title. |
| p6 | Individual page photo | Fixed: photo beside the page title. |
| Contact Us.docx | Address, phone, email, WhatsApp, WeChat | Address and phone added. Decided: `enquiry@cys.com.sg` not published, because the old remittance brand's domain would tie the new non-financial operator back to CYS Global Remit. The email row links to the online enquiry form instead. WhatsApp and WeChat had no values, so no placeholder rows are shown. |

Photos were resized to 1600px JPEGs. Decided: old-brand marks were retouched out locally (no third-party service): the CYS Global Remit wall sign behind the handshake was replaced with rebuilt wall (grooves and lighting continued), and the shirt and mug logos in the consultation photo were removed. Originals are unchanged in ClickUp.

Verified 2026-10-12: lint, 30/30 unit tests and production build passed. Browser suites passed 18 basic + 46 extended + 28 built-runtime + 15 revision + 35 review checks (142 total) with zero recorded errors. The 420-route responsive matrix passed with zero failures, including rendered legacy-brand text checks. The review suite's reveal checks were updated for the new box-reveal markup.

## Round 2 QA pass (15 Oct 2026)

Source: [threaded comment 1100580000211526](https://app.clickup.com/t/9018732219/86eyf6gtu?comment=1100580000097331&threadedComment=1100580000211526). Every item in `round2.pdf`, `Contact Us.docx`, the 12 Oct screenshot, the copy PDF and the design-adjustment PDF was re-checked on the live deployment (its bundle hash matches `main`) at 375, 1440 and 1920px.

| Item | Live result |
| --- | --- |
| Page transition, wide-screen width, nav order, no 查看全部 | Pass: 0.95s route settle; 1640px content at 1920px; 首页 · 关于我们 · 中新合作走廊 · 华商论坛 · 企业合作 · 个人用户 · 联系我们 on desktop and mobile. |
| Forum preview, "40+" typeface, About reveal | Pass: heading/intro removed, promotion is 375 of 1180px (about one third); serif counter; reveal rewinds on scroll up. |
| Video, optional company fields, photos | Pass: no video; optional fields always shown; Home, About, Business and Individual photos present. |
| Corridor blue intro, contact address/phone | Pass. |
| Individual cards | Fixed: icons were left over from the remittance cards (house on 择校, shopping bag on 置业). Now a mortarboard for education, a house for property/household and a chart for insights; the number label no longer repeats the card title. |
| Globe texture load | Pass: textures load within 1s on desktop and mobile. |

Still open with the client: publishing `enquiry@cys.com.sg`, re-adding the 金融机构 tab (round2 p3 versus copy p2/p6), and the hero chip row and forum card ticked in copy p2 and round2 p1. Those screenshots come from a mockup that is not in this repository, so the elements were not invented.

Verified 15 Oct 2026: lint, 30/30 unit tests and production build passed. Browser suites passed 18 basic + 46 extended + 28 built-runtime + 15 revision + 35 review checks (142 total).
