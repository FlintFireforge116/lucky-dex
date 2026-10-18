'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('Run Rattata Run core models four Rattata, momentum, hurdles and stumble recovery',()=>{
  assert.equal(fs.existsSync(asset('arcade-run-rattata-run-core.js')),true,'core asset must exist');
  const core=fresh('arcade-run-rattata-run-core.js');
  assert.equal(core.CONFIG.hurdles.length,6);
  assert.equal(core.CONFIG.graceMs,3000);
  assert.equal(core.CONFIG.fastTimeMs,10000);
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  assert.equal(race.racers.length,4);
  assert.ok(race.racers.every(r=>r.species.dex===19));
  assert.deepEqual(race.racers.map(r=>r.label),['YOU','COM 1','COM 2','COM 3']);
  const p=race.player;
  let t=100;
  for(let i=0;i<12;i++){const out=core.pressRun(race,p,t);assert.equal(out.accepted,true);t+=100;}
  assert.ok(p.progress>0);assert.ok(p.momentum>.5,'rapid taps should build momentum');
  p.progress=core.CONFIG.hurdles[0]-2;p.nextHurdleIndex=0;p.jumpUntil=0;p.jumpCooldownUntil=0;p.stumblingUntil=0;
  const hit=core.pressRun(race,p,t);assert.equal(hit.accepted,true);assert.equal(hit.hurdleHit,true);assert.equal(p.hurdlesHit,1);assert.ok(p.stumblingUntil>t);
  const blocked=core.pressRun(race,p,t+40);assert.equal(blocked.accepted,false);assert.equal(blocked.reason,'stumble');
  p.stumblingUntil=0;p.progress=core.CONFIG.hurdles[1]-2;p.nextHurdleIndex=1;t+=800;
  assert.equal(core.pressJump(race,p,t).accepted,true);
  const clear=core.pressRun(race,p,t+40);assert.equal(clear.accepted,true);assert.equal(clear.hurdleCleared,true);assert.equal(p.hurdlesCleared,1);
});

test('Run Rattata Run difficulty makes hard CPUs faster and more reliable jumpers',()=>{
  const core=fresh('arcade-run-rattata-run-core.js');
  const easy=core.difficultyProfile('easy'),hard=core.difficultyProfile('hard');
  assert.ok(hard.minRunIntervalMs<easy.minRunIntervalMs);
  assert.ok(hard.maxRunIntervalMs<easy.maxRunIntervalMs);
  assert.ok(hard.jumpErrorChance<easy.jumpErrorChance);
});

test('Run Rattata Run gives unfinished racers a three-second finish grace period',()=>{
  const core=fresh('arcade-run-rattata-run-core.js');
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.player.progress=core.CONFIG.courseDistance-1;
  const out=core.pressRun(race,race.player,1000);assert.equal(out.finished,true);
  core.advanceRace(race,1000,()=>.5);
  assert.equal(race.firstFinishAt,1000);assert.equal(race.graceEndsAt,4000);assert.equal(race.finalized,false);
  core.advanceRace(race,3999,()=>.9999);assert.equal(race.finalized,false);
  core.advanceRace(race,4001,()=>.9999);assert.equal(race.finalized,true);
  assert.equal(core.rankRace(race)[0].id,'player');
});

test('Kids Club exposes Run Rattata Run as the eighth Stadium game',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/games:\['ekansHoop','digDigDig','magikarpSplash','rockHarden','clefairy','thunderingDynamo','snoreWar','runRattataRun'(?:,'sushiGoRound')?(?:,'clearCutChallenge')?\]/);
  assert.match(world,/runRattataRun:'Run, Rattata, Run'/);
  assert.match(world,/runRattataRun:\(\)=>window\.LuckyDexRunRattataRun/);
  assert.match(world,/runRattataRun:\{sprite:'19\.png',mechanic:'Mash · jump · sprint'\}/);
});

test('Run Rattata Run shell is phone-first with RUN and JUMP controls and loads before Arcade world',()=>{
  const html=read('index.html');
  assert.match(html,/<link rel="stylesheet" href="arcade-run-rattata-run\.css" \/>/);
  const a=html.indexOf('id="runRattataRunGame"');assert.ok(a>0,'game shell exists');
  const b=html.indexOf('id="dashGame"');const shell=html.slice(a,b>0?b:undefined);
  for(const id of ['runRattataRunGame','runRattataRunStage','runRattataRunPlace','runRattataRunTimer','runRattataRunDifficultyLabel','runRattataRunPlayerLane','runRattataRunCpu1Lane','runRattataRunCpu2Lane','runRattataRunCpu3Lane','runRattataRunReady','runRattataRunStart','runRattataRunRun','runRattataRunJump','runRattataRunPauseOverlay','runRattataRunResume'])assert.match(shell,new RegExp(`id="${id}"`),id);
  for(const d of ['easy','normal','hard'])assert.match(shell,new RegExp(`data-rattata-difficulty="${d}"`));
  const coreAt=html.indexOf('<script src="arcade-run-rattata-run-core.js"></script>');
  const runtimeAt=html.indexOf('<script src="arcade-run-rattata-run.js"></script>');
  const worldAt=html.indexOf('<script src="arcade-world.js"></script>');
  assert.ok(coreAt>0&&runtimeAt>coreAt&&worldAt>runtimeAt,'core/runtime load before Arcade world');
});

test('Run Rattata Run state migration and Arcade Records are durable',()=>{
  global.LuckyDexArcadeRecordsCore=fresh('arcade-records-core.js');
  const platform=fresh('arcade-platform.js');
  const migrated=platform.ensureArcadeState({runRattataRun:{gamesPlayed:7,wins:2,custom:'ignored'}}).runRattataRun;
  assert.equal(migrated.gamesPlayed,7);assert.equal(migrated.wins,2);assert.equal(migrated.bestTimeMs,null);assert.equal(migrated.flawlessWins,0);assert.deepEqual(migrated.winsByDifficulty,{easy:0,normal:0,hard:0});
  const records=read('arcade-records.js');
  assert.match(records,/runRattataRun/);assert.match(records,/Run, Rattata, Run/);assert.match(records,/Flawless Wins/);assert.match(records,/Hurdles Cleared/);
});

test('Snore War gets a hidden 500-hit prestige achievement and Rattata gets five achievements',()=>{
  const achievements=fresh('achievements-v0341.js');
  const state={arcade:{snoreWar:{bestEndlessHits:500},runRattataRun:{wins:1,winsByDifficulty:{easy:1,normal:1,hard:1},flawlessWins:1,bestTimeMs:9500}}};
  const rows=achievements.buildCoreAchievements(()=>state),byId=new Map(rows.map(a=>[a.id,a]));
  const prestige=byId.get('secret_snore_endless_500');assert.ok(prestige);assert.equal(prestige.hidden,true);assert.deepEqual(prestige.progress(),[500,500]);assert.equal(prestige.reward.tickets,3);
  for(const id of ['rattata_first_win','rattata_hard_win','rattata_all_difficulties','rattata_flawless_win','rattata_fast_finish'])assert.ok(byId.has(id),id);
  assert.deepEqual(byId.get('rattata_all_difficulties').progress(),[3,3]);
  assert.deepEqual(byId.get('rattata_flawless_win').progress(),[1,1]);
  assert.deepEqual(byId.get('rattata_fast_finish').progress(),[1,1]);
});
