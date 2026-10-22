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

test('authored summary exposes unresolved and completed Chapter 1 content without duplicating rewards',()=>{
  const {s,j}=at('kanto-c0-s3');
  let summary=F.authoredSummary(s,j,F.describe(j));
  assert.equal(summary.discoveriesFound,0);
  assert.equal(summary.discoveriesTotal,1);
  assert.equal(summary.available,1);

  const row=F.actionsFor(s,j).find(a=>a.authoredEventId==='kanto-forest-keepsake');
  F.perform(s,row.key);
  const before=s.inventory.potion;
  assert.equal(F.chooseAuthored(s,'kanto-forest-keepsake','partner').applied,true);
  assert.equal(F.chooseAuthored(s,'kanto-forest-keepsake','partner').applied,false);
  assert.equal(s.inventory.potion,before+1);
  summary=F.authoredSummary(s,j,F.describe(j));
  assert.equal(summary.discoveriesFound,1);
  assert.equal(summary.available,0);
});

test('Viridian request summary changes from open to found to complete and remains visible on backtrack',()=>{
  const {s,j}=at('kanto-c0-s2');
  let row=F.actionsFor(s,j).find(a=>a.authoredEventId==='kanto-viridian-request');
  F.perform(s,row.key); F.chooseAuthored(s,'kanto-viridian-request','accept');
  let summary=F.authoredSummary(s,j,F.describe(j));
  assert.equal(summary.requestStatus,'available');

  j.backtrack={name:'Viridian Forest',returnName:'Viridian City'};j.location='Viridian Forest';j.locationFlow=null;
  row=F.actionsFor(s,j).find(a=>a.authoredEventId==='kanto-forest-keepsake');
  F.perform(s,row.key); F.chooseAuthored(s,'kanto-forest-keepsake','partner');
  j.backtrack={name:'Viridian City',returnName:'Pewter City'};j.location='Viridian City';j.locationFlow=null;
  summary=F.authoredSummary(s,j,F.describe(j));
  assert.equal(summary.requestStatus,'found');
  assert.ok(F.actionsFor(s,j).some(a=>a.authoredEventId==='kanto-viridian-request-turnin'));
  row=F.actionsFor(s,j).find(a=>a.authoredEventId==='kanto-viridian-request-turnin');
  F.perform(s,row.key); F.chooseAuthored(s,'kanto-viridian-request-turnin','return');
  summary=F.authoredSummary(s,j,F.describe(j));
  assert.equal(summary.requestStatus,'complete');
});

test('late Kanto save migration establishes recurring continuity without changing badges or chapter',()=>{
  const s=fresh();
  const j=E.start(s,'kanto',17);j.badges=4;j.chapterIndex=4;j.completed.push('kanto-c0-s4');
  const before={badges:j.badges,chapter:j.chapterIndex};
  F.authoredSummary(s,j,{name:'Viridian Forest',region:'kanto'});
  const a=Auth.ensureState(s);
  assert.deepEqual({badges:j.badges,chapter:j.chapterIndex},before);
  assert.ok(a.recurringCharacters.rivalStage>=1);
  assert.ok(a.recurringCharacters.researcherStage>=1);
});

test('journey map renders concise authored completion markers rather than hiding revisit content',()=>{
  const ui=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-regional-ui.js'),'utf8');
  assert.match(ui,/authoredSummary\(state\(\),r,/);
  assert.match(ui,/adv3-map-authored/);
});
