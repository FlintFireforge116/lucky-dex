'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/arcade-fishing-core.js');const S=require('../app/src/main/assets/adventure/adventure-species.js');
const cat=C.buildCatalog(S.byId);
test('all nine fishing regions have usable area pools and cover every Water-type exactly once regionally',()=>{
 assert.equal(Object.keys(cat.regions).length,9);const all=[];for(const region of Object.values(cat.regions)){assert(region.species.length>0,region.name);for(const area of region.areas)assert(area.species.length>0,area.name);all.push(...region.species);}const expected=Object.values(S.byId).filter(p=>p.types?.includes('water')).map(p=>p.id).sort((a,b)=>a-b);assert.deepEqual(all.sort((a,b)=>a-b),expected);
});
test('616 species-by-rod fight simulations always stay bounded and terminate',()=>{
 let sims=0;for(const region of Object.values(cat.regions))for(const id of region.species)for(const rod of Object.keys(C.RODS)){const item=C.createCatch({species:S.byId[id],rolls:{size:((id*17)%100)/100},rod});let run=C.startFight(item,rod,id*100+rod.length);for(let i=0;i<4000&&run.phase==='playing';i++){C.stepFight(run,{hold:run.zoneY>run.fishY},16);for(const x of [run.fishY,run.zoneY,run.progress])assert(Number.isFinite(x)&&x>=0&&x<=1,`${id}/${rod} bounded`);}assert(['caught','escaped'].includes(run.phase),`${id}/${rod} terminates`);sims++;}assert.equal(sims,616);
});
test('ten thousand seeded rolls stay inside known catch categories',()=>{const counts={pokemon:0,junk:0,treasure:0};const regions=Object.values(cat.regions);for(let seed=1;seed<=10000;seed++){const r=regions[seed%regions.length],area=r.areas[seed%r.areas.length],c=C.rollCatch({area,speciesById:S.byId,settings:{},seed,rod:['old','good','super','deep'][seed%4],bait:['none','basic','honey','lure','pearl'][seed%5]});assert.ok(c&&counts[c.kind]!=null,`seed ${seed}`);counts[c.kind]++;}assert(counts.pokemon>5000);assert(counts.junk>0);assert(counts.treasure>0);});
