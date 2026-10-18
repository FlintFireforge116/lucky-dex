const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);
function fresh(n){const p=asset(n);delete require.cache[require.resolve(p)];return require(p);}
function setup(){
  global.LuckyDexGoldenrodCore=fresh('arcade-goldenrod-core.js');
  global.LuckyDexArcadeSpecialStats=fresh('arcade-special-stats.js');
  global.LuckyDexTargetRangeCore=fresh('arcade-target-range-core.js');
  global.LuckyDexDashConfig={themeFor:k=>({key:k})};
  global.LuckyDexPowerTrialCore={divisionProfile:()=>({})};
  global.LuckyDexImpactTrialCore={divisionProfile:()=>({})};
  const byId={
    1:{id:1,name:'Bulbasaur',types:['grass','poison'],baseStats:{speed:45,attack:49,defense:49}},
    4:{id:4,name:'Charmander',types:['fire'],baseStats:{speed:65,attack:52,defense:43}},
    37:{id:37,name:'Vulpix',types:['fire'],baseStats:{speed:65,attack:41,defense:40}},
    63:{id:63,name:'Abra',types:['psychic'],baseStats:{speed:90,attack:20,defense:15}},
    65:{id:65,name:'Alakazam',types:['psychic'],baseStats:{speed:120,attack:50,defense:45}},
    92:{id:92,name:'Gastly',types:['ghost','poison'],baseStats:{speed:80,attack:35,defense:30}},
    100:{id:100,name:'Voltorb',types:['electric'],baseStats:{speed:100,attack:30,defense:50}},
    120:{id:120,name:'Staryu',types:['water'],baseStats:{speed:85,attack:45,defense:55}},
    123:{id:123,name:'Scyther',types:['bug','flying'],baseStats:{speed:105,attack:110,defense:80}}
  };
  global.LuckyDexAdventureSpecies={byId,fallback:{baseStats:{speed:60,attack:60,defense:60}}};
  global.LuckyDexArcadePlatform={challengeParticipants:()=>[
    {key:'caught:1',id:1,name:'Bulbasaur',types:['grass','poison'],baseStat:999,image:'1.png'},
    {key:'caught:65',id:65,name:'Alakazam',types:['psychic'],baseStat:999,image:'65.png'}
  ],dashRacers:()=>[]};
  return fresh('arcade-goldenrod-adapters.js');
}

test('canonical bundled Special Attack values are available locally',()=>{
  const s=fresh('arcade-special-stats.js');
  assert.equal(s.spAtk(1),65);
  assert.equal(s.spAtk(65),135);
  assert.equal(s.spAtk(25),50);
});

test('Target Range adapter uses canonical Special Attack instead of generic platform fallback',()=>{
  const A=setup(),adapter=A.get('targetRange');
  assert.deepEqual(A.EVENT_IDS,['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition']);
  assert.equal(adapter.statKey,'spAtk');
  const rows=adapter.participants();
  assert.equal(rows.find(r=>r.id===1).baseStat,65);
  assert.equal(rows.find(r=>r.id===65).baseStat,135);
});

test('Target Range AI selection obeys type and Special Attack division caps',()=>{
  const A=setup(),adapter=A.get('targetRange');
  const rookie=adapter.selectAi({divisionId:'rookie',type:'fire',player:{id:999,key:'p'},seed:22,count:5});
  assert.ok(rookie.every(r=>r.types.includes('fire')));
  assert.ok(rookie.every(r=>r.baseStat<=59));
  const master=adapter.selectAi({divisionId:'master',type:'psychic',player:{id:1,key:'p'},seed:22,count:5});
  assert.ok(master.some(r=>r.id===65));
});

test('Target Range AI scoring is seeded, higher-is-better and retains overlap/variance',()=>{
  const A=setup(),adapter=A.get('targetRange');
  const entrant={key:'species:65',id:65,name:'Alakazam',baseStat:135,types:['psychic']};
  const p=adapter.createAiProfile({entrant,divisionId:'master',seed:8});
  const a=adapter.simulateAiRound({entrant,profile:p,divisionId:'master',roundIndex:2,seed:99});
  const b=adapter.simulateAiRound({entrant,profile:p,divisionId:'master',roundIndex:2,seed:99});
  const c=adapter.simulateAiRound({entrant,profile:p,divisionId:'master',roundIndex:2,seed:100});
  assert.deepEqual(a,b);assert.notEqual(a.metric,c.metric);assert.equal(adapter.metricDirection,'higher');
  assert.ok(a.metric>0&&a.metric<500);
  assert.equal(adapter.roundConfig({divisionId:'great',roundIndex:1}).profile.roundName,'MOVING RANGE');
});
