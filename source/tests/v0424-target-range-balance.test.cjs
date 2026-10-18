'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);
function fresh(n){const p=asset(n);delete require.cache[require.resolve(p)];return require(p);}
function setup(){
  global.LuckyDexGoldenrodCore=fresh('arcade-goldenrod-core.js');
  global.LuckyDexArcadeSpecialStats={spAtk:()=>60};
  global.LuckyDexTargetRangeCore=fresh('arcade-target-range-core.js');
  global.LuckyDexDashConfig={themeFor:k=>({key:k})};
  global.LuckyDexPowerTrialCore={divisionProfile:()=>({})};
  global.LuckyDexImpactTrialCore={divisionProfile:()=>({})};
  global.LuckyDexAdventureSpecies={byId:{},fallback:{baseStats:{speed:60,attack:60,defense:60}}};
  global.LuckyDexArcadePlatform={challengeParticipants:()=>[],dashRacers:()=>[]};
  return fresh('arcade-goldenrod-adapters.js');
}
function percentile(values,p){const a=[...values].sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)];}
function rookieField(adapter,seed,roundIndex=0){
  return [35,40,45,50,55].map((baseStat,i)=>{
    const entrant={key:`rookie-${i}`,id:i+1,baseStat};
    const profile=adapter.createAiProfile({entrant,divisionId:'rookie',seed:seed*31+i});
    return adapter.simulateAiRound({entrant,profile,divisionId:'rookie',roundIndex,seed:seed*71+i}).metric;
  }).sort((a,b)=>b-a);
}

test('Rookie Target Range AI sits in a forgiving but competitive score band',()=>{
  const adapter=setup().get('targetRange'),scores=[];
  for(const baseStat of [25,35,45,55])for(let seed=1;seed<=100;seed++){
    const entrant={key:`${baseStat}:${seed}`,baseStat};
    const profile=adapter.createAiProfile({entrant,divisionId:'rookie',seed});
    scores.push(adapter.simulateAiRound({entrant,profile,divisionId:'rookie',roundIndex:0,seed}).metric);
  }
  assert.ok(percentile(scores,.5)>=60&&percentile(scores,.5)<=75,'median Rookie AI should be around a solid, non-perfect player round');
  assert.ok(percentile(scores,.75)<=80,'upper quartile should not require bullseye-heavy play');
  assert.ok(percentile(scores,.9)<=86,'most Rookie opponents should stay below strong-player territory');
  assert.ok(Math.max(...scores)>90&&Math.max(...scores)<105,'rare standout Rookie rounds should still be able to threaten first place');
});

test('a decent Rookie round usually podiums while a strong round usually wins but is not guaranteed',()=>{
  const adapter=setup().get('targetRange');
  let podium75=0,wins90=0;const samples=1000;
  for(let seed=1;seed<=samples;seed++){
    const scores=rookieField(adapter,seed,0);
    if(75>=scores[2])podium75++;
    if(90>scores[0])wins90++;
  }
  const podiumRate=podium75/samples,winRate=wins90/samples;
  assert.ok(podiumRate>=.65&&podiumRate<=.90,`75-point podium rate ${podiumRate}`);
  assert.ok(winRate>=.80&&winRate<.99,`90-point win rate ${winRate}`);
});

test('Target Range AI still ramps clearly through all five divisions',()=>{
  const adapter=setup().get('targetRange');
  const bands={rookie:[25,35,45,55],poke:[55,65,75,85],great:[85,95,105,115],ultra:[115,125,135,145],master:[120,140,160,180]};
  const medians={};
  for(const [divisionId,stats] of Object.entries(bands)){
    const scores=[];
    for(const baseStat of stats)for(let seed=1;seed<=80;seed++){
      const entrant={key:`${divisionId}:${baseStat}:${seed}`,baseStat};
      const profile=adapter.createAiProfile({entrant,divisionId,seed});
      scores.push(adapter.simulateAiRound({entrant,profile,divisionId,roundIndex:0,seed}).metric);
    }
    medians[divisionId]=percentile(scores,.5);
  }
  assert.ok(medians.poke>=medians.rookie+18);
  assert.ok(medians.great>=medians.poke+22);
  assert.ok(medians.ultra>=medians.great+22);
  assert.ok(medians.master>=medians.ultra+20);
});

test('Target Range round escalation is modest because later rounds already contain more targets',()=>{
  const adapter=setup().get('targetRange'),entrant={key:'rookie-test',baseStat:50};
  const profile=adapter.createAiProfile({entrant,divisionId:'rookie',seed:77});
  const a=adapter.simulateAiRound({entrant,profile,divisionId:'rookie',roundIndex:0,seed:91}).metric;
  const b=adapter.simulateAiRound({entrant,profile,divisionId:'rookie',roundIndex:2,seed:91}).metric;
  assert.ok(b>a&&b-a<=10,`round escalation was ${b-a}`);
});
