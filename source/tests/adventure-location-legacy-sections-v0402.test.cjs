const assert=require('node:assert/strict'),{test}=require('node:test');
const {launch,open}=require('../scripts/adventure3-browser-utils.cjs');
test('legacy optional merchant node resumes, can browse and return to its place without travel or payment',async()=>{
 const browser=await launch(),{page,context,errors}=await open(browser,{width:360,height:640});
 try{
  await page.locator('[data-nav="adventure"]').click();
  await page.evaluate(()=>{const E=LuckyDexRegionalEngine,j=E.start(state,'johto',73),n=j.nodes.find(n=>n.optional&&n.type==='shop');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';E.enter(state,n.id);save();LuckyDexAdventure.regional()});
  const before=await page.evaluate(()=>({depth:state.adventureRegional.active.depth,coins:state.profile.coins,place:LuckyDexLocationFlow.describe(state.adventureRegional.active).name}));
  await page.reload();await page.locator('#titleContinueBtn').click();await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();
  await page.locator('[data-journey-action="merchant"]').click();await page.locator('[data-tool-action="back"]').click();
  const leave=page.locator('.adv3-foot [data-journey-action="resolve"]');assert.equal(await leave.count(),1,'saved merchant dialog has a functional return action');
  await leave.click();assert.equal(await page.locator('[data-adv-view="journey"]').count(),1);
  assert.deepEqual(await page.evaluate(()=>({depth:state.adventureRegional.active.depth,coins:state.profile.coins,place:LuckyDexLocationFlow.describe(state.adventureRegional.active).name})),before,'return does not travel or charge');
  assert.match(await page.locator('.adv3-location-feedback').innerText(),/Purchases saved/);assert(!/recovered|restored/.test(await page.locator('.adv3-location-feedback').innerText()),'shop does not report healing');
  assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close()}
});
