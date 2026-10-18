const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

test('Elemental Gauntlet core ships as a real caught-Pokemon Sp. Def game',()=>{
  assert.equal(fs.existsSync(asset('arcade-elemental-gauntlet-core.js')),true,'missing Elemental Gauntlet core');
  const core=require(asset('arcade-elemental-gauntlet-core.js'));
  assert.equal(core.WAVES.length,5);
  assert.deepEqual(core.WAVES.map(x=>x.type),['fire','water','electric','ice','psychic']);
  assert.equal(typeof core.createRun,'function');
  assert.equal(typeof core.resolveImpact,'function');
});

test('skill can avoid damage entirely while Sp. Def strongly changes mistakes',()=>{
  const core=require(asset('arcade-elemental-gauntlet-core.js'));
  const dodge=core.resolveImpact({spDef:5,baseDamage:34,hit:false,guarding:false});
  const low=core.resolveImpact({spDef:5,baseDamage:34,hit:true,guarding:false});
  const high=core.resolveImpact({spDef:160,baseDamage:34,hit:true,guarding:false});
  const guarded=core.resolveImpact({spDef:5,baseDamage:34,hit:true,guarding:true,guardStrength:1});
  assert.equal(dodge.damage,0,'a clean dodge must always avoid damage');
  assert.ok(low.damage>=Math.max(20,high.damage*1.8),`low Sp. Def should hurt much more (${low.damage} vs ${high.damage})`);
  assert.ok(guarded.damage<low.damage,'defending should mitigate a mistake');
  assert.ok(guarded.damage>0,'defending should not replace dodging');
});

test('the rare Prismatic Storm is 2 percent by default and force-testable',()=>{
  const core=require(asset('arcade-elemental-gauntlet-core.js'));
  assert.equal(core.rollPrismaticStorm(()=>0.0199,.02),true);
  assert.equal(core.rollPrismaticStorm(()=>0.0201,.02),false);
  assert.equal(core.rollPrismaticStorm(()=>0.9,1),true);
  const run=core.createRun({participant:{baseStat:60},difficulty:'normal',rng:()=>0,goldenRate:1});
  assert.equal(run.prismatic,true);
});

test('Elemental Gauntlet is wired through Goldenrod, records, settings and achievements',()=>{
  const goldenrod=read('arcade-goldenrod.js');
  const adapters=read('arcade-goldenrod-adapters.js');
  const state=read('arcade-goldenrod-state.js');
  const world=read('arcade-world.js');
  const platform=read('arcade-platform.js');
  const records=read('arcade-records.js');
  const session=read('arcade-session.js');
  const app=read('app-v0167.js');
  const index=read('index.html');
  const achievements=read('achievements-v0341.js');
  const stats=read('arcade-special-stats.js');

  assert.match(goldenrod,/elementalGauntlet[^\n]+built:true/);
  assert.match(goldenrod,/elementalGauntlet:root\.LuckyDexElementalGauntlet/);
  assert.match(adapters,/elementalGauntlet:buildAdapter\([^\n]+statKey:'spDef'/);
  assert.match(state,/EVENT_IDS=\[[^\]]*'elementalGauntlet'/);
  assert.match(world,/games:\['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'\]/);
  assert.match(world,/elementalGauntlet:\(\)=>window\.LuckyDexElementalGauntlet/);
  assert.match(platform,/elementalGauntlet:/);
  assert.match(records,/elementalGauntlet:'Elemental Gauntlet'/);
  assert.match(session,/elementalGauntlet:\{run:/);
  assert.match(app,/elementalGauntletPrismatic:\.02/);
  assert.match(app,/rareElementalGauntletPrismaticOddsSelect:'elementalGauntletPrismatic'/);
  assert.match(index,/rareElementalGauntletPrismaticOddsSelect/);
  assert.match(index,/arcade-elemental-gauntlet-core\.js/);
  assert.match(index,/arcade-elemental-gauntlet\.js/);
  assert.match(index,/arcade-elemental-gauntlet\.css/);
  assert.match(achievements,/elemental_gauntlet_first/);
  assert.match(achievements,/elemental_gauntlet_prismatic/);
  assert.match(achievements,/goldenrod_elemental_master/);
  assert.match(stats,/function spDef\(/);
});

test('Elemental Gauntlet runtime exposes Exhibition and Goldenrod play flows',()=>{
  const runtimePath=asset('arcade-elemental-gauntlet.js');
  assert.equal(fs.existsSync(runtimePath),true,'missing Elemental Gauntlet runtime');
  delete require.cache[require.resolve(runtimePath)];
  const api=require(runtimePath);
  for(const key of ['open','close','pause','resume','startExhibition','startGoldenrodRound','snapshot']){
    assert.equal(typeof api[key],'function',`missing runtime API ${key}`);
  }
});

test('Elemental Gauntlet styling includes five element identities, telegraphs and shield state',()=>{
  const cssPath=asset('arcade-elemental-gauntlet.css');
  assert.equal(fs.existsSync(cssPath),true,'missing Elemental Gauntlet CSS');
  const css=fs.readFileSync(cssPath,'utf8');
  for(const token of ['type-fire','type-water','type-electric','type-ice','type-psychic','is-telegraph','is-impact','shield-active']) assert.match(css,new RegExp(token));
});
