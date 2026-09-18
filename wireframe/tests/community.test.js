import test from "node:test";
import assert from "node:assert/strict";
import { freshState, mutate } from "../src/mock/service.js";
import { rankingScore, adPlan, activeAds } from "../src/mock/community.js";
const a = { id: "1", role: "member" },
  b = { id: "2", role: "member" },
  mod = { id: "moderator", role: "moderator" },
  guest = { id: null, role: "guest" };
const run = (state, actor, action, data) => mutate(state, actor, action, data);
test("free featured allowances enforce monthly limits and phase-specific benefits", () => {
  let s = freshState();
  const date = new Date().toISOString().slice(0, 10);
  let r = run(s, a, "bookAd", { postId: "1", date, benefit: true });
  s = r.state;
  assert.equal(r.result.price, 0);
  assert.equal(r.result.date.slice(0, 7), date.slice(0, 7));
  assert.throws(() =>
    run(s, a, "bookAd", { postId: "1", date, benefit: true }),
  );
  s = freshState();
  s.dau = 300;
  assert.throws(() =>
    run(s, a, "bookAd", { postId: "1", date, benefit: true }),
  );
  s.profiles[0].tier = "diamond";
  for (let i = 0; i < 2; i++)
    s = run(s, a, "bookAd", { postId: "1", date, benefit: true }).state;
  assert.throws(() =>
    run(s, a, "bookAd", { postId: "1", date, benefit: true }),
  );
});
test("mutual connection consent, recipient-only decisions, duplicate prevention, moderator handoff", () => {
  let s = freshState();
  assert.throws(() => run(s, guest, "connect", { targetId: "2", postId: "2" }));
  assert.throws(() => run(s, a, "connect", { targetId: "1", postId: "1" }));
  let r = run(s, a, "connect", { targetId: "2", postId: "2" });
  s = r.state;
  const id = r.result.id;
  assert.throws(() => run(s, a, "connect", { targetId: "2" }));
  assert.throws(() =>
    run(s, a, "connectionDecision", { id, decision: "accepted" }),
  );
  assert.throws(() => run(s, mod, "connectionComplete", { id }));
  s = run(s, b, "connectionDecision", { id, decision: "accepted" }).state;
  assert.equal(s.outbox.length, 1);
  assert.equal(s.outbox[0].status, "simulated");
  assert.throws(() =>
    run(s, b, "connectionDecision", { id, decision: "accepted" }),
  );
  s = run(s, mod, "connectionComplete", { id }).state;
  assert.equal(s.connections[0].status, "introduced");
  assert.ok(!JSON.stringify(s.connections).includes("@"));
  assert.ok(!JSON.stringify(s.connections).includes("phone"));
});
test("cold start ends at exact rolling 24/48/72 hour boundaries, refresh never renews it", () => {
  const s = freshState(),
    now = Date.now(),
    p = { id: "x", publishedAt: now, views: 0 };
  const score = (days) => rankingScore(p, s, now + days * 86400000);
  assert.equal(score(0), 21);
  assert.equal(score(1), 1 / 2 ** 0.2 + 10);
  assert.equal(score(2), 1 / 3 ** 0.2 + 5);
  assert.equal(score(3), 1 / 4 ** 0.2);
  let old = s.posts[0];
  const published = old.publishedAt;
  s.posts[0].publishedAt = now - 10 * 86400000;
  const refreshed = run(s, a, "refreshPost", { id: "1" }).state;
  assert.equal(refreshed.posts[0].publishedAt, s.posts[0].publishedAt);
  assert.ok(rankingScore(refreshed.posts[0], refreshed, now) < 20);
  assert.throws(() => run(s, b, "refreshPost", { id: "1" }));
  assert.ok(published);
});
test("ranking weights use approved comments, likes and connection requests without sponsored boost", () => {
  const s = freshState(),
    now = Date.now(),
    p = {
      id: "x",
      publishedAt: now - 4 * 86400000,
      lastActivityAt: now,
      views: 9,
      featured: true,
    };
  s.reactions = [{ targetId: "x" }];
  s.comments = [
    { postId: "x", status: "approved", createdAt: now },
    { postId: "x", status: "pending", createdAt: now },
  ];
  s.connections = [{ postId: "x", createdAt: now }];
  assert.ok(
    Math.abs(rankingScore(p, s, now) - (2 + 6 * Math.log10(2))) < 1e-12,
  );
});
test("ad pricing boundaries and CPC activation require both conditions", () => {
  assert.equal(adPlan(199).price, 2);
  assert.equal(adPlan(200).price, 8);
  assert.equal(adPlan(800).price, 16);
  assert.equal(adPlan(1600).price, 20);
  assert.equal(adPlan(2000, 3).phase, 2);
  assert.equal(adPlan(2001, 2).phase, 2);
  assert.equal(adPlan(2001, 3).phase, 3);
});
test("payment then review, capacity limits, advertiser-only booking and attributed conversion", () => {
  let s = freshState(),
    date = new Date().toISOString().slice(0, 10);
  assert.throws(() =>
    run(s, b, "bookAd", { postId: "1", date, payment: true }),
  );
  assert.throws(() => run(s, a, "bookAd", { postId: "1", date }));
  let r = run(s, a, "bookAd", { postId: "1", date, payment: true });
  s = r.state;
  const id = r.result.id;
  assert.equal(activeAds(s).length, 0);
  assert.equal(r.result.price, 2);
  assert.throws(() =>
    run(s, a, "bookAd", { postId: "1", date, payment: true }),
  );
  assert.throws(() => run(s, a, "reviewAd", { id, decision: "approved" }));
  s = run(s, mod, "reviewAd", { id, decision: "approved" }).state;
  assert.equal(activeAds(s).length, 1);
  s = run(s, b, "adClick", { id }).state;
  s = run(s, b, "connect", { targetId: "1", postId: "1" }).state;
  assert.equal(s.adEvents.filter((e) => e.type === "connection").length, 1);
  assert.equal(s.adEvents.filter((e) => e.type === "click").length, 1);
});
test("both registration tracks require core fields; individual never requires a company", () => {
  const data = {
    track: "individual",
    firstName: "Demo",
    lastName: "User",
    countryCode: "+86",
    phone: "13800000000",
    email: "new@cys.example",
    password: "DemoPass123",
    confirm: "DemoPass123",
    consent: true,
  };
  const r = run(freshState(), guest, "register", data);
  assert.equal(r.state.profiles.at(-1).tier, "silver");
  for (const change of [
    { firstName: "" },
    { phone: "     " },
    { countryCode: "0" },
    { track: "company" },
  ])
    assert.throws(() =>
      run(freshState(), guest, "register", { ...data, ...change }),
    );
  assert.ok(!JSON.stringify(r.state).includes(data.phone));
});
