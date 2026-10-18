const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app/src/main/assets',name);

function clear(name){try{delete require.cache[require.resolve(asset(name))];}catch(_){}}
function baseEvent(unlockedDivision='rookie',typeCupsUnlocked=true){return {unlockedDivision,typeCupsUnlocked,divisionTrophies:{},typeTrophies:{},records:{}};}
function setup({overCap=false}={}){
  for(const n of ['arcade-goldenrod-core.js','arcade-goldenrod-state.js','arcade-records-core.js','arcade-goldenrod.js'])clear(n);
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexGoldenrodState=require(asset('arcade-goldenrod-state.js'));
  global.LuckyDexArcadeRecordsCore=require(asset('arcade-records-core.js'));
  global.state={arcade:{records:{version:1,games:{}},goldenrod:{version:1,events:{dash:baseEvent(),powerTrial:baseEvent(),impactTrial:baseEvent()}}}};
  global.save=()=>{};
  global.LuckyDexArcadePlatform={awardRun:({coins})=>({coinsAwarded:coins})};
  const player={key:'p1',id:25,name:'Pikachu',baseStat:overCap?200:55,types:['electric']};
  const ai=Array.from({length:5},(_,i)=>({key:`ai${i}`,id:100+i,name:`AI ${i}`,baseStat:50+i,types:['normal']}));
  const adapter={
    statKey:'speed',metricDirection:'higher',participants:()=>[player],
    eligibility:(row,{mode,divisionId,type})=>({eligible:mode==='exhibition'||(!type||row.types.includes(type))&&(divisionId==='master'||row.baseStat<=59)}),
    selectAi:()=>ai,createAiProfile:()=>({consistency:.5}),playerMetric:r=>Number(r.metric)||0,
    simulateAiRound:({entrant})=>({metric:40+Number(String(entrant.key).replace('ai',''))}),formatMetric:v=>String(v)
  };
  global.LuckyDexGoldenrodAdapters={get:id=>['dash','powerTrial','impactTrial'].includes(id)?{...adapter,statKey:id==='dash'?'speed':id==='powerTrial'?'attack':'defense'}:null};
  const callbacks={};const exhibitions={};
  const apiFor=id=>({
    startGoldenrodRound:opts=>{callbacks[id]=opts.onComplete;return {started:true,opts};},
    startExhibition:opts=>{exhibitions[id]=opts;return {started:true,opts};}
  });
  global.LuckyDexDash=apiFor('dash');global.LuckyDexPowerTrial=apiFor('powerTrial');global.LuckyDexImpactTrial=apiFor('impactTrial');
  global.LuckyDexArcadeWorld={openGame:()=>true,openVenue:()=>true};
  const controller=require(asset('arcade-goldenrod.js'));
  return {controller,callbacks,exhibitions,player,state:global.state};
}

function runThreeRounds(env,eventId,opts={}){
  const started=env.controller.startCup({eventId,mode:opts.mode||'division',divisionId:opts.divisionId||'rookie',type:opts.type||null,participantKey:'p1'});
  assert.ok(started,`${eventId} cup should start`);
  for(let round=0;round<3;round++){
    const cb=env.callbacks[eventId];assert.equal(typeof cb,'function',`${eventId} round ${round+1} callback`);
    cb({eventId,metric:100+round,raw:{round},rareReceipts:round===2?[{label:'Rare Test Prize',awarded:true}]:[]});
    if(round<2)assert.ok(env.controller.launchRound(),`${eventId} round ${round+2} should launch`);
  }
  return env.controller.activeCup();
}

for(const eventId of ['dash','powerTrial','impactTrial'])test(`${eventId} completes a deterministic three-round Division Cup through shared Goldenrod settlement`,()=>{
  const env=setup();
  const cup=runThreeRounds(env,eventId);
  assert.equal(cup.completed,true);
  assert.equal(cup.rounds.length,3);
  assert.equal(cup.completionValue.finalPlace,1);
  assert.equal(cup.completionValue.trophy,'gold');
  assert.equal(cup.completionValue.rareReceipts.length,1);
  assert.equal(env.state.arcade.goldenrod.events[eventId].divisionTrophies.rookie,'gold');
  assert.equal(env.state.arcade.goldenrod.events[eventId].unlockedDivision,'poke');
  const model=env.controller.finalModel({cup,standings:global.LuckyDexGoldenrodCore.standings(cup),settlement:cup.completionValue});
  assert.equal(model.podium[0].player,true);
  assert.equal(model.trophy,'gold');
});

test('Type Cup path records a themed trophy without advancing divisions',()=>{
  const env=setup();env.state.arcade.goldenrod.events.dash.unlockedDivision='great';
  // Use a participant that matches the Type Cup while keeping the same outdoor-themed Dash adapter path.
  env.player.types=['electric'];
  const cup=runThreeRounds(env,'dash',{mode:'type',divisionId:'great',type:'electric'});
  assert.equal(cup.type,'electric');
  assert.equal(env.state.arcade.goldenrod.events.dash.typeTrophies.electric.great,'gold');
  assert.equal(env.state.arcade.goldenrod.events.dash.unlockedDivision,'great');
});

test('Exhibition stays unrestricted for all three events even with an over-cap Pokémon',()=>{
  const env=setup({overCap:true});
  for(const eventId of ['dash','powerTrial','impactTrial']){
    const result=env.controller.startExhibition({eventId,difficulty:'easy',participantKey:'p1'});
    assert.ok(result,`${eventId} Exhibition should start`);
    assert.equal(env.exhibitions[eventId].participant.baseStat,200);
  }
});

test('Goldenrod shell keeps narrow-screen responsive contracts and outdoor Dash presentation hooks',()=>{
  const css=fs.readFileSync(asset('arcade-goldenrod.css'),'utf8');
  const dash=fs.readFileSync(asset('arcade-dash.js'),'utf8');
  const config=fs.readFileSync(asset('arcade-dash-config.js'),'utf8');
  assert.match(css,/@media\s*\(max-width:\s*62[0-9]px\)/i);
  assert.match(css,/goldenrod-event-grid/);
  assert.match(css,/goldenrod-participant-grid/);
  assert.match(css,/goldenrod-scoreboard/);
  assert.match(css,/goldenrod-podium/);
  assert.match(css,/goldenrod-rare-receipts/);
  assert.match(dash,/goldenrod/i);
  assert.match(config,/theme/i);
});

test('competitive cup API rejects locked divisions and locked Type Cups',()=>{
  const env=setup();
  env.state.arcade.goldenrod.events.dash.unlockedDivision='rookie';
  env.state.arcade.goldenrod.events.dash.typeCupsUnlocked=false;
  assert.equal(env.controller.startCup({eventId:'dash',mode:'division',divisionId:'great',participantKey:'p1'}),false);
  assert.equal(env.controller.activeCup(),null);
  assert.equal(env.controller.startCup({eventId:'dash',mode:'type',divisionId:'rookie',type:'electric',participantKey:'p1'}),false);
  assert.equal(env.controller.activeCup(),null);
});
