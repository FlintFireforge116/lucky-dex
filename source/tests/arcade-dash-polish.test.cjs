const assert=require('assert'),path=require('path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const c=require(path.join(assets,'arcade-dash-config.js'));
global.LuckyDexAdventureSpecies=require(path.join(assets,'adventure/adventure-species.js'));
const d=require(path.join(assets,'arcade-dash.js'));
assert.equal(typeof c.isRacerEligible,'function','one authoritative eligibility helper');
for(const [difficulty,lo,hi] of [['easy',20,65],['normal',55,100],['hard',90,135],['expert',100,180]]){
  for(const [speed,eligible,reason] of [[lo-1,false,'too-slow'],[lo,true,'eligible'],[hi,true,'eligible'],[hi+1,false,'too-fast']])assert.deepEqual(c.isRacerEligible({baseSpeed:speed,types:['fire','flying']},{mode:'league',type:'flying',difficulty}),{eligible,reason});
  assert.equal(c.isRacerEligible({baseSpeed:lo,types:['fire']},{mode:'league',type:'water',difficulty}).reason,'wrong-type');
  const values=Object.values(global.LuckyDexAdventureSpecies.byId);
  for(const type of c.TYPE_ORDER){const available=values.filter(r=>r.types.includes(type)&&r.baseStats.speed>=lo&&r.baseStats.speed<=hi);assert(available.length>=5,`${type}/${difficulty}: ${available.length}`);const rows=d.aiPool({id:25,level:10},1927,{difficulty,type});assert.equal(rows.length,5);assert(rows.every(r=>c.isRacerEligible(r,{mode:'league',type,difficulty}).eligible));assert.deepEqual(rows,d.aiPool({id:25,level:10},1927,{difficulty,type}));const span=Math.max(...rows.map(r=>r.baseSpeed))-Math.min(...rows.map(r=>r.baseSpeed)),availableSpan=Math.max(...available.map(r=>r.baseStats.speed))-Math.min(...available.map(r=>r.baseStats.speed));assert(span>=availableSpan*.5,`${type}/${difficulty} span ${span}/${availableSpan}`)}
  assert(d.paceModifier(hi)/d.paceModifier(lo)>1.08,'meaningful band pace spread');
}
assert(Math.abs(d.paceModifier(10)-.65)<.01);assert(Math.abs(d.paceModifier(180)-1.24)<.01);assert(d.paceModifier(180)/d.paceModifier(10)>=1.90);
for(let n=21;n<=180;n++)assert(d.paceModifier(n)>d.paceModifier(n-1));
assert(d.levelModifier(50)<=.04);
global.LuckyDexArcadePlatform={dashRacers:()=>[{key:'slow',id:1,baseSpeed:19,types:['grass']},{key:'fast',id:25,baseSpeed:90,types:['electric']}],ensureArcadeState:x=>x};global.state={arcade:{dash:{lastQuickRacerKey:'fast'}}};
d.chooseMode('quick');d.chooseDifficulty('easy');assert.equal(d.selectRacer('fast'),false);assert.equal(d.startRace('fast'),false);assert.equal(d.startRace('slow'),false);
const original=global.LuckyDexAdventureSpecies;global.LuckyDexAdventureSpecies={byId:{1:{name:'only',types:['fire'],baseStats:{speed:60}},2:{name:'fast',types:['fire'],baseStats:{speed:150}}}};
assert(d.aiPool({},1,{difficulty:'easy',type:'fire'}).every(r=>r.baseSpeed===60),'sparse pool repeats in-band');assert.equal(d.aiPool({},1,{difficulty:'easy',type:'water'}).length,0);global.LuckyDexAdventureSpecies=original;
const field=d.createRaceState({key:'p',id:25,baseSpeed:100,level:1},[1,2,3,4,5].map((id,i)=>({key:'a'+id,id,baseSpeed:180-i*15,level:1})),{difficulty:'expert',seed:99,course:{finishDistance:1800,objects:[]}});assert(field.racers.every(r=>r.distance===0),'visual starting grid grants no distance advantage');field.racers.slice(1).forEach(r=>r.ai.sprintAggression=0);for(let i=0;i<300;i++)d.stepRace(field,.05,{sprint:false,targetLane:1});assert(d.distanceToCanvasY(field.racers[1].distance,field.racers[0].distance,720)<0,'faster rival naturally leaves player screen');
console.log('PASS hard eligibility, 72 real species pools, seeded speed diversity, pace and defensive entry');
