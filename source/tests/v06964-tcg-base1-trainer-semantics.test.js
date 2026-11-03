'use strict';
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
function deck(){return classic.CLASSIC30_LOANER_DECK.slice();}
function battle(seed=6580){return core.createBattle({format:'classic',playerDeck:deck(),opponentDeck:deck(),playerEnergyTypes:['Fighting','Fire','Water'],opponentEnergyTypes:['Fighting','Fire','Water'],firstSide:'player',seed});}
function active(s,side,id,energy={},uid=id){s.sides[side].active=core.makePokemonSlot(id,0,uid);s.sides[side].active.energy={...energy};return s.sides[side].active;}
function bench(s,side,id,uid,index=0){const x=core.makePokemonSlot(id,0,uid);x.benchSlot=index;s.sides[side].bench=[x];return x;}
function prep(s){s.phase='battle';s.activeSide='player';s.turnNumber=3;s.sides.player.turnCount=2;s.sides.opponent.turnCount=1;}
function board(s){active(s,'player','base1-7',{Fighting:1},'pa');bench(s,'player','base1-26','pb');active(s,'opponent','base1-7',{Fighting:1},'oa');bench(s,'opponent','base1-26','ob');prep(s);}
function refs(ids,p='r'){return ids.map((cardId,i)=>({uid:`${p}-${i}-${cardId}`,cardId}));}
function play(s,id,pred=()=>true){const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId===id&&pred(x));assert.ok(a,`expected legal ${id}`);core.applyAction(s,'player',a);return a;}
function choice(s,pred){const a=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&pred(x));assert.ok(a,'expected effect choice');core.applyAction(s,'player',a);return a;}

