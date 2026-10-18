const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const core=require(asset('arcade-elemental-gauntlet-core.js'));

const representativeHardHits=[26,24,27,28,32,29];

test('Hard makes six representative mistakes threaten even a 150 Sp. Def shield',()=>{
  const run=core.createRun({participant:{baseStat:150},difficulty:'hard',rng:()=>.5});
  for(const baseDamage of representativeHardHits){
    core.applyImpact(run,{hazard:{baseDamage},hit:true});
    if(run.finished)break;
  }
  assert.ok(run.shieldBreaks>=1 || run.shield<=10,`185 shield should be broken or nearly gone, got ${run.shield}`);
  assert.ok(run.health<30,`six Hard hits should start threatening the HP reserve, got ${run.health}/30`);
  assert.ok(run.health>=5,`six representative hits should be severe but not an automatic KO, got ${run.health}/30`);
});

test('Normal keeps the existing gentler mistake punishment',()=>{
  const run=core.createRun({participant:{baseStat:150},difficulty:'normal',rng:()=>.5});
  for(const baseDamage of representativeHardHits)core.applyImpact(run,{hazard:{baseDamage},hit:true});
  assert.equal(run.shieldBreaks,0);
  assert.equal(run.health,30);
  assert.ok(run.shield>=70,`Normal should still leave meaningful shield after six hits, got ${run.shield}`);
});

test('a shielded hit invalidates Perfect Wave even when HP takes zero damage',()=>{
  const run=core.createRun({participant:{baseStat:150},difficulty:'normal',rng:()=>.5});
  const damageBefore=run.damageTaken;
  const shieldDamageBefore=run.shieldDamageTaken;
  core.applyImpact(run,{hazard:{baseDamage:24},hit:true});
  assert.equal(run.damageTaken,damageBefore,'setup should remain fully shielded');
  assert.ok(run.shieldDamageTaken>shieldDamageBefore,'setup must consume shield');
  const result=core.finishWave(run,{damageBefore,shieldDamageBefore});
  assert.equal(result.clean,false);
  assert.equal(run.perfectWaves,0);
});

test('runtime flawless state requires zero shielded hits as well as zero HP damage',()=>{
  const runtime=fs.readFileSync(asset('arcade-elemental-gauntlet.js'),'utf8');
  const achievements=fs.readFileSync(asset('achievements-v0341.js'),'utf8');
  assert.match(runtime,/noDamage=cleared&&run\.damageTaken===0&&run\.guards===0/);
  assert.match(runtime,/shieldDamageBefore/);
  assert.match(runtime,/Shield Lost/);
  assert.match(runtime,/HP Damage Taken/);
  assert.match(achievements,/elemental_gauntlet_flawless[^\n]*'Untouchable'/);
  assert.match(achievements,/Clear all five waves without being hit\./);
});
