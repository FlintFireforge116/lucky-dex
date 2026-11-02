const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const dir='../data/tcgp/import/';
const all=[...require(dir+'tcgdex-pocket-cards.json'),...require(dir+'tcgdex-A4b-cards.json'),...require(dir+'vociferix-missing-mechanics.json'),...require(dir+'current-pocket-mechanics.json')];
const raw=id=>all.find(x=>N.printId(x.id)===N.printId(id));
function battle(){const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:47,firstSide:'player'});b.phase='battle';b.activeSide='player';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.bench=[];b.sides.opponent.bench=[];return b;}
function ref(cardId,uid='h'){return {cardId,uid};}
function hasAction(b,type,pred=()=>true){return C.legalActions(b,'player').some(a=>a.type===type&&pred(a));}

test('Eevee ex can evolve into a Pokemon that evolves from Eevee despite its own name',()=>{
 const b=battle();b.sides.player.active=C.makePokemonSlot('A3b-056',1,'eevee-ex');b.sides.player.hand=[ref('A1-080')];
 assert.ok(hasAction(b,'evolve',a=>a.cardId==='A1-080'&&a.target==='active'));
});

test('Boosted Evolution Eevee can evolve while Active on its first turn and the turn it was played',()=>{
 const b=battle();b.turnNumber=1;b.sides.player.turnCount=1;b.sides.player.active=C.makePokemonSlot('B1-184',1,'eevee');b.sides.player.active.playedOnSideTurn=1;b.sides.player.hand=[ref('A1-080')];
 assert.ok(hasAction(b,'evolve',a=>a.cardId==='A1-080'&&a.target==='active'));
});

test('Alolan Muk suppresses activated Abilities on Basic Pokemon on either side',()=>{
 const b=battle();b.sides.player.active=C.makePokemonSlot('A1-209',1,'porygon');b.sides.opponent.active=C.makePokemonSlot('B2-097',1,'muk');
 assert.equal(hasAction(b,'ability'),false);
});

test('Budew suppression effect validates and can be cleared when the target leaves Active',()=>{
 assert.deepEqual(E.validateEffect({type:'abilitySuppression',target:'opponentActive',duration:'whileActive'}),[]);
 const b=battle();b.sides.opponent.active=C.makePokemonSlot('A1-209',1,'porygon');
 E.applyEffect({type:'abilitySuppression',target:'opponentActive',duration:'whileActive'},C.effectContext(b,'player',{},C.makePokemonSlot('B3-013',1,'budew')));
 assert.equal(E.abilitiesSuppressed(b,'opponent',b.sides.opponent.active,D.cardById),true);
 const old=b.sides.opponent.active;b.sides.opponent.bench=[C.makePokemonSlot('A1-001',1,'bench')];b.sides.opponent.bench[0].benchSlot=0;E.switchPokemon(b.sides.opponent,0,b);
 assert.equal(E.abilitiesSuppressed(b,'opponent',old,D.cardById),false);
});

test('Boltund damaged cost override allows Defiant Spark for one Lightning Energy',()=>{
 const b=battle();b.sides.player.active=C.makePokemonSlot('A4a-031',1,'boltund');b.sides.player.active.damage=10;b.sides.player.active.energy={Lightning:1};
 assert.ok(hasAction(b,'attack',a=>a.attackIndex===0));
 b.sides.player.active.damage=0;
 assert.equal(hasAction(b,'attack',a=>a.attackIndex===0),false);
});

test('Veluza deck-empty cost override allows Shedding Spiral for one Water Energy',()=>{
 const b=battle();b.sides.player.active=C.makePokemonSlot('B2a-031',1,'veluza');b.sides.player.active.energy={Water:1};b.sides.player.deck=[];
 assert.ok(hasAction(b,'attack',a=>a.attackIndex===0));
 b.sides.player.deck=[ref('A1-001','deck')];
 assert.equal(hasAction(b,'attack',a=>a.attackIndex===0),false);
});

test('Double Type abilities compile as runtime additional types',()=>{
 for(const id of ['B3-051','B3-113']){const c=N.normalizeMechanics(raw(id));assert.equal(c.support.status,'FULL',JSON.stringify(c.support.reasons));assert.ok(c.abilities.some(a=>a.effect?.type==='additionalType'));}
});
