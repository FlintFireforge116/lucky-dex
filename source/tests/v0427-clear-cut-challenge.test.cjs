'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('Clear Cut keeps its five-cut precision core and cosmetic cutter choice',()=>{
  const core=fresh('arcade-clear-cut-core.js');
  assert.equal(core.CONFIG.rounds,5);
  assert.deepEqual(core.CUTTERS.map(x=>x.dex),[123,127,212]);
  const match=core.createMatch({difficulty:'normal',playerDex:212,rng:()=>.5,nowMs:0});
  assert.equal(match.logs.length,5);assert.equal(match.player.species.dex,212);
});

test('Clear Cut precision score remains continuous, asymmetric and clamps from -10 to 20',()=>{
  const core=fresh('arcade-clear-cut-core.js');
  assert.deepEqual(core.scoreCut(0),{score:20,judgement:'PERFECT'});assert.equal(core.scoreCut(1.5).score,20);assert.equal(core.scoreCut(4).score,17);
  assert.ok(core.scoreCut(-10).score<core.scoreCut(10).score);assert.equal(core.scoreCut(-100).score,-10);assert.equal(core.scoreCut(100).score,-10);
});

test('Clear Cut scoring is difficulty-independent while motion gets faster',()=>{
  const core=fresh('arcade-clear-cut-core.js'),easy=core.difficultyProfile('easy'),normal=core.difficultyProfile('normal'),hard=core.difficultyProfile('hard');
  assert.ok(hard.durationMinMs<normal.durationMinMs&&normal.durationMinMs<easy.durationMinMs);
  for(const d of ['easy','normal','hard'])assert.equal(core.scoreCut(-12,d).score,core.scoreCut(-12).score);
});

test('Clear Cut accepts one scored cut per target and five perfect scored cuts total 100',()=>{
  const core=fresh('arcade-clear-cut-core.js'),match=core.createMatch({difficulty:'normal',rng:()=>.5,nowMs:0});
  for(let i=0;i<5;i++){const round=core.startRound(match,i,i*5000),first=core.cutPlayer(match,round.log.idealTimeMs);assert.equal(first.accepted,true);assert.equal(first.result.score,20);const second=core.cutPlayer(match,round.log.idealTimeMs);assert.equal(second.accepted,false);}
  assert.equal(match.player.total,100);assert.equal(match.player.perfects,5);
});

test('Clear Cut active timing can still be shifted safely across pause/resume',()=>{
  const core=fresh('arcade-clear-cut-core.js'),match=core.createMatch({difficulty:'normal',rng:()=>.5,nowMs:1000}),round=core.startRound(match,0,2000),before={start:round.log.startedAt,ideal:round.log.idealTimeMs,end:round.log.endsAt};
  core.shiftActiveRound(match,1750);assert.equal(round.log.startedAt,before.start+1750);assert.equal(round.log.idealTimeMs,before.ideal+1750);assert.equal(round.log.endsAt,before.end+1750);
});

test('Clear Cut remains wired into Arcade navigation with its phone-first assets',()=>{
  const world=read('arcade-world.js'),html=read('index.html');assert.match(world,/clearCutChallenge:'Clear Cut Challenge'/);assert.match(world,/clearCutChallenge:\(\)=>window\.LuckyDexClearCut/);assert.match(world,/id==='clearCutChallenge'\?'clearCutGame'/);
  assert.match(html,/<link rel="stylesheet" href="arcade-clear-cut\.css" \/>/);for(const id of ['clearCutGame','clearCutStage','clearCutRound','clearCutTotal','clearCutDifficultyLabel','clearCutLog','clearCutTarget','clearCutActual','clearCutPlayer','clearCutReady','clearCutStart','clearCutButton','clearCutPauseOverlay','clearCutResume'])assert.match(html,new RegExp(`id="${id}"`));
});

test('Clear Cut records preserve old save fields while carrying precision history',()=>{
  global.LuckyDexArcadeRecordsCore=fresh('arcade-records-core.js');const platform=fresh('arcade-platform.js');const row=platform.ensureArcadeState({clearCutChallenge:{gamesPlayed:4,wins:2,bestScore:91,totalPerfects:7,closestCutPct:.42,totalCuts:20,totalAbsErrorPct:18}}).clearCutChallenge;
  assert.equal(row.gamesPlayed,4);assert.equal(row.wins,2);assert.equal(row.bestScore,91);assert.equal(row.totalPerfects,7);assert.equal(row.closestCutPct,.42);assert.equal(row.totalCuts,20);assert.equal(row.totalAbsErrorPct,18);
  const records=read('arcade-records.js');assert.match(records,/Closest Cut/);assert.match(records,/Perfect Cuts/);
});

test('Clear Cut keeps the agreed five achievement ids',()=>{
  const achievements=fresh('achievements-v0341.js'),state={arcade:{clearCutChallenge:{gamesPlayed:1,bestScores:{easy:75,normal:80,hard:85},totalPerfects:4,bestScore:100}}},rows=achievements.buildCoreAchievements(()=>state),byId=new Map(rows.map(a=>[a.id,a]));
  for(const id of ['clearcut_first_win','clearcut_hard_win','clearcut_all_difficulties','clearcut_perfect','secret_clearcut_100'])assert.ok(byId.has(id),id);assert.deepEqual(byId.get('clearcut_all_difficulties').progress(),[3,3]);assert.deepEqual(byId.get('clearcut_perfect').progress(),[1,1]);assert.equal(byId.get('secret_clearcut_100').hidden,true);
});
