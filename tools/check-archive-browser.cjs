const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{ const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {}); const page=await browser.newPage({reducedMotion:'reduce'}); fs.mkdirSync('test-results/archive',{recursive:true});
for(const [width,height] of [[1440,900],[1280,800],[1024,768],[768,1024],[390,844],[375,812],[320,640]]){
 await page.setViewportSize({width,height}); await page.goto(process.env.ARCHIVE_URL || 'http://127.0.0.1:3000', {waitUntil:'domcontentloaded', timeout:120000}); await page.locator('.calendar-day').first().waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width}`);
 assert.equal(await page.locator('.calendar-day svg').count(),0);
 assert.equal(await page.locator('.calendar-day').first().evaluate(el=>getComputedStyle(el).borderRadius),'0px');
 assert.equal(await page.locator('.archive-photo-image').first().evaluate(el=>getComputedStyle(el).maskImage),'none');
 const before=await page.evaluate(()=>scrollY); await page.locator('[data-date="2026-10-03"]').click(); assert.equal(await page.evaluate(()=>scrollY),before);
 assert.equal(await page.locator('[data-date="2026-10-03"]').getAttribute('aria-pressed'),'true'); assert.match(await page.locator('#memories').getAttribute('aria-label'),/October.*3.*2026|3.*October.*2026/); assert.equal(await page.locator('.memory-filmstrip button').count(),7);
 if(width<=700){assert.ok((await page.locator('#memories').boundingBox()).y>=height-1);}
 await page.screenshot({path:`test-results/archive/${width}x${height}.png`,fullPage:true});
}
await page.locator('#memories').scrollIntoViewIfNeeded(); await page.locator('.memory-photo-button').click(); await page.getByRole('dialog').waitFor(); await page.keyboard.press('ArrowRight'); assert.match(await page.locator('.viewer-toolbar').first().innerText(),/2 \/ 7/);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
await page.getByRole('button',{name:'Map',exact:true}).click();assert.match(await page.locator('.secondary-section').innerText(),/演示地点/);assert.equal(await page.locator('.archive-photo-grid button').count(),80);
console.log('PASS: seven viewport sizes, no overflow, date selection without scroll, mobile memories below first viewport, viewer keyboard and close, explicitly labeled demo map.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
