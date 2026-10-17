const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
  });
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:3000");
  await p.locator("#spotlight-wall").scrollIntoViewIfNeeded();
  const box = await p.locator("#spotlight-wall").boundingBox();
  const y = Math.max(100, Math.min(650, box.y + 120));
  const s = await c.newCDPSession(p);
  await s.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 320, y }],
  });
  for (let i = 1; i <= 12; i++) {
    await s.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 320 - i * 20, y }],
    });
    await p.waitForTimeout(20);
  }
  await s.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await p.waitForTimeout(300);
  const positions = await p
    .locator(".gallery-wall")
    .evaluateAll((els) => els.map((e) => e.scrollLeft));
  if (positions[0] <= 0 || positions.slice(1).some(Boolean))
    throw Error("Touch swipe failed " + positions);
  const before = await p.evaluate(() => scrollY);
  await s.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 180, y: 600 }],
  });
  for (let i = 1; i <= 12; i++) {
    await s.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 180, y: 600 - i * 20 }],
    });
    await p.waitForTimeout(20);
  }
  await s.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await p.waitForTimeout(300);
  if ((await p.evaluate(() => scrollY)) <= before)
    throw Error("Vertical touch failed");
  for (const width of [390, 1440]) {
    await p.setViewportSize({ width, height: 900 });
    await p.goto("http://127.0.0.1:3000");
    for (const wall of await p.locator(".gallery-wall").all()) {
      await wall.scrollIntoViewIfNeeded();
      await wall
        .locator("img")
        .first()
        .evaluate((im) => im.decode());
      await p.waitForTimeout(500);
    }
    await p.evaluate(() => scrollTo(0, 0));
    await p.screenshot({
      path: process.cwd() + `/docs/preview-${width}.png`,
      fullPage: true,
    });
  }
  const nojs = await b.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const n = await nojs.newPage();
  await n.goto("http://127.0.0.1:3000");
  if ((await n.locator(".gallery-work").count()) !== 80)
    throw Error("No-JS content failed");
  console.log(
    JSON.stringify({
      horizontalTouch: true,
      independentTouch: true,
      verticalTouch: true,
      noJSContent: true,
      screenshots: "docs/preview-390.png, docs/preview-1440.png",
    }),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
