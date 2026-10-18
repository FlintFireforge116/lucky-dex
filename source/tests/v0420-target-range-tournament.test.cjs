const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);
function fresh(n){const p=asset(n);delete require.cache[require.resolve(p)];return require(p);}
function event(unlockedDivision='master',typeCupsUnlocked=true){return {unlockedDivision,typeCupsUnlocked,divisionTrophies:{},typeTrophies:{},records:{}};}
function setup(){
  global.LuckyDexGoldenrodCore=fresh('arcade-goldenrod-core.js');
  global.LuckyDexGoldenrodState=fresh('arcade-goldenrod-state.js');
  global.LuckyDexArcadeRecordsCore=fresh('arcade-records-core.js');
  global.state={arcade:{records:{version:1,games:{}},goldenrod:{version:1,events:{dash:event(),powerTrial:event(),impactTrial:event(),targetRange:event()}}}};
  global.save=()=>{};global.LuckyDexArcadePlatform={awardRun:({coins})=>({coinsAwarded:coins})};
  const player={key:'p',id:1,name:'Bulbasaur',baseStat:65,types:['grass','poison'],image:'1.png'};
  const rivals=Array.from({length:5},(_,i)=>({key:`a${i}`,id:10+i,name:`AI${i}`,baseStat:50+i,types:['grass']}));
  const adapter={id:'targetRange',statKey:'spAtk',metricDirection:'higher',participants:()=>[player],eligibility:(row,{mode,divisionId,type})=>({eligible:mode==='exhibition'||(!type||row.types.includes(type))&&(divisionId==='master'||row.baseStat<=59),reason:'eligible'}),selectAi:()=>rivals,createAiProfile:()=>({}),simulateAiRound:({entrant})=>({metric:40+Number(entrant.id)}),playerMetric:r=>Number(r.metric)||0,formatMetric:String,attackTypes:r=>r.types,attackName:t=>({grass:'Energy Ball',poison:'Sludge Bomb'})[t]};
  global.LuckyDexGoldenrodAdapters={get:id=>id==='targetRange'?adapter:null};
  const calls=[];let callback=null;
  global.LuckyDexTargetRange={open:()=>true,startGoldenrodRound:o=>{calls.push(o);callback=o.onComplete;return {started:true};},startExhibition:o=>{calls.push(o);return {started:true};}};
  global.LuckyDexArcadeWorld={openGame:()=>true,openVenue:()=>true};
  const controller=fresh('arcade-goldenrod.js');
  return {controller,player,calls,get callback(){return callback;}};
}

test('Goldenrod state adds Target Range defaults without disturbing existing event progress',()=>{
  const S=(global.LuckyDexGoldenrodCore=fresh('arcade-goldenrod-core.js'),fresh('arcade-goldenrod-state.js'));
  const source={version:1,events:{dash:{unlockedDivision:'great',typeCupsUnlocked:true,divisionTrophies:{great:'gold'},typeTrophies:{},records:{wins:2}}}};
  const n=S.normalizeGoldenrodState(source,{});
  assert.equal(n.events.dash.unlockedDivision,'great');assert.equal(n.events.dash.divisionTrophies.great,'gold');
  assert.equal(n.events.targetRange.unlockedDivision,'rookie');assert.equal(n.events.targetRange.typeCupsUnlocked,false);
});

test('Target Range is an active fourth Goldenrod event and world/session know about it',()=>{
  const env=setup(),card=env.controller.eventCardsModel().find(x=>x.id==='targetRange');
  assert.equal(card.active,true);
  const world=fs.readFileSync(asset('arcade-world.js'),'utf8'),session=fs.readFileSync(asset('arcade-session.js'),'utf8');
  assert.match(world,/games:\['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'\]/);
  assert.match(world,/targetRange:\(\)=>window\.LuckyDexTargetRange/);
  assert.match(session,/targetRange:/);
});

test('Target Range Exhibition is unrestricted and validates one of the Pokémon owned attack types',()=>{
  const env=setup();
  assert.ok(env.controller.startExhibition({eventId:'targetRange',difficulty:'hard',participantKey:'p',attackType:'poison'}));
  assert.equal(env.calls[0].difficulty,'hard');assert.equal(env.calls[0].attackType,'poison');
  assert.equal(env.controller.startExhibition({eventId:'targetRange',difficulty:'easy',participantKey:'p',attackType:'fire'}),false);
});

test('Target Range cup fixes a valid chosen attack type across all three rounds',()=>{
  const env=setup();
  assert.ok(env.controller.startCup({eventId:'targetRange',mode:'division',divisionId:'master',participantKey:'p',attackType:'grass'}));
  assert.equal(env.calls[0].attackType,'grass');
  for(let r=0;r<3;r++){
    env.callback({metric:300+r,raw:{score:300+r}});
    if(r<2){assert.ok(env.controller.launchRound());assert.equal(env.calls[r+1].attackType,'grass');}
  }
  const cup=env.controller.activeCup();assert.equal(cup.completed,true);assert.equal(cup._goldenrod.attackType,'grass');
});

test('Target Range cup rejects non-owned attack types and competitive over-cap entrants',()=>{
  const env=setup();
  assert.equal(env.controller.startCup({eventId:'targetRange',mode:'division',divisionId:'master',participantKey:'p',attackType:'fire'}),false);
  global.state.arcade.goldenrod.events.targetRange.unlockedDivision='rookie';
  assert.equal(env.controller.startCup({eventId:'targetRange',mode:'division',divisionId:'rookie',participantKey:'p',attackType:'grass'}),false);
});

test('Goldenrod shell contains a dedicated attack-type selection step for dual types',()=>{
  const src=fs.readFileSync(asset('arcade-goldenrod.js'),'utf8');
  assert.match(src,/data-goldenrod-attack-type/);
  assert.match(src,/renderAttackTypes/);
  assert.match(src,/attackTypes/);
});
