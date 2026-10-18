'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

test('reconcile grants sleeve for old claimed achievement once without touching currency',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={profile:{coins:777,tickets:4,dust:12,achievementClaims:['regional_kanto']},cosmetics:core.normaliseCosmetics(null)};
  const achievements=[{id:'regional_kanto',reward:{coins:1800}}];
  const before={coins:state.profile.coins,tickets:state.profile.tickets,dust:state.profile.dust};
  const one=core.reconcile(state,achievements);
  assert.ok(state.cosmetics.unlockedSleeves.includes('kanto-red'));
  assert.deepEqual({coins:state.profile.coins,tickets:state.profile.tickets,dust:state.profile.dust},before);
  assert.equal(one.unlockedSleeves.includes('kanto-red'),true);
  const two=core.reconcile(state,achievements);
  assert.equal(two.unlockedSleeves.length,0);
});

test('reconcile can recognise completed durable progress but does not guess telemetry-only events',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={profile:{achievementClaims:[]},cosmetics:core.normaliseCosmetics(null)};
  const achievements=[
    {id:'v0413_sealed_5',reward:{sleeve:'sealed-vault'},progress:()=>[5,5]},
    {id:'v0413_first_throw',reward:{sleeve:'first-ball'},progress:()=>[0,1],_v0413TelemetryOnly:true}
  ];
  core.reconcile(state,achievements);
  assert.ok(state.cosmetics.unlockedSleeves.includes('sealed-vault'));
  assert.equal(state.cosmetics.unlockedSleeves.includes('first-ball'),false);
});

test('completed secret reconciliation discovers the secret before exposing its sleeve',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={profile:{achievementClaims:[]},cosmetics:core.normaliseCosmetics(null)};
  core.reconcile(state,[{id:'v0413_secret_kanto_starters',hidden:true,reward:{sleeve:'oak-trio'},progress:()=>[1,1]}]);
  assert.equal(core.isDiscovered(state,'v0413_secret_kanto_starters'),true);
  assert.ok(state.cosmetics.unlockedSleeves.includes('oak-trio'));
});

test('retroactive grants aggregate into one transient recognition summary and do not repeat',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  core.consumeRecognitionSummary?.();
  const state={profile:{achievementClaims:['regional_kanto','regional_johto']},cosmetics:core.normaliseCosmetics(null)};
  core.reconcile(state,[
    {id:'regional_kanto',reward:{sleeve:'kanto-red'}},
    {id:'regional_johto',reward:{sleeve:'johto-gold'}}
  ]);
  const summary=core.consumeRecognitionSummary();
  assert.deepEqual(new Set(summary.sleeves),new Set(['kanto-red','johto-gold','adventure-passport']));
  assert.deepEqual(new Set(summary.achievements),new Set(['regional_kanto','regional_johto']));
  assert.equal(core.consumeRecognitionSummary(),null);
  core.reconcile(state,[
    {id:'regional_kanto',reward:{sleeve:'kanto-red'}},
    {id:'regional_johto',reward:{sleeve:'johto-gold'}}
  ]);
  assert.equal(core.consumeRecognitionSummary(),null);
});

test('cosmetics normalization preserves a valid active sleeve and repairs malformed input',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const valid={cosmetics:{unlockedSleeves:['luckydex-default','kanto-red'],activeSleeve:'kanto-red',discoveredSecrets:[],claimedCosmeticRewards:[]}};
  core.ensureState(valid);
  assert.equal(valid.cosmetics.activeSleeve,'kanto-red');
  const broken={cosmetics:{unlockedSleeves:'nope',activeSleeve:'missing'}};
  core.ensureState(broken);
  assert.deepEqual(broken.cosmetics.unlockedSleeves,['luckydex-default','luckydex-midnight','luckydex-cream','luckydex-pixel']);
  assert.equal(broken.cosmetics.activeSleeve,'luckydex-default');
});

test('import and reset paths explicitly normalize cosmetics and v0.40.13 telemetry',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(src,/const __origConfirmImportSaveV0413 = confirmImportSave/);
  assert.match(src,/LuckyDexCosmeticsV0413\?\.ensureState\(pendingImportedSave\)/);
  assert.match(src,/LuckyDexAchievementTelemetryV0413\?\.ensure\?\.\(pendingImportedSave\)/);
  assert.match(src,/let state = loadState\(\);[\s\S]{0,500}LuckyDexCosmeticsV0413\?\.ensureState\(state\)/);
  assert.match(src,/let state = loadState\(\);[\s\S]{0,500}LuckyDexAchievementTelemetryV0413\?\.ensure\?\.\(state\)/);
  const resetHook=src.match(/document\.getElementById\('resetBtn'\)\.onclick=.*?rebuildCollectionControls\(\);renderCollection\(\);\}\};/s)?.[0]||'';
  assert.match(resetHook,/LuckyDexCosmeticsV0413\?\.ensureState\(state\)/);
  assert.match(resetHook,/LuckyDexAchievementTelemetryV0413\?\.ensure\?\.\(state\)/);
});

test('devUnlockAll is session-only by default and leaves serialized state untouched',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={cosmetics:core.normaliseCosmetics(null)};
  core.installBridge({getState:()=>state,save:()=>{throw new Error('save must not run')}});
  const before=JSON.stringify(state);
  const ids=core.devUnlockAll();
  assert.equal(ids.length,Object.keys(core.registry).length);
  assert.equal(core.isOwned(state,'oak-trio'),true);
  assert.equal(JSON.stringify(state),before);
});

test('achievement install consumes one compact previous-accomplishments summary',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/achievements-v0341.js'),'utf8');
  assert.match(src,/consumeRecognitionSummary/);
  assert.match(src,/Previous accomplishments recognised/);
});
