const assert=require('assert');
const core=require('../app/src/main/assets/arcade-magikarp-splash-core.js');

function rngFor(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function simulate(seed,difficulty,mutatePlayer=false){
  const rng=rngFor(seed),r=core.createRound({difficulty,rng,nowMs:0});
  if(mutatePlayer){r.player.score=99;r.player.quickChain=42;r.player.phase='landing';r.player.recoveryUntil=999999;}
  for(let t=0;t<=23000&&!r.finalized;t+=16)core.advanceRound(r,t,rng);
  return r;
}
for(const difficulty of ['easy','normal','hard']){
  const a=simulate(77,difficulty),b=simulate(77,difficulty);
  assert.deepStrictEqual(a.racers.slice(1).map(x=>[x.score,x.quickChain,x.bestQuickChain]),b.racers.slice(1).map(x=>[x.score,x.quickChain,x.bestQuickChain]),`${difficulty} CPU must be seeded/repeatable`);
  const c=simulate(77,difficulty,true);
  assert.deepStrictEqual(a.racers.slice(1).map(x=>[x.score,x.quickChain,x.bestQuickChain]),c.racers.slice(1).map(x=>[x.score,x.quickChain,x.bestQuickChain]),`${difficulty} CPU must ignore player state`);
}

const cutoff=core.createRound({difficulty:'normal',rng:rngFor(1),nowMs:0});
assert.strictEqual(core.pressPlayer(cutoff,20000).accepted,false,'grounded player launch at cutoff is rejected');
const finalJump=core.createRound({difficulty:'normal',rng:rngFor(2),nowMs:0});
core.pressPlayer(finalJump,19850);
core.advanceRound(finalJump,19990,rngFor(3));
core.releasePlayer(finalJump,20020);
core.advanceRound(finalJump,20200,rngFor(3));
assert.strictEqual(finalJump.finalized,false,'already airborne final jump must resolve before finalizing');
assert.strictEqual(finalJump.player.score,1,'already-started jump may score after cutoff');
core.advanceRound(finalJump,21000,rngFor(3));
assert.strictEqual(finalJump.finalized,true,'round finalizes after final airborne jumps resolve');

function median(vals){const a=[...vals].sort((x,y)=>x-y);return a[Math.floor(a.length/2)];}
function distribution(difficulty){const vals=[];for(let seed=1;seed<=200;seed++)vals.push(simulate(seed,difficulty).racers[1].score);return vals;}
const bands={
  easy:{lo:12,hi:18,medLo:14,medHi:16},
  normal:{lo:19,hi:24,medLo:20,medHi:23},
  hard:{lo:25,hi:31,medLo:27,medHi:30}
};
for(const [difficulty,b] of Object.entries(bands)){
  const vals=distribution(difficulty),inside=vals.filter(v=>v>=b.lo&&v<=b.hi).length/vals.length,med=median(vals);
  assert.ok(inside>=.70,`${difficulty} common band only ${(inside*100).toFixed(1)}%: ${Math.min(...vals)}-${Math.max(...vals)} med ${med}`);
  assert.ok(med>=b.medLo&&med<=b.medHi,`${difficulty} median ${med} outside ${b.medLo}-${b.medHi}`);
  assert.ok(new Set(vals).size>=4,`${difficulty} scores should vary naturally, got ${[...new Set(vals)]}`);
}
const hardVals=distribution('hard');
assert.ok(hardVals.some(v=>v===30||v===31),`hard should occasionally reach 30/31, got max ${Math.max(...hardVals)}`);
assert.ok(distribution('easy').some(v=>v<12||v>18),'easy should not be hard-clamped to common band');
assert.ok(distribution('normal').some(v=>v<19||v>24),'normal should not be hard-clamped to common band');

console.log('v0.37.0 Magikarp CPU/cutoff tests passed');
