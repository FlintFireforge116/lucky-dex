const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
function battle(){const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:17,firstSide:'player'});b.phase='battle';b.activeSide='player';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;b.sides.player.active=C.makePokemonSlot('A1-001',1,'p');b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'o');b.sides.player.hand=[];b.sides.opponent.hand=[];return b;}

test('stacking attack bonus persists while Active and clears when it leaves',()=>{
 const b=battle(),slot=b.sides.player.active;
 E.applyEffect({type:'stackAttackBonus',attackName:'Rolling Frenzy',amount:30},C.effectContext(b,'player',{},slot));
 E.applyEffect({type:'stackAttackBonus',attackName:'Rolling Frenzy',amount:30},C.effectContext(b,'player',{},slot));
 assert.equal(E.attackSpecificBonus(slot,'Rolling Frenzy',b.turnNumber),60);
 b.sides.player.bench=[C.makePokemonSlot('A1-014',1,'b')];b.sides.player.bench[0].benchSlot=0;
 E.switchPokemon(b.sides.player,0,b);
 assert.equal(E.attackSpecificBonus(slot,'Rolling Frenzy',b.turnNumber),0);
});

test('first damage guard prevents only the first damaging attack after play',()=>{
 const b=battle(),slot=b.sides.player.active;
 E.applyEffect({type:'firstDamageGuard',target:'self'},C.effectContext(b,'player',{},slot));
 assert.ok(E.attackIsPrevented(b,'player',slot,b.sides.opponent.active,D.cardById));
 E.consumeDamageGuard(slot,'firstDamage');
 assert.equal(E.attackIsPrevented(b,'player',slot,b.sides.opponent.active,D.cardById),null);
});

test('team status immunity can filter by attached Energy',()=>{
 const b=battle();b.sides.player.bench=[C.makePokemonSlot('A1-014',1,'b')];b.sides.player.bench[0].benchSlot=0;b.sides.player.active.energy={Psychic:1};
 const source=C.makePokemonSlot('A1-001',1,'source');source.benchSlot=1;b.sides.player.bench.push(source);
 const rule={type:'preventStatus',duration:'whileInPlay',scope:'team',filter:{hasEnergyType:'Psychic'}};
 source.syntheticPassive=rule;
 assert.equal(E.matchesFilter(D.cardById(b.sides.player.active.cardId),rule.filter,b.sides.player.active),true);
});

test('top deck count damage counts matching revealed cards and can shuffle afterwards',()=>{
 const b=battle();b.sides.player.deck=[{uid:'1',cardId:'A1-001'},{uid:'2',cardId:'A1-002'},{uid:'3',cardId:'A1-220'}];
 const before=b.sides.player.deck.map(x=>x.cardId).sort();
 const amount=E.topDeckCountAmount({type:'topDeckCountDamage',count:3,filter:{kind:'pokemon'},amount:30,shuffleAfter:true},{...C.effectContext(b,'player'),random:C.random,shuffle:C.shuffle});
 assert.equal(amount,60);assert.deepEqual(b.sides.player.deck.map(x=>x.cardId).sort(),before);
});

test('random Energy attachment chooses from the declared Energy pool',()=>{
 const b=battle();b.sides.player.bench=[C.makePokemonSlot('A1-014',1,'b')];b.sides.player.bench[0].benchSlot=0;
 E.applyEffect({type:'attachRandomEnergy',target:'selfBench',energyTypes:['Grass','Fire','Water'],amount:1},C.effectContext(b,'player',{target:'bench',benchIndex:0}));
 assert.equal(Object.values(b.sides.player.bench[0].energy).reduce((a,n)=>a+n,0),1);
});

test('new tail effects validate independently',()=>{
 assert.deepEqual(E.validateEffect({type:'coinBenchDamage',coins:3,amount:20}),[]);
 assert.deepEqual(E.validateEffect({type:'searchThenShuffleChosen',amount:2,filter:{kind:'pokemon'},handFilter:{kind:'pokemon'}}),[]);
});

test('multi-type Energy damage counts only declared Energy types',()=>{
 const b=battle(),slot=b.sides.player.active;slot.energy={Fire:2,Lightning:1,Water:2};
 const attack={name:'Mega Burst',damage:0,effect:{type:'energyDamage',source:'self',energyTypes:['Fire','Lightning'],amount:50,mode:'replace'}};
 const out=E.resolveAttack(attack,{...C.effectContext(b,'player',{},slot),isAttack:true});
 assert.equal(out.damage,150);
});

test('trainer Energy-discard choices require the full declared amount',()=>{
 const b=battle(),slot=b.sides.player.active;slot.energy={Psychic:1};slot.damage=50;
 const effect={type:'sequence',effects:[{type:'heal',target:'selfPokemon',amount:90,filter:{subtype:'Grass',energyTypeAtLeast:{type:'Psychic',amount:2}}},{type:'discardEnergy',target:'selfPokemon',energyType:'Psychic',amount:2}]};
 assert.deepEqual(E.choicesForEffect(effect,C.effectContext(b,'player')),[]);
 slot.energy.Psychic=2;
 assert.ok(E.choicesForEffect(effect,C.effectContext(b,'player')).length>0);
});

test('bench damage-transfer ability moves damage from Active to the ability user',()=>{
 const b=battle();const source=C.makePokemonSlot('A1-014',1,'bramble');source.damage=0;source.benchSlot=0;b.sides.player.bench=[source];b.sides.player.active.damage=50;
 E.applyEffect({type:'moveDamage',target:'selfActive',destination:'self',amount:30},C.effectContext(b,'player',{},source));
 assert.equal(b.sides.player.active.damage,20);assert.equal(source.damage,30);
});
