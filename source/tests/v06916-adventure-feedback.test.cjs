'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const ROOT=path.join(__dirname,'../app/src/main/assets');
const Tools=require(path.join(ROOT,'adventure/adventure-tools.js'));
const Species=require(path.join(ROOT,'adventure/adventure-species.js'));
const Engine=require(path.join(ROOT,'adventure/adventure-regional-engine.js'));

function pikachuSave(){
  const owned={...Species.byId[25],id:25,level:37,xp:0,count:1,moves:[84,98,45,39],pendingMoves:[86],tmLearned:[]};
  const journey={...owned,key:'25:n',level:8,ownedLevel:37,hp:55,maxHp:55,pp:{84:30,98:30,45:40,39:30},pendingMoves:[129],tmLearned:[]};
  return {profile:{coins:1000,xp:0},inventory:{},tmInventory:{},pokemon:{'25:n':owned},team:['25:n'],stats:{},adventureRegional:{schema:2,activeRegion:'kanto',active:{phase:'map',party:[journey],leadKey:'25:n',reserveParty:{},region:'kanto'}}};
}

test('LEARN uses the same Collection/Journey scope split as known moves',()=>{
  const save=pikachuSave();
  const collection=Tools.markup(save,'moves',{key:'25:n',moveTab:'learn',scope:'owned'});
  assert.match(collection,/aria-label="Move ownership"/);
  assert.match(collection,/data-scope="owned" aria-pressed="true"/);
  assert.match(collection,/Collection level-up move/);
  assert.doesNotMatch(collection,/Journey level-up move/);

  const journey=Tools.markup(save,'moves',{key:'25:n',moveTab:'learn',scope:'journey'});
  assert.match(journey,/data-scope="journey" aria-pressed="true"/);
  assert.match(journey,/Journey level-up move/);
  assert.doesNotMatch(journey,/Collection level-up move/);
});

function freshJourney(){
  return {pokemon:{'25:n':{...Species.byId[25],id:25,level:20,xp:0,count:1}},team:['25:n'],profile:{coins:1000},inventory:{pokeball:10,potion:3,berry:2},stats:{},adventureV2:{}};
}

test('route fishing can hand off from a completed Ready-for-the-road result and returns there afterwards',()=>{
  const save=freshJourney(),j=Engine.start(save,'kanto',123),main=j.nodes.find(n=>!n.optional);
  j.current=main.id;j.phase='result';j.location='Route 19';j.resolutions[main.id]={claimed:true,text:'Ready.',traversal:j.traversal};
  const current=main.id,location=j.location;
  assert.equal(Engine.enterFishingWild(save,location,129,456),true,'hooked route fish should enter a battle from result state');
  assert.equal(j.phase,'battle');
  assert.notEqual(j.current,current);
  j.battle.result={kind:'victory'};
  assert.equal(Engine.settleBattle(save),true);
  assert.equal(j.phase,'result');
  assert.equal(Engine.advance(save),true);
  assert.equal(j.phase,'result','fishing must restore the pre-fishing route result state');
  assert.equal(j.current,current);
  assert.equal(j.location,location);
});

test('Adventure foreground lifecycle has a pageshow recovery path after pagehide',()=>{
  const controllerPath=path.join(ROOT,'adventure/adventure-controller.js');
  delete require.cache[require.resolve(controllerPath)];
  const old={window:global.window,document:global.document};
  const listeners={},docListeners={};let enters=0,suspends=0;
  const state={settings:{reducedMotion:false},adventureRegional:{schema:2,active:null},adventureV2:{activeTargetHuntDestination:'meadow'},profile:{coins:0},pokemon:{},team:[]};
  global.window=global;
  global.addEventListener=(type,fn)=>{listeners[type]=fn;};
  global.document={hidden:false,body:{classList:{add(){},remove(){},toggle(){}}},addEventListener:(type,fn)=>{docListeners[type]=fn;},querySelector:sel=>sel==='[data-page="adventure"].active'?{}:null,getElementById:id=>id==='adventureRoot'?{innerHTML:'',dataset:{}}:id==='titleScreen'?{classList:{contains:()=>true}}:null};
  global.LuckyDexAdventureBridge={getState:()=>state,save(){},showToast(){}};
  global.LuckyDexAdventureModel={ensureState(){},DESTINATIONS:{meadow:{name:'Meadow'}},targetChainInfo:()=>({targetId:null,chain:0,targetWeight:1}),knownTargetIds:()=>[]};
  global.LuckyDexRegionalEngine={ensureSave(){},summary(){return null;},region(){return{name:'Kanto'}}};
  global.LuckyDexAdventureAssets={destinations:{meadow:{scene:'adventure/art/meadow-scene.png',landmark:'adventure/art/meadow-scene.png'}},objects:{poke_ball:'',potion:'',clipboard:''},pokemon:()=>''};
  global.LuckyDexWildHunt={create:()=>({leave(){},enter(){},snapshot:()=>({view:'habitats',busy:false,resources:{raf:0,jobs:0}})})};
  global.LuckyDexJourneyUI={create:()=>({enter(){enters++;},suspend(){suspends++;},snapshot:()=>({busy:false,resources:{raf:0,jobs:0}})}),place:()=>''};
  try{
    require(controllerPath);
    global.LuckyDexAdventure.regional();
    const before=enters;
    assert.equal(typeof listeners.pagehide,'function');
    assert.equal(typeof listeners.pageshow,'function','pagehide must have a matching pageshow recovery listener');
    listeners.pagehide();
    listeners.pageshow();
    assert.ok(suspends>=1);
    assert.ok(enters>before,'foreground recovery should re-render the Journey view');
  }finally{
    delete require.cache[require.resolve(controllerPath)];
    global.window=old.window;global.document=old.document;
  }
});

test('losing a route-fishing battle clears its temporary return marker',()=>{
  const save=freshJourney(),j=Engine.start(save,'kanto',321),main=j.nodes.find(n=>!n.optional);
  j.current=main.id;j.phase='result';j.location='Route 19';j.resolutions[main.id]={claimed:true,text:'Ready.',traversal:j.traversal};
  assert.equal(Engine.enterFishingWild(save,j.location,129,654),true);
  assert.equal(j.activityReturn?.kind,'fishing');
  j.battle.result={kind:'loss'};
  assert.equal(Engine.settleBattle(save),true);
  assert.equal(j.activityReturn,undefined,'checkpoint defeat must not leave stale fishing return state');
});
