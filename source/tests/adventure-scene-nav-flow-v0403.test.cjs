const assert=require('node:assert/strict'),{test}=require('node:test');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js'),S=require('../app/src/main/assets/adventure/adventure-species.js'),F=require('../app/src/main/assets/adventure/adventure-location-flow.js');
const fresh=region=>{const s={pokemon:{'1:n':{...S.byId[1],level:30,count:1}},team:['1:n'],profile:{coins:1000},inventory:{potion:4,pokeball:20},stats:{}};E.start(s,region,17);return s};
function at(s,id){const j=s.adventureRegional.active,n=j.nodes.find(n=>n.id===id);Object.assign(j,{depth:n.depth,chapterIndex:n.chapterIndex,sectionIndex:n.sectionIndex,phase:'map',current:null,battle:null,location:n.name,locationFlow:null});return j}
const mechanics=s=>{const j=s.adventureRegional.active;return JSON.stringify({depth:j.depth,phase:j.phase,current:j.current,battle:j.battle,party:j.party,claims:j.claims,completed:j.completed,checkpoint:j.checkpoint,coins:s.profile.coins,inventory:s.inventory,stats:s.stats})};
test('place objectives use short world-facing copy for route, cave, tower, coast and Gym',()=>{
 const s=fresh('johto');for(const [id,expected] of [['johto-c0-s1','Wild encounter ahead'],['johto-c0-s3','Trainer battle'],['johto-c1-s1','Find the way through']]){const j=at(s,id);if(id.endsWith('s3')){assert.equal(F.describe(j).objective,'Follow the path','Route30 does not promise the tower trainer here');F.continue(s);assert.equal(F.describe(j).objective,'Follow the path','Route31 has onward travel, not a local trainer');F.continue(s)}assert.equal(F.describe(j).objective,expected)}
 const h=fresh('hoenn'),j=h.adventureRegional.active,n=j.nodes.find(n=>n.name==='Route 124'&&!n.optional);at(h,n.id);assert.equal(F.describe(j).objective,'Cross the water route');
});
test('visible local destination owns onward travel once, while route exit remains available',()=>{
 const s=fresh('johto'),j=at(s,'johto-c0-s4');const actions=F.actionsFor(s,j),gym=actions.find(a=>a.key==='gym');assert.equal(gym.destinationId,F.describe(j).nextId);assert.equal(typeof F.travelFor,'function');assert.equal(F.travelFor(s,j),null,'no duplicate city→Gym footer');
 at(s,'johto-c0-s1');assert(F.travelFor(s,j),'route keeps its real onward control');
 assert.equal(F.travelFor(s,j,[{key:'enter',destinationId:F.describe(j).nextId}]),null,'general destination identity suppresses duplicates');
});
test('leaving an unchallenged Violet Gym returns only to its city, persists and changes no mechanics',()=>{
 const s=fresh('johto'),j=at(s,'johto-c0-s4');assert(F.perform(s,'gym').applied);assert.equal(F.describe(j).name,'Violet Gym');assert(F.actionsFor(s).some(a=>a.key==='leave-gym'));const before=mechanics(s);
 assert(F.perform(s,'leave-gym').applied);assert.equal(F.describe(j).name,'Violet City');assert.equal(mechanics(s),before);assert.equal(F.feedbackFor(j),'');
 const reload=JSON.parse(JSON.stringify(s));E.ensureSave(reload);assert.equal(F.describe(reload.adventureRegional.active).name,'Violet City');assert(F.perform(reload,'gym').applied);assert.equal(F.describe(reload.adventureRegional.active).name,'Violet Gym');assert.equal(mechanics(reload),before);
});
test('old single-place Gym presentation state keeps Gym identity and can leave/re-enter without travelling',()=>{
 const s=fresh('kanto'),j=at(s,'kanto-c0-s4');j.locationFlow={nodeId:j.nodes.find(n=>n.depth===j.depth&&!n.optional).id,step:0,traversal:j.traversal,feedback:null};assert.equal(F.describe(j).name,'Pewter Gym','old v402step0 is already inside Gym');const before=mechanics(s);
 assert(F.perform(s,'leave-gym').applied);assert.equal(F.describe(j).name,'Pewter City');assert.equal(mechanics(s),before);assert(F.perform(s,'gym').applied);assert.equal(F.describe(j).name,'Pewter Gym');assert.equal(mechanics(s),before);
});
test('an active Gym battle cannot leave; completed badge travels once to Route32',()=>{
 const s=fresh('johto'),j=at(s,'johto-c0-s4');F.perform(s,'gym');assert(E.enter(s,'johto-c0-s4'));assert(!F.perform(s,'leave-gym').applied);j.battle.result={kind:'victory'};j.battle.phase='terminal';assert(E.settleBattle(s));assert.equal(j.badges,1);assert.equal(F.describe(j).nextLabel,'Route 32');assert.equal(F.travelFor(s,j).destinationId,'johto-route-32');assert(F.continue(s).applied);assert.equal(F.describe(j).name,'Route 32');assert.equal(j.badges,1);assert.equal(F.feedbackFor(j),'');
});
