'use strict';
const t=require('node:test'),a=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs'),D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
const rawCards=[...require('../data/tcgp/import/tcgdex-pocket-cards.json'),...require('../data/tcgp/import/tcgdex-A4b-cards.json'),...require('../data/tcgp/import/vociferix-missing-mechanics.json'),...require('../data/tcgp/import/current-pocket-mechanics.json')];
const rawMap=new Map(JSON.parse(JSON.stringify(rawCards)).map(c=>[N.printId(c.id),c]));
for(const fix of require('../data/tcgp/import/data-quality-overrides.json').corrections){let target=rawMap.get(fix.printId);for(const key of fix.path.slice(0,-1))target=target[key];target[fix.path.at(-1)]=fix.value;}
function normalized(id){const raw=rawMap.get(id);a.ok(raw,id+' authoritative stored text');const card=N.normalizeMechanics(raw);a.equal(card.support.status,'FULL',id+': '+card.support.reasons.join('; '));return card;}
function withCards(cards,fn){const previous=D.cardById;D.cardById=id=>cards.find(c=>c.id===id)||previous(id);try{return fn();}finally{D.cardById=previous;}}
function board(id='A1-001'){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:79,firstSide:'player'});b.phase='battle';b.turnNumber=5;b.activeSide='player';
 for(const [side,ss]of Object.entries(b.sides)){ss.turnCount=3;ss.hand=[];ss.abilityUsed={};ss.active=C.makePokemonSlot(side==='player'?id:'A1-083',0,side);ss.active.energy={Grass:10,Water:10,Psychic:10,Lightning:10};ss.bench=[];}
 return b;
}
function action(b,type,predicate=()=>true){const found=C.legalActions(b,'player').find(x=>x.type===type&&predicate(x));a.ok(found,'expected legal '+type);return found;}

