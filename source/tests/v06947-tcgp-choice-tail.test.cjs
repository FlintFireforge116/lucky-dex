const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const dir='../data/tcgp/import/';const all=[...require(dir+'tcgdex-pocket-cards.json'),...require(dir+'tcgdex-A4b-cards.json'),...require(dir+'vociferix-missing-mechanics.json'),...require(dir+'current-pocket-mechanics.json')];const raw=id=>all.find(x=>N.printId(x.id)===N.printId(id));
function battle(){const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:4702,firstSide:'player'});b.phase='battle';b.activeSide='player';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.bench=[];b.sides.opponent.bench=[];b.sides.player.active=C.makePokemonSlot('A1-001',1,'p');b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'o');return b;}

test('Pokemon Flute can bench a chosen Basic from the opponent discard',()=>{
 const b=battle();b.sides.opponent.discard=[{uid:'d',cardId:'A1-001'}];
 E.applyEffect({type:'benchFromDiscard',side:'opponent',amount:1,filter:{kind:'pokemon',stage:'Basic'}},C.effectContext(b,'player'));
 assert.equal(b.phase,'effectChoice');const a=C.legalActions(b,'player').find(x=>x.choiceCardId==='A1-001');assert.ok(a);C.applyAction(b,'player',a);assert.equal(b.sides.opponent.bench[0].cardId,'A1-001');
});

test('Dusknoir style damage transfer can move all damage from chosen Pokemon',()=>{
 const b=battle();b.sides.player.active.damage=60;const dusk=C.makePokemonSlot('A2-072',1,'dusk');dusk.benchSlot=0;b.sides.player.bench=[dusk];
 E.applyEffect({type:'moveDamage',target:'selfPokemon',destination:'self',amount:'all',filter:{damaged:true},excludeSelf:true},C.effectContext(b,'player',{effectTarget:'active'},dusk));
 assert.equal(b.sides.player.active.damage,0);assert.equal(dusk.damage,60);
});

test('random discard-pile Energy attachment consumes actual discarded Energy',()=>{
 const b=battle();b.sides.player.energyDiscard={Fire:1,Water:2};
 E.applyEffect({type:'attachRandomEnergyFromDiscard',target:'self',amount:2},C.effectContext(b,'player',{},b.sides.player.active));
 assert.equal(E.totalEnergy(b.sides.player.active.energy),2);assert.equal(Object.values(b.sides.player.energyDiscard).reduce((a,n)=>a+n,0),1);
});

test('discardEnergy without fixed type exposes an Energy-type choice instead of silently choosing',()=>{
 const b=battle();b.sides.player.active.energy={Water:1,Fire:1};const effect={type:'discardEnergy',target:'self',amount:1};
 const choices=E.choicesForEffect(effect,C.effectContext(b,'player',{},b.sides.player.active));assert.deepEqual(new Set(choices.map(x=>x.effectEnergyType)),new Set(['Water','Fire']));
 E.applyEffect(effect,C.effectContext(b,'player',{effectEnergyType:'Fire'},b.sides.player.active));assert.equal(b.sides.player.active.energy.Fire,0);assert.equal(b.sides.player.active.energy.Water,1);
});

test('remaining choice-tail cards compile with real primitives',()=>{
 for(const id of ['A1a-064','A2-072','A3a-069','B1a-067','B3a-053','B4-117','C1-051']){const c=N.normalizeMechanics(raw(id));assert.equal(c.support.status,'FULL',`${id}: ${c.support.reasons.join(' | ')}`);}
});
