'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const modPath='../app/src/main/assets/card-rarity-v0253.js';
assert.ok(fs.existsSync(path.join(__dirname,modPath)),'card-rarity-v0253.js must exist');
const R=require(modPath);
{
  const c=R.classify({name:'Reverse Common',rarity:'Common',_foil:'Reverse Holo'});
  assert.equal(c.rarityClass,'common');assert.equal(c.tier,0);assert.equal(c.finish,'reverse-holo');
}
{
  const c=R.classify({name:'Holo Rare',rarity:'Rare Holo'});
  assert.equal(c.rarityClass,'rare');assert.equal(c.tier,2);assert.equal(c.finish,'holo');
}
{
  const c=R.classify({name:'Secret Rare Something',rarity:'Common'});
  assert.equal(c.rarityClass,'common','source rarity outranks name inference');assert.equal(c.tier,0);
}
{
  const c=R.classify({name:'Mysterious Gold Secret Rare',rarity:''});
  assert.equal(c.rarityClass,'secret');assert.equal(c.impactTier,6);
}
{
  const c=R.classify({name:'Plain Secret',rarity:'Secret Rare'});
  assert.equal(c.rarityClass,'secret');assert.equal(c.impactTier,6);assert.equal(c.revealLabel,'SECRET RARE');assert.equal(c.isRareHit,true);
}
{
  const c=R.classify({name:'Golden Secret',rarity:'Gold Secret Rare'});
  assert.equal(c.rarityClass,'secret');assert.ok(c.chaseTraits.includes('gold'));assert.equal(c.impactStyle,'gold');assert.match(c.revealLabel,/GOLD/);assert.match(c.revealLabel,/SECRET RARE/);
}
assert.equal(R.tradeClass({name:'Promo Pikachu',rarity:'Promo'}),'promo');
assert.equal(R.finish({rarity:'Common',_foil:'Reverse Holo'}),'reverse-holo');
assert.equal(R.tier({rarity:'Common',_foil:'Reverse Holo'}),0);
console.log('PASS v0.25.3 canonical card rarity contract');
