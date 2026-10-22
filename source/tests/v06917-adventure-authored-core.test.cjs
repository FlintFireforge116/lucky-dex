const test=require('node:test');
const assert=require('node:assert/strict');
const Species=require('../app/src/main/assets/adventure/adventure-species.js');
global.LuckyDexAdventureSpecies=Species;
const A=require('../app/src/main/assets/adventure/adventure-authored-events.js');

function saveWith(ids=[25,7,1]){
  const pokemon={}; const team=[];
  for(const id of ids){const key=`${id}:n`; pokemon[key]={...Species.byId[id],id,level:12,count:1}; team.push(key);}
  return {pokemon,team,adventureRegional:{schema:2,journeys:{kanto:null,johto:null,hoenn:null},activeRegion:'kanto',active:null,records:{}}};
}

test('authored state normalises additively without disturbing regional state',()=>{
  const save=saveWith(); const regional=save.adventureRegional;
  const s=A.ensureState(save);
  assert.equal(save.adventureRegional,regional);
  assert.equal(s.schema,1);
  assert.deepEqual(s.flags,{});
  assert.deepEqual(s.completedEvents,{});
  assert.deepEqual(s.requests,{});
  assert.deepEqual(s.recurringCharacters,{});
  assert.deepEqual(s.discoveries,{});
  assert.deepEqual(s.locationState,{});
});

test('late Kanto saves infer Chapter 1 continuity and skip nonsensical first meetings',()=>{
  const save=saveWith();
  save.adventureRegional.journeys.kanto={region:'kanto',badges:3,chapterIndex:3,completed:['kanto-c0-s0','kanto-c0-s1','kanto-c0-s2','kanto-c0-s3','kanto-c0-s4']};
  save.adventureRegional.active=save.adventureRegional.journeys.kanto;
  const s=A.ensureState(save);
  assert.ok(s.recurringCharacters.rivalStage>=1);
  assert.ok(s.recurringCharacters.researcherStage>=1);
  assert.equal(s.completedEvents['kanto-pallet-departure'].legacySkipped,true);
  assert.equal(s.completedEvents['kanto-route1-rival'].legacySkipped,true);
});

test('party capability derivation uses broad species traits and returns the actual helper',()=>{
  const save=saveWith([25,7,1]);
  const journey={party:save.team.map(key=>({key,id:save.pokemon[key].id,name:save.pokemon[key].name}))};
  const caps=A.partyCapabilities(save,journey);
  assert.ok(caps.electric.some(p=>p.id===25));
  assert.ok(caps.water.some(p=>p.id===7));
  assert.ok(caps.nature.some(p=>p.id===1));
  assert.ok(caps.small.some(p=>p.id===25));
  assert.equal(A.qualifyingMember(save,journey,'electric').name,'Pikachu');
});

test('one-time completion, discoveries and requests cannot double count',()=>{
  const save=saveWith();
  assert.equal(A.completeEvent(save,'event-a',{choiceId:'x'}),true);
  assert.equal(A.completeEvent(save,'event-a',{choiceId:'y'}),false);
  assert.equal(A.markDiscovery(save,'viridian-forest-keepsake',{label:'Forest Keepsake'}),true);
  assert.equal(A.markDiscovery(save,'viridian-forest-keepsake',{label:'Again'}),false);
  A.setRequest(save,'viridian-parcel',{status:'available'});
  A.setRequest(save,'viridian-parcel',{status:'complete'});
  A.recordPartyAssist(save,'route1-search','Pikachu','small');
  const stats=A.stats(save);
  assert.equal(stats.completedEvents,1);
  assert.equal(stats.discoveries,1);
  assert.equal(stats.requestsCompleted,1);
  assert.equal(stats.partyAssists,1);
});
