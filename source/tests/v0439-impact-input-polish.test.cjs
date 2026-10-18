const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,'app/src/main/assets',p);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function freshCore(){const p=asset('arcade-impact-trial-core.js');delete require.cache[require.resolve(p)];return require(p);}

function maxConcurrentIncludingGrace(plan){
  const events=[];
  for(const t of plan.targets){events.push([t.spawnAt,1]);events.push([t.spawnAt+t.lifeMs+(t.graceMs||0),-1]);}
  events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  let live=0,max=0;for(const [,delta] of events){live+=delta;max=Math.max(max,live);}return max;
}

test('Impact Trial countdown exposes a clear 3-2-1-GO sequence before play',()=>{
  const C=freshCore();
  assert.equal(typeof C.countdownLabel,'function','countdownLabel should be part of the Impact Trial core');
  assert.equal(C.countdownLabel(0),'3');
  assert.equal(C.countdownLabel(649),'3');
  assert.equal(C.countdownLabel(650),'2');
  assert.equal(C.countdownLabel(1300),'1');
  assert.equal(C.countdownLabel(1950),'GO!');
  assert.equal(C.countdownLabel(2200),'');
});

test('fast swipe geometry can collect an icon crossed between pointer events',()=>{
  const C=freshCore();
  assert.equal(typeof C.segmentHitsCircle,'function','segmentHitsCircle should support continuous swipe hit testing');
  assert.equal(C.segmentHitsCircle({x:0,y:40},{x:120,y:40},{x:60,y:40},22),true,'a swipe crossing the icon must hit it');
  assert.equal(C.segmentHitsCircle({x:0,y:10},{x:120,y:10},{x:60,y:40},22),false,'a swipe well outside the generous touch radius must not hit it');
  assert.equal(C.segmentHitsCircle({x:54,y:34},{x:54,y:34},{x:60,y:40},22),true,'a tap near the icon must use the same forgiving radius');
});

test('falling shields stop at a lowered guard line and remain valuable while held there',()=>{
  const C=freshCore();
  assert.equal(typeof C.laneTargetY,'function','laneTargetY should define the fall/stop motion');
  assert.ok(C.LANE_GUARD_Y>=76,'the impact/guard line should be lower than the old 69% position');
  const target={mode:'lanes',lifeMs:620,impactAtMs:430,timingSpread:.3};
  const atImpact=C.laneTargetY(target,430);
  const afterImpact=C.laneTargetY(target,590);
  const afterLife=C.laneTargetY(target,700);
  assert.equal(atImpact,C.LANE_GUARD_Y);
  assert.equal(afterImpact,C.LANE_GUARD_Y,'falling target should stop at the guard line rather than pass through it');
  assert.equal(afterLife,C.LANE_GUARD_Y,'the fade grace should not move the target past the impact line');
  assert.ok(C.targetHitValue(target,590)>=.9,'a shield held on the impact line should still be a strong hit');
});

test('target plans include a fade grace window that remains hittable before a miss',()=>{
  const C=freshCore();
  const plan=C.createTargetPlan({hazard:C.HAZARDS[0],difficulty:'normal',rng:()=>.4,golden:false});
  assert.ok(plan.targets.every(t=>Number(t.graceMs)>=160),'every shield should have a short post-life hit grace');
  const last=plan.targets.at(-1);
  assert.ok(plan.windowMs>=last.spawnAt+last.lifeMs+last.graceMs,'the Harden phase must stay open through the final fade grace');
});

test('fade grace does not reintroduce the old screen clutter',()=>{
  const C=freshCore();
  for(const key of ['easy','normal','hard'])for(const hazard of C.HAZARDS){
    let i=0;const values=[.13,.71,.36,.92,.48,.05,.81];const rng=()=>values[(i++)%values.length];
    const plan=C.createTargetPlan({hazard,difficulty:key,rng,golden:false});
    const cap=hazard.mode==='lanes'?3:(key==='easy'?2:key==='normal'?3:4);
    assert.ok(maxConcurrentIncludingGrace(plan)<=cap,`${key} ${hazard.name} shows ${maxConcurrentIncludingGrace(plan)} targets including fades; cap ${cap}`);
  }
});

test('runtime uses countdown lockout, continuous swipe paths, fade-hit grace and stopped lane targets',()=>{
  const js=read('app/src/main/assets/arcade-impact-trial.js');
  const css=read('app/src/main/assets/arcade-impact-trial.css');
  assert.match(js,/id="impactTrialCountdown"/);
  assert.match(js,/phase='countdown'/);
  assert.match(js,/core\.countdownLabel/);
  assert.match(js,/core\.segmentHitsCircle/);
  assert.match(js,/getBoundingClientRect/);
  assert.match(js,/lastSwipePoint/);
  assert.match(js,/is-fading/);
  assert.match(js,/core\.laneTargetY/);
  assert.match(css,/\.impacttrial-countdown/);
  assert.match(css,/\.impacttrial-harden-target\.is-fading[^\{]*\{[^}]*pointer-events\s*:\s*auto/i);
  assert.match(css,/top\s*:\s*78%/i,'lane guard line should be visually lowered to 78%');
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
