'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

function seq(values){let i=0;return()=>values[(i++)%values.length];}

test('Clear Cut is a solo five-cut accuracy challenge with five distinct object angles',()=>{
  const core=fresh('arcade-clear-cut-core.js');
  const match=core.createMatch({difficulty:'normal',playerDex:212,rng:seq([.1,.8,.3,.6,.2,.9]),nowMs:0});
  assert.equal(core.CONFIG.rounds,5);
  assert.equal(match.racers?.length||0,0,'CPU racers must be removed');
  assert.equal(match.player.species.dex,212);
  assert.equal(match.logs.length,5);
  assert.deepEqual(new Set(match.logs.map(x=>x.angleDeg)).size,5,'all five scored cuts should use different angles');
  assert.ok(match.logs.every(x=>Math.abs(x.angleDeg)<=36),'phone-safe cut angles stay readable');
});

test('Clear Cut reward is based on accuracy score rather than placement',()=>{
  const core=fresh('arcade-clear-cut-core.js');
  assert.equal(typeof core.rewardForScore,'function');
  assert.ok(core.rewardForScore(100,'hard')>core.rewardForScore(75,'hard'));
  assert.ok(core.rewardForScore(75,'hard')>core.rewardForScore(75,'easy'));
  assert.equal(core.rewardForScore(-20,'normal'),core.rewardForScore(0,'normal'));
  assert.equal(core.rankMatch,undefined,'solo mode should not expose competition ranking');
  assert.equal(core.placeFor,undefined,'solo mode should not expose placement');
});

test('Clear Cut adds one unscored mystery bag bonus cut after the five scored cuts',()=>{
  const core=fresh('arcade-clear-cut-core.js');
  const match=core.createMatch({difficulty:'normal',rng:()=>.5,nowMs:0});
  for(let i=0;i<5;i++){
    const round=core.startRound(match,i,i*5000);
    const out=core.cutPlayer(match,round.log.idealTimeMs,()=>.5);
    assert.equal(out.result.score,20);
  }
  assert.equal(match.player.total,100);
  assert.equal(match.finalized,false,'five scored cuts should lead into the bonus bag');
  const bonus=core.startBonusRound(match,30000);
  assert.equal(bonus.objectKind,'mystery-bag');
  const result=core.cutBonus(match,bonus.log.idealTimeMs);
  assert.equal(result.accepted,true);
  assert.equal(result.perfect,true);
  assert.equal(match.player.total,100,'mystery bag must never alter /100 accuracy score');
  assert.equal(match.finalized,true);
});

test('Clear Cut shell has visible split pieces, no COM players, and a mystery bag object state',()=>{
  const html=read('index.html'),css=read('arcade-clear-cut.css'),runtime=read('arcade-clear-cut.js');
  const a=html.indexOf('id="clearCutGame"'),b=html.indexOf('id="dashGame"',a),shell=html.slice(a,b);
  assert.doesNotMatch(shell,/clearCutCpu[123]/);
  assert.doesNotMatch(shell,/>PLACE</);
  assert.match(shell,/id="clearCutPieceA"/);
  assert.match(shell,/id="clearCutPieceB"/);
  assert.match(shell,/id="clearCutMysteryBag"/);
  assert.match(css,/clearcut-piece/);
  assert.match(css,/clearcut-object\.is-cut/);
  assert.match(css,/@keyframes clearcutPiece/);
  assert.match(runtime,/--cut-angle/);
  assert.match(runtime,/mystery-bag/);
});

test('Clear Cut lives in a dedicated Stadium 2 Kids Club venue',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/id:"stadiumKidsClub"[^\n]+games:\['ekansHoop','digDigDig','magikarpSplash','rockHarden','clefairy','thunderingDynamo','snoreWar','runRattataRun','sushiGoRound'\]/);
  assert.match(world,/id:"stadium2KidsClub"[^\n]+name:"Pokémon Stadium 2 · Kids Club"[^\n]+games:\['clearCutChallenge','gutsyGolbat','furretFrolic','topsyTurvy','barrierBall'\]/);
  assert.match(world,/stadium2KidsClub/);
  assert.equal(fs.existsSync(asset('arcade/kids-club/kids-club-2-venue.svg')),true,'Stadium 2 venue art must exist');
});

test('Clear Cut records and achievements are accuracy-based, not win/place based',()=>{
  global.LuckyDexArcadeRecordsCore=fresh('arcade-records-core.js');
  const platform=fresh('arcade-platform.js');
  const row=platform.ensureArcadeState({clearCutChallenge:{gamesPlayed:3,bestScore:92,totalPerfects:6,closestCutPct:.4,totalAbsErrorPct:21,totalCuts:15,bagsPerfect:1,bagPrizes:1}}).clearCutChallenge;
  assert.equal(row.totalCuts,15);
  assert.equal(row.totalAbsErrorPct,21);
  assert.equal(row.bagsPerfect,1);
  assert.equal(row.bagPrizes,1);
  const records=read('arcade-records.js');
  assert.doesNotMatch(records,/clearCutChallenge:a=>[^\n]+\['Wins'/);
  assert.match(records,/Average Error/);
  assert.match(records,/Mystery Bags/);
  const achievements=fresh('achievements-v0341.js');
  const state={arcade:{clearCutChallenge:{gamesPlayed:1,bestScore:100,bestScores:{easy:72,normal:80,hard:86},totalPerfects:5}}};
  const byId=new Map(achievements.buildCoreAchievements(()=>state).map(a=>[a.id,a]));
  assert.deepEqual(byId.get('clearcut_first_win').progress(),[1,1]);
  assert.deepEqual(byId.get('clearcut_hard_win').progress(),[1,1]);
  assert.deepEqual(byId.get('clearcut_all_difficulties').progress(),[3,3]);
});
