'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const EXPECTED=[
'v0413_trade_1','v0413_trade_10','v0413_trade_50','v0413_balls_100','v0413_balls_500','v0413_locations_10','v0413_locations_25','v0413_sealed_1','v0413_sealed_5','v0413_retreats_10',
'v0413_types_all_18','v0413_gens_all_9','v0413_shiny_gens_3','v0413_dual_set_complete','v0413_regional_trio','v0413_arcade_sampler_8','v0413_one_hp_win','v0413_first_throw','v0413_voltorb_gift_clear','v0413_charm_active',
'v0413_secret_kanto_starters','v0413_secret_eevee_family','v0413_secret_magikarp_6','v0413_secret_zubat_10','v0413_secret_failed_100','v0413_secret_big_hits_5','v0413_secret_card_copy_100','v0413_secret_voltorb_gift_lost','v0413_secret_golden_berry_perfect','v0413_secret_god_pack_no_new'];

test('v0.40.13 expansion defines exactly 30 new achievements with exactly 10 secrets',()=>{
  const exp=require('../app/src/main/assets/achievements-expansion-v0413.js');
  const rows=exp.build(()=>({}));
  assert.deepEqual(rows.map(x=>x.id),EXPECTED);
  assert.equal(rows.filter(x=>x.hidden).length,10);
  assert.equal(new Set(rows.map(x=>x.id)).size,30);
  const old=require('../app/src/main/assets/achievements-v0341.js').buildCoreAchievements(()=>({}));
  const oldIds=new Set(old.map(x=>x.id));
  for(const row of rows)assert.equal(oldIds.has(row.id),false,`duplicate ${row.id}`);
});

test('every achievement sleeve reward points to the sleeve catalogue',()=>{
  const exp=require('../app/src/main/assets/achievements-expansion-v0413.js');
  const cat=require('../app/src/main/assets/cosmetics-catalog-v0413.js');
  for(const row of exp.build(()=>({})))if(row.reward?.sleeve)assert.ok(cat.BY_ID[row.reward.sleeve],`${row.id} -> ${row.reward.sleeve}`);
});

test('durable and telemetry achievement progress comes from the intended evidence',()=>{
  const exp=require('../app/src/main/assets/achievements-expansion-v0413.js');
  const telemetry=require('../app/src/main/assets/achievement-telemetry-v0413.js');
  const state={stats:{trades:10,ballsThrown:100,visitedLocations:{a:true,b:true},expeditionRetreats:10},profile:{shinyCharmFragments:3},sealedPacks:{x:{count:5}},pokemon:{},cards:{},arcade:{records:{games:{}}},adventureRegional:{records:{}},achievementTelemetryV0413:{events:{},flags:{}}};
  telemetry.record(state,'catch:first-throw');
  const rows=exp.build(()=>state), by=Object.fromEntries(rows.map(x=>[x.id,x]));
  assert.deepEqual(by.v0413_trade_10.progress(),[10,10]);
  assert.deepEqual(by.v0413_first_throw.progress(),[1,1]);
  assert.deepEqual(by.v0413_charm_active.progress(),[3,3]);
});

test('browser achievement installer merges v0.40.13 and grants reward.sleeve additively',()=>{
  const src=fs.readFileSync(path.join(ROOT,'app/src/main/assets/achievements-v0341.js'),'utf8');
  assert.match(src,/LuckyDexAchievementExpansionV0413/);
  assert.match(src,/reward\?\.sleeve/);
  assert.match(src,/unlockSleeve/);
});

test('new event-only achievements are recorded at authoritative outcome points',()=>{
  const wild=fs.readFileSync(path.join(ROOT,'app/src/main/assets/adventure/adventure-wild-hunt.js'),'utf8');
  const regional=fs.readFileSync(path.join(ROOT,'app/src/main/assets/adventure/adventure-regional-engine.js'),'utf8');
  const voltorb=fs.readFileSync(path.join(ROOT,'app/src/main/assets/arcade-classics.js'),'utf8');
  const berry=fs.readFileSync(path.join(ROOT,'app/src/main/assets/arcade-amie.js'),'utf8');
  const app=fs.readFileSync(path.join(ROOT,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(wild,/captureThrowsV0413/);assert.match(wild,/catch:first-throw/);assert.match(wild,/battle:one-hp-win/);
  assert.match(regional,/captureThrowsV0413/);assert.match(regional,/catch:first-throw/);assert.match(regional,/battle:one-hp-win/);
  assert.match(voltorb,/voltorb:gift-cleared/);assert.match(voltorb,/voltorb:gift-lost/);
  assert.match(berry,/berry:golden-perfect/);
  assert.match(app,/pack:god-no-new/);
  assert.match(app,/const __origCommitPreparedPackV0413 = commitPreparedPack/);
});

test('sleeve achievement claims refresh Profile/Customise after the unlock',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/achievements-v0341.js'),'utf8');
  const start=src.indexOf('claimAchievement=async function');
  const end=src.indexOf('function annotateExisting',start);
  const body=src.slice(start,end);
  const unlock=body.indexOf('unlockSleeve');
  const profile=body.indexOf('renderProfile()');
  assert.ok(unlock>=0&&profile>unlock,'Profile refresh must happen after sleeve unlock');
  const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(app,/renderProfile\(\)[\s\S]*refreshSummary/);
});
