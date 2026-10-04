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
  const published = publicPosts(state);
  const tab = ["matching", "consulting", "individual"].includes(
    location.searchParams.get("service"),
  )
    ? location.searchParams.get("service")
    : "matching";
  const paths = [
    [
      t("寻找产品买家卖家", "Find product buyers and sellers"),
      "/forum?category=matching",
    ],
    [
      t("寻找企业跨境方案", "Explore cross-border business solutions"),
      "/business",
    ],
    [t("个人跨境生活", "Personal life across borders"), "/individual"],
  ];
  const services = [
    ["定向找货", "Targeted sourcing", "/forum?intent=supplier"],
    ["采购代理", "Procurement agency", "/business"],
    ["本地经销商", "Local distributors", "/forum?intent=distributor"],
    ["出海资料包装", "Market-entry materials", "/business"],
    ["定向买家匹配", "Targeted buyer matching", "/forum?category=matching"],
    ["当地准入咨询", "Local market-entry consulting", "/business"],
  ];
  const panelServices =
    tab === "individual"
      ? uses.map((use) => [use.label.zh, use.label.en, "/individual"])
      : tab === "consulting"
        ? [
            ["合作伙伴对接", "Partner introductions", "/business"],
            ["上下游资源连接", "Supply-chain connections", "/business"],
            ["行业合规咨询", "Industry compliance consulting", "/business"],
          ]
        : services;
  const panelIntro =
    tab === "individual"
      ? t(
          "海外求学，家庭生活配套，让您更便捷更幸福。",
          "Overseas education and family support for a more convenient, happier life.",
        )
      : tab === "consulting"
        ? t(
            "围绕您的业务，规划合适的方案，匹配合作伙伴。",
            "Plan suitable solutions and find partners around your business.",
          )
        : t(
            "帮助企业跨境发展业务，解决合作发展、合规问题。",
            "Help businesses grow across borders and address partnership development and compliance needs.",
          );
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
                "连接中国与东南亚的可信桥梁，",
                "A trusted bridge connecting China and Southeast Asia.",
              )}
              <em>
                {t(
                  "启迪跨境商业的新可能。",
                  "Opening new possibilities for cross-border business.",
                )}
              </em>
            </h1>
            <p className="hero-description">
              {t(
                "扫除语言障碍 · 合规护航 · 发展商业合作伙伴",
                "Overcome language barriers \u00b7 Navigate compliance \u00b7 Develop business partnerships",
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
                "寻找需求，创造无限可能。",
                "Discover needs. Create limitless possibilities.",
              )}
            </h2>
            <p>
              {t(
                "帮助企业跨境发展业务，解决合作发展、合规问题。",
                "Help businesses grow across borders and address partnership development and compliance needs.",
              )}
            </p>
          </div>
          <Tabs
            panelId="home-services-panel"
            label={t("服务", "Services")}
            value={tab}
            onChange={(id) => query("service", id)}
            options={[
              {
                id: "matching",
                label: t("寻找产品买家卖家", "Buyers & sellers"),
              },
              {
                id: "consulting",
                label: t("寻找企业跨境方案", "Business solutions"),
              },
              { id: "individual", label: t("个人跨境生活", "Personal life") },
            ]}
          />
          <div
            className="services-grid"
            role="tabpanel"
            id="home-services-panel"
            aria-labelledby={"home-services-panel-" + tab}
          >
            <div>
              <p className="lead">{panelIntro}</p>
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
                {tab === "individual"
                  ? t(
                      "服务于高净值人群的家庭服务。",
                      "Family support for high-net-worth individuals.",
                    )
                  : t(
                      "您的行业，您的机遇。",
                      "Your industry. Your opportunity.",
                    )}
              </h3>
              <div className="industry-grid">
                {panelServices.map(([zh, en, path], i) => (
                  <Link key={path + i} to={path}>
                    <span className="industry-symbol" aria-hidden="true">
                      {["◒", "⌁", "▧", "◇", "↗", "⊕"][i]}
                    </span>
                    {t(zh, en)}
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
                "从寻找伙伴到跨越语言，从对接资源到落地经营，我们愿成为您拓展新加坡商业版图的同行者。",
                "From finding partners and overcoming language barriers to connecting resources and establishing operations, we aim to accompany your business expansion in Singapore.",
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
                "从择校到创业，从置业到安居，我们愿成为您新加坡生活每一步的同行者。",
                "From choosing schools and starting a business to finding a home and settling in, we aim to accompany every step of your life in Singapore.",
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
        {t("关于我们 · 审阅预览", "About us \u00b7 Review preview")}
      </PageTitle>
      <section id="intro" className="section text-reveal">
        <div className="shell editorial-grid">
          <h2>
            {t(
              "衔接商业与人脉，建立良好发展关系，是我们始终坚持的事。",
              "Connecting business and people and building relationships for growth is our enduring commitment.",
            )}
          </h2>
          <div>
            <p className="lead">
              <RevealText>
                {t(
                  "自1981年创立于新加坡，是一家深耕本地市场四十余年的专业服务机构。四十年来，我们始终专注于服务对品质与信任抱有更高期待的客户，在新加坡这片多元而活跃的商业土壤上，逐步积累起横跨置业、企业服务、法律、教育等领域的广泛人脉与合作网络。我们相信，真正的价值不在于一次交易，而在于长期、审慎、值得托付的陪伴——这也是我们四十余年不变的坚持。",
                  "Established in Singapore in 1981, this professional service organisation has spent more than forty years developing local expertise. It serves clients who value quality and trust, building relationships across property, business services, law and education in Singapore\u2019s diverse commercial community. Its enduring commitment is to careful, dependable, long-term support.",
                )}
              </RevealText>
            </p>
            <p>
              {t(
                "坚持为每一个客户提供一对一的专业咨询和方案规划，我们希望为客户提供更多元的合作可能。我们以包容、创新和启迪为核心，连接各类企业服务提供商，促进合作与共赢。",
                "We are committed to one-to-one professional consultation and solution planning, opening more possibilities for partnership. Inclusion, innovation and inspiration guide a community connecting business service providers.",
              )}
            </p>
            <p className="small muted">
              {t(
                "客户提供的历史文案待确认；新经营主体的成立时间及许可情况尚未核实。",
                "Client-supplied history awaits confirmation. The new operator’s founding date and licensing status are unverified.",
              )}
            </p>
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
                  "年 · 专注企业与高净值人群服务",
                  "years focused on serving businesses and high-net-worth individuals",
                )}
              </p>
            </div>
            <div>
              <h2>
                {t("与伙伴共同向前。", "Moving forward with our partners.")}
              </h2>
              <p>
                {t(
                  "四十余年来，我们见证并参与了中国与新加坡之间商业往来的成长。这条“中新合作走廊”，汇聚了我们在本地市场积累的伙伴与投资者网络，也记录着一段段跨境合作从初识到成就的真实故事——希望能让每一位踏上这条走廊的伙伴，都能找到值得信赖的同行者。",
                  "For more than forty years, we have witnessed and participated in growing business ties between China and Singapore. This China\u2013Singapore corridor brings together our local partner and investor networks and stories of cross-border collaboration, with the hope that every participant finds a trusted companion.",
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
                "每一段合作，都值得被记录。",
                "Every partnership deserves to be recorded.",
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
  const { t } = useApp();
  const services = [
    [
      "合作伙伴对接",
      "Partner introductions",
      "依据行业与需求，引荐合适的本地合作方。",
      "Introduce suitable local partners based on industry and needs.",
    ],
    [
      "上下游资源连接",
      "Supply-chain connections",
      "打通供应链，寻找匹配的供应商与经销渠道。",
      "Connect supply chains with suitable suppliers and distribution channels.",
    ],
    [
      "行业合规咨询",
      "Industry compliance consulting",
      "按行业特性，提供本地经营合规方面的建议与资源对接。",
      "Provide guidance and resource introductions for local operating compliance based on industry needs.",
    ],
  ];
  return (
    <>
      <PageTitle
        title={t(
          "让跨境业务，从容向前。",
          "Move your cross-border business forward.",
        )}
      >
        {t(
          "围绕您的业务，规划合适的方案，匹配合作伙伴。",
          "Plan suitable solutions and find partners around your business.",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <div className="business-layout">
            <div>
              <h2>
                {t(
                  "把复杂留给方案，让业务专注前行。",
                  "A clear plan to move your business forward.",
                )}
              </h2>
              <p className="lead">
                {t(
                  "无论企业规模大小，跨境业务总免不了门槛与阻碍。您从不缺经验与眼光，缺的，或许只是一扇通往新市场的门。",
                  "Whatever the size of your business, cross-border growth comes with barriers. You have the experience and vision; perhaps you simply need a door into a new market.",
                )}
              </p>
              <Link className="button" to="/contact?audience=business">
                {t("定制企业方案", "Discuss your business needs")}
                <Arrow />
              </Link>
            </div>
            <div className="benefits">
              {services.map(([zh, en, bodyZh, bodyEn], i) => (
                <article key={zh}>
                  <span>0{i + 1}</span>
                  <h3>{t(zh, en)}</h3>
                  <p>{t(bodyZh, bodyEn)}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="small muted">
            {t(
              "服务说明供审阅；具体可用性与正式条款待客户确认。",
              "Service descriptions are for review. Availability and final terms await client confirmation.",
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
          "服务于高净值人群的家庭服务。",
          "Family support for high-net-worth individuals.",
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
              "每一步，都为下一次合作。",
              "Every step prepares for the next partnership.",
            )}
          </h2>
          <div>
            <Counter value={40} suffix="+" />
            <p>
              {t(
                "年 · 专注企业与高净值人群服务",
                "years focused on businesses and high-net-worth individuals",
              )}
            </p>
          </div>
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
        <p className="small muted">
          {t(
            "客户历史文案供审阅；新主体及许可情况待确认。",
            "Client history for review; new operator and licensing status await confirmation.",
          )}
        </p>
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
