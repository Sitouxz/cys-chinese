import { scanContent as scan } from "./scanner.js";
import { makeSeed, CLOCK } from "./seed.js";
import {
  categories,
  industries,
  intents,
  markets,
  pair,
} from "../content/catalog.js";
export const STORAGE_KEY = "cys-hifi-demo-v1";
export const SESSION_KEY = "cys-hifi-session-v1";
export class DemoError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
const fail = (code) => {
  throw new DemoError(code);
};
const requireMember = (session) => {
  if (!session?.id || session.role !== "member") fail("login");
};
const requireModerator = (session) => {
  if (session?.role !== "moderator") fail("forbidden");
};
const bounded = (value, min, max) =>
  typeof value === "string" &&
  value.trim().length >= min &&
  value.trim().length <= max;
const inList = (value, list) => list.some((item) => item.id === value);
export const demoEmail = (email) =>
  typeof email === "string" &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.example$/i.test(email);
export const localText = (value, lang) =>
  typeof value === "string" ? value : value?.[lang] || value?.zh || "";
export function publicPosts(state) {
  if (state.previewEmpty) return [];
  return state.posts
    .filter((p) => !p.removed && p.publishedRevisionId)
    .map((p) => ({
      ...state.revisions.find((r) => r.id === p.publishedRevisionId),
      ...p,
    }))
    .sort((a, b) => b.publishedAt - a.publishedAt);
}
export function visiblePost(state, id, session) {
  const p = state.posts.find((x) => x.id === id);
  if (!p) return null;
  if (session?.role === "moderator" || session?.id === p.authorId)
    return { ...state.revisions.find((r) => r.id === p.revisionId), ...p };
  return publicPosts(state).find((x) => x.id === id) || null;
}
export function visibleComments(state, postId, session) {
  return state.comments.filter(
    (c) =>
      c.postId === postId &&
      (c.status === "approved" ||
        c.authorId === session?.id ||
        session?.role === "moderator"),
  );
}
export function validatePost(data, draft = false) {
  if (
    !bounded(data.title, draft ? 1 : 8, 100) ||
    !bounded(data.body, draft ? 0 : 30, 3000)
  )
    fail("postLength");
  if (
    !inList(data.category, categories) ||
    !inList(data.industry, industries) ||
    !inList(data.intent, intents) ||
    !bounded(data.product, 2, 100)
  )
    fail("fields");
  if (
    !Array.isArray(data.markets) ||
    data.markets.length < 1 ||
    data.markets.length > 5 ||
    new Set(data.markets).size !== data.markets.length ||
    data.markets.some((m) => !inList(m, markets))
  )
    fail("markets");
  if (!draft && !data.rules) fail("consent");
}
export { scanContent as scan } from "./scanner.js";
export function mutate(
  inputState,
  session,
  action,
  data = {},
  scenario = "default",
) {
  const state = structuredClone(inputState);
  let result = null;
  const id = (prefix) => `${prefix}${++state.sequence}`;
  const now = () => CLOCK + state.sequence * 1000;
  const receipt = (message, postId, authorId = session?.id) => {
    state.notifications.unshift({
      id: id("n"),
      authorId,
      postId,
      message,
      read: false,
      createdAt: now(),
    });
  };
  const event = (target, decision, reason) =>
    state.events.unshift({
      id: id("e"),
      target,
      decision,
      reason,
      actorId: session.id,
      createdAt: now(),
    });
  if (action === "post") {
    requireMember(session);
    validatePost(data, data.draft);
    let post = data.id ? state.posts.find((p) => p.id === data.id) : null;
    if (data.id && (!post || post.authorId !== session.id || post.removed))
      fail("forbidden");
    if (
      post &&
      state.revisions.find((r) => r.id === post.revisionId)?.status ===
        "pending"
    )
      fail("underReview");
    if (!post) {
      post = {
        id: id("p"),
        authorId: session.id,
        publishedRevisionId: null,
        removed: false,
        featured: false,
        publishedAt: now(),
      };
      state.posts.push(post);
    }
    const verdict = data.draft
      ? {
          status: "draft",
          risk: "unknown",
          evidence: [],
          policy: "demo-lexicon-v1",
        }
      : scan(data.title + " " + data.body, scenario);
    const revision = {
      id: id("r"),
      postId: post.id,
      authorId: session.id,
      title: data.title.trim(),
      body: data.body.trim(),
      category: data.category,
      industry: data.industry,
      product: data.product.trim(),
      markets: data.markets,
      intent: data.intent,
      locale: data.locale,
      createdAt: now(),
      ...verdict,
      reason:
        verdict.status === "rejected"
          ? pair(
              "内容涉及不适当的商业承诺或受限制活动，请修改后重新提交。",
              "Revise restricted activities or inappropriate commercial promises before resubmitting.",
            )
          : null,
    };
    post.revisionId = revision.id;
    state.revisions.push(revision);
    if (!data.draft)
      receipt(
        pair(
          "提交已记录，请查看审核状态。未发送任何邮件。",
          "Submission recorded. Check the review status. No email was sent.",
        ),
        post.id,
      );
    result = { id: post.id, status: revision.status };
  } else if (action === "review") {
    requireModerator(session);
    const revision = state.revisions.find((r) => r.id === data.revisionId);
    const post = revision && state.posts.find((p) => p.id === revision.postId);
    if (
      !revision ||
      !post ||
      post.removed ||
      post.revisionId !== revision.id ||
      revision.status !== "pending"
    )
      fail("stale");
    if (!["approved", "rejected", "changes"].includes(data.decision))
      fail("fields");
    if (data.decision !== "approved" && !bounded(data.reason, 10, 2000))
      fail("reason");
    revision.status = data.decision === "changes" ? "rejected" : data.decision;
    revision.reason = data.reason || null;
    if (revision.status === "approved") {
      post.publishedRevisionId = revision.id;
      post.publishedAt = now();
    }
    event(revision.id, data.decision, data.reason);
    receipt(
      pair(
        "您的帖子审核已有结果。未发送任何邮件。",
        "Your listing has a review decision. No email was sent.",
      ),
      post.id,
      post.authorId,
    );
  } else if (["reaction", "bookmark", "follow"].includes(action)) {
    requireMember(session);
    if (
      action === "follow"
        ? !inList(data.id, categories)
        : !publicPosts(state).some((p) => p.id === data.id)
    )
      fail("unavailable");
    const key = {
      reaction: "reactions",
      bookmark: "bookmarks",
      follow: "follows",
    }[action];
    const existing = state[key].findIndex(
      (x) => x.authorId === session.id && x.targetId === data.id,
    );
    if (existing >= 0) state[key].splice(existing, 1);
    else state[key].push({ authorId: session.id, targetId: data.id });
  } else if (action === "comment") {
    requireMember(session);
    if (!publicPosts(state).some((p) => p.id === data.postId))
      fail("unavailable");
    if (!bounded(data.body, 2, 1000)) fail("commentLength");
    if (
      data.parentId &&
      !state.comments.some(
        (c) =>
          c.id === data.parentId &&
          c.postId === data.postId &&
          c.status === "approved" &&
          !c.parentId,
      )
    )
      fail("parent");
    const verdict = scan(data.body, scenario);
    state.comments.push({
      id: id("c"),
      postId: data.postId,
      authorId: session.id,
      parentId: data.parentId || null,
      body: data.body.trim(),
      revision: 1,
      createdAt: now(),
      ...verdict,
    });
    receipt(
      pair(
        "评论已提交审核。未发送任何邮件。",
        "Comment submitted for review. No email was sent.",
      ),
      data.postId,
    );
    result = { status: verdict.status };
  } else if (action === "reviewComment") {
    requireModerator(session);
    const comment = state.comments.find((c) => c.id === data.id);
    if (
      !comment ||
      comment.status !== "pending" ||
      data.revision !== comment.revision ||
      !publicPosts(state).some((p) => p.id === comment.postId)
    )
      fail("stale");
    if (!["approved", "rejected", "changes"].includes(data.decision))
      fail("fields");
    if (data.decision !== "approved" && !bounded(data.reason, 10, 2000))
      fail("reason");
    comment.status = data.decision === "approved" ? "approved" : "rejected";
    comment.reason = data.reason;
    event(comment.id, data.decision, data.reason);
    receipt(
      pair(
        "评论审核已有结果。未发送任何邮件。",
        "Your comment has a review decision. No email was sent.",
      ),
      comment.postId,
      comment.authorId,
    );
  } else if (action === "report") {
    requireMember(session);
    if (!publicPosts(state).some((p) => p.id === data.postId))
      fail("unavailable");
    if (
      !["misleading", "spam", "abuse", "other"].includes(data.reason) ||
      !bounded(data.message, 10, 2000)
    )
      fail("reason");
    if (
      state.reports.some(
        (r) =>
          r.postId === data.postId &&
          r.authorId === session.id &&
          r.status === "open",
      )
    )
      fail("duplicateReport");
    result = { id: id("report-") };
    state.reports.unshift({
      ...data,
      ...result,
      authorId: session.id,
      status: "open",
      createdAt: now(),
    });
    receipt(
      pair(
        "举报已记录，等待审核。未发送任何邮件。",
        "Report recorded for review. No email was sent.",
      ),
      data.postId,
    );
  } else if (action === "resolveReport") {
    requireModerator(session);
    const report = state.reports.find((r) => r.id === data.id),
      post = report && state.posts.find((p) => p.id === report.postId);
    if (
      !report ||
      !post ||
      !["remove", "restore", "dismiss"].includes(data.decision)
    )
      fail("unavailable");
    if (!bounded(data.reason, 10, 2000)) fail("reason");
    if (data.decision !== "dismiss") post.removed = data.decision === "remove";
    report.status = "resolved";
    report.resolution = data.decision;
    event(report.id, data.decision, data.reason);
    receipt(
      pair(
        "举报审核已处理。未发送任何邮件。",
        "Report review completed. No email was sent.",
      ),
      post.id,
      report.authorId,
    );
  } else if (action === "delete" || action === "restore") {
    requireMember(session);
    const post = state.posts.find((p) => p.id === data.id);
    if (!post || post.authorId !== session.id) fail("forbidden");
    post.removed = action === "delete";
  } else if (action === "enquiry") {
    if (
      (data.audience !== "feedback" && !bounded(data.name, 2, 80)) ||
      (data.audience === "feedback"
        ? !!data.email && !demoEmail(data.email)
        : !demoEmail(data.email)) ||
      !bounded(data.message, 10, 2000) ||
      (data.phone &&
        (typeof data.phone !== "string" ||
          data.phone.length > 30 ||
          !/^[+\d ()-]+$/.test(data.phone))) ||
      !["business", "financial", "individual", "feedback"].includes(
        data.audience,
      )
    )
      fail("enquiry");
    if (
      ["business", "financial"].includes(data.audience) &&
      !bounded(data.company, 2, 120)
    )
      fail("company");
    if (!data.consent) fail("consent");
    if (
      data.audience === "feedback" &&
      !["clear", "slow", "suggestion"].includes(data.reason)
    )
      fail("reason");
    if (data.postId) {
      requireMember(session);
      if (!publicPosts(state).some((p) => p.id === data.postId))
        fail("unavailable");
    }
    result = { id: id("enquiry-") };
    // Receipts retain context only. Contact fields and free-text messages never persist.
    state.enquiries.unshift({
      ...result,
      audience: data.audience,
      postId: data.postId || null,
      createdAt: now(),
    });
    receipt(
      pair(
        "演示提交成功，未发送任何消息。",
        "Demo submission complete. No message was sent.",
      ),
      data.postId,
    );
  } else if (action === "profile") {
    requireMember(session);
    if (
      !bounded(data.displayName, 2, 80) ||
      !bounded(data.company, 2, 120) ||
      !bounded(data.intro, 0, 600) ||
      !inList(data.industry, industries) ||
      !Array.isArray(data.markets) ||
      data.markets.length < 1 ||
      data.markets.length > 5 ||
      data.markets.some((m) => !inList(m, markets))
    )
      fail("profile");
    const profile = state.profiles.find((p) => p.id === session.id);
    Object.assign(profile, {
      displayName: data.displayName.trim(),
      name: data.company.trim(),
      intro: data.intro.trim(),
      industry: data.industry,
      markets: [...new Set(data.markets)],
      preferences: {
        digest: data.digest === true,
        profileVisible: data.profileVisible !== false,
      },
    });
  } else if (action === "read") {
    requireMember(session);
    state.notifications
      .filter(
        (n) => n.authorId === session.id && (!data.id || n.id === data.id),
      )
      .forEach((n) => {
        n.read = true;
      });
  } else if (action === "register") {
    if (
      !demoEmail(data.email) ||
      !bounded(data.password, 8, 128) ||
      data.password !== data.confirm ||
      !data.consent
    )
      fail("register");
    if (
      state.accounts.some(
        (a) => a.email.toLowerCase() === data.email.toLowerCase(),
      )
    )
      fail("duplicateAccount");
    const accountId = id("member-");
    state.accounts.push({
      id: accountId,
      email: data.email.toLowerCase(),
      verified: false,
    });
    state.profiles.push({
      id: accountId,
      email: data.email.toLowerCase(),
      name: pair("新示例企业", "New demo company"),
      displayName: pair("新示例会员", "New demo member"),
      industry: "services",
      markets: ["SG"],
      intro: pair(
        "欢迎交流合作需求。",
        "Welcome to a conversation about partnership needs.",
      ),
      verified: false,
    });
    result = { id: accountId };
  } else if (action === "verify") {
    const account = state.accounts.find((a) => a.id === data.id);
    if (!account) fail("unavailable");
    account.verified = true;
  } else fail("fields");
  return { state, result };
}
export const freshState = makeSeed;
