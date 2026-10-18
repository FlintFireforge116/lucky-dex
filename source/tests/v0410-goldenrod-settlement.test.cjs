const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const p=name=>path.join(ROOT,'app/src/main/assets',name);

function clear(name){try{delete require.cache[require.resolve(p(name))];}catch(_){}}
function baseState(){return {arcade:{goldenrod:null,records:{version:1,games:{}}},inventory:{rareGift:1}};}
function fresh({state=baseState()}={}){
  for(const name of ['arcade-goldenrod-core.js','arcade-goldenrod-state.js','arcade-records-core.js','arcade-goldenrod.js','achievements-v0341.js'])clear(name);
  global.LuckyDexGoldenrodCore=require(p('arcade-goldenrod-core.js'));
  global.LuckyDexGoldenrodState=require(p('arcade-goldenrod-state.js'));
  global.LuckyDexArcadeRecordsCore=require(p('arcade-records-core.js'));
  global.state=state;
  let awardCalls=0;
  global.LuckyDexArcadePlatform={awardRun:({coins})=>{awardCalls++;return {coinsAwarded:coins};}};
  global.save=()=>{};
  global.LuckyDexGoldenrodAdapters=null;
  const controller=require(p('arcade-goldenrod.js'));
  const achievements=require(p('achievements-v0341.js'));
  return {core:global.LuckyDexGoldenrodCore,stateApi:global.LuckyDexGoldenrodState,records:global.LuckyDexArcadeRecordsCore,controller,achievements,state,get awardCalls(){return awardCalls;}};
}

function entrants(){return [
  {id:'player',name:'YOU'},
  {id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'},{id:'d',name:'D'},{id:'e',name:'E'}
];}
function completedCup(core,{eventId='powerTrial',mode='division',divisionId='rookie',type=null,playerPlace=1,rareReceipts=[]}={}){
  const all=entrants();
  const cup=core.createCup({eventId,mode,divisionId,type,player:all[0],entrants:all.slice(1),seed:77,metricDirection:'higher'});
  const ordered=all.slice();
  ordered.splice(0,1);
  ordered.splice(playerPlace-1,0,all[0]);
  for(let round=1;round<=3;round++){
    const results=ordered.map((e,i)=>({id:e.id,place:i+1,metric:100-i}));
    core.recordRound(cup,{roundId:`r${round}`,results,rareReceipts:round===1?rareReceipts:[]});
  }
  return cup;
}

test('cup rewards use the exact division-by-placement table',()=>{
  const {controller}=fresh();
  const expected={
    rookie:[240,160,110,70,50,40],
    poke:[300,200,140,90,65,50],
    great:[380,250,175,115,80,60],
    ultra:[480,320,220,145,100,75],
    master:[620,410,285,185,125,95]
  };
  for(const [division,row] of Object.entries(expected)){
    assert.deepEqual([1,2,3,4,5,6].map(place=>controller.rewardForCup(division,place)),row,division);
  }
});

test('final settlement pays exactly once, awards podium medals, unlocks progression, and records a compact best',()=>{
  for(const [place,trophy] of [[1,'gold'],[2,'silver'],[3,'bronze']]){
    const env=fresh();
    const cup=completedCup(env.core,{playerPlace:place,rareReceipts:[{label:'Golden Prize',meta:'Already awarded'}]});
    const first=env.controller.settleCupOnce(cup);
    const second=env.controller.settleCupOnce(cup);
    assert.equal(first.finalPlace,place);
    assert.equal(first.trophy,trophy);
    assert.equal(first.coinsAwarded,[240,160,110][place-1]);
    assert.equal(first,second,'completion guard should return the same settlement object');
    assert.equal(env.awardCalls,1,'cup payout must happen once');
    assert.equal(env.state.arcade.goldenrod.events.powerTrial.unlockedDivision,'poke');
    assert.equal(env.state.arcade.goldenrod.events.powerTrial.typeCupsUnlocked,true);
    assert.equal(env.state.arcade.goldenrod.events.powerTrial.divisionTrophies.rookie,trophy);
    assert.deepEqual(first.rareReceipts,[{label:'Golden Prize',meta:'Already awarded'}]);
    const record=env.state.arcade.records.games.powerTrial.tournament.divisions.rookie;
    assert.equal(record.bestPlace,place);
    assert.equal(record.bestPoints,env.core.standings(cup).find(r=>r.id==='player').points);
    assert.equal(typeof record.bestAggregateMetric,'number');
  }
});

test('Type Cup wins store the trophy but never advance the division ladder',()=>{
  const state=baseState();
  state.arcade.goldenrod={version:1,events:{
    dash:{unlockedDivision:'great',typeCupsUnlocked:true,divisionTrophies:{},typeTrophies:{},records:{}},
    powerTrial:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},
    impactTrial:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}}
  }};
  const env=fresh({state});
  const cup=completedCup(env.core,{eventId:'dash',mode:'type',divisionId:'great',type:'steel',playerPlace:1});
  const result=env.controller.settleCupOnce(cup);
  assert.equal(result.trophy,'gold');
  assert.equal(env.state.arcade.goldenrod.events.dash.unlockedDivision,'great');
  assert.equal(env.state.arcade.goldenrod.events.dash.typeTrophies.steel.great,'gold');
  assert.equal(env.state.arcade.records.games.dash.tournament.types.steel.great,'gold');
});

