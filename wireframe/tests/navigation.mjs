import assert from "node:assert/strict";
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
const root = process.argv[2] || "http://127.0.0.1:5173";
const output =
  process.env.CYS_QA_OUTPUT || path.join(os.tmpdir(), "cys-navigation-qa");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [];
const errors = [];
const warnings = [];
const check = (result, message) => {
  assert.ok(result, message);
  checks.push(message);
};
const atTop = async (page) => {
  await page.waitForFunction(() => scrollY === 0);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  assert.equal(await page.evaluate(() => scrollY), 0);
};

try {
  for (const width of [1440, 390]) {
    for (const lang of ["zh", "en"]) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        const label = `${width}/${lang}/${reducedMotion}`;
        const mobile = width === 390;
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion,
        });
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
          if (message.type() === "warning") warnings.push(message.text());
        });
        const navigation = async () => {
          if (mobile) await page.locator(".menu-toggle").click();
          return page.locator(mobile ? ".mobile-nav" : ".desktop-nav");
        };
        const scrollDown = async () => {
          await page.evaluate(() => window.scrollTo(0, 900));
          await page.waitForFunction(() => scrollY > 300);
        };

        await page.goto(`${root}/home?lang=${lang}`);
        await page.locator("main h1").waitFor();
        check(
          (await page.title()).includes(
            lang === "en" ? "Review preview" : "审阅预览",
          ),
          `${label}: page identity`,
        );
        check(
          (await page.locator("main").innerText()).length > 100,
          `${label}: meaningful content`,
        );
        check(
          (await page.locator("vite-error-overlay").count()) === 0,
          `${label}: no error overlay`,
        );

        for (const [route, text] of [
          ["/about", lang === "en" ? "About" : "关于我们"],
          ["/contact", lang === "en" ? "Contact" : "联系我们"],
        ]) {
          for (const repeat of [false, true]) {
            await scrollDown();
            const nav = await navigation();
            const link = nav.getByRole("link", { name: text, exact: true });
            check(
              (await link.getAttribute("href")) === `${route}?lang=${lang}`,
              `${label}: ${text} has a page URL`,
            );
            await link.click();
            await page.waitForURL(`${root}${route}?lang=${lang}`);
            await page.waitForFunction(
              () =>
                !document.querySelector("dialog[open], header details[open]"),
            );
            await atTop(page);
            check(
              await page.locator("main h1").isVisible(),
              `${label}: ${text} ${repeat ? "same-page" : "cross-page"} navigation reaches the heading at top`,
            );
            check(
              (await page.locator("dialog[open]").count()) === 0,
              `${label}: navigation closes mobile dialog`,
            );
            check(
              (await page.locator("header details[open]").count()) === 0,
              `${label}: navigation closes desktop dropdown`,
            );
          }
        }

        let nav = await navigation();
        let group = nav.locator(".nav-group").first();
        let disclosure = group.locator("summary");
        await page.mouse.move(0, 899);
        await page.keyboard.press("Tab");
        await disclosure.focus();
        check(
          await disclosure.evaluate(
            (element) => getComputedStyle(element).outlineStyle !== "none",
          ),
          `${label}: disclosure has visible keyboard focus`,
        );
        await disclosure.press("Enter");
        check(
          await group.locator("details").evaluate((element) => element.open),
          `${label}: Enter opens submenu`,
        );
        await disclosure.press("Escape");
        check(
          !(await group.locator("details").evaluate((element) => element.open)),
          `${label}: Escape closes submenu`,
        );
        check(
          await disclosure.evaluate(
            (element) => element === document.activeElement,
          ),
          `${label}: Escape retains disclosure focus`,
        );
        await disclosure.press("Space");
        check(
          await group.locator("details").evaluate((element) => element.open),
          `${label}: Space opens submenu`,
        );
        await page.screenshot({
          path: path.join(
            output,
            `submenu-${width}-${lang}-${reducedMotion}.png`,
          ),
        });
        await group
          .getByRole("link", {
            name: lang === "en" ? "History" : "发展历程",
            exact: true,
          })
          .click();
        await page.waitForURL(`${root}/about?lang=${lang}#history`);
        await page.waitForFunction(() => {
          const top = document
            .getElementById("history")
            .getBoundingClientRect().top;
          return top >= 70 && top < 200;
        });
        check(
          await page.locator("#history").isVisible(),
          `${label}: history submenu still reaches section below header`,
        );

        nav = await navigation();
        group = nav.locator(".nav-group").first();
        const topLink = group.getByRole("link", {
          name: lang === "en" ? "About" : "关于我们",
          exact: true,
        });
        await topLink.focus();
        await topLink.press("Enter");
        await page.waitForURL(`${root}/about?lang=${lang}`);
        await atTop(page);
        check(
          await page.locator("main h1").isVisible(),
          `${label}: keyboard page link returns from anchor to top`,
        );

        if (!mobile) {
          const desktopGroup = page.locator(".desktop-nav .nav-group").first();
          await page.locator(".locale").focus();
          await desktopGroup
            .getByRole("link", {
              name: lang === "en" ? "About" : "关于我们",
              exact: true,
            })
            .hover();
          await desktopGroup
            .getByRole("link", {
              name: lang === "en" ? "History" : "发展历程",
              exact: true,
            })
            .hover();
          check(
            await desktopGroup
              .locator("details")
              .evaluate((element) => element.open),
            `${label}: pointer can move from label into dropdown`,
          );
          await desktopGroup.locator("summary").focus();
          await page.locator(".locale").focus();
          check(
            !(await desktopGroup
              .locator("details")
              .evaluate((element) => element.open)),
            `${label}: leaving keyboard group closes dropdown`,
          );
        }

        if (mobile) {
          nav = await navigation();
          const size = await nav.locator("summary").first().boundingBox();
          check(
            size.width >= 44 && size.height >= 44,
            `${label}: mobile disclosure target is at least 44px`,
          );
          await page.keyboard.press("Escape");
        }
        check(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${label}: no horizontal overflow`,
        );
        await page.screenshot({
          path: path.join(
            output,
            `about-${width}-${lang}-${reducedMotion}.png`,
          ),
        });
        await context.close();
      }
    }
  }
  check(errors.length === 0, `No browser errors: ${errors.join("; ")}`);
  const applicationWarnings = warnings.filter(
    (message) =>
      !message.includes(
        "GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels",
      ),
  );
  check(
    applicationWarnings.length === 0,
    `No application warnings: ${applicationWarnings.join("; ")}`,
  );
  await fs.writeFile(
    path.join(output, "results.json"),
    JSON.stringify({ checks, errors, warnings }, null, 2),
  );
  console.log(
    `PASS ${checks.length} navigation checks; ${warnings.length} headless GPU warnings; screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
