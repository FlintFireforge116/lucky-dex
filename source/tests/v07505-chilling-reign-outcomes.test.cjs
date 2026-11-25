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
const sets=[require('../app/src/main/assets/tcg-classic-chilling-reign.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Chilling Reign attack executes',()=>{
  let count=0;const failures=[];for(const c of sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];if(a.name==='Thunder Snipe')h.them.bench[0]=Object.assign(slot('swsh4-43',h.foe+'b'),{benchSlot:0});attack(h,a.name);resolve(h,a.name==='Hurricane Blender'?x=>x.choiceSkip:x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}

for(const side of ['player','opponent']){
 test(side+' Tread On uses opposing retreat cost, Rapid-Fisted Rush counts only Rapid Strike',()=>{
  let h=setup(side,'swsh6-15');try{data.cardById(h.them.active.cardId).retreat=4;attack(h,'Tread On');resolve(h);assert.equal(h.them.active.damage,210);}finally{h.done();}
  h=setup(side,'swsh6-44');try{h.us.active.energy={Water:1,Colorless:1};h.us.bench=[Object.assign(slot('swsh6-41','rapid'),{benchSlot:0}),Object.assign(slot('swsh6-26','single'),{benchSlot:1})];attack(h,'Rapid-Fisted Rush');resolve(h);assert.equal(h.them.active.damage,60);}finally{h.done();}
 });
 test(side+' Glacial Lance discards two energy and Dynamite Tackle respects damage threshold',()=>{
  let h=setup(side,'swsh6-45');try{h.us.active.energy={Water:3};attack(h,'Glacial Lance');resolve(h);assert.equal(h.them.active.damage,200);assert.equal(fx.totalEnergy(h.us.active.energy),1);}finally{h.done();}
  for(const [d,expected] of [[90,100],[100,250]]){h=setup(side,'swsh6-25');try{h.us.active.energy={Fire:3};h.us.active.damage=d;attack(h,'Dynamite Tackle');resolve(h);assert.equal(h.them.active.damage,expected);}finally{h.done();}}
 });
 test(side+' Brawly and Keep Calling select Rapid Strike Basic Pokemon only',()=>{for(const supporter of [true,false]){const h=setup(side,'swsh6-41');try{h.us.bench=[];h.us.deck=[ref('swsh6-16','r1'),ref('swsh6-50','r2'),ref('swsh6-26','single'),ref('swsh6-42','evolved')];if(supporter)trainer(h,'swsh6-131');else attack(h,'Keep Calling');resolve(h);assert.deepEqual(h.us.bench.map(p=>p.cardId).sort(),['swsh6-16','swsh6-50']);}finally{h.done();}}});
 test(side+' Quick Shooting targets one Pokemon and Curative Forest heals Grass only',()=>{
  let h=setup(side,'swsh6-43');try{use(h,'ability',x=>x.effectTarget==='opponentBench');resolve(h,x=>x.choiceTarget==='bench');assert.equal(h.them.active.damage,0);assert.equal(h.them.bench[0].damage,20);assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));}finally{h.done();}
  h=setup(side,'swsh6-8');try{h.us.active.damage=40;h.us.bench=[Object.assign(slot('swsh6-4','grass'),{benchSlot:0,damage:30}),Object.assign(slot('swsh6-35','water'),{benchSlot:1,damage:30})];use(h,'ability');resolve(h);assert.deepEqual([h.us.active.damage,...h.us.bench.map(p=>p.damage)],[20,10,30]);}finally{h.done();}
 });
 test(side+' Gloves target matching opposing type, Stranglehold Master applies only while Active',()=>{let h=setup(side,'swsh6-1');try{h.us.active.tool=ref('swsh6-133','gloves');h.them.active.cardId='swsh6-109';assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),30);h.them.active.cardId='swsh6-35';assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),0);}finally{h.done();}
 h=setup(side,'swsh6-92');try{assert.equal(fx.modifierAmount(h.s,h.foe,h.them.active,'retreatCost',data.cardById),2);h.us.bench.push(h.us.active);h.us.active=h.us.bench.shift();assert.equal(fx.modifierAmount(h.s,h.foe,h.them.active,'retreatCost',data.cardById),0);}finally{h.done();}});
 test(side+' Doctor draws extra cards against VMAX only',()=>{for(const [opponent,n] of [['swsh6-8',4],['swsh6-7',2]]){const h=setup(side,'swsh6-1');try{h.them.active.cardId=opponent;trainer(h,'swsh6-134');resolve(h);assert.equal(h.us.hand.length,n);}finally{h.done();}}});
}
