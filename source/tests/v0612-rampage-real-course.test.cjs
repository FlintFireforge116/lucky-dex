'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const core=require(path.join(ROOT,'app','src','main','assets','arcade-rampage-rollout-core.js'));
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const fixed=v=>()=>v;

test('Rampage Rollout simulation uses a real rounded-rectangle course with long straights',()=>{
  assert.equal(typeof core.courseLengthFor,'function');
  assert.equal(typeof core.coursePointFor,'function');
  const length=core.courseLengthFor(core.CONFIG.startRadius);
  assert.ok(length>1800,'centre-lane course should be materially longer than the old circular ring');
  const top=core.coursePointFor(-Math.PI/2,core.CONFIG.startRadius);
  const later=core.coursePointFor(-Math.PI/2+core.TAU*.075,core.CONFIG.startRadius);
  assert.ok(Math.abs(top.y-later.y)<1e-6,'the opening section should be a genuinely straight top run');
  assert.ok(later.x>top.x+100,'the top straight should cover meaningful horizontal distance');
  assert.ok(top.tx>.99&&Math.abs(top.ty)<.01,'steering tangent should point right along the top straight');
});

test('race progress is based on real course distance instead of a circular angle stretched by rendering',()=>{
  const race=core.createRace({difficulty:'normal',rng:fixed(.5),nowMs:0});
  race.player.speed=core.CONFIG.playerMaxSpeed;
  core.setPlayerInput(race,1,0);
  core.advanceRace(race,500,fixed(.5));
  const laps=core.progressFor(race.player);
  assert.ok(laps>0.08&&laps<0.10,`expected about 0.09 lap after half a second on the real longer course, got ${laps}`);
});

test('renderer takes racer and dust positions from the same core course geometry',()=>{
  const js=read('app/src/main/assets/arcade-rampage-rollout.js');
  assert.match(js,/core\.coursePointFor\(angle,radius\)/);
  assert.doesNotMatch(js,/superellipse/i);
});

test('mobile track uses more vertical phone space while leaving compact comfortable controls',()=>{
  const css=read('app/src/main/assets/arcade-rampage-rollout.css');
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.rampage-rollout-track\{[^}]*aspect-ratio:\s*1\.08\/1/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.rampage-stick\{[^}]*width:min\(100%,112px\)/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.rampage-dirt-btn\{[^}]*width:min\(100%,104px\)/);
});

test('dirt stock is shown directly on the A button and updated every render',()=>{
  const html=read('app/src/main/assets/index.html');
  const js=read('app/src/main/assets/arcade-rampage-rollout.js');
  assert.match(html,/id="rampageRolloutDirtStock"/);
  assert.match(js,/rampageRolloutDirtStock/);
  assert.match(js,/`×\$\{player\.dust\|\|0\}`/);
  assert.match(js,/classList\.toggle\('is-empty',!Number\(player\.dust\|\|0\)\)/);
});
