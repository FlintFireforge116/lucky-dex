const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const core=require(asset('arcade-elemental-gauntlet-core.js'));

test('Elemental Gauntlet uses a small fixed HP reserve behind the Sp. Def shield',()=>{
  assert.equal(core.HEALTH_MAX,30,'HP should be a small emergency reserve, not a second full life bar');
  const run=core.createRun({participant:{baseStat:80},difficulty:'normal',rng:()=>.5});
  assert.equal(run.healthMax,30);
  assert.equal(run.health,30);
  assert.ok(run.shieldMax>run.healthMax*2,'the stat-scaled shield should dominate the survivability budget');
});

test('the Sp. Def shield is passive and absorbs every hit while charge remains',()=>{
  const run=core.createRun({participant:{baseStat:100},difficulty:'hard',rng:()=>.5});
  const beforeHp=run.health;
  const beforeShield=run.shield;
  const out=core.applyImpact(run,{hazard:{baseDamage:32},hit:true,guarding:false});
  assert.equal(run.health,beforeHp,'HP should not be touched while passive shield charge remains');
  assert.ok(run.shield<beforeShield,'every hit should consume passive shield charge');
  assert.equal(out.shielded,true);
});

test('HP only receives overflow after passive shield breaks',()=>{
  const run=core.createRun({participant:{baseStat:5},difficulty:'hard',rng:()=>.5});
  run.shield=2;
  const before=run.health;
  const out=core.applyImpact(run,{hazard:{baseDamage:40},hit:true,guarding:false});
  assert.equal(out.shieldBroken,true);
  assert.equal(run.shield,0);
  assert.ok(run.health<before,'overflow should reach the small HP reserve only after shield depletion');
});

test('runtime has no manual defend control and presents the shield as always active',()=>{
  const runtime=fs.readFileSync(asset('arcade-elemental-gauntlet.js'),'utf8');
  const css=fs.readFileSync(asset('arcade-elemental-gauntlet.css'),'utf8');
  assert.doesNotMatch(runtime,/id="elementalDefend"/);
  assert.doesNotMatch(runtime,/HOLD TO RAISE SHIELD/);
  assert.match(runtime,/PASSIVE SP\. DEF SHIELD/);
  assert.doesNotMatch(runtime,/core\.regenShield\?\.\(run,dt\)/);
  assert.match(runtime,/SHIELD DOES NOT RECHARGE/);
  assert.match(css,/\.elemental-player\.shield-active \.elemental-aura/);
});
