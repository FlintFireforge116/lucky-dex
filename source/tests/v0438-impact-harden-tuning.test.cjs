const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,'app/src/main/assets',p);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function freshCore(){const p=asset('arcade-impact-trial-core.js');delete require.cache[require.resolve(p)];return require(p);}
function maxConcurrent(plan){
  const events=[];
  for(const t of plan.targets){events.push([t.spawnAt,1]);events.push([t.spawnAt+t.lifeMs,-1]);}
  events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  let live=0,max=0;for(const [,d] of events){live+=d;max=Math.max(max,live);}return max;
}
function sequence(values){let i=0;return ()=>values[(i++)%values.length];}

test('Impact Trial target density is readable even on Hard',()=>{
  const C=freshCore();
  assert.ok(C.difficultyProfile('hard').targetCountScale<=1.08,'Hard should no longer inflate target count by 18%');
  assert.ok(C.difficultyProfile('hard').timeScale>=.96,'Hard windows should not be brutally compressed');
  for(const key of ['easy','normal','hard']){
    const p=C.difficultyProfile(key);
    for(const hazard of C.HAZARDS){
      const plan=C.createTargetPlan({hazard,difficulty:key,rng:sequence([.13,.71,.36,.92,.48,.05,.81]),golden:false});
      const cap=hazard.mode==='lanes'?3:(key==='easy'?2:key==='normal'?3:4);
      assert.ok(maxConcurrent(plan)<=cap,`${key} ${hazard.name} has ${maxConcurrent(plan)} simultaneous targets; cap ${cap}`);
      assert.ok(plan.windowMs>=1200||hazard.mode==='rush',`${key} ${hazard.name} window became too cramped`);
    }
  }
});

test('Rock Slide falling targets are chaotic rather than a fixed 1-2-3 lane cycle',()=>{
  const C=freshCore(),hazard=C.HAZARDS.find(h=>h.mode==='lanes');
  const plan=C.createTargetPlan({hazard,difficulty:'hard',rng:sequence([.91,.08,.67,.24,.79,.42,.03,.58,.87,.31]),golden:false});
  const lanes=plan.targets.map(t=>t.lane);
  assert.equal(new Set(lanes).size,3,'falling targets should roam across all three lanes');
  assert.notDeepEqual(lanes.slice(0,6),[0,1,2,0,1,2],'lanes must not repeat a rigid 1-2-3 cycle');
  assert.ok(!lanes.slice(3).every((lane,i)=>lane===lanes[i]),'lane order must not settle into a repeating three-step pattern');
  const gaps=plan.targets.slice(1).map((t,i)=>t.spawnAt-plan.targets[i].spawnAt);
  assert.ok(new Set(gaps).size>=3,'fall timings should have controlled random variation');
  assert.ok(maxConcurrent(plan)<=3,'chaos should come from variation, not impossible screen clutter');
});

test('collecting every Harden target guarantees zero damage exactly',()=>{
  const C=freshCore();
  for(const key of ['easy','normal','hard'])for(const hazard of C.HAZARDS){
    const plan=C.createTargetPlan({hazard,difficulty:key,rng:()=>.4,golden:false});
    const out=C.resolveHarden({hazard,difficulty:key,defense:20,hitValue:plan.totalValue*.7,totalValue:plan.totalValue,targetsHit:plan.targets.length,targetsTotal:plan.targets.length,integrity:100});
    assert.equal(out.damage,0,`${key} ${hazard.name} perfect target clear must take no damage`);
    assert.equal(out.percent,100);
    assert.equal(out.perfect,true);
  }
});

test('Golden Hazard requires every gold icon before it can award its prize',()=>{
  const C=freshCore();
  const plan=C.createTargetPlan({hazard:C.HAZARDS[0],difficulty:'normal',rng:sequence([.2,.7,.4,.9]),golden:true});
  assert.ok(plan.goldenTargetCount>=2);
  assert.equal(plan.goldenQuota,plan.goldenTargetCount,'the gold quota must be all gold targets');
  const partial=C.resolveHarden({hazard:C.HAZARDS[0],difficulty:'normal',defense:100,hitValue:plan.totalValue,totalValue:plan.totalValue,targetsHit:plan.targets.length,targetsTotal:plan.targets.length,integrity:100,golden:true,goldenTargetsHit:plan.goldenTargetCount-1,goldenTargetsTotal:plan.goldenTargetCount,goldenQuota:plan.goldenQuota});
  assert.equal(partial.goldenCleared,false,'missing one gold icon must miss the rare prize');
  const full=C.resolveHarden({hazard:C.HAZARDS[0],difficulty:'normal',defense:100,hitValue:plan.totalValue,totalValue:plan.totalValue,targetsHit:plan.targets.length,targetsTotal:plan.targets.length,integrity:100,golden:true,goldenTargetsHit:plan.goldenTargetCount,goldenTargetsTotal:plan.goldenTargetCount,goldenQuota:plan.goldenQuota});
  assert.equal(full.goldenCleared,true,'all gold icons plus survival must secure the rare prize');
});

test('Golden Hazard has explicit gold icon/rock treatment and end-of-game reward reveal',()=>{
  const js=read('app/src/main/assets/arcade-impact-trial.js');
  const css=read('app/src/main/assets/arcade-impact-trial.css');
  assert.match(js,/impacttrial-gold-icon/);
  assert.match(js,/ALL .* GOLD SHIELDS/i);
  assert.match(js,/rewardReveals:goldenPrize\.reveal\?\[goldenPrize\.reveal\]:\[\]/);
  assert.match(js,/Golden Hazard Prize/);
  assert.match(css,/\.impacttrial-gold-icon/);
  assert.match(css,/\.impacttrial-hazard\.is-golden\[data-kind="roll"\]/);
  assert.match(css,/impacttrialGoldRock/);
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