t('stored Butterfree ability heals the entire team, is unavailable without damage, and cannot repeat',()=>{
 const card=normalized('A1-007');withCards([card],()=>{const b=board(card.id),p=b.sides.player;p.active.damage=30;p.bench=[{...C.makePokemonSlot('A1-001',0,'bench'),benchSlot:2,damage:10}];
 C.applyAction(b,'player',action(b,'ability'));a.equal(p.active.damage,10);a.equal(p.bench[0].damage,0);a.equal(C.legalActions(b,'player').some(x=>x.type==='ability'),false);
 const clean=board(card.id);a.equal(C.legalActions(clean,'player').some(x=>x.type==='ability'),false);
 });
});
t('stored Greninja ability selects either opponent zone and does effect damage without attack Weakness',()=>{
 const card=normalized('A1-089');withCards([card],()=>{const b=board(card.id),o=b.sides.opponent;o.bench=[{...C.makePokemonSlot('A1-001',0,'foe-bench'),benchSlot:2}];
 const choices=C.legalActions(b,'player').filter(x=>x.type==='ability');a.equal(choices.length,2);
 C.applyAction(b,'player',action(b,'ability',x=>x.effectTarget==='opponentBench'));a.equal(o.bench[0].damage,20);a.equal(o.active.damage,0);
 });
});
t('typed Energy targets preserve a dual-type second type and reject an illegal target through core',()=>{
 const card=normalized('A1-030');withCards([card],()=>{const b=board(card.id),p=b.sides.player;p.bench=[{...C.makePokemonSlot('A1-083',0,'water'),benchSlot:0},{...C.makePokemonSlot('A1-001',0,'grass'),benchSlot:2}];
 const choices=C.legalActions(b,'player').filter(x=>x.type==='attack');a.deepEqual(choices.map(x=>x.benchIndex),[2]);
 a.throws(()=>C.applyAction(b,'player',{type:'attack',attackIndex:0,target:'bench',benchIndex:0}),/legal/i);
 C.applyAction(b,'player',choices[0]);a.equal(p.bench[1].energy.Grass,1);a.equal(p.bench[0].energy.Grass,undefined);
 const effect=N.compileEffect('Take a {D} Energy from your Energy Zone and attach it to 1 of your Benched {D} Pokémon.').effect;
 const dual=C.makePokemonSlot('C1-042',0,'dual');dual.benchSlot=1;p.bench=[dual];a.equal(E.choicesForEffect(effect,C.effectContext(b,'player')).length,1);
 });
});
t('typed healing Trainer uses the second type and filters undamaged and wrong-type targets',()=>{
 const raw=rawCards.find(c=>c.name==='Erika'&&c.effect==='Heal 50 damage from 1 of your {G} Pokémon.');a.ok(raw);const card=normalized(N.printId(raw.id));
 withCards([card],()=>{const b=board(),p=b.sides.player;p.active.damage=20;p.bench=[{...C.makePokemonSlot('A1-083',0,'water'),benchSlot:0,damage:20}];p.hand=[{uid:'erika',cardId:card.id}];
 a.equal(C.legalActions(b,'player').filter(x=>x.type==='trainer').length,1);C.applyAction(b,'player',action(b,'trainer'));a.equal(p.active.damage,0);a.equal(p.bench[0].damage,20);
 });
});
t('conditional opponent type bonuses match both dual types once, and leave unknown text partial',()=>{
 const text="If your opponent's Active Pokémon is a {D} Pokémon, this attack does 30 more damage.";const compiled=N.compileEffect(text);a.equal(compiled.supported,true);a.deepEqual(E.validateEffect(compiled.effect),[]);
 const b=board(),ctx=C.effectContext(b,'player');b.sides.opponent.active=C.makePokemonSlot('C1-042',0,'dual');ctx.defender=b.sides.opponent.active;
 a.equal(E.resolveAttack({damage:20,effect:compiled.effect},ctx).damage,50);ctx.defender=C.makePokemonSlot('A1-001',0,'grass');a.equal(E.resolveAttack({damage:20,effect:compiled.effect},ctx).damage,20);
 a.equal(N.compileEffect(text+' Ignore all undocumented restrictions.').supported,false);
});
t('activated condition and Active-only restrictions remove illegal ability actions',()=>{
 const raw=rawCards.find(c=>(c.abilities||[]).some(x=>x.effect==='Once during your turn, if this Pokémon is in the Active Spot, you may make your opponent\'s Active Pokémon Poisoned.'));a.ok(raw);const card=normalized(N.printId(raw.id));
 withCards([card],()=>{const b=board(card.id);C.applyAction(b,'player',action(b,'ability'));a.ok(b.sides.opponent.active.conditions.poison);
 const benched=board();benched.sides.player.bench=[{...C.makePokemonSlot(card.id,0,'benched'),benchSlot:0}];a.equal(C.legalActions(benched,'player').some(x=>x.type==='ability'),false);
 });
 const conditional=N.compileAbility({name:'Verified shape',effect:"Once during your turn, if you have Arceus or Arceus ex in play, you may do 30 damage to your opponent's Active Pokémon."});a.equal(conditional.supported,true);
 const b=board();a.deepEqual(E.choicesForEffect(conditional.ability.effect,C.effectContext(b,'player')),[]);
});
t('passive typed team bonuses and name conditions affect legal damage with both dual types',()=>{
 const ability=N.compileAbility({name:'Typed team',effect:"Attacks used by your {P} Pokémon and {M} Pokémon do +30 damage to your opponent's Active Pokémon."});a.equal(ability.supported,true);
 const source={...D.cardById('A1-001'),id:'fixture-source',abilities:[ability.ability]};withCards([source],()=>{const b=board('C1-056'),p=b.sides.player;p.bench=[{...C.makePokemonSlot(source.id,0,'source'),benchSlot:0}];a.equal(E.modifierAmount(b,'player',p.active,'attackDamage',D.cardById),30);});
 const conditional=N.compileAbility({name:'Arceus condition',effect:'If you have Arceus or Arceus ex in play, this Pokémon takes −30 damage from attacks.'});a.equal(conditional.supported,true);
 const source2={...D.cardById('A1-001'),id:'fixture-source2',abilities:[conditional.ability]};withCards([source2],()=>{const b=board(source2.id);a.equal(E.modifierAmount(b,'player',b.sides.player.active,'damageReduction',D.cardById),0);});
});
t('filtered switch and Bench damage never select an unqualified Pokémon',()=>{
 const sw=N.compileEffect("Switch in 1 of your opponent's Benched Pokémon that has damage on it to the Active Spot.",'trainer');a.equal(sw.supported,true);
 const b=board(),o=b.sides.opponent;o.bench=[{...C.makePokemonSlot('A1-001',0,'clean'),benchSlot:0},{...C.makePokemonSlot('A1-001',0,'hurt'),benchSlot:2,damage:20}];
 a.deepEqual(E.choicesForEffect(sw.effect,C.effectContext(b,'player')),[{target:'opponentBench',benchIndex:2}]);
 const hit=N.compileEffect("This attack also does 30 damage to each of your opponent's Benched Pokémon that has damage on it.");a.equal(hit.supported,true);E.applyEffect(hit.effect,{...C.effectContext(b,'player'),isAttack:true});a.equal(o.bench[0].damage,0);a.equal(o.bench[1].damage,50);
});
t('named and Evolution Bench counts use matching Pokémon only, with positive and negative conditions',()=>{
 const count=N.compileEffect('This attack does 30 more damage for each Evolution Pokémon on your Bench.');a.equal(count.supported,true);
 const b=board();b.sides.player.bench=[{...C.makePokemonSlot('A1-001',0,'basic'),benchSlot:0},{...C.makePokemonSlot('A1-002',0,'stage1'),benchSlot:2}];
 a.equal(E.resolveAttack({damage:10,effect:count.effect},C.effectContext(b,'player')).damage,40);
 const bonus=N.compileEffect('If Latios is on your Bench, this attack does 20 more damage.');a.equal(bonus.supported,true);a.equal(E.resolveAttack({damage:10,effect:bonus.effect},C.effectContext(b,'player')).damage,10);
});
t('numeric Energy requirements cannot be consumed as names and unknown in-play restrictions stay partial',()=>{
 a.equal(N.compileEffect('If you have 5 or more {P} Energy in play, this attack does 60 more damage.').supported,false);
 a.equal(N.compileEffect('If you have an undocumented restriction in play, this attack does 60 more damage.').supported,false);
 a.equal(N.compileEffect('During this turn, attacks used by your Future Pokémon cost 2 less {C} Energy.','trainer').supported,false);
});
t('Red bonus is checked against the current defender when damage occurs, including after switching',()=>{
 const card=normalized('A2b-071');withCards([card],()=>{const b=board(),p=b.sides.player,o=b.sides.opponent;p.hand=[{uid:'red',cardId:card.id}];C.applyAction(b,'player',action(b,'trainer'));
 a.equal(E.modifierAmount(b,'player',p.active,'attackDamage',D.cardById),0);
 o.active=C.makePokemonSlot('A1-096',0,'ex');a.ok(D.cardById(o.active.cardId).points>=2);
 a.equal(E.modifierAmount(b,'player',p.active,'attackDamage',D.cardById),20);
 o.active=C.makePokemonSlot('A1-001',0,'ordinary');a.equal(E.modifierAmount(b,'player',p.active,'attackDamage',D.cardById),0);
 });
});
t('both-Active status and random discard compositions preserve each side and typed Energy',()=>{
 const b=board(),p=b.sides.player,o=b.sides.opponent,ctx={...C.effectContext(b,'player'),random:()=>0.1};p.active.energy={Water:2};o.active.energy={Grass:1};
 const status=N.compileEffect('Both Active Pokémon are now Confused.');a.equal(status.supported,true);E.applyEffect(status.effect,ctx);a.ok(p.active.conditions.confusion);a.ok(o.active.conditions.confusion);
 const discard=N.compileEffect('Discard a random Energy from both Active Pokémon.');a.equal(discard.supported,true);E.applyEffect(discard.effect,ctx);a.equal(p.active.energy.Water,1);a.equal(o.active.energy.Grass,0);
 const move=N.compileEffect('Move all Energy from this Pokémon to 1 of your Benched Pokémon.');a.equal(move.supported,true);p.bench=[{...C.makePokemonSlot('A1-001',0,'destination'),benchSlot:2}];E.applyEffect(move.effect,{...ctx,action:{target:'bench',benchIndex:2}});a.equal(p.active.energy.Water,0);a.equal(p.bench[0].energy.Water,1);
});
t('typed attack reduction checks the actual attacker including its second type',()=>{
 const compiled=N.compileAbility({name:'Water armor',effect:'This Pokémon takes −30 damage from attacks from {R} or {W} Pokémon.'});a.equal(compiled.supported,true);
 const card={...D.cardById('A1-001'),id:'armor',abilities:[compiled.ability]};withCards([card],()=>{const b=board(card.id);a.equal(E.modifierAmount(b,'player',b.sides.player.active,'damageReduction',D.cardById),30);b.sides.opponent.active=C.makePokemonSlot('A1-001',0,'grass');a.equal(E.modifierAmount(b,'player',b.sides.player.active,'damageReduction',D.cardById),0);b.sides.opponent.active=C.makePokemonSlot('C1-042',0,'dual');a.equal(E.modifierAmount(b,'player',b.sides.player.active,'damageReduction',D.cardById),30);});
});
t('Bench-only passive aura stops when its source is Active and filters its beneficiary',()=>{
 const compiled=N.compileAbility({name:'Bench help',effect:"As long as this Pokémon is on your Bench, your Active Basic Pokémon's Retreat Cost is 1 less."});a.equal(compiled.supported,true);
 const card={...D.cardById('A1-001'),id:'bench-aura',abilities:[compiled.ability]};withCards([card],()=>{const b=board(card.id),p=b.sides.player;a.equal(E.modifierAmount(b,'player',p.active,'retreatCost',D.cardById),0);p.bench=[{...C.makePokemonSlot(card.id,0,'bench-source'),benchSlot:0}];p.active=C.makePokemonSlot('A1-001',0,'basic');a.equal(E.modifierAmount(b,'player',p.active,'retreatCost',D.cardById),-1);p.active=C.makePokemonSlot('A1-002',0,'stage1');a.equal(E.modifierAmount(b,'player',p.active,'retreatCost',D.cardById),0);});
});
t('end-turn healing uses the owning Active source only, without repeating on the opponent turn',()=>{
 const raw=rawCards.find(c=>(c.abilities||[]).some(x=>x.effect==='At the end of your turn, if this Pokémon is in the Active Spot, heal 20 damage from it.'));a.ok(raw);const card=normalized(N.printId(raw.id));
 withCards([card],()=>{const b=board(card.id),source=b.sides.player.active;source.damage=30;C.applyAction(b,'player',{type:'endTurn'});a.equal(source.damage,10);C.applyAction(b,'opponent',{type:'endTurn'});a.equal(source.damage,10);});
});
t('an additional typed or damaged-Bench effect never blocks the main attack when no eligible target exists',()=>{
 const card=normalized('A1-030');withCards([card],()=>{const b=board(card.id),p=b.sides.player;p.bench=[{...C.makePokemonSlot('A1-083',0,'water-only'),benchSlot:0}];
 const hit=action(b,'attack');a.equal(hit.benchIndex,undefined);C.applyAction(b,'player',hit);a.equal(b.log.findLast(x=>x.type==='attack').damage,50);a.equal(p.bench[0].energy.Grass,undefined);
 });
 const effect=N.compileEffect("This attack also does 50 damage to 1 of your opponent's Benched Pokémon that has damage on it.").effect,b=board();b.sides.opponent.bench=[{...C.makePokemonSlot('A1-001',0,'clean-bench'),benchSlot:0}];
 a.deepEqual(E.choicesForEffect(effect,{...C.effectContext(b,'player'),isAttack:true}),[{}]);a.deepEqual(E.choicesForEffect(effect,C.effectContext(b,'player')),[]);
});
t('effect Energy events count actual filtered recipients and record the beneficiary side',()=>{
 const b=board(),p=b.sides.player;p.bench=[{...C.makePokemonSlot('A1-001',0,'bench1'),benchSlot:0},{...C.makePokemonSlot('A1-083',0,'water'),benchSlot:2}];
 E.applyEffect({type:'attachEnergy',target:'selfAll',energyType:'Grass',amount:2,filter:{subtype:'Grass'}},C.effectContext(b,'player'));
 const event=b.log.findLast(x=>x.type==='effectEnergy');a.equal(event.amount,2);a.equal(event.totalAmount,4);a.deepEqual(event.attachedBySide,{player:4,opponent:0});
 E.applyEffect({type:'attachEnergy',target:'opponentActive',energyType:'Water',amount:1},C.effectContext(b,'player'));a.deepEqual(b.log.findLast(x=>x.type==='effectEnergy').attachedBySide,{player:0,opponent:1});
});
t('status events record actual recipients and report zero through status protection',()=>{
 const b=board(),ctx=C.effectContext(b,'player');b.sides.opponent.active.statusGuard={};E.applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);let event=b.log.findLast(x=>x.type==='status');a.equal(event.affectedCount,0);a.deepEqual(event.affectedBySide,{player:0,opponent:0});
 delete b.sides.opponent.active.statusGuard;E.applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);event=b.log.findLast(x=>x.type==='status');a.equal(event.affectedCount,1);a.deepEqual(event.affectedBySide,{player:0,opponent:1});
});
t('an effect-grant condition is checked when a temporary modifier is granted, separately from the opponent filter',()=>{
 const b=board(),ctx=C.effectContext(b,'player');b.sides.player.bench=[{...C.makePokemonSlot('A2a-070',0,'arceus'),benchSlot:0}];
 E.applyEffect({type:'modifier',stat:'damageReduction',amount:30,duration:'opponentTurn',condition:{type:'pokemonPresent',zone:'bench',filter:{name:'Arceus'}}},ctx);b.sides.player.bench=[];
 a.equal(E.modifierAmount(b,'player',b.sides.player.active,'damageReduction',D.cardById),30);
});
