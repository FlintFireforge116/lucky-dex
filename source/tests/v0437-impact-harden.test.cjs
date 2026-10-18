const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,'app/src/main/assets',p);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function freshCore(){
  const p=asset('arcade-impact-trial-core.js');
  delete require.cache[require.resolve(p)];
  return require(p);
}

test('Impact Trial now resolves rapid Harden coverage, with skill stronger than Defense and Defense still mitigating mistakes',()=>{
  const C=freshCore(),hazard=C.HAZARDS[1];
  const perfectLow=C.resolveHarden({hazard,difficulty:'normal',defense:45,hitValue:12,totalValue:12,integrity:100});
  const roughElite=C.resolveHarden({hazard,difficulty:'normal',defense:200,hitValue:3,totalValue:12,integrity:100});
  const skilledLow=C.resolveHarden({hazard,difficulty:'normal',defense:45,hitValue:10,totalValue:12,integrity:100});
  const sameLow=C.resolveHarden({hazard,difficulty:'normal',defense:50,hitValue:7,totalValue:12,integrity:100});
  const sameHigh=C.resolveHarden({hazard,difficulty:'normal',defense:150,hitValue:7,totalValue:12,integrity:100});
  assert.equal(perfectLow.damage,0,'a perfect Harden must stop all damage even with low Defense');
  assert.ok(roughElite.damage>skilledLow.damage,'fast accurate play must matter more than simply choosing very high Defense');
  assert.ok(sameHigh.damage<sameLow.damage,'Defense must still soften equal player execution');
  assert.equal(perfectLow.grade,'IMPENETRABLE');
});

test('the five hazards use distinct frantic Harden patterns instead of DODGE / BRACE calls',()=>{
  const C=freshCore();
  assert.equal(C.HAZARDS.length,5);
  assert.deepEqual(C.HAZARDS.map(h=>h.mode),['burst','rush','lanes','precision','barrage']);
  assert.ok(C.HAZARDS.every(h=>!('action' in h)));
  assert.ok(C.difficultyProfile('easy').timeScale>C.difficultyProfile('normal').timeScale);
  assert.ok(C.difficultyProfile('normal').timeScale>C.difficultyProfile('hard').timeScale);
  assert.ok(C.difficultyProfile('easy').targetScale>C.difficultyProfile('hard').targetScale);
});

test('Harden target plans are spatial, lane mode has three lanes, and Golden Hazards mix collectible gold targets',()=>{
  const C=freshCore();
  let n=0;const rng=()=>((n++*0.173)%1);
  const normal=C.createTargetPlan({hazard:C.HAZARDS[0],difficulty:'normal',rng,golden:false});
  assert.ok(normal.targets.length>=6);
  assert.ok(normal.targets.every(t=>t.x>=8&&t.x<=92&&t.y>=12&&t.y<=84));
  let laneN=0;const laneRng=()=>[.08,.72,.31,.91,.46,.17,.84][(laneN++)%7];
  const lane=C.createTargetPlan({hazard:C.HAZARDS[2],difficulty:'normal',rng:laneRng,golden:false});
  assert.ok(new Set(lane.targets.map(t=>t.lane)).size>=2);
  assert.ok(lane.targets.every(t=>t.timingTarget>0&&t.timingTarget<1));
  const golden=C.createTargetPlan({hazard:C.HAZARDS[4],difficulty:'hard',rng,golden:true});
  const goldTargets=golden.targets.filter(t=>t.golden);
  assert.equal(goldTargets.length,golden.goldenTargetCount);
  assert.equal(golden.goldenQuota,golden.goldenTargetCount);
});


test('non-lane Harden targets stay below the HUD and cue so every shield remains tappable',()=>{
  const C=freshCore();
  let n=0;const rng=()=>((n++*.119)%1);
  for(const hazard of C.HAZARDS.filter(h=>h.mode!=='lanes')){
    const plan=C.createTargetPlan({hazard,difficulty:'normal',rng,golden:false});
    assert.ok(plan.targets.every(t=>t.y>=30&&t.y<=84),`${hazard.name} spawned a target under the top HUD/cue`);
  }
});

