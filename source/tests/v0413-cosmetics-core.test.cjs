'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

const corePath='../app/src/main/assets/cosmetics-core-v0413.js';
const cataloguePath='../app/src/main/assets/cosmetics-catalog-v0413.js';

function fresh(){
  delete require.cache[require.resolve(corePath)];
  delete require.cache[require.resolve(cataloguePath)];
  return require(corePath);
}

test('missing cosmetics state normalizes all always-available LuckyDex sleeves unlocked with default active',()=>{
  const c=fresh();
  const out=c.normaliseCosmetics(null);
  assert.deepEqual(out.unlockedSleeves,['luckydex-default','luckydex-midnight','luckydex-cream','luckydex-pixel']);
  assert.equal(out.activeSleeve,'luckydex-default');
  assert.deepEqual(out.discoveredSecrets,[]);
  assert.deepEqual(out.claimedCosmeticRewards,[]);
});

test('normalization repairs malformed arrays duplicate ids and unknown active sleeve',()=>{
  const c=fresh();
  const out=c.normaliseCosmetics({unlockedSleeves:['luckydex-default','luckydex-default','luckydex-midnight',7],activeSleeve:'removed-id',discoveredSecrets:['x','x',3],claimedCosmeticRewards:['a','a',null]});
  assert.deepEqual(out.unlockedSleeves,['luckydex-default','luckydex-midnight','luckydex-cream','luckydex-pixel']);
  assert.equal(out.activeSleeve,'luckydex-default');
  assert.deepEqual(out.discoveredSecrets,['x']);
  assert.deepEqual(out.claimedCosmeticRewards,['a']);
});

test('unlock is idempotent and equip rejects locked or unknown sleeves without mutation',()=>{
  const c=fresh();
  const state={cosmetics:c.normaliseCosmetics(null)};
  assert.deepEqual(c.unlockSleeve(state,'missing'),{ok:false,changed:false,id:'missing'});
  assert.equal(c.equipSleeve(state,'luckydex-midnight').ok,true);
  assert.equal(state.cosmetics.activeSleeve,'luckydex-midnight');
  assert.equal(c.equipSleeve(state,'kanto-red').ok,false);
  assert.equal(state.cosmetics.activeSleeve,'luckydex-midnight');
  const first=c.unlockSleeve(state,'kanto-red','token:1');
  assert.equal(first.ok,true);assert.equal(first.changed,true);
  const again=c.unlockSleeve(state,'kanto-red','token:1');
  assert.equal(again.ok,true);assert.equal(again.changed,false);
  assert.equal(c.equipSleeve(state,'kanto-red').ok,true);
  assert.equal(state.cosmetics.activeSleeve,'kanto-red');
});
test('discoverSecret persists a stable id once',()=>{
  const c=fresh();
  const state={cosmetics:c.normaliseCosmetics(null)};
  assert.equal(c.discoverSecret(state,'v0413_secret_kanto_starters'),true);
  assert.equal(c.discoverSecret(state,'v0413_secret_kanto_starters'),false);
  assert.equal(c.isDiscovered(state,'v0413_secret_kanto_starters'),true);
});

test('ensureState only changes cosmetics branch',()=>{
  const c=fresh();
  const state={profile:{coins:123},sentinel:{nested:['keep',1]},cosmetics:{activeSleeve:'bad'}};
  const before=JSON.stringify({profile:state.profile,sentinel:state.sentinel});
  c.ensureState(state);
  assert.equal(JSON.stringify({profile:state.profile,sentinel:state.sentinel}),before);
  assert.equal(state.cosmetics.activeSleeve,'luckydex-default');
});
