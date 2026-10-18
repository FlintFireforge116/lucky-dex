const fs=require('fs'),assert=require('assert');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const F=require('../app/src/main/assets/adventure/adventure-location-flow.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
const save={pokemon:{'25:n':{...S.byId[25],id:25,level:20,count:1}},team:['25:n'],profile:{coins:1000,xp:0},inventory:{},stats:{},settings:{}};
const j=E.start(save,'kanto',456);
const forest=j.nodes.find(n=>!n.optional&&n.name==='Viridian Forest');
j.depth=forest.depth;j.chapterIndex=forest.chapterIndex;j.sectionIndex=forest.sectionIndex;j.current=null;j.phase='map';j.location='Viridian Forest';j.completedLocations=[];j.locationFlow=null;
assert.ok(F.actionsFor(save,j).some(a=>a.key==='hunt-local'),'Viridian Forest should offer local encounters on the first visit, not only after backtracking');

const controller=fs.readFileSync('app/src/main/assets/adventure/adventure-controller.js','utf8');
assert.match(controller,/showMartHome/,'Adventure home should decide whether the current Journey location actually has a Mart');
assert.match(controller,/showMartHome\?button\('mart'/,'home Poké Mart entry should be conditional while a Journey is active');
console.log('PASS v0.55.6 local catch access and Mart gating');