test('abandoning before round three gives no cup settlement and never rolls back an already-awarded rare prize',()=>{
  const env=fresh();
  const all=entrants();
  const cup=env.core.createCup({eventId:'impactTrial',mode:'division',divisionId:'rookie',player:all[0],entrants:all.slice(1),seed:4});
  env.core.recordRound(cup,{roundId:'r1',results:all.map((e,i)=>({id:e.id,place:i+1,metric:100-i})),rareReceipts:[{label:'Golden Hazard Prize',awarded:true}]});
  env.core.abandonCup(cup);
  const inventoryBefore=JSON.stringify(env.state.inventory);
  assert.equal(env.controller.settleCupOnce(cup),null);
  assert.equal(env.awardCalls,0);
  assert.equal(env.state.arcade.goldenrod?.events?.impactTrial?.divisionTrophies?.rookie,undefined);
  assert.equal(JSON.stringify(env.state.inventory),inventoryBefore);
});

test('tournament records keep only compact division bests and type trophies',()=>{
  const {records}=fresh();
  let store={version:1,games:{powerTrial:{recent:[{entryId:'keep',completedAt:1,title:'old'}],bestScores:{hard:999}}}};
  store=records.updateTournamentRecord(store,'powerTrial',{mode:'division',divisionId:'great',playerStanding:{place:2,points:22,aggregateMetric:500},metricDirection:'higher',trophy:'silver'});
  store=records.updateTournamentRecord(store,'powerTrial',{mode:'division',divisionId:'great',playerStanding:{place:1,points:24,aggregateMetric:530},metricDirection:'higher',trophy:'gold'});
  store=records.updateTournamentRecord(store,'powerTrial',{mode:'type',divisionId:'great',type:'fire',playerStanding:{place:1,points:26,aggregateMetric:520},metricDirection:'higher',trophy:'gold'});
  assert.deepEqual(store.games.powerTrial.tournament.divisions.great,{bestPlace:1,bestPoints:24,bestAggregateMetric:530});
  assert.equal(store.games.powerTrial.tournament.types.fire.great,'gold');
  assert.equal(store.games.powerTrial.recent.length,1);
  assert.equal(store.games.powerTrial.bestScores.hard,999);
  assert.equal('history' in store.games.powerTrial.tournament,false);
});

test('Goldenrod tournament achievements expose the required IDs and conditions while preserving Iron Wall',()=>{
  const state=baseState();
  state.arcade.goldenrod={version:1,events:{
    dash:{unlockedDivision:'master',typeCupsUnlocked:true,divisionTrophies:{rookie:'bronze',master:'gold'},typeTrophies:{fire:{great:'gold'}},records:{}},
    powerTrial:{unlockedDivision:'master',typeCupsUnlocked:true,divisionTrophies:{master:'gold'},typeTrophies:{},records:{}},
    impactTrial:{unlockedDivision:'master',typeCupsUnlocked:true,divisionTrophies:{master:'gold'},typeTrophies:{},records:{}},
    targetRange:{unlockedDivision:'master',typeCupsUnlocked:true,divisionTrophies:{master:'gold'},typeTrophies:{},records:{}}
  }};
  state.arcade.impactTrial={hardClears:1};
  const env=fresh({state});
  const rows=env.achievements.buildCoreAchievements(()=>state);
  const byId=Object.fromEntries(rows.map(a=>[a.id,a]));
  const ids=['goldenrod_first_podium','goldenrod_division_champion','goldenrod_master_champion','goldenrod_type_specialist','goldenrod_speed_master','goldenrod_power_master','goldenrod_iron_wall_master','goldenrod_target_master','goldenrod_grand_champion'];
  for(const id of ids){assert.ok(byId[id],`missing ${id}`);const [v,t]=byId[id].progress();assert.ok(v>=t,`${id} should be complete`);}
  assert.equal(byId.impact_trial_hard_clear.name,'Iron Wall');
  assert.notEqual(byId.goldenrod_iron_wall_master.id,byId.impact_trial_hard_clear.id);
});
