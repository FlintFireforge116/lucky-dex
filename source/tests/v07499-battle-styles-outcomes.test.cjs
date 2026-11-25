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
const sets=[require('../app/src/main/assets/tcg-classic-battle-styles.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Battle Styles attack executes',()=>{
  let count=0;const failures=[];for(const c of sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];if(a.name==='Thunder Snipe')h.them.bench[0]=Object.assign(slot('swsh4-43',h.foe+'b'),{benchSlot:0});attack(h,a.name);resolve(h,a.name==='Hurricane Blender'?x=>x.choiceSkip:x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}

for(const side of ['player','opponent']){
 test(side+' Rapid Strike Squad counts only Rapid Strike Pokemon in play',()=>{const h=setup(side,'swsh5-83');try{h.us.bench=[Object.assign(slot('swsh5-36','rapid'),{benchSlot:0}),Object.assign(slot('swsh5-95','single'),{benchSlot:1})];attack(h,'Rapid Strike Squad');resolve(h);assert.equal(h.them.active.damage,40);}finally{h.done();}});
 test(side+' Fighting Fury Stance boosts only Single Strike attackers',()=>{for(const [id,name,expected] of [['swsh5-23','Ram',50],['swsh5-36','Water Gun',10]]){const h=setup(side,id);try{h.us.active.energy={...allEnergy};h.us.bench=[Object.assign(slot('swsh5-25','emboar'),{benchSlot:0})];attack(h,name);resolve(h);assert.equal(h.them.active.damage,expected);}finally{h.done();}}});
 test(side+' Rapid Strike Search has a shared once-per-turn limit and filters cards by strike style',()=>{const h=setup(side,'swsh5-37');try{h.us.bench=[Object.assign(slot('swsh5-178','octillery'),{benchSlot:0})];h.us.deck=[ref('swsh5-36','rapid-mon'),ref('swsh5-128','rapid-supporter'),ref('swsh5-23','single-mon')];use(h,'ability');assert.ok(!core.legalActions(h.s,side).some(a=>a.choiceCardId==='swsh5-23'));resolve(h);assert.equal(h.us.hand.length,1);assert.ok(data.cardById(h.us.hand[0].cardId).rapidStrike);assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));h.us.turnCount++;assert.ok(core.legalActions(h.s,side).some(a=>a.type==='ability'));}finally{h.done();}});
 test(side+' Spiral Thunder counts Energy on both opposing Active and Bench',()=>{const h=setup(side,'swsh5-50');try{h.us.active.energy={Lightning:2,Colorless:1};h.them.active.energy={Water:2};h.them.bench[0].energy={Fire:1};attack(h,'Spiral Thunder');resolve(h);assert.equal(h.them.active.damage,140);}finally{h.done();}});
 test(side+' G-Max Rapid Flow discards all Energy and hits two distinct opposing Pokemon',()=>{const h=setup(side,'swsh5-88');try{h.us.active.energy={Fighting:2,Colorless:1};attack(h,'G-Max Rapid Flow');resolve(h);assert.equal(h.them.active.damage,120);assert.equal(h.them.bench[0].damage,120);assert.equal(Object.values(h.us.active.energy).reduce((a,b)=>a+b,0),0);}finally{h.done();}});
 test(side+' Bruno draws four or seven based on previous-turn knockout',()=>{for(const ko of [false,true]){const h=setup(side,'swsh5-4');try{if(ko)h.us.lastKnockoutTurn=h.s.turnNumber-1;trainer(h,'swsh5-121');resolve(h);assert.equal(h.us.hand.length,ko?7:4);}finally{h.done();}}});
 test(side+' Tower of Waters reduces only Rapid Strike retreat costs on both sides',()=>{const h=setup(side,'swsh5-87');try{h.them.active.cardId='swsh5-85';h.s.stadium={cardId:'swsh5-138',uid:'tower'};assert.equal(fx.modifierAmount(h.s,side,h.us.active,'retreatCost',data.cardById),-2);assert.equal(fx.modifierAmount(h.s,h.foe,h.them.active,'retreatCost',data.cardById),0);}finally{h.done();}});
}

for(const side of ['player','opponent'])test(side+' Fighting Fury Stance is target-aware, stacks and respects Ability suppression',()=>{const h=setup(side,'swsh5-85');try{h.us.bench=[Object.assign(slot('swsh5-25','emboar1'),{benchSlot:0}),Object.assign(slot('swsh5-25','emboar2'),{benchSlot:1})];assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),60);assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.bench[0],data.cardById),0);h.them.active.cardId='swsh45-42';assert.equal(fx.swsh3ActiveDamageBonus(h.s,side,h.us.active,h.foe,h.them.active,data.cardById),0);}finally{h.done();}});
