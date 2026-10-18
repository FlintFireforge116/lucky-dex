const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const core=require(asset('arcade-elemental-gauntlet-core.js'));

test('Elemental Gauntlet shield never regenerates during a run',()=>{
  const run=core.createRun({participant:{baseStat:150},difficulty:'hard',rng:()=>.5});
  core.applyImpact(run,{hazard:{baseDamage:32},hit:true});
  const afterHit=run.shield;
  assert.ok(afterHit<run.shieldMax,'setup should consume shield');
  assert.equal(core.regenShield(run,60000),afterHit,'even a full minute must not restore shield');
  assert.equal(run.shield,afterHit,'shield must remain a finite run-long resource');

  const runtime=fs.readFileSync(asset('arcade-elemental-gauntlet.js'),'utf8');
  assert.doesNotMatch(runtime,/core\.regenShield\?\.\(run,dt\)/,'runtime must not regenerate shield every frame');
});

test('Hard waves are long sustained bullet-hell phases rather than short bursts',()=>{
  const p=core.difficultyProfile('hard');
  const counts=[];
  const durations=[];
  for(let waveIndex=0;waveIndex<core.WAVES.length;waveIndex++){
    const plan=core.createWavePlan({wave:core.WAVES[waveIndex],profile:p,rng:core.createSeededRng(4503+waveIndex),waveIndex});
    counts.push(plan.hazards.length);
    durations.push(plan.durationMs);
  }
  assert.ok(counts[0]>=27,`Hard wave 1 should already sustain pressure, got ${counts[0]} hazards`);
  assert.ok(counts.at(-1)>=40,`Hard final wave should be dense, got ${counts.at(-1)} hazards`);
  assert.ok(durations[0]>=7000,`Hard wave 1 should last at least ~7 seconds, got ${durations[0]}ms`);
  assert.ok(durations.at(-1)>=11000,`Hard final wave should last at least ~11 seconds, got ${durations.at(-1)}ms`);
  for(let i=1;i<counts.length;i++) assert.ok(counts[i]>counts[i-1],`wave ${i+1} should add pressure`);
});
