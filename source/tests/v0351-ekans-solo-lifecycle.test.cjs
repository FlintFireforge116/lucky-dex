'use strict';
const assert=require('node:assert/strict');
(async()=>{
  global.state={arcade:{ekansHoop:{gamesPlayed:4,wins:2,bestScore:12},customMarker:'keep-me'},inventory:{}};
  global.saveCount=0;global.save=()=>{global.saveCount++};
  global.coinAwards=[];global.awardArcadeCoins=(coins,label,gameId)=>{global.coinAwards.push({coins,label,gameId});return coins};
  delete require.cache[require.resolve('../app/src/main/assets/arcade-platform.js')];
  const platform=require('../app/src/main/assets/arcade-platform.js');
  const migrated=platform.ensureArcadeState(global.state.arcade);
  assert.equal(migrated.customMarker,'keep-me');
  assert.equal(migrated.ekansHoop.gamesPlayed,4);
  assert.equal(migrated.ekansHoop.wins,2,'legacy wins are preserved without being used by solo scoring');
  assert.equal(migrated.ekansHoop.bestScore,12);
  assert.equal(migrated.ekansHoop.bestStreak,0);
  assert.equal(migrated.ekansHoop.totalHoops,0);
  assert.equal(migrated.ekansHoop.shinyHits,0);
  global.state.arcade=migrated;global.LuckyDexArcadePlatform=platform;

  global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
  delete require.cache[require.resolve('../app/src/main/assets/arcade-session.js')];
  global.LuckyDexArcadeSession=require('../app/src/main/assets/arcade-session.js');
  delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
  const game=require('../app/src/main/assets/arcade-ekans-hoop.js');

  game.startRound({countdownMs:0});
  const result=game.finishRound();
  assert.equal(result.score,0);
  assert.equal(result.tier,'Participation');
  assert.equal(global.state.arcade.ekansHoop.gamesPlayed,5);
  assert.equal(global.state.arcade.ekansHoop.wins,2,'solo completion does not change the legacy wins field');
  assert.equal(global.coinAwards.at(-1).coins,30);
  assert.equal(global.coinAwards.at(-1).gameId,'ekansHoop');
  const awards=global.coinAwards.length;
  game.finishRound();game.finishRound();
  assert.equal(global.coinAwards.length,awards,'completion/reward remains exactly once');
  assert.equal(global.state.arcade.ekansHoop.gamesPlayed,5);
  game.close();
  console.log('PASS v0.35.1 Ekans solo lifecycle, migration and rewards');
})().catch(e=>{console.error(e);process.exitCode=1});
