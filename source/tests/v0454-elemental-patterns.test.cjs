const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const core=require(asset('arcade-elemental-gauntlet-core.js'));

const expectedMechanics={
  fire:['meteor','fire-sweep'],
  water:['riptide','whirlpool'],
  electric:['bolt-strike','chain-arc'],
  ice:['shard-volley','freeze-burst'],
  psychic:['mind-wave','psi-beam'],
};

test('each element uses mechanically distinct attack families, not reskinned generic lanes/circles',()=>{
  const profile=core.difficultyProfile('normal');
  core.WAVES.forEach((wave,waveIndex)=>{
    const plan=core.createWavePlan({wave,profile,rng:core.createSeededRng(4540+waveIndex),waveIndex});
    const mechanics=new Set(plan.hazards.map(h=>h.mechanic));
    for(const mechanic of expectedMechanics[wave.type]){
      assert.ok(mechanics.has(mechanic),`${wave.type} should include ${mechanic}; got ${[...mechanics].join(', ')}`);
    }
  });
  const all=new Set(Object.values(expectedMechanics).flat());
  assert.equal(all.size,10,'the five elements should expose ten distinct core attack mechanics');
});

test('attack cadence is continuous and irregular on every exhibition difficulty',()=>{
  const limits={easy:700,normal:520,hard:360};
  for(const difficulty of Object.keys(limits)){
    const plan=core.createWavePlan({wave:core.WAVES[4],profile:core.difficultyProfile(difficulty),rng:core.createSeededRng(`cadence-${difficulty}`),waveIndex:4});
    const gaps=plan.hazards.slice(1).map((h,i)=>h.impactAt-plan.hazards[i].impactAt);
    assert.ok(gaps.length>=8,`${difficulty} should have enough attacks to judge cadence`);
    assert.ok(Math.max(...gaps)<=limits[difficulty],`${difficulty} has a dead-air gap of ${Math.max(...gaps)}ms`);
    assert.ok(new Set(gaps).size>=Math.min(8,gaps.length),`${difficulty} cadence should not repeat a fixed beat: ${gaps.join(',')}`);
    const mean=gaps.reduce((a,b)=>a+b,0)/gaps.length;
    const variance=gaps.reduce((a,b)=>a+(b-mean)**2,0)/gaps.length;
    assert.ok(Math.sqrt(variance)>=45,`${difficulty} cadence is too metronomic (stddev ${Math.sqrt(variance).toFixed(1)}ms)`);
  }
});

test('new collision primitives support beams, chain arcs, lightning crosses and waves with safe gaps',()=>{
  assert.equal(core.hazardHitsPlayer({shape:'segment',x1:.1,y1:.2,x2:.9,y2:.8,width:.05},{x:.5,y:.5}),true);
  assert.equal(core.hazardHitsPlayer({shape:'segment',x1:.1,y1:.2,x2:.9,y2:.8,width:.035},{x:.1,y:.8}),false);
  assert.equal(core.hazardHitsPlayer({shape:'cross',x:.5,y:.5,size:.08,reach:.35},{x:.5,y:.2}),true);
  assert.equal(core.hazardHitsPlayer({shape:'cross',x:.5,y:.5,size:.08,reach:.35},{x:.2,y:.2}),false);
  assert.equal(core.hazardHitsPlayer({shape:'wall-gap-h',y:.5,size:.10,gapCenter:.5,gapSize:.24},{x:.5,y:.5}),false,'safe gap should be safe');
  assert.equal(core.hazardHitsPlayer({shape:'wall-gap-h',y:.5,size:.10,gapCenter:.5,gapSize:.24},{x:.15,y:.5}),true,'wave body should hit');
});

test('runtime/CSS contain bespoke renderers for the new attack mechanics',()=>{
  const runtime=fs.readFileSync(asset('arcade-elemental-gauntlet.js'),'utf8');
  const css=fs.readFileSync(asset('arcade-elemental-gauntlet.css'),'utf8');
  assert.match(runtime,/shape-segment|h\.shape==='segment'/);
  for(const token of ['mechanic-meteor','mechanic-fire-sweep','mechanic-riptide','mechanic-whirlpool','mechanic-bolt-strike','mechanic-chain-arc','mechanic-shard-volley','mechanic-freeze-burst','mechanic-mind-wave','mechanic-psi-beam']){
    assert.match(css,new RegExp(token),`missing ${token} renderer`);
  }
});
