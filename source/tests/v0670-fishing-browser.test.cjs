'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {launch,open}=require('../scripts/adventure3-browser-utils.cjs');

test('v0.67 fishing controls, first-open help and Back stay usable on a 360x640 phone viewport',async()=>{
 const browser=await launch();const {page,context,errors}=await open(browser,{width:360,height:640});
 try{
  await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();await page.locator('[data-region="kanto"]').click();
  await page.locator('[data-location-action="fish"]').click();
  const shell=page.locator('[data-adv-view="activity"][data-activity-id="fishing"]');assert.equal(await shell.count(),1);
  assert.equal(await page.locator('[data-activity-help] [role="dialog"]').count(),1,'first open shows instructions');
  await page.locator('[data-activity-help-close]').click();
  for(const selector of ['[data-activity-exit]','[data-fish-cast]']){const box=await page.locator(selector).boundingBox();assert(box&&box.y>=0&&box.y+box.height<=640,selector+' fits viewport');assert(box.height>=44,selector+' has a mobile touch target');}
  await page.locator('[data-fish-cast]').click();await page.waitForTimeout(240);await page.locator('[data-fish-cast]').click();const before=await page.locator('[data-fish-phase]').getAttribute('data-fish-phase');
  await page.locator('[data-activity-help-open]').click();await page.waitForTimeout(500);const during=await page.locator('[data-fish-phase]').getAttribute('data-fish-phase');assert.equal(during,before,'help pauses fishing lifecycle');await page.locator('[data-activity-help-close]').click();
  await page.waitForSelector('[data-fish-hook]',{timeout:6000});const hook=page.locator('[data-fish-hook]');assert((await hook.boundingBox()).height>=44);await hook.click();
  await page.waitForSelector('[data-fish-reel]');const reel=page.locator('[data-fish-reel]');assert((await reel.boundingBox()).height>=44);
  assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close();}
});
