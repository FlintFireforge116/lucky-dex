const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app','src','main','assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

test('Endurance countdown is 3-2-1 only with no GO phase',()=>{
  const core=require(asset('arcade-endurance-expedition-core.js'));
  assert.equal(core.COUNTDOWN_END_MS,core.COUNTDOWN_STEP_MS*3);
  assert.equal(core.countdownLabel(0),'3');
  assert.equal(core.countdownLabel(core.COUNTDOWN_STEP_MS),'2');
  assert.equal(core.countdownLabel(core.COUNTDOWN_STEP_MS*2),'1');
  assert.equal(core.countdownLabel(core.COUNTDOWN_STEP_MS*3),'');
  const runtime=read('arcade-endurance-expedition.js');
  assert.doesNotMatch(runtime,/GO!/);
});

test('Endurance visual layer uses extracted Pokemon Emerald Gen 3 tiles and props',()=>{
  const css=read('arcade-endurance-expedition.css');
  for(const filename of [
    'forest-grass.png','route-grass.png','tree.png','tall-grass.png',
    'shore-water-1.png','shore-edge.png','shallow-water.png',
    'desert-sand.png','route-rock.png',
    'cave-floor-dark.png','cave-wall.png','cave-rock.png',
    'ice-floor.png','ice-wall.png','ice-rock.png','ice-cracked.png'
  ]){
    assert.match(css,new RegExp(filename.replaceAll('.','\\.')),`expected ${filename} in Endurance Gen 3 presentation`);
  }
  const manifest=JSON.parse(fs.readFileSync(asset('arcade/dash/gen3/manifest.json'),'utf8'));
  assert.equal(manifest.sprites['forest-path'].sourceGame,'Pokemon Emerald');
  assert.equal(manifest.sprites['cave-floor'].classification,'extracted');
  assert.equal(manifest.sprites['ice-wall'].classification,'extracted');
});

test('Endurance in-run viewport is safe-area aware and non-scrolling',()=>{
  const css=read('arcade-endurance-expedition.css');
  assert.match(css,/safe-area-inset-bottom/);
  assert.match(css,/\.endurance-expedition-game\.is-playing\s*\{[^}]*overflow:hidden/s);
  assert.match(css,/\.endurance-expedition-game\.is-playing \.endurance-shell\s*\{[^}]*min-height:0/s);
  assert.doesNotMatch(css,/\.endurance-controls/);
});
