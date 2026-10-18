const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');const exists=p=>fs.existsSync(path.join(root,p));
let index=read('app/src/main/assets/index.html'),world=read('app/src/main/assets/arcade-world.js'),css=read('app/src/main/assets/arcade-pikachu-beach.css');

test('Summer Beach House still routes the same pikachuBeach game id',()=>{assert.match(world,/games:\['pikachuBeach'\]/);assert.match(world,/pikachuBeach:\(\)=>window\.LuckyDexPikachuBeach/);});

test('Beach opens directly into DX with Classic no longer exposed',()=>{assert.doesNotMatch(index,/pikachuBeachModePicker|pikachuBeachClassicView|data-pikachu-beach-mode="classic"/);assert.match(index,/id="pikachuBeachDxView"/);});

test('DX keeps all controls outside the recovered playfield',()=>{const play=index.indexOf('id="pikachuBeachDxPlayfield"'),controls=index.indexOf('id="pikachuBeachDxControls"');assert.ok(play>=0);assert.ok(controls>play);for(const k of ['up','down','left','right','jump','attack'])assert.match(index,new RegExp(`data-dx-control="${k}"`));assert.doesNotMatch(index,/data-dx-control="tilt"/);assert.match(css,/image-rendering:\s*(?:pixelated|crisp-edges)/);});

test('DX and launcher scripts are local and loaded in dependency order',()=>{for(const f of ['app/src/main/assets/arcade-pikachu-beach-prizes.js','app/src/main/assets/arcade-pikachu-beach-dx-content.js','app/src/main/assets/arcade-pikachu-beach-dx-core.js','app/src/main/assets/arcade-pikachu-beach-dx.js','app/src/main/assets/arcade-pikachu-beach.js'])assert.ok(exists(f),f);const prize=index.indexOf('arcade-pikachu-beach-prizes.js'),content=index.indexOf('arcade-pikachu-beach-dx-content.js'),core=index.indexOf('arcade-pikachu-beach-dx-core.js'),dx=index.indexOf('arcade-pikachu-beach-dx.js'),launcher=index.indexOf('arcade-pikachu-beach.js');assert.ok(prize>=0&&prize<content&&content<core&&core<dx&&dx<launcher);assert.doesNotMatch(index,/arcade-pikachu-beach-classic(?:-core)?\.js/);});

test('launcher exposes a direct DX lifecycle API',()=>{const s=read('app/src/main/assets/arcade-pikachu-beach.js');for(const token of ['open','close','snapshot','LuckyDexPikachuBeachDx'])assert.match(s,new RegExp(token));assert.doesNotMatch(s,/showModePicker|selectMode|LuckyDexPikachuBeachClassic/);});

test('DX controller preserves simultaneous pointer inputs and keyboard map without a Tilt key',()=>{const s=read('app/src/main/assets/arcade-pikachu-beach-dx.js');assert.match(s,/new Map\(\)/);assert.match(s,/pointerId/);assert.match(s,/setPointerCapture/);for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space','KeyZ','Escape'])assert.ok(s.includes(key),key);assert.ok(!s.includes("KeyX:'tilt'"));assert.match(s,/visibilitychange/);assert.match(s,/pagehide/);});

test('DX controller renders recovered animated sprites, visible boss attacks and optional audio locally',()=>{const s=read('app/src/main/assets/arcade-pikachu-beach-dx.js');assert.match(s,/arcade\/pikachu-beach\/dx\/sprites/);assert.match(s,/SPRITE_FRAMES/);assert.match(s,/s_wave1/);assert.match(s,/bossAttacks/);assert.match(s,/new Audio/);assert.match(s,/\.catch\(\(\)=>/);});

test('DX result payload retains its approved metrics and returns to Summer Beach House',()=>{const d=read('app/src/main/assets/arcade-pikachu-beach-dx.js');for(const token of ['Rings','Enemies','Bosses','Allies','Best Combo','Best Trick','HP Left','PLAY DX AGAIN','backFromGame'])assert.ok(d.includes(token),`DX ${token}`);});

test('v0.53.3 release behavior remains present with current aligned metadata',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=pkg.version,parts=version.split('.').map(Number);
  assert.ok(parts[0]>0||parts[1]>53||(parts[1]===53&&parts[2]>=3),`expected >=0.53.3, got ${version}`);
  assert.equal(lock.version,version); if(lock.packages?.[''])assert.equal(lock.packages[''].version,version);
  const escaped=version.replace(/\./g,'\\.'),gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  assert.match(gradle,new RegExp(`versionName\\s+['\"]${escaped}['\"]`));
  assert.match(gradle,new RegExp(`LuckyDex-asset-builder/${escaped}`));
  assert.match(app,new RegExp(`__LUCKYDEX_BUILD=['\"]${escaped}['\"]`));
  assert.ok((html.match(new RegExp(`v${escaped}`,'g'))||[]).length>=1);
});
