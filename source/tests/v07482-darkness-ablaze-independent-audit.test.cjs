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
function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}

for(const side of ['player','opponent']){
 test(side+' Sonic Double applies stacked Powerful Colorless and Struggle Gloves only to Active',()=>{const h=setup(side,'swsh3-144');try{
  h.us.active.energy={Colorless:1};h.us.active.specialEnergy=[ref('swsh3-176','power1'),ref('swsh3-176','power2')];h.us.active.tool=ref('swsh3-171','gloves');h.them.active=slot('swsh3-60','electric');h.them.bench[0].cardId='swsh3-60';
  attack(h,'Sonic Double');resolve(h);assert.equal(h.them.active.damage,110);assert.equal(h.them.bench[0].damage,40);
 }finally{h.done();}});
 test(side+' Powerful Colorless applies once to regular damage and preview, not Bench spread',()=>{const h=setup(side,'swsh3-143');try{
  h.us.active.specialEnergy=[ref('swsh3-176','power')];h.us.active.energy={Colorless:3};assert.equal(core.attackDamagePreview(h.s,side,0).damage,50);attack(h,'Swoop Across');resolve(h);assert.equal(h.them.active.damage,50);assert.equal(h.them.bench[0].damage,30);
 }finally{h.done();}});
 test(side+' Struggle Gloves uses current weakness and is suppressed by Tool lock',()=>{const h=setup(side,'swsh3-144');try{
  h.us.active.tool=ref('swsh3-171','gloves');h.them.active.cardId='swsh3-60';assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),30);
  h.us.active.weaknessOverride='Fighting';assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),0);delete h.us.active.weaknessOverride;
  h.s.stadium={...ref('sm6-111','lock'),ownerSide:h.foe};assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),0);
 }finally{h.done();}});
 test(side+' Glimwood Tangle cannot reroll a failed confusion check',()=>{const h=setup(side,'swsh3-4');try{
  h.s.stadium={...ref('swsh3-162','tangle'),ownerSide:side};h.us.active.conditions={confusion:true};h.s.rngState=0x80000000;assert.ok(core.random({rngState:h.s.rngState})>=0.5);attack(h,'Mushroom Tackle');assert.notEqual(h.s.pendingChoice?.special,'coinReroll');assert.equal(h.us.active.damage,30);assert.equal(h.them.active.damage,0);
 }finally{h.done();}});
 test(side+' Sky Field removal keeps Eternal Zone at eight while other side trims to five',()=>{const h=setup(side,'swsh3-117');try{
  h.us.bench=Array.from({length:8},(_,i)=>({...slot('swsh3-102','our'+i),benchSlot:i}));h.them.bench=Array.from({length:8},(_,i)=>({...slot('swsh3-3','their'+i),benchSlot:i}));h.s.stadium={...ref('xy6-89','sky'),ownerSide:side};core.legalActions(h.s,side);assert.equal(h.us.benchLimit,8);assert.equal(h.them.benchLimit,8);
  trainer(h,'swsh3-169');assert.equal(h.s.choiceSide,h.foe);resolve(h);assert.equal(h.us.bench.length,8);assert.equal(h.us.benchLimit,8);assert.equal(h.them.bench.length,5);assert.equal(h.them.prizes.length,5);assert.equal(h.us.prizes.length,5);
 }finally{h.done();}});
 test(side+' Eternal Zone type conversion triggers non-KO trim and reopens when removed',()=>{const h=setup(side,'swsh3-117');try{
  h.us.bench=Array.from({length:8},(_,i)=>({...slot('swsh3-102','dark'+i),benchSlot:i}));core.legalActions(h.s,side);const p=h.us.bench[0];p.typeOverride={type:'Fire',expiresTurn:h.s.turnNumber};core.legalActions(h.s,side);assert.equal(h.s.pendingChoice?.special,'skyFieldBenchTrim');assert.equal(h.us.benchLimit,5);choice(h,x=>x.choiceBenchIndex===7);resolve(h,x=>x.choiceBenchIndex!==0);assert.equal(h.us.bench.length,5);assert.equal(h.us.prizes.length,5);delete p.typeOverride;core.legalActions(h.s,side);assert.equal(h.us.benchLimit,8);
 }finally{h.done();}});
}
