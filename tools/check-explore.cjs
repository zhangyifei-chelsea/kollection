const {chromium} = require('@playwright/test');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true});
 try {
 const page = await browser.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const requests=[]; page.on('request',r=>requests.push(r.url()));
 const base=process.env.EXPLORE_BASE_URL || 'http://127.0.0.1:3000';
 await page.goto(`${base}/explore?date=2026-05-02&month=2026-05`, {waitUntil:'networkidle'});
 await page.waitForSelector('.calendar-grid');
 assert.match(await page.locator('#results-heading').innerText(),/2 May 2026/);
 const count=Number((await page.locator('[data-date="2026-05-02"]').getAttribute('aria-label')).match(/, (\d+)/)[1]);
 assert.equal(await page.locator('.explore-gallery figure').count(),count);
 assert.equal(requests.filter(u=>u.includes('/images/fullscreen/')).length,0);
 const photo=page.locator('.explore-gallery a').first();
 await photo.click(); await page.waitForSelector('.pswp--open');
 await page.keyboard.press('Escape'); await page.waitForSelector('.pswp',{state:'detached'});
 assert.equal(await photo.evaluate(el=>el===document.activeElement),true);
 await page.locator('[data-date="2026-05-01"]').click();
 assert.match(page.url(),/date=2026-05-01/);
 await page.goBack(); assert.match(await page.locator('#results-heading').innerText(),/2 May 2026/);
 await page.getByLabel('Year',{exact:true}).selectOption('2025');
 assert.match(page.url(),/month=2025-05/);
 await page.locator('[data-date="2025-05-01"]').click();
 await page.waitForSelector('.calendar-empty');
 await page.locator('[data-date="2025-05-01"]').focus();
 await page.keyboard.press('ArrowRight');
 assert.equal(await page.locator('[data-date="2025-05-02"]').evaluate(el=>el===document.activeElement),true);
 await page.goto(`${base}/explore?date=2026-02-30&month=garbage`, {waitUntil:'networkidle'});
 assert.equal(await page.locator('.calendar-grid button').count()>27,true);
 for (const width of [320,375,390,768,1024,1440,1920]) {
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}`);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'docs/explore-1440.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'docs/explore-390.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('Explore: URL/history, counts, empty/invalid dates, years, keyboard, Lightbox/focus, lazy fullscreen, and 7 responsive widths passed.');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
