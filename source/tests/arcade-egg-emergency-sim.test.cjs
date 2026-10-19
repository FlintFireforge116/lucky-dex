'use strict';
const assert=require('assert');
const core=require('../app/src/main/assets/arcade-egg-emergency-core.js');

function lcg(seed){let s=seed>>>0;return()=>((s=(Math.imul(1664525,s)+1013904223)>>>0)/0x100000000);}

const means={};
for(const [d,baseSeed] of [['easy',1100],['normal',2200],['hard',3300]]){
  let cpuTotal=0,playerTotal=0;
  const games=180;
  for(let run=0;run<games;run++){
    const rng=lcg(baseSeed+run);
    const game=core.createGame({difficulty:d,rng,nowMs:100});
    core.startGame(game,1000);
    const finishAt=1000+core.matchDurationMs()+50;
    for(let t=1000;t<finishAt;t+=100){
      // Stress player input across all three positions while the CPU handles its own decisions.
      core.setLean(game.player,core.LANES[Math.floor(rng()*core.LANES.length)]);
      core.advanceGame(game,t,rng);
    }
    core.advanceGame(game,finishAt,rng);
    assert.equal(game.finalized,true,`${d} simulation ${run} should finish`);
    assert.equal(game.eggsResolved,100,`${d} simulation ${run} must resolve all 100 Eggs`);
    assert.equal(game.hazardsResolved,12,`${d} simulation ${run} must resolve all 12 Voltorb`);
    assert.equal(core.rankGame(game).length,4);
    for(const p of game.players){
      assert.ok(p.eggsCaught>=0&&p.eggsCaught<=100,'Egg score must remain within 0..100');
      assert.ok(p.eggsMissed>=0&&p.eggsMissed<=100,'miss count must remain within 0..100');
      assert.ok(p.voltorbsCaught>=0&&p.voltorbsCaught<=12,'Voltorb count must remain within 0..12');
    }
    playerTotal+=game.player.eggsCaught;
    cpuTotal+=game.players.slice(1).reduce((sum,p)=>sum+p.eggsCaught,0)/3;
  }
  means[d]={cpu:cpuTotal/games,player:playerTotal/games};
}

assert.ok(means.hard.cpu>means.normal.cpu,`Hard CPU should outperform Normal on average (${JSON.stringify(means)})`);
assert.ok(means.normal.cpu>means.easy.cpu,`Normal CPU should outperform Easy on average (${JSON.stringify(means)})`);
assert.ok(means.hard.cpu<100,'Hard CPU must remain fallible rather than perfect');
console.log('arcade-egg-emergency simulation tests passed',JSON.stringify(means));
