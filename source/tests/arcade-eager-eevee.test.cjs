'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const corePath=path.join(__dirname,'../app/src/main/assets/arcade-eager-eevee-core.js');
assert.ok(fs.existsSync(corePath),'Eager Eevee core module must exist');
const core=require(corePath);

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
  const game=core.createGame({difficulty:'normal',rng:core.seededRng(5),nowMs:0});
  core.startGame(game,1000);
  const before=game.players.slice(1).map(p=>p.falseStarts);
  core.feint(game,'cpu1',1300,core.seededRng(1));
  core.reactCpusToFeint(game,'cpu1',1320,()=>0);
  const after=game.players.slice(1).map(p=>p.falseStarts);
  assert.ok(after.some((v,i)=>i!==0&&v>before[i]),'a CPU feint should be able to bait another CPU, not just the human player');
}

console.log('arcade-eager-eevee core tests passed');
