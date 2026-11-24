'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm7-1'){
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
const set=require('../app/src/main/assets/tcg-classic-celestial-storm.js');
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));


for(const side of ['player','opponent']){
 test(side+' Hydro Pump counts Water provided by Rainbow and Unit Energy, but not unrelated Special Energy',()=>{const h=setup(side,'sm7-35');try{h.us.active.energy={Water:1};h.us.active.specialEnergy=[ref('sm7-151','rainbow'),ref('sm5-137','water-unit'),ref('sm5-138','metal-unit')];attack(h,'Hydro Pump');assert.equal(h.them.active.damage,140);}finally{h.done();}});
 test(side+' Explosive Kick can spend two Fire-providing Special cards without discarding unrelated Energy',()=>{const h=setup(side,'sm7-28');try{h.us.active.energy={Water:1};h.us.active.specialEnergy=[ref('sm7-151','rainbow'),ref('sm5-137','fire-unit'),ref('sm5-138','unrelated')];attack(h,'Explosive Kick');assert.equal(h.them.active.damage,210);assert.equal(h.us.active.energy.Water,1);assert.deepEqual(h.us.active.specialEnergy.map(x=>x.uid),['unrelated']);assert.ok(h.us.discard.some(x=>x.uid==='rainbow'));assert.ok(h.us.discard.some(x=>x.uid==='fire-unit'));}finally{h.done();}});
 test(side+' Captivating Salsa cannot burn or confuse the original Active when no switch is possible',()=>{const h=setup(side,'sm7-30');try{h.us.active.energy={Fire:1};h.them.bench=[];attack(h,'Captivating Salsa');assert.equal(h.them.active.damage,0);assert.deepEqual(h.them.active.conditions,{});assert.notEqual(h.s.phase,'effectChoice');}finally{h.done();}});
 test(side+' Captivating Salsa applies conditions only to the chosen incoming Active',()=>{const h=setup(side,'sm7-30');try{h.us.active.energy={Fire:1};const old=h.them.active,target=h.them.bench[0];attack(h,'Captivating Salsa');choice(h,a=>a.choiceTarget==='bench');assert.equal(h.them.active.uid,target.uid);assert.ok(target.conditions.confusion);assert.deepEqual(old.conditions,{});assert.ok(target.conditions.burn||target.damage===20);}finally{h.done();}});
 test(side+' Friend Ball recognises Kecleon Unit Color types, not its printed Colorless type',()=>{const h=setup(side);try{h.them.active=slot('sm7-122','kecleon');h.them.active.specialEnergy=[ref('sm5-138','unit')];h.them.bench=[];h.us.deck=[ref('sm7-51','lightning'),ref('sm7-57','psychic'),ref('sm7-93','metal'),ref('sm7-110','colorless'),ref('sm7-1','grass')];trainer(h,'sm7-131');const ids=core.legalActions(h.s,side).filter(a=>a.type==='effectChoice'&&!a.choiceSkip).map(a=>a.choiceCardId);assert.deepEqual(ids.sort(),['sm7-51','sm7-57','sm7-93']);choice(h,a=>a.choiceCardId==='sm7-51');assert.ok(h.us.hand.some(x=>x.uid==='lightning'));}finally{h.done();}});
}
