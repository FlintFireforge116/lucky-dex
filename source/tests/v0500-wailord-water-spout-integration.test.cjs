const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('Dream World exposes Wailord Water Spout beside Ice Cream Scoop',()=>{
  const world=read('arcade-world.js'),index=read('index.html');
  assert.match(world,/games:\['iceCreamScoop','wailordWaterSpout'(?:,'[^']+')*\]/);
  assert.match(world,/wailordWaterSpout:'Wailord’s Water Spout'/);
  assert.match(world,/wailordWaterSpout:\(\)=>window\.LuckyDexWailordWaterSpout/);
  assert.match(index,/id="wailordWaterSpoutGame"/);
  assert.match(index,/arcade-wailord-water-spout-core\.js/);
  assert.match(index,/arcade-wailord-water-spout\.js/);
  assert.match(index,/arcade-wailord-water-spout\.css/);
});

test('Wailord Water Spout uses the four original Pokemon and arrow-plus-shoot controls',()=>{
  const index=read('index.html'),js=read('arcade-wailord-water-spout.js');
  for(const dex of [321,25,52,393,418]) assert.match(index,new RegExp(`arcade/sprites/pokemon/${dex}\\.png`));
  assert.match(index,/id="wailordLeft"/);
  assert.match(index,/id="wailordShoot"/);
  assert.match(index,/id="wailordRight"/);
  assert.match(js,/shootHeldPokemon/);
  assert.doesNotMatch(js,/moveWailord/);
  assert.doesNotMatch(index,/DRAG WAILORD/);
});

test('Wailord Water Spout has records, achievements, and a forceable Rainbow Dream Ball event',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js'),ach=read('achievements-v0341.js'),app=read('app-v0167.js'),index=read('index.html');
  assert.match(platform,/wailordWaterSpout:\{gamesPlayed:0/);
  assert.match(records,/wailordWaterSpout/);
  assert.match(ach,/wailord_first_clear/);
  assert.match(ach,/secret_wailord_rainbow_ball/);
  assert.match(ach,/secret_wailord_perfect_clear/);
  assert.match(app,/wailordRainbowBall:\.02/);
  assert.match(index,/rareWailordRainbowBallOddsSelect/);
  assert.match(index,/Rainbow Dream Ball · Wailord/);
  assert.match(index,/Always · 100%/);
});

test('Wailord Water Spout UI includes difficulty, timer, coloured-ball goal and pause handling',()=>{
  const index=read('index.html'),css=read('arcade-wailord-water-spout.css'),js=read('arcade-wailord-water-spout.js');
  assert.match(index,/data-wailord-difficulty="easy"/);
  assert.match(index,/data-wailord-difficulty="normal"/);
  assert.match(index,/data-wailord-difficulty="hard"/);
  assert.match(index,/id="wailordTimer"/);
  assert.match(index,/id="wailordOpened"/);
  assert.match(index,/15 TO CLEAR/);
  assert.match(css,/wailord-rainbow-ball/);
  assert.match(js,/function pause\(/);
  assert.match(js,/function resume\(/);
});
