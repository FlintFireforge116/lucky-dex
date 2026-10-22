const test=require('node:test');
const assert=require('node:assert/strict');
const Species=require('../app/src/main/assets/adventure/adventure-species.js');
global.LuckyDexAdventureSpecies=Species;
const Auth=require('../app/src/main/assets/adventure/adventure-authored-events.js');
global.LuckyDexAdventureAuthored=Auth;
const K=require('../app/src/main/assets/adventure/adventure-kanto-events.js');

function baseSave(ids=[25,1,7]){
  const pokemon={},team=[];
  for(const id of ids){const key=`${id}:n`;pokemon[key]={...Species.byId[id],id,level:10,count:1};team.push(key);}
  const journey={region:'kanto',chapterIndex:0,badges:0,party:team.map(key=>({key,id:pokemon[key].id,name:pokemon[key].name})),completed:[],completedLocations:[]};
  const save={profile:{coins:0},inventory:{pokeball:0,potion:0,berry:0},pokemon,team,adventureRegional:{schema:2,journeys:{kanto:journey,johto:null,hoenn:null},activeRegion:'kanto',active:journey,records:{}}};
  return {save,journey};
}
const place=name=>({name,region:'kanto',id:'kanto-'+name.toLowerCase().replace(/\s+/g,'-')});

test('Pallet departure introduces Researcher and gives a finite preparation reward',()=>{
  const {save,journey}=baseSave();
  const e=K.eligible(save,journey,place('Pallet Town'));
  assert.equal(e[0].id,'kanto-pallet-departure');
  assert.equal(K.open(save,journey,e[0].id).applied,true);
  const out=K.choose(save,journey,e[0].id,'ready');
  assert.equal(out.applied,true);
  assert.equal(Auth.ensureState(save).recurringCharacters.researcherStage,1);
  assert.equal(save.inventory.pokeball,2);
  assert.equal(K.choose(save,journey,e[0].id,'ready').applied,false);
});

test('Route 1 Rival discovery acknowledges a qualifying party member but has a no-assist path',()=>{
  const withHelper=baseSave([25]);
  let event=K.eligible(withHelper.save,withHelper.journey,place('Route 1'))[0];
  assert.equal(event.id,'kanto-route1-rival');
  let opened=K.open(withHelper.save,withHelper.journey,event.id);
  assert.ok(opened.choices.some(c=>c.id==='partner'&&/Pikachu/.test(c.label)));
  let out=K.choose(withHelper.save,withHelper.journey,event.id,'partner');
  assert.equal(out.applied,true);
  assert.match(out.text,/Pikachu/);
  assert.equal(Auth.ensureState(withHelper.save).recurringCharacters.rivalStage,1);
  assert.ok(Auth.ensureState(withHelper.save).discoveries['route-1-trail-marker']);
  assert.equal(Auth.stats(withHelper.save).partyAssists,1);

  const noHelper=baseSave([143]);
  event=K.eligible(noHelper.save,noHelper.journey,place('Route 1'))[0];
  opened=K.open(noHelper.save,noHelper.journey,event.id);
  assert.ok(opened.choices.some(c=>c.id==='solo'));
  assert.equal(opened.choices.some(c=>c.id==='partner'),false);
  out=K.choose(noHelper.save,noHelper.journey,event.id,'solo');
  assert.equal(out.applied,true);
  assert.ok(Auth.ensureState(noHelper.save).discoveries['route-1-trail-marker']);
});

test('Viridian request persists through Forest discovery and turns in on backtrack',()=>{
  const {save,journey}=baseSave();
  let e=K.eligible(save,journey,place('Viridian City')).find(x=>x.id==='kanto-viridian-request');
  K.open(save,journey,e.id); K.choose(save,journey,e.id,'accept');
  assert.equal(Auth.ensureState(save).requests['viridian-lost-tag'].status,'available');

  e=K.eligible(save,journey,place('Viridian Forest')).find(x=>x.id==='kanto-forest-keepsake');
  K.open(save,journey,e.id); K.choose(save,journey,e.id,'partner');
  assert.equal(Auth.ensureState(save).requests['viridian-lost-tag'].status,'found');
  assert.ok(Auth.ensureState(save).discoveries['viridian-forest-keepsake']);

  journey.backtrack={name:'Viridian City',returnName:'Pewter City'};
  e=K.eligible(save,journey,place('Viridian City')).find(x=>x.id==='kanto-viridian-request-turnin');
  assert.ok(e);
  K.open(save,journey,e.id); K.choose(save,journey,e.id,'return');
  assert.equal(Auth.ensureState(save).requests['viridian-lost-tag'].status,'complete');
  assert.equal(save.profile.coins,75);
});


