const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const core=require(asset('arcade-elemental-gauntlet-core.js'));

test('Sp. Def determines a real shield pool, not just HP damage',()=>{
  assert.equal(typeof core.shieldCapacityForSpDef,'function','missing stat-scaled shield capacity');
  const low=core.shieldCapacityForSpDef(20);
  const mid=core.shieldCapacityForSpDef(80);
  const high=core.shieldCapacityForSpDef(160);
  assert.ok(low < mid && mid < high,`shield should scale with Sp. Def (${low}, ${mid}, ${high})`);
  assert.ok(high >= low*2,`high Sp. Def shield should feel materially stronger (${low} vs ${high})`);

  const run=core.createRun({participant:{baseStat:160},difficulty:'hard',rng:()=>.5});
  assert.equal(run.shieldMax,high);
  assert.equal(run.shield,high);
});

test('guarded hits consume shield before HP and can break through',()=>{
  const sturdy=core.createRun({participant:{baseStat:150},difficulty:'hard',rng:()=>.5});
  const startingHp=sturdy.health;
  const first=core.applyImpact(sturdy,{hazard:{baseDamage:32},hit:true,guarding:true});
  assert.equal(sturdy.health,startingHp,'an intact shield should absorb an ordinary defended hit');
  assert.ok(sturdy.shield < sturdy.shieldMax,'defended hit should consume shield');
  assert.ok(first.shieldDamage>0,'impact result should expose shield damage');

  const fragile=core.createRun({participant:{baseStat:5},difficulty:'hard',rng:()=>.5});
  fragile.shield=2;
  const before=fragile.health;
  const broken=core.applyImpact(fragile,{hazard:{baseDamage:40},hit:true,guarding:true});
  assert.equal(broken.shieldBroken,true,'overwhelming a tiny shield should report a break');
  assert.ok(fragile.health < before,'overflow damage should reach HP after the shield breaks');
});

test('Hard is a dense bullet-hell profile with substantially more overlapping pressure',()=>{
  const normal=core.createWavePlan({wave:core.WAVES[4],profile:core.difficultyProfile('normal'),rng:core.createSeededRng(99),waveIndex:4});
  const hard=core.createWavePlan({wave:core.WAVES[4],profile:core.difficultyProfile('hard'),rng:core.createSeededRng(99),waveIndex:4});
  assert.ok(hard.hazards.length >= normal.hazards.length+5,`hard should add much more screen pressure (${normal.hazards.length} -> ${hard.hazards.length})`);
  const gaps=hard.hazards.slice(1).map((h,i)=>h.impactAt-hard.hazards[i].impactAt);
  assert.ok(gaps.some(g=>g<=180),`hard should create overlapping/near-simultaneous attacks; gaps were ${gaps.join(',')}`);
  assert.ok(hard.hazards.some((h,i)=>i>0 && Math.abs(h.impactAt-hard.hazards[i-1].impactAt)<=80),'hard should include true attack clusters');
});

test('each element carries signature hazard visuals and patterns',()=>{
  const profile=core.difficultyProfile('hard');
  const expected={
    fire:['meteor','fire-sweep'],
    water:['riptide','whirlpool'],
    electric:['bolt-strike','chain-arc'],
    ice:['shard-volley','freeze-burst'],
    psychic:['mind-wave','psi-beam']
  };
  core.WAVES.forEach((wave,waveIndex)=>{
    const plan=core.createWavePlan({wave,profile,rng:core.createSeededRng(500+waveIndex),waveIndex});
    const visuals=new Set(plan.hazards.map(h=>h.visual));
    for(const v of expected[wave.type]) assert.ok(visuals.has(v),`${wave.type} should render ${v}; got ${[...visuals].join(', ')}`);
  });
});

test('runtime and CSS render shield state and bespoke electric/psychic attacks',()=>{
  const runtime=fs.readFileSync(asset('arcade-elemental-gauntlet.js'),'utf8');
  const css=fs.readFileSync(asset('arcade-elemental-gauntlet.css'),'utf8');
  assert.match(runtime,/elementalShieldText/);
  assert.match(runtime,/shieldMax/);
  assert.match(runtime,/visual-\$\{h\.visual\}/);
  assert.match(css,/visual-lightning-bolt/);
  assert.match(css,/visual-psychic-wave/);
  assert.match(css,/elemental-shield-broken/);
});
