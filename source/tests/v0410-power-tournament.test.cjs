const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const core=require(path.join(root,'app/src/main/assets/arcade-power-trial-core.js'));
const power=require(path.join(root,'app/src/main/assets/arcade-power-trial.js'));

const BASE={
  rookie:{chargePeakMs:1100,maxChargeMs:2400,impactCycleMs:1550,impactTimeoutMs:4100,thresholdBonus:-5},
  poke:{chargePeakMs:1000,maxChargeMs:2150,impactCycleMs:1380,impactTimeoutMs:3550,thresholdBonus:-2},
  great:{chargePeakMs:900,maxChargeMs:1900,impactCycleMs:1200,impactTimeoutMs:3100,thresholdBonus:0},
  ultra:{chargePeakMs:820,maxChargeMs:1700,impactCycleMs:1050,impactTimeoutMs:2650,thresholdBonus:2},
  master:{chargePeakMs:740,maxChargeMs:1500,impactCycleMs:900,impactTimeoutMs:2250,thresholdBonus:5}
};
for(const [id,expected] of Object.entries(BASE)){
  const p=core.divisionProfile(id,0);
  for(const [k,v] of Object.entries(expected))assert.strictEqual(p[k],v,`${id} ${k}`);
  const r2=core.divisionProfile(id,1),r3=core.divisionProfile(id,2);
  for(const k of ['chargePeakMs','maxChargeMs','impactCycleMs','impactTimeoutMs']){
    assert.ok(r2[k]>=Math.round(v=expected[k]*.96)-1 && r2[k]<=expected[k],`${id} round 2 ${k} must tighten by no more than 4%`);
    assert.ok(r3[k]>=Math.round(expected[k]*.92)-1 && r3[k]<=r2[k],`${id} round 3 ${k} must tighten by no more than 8%`);
  }
  assert.ok(r2.thresholdBonus<=expected.thresholdBonus+1);
  assert.ok(r3.thresholdBonus<=expected.thresholdBonus+2);
}
assert.ok(core.statQuality(180)-core.statQuality(120)<core.statQuality(80)-core.statQuality(20),'Attack contribution should use diminishing returns');
const execution=core.strikePower({attack:60,chargeQuality:1,impactQuality:1});
const stats=core.strikePower({attack:180,chargeQuality:.5,impactQuality:.5});
assert.ok(execution.power>stats.power,'excellent execution must outweigh merely having a huge Attack stat');

const run=core.createRun({participant:{key:'p',name:'Machop',baseStat:70},profile:core.divisionProfile('great',0),goldenRate:0,rng:()=>.9});
assert.strictEqual(run.profile.divisionId,'great');

const fake={score:500,clears:5,perfects:2,bestSingleHit:100,goldenIndex:1,strikes:[{}, {golden:true,cleared:true}],participant:{name:'Machop',baseStat:70}};
const payload=power.tournamentResultPayload(fake,{label:'Booster Pack',reveal:{title:'GOLDEN TARGET PRIZE'},pending:false});
assert.strictEqual(payload.eventId,'powerTrial');
assert.ok(payload.metric>0);
assert.strictEqual(payload.rareReceipts.length,1);
assert.strictEqual(payload.rareReceipts[0].label,'Booster Pack');
assert.ok(typeof power.startGoldenrodRound==='function');
assert.ok(typeof power.startExhibition==='function');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-power-trial.js'),'utf8');
assert.ok(src.includes('tournamentContext'),'runtime must keep tournament callback context separate from Exhibition');
assert.ok(src.includes('divisionProfile'),'tournament runtime must use division timing profiles');
assert.ok(src.includes('onComplete'),'tournament finish must report to shared Goldenrod controller');
console.log('PASS Power Trial Goldenrod tournament contract');
