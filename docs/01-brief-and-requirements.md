# 01 — Brief & Requirements

Source: Canva deck `中文网站样本` (`DAHPU-DDUwU`), pages 1 and 52 + presenter notes; ClickUp task [86eyczra3](https://app.clickup.com/t/86eyczra3) comment thread.

---

## 1. Project background and purpose (deck p1, verbatim)

> This Chinese-language website is the first step of the **CYS China Strategic Partnership Programme**, and serves as the starting point of the company's broader **"digital ecosystem platform."** Not a direct financial-product sales page or lead-generation funnel.

Presenter note (p1, client's own words):

> This website serves two purposes for us: first, to help us expand into the Chinese market, and second, to build a Chinese business community — we want to create a forum where users can share resources.
>
> Anything else is the website needs to present an **international image**, because finance marketing activity is **regulated in China**.

**Reading of this:** the site is a positioning + community play, not a conversion funnel. Do not design it around remittance-quote CTAs or lead capture as the primary goal. Sales-y financial-product framing is an actual regulatory risk in the target market, not just a tonal preference.

## 2. Target audience (deck p1, verbatim)

1. **Global Chinese business owners / merchants** — needing cross-border payment, settlement or market-connection resources
2. **Singapore and Southeast Asian companies** that do business with China
3. **Chinese individuals and families** with cross-border remittances
4. **Existing CYS clients** — who may act as *"introducers / ecosystem connectors,"* helping CYS access more business opportunities
5. **Licensed financial institutions and payment service providers**

## 3. Client-stated design intent (presenter notes, deck pp2–4)

Deck pages 2 and 3 (CN and EN homepage), note repeated on both:

> 背景我想要表达是 global and connection。希望可以有更好的方式可以表达 connection，毕竟我们是做 cross broad 和 community 的。
>
> 因为我们老板想要的是建立一个 community，所以我希望在 landing page 里可以展示我们的论坛帖子，并且可以 linked 过去。

Translation / requirements extracted:

- The hero background should communicate **global** and **connection**. The client is open to — and asking for — a better visual execution of "connection" than what is in the mockup (currently a stock earth-from-space image).
- **The boss's priority is building a community.** Therefore the **landing page must surface live forum posts, linked through to the forum.**

Deck page 4 note:

> 右下角的 post 可以显示么 — *"can the post in the bottom-right be displayed?"*

→ Confirms a forum-post module is wanted on the homepage.

## 4. Platform decision

From the ClickUp thread (27 Jul 2026):

- **Maharani Muhaimin:** *"After reviewing the requirements, it's very likely that we won't be using Wix because the website requires significant backend development."*
- **Redzuan:** *"so what platform will we be using?"*
- **Owen Ombuh:** *"as usual custom made. and this will be quite big since the forum itself very heavy on backend"*

**Decision: custom build. Wix is out.** Driver is the forum (accounts, posting, moderation queue, search).

> Not yet decided or recorded anywhere: the actual stack, hosting, database, auth provider, or how the Chinese site relates to the existing `cys.com.sg` (subdomain / subdirectory / separate property). See [06-open-questions.md](06-open-questions.md).

## 5. Timeline and phasing

| Date | Event |
|---|---|
| 14 Jul 2026 | Canva requirements deck created by client |
| 22 Jul 2026 | Forum "creation date" shown in mockup copy (client's intended framing) |
| 23 Jul 2026 | ClickUp task created |
| 24 Jul 2026 | Canva link shared into ClickUp by Redzuan |
| 27 Jul 2026 | Deck last updated by client; Wix ruled out; custom build confirmed |
| 29 Jul 2026 | Client asks to descope forum from demo to shorten timeline; NE agrees |
| 30 Jul 2026 | Client requests colour-scheme confirmation before start; adds pre-publication forum moderation requirement |
| 31 Jul 2026 | Sitemap subtask due |

**Agreed estimate (Maharani → client, 27 Jul):**

> The estimated timeline for developing the CYS Chinese website is around **2 months**. To allow sufficient time for feedback and revisions, I would recommend planning for **2–3 months** overall.

**Descoping agreement (29 Jul):**

- Client: *"Can I reconfirm that the 2-3 months is also for the demo as well? … Would we be able to reduce the timeline and get the demo out for a look without the forum? We can take time to develop the forum page and leave it out of the demo showcasing."*
- Neu Entity: *"yes, we can do that! The 2–3 months were for the whole site. Without the forum, we can show you a simple demo in **months 1–2** first. Don't worry, I will share our progress with you in phases along the way."*
- Client (30 Jul): *"Great, let's keep to that simple demo arrangement for now!"*

**Resulting phasing:**

| Phase | Scope | Window |
|---|---|---|
| Phase 1 — Demo | Full marketing site, **no forum**. Homepage, About, Corridor, Corporate, Individual, Contact, Feedback, legal pages. Bilingual CN/EN. | Months 1–2 |
| Phase 2 — Forum | 星威华商论坛: accounts, posting, search, **pre-publication moderation** | After demo sign-off |
| — | Progress shared with client **in phases** throughout (commitment already made) | ongoing |

## 6. Hard requirements checklist

- [ ] Bilingual CN ⇄ EN with a `中文 | ENG` switcher in the header on every page
- [ ] User registration + login (`注册 | 登录` / `Reg | log in`) — required for the forum
- [ ] Live forum posts surfaced on the homepage, linked through to the forum
- [ ] Currency ticker strip: SGD, CNY/CNH, USD, HKD, AUD, MYR, IDR, THB
- [ ] Site-wide search (search field sits in the homepage hero)
- [ ] Forum: post creation, threaded comments, search by user / product / service
- [ ] **Forum: moderation queue — posts reviewed BEFORE going live**, automated where possible
- [ ] Contact form with corporate/individual segmentation
- [ ] Feedback widget (quick-pick sentiment + send)
- [ ] International brand image; no aggressive financial-product selling (China regulatory constraint)
- [ ] Accessible from mainland China (implied by audience; not yet stated as a requirement — flag it)
