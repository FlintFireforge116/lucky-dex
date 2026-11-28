 'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const sv=require('../app/src/main/assets/tcg-classic-151'),data=require('../app/src/main/assets/tcg-classic-battle-data'),core=require('../app/src/main/assets/tcgp-battle-core'),fx=require('../app/src/main/assets/tcgp-battle-effects'),builder=require('../app/src/main/assets/tcg-classic-deck-builder'),opp=require('../app/src/main/assets/tcg-classic-opponents'),picker=require('../app/src/main/assets/tcg-classic-set-picker');
const canonical=require('../docs/SV3PT5_CANONICAL_SOURCE.json'),raw=require('../data/classic/sv3pt5-print-compact.json');
test('pinned 151 catalogue has all 207 numbered prints with exact identity, rules and eligibility',()=>{
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(require.resolve('../data/classic/sv3pt5-print-compact.json'))).digest('hex'),canonical.compactSha256);
 assert.equal(sv.CARDS.length,207);assert.equal(new Set(sv.CARDS.map(c=>c.id)).size,207);
 const codes={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C',Dragon:'N',Fairy:'Y'};
 for(const p of raw){const c=sv.cardById(p.id);assert.equal(data.cardById(p.id),c);assert.deepEqual([c.name,c.number,c.rarity,c.kind,c.image,c.imageLarge],[p.name,p.number,p.rarity,p.kind,p.image,p.imageLarge]);
  if(c.kind==='pokemon'){assert.deepEqual([c.hp,c.types,c.evolvesFrom,c.retreat,c.weakness,c.resistance],[p.hp,p.types,p.evolvesFrom,p.retreat,p.weakness,p.resistance]);assert.deepEqual(c.attacks.map(a=>[a.name,a.cost,a.damageText||'',a.text]),p.attacks.map(a=>[a.name,a.cost.map(x=>codes[x]).join(''),a.damage,a.text]));assert.deepEqual(c.abilities.map(a=>[a.name,a.text]),p.abilities.map(a=>[a.name,a.text]));for(const a of c.attacks)if(c.battleEnabled){assert.ok(fx.supportsEffect(a.effect));assert.equal(a.effect.type==='noop',!a.text);}}
  if(c.kind==='trainer')assert.equal(c.text,p.rules[0]);if(!c.battleEnabled){assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length);}
 }
 for(const n of [65,113,132,151,152,153,154])assert.equal(sv.cardById('sv3pt5-'+n).battleEnabled,false);
 for(const n of [1,2,13,17,32,50,63,83,86,115,206,207])assert.equal(sv.cardById('sv3pt5-'+n).battleEnabled,true);
 assert.equal(sv.cardById('sv3pt5-207').deckEligible,false);
 assert.ok(sv.CARDS.filter(c=>c.battleEnabled).length>=50);
});
test('151 player and CPU selectors are registered, with explicit mixed-pool-only stage gate',()=>{
 for(const ids of [builder.SET_IDS,opp.SETS]){assert.ok(ids.includes('sv3pt5'));assert.match(picker.html({ids,selected:['sv3pt5']}),/data-set-choice="sv3pt5"/);}
 const rows=sv.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 assert.equal(builder.buildDeck(rows,{sets:['sv3pt5']}).ok,false);assert.equal(opp.generate({sets:['sv3pt5'],type:'Grass',seed:3}).ok,false);
});
const deck=[...Array(4).fill('sv1-30'),...Array(4).fill('sv1-32'),...Array(4).fill('sv1-33'),...Array(4).fill('sv1-36'),...Array(4).fill('sv1-188'),...Array(4).fill('sv1-180'),...Array(4).fill('sv1-189'),...Array(2).fill('sv1-194')];
function scene(side,id){const foe=side==='player'?'opponent':'player',s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:32,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Fighting','Psychic'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Fighting','Psychic']});s.phase='battle';s.activeSide=side;s.turnNumber=8;for(const who of [side,foe]){const b=s.sides[who];b.turnCount=4;b.active=core.makePokemonSlot(who===side?id:'sv1-86',1,who+'a');b.active.energy={Fire:4,Grass:4,Water:4,Lightning:4,Fighting:4,Psychic:4};b.bench=['sv1-32','sv1-225','sv1-33'].map((id,i)=>({...core.makePokemonSlot(id,1,who+'b'+i),benchSlot:i}));}return {s,us:s.sides[side],them:s.sides[foe]};}
function attack(s,side,i=0){const a=core.legalActions(s,side).find(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(a,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,a);}
for(const side of ['player','opponent']){
 test(side+' Bulbasaur Leech Seed heals exactly 20',()=>{const {s,us}=scene(side,'sv3pt5-1');const a=us.active;a.damage=30;attack(s,side);assert.equal(a.damage,10);});
 test(side+' Doduo Reckless Charge deals 10 recoil',()=>{const {s,us}=scene(side,'sv3pt5-84');const a=us.active;attack(s,side);assert.equal(a.damage,10);});
 test(side+' Machop Mountain Mashing discards the real top card',()=>{const {s,them}=scene(side,'sv3pt5-66');them.deck.unshift({uid:'151-top',cardId:'sv3-1'});attack(s,side);assert.ok(them.discard.some(r=>r.uid==='151-top'));});
}

// Stage 2: verify new effects, variants and actual symmetric battle outcomes.
test('151 stage 2 exact shared effects and explicit remaining dependencies',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [3,4,8,10,18,22,25,35,38,52,55,56,59,82,88,89,97,98,120,123,125,126,127,129,130,134,135,136,144,149,155,159,165])assert.ok(by(n).battleEnabled,`${n}: ${by(n).support.reasons}`);
 for(const n of [53,65,113,132,143,145,151,152,153,154])assert.equal(by(n).battleEnabled,false,by(n).name);
 for(const c of sv.CARDS.filter(c=>c.battleEnabled)){
   for(const a of c.abilities||[])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
   if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 for(const c of sv.CARDS.filter(c=>+c.number>151&&c.kind==='pokemon')){
   const match=sv.CARDS.find(p=>+p.number<=151&&p.name===c.name&&p.kind===c.kind&&p.hp===c.hp);
   assert.ok(match,c.id);assert.deepEqual(c.attacks,match.attacks);assert.deepEqual(c.abilities,match.abilities);assert.equal(c.battleEnabled,match.battleEnabled);
 }
 assert.equal(by(155).effect.filter.stage,'Stage 2');assert.equal(by(165).effect.filter.stage,'Stage 1');
 assert.equal(by(130).abilities[0].event,'evolved');assert.equal(by(130).abilities[0].fromHandOnly,true);
 assert.deepEqual(by(149).attacks[0].effect,{type:'discardTop',side:'self',amount:2});
 assert.equal(by(149).abilities[0].effect.scope,'team');
});
for(const side of ['player','opponent']){
 test(side+' Ninetales ex Mirrored Flames changes damage only for matching hand sizes',()=>{
  for(const same of [true,false]){const {s,us,them}=scene(side,'sv3pt5-38');them.active=core.makePokemonSlot('sv3pt5-6',1,'target');us.hand=[];them.hand=same?[]:[{uid:'extra',cardId:'sv3pt5-1'}];const target=them.active;
   attack(s,side,1);assert.equal(target.damage,same?220:80);}
 });
 test(side+' Dragonite Dragon Pulse discards exactly two of its own deck cards',()=>{
   const {s,us,them}=scene(side,'sv3pt5-149');
   them.active=core.makePokemonSlot('sv3pt5-6',1,'target');
   us.deck.unshift({uid:'dragon-pulse-first',cardId:'sv3pt5-1'},{uid:'dragon-pulse-second',cardId:'sv3pt5-2'},{uid:'dragon-pulse-third',cardId:'sv3pt5-3'});
   them.deck.unshift({uid:'dragon-pulse-opponent',cardId:'sv3pt5-4'});
   attack(s,side);
   assert.ok(us.discard.some(r=>r.uid==='dragon-pulse-first'));
   assert.ok(us.discard.some(r=>r.uid==='dragon-pulse-second'));
   assert.ok(us.deck.some(r=>r.uid==='dragon-pulse-third'));
   assert.ok(!them.discard.some(r=>r.uid==='dragon-pulse-opponent'));
 });
 test(side+' Fearow Beak Catch and recovery retain optional physical targets',()=>{
   const c=sv.cardById('sv3pt5-22');assert.deepEqual(c.attacks[0].effect,{type:'searchChosen',source:'deck',amount:3,optional:true,filter:{}});
   const d=sv.cardById('sv3pt5-55');assert.deepEqual(d.attacks[0].effect,{type:'searchChosen',source:'discard',amount:4,optional:true,filter:{kind:'pokemon'}});
 });
}

