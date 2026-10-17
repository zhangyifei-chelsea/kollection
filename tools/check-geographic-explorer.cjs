const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.EXPLORE_BASE_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch({headless:true, channel:process.env.PLAYWRIGHT_CHANNEL});
  try {
    for (const width of [390,1440]) {
      const context = await browser.newContext({ viewport:{width,height:1000}, isMobile:width<600, hasTouch:width<600 });
      const page = await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      const fullscreen=[];page.on('request',r=>{if(r.url().includes('/images/fullscreen/'))fullscreen.push(r.url())});
      const mapRequests=[];page.on('request',r=>{if(r.url().includes('/maps/world-land.svg'))mapRequests.push(r.url())});
      await page.goto(base,{waitUntil:'networkidle'});
      if(width<600) {
        await page.locator('.mobile-menu summary').click();
        await page.locator('.mobile-menu a[href="/explore"]').click();
      } else await page.locator('.desktop-nav a[href="/explore"]').click();
      await expect(page.locator('.calendar-grid')).toBeVisible();
      assert.equal(mapRequests.length,0,'Calendar must not load the map asset');
      await page.getByRole('link',{name:'By place Geographic Explorer'}).click();
      await expect(page.getByRole('region',{name:'Interactive world photo map'})).toBeVisible();
      await expect(page.getByLabel('Demonstration location data')).toContainText('fictional');
      await expect(page.locator('.photo-map-land')).toHaveAttribute('style',/scale\(2\)/);
      await expect(page.locator('[data-map-city="los-angeles"]')).toBeVisible();
      await page.getByRole('button',{name:'Reset to world view'}).click();
      await expect(page.locator('.photo-map-land')).toHaveAttribute('style',/scale\(1\)/);
      await page.getByRole('button',{name:'Reset to Pacific view'}).click();
      await expect(page.locator('.photo-map-land')).toHaveAttribute('style',/scale\(2\)/);

      assert.equal(await page.locator('.location-list li').count(),6);
      assert.equal(fullscreen.length,0);
      const counts={};
      for(const city of ['Hong Kong','Los Angeles','Osaka','Seoul','Shanghai','Tokyo']) {
        await page.getByLabel('Country / region',{exact:true}).selectOption('');
        const item=page.locator('.location-list button').filter({has:page.locator('strong',{hasText:city})});
        const count=Number((await item.locator('.location-count').innerText()).match(/\d+/)[0]);
        assert(count>0);counts[city]=count;
        await item.click();
        await expect(page.locator('#geography-results-title')).toHaveText(city);
        await expect(page.locator('.explore-gallery figure')).toHaveCount(count);
        assert.equal(new URL(page.url()).searchParams.get('view'),'map');
      }
      await page.getByRole('button',{name:'Clear filters'}).click();
      await page.getByLabel('Country / region',{exact:true}).selectOption('JP');
      assert.equal(await page.locator('.location-list li').count(),2);
      await page.getByLabel('City',{exact:true}).selectOption('tokyo');
      await expect(page.locator('#geography-results-title')).toHaveText('Tokyo');
      await page.reload({waitUntil:'networkidle'});
      await expect(page.locator('#geography-results-title')).toHaveText('Tokyo');
      await page.getByRole('button',{name:'Reset to world view'}).click();
      // The Japan pair groups at world scale. Zoom the cluster until city targets separate.
      for(let i=0;i<3 && await page.locator('[data-map-cluster]').count();i++) await page.locator('[data-map-cluster]').first().click();
      await page.locator('[data-map-city="osaka"]').click();
      await expect(page.locator('#geography-results-title')).toHaveText('Osaka');
      await page.goBack();
      await expect(page.locator('#geography-results-title')).toHaveText('Tokyo');
      const trigger=page.locator('.explore-gallery a').first();
      const source=await trigger.getAttribute('data-pswp-src');
      await trigger.click();
      await expect(page.locator('.pswp--open')).toBeVisible();
      await expect.poll(()=>fullscreen.some(url=>url.endsWith(source))).toBeTruthy();
      // Opening includes image decoding before the transition; await the real ready state.
      await page.waitForFunction(() => window.pswp?.opener.isOpen === true);
      await page.keyboard.press('Escape');
      await expect(page.locator('.pswp')).toHaveCount(0);
      await expect(trigger).toBeFocused();
      const map=page.getByRole('region',{name:'Interactive world photo map'});
      await map.focus();await page.keyboard.press('Home');
      const before=await page.locator('.photo-map-land').getAttribute('style');
      await page.keyboard.press('+');
      await expect.poll(()=>page.locator('.photo-map-land').getAttribute('style')).not.toBe(before);
      await page.keyboard.press('ArrowLeft');
      await map.scrollIntoViewIfNeeded();
      const bounds=await map.boundingBox();
      if(width>=600) {
        const start=await page.locator('.photo-map-land').getAttribute('style');
        await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.5);
        await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.5-60,bounds.y+bounds.height*.5+30,{steps:8});await page.mouse.up();
        await expect.poll(()=>page.locator('.photo-map-land').getAttribute('style')).not.toBe(start);
      }
      await map.focus();await page.keyboard.press('Home');
      if(width<600) {
        const pan=page.getByRole('button',{name:'Touch pan'});
        await page.getByRole('button',{name:'Zoom in',exact:true}).click();
        await pan.click();await expect(pan).toHaveAttribute('aria-pressed','true');
        const touchBounds=await map.boundingBox();
        const start=await page.locator('.photo-map-land').getAttribute('style');
        const session=await context.newCDPSession(page);
        const x=touchBounds.x+touchBounds.width*.5,y=touchBounds.y+touchBounds.height*.5;
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
        for(let i=1;i<=8;i++) await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*5,y:y-i*3}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
        await expect.poll(()=>page.locator('.photo-map-land').getAttribute('style')).not.toBe(start);
        await pan.click();await expect(pan).toHaveAttribute('aria-pressed','false');
      }
      await page.goto(`${base}/explore?view=map&country=XX&city=missing`,{waitUntil:'networkidle'});
      await expect(page.getByRole('status').filter({hasText:'unavailable'})).toBeVisible();
      await expect(page.locator('.location-list li')).toHaveCount(6);
      for(const w of (width===390?[320,375,390]:[768,1024,1440,1920])) {
        await page.setViewportSize({width:w,height:1000});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${w}`);
      }
      await page.setViewportSize({width,height:1000});
      await page.goto(`${base}/explore?view=map`,{waitUntil:'networkidle'});
      fs.mkdirSync('docs/geographic-review',{recursive:true});
      await page.locator('.photo-map-frame').scrollIntoViewIfNeeded();
      await page.screenshot({path:`docs/geographic-review/places-${width}.png`});
      await page.getByRole('link',{name:'By date Calendar'}).click();
      await expect(page.locator('.calendar-grid')).toBeVisible();
      assert.deepEqual(errors,[]);
      console.log(`${width}px: ${JSON.stringify(counts)}; filters, markers, URL/history, Lightbox/focus, keyboard, responsive and Calendar return passed.`);
      await context.close();
    }
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
