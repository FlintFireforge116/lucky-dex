const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const corePath=path.join(__dirname,'../app/src/main/assets/arcade-pikachu-beach-core.js');
const exists=fs.existsSync(corePath);

test('v0.52.0 Pikachu Beach core exists',()=>{
  assert.ok(exists,'arcade-pikachu-beach-core.js must exist');
});

if(exists){
  const core=require(corePath);

  test('Yellow Radness scoring is preserved exactly for one to three flips',()=>{
    assert.equal(core.scoreTrick([]),0);
    assert.equal(core.scoreTrick(['left']),50);
    assert.equal(core.scoreTrick(['right']),50);
    assert.equal(core.scoreTrick(['left','left']),150);
    assert.equal(core.scoreTrick(['right','right']),150);
    assert.equal(core.scoreTrick(['left','right']),180);
    assert.equal(core.scoreTrick(['right','left']),180);
    assert.equal(core.scoreTrick(['left','left','left']),350);
    assert.equal(core.scoreTrick(['right','right','right']),350);
    assert.equal(core.scoreTrick(['left','right','left']),500);
    assert.equal(core.scoreTrick(['right','left','right']),500);
  });

  test('run starts with the original 6000 HP counter and supported difficulty',()=>{
    const run=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    assert.equal(run.hp,6000);
    assert.equal(run.difficulty,'normal');
    assert.equal(run.radness,0);
    assert.equal(run.progress,0);
    assert.equal(run.waveIndex,0);
  });

  test('holding a direction can complete a full flip and a clean landing banks Radness',()=>{
    const run=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    core.startWave(run);
    core.rotate(run,'left',400); // 900 deg/s => one full turn
    assert.deepEqual(run.air.flips,['left']);
    const landing=core.finishLanding(run);
    assert.equal(landing.safe,true);
    assert.equal(landing.points,50);
    assert.equal(run.radness,50);
    assert.equal(run.successfulLandings,1);
  });

  test('mixed two-flip landing awards 180 and three mixed flips award 500',()=>{
    const run=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    core.startWave(run);
    core.rotate(run,'left',400);
    core.rotate(run,'right',400);
    assert.deepEqual(run.air.flips,['left','right']);
    assert.equal(core.finishLanding(run).points,180);

    core.startWave(run);
    core.rotate(run,'left',400);
    core.rotate(run,'right',400);
    core.rotate(run,'left',400);
    assert.deepEqual(run.air.flips,['left','right','left']);
    assert.equal(core.finishLanding(run).points,500);
    assert.equal(run.radness,680);
  });

  test('landing off-angle causes a wipeout, banks no Radness and slows momentum',()=>{
    const run=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    const before=run.momentum;
    core.startWave(run);
    core.rotate(run,'left',200); // 180 degrees: upside down
    const landing=core.finishLanding(run);
    assert.equal(landing.safe,false);
    assert.equal(landing.points,0);
    assert.equal(run.radness,0);
    assert.equal(run.wipeouts,1);
    assert.ok(run.momentum<before);
  });

  test('successful tricks make shore progress faster and HP drains with elapsed time',()=>{
    const plain=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    const trick=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    core.startWave(trick); core.rotate(trick,'left',400); core.finishLanding(trick);
    core.advanceRun(plain,1000);
    core.advanceRun(trick,1000);
    assert.equal(plain.hp,5940);
    assert.equal(trick.hp,5940);
    assert.ok(trick.progress>plain.progress);
  });

  test('final score is banked Radness plus remaining HP after reaching shore',()=>{
    const run=core.createRun({difficulty:'normal',luckyWave:false,rng:()=>0});
    run.radness=680; run.hp=4321; run.progress=1;
    const result=core.finishRun(run);
    assert.equal(result.cleared,true);
    assert.equal(result.finalScore,5001);
    assert.equal(run.finalScore,5001);
  });

  test('running out of HP loses the run and contributes no remaining-HP bonus',()=>{
    const run=core.createRun({difficulty:'hard',luckyWave:false,rng:()=>0});
    run.radness=500; run.hp=30;
    core.advanceRun(run,1000);
    const result=core.finishRun(run);
    assert.equal(result.cleared,false);
    assert.equal(result.finalScore,500);
  });

  test('difficulty changes landing tolerance without changing Yellow trick values',()=>{
    assert.ok(core.difficultyProfile('easy').landingToleranceDeg>core.difficultyProfile('normal').landingToleranceDeg);
    assert.ok(core.difficultyProfile('normal').landingToleranceDeg>core.difficultyProfile('hard').landingToleranceDeg);
    assert.equal(core.scoreTrick(['left','right','left']),500);
  });

  test('Lucky Wave roll honors Off and Always modes and marks one surf wave',()=>{
    assert.equal(core.rollLuckyWave(0,()=>0),false);
    assert.equal(core.rollLuckyWave(1,()=>0.999),true);
    const run=core.createRun({difficulty:'normal',luckyWave:true,rng:()=>0});
    assert.ok(run.luckyWaveIndex>=2);
    while(run.waveIndex<run.luckyWaveIndex-1){core.startWave(run);core.finishLanding(run);}
    const wave=core.startWave(run);
    assert.equal(wave.lucky,true);
  });
}
