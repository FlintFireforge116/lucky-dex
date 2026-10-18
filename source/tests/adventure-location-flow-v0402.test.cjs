const assert=require('node:assert/strict');
const {test}=require('node:test');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
let F;try{F=require('../app/src/main/assets/adventure/adventure-location-flow.js')}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;F={}}
const fresh=()=>({pokemon:{'1:n':{...S.byId[1],level:5,count:1}},team:['1:n'],profile:{coins:1000},inventory:{potion:5,pokeball:20},stats:{}});
const setup=()=>{const s=fresh();E.start(s,'johto',17);return s};
const keys=s=>F.actionsFor(s,s.adventureRegional.active).map(a=>a.key);
const win=s=>{const j=s.adventureRegional.active;assert(j.battle);j.battle.result={kind:'victory'};j.battle.phase='terminal';assert(E.settleBattle(s))};
test('starting town identity hides fake Center, fishing and universal tools',()=>{
 const s=setup(),j=s.adventureRegional.active;assert.equal(typeof F.describe,'function','location flow API must exist');
 assert.equal(F.describe(j).name,'New Bark Town');assert.equal(F.describe(j).kind,'town');assert.equal(F.describe(j).nextLabel,'Route 29');
 assert(keys(s).includes('heal'));assert(!keys(s).includes('center'));assert(!keys(s).includes('fish'));assert(!keys(s).some(k=>['party','bag','map'].includes(k)));
 assert(F.actionsFor(s,j).every(a=>!a.disabled));assert(F.actionsFor(s,j).length<=6);
});
test('talk and authored home recovery stay local; explicit leave clears feedback without reward',()=>{
 const s=setup(),j=s.adventureRegional.active,p=j.party[0];p.hp=10;const before=s.profile.coins;
 assert.equal(typeof F.perform,'function','location action API must exist');assert(F.perform(s,'talk').applied);assert.equal(j.depth,0);assert.equal(p.hp,10);
 assert(F.perform(s,'heal').applied);assert.equal(j.depth,0);assert(j.party[0].hp>10);assert(j.party[0].hp<j.party[0].maxHp,'home retains existing 12% event recovery');
 assert(F.feedbackFor(j));assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Route 29');assert.equal(F.feedbackFor(j),'');assert.equal(s.profile.coins,before);
 assert(!keys(s).includes('fish'));assert(!keys(s).includes('heal'));assert(!keys(s).includes('center'));
});
test('required battle cannot be skipped and camp can be left without healing or grants',()=>{
 const s=setup(),j=s.adventureRegional.active;assert.equal(typeof F.continue,'function','explicit travel API must exist');assert(F.continue(s).applied);
 const serialized=JSON.stringify(s);assert.equal(F.continue(s).applied,false);assert.equal(JSON.stringify(s),serialized);
 assert(F.perform(s,'explore').applied);win(s);assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Cherrygrove City');
 j.party[0].hp=12;const coins=s.profile.coins,potions=s.inventory.potion;assert(keys(s).includes('center'));assert(keys(s).includes('mart'));
 assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Route 30');assert.equal(j.party[0].hp,12);assert.equal(s.profile.coins,coins);assert.equal(s.inventory.potion,potions);assert(!j.claims['johto-c0-s2']);
});
test('first Gym chapter has persistent Route30/31, tower, city and Gym waypoints on original nodes',()=>{
 let s=setup();let j=s.adventureRegional.active;assert.equal(typeof F.continue,'function','waypoint flow API must exist');const ids=j.nodes.map(n=>n.id);
 F.continue(s);F.perform(s,'explore');win(s);F.continue(s);F.continue(s);assert.equal(F.describe(j).name,'Route 30');assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Route 31');
 s=JSON.parse(JSON.stringify(s));E.ensureSave(s);j=s.adventureRegional.active;assert.equal(F.describe(j).name,'Route 31');assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Sprout Tower');assert.equal(j.depth,3);
 assert.equal(F.continue(s).applied,false);assert(F.perform(s,'battle').applied);win(s);assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Violet City');
 assert(keys(s).includes('gym'));assert(F.perform(s,'gym').applied);assert.equal(F.describe(j).name,'Violet Gym');assert.equal(j.depth,4);assert.equal(F.continue(s).applied,false);
 assert(F.perform(s,'battle').applied);win(s);assert.equal(j.badges,1);assert.equal(j.phase,'result');assert.equal(F.settleRoutine(s).applied,false,'badge remains in milestone flow');
 assert.deepEqual(j.nodes.map(n=>n.id),ids);assert.equal(s.adventureRegional.schema,2);
});
test('scene selection uses exact override then category then habitat',()=>{
 assert.equal(typeof F.sceneFor,'function','scene hierarchy API must exist');const assets={places:{'johto-new-bark-town':'exact.png'},categories:{johto:{town:'town.png',route:'route.png'}},destinations:{meadow:{scene:'grass.png'}}};
 assert.equal(F.sceneFor({id:'johto-new-bark-town',kind:'town',region:'johto',habitat:'meadow'},assets),'exact.png');
 assert.equal(F.sceneFor({id:'other',kind:'town',region:'johto',habitat:'meadow'},assets),'town.png');
 assert.equal(F.sceneFor({id:'other',kind:'unknown',region:'johto',habitat:'meadow'},assets),'grass.png');
});
test('local notices persist on same place but never leak across external movement',()=>{
 const s=setup(),j=s.adventureRegional.active;assert.equal(typeof F.perform,'function','feedback API must exist');F.perform(s,'talk');const text=F.feedbackFor(j);assert(text);
 const reload=JSON.parse(JSON.stringify(s));E.ensureSave(reload);assert.equal(F.feedbackFor(reload.adventureRegional.active),text);
 assert(E.enter(s,'johto-c0-s0'));assert(E.resolveNode(s));assert(E.advance(s));assert.equal(F.feedbackFor(j),'');
});
test('one-time local exploration rewards cannot repeat after reload and remain at their actual place',()=>{
 let s=setup();assert.equal(typeof F.perform,'function','authored exploration API must exist');const before=s.profile.coins;
 assert(F.perform(s,'explore').applied);assert(F.settleRoutine(s).applied);let j=s.adventureRegional.active;
 assert.equal(F.describe(j).name,'New Bark Town');assert.equal(j.depth,0);assert.equal(s.profile.coins,before+40);assert.equal(s.inventory.potion,6);assert.equal(s.inventory.pokeball,22);
 s=JSON.parse(JSON.stringify(s));E.ensureSave(s);j=s.adventureRegional.active;const paid=JSON.stringify({coins:s.profile.coins,inventory:s.inventory});
 F.perform(s,'explore');F.settleRoutine(s);assert.equal(JSON.stringify({coins:s.profile.coins,inventory:s.inventory}),paid);assert(F.continue(s).applied);assert.equal(F.feedbackFor(j),'');
});
test('place categories outrank compressed habitat and unsupported services stay absent',()=>{
 assert.equal(typeof F.describe,'function','place profiles API must exist');
 const fixtures=[['kanto',1,'Mt. Moon','cave'],['johto',4,'Cianwood City','city'],['hoenn',1,'Dewford Town','town'],['hoenn',7,'Route 124','coast'],['hoenn',3,'Mt. Chimney','mountain']];
 for(const [region,chapter,name,kind] of fixtures){const s=fresh(),j=E.start(s,region,17),n=j.nodes.find(n=>!n.optional&&n.chapterIndex===chapter&&n.name===name);j.depth=n.depth;j.chapterIndex=chapter;j.sectionIndex=n.sectionIndex;j.location=name;
  assert.equal(F.describe(j).name,name);assert.equal(F.describe(j).kind,kind);if(['Cianwood City','Dewford Town'].includes(name))assert(!keys(s).includes('mart'),'unsupported regular Mart is hidden');
 }
});
test('defeat and replay clear presentation steps and feedback even when returning to same node depth',()=>{
 const s=setup(),j=s.adventureRegional.active;assert.equal(typeof F.perform,'function','feedback lifecycle API must exist');F.perform(s,'talk');assert(F.feedbackFor(j));assert(E.defeat(s));assert.equal(F.feedbackFor(j),'');assert.equal(F.describe(j).name,'New Bark Town');
});
test('Gym has a real challenge without generic exploration filler or a healing gate',()=>{
 const s=setup(),j=s.adventureRegional.active,n=j.nodes.find(n=>n.id==='johto-c0-s4');j.depth=n.depth;j.chapterIndex=0;j.sectionIndex=4;j.locationFlow={nodeId:n.id,step:1,traversal:0};j.party[0].hp=1;
 assert(keys(s).includes('battle'));assert(!keys(s).includes('explore'));assert(!keys(s).includes('center'));assert(F.perform(s,'battle').applied);assert.equal(j.phase,'battle');
});
test('a city-named Gym node presents its actual Gym rather than fake town services',()=>{
 const s=fresh(),j=E.start(s,'kanto',17),n=j.nodes.find(n=>n.id==='kanto-c0-s4');j.depth=n.depth;j.sectionIndex=n.sectionIndex;
 assert.equal(F.describe(j).name,'Pewter Gym');assert.equal(F.describe(j).kind,'gym');assert(!F.describe(j).services.center);assert(!keys(s).includes('mart'));assert.deepEqual(keys(s),['battle','leave-gym']);
});
test('missing exact art references fall back to the available regional category',()=>{
 const p={id:'johto-new-bark-town',name:'New Bark Town',kind:'town',region:'johto',habitat:'meadow'},art={named:{johto:{'New Bark Town':'missing-scene'}},categories:{johto:{town:'johto-town'}},scenes:{'johto-town':{path:'adventure/location-scenes/johto-town.png'}}};
 assert.equal(F.sceneFor(p,art,{destinations:{meadow:{scene:'grass.png'}}}),'adventure/location-scenes/johto-town.png');
});
test('authored Pallet home camp heals once then hides its already resolved action',()=>{
 const s=fresh(),j=E.start(s,'kanto',17),n=j.nodes.find(n=>n.id==='kanto-c7-s1');j.depth=n.depth;j.chapterIndex=7;j.sectionIndex=1;j.party[0].hp=1;
 assert(keys(s).includes('heal'));assert(F.perform(s,'heal').applied);assert.equal(j.party[0].hp,j.party[0].maxHp);assert(!keys(s).includes('heal'),'an action that cannot execute must be hidden');assert(!keys(s).includes('center'));assert(F.continue(s).applied);
});
test('new cache exploration replaces an earlier local hint with the reward outcome',()=>{
 const s=setup(),j=s.adventureRegional.active;assert(F.perform(s,'talk').applied);const old=F.feedbackFor(j);assert(old.includes('Cherrygrove'));
 assert(F.perform(s,'explore').applied);assert(F.settleRoutine(s).applied);const next=F.feedbackFor(j);assert.notEqual(next,old);assert(next.includes('Lucky Coins'));assert(next.includes('Potion'));assert(next.includes('Poké Balls'));
});
test('opening the local Mart clears the previous Center notice',()=>{
 const s=setup(),j=s.adventureRegional.active;F.continue(s);F.perform(s,'explore');win(s);F.continue(s);assert(F.perform(s,'center').applied);assert(F.feedbackFor(j).includes('restored'));
 const result=F.perform(s,'mart');assert(result.applied);assert.equal(result.screen,'mart');assert.equal(F.feedbackFor(j),'');
});
test('unsettled section and optional-result phases do not expose local menu actions that cannot execute',()=>{
 const s=setup(),j=s.adventureRegional.active;assert(E.enter(s,'johto-c0-supplies'));assert.deepEqual(F.actionsFor(s,j),[],'open section choices own their controls');
 assert(E.resolveNode(s));assert.deepEqual(F.actionsFor(s,j),[],'settle an optional result before opening the local menu');assert(F.settleRoutine(s).applied);assert(F.actionsFor(s,j).length>0);
 const reload=JSON.parse(JSON.stringify(s));E.ensureSave(reload);assert(keys(reload).includes('heal'),'home event remains a real available action after optional cache');assert(F.perform(reload,'heal').applied);assert(!keys(reload).includes('heal'));
 const healed=JSON.parse(JSON.stringify(reload));E.ensureSave(healed);assert(!keys(healed).includes('heal'),'resolved healing stays hidden after reload');
});
test('required encounter feedback settles once; dismiss and replacement survive rerender and reload',()=>{
 const s=setup();F.continue(s);assert(F.perform(s,'explore').applied);win(s);
 assert(F.settleRoutine(s).applied);const j=s.adventureRegional.active;
 assert.equal(F.feedbackFor(j),'Encounter cleared.');assert(F.dismiss(j));
 assert.equal(F.settleRoutine(s).applied,false);assert.equal(F.feedbackFor(j),'');
 const reload=JSON.parse(JSON.stringify(s));assert.equal(F.settleRoutine(reload).applied,false);assert.equal(F.feedbackFor(reload.adventureRegional.active),'');
});
