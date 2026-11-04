'use strict';
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');

assert.equal(classic.CARDS.filter(c=>c.setId==='base1').length,102);
for(const id of ['base1-7','base1-26','base1-28','base1-52','base1-60','base1-61','base1-65','base1-67']){
  const card=classic.cardById(id);
  assert.equal(card.battleFormat,'classic');
  assert.equal(card.support.status,'FULL',`${id} should be fully verified`);
  assert.equal(card.battleEnabled,true,`${id} should be battle-enabled`);
}
assert.equal(classic.cardById('base1-4').battleEnabled,true,'Charizard should remain battle-ready once Energy Burn + Fire Spin are implemented');
assert.equal(classic.cardById('base1-1').battleEnabled,true,'Alakazam should remain battle-ready once Damage Swap is implemented');
assert.deepEqual(classic.cardById('base1-26').resistance,'Psychic');
assert.equal(classic.cardById('base1-26').resistanceValue,'-30');
assert.equal(classic.cardById('base1-96').specialEnergy,true);
assert.deepEqual(classic.cardById('base1-96').effect.provides,{Colorless:2});

const legal30=[...Array(4).fill('base1-7'),...Array(4).fill('base1-26'),...Array(4).fill('base1-28'),...Array(4).fill('base1-52'),...Array(4).fill('base1-60'),...Array(4).fill('base1-61'),...Array(4).fill('base1-65'),'base1-67','base1-96'];
assert.equal(legal30.length,30);
assert.equal(classic.validateDeck(legal30).ok,true);
assert.equal(classic.validateDeck([...legal30.slice(0,29),'base1-4']).ok,true,'graduated Base Set cards can enter Classic decks');
assert.equal(classic.validateDeck(Array(30).fill('base1-7')).ok,false,'four-copy limit must be enforced');
assert.equal(classic.validateDeck([...legal30.slice(0,29),'base1-97']).ok,false,'basic Energy cards are generated, not deck cards');

console.log('v0.69.63 Base Set battle bridge tests passed');

