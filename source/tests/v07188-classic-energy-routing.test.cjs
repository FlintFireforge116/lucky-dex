'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),effects=require(A+'/tcgp-battle-effects.js'),cpu=require(A+'/tcg-classic-opponents.js');
const recipe=cpu.generate({sets:['neo1','neo2'],seed:42,type:'Grass'});assert.ok(recipe.ok);
let seq=0;
function mk(types=['Grass','Water']){
 const s=core.createBattle({format:'classic',playerDeck:recipe.cards,opponentDeck:recipe.cards,seed:++seq+188,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=11;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=core.makePokemonSlot('neo1-61',2,'my-active');
 s.sides.opponent.active=core.makePokemonSlot('neo1-61',2,'foe-active');
 s.sides.player.energySupply=['Grass','Water','Grass','Water',...s.sides.player.energySupply];
 s.sides.player.nextEnergyType='Grass';
 s.sides.player.energyDiscard={Grass:0,Water:0};
 return s;
}
function apply(s,rule,extra={}){return effects.applyEffect({type:'neoRule',rule},{...core.effectContext(s,'player',{},s.sides.player.active),...extra});}
function choice(s,predicate){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const acts=core.legalActions(s,s.choiceSide);const a=acts.find(predicate)||acts.find(a=>!a.choiceSkip);assert.ok(a,JSON.stringify(acts));core.applyAction(s,s.choiceSide,a);return a;}
function resolve(s,max=12){let n=0;while(s.phase==='effectChoice'&&n++<max)choice(s);assert.notEqual(s.phase,'effectChoice','stuck choice');}
test('Neo Energy Charge uses discarded Basic Energy and increases physical draw deck (not the Zone)',()=>{
 const s=mk(),p=s.sides.player;p.energyDiscard.Grass=2;
 const size=p.deck.length,supply=p.energySupply.length;
 apply(s,'energyCharge',{random:()=>0.01});
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceOption===0);choice(s,a=>a.choiceOption===0);
 assert.equal(p.deck.length,size+2);assert.equal(p.energyDiscard.Grass,0);assert.equal(p.energySupply.length,supply);
});
test('Expedition Power Charge can recover discarded Special Energy, not only Basic Energy',()=>{
 const s=mk(),p=s.sides.player;
 p.discard.push({uid:'special-old',cardId:'neo1-19'});p.energyDiscard.Water=1;
 const before=p.deck.length;
 apply(s,'expedition:powerCharge',{random:()=>0.01});
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceOption===0);if(s.phase==='effectChoice')choice(s,a=>a.choiceOption===0);
 assert.equal(p.deck.length,before+2);assert.equal(p.energyDiscard.Water,0);assert.equal(p.deck.some(x=>x.uid==='special-old'),true);
});
test('Neo Riptide moves recovered Water from both discard zones to draw deck',()=>{
 const s=mk(),p=s.sides.player;p.energyDiscard.Water=2;p.discard.push({uid:'water',cardId:'neo1-111'});
 const before=p.deck.length,supply=p.energySupply.length;
 apply(s,'riptideReturn');
 assert.equal(p.deck.length,before+3);assert.equal(p.energyDiscard.Water,0);assert.equal(p.discard.some(x=>x.uid==='water'),false);assert.equal(p.energySupply.length,supply);
});
test('Aquapolis Town Volunteers shuffles selected discarded Energy into actual deck and can end early',()=>{
 const s=mk(),p=s.sides.player;p.energyDiscard.Water=1;p.energyDiscard.Grass=1;
 const before=p.deck.length;
 apply(s,'aquapolis:townVolunteers');
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceOption===1);assert.equal(p.deck.length,before+1);
 const done=core.legalActions(s,s.choiceSide).find(a=>a.choiceOption===1);assert.ok(done);
 core.applyAction(s,s.choiceSide,done);assert.equal(s.phase,'battle');assert.equal(p.deck.length,before+1);
});
test('Aquapolis Power Plant trades a Basic hand card for a chosen Basic from dedicated discard',()=>{
 const s=mk(),p=s.sides.player;p.hand=[{uid:'pay-grass',cardId:'neo1-108'}];p.energyDiscard.Water=2;
 apply(s,'aquapolis:powerPlant');
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceHandIndex===0);assert.equal(s.phase,'effectChoice');
 const labels=core.legalActions(s,s.choiceSide);assert.ok(labels.length>=2,JSON.stringify(labels));
 // The initial hand Grass must be discarded; choose the Water ledger entry.
 choice(s,a=>a.choiceOption===1);
 assert.equal(p.energyDiscard.Grass,1);assert.equal(p.energyDiscard.Water,1);
 assert.equal(p.hand.some(r=>r.cardId==='neo1-111'),true);
});
test('Skyridge Energy Recycle allows selecting a discarded basic type to shuffle into deck',()=>{
 const s=mk(),p=s.sides.player;p.energyDiscard.Water=1;p.energyDiscard.Grass=2;
 const before=p.deck.length;
 apply(s,'skyridge:energyRecycle');assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.choiceOption===0);
 assert.equal(p.deck.length,before+1);assert.equal(p.energyDiscard.Water+p.energyDiscard.Grass,2);
});
test('Skyridge Energy Plant searches fresh Basic from supply if no physical Basic is in deck',()=>{
 const s=mk(),p=s.sides.player;p.deck=p.deck.filter(r=>!['neo1-108','neo1-111'].includes(r.cardId));
 p.active.energy={};const before=p.energySupply.length;
 apply(s,'skyridge:energyPlant');assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceOption===0);
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceUid===p.active.uid||a.choiceTargetUid===p.active.uid);
 assert.equal(p.energySupply.length,before-1);assert.equal(Object.values(p.active.energy).reduce((a,b)=>a+b,0),1);
});
test('Normal hand attachment consumes one hand allowance independently of Zone attachment',()=>{
 const s=mk(),p=s.sides.player;
 p.hand=[{uid:'hand-1',cardId:'neo1-108',zoneGenerated:true},{uid:'hand-2',cardId:'neo1-108',zoneGenerated:true}];
 const hand=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='neo1-108');assert.ok(hand);
 core.applyAction(s,'player',hand);
 assert.equal(p.handEnergyUsed,true);assert.equal(p.energyUsed,false);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='attachSpecial'),false);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='attach'),true);
});
test('Blastoise Rain Dance never substitutes Energy Zone for absent Water Energy in hand',()=>{
 const s=mk(['Water']),p=s.sides.player;p.active=core.makePokemonSlot('base1-2',2,'blast');p.active.energy={Water:1};p.hand=[];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='base1-2'),false);
 p.hand=[{uid:'rain-water',cardId:'neo1-111',zoneGenerated:true}];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='base1-2'),true);
});
test('EX Emerald Mr Stone can choose a Basic type from Zone when searching the deck',()=>{
 const s=mk(),p=s.sides.player;p.hand=[];p.deck=p.deck.filter(r=>r.cardId!=='neo1-108'&&r.cardId!=='neo1-111');
 const supply=p.energySupply.length,hand=p.hand.length;
 apply(s,'ex9:trainer:79');
 choice(s,a=>a.choiceOption===0); // search deck, not discard
 assert.equal(s.phase,'effectChoice');
 const opts=core.legalActions(s,s.choiceSide);
 assert.ok(opts.some(a=>a.choiceOption===1),JSON.stringify(opts));
 // Deck already has Pokémon; choose a Zone Energy explicitly.
 choice(s,a=>a.choiceOption===1);if(s.phase==='effectChoice')choice(s,a=>a.choiceOption===1);
 assert.ok(p.energySupply.length<supply);assert.ok(p.hand.length>hand);
 assert.equal(p.hand.some(r=>['neo1-108','neo1-111'].includes(r.cardId)),true);
});
test('Generic searchChosen can find fresh Basic Energy in Zone without inventing discarded Energy',()=>{
 const s=mk(),p=s.sides.player;p.hand=[];p.deck=p.deck.filter(r=>r.cardId!=='neo1-108'&&r.cardId!=='neo1-111');
 const before=p.energySupply.length;
 effects.applyEffect({type:'searchChosen',source:'deck',amount:1,filter:{basicEnergy:true}},core.effectContext(s,'player',{},p.active));
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceOption===0);
 assert.equal(p.energySupply.length,before-1);assert.equal(p.hand.some(r=>r.cardId==='neo1-108'),true);
 assert.equal(p.energyDiscard.Grass,0);
});
test('Fresh Basic Energy search cannot draw from discard when ordered Zone has no eligible cards',()=>{
 const s=mk(),p=s.sides.player;p.energySupply=['Water','Water'];p.energyDiscard.Grass=3;p.hand=[];
 effects.applyEffect({type:'searchChosen',source:'deck',amount:1,filter:{basicEnergy:true,subtype:'Grass'}},core.effectContext(s,'player',{},p.active));
 assert.equal(s.phase,'battle');assert.equal(p.hand.length,0);assert.equal(p.energyDiscard.Grass,3);
});
test('Energy Charge with empty discard never manufactures Energy from Zone',()=>{
 const s=mk(),p=s.sides.player;p.energyDiscard={};p.discard=[];
 const before=p.deck.length,zone=p.energySupply.length;
 apply(s,'energyCharge',{random:()=>0.01});
 assert.equal(s.phase,'battle');assert.equal(p.deck.length,before);assert.equal(p.energySupply.length,zone);
});
test('Power Charge with tails does not recover Energy or prompt',()=>{
 const s=mk(),p=s.sides.player;p.energyDiscard.Grass=2;
 const before=p.deck.length;
 apply(s,'expedition:powerCharge',{random:()=>0.99});
 assert.equal(s.phase,'battle');assert.equal(p.deck.length,before);assert.equal(p.energyDiscard.Grass,2);
});
test('Effect-provided Energy acceleration attaches additional units beyond normal per-turn Zone allowance',()=>{
 const s=mk(['Fire']),p=s.sides.player;p.energySupply=['Fire','Fire','Fire',...p.energySupply];p.energyUsed=true;
 const slot=p.active;slot.energy={Fire:0};const before=p.energySupply.length;
 effects.applyEffect({type:'attachEnergy',target:'selfActive',energyType:'Fire',amount:2,source:'deck'},core.effectContext(s,'player',{},slot));
 assert.equal(slot.energy.Fire,2);assert.equal(p.energySupply.length,before-2);
 assert.equal(p.energyUsed,true);assert.equal(p.handEnergyUsed,false);
});
test('Normal Special Energy attachment also consumes the single hand Energy allowance',()=>{
 const s=mk(),p=s.sides.player;p.hand=[{uid:'spec-one',cardId:'ex9-86'},{uid:'spec-two',cardId:'ex9-88'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial');assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(p.handEnergyUsed,true);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='attachSpecial'),false);
});
test('Expedition Electabuzz Energy Draw offers player a real choice between recovered physical and fresh Zone Basic',()=>{
 const s=mk(),p=s.sides.player;p.active=core.makePokemonSlot('ecard1-76',2,'el-buzz');p.deck.unshift({uid:'physical-water',cardId:'neo1-111'});
 const before=p.energySupply.length,deck=p.deck.length;
 apply(s,'expedition:energyDraw');
 assert.equal(s.phase,'effectChoice');assert.ok(core.legalActions(s,s.choiceSide).some(a=>a.choiceOption===2));
 choice(s,a=>a.choiceOption===1);
 assert.equal(s.phase,'battle');assert.equal(p.energySupply.length,before-1);assert.equal(p.deck.length,deck);
 assert.equal(p.active.energy.Grass,1);
});
test('Skyridge Sunflora Energy Plant offers physical draw-deck and fresh Energy Zone source choices',()=>{
 const s=mk(),p=s.sides.player;p.active=core.makePokemonSlot('ecard3-105',2,'sunflora');p.deck.unshift({uid:'physical-water',cardId:'neo1-111'});
 const before=p.energySupply.length,deck=p.deck.length;
 apply(s,'skyridge:energyPlant');
 assert.equal(s.phase,'effectChoice');assert.ok(core.legalActions(s,s.choiceSide).some(a=>a.choiceOption===2));
 choice(s,a=>a.choiceOption===1);
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceTarget==='active'||a.choiceUid===p.active.uid);
 assert.equal(s.phase,'battle');assert.equal(p.active.energy.Grass,1);assert.equal(p.energySupply.length,before-1);assert.equal(p.deck.length,deck);
});
