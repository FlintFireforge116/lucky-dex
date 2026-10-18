'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

function seq(values){let i=0;return()=>values[(i++)%values.length];}

test('Snore War core uses accelerating centre timing and temporary sleep',()=>{
  assert.equal(fs.existsSync(asset('arcade-snore-war-core.js')),true,'Snore War core asset must exist');
  const core=require(asset('arcade-snore-war-core.js'));
  assert.equal(core.CONFIG.timingWindowMs,120);
  assert.equal(core.CONFIG.sleepCrossings,2);
  assert.deepEqual(Object.keys(core.DIFFICULTIES),['easy','normal','hard']);
  const race=core.createRace({difficulty:'normal',rng:seq([.2,.8,.3,.7,.4,.6]),nowMs:1000});
  assert.equal(race.racers.length,4);
  assert.ok(race.racers.every(r=>r.species.dex===96));
  const c0=core.centerTimeForIndex(race,0),c1=core.centerTimeForIndex(race,1),c2=core.centerTimeForIndex(race,2);
  assert.ok(c2-c1<c1-c0,'pendulum centre crossings should get closer together over time');
  let result=core.pressPlayer(race,c0);
  assert.equal(result.accepted,true);assert.equal(result.hit,true);assert.equal(race.player.hits,1);assert.equal(race.player.streak,1);
  core.advanceRace(race,c0+core.CONFIG.timingWindowMs+1,()=>.5);
  const next=core.centerTimeForIndex(race,1);
  result=core.pressPlayer(race,next-core.CONFIG.timingWindowMs-40);
  assert.equal(result.accepted,true);assert.equal(result.hit,false);assert.equal(race.player.misses,1);assert.equal(core.isSleeping(race.player,1),true);
});

test('Snore War ends when three Drowzee are simultaneously asleep',()=>{
  const core=require(asset('arcade-snore-war-core.js'));
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.currentCrossing=4;
  for(const r of race.racers.slice(1)){r.sleepThroughCrossing=6;r.lastSleepAt=5000;}
  const ended=core.finalizeIfNeeded(race,5000);
  assert.equal(ended,true);assert.equal(race.finalized,true);
  assert.equal(core.rankRace(race)[0].id,'player');assert.equal(core.placeFor(race,'player'),1);
});

test('Snore War CPU difficulty changes timing accuracy',()=>{
  const core=require(asset('arcade-snore-war-core.js'));
  const easy=core.difficultyProfile('easy'),hard=core.difficultyProfile('hard');
  assert.ok(hard.timingSpreadMs<easy.timingSpreadMs);
  assert.ok(hard.errorChance<easy.errorChance);
});

test('Kids Club preserves Snore War in the expanded Stadium lineup',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/games:\['ekansHoop','digDigDig','magikarpSplash','rockHarden','clefairy','thunderingDynamo','snoreWar'(?:,'runRattataRun')?(?:,'sushiGoRound')?(?:,'clearCutChallenge')?\]/);
  assert.match(world,/snoreWar:'Snore War'/);
  assert.match(world,/snoreWar:\(\)=>window\.LuckyDexSnoreWar/);
  assert.match(world,/snoreWar:\{sprite:'96\.png',mechanic:'Timing · survival'\}/);
});

test('Snore War shell is phone-first, has no timer/countdown and loads before Arcade world',()=>{
  const html=read('index.html');
  assert.match(html,/<link rel="stylesheet" href="arcade-snore-war\.css" \/>/);
  const a=html.indexOf('id="snoreWarGame"');assert.ok(a>0,'Snore War shell exists');
  const b=html.indexOf('id="dashGame"');const shell=html.slice(a,b>0?b:undefined);
  for(const id of ['snoreWarGame','snoreWarStage','snoreWarPlace','snoreWarDifficultyLabel','snoreWarPendulum','snoreWarPlayer','snoreWarCpu1','snoreWarCpu2','snoreWarCpu3','snoreWarReady','snoreWarStart','snoreWarButton','snoreWarPauseOverlay','snoreWarResume','snoreWarStandings'])assert.match(shell,new RegExp(`id="${id}"`),id);
  assert.doesNotMatch(shell,/snoreWarTimer|snoreWarCountdown/);
  for(const d of ['easy','normal','hard'])assert.match(shell,new RegExp(`data-snore-war-difficulty="${d}"`));
  const coreAt=html.indexOf('<script src="arcade-snore-war-core.js"></script>');
  const runtimeAt=html.indexOf('<script src="arcade-snore-war.js"></script>');
  const worldAt=html.indexOf('<script src="arcade-world.js"></script>');
  assert.ok(coreAt>0&&runtimeAt>coreAt&&worldAt>runtimeAt,'Snore War core/runtime load before Arcade world');
});

test('Snore War runtime starts immediately and records career metrics',()=>{
  const js=read('arcade-snore-war.js');
  assert.doesNotMatch(js,/phase==='countdown'|countdownEndsAt|snoreWarCountdown/);
  assert.match(js,/function startRound[\s\S]*?phase='racing'/);
  delete require.cache[require.resolve(asset('arcade-platform.js'))];
  global.LuckyDexArcadeRecordsCore=require(asset('arcade-records-core.js'));
  const platform=require(asset('arcade-platform.js'));
  const migrated=platform.ensureArcadeState({customMarker:'keep'});
  assert.equal(migrated.customMarker,'keep');
  assert.deepEqual(migrated.snoreWar,{gamesPlayed:0,wins:0,podiums:0,bestStreak:0,bestAccuracy:0,totalHits:0,totalMisses:0,winsByDifficulty:{easy:0,normal:0,hard:0},endlessRuns:0,bestEndlessHits:0,bestEndlessStreak:0,bestEndlessPeriodMs:null});
  const records=read('arcade-records.js');
  assert.match(records,/['"]snoreWar['"]/);assert.match(records,/snoreWar:'Snore War'/);assert.match(records,/bestStreak/i);
});

test('Snore War difficulty controls are shrink-safe on phone widths',()=>{
  const css=read('arcade-snore-war.css');
  assert.match(css,/\.snore-difficulty button\{[^}]*min-width:0[^}]*width:100%/,'difficulty buttons must stay inside their three phone grid tracks');
});
