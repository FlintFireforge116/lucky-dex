'use strict';
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-ekans-hoop-core.js');

assert.equal(core.CONFIG.durationMs,60000);
assert.equal(core.CONFIG.maxActiveTargets,3);
assert.deepEqual(core.CONFIG.targetValues,{diglett:1,dugtrio:3,shinyDiglett:5,shinyDugtrio:10});
assert.equal(typeof core.cpuDecision,'undefined','solo game exposes no CPU decision system');
assert.equal(typeof core.rankScores,'undefined','solo game exposes no multiplayer ranking system');

assert.equal(core.targetTypeForRoll(0.00,0.50).kind,'diglett');
assert.equal(core.targetTypeForRoll(0.7999,0.50).kind,'diglett');
assert.equal(core.targetTypeForRoll(0.80,0.50).kind,'dugtrio');
assert.equal(core.targetTypeForRoll(0.9999,0.50).kind,'dugtrio');
assert.equal(core.targetTypeForRoll(0.20,0.009).kind,'shinyDiglett');
assert.equal(core.targetTypeForRoll(0.90,0.009).kind,'shinyDugtrio');

const fixed=(values)=>{let i=0;return ()=>values[Math.min(i++,values.length-1)];};
const round=core.createRound();
assert.equal(round.score,0);
assert.equal(round.streak,0);
assert.equal(round.bestStreak,0);
assert.equal(round.totalHoops,0);
assert.equal(round.shinyHits,0);

// Socket roll, species roll, shiny roll, lifetime roll => shiny Dugtrio.
const target=core.spawnTarget(round,fixed([0.1,0.995,0.005,0.5]),1000);
assert.equal(target.kind,'shinyDugtrio');
assert.equal(target.speciesId,51);
assert.equal(target.shiny,true);
assert.equal(target.points,10);
assert.ok(target.expiresAt-target.spawnedAt<core.CONFIG.targetLifetimeMs.diglett.min,'Dugtrio ducks faster than a normal Diglett');

const hit=core.resolveThrow(round,{lane:target.lane,depth:target.depth,targetToken:target.token},1100);
assert.equal(hit.hit,true);
assert.equal(hit.basePoints,10);
assert.equal(hit.points,10);
assert.equal(hit.streak,1);
assert.equal(round.score,10);
assert.equal(round.totalHoops,1);
assert.equal(round.shinyHits,1);

const expiryRound=core.createRound();
const expiring=core.spawnTarget(expiryRound,fixed([0.2,0.1,0.5,0]),2000);
const expired=core.expireTargets(expiryRound,expiring.expiresAt+1,()=>0.5);
assert.equal(expired.length,1);
assert.equal(expiryRound.targets.length,0,'expiry only removes targets; runtime controls the calmer 1–3 target density');

// Consecutive hits raise the multiplier; a miss resets it.
function addTarget(kind,lane=1,depth=1,token=100){
  const def=core.TARGET_TYPES[kind];
  round.targets.push({socketIndex:depth*3+lane,lane,depth,token,kind,speciesId:def.speciesId,shiny:def.shiny,points:def.points,spawnedAt:1200,expiresAt:99999});
}
for(let i=0;i<7;i++){
  addTarget('diglett',1,1,100+i);
  core.resolveThrow(round,{lane:1,depth:1,targetToken:100+i},1300+i);
}
assert.equal(round.streak,8);
assert.equal(core.streakMultiplier(round.streak),1.5);
assert.equal(round.bestStreak,8);
const beforeMiss=round.score;
const miss=core.resolveThrow(round,{lane:0,depth:0,targetToken:-1},1400);
assert.equal(miss.hit,false);
assert.equal(round.streak,0);
assert.equal(round.score,beforeMiss);

assert.deepEqual(core.rewardTier(0),{tier:'Participation',coins:30,nextAt:20});
assert.deepEqual(core.rewardTier(20),{tier:'Bronze',coins:60,nextAt:35});
assert.deepEqual(core.rewardTier(35),{tier:'Silver',coins:100,nextAt:55});
assert.deepEqual(core.rewardTier(55),{tier:'Gold',coins:160,nextAt:80});
assert.deepEqual(core.rewardTier(80),{tier:'Master',coins:250,nextAt:null});

console.log('PASS v0.35.1 Ekans solo score-attack core');
