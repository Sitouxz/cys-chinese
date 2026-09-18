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
const root = "http://127.0.0.1:5173";
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
const click = (name) => page.getByRole("button", { name, exact: true }).click();
const persisted = async (predicate) => page.waitForFunction(predicate);
try {
  await goto("/auth?mode=register&lang=en");
  await page.getByLabel("First name *", { exact: true }).fill("Demo");
  await page.getByLabel("Last name *", { exact: true }).fill("User");
  await page.getByLabel("Phone *", { exact: true }).fill("80000000");
  await page.getByLabel("Company name *", { exact: true }).fill("Demo Co");
  await page.getByLabel("Position *", { exact: true }).selectOption("owner");
  await page.locator("input[type=email]").fill("journey@cys.example");
  await page.locator("input[type=password]").nth(0).fill("TemporaryPass123");
  await page.locator("input[type=password]").nth(1).fill("TemporaryPass123");
  await page.getByRole("checkbox", { name: /I have read/ }).check();
  await click("Create demo account");
  await page
    .getByRole("button", { name: "Simulate email verification", exact: true })
    .waitFor();
  await page.reload();
  check(
    await page
      .getByRole("button", { name: "Simulate email verification", exact: true })
      .isEnabled(),
    "Registration verification survives refresh",
  );
  await click("Simulate email verification");
  await page.locator("input[type=email]").waitFor();
  await page.locator("input[type=email]").fill("journey@cys.example");
  await page.locator("input[type=password]").fill("DemoPass123");
  await click("Sign in to demo");
  await page.waitForURL("**/me/forum*");
  check(
    !JSON.stringify(await saved()).includes("TemporaryPass123"),
    "Registration never persists entered password",
  );
  await goto("/auth?mode=forgot&lang=en");
  await click("Prepare demo link");
  await click("Open demo reset link");
  await page.locator("input[type=password]").nth(0).fill("AnotherDemo123");
  await page.locator("input[type=password]").nth(1).fill("AnotherDemo123");
  await click("Simulate reset");
  check(
    (await page.locator("main").innerText()).includes("Demo reset complete"),
    "Forgot and reset have local receipts",
  );
  await goto("/auth?mode=reset&expired=1&lang=en");
  check(
    (await page.getByRole("alert").innerText()).includes("expired"),
    "Expired reset link recovery",
  );
  await role("member");
  await goto("/me/posts?lang=en");
  await page
    .getByRole("button", { name: "Delete", exact: true })
    .first()
    .click();
  await click("Confirm delete");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page
    .getByRole("button", { name: "Undo delete", exact: true })
    .first()
    .waitFor();
  await page
    .getByRole("button", { name: "Undo delete", exact: true })
    .first()
    .click();
  await persisted(
    () =>
      !JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).posts.find(
        (p) => p.id === "1",
      ).removed,
  );
  check(true, "Confirmed delete and undo restore local post");
  await goto("/me/settings?lang=en");
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Changed demo name");
  await click("Cancel changes");
  check(
    (await page.getByLabel("Company name", { exact: true }).inputValue()) ===
      "Banyan Pantry",
    "Profile cancellation restores stored value",
  );
  await page.getByLabel("Display name", { exact: true }).fill("Demo Reviewer");
  await click("Save profile");
  await page.getByText("Profile saved.", { exact: true }).waitFor();
  await page.reload();
  check(
    (await page.getByLabel("Display name", { exact: true }).inputValue()) ===
      "Demo Reviewer",
    "Profile changes persist on refresh",
  );
  await goto("/me/notifications?lang=en");
  await click("Mark all read");
  await persisted(() =>
    JSON.parse(localStorage.getItem("cys-hifi-demo-v1"))
      .notifications.filter((n) => n.authorId === "1")
      .every((n) => n.read),
  );
  check(true, "Receipt read state persists");
  await role("moderator");
  await goto("/moderation?tab=comments&lang=en");
  const pending = (await saved()).comments.find((c) => c.status === "pending");
  await page.locator(".review-row").first().click();
  await click("Approve publication");
  await persisted(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).comments.filter(
        (c) => c.status === "pending",
      ).length === 1,
  );
  check(
    (await saved()).comments.find((c) => c.id === pending.id).status ===
      "approved",
    "Comment approved through review UI",
  );
  await goto("/moderation?tab=reports&lang=en");
  await page.locator(".review-row").first().click();
  await page
    .locator("textarea")
    .fill(
      "Demo review confirms the content should be removed for this scenario.",
    );
  await click("Remove content");
  await persisted(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).posts.find(
        (p) => p.id === "1",
      ).removed,
  );
  check(true, "Report review removes content with audit");
  await page
    .getByLabel("Report status", { exact: true })
    .selectOption("resolved");
  await page.locator(".review-row").first().click();
  await page
    .locator("textarea")
    .fill("The demo content has been reviewed and can be restored.");
  await click("Restore content");
  await persisted(
    () =>
      !JSON.parse(localStorage.getItem("cys-hifi-demo-v1")).posts.find(
        (p) => p.id === "1",
      ).removed,
  );
  check(true, "Explicit review restores published content");
  await role("guest");
  await goto("/business?audience=financial&lang=en");
  await page
    .getByRole("tab", { name: "Financial institutions", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  check(
    (await page
      .getByRole("tab", { name: "Cross-border corporates", exact: true })
      .getAttribute("aria-selected")) === "true",
    "Tabs support arrow navigation",
  );
  check(
    (await page.getByRole("tabpanel").getAttribute("aria-labelledby")) ===
      "business-panel-business",
    "Selected tab labels its content panel",
  );
  await goto("/about#history");
  const years = page.locator(".timeline [role=tab]");
  await years.nth(1).hover();
  check(
    (await years.nth(1).getAttribute("aria-selected")) === "true",
    "Timeline expands on hover",
  );
  await years.nth(2).focus();
  check(
    (await years.nth(2).getAttribute("aria-selected")) === "true",
    "Timeline expands on keyboard focus",
  );
  await years.nth(4).click();
  check(
    (await years.nth(4).getAttribute("aria-selected")) === "true",
    "Timeline selects on tap and click",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await goto("/home?lang=en");
  await click("Open menu");
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press("Tab");
    check(
      await page.evaluate(() =>
        document.querySelector("dialog").contains(document.activeElement),
      ),
      "Mobile dialog retains keyboard focus " + i,
    );
  }
  await page.keyboard.press("Escape");
  check(
    await page
      .getByRole("button", { name: "Open menu", exact: true })
      .evaluate((e) => e === document.activeElement),
    "Escape restores menu trigger focus",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  check(
    (await page
      .locator(".hero-copy")
      .evaluate((e) => getComputedStyle(e).animationName)) === "none",
    "Reduced motion disables hero animation",
  );
  await page.setViewportSize({ width: 640, height: 450 });
  await goto("/forum?lang=en");
  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Reflow at 640 CSS pixels (1280 at 200 percent zoom equivalent)",
  );
  await goto("/preview?lang=en");
  await page
    .getByLabel("Scenario for the next submission", { exact: true })
    .selectOption("empty");
  await goto("/forum?lang=en");
  check(
    (await page.locator(".post-row").count()) === 0,
    "Empty dataset scenario",
  );
  await goto("/preview?lang=en");
  await page
    .getByLabel("Scenario for the next submission", { exact: true })
    .selectOption("list-error");
  await goto("/forum?lang=en");
  await page.getByRole("alert").waitFor();
  await page.getByRole("button", { name: /Retry/ }).click();
  await page.locator(".post-row").first().waitFor();
  check(true, "List failure retry restores results");
  await goto("/preview?lang=en");
  await page.evaluate(() =>
    localStorage.setItem("unrelated-demo-key", "preserve"),
  );
  await page.getByRole("button", { name: /Reset all demo data/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm reset", exact: true })
    .click();
  await page.waitForURL("**/home?lang=zh");
  check(
    (await saved()).posts.length === 32 &&
      (await page.evaluate(() =>
        localStorage.getItem("unrelated-demo-key"),
      )) === "preserve",
    "Reset reseeds app only and restores Guest Chinese",
  );
  const isolated = await browser.newContext();
  await isolated.addInitScript(() => {
    for (const k of ["localStorage", "sessionStorage"])
      Object.defineProperty(window, k, {
        get() {
          throw new DOMException("Blocked", "SecurityError");
        },
      });
  });
  const noStorage = await isolated.newPage();
  await noStorage.goto(root + "/home?lang=en");
  check(
    (await noStorage.locator("body").innerText()).includes("refresh"),
    "Blocked storage shows in-memory fallback notice",
  );
  await isolated.close();
  check(
    errors.length === 0,
    "No uncaught browser errors in extended workflows",
  );
  await fs.writeFile(
    path.join(evidenceRoot, "extended-workflows.json"),
    JSON.stringify({ checks, errors }, null, 2),
  );
} catch (error) {
  console.error(error);
  console.log("URL", page.url());
  console.log((await page.locator("main").innerText()).slice(0, 2200));
  await page.screenshot({
    path: out + "/extended-failure.png",
    fullPage: true,
  });
  process.exitCode = 1;
} finally {
  await browser.close();
}
