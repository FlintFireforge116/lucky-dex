'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../app/src/main/assets/arcade-ekans-hoop-core.js');

// Difficulty profiles are intentionally simple and materially different.
assert.deepEqual(Object.keys(core.DIFFICULTIES),['easy','normal','hard']);
assert.equal(core.DIFFICULTIES.easy.durationMs,75000);
assert.equal(core.DIFFICULTIES.normal.durationMs,60000);
assert.equal(core.DIFFICULTIES.hard.durationMs,50000);
assert.ok(core.DIFFICULTIES.easy.targetLifetimeScale>core.DIFFICULTIES.normal.targetLifetimeScale);
assert.ok(core.DIFFICULTIES.hard.targetLifetimeScale<core.DIFFICULTIES.normal.targetLifetimeScale);
assert.equal(core.rewardTier(15,'easy').tier,'Bronze');
assert.equal(core.rewardTier(20,'normal').tier,'Bronze');
assert.equal(core.rewardTier(20,'hard').tier,'Participation');
assert.equal(core.rewardTier(24,'hard').tier,'Bronze');

// Lifetime scaling changes how long targets stay up without changing the normal defaults.
const fixed=values=>{let i=0;return ()=>values[Math.min(i++,values.length-1)];};
function spawnedLifetime(scale){
  const r=core.createRound();
  const t=core.spawnTarget(r,fixed([0.1,0.1,0.5,0.5]),1000,{lifetimeScale:scale});
  return t.expiresAt-t.spawnedAt;
}
const normalLifetime=spawnedLifetime(1);
assert.ok(spawnedLifetime(core.DIFFICULTIES.easy.targetLifetimeScale)>normalLifetime);
assert.ok(spawnedLifetime(core.DIFFICULTIES.hard.targetLifetimeScale)<normalLifetime);

// Opening the game is now a deliberate pre-start state; startRound remains directly callable for tests/tools.
global.LuckyDexEkansHoopCore=core;
delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
const game=require('../app/src/main/assets/arcade-ekans-hoop.js');
assert.equal(typeof game.selectDifficulty,'function');
assert.equal(typeof game.showReady,'function');

game.open();
let snap=game.snapshot();
assert.equal(snap.phase,'idle');
assert.equal(snap.difficulty,'normal');
assert.equal(snap.remainingMs,60000);
assert.equal(snap.targets.length,0,'pre-start screen should not spawn live targets');

assert.equal(game.selectDifficulty('easy'),true);
snap=game.snapshot();
assert.equal(snap.difficulty,'easy');
assert.equal(snap.remainingMs,75000);
game.startRound({countdownMs:0});
snap=game.snapshot();
assert.equal(snap.phase,'playing');
assert.equal(snap.difficulty,'easy');
assert.equal(snap.remainingMs,75000);
assert.ok(snap.targets.length>=1,'targets spawn only after START');
assert.equal(game.selectDifficulty('hard'),false,'difficulty cannot change in the middle of a round');
game.close();

const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
assert.match(html,/id="ekansHoopReady"/);
assert.match(html,/id="ekansHoopStart"/);
assert.match(html,/data-ekans-difficulty="easy"/);
assert.match(html,/data-ekans-difficulty="normal"/);
assert.match(html,/data-ekans-difficulty="hard"/);
assert.match(html,/DIGLETT \+1[^<]*DUGTRIO \+3[^<]*SHINY/i);

const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-ekans-hoop.css'),'utf8');
assert.match(css,/\.ekans-hoop-stage\{[^}]*flex:\s*1/i,'stage should expand to fill the game instead of ending abruptly');
assert.match(css,/\.ekans-hoop-ready\{/,'pre-start controls have a dedicated lower-panel treatment');
assert.match(css,/\.ekans-hoop-difficulty/,'difficulty selector is styled as part of the game panel');

console.log('PASS v0.35.7 Ekans presentation and difficulty');
