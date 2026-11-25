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
const sets=[require('../app/src/main/assets/tcg-classic-champions-path.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' Ninetales V copies Whisk with staged Energy-card payments',()=>{const h=setup(side,'swsh2-26');try{
  h.us.active.energy={Fire:1,Colorless:2};h.us.bench[0].energy={Water:2};const src=h.them.active;src.cardId='swsh35-23';src.stack=['swsh35-22','swsh35-23'];
  use(h,'attack',a=>a.attackIndex===0&&a.choiceCardId==='swsh35-23'&&a.choiceAttackIndex===1);assert.equal(h.s.pendingChoice?.rule,'swsh35Whisk');choice(h,a=>a.choiceTarget==='bench'&&a.effectEnergyType==='Water');choice(h,a=>a.choiceTarget==='bench'&&a.effectEnergyType==='Water');choice(h,a=>a.choiceSkip);assert.equal(h.them.active.damage,120);assert.equal(h.us.bench[0].energy.Water,0);assert.equal(h.us.energyDiscard.Water,2);assert.equal(h.us.active.energy.Fire,1);
 }finally{h.done();}});
 test(side+' failed confusion prevents any Whisk payments, even when copied',()=>{for(const copy of [false,true]){const h=setup(side,copy?'swsh2-26':'swsh35-23');try{
  h.us.active.energy=copy?{Fire:1,Colorless:2}:{Psychic:2};h.us.active.conditions={confusion:true};h.us.bench[0].energy={Water:2};if(copy){h.them.active.cardId='swsh35-23';h.them.active.stack=['swsh35-22','swsh35-23'];}
  let seed=1;while(core.random({rngState:seed})<0.5)seed++;h.s.rngState=seed;
  if(copy)use(h,'attack',a=>a.attackIndex===0&&a.choiceCardId==='swsh35-23'&&a.choiceAttackIndex===1);else attack(h,'G-Max Whisk');resolve(h);
  assert.equal(h.them.active.damage,0);assert.equal(h.us.active.damage,30);assert.equal(h.us.bench[0].energy.Water,2);assert.deepEqual(h.us.energyDiscard,{});assert.ok(h.s.log.some(x=>x.type==='attackFailed'&&x.reason==='confusion'));
 }finally{h.done();}}});
 test(side+' successful confusion checks happen once before Whisk payment',()=>{const h=setup(side,'swsh35-23');try{
  h.us.active.energy={Psychic:2};h.us.active.conditions={confusion:true};h.us.bench[0].energy={Water:2};h.s.rngState=1;attack(h,'G-Max Whisk');choice(h,a=>a.choiceTarget==='bench'&&a.effectEnergyType==='Water');choice(h,a=>a.choiceSkip);assert.equal(h.them.active.damage,60);assert.equal(h.us.active.damage,0);assert.equal(h.s.log.filter(x=>x.status==='confusion'&&x.type==='coin').length,1);
 }finally{h.done();}});
 test(side+' legacy Jungle Heal marks only actually healed Pokémon',()=>{const h=setup(side,'swsh35-16');try{
  h.us.active.energy={Grass:1,Psychic:3};h.us.bench[0].energy={Grass:1};h.us.bench[0].damage=30;fx.applyEffect({type:'sm7Rule',rule:'sm8JungleHeal'},core.effectContext(h.s,side));assert.equal(h.us.active.xy8HealedTurn,undefined);assert.equal(h.us.bench[0].damage,0);assert.equal(h.us.bench[0].xy8HealedTurn,7);attack(h,'Swelling Pulse');resolve(h);assert.equal(h.them.active.damage,120);
 }finally{h.done();}});
 test(side+' Solid Shell reduces damage after weakness on both print variants',()=>{for(const id of ['swsh35-14','swsh35-69','swsh35-15','swsh35-75']){const h=setup(side,'swsh3-55');try{
  h.them.active.cardId=id;h.them.active.stack=[id];h.us.active.energy={Lightning:1};attack(h,'Static Shock');resolve(h);assert.equal(h.them.active.damage,10);
 }finally{h.done();}}});
 test(side+' Hazard Sensor confuses an attacker even when Hatterene is knocked out',()=>{const h=setup(side,'swsh35-79');try{
  h.them.active.cardId='swsh35-20';h.them.active.stack=['swsh35-18','swsh35-19','swsh35-20'];h.us.active.energy={Fire:4};attack(h,'Fire Spin');resolve(h);assert.ok(h.us.active.conditions.confusion);assert.ok(h.them.discard.some(x=>x.cardId==='swsh35-20'));
 }finally{h.done();}});
 test(side+' Wicked Ruler unavailable against four cards and under ability suppression',()=>{const h=setup(side,'swsh35-37');try{
  h.them.hand=Array.from({length:4},(_,i)=>ref('swsh35-6','foe'+i));assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));h.them.hand.push(ref('swsh35-6','foe4'));assert.ok(core.legalActions(h.s,side).some(a=>a.type==='ability'));h.them.active.cardId='swsh2-113';assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));
 }finally{h.done();}});
}
