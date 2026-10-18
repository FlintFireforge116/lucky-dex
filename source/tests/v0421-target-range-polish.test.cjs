// The v0.42.1 visual contracts now exercise the live renderer, not source regexes.
const test=require('node:test'),assert=require('node:assert/strict');
const {launch,open}=require('../scripts/target-range-browser-fixture.cjs');
const core=require('../app/src/main/assets/arcade-target-range-core.js');
let browser;test.before(async()=>{browser=await launch();});test.after(async()=>{await browser?.close();});
async function withPage(fn){const {page,context}=await open(browser,{width:360,height:640});try{await fn(page);}finally{await context.close();}}
test('active Target Range is one-screen with redundant session strip hidden',()=>withPage(async page=>{
  assert.equal(await page.locator('#targetRangeGame>.arcade-session-strip').isVisible(),false);
  const m=await page.evaluate(()=>({doc:document.documentElement.scrollHeight-innerHeight,pane:targetRangeGame.scrollHeight-targetRangeGame.clientHeight,style:getComputedStyle(targetRangePlay).gridTemplateRows}));
  assert.ok(m.doc<=1&&m.pane<=1,JSON.stringify(m));assert.equal(m.style.split(' ').length,3);
}));
test('live HUD has three readable compact columns',()=>withPage(async page=>{
  const m=await page.locator('.target-range-hud>span').evaluateAll(nodes=>nodes.map(n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y,text:n.textContent})));
  assert.equal(m.length,3);assert.equal(m[0].y,m[2].y);assert.ok(m[2].x>m[1].x&&m[1].x>m[0].x);assert.match(m[0].text,/PRACTICE RANGE/);
}));
test('shooter stays low and control pad clears the phone gesture area',()=>withPage(async page=>{
  const g=await page.locator('#targetRangeGallery').boundingBox(),p=await page.locator('#targetRangePokemon').boundingBox(),c=await page.locator('#targetRangeControl').boundingBox();
  assert.ok(p.y>g.y+g.height*.8);assert.ok(c.height>=58&&c.y+c.height<=628);
}));
test('venue uses safe offline type scenery and no borrowed course panorama',()=>withPage(async page=>{
  const m=await page.evaluate(()=>({theme:targetRangeGallery.dataset.attackType,prop:getComputedStyle(document.querySelector('.target-range-scenery i')).backgroundImage,horizon:getComputedStyle(document.querySelector('.target-range-horizon')).backgroundImage}));
  assert.equal(m.theme,'ground');assert.match(m.prop,/ground-prop.png/);assert.equal(m.horizon,'none');
}));
test('targets stay above the foreground shooting position',()=>{
  const r=core.createRound({profile:core.difficultyProfile('hard'),seed:123});
  assert.ok(r.targets.every(t=>t.y>=.30&&t.y<=.70));
});
test('visual ballistic path has correct endpoints and a smooth arc',()=>{
  const opts={startX:.5,startY:.88,aimX:.37,aimY:.28,impactX:.42,impactY:.35};
  assert.deepEqual(core.projectileVisualPoint({...opts,progress:0}),{x:.5,y:.88});
  assert.ok(core.projectileVisualPoint({...opts,progress:.5}).y<.615);
  assert.deepEqual(core.projectileVisualPoint({...opts,progress:1}),{x:.42,y:.35});
});
test('runtime flight moves each frame from the shooter, not a CSS destination jump',()=>withPage(async page=>{
  await page.clock.install();await page.evaluate(()=>LuckyDexTargetRange.fire(1));await page.clock.runFor(20);
  const y1=await page.locator('#targetRangeProjectile').evaluate(n=>parseFloat(n.style.top));
  await page.clock.runFor(200);const y2=await page.locator('#targetRangeProjectile').evaluate(n=>parseFloat(n.style.top));
  assert.ok(y1>80&&y2<y1-5,JSON.stringify({y1,y2}));
}));
test('normal shooting leaves the centre free of permanent instruction cards',()=>withPage(async page=>{
  assert.equal(await page.locator('#targetRangeFeedback').isVisible(),false);
}));
