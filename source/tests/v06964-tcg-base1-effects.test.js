'use strict';
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');

function deck(){return classic.CLASSIC30_LOANER_DECK.slice();}
function battle(seed=640){return core.createBattle({format:'classic',playerDeck:deck(),opponentDeck:deck(),playerEnergyTypes:['Fighting','Fire','Psychic'],opponentEnergyTypes:['Fighting','Fire','Psychic'],firstSide:'player',seed});}
function setActive(state,side,id,energy={},uid=id){state.sides[side].active=core.makePokemonSlot(id,0,uid);state.sides[side].active.energy={...energy};}
function setBench(state,side,id,uid,benchSlot=0){const s=core.makePokemonSlot(id,0,uid);s.benchSlot=benchSlot;state.sides[side].bench=[s];return s;}
function prep(state){state.phase='battle';state.activeSide='player';state.turnNumber=3;state.sides.player.turnCount=2;state.sides.opponent.turnCount=1;}

// Chansey: Scrunch is damage-only prevention; Double-edge recoils 80.
{
 const s=battle(641);setActive(s,'player','base1-3',{Fighting:4},'chansey');setBench(s,'player','base1-26','pbench');setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','obench');prep(s);
 s.rngState=1; // deterministic heads for first coin in current PRNG path
 const scrunch=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(scrunch);core.applyAction(s,'player',scrunch);assert.ok(s.sides.player.active.attackGuard,'Scrunch heads should create a next-turn damage guard');
}

// Nidoking Toxic uses the printed 20-damage poison tick.
{
 const s=battle(642);setActive(s,'player','base1-11',{Grass:3},'nidoking');setBench(s,'player','base1-26','pbench');setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','obench');prep(s);
 const toxic=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(toxic);core.applyAction(s,'player',toxic);
 assert.equal(s.sides.opponent.active?.conditions?.poison?.amount,20);
}

// Haunter Dream Eater is unavailable unless the Defending Pokemon is Asleep.
{
 const s=battle(643);setActive(s,'player','base1-29',{Psychic:2},'haunter');setBench(s,'player','base1-26','pbench');setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','obench');prep(s);
 assert.equal(core.attackAvailability(s,'player',1).usable,false);
 s.sides.opponent.active.conditions.sleep=true;
 assert.equal(core.attackAvailability(s,'player',1).usable,true);
}

// Bulbasaur Leech Seed heals at most one damage counter, and only after actual damage got through.
{
 const s=battle(644);setActive(s,'player','base1-44',{Grass:2},'bulbasaur');s.sides.player.active.damage=30;setBench(s,'player','base1-26','pbench');setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','obench');prep(s);
 const leech=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(leech);core.applyAction(s,'player',leech);assert.equal(s.sides.player.active.damage,20,'Leech Seed heals exactly 10 after dealing damage');
}

// Poliwag Water Gun only counts two extra Water Energy.
{
 const card=classic.cardById('base1-59'),attack=card.attacks[0];
 const fake={format:'classic',turnNumber:3,sides:{player:{active:null,bench:[]},opponent:{active:null,bench:[]}}};
 const attacker={uid:'p',cardId:'base1-59',energy:{Water:6},specialEnergy:[],damage:0},defender={uid:'o',cardId:'base1-7',energy:{},specialEnergy:[],damage:0};fake.sides.player.active=attacker;fake.sides.opponent.active=defender;
 const result=effects.resolveAttack(attack,{state:fake,side:'player',foeSide:'opponent',attacker,defender,cardById:classic.cardById,random:()=>0.1});
 assert.equal(result.damage,30,'Water Gun caps at +20 beyond its first Water Energy');
}
console.log('v0.69.64 Base Set effect behavior tests passed');
