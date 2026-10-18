'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const artPath=path.join(ROOT,'app/src/main/assets/booster-art-v0260.js');
(async()=>{
  const oldFetch=global.fetch;
  global.fetch=async url=>({ok:true,json:async()=>({schema:2,byId:{base1:'booster-art-v0260/base1.webp'},byName:{base:'booster-art-v0260/base1.webp','base set':'booster-art-v0260/base1.webp'},byAppKey:{}})});
  delete require.cache[require.resolve(artPath)];
  const BoosterArt=require(artPath);
  assert.equal(await BoosterArt.resolve({id:'library:BS',_libraryKey:'BS',name:'Base Set'}),'booster-art-v0260/base1.webp','Base Set must resolve to bundled art by audited name alias even when catalogue IDs differ');
  assert.equal(await BoosterArt.resolveRemote({id:'base1'}),'','v0.26.4 must not rely on runtime GitHub API fallback');
  global.fetch=oldFetch;
  console.log('PASS v0.26.4 local runtime artwork alias fallback');
})().catch(e=>{console.error(e);process.exit(1);});
