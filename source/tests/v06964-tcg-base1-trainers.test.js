'use strict';
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');

for(let n=71;n<=95;n++){
  const card=classic.cardById(`base1-${n}`);
  assert.equal(card?.support?.status,'FULL',`${card?.name||n} should be FULL`);
  assert.equal(card?.battleEnabled,true,`${card?.name||n} should be battle-enabled`);
}

function deck(){return classic.CLASSIC30_LOANER_DECK.slice();}
function battle(seed=6540){return core.createBattle({format:'classic',playerDeck:deck(),opponentDeck:deck(),playerEnergyTypes:['Fighting','Fire','Water'],opponentEnergyTypes:['Fighting','Fire','Water'],firstSide:'player',seed});}
function active(s,side,id,energy={},uid=id){s.sides[side].active=core.makePokemonSlot(id,0,uid);s.sides[side].active.energy={...energy};return s.sides[side].active;}
function bench(s,side,id,uid,index=0){const x=core.makePokemonSlot(id,0,uid);x.benchSlot=index;s.sides[side].bench=[x];return x;}
function prep(s){s.phase='battle';s.activeSide='player';s.turnNumber=3;s.sides.player.turnCount=2;s.sides.opponent.turnCount=1;}
function putHand(s,side,ids){s.sides[side].hand=ids.map((cardId,i)=>({uid:`${side}-h-${i}-${cardId}`,cardId}));}
function trainer(s,id){return core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id);}

// Bill draws two with no Supporter-era restriction.
{
  const s=battle(6541);active(s,'player','base1-7',{Fighting:1});bench(s,'player','base1-26','pb');active(s,'opponent','base1-7',{Fighting:1});bench(s,'opponent','base1-26','ob');prep(s);putHand(s,'player',['base1-91']);const before=s.sides.player.deck.length;const a=trainer(s,'base1-91');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.sides.player.hand.length,2);assert.equal(s.sides.player.deck.length,before-2);
}

// Potion is spatially targetable and heals 20 from the chosen Pokemon.
{
  const s=battle(6542);const p=active(s,'player','base1-7',{Fighting:1});p.damage=30;const b=bench(s,'player','base1-26','pb');b.damage=20;active(s,'opponent','base1-7',{Fighting:1});bench(s,'opponent','base1-26','ob');prep(s);putHand(s,'player',['base1-94']);const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='base1-94'&&x.target==='bench');assert.ok(a);core.applyAction(s,'player',a);assert.equal(b.damage,0);assert.equal(p.damage,30);
}

// Energy Removal can discard a DCE as one Energy card.
{
  const s=battle(6543);active(s,'player','base1-7',{Fighting:1});bench(s,'player','base1-26','pb');const foe=active(s,'opponent','base1-7',{});bench(s,'opponent','base1-26','ob');foe.specialEnergy=[{uid:'dce-x',cardId:'base1-96'}];prep(s);putHand(s,'player',['base1-92']);const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='base1-92'&&x.effectSpecialEnergyUid==='dce-x');assert.ok(a);core.applyAction(s,'player',a);assert.equal(foe.specialEnergy.length,0);assert.ok(s.sides.opponent.discard.some(r=>r.cardId==='base1-96'));
}

// Professor Oak discards the rest of the hand and draws seven.
{
  const s=battle(6544);active(s,'player','base1-7',{Fighting:1});bench(s,'player','base1-26','pb');active(s,'opponent','base1-7',{Fighting:1});bench(s,'opponent','base1-26','ob');prep(s);putHand(s,'player',['base1-88','base1-7','base1-26']);const a=trainer(s,'base1-88');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.sides.player.hand.length,7);assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-7'));assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-26'));
}

// Energy Retrieval turns discarded generated Basic Energy back into hand cards; attaching one still uses the normal attachment.
{
  const s=battle(6545);const p=active(s,'player','base1-7',{});bench(s,'player','base1-26','pb');active(s,'opponent','base1-7',{Fighting:1});bench(s,'opponent','base1-26','ob');prep(s);s.sides.player.energyDiscard={Fighting:2};putHand(s,'player',['base1-81','base1-26']);let a=trainer(s,'base1-81');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');let choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceCardId==='base1-26');assert.ok(choice);core.applyAction(s,'player',choice);
  // First Energy choice.
  choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&String(x.choiceLabel||'').includes('Fighting'));assert.ok(choice);core.applyAction(s,'player',choice);
  // Take second too if offered, otherwise finish.
  if(s.phase==='effectChoice'){choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&String(x.choiceLabel||'').includes('Fighting'));if(choice)core.applyAction(s,'player',choice);}
  assert.ok(s.sides.player.hand.filter(r=>r.cardId==='base1-97').length>=1,'retrieved Fighting Energy should be a hand card');
  const attach=core.legalActions(s,'player').find(x=>x.type==='attachSpecial'&&x.cardId==='base1-97'&&x.target==='active');assert.ok(attach);core.applyAction(s,'player',attach);assert.equal(p.energy.Fighting,1);assert.equal(s.sides.player.energyUsed,true);
}

// Defender reduces post-Weakness attack damage by 20 and survives through the opponent turn only.
{
  const s=battle(6546);const p=active(s,'player','base1-61',{});bench(s,'player','base1-26','pb');active(s,'opponent','base1-7',{Fighting:1});bench(s,'opponent','base1-26','ob');prep(s);putHand(s,'player',['base1-80']);const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='base1-80'&&x.target==='active');assert.ok(a);core.applyAction(s,'player',a);assert.ok((p.temporaryTrainers||[]).some(r=>r.cardId==='base1-80'));
}

// PlusPower is a post-Weakness +10, not +10 before the x2 multiplier.
{
  const s=battle(6547);const p=active(s,'player','base1-7',{Fighting:1});bench(s,'player','base1-26','pb');active(s,'opponent','base1-61',{});bench(s,'opponent','base1-26','ob');prep(s);putHand(s,'player',['base1-84']);const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='base1-84'&&x.target==='active');assert.ok(a);core.applyAction(s,'player',a);const jab=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(jab);core.applyAction(s,'player',jab);const hit=[...s.log].reverse().find(e=>e.type==='attack'&&e.side==='player');assert.equal(hit?.damage,50,'20 x2 Weakness +10 PlusPower = 50');
}

// Pokemon Center heals all damaged Pokemon and discards every Energy card attached to those Pokemon.
{
  const s=battle(6548);const p=active(s,'player','base1-7',{Fighting:2});p.damage=20;const b=bench(s,'player','base1-26','pb');b.damage=10;b.specialEnergy=[{uid:'dce-center',cardId:'base1-96'}];active(s,'opponent','base1-7',{Fighting:1});bench(s,'opponent','base1-26','ob');prep(s);putHand(s,'player',['base1-85']);const a=trainer(s,'base1-85');assert.ok(a);core.applyAction(s,'player',a);assert.equal(p.damage,0);assert.equal(b.damage,0);assert.equal(Number(p.energy.Fighting||0),0);assert.equal(b.specialEnergy.length,0);assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-96'));
}

console.log('v0.69.64 Base Set Trainer tests passed');
