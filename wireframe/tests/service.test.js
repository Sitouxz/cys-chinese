import test from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  mutate,
  publicPosts,
  visiblePost,
  visibleComments,
  scan,
} from "../src/mock/service.js";
const member = { id: "1", role: "member" },
  other = { id: "2", role: "member" },
  guest = { id: null, role: "guest" },
  moderator = { id: "moderator", role: "moderator" };
const valid = {
  title: "寻找新的合作经销伙伴",
  body: "我们希望与新加坡的经销企业交流合作需求，提供产品规格与试点安排，共同讨论清晰透明的下一步。",
  category: "matching",
  industry: "food",
  product: "示例食品",
  markets: ["SG"],
  intent: "distributor",
  rules: true,
  locale: "zh",
};
const run = (state, actor, action, data, scenario) =>
  mutate(state, actor, action, data, scenario);
test("fixture inventory and public counts", () => {
  const s = freshState();
  assert.equal(publicPosts(s).length, 24);
  assert.equal(s.profiles.length, 8);
  assert.equal(s.stories.length, 6);
  assert.equal(s.comments.filter((c) => c.status === "approved").length, 18);
  assert.equal(s.comments.filter((c) => c.parentId).length, 6);
  assert.equal(s.posts.filter((p) => p.featured).length, 3);
  assert.equal(s.reports.length, 4);
  assert.equal(s.notifications.length, 8);
});
test("pending -> exact approval -> edit -> rejection preserves public revision -> correction -> approval", () => {
  let s = freshState();
  let x = run(s, member, "post", valid);
  s = x.state;
  const id = x.result.id;
  assert.equal(x.result.status, "pending");
  assert.equal(visiblePost(s, id, guest), null);
  assert.equal(visiblePost(s, id, other), null);
  assert.equal(visiblePost(s, id, member).title, valid.title);
  const r = visiblePost(s, id, member).revisionId;
  s = run(s, moderator, "review", {
    revisionId: r,
    decision: "approved",
  }).state;
  assert.equal(publicPosts(s)[0].id, id);
  x = run(s, member, "post", { ...valid, id, title: "修改后的私有合作需求" });
  s = x.state;
  assert.equal(visiblePost(s, id, guest).title, valid.title);
  const r2 = visiblePost(s, id, member).revisionId;
  assert.throws(() =>
    run(s, moderator, "review", { revisionId: r, decision: "approved" }),
  );
  s = run(s, moderator, "review", {
    revisionId: r2,
    decision: "rejected",
    reason: "Please clarify the planned pilot requirements.",
  }).state;
  assert.equal(visiblePost(s, id, guest).title, valid.title);
  x = run(s, member, "post", {
    ...valid,
    id,
    title: "更清晰的新加坡试点合作需求",
  });
  s = x.state;
  s = run(s, moderator, "review", {
    revisionId: visiblePost(s, id, member).revisionId,
    decision: "approved",
  }).state;
  assert.equal(visiblePost(s, id, guest).title, "更清晰的新加坡试点合作需求");
});
test("no ownership or moderator privilege through ordinary member actions", () => {
  const s = freshState();
  assert.throws(() => run(s, guest, "post", valid));
  assert.throws(() => run(s, other, "post", { ...valid, id: "1" }));
  assert.throws(() => run(s, other, "delete", { id: "1" }));
  assert.throws(() =>
    run(s, member, "review", { revisionId: "r27", decision: "approved" }),
  );
  assert.equal(visiblePost(s, "25", guest), null);
  assert.equal(visiblePost(s, "25", other), null);
});
test("risk policies including English, failure and alternative", () => {
  assert.equal(scan("洗钱需求").status, "rejected");
  assert.equal(scan("稳赚商业机会").status, "rejected");
  assert.equal(scan(valid.body, "low").status, "pending");
  assert.equal(scan("English partnership proposal", "high").status, "pending");
  assert.equal(scan("混合 English 文本", "mid").status, "pending");
  assert.equal(scan("中文案例", "unknown").status, "pending");
  assert.equal(scan("中文案例", "scan-failure").scanFailed, true);
  assert.equal(scan("稳赚合作", "mid-review").status, "pending");
  assert.equal(
    scan("稳赚合作", "mid-review").policy,
    "alternative-mid-review-v1",
  );
});
test("toggle reversibility and independent member records", () => {
  for (const action of ["reaction", "bookmark", "follow"]) {
    const id = action === "follow" ? "matching" : "1",
      key = { reaction: "reactions", bookmark: "bookmarks", follow: "follows" }[
        action
      ];
    let s = run(freshState(), member, action, { id }).state;
    assert.equal(s[key].length, 1);
    s = run(s, other, action, { id }).state;
    assert.equal(s[key].length, 2);
    s = run(s, member, action, { id }).state;
    assert.equal(s[key].length, 1);
  }
});
test("comments are private until exact review, one reply level only", () => {
  let s = run(freshState(), member, "comment", {
    postId: "1",
    body: "我们希望进一步交流试点的安排。",
  }).state;
  const c = s.comments.at(-1);
  assert.ok(!visibleComments(s, "1", other).some((x) => x.id === c.id));
  assert.ok(visibleComments(s, "1", member).some((x) => x.id === c.id));
  assert.throws(() =>
    run(s, moderator, "reviewComment", {
      id: c.id,
      revision: 2,
      decision: "approved",
    }),
  );
  s = run(s, moderator, "reviewComment", {
    id: c.id,
    revision: 1,
    decision: "approved",
  }).state;
  assert.ok(visibleComments(s, "1", guest).some((x) => x.id === c.id));
  assert.throws(() =>
    run(s, member, "comment", {
      postId: "1",
      parentId: "c3",
      body: "Nested reply is not allowed.",
    }),
  );
  assert.throws(() =>
    run(s, member, "comment", {
      postId: "2",
      parentId: "c1",
      body: "Wrong post.",
    }),
  );
});
test("reports do not remove posts; removal and explicit restoration are audited", () => {
  let x = run(freshState(), member, "report", {
    postId: "1",
    reason: "misleading",
    message: "Please verify this description is clearly illustrative.",
  });
  let s = x.state;
  const id = x.result.id;
  assert.ok(publicPosts(s).some((p) => p.id === "1"));
  assert.throws(() =>
    run(s, member, "report", {
      postId: "1",
      reason: "misleading",
      message: "Duplicate report request.",
    }),
  );
  s = run(s, moderator, "resolveReport", {
    id,
    decision: "remove",
    reason: "Unclear listing removed after review.",
  }).state;
  assert.ok(!publicPosts(s).some((p) => p.id === "1"));
  s = run(s, moderator, "resolveReport", {
    id,
    decision: "restore",
    reason: "Listing restored after checking the full context.",
  }).state;
  assert.ok(publicPosts(s).some((p) => p.id === "1"));
  assert.equal(s.events.length, 2);
});
test("soft delete supports undo without destructive reset", () => {
  let s = run(freshState(), member, "delete", { id: "1" }).state;
  assert.ok(!publicPosts(s).some((p) => p.id === "1"));
  s = run(s, member, "restore", { id: "1" }).state;
  assert.ok(publicPosts(s).some((p) => p.id === "1"));
});
test("enquiries validate synthetic contact details and never retain them", () => {
  const data = {
    name: "Fictional Name",
    email: "synthetic@brand.example",
    company: "Fictional Company",
    audience: "business",
    message: "Please discuss a fictional partnership.",
    consent: true,
  };
  let x = run(freshState(), guest, "enquiry", data);
  assert.ok(x.result.id);
  assert.ok(!JSON.stringify(x.state.enquiries).includes(data.name));
  assert.ok(!JSON.stringify(x.state.enquiries).includes(data.email));
  assert.ok(!JSON.stringify(x.state.enquiries).includes(data.message));
  assert.throws(() =>
    run(freshState(), guest, "enquiry", { ...data, email: "real@example.com" }),
  );
  assert.throws(() =>
    run(freshState(), guest, "enquiry", { ...data, consent: false }),
  );
});
test("registration does not store passwords; duplicates and invalid values rejected", () => {
  const data = {
    email: "new@brand.example",
    track: "company",
    firstName: "Demo",
    lastName: "User",
    countryCode: "+65",
    phone: "80000000",
    company: "Demo Co",
    position: "owner",
    password: "Synthetic123",
    confirm: "Synthetic123",
    consent: true,
  };
  let x = run(freshState(), guest, "register", data);
  assert.ok(!JSON.stringify(x.state).includes("Synthetic123"));
  assert.throws(() => run(x.state, guest, "register", data));
  assert.equal(x.state.accounts.at(-1).verified, false);
  x = run(x.state, guest, "verify", { id: x.result.id });
  assert.equal(x.state.accounts.at(-1).verified, true);
});
test("boundary rejects short, whitespace-only, excessive and invalid structured inputs", () => {
  for (const change of [
    { title: "short" },
    { title: " ".repeat(9) },
    { title: "a".repeat(101) },
    { body: "x".repeat(3001) },
    { category: "unknown" },
    { industry: "unknown" },
    { intent: "unknown" },
    { product: "" },
    { markets: [] },
    { markets: ["XX"] },
    { markets: ["SG", "SG"] },
    { rules: false },
  ])
    assert.throws(() =>
      run(freshState(), member, "post", { ...valid, ...change }),
    );
});
