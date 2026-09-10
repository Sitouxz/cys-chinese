# 08 — Draft client replies

Drafts for [86eyczra3](https://app.clickup.com/t/86eyczra3). Tone matched to the existing thread — the client writes casually ("Great, let's keep to that simple demo arrangement for now!") and so do we ("yes, we can do that!").

| Message | Answers | Status |
|---|---|---|
| **[Message 3](#message-3--reply-to-the-4-aug-comment)** ← current | Client's 4 Aug comment: flow, features, timeline | **Draft, not sent** |
| [Message 1](#message-1--moderation-colour-timeline-drafted-2-aug) | Client's 30 Jul moderation question + colour scheme + timeline | Draft — **partly overtaken by events**, see below |
| [Message 2](#message-2--sending-the-sitemap) | Sitemap sign-off | Draft, not sent |

> **On Message 1:** unclear whether it went out. The client's 4 Aug comment opens "Thanks for the quick chat earlier" and delivers the confirmed colour theme, so the colour item was settled on a call regardless. **Confirm with Redzuan what was actually sent before sending Message 3** — the two overlap on the moderation answer and the timeline reset, and the client should not receive the same reset twice.

---

## Message 3 — reply to the 4 Aug comment

Answers all three asks in [comment 90180244034227](https://app.clickup.com/t/9018732219/86eyczra3?comment=90180244034227). Backed by [09-moderation-flow.md](09-moderation-flow.md), [10-forum-features.md](10-forum-features.md), and [07-development-plan.md](07-development-plan.md) §8–9.

Hi Mr. Wan,

Thanks — colour theme and the word list both received, and the mockup is exactly what we needed. We've locked those colours in.

**1. How post approval will work**

Four steps, and the first two are automatic:

1. Someone posts. It goes to a review queue — nothing appears on the forum yet.
2. Your word list runs instantly. High-risk terms are rejected on the spot, before anyone spends time on them.
3. Anything that passes gets checked by AI for context and intent — the things a word list can't see.
4. Only what's still uncertain reaches your moderator. They approve or reject, the poster gets an email, and every decision is logged with its reason.

So the guarantee you asked for holds — nothing goes live unchecked — but your team only reads the small number of posts that genuinely need a human.

**One change we'd recommend, on the mid-risk words.** You asked us to block high and mid outright. High risk, agreed — straight rejection. But mid risk should go to the review queue instead of being blocked, and the reason is in your own file: every mid-risk row says 需结合上下文判断 — *needs context to judge.*

Here's the problem in practice. 换汇 is on the mid-risk list. That's your own core service. A post saying 我们提供合规换汇服务 would be rejected automatically and the business would never know why. Same for 发票, 佣金, 代付 — everyday words for the cross-border traders this forum is built for. And because the matching can't see negation, 我们严格遵守反洗钱规定 gets blocked by 洗钱 sitting inside 反洗钱.

Sending mid risk to the queue gives you the identical guarantee — still checked before it's live — without quietly losing good posts. We'll build it as a setting either way, so you can switch it to a hard block anytime if the volume proves annoying. Nothing waits on this.

**Two small things on the file:** three of the 220 words arrived with corrupted characters. We recovered two from your own notes column (大额换汇 and 赌场). The third we've read as 报税 but we've left it switched off until you confirm. If you can re-export the spreadsheet, that would rule out anything subtler we haven't spotted.

**2. Forum features**

Recommended for launch: register/login, company profiles, posting, editing, comments and one level of replies, save/bookmark, follow a topic, share, search with filters by industry/market/what-they're-looking-for, and a "Connect" button so people can actually contact each other.

On likes and dislikes:

- **Likes — yes**, but labelled 有用 / *Useful* rather than a thumbs-up. On a business board "this is useful to me" means something; "I approve" doesn't. It also gives your 热门话题 module a real signal to rank on, which it currently doesn't have.
- **Dislikes — we'd recommend against.** Your word list flags 骗子 and 被骗了 as risky precisely because public accusations against businesses are a liability. A visible dislike count is that same risk, with a number attached, appearing instantly on someone's listing without review. And since the businesses here compete with each other, it's a one-click tool for knocking a rival out of the trending list.
- **Instead: 举报 / Report** — private, goes to your moderator, gives users the same outlet and gives you something you can actually act on.

We'd also hold off on private messaging at launch. It's a second content channel needing its own moderation, and your word list already treats 私聊 and 加微信 as risks — so an unmoderated private inbox would sit awkwardly next to that.

**3. Timeline — two months, forum included**

| Stage | Dates | What you get |
|---|---|---|
| **Lofi wireframes** | 10–23 Aug | Every page's layout, before any visual design |
| **Hifi design** | 24 Aug – 6 Sep | Full designs in your colours, CN + EN |
| **Development** *(no forum)* | 7–20 Sep | A working website you can click through |
| **Forum features** | 21 Sep – 4 Oct | Forum working end to end, review queue included |
| **UAT + QC** | 5–9 Oct | Your review, our testing, final fixes |
| **Go live** | **9 October 2026** | **Website and forum, live together** |

That is inside the 2–3 months we quoted you on 27 July.

Worth being straight about one thing: this is tighter than our original plan, which had the forum coming after the website. It works, and it depends on three things:

- **Sign-offs within about three working days.** Each stage feeds the next, so a week waiting on approval is a week on the end. We need you at four points: sitemap this week, wireframes by 26 Aug, designs by 9 Sep, and final approval in UAT week.
- **One round of feedback per stage.** We've allowed for a proper round on the wireframes and one on the designs. A second round is completely fine — it just moves the date, and we'll tell you by how much on the day rather than at the end.
- **The forum launches with the essentials.** Accounts, posting, comments, the review queue, search, 有用 and 举报 are all in. Image uploads, private messaging and following other members come after launch, once there are real members using it.

**What we need from you**

1. Who at CYS will handle the review queue? They'll need to read Chinese. This is the one thing that could hold up the forum launch.
2. Comments checked before they go live too, or posts only?
3. Is the forum Chinese-only, or Chinese and English? Your word list is Chinese-only — if English posts are allowed, we'd need an English list too, or the checking only really covers half the forum.
4. Happy with the mid-risk and dislikes recommendations above?

One for your compliance team, not urgent: the AI checking step uses an outside provider. We'll send the provider details and their data agreement across for sign-off well before the forum goes live.

### Chat-length version

> Colours and word list received, thanks — colours locked in. **Flow:** post → queue → your word list rejects high-risk instantly → AI checks context → only the uncertain ones reach a human → poster gets an email, every decision logged. Nothing goes live unchecked. **One recommendation:** send mid-risk to the queue rather than blocking it — 换汇 is on that list and it's your own service, so 我们提供合规换汇服务 would be auto-rejected. Same guarantee, no good posts lost, and we'll make it a switch either way. **Features:** posting, comments, save, follow, search + filters, Connect button, and likes as 有用/Useful. We'd skip dislikes — public accusations on business listings are the same risk your 骗子 entry exists to control, and competitors would use it. 举报/Report instead. **Timeline:** Lofi 10–23 Aug, Hifi 24 Aug–6 Sep, Dev 7–20 Sep, forum 21 Sep–4 Oct, UAT+QC 5–9 Oct — **website and forum live together 9 Oct**, inside the 2–3 months we quoted on 27 July. It's tight, so it needs sign-offs within ~3 working days and one feedback round per stage; the forum launches with the essentials and extras like image uploads and private messaging follow after. Need from you: sitemap sign-off this week, who staffs the review queue, are comments checked too, and is the forum CN-only or bilingual?

### Notes for internal review

**Deliberate choices:**

- **Led with the flow, not the pushback.** The client asked three questions; answering them first earns the right to disagree on mid risk.
- **换汇 is the whole argument.** One example the client cannot argue with, because it's their own product. Everything else is supporting detail.
- **The switch (`MID_RISK_ACTION`) is stated as a switch.** It removes the risk that this becomes a blocking debate — we build, they decide later.
- **No vendor name again.** Same reasoning as Message 1: naming Z.ai invites procurement before concept approval.
- **The bilingual gap is raised as a question, not a change order.** It may genuinely be a scope increase; find out what they intend before pricing it.
- **There is no longer a timeline reset in this message.** Earlier drafts conceded a December forum date and ~7 weeks past the 3-month mark. The plan has since been compressed (see [07](07-development-plan.md) §8): website + forum both land 9 Oct, inside the quoted window, so there is nothing to reset. **If Message 1 was already sent with the December date, this message needs one line acknowledging the change** — silently improving a date the client has already been given reads as though the first number was padded. Ask Redzuan first.
- **The three conditions are stated as conditions, in writing.** Three-day sign-offs, one feedback round, forum launches with essentials. This is not hedging — the compression is only survivable if those hold ([07](07-development-plan.md) §8a), and putting them in the client's hands now means a slip is visibly a shared decision rather than a missed date.
- **What is deliberately not said:** that the website alone is complete on 20 Sep and could ship without the forum. That is our internal fallback ([07](07-development-plan.md) R11), and offering it now invites the client to treat 9 Oct as soft.

**Left out:**

- Lexicon governance/versioning ([09](09-moderation-flow.md) §6) — correct engineering, no client decision attached yet. Raise when the moderator UI is specced.
- The stack, the nested-match and single-character 枪 issues, PGroonga. Implementation detail.
- That their file's 8 pattern rules are its strongest part. True, but reads as marking their homework.

**Check before sending:**

- **What did Message 1 actually cover?** Ask Redzuan. Do not send the timeline reset twice.
- Owen should read this — the moderation question was addressed to him directly.
- Reply on whichever channel the client used; Redzuan has been relaying between a direct thread and ClickUp.

---

## Message 1 — moderation, colour, timeline (drafted 2 Aug)

> **Partly overtaken by events.** The colour paragraph is moot — the client confirmed the theme on 4 Aug after a call. The moderation answer here predates their word list, so [Message 3](#message-3--reply-to-the-4-aug-comment) is the current version. Retained because it is unclear whether this was sent, and the timeline reset must not go out twice.

Hi Mr. Wan,

Yes — we can do this, and checking posts before they go live is the right call for this kind of content.

How it'd work: someone posts → it goes to a review queue instead of straight to the forum. An automated check clears the routine business listings, blocks obvious spam, and flags anything sensitive for a human. Your moderator only looks at the flagged ones. The poster sees "pending review" and gets an email once it's approved.

So your team isn't reading every post — just the ones that actually need a decision. Later on we can let regulars through automatically once they've built a track record, without losing the checked-before-it's-live part.

Two things we need from you:

- Who at CYS handles the review queue?
- Comments checked too, or just posts?

The automated bit uses an AI service — we'll send your compliance team the provider details to sign off before we build it.

**Colour scheme:** palette options to you by Friday 7 Aug. Nothing starts before you're happy with it.

**Timeline:** the moderation step adds real work that wasn't in our original 2–3 months. Demo still lands early October as planned — the forum now goes live around December. Flagging it now rather than in November.

---

## Message 2 — sending the sitemap

Send with [CYS-Chinese-Sitemap-Diagram.pdf](CYS-Chinese-Sitemap-Diagram.pdf) attached (or the 10-page [CYS-Chinese-Sitemap.pdf](CYS-Chinese-Sitemap.pdf) if they want the full working document).

Hi Mr. Wan,

Sitemap attached — every page on the new site, in both languages, with the web addresses mapped out.

Short version: **14 pages for the demo** (关于我们, 中新合作走廊, 企业合作, 个人用户, 联系我们, plus FAQ and the legal pages), and **9 more for the forum** in phase 2. Everything exists in Chinese and English.

Two things we had to make a call on, and we'd like your nod:

1. **The header and footer don't currently agree.** In the deck, the footer files 伙伴故事 and 星威论坛 under 华商社群, but the header files them under 中新合作走廊 and 企业合作. We've gone with the header version so the menu and the web addresses line up.
2. **华商社群 appears as a footer heading but has no page.** We've kept it as a heading only. If you'd like it to be a real page, tell us now — easy to add at this stage, much harder once we're building.

And one question: 个人用户 is currently one page with three sections (学费生活费 · 兑换外币 · 境外投资). Keep it as one page, or split into three?

Once this and the colour scheme are signed off, we start on the wireframes.

### Chat-length version

> Sitemap's attached — all the pages, both languages, URLs mapped. Two calls we made that need your OK: we've followed the header menu structure over the footer one (they disagreed in the deck), and kept 华商社群 as a heading rather than a page. One question — 个人用户: one page with three sections, or three separate pages? Once this and the colours are approved we start wireframes.

---

### Notes for internal review — Messages 1 & 2

**Left out on purpose:**

- **The AI vendor's name.** Naming Z.ai / GLM invites a procurement conversation before they've approved the concept. One line committing to send the provider + DPA for compliance sign-off is the honest position without derailing the approval.
- **The stack.** No client value; invites second-guessing.
- **"Trust tiers"** as jargon — described as "let regulars through automatically". The real question is whether they'll accept *any* relaxation of pre-publication review, and jargon makes that harder to say no to.

**Kept:**

- **The two questions.** Both block Phase 2 design and both get harder to ask later.
- **The timeline reset.** The 2–3 month figure was quoted 27 Jul; moderation landed 30 Jul. A paragraph now, or a problem in November.

**Check before sending:**

- Does Friday 7 August work for the palette?
- Owen is quoted implicitly — the client addressed the question to him directly. Confirm he's read it.
- Redzuan has been relaying between a direct client thread and ClickUp — reply on whichever channel the question came through.
