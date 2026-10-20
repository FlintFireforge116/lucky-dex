'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const A=require('../app/src/main/assets/adventure/adventure-location-activities.js');

test('water locations expose repeatable fishing capabilities while dry locations do not',()=>{
  const water=A.capabilitiesFor({id:'kanto-route-19',region:'kanto',name:'Route 19',kind:'coast'});
  assert.equal(water.length,1);assert.equal(water[0].type,'fish');assert.deepEqual(water[0].rods,['old','good','super']);assert.equal(water[0].repeatable,true);assert.equal(water[0].poolKey,'kanto-route-19');
  assert.deepEqual(A.capabilitiesFor({id:'johto-route-29',region:'johto',name:'Route 29',kind:'route'}),[]);
  assert.deepEqual(A.capabilitiesFor(null),[]);
});

test('activity state normalization is additive and help state is per activity',()=>{
  const save={profile:{coins:99},adventureRegional:{keep:'yes'}};
  const s=A.ensureState(save);assert.equal(save.profile.coins,99);assert.equal(save.adventureRegional.keep,'yes');assert.deepEqual(s.helpSeen,{});assert.deepEqual(s.records,{});
  s.helpSeen.fishing=true;assert.equal(A.ensureState(save).helpSeen.fishing,true);
});

test('activity actions are repeatable and additive',()=>{
  const save={};const place={id:'johto-route-40',region:'johto',name:'Route 40',kind:'coast'};
  assert.deepEqual(A.actionsFor(save,place),[{key:'fish',label:'FISH',activity:'fish'}]);
  assert.deepEqual(A.actionsFor(save,place),[{key:'fish',label:'FISH',activity:'fish'}]);
  assert.deepEqual(A.actionsFor(save,{id:'johto-route-29',region:'johto',name:'Route 29'}),[]);
});

test('shared shell module exposes lifecycle/help APIs and mobile stylesheet has fixed safe controls',()=>{
  const Shell=require('../app/src/main/assets/adventure/adventure-activity-shell.js');
  for(const k of ['open','close','pause','resume','showHelp','hideHelp','isInputLocked'])assert.equal(typeof Shell[k],'function',k);
  const css=fs.readFileSync(path.join(ROOT,'app/src/main/assets/adventure/adventure-activities.css'),'utf8');
  assert.match(css,/min-height:\s*44px/);assert.match(css,/\.adv-activity-controls\{[^}]*position:\s*relative/);assert.match(css,/safe-area-inset-bottom/);
});
