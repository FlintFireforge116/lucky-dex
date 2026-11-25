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
// Official FAQ: a different Ability remains available, but V Transformation itself remains used.
for(const side of ['player','opponent']){
 test(side+' transformed Indeedee V can use Watch Over exactly once',()=>{for(const id of ['swsh45-50','swsh45sv-SV118']){const h=setup(side,id);try{h.us.active.damage=50;h.us.discard=[ref('swsh45-39','indeedee')];use(h,'ability');choice(h,a=>a.choiceCardId==='swsh45-39');assert.equal(h.us.active.cardId,'swsh45-39');use(h,'ability');resolve(h);assert.equal(h.us.active.damage,30);assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));}finally{h.done();}}});
 test(side+' another Ditto V cannot repeat V Transformation in the same turn',()=>{const h=setup(side,'swsh45-50');try{h.us.discard=[ref('swsh45sv-SV118','shiny'),ref('swsh45-39','indeedee')];use(h,'ability');choice(h,a=>a.choiceCardId==='swsh45sv-SV118');assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));h.us.turnCount++;assert.ok(core.legalActions(h.s,side).some(a=>a.type==='ability'));}finally{h.done();}});
 test(side+' transformation discards underlying Pokemon and does not trigger Dark Asset',()=>{const h=setup(side,'swsh45-50');try{h.us.active.stack=['bw7-108','swsh45-50'];h.us.discard=[ref('swsh45-44','crobat')];use(h,'ability');choice(h,a=>a.choiceCardId==='swsh45-44');assert.deepEqual(h.us.active.stack,['swsh45-44']);assert.deepEqual(h.us.discard.map(r=>r.cardId).sort(),['bw7-108','swsh45-50'].sort());assert.equal(h.us.hand.length,0);assert.notEqual(h.s.phase,'effectChoice');}finally{h.done();}});
 test(side+' transformed Crobat retains eligibility to evolve this turn',()=>{const h=setup(side,'swsh45-50');try{h.us.discard=[ref('swsh45-44','crobat')];h.us.hand=[ref('swsh45-45','vmax')];use(h,'ability');choice(h,a=>a.choiceCardId==='swsh45-44');use(h,'evolve',a=>a.target==='active');assert.equal(h.us.active.cardId,'swsh45-45');}finally{h.done();}});
}
