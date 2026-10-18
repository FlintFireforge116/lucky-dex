'use strict';
const assert=require('node:assert/strict');
let clock=0,queued=null;
global.performance={now:()=>clock};
global.requestAnimationFrame=fn=>{queued=fn;return 1};global.cancelAnimationFrame=()=>{queued=null};
function tick(t){clock=t;const fn=queued;queued=null;if(fn)fn(t);}
function seeded(seed=123){let x=seed>>>0;return ()=>{x=(1664525*x+1013904223)>>>0;return x/0x100000000;};}
Math.random=seeded(12345);
const listeners={};
global.document={hidden:false,getElementById:()=>null,querySelectorAll:()=>[],addEventListener:(t,f)=>{(listeners[t]??=[]).push(f)}};
global.state={arcade:{custom:'keep'},inventory:{}};global.saveCount=0;global.save=()=>{global.saveCount++};global.awards=[];global.awardArcadeCoins=(coins,label,gameId)=>{global.awards.push({coins,label,gameId});return coins};
delete require.cache[require.resolve('../app/src/main/assets/arcade-platform.js')];global.LuckyDexArcadePlatform=require('../app/src/main/assets/arcade-platform.js');global.state.arcade=global.LuckyDexArcadePlatform.ensureArcadeState(global.state.arcade);
delete require.cache[require.resolve('../app/src/main/assets/arcade-session.js')];global.LuckyDexArcadeSession=require('../app/src/main/assets/arcade-session.js');
global.LuckyDexDigDigDigCore=require('../app/src/main/assets/arcade-dig-dig-dig-core.js');
delete require.cache[require.resolve('../app/src/main/assets/arcade-dig-dig-dig.js')];const game=require('../app/src/main/assets/arcade-dig-dig-dig.js');

clock=0;game.startRound({difficulty:'normal',countdownMs:1000});assert.equal(game.input('left').accepted,false,'input before DIG is ignored');tick(400);const beforeCountdown=game.snapshot().countdownRemainingMs;assert.ok(beforeCountdown>500&&beforeCountdown<=600);game.pause();clock=5000;assert.equal(game.snapshot().countdownRemainingMs,beforeCountdown,'paused countdown stays frozen');game.resume();tick(5500);assert.equal(game.snapshot().phase,'countdown');tick(5600);assert.equal(game.snapshot().phase,'racing');

clock=10000;game.showReady({difficulty:'normal'});game.startRound({difficulty:'normal',countdownMs:0});tick(10100);const nextBefore=game.snapshot().racers[1].nextActionAt,elapsedBeforePause=game.snapshot().elapsedMs;game.pause();clock=15000;assert.equal(game.snapshot().elapsedMs,elapsedBeforePause,'player-facing elapsed time freezes while paused');clock=20100;game.resume();const nextAfter=game.snapshot().racers[1].nextActionAt;assert.ok(nextAfter-nextBefore>=9999,'resume shifts future CPU actions by hidden duration');

clock=21000;for(let i=0;i<80;i++)game.input(i%2?'right':'left');let s=game.snapshot();assert.equal(s.phase,'racing','race stays live after the player finishes');const elapsedAtPlayerFinish=s.elapsedMs;tick(22000);s=game.snapshot();assert.ok(s.elapsedMs>elapsedAtPlayerFinish,'race timer keeps counting while COM racers finish');game.pause();const pausedElapsed=s.elapsedMs;clock=30000;assert.equal(game.snapshot().elapsedMs,pausedElapsed,'post-finish race timer freezes only while paused');game.resume();assert.equal(game.snapshot().phase,'racing');
const statsBeforeClose=JSON.stringify(global.state.arcade.digDigDig),awardsBeforeClose=global.awards.length;game.close();assert.equal(JSON.stringify(global.state.arcade.digDigDig),statsBeforeClose,'abandon before finalization changes no stats');assert.equal(global.awards.length,awardsBeforeClose,'abandon awards no coins');

function finishPlayer(){for(let i=0;i<80;i++)game.input(i%2?'right':'left');}
function start(diff='normal'){game.showReady({difficulty:diff});game.startRound({difficulty:diff,countdownMs:0});}
function waitForCpuFinished(count){for(let step=0;step<4000;step++){tick(clock+10);const n=game.snapshot().racers.slice(1).filter(r=>r.finishedAt!=null).length;if(n===count)return true;if(n>count)return false;}return false;}
function finalizeExpected(place,diff,playerFinished=true){const before=global.awards.length,res=game.finishRound(clock);assert.equal(res.place,place);assert.equal(res.reward,global.LuckyDexDigDigDigCore.rewardFor(place,diff));assert.equal(global.awards.length,before+1);assert.equal(global.awards.at(-1).coins,res.reward);assert.equal(global.awards.at(-1).gameId,'digDigDig');const games=global.state.arcade.digDigDig.gamesPlayed;game.finishRound(clock);game.finishRound(clock);assert.equal(global.awards.length,before+1,'finish is exactly once');assert.equal(global.state.arcade.digDigDig.gamesPlayed,games,'stats mutate exactly once');if(playerFinished)assert.ok(res.playerTimeMs!==null);return res;}

clock=40000;start('hard');finishPlayer();let r1=finalizeExpected(1,'hard');assert.equal(global.state.arcade.digDigDig.wins,1);assert.equal(global.state.arcade.digDigDig.podiums,1);assert.equal(global.state.arcade.digDigDig.winsByDifficulty.hard,1);assert.equal(global.state.arcade.digDigDig.bestTimeMs,r1.playerTimeMs);

clock=50000;start('normal');assert.ok(waitForCpuFinished(1),'deterministic CPU run reaches exactly one finisher window');clock+=1;finishPlayer();finalizeExpected(2,'normal');assert.equal(global.state.arcade.digDigDig.wins,1);assert.equal(global.state.arcade.digDigDig.podiums,2);

clock=80000;start('normal');assert.ok(waitForCpuFinished(2),'deterministic CPU run reaches exactly two finisher window');clock+=1;finishPlayer();finalizeExpected(3,'normal');assert.equal(global.state.arcade.digDigDig.podiums,3);

const bestBeforeUnfinished=global.state.arcade.digDigDig.bestTimeMs;clock=110000;start('easy');for(let step=0;step<5000&&game.snapshot().phase!=='finished';step++)tick(clock+10);let last=game.snapshot();if(last.phase!=='finished')game.finishRound(clock);const r4=game.snapshot().finalResult;assert.equal(r4.place,4);assert.equal(r4.playerTimeMs,null,'unfinished progress-ranked player has no fabricated time');assert.equal(global.state.arcade.digDigDig.bestTimeMs,bestBeforeUnfinished,'unfinished placement does not change best time');assert.equal(global.state.arcade.custom,'keep');
assert.equal(global.state.arcade.digDigDig.gamesPlayed,4);assert.equal(global.state.arcade.digDigDig.wins,1);assert.equal(global.state.arcade.digDigDig.podiums,3);assert.equal(global.state.arcade.digDigDig.winsByDifficulty.normal,0);assert.equal(global.state.arcade.digDigDig.winsByDifficulty.easy,0);
console.log('PASS v0.36.0 Dig lifecycle full-race timing, placement rewards, persistence and exactly-once completion');
