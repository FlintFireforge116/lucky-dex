'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm10-20'){
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
const set=require('../app/src/main/assets/tcg-classic-unbroken-bonds.js');
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));
for(const side of ['player','opponent']){
 test(side+' every enabled attack executes and exits effect choice with real catalogue cards',()=>{
  let count=0;const failures=[];
  for(const c of set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const [idx,a] of c.attacks.entries()){
   const h=setup(side,c.id);try{
    h.us.active.energy={...allEnergy};h.us.prizes.length=h.them.prizes.length=3;
    h.us.bench=['sm6-1','sm6-21','sm6-36'].map((id,i)=>({...slot(id,side+'b'+i,{Water:1}),benchSlot:i}));
    h.us.hand=[ref('sm6-108','judge'),ref('neo1-111','water'),ref('sm6-1','grass')];
    h.us.discard=[ref('sm6-112','tool'),ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];
    h.us.energyDiscard={Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.bench[0].damage=10;
    h.them.hand=[ref('sm6-108','foe-judge'),ref('sm6-112','foe-tool')];
    h.them.bench[0].specialEnergy=[ref('sm6-118','foe-unit')];
    if(a.name==='Assassin Flight')h.them.active.conditions={poison:{amount:10}};
    const actions=core.legalActions(h.s,side).filter(x=>x.type==='attack'&&x.attackIndex===idx);
    assert.ok(actions.length,'no legal attack');core.applyAction(h.s,side,actions[0]);
    let steps=0;while(h.s.phase==='effectChoice'&&steps++<100){const who=h.s.choiceSide||side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'empty choice');core.applyAction(h.s,who,choices.find(x=>!x.choiceSkip)||choices[0]);}
    assert.notEqual(h.s.phase,'effectChoice','stuck effect choice');count++;
   }catch(e){failures.push(`${c.id} ${a.name}: ${e.message}`);}finally{h.done();}
  }
  assert.deepEqual(failures,[]);assert.equal(count,set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });

}
function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<40){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}

for(const side of ['player','opponent']){
 test(side+' Double Blaze GX base and enhanced damage on neutral target',()=>{for(const [n,expected] of [[3,200],[5,200],[6,300]]){const h=setup(side,'sm10-20');try{h.us.active.energy={Fire:n};attack(h,'Double Blaze-GX');resolve(h);assert.equal(h.them.active.damage,expected);assert.equal(h.us.gxAttackUsed,true);}finally{h.done();}}});
 test(side+' Nasty Goo Mix GX requires four additional units for fifteen poison counters',()=>{for(const n of [0,3,4]){const h=setup(side,'sm10-61');try{h.us.active.energy={Colorless:n};attack(h,'Nasty Goo Mix-GX');resolve(h);assert.equal(h.them.active.conditions.poison.amount,n===4?150:10);assert.equal(h.them.active.damage,n===4?150:10);assert.ok(h.them.active.conditions.paralysis);}finally{h.done();}}});
 test(side+' Severe Poison applies eight damage counters at checkup',()=>{const h=setup(side,'sm10-61');try{h.us.active.energy={Psychic:1,Colorless:2};attack(h,'Severe Poison');resolve(h);assert.equal(h.them.active.conditions.poison.amount,80);assert.equal(h.them.active.damage,80);}finally{h.done();}});
 test(side+' Outrage adds damage in proportion to existing counters',()=>{const h=setup(side,'sm10-20');try{h.us.active.energy={Fire:1,Colorless:1};h.us.active.damage=90;attack(h,'Outrage');resolve(h);assert.equal(h.them.active.damage,120);}finally{h.done();}});
 test(side+' Fire Crystal recovers real discarded Fire, never Water or fresh Zone',()=>{const h=setup(side);try{h.us.energyDiscard={Fire:3,Water:1};h.us.energySupply=['Fire','Fire'];trainer(h,'sm10-173');resolve(h);assert.equal(h.us.hand.length,3);assert.ok(h.us.hand.every(r=>data.cardById(r.cardId).subtype==='Fire'));assert.equal(h.us.energyDiscard.Fire||0,0);assert.equal(h.us.energyDiscard.Water,1);assert.deepEqual(h.us.energySupply,['Fire','Fire']);}finally{h.done();}});
 test(side+' Koga Trap applies confusion and poison',()=>{const h=setup(side);try{trainer(h,'sm10-177');resolve(h);assert.ok(h.them.active.conditions.confusion);assert.equal(h.them.active.conditions.poison.amount,10);}finally{h.done();}});
 test(side+' Pokegear selects a Supporter only from original top seven',()=>{const h=setup(side);try{h.us.deck=[ref('sm10-177','koga'),...Array.from({length:6},(_,i)=>ref('sm10-20','mon'+i)),ref('sm9-141','outside')];trainer(h,'sm10-182');const actions=core.legalActions(h.s,side).filter(a=>!a.choiceSkip);assert.equal(actions.length,1);choice(h,a=>!a.choiceSkip);resolve(h);assert.equal(h.us.hand[0].uid,'koga');assert.ok(h.us.deck.some(r=>r.uid==='outside'));}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Janine takes two distinct original top-four cards',()=>{const h=setup(side);try{h.us.deck=Array.from({length:6},(_,i)=>ref('sm10-20','pick'+i));trainer(h,'sm10-176');resolve(h);assert.equal(h.us.hand.length,2);assert.equal(new Set(h.us.hand.map(r=>r.uid)).size,2);assert.ok(h.us.hand.every(r=>Number(r.uid.slice(4))<4));assert.equal(h.us.deck.length,4);}finally{h.done();}});
 test(side+' Fairy Charm Lightning protects Fairy against Lightning GX damage',()=>{for(const protect of [false,true]){const h=setup(side,'sm9-33');try{h.us.active.energy={Lightning:3};h.them.active=slot('sm10-130',h.foe+'a');if(protect)h.them.active.tool=ref('sm10-172','charm');attack(h,'Tag Bolt-GX');resolve(h);assert.equal(h.them.active.damage,protect?0:200);}finally{h.done();}}});
}
