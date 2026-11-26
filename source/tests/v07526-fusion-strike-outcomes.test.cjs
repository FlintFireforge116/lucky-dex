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
const sets=[require('../app/src/main/assets/tcg-classic-fusion-strike.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Fusion Strike attack executes',()=>{
  let count=0;const failures=[];for(const c of sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];if(a.name==='Zen Shot')h.them.bench[0]=Object.assign(slot('swsh7-28',h.foe+'b'),{benchSlot:0});attack(h,a.name);resolve(h,x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}

for(const side of ['player','opponent']){
 test(side+' Drain Punch heals exactly 30 and deals 60',()=>{const h=setup(side,'swsh8-22');try{h.us.active.energy={Grass:3};h.us.active.damage=50;attack(h,'Drain Punch');resolve(h);assert.equal(h.us.active.damage,20);assert.equal(h.them.active.damage,60);}finally{h.done();}});
 test(side+' Heat Tackle applies recoil and full printed damage',()=>{const h=setup(side,'swsh8-33');try{h.us.active.energy={Fire:3};attack(h,'Heat Tackle');resolve(h);assert.equal(h.us.active.damage,30);assert.equal(h.them.active.damage,160);}finally{h.done();}});
 test(side+' Double Draw draws precisely two cards',()=>{const h=setup(side,'swsh8-112');try{h.us.active.energy={Psychic:1};attack(h,'Double Draw');resolve(h);assert.equal(h.us.hand.length,2);}finally{h.done();}});
 test(side+' Cut Down removes one opposing Energy, not own Energy',()=>{const h=setup(side,'swsh8-141');try{h.us.active.energy={Fighting:2};h.them.active.energy={Water:2};attack(h,'Cut Down');resolve(h);assert.equal(h.us.active.energy.Fighting,2);assert.equal(h.them.active.energy.Water,1);assert.equal(h.them.active.damage,30);}finally{h.done();}});
 test(side+' Chili & Cilan & Cress searches only Fusion Strike Pokémon',()=>{const h=setup(side,'swsh8-13');try{h.us.deck=[ref('swsh8-13','eligible'),ref('swsh8-65','eligible2'),ref('swsh8-22','rapid-strike'),ref('swsh8-227','trainer')];trainer(h,'swsh8-227');resolve(h);assert.deepEqual(h.us.hand.map(x=>x.cardId).sort(),['swsh8-13','swsh8-65']);assert.deepEqual(h.us.deck.map(x=>x.cardId).sort(),['swsh8-22','swsh8-227']);}finally{h.done();}});
 test(side+' Quick Ball pays one discard and finds a Basic Pokémon only',()=>{const h=setup(side,'swsh8-13');try{h.us.hand=[ref('swsh8-4','payment')];h.us.deck=[ref('swsh8-13','basic'),ref('swsh8-10','evolved')];trainer(h,'swsh8-237');resolve(h);assert.ok(h.us.discard.some(x=>x.uid==='payment'));assert.deepEqual(h.us.hand.map(x=>x.cardId),['swsh8-13']);assert.deepEqual(h.us.deck.map(x=>x.cardId),['swsh8-10']);}finally{h.done();}});
}
