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
    if(c.name==='Latios-GX'){h.us.benchLimit=5;h.us.bench.push({...slot('sm6-1',side+'b3'),benchSlot:3});h.s.stadium={cardId:'xy6-89',uid:'sky-field',owner:side};}
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
for(const side of ['player','opponent']){
 test(side+' Perfection borrows only own benched or discarded EX/GX attacks at printed cost',()=>{const h=setup(side,'sm11-71');try{h.us.bench[0].cardId='sm11-54';h.us.discard=[ref('sm11-47','discard-gx'),ref('sm11-67','discard-basic')];h.us.hand=[ref('sm11-78','hand-gx')];h.them.discard=[ref('sm11-126','enemy-gx')];h.us.active.energy={Lightning:3};const choices=core.attackOptions(h.s,side);assert.ok(choices.some(x=>x.cardId==='sm11-54'&&x.attack.name==='Tandem Shock'));assert.ok(choices.some(x=>x.cardId==='sm11-47'));assert.ok(!choices.some(x=>['sm11-67','sm11-78','sm11-126'].includes(x.cardId)));const a=core.legalActions(h.s,side).find(x=>x.type==='attack'&&x.attackCardId==='sm11-54'&&x.attackIndex===0);assert.ok(a);core.applyAction(h.s,side,a);resolve(h);assert.equal(h.them.active.damage,80);}finally{h.done();}});
 test(side+' Latios Power Bind needs five Pokemon, Clear Vision permanently locks opponent GX',()=>{const h=setup(side,'sm11-78');try{assert.equal(core.legalActions(h.s,side).filter(x=>x.type==='attack').length,0);h.s.stadium={cardId:'xy6-89',uid:'sky',ownerSide:side};for(let i=1;i<4;i++)h.us.bench.push({...slot('sm6-1',side+'b'+i),benchSlot:i});h.them.active=slot('sm11-54',h.foe+'gx',{Lightning:5});attack(h,'Clear Vision-GX');resolve(h);assert.equal(h.them.sm11GxLocked,true);const actions=core.legalActions(h.s,h.foe);assert.ok(actions.some(a=>a.type==='attack'&&a.attackIndex===0));assert.ok(!actions.some(a=>a.type==='attack'&&a.attackIndex===1));}finally{h.done();}});
 test(side+' Spiteful Sigh places counters on self and deals twice their amount',()=>{const h=setup(side,'sm11-38');try{h.us.active.energy={Water:1};use(h,'attack',a=>a.attackIndex===0&&String(a.effectSelection)==='3');resolve(h);assert.equal(h.us.active.damage,30);assert.equal(h.them.active.damage,60);}finally{h.done();}});
 test(side+' Discerning Spear can attack an undamaged target but does no damage',()=>{const h=setup(side,'sm11-142');try{h.us.active.energy={Metal:1};attack(h,'Discerning Spear');resolve(h);assert.equal(h.them.active.damage,0);}finally{h.done();}});
 test(side+' Reset Stamp redraws according to remaining Prizes',()=>{const h=setup(side);try{h.them.prizes.length=2;h.them.hand=[ref('sm6-1','old1'),ref('sm6-1','old2'),ref('sm6-1','old3')];trainer(h,'sm11-206');resolve(h);assert.equal(h.them.hand.length,2);assert.equal(h.them.deck.length,16);}finally{h.done();}});
}
