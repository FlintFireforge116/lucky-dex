'use strict';
const assert=require('node:assert/strict');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  global.state={arcade:{customMarker:'keep-me',bestBerryPicker:{easy:9}},inventory:{}};
  global.saveCount=0;global.save=()=>{global.saveCount++};
  global.coinAwards=[];global.awardArcadeCoins=(coins,label,gameId)=>{global.coinAwards.push({coins,label,gameId});return coins};
  delete require.cache[require.resolve('../app/src/main/assets/arcade-platform.js')];
  const platform=require('../app/src/main/assets/arcade-platform.js');
  const migrated=platform.ensureArcadeState(global.state.arcade);
  assert.equal(migrated.customMarker,'keep-me','migration preserves unrelated arcade state');
  assert.equal(migrated.bestBerryPicker.easy,9,'migration preserves existing nested state');
  assert.deepEqual(migrated.ekansHoop,{gamesPlayed:0,wins:0,bestScore:0,bestStreak:0,totalHoops:0,shinyHits:0},'migration supplies solo Ekans defaults');
  global.state.arcade=migrated;global.LuckyDexArcadePlatform=platform;

  global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
  delete require.cache[require.resolve('../app/src/main/assets/arcade-session.js')];
  global.LuckyDexArcadeSession=require('../app/src/main/assets/arcade-session.js');
  delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
  const game=require('../app/src/main/assets/arcade-ekans-hoop.js');

  game.startRound({countdownMs:450});await sleep(25);game.pause();
  const countdownPaused=game.snapshot().countdownRemainingMs;await sleep(90);
  assert.ok(Math.abs(game.snapshot().countdownRemainingMs-countdownPaused)<=2,'paused countdown does not advance');
  game.resume();await sleep(35);assert.ok(game.snapshot().countdownRemainingMs<countdownPaused,'countdown continues only after explicit resume');

  game.startRound({countdownMs:0});await sleep(30);game.pause();
  const roundPaused=game.snapshot().remainingMs;await sleep(90);
  assert.ok(Math.abs(game.snapshot().remainingMs-roundPaused)<=2,'paused round timer is frozen');
  game.resume();await sleep(35);assert.ok(game.snapshot().remainingMs<roundPaused,'round timer advances after resume');

  game.startRound({countdownMs:0});assert.equal(game.throwNow(),true);game.pause();
  assert.equal(game.snapshot().playerAirborne,true);await sleep(450);
  assert.equal(game.snapshot().playerAirborne,true,'airborne throw stays unresolved while paused');
  game.resume();await sleep(430);assert.equal(game.snapshot().playerAirborne,false,'same throw resolves once after resume');

  const beforeAwards=global.coinAwards.length,beforeGames=global.state.arcade.ekansHoop.gamesPlayed;
  game.startRound({countdownMs:0});game.close();await sleep(20);
  assert.equal(global.coinAwards.length,beforeAwards,'abandoned round does not award');
  assert.equal(global.state.arcade.ekansHoop.gamesPlayed,beforeGames,'abandoned round is not recorded complete');

  game.startRound({countdownMs:0});const result=game.finishRound();
  assert.equal(result.score,0);assert.equal(result.tier,'Participation');
  assert.equal(global.state.arcade.ekansHoop.gamesPlayed,beforeGames+1);
  assert.equal(global.state.arcade.ekansHoop.wins,0,'legacy wins are no longer changed');
  assert.equal(global.coinAwards.at(-1).coins,30,'participation reward is 30');
  assert.equal(global.coinAwards.at(-1).gameId,'ekansHoop');
  const awardsAfterFinish=global.coinAwards.length;
  game.finishRound();game.finishRound();
  assert.equal(global.coinAwards.length,awardsAfterFinish,'completion/reward is exactly once');
  assert.equal(global.state.arcade.ekansHoop.gamesPlayed,beforeGames+1,'completion stats are exactly once');
  game.close();
  console.log('PASS Ekans lifecycle, persistence and rewards regression');
})().catch(e=>{console.error(e);process.exitCode=1});
