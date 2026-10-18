'use strict';
const assert=require('node:assert/strict'),test=require('node:test');
const M=require('../app/src/main/assets/adventure/adventure-model.js');
const copy=value=>JSON.parse(JSON.stringify(value));
const destinations=['meadow','cave','haunted','coast','volcano'];
const expedition=(overrides={})=>({id:'expedition-old',destination:'coast',phase:'battle',seed:42,currentNode:'event-2',pending:{nodeId:'event-2',type:'event'},party:[{key:'7:n',id:7,hp:21,custom:'partner metadata'}],hpByKey:{'7:n':21},loot:{coins:750,xp:300,items:{potion:2},catches:[{id:120,key:'120:n'}],rooms:7},rng:{state:4816,seed:42,custom:'rng metadata'},resolutions:{'event-1':{coins:50}},perks:['compass'],perkOffer:['quickClaw'],claimed:false,customMetadata:{keep:true},...overrides});

test('offline model exposes Wild Hunt records and no retired expedition gameplay',()=>{
  for(const name of ['ensureState','mastery','recordEncounter','recordCatch','fieldChain','updateFieldChain','chainInfo'])assert.equal(typeof M[name],'function',name);
  for(const name of ['generateRoute','createRun','availableNodes','enterNode','completeNode','resolveEvent','choiceAvailable','offerPerk','keepPerk','NODE_TYPES','EVENTS','PERKS'])assert.equal(M[name],undefined,name+' must not resume a retired expedition');
});

test('all retained habitats have scene hotspot coordinates and populated encounter pools',()=>{
  assert.deepEqual(Object.keys(M.DESTINATIONS),destinations);
  for(const id of destinations){const location=M.DESTINATIONS[id],spots=M.HOTSPOT_BLUEPRINTS[id],pool=M.ENCOUNTER_POOLS[id];assert.equal(location.id,id);assert.ok(location.name);assert.ok(location.rank>=1);assert.ok(location.minLevel<=location.maxLevel);assert.equal(spots.length,5);for(const spot of spots){assert.ok(spot.clue&&spot.effect);assert.ok(spot.x>=0&&spot.x<=100);assert.ok(spot.y>=0&&spot.y<=100);}assert.ok(pool.normal.length>0);for(const tier of ['normal','rare','legendary']){assert.equal(new Set(pool[tier]).size,pool[tier].length);assert.ok(pool[tier].every(id=>Number.isInteger(id)&&id>0));}}
});

test('an active expedition is archived exactly and never pays its pending reward',()=>{
  const old=expedition(),save={coins:999,profile:{coins:777,xp:66},inventory:{potion:4},pokemon:{'7:n':{id:7,count:1}},firstClears:{meadow:true},legacy:{custom:'keep'},adventureV2:{activeExpedition:old,customFlag:7}};
  const committed=copy({coins:save.coins,profile:save.profile,inventory:save.inventory,pokemon:save.pokemon,firstClears:save.firstClears,legacy:save.legacy});
  const v2=M.ensureState(save);assert.equal(v2.activeExpedition,null);assert.deepEqual(v2.retiredExpedition,old);assert.notEqual(v2.retiredExpedition,old);assert.equal(v2.customFlag,7);
  assert.deepEqual({coins:save.coins,profile:save.profile,inventory:save.inventory,pokemon:save.pokemon,firstClears:save.firstClears,legacy:save.legacy},committed);
  const normalized=copy(save);for(let i=0;i<3;i++)M.ensureState(save);assert.deepEqual(save,normalized);assert.equal(save.adventureV2.retiredExpedition.claimed,false);
});

test('completed and claimed expedition archives cannot award a clear again after reload',()=>{
  for(const claimed of [false,true]){const old=expedition({phase:'complete',claimed}),save={profile:{coins:1000,xp:200},inventory:{potion:3},adventureV2:{activeExpedition:old}};M.ensureState(save);const restored=copy(save),before=copy(restored);M.ensureState(restored);assert.deepEqual(restored,before);assert.equal(restored.adventureV2.activeExpedition,null);assert.equal(restored.adventureV2.retiredExpedition.claimed,claimed);assert.equal(restored.profile.coins,1000);assert.equal(restored.inventory.potion,3);}
});

test('malformed additive save values normalize safely while retaining unknown fields',()=>{
  const save={adventureV2:{schema:1,destinations:{meadow:{encounters:-3,custom:9}},activeRoam:'broken',activeExpedition:[],lastDestination:'wrong',custom:8},inventory:{potion:4}};
  const v2=M.ensureState(save);assert.equal(v2.activeRoam,null);assert.equal(v2.activeExpedition,null);assert.equal(v2.retiredExpedition,undefined);assert.equal(v2.destinations.meadow.encounters,0);assert.equal(v2.destinations.meadow.custom,9);assert.equal(v2.custom,8);assert.equal(v2.lastDestination,'meadow');assert.deepEqual(save.inventory,{potion:4});
});

test('malformed former route values are preserved as history without becoming playable',()=>{
  const old=expedition({party:null,loot:null,hpByKey:{p1:-22},pending:{nodeId:'bogus'},currentNode:'missing',custom:'preserve'}),save={adventureV2:{activeExpedition:old}};
  const v2=M.ensureState(save);assert.equal(v2.activeExpedition,null);assert.deepEqual(v2.retiredExpedition,old);assert.equal(v2.retiredExpedition.custom,'preserve');assert.equal(M.availableNodes,undefined);assert.equal(M.enterNode,undefined);assert.equal(M.resolveEvent,undefined);
});

