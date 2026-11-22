'use strict';
// Independent XY9 audit. Test actual state, rules across evolution, and
// declaration vs post-damage timing. Do not duplicate stage release fixtures.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(id,uid,extra={})=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{},...extra});
function scene(extra={}){
 const cards={
  mega:{id:'mega',name:'Meganium',kind:'pokemon',stage:'Stage 2',hp:150,types:['Grass'],abilities:[{name:'Overgrow',type:'passive',effect:{type:'modifier',stat:'attackDamage',amount:70,scope:'self',duration:'whileInPlay',condition:{type:'selfRemainingHpAtMost',amount:50}}}]},
  basic:{id:'basic',name:'Basic',kind:'pokemon',stage:'Basic',hp:120,retreat:2,types:['Water']},
  stage:{id:'stage',name:'Stage',kind:'pokemon',stage:'Stage 1',hp:120,retreat:3,types:['Fire']},
  rat:{id:'rat',name:'Raticate',kind:'pokemon',stage:'Stage 1',hp:70,abilities:[{name:'Antibodies',type:'passive',effect:{type:'preventStatus',duration:'whileInPlay',scope:'self',clearExisting:true}}]},
  'xy9-89':{id:'xy9-89',name:'Raticate BREAK',kind:'pokemon',stage:'BREAK',breakEvolution:true,upgradeInheritance:'previous',hp:110,abilities:[]},
  garbo:{id:'garbo',name:'Garbodor',kind:'pokemon',stage:'Stage 1',hp:100,abilities:[{name:'Garbotoxin',type:'passive',effect:{type:'abilitySuppression',duration:'whileInPlay',scope:'both',condition:{type:'selfHasTool'}}}]},
  tool:{id:'tool',name:'Tool',kind:'trainer',trainerType:'Tool',effect:{type:'noop'}},
  special:{id:'special',name:'Special Water',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Water:1}}},
  ...extra
 };
 const p={active:slot('basic','pA'),bench:[slot('stage','pB',{benchSlot:0})],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[{uid:'p1'}],turnCount:2};
 const o={active:slot('basic','oA'),bench:[slot('stage','oB',{benchSlot:0})],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[{uid:'o1'}],turnCount:2};
 const state={format:'classic',turnNumber:7,activeSide:'player',phase:'battle',sides:{player:p,opponent:o},log:[]};
 const choices=[];const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,isAttack:true,cardById:id=>cards[id]||null,requestChoice:x=>choices.push(x),random:()=>.1};
 return {cards,p,o,state,ctx,choices,byId:ctx.cardById,choose:(e,a)=>fx.applyEffect(e,{...ctx,resolvingChoice:true,action:a})};
}
test('Meganium Overgrow starts at 50 HP remaining, not at 50 damage, and boosts only itself',()=>{
 const s=scene();s.p.active=slot('mega','meg',{damage:99});assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'attackDamage',s.byId),0);
 s.p.active.damage=100;assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'attackDamage',s.byId),70);
 assert.equal(fx.modifierAmount(s.state,'player',s.p.bench[0],'attackDamage',s.byId),0);
 s.p.active.damage=110;assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'attackDamage',s.byId),70);
});
test('Golduck BREAK Hyper Transfer moves one Basic Energy between real Pokémon without generating extra Energy',()=>{
 const s=scene();s.p.active.energy={Water:2};const eff={type:'redistributeEnergy',includeSpecialEnergy:false};
 fx.applyEffect(eff,s.ctx);assert.equal(s.choices.pop()?.kind,'energySource');
 s.choose(eff,{choiceTarget:'active',effectEnergyType:'Water'});
 const q=s.choices.pop();assert.equal(q?.kind,'pokemon');
 s.choose(q.effect,{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(s.p.active.energy.Water,1);assert.equal(s.p.bench[0].energy.Water,1);assert.equal(s.p.discard.length,0);
 const cont=s.choices.pop();assert.equal(cont.kind,'option');
 s.choose(cont.effect,{choiceOption:1});
 assert.equal(s.p.active.energy.Water+s.p.bench[0].energy.Water,2);
});
test('Golduck BREAK Hyper Transfer cannot move Special Energy',()=>{
 const s=scene();s.p.active.specialEnergy=[{uid:'special1',cardId:'special',provides:{Water:1}}];
 const eff={type:'redistributeEnergy',includeSpecialEnergy:false};fx.applyEffect(eff,s.ctx);
 assert.equal(s.choices.length,0);assert.equal(s.p.active.specialEnergy.length,1);assert.equal(s.p.bench[0].specialEnergy.length,0);
});
test('Raticate BREAK retains Antibodies after BREAK evolution; Garbotoxin disables it while Tool is equipped',()=>{
 const s=scene();s.p.active=slot('xy9-89','r',{stack:['rat','xy9-89']});
 assert.equal(fx.statusIsPrevented(s.state,s.p.active,s.byId,'poison'),true);
 s.o.bench.push(slot('garbo','g',{benchSlot:1,tool:{uid:'t',cardId:'tool'}}));
 assert.equal(fx.statusIsPrevented(s.state,s.p.active,s.byId,'poison'),false);
 s.o.bench.at(-1).tool=null;
 assert.equal(fx.statusIsPrevented(s.state,s.p.active,s.byId,'poison'),true);
});
test('Ferrothorn Spike Lash damage uses each defender Retreat Cost; the Active is not double-hit',()=>{
 const s=scene();s.o.active=slot('basic','foe',{damage:0});s.o.bench=[slot('stage','bench',{benchSlot:0})];
 const attack=fx.resolveAttack({name:'Spike Lash',damage:0,effect:{type:'neoRule',rule:'xy9:spikeLash'}},{...s.ctx,defender:s.o.active});
 assert.equal(attack.damage,20);
 fx.applyEffect({type:'neoRule',rule:'xy9:spikeLash'},{...s.ctx,defender:s.o.active});
 assert.equal(s.o.active.damage,0,'Active receives normal attack damage in battle engine, not a duplicate pending hit');
 assert.equal(s.o.bench[0].damage,30);
 assert.equal(s.p.bench[0].damage,0);
});
test('Antibodies removes existing Poison after Garbotoxin loses its Tool, not while suppressed',()=>{
 const s=scene();s.p.active=slot('rat','r',{conditions:{poison:{amount:10},burn:true}});
 const garbo=slot('garbo','g',{benchSlot:1,tool:{uid:'tool1',cardId:'tool'}});s.o.bench.push(garbo);
 fx.applyContinuousRules(s.state,s.byId);
 assert.ok(s.p.active.conditions.poison,'suppression must prevent Antibodies from clearing');
 garbo.tool=null;fx.applyContinuousRules(s.state,s.byId);
 assert.deepEqual(s.p.active.conditions,{},'existing conditions clear immediately when Ability resumes');
});
test('Raticate BREAK inherits the restored Antibodies continuous cleanup',()=>{
 const s=scene();s.p.active=slot('xy9-89','rb',{stack:['rat','xy9-89'],conditions:{poison:{amount:10}}});
 const garbo=slot('garbo','g',{benchSlot:1,tool:{uid:'tool1',cardId:'tool'}});s.o.bench.push(garbo);
 fx.applyContinuousRules(s.state,s.byId);assert.ok(s.p.active.conditions.poison);
 garbo.tool=null;fx.applyContinuousRules(s.state,s.byId);
 assert.deepEqual(s.p.active.conditions,{});
});

test('printed Antibodies mapping explicitly opts into clearing existing conditions',()=>{
 const {spawnSync}=require('node:child_process'),path=require('node:path');
 const run=spawnSync('python3',['-c',"import sys;sys.path.insert(0,sys.argv[1]);from xy9_verified import ABILITIES;print(ABILITIES['Antibodies']['effect'].get('clearExisting'))",path.join(__dirname,'../scripts')],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);assert.equal(run.stdout.trim(),'True');
});
