const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");

const baseURL = process.env.PHASE2_BASE_URL || "http://127.0.0.1:3000";
const sleep = (page, ms = 250) => page.waitForTimeout(ms);

async function openProductionPage(browser, options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const galleryRequests = [];
  const fullscreenRequests = [];
  const originalRequests = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/images/gallery/")) galleryRequests.push(url);
    if (url.includes("/images/fullscreen/")) fullscreenRequests.push(url);
    if (
      url.includes("/2026_final/") ||
      /\.(?:jpe?g|tiff?)(?:$|\?)/i.test(url)
    ) {
      originalRequests.push(url);
    }
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  return {
    context,
    page,
    galleryRequests,
    fullscreenRequests,
    originalRequests,
    errors,
  };
}

async function swipeLeft(context, page, selector) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
  const box = await element.boundingBox();
  const x = Math.round(box.x + Math.min(box.width - 40, 320));
  const y = Math.round(box.y + Math.min(box.height / 2, 150));
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let step = 1; step <= 12; step += 1) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - step * 18, y }],
    });
    await sleep(page, 12);
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await sleep(page, 350);
  await session.detach();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
  });

  const desktop = await openProductionPage(browser, {
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const { page } = desktop;
  assert.equal(await page.locator(".gallery-work").count(), 80);
  await sleep(page, 500);
  assert.equal(
    desktop.fullscreenRequests.length,
    0,
    "Fullscreen images must wait for a click.",
  );
  assert.ok(
    desktop.galleryRequests.length < 12,
    `The initial view loaded ${desktop.galleryRequests.length} gallery files: ${desktop.galleryRequests.join(", ")}`,
  );

  const wall = page.locator("#spotlight-wall");
  await wall.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector("#spotlight-wall img");
    return image?.complete && image.naturalWidth > 0;
  });
  await sleep(page, 450);
  const loadedInFirstWall = await wall.locator("img[src]").count();
  assert.ok(
    loadedInFirstWall >= 1 && loadedInFirstWall < 12,
    `Expected visible plus a few nearby images, found ${loadedInFirstWall}.`,
  );
  assert.equal(desktop.fullscreenRequests.length, 0);

  const galleryLeft = await wall.evaluate((element) => {
    element.scrollLeft = Math.min(
      520,
      element.scrollWidth - element.clientWidth,
    );
    return element.scrollLeft;
  });
  const trigger = wall.locator("a[data-pswp-src]").nth(2);
  await trigger.click();
  await page.locator(".pswp").waitFor({ state: "visible" });
  await page
    .locator(
      '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
    )
    .waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const image = document.querySelector(
      '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
    );
    return image?.complete && image.naturalWidth > 1000;
  });
  assert.ok(
    desktop.fullscreenRequests.length >= 1,
    "Opening PhotoSwipe must request a fullscreen image.",
  );
  assert.equal(await page.locator(".pswp__counter").innerText(), "3 / 31");
  assert.ok(await page.locator(".pswp__exhibition-caption").innerText());
  assert.ok(
    await page
      .locator(
        '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
      )
      .getAttribute("alt"),
  );

  await page.locator(".pswp__button--arrow--next").click();
  await sleep(page, 250);
  assert.equal(await page.locator(".pswp__counter").innerText(), "4 / 31");
  await page.keyboard.press("ArrowLeft");
  await sleep(page, 250);
  assert.equal(await page.locator(".pswp__counter").innerText(), "3 / 31");
  const image = page.locator(
    '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
  );
  const beforeZoom = await image.boundingBox();
  await page.locator(".pswp__button--zoom").click();
  await page.waitForFunction(
    (oldWidth) =>
      document
        .querySelector(
          '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
        )
        ?.getBoundingClientRect().width > oldWidth,
    beforeZoom.width + 1,
  );
  const galleryPositionBeforeClose = await wall.evaluate(
    (element) => element.scrollLeft,
  );
  await page.keyboard.press("Escape");
  await page.locator(".pswp").waitFor({ state: "hidden" });
  assert.ok(
    Math.abs(
      (await wall.evaluate((element) => element.scrollLeft)) -
        galleryPositionBeforeClose,
    ) <= 1,
    "Closing the lightbox must preserve the wall position.",
  );
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("data-pswp-src"),
    ),
    await trigger.getAttribute("data-pswp-src"),
    "Closing restores focus to the selected photograph.",
  );
  assert.equal(desktop.errors.length, 0, desktop.errors.join("\n"));
  assert.deepEqual(
    desktop.originalRequests,
    [],
    "Website visitors must never request files from the original source folder.",
  );

  const mobile = await openProductionPage(browser, {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const mobileWall = mobile.page.locator("#spotlight-wall");
  await mobileWall.scrollIntoViewIfNeeded();
  await mobile.page.waitForFunction(() => {
    const image = document.querySelector("#spotlight-wall img");
    return image?.complete && image.naturalWidth > 0;
  });
  await mobileWall.locator("a[data-pswp-src]").first().tap();
  await mobile.page
    .locator(
      '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
    )
    .waitFor({ state: "visible" });
  await mobile.page.waitForFunction(
    () =>
      document.querySelector(
        '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
      )?.naturalWidth > 1000,
  );
  const startCounter = await mobile.page.locator(".pswp__counter").innerText();
  await swipeLeft(
    mobile.context,
    mobile.page,
    '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
  );
  assert.notEqual(
    await mobile.page.locator(".pswp__counter").innerText(),
    startCounter,
    "Touch swipe must navigate the fullscreen gallery.",
  );
  await mobile.page.keyboard.press("Escape");
  await mobile.page.locator(".pswp").waitFor({ state: "hidden" });
  assert.equal(mobile.errors.length, 0, mobile.errors.join("\n"));
  assert.deepEqual(
    mobile.originalRequests,
    [],
    "Mobile visitors must never request files from the original source folder.",
  );

  console.log(
    JSON.stringify(
      {
        photos: 80,
        beforeGallery: {
          galleryRequests: desktop.galleryRequests.length,
          fullscreenRequests: 0,
          originalRequests: desktop.originalRequests.length,
        },
        nearVisibleGalleryImages: loadedInFirstWall,
        lightbox: [
          "open",
          "caption and alt",
          "next/previous",
          "zoom",
          "Escape",
          "focus restore",
          "wall scroll restore",
        ],
        mobile: ["touch open", "touch swipe navigation"],
        errors: [...desktop.errors, ...mobile.errors],
      },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
