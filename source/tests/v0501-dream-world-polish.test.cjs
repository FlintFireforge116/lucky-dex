const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

function exists(file){ return fs.existsSync(path.join(root,file)); }

test('Dream World uses bundled source-verified scenery instead of a remote hotlink or placeholder',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/art:"arcade\/dream-world\/seek\/forest-base\.jpg"/);
  assert.match(world,/fallbackArt:"arcade\/dream-world\/seek\/forest-base\.jpg"/);
});

test('Dream World minigame UI cannot be selected or browser-callout highlighted',()=>{
  for(const file of ['arcade-ice-cream-scoop.css','arcade-wailord-water-spout.css']){
    const css=read(file);
    assert.match(css,/user-select:\s*none/);
    assert.match(css,/-webkit-user-select:\s*none/);
    assert.match(css,/-webkit-touch-callout:\s*none/);
  }
});

test('Ice Cream Scoop has a readable Dream World art pass and Combee supervisor',()=>{
  const index=read('index.html'),css=read('arcade-ice-cream-scoop.css');
  assert.match(index,/class="icecream-combee"/);
  assert.match(index,/arcade\/sprites\/pokemon\/415\.png/);
  assert.match(css,/Pleasant_Forest\.png/);
  assert.match(css,/color:\s*#2[0-9a-fA-F]{5}/);
  assert.match(css,/icecream-target-line/);
});

test('Wailord Water Spout uses Dream World sea art and removes sprite-name clutter',()=>{
  const css=read('arcade-wailord-water-spout.css'),js=read('arcade-wailord-water-spout.js');
  assert.match(css,/Sparkling_Sea\.png/);
  assert.doesNotMatch(js,/<small>\$\{p\.label\}<\/small>/);
  assert.match(css,/\.wailord-actor\{[^}]*width:\s*1(?:1[0-9]|2[0-9])px/s);
});

test('Ice Cream Scoop keeps difficulty-specific physical tuning after the v0.50.1 polish',()=>{
  const core=require(path.join(root,'arcade-ice-cream-scoop-core.js'));
  assert.ok(core.DIFFICULTIES.normal.friction>core.DIFFICULTIES.hard.friction);
  assert.ok(core.DIFFICULTIES.normal.angularDamping>0);
  assert.ok(core.DIFFICULTIES.hard.gravity>=core.DIFFICULTIES.normal.gravity);
});

test('release markers are not older than the v0.50.1 Dream World polish baseline',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(__dirname,'..','app','build.gradle'),'utf8');
  const app=read('app-v0167.js');
  const [major,minor,patch]=pkg.version.split('.').map(Number);
  assert.ok(major>0||minor>50||(minor===50&&patch>=1));
  const version=JSON.parse(fs.readFileSync(path.join(__dirname,'..','package.json'),'utf8')).version;
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)[1])>=5001);
  assert.ok(gradle.includes("versionName '"+version+"'"));
  assert.ok(app.includes("__LUCKYDEX_BUILD='"+version+"'"));
});
