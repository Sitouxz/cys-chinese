import { useState } from "react";
import { useApp, Link } from "../components/runtime.jsx";
import {
  Button,
  Field,
  Notice,
  Modal,
  Empty,
  PageTitle,
} from "../components/ui.jsx";
import { activeAds, adPlan, tierOf, tiers } from "../mock/community.js";
import { publicPosts } from "../mock/service.js";

export function TierBadge({ profile }) {
  const { txt } = useApp();
  const tier = tierOf(profile);
  return (
    <Link to="/membership" className={"tier-badge tier-" + tier.id}>
      {txt(tier)}
    </Link>
  );
}
export function ConnectButton({ targetId, postId }) {
  const { state, session, t, gate, act, busy, errorText } = useApp();
  const [open, setOpen] = useState(false),
    [error, setError] = useState(null);
  if (session.id === targetId || session.role === "moderator") return null;
  const existing = (state.connections || []).find(
    (c) =>
      c.status !== "declined" &&
      [c.from, c.to].includes(session.id) &&
      [c.from, c.to].includes(targetId),
  );
  return (
    <>
      {existing ? (
        <Link className="button secondary" to="/me/connections">
          {t("查看连接进度", "View connection status")}
        </Link>
      ) : (
        <Button onClick={() => gate(() => setOpen(true))}>
          {t("我想联络他 /她", "Request a connection")}
        </Button>
      )}
      {open && (
        <Modal
          title={t("发起一对一连接", "Request a one-to-one connection")}
          onClose={() => setOpen(false)}
        >
          <p>
            {t(
              "发送申请即表示您同意建立联系。对方接受后，CYS 团队会安排人工介绍。双方的电话与邮箱始终不会公开。",
              "Sending confirms your consent to connect. When the other member accepts, CYS will arrange a personal introduction. Phone numbers and emails stay private.",
            )}
          </p>
          <Notice>
            {t(
              "本地演示：不发送邮件或公开联系资料。",
              "Local preview: no email is sent and no contact details are disclosed.",
            )}
          </Notice>
          {error && <Notice error>{errorText(error)}</Notice>}
          <Button
            disabled={busy}
            onClick={async () => {
              try {
                await act("connect", { targetId, postId });
                setOpen(false);
              } catch (e) {
                setError(e);
              }
            }}
          >
            {t("同意并发送申请", "Agree and send request")}
          </Button>
        </Modal>
      )}
    </>
  );
}
const labels = {
  pending: ["等待对方接受", "Awaiting acceptance"],
  accepted: ["双方已同意 · 等待 CYS", "Both agreed · Awaiting CYS"],
  declined: ["对方已婉拒", "Declined"],
  introduced: ["CYS 已安排介绍", "Introduction arranged"],
};
export function Connections({ moderator = false }) {
  const { state, session, t, txt, act, busy, errorText } = useApp();
  const [error, setError] = useState(null);
  const records = (state.connections || []).filter(
    (c) => moderator || c.from === session.id || c.to === session.id,
  );
  const run = async (action, data) => {
    try {
      setError(null);
      await act(action, data);
    } catch (e) {
      setError(e);
    }
  };
  return (
    <section className="connection-list">
      <h2>{t("连接申请", "Connection requests")}</h2>
      <p>
        {t(
          "1. 发起申请　2. 对方同意　3. CYS 人工介绍",
          "1. Send request   2. Recipient accepts   3. CYS introduces you",
        )}
      </p>
      <Notice>
        {t(
          "联系资料始终保密。演示仅记录通知回执，不发送邮件。",
          "Contact details remain private. This preview records notification receipts without sending email.",
        )}
      </Notice>
      {error && <Notice error>{errorText(error)}</Notice>}
      {!records.length ? (
        <Empty title={t("暂无连接申请", "No connection requests yet")} />
      ) : (
        records.map((c) => (
          <article className="request-row" key={c.id}>
            <h3>
              {txt(state.profiles.find((p) => p.id === c.from)?.name)} →{" "}
              {txt(state.profiles.find((p) => p.id === c.to)?.name)}
            </h3>
            <p role="status">{t(...labels[c.status])}</p>
            {c.postId && (
              <Link className="text-link" to={"/forum/post/" + c.postId}>
                {t("查看相关帖子", "View related listing")}
              </Link>
            )}
            {c.to === session.id && c.status === "pending" && (
              <div className="actions">
                <Button
                  disabled={busy}
                  onClick={() =>
                    run("connectionDecision", {
                      id: c.id,
                      decision: "accepted",
                    })
                  }
                >
                  {t("同意连接", "Accept connection")}
                </Button>
                <Button
                  secondary
                  disabled={busy}
                  onClick={() =>
                    run("connectionDecision", {
                      id: c.id,
                      decision: "declined",
                    })
                  }
                >
                  {t("婉拒", "Decline")}
                </Button>
              </div>
            )}
            {moderator && c.status === "accepted" && (
              <>
                <p className="small">
                  {t(
                    "通知回执已记录（模拟），等待人工跟进。",
                    "Notification receipt recorded (simulated), ready for manual follow-up.",
                  )}
                </p>
                <Button
                  disabled={busy}
                  onClick={() => run("connectionComplete", { id: c.id })}
                >
                  {t("标记已安排介绍", "Mark introduction arranged")}
                </Button>
              </>
            )}
          </article>
        ))
      )}
    </section>
  );
}
export function Membership() {
  const { t, txt } = useApp();
  const requirements = [
    ["访客，可浏览帖子", "Visitors can browse listings"],
    [
      "完成网站注册，可点赞、评论、发帖及申请连接",
      "Site registration unlocks likes, comments, posts and connections",
    ],
    ["成功开立 CYS 账户", "Complete CYS account opening and KYC"],
    ["完成首笔真实交易", "Complete the first real transaction"],
    [
      "达到交易量门槛（待确认）",
      "Reach the transaction-volume threshold (to be confirmed)",
    ],
    [
      "达到最高交易量门槛（待确认）",
      "Reach the top transaction-volume threshold (to be confirmed)",
    ],
  ];
  return (
    <>
      <PageTitle
        title={t("每一步，都有新的可能。", "A membership that grows with you.")}
      >
        {t("六级会员权益", "Six membership tiers")}
      </PageTitle>
      <section className="section shell">
        <div className="tier-grid">
          {tiers.map((tier, i) => (
            <article key={tier.id}>
              <span className={"tier-badge tier-" + tier.id}>{txt(tier)}</span>
              <h2>{txt(tier)}</h2>
              <p>{t(...requirements[i])}</p>
              {tier.days > 0 && (
                <p>
                  {t(
                    `第一阶段每月 ${tier.days} 天免费推广。`,
                    `Phase 1: ${tier.days} free featured day${tier.days > 1 ? "s" : ""} per month.`,
                  )}{" "}
                  {tier.id === "platinum"
                    ? t(
                        "日期随机分配，确认后显示。第二阶段改用交易积分兑换。",
                        "Date assigned randomly and shown after confirmation. Phase 2 replaces this with transaction-point redemption.",
                      )
                    : t(
                        "可自选日期。第二阶段可额外使用交易积分兑换。",
                        "Choose your dates. In Phase 2, redeem transaction points for additional days.",
                      )}
                </p>
              )}
            </article>
          ))}
        </div>
        <p>
          {t(
            "交易量门槛和积分兑换比例待确认。演示徽章不代表真实认证。",
            "Volume thresholds and point conversion rates await confirmation. Demo badges do not represent real verification.",
          )}
        </p>
        <Link className="button" to="/auth?mode=register">
          {t("注册银级会员", "Register for Silver")}
        </Link>
      </section>
    </>
  );
}
export function PromotedSlot() {
  const { state, t, txt, act, go, errorText, toast } = useApp();
  const ads = activeAds(state);
  return (
    <aside className="promoted-slot">
      <span className="eyebrow">{t("推广", "Promoted")}</span>
      {ads.length ? (
        ads.map((ad) => {
          const post = publicPosts(state).find((p) => p.id === ad.postId);
          return (
            <div key={ad.id}>
              <h3>{txt(post.title)}</h3>
              <Button
                onClick={async () => {
                  try {
                    await act("adClick", { id: ad.id });
                    go("/forum/post/" + ad.postId);
                  } catch (e) {
                    toast(errorText(e));
                  }
                }}
              >
                {t("了解合作机会", "Explore this opportunity")}
              </Button>
            </div>
          );
        })
      ) : (
        <>
          <h3>{t("让合适的伙伴看见您。", "Be seen by the right partners.")}</h3>
          <p>
            {t(
              "首页推广位 · 每天 S$2 起",
              "Homepage placement · From S$2 per day",
            )}
          </p>
          <Link className="text-link" to="/me/ads">
            {t("查看推广方案", "Explore promotion plans")}
          </Link>
        </>
      )}
    </aside>
  );
}
export function Advertising({ moderator = false }) {
  const { state, session, t, txt, act, busy, errorText } = useApp();
  const [postId, setPostId] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [benefit, setBenefit] = useState(false),
    [payment, setPayment] = useState(false),
    [error, setError] = useState(null),
    [receipt, setReceipt] = useState(null);
  const plan = adPlan(state.dau, state.bidders),
    tier = tierOf(state.profiles.find((p) => p.id === session.id));
  const records = (state.ads || []).filter(
    (a) => moderator || a.authorId === session.id,
  );
  const run = async (action, data) => {
    try {
      setError(null);
      const r = await act(action, data);
      if (action === "bookAd") {
        setReceipt(r);
        setPayment(false);
      }
    } catch (e) {
      setError(e);
    }
  };
  return (
    <section>
      <h2>{t("推广与成效", "Promotions & performance")}</h2>
      <p>
        {t(
          "首页广告明确标记为推广，与自然排名分开。",
          "Homepage advertisements are labelled Promoted and kept separate from organic ranking.",
        )}
      </p>
      <div className="pricing-grid">
        {[
          ["1", "< 200", "S$2"],
          ["2", "200–799 / 800–1,599 / 1,600–2,000", "S$8 / S$16 / S$20"],
          [
            "3",
            "> 2,000 + 3 " + t("竞价商家", "bidders"),
            t("按点击竞价", "CPC bidding"),
          ],
        ].map(([phase, dau, price]) => (
          <article key={phase}>
            <small>
              {t("阶段", "Phase")} {phase}
            </small>
            <h3>
              {price}
              {phase !== "3" && t(" / 天", " / day")}
            </h3>
            <p>DAU {dau}</p>
          </article>
        ))}
      </div>
      <Notice>
        {t(
          `当前演示：阶段 ${plan.phase}，${plan.slots} 个广告位。支付和审核均为模拟。`,
          `Current preview: Phase ${plan.phase}, ${plan.slots} placement${plan.slots > 1 ? "s" : ""}. Payment and review are simulated.`,
        )}
      </Notice>
      {!moderator && plan.phase !== 3 && (
        <form
          className="ad-booking"
          onSubmit={(e) => {
            e.preventDefault();
            run("bookAd", { postId, date, benefit, payment });
          }}
        >
          <div className="form-grid">
            <Field label={t("推广帖子", "Listing to promote")}>
              <select
                required
                value={postId}
                onChange={(e) => setPostId(e.target.value)}
              >
                <option value="">
                  {t("选择已发布帖子", "Choose a published listing")}
                </option>
                {publicPosts(state)
                  .filter((p) => p.authorId === session.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {txt(p.title)}
                    </option>
                  ))}
              </select>
            </Field>
            <Field
              type="date"
              required
              label={
                benefit && tier.id === "platinum"
                  ? t(
                      "选择月份（日期随机分配）",
                      "Choose month (day randomly assigned)",
                    )
                  : t("推广日期", "Placement date")
              }
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {tier.days > 0 && (
            <label className="check">
              <input
                type="checkbox"
                checked={benefit}
                onChange={(e) => setBenefit(e.target.checked)}
              />
              {t(
                `使用每月免费权益（${tier.days} 天）`,
                `Use monthly allowance (${tier.days} days)`,
              )}
            </label>
          )}
          <p>
            {t("本次费用", "Total")}: S${benefit ? 0 : plan.price}
          </p>
          {!benefit && (
            <label className="check">
              <input
                type="checkbox"
                required
                checked={payment}
                onChange={(e) => setPayment(e.target.checked)}
              />
              {t(
                "模拟支付，之后提交审核（不扣款）",
                "Simulate payment, then submit for review (no charge)",
              )}
            </label>
          )}
          <Button type="submit" disabled={busy}>
            {t("预约并提交审核", "Book and submit for review")}
          </Button>
          <p className="small">
            {t(
              "交易积分兑换将在比例确认后开放。",
              "Transaction-point redemption will be available once conversion rates are confirmed.",
            )}
          </p>
        </form>
      )}
      {error && <Notice error>{errorText(error)}</Notice>}
      {receipt && (
        <Notice>
          {t(
            "预约已记录，等待审核。确认日期：",
            "Booking recorded for review. Confirmed date: ",
          )}
          {receipt.date} · {receipt.id}
        </Notice>
      )}
      {records.map((ad) => (
        <article className="request-row" key={ad.id}>
          <h3>
            {txt(publicPosts(state).find((p) => p.id === ad.postId)?.title) ||
              ad.postId}
          </h3>
          <p>
            {ad.date} · S${ad.price} ·{" "}
            {t(
              ...{
                pending: ["等待审核", "Awaiting review"],
                approved: ["已批准", "Approved"],
                rejected: ["已拒绝", "Rejected"],
              }[ad.status],
            )}
          </p>
          <p>
            {t("点击", "Clicks")}:{" "}
            {
              (state.adEvents || []).filter(
                (e) => e.adId === ad.id && e.type === "click",
              ).length
            }{" "}
            · {t("连接申请", "Connection requests")}:{" "}
            {
              (state.adEvents || []).filter(
                (e) => e.adId === ad.id && e.type === "connection",
              ).length
            }
          </p>
          {moderator && ad.status === "pending" && (
            <div className="actions">
              {["approved", "rejected"].map((decision) => (
                <Button
                  key={decision}
                  secondary={decision === "rejected"}
                  disabled={busy}
                  onClick={() => run("reviewAd", { id: ad.id, decision })}
                >
                  {decision === "approved"
                    ? t("批准推广", "Approve promotion")
                    : t("拒绝推广", "Reject promotion")}
                </Button>
              ))}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
