# 02 — Sitemap & Information Architecture

Derived from the Canva deck (`DAHPU-DDUwU`, 52 pages). The deck is laid out as **CN page → EN page pairs**, so 52 slides ≈ 26 unique screens.

Feeds ClickUp subtask **Sitemap** ([86eyf6grv](https://app.clickup.com/t/86eyf6grv), due 31 Jul 2026).

> **The deliverable built from this file is [CYS-Chinese-Sitemap.pdf](CYS-Chinese-Sitemap.pdf)** (10pp, source: [sitemap.html](sitemap.html)) — full route tree, off-tree routes, forum sub-architecture, header/footer reconciliation, page inventory, URL and locale scheme, content ownership. This page remains the raw IA extract; the PDF is what goes to the client for sign-off.
>
> Two things the PDF resolves that this file only flagged: the **header taxonomy is proposed as canonical** (§E1 below), and **华商社群 becomes a footer heading, not a page** (§E2).

---

## 1. Global header (every page)

| CN | EN (as written in deck) | Notes |
|---|---|---|
| 关于我们 | about us | dropdown |
| 中新合作走廊 | CN-SG corporate | dropdown — **EN label is wrong**, should be "China–Singapore Corridor" |
| 企业合作 | business users | dropdown |
| 个人用户 | Individual User | |
| 联系我们 | Connect us / Contact us | **inconsistent in deck** — "Connect us" on most pages, "Contact us" on p16 |
| 中文 \| ENG | 中文 \| ENG | language switcher, right side |
| 注册 \| 登录 | Reg \| log in | auth, far right, button-styled |

Logo: CYS Global Remit lockup, top-left.

## 2. Mega menu / dropdown structure (deck pp15–16)

```
关于我们 / About us
├── 公司简介        CYS introduction
├── 企业发展历史    CYS history
└── 企业文化        Our culture

中新合作走廊 / CN & SG partnership
├── 中新合作伙伴    CN–SG partnership
└── 伙伴故事        Partnership story

企业合作 / Business users
├── 企业银行(金融机构)  Financial Institution
├── 跨境企业            Cross-border business
└── 华商论坛            CN Business Forum

个人用户 / Individual User
└── (no children shown)

联系我们 / Contact us
├── 联系方式        Contact us
└── 用户反馈        Feedback
```

## 3. Footer (deck pp13–14)

```
关于星威 / About us
├── 公司简介        CYS Introduction
├── 企业发展历史    CYS history
└── 企业文化        CYS culture

华商社群 / Chinese community
├── 与合作伙伴的故事  Partnership story
└── 星威论坛          CYS forum

我们的产品与服务 / Our product & service
├── 企业客户                Business user
└── 个人及家庭服务业务      Individual user

联系我们 / Connect us
├── 条款和条件      Term & conditions
├── 隐私声明        Privacy
└── 用户反馈        Feedback

常见问题 / FAQ
```

> Note the footer and the mega menu group things differently — the footer files 伙伴故事 and 论坛 under 华商社群 (Chinese community), the header files them under 中新合作走廊 and 企业合作. Reconcile before building.

## 4. Full page tree

```
/  首页 Home
│
├── /about  关于我们 About us
│   ├── /about/intro       公司简介   CYS Introduction
│   ├── /about/history     企业发展历史 CYS History / 星威里程碑 Milestones
│   └── /about/culture     企业文化   CYS Culture (Inclusion / Innovation / Inspiration)
│
├── /corridor  中新合作走廊 China–Singapore Corridor
│   ├── /corridor/partners  中新合作伙伴 + 合作伙伴与投资者 Partners & Investors
│   └── /corridor/stories   伙伴故事 Partnership Story
│
├── /business  企业合作 Business Users
│   ├── /business/financial-institutions  金融机构 / 企业银行 Financial Institution
│   ├── /business/cross-border            跨境企业 Cross-border Corporates
│   └── /forum                            华商论坛 CYS Chinese Business Forum  ← Phase 2
│
├── /individual  个人用户 Individual User
│                (3 use cases: tuition & living expenses abroad /
│                 foreign currency for shopping / overseas investment)
│
├── /contact  联系我们 Contact
│   ├── /contact/details   联系方式 Contact details
│   ├── /contact/enquiry   用户信息填写 "Let us find you" lead form
│   └── /contact/feedback  用户反馈 Feedback
│
├── /faq       常见问题 FAQ
├── /terms     条款和条件 Terms & Conditions
├── /privacy   隐私声明 Privacy Statement
│
├── /register  注册 Register       ← auth, required for forum
└── /login     登录 Log in         ← auth, required for forum
```

Every route exists in **two locales: `zh` (primary) and `en`**.

## 5. Homepage section order (deck pp2–12)

| # | Section | Content |
|---|---|---|
| 1 | **Hero** | Full-bleed earth-from-space imagery. Headline: *"连接中国与东南亚的可信支付桥梁，启迪跨境商业新可能。"* Sub: *1981年启航于新加坡*. Primary CTA button: **华商论坛 / CN Business forum**. Search field beside the CTA. |
| 2 | **Values strip** | 包容 创新 启迪 — inclusion, innovation and inspiration (over the hero, bottom-centre) |
| 3 | **Currency ticker** | Dark bar: 新币SGD · 人民币CNY/CNH · 美元USD · 港币HKD · 澳大利亚AUD · 马来西亚令吉MYR · 印尼盾IDR · 泰铢THB |
| 4 | **About / history** | 星威环球 启航于1981 + company intro paragraph, links to 星威环球历史 |
| 5 | **产品与服务 Product & Service** | 3 cards — 跨境支付 (cross-border payment) · 方案咨询 (solution consulting) · 华商论坛 (business forum) |
| 6 | **中新合作走廊 Corridor** | `40+ 年` stat, 4 image cards, tagline *关注中新商业发展，与商业伙伴共建中新合作走廊*, CTA **寻找业内合作机会** |
| 7 | **Customisation blocks** | 企业用户方案定制 (corporate) + 个人用户定制 (individual), CTA *联系我们定制支付方案* |
| 8 | **Forum post feed** ⚠️ | **Client requirement, not yet in the mockup.** Live forum posts on the landing page, each linking through to the forum. Presenter notes on pp2, 3 and 4 all ask for this. |
| 9 | **Footer** | as section 3 above |

## 6. Screens confirmed in the deck

| Screen | CN page | EN page |
|---|---|---|
| Brief / audience | 1 | — |
| Homepage | 2 | 3 |
| Homepage — history block | 4 | — |
| About us — intro (启航于1981) | 5 | 6 |
| Product & Service | 7 | 8 |
| China–Singapore Corridor | 9 | 10 |
| Corporate / Individual customisation | 11 | 12 |
| Footer / sitemap | 13 | 14 |
| Mega menu open state | 15 | 16 |
| About us — MPI licence & vision copy | 17 | 18–19 |
| About us — MAS compliance & teams copy | 19–20 | 20 |
| Milestones timeline (1981/2011/2020/2025/2030) | 21 | 22–23 |
| Milestones — long-form history article | 23–24 | 24 |
| Culture — Inclusion / Innovation / Inspiration | 25–27 | 27–28 |
| Corridor — partners grid | 29 | 30 |
| Partners & Investors — vision/mission | 31 | 32 |
| Partnership story | 33 | 34 |
| Financial Institution | 35 | 36 |
| Cross-border corporates | 37 | 38 |
| **Forum 星威华商论坛** | 39 | 40 |
| Individual users | 41–43 | 43–44 |
| Contact details | 45 | 46 |
| Lead form 用户信息填写 | 47 | 48 |
| Feedback | 49 | 50 |
| Footer + open items ("Check: 1. Forum Technical approach 2. Timeline") | 51 | 52 |

> Page numbers are approximate where a single screen spans two slides — the deck does not label sections. The content itself is captured verbatim in [03-content-inventory.md](03-content-inventory.md).
