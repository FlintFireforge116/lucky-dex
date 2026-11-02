const t=require('node:test'),a=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
function comp(text,kind='attack',damage=0){const r=N.compileEffect(text,kind,damage);a.equal(r.supported,true,text);a.deepEqual(E.validateEffect(r.effect),[],text);return r.effect;}
function ability(text){const r=N.compileAbility({name:'Test',effect:text});a.equal(r.supported,true,text);a.deepEqual(E.validateEffect(r.ability.effect),[],text);return r.ability;}
function battleState(player='A1-001',opponent='A1-001'){
 const deck=D.BEGINNER_IVYSAUR_DECK.slice(),b=C.createBattle({playerDeck:deck,opponentDeck:deck,seed:440,firstSide:'player'});b.phase='battle';b.activeSide='player';b.turnNumber=5;
 b.sides.player.active=C.makePokemonSlot(player,1,'p');b.sides.opponent.active=C.makePokemonSlot(opponent,1,'o');b.sides.player.bench=[];b.sides.opponent.bench=[];b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.discard=[];b.sides.opponent.discard=[];b.sides.player.energyUsed=false;b.sides.player.retreated=false;b.sides.player.supporterUsed=false;return b;
}

t('second v06944 attack tranche compiles automatic and single-target effects',()=>{
 const cases=[
  ['Take a {P} Energy from your Energy Zone and attach it to Mesprit or Azelf.','attachEnergy'],
  ['1 Special Condition from among Asleep, Burned, Confused, Paralyzed, and Poisoned is chosen at random, and your opponent\'s Active Pokémon is now affected by that Special Condition. Any Special Conditions already affecting that Pokémon will not be chosen.','randomStatus'],
  ['Flip 2 coins. If both of them are heads, your opponent\'s Active Pokémon is Knocked Out.','allHeadsEffect'],
  ['Flip 2 coins. This attack does 90 damage for each heads. Your opponent\'s Active Pokémon is now Confused.','sequence'],
  ['Discard 2 random Energy from among the Energy attached to all Pokémon (both yours and your opponent\'s).','globalRandomDiscardEnergy'],
  ["1 other Pokémon (either yours or your opponent's) is chosen at random 1 time. Do 100 damage to the chosen Pokémon.",'randomPokemonDamage'],
  ["This attack's damage is reduced by the amount of damage this Pokémon has on it.",'selfDamagePenalty'],
  ["This attack does 20 more damage for each Trainer card in your opponent's deck.",'deckCountDamage'],
  ["If this Pokémon has at least 2 extra {W} Energy attached, this attack also does 50 damage to 1 of your opponent's Benched Pokémon.",'benchDamage'],
  ['Discard all Water Energy from this Pokémon. This attack does 130 damage to 1 of your opponent\'s Pokémon.','sequence'],
 ];
 for(const [text,type] of cases)a.equal(comp(text).type,type,text);
});

t('second v06944 Trainer tranche compiles search, discard-energy recovery and turn-ending support',()=>{
 const cases=[
  ['Move all {L} Energy from your Benched Pokémon to your Raichu, Electrode, or Electabuzz in the Active Spot.','moveEnergy'],
  ['Put 2 random Basic Pokémon with 50 HP or less from your deck into your hand.','search'],
  ['Put a random Mega Evolution Pokémon ex from your deck into your hand.','search'],
  ['Attach a {R} Energy from your discard pile to your Active {R} Pokémon.','attachEnergyFromDiscard'],
  ["Your opponent's Active Pokémon is now Confused. Flip a coin. If tails, your Active Pokémon is now also Confused.",'sequence'],
  ['Choose 1 of your Alolan Marowak or Turtonator. Take 2 {R} Energy from your Energy Zone and attach it to that Pokémon. Your turn ends.','sequence'],
 ];
 for(const [text,type] of cases)a.equal(comp(text,'trainer').type,type,text);
});

t('second v06944 evolution and activated abilities compile through lifecycle hooks',()=>{
 const cases=[
  ['Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may take a {R} Energy from your Energy Zone and attach it to your Active {R} Pokémon.','triggered','evolved'],
  ["Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may do 20 damage to your opponent's Active Pokémon.",'triggered','evolved'],
  ["Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may do 30 damage to your opponent's Active Pokémon.",'triggered','evolved'],
  ['Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may put 2 random Pokémon Tool cards from your discard pile into your hand.','triggered','evolved'],
  ['Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may have your opponent shuffle their hand into their deck. For each remaining point that your opponent needs to win, they draw a card.','triggered','evolved'],
  ["Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",'triggered','evolved'],
  ["Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may make your opponent's Active Pokémon Poisoned and Burned.",'triggered','evolved'],
  ['Once during your turn, you may take a {P} Energy from your Energy Zone and attach it to this Pokémon. If you use this Ability, your turn ends.','activated',null],
  ['As often as you like during your turn, you may move a {W} Energy from 1 of your Benched {W} Pokémon to your Active {W} Pokémon.','activated',null],
 ];
 for(const [text,type,event] of cases){const x=ability(text);a.equal(x.type,type,text);if(event)a.equal(x.event,event,text);}
});

t('Energy discarded by attacks and retreat is tracked and reusable from the Energy discard',()=>{
 const b=battleState();b.sides.player.active.energy={Fire:2,Water:1};b.sides.player.energyDiscard={};
 E.applyEffect({type:'discardEnergy',target:'self',energyType:'Fire',amount:1},C.effectContext(b,'player'));
 a.equal(b.sides.player.active.energy.Fire,1);a.equal(b.sides.player.energyDiscard.Fire,1);
 E.applyEffect({type:'attachEnergyFromDiscard',target:'selfActive',energyType:'Fire',amount:1,filter:{subtype:'Grass'}},C.effectContext(b,'player'));
 a.equal(b.sides.player.active.energy.Fire,2);a.equal(b.sides.player.energyDiscard.Fire,0);
});

t('random status never chooses a Special Condition already affecting the target',()=>{
 const b=battleState();b.sides.opponent.active.conditions={sleep:true,burn:true,confusion:true,paralysis:true};
 E.applyEffect({type:'randomStatus',target:'opponentActive',statuses:['sleep','burn','confusion','paralysis','poison'],excludeExisting:true},C.effectContext(b,'player'));
 a.ok(b.sides.opponent.active.conditions.poison);
});

t('all-heads KO and multi-Energy global discard use seeded battle RNG',()=>{
 const ko=battleState();ko.rngState=1; // xorshift sequence deterministic for test
 const eff={type:'allHeadsEffect',coins:2,heads:{type:'setRemainingHp',target:'opponentActive',amount:0}};
 E.applyEffect(eff,{...C.effectContext(ko,'player'),random:()=>0.1});a.ok(ko.sides.opponent.active.damage>=D.cardById(ko.sides.opponent.active.cardId).hp);
 const b=battleState();b.sides.player.active.energy={Grass:1};b.sides.opponent.active.energy={Fire:2};b.sides.player.energyDiscard={};b.sides.opponent.energyDiscard={};
 E.applyEffect({type:'globalRandomDiscardEnergy',amount:2},{...C.effectContext(b,'player'),random:()=>0});
 a.equal(E.totalEnergy(b.sides.player.active.energy)+E.totalEnergy(b.sides.opponent.active.energy),1);
 a.equal(Object.values(b.sides.player.energyDiscard).reduce((x,y)=>x+y,0)+Object.values(b.sides.opponent.energyDiscard).reduce((x,y)=>x+y,0),2);
});
