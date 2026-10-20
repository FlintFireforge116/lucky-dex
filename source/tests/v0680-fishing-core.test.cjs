'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Species=require('../app/src/main/assets/adventure/adventure-species.js');
let Core;try{Core=require('../app/src/main/assets/arcade-fishing-core.js')}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;Core={};}

test('Fishing catalog includes every Water-type Pokemon exactly once in its regional generation catalog',()=>{
  assert.equal(typeof Core.buildCatalog,'function');
  const catalog=Core.buildCatalog(Species.byId);
  const expected=Object.values(Species.byId).filter(p=>Array.isArray(p.types)&&p.types.includes('water')).map(p=>p.id).sort((a,b)=>a-b);
  const actual=Object.values(catalog.regions||{}).flatMap(r=>r.species||[]).map(Number).sort((a,b)=>a-b);
  assert.deepEqual(actual,expected);
  assert.equal(new Set(actual).size,actual.length);
  assert(Object.keys(catalog.regions).length>=9);
});

test('generated Pokemon catches have actual scaled size, rarity, difficulty and size-sensitive value',()=>{
  assert.equal(typeof Core.createCatch,'function');
  const small=Core.createCatch({species:Species.byId[129],rolls:{size:.2,rarity:.5},rod:'old'});
  const large=Core.createCatch({species:Species.byId[129],rolls:{size:.98,rarity:.5},rod:'old'});
  for(const c of [small,large]){assert.equal(c.kind,'pokemon');assert(c.lengthM>0);assert(c.weightKg>0);assert(c.value>0);assert(c.difficulty>0);assert(c.rarity);}
  assert(large.lengthM>small.lengthM);assert(large.weightKg>small.weightKg);assert(large.value>small.value);
});

test('Fishing state migrates additively and shop purchases rods/bait with Fishing Tokens',()=>{
  assert.equal(typeof Core.ensureState,'function');assert.equal(typeof Core.buy,'function');
  const save={profile:{coins:10000},arcade:{keep:'yes',fishing:{fishingTokens:5000}}};const s=Core.ensureState(save);
  assert.equal(save.arcade.keep,'yes');assert(s.rods.old);assert.equal(s.rods.good,false);assert.equal(s.bait.basic,0);
  const buyRod=Core.buy(save,'rod','good');assert.equal(buyRod.ok,true);assert.equal(Core.ensureState(save).rods.good,true);assert.equal(save.profile.coins,10000);assert(Core.ensureState(save).fishingTokens<5000);
  const before=Core.ensureState(save).bait.honey||0;const buyBait=Core.buy(save,'bait','honey');assert.equal(buyBait.ok,true);assert.equal(Core.ensureState(save).bait.honey,before+buyBait.quantity);
});

test('treasure and Easter-egg junk tables include LuckyDex rewards and Pokemon-world junk',()=>{
  assert(Array.isArray(Core.TREASURE));assert(Array.isArray(Core.JUNK));
  for(const kind of ['dust','tickets','pack','coins'])assert(Core.TREASURE.some(x=>x.rewardKind===kind),kind);
  for(const name of ['Rotten Leftovers','Rusty Bike','Frayed Escape Rope','Shattered BlackGlasses','Decomposed Apricorn','Slowpoke Tail','Torn Eon Ticket'])assert(Core.JUNK.some(x=>x.name===name),name);
});

test('rare forcing can deterministically force treasure, Easter junk and jumbo Pokemon',()=>{
  assert.equal(typeof Core.rollCatch,'function');
  const area={species:[129,118,120],region:'kanto',id:'test'};
  assert.equal(Core.rollCatch({area,speciesById:Species.byId,settings:{fishingTreasure:1},seed:1}).kind,'treasure');
  const junk=Core.rollCatch({area,speciesById:Species.byId,settings:{fishingEasterJunk:1},seed:2});assert.equal(junk.kind,'junk');assert.equal(junk.easter,true);
  const fish=Core.rollCatch({area,speciesById:Species.byId,settings:{fishingJumbo:1},seed:3,forceKind:'pokemon'});assert.equal(fish.kind,'pokemon');assert(fish.sizeRatio>=1.35);
  const mixed={species:[129,131],region:'kanto',id:'mixed'};const ordinary=Core.rollCatch({area:mixed,speciesById:Species.byId,settings:{fishingRarePokemon:0},seed:1,forceKind:'pokemon'});assert.equal(ordinary.rarity,'common','control seed normally catches Magikarp');
  const rare=Core.rollCatch({area:mixed,speciesById:Species.byId,settings:{fishingRarePokemon:1},seed:1,forceKind:'pokemon'});assert.ok(['rare','very-rare','legendary'].includes(rare.rarity),'forced rare Pokémon uses the rare class pool');
});
