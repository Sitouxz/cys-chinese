import { Connections, Advertising } from "./Community.jsx";
import { useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import {
  Button,
  Empty,
  Field,
  Notice,
  PageTitle,
  Status,
  Tabs,
} from "../components/ui.jsx";
export function Moderation() {
  const { state, session, t, txt, act, busy, errorText, location, query } =
    useApp();
  const [selected, setSelected] = useState(null),
    [reason, setReason] = useState(""),
    [error, setError] = useState(null),
    [risk, setRisk] = useState(""),
    [reportState, setReportState] = useState("open");
  const tab = ["comments", "reports", "history", "connections", "ads"].includes(
    location.searchParams.get("tab"),
  )
    ? location.searchParams.get("tab")
    : "posts";
  if (session.role !== "moderator")
    return (
      <section className="section shell">
        <Empty
          title={t(
            "此页面仅供演示审核员使用",
            "This page is for the demo moderator",
          )}
        >
          <Link to="/preview">
            {t("打开预览控制台选择角色", "Choose a role in Preview controls")}
          </Link>
        </Empty>
      </section>
    );
  if (tab === "connections" || tab === "ads")
    return (
      <section className="section shell">
        <nav className="forum-nav">
          <Link to="/moderation">{t("内容审核", "Content review")}</Link>
          <Link to="/moderation?tab=connections">
            {t("连接申请", "Connections")}
          </Link>
          <Link to="/moderation?tab=ads">{t("推广审核", "Promotions")}</Link>
        </nav>
        {tab === "connections" ? (
          <Connections moderator />
        ) : (
          <Advertising moderator />
        )}
      </section>
    );
  const records =
    tab === "posts"
      ? state.revisions.filter(
          (r) =>
            r.status === "pending" &&
            state.posts.some((p) => !p.removed && p.revisionId === r.id) &&
            (!risk || r.risk === risk),
        )
      : tab === "comments"
        ? state.comments.filter(
            (c) => c.status === "pending" && (!risk || c.risk === risk),
          )
        : tab === "reports"
          ? state.reports.filter(
              (r) => !reportState || r.status === reportState,
            )
          : state.events;
  const item = records.find((r) => r.id === selected);
  const choose = (id) => {
    setSelected(id);
    setReason("");
    setError(null);
  };
  const run = async (decision) => {
    setError(null);
    try {
      const response = await act(
        tab === "posts"
          ? "review"
          : tab === "comments"
            ? "reviewComment"
            : "resolveReport",
        {
          id: item.id,
          revisionId: item.id,
          revision: item.revision,
          decision,
          reason,
        },
      );
      if (response) choose(null);
    } catch (e) {
      setError(e);
    }
  };
  return (
    <>
      <nav className="shell forum-nav">
        <Link to="/moderation?tab=connections">
          {t("连接申请", "Connections")}
        </Link>
        <Link to="/moderation?tab=ads">{t("推广审核", "Promotions")}</Link>
      </nav>
      <PageTitle compact title={t("内容审核工作台", "Moderation workspace")}>
        {t(
          "模拟分类与人工审核 · 所有操作仅改变本地演示数据",
          "Simulated classification and manual review · All actions affect local demo data only",
        )}
      </PageTitle>
      <section className="section">
        <div className="shell">
          <Tabs
            panelId="review-panel"
            label={t("审核类型", "Review type")}
            value={tab}
            onChange={(id) => {
              query("tab", id);
              choose(null);
            }}
            options={[
              { id: "posts", label: t("帖子队列", "Post queue") },
              { id: "comments", label: t("评论队列", "Comment queue") },
              { id: "reports", label: t("举报", "Reports") },
              { id: "history", label: t("审核历史", "Audit history") },
            ]}
          />
          <div
            id="review-panel"
            role="tabpanel"
            aria-labelledby={"review-panel-" + tab}
          >
            {tab !== "history" && (
              <div className="review-filters">
                <span>
                  {records.length} {t("条记录", "records")}
                </span>
                {tab === "reports" ? (
                  <Field label={t("举报状态", "Report status")}>
                    <select
                      value={reportState}
                      onChange={(e) => {
                        setReportState(e.target.value);
                        choose(null);
                      }}
                    >
                      <option value="open">{t("待处理", "Open")}</option>
                      <option value="resolved">
                        {t("已处理", "Resolved")}
                      </option>
                      <option value="">{t("全部", "All")}</option>
                    </select>
                  </Field>
                ) : (
                  <Field label={t("风险等级", "Risk classification")}>
                    <select
                      value={risk}
                      onChange={(e) => {
                        setRisk(e.target.value);
                        choose(null);
                      }}
                    >
                      <option value="">{t("全部", "All")}</option>
                      <option value="low">{t("低", "Low")}</option>
                      <option value="mid">{t("中", "Mid")}</option>
                      <option value="high">{t("高", "High")}</option>
                      <option value="unknown">
                        {t("不确定", "Uncertain")}
                      </option>
                    </select>
                  </Field>
                )}
              </div>
            )}
            {tab === "history" ? (
              <div>
                {records.length ? (
                  records.map((event) => (
                    <article className="activity-row" key={event.id}>
                      <strong>
                        {event.target} ·{" "}
                        {
                          {
                            approved: t("批准", "Approved"),
                            rejected: t("拒绝", "Rejected"),
                            changes: t("要求修改", "Changes requested"),
                            remove: t("移除", "Removed"),
                            restore: t("恢复", "Restored"),
                            dismiss: t("结案", "Dismissed"),
                          }[event.decision]
                        }
                      </strong>
                      <p>
                        {txt(event.reason) ||
                          t("审核通过", "Approved after review")}
                      </p>
                      <small>
                        {new Date(event.createdAt).toISOString()} ·{" "}
                        {event.actorId}
                      </small>
                    </article>
                  ))
                ) : (
                  <Empty title={t("还没有审核记录", "No review actions yet")} />
                )}
              </div>
            ) : (
              <div
                className={"moderation-layout " + (item ? "has-selection" : "")}
              >
                <div className="review-list">
                  {records.length ? (
                    records.map((record) => (
                      <button
                        className={
                          selected === record.id
                            ? "review-row selected"
                            : "review-row"
                        }
                        key={record.id}
                        onClick={() => choose(record.id)}
                      >
                        {record.risk && <Status status={record.risk} />}
                        <strong>
                          {txt(record.title || record.body || record.message)}
                        </strong>
                        <small>
                          {txt(
                            state.profiles.find((p) => p.id === record.authorId)
                              ?.name,
                          )}{" "}
                          · {record.id}
                        </small>
                        <small>
                          {new Date(record.createdAt)
                            .toISOString()
                            .slice(0, 10)}
                        </small>
                      </button>
                    ))
                  ) : (
                    <Empty title={t("队列已清空", "The queue is clear")} />
                  )}
                </div>
                <div className="review-detail">
                  {item ? (
                    <>
                      <Button
                        secondary
                        className="review-back"
                        onClick={() => choose(null)}
                      >
                        {t("返回队列", "Back to queue")}
                      </Button>
                      <p className="small">
                        {t("审核目标", "Review target")}: {item.id}
                      </p>
                      <h2>
                        {txt(item.title) ||
                          t("查看提交内容", "Inspect submission")}
                      </h2>
                      {item.risk && <Status status={item.risk} />}
                      <p className="post-body">
                        {txt(item.body || item.message)}
                      </p>
                      {item.product && (
                        <dl>
                          <dt>{t("产品与市场", "Product and markets")}</dt>
                          <dd>
                            {txt(item.product)} · {item.markets.join(" / ")}
                          </dd>
                        </dl>
                      )}
                      {item.policy && (
                        <Notice>
                          {t("模拟分类结果", "Simulated classifier result")} ·{" "}
                          {item.policy}
                          <br />
                          {item.scanFailed
                            ? t(
                                "扫描失败，需人工处理。",
                                "Scan failed. Manual handling required.",
                              )
                            : item.manual
                              ? t(
                                  "英文或混合语言，需人工审核。",
                                  "English or mixed language. Manual review required.",
                                )
                              : t(
                                  "词库仅演示风险分类，不代表真实审核系统。",
                                  "The lexicon demonstrates risk classification, not a live moderation system.",
                                )}
                          <p>
                            {t(
                              "匹配证据（仅审核员可见）",
                              "Matched evidence (moderator only)",
                            )}
                            :{" "}
                            {item.evidence?.join(" · ") ||
                              t("无匹配", "No matches")}
                          </p>
                          <p>
                            {t("风险类别", "Risk categories")}:{" "}
                            {item.categories?.join(" · ") ||
                              t("未分类", "Unclassified")}
                          </p>
                        </Notice>
                      )}
                      {tab === "reports" && (
                        <>
                          <Link to={"/forum/post/" + item.postId}>
                            {t("查看被举报帖子", "Inspect reported listing")}
                          </Link>
                          <p>
                            {t(
                              "举报不会自动移除内容。恢复操作会重新公开已发布版本。",
                              "Reporting does not automatically remove content. Restore makes the published version public again.",
                            )}
                          </p>
                        </>
                      )}
                      <Field
                        label={t(
                          "审核说明（拒绝、修改或举报处理必填，10–2,000 字）",
                          "Review reason (required for rejection, changes or reports; 10–2,000 characters)",
                        )}
                      >
                        <textarea
                          rows={4}
                          maxLength={2000}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </Field>
                      {error && <Notice error>{errorText(error)}</Notice>}
                      <div className="actions">
                        {tab === "reports" ? (
                          <>
                            <Button
                              disabled={busy}
                              onClick={() => run("remove")}
                            >
                              {t("移除内容", "Remove content")}
                            </Button>
                            <Button
                              secondary
                              disabled={busy}
                              onClick={() => run("restore")}
                            >
                              {t("恢复内容", "Restore content")}
                            </Button>
                            <Button
                              secondary
                              disabled={busy}
                              onClick={() => run("dismiss")}
                            >
                              {t("结案", "Dismiss report")}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              disabled={busy}
                              onClick={() => run("approved")}
                            >
                              {t("批准发布", "Approve publication")}
                            </Button>
                            <Button
                              secondary
                              disabled={busy}
                              onClick={() => run("changes")}
                            >
                              {t("要求修改", "Request changes")}
                            </Button>
                            <Button
                              secondary
                              disabled={busy}
                              onClick={() => run("rejected")}
                            >
                              {t("拒绝", "Reject")}
                            </Button>
                          </>
                        )}
                      </div>
                      <h3>{t("相关审核历史", "Related review history")}</h3>
                      {state.events
                        .filter((e) => e.target === item.id)
                        .map((e) => (
                          <p key={e.id}>
                            {e.decision} · {txt(e.reason)}
                          </p>
                        ))}
                    </>
                  ) : (
                    <div className="empty">
                      <h2>
                        {t("选择一条记录开始审核", "Choose an item to review")}
                      </h2>
                      <p>
                        {t(
                          "检查提交版本、风险与证据，再作出明确决定。",
                          "Inspect the submitted revision, risk and evidence before making a decision.",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
