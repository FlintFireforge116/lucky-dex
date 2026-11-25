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
 test(side+' every enabled Champion’s Path attack executes',()=>{
  let count=0;const failures=[];for(const c of sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];attack(h,a.name);resolve(h,a.name==='Hurricane Blender'?x=>x.choiceSkip:x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets[0].CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}

for(const side of ['player','opponent']){
 test(side+' Grand Flame attaches up to two Fire to the same Bench Pokémon',()=>{const h=setup(side,'swsh35-8');try{h.us.active.energy={Fire:3};h.us.energyDiscard={Fire:3,Water:2};h.us.bench.push({...slot('swsh35-9','extra'),benchSlot:1});attack(h,'Grand Flame');resolve(h);assert.equal(h.us.bench[0].energy.Fire,2);assert.equal(h.us.bench[1].energy.Fire||0,0);assert.equal(h.us.energyDiscard.Fire,1);assert.equal(h.them.active.damage,90);}finally{h.done();}});
 test(side+' Draw Up attaches only Water to Wailord',()=>{const h=setup(side,'swsh35-13');try{h.us.active.energy={Water:1};h.us.energyDiscard={Water:3,Fire:2};attack(h,'Draw Up');resolve(h);assert.equal(h.us.active.energy.Water,4);assert.equal(h.us.energyDiscard.Fire,2);assert.equal(h.us.bench[0].energy.Water||0,0);}finally{h.done();}});
 test(side+' Swelling Pulse gains 80 only after healing this turn',()=>{for(const healed of [false,true]){const h=setup(side,'swsh35-16');try{h.us.active.damage=50;if(healed){trainer(h,'swsh35-61');resolve(h);}attack(h,'Swelling Pulse');resolve(h);assert.equal(h.them.active.damage,healed?200:120);}finally{h.done();}}});
 test(side+' Hollow Missile places exactly three counters on the Bench',()=>{const h=setup(side,'swsh35-21');try{attack(h,'Hollow Missile');resolve(h);assert.equal(h.them.active.damage,60);assert.equal(h.them.bench[0].damage,30);}finally{h.done();}});
 test(side+' Gnawing Aura only triggers when Cursola is Active',()=>{for(const active of [true,false]){const h=setup(side,'swsh35-24');try{(active?h.them.active:h.them.bench[0]).cardId='swsh35-71';h.us.hand=[ref('lental-basic-metal','hand-metal')];h.us.handEnergyUsed=false;use(h,'attachSpecial',a=>a.target==='active');resolve(h);assert.equal(h.us.active.damage,active?30:0);}finally{h.done();}}});
 test(side+' Macho Revenge counts only Fighting Pokémon',()=>{const h=setup(side,'swsh35-26');try{h.us.discard=[ref('swsh35-24','p1'),ref('swsh35-27','p2'),ref('swsh35-3','p3'),ref('lental-basic-fighting','p4')];attack(h,'Macho Revenge');resolve(h);assert.equal(h.them.active.damage,40);}finally{h.done();}});
 test(side+' Bad Brawl gains damage after Piers is played',()=>{const h=setup(side,'swsh35-42');try{h.us.active.energy={Darkness:3};h.us.deck.unshift(ref('swsh35-33','dark'),ref('lental-basic-darkness','energy'));trainer(h,'swsh35-58');resolve(h);attack(h,'Bad Brawl');resolve(h);assert.equal(h.them.active.damage,180);}finally{h.done();}});
 test(side+' Full Heal clears active conditions',()=>{const h=setup(side,'swsh35-24');try{h.us.active.conditions={poison:true,confusion:true};trainer(h,'swsh35-51');resolve(h);assert.deepEqual(h.us.active.conditions,{});}finally{h.done();}});
 test(side+' Miraculous Charm blocks V damage, but not ordinary Pokémon',()=>{for(const v of [true,false]){const h=setup(side,v?'swsh35-1':'swsh35-34');try{h.them.active.cardId='swsh35-49';h.them.active.stack=['swsh35-49'];attack(h,v?'Solar Typhoon':'Sharp Fang');resolve(h);assert.equal(h.them.active.damage,v?0:30);}finally{h.done();}}});
}
