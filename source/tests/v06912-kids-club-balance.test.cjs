'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const eager=require('../app/src/main/assets/arcade-eager-eevee-core.js');
const delivery=require('../app/src/main/assets/arcade-delibird-delivery-core.js');
const eggView=fs.readFileSync(path.join(ROOT,'app/src/main/assets/arcade-egg-emergency.js'),'utf8');
const eggCss=fs.readFileSync(path.join(ROOT,'app/src/main/assets/arcade-egg-emergency.css'),'utf8');

function lcg(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/0x100000000);}
function dist(a,b){return Math.hypot(Number(a.x||0)-Number(b.x||0),Number(a.y||0)-Number(b.y||0));}

function deliveryHumanRun(difficulty,seed){
  const rng=lcg(seed),game=delivery.createGame({difficulty,rng,nowMs:0});
  delivery.startGame(game,0);
  let nextDecision=0;
  for(let t=40;t<=delivery.CONFIG.durationMs;t+=40){
    const p=game.player;
    if(t>=nextDecision){
      nextDecision=t+320;
      const carriedValue=p.carried.reduce((n,g)=>n+Number(g.points||0),0);
      let target=null;
      if(p.carried.length&&(p.carried.length>=3||carriedValue>=850))target={x:p.homeX,y:delivery.CONFIG.homeY};
      else{
        let bestScore=-Infinity;
        for(const g of game.gifts){
          const score=(Number(g.points||0)+70)/Math.max(3,dist(p,g));
          if(score>bestScore){bestScore=score;target=g;}
        }
      }
      target=target||{x:p.homeX,y:75};
      const dx=target.x-p.x,dy=target.y-p.y,mag=Math.hypot(dx,dy)||1;
      delivery.setInput(p,dx/mag,dy/mag);
    }
    delivery.advanceGame(game,t,rng);
  }
  return delivery.placeFor(game,'player');
}

test('Eager Eevee Hard never asks the player to beat a sub-300ms CPU reaction',()=>{
  const game=eager.createGame({difficulty:'hard',rng:eager.seededRng(17),nowMs:0});
  eager.startGame(game,1000,eager.seededRng(18));
  eager.forceReveal(game,{kind:'fruit',key:'oranBerry'},2000,()=>0);
  const fastest=Math.min(...game.players.slice(1).map(p=>p.nextActionAt-2000));
  assert.ok(fastest>=300,`fastest Hard CPU reaction was ${fastest}ms`);
  assert.ok(eager.DIFFICULTIES.hard.reactionMs<eager.DIFFICULTIES.normal.reactionMs,'Hard must still react faster than Normal');
});

test('Delibird Delivery leaves a realistic opening for a competent mobile player',()=>{
  const runs=160;
  const rates={};
  for(const [difficulty,base] of [['easy',7100],['normal',8100],['hard',9100]]){
    let wins=0,podiums=0;
    for(let i=0;i<runs;i++){
      const place=deliveryHumanRun(difficulty,base+i);
      if(place===1)wins++;
      if(place<=3)podiums++;
    }
    rates[difficulty]={wins:wins/runs,podiums:podiums/runs};
  }
  assert.ok(rates.easy.wins>=.55,`Easy win rate too low: ${JSON.stringify(rates)}`);
  assert.ok(rates.normal.wins>=.30,`Normal win rate too low: ${JSON.stringify(rates)}`);
  assert.ok(rates.hard.wins>=.08,`Hard should be difficult but beatable: ${JSON.stringify(rates)}`);
  assert.ok(rates.easy.wins>rates.normal.wins&&rates.normal.wins>rates.hard.wins,`difficulty ordering collapsed: ${JSON.stringify(rates)}`);
});

test('Egg Emergency uses the Stadium 2 plain white egg instead of the spotted breeding Egg',()=>{
  assert.doesNotMatch(eggView,/egg-gen2\.png/,'the yellow spotted breeding Egg must not be rendered');
  assert.match(eggView,/egg-emergency-plain-egg/,'Egg drops should render the Stadium-style plain Egg');
  assert.match(eggCss,/\.egg-emergency-plain-egg\s*\{/,'plain Egg needs a dedicated visual');
});
