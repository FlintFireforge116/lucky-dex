'use strict';
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');

const newlyFull=[1,2,4,5,8,15,16,21,22,27,38,39,40,50];
for(const n of newlyFull){
  const card=classic.cardById(`base1-${n}`);
  assert.equal(card?.support?.status,'FULL',`${card?.name||n} should be FULL`);
  assert.equal(card?.battleEnabled,true,`${card?.name||n} should be battle-enabled`);
}

function deck(){return classic.CLASSIC30_LOANER_DECK.slice();}
function battle(seed=6490){return core.createBattle({format:'classic',playerDeck:deck(),opponentDeck:deck(),playerEnergyTypes:['Fire','Grass','Water'],opponentEnergyTypes:['Fire','Grass','Water'],firstSide:'player',seed});}
function setActive(state,side,id,energy={},uid=id){state.sides[side].active=core.makePokemonSlot(id,0,uid);state.sides[side].active.energy={...energy};return state.sides[side].active;}
function setBench(state,side,id,uid,benchSlot=0){const x=core.makePokemonSlot(id,0,uid);x.benchSlot=benchSlot;state.sides[side].bench=[x];return x;}
function prep(s){s.phase='battle';s.activeSide='player';s.turnNumber=3;s.sides.player.turnCount=2;s.sides.opponent.turnCount=1;}

// Rain Dance is repeatable and attaches Water without consuming the normal Energy attachment.
{
  const s=battle(6491);const blastoise=setActive(s,'player','base1-2',{Water:3},'blast');const target=setBench(s,'player','base1-41','seel',0);setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','ob');prep(s);s.sides.player.energyUsed=false;s.sides.player.hand.push({uid:'rain-water-1',cardId:'neo1-111'});
  const rain=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-2'&&a.effectTarget==='bench');assert.ok(rain,'Rain Dance should target a Water Benched Pokemon');core.applyAction(s,'player',rain);
  assert.equal(target.energy.Water,1);assert.equal(s.sides.player.hand.some(r=>r.uid==='rain-water-1'),false);assert.equal(s.sides.player.energyUsed,false,'Rain Dance must not consume the normal attachment');
  assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='base1-2'),false,'Rain Dance needs an actual Water Energy in hand');
  s.sides.player.hand.push({uid:'rain-water-2',cardId:'neo1-111'});assert.ok(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='base1-2'),'Rain Dance is repeatable when Energy remains in hand');
  blastoise.conditions.sleep=true;assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='base1-2'),false,'Pokemon Power is disabled by Sleep');
}

// Energy Burn converts all effective Energy units to Fire for this turn, but Fire Spin discards Energy cards, not units.
{
  const s=battle(6492);const zard=setActive(s,'player','base1-4',{Water:2},'zard');setBench(s,'player','base1-26','pb');setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','ob');prep(s);
  zard.specialEnergy=[{uid:'dce',cardId:'base1-96'}];
  assert.equal(core.attackAvailability(s,'player',0).usable,false,'Fire Spin is not payable before Energy Burn');
  const burn=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-4');assert.ok(burn);core.applyAction(s,'player',burn);
  assert.equal(core.attackAvailability(s,'player',0).usable,true,'Energy Burn should make the attached Energy count as Fire');
}

// Damage Swap cannot move a counter in a way that KOs the destination.
{
  const s=battle(6493);const ala=setActive(s,'player','base1-1',{Psychic:3},'ala');ala.damage=20;const dest=setBench(s,'player','base1-43','abra',0);dest.damage=20;setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','ob');prep(s);
  const damageSwap=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-1');assert.ok(damageSwap,'Damage Swap should be available');core.applyAction(s,'player',damageSwap);
  assert.equal(s.phase,'effectChoice','Damage Swap should ask for a damaged source first');
}

// Super Fang uses half remaining HP, rounded up to the nearest 10.
{
  const s=battle(6494);setActive(s,'player','base1-40',{Fire:3},'rat');setBench(s,'player','base1-26','pb');const foe=setActive(s,'opponent','base1-7',{Fighting:1},'foe');foe.damage=15;setBench(s,'opponent','base1-26','ob');prep(s);
  const fang=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(fang);core.applyAction(s,'player',fang);
  assert.equal(foe.damage,45,'55 HP remaining -> half 27.5 -> 30 damage');
}

// Farfetch'd Leek Slap locks itself after either coin result while it remains in play.
{
  const s=battle(6495);setActive(s,'player','base1-27',{Fire:1},'far');setBench(s,'player','base1-26','pb');setActive(s,'opponent','base1-7',{Fighting:1},'foe');setBench(s,'opponent','base1-26','ob');prep(s);
  const leek=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(leek);core.applyAction(s,'player',leek);
  // Force the turn back to the player to inspect the persistent while-in-play lock.
  s.phase='battle';s.activeSide='player';s.turnNumber+=2;s.sides.player.turnCount+=1;
  assert.equal(core.attackAvailability(s,'player',0).usable,false,'Leek Slap cannot be reused while this Farfetchd remains in play');
}

// Destiny Bond retaliates only if Gastly is KO'd by an opponent attack on the next turn.
{
  const s=battle(6496);setActive(s,'player','base1-50',{Psychic:1,Fire:1},'gastly');setBench(s,'player','base1-26','pb');setActive(s,'opponent','base1-7',{Fighting:3},'foe');setBench(s,'opponent','base1-26','ob');prep(s);
  const bond=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(bond,'Destiny Bond should be legal with a Psychic Energy card to discard');core.applyAction(s,'player',bond);
  assert.ok(s.sides.player.active?.destinyBond,'Destiny Bond should arm Gastly for the opponent turn');
}

console.log('v0.69.64 remaining Base Set Pokemon tests passed');
