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
 for(const n of [3,9,65,113,132,151,152,153,154])assert.equal(sv.cardById('sv3pt5-'+n).battleEnabled,false);
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
