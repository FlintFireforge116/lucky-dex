'use strict';
const assert=require('node:assert/strict');
const {launch,appPage}=require('../scripts/recovery-browser.cjs');
const {viewports,seedSave,enterRace,layout}=require('../scripts/v0340-dash-qa.cjs');
const touchSessions=new WeakMap();
async function touch(page,selector,type){
  const b=await page.locator(selector).boundingBox();
  let session=touchSessions.get(page);if(!session){session=await page.context().newCDPSession(page);touchSessions.set(page,session)}
  await session.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});
}
function assertLayout(m){
  const {width,height}=m.viewport;
  for(const [selector,b] of Object.entries(m.nodes)){
    assert(b.width>0&&b.height>0,`${selector} has usable dimensions at ${width}x${height}`);
    assert(b.x>=-1&&b.y>=-1&&b.x+b.width<=width+1&&b.bottom<=height+1,`${selector} fits ${width}x${height}: ${JSON.stringify(b)}`);
  }
  const hud=m.nodes['.dash-hud'],course=m.nodes['.dash-canvas-wrap'],controls=m.nodes['.dash-controls'];
  assert(hud.bottom<=course.y,'HUD precedes course');
  assert(course.bottom<=controls.y,'controls do not overlap course');
  assert(course.height>=height*.65,'course owns the majority of available viewport');
  assert(course.y<=110,'no wasted top band pushes the course down');
  for(const selector of ['#dashLeftBtn','#dashSprintBtn','#dashRightBtn'])assert(m.nodes[selector].height>=44,`${selector} remains a usable touch target`);
  assert(m.scroll.documentHeight<=height&&m.scroll.bodyHeight<=height,'document does not scroll during a race');
  assert.equal(m.scroll.y,0);
}
async function observePlayer(page){await page.evaluate(()=>{
  const original=LuckyDexDashRenderer.drawRacer;
  LuckyDexDashRenderer.drawRacer=function(ctx,racer,...args){if(racer.isPlayer)window.qaPlayer={laneVisual:racer.laneVisual,stamina:racer.stamina,sprinting:racer.sprinting};return original.call(this,ctx,racer,...args);};
});await page.waitForTimeout(40);}
const player=page=>page.evaluate(()=>window.qaPlayer);
(async()=>{
  const browser=await launch();
  try{for(const viewport of viewports){
    const errors=[],{context,page}=await appPage(browser,viewport,errors,{init:seedSave});
    try{
      await enterRace(page);assertLayout(await layout(page));
      assert(await page.evaluate(()=>document.getElementById('dashGame').parentElement===document.body),'active Dash has one viewport owner outside page ancestors');
      await page.evaluate(()=>window.qaOriginalDashParent.style.transform='translate3d(0,96px,0)');
      assertLayout(await layout(page));
      for(const selector of ['#dashLeftBtn','#dashSprintBtn','#dashRightBtn'])assert(await page.locator(selector).evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}),`${selector} is hit-testable`);
      assert.equal(await page.locator('#dashCanvas').evaluate(el=>getComputedStyle(el).imageRendering),'pixelated');
      await observePlayer(page);const before=await player(page);
      await touch(page,'#dashRightBtn','touchStart');await page.waitForTimeout(80);const immediate=await player(page);
      assert(immediate.laneVisual>before.laneVisual+.01,'steering starts on touch/pointerdown before release');
      assert(immediate.laneVisual<before.laneVisual+.8,'steering moves smoothly without a lane teleport');
      await page.waitForTimeout(140);const held=await player(page);
      assert(held.laneVisual>immediate.laneVisual+.01,'held direction continues steering');
      await touch(page,'#dashRightBtn','touchEnd');await page.waitForTimeout(40);const released=await player(page);await page.waitForTimeout(120);const stopped=await player(page);
      assert(Math.abs(stopped.laneVisual-released.laneVisual)<.08,'release stops lateral movement predictably');
      await touch(page,'#dashLeftBtn','touchStart');await page.waitForTimeout(100);const left=await player(page);
      assert(left.laneVisual<stopped.laneVisual-.01,'left control steers back');
      await touch(page,'#dashLeftBtn','touchCancel');await page.waitForTimeout(40);const canceled=await player(page);await page.waitForTimeout(120);
      assert(Math.abs((await player(page)).laneVisual-canceled.laneVisual)<.08,'touch/pointer cancel releases held steering');
      const staminaBefore=(await player(page)).stamina;
      await touch(page,'#dashSprintBtn','touchStart');await page.waitForTimeout(140);
      assert(await page.locator('#dashSprintBtn').evaluate(el=>el.classList.contains('active')),'sprint touch activates immediately');
      assert((await player(page)).stamina<staminaBefore,'sprint uses stamina');
      await touch(page,'#dashSprintBtn','touchEnd');await page.waitForTimeout(40);
      assert.equal(await page.locator('#dashSprintBtn').evaluate(el=>el.classList.contains('active')),false,'sprint release clears input');
      await page.evaluate(()=>LuckyDexDash.pause());assert(await page.locator('#dashPauseOverlay').isVisible());
      await page.evaluate(()=>LuckyDexDash.resume());assert.equal(await page.locator('#dashPauseOverlay').isVisible(),false);
      assertLayout(await layout(page));
      await page.evaluate(()=>{window.qaOriginalDashParent.style.transform='';LuckyDexArcadeWorld.backFromGame();});
      assert(await page.evaluate(()=>document.getElementById('dashGame').parentElement===window.qaOriginalDashParent),'exit restores Dash to its original Arcade slot');
      // A transformed Arcade ancestor exists before the next open. The viewport
      // owner must remain independent, then restore its original slot again.
      await page.evaluate(()=>window.qaOriginalDashParent.style.transform='translate3d(0,96px,0)');
      await page.locator('[data-venue-game="dash"]').click();await page.locator('#dashQuickBtn').click();await page.locator('[data-dash-difficulty="easy"]').click();await page.locator('#dashStartBtn').click();
      await page.waitForFunction(()=>!document.getElementById('dashCountdown').hidden&&document.getElementById('dashCountdown').textContent!=='LOADING');
      assertLayout(await layout(page));
      await page.evaluate(()=>{window.qaOriginalDashParent.style.transform='';LuckyDexArcadeWorld.backFromGame();});
      assert(await page.evaluate(()=>document.getElementById('dashGame').parentElement===window.qaOriginalDashParent),'repeated open/exit restores the same slot');
      assert.deepEqual(errors,[],'no runtime errors through the actual Arcade hierarchy');
      console.log(`PASS actual Arcade → Dash ${viewport.width}x${viewport.height}: viewport, hit targets, touch holding, sprint and pause`);
    }finally{await context.close();}
  }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
