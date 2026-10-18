const assert=require('assert');
const path='../app/src/main/assets/arcade-magikarp-splash-core.js';
const core=require(path);

assert.strictEqual(core.CONFIG.roundMs,20000);
assert.strictEqual(core.CONFIG.quickEarlyMs,110);
assert.strictEqual(core.CONFIG.quickLateMs,90);
assert.deepStrictEqual(core.REWARDS.easy,[80,55,35,20]);
assert.deepStrictEqual(core.REWARDS.normal,[100,70,45,25]);
assert.deepStrictEqual(core.REWARDS.hard,[130,90,60,35]);

function fixedRng(){return .5;}
function jumpWithHold(holdMs){
  const r=core.createRound({difficulty:'normal',rng:fixedRng,nowMs:0});
  assert.equal(core.pressPlayer(r,0).accepted,true);
  core.advanceRound(r,holdMs,fixedRng);
  core.releasePlayer(r,holdMs);
  core.advanceRound(r,2000,fixedRng);
  return r;
}

const short=jumpWithHold(40);
assert.strictEqual(short.player.score,0,'short tap must not reach counter');

const held=jumpWithHold(core.CONFIG.scoreHoldMs+20);
assert.strictEqual(held.player.score,1,'deliberate hold must score');
const scoredOnce=held.player.score;
core.advanceRound(held,5000,fixedRng);
assert.strictEqual(held.player.score,scoredOnce,'one jump scores at most once');

const quick=core.createRound({difficulty:'normal',rng:fixedRng,nowMs:0});
core.pressPlayer(quick,0);
core.advanceRound(quick,core.CONFIG.scoreHoldMs+20,fixedRng);
core.releasePlayer(quick,core.CONFIG.scoreHoldMs+20);
core.advanceRound(quick,quick.player.expectedLandingAt-core.CONFIG.quickEarlyMs+10,fixedRng);
const q=core.pressPlayer(quick,quick.player.expectedLandingAt-50);
assert.strictEqual(q.quickQueued,true,'input inside early landing window should queue rebound');
core.advanceRound(quick,quick.player.expectedLandingAt+1,fixedRng);
assert.strictEqual(quick.player.phase,'airborne','queued quick input should rebound immediately');
assert.strictEqual(quick.player.quickChain,1,'quick rebound increments chain');
assert.ok(quick.player.lastQuickAt!=null);

const unusual=core.createRound({difficulty:'normal',rng:fixedRng,nowMs:0});
core.pressPlayer(unusual,0);
core.advanceRound(unusual,core.CONFIG.scoreHoldMs+20,fixedRng);
core.releasePlayer(unusual,core.CONFIG.scoreHoldMs+20);
const unusualLanding=unusual.player.expectedLandingAt;
assert.strictEqual(core.pressPlayer(unusual,unusualLanding-50).quickQueued,true);
assert.strictEqual(core.pressPlayer(unusual,unusualLanding-40).accepted,false,'duplicate landing-buffer press must not queue a second rebound');
assert.strictEqual(core.releasePlayer(unusual,unusualLanding-20),true,'release before touchdown must belong to the queued rebound');
assert.strictEqual(core.releasePlayer(unusual,unusualLanding-10),false,'duplicate release must be ignored');
core.advanceRound(unusual,unusualLanding+1,fixedRng);
assert.strictEqual(unusual.player.phase,'airborne','queued rebound survives early release ordering');
assert.strictEqual(unusual.player.quickChain,1,'unusual press/release order still creates exactly one Quick Splash');
assert.strictEqual(unusual.player.held,false,'early release must carry onto the rebound rather than becoming a phantom hold');

const miss=core.createRound({difficulty:'normal',rng:fixedRng,nowMs:0});
core.pressPlayer(miss,0);
core.advanceRound(miss,core.CONFIG.scoreHoldMs+20,fixedRng);
core.releasePlayer(miss,core.CONFIG.scoreHoldMs+20);
const landing=miss.player.expectedLandingAt;
core.advanceRound(miss,landing+core.CONFIG.quickLateMs+1,fixedRng);
const bad=core.pressPlayer(miss,landing+core.CONFIG.quickLateMs+1);
assert.strictEqual(Boolean(bad.quick),false,'late input outside window is not Quick Splash');
assert.strictEqual(miss.player.quickChain,0);
assert.ok(miss.player.recoveryUntil>=landing,'missed landing should apply grounded recovery');

const tie=core.createRound({difficulty:'normal',rng:fixedRng,nowMs:0});
tie.player.score=25;tie.racers[1].score=25;tie.racers[2].score=24;tie.racers[3].score=20;
assert.strictEqual(core.placeFor(tie,'player'),1,'tie for top uses shared rank');
assert.strictEqual(core.placeFor(tie,'cpu1'),1);
assert.strictEqual(core.placeFor(tie,'cpu2'),3);
assert.strictEqual(core.rewardFor(1,'hard'),130);
assert.strictEqual(core.rewardFor(4,'easy'),20);

console.log('v0.37.0 Magikarp core tests passed');
