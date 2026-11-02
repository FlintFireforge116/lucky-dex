const t=require('node:test'),a=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');

t('Serperior abilities compile as reusable Energy-value and Energy-scaled HP modifiers',()=>{
 const jungle=N.compileAbility({name:'Jungle Totem',effect:"Each {G} Energy attached to your {G} Pokémon provides 2 {G} Energy. This effect doesn't stack."});
 a.equal(jungle.supported,true);a.equal(jungle.ability.effect.type,'modifier');a.equal(jungle.ability.effect.stat,'energyMultiplier');a.equal(jungle.ability.effect.amount,2);a.deepEqual(jungle.ability.effect.filter,{subtype:'Grass'});
 const regal=N.compileAbility({name:'Regal Bloom',effect:'This Pokémon gets +30 HP for each {G} Energy attached to it.'});
 a.equal(regal.supported,true);a.equal(regal.ability.effect.stat,'maxHp');a.equal(regal.ability.effect.perEnergy,true);a.equal(regal.ability.effect.energyType,'Grass');
});

t('common repeated attack texts compile to real reusable mechanics',()=>{
 const cases=[
  ["Your opponent can't use any Supporter cards from their hand during their next turn.",'actionLock'],
  ["During your opponent's next turn, they can't play any Item cards from their hand.",'actionLock'],
  ["Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon.",'discardTool'],
  ["This attack does 20 damage to each of your opponent's Pokémon.",'sequence'],
  ["Put 1 random Basic Pokémon from your deck onto your Bench.",'benchFromDeck'],
  ["Discard a random card from your opponent's hand.",'discardHand'],
  ["If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage.",'bonusDamage'],
  ["If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage.",'bonusDamage'],
  ["If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 50 more damage.",'bonusDamage'],
  ["If this Pokémon evolved during this turn, this attack does 20 more damage.",'bonusDamage'],
  ["Flip 2 coins. If both of them are heads, this attack does 80 more damage.",'allHeadsBonus'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'attack',40);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
});

const D=require('../app/src/main/assets/tcgp-battle-data.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
function battleState(player='A1-001',opponent='A1-001'){
 const deck=D.BEGINNER_IVYSAUR_DECK.slice(),b=C.createBattle({playerDeck:deck,opponentDeck:deck,seed:43,firstSide:'player'});
 b.phase='battle';b.activeSide='player';b.turnNumber=5;
 b.sides.player.active=C.makePokemonSlot(player,1,'p');b.sides.opponent.active=C.makePokemonSlot(opponent,1,'o');
 b.sides.player.bench=[];b.sides.opponent.bench=[];b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.discard=[];b.sides.opponent.discard=[];
 b.sides.player.energyUsed=false;b.sides.player.retreated=false;b.sides.player.supporterUsed=false;b.sides.opponent.energyUsed=false;b.sides.opponent.retreated=false;b.sides.opponent.supporterUsed=false;
 return b;
}

t('Jungle Totem doubles Grass Energy without stacking and Regal Bloom scales max HP',()=>{
 const b=battleState('A1-003');b.sides.player.active.energy={Grass:2};
 a.equal(C.attackAvailability(b,'player',0).usable,false,'Venusaur needs four units without Serperior');
 const ser=C.makePokemonSlot('A1a-006',1,'ser');ser.benchSlot=0;b.sides.player.bench=[ser];
 a.equal(C.attackAvailability(b,'player',0).usable,true,'two Grass should provide four units with Jungle Totem');
 const ser2=C.makePokemonSlot('A1a-006',1,'ser2');ser2.benchSlot=1;b.sides.player.bench.push(ser2);
 a.equal(C.attackAvailability(b,'player',0).usable,true,'duplicate Jungle Totem must not break or stack beyond x2');
 const hp=battleState('B4a-005');hp.sides.player.active.energy={Grass:3};
 a.equal(C.maxHp(hp,'player',hp.sides.player.active),190,'100 HP + 3×30 Grass Energy');
});

t('Headache locks Supporters for the opponent next turn but leaves Items legal',()=>{
 const b=battleState('A1-057');b.sides.player.active.energy={Water:1};
 b.sides.opponent.hand=[{uid:'research',cardId:'P-A-007'},{uid:'ball',cardId:'P-A-005'}];
 const atk=C.legalActions(b,'player').find(x=>x.type==='attack');a.ok(atk);C.applyAction(b,'player',atk);
 const legal=C.legalActions(b,'opponent');
 a.equal(legal.some(x=>x.type==='trainer'&&x.cardId==='P-A-007'),false);
 a.equal(legal.some(x=>x.type==='trainer'&&x.cardId==='P-A-005'),true);
});

t('switch-in and evolve-this-turn attack bonuses use real battle lifecycle state',()=>{
 const b=battleState('A1-001');
 const g=C.makePokemonSlot('A3-022',1,'g');g.energy={Grass:3};g.benchSlot=0;b.sides.player.bench=[g];
 b.sides.player.active.energy={Grass:2};
 const retreat=C.legalActions(b,'player').find(x=>x.type==='retreat'&&x.benchIndex===0);a.ok(retreat);C.applyAction(b,'player',retreat);
 a.equal(C.attackDamagePreview(b,'player',0).damage,120);
 const e=battleState('A1-001');e.sides.player.active=C.makePokemonSlot('A1-001',1,'eevee-holder');e.sides.player.active.cardId='A1-205';
 // Lifecycle condition itself is exercised without relying on a particular Eevee print.
 e.sides.player.active=C.makePokemonSlot('P-A-086',1,'jolt');e.sides.player.active.energy={Lightning:1};e.sides.player.active.evolvedOnTurn=e.turnNumber;
 a.equal(C.attackDamagePreview(e,'player',0).damage,60);
});

t('second coverage tranche compiles lifecycle, retaliation, interference and classic Trainers',()=>{
 const abilityCases=[
  ['Whenever you attach a {P} Energy from your Energy Zone to this Pokémon, heal 20 damage from this Pokémon.','triggered','energyAttached'],
  ["Whenever you attach a {D} Energy from your Energy Zone to this Pokémon, do 20 damage to your opponent's Active Pokémon.",'triggered','energyAttached'],
  ['If you have Arceus or Arceus ex in play, this Pokémon has no Retreat Cost.','passive',null],
  ['If this Pokémon has any Energy attached, it has no Retreat Cost.','passive',null],
 ];
 for(const [text,type,event] of abilityCases){const r=N.compileAbility({name:'Test',effect:text});a.equal(r.supported,true,text);a.equal(r.ability.type,type,text);if(event)a.equal(r.ability.event,event,text);a.deepEqual(E.validateEffect(r.ability.effect),[],text);}
 const attackCases=[
  ["During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen.",'attackCoinGate'],
  ["During your opponent's next turn, if this Pokémon is damaged by an attack, do 40 damage to the Attacking Pokémon.",'retaliateDamage'],
  ["If this Pokémon has any {W} Energy attached, this attack does 40 more damage.",'bonusDamage'],
  ["If this Pokémon has more Energy attached than your opponent's Active Pokémon, this attack does 40 more damage.",'bonusDamage'],
  ["If your opponent's Active Pokémon has more remaining HP than this Pokémon, this attack does 50 more damage.",'bonusDamage'],
  ["If this Pokémon's remaining HP is 30 or less, this attack does 60 more damage.",'bonusDamage'],
  ["This attack does 30 more damage for each point you have gotten.",'pointDamage'],
  ["Take a {L} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon.",'attachEnergy'],
 ];
 for(const [text,type] of attackCases){const r=N.compileEffect(text,'attack',20);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
 const trainerCases=[
  ["Choose 1 of your {W} Pokémon, and flip a coin until you get tails. For each heads, take a {W} Energy from your Energy Zone and attach it to that Pokémon.",'coinUntilTails'],
  ['During this turn, attacks used by your Ninetales, Rapidash, or Magmar do +30 damage to your opponent\'s Active Pokémon.','modifier'],
  ['Take 1 {F} Energy from your Energy Zone and attach it to your Golem or Onix.','attachEnergy'],
 ];
 for(const [text,type] of trainerCases){const r=N.compileEffect(text,'trainer',0);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
});

t('Energy attachment triggered abilities execute on manual Energy attachment',()=>{
 const c=battleState('P-A-037');c.sides.player.active.damage=40;c.sides.player.energyType='Psychic';c.sides.player.energyAvailable=true;c.sides.player.energyUsed=false;
 C.applyAction(c,'player',C.legalActions(c,'player').find(x=>x.type==='attach'&&x.target==='active'));
 a.equal(c.sides.player.active.damage,20,'Cresselia heals after Psychic Energy attachment');
 const d=battleState('P-A-042');d.sides.player.energyType='Darkness';d.sides.player.energyAvailable=true;d.sides.player.energyUsed=false;
 C.applyAction(d,'player',C.legalActions(d,'player').find(x=>x.type==='attach'&&x.target==='active'));
 a.equal(d.sides.opponent.active.damage,20,'Darkrai pings opponent Active after Darkness attachment');
});

t('attack interference and retaliation persist for the intended opponent turn',()=>{
 const gate=battleState('A1-001','A1-001');gate.activeSide='opponent';gate.rngState=8192;gate.sides.opponent.active.energy={Grass:1,Colorless:1};gate.sides.opponent.active.attackGate={type:'attackCoinGate',duration:'opponentTurn',expiresTurn:gate.turnNumber};
 const hit=C.legalActions(gate,'opponent').find(x=>x.type==='attack');a.ok(hit);C.applyAction(gate,'opponent',hit);
 a.ok(gate.log.some(x=>x.type==='attackFailed'&&x.reason==='attackGate'),'tails should cancel the attack');
 const ret=battleState('A1-001','A1-001');ret.sides.player.active.energy={Grass:1,Colorless:1};ret.sides.opponent.active.retaliate={type:'retaliateDamage',amount:30,duration:'opponentTurn',expiresTurn:ret.turnNumber};
 C.applyAction(ret,'player',C.legalActions(ret,'player').find(x=>x.type==='attack'));
 a.equal(ret.sides.player.active.damage,30,'temporary retaliation should damage the attacker');
});

t('classic Trainer coverage is playable with filtered targets',()=>{
 const b=battleState('A1-001');const onix=C.makePokemonSlot('A1-150',1,'onix');onix.benchSlot=0;b.sides.player.bench=[onix];b.sides.player.hand=[{uid:'brock',cardId:'A1-224'}];
 const brock=C.legalActions(b,'player').find(x=>x.type==='trainer'&&x.cardId==='A1-224');a.ok(brock,'Brock should target owned Golem/Onix');C.applyAction(b,'player',brock);a.equal(onix.energy.Fighting,1);
 const m=battleState('A1-001');const water=C.makePokemonSlot('A1-053',1,'water');water.benchSlot=0;m.sides.player.bench=[water];m.sides.player.hand=[{uid:'misty',cardId:'A1-220'}];m.rngState=1;
 const misty=C.legalActions(m,'player').find(x=>x.type==='trainer'&&x.cardId==='A1-220'&&x.target==='bench');a.ok(misty,'Misty should offer Water targets');C.applyAction(m,'player',misty);a.ok(Number(water.energy.Water||0)>=1,'seeded heads sequence should attach Water Energy');
});

t('third coverage tranche compiles repeated dynamic damage and control families',()=>{
 const cases=[
  ["Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way.",'namedAttackCountDamage'],
  ["Flip a coin for each Pokémon you have in play. This attack does 20 damage for each heads.",'coinDamageByPokemon'],
  ["1 of your opponent's Pokémon is chosen at random 4 times. For each time a Pokémon was chosen, do 50 damage to it.",'randomPokemonDamage'],
  ["Discard a random Energy from among the Energy attached to all Pokémon (both yours and your opponent's).",'globalRandomDiscardEnergy'],
  ["This attack does 40 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost.",'retreatCostDamage'],
  ["This attack does 20 damage for each Pokémon Tool attached to all of your Pokémon.",'toolCountDamage'],
  ["During your opponent's next turn, this Pokémon takes +20 damage from attacks.",'modifier'],
  ["During your opponent's next turn, they can't take any Energy from their Energy Zone to attach to their Active Pokémon.",'actionLock'],
  ["During your opponent's next turn, attacks used by the Defending Pokémon cost 1 {C} more, and its Retreat Cost is 1 {C} more.",'sequence'],
  ["If you have exactly 1, 3, or 5 cards in your hand, this attack does 60 more damage.",'bonusDamage'],
  ["If this Pokémon and your opponent's Active Pokémon have 2 or more of the same type of Energy attached, this attack does 60 more damage.",'bonusDamage'],
  ["Discard a Stadium in play.",'discardStadium'],
  ["Heal from this Pokémon the same amount of damage you did to your opponent's Active Pokémon.",'drain'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'attack',20);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
 const shuffle=N.compileEffect('Shuffle your hand into your deck. Draw a card for each card in your opponent\'s hand.','attack',0);a.equal(shuffle.supported,true);a.equal(shuffle.effect.type,'handShuffle');a.equal(shuffle.effect.draw,'opponentHandCount');
});

t('fourth coverage tranche compiles next-turn boosts, damage rules, protection and evolution effects',()=>{
 const cases=[
  ["During your next turn, this Pokémon's Overdrive Smash attack does +60 damage.",'nextAttackBonus'],
  ["1 of your opponent's Pokémon is chosen at random. Do 30 damage to it.",'randomPokemonDamage'],
  ["1 of your opponent's Benched Pokémon is chosen at random. This attack also does 30 damage to it.",'randomPokemonDamage'],
  ["Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon.",'coinAttackGate'],
  ["This attack's damage isn't affected by Weakness or by any effects on your opponent's Active Pokémon.",'damageRule'],
  ["This attack's damage isn't affected by any effects on your opponent's Active Pokémon.",'damageRule'],
  ["Your opponent's Active Pokémon is now Poisoned. Do 20 damage to this Pokémon instead of the usual amount for this Special Condition.",'status'],
  ["During your opponent's next turn, prevent all damage done to this Pokémon by attacks if that damage is 40 or less.",'preventDamage'],
  ["Put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it.",'evolveFromDeck'],
  ["During your next turn, attacks used by your Pokémon do +20 damage to your opponent's Active Pokémon.",'modifier'],
  ["Put 3 random cards from among Silcoon and Cascoon from your deck onto your Bench.",'benchFromDeck'],
  ["Flip a coin for each Energy attached to this Pokémon. This attack does 50 damage for each heads.",'coinDamageByEnergy'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'attack',40);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
 const abilities=[
  ["As long as this Pokémon is in the Active Spot, whenever you attach an Energy from your Energy Zone to it, it is now Asleep.",'triggered'],
  ["As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon cost 1 {C} more.",'passive'],
 ];
 for(const [text,type] of abilities){const r=N.compileAbility({name:'Test',effect:text});a.equal(r.supported,true,text);a.equal(r.ability.type,type,text);a.deepEqual(E.validateEffect(r.ability.effect),[],text);}
});

t('fifth coverage tranche compiles broader conditional damage, Energy and evolution families',()=>{
 const cases=[
  ["If this Pokémon evolved from Poliwhirl during this turn, this attack does 50 more damage.",'bonusDamage'],
  ["If your opponent's Active Pokémon is a Grass or Metal Pokémon, this attack does 40 more damage.",'bonusDamage'],
  ["If your opponent has gotten exactly 1 points, this attack does 40 more damage.",'bonusDamage'],
  ["If the amount of Energy attached to both Active Pokémon is 5 or more, this attack does 60 more damage.",'bonusDamage'],
  ["If you have 5 or more {P} Energy in play, this attack does 60 more damage.",'bonusDamage'],
  ["If your Pokémon in play have 3 or more different types of Energy attached, this attack does 60 more damage.",'bonusDamage'],
  ["If your opponent has any {P} Pokémon in play, this attack does 50 more damage.",'bonusDamage'],
  ["If Quick-Grow Extract is in your discard pile, this attack does 30 more damage.",'bonusDamage'],
  ["This attack does 20 more damage for each Supporter card in your discard pile.",'discardCountDamage'],
  ["This attack does 20 more damage for each Psychic Pokémon in your discard pile.",'discardCountDamage'],
  ["This attack does 20 more damage for each Pokémon in your discard pile.",'discardCountDamage'],
  ["This attack does 40 more damage for each of your opponent's Pokémon in play that has an Ability.",'fieldCountDamage'],
  ["This attack does 20 more damage for each type of Energy attached to this Pokémon.",'energyTypeCountDamage'],
  ["Take a {C} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.",'attachEnergy'],
  ["Take a {C} Energy from your Energy Zone and attach it to this Pokémon.",'attachEnergy'],
  ["Take a {W} and a {L} Energy from your Energy Zone and attach them to this Pokémon.",'sequence'],
  ["Discard a {W} and a {L} Energy from this Pokémon.",'sequence'],
  ["This attack's damage isn't affected by Weakness.",'damageRule'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'attack',40);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
});

t('new team and opponent conditions evaluate against the actual board',()=>{
 let b=battleState('A1-001','A1-001');
 const typed=N.compileEffect("If your opponent's Active Pokémon is a Grass or Metal Pokémon, this attack does 40 more damage.",'attack',60).effect;
 let r=E.resolveAttack({name:'Typed',damage:60,effect:typed},{state:b,side:'player',foeSide:'opponent',attacker:b.sides.player.active,defender:b.sides.opponent.active,cardById:D.cardById,random:()=>0.1});
 a.equal(r.damage,100,'Grass opponent should trigger the matchup bonus');
 const team=N.compileEffect('If you have 5 or more {P} Energy in play, this attack does 60 more damage.','attack',60).effect;
 b.sides.player.active.energy={Psychic:3};const x=C.makePokemonSlot('A1-001',1,'x');x.energy={Psychic:2};x.benchSlot=0;b.sides.player.bench=[x];
 r=E.resolveAttack({name:'Team Energy',damage:60,effect:team},{state:b,side:'player',foeSide:'opponent',attacker:b.sides.player.active,defender:b.sides.opponent.active,cardById:D.cardById,random:()=>0.1});
 a.equal(r.damage,120,'Psychic Energy across the team should trigger the bonus');
});

t('sixth coverage tranche compiles remaining common scalar damage and equality conditions',()=>{
 const cases=[
  ["This attack does 20 damage for each Energy attached to your opponent's Active Pokémon.",'energyDamage'],
  ["This attack does 20 more damage for each {P} Energy attached to all of your Pokémon.",'energyDamage'],
  ["This attack does 50 more damage for each point your opponent has gotten.",'pointDamage'],
  ["This attack does 10 more damage for each Item card in your discard pile.",'discardCountDamage'],
  ["This attack does 50 more damage for each Special Condition affecting your opponent's Active Pokémon.",'statusCountDamage'],
  ["This attack does 20 damage for each card in your hand.",'handCountDamage'],
  ["This attack does damage to your opponent's Active Pokémon equal to this Pokémon's remaining HP.",'remainingHpDamage'],
  ["If this Pokémon and your opponent's Active Pokémon have the same amount of Energy attached, this attack does 40 more damage.",'bonusDamage'],
  ["If you have the same number of cards in your hand as your opponent, this attack does 40 more damage.",'bonusDamage'],
  ["If you haven't gotten any points, this attack does 60 more damage.",'bonusDamage'],
  ["If your opponent's Active Pokémon has less remaining HP than this Pokémon, this attack does 80 more damage.",'bonusDamage'],
  ["If you have fewer Pokémon in play than your opponent, this attack does 80 more damage.",'bonusDamage'],
  ["If your opponent has exactly 2, 4, or 6 cards in their hand, this attack does 40 more damage.",'bonusDamage'],
  ["If this Pokémon has 2 or more different types of Energy attached, this attack does 60 more damage.",'bonusDamage'],
  ["Flip a coin for each {M} Energy attached to this Pokémon. This attack does 50 damage for each heads.",'coinDamageByEnergy'],
  ["Flip a coin for each {R} Energy attached to this Pokémon. This attack does 30 more damage for each heads.",'coinDamageByEnergy'],
  ["Flip a coin. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon.",'coinFlip'],
  ["Flip a coin. If heads, the Defending Pokémon is now Paralyzed.",'coinFlip'],
  ["Discard all Energy attached to this Pokémon. Your opponent's Active Pokémon is now Paralyzed.",'sequence'],
  ["1 of your opponent's Benched Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, also do 20 damage to it.",'randomPokemonDamage'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'attack',40);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
});

t('seventh coverage tranche compiles common passive, activated and lifecycle abilities',()=>{
 const cases=[
  ["Once during your turn, if this Pokémon is in the Active Spot, you may take a {G} Energy from your Energy Zone and attach it to 1 of your {G} Pokémon.",'activated'],
  ["During Pokémon Checkup, if this Pokémon is in the Active Spot, do 10 damage to your opponent's Active Pokémon.",'triggered'],
  ["Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex.",'passive'],
  ["As long as this Pokémon is on your Bench, prevent all damage done to this Pokémon by attacks.",'passive'],
  ["Your Active Dondozo has no Retreat Cost.",'passive'],
  ["If you have another Beldum in play, this Pokémon's Retreat Cost is 2 less.",'passive'],
  ["If you have another Falinks in play, this Pokémon's attacks do +20 damage to your opponent's Active Pokémon, and this Pokémon takes −20 damage from attacks from your opponent's Pokémon.",'passive'],
  ["Your opponent's Active Pokémon's Retreat Cost is 1 more.",'passive'],
  ["If this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, the Attacking Pokémon is now Poisoned.",'triggered'],
  ["At the end of each turn, if your opponent's Active Pokémon is Asleep, do 20 damage to that Pokémon.",'triggered'],
  ["At the end of your first turn, take a {L} Energy from your Energy Zone and attach it to this Pokémon.",'triggered'],
  ["During your first turn, this Pokémon has no Retreat Cost.",'passive'],
 ];
 for(const [text,type] of cases){const r=N.compileAbility({name:'Test',effect:text});a.equal(r.supported,true,text);a.equal(r.ability.type,type,text);a.deepEqual(E.validateEffect(r.ability.effect),[],text);}
});

t('eighth coverage tranche compiles practical Trainer search, heal and support effects',()=>{
 const cases=[
  ["Put 1 random Glameow, Stunky, or Croagunk from your deck into your hand.",'search'],
  ["Put 1 random Type: Null or Silvally from your deck into your hand.",'search'],
  ["Put 2 random cards from among Magneton, Heliolisk, and Clemont's Backpack from your deck into your hand.",'search'],
  ["Put 2 random cards from among Super Potion, Max Repel, and Full Heal from your deck into your hand.",'search'],
  ["Put a random card that evolves from Rockruff from your deck into your hand.",'search'],
  ["Heal 70 damage from 1 of your Carracosta or Jellicent.",'heal'],
  ["Heal 40 damage from each of your Pokémon that has any {W} Energy attached.",'heal'],
  ["Heal 30 damage from 1 of your Pokémon, and it recovers from all Special Conditions.",'sequence'],
  ["Take a {P} Energy from your Energy Zone and attach it to each of your Drifblim and Mismagius.",'attachEnergy'],
  ["The Stage 2 Pokémon this card is attached to has no Retreat Cost.",'modifier'],
  ["The Basic Pokémon this card is attached to takes −20 damage from attacks from your opponent's Pokémon.",'modifier'],
  ["Attacks used by the Pikachu ex this card is attached to do +30 damage to your opponent's Active Pokémon.",'modifier'],
  ["Until the end of your opponent's next turn, your opponent's Active Pokémon's Retreat Cost is 1 more.",'modifier'],
  ["Take a {C} Energy from your Energy Zone and attach it to 1 of your Stage 2 Pokémon.",'attachEnergy'],
  ["Produce 2 {F} Energy from your Energy Zone, and attach it to 1 of your Whiscash or Paldean Clodsire.",'attachEnergy'],
  ["Heal all damage from 1 of your Shiinotic or Tsareena. If you do, discard all Energy from that Pokémon.",'sequence'],
  ["You can use this card only if you have Galarian Obstagoon in play. Discard 2 random Energy from your opponent's Active Pokémon.",'discardEnergy'],
  ["Your opponent discards cards from their hand until they have 4 cards in their hand.",'trimHand'],
  ["Heal 40 damage from 1 of your Pokémon that has any Energy attached. If you healed any damage in this way, discard a random Energy from that Pokémon.",'sequence'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'trainer',0);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
});

t('ninth coverage tranche compiles deterministic random-hand and remaining simple attack effects',()=>{
 const cases=[
  ["Discard a random Item card from your opponent's hand.",'discardHand'],
  ["Discard a random Pokémon Tool card from your opponent's hand.",'discardHand'],
  ["Your opponent reveals a random card from their hand and shuffles it into their deck.",'shuffleRandomHandCard'],
  ["Look at a random card from your opponent's hand and shuffle it into their deck.",'shuffleRandomHandCard'],
  ["Flip a coin. If heads, your opponent reveals a random card from their hand and shuffles it into their deck.",'coinFlip'],
  ["This attack also does 20 damage to each of your opponent's Benched Pokémon that has any Energy attached.",'benchDamage'],
  ["If your opponent's Active Pokémon is Zangoose, this attack does 40 more damage.",'bonusDamage'],
  ["If your opponent's Active Pokémon has “Team Rocket” in its name, this attack does 70 more damage.",'bonusDamage'],
  ["Discard a Lightning Energy from this Pokémon.",'discardEnergy'],
  ["Take a Metal Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.",'attachEnergy'],
  ["Discard Fire{R} Energy from this Pokémon. Your opponent's Active Pokémon is now Burned.",'sequence'],
 ];
 for(const [text,type] of cases){const r=N.compileEffect(text,'attack',40);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
});

t('new lifecycle and Trainer coverage executes in the real battle core',()=>{
 const leaf=battleState('A2a-010');
 const bulb=C.makePokemonSlot('A1-001',1,'bulb');bulb.benchSlot=0;leaf.sides.player.bench=[bulb];
 const forest=C.legalActions(leaf,'player').find(x=>x.type==='ability'&&x.cardId==='A2a-010'&&x.effectTarget==='bench');
 a.ok(forest,'Forest Breath should offer a Grass Bench target');C.applyAction(leaf,'player',forest);a.equal(bulb.energy.Grass,1,'Forest Breath should attach Grass Energy');
 a.equal(C.legalActions(leaf,'player').some(x=>x.type==='ability'&&x.cardId==='A2a-010'),false,'Forest Breath should be once per turn');

 const ice=battleState('A2a-022');C.checkup(ice);a.equal(ice.sides.opponent.active.damage,10,'Snowy Terrain should trigger during Checkup');

 const lady=battleState('A1-001');lady.sides.player.active.damage=60;lady.sides.player.active.conditions={poison:{amount:10},sleep:true};lady.sides.player.hand=[{uid:'lady',cardId:'A2b-070'}];
 const heal=C.legalActions(lady,'player').find(x=>x.type==='trainer'&&x.cardId==='A2b-070'&&x.target==='active');a.ok(heal,'Pokémon Center Lady should be playable on a damaged Active');C.applyAction(lady,'player',heal);a.equal(lady.sides.player.active.damage,30);a.deepEqual(lady.sides.player.active.conditions,{});
});

t('Oricorio Safeguard and random hand shuffle effects execute rather than only compile',()=>{
 const guard=battleState('A3-066','A1-096');
 a.ok(E.attackIsPrevented(guard,'player',guard.sides.player.active,guard.sides.opponent.active,D.cardById),'Oricorio should block Pokémon ex attack damage');
 guard.sides.opponent.active=C.makePokemonSlot('A1-001',1,'plain');
 a.equal(E.attackIsPrevented(guard,'player',guard.sides.player.active,guard.sides.opponent.active,D.cardById),null,'Oricorio should not block non-ex attackers');

 const hand=battleState();hand.sides.opponent.hand=[{uid:'a',cardId:'A1-001'},{uid:'b',cardId:'P-A-005'}];hand.sides.opponent.deck=[{uid:'d',cardId:'A1-001'}];
 const beforeDeck=hand.sides.opponent.deck.length;
 E.applyEffect({type:'shuffleRandomHandCard',side:'opponent'},C.effectContext(hand,'player'));
 a.equal(hand.sides.opponent.hand.length,1);a.equal(hand.sides.opponent.deck.length,beforeDeck+1,'one opponent hand card should be shuffled into deck');
});

t('tenth coverage tranche adds remaining automatic status, board and passive effects without faking choice UI',()=>{
 const effects=[
  ["This Pokémon recovers from all Special Conditions.",'attack','removeStatus'],
  ["Flip a coin. If tails, this attack does nothing. If heads, your opponent's Active Pokémon is now Paralyzed.",'attack','coinAttackGate'],
  ["Flip 3 coins. This attack does 60 damage for each heads. This Pokémon is now Confused.",'attack','sequence'],
  ["Switch this Pokémon with 1 of your Benched {L} Pokémon.",'attack','switch'],
  ["Discard all Pokémon Tool cards attached to each of your opponent's Pokémon.",'trainer','discardTool'],
  ["Halve your opponent's Active Pokémon's remaining HP, rounded down.",'attack','halveRemainingHp'],
  ["Flip a coin. If heads, your opponent's Active Pokémon's remaining HP is now 10.",'attack','coinFlip'],
  ["Heal 10 damage and remove a random Special Condition from your Active Pokémon.",'trainer','sequence'],
  ["Take 2 {D} Energy from your Energy Zone and attach it to this Pokémon. If you do, do 30 damage to this Pokémon.",'ability','sequence'],
  ["Discard 3 {W} Energy from this Pokémon, and this attack does 50 damage to each of your opponent's Pokémon.",'attack','sequence'],
 ];
 for(const [text,kind,type] of effects){const r=N.compileEffect(text,kind,0);a.equal(r.supported,true,text);a.equal(r.effect.type,type,text);a.deepEqual(E.validateEffect(r.effect),[],text);}
 const abilities=[
  ["If a Stadium is in play, this Pokémon has no Retreat Cost.",'modifier'],
  ["As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon do −20 damage.",'modifier'],
  ["As long as this Pokémon is on your Bench, attacks used by your Pokémon that evolve from Poliwhirl do +40 damage to your opponent's Active Pokémon.",'modifier'],
  ["If this Pokémon's remaining HP is 50 or less, attacks used by this Pokémon do +60 damage to your opponent's Active Pokémon.",'modifier'],
  ["During Pokémon Checkup, if this Pokémon is in the Active Spot, do 10 damage to each of your opponent's Pokémon.",'damage'],
 ];
 for(const [text,type] of abilities){const r=N.compileAbility({name:'Test',effect:text});a.equal(r.supported,true,text);a.equal(r.ability.effect.type,type,text);a.deepEqual(E.validateEffect(r.ability.effect),[],text);}
});
