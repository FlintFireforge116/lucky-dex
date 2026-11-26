'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm12-4'){
 const old=data.cardById,dummy={id:'sm6-dummy',name:'Test target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[]};data.cardById=x=>x===dummy.id?dummy:old(x);
 const s=structuredClone(baseBattle||(baseBattle=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:32132,firstSide:'player',playerEnergyTypes:['Psychic','Fighting'],opponentEnergyTypes:['Psychic','Fighting']})));s.phase='battle';s.activeSide=side;s.turnNumber=7;
 const foe=side==='player'?'opponent':'player';
 for(const name of ['player','opponent']){let b=s.sides[name];b.turnCount=4;b.hand=[];b.deck=Array.from({length:15},(_,i)=>ref('sm6-1',name+'d'+i));b.prizes=Array.from({length:5},(_,i)=>ref('sm6-1',name+'p'+i));b.discard=[];b.energyDiscard={};b.energySupply=['Psychic','Fighting','Psychic'];b.active=slot(name===side?id:dummy.id,name+'a',{Grass:3,Psychic:3,Fighting:3,Metal:3,Colorless:3});b.bench=[slot(dummy.id,name+'b')];b.bench[0].benchSlot=0;}
 return {s,side,foe,us:s.sides[side],them:s.sides[foe],done:()=>data.cardById=old};
}
function use(h,type,find=()=>true){const a=core.legalActions(h.s,h.s.choiceSide||h.side).find(x=>x.type===type&&find(x));assert.ok(a,`${type}: ${JSON.stringify(core.legalActions(h.s,h.s.choiceSide||h.side))}`);core.applyAction(h.s,h.s.choiceSide||h.side,a);return a;}
function attack(h,name){const idx=data.cardById(h.us.active.cardId).attacks.findIndex(a=>a.name===name);return use(h,'attack',a=>a.attackIndex===idx);}
function choice(h,pred){return use(h,'effectChoice',pred);}
function trainer(h,id){h.us.hand.push(ref(id,'trainer'));return use(h,'trainer',a=>a.cardId===id);}
const sets=[require('../app/src/main/assets/tcg-classic-celebrations.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Celebrations attack executes',()=>{
  let count=0;const failures=[];for(const c of sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];if(a.name==='Zen Shot')h.them.bench[0]=Object.assign(slot('swsh7-28',h.foe+'b'),{benchSlot:0});attack(h,a.name);resolve(h,x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}


for(const side of ['player','opponent']){
 test(side+' Black Flame gains 80 only with Zekrom on Bench',()=>{
  for(const partner of [false,true]){const h=setup(side,'cel25-2');try{h.us.active.energy={Fire:2,Colorless:1};if(partner)h.us.bench[0]=Object.assign(slot('cel25-10','partner'),{benchSlot:0});attack(h,'Black Flame');resolve(h);assert.equal(h.them.active.damage,partner?160:80);}finally{h.done();}}
 });
 test(side+' Surfing Pikachu VMAX uses Water and damages opposing Bench',()=>{const h=setup(side,'cel25-9');try{h.us.active.energy={Water:3};attack(h,'Max Surfer');resolve(h);assert.equal(h.them.active.damage,160);assert.equal(h.them.bench[0].damage,30);assert.equal(h.us.bench[0].damage,0);}finally{h.done();}});
 test(side+' Lugia Aero Ball uses Energy on both Active Pokemon',()=>{const h=setup(side,'cel25-22');try{h.us.active.energy={Water:2};h.them.active.energy={Lightning:3};attack(h,'Aero Ball');resolve(h);assert.equal(h.them.active.damage,100);}finally{h.done();}});
 test(side+' Professor Oak discards hand and draws seven',()=>{const h=setup(side);try{h.us.hand=[ref('cel25-5','old')];trainer(h,'cel25-23');resolve(h);assert.equal(h.us.hand.length,7);assert.ok(h.us.discard.some(c=>c.uid==='old'));}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Mysterious Tail selects only a top-six Item, without consuming a seventh card',()=>{const h=setup(side,'cel25-11');try{h.us.deck=[ref('swsh7-154','eligible'),...Array.from({length:5},(_,i)=>ref('cel25-5','nonitem'+i)),ref('swsh7-154','seventh')];use(h,'ability');const choices=core.legalActions(h.s,side).filter(a=>a.type==='effectChoice'&&!a.choiceSkip);assert.deepEqual(choices.map(a=>a.choiceDeckIndex),[0]);resolve(h);assert.ok(h.us.hand.some(c=>c.uid==='eligible'));assert.ok(h.us.deck.some(c=>c.uid==='seventh'));}finally{h.done();}});
 test(side+' Mysterious Tail never deletes an Item when hand is full',()=>{const h=setup(side,'cel25-25');try{h.us.hand=Array.from({length:8},(_,i)=>ref('cel25-5','hand'+i));h.us.handLimit=8;h.us.deck.unshift(ref('swsh7-154','safe'));use(h,'ability');resolve(h);assert.equal(h.us.hand.length,8);assert.ok(h.us.deck.some(c=>c.uid==='safe'));}finally{h.done();}});
 test(side+' Zacian searches Psychic Energy then ends turn',()=>{const h=setup(side,'cel25-16');try{h.us.active.energy={};h.us.deck.unshift(ref('neo1-110','psychic'));use(h,'ability');resolve(h,a=>!a.choiceSkip&&(a.choiceOption===0||a.choiceTarget==='active'));assert.equal(h.us.active.energy.Psychic,1);assert.equal(h.s.activeSide,h.foe);}finally{h.done();}});
}

for(const side of ['player','opponent']){
 test(side+' Aqua Storm mills exactly five, counts only Energy cards, and hits distinct Bench slots',()=>{const h=setup(side,'cel25-3');try{
  h.us.active.energy={Water:2,Colorless:1};h.us.deck=[ref('neo1-111','water'),ref('cel25-5','mon'),ref('swsh6-158','special'),ref('cel25-5','mon2'),ref('cel25-23','trainer'),ref('neo1-111','sixth')];
  h.them.bench.push({...slot('sm6-dummy','bench2'),benchSlot:1},{...slot('sm6-dummy','bench3'),benchSlot:2});attack(h,'Aqua Storm');assert.equal(h.us.deck.length,1);assert.equal(h.us.deck[0].uid,'sixth');assert.equal(h.us.discard.length,5);choice(h,x=>x.choiceBenchIndex===1);assert.ok(!core.legalActions(h.s,side).some(x=>x.choiceBenchIndex===1));choice(h,x=>x.choiceBenchIndex===2);assert.equal(h.them.active.damage,0);assert.deepEqual(h.them.bench.map(x=>x.damage),[0,100,100]);
 }finally{h.done();}});
 test(side+' Aqua Storm handles short decks and a single Bench without hitting Active',()=>{const h=setup(side,'cel25-3');try{h.us.active.energy={Water:3};h.us.deck=[ref('neo1-111','one'),ref('cel25-5','two')];attack(h,'Aqua Storm');resolve(h);assert.equal(h.us.deck.length,0);assert.equal(h.them.bench[0].damage,50);assert.equal(h.them.active.damage,0);}finally{h.done();}});
 test(side+' Lunar Pain doubles existing counters on each opposing Pokemon, not its own field',()=>{const h=setup(side,'cel25-15');try{h.us.active.damage=30;h.them.active.damage=40;h.them.bench[0].damage=20;h.them.bench.push({...slot('sm6-dummy','undamaged'),benchSlot:1});attack(h,'Lunar Pain');resolve(h);assert.equal(h.them.active.damage,80);assert.deepEqual(h.them.bench.map(x=>x.damage),[40,0]);assert.equal(h.us.active.damage,30);}finally{h.done();}});
 test(side+' Lunar Pain respects Metal Goggles and ignores ordinary damage reduction',()=>{const h=setup(side,'cel25-15');try{h.them.active.damage=40;h.them.bench[0].cardId='cel25-20';h.them.bench[0].damage=20;h.them.bench[0].tool=ref('sm9-148','goggles');attack(h,'Lunar Pain');resolve(h);assert.equal(h.them.active.damage,80);assert.equal(h.them.bench[0].damage,20);}finally{h.done();}});
 test(side+' Breath of Life selects distinct basic types, may attach to same target, and leaves duplicates and Special Energy',()=>{const h=setup(side,'cel25-12');try{
  h.us.active.energy={Colorless:2};h.us.energySupply=[];h.us.deck=[ref('neo1-111','water1'),ref('neo1-111','water2'),ref('neo1-107','fire'),ref('neo1-110','psychic'),ref('swsh6-158','special'),ref('neo1-108','grass')];attack(h,'Breath of Life');
  const pickType=(type,uid)=>{choice(h,x=>h.s.pendingChoice.effect.opts?.[x.choiceOption]?.uid===uid);choice(h,x=>x.choiceTarget==='active');};
  pickType('Water','water1');assert.ok(!h.s.pendingChoice.effect.opts.some(x=>x.type==='Water'));assert.ok(!h.s.pendingChoice.effect.opts.some(x=>x.uid==='special'));pickType('Fire','fire');pickType('Psychic','psychic');
  assert.deepEqual(h.us.active.energy,{Colorless:2,Water:1,Fire:1,Psychic:1});assert.deepEqual(h.us.deck.map(x=>x.uid).sort(),['grass','special','water2']);assert.notEqual(h.s.phase,'effectChoice');
 }finally{h.done();}});
 test(side+' Breath of Life allows decline and keeps Zone coin gate and distinct types',()=>{const h=setup(side,'cel25-12');try{h.us.active.energy={Colorless:2};h.us.energySupply=['Water','Water','Fire'];h.us.deck=[ref('cel25-5','nonenergy')];attack(h,'Breath of Life');choice(h,x=>h.s.pendingChoice.effect.opts?.[x.choiceOption]?.type==='Water');choice(h,x=>x.choiceTarget==='active');assert.ok(!h.s.pendingChoice.effect.opts.some(x=>x.type==='Water'));const flip=h.s.log.filter(x=>x.type==='coin'&&x.reason==='Hybrid Basic Energy deck search').at(-1);assert.ok(flip);assert.equal(h.us.active.energy.Water||0,flip.heads?1:0);assert.equal(h.us.energySupply.filter(t=>t==='Water').length,flip.heads?1:2);choice(h,x=>x.choiceSkip);assert.equal(h.us.active.energy.Fire||0,0);assert.notEqual(h.s.phase,'effectChoice');}finally{h.done();}});
 test(side+' Cry of Destruction discards up to three selected Special refs across the field, not basic Energy',()=>{const h=setup(side,'cel25-19');try{h.them.active.energy={Water:2};h.them.active.specialEnergy=[ref('swsh6-158','one'),ref('swsh6-158','two'),ref('swsh6-158','four')];h.them.bench[0].specialEnergy=[ref('swsh6-158','three')];attack(h,'Cry of Destruction');assert.ok(core.legalActions(h.s,side).every(x=>x.choiceSkip||x.effectSpecialEnergyUid));for(const uid of ['two','one','three'])choice(h,x=>x.effectSpecialEnergyUid===uid);assert.equal(h.them.active.energy.Water,2);assert.deepEqual(h.them.active.specialEnergy.map(x=>x.uid),['four']);assert.equal(h.them.bench[0].specialEnergy.length,0);assert.deepEqual(h.them.discard.map(x=>x.uid).sort(),['one','three','two']);assert.notEqual(h.s.phase,'effectChoice');}finally{h.done();}});
 test(side+' Cry of Destruction allows stopping after one and never removes unselected refs',()=>{const h=setup(side,'cel25-19');try{h.them.active.specialEnergy=[ref('swsh6-158','one'),ref('swsh6-158','two')];attack(h,'Cry of Destruction');choice(h,x=>x.effectSpecialEnergyUid==='two');choice(h,x=>x.choiceSkip);assert.deepEqual(h.them.active.specialEnergy.map(x=>x.uid),['one']);assert.notEqual(h.s.phase,'effectChoice');}finally{h.done();}});
}

test('CPU Cry of Destruction chooses three available Special Energy cards instead of declining',()=>{const h=setup('opponent','cel25-19');try{h.them.active.specialEnergy=[ref('swsh6-158','one'),ref('swsh6-158','two')];h.them.bench[0].specialEnergy=[ref('swsh6-158','three')];attack(h,'Cry of Destruction');const ai=require('../app/src/main/assets/tcgp-battle-ai.js');let n=0;while(h.s.phase==='effectChoice'&&n++<4){const a=ai.chooseAction(h.s,h.side,'Expert',0);assert.ok(a&&!a.choiceSkip);core.applyAction(h.s,h.side,a);}assert.equal(h.them.active.specialEnergy.length,0);assert.equal(h.them.bench[0].specialEnergy.length,0);assert.equal(n,3);}finally{h.done();}});
