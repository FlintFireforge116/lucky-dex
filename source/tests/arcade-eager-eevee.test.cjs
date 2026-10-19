'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const corePath=path.join(__dirname,'../app/src/main/assets/arcade-eager-eevee-core.js');
assert.ok(fs.existsSync(corePath),'Eager Eevee core module must exist');
const core=require(corePath);
assert.ok(!fs.readFileSync(corePath,'utf8').toLowerCase().includes('feint'),'Eager Eevee core should contain no remaining Feint state or logic');

assert.equal(core.CONFIG.rounds,10,'Eager Eevee should play ten quick rounds');
assert.deepEqual(core.PERSONALITIES.map(x=>x.key).sort(),['aggressive','cautious','chaotic'],'CPU personality pool should contain three distinct behaviours');

{
  const game=core.createGame({difficulty:'normal',rng:core.seededRng(7),nowMs:0});
  const cpuPersonalities=game.players.slice(1).map(p=>p.personality);
  assert.equal(new Set(cpuPersonalities).size,3,'CPU personalities should be shuffled across slots without duplicates');
  assert.ok(cpuPersonalities.some((p,i)=>p!==core.PERSONALITIES[i]?.key),'personality assignment should not be permanently tied to CPU slot');
}

{
  const game=core.createGame({difficulty:'normal',rng:core.seededRng(3),nowMs:0});
  core.startGame(game,1000);
  core.forceReveal(game,{kind:'fruit',key:'oranBerry'},2000);
  const result=core.dash(game,'player',2050);
  assert.equal(result.accepted,true,'A after reveal should commit the player to the fruit');
  assert.equal(result.claimed,true,'first valid dash should claim fruit');
  assert.equal(game.player.score,1);
}

{
  const game=core.createGame({difficulty:'normal',rng:core.seededRng(4),nowMs:0});
  core.startGame(game,1000);
  core.forceReveal(game,{kind:'pineco',key:'pineco'},2000);
  const result=core.dash(game,'player',2040);
  assert.equal(result.pineco,true,'dashing at Pineco should trigger the punishment');
  assert.equal(game.player.skipNext,true,'Pineco should force that Eevee to miss the following round');
  core.startNextRound(game,3000,core.seededRng(11));
  assert.equal(game.player.sittingOut,true,'Pineco victim should actually sit out the next round');
}

{
  assert.equal(core.feint,undefined,'Eager Eevee should be A-only: no Feint action should remain');
  assert.equal(core.reactCpusToFeint,undefined,'CPU feint/bait logic should be removed with the B action');
  assert.ok(core.DIFFICULTIES.normal.reactionMs>=550,'Normal should give a meaningfully human reaction window');
  assert.ok(core.DIFFICULTIES.easy.reactionMs-core.DIFFICULTIES.normal.reactionMs>=200,'Easy should remain clearly slower than Normal');
  assert.ok(core.DIFFICULTIES.normal.reactionMs-core.DIFFICULTIES.hard.reactionMs>=250,'Normal should be clearly separated from Hard');
}

console.log('arcade-eager-eevee core tests passed');


{
  const rng=()=>0.5;
  const game=core.createGame({difficulty:'easy',rng,nowMs:0});
  core.startGame(game,1000,rng);
  core.forceReveal(game,{kind:'fruit',key:'oranBerry'},2000,rng);
  core.advanceGame(game,2640,rng);
  assert.equal(game.round.claimedBy,null,'Easy CPUs should give the player noticeably longer than half a second before claiming fruit');
}