// Computer Search: exactly 2 other hand cards -> chosen deck card, then shuffle.
{
 const s=battle(6581);board(s);s.sides.player.hand=refs(['base1-71','base1-26','base1-61'],'h');s.sides.player.deck=refs(['base1-7','base1-96','base1-52'],'d');play(s,'base1-71');
 choice(s,a=>a.choiceCardId==='base1-26');choice(s,a=>a.choiceCardId==='base1-61');choice(s,a=>a.choiceCardId==='base1-96');
 assert.ok(s.sides.player.hand.some(r=>r.cardId==='base1-96'));assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-26'));assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-61'));
}
// Item Finder must not retrieve the copy currently being played.
{
 const s=battle(6582);board(s);s.sides.player.hand=refs(['base1-74','base1-26','base1-61'],'h');s.sides.player.discard=refs(['base1-91'],'old');play(s,'base1-74');choice(s,a=>a.choiceCardId==='base1-26');choice(s,a=>a.choiceCardId==='base1-61');
 const choices=core.legalActions(s,'player');assert.ok(choices.some(a=>a.choiceCardId==='base1-91'));assert.equal(choices.some(a=>a.choiceCardId==='base1-74'),false,'Item Finder cannot pick itself while resolving');choice(s,a=>a.choiceCardId==='base1-91');assert.ok(s.sides.player.hand.some(r=>r.cardId==='base1-91'));
}
// Lass shuffles every Trainer in both hands, leaving Pokemon alone.
{
 const s=battle(6583);board(s);s.sides.player.hand=refs(['base1-75','base1-91','base1-26'],'ph');s.sides.opponent.hand=refs(['base1-94','base1-7'],'oh');const pDeck=s.sides.player.deck.length,oDeck=s.sides.opponent.deck.length;play(s,'base1-75');assert.deepEqual(s.sides.player.hand.map(r=>r.cardId),['base1-26']);assert.deepEqual(s.sides.opponent.hand.map(r=>r.cardId),['base1-7']);assert.equal(s.sides.player.deck.length,pDeck+1);assert.equal(s.sides.opponent.deck.length,oDeck+1);
}
// Pokemon Breeder: Basic -> matching Stage 2, only when normal evolution timing permits.
{
 const s=battle(6584);board(s);const basic=active(s,'player','base1-55',{Grass:1},'nido');basic.playedOnSideTurn=1;s.sides.player.turnCount=2;s.sides.player.hand=refs(['base1-76','base1-11'],'h');const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='base1-76'&&x.evolutionCardId==='base1-11'&&x.target==='active');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.sides.player.active.cardId,'base1-11');assert.deepEqual(s.sides.player.active.stack,['base1-55','base1-11']);
}
// Pokemon Trader swaps a chosen Pokemon in hand for a chosen Pokemon in deck.
{
 const s=battle(6585);board(s);s.sides.player.hand=refs(['base1-77','base1-26'],'h');s.sides.player.deck=refs(['base1-7','base1-96','base1-52'],'d');play(s,'base1-77');choice(s,a=>a.choiceCardId==='base1-26');choice(s,a=>a.choiceCardId==='base1-52');assert.ok(s.sides.player.hand.some(r=>r.cardId==='base1-52'));assert.ok(s.sides.player.deck.some(r=>r.cardId==='base1-26'));
}
// Scoop Up returns only the Basic, discarding evolution + attached cards/energy.
{
 const s=battle(6586);board(s);const evo=active(s,'player','base1-34',{Fighting:2},'mach');evo.stack=['base1-52','base1-34'];evo.specialEnergy=[{uid:'dce',cardId:'base1-96'}];s.sides.player.hand=refs(['base1-78'],'h');play(s,'base1-78',a=>a.target==='active');assert.ok(s.sides.player.hand.some(r=>r.cardId==='base1-52'));assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-34'));assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-96'));assert.equal(s.sides.player.energyDiscard.Fighting,2);
}
// Super Energy Removal pays one own Energy card, then strips up to two from the selected opponent Pokemon.
{
 const s=battle(6587);board(s);s.sides.player.active.energy={Fighting:1};s.sides.opponent.active.energy={Fighting:2};s.sides.opponent.active.specialEnergy=[{uid:'odce',cardId:'base1-96'}];s.sides.player.hand=refs(['base1-79'],'h');play(s,'base1-79');choice(s,a=>a.choiceTarget==='active');choice(s,a=>a.choiceTarget==='active');const foe=s.sides.opponent.active;const remaining=Object.values(foe.energy||{}).reduce((n,x)=>n+Number(x||0),0)+(foe.specialEnergy||[]).length;assert.equal(remaining,1);assert.equal(s.sides.player.energyDiscard.Fighting,1);
}
// Devolution Spray can strip Stage 2 only, leaving Stage 1, and clears conditions.
{
 const s=battle(6588);board(s);const n=active(s,'player','base1-11',{Grass:3},'nid');n.stack=['base1-55','base1-37','base1-11'];n.conditions.poison={amount:10};s.sides.player.hand=refs(['base1-72'],'h');play(s,'base1-72',a=>a.target==='active');assert.equal(s.phase,'effectChoice');choice(s,a=>Number(a.choiceOption)===0);assert.equal(s.sides.player.active.cardId,'base1-37');assert.deepEqual(s.sides.player.active.stack,['base1-55','base1-37']);assert.deepEqual(s.sides.player.active.conditions,{});
}
// Revive benches a Basic at half HP (rounded down to nearest 10 remaining HP).
{
 const s=battle(6589);board(s);s.sides.player.bench=[];s.sides.player.discard=refs(['base1-7'],'disc');s.sides.player.hand=refs(['base1-89'],'h');play(s,'base1-89');choice(s,a=>a.choiceCardId==='base1-7');const revived=s.sides.player.bench[0];assert.equal(revived.cardId,'base1-7');assert.equal(revived.damage,40,'70 HP -> 30 remaining -> 40 damage');
}
// Super Potion requires an Energy card on the same Pokemon it heals.
{
 const s=battle(6590);board(s);s.sides.player.active.damage=50;s.sides.player.active.energy={Fighting:1};s.sides.player.bench[0].damage=30;s.sides.player.hand=refs(['base1-90'],'h');const actions=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='base1-90');assert.ok(actions.some(a=>a.target==='active'));assert.equal(actions.some(a=>a.target==='bench'),false,'damaged bench without Energy is not a legal Super Potion target');const a=actions.find(a=>a.target==='active');core.applyAction(s,'player',a);assert.equal(s.sides.player.active.damage,10);assert.equal(Number(s.sides.player.active.energy.Fighting||0),0);
}
console.log('v0.69.64 Base Set Trainer semantics tests passed');