// Stage 3: preserve previous catalogue and gates; check precise new effect schemas.
test('151 stage 3 shared effects, target filters and alternate Trainer prints',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [14,15,31,41,49,58,76,79,80,87,94,107,124,146,150,156,194]){
  const c=by(n);assert.ok(c.battleEnabled,`${c.id}: ${c.support.reasons}`);
  for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 assert.deepEqual(by(14).abilities[0].effect,{type:'preventEffects',duration:'whileInPlay',scope:'self'});
 assert.deepEqual(by(31).attacks[0].effect.attackerFilter,{stage:'Basic'});
 assert.deepEqual(by(58).attacks[0].effect,{type:'discardEnergyCard',target:'opponentActive',amount:1,energyType:'Water',strictEnergyType:true,allowNoTarget:true});
 assert.equal(by(49).attacks[0].effect.effects[1].cardType,'Item');
 assert.equal(by(76).attacks[0].effect.attackName,'*');
 assert.equal(by(87).attacks[0].effect.activeWeaknessResistance,true);
 assert.equal(by(94).attacks[1].effect.benchOnly,true);
 assert.equal(by(107).abilities[0].opponentAttackOnly,true);
 assert.equal(by(146).attacks[0].effect.effects[1].target,'opponentBench');
 assert.deepEqual(by(156).effect,by(194).effect);
 assert.equal(by(156).effect.count,8);assert.equal(by(156).effect.amount,8);
});
for(const side of ['player','opponent']){
 test(side+' Slowpoke Sea Bathing heals 30 damage',()=>{
  const {s,us}=scene(side,'sv3pt5-79');const actor=us.active;actor.damage=40;
  attack(s,side);assert.equal(actor.damage,10);
 });
}

