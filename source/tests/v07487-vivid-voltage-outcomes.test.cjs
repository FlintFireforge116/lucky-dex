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
const sets=[require('../app/src/main/assets/tcg-classic-vivid-voltage.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Vivid Voltage attack executes',()=>{
  let count=0;const failures=[];for(const c of sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];attack(h,a.name);resolve(h,a.name==='Hurricane Blender'?x=>x.choiceSkip:x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}


for(const side of ['player','opponent']){
 test(side+' G-Max Volt Tackle optionally discards all Energy for 270 damage',()=>{for(const boost of [false,true]){const h=setup(side,'swsh4-44');try{h.us.active.energy={Lightning:3,Fire:1};h.us.active.specialEnergy=[{...ref('sm1-136','dce'),provides:{Colorless:2}}];const a=use(h,'attack',a=>a.attackIndex===0&&(a.effectSelection==='boost')===boost);resolve(h);assert.equal(h.them.active.damage,boost?270:120);assert.equal(h.us.active.energy.Lightning||0,boost?0:3);assert.equal(h.us.active.energy.Fire||0,boost?0:1);assert.equal(h.us.active.specialEnergy.length,boost?0:1);if(boost)assert.ok(h.us.discard.some(r=>r.uid==='dce'));}finally{h.done();}}});
 test(side+' Dreamy Revelation takes one of top two and preserves remaining deck order',()=>{const h=setup(side,'swsh4-119');try{const before=h.us.deck.map(x=>x.uid);use(h,'ability');choice(h,a=>a.choiceDeckIndex===1);assert.equal(h.us.hand[0].uid,before[1]);assert.deepEqual(h.us.deck.map(x=>x.uid),before.filter((_,i)=>i!==1));}finally{h.done();}});
 test(side+' Battle Sense keeps one of top three and discards the rest',()=>{const h=setup(side,'swsh4-25');try{const before=h.us.deck.map(x=>x.uid);use(h,'ability');choice(h,a=>a.choiceDeckIndex===1);assert.equal(h.us.hand[0].uid,before[1]);assert.deepEqual(h.us.discard.map(x=>x.uid),[before[0],before[2]]);assert.deepEqual(h.us.deck.map(x=>x.uid),before.slice(3));}finally{h.done();}});
 test(side+' Eerie Beam places one counter on each opposing Pokemon',()=>{const h=setup(side,'swsh4-21');try{use(h,'ability');resolve(h);assert.equal(h.them.active.damage,10);assert.equal(h.them.bench[0].damage,10);assert.equal(h.us.active.damage,0);}finally{h.done();}});
 test(side+' Amazing Sword checks VMAX anywhere on opposing board',()=>{for(const vmax of [true,false]){const h=setup(side,'swsh4-82');try{h.us.active.energy={Grass:1,Psychic:1,Metal:1};if(vmax){h.them.bench[0].cardId='swsh4-37';h.them.bench[0].stack=['swsh4-36','swsh4-37'];}attack(h,'Amazing Sword');resolve(h);assert.equal(h.them.active.damage,vmax?300:150);}finally{h.done();}}});
 test(side+' Amazing Shot preserves multi-type cost and hits selected Bench',()=>{const h=setup(side,'swsh4-50');try{h.us.active.energy={Grass:1,Lightning:1,Metal:1};attack(h,'Amazing Shot');resolve(h);assert.equal(h.them.active.damage,120);assert.equal(h.them.bench[0].damage,120);}finally{h.done();}});
 test(side+' Royal Blaze counts Leon alternate prints in discard',()=>{const h=setup(side,'swsh4-25');try{h.us.active.energy={Fire:2};h.us.discard=[ref('swsh4-154','l1'),ref('swsh4-182','l2'),ref('swsh4-195','l3'),ref('swsh4-1','notLeon')];attack(h,'Royal Blaze');resolve(h);assert.equal(h.them.active.damage,250);}finally{h.done();}});
 test(side+' Unamplified Soundwave fails with a nonempty hand',()=>{for(const empty of [true,false]){const h=setup(side,'swsh4-73');try{if(!empty)h.us.hand=[ref('swsh4-1','a')];attack(h,'Unamplified Soundwave');resolve(h);assert.equal(h.them.active.damage,empty?30:0);assert.equal(h.them.bench[0].damage,empty?30:0);}finally{h.done();}}});
 test(side+' Memory Capsule enables previous attacks only while attached',()=>{const h=setup(side,'swsh4-25');try{h.us.active.stack=['swsh4-23','swsh4-24','swsh4-25'];h.us.active.energy={Fire:3};assert.ok(!fx.canUsePreviousEvolutionAttacks(h.s,side,h.us.active,data.cardById));h.us.active.tool=ref('swsh4-155','memory');assert.ok(fx.canUsePreviousEvolutionAttacks(h.s,side,h.us.active,data.cardById));h.us.active.tool=null;assert.ok(!fx.canUsePreviousEvolutionAttacks(h.s,side,h.us.active,data.cardById));}finally{h.done();}});
}
