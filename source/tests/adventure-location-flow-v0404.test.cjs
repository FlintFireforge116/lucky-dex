const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
const F=require('../app/src/main/assets/adventure/adventure-location-flow.js');

const fresh=()=>({pokemon:{'1:n':{...S.byId[1],level:5,count:1}},team:['1:n'],profile:{coins:1000},inventory:{potion:5,pokeball:20},stats:{}});
function at(region,nodeId){const s=fresh(),j=E.start(s,region,17),n=j.nodes.find(row=>row.id===nodeId);j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.location=n.name;delete j.locationFlow;return {s,j,n};}
const actions=s=>F.actionsFor(s,s.adventureRegional.active);

test('route encounter and rare detour collapse to one Explore Area and local Wild Hunt is absent',()=>{
  const {s}=at('johto','johto-c0-s1');
  const rows=actions(s);
  assert.equal(rows.filter(x=>x.label==='EXPLORE AREA').length,1);
  assert(!rows.some(x=>/SEARCH GRASS|SEARCH POKÉMON|RARE POKÉMON|WILD HUNT/.test(x.label)));
  const explore=rows.find(x=>x.label==='EXPLORE AREA');
  assert.equal(explore.key,'explore');
  assert.equal(explore.nodeId,'johto-c0-s1','required encounter remains the first progression gate');
});

test('authored trainer stays a separate Trainer action instead of being buried in Explore Area',()=>{
  const {s}=at('kanto','kanto-c0-s3');
  const rows=actions(s);
  assert(rows.some(x=>x.key==='battle'&&x.label==='TRAINER'));
  assert(!rows.some(x=>x.label==='EXPLORE AREA'));
});

test('settlement does not show a generic no-op Explore button when there is nothing to search',()=>{
  const {s}=at('johto','johto-c0-s2');
  const rows=actions(s);
  assert(rows.some(x=>x.key==='talk'));
  assert(rows.some(x=>x.key==='center'));
  assert(rows.some(x=>x.key==='mart'));
  assert(!rows.some(x=>x.key==='explore'));
});

test('real supply search still appears as Explore Area and remains one-time',()=>{
  const {s,j}=at('johto','johto-c0-s0');
  const before=s.profile.coins;
  let row=actions(s).find(x=>x.key==='explore');
  assert(row);assert.equal(row.label,'EXPLORE AREA');assert.match(row.nodeId,/supplies$/);
  assert(F.perform(s,'explore').applied);assert(F.settleRoutine(s).applied);
  assert.equal(s.profile.coins,before+40);
  row=actions(s).find(x=>x.key==='explore'&&x.nodeId==='johto-c0-supplies');
  assert(!row,'claimed supply cache is not offered again');
  assert.equal(F.describe(j).name,'New Bark Town');
});

test('journey MAP is wired to an active-region journey map rather than region selection',()=>{
  const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-regional-ui.js'),'utf8');
  assert.match(src,/button\('journey-map','MAP'\)/);
  assert.match(src,/function journeyMap\(/);
  assert.match(src,/r\.region==='kanto'/);
  assert.match(src,/adv3-journey-map-stops/);
  assert.doesNotMatch(src,/function locationTools\(\).*button\('regions','MAP'/s);
});
