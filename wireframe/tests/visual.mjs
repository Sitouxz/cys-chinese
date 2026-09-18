import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
const require = createRequire(import.meta.url);
let pw;
try {
  pw = require("playwright");
} catch {
  pw = require(
    process.env.CYS_PLAYWRIGHT_PATH ||
      path.join(
        os.homedir(),
        ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
      ),
  );
}
const browser = await pw.chromium.launch({
  headless: true,
  ...(process.env.CYS_BROWSER_CHANNEL
    ? { channel: process.env.CYS_BROWSER_CHANNEL }
    : {}),
});
const root = "http://127.0.0.1:5173";
const evidenceRoot =
  process.env.CYS_QA_OUTPUT || path.join(os.tmpdir(), "cys-qa");
const out = path.join(evidenceRoot, "screenshots");
await fs.mkdir(out, { recursive: true });
const failures = [],
  evidence = [];
const routes = [
  ["register-company", "/auth?mode=register"],
  ["membership", "/membership"],
  ["connections", "/me/connections", "member"],
  ["ads", "/me/ads", "member"],
  ["review-connections", "/moderation?tab=connections", "moderator"],
  ["review-ads", "/moderation?tab=ads", "moderator"],
  ["home", "/home"],
  ["about", "/about"],
  ["timeline", "/about#history"],
  ["corridor", "/corridor"],
  ["story", "/corridor/stories/story-1"],
  ["business-corporate", "/business?audience=business"],
  ["business-financial", "/business?audience=financial"],
  ["individual", "/individual"],
  ["contact", "/contact"],
  ["feedback", "/contact?tab=feedback"],
  ["faq", "/legal"],
  ["terms", "/legal?tab=terms"],
  ["privacy", "/legal?tab=privacy"],
  ["auth", "/auth"],
  ["forum", "/forum"],
  ["detail", "/forum/post/1"],
  ["categories", "/forum/categories"],
  ["members", "/forum/members"],
  ["company", "/forum/member/1"],
  ["composer", "/forum/new", "member"],
  ["member", "/me/forum", "member"],
  ["my-posts", "/me/posts", "member"],
  ["my-replies", "/me/replies", "member"],
  ["my-saved", "/me/saved", "member"],
  ["notifications", "/me/notifications", "member"],
  ["settings", "/me/settings", "member"],
  ["moderation", "/moderation", "moderator"],
  ["preview", "/preview"],
  ["not-found", "/unknown-route"],
];
for (const size of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 844 },
]) {
  const context = await browser.newContext({
    viewport: size,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  let activeRole;
  page.on("pageerror", (e) => failures.push({ size, error: e.message }));
  for (const lang of ["zh", "en"])
    for (const [name, route, role] of routes) {
      if (activeRole !== (role || "guest")) {
        await page.goto(root + "/preview?lang=" + lang);
        await page
          .getByRole("combobox")
          .first()
          .selectOption(role || "guest");
        activeRole = role || "guest";
      }
      const u = new URL(route, root);
      u.searchParams.set("lang", lang);
      await page.goto(u.href);
      await page.locator("main").waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (name === "timeline")
        await page.locator("#history").scrollIntoViewIfNeeded();
      const result = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        main: document.querySelector("main").innerText.length,
        h1: document.querySelectorAll("h1").length,
        badImages: [...document.images]
          .filter((i) => i.complete && !i.naturalWidth)
          .map((i) => i.src),
        lang: document.documentElement.lang,
      }));
      if (
        result.scroll > result.width + 1 ||
        result.main < 10 ||
        result.badImages.length
      )
        failures.push({ name, lang, size, result });
      if (size.width === 1440 || size.width === 390) {
        await page.screenshot({
          path: out + "/" + name + "-" + size.width + "-" + lang + ".png",
          fullPage: false,
        });
        if (
          [
            "home",
            "about",
            "corridor",
            "individual",
            "contact",
            "forum",
            "composer",
            "moderation",
          ].includes(name)
        )
          await page.screenshot({
            path:
              out + "/" + name + "-" + size.width + "-" + lang + "-full.png",
            fullPage: true,
          });
      }
      evidence.push({ name, route, lang, size, ...result });
    }
  console.log(
    "Checked",
    size.width,
    "routes",
    routes.length * 2,
    "failures",
    failures.length,
  );
  await context.close();
  await fs.writeFile(
    path.join(evidenceRoot, "responsive-matrix.json"),
    JSON.stringify({ evidence, failures }, null, 2),
  );
}
await fs.writeFile(
  path.join(evidenceRoot, "responsive-matrix.json"),
  JSON.stringify({ evidence, failures }, null, 2),
);
console.log(JSON.stringify(failures, null, 2));
await browser.close();
if (failures.length) process.exitCode = 1;
