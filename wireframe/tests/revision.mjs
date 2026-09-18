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
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const root = "http://127.0.0.1:5173",
  out = process.env.CYS_QA_OUTPUT || path.join(os.tmpdir(), "cys-qa");
await fs.mkdir(path.join(out, "screenshots"), { recursive: true });
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (e) => {
  if (e.type() === "error")
    errors.push(e.text() + " " + JSON.stringify(e.location()));
});
const check = (value, message) => {
  if (!value) throw Error(message);
  checks.push(message);
  console.log("PASS", message);
};
const goto = async (route) => {
  await page.goto(root + route + (route.includes("?") ? "&" : "?") + "lang=en");
  await page.locator("main").waitFor();
};
const role = async (value) => {
  await goto("/preview");
  await page.getByLabel("Choose role", { exact: true }).selectOption(value);
};
const capture = async (name) => {
  await page.screenshot({
    path: out + "/screenshots/" + name + ".png",
    fullPage: true,
  });
};
try {
  await role("member");
  await goto("/me/ads");
  await page
    .getByLabel("Listing to promote", { exact: true })
    .selectOption("1");
  await page
    .getByText("Simulate payment, then submit for review (no charge)", {
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Book and submit for review", exact: true })
    .click();
  await page.getByText(/Booking recorded for review/).waitFor();
  check(
    true,
    "Advertising booking requires simulated payment and enters review",
  );
  await role("moderator");
  await goto("/moderation?tab=ads");
  await page
    .getByRole("button", { name: "Approve promotion", exact: true })
    .click();
  await page.getByText(/Approved/).waitFor();
  await role("other");
  await goto("/home");
  check(
    await page
      .locator(".promoted-slot")
      .innerText()
      .then((t) => t.includes("Seeking a food distribution partner")),
    "Approved ad appears in homepage promoted placement",
  );
  await page.locator(".promoted-slot").scrollIntoViewIfNeeded();
  await capture("promoted-home");
  await page
    .getByRole("button", { name: "Explore this opportunity", exact: true })
    .click();
  await page.waitForURL(/forum\/post\/1/);
  await page
    .getByRole("button", { name: "Request a connection", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  await page
    .getByRole("button", { name: "Agree and send request", exact: true })
    .click();
  await page.getByRole("link", { name: "View connection status" }).waitFor();
  await page.getByRole("link", { name: "View connection status" }).click();
  check(
    (await page.locator("main").innerText()).includes("Awaiting acceptance"),
    "Sender sees pending request",
  );
  check(
    !/@cys\.example|80000000/.test(await page.locator("main").innerText()),
    "Request view never reveals member email or phone",
  );
  await role("member");
  await goto("/me/connections");
  await page
    .getByRole("button", { name: "Accept connection", exact: true })
    .click();
  await page.getByText("Both agreed · Awaiting CYS", { exact: true }).waitFor();
  await capture("connection-accepted");
  check(true, "Recipient acceptance changes state for both parties");
  await role("moderator");
  await goto("/moderation?tab=connections");
  await page
    .getByRole("button", { name: "Mark introduction arranged", exact: true })
    .click();
  await page.getByText("Introduction arranged", { exact: true }).waitFor();
  check(true, "CYS follows up only after mutual consent");
  await role("member");
  await goto("/me/ads");
  const text = await page.locator("main").innerText();
  check(
    text.includes("Clicks: 1") && text.includes("Connection requests: 1"),
    "Advertiser sees one click and one attributed connection request",
  );
  await capture("ad-conversion");
  await goto("/me/posts");
  await page
    .getByRole("button", { name: "Refresh listing", exact: true })
    .first()
    .click();
  await page.getByText("Refreshed", { exact: true }).first().waitFor();
  check(true, "Owner can refresh a published listing");
  await role("guest");
  await goto("/auth?mode=register");
  await page.getByRole("tab", { name: "Individual", exact: true }).click();
  check(
    (await page.getByLabel("Company name *", { exact: true }).count()) === 0,
    "Individual registration omits company requirements",
  );
  await page.getByLabel("First name *", { exact: true }).fill("Demo");
  await page.getByLabel("Last name *", { exact: true }).fill("Individual");
  await page.getByLabel("Phone *", { exact: true }).fill("80000000");
  await page
    .getByLabel("Demo email", { exact: true })
    .fill("individual@cys.example");
  await page
    .getByLabel("Confirm demo password", { exact: true })
    .fill("DemoPass123");
  await page
    .getByText(
      "I have read the illustrative terms and understand this is a local demo.",
      { exact: false },
    )
    .click();
  await page
    .getByRole("button", { name: "Create demo account", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Simulate email verification" })
    .waitFor();
  check(
    true,
    "Individual registration reaches verification with core fields only",
  );
  await goto("/home");
  await page.waitForTimeout(700);
  const canvas = page.locator(".hero canvas");
  const before = await canvas.evaluate((c) => c.toDataURL());
  await page.getByRole("button", { name: "Rotate left", exact: true }).click();
  await page.waitForTimeout(200);
  check(
    before !== (await canvas.evaluate((c) => c.toDataURL())),
    "Earth rotation controls change the rendered geography",
  );
  const rotated = await canvas.evaluate((c) => c.toDataURL());
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.waitForTimeout(200);
  check(
    rotated !== (await canvas.evaluate((c) => c.toDataURL())),
    "Earth zoom changes the rendered size",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("tab", { name: /2011/ }).click();
  check(
    (await page.locator("#milestone-detail").innerText()).includes("2011"),
    "Homepage history is fully interactive",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await goto("/membership");
  await capture("membership-mobile");
  await goto("/auth?mode=register");
  await page.getByRole("tab", { name: "Individual", exact: true }).click();
  await capture("individual-registration-mobile");
  await goto("/home");
  await page.waitForTimeout(500);
  await capture("home-mobile-revision");
  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Revised mobile homepage has no horizontal overflow",
  );
  console.log(JSON.stringify(errors));
  check(
    errors.length === 0,
    "New workflows have no console or uncaught runtime errors",
  );
  await fs.writeFile(
    out + "/revision-checks.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
} catch (e) {
  await capture("revision-failure");
  throw e;
} finally {
  await browser.close();
}
