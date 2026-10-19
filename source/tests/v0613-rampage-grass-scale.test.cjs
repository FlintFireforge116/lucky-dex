'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const core=require(path.join(ROOT,'app','src','main','assets','arcade-rampage-rollout-core.js'));
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const fixed=v=>()=>v;

test('first place intentionally receives no catch-up dirt while trailing places do',()=>{
  assert.equal(core.dustAwardForPlace(1),0);
  assert.equal(core.dustAwardForPlace(2),1);
  assert.equal(core.dustAwardForPlace(3),2);
  assert.equal(core.dustAwardForPlace(4),3);
});

test('player steering can leave both dirt edges and enter inner or outer grass',()=>{
  assert.ok(core.CONFIG.minSteerRadius < core.CONFIG.innerGrassRadius,'inner grass must be reachable');
  assert.ok(core.CONFIG.innerGrassRadius < core.CONFIG.minRaceRadius,'the old inner lane wall must be well before the actual grass');
  assert.ok(core.CONFIG.maxSteerRadius > core.CONFIG.outerGrassRadius,'outer grass must be reachable');
  assert.ok(core.CONFIG.outerGrassRadius > core.CONFIG.maxRaceRadius,'outer grass should begin beyond the normal racing lanes');

  const inner=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  inner.player.radius=core.CONFIG.minRaceRadius;
  core.setPlayerInput(inner,0,1); // inward at the starting top straight
  core.advanceRace(inner,900,fixed(.5));
  assert.ok(inner.player.radius < core.CONFIG.innerGrassRadius,'player should cross the inner dirt edge rather than hit an invisible wall');

  const outer=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  outer.player.radius=core.CONFIG.maxRaceRadius;
  core.setPlayerInput(outer,0,-1); // outward at the starting top straight
  core.advanceRace(outer,500,fixed(.5));
  assert.ok(outer.player.radius > core.CONFIG.outerGrassRadius,'player should cross the outer dirt edge rather than hit an invisible wall');
});

test('grass is a severe slowdown rather than a shortcut',()=>{
  assert.equal(typeof core.offRoadFactorForRadius,'function');
  assert.ok(core.CONFIG.grassSpeedFactor<=.35,'grass speed should be heavily penalised');
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  race.player.radius=core.CONFIG.innerGrassRadius-10;
  race.player.speed=core.CONFIG.playerMaxSpeed;
  core.setPlayerInput(race,1,0);
  core.advanceRace(race,300,fixed(.5));
  assert.ok(core.offRoadFactorForRadius(race.player.radius)<1,'inner grass should be recognised as off-road');
  assert.ok(race.player.speed<core.CONFIG.playerMaxSpeed*.4,`grass should scrub most speed, got ${race.player.speed}`);
});

test('mobile course grows vertically in both simulation and layout, not just CSS stretching',()=>{
  const css=read('app/src/main/assets/arcade-rampage-rollout.css');
  assert.ok(core.CONFIG.height>720,'logical course should gain real vertical distance');
  assert.ok(core.CONFIG.courseHalfHeight>=280,'rounded rectangle should have materially longer real sides');
  assert.equal(core.CONFIG.centreY,core.CONFIG.height/2);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.rampage-rollout-track\{[^}]*aspect-ratio:\s*\.92\/1/);
  assert.match(css,/@media\(max-height:760px\) and \(max-width:600px\)\{[\s\S]*?\.rampage-rollout-track\{[^}]*aspect-ratio:\s*\.92\/1/);
});


test('larger real course keeps enough safety time for nine laps on Easy',()=>{
  assert.ok(core.CONFIG.safetyCapMs>=120000,'expanded course should not be force-finalized before a normal nine-lap finish');
});

test('runtime tells the player when Donphan is bogged down on grass',()=>{
  const js=read('app/src/main/assets/arcade-rampage-rollout.js');
  assert.match(js,/offRoadFactorForRadius\(player\.radius\)/);
  assert.match(js,/GRASS/);
});
