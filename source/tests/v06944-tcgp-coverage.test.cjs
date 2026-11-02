const t=require('node:test'),a=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');

function battleState(player='A1-001',opponent='A1-001'){
 const deck=D.BEGINNER_IVYSAUR_DECK.slice(),b=C.createBattle({playerDeck:deck,opponentDeck:deck,seed:44,firstSide:'player'});
 b.phase='battle';b.activeSide='player';b.turnNumber=5;
 b.sides.player.active=C.makePokemonSlot(player,1,'p');b.sides.opponent.active=C.makePokemonSlot(opponent,1,'o');
 b.sides.player.bench=[];b.sides.opponent.bench=[];b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.discard=[];b.sides.opponent.discard=[];
 b.sides.player.energyUsed=false;b.sides.player.retreated=false;b.sides.player.supporterUsed=false;b.sides.opponent.energyUsed=false;b.sides.opponent.retreated=false;b.sides.opponent.supporterUsed=false;
 return b;
}

function comp(text,kind='attack',damage=0){const r=N.compileEffect(text,kind,damage);a.equal(r.supported,true,text);a.deepEqual(E.validateEffect(r.effect),[],text);return r.effect;}
function ability(text){const r=N.compileAbility({name:'Test',effect:text});a.equal(r.supported,true,text);a.deepEqual(E.validateEffect(r.ability.effect),[],text);return r.ability;}

t('v06944 deterministic attack coverage compiles into executable primitives',()=>{
 const cases=[
  ["If the Defending Pokémon is a Basic Pokémon, it can't attack during your opponent's next turn.",'lock'],
  ['If this Pokémon evolved from Dunsparce during this turn, discard 2 random Energy from your opponent\'s Active Pokémon.','discardEnergy'],
  ['If you have 4 or more Lightning Energy in play, this attack does 70 more damage.','bonusDamage'],
  ["If your opponent's Active Pokémon is Poisoned, heal 60 damage from this Pokémon.",'healSelf'],
  ['Prevent all damage done to this Pokémon by attacks from Basic Pokémon during your opponent\'s next turn.','preventDamage'],
  ['Put 1 random {C} Pokémon from your deck into your hand.','search'],
  ['This attack also does 20 damage to 1 of your Pokémon.','damage'],
  ['This attack does 40 damage for each time your Pokémon used Sweets Relay during this game.','usedAttackCountDamage'],
  ["This Pokémon also does 100 damage to itself and 50 damage to all Benched Pokémon (both yours and your opponent's).",'sequence'],
  ["Your opponent's Active Pokémon is now Poisoned. During your opponent's next turn, that Pokémon can't retreat.",'sequence'],
  ["Discard all Energy from this Pokémon. Knock Out your opponent's Active Pokémon.",'sequence'],
  ["During your opponent's next turn, they can't play any Trainer cards from their hand.",'actionLock'],
 ];
 for(const [text,type] of cases)a.equal(comp(text).type,type,text);
});

t('v06944 deterministic Trainer coverage compiles with legality conditions',()=>{
 const mars=comp("Your opponent shuffles their hand into their deck and draws a card for each of their remaining points needed to win.",'trainer');a.equal(mars.type,'handShuffle');a.equal(mars.draw,'pointsRemaining');
 const lana=comp('You can use this card only if you have Araquanid in play. Switch in 1 of your opponent\'s Benched Pokémon to the Active Spot.','trainer');a.equal(lana.type,'switch');a.equal(lana.side,'opponent');a.equal(lana.condition.type,'pokemonPresent');
 const lyra=comp('Switch your Active Pokémon that has damage on it with 1 of your Benched Pokémon.','trainer');a.equal(lyra.type,'switch');a.equal(lyra.side,'self');a.equal(lyra.condition.type,'selfDamaged');
});

t('v06944 lifecycle and passive abilities compile without fake choices',()=>{
 const cases=[
  ['Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may draw 2 cards.','triggered','evolved'],
  ["Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may discard a random Energy from your opponent's Active Pokémon.",'triggered','evolved'],
  ['Whenever you attach an Energy from your Energy Zone to this Pokémon, put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it.','triggered','energyAttached'],
  ["This Pokémon can't be Asleep.",'passive',null],
  ["Your opponent can't play any Pokémon from their hand to evolve their Active Pokémon.",'passive',null],
  ["As long as this Pokémon is in the Active Spot, your opponent can't play any Stadium cards from their hand.",'passive',null],
 ];
 for(const [text,type,event] of cases){const r=ability(text);a.equal(r.type,type,text);if(event)a.equal(r.event,event,text);}
});

t('Mars redraws opponent to their remaining points needed to win',()=>{
 const b=battleState();b.sides.opponent.points=1;b.sides.opponent.hand=[{uid:'h1',cardId:'A1-001'},{uid:'h2',cardId:'A1-001'},{uid:'h3',cardId:'A1-001'}];b.sides.opponent.deck=Array.from({length:8},(_,i)=>({uid:'d'+i,cardId:'A1-001'}));
 E.applyEffect({type:'handShuffle',side:'opponent',draw:'pointsRemaining'},C.effectContext(b,'player'));
 a.equal(b.sides.opponent.hand.length,2);
});

t('Sweets Relay scaling counts actual attack uses, not cards that happen to know the move',()=>{
 const b=battleState();b.sides.player.attackCounts={'Sweets Relay':3};
 const effect={type:'usedAttackCountDamage',attackName:'Sweets Relay',amount:40,mode:'replace'};
 const r=E.resolveAttack({name:'Sweets Overload',damage:0,effect},{...C.effectContext(b,'player'),isAttack:true});
 a.equal(r.damage,120);
});

t('sleep-only immunity blocks Sleep but does not incorrectly block Poison',()=>{
 const b=battleState('A4-140');
 const ctx=C.effectContext(b,'opponent');ctx.foeSide='player';ctx.defender=b.sides.player.active;ctx.attacker=b.sides.opponent.active;
 E.applyEffect({type:'status',target:'opponentActive',status:'sleep'},ctx);a.equal(!!b.sides.player.active.conditions.sleep,false);
 E.applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);a.equal(!!b.sides.player.active.conditions.poison,true);
});

t('passive Trainer and Active-evolution locks affect legal actions at the correct scope',()=>{
 const stadium=battleState('B3b-055');stadium.sides.opponent.hand=[{uid:'stad',cardId:'A2-155'}]; // replace below with a real Stadium if available
 const stadiumCard=D.CARDS.find(c=>c.kind==='trainer'&&c.trainerType==='Stadium'&&c.battleEnabled);a.ok(stadiumCard);stadium.sides.opponent.hand=[{uid:'stad',cardId:stadiumCard.id}];stadium.activeSide='opponent';
 a.equal(C.legalActions(stadium,'opponent').some(x=>x.type==='trainer'&&x.cardId===stadiumCard.id),false,'Snorlax should block Stadiums while Active');
 const evo=battleState('A1a-046');const basic=C.makePokemonSlot('A1-001',1,'opp');basic.playedOnSideTurn=1;evo.sides.opponent.active=basic;evo.sides.opponent.turnCount=3;
 const evolution=D.CARDS.find(c=>c.battleEnabled&&c.kind==='pokemon'&&c.stage==='Stage 1'&&c.evolvesFrom===D.cardById(basic.cardId).name);a.ok(evolution);evo.sides.opponent.hand=[{uid:'evo',cardId:evolution.id}];evo.activeSide='opponent';
 a.equal(C.legalActions(evo,'opponent').some(x=>x.type==='evolve'&&x.target==='active'),false,'Aerodactyl ex should block evolving only the opponent Active');
});
