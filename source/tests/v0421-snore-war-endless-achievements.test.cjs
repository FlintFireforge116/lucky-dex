'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

function missCurrentCrossing(core,race){
  const at=race.targetAt-core.CONFIG.timingWindowMs-1;
  const out=core.pressPlayer(race,at);
  assert.equal(out.accepted,true);
  assert.equal(out.hit,false);
  return at;
}

test('Snore War Endless survives CPU sleep states and ends on the player third miss',()=>{
  const core=fresh('arcade-snore-war-core.js');
  assert.equal(core.CONFIG.endlessMissLimit,3);
  const race=core.createRace({difficulty:'normal',mode:'endless',rng:()=>.5,nowMs:0});
  assert.equal(race.mode,'endless');
  race.currentCrossing=10;
  race.targetAt=core.centerTimeForIndex(race,10);
  for(const cpu of race.racers.slice(1))cpu.sleepThroughCrossing=99;
  assert.equal(core.finalizeIfNeeded(race,race.targetAt),false,'sleeping COM racers must not end Endless');
  for(let miss=1;miss<=3;miss++){
    race.currentCrossing=10+(miss-1)*3;
    race.targetAt=core.centerTimeForIndex(race,race.currentCrossing);
    race.player.attemptedCrossing=-1;
    race.player.sleepThroughCrossing=-1;
    const at=missCurrentCrossing(core,race);
    if(miss<3)assert.equal(race.finalized,false,`miss ${miss} should not end Endless`);
    else {assert.equal(race.finalized,true);assert.equal(race.finalizedAt,at);}
  }
});

test('Snore War Endless accelerates beyond Match speed but has a finite playable cap',()=>{
  const core=fresh('arcade-snore-war-core.js');
  assert.equal(core.CONFIG.maxFullPeriodMs,720);
  assert.ok(core.CONFIG.endlessMaxFullPeriodMs<core.CONFIG.maxFullPeriodMs);
  assert.ok(core.CONFIG.endlessMaxFullPeriodMs>core.CONFIG.timingWindowMs*4,'endless cap must leave a non-overlapping timing gap');
  const match=core.createRace({mode:'match',nowMs:0,rng:()=>.5});
  const endless=core.createRace({mode:'endless',nowMs:0,rng:()=>.5});
  const late=120000;
  assert.equal(core.fullPeriodAt(match,late),core.CONFIG.maxFullPeriodMs);
  assert.equal(core.fullPeriodAt(endless,late),core.CONFIG.endlessMaxFullPeriodMs);
  assert.ok(core.fullPeriodAt(endless,late)<core.fullPeriodAt(match,late));
});

test('Snore War shell exposes Match and Endless and runtime swaps the live HUD to streak',()=>{
  const html=read('index.html'),js=read('arcade-snore-war.js'),css=read('arcade-snore-war.css');
  assert.match(html,/id="snoreWarMetricLabel"[^>]*>PLACE</);
  assert.match(html,/data-snore-war-mode="match"/);
  assert.match(html,/data-snore-war-mode="endless"/);
  assert.match(js,/mode='match'/);
  assert.match(js,/mode==='endless'\?'STREAK':'PLACE'/);
  assert.match(js,/core\.createRace\(\{difficulty,mode,rng,nowMs:/);
  assert.match(css,/\.snore-mode/);
});

test('Snore War state migration adds durable Endless records without losing old state',()=>{
  global.LuckyDexArcadeRecordsCore=fresh('arcade-records-core.js');
  const platform=fresh('arcade-platform.js');
  const migrated=platform.ensureArcadeState({snoreWar:{gamesPlayed:9,wins:4,bestStreak:71,custom:'keep'}}).snoreWar;
  assert.equal(migrated.gamesPlayed,9);assert.equal(migrated.wins,4);assert.equal(migrated.bestStreak,71);
  assert.equal(migrated.endlessRuns,0);assert.equal(migrated.bestEndlessHits,0);assert.equal(migrated.bestEndlessStreak,0);assert.equal(migrated.bestEndlessPeriodMs,null);
});

test('Snore War and Thundering Dynamo receive the approved achievement sets',()=>{
  const achievements=fresh('achievements-v0341.js');
  const state={arcade:{
    thunderingDynamo:{wins:1,winsByDifficulty:{easy:1,normal:1,hard:1},bestAccuracy:100,totalCorrect:500},
    snoreWar:{wins:1,winsByDifficulty:{easy:1,normal:1,hard:1},bestStreak:50,bestEndlessHits:200,bestEndlessStreak:200}
  }};
  const rows=achievements.buildCoreAchievements(()=>state),byId=new Map(rows.map(a=>[a.id,a]));
  for(const id of ['dynamo_first_win','dynamo_hard_win','dynamo_all_difficulties','dynamo_perfect_accuracy','dynamo_correct_500','snore_first_win','snore_hard_win','snore_all_difficulties','snore_streak_50','snore_endless_100','secret_snore_endless_200'])assert.ok(byId.has(id),id);
  assert.equal(byId.get('secret_snore_endless_200').hidden,true);
  assert.deepEqual(byId.get('dynamo_all_difficulties').progress(),[3,3]);
  assert.deepEqual(byId.get('snore_endless_100').progress(),[200,100]);
  assert.deepEqual(byId.get('secret_snore_endless_200').progress(),[200,200]);
  assert.equal(byId.get('dynamo_all_difficulties').reward.tickets,1);
  assert.equal(byId.get('snore_all_difficulties').reward.tickets,1);
});

test('Arcade Records surfaces Snore War Endless records',()=>{
  const records=read('arcade-records.js');
  assert.match(records,/Endless Runs/);
  assert.match(records,/Best Endless Hits/);
  assert.match(records,/Best Endless Streak/);
  assert.match(records,/Fastest Pendulum/);
});
