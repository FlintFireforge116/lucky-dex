'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {launch,open}=require('../scripts/adventure3-browser-utils.cjs');

test('v0.67 Wild Hunt target picker and break rules fit a 360x640 phone viewport',async()=>{
 const browser=await launch();const {page,context,errors}=await open(browser,{width:360,height:640});
 try{
  await page.evaluate(()=>{LuckyDexAdventureModel.ensureState(state);state.adventureV2.destinations.meadow.seen['25']=2;save();});
  await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="wild"]').click();await page.locator('[data-adv-destination="meadow"]').click();
  const target=page.locator('[data-adv-target="25"]');assert.equal(await target.count(),1);const box=await target.boundingBox();assert(box&&box.height>=44&&box.y+box.height<=640);
  await target.click();assert.match(await page.locator('.adv-hunt-target-status').innerText(),/Pikachu/i);
  await page.locator('[data-adv-action="roam"]').click();const text=await page.locator('.adv-roam-status').innerText();assert.match(text,/Target weight/i);assert.match(text,/escape.*loss.*reset/i);assert.match(text,/KO.*preserv/i);
  assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close();}
});
