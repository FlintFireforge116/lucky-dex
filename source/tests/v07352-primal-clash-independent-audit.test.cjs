'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcg-classic-battle-data.js')),
  fx=require(path.join(asset,'tcgp-battle-effects.js'));
const slot=(id,uid,benchSlot=null)=>({cardId:id,uid,benchSlot,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},playedOnSideTurn:1});
const side=id=>({id,active:slot('audit-normal',id+'-active'),bench:[slot('audit-normal',id+'-bench',0)],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:['Fire','Grass'],prizes:[],benchLimit:3,handLimit:8,turnCount:3});
const state=()=>({format:'classic',phase:'battle',turnNumber:7,activeSide:'player',rngState:7,sides:{player:side('player'),opponent:side('opponent')},log:[],modifiers:[]});
const catalog={
 'audit-normal':{id:'audit-normal',name:'Normal',kind:'pokemon',stage:'Basic',hp:250,types:['Colorless'],battleEnabled:true},
 'audit-item':{id:'audit-item',name:'Rope',kind:'trainer',trainerType:'Item',effect:{type:'neoRule',rule:'bw8:escapeRope'}},
 'audit-supporter':{id:'audit-supporter',name:'Targeted Switch',kind:'trainer',trainerType:'Supporter'},
 'xy5-9':{id:'xy5-9',name:'Sceptile',kind:'pokemon',stage:'Stage 2',hp:260,types:['Grass'],battleEnabled:true,ancientTrait:{name:'Ω Barrier'}},
 'xy5-86':{id:'xy5-86',name:'Primal Groudon-EX',kind:'pokemon',stage:'Stage 1',hp:260,types:['Fighting'],battleEnabled:true,ancientTrait:{name:'Ω Barrier'}},
};
function withCards(fn){const old=data.cardById;data.cardById=id=>catalog[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function ctx(s,extras={}){return {state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,
 cardById:data.cardById,random:()=>0.1,trainerRef:{uid:'rope',cardId:'audit-item'},action:extras.action||{},
 resolvingChoice:!!extras.resolvingChoice,requestChoice:spec=>{s.pendingChoice=spec;s.phase='effectChoice';}};}
const rope={type:'neoRule',rule:'bw8:escapeRope'};

test('Escape Rope: an unprotected Active can switch into Ω Barrier Bench; controller still switches',()=>withCards(()=>{
 const s=state(),omega=slot('xy5-9','protected-bench',0);s.sides.opponent.bench=[omega];
 fx.applyEffect(rope,ctx(s));assert.equal(s.pendingChoice?.effect?.stage,'opponent');
 assert.equal(s.pendingChoice.selectionSide,'opponent');
 const next=s.pendingChoice.effect;s.pendingChoice=null;s.phase='battle';
 fx.applyEffect(next,ctx(s,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}}));
 assert.equal(s.sides.opponent.active,omega,'Ω Barrier Bench is a legal promotion');
 assert.equal(s.pendingChoice?.effect?.stage,'self','Escape Rope must finish its other half');
 const final=s.pendingChoice.effect;s.pendingChoice=null;s.phase='battle';
 fx.applyEffect(final,ctx(s,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}}));
 assert.equal(s.sides.player.active.uid,'player-bench');
 assert.equal(s.sides.opponent.bench[0].uid,'opponent-active');
}));

test('Escape Rope: protected Active stays, but the Item still lets its controller switch',()=>withCards(()=>{
 const s=state(),protectedActive=slot('xy5-86','protected-active');s.sides.opponent.active=protectedActive;
 fx.applyEffect(rope,ctx(s));assert.equal(s.pendingChoice?.effect?.stage,'self');
 const final=s.pendingChoice.effect;s.pendingChoice=null;s.phase='battle';
 fx.applyEffect(final,ctx(s,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}}));
 assert.equal(s.sides.opponent.active,protectedActive);assert.equal(s.sides.player.active.uid,'player-bench');
}));

test('Defender-chosen switch can promote protected Bench; targeted supporter cannot select it',()=>withCards(()=>{
 const s=state(),omega=slot('xy5-9','protected-bench',0);s.sides.opponent.bench=[omega];
 const ownPick={type:'forceOpponentSwitch',chooseBy:'defender'};
 fx.applyEffect(ownPick,ctx(s));assert.equal(s.pendingChoice?.kind,'switchBench');
 const continuation=s.pendingChoice.effect;s.pendingChoice=null;s.phase='battle';
 fx.applyEffect(continuation,ctx(s,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}}));
 assert.equal(s.sides.opponent.active,omega);
 const another=state();another.sides.opponent.bench=[slot('xy5-9','protected-bench',0)];
 fx.applyEffect({type:'forceOpponentSwitch',chooseBy:'attacker'},
  {...ctx(another),trainerRef:{uid:'supporter',cardId:'audit-supporter'}});
 assert.equal(another.pendingChoice,undefined,'opponent-controlled switching cannot target Ω Barrier Bench');
}));

test('Straight Claw option describes the printed 60 base damage, not 20',()=>{
 const s=state(),attack={type:'neoRule',rule:'xy5:straightClaw'};
 const opts=fx.choicesForEffect(attack,ctx(s));
 assert.ok(opts?.[0]?.choiceLabel.includes('60 damage'),JSON.stringify(opts));
 assert.ok(!opts[0].choiceLabel.includes('20 damage'));
});

test('Autobuilder reserves matching Spirit Links and legal Zone-to-hand Trainers before filler',()=>{
 const s=fs.readFileSync(path.join(asset,'tcg-classic-deck-builder.js'),'utf8');
 for(const id of ['xy5-123','xy5-130','xy5-131','xy5-132'])assert.ok(s.includes(`'${id}'`));
 assert.match(s,/xy5SpiritLinks/);assert.match(s,/xy5HandEnergyNeeds/);
 for(const id of ['xy5-8','xy5-26'])assert.ok(s.includes(`'${id}'`));
 assert.match(s,/energyToHandRules/);assert.match(s,/Zone attachments alone/);
 assert.doesNotMatch(s,/missing-=add\(energy/,'must never add ineligible Basic Energy to the 30-card deck');
});
