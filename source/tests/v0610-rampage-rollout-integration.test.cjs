'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Rampage Rollout is wired into Stadium 2, help, records, scripts and mobile controls',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const html=read('app/src/main/assets/index.html');
  const help=read('app/src/main/assets/arcade-help.js');
  const records=read('app/src/main/assets/arcade-records.js');
  assert.match(world,/pichuPowerPlant','rampageRollout/);
  assert.match(world,/rampageRollout:\(\)=>window\.LuckyDexRampageRollout/);
  assert.match(html,/id="rampageRolloutGame"/);
  assert.match(html,/id="rampageRolloutStick"/);
  assert.match(html,/id="rampageRolloutDust"/);
  assert.match(html,/arcade-rampage-rollout-core\.js/);
  assert.match(html,/arcade-rampage-rollout\.js/);
  assert.match(help,/rampageRollout:\{name:'Rampage Rollout'/);
  assert.match(records,/rampageRollout/);
});

test('Rampage Rollout has four appropriate achievements and no fake rare-event setting',()=>{
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  const settings=read('app/src/main/assets/index.html');
  assert.match(achievements,/rampage_rollout_first_match/);
  assert.match(achievements,/rampage_rollout_first_win/);
  assert.match(achievements,/rampage_rollout_hard_win/);
  assert.match(achievements,/rampage_rollout_dust_devil/);
  assert.doesNotMatch(settings,/forceRampage|rampage.*rare/i);
});
