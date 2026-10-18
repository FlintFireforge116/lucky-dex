'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'app/src/main/assets/booster-art-index-v0260.json'),'utf8'));
global.fetch=async()=>{throw new Error('no runtime manifest fetch');};
delete require.cache[require.resolve(path.join(ROOT,'app/src/main/assets/booster-art-v0260.js'))];
const art=require(path.join(ROOT,'app/src/main/assets/booster-art-v0260.js'));

(async()=>{
  const byId=manifest.byId||{}, byName=manifest.byName||{};
  assert.equal(Object.keys(byId).length,144,'expected the complete 144-pack physical artwork catalogue');
  for(const [id,asset] of Object.entries(byId)){
    const expected=art.AUTHENTIC_OVERRIDES?.[id]||asset;
    assert.equal(await art.resolve({id,name:''}),expected,`source set ${id} must resolve directly`);
    assert.ok(fs.existsSync(path.join(ROOT,'app/src/main/assets',asset)),`${id} bundled fallback artwork file missing: ${asset}`);
  }
  for(const [name,asset] of Object.entries(byName)){
    const set={id:'library:unknown',name};
    const expected=art.authenticOverride?.(set)||asset;
    assert.equal(await art.resolve(set),expected,`display-name alias ${name} must resolve directly`);
  }
  const app=fs.readFileSync(path.join(ROOT,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(app,/directPath\?\.\(setRef\)\|\|row\.art/,'saved sealed packs must repair stale artwork with the exact direct path');
  assert.match(app,/runtimeFallback\?\.\(setRef\)/,'saved sealed packs must use the policy-aware fallback so authentic overrides never regress to obsolete thumbnails');
  assert.match(app,/data-booster-fallback/,'saved sealed packs must wire the fallback into rendered pack artwork');
  console.log(`PASS v0.26.5 complete direct pack-art audit: ${Object.keys(byId).length} physical packshots / ${Object.keys(byName).length} name aliases`);
})().catch(error=>{console.error(error);process.exit(1);});
