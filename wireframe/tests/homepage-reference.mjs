import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { categories, markets } from "../src/content/catalog.js";
import { makeSeed } from "../src/mock/seed.js";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.CYS_PLAYWRIGHT_PATH ||
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    ),
);
const root = "http://127.0.0.1:5173";
const output =
  process.env.CYS_QA_OUTPUT ||
  path.join(os.tmpdir(), "cys-homepage-reference-qa");
await fs.mkdir(path.join(output, "screenshots"), { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const checks = [];
const errors = [];
const check = (result, message) => {
  if (!result) throw new Error(message);
  checks.push(message);
};
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const goto = async (route, lang = "zh") => {
  const url = new URL(route, root);
  url.searchParams.set("lang", lang);
  await page.goto(url.href);
  await page.locator("main").waitFor();
  await page.evaluate(() => document.fonts.ready);
};
const setState = async (state, lang = "zh") => {
  await page.evaluate((value) => {
    localStorage.setItem("cys-hifi-demo-v1", JSON.stringify(value));
  }, state);
  await goto("/home", lang);
};
const postLink = () => page.locator('.hero-forum-card a[href*="/forum/post/"]');
const controls = (lang) => ({
  previous: page.getByRole("button", {
    name: lang === "zh" ? "上一条需求" : "Previous request",
    exact: true,
  }),
  next: page.getByRole("button", {
    name: lang === "zh" ? "下一条需求" : "Next request",
    exact: true,
  }),
});
const focusVisible = async (locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return (
      element === document.activeElement &&
      element.matches(":focus-visible") &&
      ((style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) ||
        style.boxShadow !== "none")
    );
  });
const seed = makeSeed();
let failure;

try {
  await goto("/home");
  await setState(seed);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const lang of ["zh", "en"]) {
      await goto("/home", lang);
      const label = `${width}px ${lang}`;
      const shortcuts = page.locator(".hero-shortcuts");
      const expected = [
        ["热门帖子", "Popular posts", "/forum", "trending", ""],
        ["产品与服务", "Products & services", "/home", "", "#services"],
        ["发展历程", "Our history", "/about", "", "#history"],
        ["联系我们", "Contact", "/contact", "", ""],
      ];
      check(
        (await shortcuts.getByRole("link").count()) === 4,
        `${label}: four shortcuts`,
      );
      for (const [zh, en, route, sort, hash] of expected) {
        const link = shortcuts.getByRole("link", {
          name: lang === "zh" ? zh : en,
          exact: true,
        });
        const href = new URL(await link.getAttribute("href"), root);
        check(
          (await link.isVisible()) &&
            href.pathname === route &&
            (href.searchParams.get("sort") || "") === sort &&
            href.hash === hash &&
            href.searchParams.get("lang") === lang,
          `${label}: ${lang === "zh" ? zh : en} destination and language`,
        );
      }
      const card = page.locator(".hero-forum-card");
      const revision = seed.revisions.find((item) => item.id === "r1");
      const content = await card.innerText();
      check(
        (await postLink().count()) === 1 &&
          (await postLink().innerText()).includes(revision.title[lang]) &&
          content.includes(
            categories.find((item) => item.id === revision.category)[lang],
          ) &&
          revision.markets.every((id) =>
            content.includes(markets.find((item) => item.id === id)[lang]),
          ) &&
          content.includes(
            lang === "zh"
              ? "华商论坛 · 最新需求"
              : "Chinese Forum · Latest requests",
          ),
        `${label}: compact card shows one latest published request with localized context`,
      );
      check(
        (await card.locator('a[href="/forum?lang=' + lang + '"]').count()) ===
          1 &&
          (await page
            .locator(".hero-bottom, .hero-search, .hero-topics")
            .count()) === 0,
        `${label}: browse-all link replaces the old search and topics row`,
      );
      const { previous, next } = controls(lang);
      const title = await postLink().innerText();
      await next.click();
      check(
        (await postLink().innerText()) !== title,
        `${label}: next request changes the card`,
      );
      await previous.click();
      check(
        (await postLink().innerText()) === title,
        `${label}: previous request restores the card`,
      );
      const rendering = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenImages: [...document.images].some(
          (image) => image.complete && !image.naturalWidth,
        ),
      }));
      check(
        !rendering.overflow && !rendering.brokenImages,
        `${label}: no horizontal overflow or broken loaded images`,
      );
      if (width === 390 || width === 1440) {
        await page.setViewportSize({
          width,
          height: width === 390 ? 1500 : 1000,
        });
        await page.evaluate(() => {
          document.activeElement?.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: path.join(
            output,
            "screenshots",
            `home-hero-${width}-${lang}.png`,
          ),
        });
        await page.setViewportSize({ width, height: 1000 });
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const lang of ["zh", "en"]) {
    await goto("/home", lang);
    const { previous, next } = controls(lang);
    const title = await postLink().innerText();
    await previous.focus();
    await page.keyboard.press("Tab");
    check(
      await focusVisible(next),
      `${lang}: card control has visible keyboard focus`,
    );
    await page.keyboard.press("Enter");
    check(
      (await postLink().innerText()) !== title,
      `${lang}: Enter advances the request`,
    );
    check(
      await page
        .locator(".hero-forum-card")
        .evaluate((card) =>
          card
            .getAnimations({ subtree: true })
            .every(
              (animation) =>
                animation.playState !== "running" ||
                animation.effect
                  .getKeyframes()
                  .every(
                    (frame) => !frame.transform || frame.transform === "none",
                  ),
            ),
        ),
      `${lang}: reduced motion avoids moving request transitions`,
    );
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Space");
    check(
      (await postLink().innerText()) === title,
      `${lang}: Space returns to the previous request`,
    );
    const requestTitle = await postLink().innerText();
    await postLink().click();
    await page.waitForURL(
      (url) =>
        url.pathname === "/forum/post/1" &&
        url.searchParams.get("lang") === lang,
    );
    check(
      (await page.getByRole("heading", { level: 1 }).innerText()).includes(
        requestTitle.trim(),
      ),
      `${lang}: request title opens its matching public post`,
    );
    for (const [zh, en, route, hash] of [
      ["热门帖子", "Popular posts", "/forum", ""],
      ["产品与服务", "Products & services", "/home", "#services"],
      ["发展历程", "Our history", "/about", "#history"],
      ["联系我们", "Contact", "/contact", ""],
    ]) {
      await goto("/home", lang);
      const link = page
        .locator(".hero-shortcuts")
        .getByRole("link", { name: lang === "zh" ? zh : en, exact: true });
      await link.focus();
      await page.keyboard.press("Enter");
      await page.waitForURL(
        (url) =>
          url.pathname === route &&
          url.hash === hash &&
          url.searchParams.get("lang") === lang,
      );
      if (hash) {
        const target = page.locator(hash);
        check(
          await target.isVisible(),
          `${lang}: shortcut opens the ${hash.slice(1)} section`,
        );
      } else {
        check(
          await page.getByRole("heading", { level: 1 }).isVisible(),
          `${lang}: shortcut opens ${route}`,
        );
      }
    }
    await goto("/forum", lang);
    await page
      .getByLabel(lang === "zh" ? "搜索论坛" : "Search forum", { exact: true })
      .fill(lang === "zh" ? "调味品" : "pantry");
    await page
      .locator(".search-form")
      .getByRole("button", {
        name: lang === "zh" ? "搜索" : "Search",
        exact: true,
      })
      .click();
    await page.waitForURL(
      (url) => url.pathname === "/forum/search" && url.searchParams.has("q"),
    );
    check(
      (await page.locator(".post-row").count()) > 0,
      `${lang}: forum search still returns matching requests`,
    );
  }

  const fixture = makeSeed();
  fixture.posts = [
    fixture.posts[0],
    fixture.posts[1],
    ...fixture.posts.slice(24),
  ];
  const privateRevision = {
    ...fixture.revisions[0],
    id: "private-homepage-revision",
    title: { zh: "未审核的私密修改", en: "Private unapproved revision" },
    status: "pending",
  };
  fixture.revisions.push(privateRevision);
  fixture.posts[0].revisionId = privateRevision.id;
  for (const post of fixture.posts.slice(2))
    post.publishedAt = Date.now() + 100000;
  await setState(fixture, "en");
  const firstTitle = await postLink().innerText();
  await controls("en").next.click();
  const secondTitle = await postLink().innerText();
  await controls("en").next.click();
  check(
    firstTitle.includes(fixture.revisions[0].title.en) &&
      secondTitle.includes(fixture.revisions[1].title.en) &&
      (await postLink().innerText()) === firstTitle,
    "Only public revisions cycle; drafts, pending, rejected, removed and a private edit stay hidden",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(6500);
  check(
    (await postLink().innerText()) === firstTitle,
    "The request card does not autoplay",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  const stability = makeSeed();
  stability.posts = stability.posts.slice(0, 2);
  stability.revisions[0].title = {
    zh: "这是一个用于检查论坛需求卡片在长标题和五个地区下仍可稳定操作的测试标题。"
      .repeat(4)
      .slice(0, 100),
    en: "Seeking cross-border partners for a complete range of products and services across five Asian markets.".slice(
      0,
      100,
    ),
  };
  stability.revisions[0].markets = ["SG", "CN", "MY", "ID", "TH"];
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1500 });
    for (const lang of ["zh", "en"]) {
      await setState(stability, lang);
      const next = controls(lang).next;
      const before = await next.boundingBox();
      await next.click();
      const after = await next.boundingBox();
      check(
        before &&
          after &&
          Math.abs(before.y - after.y) < 1 &&
          Math.abs(before.x - after.x) < 1 &&
          (await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          )),
        `${width}px ${lang}: maximum-length title and five markets keep the cycling controls stable`,
      );
    }
  }
  fixture.posts = [fixture.posts[0]];
  await setState(fixture, "en");
  const singleControls = page.locator(".hero-forum-card").getByRole("button");
  check(
    (await postLink().count()) === 1 &&
      ((await singleControls.count()) === 0 ||
        ((await controls("en").previous.isDisabled()) &&
          (await controls("en").next.isDisabled()))),
    "A single public request remains readable with inactive cycling controls",
  );
  fixture.posts = [];
  for (const lang of ["zh", "en"]) {
    await setState(fixture, lang);
    const card = page.locator(".hero-forum-card");
    check(
      (await postLink().count()) === 0 &&
        (await card.innerText()).includes(
          lang === "zh" ? "暂无公开需求" : "No public requests yet",
        ) &&
        (await card.locator('a[href="/forum?lang=' + lang + '"]').count()) ===
          1,
      `${lang}: empty forum has readable fallback and a working browse-all destination`,
    );
  }
  check(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    "Checks run with reduced motion enabled",
  );
  check(errors.length === 0, "No browser console or uncaught runtime errors");
} catch (error) {
  failure = error.message;
  await page.screenshot({
    path: path.join(output, "failure.png"),
    fullPage: true,
  });
} finally {
  await fs.writeFile(
    path.join(output, "homepage-reference-checks.json"),
    JSON.stringify({ checks, errors, failure }, null, 2),
  );
  await browser.close();
}
if (failure) throw new Error(failure);
console.log(
  `${checks.length} homepage reference checks passed; ${errors.length} errors`,
);
