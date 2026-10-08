import test from "node:test";
import assert from "node:assert/strict";
import { clampTilt, clampZoom, projectEarth } from "../src/components/earth.js";
import { revealSegments } from "../src/components/reveal.js";
import { featuredDays, tierOf } from "../src/mock/community.js";
import { freshState, mutate, restoreDemo } from "../src/mock/service.js";

test("Chinese and English reveal segmentation preserves punctuation and spacing", () => {
  for (const [text, locale] of [
    ["连接中国与东南亚的可信桥梁，启迪跨境商业的新可能。", "zh-CN"],
    ["Connect China and Southeast Asia. Together.", "en"],
  ]) {
    const parts = revealSegments(text, locale);
    assert.equal(parts.join(""), text);
    assert.ok(parts.length > 4);
  }
  const fallback = revealSegments("中国，e\u0301𠀀。", "zh-CN", null);
  assert.deepEqual(fallback, ["中", "国", "，", "e\u0301", "𠀀", "。"]);
});
test("Earth projection shows China north-east of Singapore and hides rear markers", () => {
  const china = projectEarth(31.2, 121.5),
    sg = projectEarth(1.3, 103.8);
  assert.ok(china.front && sg.front);
  assert.ok(china.x > sg.x && china.y < sg.y);
  assert.equal(projectEarth(1.3, 103.8, 283.8).front, false);
  assert.equal(clampZoom(5), 1.4);
  assert.equal(clampZoom(0), 0.8);
  assert.equal(clampZoom(1), 1);
  assert.equal(clampTilt(10), (55 * Math.PI) / 180);
  assert.equal(clampTilt(-10), (-25 * Math.PI) / 180);
  const tilted = projectEarth(31.2, 121.5, 105, 1, (50 * Math.PI) / 180);
  assert.ok(tilted.front && tilted.y > china.y);
});
test("older saved demos retain workflow records and gain missing community defaults", () => {
  const saved = freshState();
  saved.posts[0].views = 42;
  saved.accounts[0].email = "member1@cys.example";
  delete saved.ads;
  delete saved.dau;
  delete saved.bidders;
  const restored = restoreDemo(saved);
  assert.equal(restored.posts[0].views, 42);
  assert.equal(restored.accounts[0].email, "member1@member.example");
  assert.equal(restored.dau, 120);
  assert.deepEqual(restored.ads, []);
  assert.equal(saved.accounts[0].email, "member1@cys.example");
  assert.deepEqual(restoreDemo({ version: 2 }), freshState());
});
test("featured allowances match each phase and unknown rules never grant extra days", () => {
  for (const [id, phase1, phase2] of [
    ["silver", 0, 0],
    ["platinum", 1, 0],
    ["diamond", 2, 2],
    ["black", 3, 3],
  ]) {
    const tier = tierOf({ tier: id });
    assert.equal(featuredDays(tier, 1), phase1);
    assert.equal(featuredDays(tier, 2), phase2);
    assert.equal(featuredDays(tier, 3), 0);
  }
});
test("only staff can configure demo traffic and assign neutral higher tiers", () => {
  const s = freshState(),
    member = { id: "1", role: "member" },
    staff = { id: "moderator", role: "moderator" };
  assert.throws(() =>
    mutate(s, member, "configureCommunity", { dau: 2500, bidders: 3 }),
  );
  assert.throws(() =>
    mutate(s, member, "setDemoTier", { id: "1", tier: "black" }),
  );
  assert.throws(() =>
    mutate(s, staff, "configureCommunity", { dau: -1, bidders: 3 }),
  );
  const configured = mutate(s, staff, "configureCommunity", {
    dau: 2500,
    bidders: 3,
  }).state;
  assert.equal(configured.dau, 2500);
  const upgraded = mutate(configured, staff, "setDemoTier", {
    id: "1",
    tier: "black",
  }).state;
  assert.equal(upgraded.profiles[0].tier, "black");
  assert.throws(() =>
    mutate(upgraded, member, "bookAd", {
      postId: "1",
      date: new Date().toISOString().slice(0, 10),
      payment: true,
    }),
  );
});
test("decline allows a fresh request; repeated acceptance cannot duplicate staff notifications", () => {
  const a = { id: "1", role: "member" },
    b = { id: "2", role: "member" };
  let r = mutate(freshState(), a, "connect", { targetId: "2", postId: "2" });
  let s = mutate(r.state, b, "connectionDecision", {
    id: r.result.id,
    decision: "declined",
  }).state;
  assert.equal(s.outbox.length, 0);
  r = mutate(s, a, "connect", { targetId: "2", postId: "2" });
  s = mutate(r.state, b, "connectionDecision", {
    id: r.result.id,
    decision: "accepted",
  }).state;
  assert.equal(s.outbox.length, 1);
  assert.throws(() =>
    mutate(s, b, "connectionDecision", {
      id: r.result.id,
      decision: "accepted",
    }),
  );
  assert.equal(s.outbox.length, 1);
});
test("company optional fields are bounded, stored privately and cannot leak into a public profile", () => {
  const data = {
    track: "company",
    firstName: "Demo",
    lastName: "User",
    email: "company@member.example",
    phone: "80000000",
    countryCode: "+65",
    company: "Sample company",
    position: "owner",
    industry: "Food",
    region: "Singapore",
    intent: "Supplier",
    profileLink: "https://company.example",
    password: "DemoPass123",
    confirm: "DemoPass123",
    consent: true,
  };
  const r = mutate(freshState(), { role: "guest" }, "register", data);
  assert.equal(r.state.accounts.at(-1).registration.region, "Singapore");
  assert.equal(r.state.profiles.at(-1).tier, "silver");
  assert.equal(r.state.profiles.at(-1).phone, undefined);
  assert.throws(() =>
    mutate(freshState(), { role: "guest" }, "register", {
      ...data,
      industry: "x".repeat(121),
    }),
  );
  assert.throws(() =>
    mutate(freshState(), { role: "guest" }, "register", {
      ...data,
      position: "invented",
    }),
  );
});
