# 10 — Forum features, user-facing

Answers the client's second ask in [comment 90180244034227](https://app.clickup.com/t/9018732219/86eyczra3?comment=90180244034227) (4 Aug 2026):

> and the features of the forum from the users (like like, comment, dislikes, etc)

Nothing in the deck or the HTML mockup specifies these — the mockup's forum block is a teaser (热门话题 / TRENDING / 实时更新 LIVE) with no post UI. So this is a proposal, not a record of a decision.

**Client-facing diagram:** [CYS-Chinese-Forum-Features.png](CYS-Chinese-Forum-Features.png) / [.pdf](CYS-Chinese-Forum-Features.pdf) — 4200×5352 at 3×, in the confirmed palette. Shows the anatomy of a post with every user action on it, the full feature matrix marked ✔ launch / ↗ later / ✕ recommend against, and the three author-facing states. Regenerate after editing [forum-features-diagram.html](forum-features-diagram.html):

```bash
python scripts/render_diagram.py docs/forum-features-diagram.html docs/CYS-Chinese-Forum-Features
```

---

## 1. The design constraint that decides everything else

The deck's four sample posts are all the same shape: **"I am this business, I want to meet that kind of partner."**

> 我的餐饮品牌叫CYS茶餐厅，提供鸡饭和中式炒菜。希望可以接触到新加坡F&B行业的经销商
> 我是一家服装生产商…希望可以接触到新加坡服装行业的品牌
> 我是做东南亚经销商的…希望可以遇见有潜力的品牌
> 我正在进行跨境贸易，主营玩具类产品。需要一位合作投资方

The client's own mockup calls it 一个双向的商业对接社区，而非单纯的资讯站 — *a two-way business-matching community, not just a news feed.*

**This is a business directory with discussion attached, not a discussion forum.** Every feature below is judged on one question: does it help a real business get found by the right counterparty? Reddit-style engagement mechanics optimise for something else — attention on opinions — and importing them wholesale would work against the stated purpose.

## 2. Recommended feature set

| Feature | CN / EN label | Recommend | Phase | Notes |
|---|---|---|---|---|
| Register / log in | 注册 \| 登录 | **Yes** | 1 (routes) / 2 (gated) | Header already shows it on every deck screen |
| Create post | 创建帖子+ / Post+ | **Yes** | 2 | Structured fields, not a blank box — see §3 |
| Edit own post | 编辑 / Edit | **Yes** | 2 | Edit re-enters the review queue |
| Delete own post | 删除 / Delete | **Yes** | 2 | Soft delete; audit trail must survive |
| Comment | 评论 / Comment | **Yes** | 2 | Pre-moderated — see §5 |
| Reply to comment | 回复 / Reply | **Yes, 1 level** | 2 | Flat replies. Deep nesting suits argument, not enquiry |
| **Like / interested** | 有用 / Useful · 感兴趣 / Interested | **Yes — reframed** | 2 | §4 |
| **Dislike** | 不喜欢 / Dislike | **No — recommend against** | — | §4. Replace with Report |
| Report / flag | 举报 / Report | **Yes** | 2 | Private to moderators. This is the real "dislike" |
| Save / bookmark | 收藏 / Save | **Yes** | 2 | High value on a directory — "I'll come back to this supplier" |
| Contact / connect | 联系对方 / Connect | **Yes** | 2 | §6. The actual conversion action |
| Follow a poster | 关注 / Follow | Later | 2.5 | Wait for enough posters to make a feed |
| Follow a category | 关注板块 / Follow topic | **Yes** | 2 | Cheap, and drives return visits |
| Share | 分享 / Share | **Yes** | 2 | Copy link + WeChat/LinkedIn. No third-party JS SDKs (China constraint) |
| Search | 检索用户/产品/服务 | **Yes** | 2 | Already a deck requirement. PGroonga — see [07](07-development-plan.md) §6 |
| Filter by industry / market / intent | 筛选 / Filter | **Yes** | 2 | The structured fields make this work |
| Sort: newest / 热门 | 最新 · 热门 | **Yes** | 2 | 热门 needs an engagement signal — §4 |
| View own submissions + status | 我的帖子 / My posts | **Yes** | 2 | §5. Non-negotiable with pre-moderation |
| Notifications | 通知 / Notifications | **Yes** | 2 | Email at launch; in-app later |
| Profile page | 个人主页 / Profile | **Yes** | 2 | Company card, not a social profile — §7 |
| Direct messages | 私信 / DM | **No, not at launch** | — | §6 |
| Rich text / images in posts | — | **Images later** | 2.5 | Every upload is a moderation surface with no word list to check it |

## 3. Post composition — structured, not a blank textarea

The four sample posts are formulaic, and that is an asset. Capture the structure at entry:

| Field | Example from the deck |
|---|---|
| Business type / industry | 餐饮 F&B · 服装制造 apparel manufacturing · 日化经销 household & personal care |
| Product or service | 鸡饭和中式炒菜 · 印花服装设计以及生产 · 玩具类产品 |
| Markets operated in | 新加坡 · 马来西亚 |
| **Intent** — what they're seeking | 经销商 distributor · 品牌 brand · 投资方 investor · 合作伙伴 partner |
| Free-text introduction | the prose paragraph |