test('Viridian request can still be completed when the Forest tag was discovered first',()=>{
  const {save,journey}=baseSave();
  let e=K.eligible(save,journey,place('Viridian Forest')).find(x=>x.id==='kanto-forest-keepsake');
  K.open(save,journey,e.id); K.choose(save,journey,e.id,'search');
  assert.equal(Auth.ensureState(save).flags.viridianLostTagFound,true);

  e=K.eligible(save,journey,place('Viridian City')).find(x=>x.id==='kanto-viridian-request');
  K.open(save,journey,e.id); const accepted=K.choose(save,journey,e.id,'accept');
  assert.equal(accepted.applied,true);
  assert.equal(Auth.ensureState(save).requests['viridian-lost-tag'].status,'found');
  assert.match(accepted.text,/already|tag/i);
  assert.ok(K.eligible(save,journey,place('Viridian City')).some(x=>x.id==='kanto-viridian-request-turnin'));
});

test('Forest branch gives the same permanent discovery without requiring a capability',()=>{
  const noHelper=baseSave([143]);
  const e=K.eligible(noHelper.save,noHelper.journey,place('Viridian Forest')).find(x=>x.id==='kanto-forest-keepsake');
  const opened=K.open(noHelper.save,noHelper.journey,e.id);
  assert.deepEqual(opened.choices.map(c=>c.id),['search']);
  const out=K.choose(noHelper.save,noHelper.journey,e.id,'search');
  assert.equal(out.applied,true);
  assert.ok(Auth.ensureState(noHelper.save).discoveries['viridian-forest-keepsake']);
});

test('late saves skip first-meeting story events but keep optional Chapter 1 discoveries available by backtracking',()=>{
  const {save,journey}=baseSave();
  journey.badges=2; journey.chapterIndex=2; journey.completed=['kanto-c0-s4']; journey.backtrack={name:'Viridian Forest',returnName:'Cerulean City'};
  Auth.ensureState(save);
  assert.equal(K.eligible(save,journey,place('Pallet Town')).some(e=>e.id==='kanto-pallet-departure'),false);
  assert.equal(K.eligible(save,journey,place('Route 1')).some(e=>e.id==='kanto-route1-rival'),false);
  assert.equal(K.eligible(save,journey,place('Viridian Forest')).some(e=>e.id==='kanto-forest-keepsake'),true);
  journey.backtrack={name:'Viridian City',returnName:'Cerulean City'};
  assert.equal(K.eligible(save,journey,place('Viridian City')).some(e=>e.id==='kanto-viridian-request'),true,'optional Viridian request remains available to migrated saves');
});


test('an open Kanto authored event never leaks into another region or location',()=>{
  const {save,journey}=baseSave();
  journey.location='Route 1';
  const e=K.eligible(save,journey,place('Route 1')).find(x=>x.id==='kanto-route1-rival');
  K.open(save,journey,e.id);
  assert.equal(K.current(save,{region:'johto',location:'New Bark Town'}),null);
  assert.equal(K.current(save,{region:'kanto',location:'Viridian City'}),null);
  assert.equal(K.current(save,journey).id,'kanto-route1-rival','the event remains resumable at its real location');
});

test('Pewter museum teaser is one-time and non-economic',()=>{
  const {save,journey}=baseSave();
  const e=K.eligible(save,journey,place('Pewter City')).find(x=>x.id==='kanto-pewter-museum-teaser');
  assert.ok(e);
  K.open(save,journey,e.id); const out=K.choose(save,journey,e.id,'listen');
  assert.equal(out.applied,true);
  assert.equal(Auth.ensureState(save).flags.pewterMuseumTeaser,true);
  assert.equal(save.profile.coins,0);
});
