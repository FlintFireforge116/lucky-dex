const assert=require('node:assert/strict');
const game=require('../app/src/main/assets/clefairy-memory.js');
const expected=[8,11,14,18,24,32,42,56,74,97];
assert.deepEqual(expected.map((_,i)=>game.rewardForRound(i+1)),expected,'early reward curve changed unexpectedly');
assert.equal(game.rewardForRound(1),8,'round-one farming must be heavily reduced');
assert.ok(game.rewardForRound(10)>game.rewardForRound(5)*3,'later streaks should still scale meaningfully');
console.log('PASS v0.28.7 Clefairy reward curve');
