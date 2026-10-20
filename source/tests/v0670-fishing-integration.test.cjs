'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
const Core=require('../app/src/main/assets/adventure/adventure-fishing-core.js');
let Fishing;try{Fishing=require('../app/src/main/assets/adventure/adventure-fishing.js')}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;Fishing={};}
const fresh=()=>({pokemon:{'7:n':{...S.byId[7],level:12,xp:0,count:1}},team:['7:n'],profile:{coins:1000},inventory:{pokeball:20,potion:5,berry:5},stats:{},settings:{shinyOdds:4096}});

test('regional engine fishing handoff creates exactly one forced wild encounter using the existing battle',()=>{
 const save=fresh(),j=E.start(save,'kanto',71);assert.equal(typeof E.enterFishingWild,'function','fishing encounter handoff must exist');
 assert.equal(E.enterFishingWild(save,'Pallet Town',129,4242),true);assert.equal(j.phase,'battle');assert.equal(j.battle.enemy.id,129);assert.equal(j.battle.kind,'wild');
 const fishingNode=E.current(j);assert.equal(fishingNode.fishingWild,true);assert.equal(fishingNode.localHunt,true);assert.equal(fishingNode.forcedSpeciesId,129);
 assert.equal(E.enterFishingWild(save,'Pallet Town',130,999),false,'active battle blocks duplicate handoff');
});

test('a fishing capture is settled by the existing regional capture path',()=>{
 const save=fresh(),j=E.start(save,'kanto',72);E.enterFishingWild(save,'Pallet Town',129,99);const before=save.stats.catches||0;
 j.battle.result={kind:'capture'};j.battle.phase='terminal';assert.equal(E.settleBattle(save),true);assert.equal(save.stats.catches,before+1);assert.equal(Core.ensureState(save).catches,1,'fishing capture record follows battle settlement');assert(Object.values(save.pokemon).some(p=>p.id===129),'caught fish enters the normal collection');
 assert.equal(j.phase,'result');assert.equal(E.advance(save),true);assert.equal(j.phase,'map');assert(!j.nodes.some(n=>n.fishingWild),'temporary fishing encounter node is removed after settlement');
});

test('fishing outcome completion never hands off an escape and never duplicates a landed encounter',()=>{
 assert.equal(typeof Fishing.completeOutcome,'function','fishing UI must expose its outcome boundary');
 const calls=[],engine={enterFishingWild:(save,name,id,seed)=>{calls.push({save,name,id,seed});return true}},save=fresh(),place={name:'Pallet Town'},session={handedOff:false,recorded:false};
 const escaped=Fishing.completeOutcome(session,save,place,{kind:'escaped',reason:'line-break'},{engine,record:()=>{session.recorded=true}});assert.equal(escaped,false);assert.equal(calls.length,0);assert.equal(session.recorded,true);
 const landedSession={handedOff:false,recorded:false};const landed={kind:'landed',speciesId:129,level:8,seed:77};
 assert.equal(Fishing.completeOutcome(landedSession,save,place,landed,{engine,record:()=>{landedSession.recorded=true}}),true);assert.equal(calls.length,1);assert.equal(landedSession.recorded,true);
 assert.equal(Fishing.completeOutcome(landedSession,save,place,landed,{engine,record:()=>{throw new Error('must not re-record')}}),false);assert.equal(calls.length,1,'repeat rendering cannot create a second battle');
});
