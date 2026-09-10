import { useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import {
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
import { Gate } from "./Forum.jsx";
import { PostRows } from "./Marketing.jsx";
import { publicPosts } from "../mock/service.js";
import { industries, markets } from "../content/catalog.js";
export function Member({ section = "forum" }) {
  const { state, session, t, txt, act, busy, errorText } = useApp();
  const [removeId, setRemoveId] = useState(null),
    [error, setError] = useState(null);
  if (session.role === "moderator")
    return (
      <section className="shell section">
        <Empty title={t("审核员工作台", "Moderator workspace")}>
          <Link className="button" to="/moderation">
            {t("打开审核队列", "Open review queue")}
          </Link>
          <p>
            <Link to="/preview">
              {t(
                "切换会员角色以查看会员中心",
                "Switch to a member role to view the member area",
              )}
            </Link>
          </p>
        </Empty>
      </section>
    );
  const nav = [
    ["forum", "概览", "Overview"],
    ["posts", "我的帖子", "My listings"],
    ["replies", "我的评论", "My replies"],
    ["saved", "我的收藏", "Saved"],
    ["notifications", "回执记录", "Receipts"],
    ["settings", "资料设置", "Profile settings"],
  ];
  const own = state.posts
    .filter((p) => p.authorId === session.id)
    .map((p) => ({
      ...state.revisions.find((r) => r.id === p.revisionId),
      ...p,
    }));
  const notifications = state.notifications.filter(
    (n) => n.authorId === session.id,
  );
  const run = async (action, data) => {
    try {
      setError(null);
      await act(action, data);
      setRemoveId(null);
    } catch (e) {
      setError(e);
    }
  };
  return (
    <Gate>
      <PageTitle compact title={t("我的社群", "My community")}>
        {t(
          "管理合作需求，查看每一次交流的进展。",
          "Manage partnership requests and follow your conversations.",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell member-layout">
          <nav className="member-nav">
            {nav.map(([id, zh, en]) => (
              <Link
                key={id}
                className={id === section ? "selected" : ""}
                to={"/me/" + id}
              >
                {t(zh, en)}
              </Link>
            ))}
          </nav>
          <div>
            {error && <Notice error>{errorText(error)}</Notice>}
            {section === "forum" && (
              <>
                <h2>
                  {t("欢迎回来，", "Welcome back, ")}
                  {txt(
                    state.profiles.find((p) => p.id === session.id)
                      ?.displayName,
                  )}
                </h2>
                <div className="stat-grid">
                  {[
                    ["posts", own.length, "合作需求", "Listings"],
                    [
                      "posts",
                      own.filter((p) => p.status === "pending").length,
                      "等待审核",
                      "Under review",
                    ],
                    [
                      "notifications",
                      notifications.filter((n) => !n.read).length,
                      "未读回执",
                      "Unread receipts",
                    ],
                  ].map(([path, count, zh, en]) => (
                    <Link key={en} to={"/me/" + path}>
                      <strong>{count}</strong>
                      <span>{t(zh, en)}</span>
                    </Link>
                  ))}
                </div>
                <Link className="button" to="/forum/new">
                  {t("发布新的合作需求", "Create a new listing")}
                </Link>
                <h2>{t("接下来", "What’s next")}</h2>
                <p>
                  {t(
                    "完善企业资料，或浏览更多合作机会。待审核内容不会向其他会员公开。",
                    "Complete your company profile or explore more opportunities. Content under review is not visible to other members.",
                  )}
                </p>
                <Link to="/forum">{t("浏览论坛", "Browse forum")}</Link>
              </>
            )}
            {section === "posts" && (
              <>
                <div className="section-head">
                  <h2>{t("我的帖子", "My listings")}</h2>
                  <Link className="button" to="/forum/new">
                    {t("新建", "Create")}
                  </Link>
                </div>
                {own.length ? (
                  own.map((p) => (
                    <article className="activity-row" key={p.id}>
                      <Status status={p.removed ? "removed" : p.status} />
                      <h3>
                        <Link to={"/forum/post/" + p.id}>{txt(p.title)}</Link>
                      </h3>
                      {p.reason && <p className="error">{txt(p.reason)}</p>}
                      {p.publishedRevisionId &&
                        p.publishedRevisionId !== p.revisionId && (
                          <p className="small">
                            {t(
                              "上一版本仍公开；此修改仅您与审核员可见。",
                              "The previous version remains public; this revision is private.",
                            )}
                          </p>
                        )}
                      <div className="actions">
                        {p.removed ? (
                          <Button
                            secondary
                            disabled={busy}
                            onClick={() => run("restore", { id: p.id })}
                          >
                            {t("撤销删除", "Undo delete")}
                          </Button>
                        ) : (
                          <>
                            {p.status !== "pending" && (
                              <Link
                                className="button secondary"
                                to={"/forum/edit/" + p.id}
                              >
                                {t("编辑", "Edit")}
                              </Link>
                            )}
                            <Button secondary onClick={() => setRemoveId(p.id)}>
                              {t("删除", "Delete")}
                            </Button>
                          </>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <Empty
                    title={t(
                      "从您的第一个需求开始",
                      "Start with your first listing",
                    )}
                  />
                )}
              </>
            )}
            {section === "replies" && (
              <>
                <h2>{t("我的评论", "My replies")}</h2>
                {state.comments
                  .filter((c) => c.authorId === session.id)
                  .map((c) => (
                    <article className="activity-row" key={c.id}>
                      <Status status={c.status} />
                      <p>{txt(c.body)}</p>
                      {c.reason && <p>{txt(c.reason)}</p>}
                      <Link to={"/forum/post/" + c.postId}>
                        {t("查看上下文", "View conversation")}
                      </Link>
                    </article>
                  ))}
                {!state.comments.some((c) => c.authorId === session.id) && (
                  <Empty />
                )}
              </>
            )}
            {section === "saved" && (
              <>
                <h2>{t("我的收藏", "Saved listings")}</h2>
                {publicPosts(state).some((p) =>
                  state.bookmarks.some(
                    (b) => b.authorId === session.id && b.targetId === p.id,
                  ),
                ) ? (
                  <PostRows
                    posts={publicPosts(state).filter((p) =>
                      state.bookmarks.some(
                        (b) => b.targetId === p.id && b.authorId === session.id,
                      ),
                    )}
                  />
                ) : (
                  <Empty
                    title={t(
                      "收藏您感兴趣的合作机会",
                      "Save opportunities that interest you",
                    )}
                  />
                )}
              </>
            )}
            {section === "notifications" && (
              <>
                <div className="section-head">
                  <h2>{t("回执记录", "Receipt log")}</h2>
                  <Button
                    secondary
                    disabled={busy || !notifications.some((n) => !n.read)}
                    onClick={() => run("read")}
                  >
                    {t("全部标为已读", "Mark all read")}
                  </Button>
                </div>
                <Notice>
                  {t(
                    "演示回执 · 未发送任何邮件。不代表正式通知产品已获批准。",
                    "Demo receipts · No email was sent. This does not imply approval of a production notification product.",
                  )}
                </Notice>
                {notifications.length ? (
                  notifications.map((n) => (
                    <article className="activity-row" key={n.id}>
                      <p>
                        {!n.read && (
                          <span
                            className="unread"
                            aria-label={t("未读", "Unread")}
                          />
                        )}{" "}
                        {txt(n.message)}
                      </p>
                      {n.postId && (
                        <Link to={"/forum/post/" + n.postId}>
                          {t("查看相关帖子", "View related listing")}
                        </Link>
                      )}
                      {!n.read && (
                        <Button
                          secondary
                          disabled={busy}
                          onClick={() => run("read", { id: n.id })}
                        >
                          {t("标为已读", "Mark read")}
                        </Button>
                      )}
                    </article>
                  ))
                ) : (
                  <Empty />
                )}
              </>
            )}
            {section === "settings" && <ProfileSettings />}
          </div>
        </div>
      </section>
      {removeId && (
        <Modal
          title={t("删除此演示帖子？", "Delete this demo listing?")}
          onClose={() => setRemoveId(null)}
        >
          <p>
            {t(
              "帖子会从公开页面移除。您可在这里撤销删除。",
              "This listing will be removed from public pages. You can undo the deletion here.",
            )}
          </p>
          <Button
            disabled={busy}
            onClick={() => run("delete", { id: removeId })}
          >
            {t("确认删除", "Confirm delete")}
          </Button>
        </Modal>
      )}
    </Gate>
  );
}
function ProfileSettings() {
  const { state, session, txt, t, act, busy, errorText } = useApp();
  const profile = state.profiles.find((p) => p.id === session.id);
  const original = () => ({
    displayName: txt(profile.displayName),
    company: txt(profile.name),
    intro: txt(profile.intro),
    industry: profile.industry,
    markets: profile.markets,
    digest: profile.preferences?.digest || false,
    profileVisible: profile.preferences?.profileVisible !== false,
  });
  const [data, setData] = useState(original),
    [error, setError] = useState(null),
    [saved, setSaved] = useState(false);
  const update = (key, value) => {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };
  return (
    <Form
      error={error}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          const result = await act("profile", data);
          if (result) setSaved(true);
        } catch (e) {
          setError(e);
        }
      }}
    >
      <h2>{t("资料设置", "Profile settings")}</h2>
      <p>
        {t(
          "仅填写虚构企业资料。修改会显示在您的示例企业卡片。",
          "Use fictional details only. Changes update your demo company card.",
        )}
      </p>
      <Field
        label={t("显示名称", "Display name")}
        name="displayName"
        value={data.displayName}
        maxLength={80}
        onChange={(e) => update("displayName", e.target.value)}
      />
      <Field
        label={t("公司名称", "Company name")}
        name="company"
        value={data.company}
        maxLength={120}
        onChange={(e) => update("company", e.target.value)}
      />
      <Select
        label={t("行业", "Industry")}
        name="industry"
        value={data.industry}
        options={industries}
        onChange={(v) => update("industry", v)}
      />
      <MarketChecks
        legend={t("市场", "Markets")}
        options={markets}
        name="markets"
        value={data.markets}
        onChange={(v) => update("markets", v)}
      />
      <Field
        label={t("简介（最多600字）", "Introduction (up to 600 characters)")}
      >
        <textarea
          rows={6}
          name="intro"
          value={data.intro}
          maxLength={600}
          onChange={(e) => update("intro", e.target.value)}
        />
      </Field>
      {error && <Notice error>{errorText(error)}</Notice>}
      <fieldset>
        <legend>{t("演示偏好", "Demo preferences")}</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={data.digest}
            onChange={(e) => update("digest", e.target.checked)}
          />
          {t(
            "记录社群摘要偏好（不会发送邮件）",
            "Record community digest preference (no email sent)",
          )}
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={data.profileVisible}
            onChange={(e) => update("profileVisible", e.target.checked)}
          />
          {t(
            "在示例企业名录中展示资料",
            "Show profile in the demo company directory",
          )}
        </label>
      </fieldset>
      {saved && <Notice>{t("资料已保存。", "Profile saved.")}</Notice>}
      <div className="actions">
        <Button type="submit" disabled={busy}>
          {t("保存资料", "Save profile")}
        </Button>
        <Button
          secondary
          onClick={() => {
            setData(original());
            setSaved(false);
          }}
        >
          {t("取消修改", "Cancel changes")}
        </Button>
      </div>
    </Form>
  );
}
