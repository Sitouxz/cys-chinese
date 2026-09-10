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
const browser = await playwright.chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const root = "http://127.0.0.1:5173";
const out = path.resolve("../docs/verification/screenshots");
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
try {
  await goto("/home?lang=en");
  check((await page.locator("h1").count()) === 1, "Home has one heading");
  await goto("/forum/post/1?lang=en");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("button", { name: "Sign in to demo", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved", exact: true }).waitFor();
  check(
    page.url().includes("/forum/post/1"),
    "Guest save resumes on same post",
  );
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).waitFor();
  check(!(await saved()).bookmarks.length, "Save toggles without duplicates");
  await goto("/forum/new?lang=en");
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await page.getByRole("alert").waitFor();
  check(
    (await page.getByRole("alert").innerText()).includes("8–100"),
    "Invalid composer submission rejected",
  );
  await fillPost("Seeking a new fictional distribution partner");
  await page
    .getByRole("button", { name: "Preview listing", exact: true })
    .click();
  check(
    (await page
      .getByRole("dialog")
      .getByRole("heading", {
        name: "Seeking a new fictional distribution partner",
      })
      .count()) === 1,
    "Composer preview shows actual entered content",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "切换至中文", exact: true }).click();
  check(
    (await page
      .getByLabel("标题 *（8–100 字）", { exact: true })
      .inputValue()) === "Seeking a new fictional distribution partner",
    "Locale switch preserves unsaved composer",
  );
  await page
    .getByRole("button", { name: "Switch to English", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await page
    .getByText("Submitted. Your post will appear after approval.", {
      exact: true,
    })
    .waitFor();
  let state = await saved();
  const created = state.posts.at(-1);
  const id = created.id;
  check(state.revisions.at(-1).status === "pending", "New post queued");
  await role("other");
  await goto("/forum/post/" + id + "?lang=en");
  check(
    (await page
      .getByRole("heading", {
        name: "This listing is unavailable",
        exact: true,
      })
      .count()) === 1,
    "Other member cannot see pending post",
  );
  await role("moderator");
  await goto("/moderation?lang=en");
  await page
    .getByRole("button")
    .filter({ hasText: "Seeking a new fictional distribution partner" })
    .click();
  await page
    .getByRole("button", { name: "Approve publication", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Choose an item to review", exact: true })
    .waitFor();
  await role("guest");
  await goto("/home?lang=en");
  check(
    (await page
      .locator(".compact-rows")
      .getByRole("link", {
        name: "Seeking a new fictional distribution partner",
        exact: true,
      })
      .count()) === 1,
    "Approved post appears in homepage latest feed",
  );
  await role("member");
  await goto("/forum/edit/" + id + "?lang=en");
  await fillPost("Private pending revision for distribution");
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await page
    .getByText("Submitted. Your post will appear after approval.", {
      exact: true,
    })
    .waitFor();
  await role("guest");
  await goto("/forum/post/" + id + "?lang=en");
  check(
    (await page
      .getByRole("heading", {
        name: "Seeking a new fictional distribution partner",
        exact: true,
      })
      .count()) === 1,
    "Published revision stays public during edit review",
  );
  check(
    !(await page.locator("main").innerText()).includes(
      "Private pending revision",
    ),
    "Pending revision text does not leak",
  );
  await role("moderator");
  await goto("/moderation?lang=en");
  await page
    .getByRole("button")
    .filter({ hasText: "Private pending revision for distribution" })
    .click();
  await page
    .getByLabel(
      "Review reason (required for rejection, changes or reports; 10–2,000 characters)",
      { exact: true },
    )
    .fill(
      "Please clarify your fictional product and intended delivery timeline.",
    );
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page
    .getByRole("heading", { name: "Choose an item to review", exact: true })
    .waitFor();
  await role("member");
  await goto("/forum/edit/" + id + "?lang=en");
  await fillPost("Corrected partnership request with clear next steps");
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await page
    .getByText("Submitted. Your post will appear after approval.", {
      exact: true,
    })
    .waitFor();
  await role("moderator");
  await goto("/moderation?lang=en");
  await page
    .getByRole("button")
    .filter({ hasText: "Corrected partnership request with clear next steps" })
    .click();
  await page
    .getByRole("button", { name: "Approve publication", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Choose an item to review", exact: true })
    .waitFor();
  await role("guest");
  await goto("/forum/post/" + id + "?lang=en");
  check(
    (await page
      .getByRole("heading", {
        name: "Corrected partnership request with clear next steps",
        exact: true,
      })
      .count()) === 1,
    "Rejected revision corrected and approved",
  );
  await role("member");
  await goto("/forum/post/" + id + "?lang=en");
  await page
    .getByLabel("Your comment (2–1,000 characters)", { exact: true })
    .fill(
      "This fictional pilot sounds useful. Let us compare the requirements.",
    );
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await page
    .getByText(
      "This fictional pilot sounds useful. Let us compare the requirements.",
      { exact: true },
    )
    .waitFor();
  await role("other");
  await goto("/forum/post/" + id + "?lang=en");
  check(
    !(await page.locator("main").innerText()).includes(
      "This fictional pilot sounds useful",
    ),
    "Pending comment hidden from another member",
  );
  await role("member");
  await page
    .getByLabel("Scenario for the next submission", { exact: true })
    .selectOption("failure");
  await goto("/contact?lang=en");
  await page
    .getByLabel("Demo name *", { exact: true })
    .fill("Synthetic Contact");
  await page
    .getByLabel("Demo email (.example) *", { exact: true })
    .fill("contact@brand.example");
  await page
    .getByLabel("Demo company *", { exact: true })
    .fill("Fictional Brand");
  await page
    .getByLabel("Your message * (10–2,000 characters)", { exact: true })
    .fill("Please discuss this fictional business partnership.");
  await page
    .getByRole("checkbox", { name: /I am using fictional details/ })
    .check();
  await page
    .getByRole("button", { name: "Submit demo enquiry", exact: true })
    .click();
  await page.getByRole("alert").waitFor();
  check(
    (await page.getByLabel("Demo name *", { exact: true }).inputValue()) ===
      "Synthetic Contact",
    "Simulated failure preserves form",
  );
  await page
    .getByRole("button", { name: "Submit demo enquiry", exact: true })
    .click();
  await page
    .getByText("Demo submission complete. No message was sent.", {
      exact: false,
    })
    .waitFor();
  check(
    (await saved()).enquiries.length === 1,
    "Retry creates one local receipt",
  );
  await goto("/forum?lang=en&industry=apparel&market=CN&intent=brand");
  check(
    (await page.locator(".post-row").count()) > 0,
    "Combined industry market intent filter returns results",
  );
  await page.getByLabel("Search forum", { exact: true }).fill("unfindablexyz");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  check(
    (await page
      .getByRole("heading", { name: "No matching results", exact: true })
      .count()) === 1,
    "Search empty state",
  );
  check(errors.length === 0, "No uncaught browser errors");
  await fs.writeFile(
    "../docs/verification/browser-workflows.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
} catch (error) {
  await page.screenshot({
    path: out + "/workflow-failure.png",
    fullPage: true,
  });
  console.error(error);
  console.log("URL", page.url());
  console.log((await page.locator("main").innerText()).slice(0, 6000));
  process.exitCode = 1;
} finally {
  await browser.close();
}
