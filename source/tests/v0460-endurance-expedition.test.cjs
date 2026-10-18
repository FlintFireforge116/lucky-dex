const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

test('Endurance Expedition core ships five distinct HP-driven course zones',()=>{
  const core=require(asset('arcade-endurance-expedition-core.js'));
  assert.equal(core.STAGES.length,5);
  assert.deepEqual(core.STAGES.map(s=>s.id),['forest','rapids','canyon','cave','summit']);
  assert.ok(new Set(core.STAGES.flatMap(s=>s.hazards)).size>=9,'course should have many genuinely different hazards');
  assert.ok(core.enduranceCapacityForHp(160)>core.enduranceCapacityForHp(60)*1.65,'high HP should create a clearly larger endurance pool');
  assert.ok(core.enduranceCapacityForHp(35)<core.enduranceCapacityForHp(100),'low HP should feel meaningfully smaller');
});

test('skilled play avoids damage entirely while mistakes spend finite HP endurance',()=>{
  const core=require(asset('arcade-endurance-expedition-core.js'));
  const low=core.createRun({participant:{baseStat:40},profile:core.difficultyProfile('hard'),seed:4,cacheRate:0});
  const high=core.createRun({participant:{baseStat:150},profile:core.difficultyProfile('hard'),seed:4,cacheRate:0});
  const lowStart=low.endurance,highStart=high.endurance;
  core.applyHazard(low,{damage:24},false);
  assert.equal(low.endurance,lowStart,'avoided hazard must cost nothing');
  core.applyHazard(low,{damage:24},true);
  core.applyHazard(high,{damage:24},true);
  assert.ok(low.endurance<lowStart&&high.endurance<highStart);
  assert.ok(high.endurance-low.endurance>60,'HP stat gap should be obvious after the same mistake');
});

test('course scheduling is sustained and irregular rather than rhythmic',()=>{
  const core=require(asset('arcade-endurance-expedition-core.js'));
  for(const diff of ['easy','normal','hard']){
    const plan=core.createStagePlan({stage:core.STAGES[2],profile:core.difficultyProfile(diff),rng:core.createSeededRng('cadence-'+diff),stageIndex:2});
    assert.ok(plan.obstacles.length>=12);
    const times=plan.obstacles.map(o=>o.atMs).sort((a,b)=>a-b);
    const gaps=times.slice(1).map((t,i)=>t-times[i]);
    assert.ok(new Set(gaps.map(g=>Math.round(g/25)*25)).size>=4,`${diff} cadence should vary`);
    assert.ok(Math.max(...gaps)-Math.min(...gaps)>=180,`${diff} cadence should not feel metronomic`);
  }
});

test('Endurance Expedition is wired into Goldenrod, records, settings and achievements',()=>{
  const goldenrod=read('arcade-goldenrod.js');
  const adapters=read('arcade-goldenrod-adapters.js');
  const state=read('arcade-goldenrod-state.js');
  const platform=read('arcade-platform.js');
  const records=read('arcade-records.js');
  const world=read('arcade-world.js');
  const session=read('arcade-session.js');
  const app=read('app-v0167.js');
  const html=read('index.html');
  const achievements=read('achievements-v0341.js');
  assert.match(goldenrod,/enduranceExpedition[^\n]*built:true/);
  assert.match(goldenrod,/enduranceExpedition:root\.LuckyDexEnduranceExpedition/);
  assert.match(adapters,/enduranceExpedition:buildAdapter/);
  assert.match(state,/enduranceExpedition/);
  assert.match(platform,/enduranceExpedition/);
  assert.match(records,/enduranceExpedition:'Endurance Expedition'/);
  assert.match(world,/enduranceExpedition[^\n]*status:'play'/);
  assert.match(session,/enduranceExpedition:/);
  assert.match(app,/enduranceExpeditionCache/);
  assert.match(html,/rareEnduranceExpeditionCacheOddsSelect/);
  assert.match(html,/arcade-endurance-expedition\.css/);
  assert.match(html,/arcade-endurance-expedition-core\.js/);
  assert.match(html,/arcade-endurance-expedition\.js/);
  assert.match(achievements,/endurance_expedition_clear/);
  assert.match(achievements,/goldenrod_endurance_master/);
  assert.match(achievements,/endurance_expedition_cache/);
});

test('Endurance Expedition runtime exposes exhibition and tournament play',()=>{
  const runtime=read('arcade-endurance-expedition.js');
  assert.match(runtime,/startExhibition/);
  assert.match(runtime,/startTournamentRound/);
  assert.match(runtime,/finishRun/);
  assert.doesNotMatch(runtime,/jump/i);
  assert.match(runtime,/steer to dodge/i);
  assert.match(runtime,/pointer/);
  assert.match(runtime,/Golden Trail Cache|GOLDEN TRAIL CACHE/);
  assert.match(runtime,/pausedAt/);
  assert.match(runtime,/stageStartedAt\+=delta/);
  assert.match(runtime,/countdownStartedAt\+=delta/);
});
