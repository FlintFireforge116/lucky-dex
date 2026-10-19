'use strict';
const assert=require('assert');
const core=require('../app/src/main/assets/arcade-eager-eevee-core.js');

const means={};
for(const [difficulty,seedBase] of [['easy',100],['normal',1000],['hard',2000]]){
  let cpuScore=0,totalGames=0,totalPineco=0;
  for(let run=0;run<120;run++){
    const rng=core.seededRng(seedBase+run);
    const game=core.createGame({difficulty,rng,nowMs:0});
    core.startGame(game,1000,rng);
    let t=1000,guard=0;
    while(!game.finalized&&guard++<5000){
      t+=40;
      // Human reacts with variable delay and occasionally feints before the reveal.
      const r=game.round;
      if(r?.state==='hidden'&&!game.player.sittingOut&&!game.player.lockedRound&&t-r.startAt>500&&rng()<.003)core.feint(game,'player',t,rng);
      if(r?.state==='revealed'&&!r.claimedBy&&!game.player.sittingOut&&!game.player.lockedRound&&t-r.revealAt>300+rng()*260)core.dash(game,'player',t);
      core.advanceGame(game,t,rng);
    }
    assert.equal(game.finalized,true,`${difficulty} simulation ${run} should finish all rounds`);
    assert.equal(game.roundIndex,core.CONFIG.rounds-1,'final match should reach round ten');
    assert.equal(core.rankGame(game).length,4);
    for(const p of game.players){
      assert.ok(p.score>=0&&p.score<=core.CONFIG.rounds,'score must stay within the round count');
      assert.ok(p.pinecoHits>=0,'Pineco count cannot be negative');
      totalPineco+=p.pinecoHits;
    }
    cpuScore+=game.players.slice(1).reduce((n,p)=>n+p.score,0)/3;
    totalGames++;
  }
  means[difficulty]=cpuScore/totalGames;
}
assert.ok(means.hard>=means.normal,`Hard CPUs should not score worse than Normal on average: ${JSON.stringify(means)}`);
assert.ok(means.normal>=means.easy,`Normal CPUs should not score worse than Easy on average: ${JSON.stringify(means)}`);
console.log('arcade-eager-eevee simulation tests passed',JSON.stringify(means));
