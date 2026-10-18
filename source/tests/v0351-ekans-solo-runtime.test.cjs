'use strict';
const assert=require('node:assert/strict');
global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
const game=require('../app/src/main/assets/arcade-ekans-hoop.js');

for(const fn of ['open','close','pause','resume','startRound','snapshot','setAim','throwNow','finishRound'])assert.equal(typeof game[fn],'function',`${fn} exported`);

game.startRound({countdownMs:0});
let snap=game.snapshot();
assert.equal(snap.phase,'playing');
assert.equal(snap.remainingMs,60000);
assert.equal(snap.score,0);
assert.equal(snap.streak,0);
assert.equal(snap.bestStreak,0);
assert.equal(snap.shinyHits,0);
assert.equal(snap.totalHoops,0);
assert.ok(snap.targets.length>=1&&snap.targets.length<=2,'solo round begins with a calm target count');
assert.equal(new Set(snap.targets.map(t=>t.socketIndex)).size,snap.targets.length);
assert.equal('scores' in snap,false,'multiplayer score array is removed');

game.setAim(1.42,1.67);
snap=game.snapshot();
assert.ok(Math.abs(snap.aim.lane-1.42)<0.001,'aim keeps continuous horizontal input');
assert.ok(Math.abs(snap.aim.depth-1.67)<0.001,'aim keeps continuous distance input');
assert.equal(game.throwNow(),true);
assert.equal(game.snapshot().playerAirborne,true);

game.close();
snap=game.snapshot();
assert.equal(snap.phase,'closed');
assert.equal(snap.targets.length,0);
console.log('PASS v0.35.1 Ekans solo runtime owner');
