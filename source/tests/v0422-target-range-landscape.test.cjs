'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);
const read=n=>fs.readFileSync(asset(n),'utf8');

const core=require(asset('arcade-target-range-core.js'));
const fixture=require('../scripts/target-range-browser-fixture.cjs');
async function live(fn){const browser=await fixture.launch();const {page,context}=await fixture.open(browser);try{await fn(page);}finally{await context.close();await browser.close();}}

test('range depth maps distance into a downrange landscape instead of an overhead lane',()=>{
  assert.equal(typeof core.rangeYForDistance,'function');
  assert.ok(core.rangeYForDistance(10)>core.rangeYForDistance(50));
  assert.ok(core.rangeYForDistance(10)-core.rangeYForDistance(50)>.25);
  const round=core.createRound({participant:{baseStat:80},profile:core.difficultyProfile('normal'),seed:422});
  for(const target of round.targets){
    assert.ok(target.y>=.30&&target.y<=.70,`${target.distanceM}m -> ${target.y}`);
  }
});

test('projectiles are deliberately slower than the v0.42.1 tuning',()=>{
  const near=core.projectileSolution({distanceM:20,focus:1,spAtk:80});
  const far=core.projectileSolution({distanceM:50,focus:1,spAtk:80});
  assert.ok(near.travelMs>=520,near);
  assert.ok(far.travelMs>=950,far);
  assert.ok(far.travelMs>near.travelMs);
});

test('moving targets use calm archery-gallery motion rather than race pacing',()=>{
  const profile={...core.divisionProfile('master',2),motionChance:1,targetCount:12};
  const round=core.createRound({participant:{baseStat:100},profile,seed:88});
  const moving=round.targets.filter(t=>t.motion?.type!=='stationary');
  assert.ok(moving.length>0);
  assert.ok(moving.every(t=>t.motion.periodMs>=2400),moving.map(t=>t.motion.periodMs));
  assert.ok(round.targets.every(t=>t.exposureMs>=3600),round.targets.map(t=>t.exposureMs));
});

test('ballistic visual path launches from the foreground and arcs toward impact rather than passing through the reticle as a waypoint',()=>{
  const opts={startX:.18,startY:.72,aimX:.55,aimY:.30,impactX:.59,impactY:.39};
  const start=core.projectileVisualPoint({...opts,progress:0});
  const mid=core.projectileVisualPoint({...opts,progress:.5});
  const end=core.projectileVisualPoint({...opts,progress:1});
  assert.deepEqual(start,{x:.18,y:.72});
  assert.deepEqual(end,{x:.59,y:.39});
  assert.notDeepEqual(mid,{x:.55,y:.30});
  const linearMid=(opts.startY+opts.impactY)/2;
  assert.ok(mid.y<linearMid,`${mid.y} should arc above ${linearMid}`);
});

test('live range is portrait with a foreground shooter and horizontal downrange horizon',()=>live(async page=>{
  const g=await page.locator('#targetRangeGallery').boundingBox(),p=await page.locator('#targetRangePokemon').boundingBox(),h=await page.locator('.target-range-horizon').boundingBox();
  assert.ok(g.height>g.width);assert.ok(h.width>h.height*4);assert.ok(p.y>g.y+g.height*.8);
}));

test('small reticle visibly tightens on a well-timed hold',()=>live(async page=>{
  await page.clock.install();const before=await page.locator('#targetRangeReticle').boundingBox(),c=await page.locator('#targetRangeControl').boundingBox();
  await page.mouse.move(c.x+c.width/2,c.y+c.height/2);await page.mouse.down();await page.clock.runFor(1500);
  const after=await page.locator('#targetRangeReticle').boundingBox();assert.ok(before.width<=20&&after.width<before.width-1);
  await page.mouse.up();
}));

test('there is no target escape timer while the player is lining up a shot',()=>{
  const js=read('arcade-target-range.js');
  assert.match(js,/targetDeadline=Infinity/);
  assert.doesNotMatch(js,/feedback\('TOO SLOW'/);
  assert.doesNotMatch(js,/t>=targetDeadline/);
});

test('runtime launches upward from the low central Pokemon',()=>live(async page=>{
  await page.clock.install();await page.evaluate(()=>LuckyDexTargetRange.fire(1));await page.clock.runFor(20);
  const point=await page.locator('#targetRangeProjectile').evaluate(n=>({x:parseFloat(n.style.left),y:parseFloat(n.style.top)}));
  assert.ok(point.x>45&&point.x<55&&point.y>80,JSON.stringify(point));
}));
