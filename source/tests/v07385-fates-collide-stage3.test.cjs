'use strict';
// Fates Collide Stage 3: exact player/CPU selections and physical-card effects.
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const py=String.raw`import json,sys;sys.path.insert(0,sys.argv[1]);import xy10_verified as m
print(json.dumps({'attacks':{n+':'+t:e for (n,t),e in m.ATK.items()},'trainers':{n:effect for n,(kind,effect) in m.TRAINERS.items()},'abilities':m.ABILITIES}))`;
const res=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(res.status,0,res.stderr);
const m=JSON.parse(res.stdout);
function make(){
 const cards={
  c:{id:'c',kind:'pokemon',name:'Carbink',types:['Fighting'],stage:'Basic',abilities:[{name:'Safeguard',type:'passive',effect:m.abilities.Safeguard.effect}]},
  ex:{id:'ex',kind:'pokemon',name:'Generic-EX',stage:'Basic',pokemonEX:true,types:['Psychic'],attacks:[]},
  non:{id:'non',kind:'pokemon',name:'Normal',stage:'Basic',types:['Psychic'],attacks:[]},
  mega:{id:'mega',kind:'pokemon',name:'M Normal-EX',stage:'Stage 1',megaEvolution:true,tags:['mega-evolution'],types:['Psychic'],attacks:[]},
  kit:{id:'kit',name:'Fossil Excavation Kit',kind:'trainer',trainerType:'Item'},
  dome:{id:'dome',name:'Dome Fossil Kabuto',kind:'trainer',trainerType:'Item'},
  helix:{id:'helix',name:'Helix Fossil Omanyte',kind:'trainer',trainerType:'Item'},
  amber:{id:'amber',name:'Old Amber Aerodactyl',kind:'trainer',trainerType:'Item'},
  misc:{id:'misc',name:'Mysterious Stone',kind:'trainer',trainerType:'Item'},
  basic:{id:'basic',name:'Basic example',kind:'pokemon',stage:'Basic',types:['Grass'],attacks:[]}
 };
 const slot=(cardId,uid,benchSlot=0)=>({uid,cardId,benchSlot,stack:[cardId],energy:{},specialEnergy:[],conditions:{},damage:0,tool:null});
 const p={active:slot('c','p0'),bench:[],deck:[],discard:[],hand:[],prizes:[],energyDiscard:{},energySupply:[],turnCount:3};
 const o={active:slot('non','o0'),bench:[],deck:[],discard:[],hand:[],prizes:[],energyDiscard:{},energySupply:[],turnCount:3};
 const state={format:'classic',turnNumber:8,activeSide:'player',phase:'battle',sides:{player:p,opponent:o},log:[]};
 const choices=[],ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,random:()=>0.1,shuffle:()=>{},requestChoice:spec=>choices.push(spec),drawCard(ss){const c=ss.deck.shift();if(c)ss.hand.push(c);},isAttack:false};
 return {cards,slot,p,o,state,ctx,choices};
}
test('Every Stage 3 effect and passive passes the shared validator',()=>{
 for(const [key,e] of Object.entries(m.attacks))assert.deepEqual(fx.validateEffect(e),[],key);
 for(const [key,e] of Object.entries(m.trainers))assert.deepEqual(fx.validateEffect(e),[],key);
 for(const [key,a] of Object.entries(m.abilities))assert.deepEqual(fx.validateEffect(a.effect),[],key);
 assert.deepEqual(m.attacks['55:Endgame'],m.attacks['119:Endgame'],'full art inherits the identical effect');
});
test('Carbink Safeguard protects both attack damage and secondary effects from EX, only while unsuppressed',()=>{
 const s=make();s.o.active=s.slot('ex','ex0');
 assert.ok(fx.attackIsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById));
 assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById),true);
 s.p.active.abilitySuppressed=true;
 assert.equal(fx.attackIsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById),null);
 assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById),false);
 s.p.active.abilitySuppressed=false;s.o.active=s.slot('non','n0');
 assert.equal(fx.attackIsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById),null);
});
test('Mega Catcher offers only opposing Benched Mega Evolution and rejects a forged ordinary EX target',()=>{
 const s=make();s.o.bench=[s.slot('ex','exBench',0),s.slot('mega','megaBench',1)];
 fx.applyEffect(m.trainers['104'],s.ctx);
 assert.equal(s.choices.length,1);assert.deepEqual(s.choices[0].filter,{tag:'mega-evolution'});
 fx.applyEffect(m.trainers['104'],{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(s.o.active.uid,'o0');
 fx.applyEffect(m.trainers['104'],{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:1}});
 assert.equal(s.o.active.uid,'megaBench');
 const s2=make();s2.o.bench=[s2.slot('ex','exBench',0)];fx.applyEffect(m.trainers['104'],s2.ctx);
 assert.equal(s2.choices.length,0);
});
test('Fossil Excavation Kit recovers exactly two selected named physical Fossil Items, not another Item',()=>{
 const s=make();const card=(cardId,uid)=>({cardId,uid});s.p.discard=[card('misc','m1'),card('dome','d1'),card('helix','h1'),card('amber','a1')];
 fx.applyEffect(m.trainers['101'],s.ctx);
 assert.equal(s.choices.length,1);assert.equal(s.choices[0].kind,'discardCard');
 assert.deepEqual(s.choices[0].filter.name,['Helix Fossil Omanyte','Dome Fossil Kabuto','Old Amber Aerodactyl']);
 fx.applyEffect(m.trainers['101'],{...s.ctx,resolvingChoice:true,action:{choiceDiscardIndex:0}});
 assert.deepEqual(s.p.hand,[],'unrelated Item cannot be retrieved');
 fx.applyEffect(m.trainers['101'],{...s.ctx,resolvingChoice:true,action:{choiceDiscardIndex:1}});
 assert.deepEqual(s.p.hand.map(x=>x.uid),['d1']);
 assert.equal(s.choices.at(-1).effect.remaining,1);
 fx.applyEffect({...m.trainers['101'],remaining:1},{...s.ctx,resolvingChoice:true,action:{choiceDiscardIndex:1}});
 assert.deepEqual(s.p.hand.map(x=>x.uid),['d1','h1']);assert.deepEqual(s.p.discard.map(x=>x.uid),['m1','a1']);
});
test('Ultra Ball uses existing real two-card hand-discard selection before taking exactly one Pokémon from deck',()=>{
 const s=make(),card=(cardId,uid)=>({cardId,uid});s.p.hand=[card('misc','m1'),card('kit','k1'),card('helix','h1')];s.p.deck=[card('basic','poke'),card('misc','m2')];
 fx.applyEffect(m.trainers['113'],s.ctx);assert.equal(s.choices.at(-1).kind,'handCard');
 fx.applyEffect({...m.trainers['113'],stage:'discard',remaining:2},{...s.ctx,resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.deepEqual(s.p.discard.map(x=>x.uid),['m1']);assert.equal(s.choices.at(-1).kind,'handCard');
 fx.applyEffect({...m.trainers['113'],stage:'discard',remaining:1},{...s.ctx,resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.deepEqual(s.p.discard.map(x=>x.uid),['m1','k1']);assert.equal(s.choices.at(-1).kind,'deckCard');
 fx.applyEffect({...m.trainers['113'],stage:'search'},{...s.ctx,resolvingChoice:true,action:{choiceDeckIndex:0}});
 assert.deepEqual(s.p.hand.map(x=>x.uid),['h1','poke']);assert.deepEqual(s.p.deck.map(x=>x.uid),['m2']);
 const empty=make();empty.p.hand=[card('misc','m1')];empty.p.deck=[card('basic','p1')];fx.applyEffect(m.trainers['113'],empty.ctx);
 assert.equal(empty.choices.length,0,'cannot play without two cards to discard');
});
test('Endgame same-turn real damage KO check is present in the Classic Prize award path',()=>{
 const src=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8');
 for(const re of [/const xy10Endgame=awardsPrize/,/source\.uid===attacker\?\.uid/,/Number\(source\.damage\|\|0\)>0/,/foe\.lastAttackName==='Endgame'/,/card\?\.megaEvolution===true\?2:0/])assert.match(src,re);
 // Cross-era Prize modifiers can be added between older terms. Assert that
 // Endgame still contributes and BW9 Life Dew still subtracts in the live
 // Prize formula, rather than enforcing fragile literal adjacency.
 const prizeFormula=src.match(/const prizeCount=awardsPrize\?Math\.max\(0,([^;\n]+)\):0;/)?.[1];
 assert.ok(prizeFormula,'Classic Prize formula must be present');
 assert.match(prizeFormula,/\+xy10Endgame\b/,'XY10 Endgame bonus must still contribute to Prizes');
 assert.match(prizeFormula,/-bw9LifeDew\b/,'BW9 Life Dew must still reduce Prizes');
 assert.match(prizeFormula,/\+sm2Extra\b/,'SM2 delayed Prize bonus must remain in the calculation');
});
test('Fossil Excavation Kit is prohibited as trainer filler without a viable Fossil evolution line',()=>{
 const src=fs.readFileSync(path.join(root,'app/src/main/assets/tcg-classic-deck-builder.js'),'utf8');
 assert.match(src,/Fossil Excavation Kit/);assert.match(src,/orphanFossilSupport/);
});
test('Umbreon Veil of Darkness discards only selected physical cards, then draws exactly as many',()=>{
 const s=make(),card=(cardId,uid)=>({cardId,uid});
 s.p.hand=[card('misc','m1'),card('kit','k1'),card('dome','d1')];
 s.p.deck=[card('basic','draw1'),card('basic','draw2'),card('basic','draw3')];
 const e=m.attacks['55:Veil of Darkness'];assert.deepEqual(e,m.attacks['119:Veil of Darkness']);
 fx.applyEffect(e,s.ctx);assert.equal(s.choices.at(-1).kind,'handCard');
 fx.applyEffect(e,{...s.ctx,resolvingChoice:true,action:{choiceHandIndex:1}});
 assert.deepEqual(s.p.discard.map(x=>x.uid),['k1']);assert.equal(s.choices.at(-1).optional,true);
 fx.applyEffect({...e,discarded:1},{...s.ctx,resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.deepEqual(s.p.discard.map(x=>x.uid),['k1','m1']);
 fx.applyEffect({...e,discarded:2},{...s.ctx,resolvingChoice:true,action:{choiceSkip:true}});
 assert.deepEqual(s.p.hand.map(x=>x.uid),['d1','draw1','draw2']);
 assert.deepEqual(s.p.deck.map(x=>x.uid),['draw3']);
 const no=make();no.p.hand=[card('misc','m1')];no.p.deck=[card('basic','x1')];
 fx.applyEffect(e,{...no.ctx,resolvingChoice:true,action:{choiceSkip:true}});
 assert.deepEqual(no.p.hand.map(x=>x.uid),['m1'],'optional zero discards should draw nothing');
});

test('Stage 3 six official print slots generate as FULL/playable, including full-art Umbreon',()=>{
 const code=String.raw`import importlib.util,json,sys
from pathlib import Path
root=Path(sys.argv[1]);sys.path.insert(0,str(root/'scripts'))
spec=importlib.util.spec_from_file_location('build_xy10',root/'scripts'/'build-xy10.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
umbreon=['55','Umbreon-EX','Pokémon',['Basic','EX'],'170',['Darkness'],None,[
 ['Veil of Darkness',['D'],'20','Discard as many cards as you like from your hand. Then, draw that many cards.'],
 ['Endgame',['D','C','C'],'70','If your opponent Mega Evolution Pokémon is Knocked Out by damage from this attack, take 2 more Prize cards.']],[],
 'Fighting','Psychic',2,'Rare Holo EX',[],None,None]
carbink=['50','Carbink','Pokémon',['Basic'],'90',['Fighting'],None,[['Power Gem',['F','C','C'],'40','']],
 [['Safeguard','Ability','Prevent all effects of attacks, including damage, done to this Pokémon by your opponent Pokémon-EX.']],
 'Grass',None,1,'Rare',[],None,None]
def trainer(number,name):return [number,name,'Trainer',['Item'],None,[],None,[],[],None,None,0,'Uncommon',[],None,None]
alt=umbreon.copy();alt[0]='119'
rows=[carbink,umbreon,trainer('101','Fossil Excavation Kit'),trainer('104','Mega Catcher'),trainer('113','Ultra Ball'),alt]
prints=mod.generate(rows)
print(json.dumps({'ids':[x['number'] for x in prints],'disabled':[x['number'] for x in prints if not x['battleEnabled']],
 'trainerTypes':[x['trainerType'] for x in prints if x['kind']=='trainer'],
 'umbreonAttacks':[a['name'] for a in prints[1]['attacks']]}))`;
 const result=spawnSync('python3',['-c',code,root],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const report=JSON.parse(result.stdout);
 assert.deepEqual(report.ids,['50','55','101','104','113','119']);
 assert.deepEqual(report.disabled,[]);
 assert.deepEqual(report.trainerTypes,['Item','Item','Item']);
 assert.deepEqual(report.umbreonAttacks,['Veil of Darkness','Endgame']);
});
