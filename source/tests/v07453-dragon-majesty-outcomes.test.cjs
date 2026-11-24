'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm75-1'){
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
const set=require('../app/src/main/assets/tcg-classic-dragon-majesty.js');
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
    h.us.energyDiscard={Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;
    h.them.hand=[ref('sm6-108','foe-judge'),ref('sm6-112','foe-tool')];
    h.them.bench[0].specialEnergy=[ref('sm6-118','foe-unit')];
    if(['Psychic Abduction','Bawl'].includes(a.name)){h.s.firstSide=h.foe;h.us.turnCount=1;h.s.turnNumber=2;}
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
const fire=data.CARDS.find(c=>c.basicEnergy&&c.subtype==='Fire').id;
for(const side of ['player','opponent']){
 test(side+' Kingdra Hydro Pump includes Rainbow-provided Water',()=>{const h=setup(side,'sm75-18');try{h.us.active.energy={Water:2};h.us.active.specialEnergy=[ref('sm7-151','rainbow')];attack(h,'Hydro Pump');assert.equal(h.them.active.damage,160);}finally{h.done();}});
 test(side+' Maelstrom hits only opposing Active and Bench',()=>{const h=setup(side,'sm75-18');try{h.us.active.energy={Water:3};attack(h,'Maelstrom-GX');assert.equal(h.them.active.damage,40);assert.equal(h.them.bench[0].damage,40);assert.equal(h.us.active.damage,0);assert.equal(h.us.bench[0].damage,0);}finally{h.done();}});
 test(side+' Euphoria heals all own Pokemon',()=>{const h=setup(side,'sm75-41');try{h.us.active.energy={...allEnergy};h.us.active.damage=80;h.us.bench[0].damage=30;attack(h,'Euphoria-GX');assert.equal(h.us.active.damage,0);assert.equal(h.us.bench[0].damage,0);assert.equal(h.them.active.damage,0);}finally{h.done();}});
 test(side+' Dragonporter benches actual Dragon evolution cards from discard',()=>{const h=setup(side,'sm75-37');try{h.us.active.energy={...allEnergy};h.us.bench=[];h.us.discard=[ref('sm75-36','dragonair'),ref('sm75-40','altaria'),ref('sm75-54','kommo'),ref('sm75-1','notDragon')];attack(h,'Dragonporter-GX');resolve(h);assert.deepEqual(h.us.bench.map(p=>p.uid).sort(),['altaria','dragonair','kommo']);assert.deepEqual(h.us.discard.map(r=>r.uid),['notDragon']);}finally{h.done();}});
 test(side+' Flame Charge attaches real deck Fire, not unrelated Energy',()=>{const h=setup(side,'sm75-11');try{h.us.active.energy={Fire:1};h.us.energySupply=[];h.us.deck=[ref(fire,'fire1'),ref(fire,'fire2'),ref('sm75-1','mon')];attack(h,'Flame Charge');resolve(h);assert.equal(h.us.active.energy.Fire,3);assert.ok(!h.us.deck.some(r=>r.uid==='fire1'||r.uid==='fire2'));}finally{h.done();}});
 test(side+' Vermilion consumes Fire in hand and permits split attachment',()=>{const h=setup(side,'sm75-11');try{h.us.active.energy={Fire:4};h.us.hand=[ref(fire,'fire1'),ref(fire,'fire2'),ref('sm75-1','keep')];attack(h,'Vermilion-GX');choice(h,a=>a.choiceTarget==='active');choice(h,a=>a.choiceTarget==='bench');assert.equal(h.us.active.energy.Fire,5);assert.equal(h.us.bench[0].energy.Fire,1);assert.deepEqual(h.us.hand.map(r=>r.uid),['keep']);}finally{h.done();}});
 test(side+' Fight Song stacks with alternate-art print',()=>{const h=setup(side,'sm75-37');try{h.us.active.energy={...allEnergy};h.us.bench=[{...slot('sm75-40','one'),benchSlot:0},{...slot('sm75-40a','two'),benchSlot:1}];attack(h,'Dragon Claw');assert.equal(h.them.active.damage,110);}finally{h.done();}});
 test(side+' Blaine is playable only as last card and draws twice per Fire Pokemon',()=>{const h=setup(side,'sm75-1');try{h.us.bench=[{...slot('sm75-4','fireBench'),benchSlot:0}];h.us.hand=[ref('sm75-58','trainer'),ref('sm75-1','extra')];assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='trainer'&&a.cardId==='sm75-58'));h.us.hand.pop();use(h,'trainer',a=>a.cardId==='sm75-58');assert.equal(h.us.hand.length,4);}finally{h.done();}});
 test(side+' Fiery Flint discards two chosen cards before recovering real deck Fire',()=>{const h=setup(side);try{h.us.energySupply=[];h.us.hand=[ref('sm75-60','trainer'),ref('sm75-1','cost1'),ref('sm75-4','cost2')];h.us.deck=[ref(fire,'f1'),ref(fire,'f2'),ref(fire,'f3'),ref(fire,'f4'),ref('sm75-1','keep')];use(h,'trainer',a=>a.cardId==='sm75-60');resolve(h);assert.equal(h.us.hand.filter(r=>data.cardById(r.cardId)?.basicEnergy).length,4);assert.ok(h.us.discard.some(r=>r.uid==='cost1'));assert.ok(h.us.discard.some(r=>r.uid==='cost2'));}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Burning Fighter takes Fire only from the five revealed deck cards',()=>{const h=setup(side,'sm75-1');try{h.us.hand=[ref('sm75-2','evolution')];h.us.deck=[ref(fire,'fire1'),ref('sm75-1','discard1'),ref(fire,'fire2'),ref('sm75-4','discard2'),ref('sm75-1','discard3'),ref(fire,'unrevealed')];let old=h.us.active.energy.Fire||0;use(h,'evolve',a=>a.cardId==='sm75-2');choice(h,a=>a.choiceOption===1);assert.equal(h.us.active.cardId,'sm75-2');assert.equal(h.us.active.energy.Fire,old+2);assert.deepEqual(h.us.discard.map(r=>r.uid).sort(),['discard1','discard2','discard3']);assert.deepEqual(h.us.deck.map(r=>r.uid),['unrevealed']);}finally{h.done();}});
 test(side+' Resolute Flame adds 30 for each opposing GX/EX only',()=>{const h=setup(side,'sm75-3');try{h.us.active.energy={...allEnergy};h.them.bench=[{...slot('sm75-11','gx'),benchSlot:0},{...slot('sm6-95','gx2'),benchSlot:1},{...slot('sm75-1','basic'),benchSlot:2}];attack(h,'Fiery Blast');assert.equal(h.them.active.damage,Number(set.cardById('sm75-3').attacks[0].damage)+60);}finally{h.done();}});
 test(side+' Firestarter takes real Fire Energy from discard and only targets Bench',()=>{const h=setup(side,'sm75-6');try{h.us.discard=[ref(fire,'recover')];use(h,'ability');choice(h,a=>a.choiceTarget==='bench');assert.equal(h.us.bench[0].energy.Fire,1);assert.ok(!h.us.discard.some(r=>r.uid==='recover'));}finally{h.done();}});
 test(side+' Switch Raft heals the outgoing Water Pokemon only',()=>{const h=setup(side,'sm75-15');try{h.us.active.damage=50;const old=h.us.active;h.us.bench[0].damage=20;trainer(h,'sm75-62');choice(h,a=>a.choiceTarget==='bench');assert.equal(h.us.active.damage,20);assert.equal(old.damage,20);assert.equal(h.us.bench[0].uid,old.uid);}finally{h.done();}});
 test(side+' Lance requires last-turn knockout, benches Dragon evolutions and goes to Lost Zone',()=>{const h=setup(side);try{h.us.hand=[ref('sm75-61','lance')];h.us.bench=[];h.us.deck=[ref('sm75-36','one'),ref('sm75-54','two'),ref('sm75-1','keep')];assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='trainer'&&a.cardId==='sm75-61'));h.us.lastKnockoutTurn=h.s.turnNumber-1;use(h,'trainer',a=>a.cardId==='sm75-61');resolve(h);assert.deepEqual(h.us.bench.map(p=>p.uid).sort(),['one','two']);assert.ok(h.us.lostZone.some(x=>x.uid==='lance'));assert.ok(!h.us.discard.some(x=>x.uid==='lance'));}finally{h.done();}});
 test(side+' Rough Skin and Dragon Talon both retaliate after attack damage',()=>{const h=setup(side,'sm75-37');try{h.us.active.energy={...allEnergy};h.them.active=slot('sm75-45','defender');h.them.active.tool=ref('sm75-59','talon');attack(h,'Dragon Claw');assert.equal(h.us.active.damage,60);}finally{h.done();}});
 test(side+' Wela Volcano Park leaves burn after a heads recovery flip',()=>{const h=setup(side,'sm75-1');try{trainer(h,'sm75-63');h.us.active.conditions.burn=true;h.s.rngState=1;use(h,'endTurn');assert.equal(h.us.active.damage,20);assert.ok(h.us.active.conditions.burn);assert.ok(h.s.log.some(x=>x.type==='coin'&&x.status==='burn'&&x.heads));}finally{h.done();}});
}
