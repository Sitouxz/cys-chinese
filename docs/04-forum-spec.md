# 04 — 星威华商论坛 / CYS Chinese Business Forum

The forum is the reason this project is a custom build rather than Wix. Owen's assessment: *"this will be quite big since the forum itself very heavy on backend."*

**Phasing:** excluded from the Phase 1 demo at the client's request (29–30 Jul 2026). Built after demo sign-off.

---

## 1. Names and framing

| | |
|---|---|
| CN | 星威华商论坛 (page title) / 华商论坛 (nav + CTA) |
| EN | CYS Chinese Business Forum (page title) / CN Business forum (nav + CTA) |
| Type | 公共论坛 / Public Forum |
| "Created on" | 创建于2026年7月22日 / Created on July 22, 2026 — client's framing in the mockup |

## 2. Purpose (deck copy, verbatim)

**CN**

> 在这里，您可以检索行业动态、监管政策、市场分析等实用资讯；也可以参与评论与讨论，分享您的实践经验与见解；更可以发现来自不同企业的真知灼见，与业内同仁共同成长。

**EN**

> Here, you can browse practical information such as industry trends, regulatory policies, and market analysis. You can also join in comments and discussions to share your practical experience and insights, and discover valuable perspectives from a range of different businesses — growing together with your industry peers.

## 3. Features shown in the mockup

| Element | CN | EN |
|---|---|---|
| Create post button | 创建帖子+ | Post+ |
| Search | 检索用户/产品/服务 | Search users/product/service |
| Post prompt / helper | 我可以发布： | What I can post here： |
| Post author display | CYS星威环球 | CYS Global Remit |
| Comments & discussion | 参与评论与讨论 | join in comments and discussions |

Derived feature list:

- User registration and login (header shows `注册 | 登录` / `Reg | log in` on every page — the forum is what needs it)
- Author identity / profile displayed on posts
- Post creation
- Comments / threaded discussion on posts
- **Search across users, products and services** — implies posts carry structured metadata (industry, product category, region, intent), not just free text
- Likes, dislikes, and the rest of the engagement layer are **not** in the deck or the mockup. The client asked what we propose on 4 Aug — answer in [10-forum-features.md](10-forum-features.md), which recommends 有用/Useful plus 举报/Report and argues against shipping dislikes
- Content categories implied by the purpose copy: 行业动态 (industry trends) · 监管政策 (regulatory policy) · 市场分析 (market analysis)
- Homepage feed of recent posts, linking through to the forum (client requirement — see [01-brief-and-requirements.md](01-brief-and-requirements.md) §3)

## 4. Sample posts (deck copy — use as seed/demo content)

The mockup shows four example posts under "我可以发布 / What I can post here". These define the expected post archetype: **a business introducing itself and stating who it wants to meet.**

| # | CN | EN |
|---|---|---|
| 1 | 我的餐饮品牌叫CYS茶餐厅，提供鸡饭和中式炒菜。希望可以接触到新加坡F&B行业的经销商，期待和您联络。 | My F&B brand is CYS Teahouse, offering chicken rice and Chinese stir-fry dishes. Looking to connect with distributors in Singapore's F&B industry — I look forward to hearing from you. |
| 2 | 我是一家服装生产商，可以提供印花服装设计以及生产，希望可以接触到新加坡服装行业的品牌，期待和您的联络。 | I run an apparel manufacturing business, offering printed garment design and production. Looking to connect with brands in Singapore's apparel industry — I look forward to hearing from you. |
| 3 | 我是做东南亚经销商的，经营日化类产品，在马来西亚、新加坡地区开展业务，希望可以遇见有潜力的品牌。期待合作 | I work as a distributor in Southeast Asia, dealing in household/personal care products, with operations in Malaysia and Singapore. Looking to meet promising brands — I look forward to partnering with you. |
| 4 | 我正在进行跨境贸易，主营玩具类产品。需要一位合作投资方，期待和您联络。 | I'm currently engaged in cross-border trade, mainly dealing in toys. Looking for a co-investment partner — I look forward to hearing from you. |

