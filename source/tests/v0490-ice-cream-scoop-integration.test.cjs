const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('Dream World is a dedicated Arcade venue with Ice Cream Scoop',()=>{
  const world=read('arcade-world.js'),index=read('index.html');
  assert.match(world,/id:"dreamWorld"/);
  assert.match(world,/games:\[[^\]]*'iceCreamScoop'/);
  assert.match(world,/iceCreamScoop:'Ice Cream Scoop'/);
  assert.match(world,/iceCreamScoop:\(\)=>window\.LuckyDexIceCreamScoop/);
  assert.match(index,/id="iceCreamScoopGame"/);
  assert.match(index,/arcade-ice-cream-scoop-core\.js/);
  assert.match(index,/arcade-ice-cream-scoop\.js/);
  assert.match(index,/arcade-ice-cream-scoop\.css/);
});

test('Ice Cream Scoop has records, achievements, and a forceable Dream Scoop setting',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js'),ach=read('achievements-v0341.js'),app=read('app-v0167.js'),index=read('index.html');
  assert.match(platform,/iceCreamScoop:\{gamesPlayed:0/);
  assert.match(records,/iceCreamScoop/);
  assert.match(ach,/icecream_first_stack/);
  assert.match(ach,/secret_icecream_dream_scoop/);
  assert.match(ach,/secret_icecream_20/);
  assert.match(app,/iceCreamDreamScoop:\.02/);
  assert.match(index,/rareIceCreamDreamScoopOddsSelect/);
  assert.match(index,/Vanilla · 2%/);
  assert.match(index,/Test · 25%/);
  assert.match(index,/Always · 100%/);
});

test('Ice Cream Scoop UI provides difficulty selection, live tower feedback and drop control',()=>{
  const index=read('index.html'),css=read('arcade-ice-cream-scoop.css'),js=read('arcade-ice-cream-scoop.js');
  assert.match(index,/data-icecream-difficulty="easy"/);
  assert.match(index,/data-icecream-difficulty="normal"/);
  assert.match(index,/data-icecream-difficulty="hard"/);
  assert.match(index,/id="iceCreamDrop"/);
  assert.match(index,/id="iceCreamDreamBanner"/);
  assert.match(css,/icecream-scoop\.is-falling/);
  assert.match(js,/core\.stepPhysics/);
  assert.match(js,/claimDreamPrize/);
  assert.match(js,/Dream Scoop/);
});
