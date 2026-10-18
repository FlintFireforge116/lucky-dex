const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const memory=require(path.join(root,'app/src/main/assets/clefairy-memory.js'));
const scene=require(path.join(root,'app/src/main/assets/clefairy-scene.js'));
const memorySource=fs.readFileSync(path.join(root,'app/src/main/assets/clefairy-memory.js'),'utf8');

assert.equal(typeof memory.rewardForRound,'function','Clefairy reward curve must be testable');
const bank=n=>Array.from({length:n},(_,i)=>memory.rewardForRound(i+1)).reduce((a,b)=>a+b,0);
assert.ok(memory.rewardForRound(1)<=10,'round-one payout must stay low enough to stop single-turn farming');
assert.ok(memory.rewardForRound(6)>memory.rewardForRound(1)*3,'later rounds should scale above the opening payout');
assert.ok(bank(6)<150,`round-6 bank should remain substantially below the old 930-coin pace, got ${bank(6)}`);

assert.doesNotMatch(memorySource,/memorySequenceTrack|insertAdjacentHTML\([^\n]*SYMBOLS|❌/,'move-history emoticons should be removed from the Clefairy game');
assert.equal(typeof scene.poseSourceFor,'function','pose source mapping must be testable');
assert.equal(scene.poseSourceFor('star'),'clefairy_pose_star.png','Star should keep its dedicated cleaned pose');
assert.equal(scene.poseSourceFor('moon'),'clefairy_pose_moon.png','Moon should keep its dedicated cleaned pose');
assert.equal(scene.durationFor('star'),968,'pacing must stay as approved in v0.28.3');
assert.equal(scene.durationFor('moon'),1065,'pacing must stay as approved in v0.28.3');

console.log('PASS v0.28.7 Clefairy polish contract');
