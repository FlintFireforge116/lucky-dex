const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

test('Endurance playfield is steering-only with no Jump control or jump state',()=>{
  const runtime=read('arcade-endurance-expedition.js');
  const core=read('arcade-endurance-expedition-core.js');
  assert.doesNotMatch(runtime,/enduranceJump|endurance-controls|JUMP LOW|function jump\(|jumpUntil|jumpReadyAt|\bjumps\b/i);
  assert.doesNotMatch(core,/jumpable:true|jumpMs|\bjumps\s*:/i);
  assert.match(runtime,/DRAG TO STEER|STEER TO DODGE/i);
});

test('Endurance in-run screen has no lower meter/control section and cannot scroll',()=>{
  const runtime=read('arcade-endurance-expedition.js');
  const css=read('arcade-endurance-expedition.css');
  assert.doesNotMatch(runtime,/class="endurance-meter"|class="endurance-controls"|id="enduranceMeterText"|id="enduranceBar"/);
  assert.match(css,/\.endurance-expedition-game\.is-playing\s*\{[^}]*overflow\s*:\s*hidden/s);
  assert.match(css,/\.endurance-expedition-game\.is-playing\s*\{[^}]*overscroll-behavior\s*:\s*none/s);
  assert.doesNotMatch(css,/\.endurance-controls|\.endurance-meter/);
});

test('Endurance stage presentation uses richer Gen 3 scenery and authentic object sprites',()=>{
  const runtime=read('arcade-endurance-expedition.js');
  const css=read('arcade-endurance-expedition.css');
  assert.match(runtime,/endurance-scenery/);
  for(const ref of [
    'adventure/art/objects/cut_tree.png',
    'adventure/art/objects/strength_boulder.png',
    'arcade/sprites/actors/pokemon/41.png',
    'arcade/dash/gen3/flowers.png',
    'arcade/dash/gen3/bridge-floor.png',
    'arcade/dash/gen3/cave-floor-dark.png'
  ]) assert.match(css,new RegExp(ref.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`expected ${ref}`);
  assert.match(css,/@keyframes endurance-ground-scroll/);
  assert.match(css,/\.stage-forest \.endurance-scenery/);
  assert.match(css,/\.stage-rapids \.endurance-scenery/);
  assert.match(css,/\.stage-canyon \.endurance-scenery/);
  assert.match(css,/\.stage-cave \.endurance-scenery/);
  assert.match(css,/\.stage-summit \.endurance-scenery/);
});
