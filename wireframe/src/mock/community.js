export const tiers = [
  { id: "bronze", zh: "铜", en: "Bronze", days: 0 },
  { id: "silver", zh: "银", en: "Silver", days: 0 },
  { id: "gold", zh: "金", en: "Gold", days: 0 },
  { id: "platinum", zh: "铂金", en: "Platinum", days: 1 },
  { id: "diamond", zh: "钻石", en: "Diamond", days: 2 },
  { id: "black", zh: "黑金", en: "Black", days: 3 },
];
export const tierOf = (profile) =>
  tiers.find((t) => t.id === profile?.tier) || tiers[profile ? 1 : 0];
export function rankingScore(post, state, now = Date.now()) {
  const likes = state.reactions.filter((r) => r.targetId === post.id).length;
  const comments = state.comments.filter(
    (c) => c.postId === post.id && c.status === "approved",
  );
  const connections = (state.connections || []).filter(
    (c) => c.postId === post.id,
  );
  const published = post.firstPublishedAt || post.publishedAt;
  const activity = Math.max(
    published,
    post.refreshedAt || 0,
    post.lastActivityAt || 0,
    ...comments.map((c) => c.createdAt),
    ...connections.map((c) => c.createdAt),
  );
  const age = Math.max(0, (now - published) / 86400000);
  const bonus = age < 1 ? 20 : age < 2 ? 10 : age < 3 ? 5 : 0;
  const engagement =
    1 +
    Math.log10(1 + (post.views || 0)) +
    1.5 * Math.log10(1 + likes) +
    2 * Math.log10(1 + comments.length) +
    2.5 * Math.log10(1 + connections.length);
  return (
    engagement / (1 + Math.max(0, (now - activity) / 86400000)) ** 0.2 + bonus
  );
}
// Explicit half-open bands resolve overlapping endpoints in the pricing deck.
export function adPlan(dau = 120, bidders = 0) {
  if (dau > 2000 && bidders >= 3) return { phase: 3, slots: 3, price: null };
  if (dau < 200) return { phase: 1, slots: 1, price: 2 };
  return { phase: 2, slots: 3, price: dau < 800 ? 8 : dau < 1600 ? 16 : 20 };
}
export const activeAds = (state, now = Date.now()) =>
  (state.ads || [])
    .filter(
      (a) =>
        a.status === "approved" &&
        a.date === new Date(now).toISOString().slice(0, 10) &&
        state.posts.some(
          (p) => p.id === a.postId && p.publishedRevisionId && !p.removed,
        ),
    )
    .slice(0, adPlan(state.dau, state.bidders).slots);