**Implication for the data model:** posts are effectively business-matching listings. Fields worth capturing: business type, industry, product/service, markets operated in, what they're seeking (distributor / brand / investor / partner), contact intent. This is what makes "search users/product/service" work.

## 5. ⚠️ Moderation requirement (added 30 Jul 2026)

Client, via Redzuan in the ClickUp thread — **verbatim**:

> Additionally, to add on to the forum page. As information and content up on China would be quite sensitive, we'd like to include a **moderator step in the whole posting process where the posts would be checked before the post is allowed to be up on the forum**. Ideally we'd like to **automate this process** so we're up for suggestions.
>
> Understand that usually post moderation comes after it goes live but for now we're thinking of having the moderation stage **before** the post goes up as there shouldn't be too much at the earlier stages. What do you think?
>
> @Owen Ombuh can this be done?

**Status (6 Aug 2026): the client moved first.** On 4 Aug they sent a 220-term / 8-pattern Chinese word list (`敏感词库.xlsx`) with their own three-tier rule, plus the confirmed colour theme, and asked for three things back: the approval flow, the user-facing feature set, and the phase timeline.

- Flow, lexicon analysis, matching rules → **[09-moderation-flow.md](09-moderation-flow.md)**
- User features incl. the likes/dislikes question → **[10-forum-features.md](10-forum-features.md)**
- Timeline → [07-development-plan.md](07-development-plan.md) §8–9
- Reply draft → [08-client-reply-draft.md](08-client-reply-draft.md)

The options analysis in §5 below is retained as the record of how the recommendation was reached. **Doc 09 is the current spec** — it supersedes this section wherever they differ, because it is grounded in the client's actual word list rather than a hypothetical one.

### What this means concretely

- Posts have a lifecycle: `draft → pending review → approved (live) | rejected`
- A moderator queue / admin surface is required — who at CYS staffs it is not decided
- Author-facing state: users must be able to see their post is pending, and be told when it's approved or rejected (and ideally why)
- Comments: **not specified** whether comments also need pre-moderation. Assume yes until told otherwise — the sensitivity rationale applies equally.
- Client explicitly accepts the throughput cost at low volume ("there shouldn't be too much at the earlier stages") but the design should not fall over when volume rises

### Automation — options to put to the client

Neu Entity has been invited to propose. Candidate approaches, cheapest first:

1. **Rules + keyword/heuristic screening** — blocklist for politically sensitive terms, contact-detail scraping, spam patterns. Cheap, brittle, high false-positive rate on a China-topic forum.
2. **LLM classifier as first-pass triage** — auto-approve clearly benign business listings, auto-reject obvious spam, route anything touching politics/regulation/sensitive topics to a human. Fits the post archetype well since real posts are formulaic business intros. Human still has final say on the flagged minority.
3. **Full human review** — what the client described as the baseline. Viable at launch volume, does not scale.
4. **Hybrid with trust tiers** — new accounts fully pre-moderated; accounts with N approved posts move to post-publication review. Reduces load over time without abandoning the pre-publication principle.

**Recommendation to take to the client: 2 + 4.** LLM triage for the first pass with a human queue for flagged items, plus a trust tier so verified/repeat posters stop clogging the queue. Keeps the "checked before it goes live" promise the client cares about, without committing CYS to unbounded manual review.

> Cost/latency note worth raising: LLM triage adds a per-post API cost and a few seconds of latency. Both are negligible at the volumes described.

## 6. Open forum questions

- Who moderates? A CYS staff member, or Neu Entity?
- Are comments pre-moderated too, or only top-level posts?
- SLA on review turnaround — what does the author see, and for how long?
- Can users edit an approved post? Does an edit re-enter the queue? (It should.)
- Is the forum readable by anonymous visitors, or login-gated? The homepage feed requirement implies at least partial public read.
- Report/flag mechanism for content that slips through?
- Language: is the forum CN-only, or bilingual like the rest of the site? Moderation tooling differs meaningfully if it must handle both.
- Retention/deletion policy — relevant to the Privacy page that is still unwritten.
