const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/arcade-impact-trial-core.js'));
const impact=require(path.join(root,'app/src/main/assets/arcade-impact-trial.js'));
const BASE={
 rookie:{timeScale:1.08,targetCountScale:.90,targetScale:1.08,damageMultiplier:.95,maxLive:2,barrageMaxLive:3,graceMs:190,hitRadiusScale:1.10},
 poke:{timeScale:1.02,targetCountScale:.96,targetScale:1.03,damageMultiplier:1.00,maxLive:3,barrageMaxLive:3,graceMs:170,hitRadiusScale:1.05},
 great:{timeScale:.96,targetCountScale:1.00,targetScale:1.00,damageMultiplier:1.08,maxLive:3,barrageMaxLive:3,graceMs:145,hitRadiusScale:1.00},
 ultra:{timeScale:.91,targetCountScale:1.04,targetScale:.95,damageMultiplier:1.16,maxLive:3,barrageMaxLive:4,graceMs:120,hitRadiusScale:.94},
 master:{timeScale:.86,targetCountScale:1.08,targetScale:.90,damageMultiplier:1.25,maxLive:3,barrageMaxLive:4,graceMs:100,hitRadiusScale:.88}
};
function concurrent(plan){const events=[];for(const t of plan.targets){events.push([t.spawnAt,1]);events.push([t.spawnAt+t.lifeMs+t.graceMs,-1]);}events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let n=0,m=0;for(const e of events){n+=e[1];m=Math.max(m,n);}return m;}
for(const [id,expected] of Object.entries(BASE)){
 const p=core.divisionProfile(id,0);for(const [k,v] of Object.entries(expected))assert.strictEqual(p[k],v,`${id} ${k}`);
 const r2=core.divisionProfile(id,1),r3=core.divisionProfile(id,2);
 assert.ok(r2.timeScale>=expected.timeScale*.97-.001&&r2.timeScale<=expected.timeScale);
 assert.ok(r3.timeScale>=expected.timeScale*.94-.001&&r3.timeScale<=r2.timeScale);
 assert.ok(r2.graceMs>=expected.graceMs-10&&r3.graceMs>=expected.graceMs-20);
 for(const hazard of core.HAZARDS){
   const plan=core.createTargetPlan({hazard,profile:p,rng:()=>.43,golden:false});
   const cap=hazard.mode==='lanes'?3:(hazard.mode==='barrage'?p.barrageMaxLive:p.maxLive);
   assert.ok(concurrent(plan)<=cap,`${id} ${hazard.mode} exceeds ${cap}`);
   assert.strictEqual(plan.graceMs,p.graceMs);
   assert.strictEqual(plan.hitRadiusScale,p.hitRadiusScale);
   const perfect=core.resolveHarden({hazard,profile:p,defense:20,hitValue:plan.totalValue,totalValue:plan.totalValue,targetsHit:plan.targets.length,targetsTotal:plan.targets.length,integrity:100});
   assert.strictEqual(perfect.percent,100);assert.strictEqual(perfect.damage,0);assert.strictEqual(perfect.perfect,true);
 }
}
assert.strictEqual(core.LANE_GUARD_Y,78);
assert.deepStrictEqual([0,650,1300,1950].map(core.countdownLabel),['3','2','1','GO!']);
assert.strictEqual(core.segmentHitsCircle({x:0,y:0},{x:100,y:0},{x:50,y:0},20),true);
const fake={score:600,integrity:90,perfects:2,targetsHit:40,targetsTotal:45,bestHardenPct:100,goldenIndex:0,hazards:[{golden:true,goldenCleared:true,percent:100}],participant:{name:'Aggron',baseStat:180}};
const payload=impact.tournamentResultPayload(fake,{label:'Rare Pack',pending:false,reveal:{title:'GOLDEN HAZARD PRIZE'}});
assert.strictEqual(payload.eventId,'impactTrial');assert.ok(payload.metric>0);assert.strictEqual(payload.rareReceipts[0].label,'Rare Pack');
assert.ok(typeof impact.startGoldenrodRound==='function');assert.ok(typeof impact.startExhibition==='function');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-impact-trial.js'),'utf8');
assert.ok(src.includes('hitRadiusScale'));assert.ok(src.includes('tournamentContext'));assert.ok(src.includes('divisionProfile'));
console.log('PASS Impact Trial Goldenrod tournament scaling contract');
