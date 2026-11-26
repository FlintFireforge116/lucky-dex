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