const core=require('../app/src/main/assets/tcgp-battle-core.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const classicDeck=[...Array(4).fill('base1-7'),...Array(4).fill('base1-52'),...Array(4).fill('base1-26'),...Array(4).fill('base1-61'),...Array(4).fill('base1-67'),...Array(4).fill('base1-60'),...Array(4).fill('base1-28'),...Array(2).fill('base1-96')];
const battle=core.createBattle({format:'classic',playerDeck:classicDeck,opponentDeck:classicDeck,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:['Fighting','Fire'],firstSide:'player',seed:63});
assert.equal(battle.sides.player.prizes.length,5);
assert.equal(battle.sides.player.energyAvailable,true);

// Pull one DCE from wherever setup placed it and prove it is a real hand card,
// leaves the once-per-turn Energy Zone placement available, and provides two Colorless Energy at once.
let dce=null;
for(const zone of ['hand','deck','prizes']){const i=battle.sides.player[zone].findIndex(x=>x.cardId==='base1-96');if(i>=0){[dce]=battle.sides.player[zone].splice(i,1);break;}}
assert.ok(dce,'test deck should contain Double Colorless Energy');
battle.sides.player.hand.push(dce);
battle.sides.player.active=core.makePokemonSlot('base1-60',0,'classic-ponyta');
battle.sides.player.bench=[core.makePokemonSlot('base1-26',0,'classic-dratini')];battle.sides.player.bench[0].benchSlot=0;
battle.sides.player.energyUsed=false;
const dceIndex=battle.sides.player.hand.findIndex(x=>x.uid===dce.uid);
const dceAction=core.legalActions(battle,'player').find(x=>x.type==='attachSpecial'&&x.handIndex===dceIndex&&x.target==='active');
assert.ok(dceAction,'DCE should be attachable from hand');
core.applyAction(battle,'player',dceAction);
assert.equal(battle.sides.player.energyUsed,false,'Special Energy must not consume the generated Energy Zone placement');
assert.equal(battle.sides.player.active.specialEnergy.length,1);
const smash=core.attackAvailability(battle,'player',0);
assert.equal(smash.usable,true,'DCE must satisfy Ponyta Smash Kick CC cost');
core.applyAction(battle,'player',{type:'attach',target:'active'});
assert.equal(battle.sides.player.energyUsed,true,'the generated Energy placement still counts once');
assert.throws(()=>core.applyAction(battle,'player',{type:'attach',target:'active'}),/once per turn/i);

// Classic weakness is ×2 and resistance is -30 rather than Pocket +20.
const fakeState={format:'classic',turnNumber:1,sides:{player:{active:null,bench:[]},opponent:{active:null,bench:[]}}};
const fakeCards={atk:{id:'atk',types:['Fighting'],subtype:'Fighting'},weak:{id:'weak',weakness:'Fighting',weaknessValue:'×2'},res:{id:'res',resistance:'Fighting',resistanceValue:'-30'}};
const cardById=id=>fakeCards[id];
assert.equal(effects.attackDamageWithState(fakeState,'player',{cardId:'atk'},'opponent',{cardId:'weak'},20,cardById),40);
assert.equal(effects.attackDamageWithState(fakeState,'player',{cardId:'atk'},'opponent',{cardId:'res'},40,cardById),10);

// Cards that graduated after the original v0.69.63 slice remain discoverable and legal.
const graduated=[...classicDeck];graduated[0]='base1-4';
assert.doesNotThrow(()=>core.createBattle({format:'classic',playerDeck:graduated,opponentDeck:classicDeck,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:['Fighting','Fire']}));
assert.equal(data.cardById('base1-4').support.status,'FULL');

// Onix Harden prevents an otherwise legal 20-damage attack on the next turn.
const harden=core.createBattle({format:'classic',playerDeck:classicDeck,opponentDeck:classicDeck,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:['Fighting','Fire'],firstSide:'player',seed:91});
harden.sides.player.active=core.makePokemonSlot('base1-56',0,'onix');harden.sides.player.active.energy={Fighting:2};harden.sides.player.bench=[core.makePokemonSlot('base1-26',0,'bench-a')];harden.sides.player.bench[0].benchSlot=0;
harden.sides.opponent.active=core.makePokemonSlot('base1-7',0,'hitmonchan');harden.sides.opponent.active.energy={Fighting:1};harden.sides.opponent.bench=[core.makePokemonSlot('base1-26',0,'bench-b')];harden.sides.opponent.bench[0].benchSlot=0;
harden.phase='battle';harden.activeSide='player';harden.turnNumber=3;harden.sides.player.turnCount=2;harden.sides.opponent.turnCount=1;
core.applyAction(harden,'player',core.legalActions(harden,'player').find(a=>a.type==='attack'&&a.attackIndex===1));
assert.equal(harden.sides.player.active.attackGuard?.maxDamage,30);
core.applyAction(harden,'opponent',core.legalActions(harden,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0));
assert.equal(harden.sides.player.active.damage,0,'Harden should prevent Jab because its post-weakness/resistance damage is <=30');

// Sand-attack applies a next-turn attack gate. A deterministic tails flip makes the attack fail.
const sand=core.createBattle({format:'classic',playerDeck:classicDeck,opponentDeck:classicDeck,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:['Fighting','Fire'],firstSide:'player',seed:92});
sand.sides.player.active=core.makePokemonSlot('base1-62',0,'sandshrew');sand.sides.player.active.energy={Fighting:1};sand.sides.player.bench=[core.makePokemonSlot('base1-26',0,'bench-c')];sand.sides.player.bench[0].benchSlot=0;
sand.sides.opponent.active=core.makePokemonSlot('base1-7',0,'hitmonchan-2');sand.sides.opponent.active.energy={Fighting:1};sand.sides.opponent.bench=[core.makePokemonSlot('base1-26',0,'bench-d')];sand.sides.opponent.bench[0].benchSlot=0;
sand.phase='battle';sand.activeSide='player';sand.turnNumber=3;sand.sides.player.turnCount=2;sand.sides.opponent.turnCount=1;
core.applyAction(sand,'player',core.legalActions(sand,'player').find(a=>a.type==='attack'&&a.attackIndex===0));
assert.ok(sand.sides.opponent.active.attackGate,'Sand-attack should mark the Defending Pokémon for the next-turn coin gate');
sand.rngState=8192;
const damageBefore=sand.sides.player.active.damage;
core.applyAction(sand,'opponent',core.legalActions(sand,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0));
assert.equal(sand.sides.player.active.damage,damageBefore,'tails on Sand-attack gate should make the opponent attack do nothing');
assert.ok(sand.log.some(x=>x.type==='attackFailed'&&x.reason==='attackGate'));

// Retreating with Double Colorless spends the whole Energy card, not one anonymous unit.
const retreat=core.createBattle({format:'classic',playerDeck:classicDeck,opponentDeck:classicDeck,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:['Fighting','Fire'],firstSide:'player',seed:93});
retreat.sides.player.active=core.makePokemonSlot('base1-26',0,'retreat-dratini');retreat.sides.player.bench=[core.makePokemonSlot('base1-7',0,'retreat-hitmonchan')];retreat.sides.player.bench[0].benchSlot=0;
retreat.sides.player.active.specialEnergy=[{uid:'dce-card',cardId:'base1-96'}];retreat.phase='battle';retreat.activeSide='player';retreat.turnNumber=3;retreat.sides.player.turnCount=2;
const retreatAction=core.legalActions(retreat,'player').find(a=>a.type==='retreat'&&a.benchIndex===0);assert.ok(retreatAction);
core.applyAction(retreat,'player',retreatAction);
assert.ok(retreat.sides.player.discard.some(x=>x.cardId==='base1-96'),'retreat must discard the DCE card as one card');
assert.equal(retreat.sides.player.bench.find(x=>x?.cardId==='base1-26')?.specialEnergy.length,0,'the retreated Pokémon should no longer retain the spent DCE');