Three payoffs: 检索用户/产品/服务 becomes a real query instead of keyword soup; filters work; and the moderation classifier gets a cleaner signal, because a post whose structured fields say *"apparel manufacturer seeking brands"* and whose body discusses 换汇 is visibly incongruent.

## 4. Likes yes, dislikes no

**Likes are needed** — but not as approval. The client's own mockup promises a 热门话题 (trending) module, and trending needs a ranking signal. Without one, 热门 can only mean "recent", which the 最新 sort already covers.

Reframe the label from 点赞 (*praise*) to **有用 / Useful** or **感兴趣 / Interested**. On a matching board, "I'm interested in this supplier" is a business signal with a use; "I approve of this opinion" is not. It also feeds trending honestly and tells a poster whether their listing is landing.

**Dislikes should not ship.** Four reasons, in order of weight:

1. **It is a defamation surface on a China-facing financial forum.** The client's own word list devotes a whole category to 公司品牌声誉管理 and rates 骗子 and 被骗了 as mid risk *specifically because accusations against businesses are a liability*. A visible downvote counter is an unmoderated accusation with a number attached — the same risk the lexicon exists to control, reintroduced as a product feature.
2. **It contradicts pre-publication moderation.** CYS is committing to check content before it goes live. A dislike count is content that goes live instantly, unreviewed, and is aggregated onto someone else's business listing.
3. **No informational value here.** A downvote on an argument tells you something. A downvote on *"I manufacture printed garments and would like to meet brands"* tells you only that someone is unhappy — possibly a competitor. Which is the fourth reason:
4. **Brigading is trivial and the motive is built in.** Businesses on the board compete with each other. Handing them a one-click tool to suppress a rival's visibility in the 热门 ranking is an obvious own-goal.

**What replaces it: 举报 / Report.** Private, reasoned, routed to the moderator queue that already exists. It gives users the same "this is wrong" outlet, gives CYS an actionable signal instead of a score, and adds nothing new to build — `reports` is already in the Phase 2 data model ([07](07-development-plan.md) §4).

> If the client wants a negative signal anyway, the least-harmful version is a **private** downvote that feeds ranking only and is never displayed. Recommend against even this at launch: it is unexplainable to a poster whose listing quietly stops appearing.

## 5. What the author sees — the part pre-moderation makes essential

Pre-publication review means a poster hits submit and *nothing appears.* Without explicit status UI, that reads as a broken website.

| State | CN / EN | Author sees |
|---|---|---|
| `pending` | 审核中 / Under review | Visible in 我的帖子 with a review-time expectation. Editable |
| `approved` | 已发布 / Published | Live, with its public link |
| `rejected` | 未通过 / Not approved | Category-level reason + rewrite hint. Editable → resubmits |
| `draft` | 草稿 / Draft | Private |

Rules:

- Every state change emails the author. Silence after submission is the single largest UX risk in this design.
- A rejection gives a **category and a hint, never the matched term** ([09](09-moderation-flow.md) §5).
- An edit to an approved post returns it to `pending`. Without this, approve-then-edit defeats the entire guarantee.
- Comments carry the same states, and their authors get the same visibility.

## 6. Connecting — the conversion, and why not DMs at launch

Every sample post ends the same way: 期待和您联络 — *I look forward to hearing from you.* The forum's whole point is that this contact happens.

**Launch: 联系对方 / Connect** — an enquiry form that sends the poster a notification, with contact details revealed only to logged-in users. Rate-limited.

**Not DMs at launch.** A private inbox is a second content system needing its own moderation, abuse handling, and retention policy, none of which the word list covers, and all of which the client's compliance position would need to extend to. The lexicon already treats 私聊 (private chat), 加微信, and off-platform contact as risks in their own right — shipping an unmoderated private channel while flagging users for suggesting one would be incoherent. Revisit once the public board has traction.

## 7. Profiles — a company card

Not a social profile. Fields: company name, industry, markets, short intro, verified badge, their approved posts. `trust_tier` sits here and drives how much automation a poster's submissions get ([09](09-moderation-flow.md) §4).

**Anonymous read access is an open question** ([04](04-forum-spec.md) §6). The homepage feed requirement implies at least partial public read. Recommendation: posts publicly readable, contact details and posting login-gated — public read is what makes the forum useful as a shopfront and findable at all.

## 8. Phasing

Everything here is Phase 2 except the auth routes, which land in Phase 1 because the header would otherwise be a dead link on every page.

| Launch (Phase 2) | Deferred (2.5+) |
|---|---|
| Register/login, profiles, structured posting, edit/delete, comments + 1-level replies, 有用 reaction, report, save, follow category, share, search + filters, 最新/热门 sort, 我的帖子 with statuses, email notifications, Connect enquiry | Follow a poster, image uploads, in-app notification centre, DMs, semantic matching, reputation display |

## 9. Open questions

1. **Dislikes — does the client accept the recommendation in §4?** Only item here that changes the data model.
2. Comments pre-moderated too, or posts only? *(open since 30 Jul — also [09](09-moderation-flow.md) §8)*
3. Anonymous read, or login-gated?
4. Are engagement counts public, or moderator-only at launch? A visible `0 有用` on early posts reads worse than no counter.
5. Forum CN-only or bilingual? Decides whether every label above needs an EN pair — and whether the Chinese-only word list is a gap ([09](09-moderation-flow.md) §8 item 7).
6. Who verifies a company for the verified badge — CYS, or self-declared?
