const assert=require('assert');
const core=require('../app/src/main/assets/arcade-rock-harden-core.js');
function rngFor(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function cpuSchedule(round){for(const r of round.racers.slice(1))assert.ok(Array.isArray(r.cpuActions),'CPU schedule must be pre-generated at round creation');return round.racers.slice(1).map(r=>r.cpuActions.map(a=>({waveIndex:a.waveIndex,pressAt:a.pressAt,releaseAt:a.releaseAt,expectedGrade:a.expectedGrade})));}

for(const difficulty of ['easy','normal','hard']){
  const a=core.createRound({difficulty,rng:rngFor(77),nowMs:0});
  const b=core.createRound({difficulty,rng:rngFor(77),nowMs:0});
  assert.deepStrictEqual(cpuSchedule(a),cpuSchedule(b),`${difficulty} schedules must be seeded/repeatable`);
  const before=cpuSchedule(a);
  a.player.hp=73;a.player.score=999;a.player.hardened=true;a.player.hardenStartedAt=0;
  assert.deepStrictEqual(cpuSchedule(a),before,`${difficulty} schedules may not read player state`);
}

const samePhysics=core.createRound({difficulty:'normal',rng:rngFor(5),nowMs:0});
const cpu=samePhysics.racers[1],action=cpu.cpuActions.find(a=>a.expectedGrade!=='miss');
assert.ok(action,'normal CPU needs at least one block action');
for(const r of samePhysics.racers)r.hp=10000;
core.advanceRound(samePhysics,action.releaseAt+1);
const wave=samePhysics.waves[action.waveIndex];
const expectedPoints=action.expectedGrade==='perfect'?3:action.expectedGrade==='good'?2:1;
assert.ok(cpu.blocks>=1,'CPU must block through the same impact pipeline');
assert.ok(cpu.score>=expectedPoints,'CPU uses the same timing point values as the player');
assert.equal(wave.damage,core.ROCK_CLASSES[wave.rockClass].damage);

const oneLeft=core.createRound({difficulty:'normal',rng:rngFor(9),nowMs:0});
const impact=oneLeft.waves[0].impactAt;
for(const r of oneLeft.racers.slice(1)){
  r.hp=1;
  const a=r.cpuActions[0];a.pressAt=null;a.releaseAt=null;a.expectedGrade='miss';a.donePress=true;a.doneRelease=true;
}
core.pressPlayer(oneLeft,impact-80);
core.advanceRound(oneLeft,impact);
assert.equal(oneLeft.finalized,false,'player sole survivor keeps defending until the round clock ends');
assert.equal(core.placeFor(oneLeft,'player'),1);

const cpuLeft=core.createRound({difficulty:'normal',rng:rngFor(10),nowMs:0});
for(const r of cpuLeft.racers){r.alive=false;r.hp=0;r.koAt=1000;}cpuLeft.racers[1].alive=true;cpuLeft.racers[1].hp=40;
core.advanceRound(cpuLeft,1200);
assert.equal(cpuLeft.finalized,true,'CPU sole survivor may finish early once the player is already KO');

const cap=core.createRound({difficulty:'normal',rng:rngFor(12),nowMs:0});
cap.safetyCapAt=1000;
for(const w of cap.waves){w.telegraphAt+=100000;w.impactAt+=100000;}
for(const r of cap.racers){r.cpuActions=(r.cpuActions||[]).map(a=>({...a,pressAt:a.pressAt==null?null:a.pressAt+100000,releaseAt:a.releaseAt==null?null:a.releaseAt+100000}));}
cap.racers[0].score=12;cap.racers[0].hp=60;
cap.racers[1].score=12;cap.racers[1].hp=55;
cap.racers[2].score=10;cap.racers[2].hp=99;
cap.racers[3].score=12;cap.racers[3].hp=60;
core.advanceRound(cap,1000);
assert.equal(cap.finalized,true,'safety cap finalizes surviving racers');
assert.equal(core.placeFor(cap,'player'),1);
assert.equal(core.placeFor(cap,'cpu3'),1,'exact score/HP equality shares rank');
assert.equal(core.placeFor(cap,'cpu1'),3,'same score but lower HP ranks below tied leaders');
assert.equal(core.placeFor(cap,'cpu2'),4);

const mixed=core.createRound({difficulty:'normal',rng:rngFor(22),nowMs:0});
for(const r of mixed.racers)r.alive=true;
mixed.racers[0].score=1;mixed.racers[0].hp=5;
mixed.racers[1].alive=false;mixed.racers[1].koAt=900;mixed.racers[1].score=99;
mixed.racers[2].alive=false;mixed.racers[2].koAt=1000;mixed.racers[2].score=4;
mixed.racers[3].alive=false;mixed.racers[3].koAt=1000;mixed.racers[3].score=4;
assert.deepStrictEqual(core.rankRound(mixed).map(r=>r.id),['player','cpu2','cpu3','cpu1'],'survivor first; eliminated later KO then score');
assert.equal(core.placeFor(mixed,'cpu2'),2);
assert.equal(core.placeFor(mixed,'cpu3'),2,'equal KO time and score share place');
assert.equal(core.placeFor(mixed,'cpu1'),4);

const wipe=core.createRound({difficulty:'easy',rng:rngFor(3),nowMs:0});
const wipeImpact=wipe.waves[0].impactAt;
for(const r of wipe.racers){r.hp=1;if(r.kind==='cpu'){const a=r.cpuActions[0];a.pressAt=null;a.releaseAt=null;a.expectedGrade='miss';a.donePress=true;a.doneRelease=true;}}
core.advanceRound(wipe,wipeImpact);
assert.equal(wipe.finalized,true,'all-four wipe must finalize without crash');
assert.ok(wipe.racers.every(r=>r.alive===false));
assert.ok(wipe.racers.every(r=>core.placeFor(wipe,r.id)===1),'exact simultaneous equal wipe shares first place');

function balance(difficulty){
  let perfect=0,miss=0,total=0,waste=0;
  for(let seed=1;seed<=200;seed++){
    const r=core.createRound({difficulty,rng:rngFor(seed),nowMs:0});
    for(const lane of r.racers)lane.hp=10000;
    core.advanceRound(r,r.safetyCapAt);
    const events=core.consumeEvents(r).filter(e=>(e.type==='block'||e.type==='miss')&&e.racerId!=='player');
    for(const e of events){total++;if(e.type==='miss')miss++;else if(e.grade==='perfect')perfect++;}
    waste+=r.racers.slice(1).reduce((n,x)=>n+x.wastedHardenMs,0);
  }
  return {perfect:perfect/total,miss:miss/total,waste};
}
const easy=balance('easy'),normal=balance('normal'),hard=balance('hard');
function inRange(v,lo,hi,msg){assert.ok(v>=lo&&v<=hi,`${msg}: ${(v*100).toFixed(2)}% not ${(lo*100)}-${(hi*100)}%`);}
inRange(easy.perfect,.30,.45,'easy Perfect');inRange(easy.miss,.10,.18,'easy miss');
inRange(normal.perfect,.35,.45,'normal Perfect');inRange(normal.miss,.06,.12,'normal miss');
inRange(hard.perfect,.70,.82,'hard Perfect');inRange(hard.miss,.01,.04,'hard miss');
assert.ok(hard.waste<normal.waste&&normal.waste<easy.waste,`wasted Harden must descend Easy→Normal→Hard: ${easy.waste}, ${normal.waste}, ${hard.waste}`);
console.log('PASS v0.38.0 Rock Harden CPU, ranking and 200-seed balance',{
  easy:{perfect:+easy.perfect.toFixed(4),miss:+easy.miss.toFixed(4)},
  normal:{perfect:+normal.perfect.toFixed(4),miss:+normal.miss.toFixed(4)},
  hard:{perfect:+hard.perfect.toFixed(4),miss:+hard.miss.toFixed(4)}
});