// Stage 4: check real card costs, alternate arts, conditional KO and timing.
test('151 stage 4 shared effects and exact resource restrictions',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [9,21,24,36,68,71,110,157,184,185,200]){
  const c=by(n);assert.ok(c.battleEnabled,`${c.id}: ${c.support.reasons}`);
  for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 const twin=by(9).attacks[0].effect;
 assert.deepEqual(twin,{type:'chooseDiscardForBonus',zone:'hand',max:2,amount:140,filter:{kind:'energy',basicEnergy:true,subtype:'Water'}});
 assert.deepEqual(by(9).attacks,by(184).attacks);assert.deepEqual(by(9).attacks,by(200).attacks);
 assert.deepEqual(by(24).attacks,by(185).attacks);
 assert.equal(by(24).attacks[1].effect.opponentChooses,true);
 assert.equal(by(21).abilities[0].effect.firstTurn,true);
 assert.equal(by(36).attacks[1].effect.rule,'sm12RedBanquet');
 assert.deepEqual(by(68).abilities[0].effect,{type:'koGuard',mode:'surviveCoin',remainingHp:10,attackOnly:true});
 assert.deepEqual(by(71).attacks[1].effect,{type:'scheduleDelayed',event:'endOpponentNextTurn',targetMode:'defender',effect:{type:'placeDamageCounters',target:'eventPokemon',amount:120}});
 assert.equal(by(110).abilities[0].event,'knockedOutByAttack');
 assert.equal(by(110).abilities[0].activeOnly,true);
 assert.equal(by(157).effect.effect.filter.basicEnergy,true);
});
for(const side of ['player','opponent']){
 test(side+' Machamp Mountain Chopping mills exactly the top two cards',()=>{
  const {s,them}=scene(side,'sv3pt5-68');
  them.deck.unshift({uid:'151-638-mill1',cardId:'sv3-1'},{uid:'151-638-mill2',cardId:'sv3-2'},{uid:'151-638-mill3',cardId:'sv3-3'});
  attack(s,side);assert.ok(them.discard.some(c=>c.uid==='151-638-mill1'));assert.ok(them.discard.some(c=>c.uid==='151-638-mill2'));assert.ok(!them.discard.some(c=>c.uid==='151-638-mill3'));
 });
}
