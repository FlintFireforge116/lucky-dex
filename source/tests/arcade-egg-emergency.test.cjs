'use strict';
const assert=require('assert');
const core=require('../app/src/main/assets/arcade-egg-emergency-core.js');

function seq(values){let i=0;return()=>values[i++%values.length];}

assert.equal(core.CONFIG.eggTarget,100,'Egg Emergency must contain exactly 100 Eggs');
assert.equal(core.CONFIG.voltorbCount,12,'default match should interleave twelve Voltorb hazards');
assert.deepEqual(core.LANES,[-1,0,1],'Chansey must use left / centre / right catch positions');

assert.equal(typeof core.fallDurationFor,'function','Egg Emergency should expose difficulty-specific fall speed');
assert.equal(core.fallDurationFor('easy'),1500,'Easy fall timing should stay unchanged');
assert.equal(core.fallDurationFor('normal'),1500,'Normal fall timing should stay unchanged');
assert.ok(core.fallDurationFor('hard')<=1200,'Hard should make Eggs and Voltorb fall about 25% faster');


{
  const game=core.createGame({difficulty:'normal',rng:seq([0.1,0.5,0.9,0.3,0.7])});
  assert.equal(game.schedule.filter(x=>x.type==='egg').length,100);
  assert.equal(game.schedule.filter(x=>x.type==='voltorb').length,12);
  assert.ok(game.schedule.every(x=>core.LANES.includes(x.lane)),'all drops use the three catch positions');
}

{
  const player=core.createPlayer('player',0,'player');
  core.setLean(player,-1);
  const caught=core.resolveDropForPlayer(player,{type:'egg',lane:-1},1000);
  assert.equal(caught.caught,true);
  assert.equal(player.eggsCaught,1);
  assert.equal(player.eggsMissed,0);
  const missed=core.resolveDropForPlayer(player,{type:'egg',lane:1},1500);
  assert.equal(missed.caught,false);
  assert.equal(player.eggsCaught,1);
  assert.equal(player.eggsMissed,1);
}

{
  const player=core.createPlayer('player',0,'player');
  player.eggsCaught=9;
  core.setLean(player,1);
  const hit=core.resolveDropForPlayer(player,{type:'voltorb',lane:1},2000);
  assert.equal(hit.voltorb,true);
  assert.equal(hit.penalty,5);
  assert.equal(player.eggsCaught,4,'Voltorb must cost five collected Eggs');
  assert.equal(player.voltorbsCaught,1);
  player.eggsCaught=3;
  core.resolveDropForPlayer(player,{type:'voltorb',lane:1},2500);
  assert.equal(player.eggsCaught,0,'Voltorb penalty must not make the score negative');
}

{
  const game={players:[
    {...core.createPlayer('player',0,'player'),eggsCaught:80,voltorbsCaught:1,eggsMissed:20},
    {...core.createPlayer('cpu1',1,'cpu'),eggsCaught:84,voltorbsCaught:2,eggsMissed:16},
    {...core.createPlayer('cpu2',2,'cpu'),eggsCaught:84,voltorbsCaught:1,eggsMissed:16},
    {...core.createPlayer('cpu3',3,'cpu'),eggsCaught:70,voltorbsCaught:0,eggsMissed:30}
  ]};
  const ranked=core.rankGame(game);
  assert.equal(ranked[0].id,'cpu2','ties on Eggs should prefer fewer Voltorb catches');
  assert.equal(core.placeFor(game,'player'),3);
}

{
  const game=core.createGame({difficulty:'hard',rng:()=>0.42,nowMs:100});
  core.startGame(game,1000);
  const before=game.startedAt;
  core.shiftTimestamps(game,750);
  assert.equal(game.startedAt,before+750,'pause migration should preserve relative drop timing');
}

console.log('arcade-egg-emergency core tests passed');
