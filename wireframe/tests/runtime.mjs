import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(
    process.env.CYS_PLAYWRIGHT_PATH ||
      path.join(
        os.homedir(),
        ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
      ),
  );
}
const browser = await playwright.chromium.launch({
  headless: true,
  ...(process.env.CYS_BROWSER_CHANNEL
    ? { channel: process.env.CYS_BROWSER_CHANNEL }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const root = "http://127.0.0.1:4173";
const evidenceRoot =
  process.env.CYS_QA_OUTPUT || path.join(os.tmpdir(), "cys-qa");
const out = path.join(evidenceRoot, "screenshots");
await fs.mkdir(out, { recursive: true });
const checks = [];
function check(condition, label) {
  if (!condition) throw new Error(label);
  checks.push(label);
  console.log("PASS", label);
}
const goto = async (route) => {
  await page.goto(root + route);
  await page.locator("main").waitFor();
};
const role = async (value) => {
  await goto("/preview?lang=en");
  await page.getByLabel("Choose role", { exact: true }).selectOption(value);
};
const saved = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("cys-hifi-demo-v1")));
const fillPost = async (
  title,
  body = "We are looking for a fictional Singapore distribution partner for a small trial with clear product information and delivery requirements.",
) => {
  await page
    .getByLabel("Product or service * (2–100 characters)", { exact: true })
    .fill("Sample pantry product");
  await page
    .getByLabel("Title * (8–100 characters)", { exact: true })
    .fill(title);
  await page
    .getByLabel("Description * (30–3,000 characters)", { exact: true })
    .fill(body);
  await page
    .getByRole("checkbox", {
      name: "I have read the community rules and use fictional details only.",
    })
    .check();
};
const external = [],
  failed = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("requestfailed", (r) => failed.push(r.url()));
await page.route("**/*", (route) => {
  const u = new URL(route.request().url());
  if (u.hostname !== "127.0.0.1") {
    external.push(u.href);
    return route.abort();
  }
  return route.continue();
});
try {
  for (const path of [
    "/home",
    "/about",
    "/corridor",
    "/corridor/stories/story-1",
    "/business",
    "/individual",
    "/contact",
    "/legal",
    "/forum",
  ]) {
    await goto(path + "?lang=en");
    check(
      (await page.locator("main").innerText()).length > 30,
      "Built app works with remote requests denied: " + path,
    );
  }
  check(
    (await page.locator("meta[name=robots]").getAttribute("content")).includes(
      "noindex",
    ),
    "Preview is noindex",
  );
  for (const [alias, target] of [
    ["/about/intro", "/about#intro"],
    ["/about/history", "/about#history"],
    ["/about/culture", "/about#culture"],
    ["/corridor/partners", "/corridor#partners"],
    ["/corridor/stories", "/corridor#stories"],
    ["/business/financial-institutions", "/business?audience=financial"],
    ["/business/cross-border", "/business?audience=business"],
    ["/contact/details", "/contact?tab=details"],
    ["/contact/enquiry", "/contact?tab=enquiry"],
    ["/contact/feedback", "/contact?tab=feedback"],
  ]) {
    await page.goto(root + alias);
    const u = new URL(target, root);
    await page.waitForURL(
      (url) =>
        url.pathname === u.pathname &&
        (!u.hash || url.hash === u.hash) &&
        [...u.searchParams].every(([k, v]) => url.searchParams.get(k) === v),
    );
    check(true, "Legacy alias " + alias);
  }
  await goto("/forum?lang=en&industry=food");
  await page.getByLabel("Search forum", { exact: true }).fill("Singapore");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const filtered = page.url();
  await page.reload();
  check(
    page.url() === filtered &&
      (await page.getByLabel("Search forum", { exact: true }).inputValue()) ===
        "Singapore",
    "Filters and search survive refresh",
  );
  await page
    .getByRole("link", { name: "Chinese Forum", exact: true })
    .first()
    .click();
  await page.goBack();
  check(page.url() === filtered, "Browser back restores query");
  await role("member");
  await goto("/forum/new?lang=en");
  await fillPost("A fictional listing for composition testing");
  const title = page.getByLabel("Title * (8–100 characters)", { exact: true });
  await title.dispatchEvent("compositionstart", { data: "" });
  await title.fill("寻找新加坡餐饮渠道合作伙伴");
  await title.dispatchEvent("compositionend", {
    data: "寻找新加坡餐饮渠道合作伙伴",
  });
  check(
    (await title.inputValue()) === "寻找新加坡餐饮渠道合作伙伴",
    "Chinese composition events preserve input",
  );
  const before = (await saved())?.posts.length || 32;
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .evaluate((button) => {
      button.click();
      button.click();
    });
  await page
    .getByText("Submitted. Your post will appear after approval.", {
      exact: true,
    })
    .waitFor();
  check(
    (await saved()).posts.length === before + 1,
    "Same-tick duplicate submit creates one record",
  );
  await goto("/forum/post/1?lang=en");
  await page.getByRole("button", { name: /Useful/ }).click();
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).reactions.length ===
      1,
  );
  await page.getByRole("button", { name: /Useful/ }).click();
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).reactions.length ===
      0,
  );
  check(true, "Useful toggles through UI");
  await goto("/forum?lang=en");
  await page
    .getByRole("button", { name: "Follow Business matching", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).follows.length === 1,
  );
  await page
    .getByRole("button", { name: "Follow Business matching", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).follows.length === 0,
  );
  check(true, "Follow toggles through UI");
  check(
    external.length === 0 && failed.length === 0,
    "No remote dependencies or failed required requests",
  );
  check(errors.length === 0, "Built app has no console or uncaught errors");
  await fs.writeFile(
    path.join(evidenceRoot, "runtime-smoke.json"),
    JSON.stringify({ checks, errors, external, failed }, null, 2),
  );
} catch (error) {
  console.error(error);
  console.log((await page.locator("main").innerText()).slice(0, 1500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
