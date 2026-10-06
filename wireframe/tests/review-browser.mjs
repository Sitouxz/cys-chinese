import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.CYS_PLAYWRIGHT_PATH ||
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    ),
);
const browser = await chromium.launch({ headless: true });
const output =
  process.env.CYS_QA_OUTPUT || path.join(os.tmpdir(), "cys-review-qa");
await fs.mkdir(path.join(output, "screenshots"), { recursive: true });
const root = "http://127.0.0.1:5173",
  checks = [],
  errors = [];
const check = (result, label) => {
  if (!result) throw new Error(label);
  checks.push(label);
  console.log("PASS", label);
};
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  reducedMotion: "no-preference",
  recordVideo: {
    dir: path.join(output, "motion"),
    size: { width: 1440, height: 1000 },
  },
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (e) => {
  if (e.type() === "error") errors.push(e.text());
});
const goto = async (route) => {
  await page.goto(root + route);
  await page.locator("main").waitFor();
};
const screenshot = async (name) =>
  page.screenshot({ path: path.join(output, "screenshots", name + ".png") });
try {
  await goto("/home?lang=zh");
  const canvas = page.locator(".hero canvas");
  await page.waitForTimeout(6500);
  const stopped = await canvas.evaluate((el) => el.toDataURL());
  await page.waitForTimeout(500);
  check(
    stopped === (await canvas.evaluate((el) => el.toDataURL())),
    "Automatic Earth motion stops after five seconds",
  );
  check(
    (await page.locator(".globe-controls").count()) === 0,
    "Screenshot's entire globe-control row is absent",
  );
  check(
    await canvas.evaluate(
      (el) => el.width === Math.min(1024, Math.round(el.clientWidth * 2)),
    ),
    "Earth backing resolution follows display size and pixel ratio",
  );
  check(
    (await page.title()).includes("审阅预览"),
    "Page identity matches the bilingual review mockup",
  );
  await screenshot("review-home-desktop-zh");
  await canvas.focus();
  await canvas.press("ArrowLeft");
  await page.waitForTimeout(150);
  check(
    stopped !== (await canvas.evaluate((el) => el.toDataURL())),
    "Keyboard rotation changes Earth geometry",
  );
  await canvas.press("Home");
  await page.waitForTimeout(150);
  const reset = await canvas.evaluate((el) => el.toDataURL());
  const bounds = await canvas.boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.waitForTimeout(150);
  check(
    reset !== (await canvas.evaluate((el) => el.toDataURL())),
    "Pointer drag rotates the Earth",
  );
  await canvas.press("Home");
  await page.waitForTimeout(150);
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(150);
  check(
    reset !== (await canvas.evaluate((el) => el.toDataURL())),
    "Focused wheel zoom changes Earth size",
  );
  await canvas.press("Home");
  await page.waitForTimeout(150);
  const projected = await page
    .locator(".hero .earth-label")
    .evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent,
        hidden: el.hidden,
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
      })),
    );
  check(
    !projected[0].hidden &&
      !projected[1].hidden &&
      projected[0].x > projected[1].x &&
      projected[0].y < projected[1].y,
    "Readable China/Singapore labels align with projected coordinates",
  );
  for (const lang of ["zh", "en"])
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      await goto("/home?lang=" + lang);
      await page.waitForTimeout(1200);
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Hero fits ${lang} at ${width}px`,
      );
      if (lang === "zh") {
        check(
          (await page.locator("h1").innerText()).replace(/\s/g, "") ===
            "连接中国与东南亚的可信桥梁，启迪跨境商业的新可能。",
          `Approved Chinese headline remains exact at ${width}px`,
        );
        check(
          await page
            .locator(".keep-phrase")
            .first()
            .evaluate(
              (el) =>
                el.getBoundingClientRect().width <=
                el.parentElement.parentElement.getBoundingClientRect().width +
                  1,
            ),
          `China/Southeast Asia phrase fits intact at ${width}px`,
        );
      }
      if (width === 390 || width === 1440)
        await screenshot(`review-home-${width}-${lang}`);
    }
  await goto("/about?lang=zh");
  const reveal = page.locator(".reveal-copy");
  check(
    (await reveal.locator(".reveal-segment").count()) > 20,
    "Chinese About text has meaningful reveal segments",
  );
  await reveal.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await screenshot("review-about-reveal");
  await page.emulateMedia({ reducedMotion: "reduce" });
  check(
    await reveal
      .locator(".reveal-segment")
      .evaluateAll((els) =>
        els.every((el) => getComputedStyle(el).opacity === "1"),
      ),
    "Reduced motion immediately exposes every text segment",
  );
  await goto("/home?lang=en");
  await page.waitForTimeout(400);
  const staticEarth = await canvas.evaluate((el) => el.toDataURL());
  await page.waitForTimeout(300);
  check(
    staticEarth === (await canvas.evaluate((el) => el.toDataURL())),
    "Reduced-motion Earth starts static",
  );
  await goto("/preview?lang=en");
  await page
    .getByLabel("Choose role", { exact: true })
    .selectOption("moderator");
  await page
    .getByLabel("Daily active users", { exact: true })
    .selectOption("300");
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem("cys-hifi-demo-v1"))?.dau === 300,
  );
  await page.getByLabel("Choose role", { exact: true }).selectOption("member");
  await goto("/me/ads?lang=en");
  check(
    (await page.getByText(/Use monthly allowance/).count()) === 0,
    "Phase 2 Platinum cannot select a removed free-day allowance",
  );
  check(
    await page.getByText(/Points redemption is pending/).isVisible(),
    "Undefined points conversion has an explicit pending state",
  );
  await screenshot("review-phase2-pending");
  await goto("/preview?lang=en");
  await page
    .getByLabel("Choose role", { exact: true })
    .selectOption("moderator");
  await page
    .getByLabel("Daily active users", { exact: true })
    .selectOption("2500");
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem("cys-hifi-demo-v1"))?.dau === 2500,
  );
  await page.getByLabel("Bidders", { exact: true }).selectOption("3");
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem("cys-hifi-demo-v1"))?.bidders === 3,
  );
  await page.getByLabel("Member 1", { exact: true }).selectOption("black");
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("cys-hifi-demo-v1"))?.profiles[0].tier ===
      "black",
  );
  await page.getByLabel("Choose role", { exact: true }).selectOption("member");
  await goto("/me/ads?lang=en");
  check(
    (await page.getByText(/CPC bidding is pending/).isVisible()) &&
      (await page.locator(".ad-booking").count()) === 0,
    "Phase 3 shows pending auction rules and cannot collect payment",
  );
  await goto("/me/forum?lang=en");
  check(
    (await page.getByText("Black", { exact: true }).count()) > 0,
    "Staff-assigned tier appears in the member experience",
  );
  check(errors.length === 0, "No console or runtime errors in revised flows");
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const touchPage = await touch.newPage();
  await touchPage.goto(root + "/home?lang=zh");
  const touchCanvas = touchPage.locator(".hero canvas");
  await touchCanvas.scrollIntoViewIfNeeded();
  await touchPage.waitForTimeout(350);
  const touchBefore = await touchCanvas.evaluate((el) => el.toDataURL()),
    box = await touchCanvas.boundingBox();
  const cdp = await touch.newCDPSession(touchPage),
    y = box.y + box.height / 2,
    x = box.x + box.width / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 30, y, id: 1 },
      { x: x + 30, y, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 55, y, id: 1 },
      { x: x + 55, y, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await touchPage.waitForTimeout(200);
  check(
    touchBefore !== (await touchCanvas.evaluate((el) => el.toDataURL())),
    "Two-finger pinch zoom works on a touch viewport",
  );
  await touch.close();
  const failed = await browser.newPage({ reducedMotion: "reduce" });
  await failed.route("**/assets/earth-day.jpg", (route) => route.abort());
  await failed.goto(root + "/home?lang=en");
  await failed
    .locator(".hero")
    .getByText("Earth image could not load", { exact: true })
    .waitFor({ state: "visible" });
  check(
    await failed
      .locator(".hero")
      .getByText("Earth image could not load", { exact: true })
      .isVisible(),
    "Texture failure exposes a readable fallback",
  );
  await failed.close();
  await fs.writeFile(
    path.join(output, "review-checks.json"),
    JSON.stringify(
      {
        checks,
        errors,
        browser: "Playwright Chromium; Browser plugin not available",
      },
      null,
      2,
    ),
  );
} finally {
  await context.close();
  await browser.close();
}
