'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm11-54'){
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
const set=require('../app/src/main/assets/tcg-classic-unified-minds.js');
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
    if(a.name==='Black Lance')h.them.bench.push({...slot('sm10-20',h.foe+'gx'),benchSlot:1});
    const actions=core.legalActions(h.s,side).filter(x=>x.type==='attack'&&x.attackIndex===idx);
    assert.ok(actions.length,'no legal attack');core.applyAction(h.s,side,actions[0]);
    let steps=0;while(h.s.phase==='effectChoice'&&steps++<100){const who=h.s.choiceSide||side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'empty choice');core.applyAction(h.s,who,(steps>20?choices.find(x=>x.choiceSkip):null)||choices.find(x=>!x.choiceSkip)||choices[0]);}
    assert.notEqual(h.s.phase,'effectChoice','stuck effect choice');count++;
   }catch(e){failures.push(`${c.id} ${a.name}: ${e.message}`);}finally{h.done();}
  }
  assert.deepEqual(failures,[]);assert.equal(count,set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });

}
function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<40){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}

for(const side of ['player','opponent']){
 test(side+' Tandem Shock requires actual bench-to-active movement this turn',()=>{for(const moved of [false,true]){const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:3};if(moved)h.us.active.movedToActiveTurn=h.s.turnNumber;attack(h,'Tandem Shock');resolve(h);assert.equal(h.them.active.damage,moved?160:80);assert.equal(!!h.them.active.conditions.paralysis,moved);}finally{h.done();}}});
 test(side+' Lightning Ride GX uses typed extra Energy and switches',()=>{for(const extra of [false,true]){const h=setup(side,'sm11-54');try{h.us.active.energy=extra?{Lightning:5}:{Lightning:2,Colorless:3};attack(h,'Lightning Ride-GX');resolve(h);assert.equal(h.them.active.damage,extra?250:150);assert.equal(h.us.active.uid,side+'b');}finally{h.done();}}});
 test(side+' Trap Bolt uses remaining HP',()=>{for(const low of [false,true]){const h=setup(side,'sm11-67');try{h.us.active.energy={Fighting:1};h.them.active.damage=low?950:0;attack(h,'Trap Bolt');resolve(h);if(!low)assert.equal(h.them.active.damage,60);else assert.equal(h.them.active.damage,980);}finally{h.done();}}});
 test(side+' Hapu keeps two selected top-six cards and discards the other four',()=>{const h=setup(side,'sm11-54');try{const top=h.us.deck.slice(0,6).map(x=>x.uid);trainer(h,'sm11-200');resolve(h);assert.equal(h.us.hand.length,2);assert.ok(h.us.hand.every(x=>top.includes(x.uid)));assert.equal(h.us.discard.filter(x=>top.includes(x.uid)).length,4);assert.equal(h.us.deck.length,9);}finally{h.done();}});
 test(side+' Coach Trainer gives four cards only with active TAG TEAM',()=>{for(const tag of [false,true]){const h=setup(side,tag?'sm11-54':'sm11-67');try{trainer(h,'sm11-192');resolve(h);assert.equal(h.us.hand.length,tag?4:2);}finally{h.done();}}});
 test(side+' Cherish Ball searches only GX Pokémon',()=>{const h=setup(side);try{h.us.deck=[ref('sm11-54','gx'),ref('sm11-67','normal'),ref('sm11-192','trainer2')];trainer(h,'sm11-191');resolve(h);assert.deepEqual(h.us.hand.map(x=>x.uid),['gx']);}finally{h.done();}});
}
