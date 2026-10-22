const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
global.LuckyDexAdventureSpecies=S;
const Auth=require('../app/src/main/assets/adventure/adventure-authored-events.js');
global.LuckyDexAdventureAuthored=Auth;
const K=require('../app/src/main/assets/adventure/adventure-kanto-events.js');
global.LuckyDexKantoAuthored=K;
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
global.LuckyDexRegionalEngine=E;
const Activities=require('../app/src/main/assets/adventure/adventure-location-activities.js');
global.LuckyDexAdventureActivities=Activities;
const F=require('../app/src/main/assets/adventure/adventure-location-flow.js');

const fresh=()=>({pokemon:{'25:n':{...S.byId[25],level:8,count:1}},team:['25:n'],profile:{coins:0},inventory:{pokeball:5,potion:2,berry:2},stats:{}});
function at(nodeId){const s=fresh(),j=E.start(s,'kanto',17),n=j.nodes.find(row=>row.id===nodeId);j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.location=n.name;delete j.locationFlow;return{s,j,n};}

test('authored actions are prioritised while existing fishing and battle actions still coexist',()=>{
  let {s}=at('kanto-c0-s0');
  let rows=F.actionsFor(s,s.adventureRegional.active);
  assert.equal(rows[0].authoredEventId,'kanto-pallet-departure');
  assert.ok(rows.some(a=>a.key==='fish'),'Pallet fishing remains visible');
  assert.equal(rows.some(a=>a.key==='explore'&&a.label==='EXPLORE AREA'),false,'authored Pallet send-off replaces the old generic explore filler');

  ({s}=at('kanto-c0-s3'));
  rows=F.actionsFor(s,s.adventureRegional.active);
  assert.equal(rows[0].authoredEventId,'kanto-forest-keepsake');
  assert.ok(rows.some(a=>a.key==='battle'&&a.label==='TRAINER'),'authored Forest content does not replace the existing trainer battle');
});

test('performing an authored action opens serializable event state instead of resolving it immediately',()=>{
  const {s,j}=at('kanto-c0-s1');
  const row=F.actionsFor(s,j).find(a=>a.authoredEventId==='kanto-route1-rival');
  const out=F.perform(s,row.key);
  assert.equal(out.applied,true);
  assert.equal(out.authoredEvent.id,'kanto-route1-rival');
  assert.equal(Auth.ensureState(s).activeEvent.id,'kanto-route1-rival');
  const restored=JSON.parse(JSON.stringify(s));
  const view=K.current(restored,restored.adventureRegional.active);
  assert.equal(view.id,'kanto-route1-rival');
  assert.ok(view.choices.every(c=>c.label));
});

test('location capability diagnostics expose reusable Chapter 1 activity types without creating duplicate generic buttons',()=>{
  const route=Activities.capabilitiesFor({region:'kanto',name:'Route 1'}).map(x=>x.type);
  assert.ok(route.includes('search'));
  assert.ok(route.includes('partyAssist'));
  const city=Activities.capabilitiesFor({region:'kanto',name:'Viridian City'}).map(x=>x.type);
  assert.ok(city.includes('npcRequest'));
  const actions=Activities.actionsFor({}, {region:'kanto',name:'Route 1'});
  assert.equal(actions.some(a=>a.key==='search'||a.key==='partyAssist'),false,'authored-only capabilities are not duplicated as generic actions');
});

test('regional UI contains the authored event shell and mobile-safe choice controls',()=>{
  const ui=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-regional-ui.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-activities.css'),'utf8');
  assert.match(ui,/function authoredEvent\(/);
  assert.match(ui,/data-authored-choice/);
  assert.match(ui,/K\.current\(state\(\),r\)/);
  assert.match(css,/\.adv3-authored-choices[\s\S]*min-height:\s*44px/);
});
