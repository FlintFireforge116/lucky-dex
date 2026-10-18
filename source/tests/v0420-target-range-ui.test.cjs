const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);

test('Target Range runtime exposes exhibition/tournament APIs and deliberate touch input contracts',()=>{
  global.LuckyDexTargetRangeCore=require(asset('arcade-target-range-core.js'));
  const p=asset('arcade-target-range.js');delete require.cache[require.resolve(p)];
  const api=require(p),src=fs.readFileSync(p,'utf8'),css=fs.readFileSync(asset('arcade-target-range.css'),'utf8');
  assert.equal(typeof api.startExhibition,'function');
  assert.equal(typeof api.startGoldenrodRound,'function');
  assert.equal(typeof api.tournamentResultPayload,'function');
  assert.match(src,/pointerdown/);assert.match(src,/pointermove/);assert.match(src,/pointerup/);assert.match(src,/setPointerCapture/);
  assert.match(src,/pointercancel/);assert.match(src,/visibilitychange/);
  assert.match(css,/touch-action:\s*none/i);
});

test('gallery UI exposes wind, distance, focus, combo, projectile and Golden Target feedback',()=>{
  const src=fs.readFileSync(asset('arcade-target-range.js'),'utf8');
  for(const token of ['targetRangeWind','targetRangeDistance','targetRangeFocus','targetRangeCombo','targetRangeProjectile','BULLSEYE','GOLDEN TARGET'])assert.ok(src.includes(token),token);
  const html=fs.readFileSync(asset('index.html'),'utf8');
  assert.match(html,/id="targetRangeGame"/);
  assert.match(html,/arcade-target-range\.css/);
  assert.match(html,/arcade-target-range-core\.js/);
  assert.match(html,/arcade-target-range\.js/);
});

test('all 18 projectile identities are represented in runtime styling without mechanical type bonuses',()=>{
  const core=require(asset('arcade-target-range-core.js'));
  assert.equal(Object.keys(core.ATTACKS).length,18);
  assert.equal(core.ATTACKS.ground,'Mud Bomb');
  assert.equal(core.ATTACKS.psychic,'Psybeam');
  const css=fs.readFileSync(asset('arcade-target-range.css'),'utf8');
  for(const type of Object.keys(core.ATTACKS))assert.match(css,new RegExp(`data-attack-type=["']${type}["']|\\.attack-${type}`));
});

test('representative type attacks use distinct move silhouettes rather than colour-only projectiles',()=>{
  const css=fs.readFileSync(asset('arcade-target-range.css'),'utf8');
  assert.match(css,/attack-normal\{[^}]*clip-path:[^}]*polygon/i,'Swift should read as a star');
  assert.match(css,/attack-electric\{[^}]*clip-path:[^}]*polygon/i,'Thunderbolt should read as a bolt');
  assert.match(css,/attack-flying\{[^}]*border-radius:[^}]*%[^}]*%/i,'Air Slash should read as a blade/crescent');
  assert.match(css,/attack-psychic\{[^}]*width:\s*(?:2[4-9]|[3-9]\d)px/i,'Psybeam should read as a beam');
  assert.match(css,/attack-ground\{[^}]*radial-gradient/i,'Mud Bomb should read as a textured mud projectile');
  assert.match(css,/attack-ice\{[^}]*clip-path:[^}]*polygon/i,'Ice Beam should have a crystalline silhouette');
});

test('projectile travel animates from the Pokemon to the solved impact point',()=>{
  const src=fs.readFileSync(asset('arcade-target-range.js'),'utf8');
  assert.match(src,/function animateProjectile\(/);
  assert.match(src,/core\.projectileVisualPoint\(\{startX,startY,aimX:shotAimX,aimY:shotAimY,impactX:solution\.impactX,impactY:solution\.impactY,progress\}\)/);
  assert.doesNotMatch(src,/style\.setProperty\('--shot-x'/,'inline start coordinates must not override CSS destination coordinates');
});

test('projectiles visibly burst on impact without obscuring the target',()=>{
  const src=fs.readFileSync(asset('arcade-target-range.js'),'utf8');
  const css=fs.readFileSync(asset('arcade-target-range.css'),'utf8');
  assert.match(src,/classList\.add\('is-impact'\)/);
  assert.match(src,/classList\.remove\('is-impact'/);
  assert.match(css,/target-range-projectile\.is-impact\{[^}]*animation:/i);
  assert.match(css,/@keyframes\s+target-range-impact/i);
});

test('target hit feedback visibly reacts and broken targets get a stronger break animation',()=>{
  const src=fs.readFileSync(asset('arcade-target-range.js'),'utf8');
  const css=fs.readFileSync(asset('arcade-target-range.css'),'utf8');
  assert.match(src,/classList\.add\('is-hit'\)/);
  assert.match(src,/classList\.toggle\('is-broken',!!result\.broken\)/);
  assert.match(css,/target-range-target\.is-hit\{[^}]*animation:/i);
  assert.match(css,/target-range-target\.is-broken\{[^}]*animation:/i);
});

test('Target Range tears down touch and visibility handlers so reopening binds the fresh gallery',()=>{
  const src=fs.readFileSync(asset('arcade-target-range.js'),'utf8');
  assert.match(src,/function unbind\(/);
  assert.match(src,/removeEventListener\('pointerdown',pointerDown\)/);
  assert.match(src,/removeEventListener\('pointermove',pointerMove\)/);
  assert.match(src,/removeEventListener\('pointerup',pointerUp\)/);
  assert.match(src,/removeEventListener\('pointercancel',cancelAim\)/);
  assert.match(src,/document\.removeEventListener\('visibilitychange',visibilityHandler\)/);
  assert.match(src,/function close\(\)[\s\S]{0,220}unbind\(\)/);
});
