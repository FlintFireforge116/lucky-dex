const assert=require('node:assert/strict');
const path=require('node:path');

// v0.26.5: physical pack art must resolve from bundled JS metadata alone.
// Runtime JSON fetches are not allowed to decide whether known pack art exists.
global.fetch=async()=>{throw new Error('runtime manifest fetch must not be required');};
const art=require(path.join(process.cwd(),'app/src/main/assets/booster-art-v0260.js'));

(async()=>{
  assert.equal(await art.resolve({id:'library:base2',name:'Jungle'}),'booster-art-v0260/base2.webp');
  assert.equal(await art.resolve({id:'library:ex1',name:'Ruby & Sapphire'}),'booster-art-v0260/ex1.webp');
  assert.equal(await art.resolve({id:'library:ecard3',name:'Skyridge'}),'booster-art-v0260/ecard3.webp');
  assert.equal(await art.resolve({id:'library:sm35',name:'Shining Legends'}),'booster-art-v0260/sm35.webp');
  assert.equal(await art.resolve({id:'library:me3',name:'Perfect Order'}),'booster-art-v0260/me3.webp');
  assert.equal(art.directPath({id:'library:base2',name:'Jungle'}),'booster-art-v0260/base2.webp');
  console.log('PASS v0.26.5 direct bundled booster artwork');
})().catch(error=>{console.error(error);process.exit(1);});
