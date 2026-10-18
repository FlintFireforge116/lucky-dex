const assert=require('assert');
const fs=require('fs');
const path=require('path');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');

assert(core.BURIED_CARD_SITE_CHANCE>=0.04,'buried TCG card chance must remain at least the v0.25.4 4% floor');
assert.strictEqual(typeof core.rollBuriedCardTier,'function','buried card tier helper should be exported');
assert.strictEqual(core.rollBuriedCardTier(0.0000),0);
assert.strictEqual(core.rollBuriedCardTier(0.4949),0);
assert.strictEqual(core.rollBuriedCardTier(0.4950),1);
assert.strictEqual(core.rollBuriedCardTier(0.7749),1);
assert.strictEqual(core.rollBuriedCardTier(0.7750),2);
assert.strictEqual(core.rollBuriedCardTier(0.9249),2);
assert.strictEqual(core.rollBuriedCardTier(0.9250),3);
assert.strictEqual(core.rollBuriedCardTier(0.9749),3);
assert.strictEqual(core.rollBuriedCardTier(0.9750),4);
assert.strictEqual(core.rollBuriedCardTier(0.9899),4);
assert.strictEqual(core.rollBuriedCardTier(0.9900),5);
assert.strictEqual(core.rollBuriedCardTier(0.9949),5);
assert.strictEqual(core.rollBuriedCardTier(0.9950),6,'top 0.5% of buried-card rolls should target Secret Rare');
assert.strictEqual(core.rollBuriedCardTier(0.999999),6);

// Seeded frequency sanity check: later releases may raise the v0.25.4 4% floor.
let seed=0xC0FFEE;
const rng=()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/0x100000000; };
let cardSites=0,boosterSites=0;
const trials=10000;
for(let i=0;i<trials;i++){
  const site=core.generateDigSite({rng,minFinds:3,maxFinds:6});
  if(site.finds.some(f=>f.itemId==='tcg-card'))cardSites++;
  if(site.finds.some(f=>f.itemId==='tcg-booster'))boosterSites++;
}
const rate=cardSites/trials,boosterRate=boosterSites/trials;
assert(rate>0.13&&rate<0.17,`expected current buried-card site rate in the 13–17% band, got ${(rate*100).toFixed(2)}%`);
assert.strictEqual(core.BURIED_BOOSTER_SITE_CHANCE,0.04,'buried booster site chance should be 4%');
assert(boosterRate>0.03&&boosterRate<0.05,`expected buried-booster site rate in the 3–5% band, got ${(boosterRate*100).toFixed(2)}%`);

const officialIds=[
  'cover-fossil','plume-fossil','jaw-fossil','sail-fossil',
  'fossilized-bird','fossilized-dino','fossilized-drake','fossilized-fish',
  'hard-stone','everstone','fire-stone','water-stone','thunder-stone','leaf-stone','moon-stone',
  'relic-copper','relic-silver','relic-gold','relic-vase','relic-band','relic-statue','relic-crown',
  'star-piece','rare-bone','comet-shard','nugget','big-nugget','pearl','big-pearl','great-ball','ultra-ball'
];
for(const id of officialIds){
  const item=core.byId(id);assert(item,`catalogue missing ${id}`);
  assert(/fossil-museum-v025[4-9]\/items\//.test(item.sprite),`${id} must use the current authentic item-art directory, got ${item.sprite}`);
  const rel=item.sprite.replace(/^arcade\//,'');
  const file=path.join(__dirname,'..','app','src','main','assets','arcade',rel);
  assert(fs.existsSync(file),`missing authentic sprite for ${id}: ${file}`);
}


for(const item of core.CATALOGUE){
  if(item.id==='poke-ball')continue;
  assert(!/fossil-museum-v025[0-3]\//.test(item.sprite),`${item.id} still points at a retired painted/fallback asset: ${item.sprite}`);
}

const app=fs.readFileSync(path.join(__dirname,'..','app','src','main','assets','app-v0167.js'),'utf8');
assert(app.includes('rollBuriedCardTier(Math.random())'),'buried-card resolver must consume the shared tier-6 roll helper');
assert(app.includes('rarityTier(c)===target'),'buried-card resolver must classify the full card object, not guess from rarity text only');
console.log(`v0.25.4 fossil/card/assets contract passed (${cardSites}/${trials} card sites)`);
