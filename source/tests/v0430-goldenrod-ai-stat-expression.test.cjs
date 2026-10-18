const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const asset=n=>path.join(__dirname,'../app/src/main/assets',n);
function fresh(n){const p=asset(n);delete require.cache[require.resolve(p)];return require(p);}
function setup(){
  global.LuckyDexGoldenrodStatCurve=fresh('arcade-goldenrod-stat-curve.js');
  global.LuckyDexGoldenrodCore=fresh('arcade-goldenrod-core.js');
  global.LuckyDexArcadeSpecialStats={spAtk:()=>60};
  global.LuckyDexTargetRangeCore=fresh('arcade-target-range-core.js');
  global.LuckyDexDashConfig={themeFor:k=>({key:k})};
  global.LuckyDexPowerTrialCore=fresh('arcade-power-trial-core.js');
  global.LuckyDexImpactTrialCore=fresh('arcade-impact-trial-core.js');
  global.LuckyDexAdventureSpecies={byId:{},fallback:{baseStats:{speed:60,attack:60,defense:60}}};
  global.LuckyDexArcadePlatform={challengeParticipants:()=>[],dashRacers:()=>[]};
  return fresh('arcade-goldenrod-adapters.js');
}

test('equal AI execution clearly favours the higher relevant stat in all four events',()=>{
  const A=setup();
  for(const eventId of A.EVENT_IDS){
    const adapter=A.get(eventId),low={key:`${eventId}-low`,baseStat:25},high={key:`${eventId}-high`,baseStat:58};
    const fixed={consistency:.62,risk:.4,mistake:0,peak:.72,variance:0,seed:1};
    const a=adapter.simulateAiRound({entrant:low,profile:fixed,divisionId:'rookie',roundIndex:0,seed:100});
    const b=adapter.simulateAiRound({entrant:high,profile:fixed,divisionId:'rookie',roundIndex:0,seed:100});
    if(adapter.metricDirection==='lower')assert.ok(b.metric<a.metric,`${eventId}: higher stat should be faster`);
    else assert.ok(b.metric>a.metric,`${eventId}: higher stat should score more`);
  }
});

test('AI stat advantage is meaningful inside Rookie rather than cosmetic',()=>{
  const A=setup(),fixed={consistency:.62,risk:.4,mistake:0,peak:.72,variance:0,seed:1};
  const power=A.get('powerTrial');
  const low=power.simulateAiRound({entrant:{key:'l',baseStat:25},profile:fixed,divisionId:'rookie',roundIndex:0,seed:1}).metric;
  const high=power.simulateAiRound({entrant:{key:'h',baseStat:58},profile:fixed,divisionId:'rookie',roundIndex:0,seed:1}).metric;
  assert.ok(high-low>=8);
});