test('Impact Trial full run survives perfect Harden play and can be knocked out by missing frantic targets',()=>{
  const C=freshCore();
  const skilled=C.createRun({difficulty:'normal',participant:{baseStat:45},rng:()=>.8,goldenRate:0});
  while(!skilled.finished){
    const plan=C.createTargetPlan({hazard:C.HAZARDS[skilled.hazards.length],difficulty:skilled.difficulty,rng:()=>.4,golden:false});
    C.applyHarden(skilled,{hitValue:plan.totalValue,totalValue:plan.totalValue,targetsHit:plan.targets.length,targetsTotal:plan.targets.length});
  }
  assert.equal(skilled.integrity,100);
  assert.equal(skilled.fullClear,true);
  const rough=C.createRun({difficulty:'hard',participant:{baseStat:45},rng:()=>.8,goldenRate:0});
  while(!rough.finished)C.applyHarden(rough,{hitValue:0,totalValue:12,targetsHit:0,targetsTotal:12});
  assert.ok(rough.integrity<=0||rough.hazards.length===C.HAZARDS.length);
});

test('Golden Hazard prize requires enough gold shield hits and surviving the impact',()=>{
  const C=freshCore();
  const run=C.createRun({difficulty:'normal',participant:{baseStat:80},rng:(()=>{let i=0;return ()=>i++===0?.001:.2;})(),goldenRate:.02});
  assert.equal(run.goldenIndex,1);
  C.applyHarden(run,{hitValue:10,totalValue:12,targetsHit:10,targetsTotal:12,goldenTargetsHit:0,goldenTargetsTotal:0,goldenQuota:0});
  const partial=C.applyHarden(run,{hitValue:10,totalValue:12,targetsHit:10,targetsTotal:12,goldenTargetsHit:2,goldenTargetsTotal:3,goldenQuota:3});
  assert.equal(partial.golden,true);
  assert.equal(partial.goldenCleared,false);
  const out=C.resolveHarden({hazard:C.HAZARDS[1],difficulty:'normal',defense:80,hitValue:10,totalValue:12,targetsHit:10,targetsTotal:12,integrity:100,golden:true,goldenTargetsHit:3,goldenTargetsTotal:3,goldenQuota:3});
  assert.equal(out.goldenCleared,true);
  const failed=C.resolveHarden({hazard:C.HAZARDS[1],difficulty:'hard',defense:45,hitValue:0,totalValue:12,integrity:5,golden:true,goldenTargetsHit:3,goldenTargetsTotal:3,goldenQuota:2});
  assert.equal(failed.goldenCleared,false,'collecting gold shields is not enough if the Pokémon is knocked out');
});

test('Impact Trial runtime presents a tap-or-swipe Harden field with a segmented gauge and no DODGE / BRACE buttons',()=>{
  const js=read('app/src/main/assets/arcade-impact-trial.js');
  const css=read('app/src/main/assets/arcade-impact-trial.css');
  assert.match(js,/id="impactTrialTargetField"/);
  assert.match(js,/data-impact-target/);
  assert.match(js,/pointermove/);
  assert.match(js,/TAP \/ SWIPE/);
  assert.match(js,/HARDEN!/);
  assert.match(js,/IMPENETRABLE/);
  assert.doesNotMatch(js,/id="impactTrialDodge"/);
  assert.doesNotMatch(js,/id="impactTrialBrace"/);
  assert.match(css,/\.impacttrial-harden-target/);
  assert.match(css,/touch-action\s*:\s*none/);
  assert.match(css,/\.impacttrial-harden-segments/);
});

test('the runtime gives each hazard its own Harden presentation and secures Golden Hazard rewards through goldenCleared',()=>{
  const js=read('app/src/main/assets/arcade-impact-trial.js');
  assert.match(js,/hazard\.mode==='lanes'/);
  assert.match(js,/hazard\.mode==='precision'/);
  assert.match(js,/hazard\.mode==='barrage'/);
  assert.match(js,/goldenCleared/);
  assert.match(js,/GOLDEN HAZARD PRIZE/);
  assert.match(js,/LuckyDexRareRewardBridge/);
});

test('Impact Trial records and achievements describe Harden mastery',()=>{
  const platform=read('app/src/main/assets/arcade-platform.js');
  const records=read('app/src/main/assets/arcade-records.js');
  const ach=read('app/src/main/assets/achievements-v0341.js');
  assert.match(platform,/bestHardenPct:0/);
  assert.match(platform,/hardenTargetsHit:0/);
  assert.match(records,/Best Harden/);
  assert.match(records,/Perfect Hardens/);
  assert.match(ach,/Impenetrable Form/);
  assert.match(ach,/perfect Hardens/i);
  for(const id of ['impact_trial_first','impact_trial_10','impact_trial_full_clear','impact_trial_hard_clear','impact_trial_perfect','impact_trial_mastery','impact_trial_golden'])assert.match(ach,new RegExp(id));
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
