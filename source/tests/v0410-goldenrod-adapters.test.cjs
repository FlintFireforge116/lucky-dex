const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('path');
const root=path.resolve(__dirname,'..');
const asset=n=>path.join(root,'app/src/main/assets',n);

function fixture(){
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexDashConfig=require(asset('arcade-dash-config.js'));
  global.LuckyDexPowerTrialCore=require(asset('arcade-power-trial-core.js'));
  global.LuckyDexImpactTrialCore=require(asset('arcade-impact-trial-core.js'));
  global.LuckyDexEnduranceExpeditionCore=require(asset('arcade-endurance-expedition-core.js'));
  const caught=[
    {key:'1:n',id:1,name:'Bulbasaur',baseSpeed:45,baseStat:49,baseHp:45,types:['grass','poison']},
    {key:'6:n',id:6,name:'Charizard',baseSpeed:100,baseStat:84,baseHp:78,types:['fire','flying']}
  ];
  global.LuckyDexArcadePlatform={dashRacers:()=>caught.map(x=>({...x})),challengeParticipants:stat=>caught.map(x=>({...x,statKey:stat,baseStat:stat==='attack'?x.baseStat:stat==='defense'?(x.id===1?49:78):stat==='hp'?x.baseHp:x.baseSpeed}))};
  const byId={};
  const rows=[
    [1,'Bulbasaur',['grass','poison'],45,49,49,45],[4,'Charmander',['fire'],65,52,43,39],[7,'Squirtle',['water'],43,48,65,44],[25,'Pikachu',['electric'],90,55,40,35],[37,'Vulpix',['fire'],65,41,40,38],[58,'Growlithe',['fire'],60,70,45,55],[77,'Ponyta',['fire'],90,85,55,50],[126,'Magmar',['fire'],93,95,57,65],[133,'Eevee',['normal'],55,55,50,55],[152,'Chikorita',['grass'],45,49,65,45],[155,'Cyndaquil',['fire'],65,52,43,39],[158,'Totodile',['water'],43,65,64,50],[172,'Pichu',['electric'],60,40,15,20],[218,'Slugma',['fire'],20,40,40,40],[228,'Houndour',['dark','fire'],65,60,30,45],[239,'Elekid',['electric'],95,63,37,45]
  ];
  for(const [id,name,types,speed,attack,defense,hp] of rows)byId[id]={id,name,types,baseStats:{speed,attack,defense,hp}};
  global.LuckyDexAdventureSpecies={byId,fallback:{baseStats:{speed:60,attack:60,defense:60,hp:60}}};
  const p=asset('arcade-goldenrod-adapters.js');delete require.cache[require.resolve(p)];return require(p);
}

test('event adapters expose correct stats and competitive cap/type eligibility',()=>{
  const A=fixture();
  assert.deepEqual(A.EVENT_IDS,['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition']);
  assert.equal(A.get('dash').statKey,'speed');
  assert.equal(A.get('powerTrial').statKey,'attack');
  assert.equal(A.get('impactTrial').statKey,'defense');
  assert.equal(A.get('enduranceExpedition').statKey,'hp');
  assert.equal(A.get('enduranceExpedition').participants()[0].baseStat,45);
  const over={key:'x',id:99,baseStat:60,types:['fire']};
  assert.equal(A.get('powerTrial').eligibility(over,{mode:'exhibition',divisionId:'rookie'}).eligible,true);
  assert.deepEqual(A.get('powerTrial').eligibility(over,{mode:'division',divisionId:'rookie'}),{eligible:false,reason:'over-cap'});
  assert.equal(A.get('powerTrial').eligibility({baseStat:40,types:['water','flying']},{mode:'division',divisionId:'master'}).eligible,true);
  assert.equal(A.get('powerTrial').eligibility({baseStat:40,types:['water','flying']},{mode:'type',divisionId:'rookie',type:'flying'}).eligible,true);
  assert.deepEqual(A.get('powerTrial').eligibility({baseStat:40,types:['water']},{mode:'type',divisionId:'rookie',type:'fire'}),{eligible:false,reason:'wrong-type'});
});

test('AI selection can build five legal rivals from species data beyond caught collection',()=>{
  const A=fixture(),adapter=A.get('dash');
  const player={key:'player',id:1,baseStat:45,types:['grass','poison']};
  const ai=adapter.selectAi({divisionId:'poke',type:'fire',player,seed:123,count:5});
  assert.equal(ai.length,5);
  assert.ok(ai.every(r=>r.id!==player.id));
  assert.ok(ai.every(r=>r.types.includes('fire')));
  assert.ok(ai.every(r=>r.baseStat<=89));
});

test('AI profiles and results are seeded, division quality rises, and Master retains variance',()=>{
  const A=fixture(),adapter=A.get('powerTrial');
  const entrant={key:'species:58',id:58,name:'Growlithe',baseStat:70,types:['fire']};
  const p1=adapter.createAiProfile({entrant,divisionId:'master',seed:44});
  const p2=adapter.createAiProfile({entrant,divisionId:'master',seed:44});
  assert.deepEqual(p1,p2);
  const r1=[0,1,2].map(roundIndex=>adapter.simulateAiRound({entrant,profile:p1,divisionId:'master',roundIndex,seed:900+roundIndex}));
  const r2=[0,1,2].map(roundIndex=>adapter.simulateAiRound({entrant,profile:p2,divisionId:'master',roundIndex,seed:900+roundIndex}));
  assert.deepEqual(r1,r2);
  const changed=adapter.simulateAiRound({entrant,profile:p1,divisionId:'master',roundIndex:0,seed:999});
  assert.notEqual(changed.metric,r1[0].metric);
  assert.ok(A.divisionAiQuality('rookie')<A.divisionAiQuality('poke'));
  assert.ok(A.divisionAiQuality('poke')<A.divisionAiQuality('great'));
  assert.ok(A.divisionAiQuality('great')<A.divisionAiQuality('ultra'));
  assert.ok(A.divisionAiQuality('ultra')<A.divisionAiQuality('master'));
  assert.ok(p1.mistake>0);
  assert.ok(p1.variance>0);
});

test('Dash themes stay outdoors/type-specific while neutral cups use normal theme',()=>{
  const A=fixture(),dash=A.get('dash');
  assert.equal(dash.metricDirection,'lower');
  assert.equal(dash.themeKey({mode:'division',type:null}),'normal');
  assert.equal(dash.themeKey({mode:'type',type:'steel'}),'steel');
  assert.equal(dash.roundConfig({divisionId:'great',roundIndex:1,type:'fire',seed:1}).theme.surface,'volcanic');
});
