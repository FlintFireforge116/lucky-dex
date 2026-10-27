const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('arcade daily item rewards render human text instead of object stringification',()=>{
  const platform=require('../app/src/main/assets/arcade-platform.js');
  assert.equal(platform.formatItemAward({key:'berry',amount:3}),'3 Berries');
  assert.equal(platform.formatItemAward({key:'greatball',amount:2}),'2 Great Balls');
  assert.equal(platform.formatItemAward(null),'');
  const amie=read('app/src/main/assets/arcade-amie.js');
  assert.ok(!amie.includes('String(reward.itemAwarded)'));
  assert.match(amie,/formatItemAward/);
});

test('roulette multipliers are concise for display without changing payout maths',()=>{
  const core=require('../app/src/main/assets/arcade-roulette-core.js');
  assert.equal(core.formatMultiplier(11/3),'3.67');
  assert.equal(core.formatMultiplier(5.5),'5.5');
  assert.equal(core.formatMultiplier(11),'11');
  assert.equal(core.formatMultiplier(2.75),'2.75');
  const ui=read('app/src/main/assets/arcade-roulette.js');
  assert.match(ui,/formatMultiplier/);
});

test('Goldenrod hands the already chosen participant directly into the game after its first-open help',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const goldenrod=read('app/src/main/assets/arcade-goldenrod.js');
  assert.match(world,/function openGame\(id,options=\{\}\)/);
  assert.match(world,/options\.onReady/);
  assert.match(goldenrod,/openGame\(eventId,\{onReady:/);
  assert.ok(!goldenrod.includes('world.openGame(eventId);\n    const api=gameApi(eventId);'));
});

test('Android native viewport does not reserve the navigation safe-area twice',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  const css=read('app/src/main/assets/styles-v013.css');
  assert.match(app,/android-native-inset/);
  assert.match(css,/html\.android-native-inset \.bottom-nav\s*\{[^}]*height:\s*var\(--nav-h\)[^}]*padding-bottom:\s*0/s);
  assert.match(css,/html\.android-native-inset main\s*\{[^}]*height:\s*calc\(100dvh - var\(--chrome-h\) - var\(--nav-h\)\)/s);
});

test('offline cached card art is tried before more remote recovery and failed reward images show a fallback',()=>{
  const pack=read('app/src/main/assets/pack-flow-v0165.js');
  const trade=read('app/src/main/assets/trade-v0163.js');
  const session=read('app/src/main/assets/arcade-session.js');
  assert.match(pack,/LuckyDexOfflineCardArt/);
  assert.match(pack,/urlForCard/);
  assert.match(trade,/LuckyDexOfflineCardArt\?\.urlForCard/);
  assert.match(session,/recoverRewardRevealArtwork/);
  assert.match(session,/image\.onerror/);
});

test('v0.69.32 release metadata is aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.69.32');
  assert.equal(lock.version,'0.69.32');
  assert.equal(lock.packages[''].version,'0.69.32');
  assert.match(gradle,/versionCode\s+7013/);
  assert.match(gradle,/versionName '0\.69\.32'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.32/);
  assert.ok(app.includes("window.__LUCKYDEX_BUILD='0.69.32'"));
  assert.ok((html.match(/v0\.69\.32/g)||[]).length>=2);
});
