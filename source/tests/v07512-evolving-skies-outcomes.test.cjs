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
const sets=[require('../app/src/main/assets/tcg-classic-evolving-skies.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' every enabled Evolving Skies attack executes',()=>{
  let count=0;const failures=[];for(const c of sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks){
   const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('sm6-108','trainer'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.active.conditions={confusion:true};h.them.bench[0].damage=10;h.them.hand=[ref('sm6-108','foe-trainer')];if(a.name==='Zen Shot')h.them.bench[0]=Object.assign(slot('swsh7-28',h.foe+'b'),{benchSlot:0});attack(h,a.name);resolve(h,x=>!x.choiceSkip);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}
  assert.deepEqual(failures,[]);assert.equal(count,sets.flatMap(s=>s.CARDS).filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });
}


for(const side of ['player','opponent']){
 test(side+' Grass Knot and Blizzard Rondo use correct live counts',()=>{
  let h=setup(side,'swsh7-8');try{h.us.active.energy={Grass:1,Colorless:1};data.cardById(h.them.active.cardId).retreat=3;attack(h,'Grass Knot');resolve(h);assert.equal(h.them.active.damage,180);}finally{h.done();}
  h=setup(side,'swsh7-31');try{h.us.active.energy={Water:1,Colorless:1};h.us.bench.push(Object.assign(slot('swsh7-24','extra'),{benchSlot:1}));attack(h,'Blizzard Rondo');resolve(h);assert.equal(h.them.active.damage,80);}finally{h.done();}
 });
 test(side+' Dragonite and Noivern apply opposing Active and correct Bench damage',()=>{
  let h=setup(side,'swsh7-191');try{h.us.active.energy={Water:2,Lightning:1};attack(h,'Dragon Gale');resolve(h);assert.equal(h.them.active.damage,250);assert.equal(h.us.bench[0].damage,20);assert.equal(h.them.bench[0].damage,0);}finally{h.done();}
  h=setup(side,'swsh7-117');try{h.us.active.energy={Psychic:1};attack(h,'Boomburst');resolve(h);assert.equal(h.them.active.damage,20);assert.equal(h.them.bench[0].damage,20);assert.equal(h.us.bench[0].damage,0);}finally{h.done();}
 });
 test(side+' Regidrago subtracts damage counters, not a flat reduction',()=>{const h=setup(side,'swsh7-124');try{h.us.active.energy={Grass:2,Fire:1};h.us.active.damage=50;attack(h,'Dragon Energy');resolve(h);assert.equal(h.them.active.damage,140);}finally{h.done();}});
 test(side+' Dark Signal can be declined or select an opposing bench',()=>{const h=setup(side,'swsh7-94');try{h.us.active.playedOnSideTurn=1;h.us.hand=[ref('swsh7-95','evo')];const incoming=h.them.bench[0].uid;use(h,'evolve');assert.equal(h.s.phase,'effectChoice');choice(h,a=>a.choiceOption===0);resolve(h);assert.equal(h.them.active.uid,incoming);}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Greening Cells attaches a searched basic Energy then ends turn',()=>{
  const h=setup(side,'swsh7-7');try{h.us.active.energy={};h.us.deck.unshift(ref('hgss1-115','physical-grass'));use(h,'ability');assert.equal(h.s.phase,'effectChoice');assert.equal(h.s.activeSide,side);resolve(h,a=>!a.choiceSkip&&(a.choiceOption===0||a.choiceTarget==='active'));assert.equal(h.us.active.energy.Grass,1);assert.ok(!h.us.deck.some(x=>x.uid==='physical-grass'));assert.equal(h.s.activeSide,h.foe);}finally{h.done();}
 });
 test(side+' Dream Gift searches an Item before ending turn',()=>{const h=setup(side,'swsh7-74');try{h.us.deck.unshift(ref('swsh7-154','carrier'),ref('swsh7-143','supporter'));use(h,'ability');assert.equal(h.s.activeSide,side);resolve(h);assert.ok(h.us.hand.some(x=>x.uid==='carrier'));assert.ok(!h.us.hand.some(x=>x.uid==='supporter'));assert.equal(h.s.activeSide,h.foe);}finally{h.done();}});
 test(side+' Dark Signal may be declined',()=>{const h=setup(side,'swsh7-94');try{h.us.hand=[ref('swsh7-95','evo')];const original=h.them.active.uid;use(h,'evolve');choice(h,a=>a.choiceOption===1);resolve(h);assert.equal(h.them.active.uid,original);}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Dynamotor recovers basic Lightning from discard onto Bench only',()=>{const h=setup(side,'swsh7-55');try{h.us.energyDiscard={Lightning:1};h.us.active.energy={};use(h,'ability');resolve(h);assert.equal(h.us.bench[0].energy.Lightning,1);assert.equal(h.us.active.energy.Lightning,undefined);assert.equal(h.us.energyDiscard.Lightning,0);}finally{h.done();}});
 test(side+' Trevenant VMAX counts only discarded Supporters',()=>{const h=setup(side,'swsh7-14');try{h.us.active.energy={Grass:1,Colorless:1};h.them.discard=[ref('swsh7-143','sup1'),ref('swsh7-143','sup2'),ref('swsh7-154','item'),ref('swsh7-28','mon')];attack(h,'Missing in the Forest');resolve(h);assert.equal(h.them.active.damage,80);}finally{h.done();}});
 test(side+' Rescue Carrier limits recovery to Pokémon printed at 90 HP or lower',()=>{const h=setup(side);try{h.us.discard=[ref('swsh7-24','small1'),ref('swsh7-42','small2'),ref('swsh7-28','large'),ref('hgss1-115','energy')];trainer(h,'swsh7-154');resolve(h);assert.deepEqual(h.us.hand.map(x=>x.uid).sort(),['small1','small2']);assert.ok(h.us.discard.some(x=>x.uid==='large'));assert.ok(h.us.discard.some(x=>x.uid==='energy'));}finally{h.done();}});
 test(side+' Zen Shot targets only Pokémon V',()=>{const h=setup(side,'swsh7-64');try{h.us.active.energy={Psychic:1};h.them.bench[0]=Object.assign(slot('swsh7-28','v-target'),{benchSlot:0});const legal=core.legalActions(h.s,side).filter(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(legal.length);assert.ok(legal.every(a=>a.target==='opponentBench'&&a.benchIndex===0),JSON.stringify(legal));attack(h,'Zen Shot');resolve(h);assert.equal(h.them.bench[0].damage,60);assert.equal(h.them.active.damage,0);}finally{h.done();}});
}
