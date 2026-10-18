const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=f=>fs.readFileSync(path.join(ASSETS,f),'utf8');

test('Wailord ready instructions stop covering the live playfield once the run starts',()=>{
  const js=read('arcade-wailord-water-spout.js');
  assert.match(js,/wailordStatus[^\n]*hidden\s*=\s*phase!==['"]running['"]/);
});

test('Wailord controls are a compact three-button bar without the old stacked copy panel',()=>{
  const html=read('index.html');
  assert.match(html,/class="wailord-controls"[^>]*>\s*<button[^>]+id="wailordLeft"[\s\S]*id="wailordShoot"[\s\S]*id="wailordRight"/);
  assert.doesNotMatch(html,/class="wailord-control-copy"/);
  assert.match(html,/id="wailordControlStatus"/);
});

test('Dream World start cards are compact rather than covering the lower half of each playfield',()=>{
  for(const file of ['arcade-ice-cream-scoop.css','arcade-wailord-water-spout.css']){
    const css=read(file);
    assert.match(css,/\.\w+-ready\{[^}]*max-width:\s*4\d\dpx/s);
    assert.match(css,/\.\w+-ready\{[^}]*left:\s*50%/s);
    assert.match(css,/\.\w+-ready\{[^}]*transform:\s*translateX\(-50%\)/s);
  }
});

test('Dream World run completion opens a score-first review page',()=>{
  const ice=read('arcade-ice-cream-scoop.js');
  const wailord=read('arcade-wailord-water-spout.js');
  assert.match(ice,/metricLabel:'SCORE',metricValue:score\.toLocaleString\('en-GB'\)/);
  assert.match(wailord,/metricLabel:'SCORE',metricValue:score\.toLocaleString\('en-GB'\)/);
  assert.match(wailord,/Max Multiplier/);
});

test('Arcade results apply a Dream World theme to both Dream World games',()=>{
  const session=read('arcade-session.js');
  const css=read('arcade.css');
  assert.match(session,/data-result-theme/);
  assert.match(session,/iceCreamScoop/);
  assert.match(session,/wailordWaterSpout/);
  assert.match(css,/\[data-result-theme="dream-world"\]/);
});