export function communityAction(state, session, action, data, fail) {
  const now = Date.now();
  const uid = (prefix) => `${prefix}${++state.sequence}`;
  const member = () => {
    if (session?.role !== "member" || !session.id) fail("login");
  };
  const moderator = () => {
    if (session?.role !== "moderator") fail("forbidden");
  };
  const publicPost = (id) =>
    state.posts.find((p) => p.id === id && !p.removed && p.publishedRevisionId);
  state.connections ||= [];
  state.ads ||= [];
  state.adEvents ||= [];
  state.outbox ||= [];
  if (action === "connect") {
    member();
    const target = state.profiles.find((p) => p.id === data.targetId);
    if (
      !target ||
      target.id === session.id ||
      (data.postId && publicPost(data.postId)?.authorId !== target.id)
    )
      fail("unavailable");
    if (
      state.connections.some(
        (c) =>
          c.status !== "declined" &&
          [c.from, c.to].includes(session.id) &&
          [c.from, c.to].includes(target.id),
      )
    )
      fail("duplicateConnection");
    const record = {
      id: uid("connection-"),
      from: session.id,
      to: target.id,
      postId: data.postId || null,
      status: "pending",
      createdAt: now,
    };
    state.connections.unshift(record);
    if (data.postId) publicPost(data.postId).lastActivityAt = now;
    const attribution = state.adEvents.findLast(
      (e) =>
        e.type === "click" &&
        e.actorId === session.id &&
        e.postId === data.postId &&
        now - e.at < 7 * 86400000,
    );
    if (attribution)
      state.adEvents.push({
        id: uid("conversion-"),
        type: "connection",
        adId: attribution.adId,
        postId: data.postId,
        actorId: session.id,
        at: now,
      });
    return record;
  }
  if (action === "connectionDecision") {
    member();
    const c = state.connections.find((c) => c.id === data.id);
    if (
      !c ||
      c.to !== session.id ||
      c.status !== "pending" ||
      !["accepted", "declined"].includes(data.decision)
    )
      fail("forbidden");
    c.status = data.decision;
    c.updatedAt = now;
    if (c.status === "accepted")
      state.outbox.unshift({
        id: uid("mail-"),
        connectionId: c.id,
        status: "simulated",
        createdAt: now,
      });
    return c;
  }
  if (action === "connectionComplete") {
    moderator();
    const c = state.connections.find((c) => c.id === data.id);
    if (!c || c.status !== "accepted") fail("unavailable");
    c.status = "introduced";
    return c;
  }
  if (action === "refreshPost") {
    member();
    const p = publicPost(data.id);
    if (!p || p.authorId !== session.id) fail("forbidden");
    p.refreshedAt = now;
    return p;
  }
  if (action === "viewPost") {
    const p = publicPost(data.id);
    if (!p) fail("unavailable");
    p.views = (p.views || 0) + 1;
    return { success: true };
  }
  if (action === "adClick") {
    const ad = activeAds(state, now).find((a) => a.id === data.id);
    if (!ad) fail("unavailable");
    state.adEvents.push({
      id: uid("click-"),
      type: "click",
      adId: ad.id,
      postId: ad.postId,
      actorId: session.id || null,
      at: now,
    });
    return ad;
  }
  if (action === "bookAd") {
    member();
    const p = publicPost(data.postId),
      plan = adPlan(state.dau, state.bidders);
    if (!p || p.authorId !== session.id || plan.phase === 3)
      fail("unavailable");
    const start = new Date(data.date + "T00:00:00Z").getTime();
    if (
      !Number.isFinite(start) ||
      new Date(start).toISOString().slice(0, 10) !== data.date ||
      data.date < new Date(now).toISOString().slice(0, 10) ||
      start - now > 90 * 86400000
    )
      fail("adDate");
    let date = data.date;
    const tier = tierOf(state.profiles.find((p) => p.id === session.id));
    if (data.benefit) {
      const days = plan.phase === 2 && tier.id === "platinum" ? 0 : tier.days;
      const used = state.ads.filter(
        (a) =>
          a.authorId === session.id &&
          a.benefit &&
          a.status !== "rejected" &&
          a.date.slice(0, 7) === date.slice(0, 7),
      ).length;
      if (!days || used >= days) fail("adBenefit");
      if (tier.id === "platinum") {
        const candidates = [];
        for (let day = 1; day <= 31; day++) {
          const d = date.slice(0, 7) + "-" + String(day).padStart(2, "0");
          if (
            new Date(d + "T00:00:00Z").toISOString().slice(0, 10) !== d ||
            d < new Date(now).toISOString().slice(0, 10)
          )
            continue;
          if (
            state.ads.filter((a) => a.date === d && a.status !== "rejected")
              .length < plan.slots
          )
            candidates.push(d);
        }
        if (!candidates.length) fail("adCapacity");
        date = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    if (
      state.ads.filter((a) => a.date === date && a.status !== "rejected")
        .length >= plan.slots
    )
      fail("adCapacity");
    if (!data.benefit && data.payment !== true) fail("consent");
    const ad = {
      id: uid("ad-"),
      postId: p.id,
      authorId: session.id,
      date,
      benefit: !!data.benefit,
      price: data.benefit ? 0 : plan.price,
      status: "pending",
      createdAt: now,
    };
    state.ads.unshift(ad);
    return ad;
  }
  if (action === "reviewAd") {
    moderator();
    const ad = state.ads.find((a) => a.id === data.id);
    if (
      !ad ||
      ad.status !== "pending" ||
      !["approved", "rejected"].includes(data.decision)
    )
      fail("unavailable");
    ad.status = data.decision;
    return ad;
  }
  fail("fields");
}
export const communityActions = [
  "connect",
  "connectionDecision",
  "connectionComplete",
  "refreshPost",
  "viewPost",
  "adClick",
  "bookAd",
  "reviewAd",
];
