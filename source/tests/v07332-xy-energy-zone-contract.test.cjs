'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../app/src/main/assets');
const effects=require(path.join(base,'tcgp-battle-effects.js'));
const battleData=require(path.join(base,'tcg-classic-battle-data.js'));
const sourceCards={
 'xy1-133':{name:'Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire',subtype:'Fire'},
 'xy1-140':{name:'Fairy Energy',kind:'energy',basicEnergy:true,energyType:'Fairy',subtype:'Fairy'},
 'xy1-135':{name:'Lightning Energy',kind:'energy',basicEnergy:true,energyType:'Lightning',subtype:'Lightning'},
 'xy1-134':{name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'},
 'neo1-107':{name:'Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire',subtype:'Fire'},
 'neo1-111':{name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'},
 'neo1-109':{name:'Lightning Energy',kind:'energy',basicEnergy:true,energyType:'Lightning',subtype:'Lightning'},
 'xy1-116':{name:'Evosoda',kind:'trainer',trainerType:'Item'},
};
const cardById=id=>sourceCards[id]||battleData.cardById(id)||{name:id,kind:'pokemon',hp:130};
const ref=(cardId,uid)=>({cardId,uid});
const mon=(cardId,uid,benchSlot)=>({cardId,uid,benchSlot,stack:[cardId],energy:{},specialEnergy:[],conditions:{},damage:0,locks:[]});
function setup(types){
 const side=()=>({active:mon('xy1-27','active'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],energyUsed:false,handEnergyUsed:false,energyTypes:[],prizes:[],turnCount:4,handLimit:8,benchLimit:3});
 const state={format:'classic',phase:'battle',activeSide:'player',turnNumber:6,sides:{player:side(),opponent:side()},rngState:1,log:[],rules:{benchSize:3}};
 const player=state.sides.player;player.energySupply=[...types];player.nextEnergyType=types[0]||null;
 let pending=null,shuffles=0;
 function execute(e,action){
  pending=null;
  effects.applyEffect(e,{state,side:'player',foeSide:'opponent',attacker:player.active,defender:state.sides.opponent.active,cardById,random:()=>.1,
   resolvingChoice:!!action,action:action||{},shuffle:()=>{shuffles++},drawCard:()=>{},onEnergyAttached:()=>{},requestChoice:c=>{pending=c;}});
  return pending;
 }
 const start=rule=>execute({type:'neoRule',rule:'xy1:'+rule});
 const choose=index=>{assert.ok(pending, 'expected a selectable choice');const e=pending.effect;return execute(e,{choiceOption:index});};
 const done=()=>choose(pending.options.findIndex(x=>x==='Done'));
 return {state,player,start,choose,done,pending:()=>pending,shuffles:()=>shuffles};
}
test('Professor’s Letter searches ordered Zone, offers type choice, and puts up to two real Basic Energy cards into hand',()=>{
 const x=setup(['Fire','Water','Fire','Fairy']);const p=x.player;p.deck=[ref('xy1-116','physical-trainer')];
 let q=x.start('professorsLetter');assert.equal(q.kind,'option');
 assert.deepEqual(q.options,['Take Fire Basic Energy (Energy Zone)','Take Water Basic Energy (Energy Zone)','Take Fairy Basic Energy (Energy Zone)','Done']);
 q=x.choose(0);assert.equal(p.hand.length,1);assert.equal(p.hand[0].cardId,'neo1-107');assert.ok(p.hand[0].zoneGenerated);
 assert.deepEqual(p.energySupply,['Water','Fire','Fairy']);assert.equal(p.nextEnergyType,'Water');
 assert.ok(q.options[0].includes('Water Basic Energy'));
 x.choose(0);assert.deepEqual(p.hand.map(z=>z.cardId),['neo1-107','neo1-111']);
 assert.deepEqual(p.energySupply,['Fire','Fairy']);assert.equal(p.nextEnergyType,'Fire');
 assert.equal(p.active.energy.Fire,undefined);assert.equal(p.handEnergyUsed,false);assert.equal(p.energyUsed,false);
 assert.deepEqual(p.deck.map(r=>r.uid),['physical-trainer']);assert.equal(x.shuffles(),1);
});
test('Professor’s Letter preserves physical Energy UIDs and never silently prefers one source',()=>{
 const x=setup(['Water']);const p=x.player;p.deck=[ref('xy1-133','real-fire'),ref('xy1-116','other')];
 let q=x.start('professorsLetter');assert.equal(q.options.length,3);assert.ok(q.options[0].includes('draw deck'));
 q=x.choose(0);assert.equal(p.hand[0].uid,'real-fire');assert.deepEqual(p.energySupply,['Water']);
 assert.ok(q.options[0].includes('Water Basic Energy (Energy Zone)'));
 x.choose(0);assert.equal(p.hand[1].cardId,'neo1-111');assert.equal(p.energySupply.length,0);
 assert.deepEqual(p.deck.map(r=>r.uid),['other']);
});
test('Professor’s Letter supports immediate Done, partial search and eight-card hand cap',()=>{
 const x=setup(['Fire','Water']);const p=x.player;let q=x.start('professorsLetter');
 x.done();assert.equal(p.hand.length,0);assert.deepEqual(p.energySupply,['Fire','Water']);
 p.hand=Array.from({length:7},(_,i)=>ref('xy1-116','hand'+i));q=x.start('professorsLetter');
 x.choose(0);assert.equal(p.hand.length,8);assert.equal(x.pending(),null);assert.deepEqual(p.energySupply,['Water']);
});
test('Energy Salon can select three distinct Zone types including Fairy, never duplicate a type',()=>{
 const x=setup(['Fire','Fire','Water','Fairy']);const p=x.player;
 let q=x.start('energySalon');assert.equal(q.options.length,4); // three types + Done
 q=x.choose(0);assert.equal(p.hand.length,1);assert.equal(q.options.some(o=>o.startsWith('Take Fire')),false);
 q=x.choose(0);assert.equal(p.hand.length,2);assert.deepEqual(p.energySupply,['Fire','Fairy']);
 q=x.choose(0);assert.equal(p.hand.length,3);assert.equal(p.hand[2].cardId,'xy1-140');
 assert.equal(x.pending(),null);assert.deepEqual(p.energySupply,['Fire']);
});
test('Flame Charge and Energy Glide attach from Zone and consume actual ordered entries',()=>{
 const x=setup(['Fire','Lightning']);const p=x.player;
 let q=x.start('flameCharge');assert.ok(q.options[0].includes('Energy Zone'));
 x.choose(0);assert.equal(p.active.energy.Fire,1);assert.deepEqual(p.energySupply,['Lightning']);
 p.bench=[mon('xy1-11','bench0',0)];q=x.start('energyGlide');assert.ok(q.options[0].includes('Energy Zone'));
 q=x.choose(0);assert.equal(p.active.energy.Lightning,1);assert.equal(p.energySupply.length,0);
 assert.equal(q.kind,'pokemon');
});
test('Geomancy selects distinct Bench recipients and attaches Fairy from Zone, not from discard',()=>{
 const x=setup(['Fairy','Fairy','Fire']);const p=x.player;
 p.bench=[mon('xy1-11','bench0',0),mon('xy1-12','bench1',1)];
 let q=x.start('geomancy');assert.equal(q.options.length,2);
 q=x.choose(0);assert.equal(q.kind,'option');assert.ok(q.options[0].includes('Energy Zone'));
 q=x.choose(0);assert.equal(p.bench[0].energy.Fairy,1);assert.equal(q.kind,'option');
 q=x.choose(0);assert.ok(q.options[0].includes('Energy Zone'));
 x.choose(0);assert.equal(p.bench[1].energy.Fairy,1);
 assert.deepEqual(p.energySupply,['Fire']);assert.equal(p.nextEnergyType,'Fire');assert.deepEqual(p.energyDiscard,{});
});
