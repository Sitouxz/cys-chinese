# CYS interactive prototype — preview guide

Implemented from `plan.md` and `design.md` in the existing React/Vite app. This is a bilingual, responsive local demonstration with fictional community data. It does not transfer money, provide live currency quotes, send messages, create real accounts or call AI services.

## Run and review

From the `wireframe` directory:

```powershell
npm ci
npm run dev -- --port 5173
```

Open [Chinese Home](http://127.0.0.1:5173/home?lang=zh), [English Home](http://127.0.0.1:5173/home?lang=en), or [Preview controls](http://127.0.0.1:5173/preview?lang=en).

The checked production build can also be served with `npm run build` then `npm run preview -- --port 4173`. Use an HTTP server with an SPA fallback; opening `index.html` directly from disk is not supported.

### A complete review journey

1. Open Preview controls and select **Reset all demo data**. Confirm the dialog. This restores Guest, Chinese and the fixed sample records; unrelated browser storage remains intact.
2. Browse Home, About history, Corridor partners/stories and both Business audiences. Use EN/中文 in the header to compare languages. Timeline milestones respond to pointer, keyboard and tap.
3. Open a forum listing and select Save as Guest. Continue through demo sign-in. The original save resumes on the original listing.
4. Select Member one in Preview controls. Publish a new listing using fictional business information. English/mixed text always enters manual review. Chinese high/mid-risk submissions are blocked by the default policy; low, uncertain and failed scans queue.
5. Select Moderator. Open the submitted revision, inspect its text, classification and evidence, and approve it. As Guest, find it in the forum, Home and its company profile.
6. Edit it as its owner. The old approved text stays public during review. Reject the new revision with a reason, correct it and resubmit; approving the corrected revision replaces the public version.
7. Submit a comment or reply; approve it from the comment queue. Report an approved post; removal requires a moderator decision and reason, and restoration is explicit.
8. Try Useful, Save, topic Follow, profile preferences, receipts, delete/undo, contextual Connect and enquiry/feedback. They all affect the same local store.

### Roles, accounts and scenarios

| Control | Behavior |
|---|---|
| Guest | Approved public content only; member actions enter demo sign-in |
| Member one | `member1@cys.example`, shared password `DemoPass123`; owns seeded drafts, pending and rejected examples |
| Member two | Separate owner to test private content and per-member toggles |
| Moderator | Exact revision review, comment queue, reports and audit history |
| Register | Creates a local fictional identity, then an explicit simulated verification step; no password is retained. After verification use the submitted fictional email with `DemoPass123`. |
| Forgot/reset | Local receipt and reset/expired-link states; never sends mail or changes a real password |
| High / Mid / Low / Uncertain / Scan failure | Deterministic reviewer-controlled classification. English remains manual review in every classification scenario. |
| Alternative mid-review | Explicit alternate policy; does not silently replace default mid-risk blocking |
| Fail next save | Fails once, retains fields, and returns to default so retry can succeed |
| Empty / Loading / List error | Forum recovery demonstrations; clearing or retrying restores normal records |

Scenario selection persists for the browser session until changed (the one-shot failure and loading scenarios return to default). The classification selector describes the next submission; leaving it selected also applies it to subsequent submissions. No numeric currency scenario is offered: all eight currencies are supported-currency labels only.

## Route index

All routes accept `lang=zh` or `lang=en`. Forum search/filter/sort/page, audience tabs, help tabs, auth states and section anchors are shareable and refresh-safe.

| Surface | Routes |
|---|---|
| Home | `/home`, `/` |
| About | `/about#intro`, `/about#history`, `/about#culture` |
| Corridor | `/corridor#partners`, `/corridor#stories`, `/corridor/stories/story-1` through `story-6` |
| Audiences | `/business?audience=financial`, `/business?audience=business`, `/individual` |
| Contact | `/contact?tab=details`, `?tab=enquiry`, `?tab=feedback`; contextual `audience`, `topic`, `post` queries |
| Help | `/legal?tab=faq`, `?tab=terms`, `?tab=privacy` |
| Auth | `/auth?mode=login`, `register`, `forgot`, `verify`, `reset`; expired reset: `&expired=1` |
| Forum | `/forum`, `/forum/search`, `/forum/categories`, `/forum/category/matching`, `trends`, `policy`, `analysis` (numeric 1–4 supported) |
| Listings | `/forum/post/1` through `/forum/post/32`, `/forum/new`, `/forum/edit/:id`, `/forum/report/:id` |
| Companies | `/forum/members`, `/forum/member/1` through `/forum/member/8` |
| Rules | `/forum/rules` |
| Member | `/me/forum`, `/me/posts`, `/me/replies`, `/me/saved`, `/me/notifications`, `/me/settings` |
| Review | `/moderation?tab=posts`, `comments`, `reports`, `history` |
| Controls | `/preview` |

Legacy aliases: `/about/intro`, `/about/history`, `/about/culture`, `/corridor/partners`, `/corridor/stories`, `/business/financial-institutions`, `/business/cross-border`, `/contact/details`, `/contact/enquiry`, `/contact/feedback`, `/corporate`, `/faq`, `/terms`, `/privacy`, `/login`, `/register`. Unknown routes and IDs have recovery views. Private record URLs do not expose pending text to another role.

## State and content register

- One local mock-service boundary validates inputs and owns all mutations. Store: `cys-hifi-demo-v1`; locale: `cys-hifi-demo-v1-locale`; session: `cys-hifi-session-v1`; scenario: `cys-hifi-session-v1-scenario`.
- Eight fictional company profiles and partner identities; 24 approved bilingual listings, two drafts, three pending, two rejected, one removed; three featured. Eighteen published comments include six one-level replies, with two pending and one rejected. Six finished illustrative stories, four reports and eight record-linked receipts.
- Fixed fixture date: 10 September 2026. New actions advance the deterministic local clock. Member-entered text is displayed in its original language, never falsely presented as translated.
- Passwords and enquiry contact/message fields are not persisted. Enquiries retain context and receipt ID only. Use synthetic details even though data stays local. Storage-denied browsers use memory with a visible refresh warning.
- Role gating is demonstration behavior, not a security boundary. Users can inspect or change local browser data. Production auth, authorization and service integration remain separate work.

| Source / asset | Use and status |
|---|---|
| `docs/client-inputs/CYS_LandingPage_Mockup.html` | Supplied visual reference: navy/brass/ivory, serif display, technical globe and Singapore/China route idea. Its outdated section order is superseded by the plan. |
| `docs/03-content-inventory.md` | Supplied company, service and history copy. Historical supplied statements are not fresh verification of licence scope or financial facts. |
| `docs/client-inputs/CYS_Wireframe_Feedback_EN.docx` | Client layout/motion corrections reflected in Home order, timeline, Corridor split and audience layouts. |
| `docs/assets/cys-signal-corridor-light-v2.jpg`, `cys-signal-corridor-dark-v2.jpg`, `cys-corridor-hero.jpg` | Existing project conceptual artwork, copied locally under `wireframe/public/assets`. Used as illustrative art, not real CYS infrastructure. Client approval/usage rights require confirmation before external publication. |
| Canvas globe and SVG use-case drawings | Locally rendered schematic illustrations, no remote dependency. Route arc is decorative, not a verified payment-network map. |
| Company / partner / story / badge examples | Fictional demo content explicitly labelled. No real bank logo, testimonial or unapproved affiliation. |
| FAQ / terms / privacy | Finished illustrative preview copy, explicitly marked for review. |
| Logo | Approved logo file is still missing. Readable CYS text is used for internal development; it is not a replacement brand asset. |
| Fonts | Local system fallback stacks; no remote font loading. Rendering varies with fonts available on the review device. |

Original Lofi source is preserved under `docs/lofi-baseline`. The supplied plan and design remain intact as the requirements record.

## Verification and production handoff

See [verification report](verification/README.md), [responsive matrix](verification/responsive-matrix.json), [main workflows](verification/browser-workflows.json), [extended workflows](verification/extended-workflows.json), and [screenshots](verification/screenshots).

Run `npm run lint`, `npm test`, and `npm run build`. Browser scripts are `node tests/browser.mjs`, `node tests/extended.mjs`, , `node tests/visual.mjs`, and `node tests/runtime.mjs` (built preview at port 4173) with the dev server running. They use an available Playwright installation; set `CYS_PLAYWRIGHT_PATH` to its installed module path outside the Codex bundled environment. No TypeScript tooling was introduced and no typecheck script exists.

Before production: CYS supplies approved logo lockups, final partner/story imagery, contact channels and bilingual copy. Its compliance/policy owner approves licence/service claims, legal/consent copy, moderation policy including English and mid-risk treatment, verification badges and notification behavior. Public Dislike remains a policy decision. Neu Entity implements real identity/access control, database/CMS, messaging, search, abuse limits, monitoring and deployment-specific metadata. Hosting, DNS and production publication require separate authorization. No external publication or communication was performed by this implementation.

