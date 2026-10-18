'use strict';
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-ekans-hoop-core.js');

assert.equal(core.CONFIG.durationMs,60000);
assert.equal(core.CONFIG.sockets.length,9);
assert.equal(core.CONFIG.maxActiveTargets,3);
assert.equal(core.TARGET_TYPES.diglett.points,1);
assert.equal(core.TARGET_TYPES.dugtrio.points,3);
assert.equal(core.TARGET_TYPES.shinyDiglett.points,5);
assert.equal(core.TARGET_TYPES.shinyDugtrio.points,10);

const seq=values=>{let i=0;return ()=>values[(i++)%values.length];};
const round=core.createRound();
for(let i=0;i<3;i++)core.spawnTarget(round,seq([0.01,0.1,0.5,0.35,0.1,0.5,0.72,0.1,0.5]),1000+i);
assert.ok(round.targets.length<=3,'target manager never exceeds three active targets');
assert.equal(new Set(round.targets.map(t=>t.socketIndex)).size,round.targets.length,'active sockets must be unique');

const hitRound=core.createRound();
const target=core.spawnTarget(hitRound,seq([0,0.1,0.5]),1000);
const result=core.resolveThrow(hitRound,{lane:target.lane,depth:target.depth,targetToken:target.token},1200);
assert.equal(result.hit,true);
assert.equal(hitRound.score,result.points);
assert.equal(hitRound.targets.length,0,'a hit clears exactly one target');
const again=core.resolveThrow(hitRound,{lane:target.lane,depth:target.depth,targetToken:target.token},1250);
assert.equal(again.hit,false,'cleared target cannot score twice');
assert.equal(hitRound.streak,0,'a miss resets the streak');

const staleRound=core.createRound();
const stale=core.spawnTarget(staleRound,seq([0,0.1,0]),1000);
core.expireTargets(staleRound,stale.expiresAt+1);
const staleHit=core.resolveThrow(staleRound,{lane:stale.lane,depth:stale.depth,targetToken:stale.token},stale.expiresAt+2);
assert.equal(staleHit.hit,false,'expired target token cannot be scored');
console.log('PASS Ekans core target and stale-hit regression');
