'use strict';
const assert=require('node:assert/strict');
global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
const game=require('../app/src/main/assets/arcade-ekans-hoop.js');

assert.equal(typeof game.open,'function');
assert.equal(typeof game.close,'function');
assert.equal(typeof game.pause,'function');
assert.equal(typeof game.resume,'function');
assert.equal(typeof game.startRound,'function');
assert.equal(typeof game.snapshot,'function');

game.open();
let snap=game.snapshot();
assert.equal(snap.remainingMs,60000);
assert.equal(snap.score,0);
assert.equal(snap.phase,'idle','v0.35.7+ opens on the deliberate START screen');
assert.equal(snap.targets.length,0,'no live targets spawn before START');

game.startRound({countdownMs:0});
snap=game.snapshot();
assert.equal(snap.phase,'playing');
assert.equal(snap.remainingMs,60000);
assert.equal(snap.score,0);
assert.equal(snap.streak,0);
assert.ok(snap.targets.length>=1&&snap.targets.length<=2);

game.close();
snap=game.snapshot();
assert.equal(snap.phase,'closed');
assert.equal(snap.targets.length,0);
console.log('PASS Ekans runtime ownership regression');