test('existing historical archive stays intact when ensureState is repeated',()=>{
  const archived=expedition({claimed:true,customMetadata:{history:'retain'}}),save={adventureV2:{retiredExpedition:archived,activeExpedition:null,custom:'preserve'}};const v2=M.ensureState(save),before=copy(save);M.ensureState(save);assert.deepEqual(save,before);assert.deepEqual(v2.retiredExpedition,archived);assert.equal(v2.custom,'preserve');
});

test('active Wild Hunt survives retirement with reveal, hotspots and unknown metadata',()=>{
  const roam={destination:'coast',chain:7,sequence:3,seed:87,hotspots:[{id:'h2',slot:2,seed:91,x:77,y:20,custom:'retain'}],reveal:{kind:'item',key:'coins',qty:19,claimed:true},battle:null,custom:{keep:true}},save={adventureV2:{activeExpedition:expedition(),activeRoam:roam,destinations:{coast:{chain:4,custom:'field metadata'}}}};
  const v2=M.ensureState(save);assert.deepEqual(v2.activeRoam,roam);assert.equal(M.fieldChain(v2,'coast'),7);assert.equal(v2.destinations.coast.custom,'field metadata');const restored=copy(save);M.ensureState(restored);assert.deepEqual(restored,save);assert.equal(restored.adventureV2.activeExpedition,null);
});

test('saved habitat chain wins over stale active Hunt chain and malformed hotspots repair',()=>{
  const v2=M.ensureState({adventureV2:{activeRoam:{destination:'meadow',chain:3,hotspots:null,custom:'keep'},destinations:{meadow:{chain:9}}}});assert.equal(v2.activeRoam.chain,9);assert.equal(M.fieldChain(v2,'meadow'),9);assert.deepEqual(v2.activeRoam.hotspots,[]);assert.equal(v2.activeRoam.custom,'keep');
});

test('record normalization repairs counters and nested records without losing metadata',()=>{
  const v2=M.ensureState({adventureV2:{destinations:{cave:{encounters:4.8,shiny:-9,clears:NaN,chain:Infinity,seen:[],caught:null,rare:'broken',boss:true,custom:{retain:1}}}}}),r=v2.destinations.cave;
  assert.equal(r.encounters,4);assert.equal(r.shiny,0);assert.equal(r.clears,0);assert.equal(r.chain,0);for(const key of ['seen','caught','rare'])assert.deepEqual(r[key],{});assert.equal(r.boss,true);assert.deepEqual(r.custom,{retain:1});
});

test('encounter/catch field records preserve metadata and mastery is cosmetic bounded progression',()=>{
  const v2=M.ensureState({adventureV2:{destinations:{meadow:{custom:'keep'}}}});assert.equal(M.mastery(v2.destinations.meadow),0);
  M.recordEncounter(v2,'meadow',{id:25,rare:true,shiny:true});M.recordEncounter(v2,'meadow',{id:25});M.recordCatch(v2,'meadow',{id:25});const record=v2.destinations.meadow;
  assert.equal(record.encounters,2);assert.equal(record.seen[25],2);assert.equal(record.caught[25],1);assert.equal(record.rare[25],1);assert.equal(record.shiny,1);assert.equal(record.custom,'keep');assert.ok(M.mastery(record)>0);
  const rich={encounters:100,seen:{1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1},caught:{1:1,2:1,3:1,4:1,5:1},rare:{25:1},shiny:1,clears:1,boss:true};assert.equal(M.mastery(rich),5);assert.equal(M.mastery({}),0);
  const before=copy(record);assert.equal(M.recordEncounter(v2,'meadow',{id:0}),false);assert.equal(M.recordCatch(v2,'meadow',{id:'bad'}),false);assert.deepEqual(record,before);
});

test('field chain persists per habitat, grows on capture or faint, and breaks only on flee/loss',()=>{
  const v2=M.ensureState({adventureV2:{destinations:{meadow:{chain:7},cave:{chain:3}}}});
  assert.equal(M.updateFieldChain(v2,'meadow','capture'),8);
  assert.equal(M.updateFieldChain(v2,'meadow','victory'),9);
  assert.equal(M.fieldChain(v2,'cave'),3);
  assert.equal(M.updateFieldChain(v2,'meadow','unrelated'),9);
  for(const outcome of ['fled','loss']){M.updateFieldChain(v2,'meadow','capture');assert.equal(M.updateFieldChain(v2,'meadow',outcome),0);assert.equal(M.fieldChain(v2,'cave'),3);}
});

test('chain bonuses retain the rarity and discovery caps with useful next thresholds',()=>{
  const v2=M.ensureState({});for(const [chain,rareBonus,itemBonus,nextThreshold] of [[0,0,0,5],[4,.8,1.2,5],[7,1.4,2.1,10],[10,2,3,null],[40,2,3,null]]){v2.destinations.meadow.chain=chain;assert.deepEqual(M.chainInfo(v2,'meadow'),{chain,rareBonus,itemBonus,nextThreshold});}
});
