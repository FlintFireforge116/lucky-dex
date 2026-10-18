'use strict';
const assert=require('node:assert/strict');
const rock=require('../app/src/main/assets/arcade-rock-harden-core.js');
const mag=require('../app/src/main/assets/arcade-magikarp-splash-core.js');
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function sampleRock(difficulty){const counts={perfect:0,good:0,safe:0,miss:0};for(let i=0;i<220;i++){const round=rock.createRound({difficulty,rng:rng(0x5000+i),nowMs:0});for(const cpu of round.racers.slice(1))for(const action of cpu.cpuActions)if(Object.hasOwn(counts,action.expectedGrade))counts[action.expectedGrade]++;}const total=Object.values(counts).reduce((a,b)=>a+b,0);return {counts,total,perfect:counts.perfect/total,miss:counts.miss/total};}
assert.deepEqual({perfectRate:rock.DIFFICULTIES.normal.perfectRate,missRate:rock.DIFFICULTIES.normal.missRate,goodShare:rock.DIFFICULTIES.normal.goodShare},{perfectRate:.40,missRate:.09,goodShare:.84});
const easy=sampleRock('easy'),normal=sampleRock('normal'),hard=sampleRock('hard');
assert.ok(normal.perfect>=.35&&normal.perfect<=.45,`Normal Perfect rate ${normal.perfect}`);
assert.ok(normal.miss>=.06&&normal.miss<=.12,`Normal miss rate ${normal.miss}`);
assert.ok(normal.counts.good>normal.counts.perfect,`Normal Good ${normal.counts.good} should exceed Perfect ${normal.counts.perfect}`);
assert.ok(hard.perfect>normal.perfect+.20,'Hard must remain materially more precise than Normal');
assert.ok(easy.perfect<normal.perfect,'Easy must remain less precise than Normal');

assert.equal(mag.CONFIG.quickFlightScale,.84,'Quick Splash flight scale');
function jump(quick){const round=mag.createRound({difficulty:'normal',rng:rng(7),nowMs:0}),lane=round.player;if(quick){lane.phase='landing';lane.landedAt=0;lane.recoveryUntil=240;const hit=mag._pressLane(round,lane,0);assert.equal(hit.quick,true);}else{const hit=mag._pressLane(round,lane,0);assert.equal(hit.quick,false);}mag._releaseLane(lane,150);mag._advanceLane(round,lane,150);return {round,lane,flight:lane.expectedLandingAt-lane.jumpStartedAt};}
const normalJump=jump(false),quickJump=jump(true);
assert.equal(quickJump.lane.currentJumpQuick,true,'Quick jump is explicitly tracked on the lane');
assert.ok(Math.abs(quickJump.flight-normalJump.flight*.84)<1e-6,`Quick flight ${quickJump.flight} should be 84% of normal ${normalJump.flight}`);
const normalMid=normalJump.lane.jumpStartedAt+normalJump.flight/2,quickMid=quickJump.lane.jumpStartedAt+quickJump.flight/2;
mag._advanceLane(normalJump.round,normalJump.lane,normalMid);mag._advanceLane(quickJump.round,quickJump.lane,quickMid);
assert.ok(Math.abs(normalJump.lane.y-quickJump.lane.y)<1e-9,'Quick keeps the same hold-to-height mapping');
console.log('PASS v0.39.0 Rock Normal balance and Magikarp Quick acceleration');
