const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
  });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const results = [];
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => ({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      walls: [...document.querySelectorAll(".gallery-wall")].map((el) => ({
        overflow: el.scrollWidth > el.clientWidth,
        heights: [...el.querySelectorAll(".gallery-work")].map(
          (im) => im.querySelector("img").getBoundingClientRect().height,
        ),
        ratios: [...el.querySelectorAll("img")].map(
          (im) =>
            Math.abs(
              im.getBoundingClientRect().width / im.getBoundingClientRect().height -
                Number(im.getAttribute("width")) /
                  Number(im.getAttribute("height")),
            ) < 0.01,
        ),
      })),
    }));
    if (
      result.walls.some((wall) => wall.heights.length !== 0 && wall.heights.length !== 31 && wall.heights.length !== 21 && wall.heights.length !== 14) ||
      result.documentWidth > width ||
      result.walls.some(
        (w) =>
          !w.overflow ||
          Math.max(...w.heights) - Math.min(...w.heights) > 0.1 ||
          w.ratios.some((r) => !r),
      )
    )
      throw Error(JSON.stringify(result));
    results.push(result);
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: process.cwd() + `/docs/preview-${width}.png`,
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.waitForFunction(
    () => !document.querySelector('#spotlight button[aria-controls="spotlight-wall"]:last-child')?.disabled,
  );
  await page.locator('#spotlight button[aria-controls="spotlight-wall"]').last().click();
  await page.waitForFunction(
    () => document.querySelector("#spotlight-wall")?.scrollLeft > 0,
  );
  let positions = await page
    .locator(".gallery-wall")
    .evaluateAll((els) => els.map((el) => el.scrollLeft));
  if (positions[0] === 0 || positions.slice(1).some(Boolean))
    throw Error("Independent scrolling failed " + positions);
  await page.locator("#closer-wall").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  positions = await page
    .locator(".gallery-wall")
    .evaluateAll((els) => els.map((el) => el.scrollLeft));
  if (positions[1] === 0 || positions[2] !== 0 || positions[3] !== 0)
    throw Error("Keyboard failed");
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(200);
  if ((await page.evaluate(() => scrollY)) <= before)
    throw Error("Vertical scrolling failed");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await context.newPage();
  await mobile.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await mobile.locator("summary").click();
  await mobile
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByText("02 — A Little Closer")
    .click();
  if (!mobile.url().endsWith("#closer")) throw Error("Mobile menu failed");
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    JSON.stringify(
      {
        responsive: results,
        independentArrows: true,
        keyboard: true,
        verticalWheel: true,
        mobileMenu: true,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
