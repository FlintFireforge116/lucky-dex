'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-rock-harden-core.js');

function rngFor(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

function forceHazard(round,key){
  const h=core.HAZARDS[key];
  assert.ok(h,`missing hazard ${key}`);
  const w=round.waves[0];
  Object.assign(w,{hazardKey:key,hazardKind:h.kind,rockClass:h.rockClass||'medium',damage:h.damage||0,heal:h.heal||0,asset:h.asset,label:h.label});
  for(const racer of round.racers.filter(r=>r.kind==='cpu')){
    const a=racer.cpuActions.find(a=>a.waveIndex===w.index);
    if(a&&h.kind==='berry')Object.assign(a,{expectedGrade:'collect',pressAt:null,releaseAt:null,donePress:true,doneRelease:true});
  }
  return w;
}

test('Hard mode randomises each wave fall speed while keeping fair bounds',()=>{
  const round=core.createRound({difficulty:'hard',rng:rngFor(4404),nowMs:0});
  const leads=round.waves.map(w=>w.impactAt-w.telegraphAt);
  assert.ok(new Set(leads).size>=4,`expected varied fall speeds, got ${[...new Set(leads)]}`);
  assert.ok(leads.every(ms=>ms>=520&&ms<=850),`Hard fall lead outside fair bounds: ${Math.min(...leads)}..${Math.max(...leads)}`);
});

test('Oran and Sitrus berries heal only when the racer does not Harden',()=>{
  for(const [key,minimumHeal] of [['oran',18],['sitrus',30]]){
    const round=core.createRound({difficulty:'normal',rng:rngFor(key==='oran'?41:42),nowMs:0});
    const wave=forceHazard(round,key);round.player.hp=40;
    core.advanceRound(round,wave.impactAt);
    assert.ok(round.player.hp>=40+minimumHeal,`${key} should heal an unhardened player`);
    assert.ok(core.consumeEvents(round).some(e=>e.type==='heal'&&e.racerId==='player'&&e.hazardKey===key));

    const blocked=core.createRound({difficulty:'normal',rng:rngFor(key==='oran'?43:44),nowMs:0});
    const blockedWave=forceHazard(blocked,key);blocked.player.hp=40;
    core.pressPlayer(blocked,blockedWave.impactAt-50);
    core.advanceRound(blocked,blockedWave.impactAt);
    assert.ok(blocked.player.hp<41,`${key} must not heal through Harden`);
    assert.ok(core.consumeEvents(blocked).some(e=>e.type==='berryMissed'&&e.racerId==='player'&&e.hazardKey===key));
  }
});

test('tough Pokémon hazards are more damaging than the heaviest ordinary rock',()=>{
  assert.ok(core.HAZARDS.golem.damage>core.ROCK_CLASSES.heavy.damage);
  assert.ok(core.HAZARDS.ferroseed.damage>core.ROCK_CLASSES.heavy.damage);
  assert.ok(core.HAZARDS.pincurchin.damage>core.ROCK_CLASSES.heavy.damage);
  const round=core.createRound({difficulty:'normal',rng:rngFor(55),nowMs:0});
  const wave=forceHazard(round,'golem');round.player.hp=100;
  core.advanceRound(round,wave.impactAt);
  assert.equal(round.player.hp,100-core.HAZARDS.golem.damage);
  assert.ok(core.consumeEvents(round).some(e=>e.type==='miss'&&e.racerId==='player'&&e.hazardKey==='golem'));
});

test('hazard pool contains multiple rocks, berries, and named Pokémon using local assets',()=>{
  for(const key of ['caveRock','routeRock','lavaRock','iceRock','oran','sitrus','golem','graveler','ferroseed','pincurchin']){
    const h=core.HAZARDS[key];assert.ok(h,`${key} missing`);assert.ok(h.asset,`${key} asset missing`);
  }
  assert.ok(Object.values(core.HAZARDS).filter(h=>h.kind==='rock').length>=4);
  assert.ok(Object.values(core.HAZARDS).filter(h=>h.kind==='berry').length>=2);
  assert.ok(Object.values(core.HAZARDS).filter(h=>h.kind==='pokemon').length>=4);
});

test('runtime renders local hazard art and explains berry timing',()=>{
  const fs=require('node:fs');
  const runtime=fs.readFileSync('app/src/main/assets/arcade-rock-harden.js','utf8');
  const css=fs.readFileSync('app/src/main/assets/arcade-rock-harden.css','utf8');
  const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
  assert.match(runtime,/current\?\.telegraphLeadMs/);
  assert.match(runtime,/backgroundImage/);
  assert.match(runtime,/event\.type==='heal'/);
  assert.match(runtime,/event\.type==='berryMissed'/);
  assert.match(css,/data-hazard-kind="berry"/);
  assert.match(css,/data-hazard-kind="pokemon"/);
  assert.match(html,/ORAN\/SITRUS BERRIES/i);
});
