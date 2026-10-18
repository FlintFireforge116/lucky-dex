const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const config=require(path.join(root,'app/src/main/assets/arcade-dash-config.js'));
const dash=require(path.join(root,'app/src/main/assets/arcade-dash.js'));

assert.deepStrictEqual(config.GOLDENROD_DIVISION_AI_KEYS,{rookie:'easy',poke:'poke',great:'normal',ultra:'hard',master:'expert'},'Goldenrod divisions must map to the intended Dash AI ladder');
const poke=config.goldenrodAiProfile('poke');
const easy=config.DIFFICULTIES.easy.ai,normal=config.DIFFICULTIES.normal.ai;
assert.ok(poke.reaction<easy.reaction&&poke.reaction>normal.reaction,'Poké reaction should sit between Easy and Normal');
assert.ok(poke.mistake<easy.mistake&&poke.mistake>normal.mistake,'Poké mistakes should sit between Easy and Normal');

for(const type of config.TYPE_ORDER){
  const round=dash.prepareGoldenrodRound({mode:'type',divisionId:'great',type,seed:123,player:{key:'p',id:25,name:'Pikachu',level:20,baseSpeed:90,types:[type]},aiEntrants:Array.from({length:5},(_,i)=>({key:`a${i}`,id:100+i,name:`AI${i}`,level:20,baseSpeed:80,types:[type]}))});
  assert.strictEqual(round.theme,type,`${type} Type Cup must retain its outdoor type course`);
  assert.strictEqual(round.race.racers.length,6,'Goldenrod Dash must still show six racers');
  assert.strictEqual(round.race.mode,'goldenrod');
}
const neutral=dash.prepareGoldenrodRound({mode:'division',divisionId:'rookie',seed:7,player:{key:'p',id:1,name:'Bulbasaur',level:10,baseSpeed:45,types:['grass']},aiEntrants:Array.from({length:5},(_,i)=>({key:`a${i}`,id:10+i,name:`AI${i}`,level:10,baseSpeed:50,types:['normal']}))});
assert.strictEqual(neutral.theme,'normal','Division Cups must use the neutral outdoor Goldenrod route');
assert.strictEqual(neutral.race.difficulty,'easy');
assert.ok(neutral.race.racers.every(r=>Number.isFinite(r.stamina)&&Number.isFinite(r.laneVisual)),'race physics/state must retain stamina and lanes');
assert.ok(Array.isArray(neutral.race.course.objects),'race course must retain hazards and pickups');

let completion=null;
const fakeRace={...neutral.race,completed:true,racers:neutral.race.racers.map((r,i)=>({...r,finished:true,finishTimeMs:30000+i*1000,distance:9999}))};
const out=dash.completeGoldenrodRound(fakeRace,{onComplete:r=>completion=r});
assert.strictEqual(out.metric,30000);
assert.strictEqual(out.eventId,'dash');
assert.strictEqual(out.raw.place,1);
assert.deepStrictEqual(out.rareReceipts,[]);
assert.deepStrictEqual(completion,out,'Goldenrod round must report to shared controller');

const source=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-dash.js'),'utf8');
const startAt=source.indexOf('function startGoldenrodRound');
const endAt=source.indexOf('function startExhibition',startAt);
const startBlock=source.slice(startAt,endAt);
assert.ok(startBlock.includes('prepareGoldenrodRound'),'Dash Goldenrod runtime must use tournament preparation rather than legacy eligibility bands');
assert.ok(!startBlock.includes('isRacerEligible'),'Goldenrod Dash must not depend on legacy min/max Speed eligibility');
assert.ok(!startBlock.includes('awardRun'),'Goldenrod individual rounds must not award old Dash payouts');
assert.ok(source.includes("currentMode==='goldenrod'"),'Dash completion loop must have a dedicated Goldenrod path');
assert.ok(typeof dash.startGoldenrodRound==='function','Dash must expose startGoldenrodRound for shared controller');
assert.ok(typeof dash.startExhibition==='function','Dash must expose unrestricted Exhibition launch');

console.log('PASS Goldenrod Dash tournament integration contract');
