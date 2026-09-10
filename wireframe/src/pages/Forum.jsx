import { useEffect, useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import {
  Arrow,
  Button,
  Empty,
  Field,
  Form,
  MarketChecks,
  Modal,
  Notice,
  PageTitle,
  Select,
  Status,
} from "../components/ui.jsx";
import {
  categories,
  industries,
  intents,
  markets,
} from "../content/catalog.js";
import { publicPosts, visibleComments, visiblePost } from "../mock/service.js";
import { PostRows } from "./Marketing.jsx";
export function ForumNav() {
  const { t } = useApp();
  return (
    <nav className="forum-nav">
      <Link to="/forum">{t("全部帖子", "All listings")}</Link>
      <Link to="/forum/categories">{t("话题分类", "Topics")}</Link>
      <Link to="/forum/members">{t("企业名录", "Companies")}</Link>
      <Link to="/me/forum">{t("我的社群", "My community")}</Link>
      <Link to="/forum/rules">{t("社群规则", "Rules")}</Link>
    </nav>
  );
}
export function Forum({ categoryId = "" }) {
  const {
    state,
    t,
    txt,
    location,
    query,
    go,
    session,
    gate,
    act,
    toast,
    errorText,
    busy,
    scenario,
    setScenario,
  } = useApp();
  const [search, setSearch] = useState(location.searchParams.get("q") || ""),
    [filtersOpen, setFiltersOpen] = useState(false),
    [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const category = categoryId || location.searchParams.get("category") || "",
    industry = location.searchParams.get("industry") || "",
    market = location.searchParams.get("market") || "",
    intent = location.searchParams.get("intent") || "",
    sort = location.searchParams.get("sort") || "latest",
    q = location.searchParams.get("q") || "";
  const [filterDraft, setFilterDraft] = useState({ industry, market, intent });
  useEffect(() => {
    setSearch(q);
  }, [q]);
  useEffect(() => {
    if (scenario === "list-error") setLoadError(true);
    if (scenario !== "loading") return;
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setScenario("default");
    }, 1200);
    return () => clearTimeout(timer);
  }, [scenario, location.searchParams.get("page")]);
  let posts = publicPosts(state).filter(
    (p) =>
      (!category || p.category === category) &&
      (!industry || p.industry === industry) &&
      (!market || p.markets.includes(market)) &&
      (!intent || p.intent === intent) &&
      (!q ||
        JSON.stringify([
          p.title,
          p.body,
          p.product,
          state.profiles.find((a) => a.id === p.authorId)?.name,
        ])
          .toLowerCase()
          .includes(q.toLowerCase())),
  );
  if (sort === "featured") posts = posts.filter((p) => p.featured);
  if (sort === "trending") {
    const score = (p) =>
      state.reactions.filter((r) => r.targetId === p.id).length * 2 +
      state.comments.filter((c) => c.postId === p.id && c.status === "approved")
        .length;
    posts.sort((a, b) => score(b) - score(a) || b.publishedAt - a.publishedAt);
  }
  const pages = Math.max(1, Math.ceil(posts.length / 6)),
    page = Math.min(
      pages,
      Math.max(1, Number(location.searchParams.get("page")) || 1),
    );
  const follow = (id) =>
    gate(async () => {
      try {
        await act("follow", { id });
      } catch (e) {
        toast(errorText(e));
      }
    });
  const filters = (value, change) => (
    <>
      <Select
        label={t("行业", "Industry")}
        value={value.industry}
        onChange={(v) => change("industry", v)}
        options={industries}
        all
      />
      <Select
        label={t("市场", "Market")}
        value={value.market}
        onChange={(v) => change("market", v)}
        options={markets}
        all
      />
      <Select
        label={t("合作意向", "Partnership intent")}
        value={value.intent}
        onChange={(v) => change("intent", v)}
        options={intents}
        all
      />
    </>
  );
  return (
    <>
      <PageTitle compact dark title={t("华商论坛", "Chinese Business Forum")}>
        {t(
          "清晰的需求，合适的伙伴。连接中国与东南亚的商业对话。",
          "Clear needs. The right partners. Business conversations connecting China and Southeast Asia.",
        )}
      </PageTitle>
      <section className="section forum-section">
        <div className="shell">
          <ForumNav />
          <div className="forum-toolbar">
            <form
              className="search-form"
              onSubmit={(e) => {
                e.preventDefault();
                const url = new URL(location);
                url.searchParams.set("q", search);
                url.searchParams.delete("page");
                go("/forum/search" + url.search);
              }}
            >
              <label className="sr-only" htmlFor="forum-search">
                {t("搜索论坛", "Search forum")}
              </label>
              <input
                id="forum-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(
                  "搜索产品、公司或需求",
                  "Search products, companies or needs",
                )}
              />
              <Button type="submit">{t("搜索", "Search")}</Button>
            </form>
            <Button onClick={() => gate(() => go("/forum/new"))}>
              {t("发布合作需求", "Create a listing")}
              <Arrow />
            </Button>
          </div>
          <div className="forum-layout">
            <aside className="forum-sidebar">
              <h2>{t("发现话题", "Explore topics")}</h2>
              <Link className={!category ? "selected" : ""} to="/forum">
                {t("全部内容", "All listings")}
                <span>{publicPosts(state).length}</span>
              </Link>
              {categories.map((c) => (
                <div className="category-line" key={c.id}>
                  <Link
                    className={category === c.id ? "selected" : ""}
                    to={"/forum?category=" + c.id}
                  >
                    {txt(c)}
                    <span>
                      {
                        publicPosts(state).filter((p) => p.category === c.id)
                          .length
                      }
                    </span>
                  </Link>
                  <button
                    disabled={busy}
                    aria-label={t("关注", "Follow") + " " + txt(c)}
                    aria-pressed={state.follows.some(
                      (f) => f.authorId === session.id && f.targetId === c.id,
                    )}
                    onClick={() => follow(c.id)}
                  >
                    {state.follows.some(
                      (f) => f.authorId === session.id && f.targetId === c.id,
                    )
                      ? "✓"
                      : "+"}
                  </button>
                </div>
              ))}
              <h3>{t("我关注的话题", "Followed topics")}</h3>
              {state.follows.filter((f) => f.authorId === session.id).length ? (
                state.follows
                  .filter((f) => f.authorId === session.id)
                  .map((f) => (
                    <Link key={f.targetId} to={"/forum?category=" + f.targetId}>
                      {txt(categories.find((c) => c.id === f.targetId))}
                    </Link>
                  ))
              ) : (
                <p className="small muted">
                  {t(
                    "关注话题，方便下次探索。",
                    "Follow a topic to find it here next time.",
                  )}
                </p>
              )}
            </aside>
            <div className="forum-main">
              <div className="desktop-filters">
                {filters({ industry, market, intent }, query)}
              </div>
              <Button
                secondary
                className="mobile-filter-trigger"
                onClick={() => {
                  setFilterDraft({ industry, market, intent });
                  setFiltersOpen(true);
                }}
              >
                {t("筛选", "Filters")}
              </Button>
              <div className="results-bar">
                <span>
                  {posts.length} {t("条合作信息", "listings")}
                </span>
                <Field label={t("排序", "Sort")}>
                  <select
                    value={sort}
                    onChange={(e) => query("sort", e.target.value)}
                  >
                    <option value="latest">{t("最新", "Latest")}</option>
                    <option value="trending">{t("热门", "Trending")}</option>
                    <option value="featured">{t("精选", "Featured")}</option>
                  </select>
                </Field>
              </div>
              {(q || category || industry || market || intent) && (
                <div className="applied-filters">
                  {[
                    q,
                    txt(categories.find((c) => c.id === category)),
                    txt(industries.find((c) => c.id === industry)),
                    txt(markets.find((c) => c.id === market)),
                    txt(intents.find((c) => c.id === intent)),
                  ]
                    .filter(Boolean)
                    .map((text) => (
                      <span key={text}>{text}</span>
                    ))}
                  <Link to="/forum">{t("清除筛选", "Clear filters")}</Link>
                </div>
              )}
              {loading ? (
                <div
                  className="list-skeleton"
                  role="status"
                  aria-label={t("正在加载帖子…", "Loading listings…")}
                >
                  <p>{t("正在加载帖子…", "Loading listings…")}</p>
                  {[1, 2, 3].map((n) => (
                    <div key={n}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <Notice error>
                  <p>{t("列表暂时无法加载。", "The list could not load.")}</p>
                  <Button
                    onClick={() => {
                      setLoadError(false);
                      setScenario("default");
                    }}
                  >
                    {t("重试", "Retry")}
                  </Button>
                </Notice>
              ) : posts.length ? (
                <PostRows posts={posts.slice((page - 1) * 6, page * 6)} />
              ) : (
                <Empty />
              )}
              <nav className="pagination" aria-label={t("分页", "Pagination")}>
                <Button
                  secondary
                  disabled={page <= 1}
                  onClick={() => query("page", String(page - 1))}
                >
                  {t("上一页", "Previous")}
                </Button>
                <span>
                  {page} / {pages}
                </span>
                <Button
                  secondary
                  disabled={page >= pages}
                  onClick={() => query("page", String(page + 1))}
                >
                  {t("下一页", "Next")}
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </section>
      {filtersOpen && (
        <Modal
          title={t("筛选合作机会", "Filter opportunities")}
          onClose={() => setFiltersOpen(false)}
        >
          {filters(filterDraft, (k, v) =>
            setFilterDraft((d) => ({ ...d, [k]: v })),
          )}
          <div className="actions">
            <Button
              onClick={() => {
                const url = new URL(location);
                Object.entries(filterDraft).forEach(([k, v]) =>
                  v ? url.searchParams.set(k, v) : url.searchParams.delete(k),
                );
                url.searchParams.delete("page");
                go(url.pathname + url.search);
                setFiltersOpen(false);
              }}
            >
              {t("应用筛选", "Apply filters")}
            </Button>
            <Button
              secondary
              onClick={() =>
                setFilterDraft({ industry: "", market: "", intent: "" })
              }
            >
              {t("清除", "Clear")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Categories() {
  const { state, t, txt } = useApp();
  return (
    <>
      <PageTitle compact title={t("发现您的话题", "Find your conversation")} />
      <section className="section">
        <div className="shell">
          <ForumNav />
          <div className="category-grid">
            {categories.map((c, i) => (
              <Link key={c.id} to={"/forum/category/" + c.id}>
                <span className="index">0{i + 1}</span>
                <h2>{txt(c)}</h2>
                <p>
                  {publicPosts(state).filter((p) => p.category === c.id).length}{" "}
                  {t("条已发布内容", "published listings")}
                </p>
                <Arrow />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
export function Gate({ children }) {
  const { session, t, location } = useApp();
  if (!session.id)
    return (
      <section className="shell section">
        <Empty
          title={t(
            "登录后，继续这次对话。",
            "Sign in to continue the conversation.",
          )}
        >
          <Link
            className="button"
            to={
              "/auth?return=" +
              encodeURIComponent(location.pathname + location.search)
            }
          >
            {t("登录演示账户", "Sign in to demo")}
          </Link>
        </Empty>
      </section>
    );
  return children;
}
export function PostDetail({ id }) {
  const {
    state,
    session,
    t,
    txt,
    gate,
    act,
    busy,
    toast,
    errorText,
    go,
    lang,
  } = useApp();
  const [comment, setComment] = useState(""),
    [parentId, setParentId] = useState(null),
    [error, setError] = useState(null),
    [share, setShare] = useState(false);
  const post = visiblePost(state, id, session),
    published = publicPosts(state).find((p) => p.id === id);
  if (!post)
    return <Empty title={t("此内容无法查看", "This listing is unavailable")} />;
  const profile = state.profiles.find((p) => p.id === post.authorId),
    comments = visibleComments(state, id, session);
  const toggle = (action) =>
    gate(async () => {
      try {
        await act(action, { id });
      } catch (e) {
        toast(errorText(e));
      }
    });
  const submit = (e) => {
    e.preventDefault();
    gate(async () => {
      setError(null);
      try {
        const result = await act("comment", {
          postId: id,
          body: comment,
          parentId,
        });
        if (result) {
          setComment("");
          setParentId(null);
        }
      } catch (e) {
        setError(e);
      }
    });
  };
  const Comment = ({ c }) => (
    <article className={"comment " + (c.parentId ? "reply" : "")}>
      <div className="post-meta">
        <Link to={"/forum/member/" + c.authorId}>
          {txt(state.profiles.find((p) => p.id === c.authorId)?.name)}
        </Link>
        {c.status !== "approved" && <Status status={c.status} />}
      </div>
      <p>{txt(c.body)}</p>
      {c.status === "pending" && (
        <p className="small muted">
          {t(
            "审核中 · 仅作者与审核员可见",
            "Under review · Visible only to the author and moderator",
          )}
        </p>
      )}
      {c.status === "approved" && !c.parentId && (
        <button
          className="plain"
          onClick={() =>
            gate(() => {
              setParentId(c.id);
              document.getElementById("comment-body")?.focus();
            })
          }
        >
          {t("回复", "Reply")}
        </button>
      )}
    </article>
  );
  return (
    <section className="section">
      <div className="shell">
        <ForumNav />
        <Link className="text-link" to="/forum">
          <Arrow back />
          {t("返回论坛", "Back to forum")}
        </Link>
        <div className="detail-layout">
          <article>
            <div className="post-category">
              {txt(categories.find((c) => c.id === post.category))}
              <Status status={post.removed ? "removed" : post.status} />
            </div>
            <h1>{txt(post.title)}</h1>
            {post.publishedRevisionId &&
              post.publishedRevisionId !== post.revisionId && (
                <Notice>
                  {t(
                    "您正在查看私有修改版本。访客仍看到上次已发布内容。",
                    "You are viewing a private revision. Visitors still see the last published version.",
                  )}
                </Notice>
              )}
            {post.reason && <Notice error>{txt(post.reason)}</Notice>}
            <p className="post-meta">
              {txt(profile.name)} ·{" "}
              {new Date(post.createdAt).toISOString().slice(0, 10)}
            </p>
            <dl className="context-grid">
              <div>
                <dt>{t("产品与服务", "Product / service")}</dt>
                <dd>{txt(post.product)}</dd>
              </div>
              <div>
                <dt>{t("合作意向", "Partnership intent")}</dt>
                <dd>{txt(intents.find((i) => i.id === post.intent))}</dd>
              </div>
              <div>
                <dt>{t("市场", "Markets")}</dt>
                <dd>
                  {post.markets
                    .map((m) => txt(markets.find((x) => x.id === m)))
                    .join(" · ")}
                </dd>
              </div>
            </dl>
            <div className="post-body">{txt(post.body)}</div>
            <p className="small muted">
              {t(
                "示例商业信息 · 新输入的内容保留原始语言",
                "Sample business listing · Newly entered content keeps its original language",
              )}
            </p>
            <div className="actions">
              {published && (
                <>
                  <Button
                    secondary
                    disabled={busy}
                    aria-pressed={state.reactions.some(
                      (r) => r.authorId === session.id && r.targetId === id,
                    )}
                    onClick={() => toggle("reaction")}
                  >
                    {t("有用", "Useful")} ·{" "}
                    {state.reactions.filter((r) => r.targetId === id).length}
                  </Button>
                  <Button
                    secondary
                    disabled={busy}
                    aria-pressed={state.bookmarks.some(
                      (r) => r.authorId === session.id && r.targetId === id,
                    )}
                    onClick={() => toggle("bookmark")}
                  >
                    {state.bookmarks.some(
                      (r) => r.authorId === session.id && r.targetId === id,
                    )
                      ? t("已收藏", "Saved")
                      : t("收藏", "Save")}
                  </Button>
                  <Button
                    secondary
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.origin +
                            "/forum/post/" +
                            id +
                            "?lang=" +
                            lang,
                        );
                        toast(t("链接已复制", "Link copied"));
                      } catch {
                        setShare(true);
                      }
                    }}
                  >
                    {t("分享", "Share")}
                  </Button>
                  <Link to={"/forum/report/" + id}>{t("举报", "Report")}</Link>
                </>
              )}
              {post.authorId === session.id &&
                !post.removed &&
                post.status !== "pending" && (
                  <Link className="button secondary" to={"/forum/edit/" + id}>
                    {t("编辑帖子", "Edit listing")}
                  </Link>
                )}
            </div>
            <section className="comments">
              <h2>{t("交流与评论", "Conversation")}</h2>
              {comments.length ? (
                comments
                  .filter((c) => !c.parentId)
                  .map((c) => (
                    <div key={c.id}>
                      <Comment c={c} />
                      {comments
                        .filter((r) => r.parentId === c.id)
                        .map((r) => (
                          <Comment key={r.id} c={r} />
                        ))}
                    </div>
                  ))
              ) : (
                <p>
                  {t(
                    "暂时没有评论，欢迎开启交流。",
                    "No comments yet. Start the conversation.",
                  )}
                </p>
              )}
              {published && (
                <Form error={error} onSubmit={submit}>
                  <Field
                    label={t(
                      "您的评论（2–1,000 字）",
                      "Your comment (2–1,000 characters)",
                    )}
                  >
                    <textarea
                      id="comment-body"
                      name="body"
                      value={comment}
                      maxLength={1000}
                      rows={4}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Field>
                  {parentId && (
                    <p>
                      {t("回复已选评论", "Replying to selected comment")}{" "}
                      <button type="button" onClick={() => setParentId(null)}>
                        {t("取消", "Cancel")}
                      </button>
                    </p>
                  )}
                  {error && <Notice error>{errorText(error)}</Notice>}
                  <Button type="submit" disabled={busy}>
                    {t("提交审核", "Submit for review")}
                  </Button>
                </Form>
              )}
            </section>
          </article>
          <aside className="company-panel">
            <div className="avatar">{txt(profile.name).slice(0, 2)}</div>
            <h2>{txt(profile.name)}</h2>
            {profile.verified && (
              <span className="status approved">
                ✓ {t("演示认证", "Demo verification")}
              </span>
            )}
            <p>{txt(profile.intro)}</p>
            <p>{t("虚构企业资料", "Fictional company profile")}</p>
            <Link className="text-link" to={"/forum/member/" + profile.id}>
              {t("查看企业资料", "View company")}
              <Arrow />
            </Link>
            {published && (
              <Button onClick={() => gate(() => go("/contact?post=" + id))}>
                {t("建立联系", "Connect")}
              </Button>
            )}
          </aside>
        </div>
      </div>
      {share && (
        <Modal
          title={t("分享链接", "Share link")}
          onClose={() => setShare(false)}
        >
          <Field
            label={t("复制此链接", "Copy this link")}
            readOnly
            value={
              window.location.origin + "/forum/post/" + id + "?lang=" + lang
            }
            onFocus={(e) => e.target.select()}
          />
        </Modal>
      )}
    </section>
  );
}
export function Composer({ id }) {
  const { state, session, txt, t, act, busy, errorText, dirty, lang } =
    useApp();
  const existing = id ? visiblePost(state, id, session) : null;
  const [data, setData] = useState(() => ({
    title: existing ? txt(existing.title) : "",
    body: existing ? txt(existing.body) : "",
    category: existing?.category || "matching",
    industry: existing?.industry || "food",
    product: existing ? txt(existing.product) : "",
    markets: existing?.markets || ["SG"],
    intent: existing?.intent || "distributor",
    rules: false,
  }));
  const [preview, setPreview] = useState(false),
    [result, setResult] = useState(null),
    [error, setError] = useState(null),
    [savedId, setSavedId] = useState(id);
  useEffect(
    () => () => {
      dirty.current = false;
    },
    [],
  );
  if (!session.id) return <Gate />;
  if (id && (!existing || existing.authorId !== session.id || existing.removed))
    return (
      <Empty title={t("无法编辑此内容", "This listing cannot be edited")} />
    );
  if (existing?.status === "pending" && !result)
    return (
      <Empty title={t("此版本正在审核", "This revision is under review")}>
        <Link to="/me/posts">{t("返回我的帖子", "Back to my listings")}</Link>
      </Empty>
    );
  const change = (key, value) => {
    setData((d) => ({ ...d, [key]: value }));
    dirty.current = true;
    setResult(null);
  };
  const save = async (draft) => {
    setError(null);
    try {
      const result = await act("post", {
        ...data,
        id: savedId,
        draft,
        locale: lang,
      });
      if (result) {
        setResult(result);
        setSavedId(result.id);
        dirty.current = false;
      }
    } catch (e) {
      setError(e);
    }
  };
  return (
    <>
      <PageTitle
        compact
        title={
          id
            ? t("完善您的合作需求", "Refine your partnership request")
            : t(
                "下一次合作，从您的需求开始。",
                "Your next partnership starts with a clear need.",
              )
        }
      >
        {t(
          "请使用虚构业务资料。审核通过后才会公开。",
          "Use fictional business details. Publication follows approval.",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell composer-layout">
          <Form
            error={error}
            onSubmit={(e) => {
              e.preventDefault();
              save(false);
            }}
            noValidate
          >
            <h2>{t("业务背景", "Business context")}</h2>
            <div className="form-grid">
              <Select
                label={t("分类 *", "Category *")}
                name="category"
                value={data.category}
                onChange={(v) => change("category", v)}
                options={categories}
              />
              <Select
                label={t("行业 *", "Industry *")}
                name="industry"
                value={data.industry}
                onChange={(v) => change("industry", v)}
                options={industries}
              />
            </div>
            <Field
              label={t(
                "产品或服务 *（2–100 字）",
                "Product or service * (2–100 characters)",
              )}
              maxLength={100}
              name="product"
              value={data.product}
              onChange={(e) => change("product", e.target.value)}
            />
            <h2>{t("您希望寻找", "What you are seeking")}</h2>
            <Select
              label={t("合作意向 *", "Partnership intent *")}
              name="intent"
              value={data.intent}
              onChange={(v) => change("intent", v)}
              options={intents}
            />
            <MarketChecks
              legend={t("目标市场 *（1–5 个）", "Target markets * (1–5)")}
              options={markets}
              name="markets"
              value={data.markets}
              onChange={(v) => change("markets", v)}
            />
            <h2>{t("合作内容", "Your listing")}</h2>
            <Field
              label={t("标题 *（8–100 字）", "Title * (8–100 characters)")}
              name="title"
              value={data.title}
              maxLength={100}
              onChange={(e) => change("title", e.target.value)}
            />
            <small>{data.title.length} / 100</small>
            <Field
              label={t(
                "正文 *（30–3,000 字）",
                "Description * (30–3,000 characters)",
              )}
            >
              <textarea
                name="body"
                value={data.body}
                maxLength={3000}
                rows={9}
                onChange={(e) => change("body", e.target.value)}
              />
            </Field>
            <small>{data.body.length} / 3,000</small>
            <label className="check">
              <input
                type="checkbox"
                checked={data.rules}
                onChange={(e) => change("rules", e.target.checked)}
              />
              {t(
                "我已阅读社群规则，并仅使用虚构资料。",
                "I have read the community rules and use fictional details only.",
              )}
              <Link to="/forum/rules">{t("社群规则", "Community rules")}</Link>
            </label>
            {error && <Notice error>{errorText(error)}</Notice>}
            {result && (
              <Notice>
                <Status status={result.status} />
                <p>
                  {result.status === "pending"
                    ? t(
                        "已提交，审核通过后将公开显示。",
                        "Submitted. Your post will appear after approval.",
                      )
                    : result.status === "rejected"
                      ? t(
                          "此内容未通过审核。请根据提示修改后重新提交。",
                          "This content was not approved. Review the guidance, edit and resubmit.",
                        )
                      : t(
                          "草稿已保存，可以继续编辑。",
                          "Draft saved. You can keep editing.",
                        )}
                </p>
                <Link to="/me/posts">
                  {t("查看我的帖子", "View my listings")}
                </Link>
              </Notice>
            )}
            <div className="actions">
              <Button
                type="submit"
                disabled={busy || result?.status === "pending"}
              >
                {busy
                  ? t("正在保存…", "Saving…")
                  : t("提交审核", "Submit for review")}
              </Button>
              <Button
                secondary
                disabled={busy || result?.status === "pending"}
                onClick={() => save(true)}
              >
                {t("保存草稿", "Save draft")}
              </Button>
              <Button secondary onClick={() => setPreview(true)}>
                {t("预览帖子", "Preview listing")}
              </Button>
            </div>
          </Form>
          <aside className="composer-help">
            <h3>
              {t(
                "好的需求，更容易遇见合适伙伴。",
                "Clear needs find better partners.",
              )}
            </h3>
            <ol>
              <li>{t("说明您提供什么。", "Explain what you offer.")}</li>
              <li>
                {t(
                  "写明合作对象与目标市场。",
                  "Name the partner and market you seek.",
                )}
              </li>
              <li>
                {t("提供可讨论的具体下一步。", "Suggest a concrete next step.")}
              </li>
            </ol>
            <p>
              {t(
                "高、中风险默认不予通过；低风险、英文与不确定内容进入人工审核演示。",
                "High and mid risk are blocked by default. Low-risk, English and uncertain content enter manual demo review.",
              )}
            </p>
            <p>
              {t(
                "不展示真实联系资料，不承诺收益，不冒充他人。",
                "Do not expose real contact details, promise returns or impersonate others.",
              )}
            </p>
          </aside>
        </div>
      </section>
      {preview && (
        <Modal
          title={t("帖子预览", "Listing preview")}
          onClose={() => setPreview(false)}
        >
          <div className="post-category">
            {txt(categories.find((c) => c.id === data.category))}
          </div>
          <h2>{data.title || t("尚未填写标题", "Title not entered")}</h2>
          <p>
            {data.product} · {data.markets.join(" / ")}
          </p>
          <p className="post-body">
            {data.body || t("尚未填写正文", "Description not entered")}
          </p>
          <Status status="draft" />
        </Modal>
      )}
    </>
  );
}
export function Report({ id }) {
  const { state, t, act, busy, errorText } = useApp();
  const [reason, setReason] = useState("misleading"),
    [message, setMessage] = useState(""),
    [error, setError] = useState(null),
    [receipt, setReceipt] = useState(null);
  if (!publicPosts(state).some((p) => p.id === id))
    return <Empty title={t("内容不存在", "Listing unavailable")} />;
  return (
    <Gate>
      <PageTitle
        compact
        title={t(
          "帮助我们维护可信的社群。",
          "Help us keep this community trustworthy.",
        )}
      />
      <section className="section shell article-body">
        <Form
          error={error}
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const response = await act("report", {
                postId: id,
                reason,
                message,
              });
              if (response) setReceipt(response.id);
            } catch (e) {
              setError(e);
            }
          }}
        >
          <Field label={t("举报原因", "Report reason")}>
            <select
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {[
                ["misleading", "误导性内容", "Misleading content"],
                ["spam", "垃圾信息", "Spam"],
                ["abuse", "不当行为", "Abuse"],
                ["other", "其他", "Other"],
              ].map(([value, zh, en]) => (
                <option key={value} value={value}>
                  {t(zh, en)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={t(
              "说明（10–2,000 字）",
              "Explanation (10–2,000 characters)",
            )}
          >
            <textarea
              rows={6}
              maxLength={2000}
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
          <p>
            {t(
              "举报仅供审核，不会立即移除帖子。请勿输入真实个人资料。",
              "Reports go to review and do not immediately remove the listing. Do not enter real personal details.",
            )}
          </p>
          {error && <Notice error>{errorText(error)}</Notice>}
          {receipt ? (
            <Notice>
              {t(
                "举报已记录，未发送任何邮件。",
                "Report recorded. No email was sent.",
              )}{" "}
              {receipt}
            </Notice>
          ) : (
            <Button type="submit" disabled={busy}>
              {t("提交举报", "Submit report")}
            </Button>
          )}
          <p>
            <Link to="/forum/rules">
              {t("阅读社群规则", "Read community rules")}
            </Link>
          </p>
        </Form>
      </section>
    </Gate>
  );
}
export function Members({ id }) {
  const { state, txt, t, gate, go } = useApp();
  const [search, setSearch] = useState(""),
    [industry, setIndustry] = useState("");
  const profile = state.profiles.find((p) => p.id === id);
  if (id && !profile)
    return <Empty title={t("企业资料不存在", "Company unavailable")} />;
  const list = state.profiles.filter(
    (p) =>
      p.preferences?.profileVisible !== false &&
      (!industry || p.industry === industry) &&
      JSON.stringify([p.name, p.intro])
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        compact
        title={
          profile
            ? txt(profile.name)
            : t("认识下一位合作伙伴。", "Meet your next business partner.")
        }
      >
        {t(
          "企业名录 · 所有资料均为虚构示例",
          "Company directory · All profiles are fictional examples",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <ForumNav />
          {profile ? (
            <>
              <div className="profile-hero">
                <div className="avatar">{txt(profile.name).slice(0, 2)}</div>
                <div>
                  <h2>{txt(profile.name)}</h2>
                  {profile.verified && (
                    <span className="status approved">
                      ✓ {t("演示认证", "Demo verification")}
                    </span>
                  )}
                  <p>{txt(profile.intro)}</p>
                  <p>
                    {txt(industries.find((i) => i.id === profile.industry))} ·{" "}
                    {profile.markets.join(" / ")}
                  </p>
                  <Button
                    onClick={() =>
                      gate(() =>
                        go(
                          "/contact?topic=" +
                            encodeURIComponent(txt(profile.name)),
                        ),
                      )
                    }
                  >
                    {t("建立联系", "Connect")}
                  </Button>
                </div>
              </div>
              <h2>{t("已发布合作需求", "Published partnership requests")}</h2>
              <PostRows
                posts={publicPosts(state).filter((p) => p.authorId === id)}
              />
            </>
          ) : (
            <>
              <div className="form-grid">
                <Field
                  label={t("搜索企业", "Search companies")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  label={t("行业", "Industry")}
                  value={industry}
                  onChange={setIndustry}
                  options={industries}
                  all
                />
              </div>
              <div className="members-grid">
                {list.map((p) => (
                  <article key={p.id}>
                    <div className="avatar">{txt(p.name).slice(0, 2)}</div>
                    <h2>
                      <Link to={"/forum/member/" + p.id}>{txt(p.name)}</Link>
                    </h2>
                    <p>
                      {txt(industries.find((i) => i.id === p.industry))} ·{" "}
                      {p.markets.join(" / ")}
                    </p>
                    {p.verified && (
                      <span className="status approved">
                        ✓ {t("演示认证", "Demo verification")}
                      </span>
                    )}
                    <p className="excerpt">{txt(p.intro)}</p>
                    <Link className="text-link" to={"/forum/member/" + p.id}>
                      {t("了解企业", "View company")}
                      <Arrow />
                    </Link>
                  </article>
                ))}
              </div>
              {!list.length && <Empty />}
            </>
          )}
        </div>
      </section>
    </>
  );
}
export function Rules() {
  const { t } = useApp();
  return (
    <>
      <PageTitle
        compact
        title={t(
          "让每一次交流，都值得信任。",
          "Make every conversation worth trusting.",
        )}
      >
        {t("社群规则 · 演示政策", "Community rules · Demo policy")}
      </PageTitle>
      <section className="shell section article-body">
        {[
          [
            "真实而清晰",
            "Be clear and honest",
            "请说明您的产品、服务与合作需求。仅使用虚构示例，不冒充他人，不发布真实客户资料。",
            "Explain your product, service and partnership needs. Use fictional examples only. Do not impersonate others or publish real client information.",
          ],
          [
            "先审核，再发布",
            "Review before publication",
            "高、中风险内容默认阻止；低风险、英文及无法确认的内容进入审核。作者只看到分类提示，不会获得词库匹配详情。",
            "High and mid risk are blocked by default. Low-risk, English and uncertain content enter review. Authors receive category guidance, not lexicon matches.",
          ],
          [
            "尊重每一个参与者",
            "Respect every participant",
            "拒绝诈骗、骚扰和未经证实的收益承诺。发现问题，请提供原因进行举报。",
            "No scams, harassment or unsupported promises of returns. Report concerns with a clear explanation.",
          ],
          [
            "合作由对话开始",
            "Start with a conversation",
            "连接按钮仅产生演示回执，不会发送真实消息。此论坛不提供私信或媒体上传功能。",
            "Connect creates only a demo receipt; no actual message is sent. Direct messaging and media uploads are outside this preview.",
          ],
        ].map(([zh, en, bodyZh, bodyEn], i) => (
          <section key={en}>
            <span className="index">0{i + 1}</span>
            <h2>{t(zh, en)}</h2>
            <p>{t(bodyZh, bodyEn)}</p>
          </section>
        ))}
        <Link className="button" to="/forum/new">
          {t("发布合作需求", "Create a listing")}
        </Link>
      </section>
    </>
  );
}
