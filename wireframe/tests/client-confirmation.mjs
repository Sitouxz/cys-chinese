import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.CYS_PLAYWRIGHT_PATH ||
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    ),
);
const output =
  process.env.CYS_QA_OUTPUT ||
  path.join(os.tmpdir(), "cys-client-confirmation-qa");
await fs.mkdir(path.join(output, "screenshots"), { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
const checks = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const check = (result, message) => {
  if (!result) throw new Error(message);
  checks.push(message);
};
const goto = async (route, lang = "zh") => {
  await page.goto(`http://127.0.0.1:5173${route}?lang=${lang}`);
  await page.locator("main").waitFor();
};

try {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const lang of ["zh", "en"]) {
      for (const route of [
        "/home",
        "/about",
        "/insights",
        "/forum/members",
        "/forum/member/1",
      ]) {
        await goto(route, lang);
        check(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${width}px ${lang} ${route}: no horizontal overflow`,
        );
        if (route === "/home" || route === "/about") {
          const body = await page.locator("main").innerText();
          check(
            !/持牌|\blicensed\b/i.test(body),
            `${width}px ${lang} ${route}: licensing claim removed`,
          );
        }
        if (route === "/insights") {
          check(
            (await page.getByRole("heading", { level: 1 }).innerText()) ===
              (lang === "zh" ? "洞察" : "Insight"),
            `${width}px ${lang}: Insight page identity`,
          );
          check(
            (await page.locator("main").innerText()).includes(
              lang === "zh"
                ? "内容与分类待客户确认"
                : "await client confirmation",
            ),
            `${width}px ${lang}: unapproved Insight content is identified`,
          );
        }
        if (route.startsWith("/forum/member")) {
          const profiles = page.locator(".profile-details");
          for (const profile of await profiles.all()) {
            const fields = await profile.locator("dt").allTextContents();
            const expected =
              lang === "zh"
                ? ["姓名", "公司名称", "行业", "目标市场", "简介"]
                : [
                    "Name",
                    "Company name",
                    "Industry",
                    "Target markets",
                    "Short bio",
                  ];
            check(
              fields.length === 5 &&
                expected.every((field) => fields.includes(field)),
              `${width}px ${lang} ${route}: exactly the five approved profile fields`,
            );
            const values = await profile.locator("dd").allTextContents();
            check(
              values.every((value) => value.trim().length > 0),
              `${width}px ${lang} ${route}: all five profile values are present`,
            );
          }
          check(
            (await page
              .locator("main .avatar, main .profile-hero img")
              .count()) === 0,
            `${width}px ${lang} ${route}: no avatar or profile photo`,
          );
        }
        if (
          [390, 1440].includes(width) &&
          ["/insights", "/forum/member/1"].includes(route)
        )
          await page.screenshot({
            path: path.join(
              output,
              "screenshots",
              `${route.split("/").filter(Boolean).join("-")}-${width}-${lang}.png`,
            ),
            fullPage: true,
          });
      }
    }
  }

  await goto("/corridor/stories/story-1", "en");
  await page.waitForURL(/\/insights\/stories\/story-1\?lang=en$/);
  check(true, "Legacy story URL preserves the story and language");
  await page
    .getByRole("link", { name: "All partnership stories", exact: true })
    .click();
  await page.waitForURL(/\/insights\?lang=en#stories$/);
  check(true, "Story return link opens the Insight story section");

  await goto("/preview", "en");
  await page.getByLabel("Choose role", { exact: true }).selectOption("member");
  await goto("/me/settings", "en");
  await page.getByLabel("Name", { exact: true }).fill("Review Demo");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page.getByText("Profile saved.", { exact: true }).waitFor();
  await page.reload();
  check(
    (await page.getByLabel("Name", { exact: true }).inputValue()) ===
      "Review Demo",
    "Profile name survives save and reload",
  );
  await goto("/forum/member/1", "en");
  check(
    (await page.locator(".profile-details").innerText()).includes(
      "Review Demo",
    ),
    "Saved name is displayed on the public member profile",
  );
  await goto("/forum/member/1", "zh");
  check(
    (await page.locator(".profile-details").innerText()).includes("新加坡") &&
      !(await page.locator(".profile-details").innerText()).includes("SG / MY"),
    "Chinese target markets use localized names",
  );
  check(errors.length === 0, "No browser console or uncaught runtime errors");
  await fs.writeFile(
    path.join(output, "client-confirmation-checks.json"),
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(
    `${checks.length} client-confirmation checks passed; ${errors.length} errors`,
  );
} finally {
  await browser.close();
}
