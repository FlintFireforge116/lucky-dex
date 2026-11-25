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
const sets=[require('../app/src/main/assets/tcg-classic-rebel-clash.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
for(const side of ['player','opponent']){
 test(side+' Screen Cleaner never blocks Blizzard bench damage',()=>{const h=setup(side,'swsh2-48');try{h.us.active.energy={Water:3,Colorless:2};h.them.bench[0]=Object.assign(slot('swsh2-38','rime',{Water:1}),{benchSlot:0});attack(h,'Blizzard');resolve(h);assert.equal(h.them.bench[0].damage,10);}finally{h.done();}});
 test(side+' Screen Cleaner never blocks Max Bullet bench damage',()=>{const h=setup(side,'swsh2-50');try{h.us.active.energy={Water:3,Colorless:2};h.them.bench[0]=Object.assign(slot('swsh2-38','rime',{Water:1}),{benchSlot:0});attack(h,'Max Bullet');resolve(h);assert.equal(h.them.bench[0].damage,60);}finally{h.done();}});
 test(side+' Drag Off without an opposing Bench cannot damage original Active',()=>{const h=setup(side,'swsh2-121');try{h.us.active.energy={Darkness:2,Colorless:2};h.them.bench=[];attack(h,'Drag Off');resolve(h);assert.equal(h.them.active.damage,0);}finally{h.done();}});
 test(side+' Drag Off switches first and deals 30 to the selected new Active',()=>{const h=setup(side,'swsh2-121');try{h.us.active.energy={Darkness:2,Colorless:2};const old=h.them.active,chosen=h.them.bench[0];attack(h,'Drag Off');resolve(h);assert.equal(h.them.active.uid,chosen.uid);assert.equal(chosen.damage,30);assert.equal(old.damage,0);}finally{h.done();}});
 for(const key of ['ex16ChillingBreathUntil','founjaNoHandUntil'])test(side+' Nugget respects '+key,()=>{const h=setup(side,'swsh2-49');try{h.them[key]=8;h.them.deck.unshift(ref('swsh2-162','nugget'));core.endTurn(h.s);assert.equal(h.s.phase,'battle');assert.ok(h.them.hand.some(r=>r.uid==='nugget'));}finally{h.done();}});
 test(side+' Nugget respects opposing ex5-100 Item prohibition',()=>{const h=setup(side,'ex5-100');try{h.them.deck.unshift(ref('swsh2-162','nugget'));core.endTurn(h.s);assert.equal(h.s.phase,'battle');assert.ok(h.them.hand.some(r=>r.uid==='nugget'));}finally{h.done();}});
 test(side+' Training Court recovers ledger basic Energy without touching Zone',()=>{const h=setup(side,'swsh2-49');try{h.s.stadium={cardId:'swsh2-169',uid:'court',ownerSide:side};h.us.energyDiscard={Water:1};const supply=h.us.energySupply.slice();use(h,'stadiumAction');resolve(h);assert.equal(h.us.energyDiscard.Water,0);assert.ok(h.us.hand.some(x=>data.cardById(x.cardId)?.basicEnergy&&data.cardById(x.cardId)?.subtype==='Water'));assert.deepEqual(h.us.energySupply,supply);}finally{h.done();}});
 test(side+' Scoop Up Net cannot remove the only Pokemon in play',()=>{const h=setup(side,'swsh2-22');try{h.us.bench=[];h.us.hand=[ref('swsh2-165','net')];assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='trainer'&&a.cardId==='swsh2-165'));}finally{h.done();}});
 test(side+' Top Entry is not offered on a full Bench',()=>{const h=setup(side,'swsh2-49');try{h.them.benchLimit=3;h.them.bench=[0,1,2].map(i=>Object.assign(slot('swsh2-1','full'+i),{benchSlot:i}));h.them.deck.unshift(ref('swsh2-8','entry'));core.endTurn(h.s);assert.equal(h.s.phase,'battle');assert.ok(h.them.hand.some(r=>r.uid==='entry'));}finally{h.done();}});
 test(side+' Neutralizing Gas stops suppressing when moved to Bench',()=>{const h=setup(side,'swsh2-135');try{h.them.active.cardId='swsh2-113';assert.equal(fx.modifierAmount(h.s,side,h.us.active,'damageReduction',data.cardById),0);[h.them.active,h.them.bench[0]]=[h.them.bench[0],h.them.active];h.them.bench[0].benchSlot=0;assert.equal(fx.modifierAmount(h.s,side,h.us.active,'damageReduction',data.cardById),30);}finally{h.done();}});
}
