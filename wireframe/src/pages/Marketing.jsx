import { TierBadge, PromotedSlot } from "./Community.jsx";
import { rankingScore } from "../mock/community.js";
import { useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import { Arrow, Empty, Modal, PageTitle, Tabs } from "../components/ui.jsx";
import { Globe, Counter } from "../components/Globe.jsx";
import {
  categories,
  history,
  industries,
  intents,
  uses,
  values,
} from "../content/catalog.js";
import { publicPosts } from "../mock/service.js";
function RevealText({ children }) {
  const segments = children.match(/\S+\s*/g) || [children];
  return (
    <span className="reveal-copy" aria-label={children}>
      {segments.map((word, i) => (
        <span
          aria-hidden="true"
          key={i}
          style={{ "--reveal-delay": `${Math.min(i * 65, 1200)}ms` }}
        >
          {word}{" "}
        </span>
      ))}
    </span>
  );
}
export function Values() {
  const { txt } = useApp();
  return (
    <section className="values section">
      <div className="shell values-grid">
        {values.map(([title, brief, body], i) => (
          <article key={i}>
            <span className="index">0{i + 1}</span>
            <h2>{txt(title)}</h2>
            <p>{txt(brief)}</p>
            <p className="muted">{txt(body)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function PostRows({ posts, compact = false }) {
  const { state, txt, t } = useApp();
  return (
    <div className={compact ? "post-rows compact-rows" : "post-rows"}>
      {posts.map((post) => {
        const profile = state.profiles.find((p) => p.id === post.authorId);
        return (
          <article key={post.id} className="post-row">
            <div className="post-category">
              {txt(categories.find((c) => c.id === post.category))}
              <span>
                {new Date(post.publishedAt).toISOString().slice(0, 10)}
              </span>
            </div>
            <h3>
              <Link to={"/forum/post/" + post.id}>
                {txt(post.title)}
                <Arrow />
              </Link>
            </h3>
            {!compact && <p className="excerpt">{txt(post.body)}</p>}
            <div className="post-meta">
              <Link to={"/forum/member/" + profile.id}>
                {txt(profile.name)}
              </Link>
              <TierBadge profile={profile} />
              <span>{txt(industries.find((c) => c.id === post.industry))}</span>
              <span>{post.markets.join(" · ")}</span>
              <span>{txt(intents.find((i) => i.id === post.intent))}</span>
              {!compact && (
                <span>
                  {state.reactions.filter((r) => r.targetId === post.id).length}{" "}
                  {t("有用", "Useful")} ·{" "}
                  {
                    state.comments.filter(
                      (c) => c.postId === post.id && c.status === "approved",
                    ).length
                  }{" "}
                  {t("评论", "Comments")}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
export function Home() {
  const { state, txt, t, location, query, go } = useApp();
  const [feed, setFeed] = useState("recommended"),
    [search, setSearch] = useState("");
  const published = publicPosts(state),
    tab = ["payment", "consulting", "forum"].includes(
      location.searchParams.get("service"),
    )
      ? location.searchParams.get("service")
      : "payment";
  const paths =
    tab === "forum"
      ? [
          [
            t("发现经销伙伴", "Find distribution partners"),
            "/forum?intent=distributor",
          ],
          [
            t("连接品牌与供应商", "Connect brands and suppliers"),
            "/forum?intent=brand",
          ],
          [
            t("探索投资合作", "Explore investment partnerships"),
            "/forum?intent=investor",
          ],
        ]
      : [
          [
            t("金融机构合作", "Financial institution partnerships"),
            "/business?audience=financial",
          ],
          [
            t("跨境企业方案", "Cross-border business solutions"),
            "/business?audience=business",
          ],
          [t("个人支付需求", "Personal payment needs"), "/individual"],
        ];
  return (
    <>
      <section className="hero dark">
        <div className="shell hero-main">
          <div className="hero-copy">
            <p className="origin">
              {t("1981年启航于新加坡", "Founded in Singapore, 1981")}
            </p>
            <h1>
              {t(
                "连接中国与东南亚的可信商业桥梁，",
                "A trusted business bridge connecting China and Southeast Asia.",
              )}
              <em>{t("启迪跨境商业新可能。", "")}</em>
            </h1>
            <p className="hero-description">
              {t(
                "从专业咨询到商业合作，以经验连接每一份信任。与 CYS 一起，探索更广阔的可能。",
                "From specialist advice to lasting partnerships. Connect with expertise, explore new possibilities and grow together with CYS.",
              )}
            </p>
            <div className="actions">
              <Link to="/forum" className="button">
                {t("进入华商论坛", "Enter the forum")}
                <Arrow />
              </Link>
              <Link to="/corridor" className="hero-secondary">
                {t("了解合作方案", "Explore partnerships")}
                <Arrow />
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <Globe />
            <div className="globe-label china">
              {t("中国", "CHINA")}
              <small>31.2° N · 121.5° E</small>
            </div>
            <div className="globe-label singapore">
              {t("新加坡", "SINGAPORE")}
              <small>1.3° N · 103.8° E</small>
            </div>
            <p className="visual-caption">
              CHINA <span /> SINGAPORE
            </p>
          </div>
        </div>
        <div className="shell hero-bottom">
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              go("/forum/search?q=" + encodeURIComponent(search));
            }}
          >
            <label htmlFor="home-search">
              {t("发现合作机会", "Discover opportunities")}
            </label>
            <div>
              <input
                id="home-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(
                  "搜索行业、产品或伙伴",
                  "Search an industry, product or partner",
                )}
              />
              <button aria-label={t("搜索论坛", "Search forum")}>
                <Arrow />
              </button>
            </div>
          </form>
          <div className="hero-topics">
            {published.slice(0, 4).map((post, i) => (
              <Link key={post.id} to={"/forum/post/" + post.id}>
                <span>0{i + 1}</span>
                {txt(post.title)}
                <Arrow />
              </Link>
            ))}
          </div>
        </div>
        <div className="currency-ribbon">
          <div className="shell">
            <span>{t("支持币种", "Supported currencies")}</span>
            {["SGD", "CNY/CNH", "USD", "HKD", "AUD", "MYR", "IDR", "THB"].map(
              (c) => (
                <strong key={c}>{c}</strong>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="section forum-preview">
        <div className="shell preview-grid">
          <div>
            <h2>
              {t(
                "生意的下一步，\n从对话开始。",
                "Good business starts with a conversation.",
              )}
            </h2>
            <p>
              {t(
                "认识同行，分享洞察。让真实的合作需求，遇见合适的伙伴。",
                "Meet your peers. Share a perspective. Connect a clear business need with the right partner.",
              )}
            </p>
            <Link className="text-link" to="/forum">
              {t("浏览华商论坛", "Browse the forum")}
              <Arrow />
            </Link>
            <PromotedSlot />
          </div>
          <div>
            <Tabs
              panelId="home-forum-panel"
              label={t("论坛预览", "Forum preview")}
              value={feed}
              onChange={setFeed}
              options={[
                { id: "recommended", label: t("为您推荐", "Recommended") },
                { id: "latest", label: t("最新发布", "Latest") },
                { id: "featured", label: t("精选机会", "Featured") },
              ]}
            />
            <div
              id="home-forum-panel"
              role="tabpanel"
              aria-labelledby={"home-forum-panel-" + feed}
            >
              {published.length ? (
                <PostRows
                  compact
                  posts={(feed === "featured"
                    ? published.filter((p) => p.featured)
                    : feed === "recommended"
                      ? [...published].sort(
                          (a, b) =>
                            rankingScore(b, state) - rankingScore(a, state),
                        )
                      : published
                  ).slice(0, 3)}
                />
              ) : (
                <Empty />
              )}
            </div>
          </div>
        </div>
      </section>
      <Values />
      <section className="section services">
        <div className="shell">
          <div className="section-head">
            <h2>
              {t(
                "连接需求，也连接可能。",
                "Connecting needs with possibilities.",
              )}
            </h2>
            <p>{t("产品与服务", "Products & services")}</p>
          </div>
          <Tabs
            panelId="home-services-panel"
            label={t("服务", "Services")}
            value={tab}
            onChange={(id) => query("service", id)}
            options={[
              { id: "payment", label: t("跨境支付", "Cross-border payment") },
              { id: "consulting", label: t("方案咨询", "Solution consulting") },
              { id: "forum", label: t("华商论坛", "Business forum") },
            ]}
          />
          <div
            className="services-grid"
            role="tabpanel"
            id="home-services-panel"
            aria-labelledby={"home-services-panel-" + tab}
          >
            <div>
              <p className="lead">
                {tab === "forum"
                  ? t(
                      "搭建企业之间的桥梁，促进跨境商业发展。",
                      "Build bridges between businesses and open new conversations.",
                    )
                  : tab === "consulting"
                    ? t(
                        "从您的需求出发，一对一探索合适的方案。",
                        "Start with your needs and explore a suitable plan, one to one.",
                      )
                    : t(
                        "帮助企业和个人解决跨境支付的问题。",
                        "Payment support for businesses and individuals across borders.",
                      )}
              </p>
              {paths.map(([label, path], i) => (
                <Link key={path} className="service-path" to={path}>
                  <span>0{i + 1}</span>
                  {label}
                  <Arrow />
                </Link>
              ))}
            </div>
            <div>
              <h3>
                {t("您的行业，您的机遇。", "Your industry. Your opportunity.")}
              </h3>
              <div className="industry-grid">
                {industries.map((industry, i) => (
                  <Link key={industry.id} to={"/forum?industry=" + industry.id}>
                    <span className="industry-symbol" aria-hidden="true">
                      {["◒", "⌁", "▧", "◇", "↗", "⊕"][i]}
                    </span>
                    {txt(industry)}
                    <Arrow />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <HistoryTimeline />
      <section className="section">
        <div className="shell audience-grid">
          <article>
            <span>01</span>
            <h2>
              {t(
                "为企业，打开更广阔的市场。",
                "A wider world for your business.",
              )}
            </h2>
            <p>
              {t(
                "金融机构与跨境企业，从需求出发，规划下一步。",
                "For financial institutions and cross-border corporates. Shape the next step around your needs.",
              )}
            </p>
            <Link className="text-link" to="/business">
              {t("企业合作方案", "Business solutions")}
              <Arrow />
            </Link>
          </article>
          <article>
            <span>02</span>
            <h2>
              {t(
                "为个人，连接生活的每一程。",
                "Connecting every chapter of your life.",
              )}
            </h2>
            <p>
              {t(
                "从家人的学费到海外生活，让您的支付需求得到专业回应。",
                "From family tuition to life overseas, begin with a conversation about your payment needs.",
              )}
            </p>
            <Link className="text-link" to="/individual">
              {t("个人用户方案", "Individual solutions")}
              <Arrow />
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
export function About() {
  const { t } = useApp();
  return (
    <>
      <PageTitle
        title={t(
          "从新加坡出发，与世界同行。",
          "Rooted in Singapore. Connected to the world.",
        )}
      >
        {t("关于星威环球", "About CYS Global Remit")}
      </PageTitle>
      <section id="intro" className="section text-reveal">
        <div className="shell editorial-grid">
          <h2>
            {t(
              "连接，是我们始终坚持的事。",
              "Connection is at the heart of what we do.",
            )}
          </h2>
          <div>
            <p className="lead">
              <RevealText>
                {t(
                  "CYS 成立于1981年，总部设于新加坡。我们专注于为中小企业、金融机构及大型企业提供外汇流动性与支付解决方案。",
                  "Founded in 1981 and headquartered in Singapore, CYS focuses on FX liquidity and payment solutions for small and medium businesses, financial institutions and large corporates.",
                )}
              </RevealText>
            </p>
            <p>
              {t(
                "坚持为每一个客户提供一对一的专业咨询和方案规划，我们希望为客户提供更多元的合作可能。我们以包容、创新和启迪为核心，连接各类企业服务提供商，促进合作与共赢。",
                "We are committed to one-to-one professional consultation and solution planning, opening more possibilities for partnership. Inclusion, innovation and inspiration guide a community connecting business service providers.",
              )}
            </p>
            <details>
              <summary>
                {t(
                  "合规与专业团队 · 资料供审核",
                  "Compliance & specialist teams · Supplied copy for review",
                )}
              </summary>
              <p>
                {t(
                  "所提供资料将 CYS 描述为持有新加坡金融管理局颁发 MPI 牌照的支付机构，并说明客户尽职调查与反洗钱要求。正式上线前须确认最新牌照范围与服务表述。专业团队涵盖资金交易、现金管理及战略业务发展。",
                  "Supplied material describes CYS as an MAS-licensed Major Payment Institution and outlines customer due diligence and anti-money-laundering requirements. Current licence scope and service wording require confirmation before launch. Specialist areas include treasury operations, cash management and strategic business development.",
                )}
              </p>
            </details>
          </div>
        </div>
      </section>
      <HistoryTimeline />
      <div id="culture">
        <Values />
        <div className="shell film-preview">
          <div>
            <span className="eyebrow">CYS / FILM</span>
            <h2>
              {t("看见连接的力量。", "The people behind every connection.")}
            </h2>
            <p>{t("品牌影片即将呈现。", "Our brand film is coming soon.")}</p>
          </div>
          <span className="film-placeholder">
            {t("影片待提供", "Film awaiting client supply")}
          </span>
        </div>
        <p className="shell small muted">
          {t(
            "文化预览：采用所提供的核心价值，正式内容待确认。",
            "Culture preview: supplied core values; final content to be confirmed.",
          )}
        </p>
      </div>
    </>
  );
}
export function Corridor() {
  const { state, txt, t } = useApp();
  const [partner, setPartner] = useState(null);
  return (
    <>
      <PageTitle dark title={t("中新合作走廊", "The China–Singapore Corridor")}>
        {t(
          "关注中新商业发展，与商业伙伴共建合作走廊。",
          "Championing China–Singapore business growth, together with our partners.",
        )}
      </PageTitle>
      <section className="section dark corridor-partners" id="partners">
        <div className="shell">
          <div className="editorial-grid">
            <div>
              <Counter value={40} suffix="+" />
              <p>
                {t(
                  "年 · 携手探索合作机会",
                  "years exploring partnership possibilities",
                )}
              </p>
            </div>
            <div>
              <h2>
                {t(
                  "伙伴与投资者，共同向前。",
                  "Partners and investors. Moving forward together.",
                )}
              </h2>
              <p>
                {t(
                  "我们希望连接亚太地区具有合作意向的支付与专业服务提供商，让不同背景的用户更高效地获取资源、交流知识与经验。",
                  "Our vision connects collaborating payment and professional service providers across Asia Pacific, helping people from different backgrounds access resources and exchange expertise.",
                )}
              </p>
            </div>
          </div>
          <p className="small muted">
            {t(
              "以下均为虚构合作伙伴示例，不代表真实关联或背书。",
              "All partner identities below are fictional examples, not actual affiliations or endorsements.",
            )}
          </p>
          <div className="partner-grid">
            {(state.partners || state.profiles.slice(0, 8)).map((p, i) => (
              <button key={p.id} onClick={() => setPartner(p)}>
                <span className="partner-monogram">
                  {["B/P", "WH", "I&E", "S/P", "SL", "FA", "CP", "SS"][i]}
                </span>
                <strong>{txt(p.name)}</strong>
                <small>
                  {txt(industries.find((x) => x.id === p.industry))}
                </small>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section id="stories" className="section stories-section">
        <div className="shell">
          <div className="section-head">
            <h2>
              {t(
                "合作，让可能有了形状。",
                "Partnership gives possibility a shape.",
              )}
            </h2>
            <span>
              {t(
                "伙伴故事 · 虚构示例",
                "Partnership stories · Fictional examples",
              )}
            </span>
          </div>
          <div className="stories-grid">
            {state.stories.map((story, i) => (
              <article key={story.id}>
                <Link to={"/corridor/stories/" + story.id}>
                  <div className={"story-art art-" + i}>
                    <img
                      src={
                        "/assets/" +
                        (i % 2
                          ? "cys-signal-corridor-light-v2.jpg"
                          : "cys-signal-corridor-dark-v2.jpg")
                      }
                      alt=""
                      loading="lazy"
                    />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{txt(story.title)}</h3>
                </Link>
                <p className="excerpt">{txt(story.summary)}</p>
                <Link
                  className="text-link"
                  to={"/corridor/stories/" + story.id}
                >
                  {t("阅读故事", "Read the story")}
                  <Arrow />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      {partner && (
        <Modal title={txt(partner.name)} onClose={() => setPartner(null)}>
          <p className="small">
            {t(
              "虚构伙伴 · 概念合作方向",
              "Fictional partner · Illustrative collaboration",
            )}
          </p>
          <p>{txt(partner.intro)}</p>
          <p>{partner.markets.join(" · ")}</p>
          <Link className="button" to={"/forum/member/" + partner.id}>
            {t("查看示例企业", "View demo company")}
          </Link>
        </Modal>
      )}
    </>
  );
}
export function Story({ id }) {
  const { state, t, txt } = useApp();
  const story = state.stories.find((s) => s.id === id);
  if (!story) return <Empty title={t("故事不存在", "Story unavailable")} />;
  return (
    <>
      <PageTitle title={txt(story.title)}>
        {t(
          "伙伴故事 · 虚构示例，不代表真实客户成果",
          "Partnership story · Fictional example, not an actual client outcome",
        )}
      </PageTitle>
      <article className="shell article-body section">
        <img
          className="article-image"
          src="/assets/cys-signal-corridor-light-v2.jpg"
          alt={t(
            "概念图：连接不同空间的通道",
            "Conceptual illustration of connected spaces",
          )}
        />
        {story.body.map((paragraph, i) =>
          i % 2 === 0 ? (
            <h2 key={i}>{txt(paragraph)}</h2>
          ) : (
            <p key={i}>{txt(paragraph)}</p>
          ),
        )}
        <div className="actions">
          <Link
            className="button"
            to={"/contact?topic=" + encodeURIComponent(txt(story.title))}
          >
            {t("交流合作想法", "Discuss a partnership")}
          </Link>
          <Link className="text-link" to="/corridor#stories">
            {t("返回伙伴故事", "All partnership stories")}
            <Arrow />
          </Link>
        </div>
        <h2>{t("继续阅读", "Read next")}</h2>
        {state.stories
          .filter((s) => s.id !== id)
          .slice(0, 2)
          .map((s) => (
            <p key={s.id}>
              <Link to={"/corridor/stories/" + s.id}>{txt(s.title)}</Link>
            </p>
          ))}
      </article>
    </>
  );
}
export function Business() {
  const { t, location, query } = useApp();
  const audience =
    location.searchParams.get("audience") === "financial"
      ? "financial"
      : "business";
  const financial = audience === "financial";
  return (
    <>
      <PageTitle
        title={t(
          "让跨境业务，从容向前。",
          "Move your cross-border business forward.",
        )}
      >
        {t(
          "围绕您的业务，规划合适的支付与合作方案。",
          "Payment and partnership planning shaped around your business.",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <Tabs
            panelId="business-panel"
            label={t("企业类型", "Business audience")}
            value={audience}
            onChange={(id) => query("audience", id)}
            options={[
              {
                id: "financial",
                label: t("金融机构", "Financial institutions"),
              },
              {
                id: "business",
                label: t("跨境企业", "Cross-border corporates"),
              },
            ]}
          />
          <div
            className="business-layout"
            role="tabpanel"
            id="business-panel"
            aria-labelledby={"business-panel-" + audience}
          >
            <div>
              <h2>
                {financial
                  ? t(
                      "以专业流动性，连接您的支付网络。",
                      "Connect your payment network with specialist liquidity.",
                    )
                  : t(
                      "把复杂留给方案，让业务专注前行。",
                      "Let your payment plan support the way you work.",
                    )}
              </h2>
              <p className="lead">
                {financial
                  ? t(
                      "CYS 深耕跨境支付行业四十余年，为金融机构与大型企业提供外汇与支付合作支持，尤其关注亚洲币种间的跨币种交易需求。",
                      "With over four decades in cross-border payments, CYS supports FX and payment partnerships for financial institutions and large corporates, with particular attention to cross-currency needs in Asia.",
                    )
                  : t(
                      "无论是大型企业还是中小型企业，只要您从事跨境贸易，CYS 都能为您探索行之有效的支付方案支持。跨境资金往来不仅是汇兑与结算，也是运营效率与成本控制的重要一环。",
                      "Whether you are a large corporation or a smaller enterprise, CYS can explore payment support for your cross-border trade. Currency exchange and settlement are also questions of operational efficiency and cost control.",
                    )}
              </p>
              <Link className="button" to={"/contact?audience=" + audience}>
                {financial
                  ? t("咨询金融合作", "Discuss financial partnerships")
                  : t("定制企业方案", "Discuss your business needs")}
                <Arrow />
              </Link>
            </div>
            <div className="benefits">
              {(financial
                ? [
                    [
                      t("亚洲外汇流动性", "Asian FX liquidity"),
                      t(
                        "讨论人民币、印尼盾与马来西亚令吉等币种的业务需求。",
                        "Discuss business needs in currencies including CNY, IDR and MYR.",
                      ),
                    ],
                    [
                      t("跨境支付网络", "Cross-border payment network"),
                      t(
                        "围绕目的地、业务模式与结算需求展开合作咨询。",
                        "Explore collaboration around destinations, operating models and settlement needs.",
                      ),
                    ],
                    [
                      t("专业团队协作", "Specialist collaboration"),
                      t(
                        "连接资金交易、现金管理与业务发展方面的专业支持。",
                        "Connect treasury, cash management and business development expertise.",
                      ),
                    ],
                  ]
                : [
                    [
                      t(
                        "企业汇兑与费用安排",
                        "Corporate FX and fee arrangements",
                      ),
                      t(
                        "按业务需求咨询大宗外汇及服务费率。",
                        "Discuss corporate foreign exchange and service fee arrangements.",
                      ),
                    ],
                    [
                      t("灵活的结算方式", "Flexible settlement"),
                      t(
                        "咨询预付、后付，以及单笔外汇交易支持多笔付款的安排。",
                        "Explore prebook, post-pay and multiple-payment arrangements within an FX booking.",
                      ),
                    ],
                    [
                      t("一对一的持续支持", "One-to-one support"),
                      t(
                        "专属客户关系经理，协助规划未来支付需求。",
                        "A designated relationship manager to help plan future payment needs.",
                      ),
                    ],
                  ]
              ).map(([title, body], i) => (
                <article key={title}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="small muted">
            {t(
              "服务说明基于所提供资料，具体可用性与正式条款须进一步确认。",
              "Service descriptions are based on supplied material. Availability and formal terms require confirmation.",
            )}
          </p>
        </div>
      </section>
    </>
  );
}
export function Individual() {
  const { t, txt } = useApp();
  const [selected, setSelected] = useState(uses[0]);
  return (
    <>
      <PageTitle
        title={t(
          "世界很大，生活的连接很近。",
          "A wider world. A more connected life.",
        )}
      >
        {t(
          "个人用户 · 从您的日常需要出发",
          "For individuals · Start with your everyday needs",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <div className="use-grid">
            {uses.map((use, i) => (
              <button
                className={
                  selected.id === use.id ? "use-card selected" : "use-card"
                }
                key={use.id}
                onClick={() => setSelected(use)}
                aria-pressed={selected.id === use.id}
              >
                <span className="use-art" aria-hidden="true">
                  <svg
                    viewBox="0 0 180 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    {i === 0 ? (
                      <>
                        <path d="M35 92V47l55-27 55 27v45H35ZM65 92V60h50v32M25 50l65-33 65 33" />
                        <path d="M80 70h20M90 60v32" />
                      </>
                    ) : i === 1 ? (
                      <>
                        <path d="M49 43h82l10 61H39l10-61Z" />
                        <path d="M70 43V31a20 20 0 0 1 40 0v12M65 59v7m50-7v7" />
                      </>
                    ) : (
                      <>
                        <path d="M30 100h120M45 100V70h20v30M80 100V50h20v50M115 100V25h20v75M40 51l35-24 25 9 35-23m-19 0h19v18" />
                      </>
                    )}
                  </svg>
                </span>
                <small>
                  0{i + 1} / {txt(use.label)}
                </small>
                <h2>{txt(use.title)}</h2>
                <Arrow />
              </button>
            ))}
          </div>
          <div className="use-detail">
            <div>
              <h3>{txt(selected.label)}</h3>
              <p>{txt(selected.body)}</p>
            </div>
            <Link
              className="button"
              to={"/contact?audience=individual&topic=" + selected.id}
            >
              {t("咨询个人方案", "Discuss your needs")}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function HistoryTimeline() {
  const { t, txt } = useApp();
  const [year, setYear] = useState(0);
  return (
    <section id="history" className="section dark timeline-section">
      <div className="timeline-globe">
        <Globe />
      </div>
      <div className="shell timeline-content">
        <div className="section-head">
          <h2>
            {t(
              "每一步，都为下一次连接。",
              "Every chapter opens another connection.",
            )}
          </h2>
          <Counter value={40} suffix="+" />
        </div>
        <div
          className="timeline"
          role="tablist"
          aria-label={t("公司历史", "Company history")}
        >
          {history.map((h, i) => (
            <button
              key={h.year}
              role="tab"
              aria-selected={year === i}
              aria-controls="milestone-detail"
              onMouseEnter={() => setYear(i)}
              onFocus={() => setYear(i)}
              onClick={() => setYear(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : -1) + 5) % 5;
                  e.currentTarget.parentElement.children[next].focus();
                }
              }}
            >
              <span>{h.year}</span>
              <small>{i === 4 ? t("展望", "Outlook") : txt(h.title)}</small>
            </button>
          ))}
        </div>
        <div className="milestone-detail" id="milestone-detail" role="tabpanel">
          <span>{history[year].year}</span>
          <div>
            <h3>{txt(history[year].title)}</h3>
            <p>{txt(history[year].body)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
