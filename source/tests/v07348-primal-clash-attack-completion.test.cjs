'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),
  core=require(path.join(assets,'tcgp-battle-core.js')),effects=require(path.join(assets,'tcgp-battle-effects.js'));
const ref=(cardId,uid)=>({cardId,uid});
const mk=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=w=>({id:w,active:mk('test-normal',w+'a'),bench:[mk('test-normal',w+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Water','Fire','Lightning'],energySupply:['Fire','Water','Lightning','Water'],handLimit:8,benchLimit:3,turnCount:5,prizes:[ref('test-normal',w+'p1')],handEnergyUsed:false,energyUsed:false});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
const catalog={
 'test-normal':{id:'test-normal',name:'Normal',kind:'pokemon',stage:'Basic',hp:300,types:['Colorless'],battleEnabled:true,attacks:[{name:'Kick',cost:[],damage:10,effect:{type:'noop'}},{name:'Jab',cost:[],damage:60,effect:{type:'noop'}}]},
 'test-fairy':{id:'test-fairy',name:'Fairy',kind:'pokemon',stage:'Basic',hp:180,types:['Fairy'],battleEnabled:true,attacks:[]},
 'test-fire':{id:'test-fire',name:'Fire Pokémon',kind:'pokemon',stage:'Basic',hp:180,types:['Fire'],battleEnabled:true,attacks:[]},
 'test-ex':{id:'test-ex',name:'EX Attacker',kind:'pokemon',stage:'Basic',hp:220,types:['Water'],pokemonEX:true,battleEnabled:true,attacks:[{name:'Hit',cost:[],damage:30,effect:{type:'noop'}}]},
 'test-special':{id:'test-special',name:'Double Colorless Energy',kind:'energy',specialEnergy:true,energyType:'Colorless',subtype:'Colorless',effect:{type:'specialEnergy',provides:{Colorless:2}},battleEnabled:true},
 'test-water-special':{id:'test-water-special',name:'Rainbow Energy',kind:'energy',specialEnergy:true,energyType:'Water',subtype:'Water',effect:{type:'specialEnergy',provides:{Water:1}},battleEnabled:true},
 'test-light-special':{id:'test-light-special',name:'Lightning Special',kind:'energy',specialEnergy:true,energyType:'Lightning',subtype:'Lightning',effect:{type:'specialEnergy',provides:{Lightning:1}},battleEnabled:true},
};
const attacks=[
 ['28','Spreading Flames',0,{type:'neoRule',rule:'xy5:spreadingFlames'}],
 ['40','Amnesia',20,{type:'chooseAttackLock',target:'opponentActive',duration:'opponentTurn'}],
 ['49','Shell Protection',0,{type:'neoRule',rule:'xy5:shellProtection'}],
 ['54','Giant Whirlpool',140,{type:'neoRule',rule:'xy5:giantWhirlpool'}],
 ['61','Electric Shock',60,{type:'sequence',effects:[{type:'discardEnergyCard',target:'self',amount:'all',energyType:'Lightning',strictEnergyType:true},{type:'status',target:'opponentActive',status:'paralysis'}]}],
 ['65','Electricannon',70,{type:'neoRule',rule:'xy5:electricannon'}],
 ['76','Rock Shower',0,{type:'neoRule',rule:'xy5:rockShower'}],
 ['88','Resistance Desert',0,{type:'neoRule',rule:'xy5:resistanceDesert'}],
 ['97','Dredge',0,{type:'neoRule',rule:'xy5:dredge'}],
 ['99','False Swipe',0,{type:'coinFlip',heads:{type:'setRemainingHp',target:'opponentActive',amount:10}}],
 ['107','Twister',80,{type:'neoRule',rule:'xy5:twister'}],
 ['101','Trick',0,{type:'neoRule',rule:'xy5:trick'}],
 ['114','Replace',0,{type:'neoRule',rule:'xy5:replace'}],
 ['108','Dragon Blast',150,{type:'sequence',effects:[{type:'discardEnergyCard',target:'self',amount:1,energyType:'Water',strictEnergyType:true},{type:'discardEnergyCard',target:'self',amount:1,energyType:'Lightning',strictEnergyType:true}]}],
];
for(const [n,name,damage,effect] of attacks)catalog['xy5-'+n]={id:'xy5-'+n,name:'Pokémon '+n,kind:'pokemon',stage:'Basic',hp:270,types:['Colorless'],battleEnabled:true,attacks:[{name,damage,cost:[],effect}]};
const withCards=fn=>{const was=data.cardById;data.cardById=id=>catalog[id]||was(id);try{return fn();}finally{data.cardById=was;}};
function use(s,side,selector){const list=core.legalActions(s,side),a=list.find(selector);assert.ok(a,'Expected legal action. Got '+JSON.stringify(list));core.applyAction(s,side,a);return a;}
const choose=(s,i=0)=>use(s,'player',a=>a.type==='effectChoice'&&a.choiceOption===i);
function attack(s,n,option){s.sides.player.active=mk('xy5-'+n,'attacker');return use(s,'player',a=>a.type==='attack'&&a.attackIndex===0&&(option==null||a.effectSelection===option));}

test('strict Stage 6 mappings are validated and include alternate Kyogre print',()=>{
 const py=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy5_verified as v
keys=[('28','Spreading Flames'),('40','Amnesia'),('49','Shell Protection'),('54','Giant Whirlpool'),('61','Electric Shock'),('65','Electricannon'),('76','Rock Shower'),('88','Resistance Desert'),('97','Dredge'),('99','False Swipe'),('101','Trick'),('107','Twister'),('108','Dragon Blast'),('114','Replace'),('148','Giant Whirlpool')]
print(json.dumps({'effects':[v.ATTACKS.get(k) for k in keys], 'traits':list(v.TRAITS_IMPLEMENTED)}))`;
 const r=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 const out=JSON.parse(r.stdout);for(const effect of out.effects){assert.ok(effect);assert.deepEqual(effects.validateEffect(effect),[]);}
 assert.ok(!out.traits.includes('Ω Barrier'),'Do not unlock Omega without a full protection audit');
});

test('Amnesia lets attacker choose the exact opponent attack and enforces next-turn lock',()=>withCards(()=>{
 const s=scene();attack(s,'40');assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'attack');
 use(s,'player',a=>a.type==='effectChoice'&&a.choiceAttackIndex===1);const d=s.sides.opponent.active;assert.ok(d.locks?.some(l=>l.attackName==='Jab'));
}));

test('Shell Protection prevents attacks <=50 but not a larger attack',()=>withCards(()=>{
 const s=scene();attack(s,'49');const defended=s.sides.player.active,attacker=s.sides.opponent.active;
 assert.ok(defended.attackGuard);assert.ok(effects.attackIsPrevented(s,'player',defended,attacker,data.cardById));
 assert.equal(defended.attackGuard.maxDamage,50);assert.equal(defended.attackGuard.effects,false);
}));

test('Resistance Desert blocks Pokémon-EX attacks but not a non-EX attack',()=>withCards(()=>{
 const s=scene();attack(s,'88');const defender=s.sides.player.active;
 assert.ok(!effects.attackIsPrevented(s,'player',defender,s.sides.opponent.active,data.cardById));
 assert.ok(effects.attackIsPrevented(s,'player',defender,mk('test-ex','ex'),data.cardById));
 assert.equal(defender.attackGuard.effects,true);
}));

test('Giant Whirlpool returns exactly two attached real Water units to hand, keeping others',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-54','ky');p.active.energy.Water=2;
 p.active.energy.Grass=1;p.active.specialEnergy=[ref('test-water-special','w-spec')];
 use(s,'player',a=>a.type==='attack');assert.equal(s.pendingChoice.options.length,3);
 choose(s,2);assert.ok(p.hand.some(ref=>ref.uid==='w-spec'));
 assert.equal(s.phase,'effectChoice');choose(s,0);
 assert.equal(p.active.energy.Water,1);assert.equal(p.active.energy.Grass,1);assert.equal(p.active.specialEnergy.length,0);
 assert.equal(p.hand.length,2);assert.equal(s.phase,'battle');
}));

test('Electric Shock discards all attached Lightning providers and Paralyzes defender',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('xy5-61','shocker');
 p.active.energy.Lightning=2;p.active.energy.Water=1;p.active.specialEnergy=[ref('test-light-special','spl'),ref('test-special','dce')];
 use(s,'player',a=>a.type==='attack');
 assert.equal(p.active.energy.Lightning,0);assert.equal(p.energyDiscard.Lightning,2);
 assert.equal(p.active.energy.Water,1);assert.deepEqual(p.active.specialEnergy.map(r=>r.uid),['dce']);
 assert.ok(p.discard.some(r=>r.uid==='spl'));assert.ok(f.active.conditions.paralysis);
}));

test('Electricannon offers optional discard before damage and consumes actual Lightning afterwards',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('xy5-65','ele');p.active.energy.Lightning=2;
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack');assert.equal(actions.length,2);
 assert.ok(actions.some(a=>a.effectSelection==='discard'));use(s,'player',a=>a.type==='attack'&&a.effectSelection==='discard');
 assert.equal(f.active.damage,120);assert.equal(p.active.energy.Lightning,0);assert.equal(p.energyDiscard.Lightning,2);
}));

test('Dredge selects two fresh Basic Energy from ordered Energy Zone and never silently creates deck cards',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.energySupply=['Grass','Water','Fire'];p.energyTypes=['Grass','Water','Fire'];
 attack(s,'97');assert.equal(s.pendingChoice.options.length,3);choose(s,0);assert.equal(s.phase,'effectChoice');
 assert.equal(p.active.energy.Grass,1);choose(s,0);assert.equal(p.active.energy.Water,1);
 assert.deepEqual(p.energySupply,['Fire']);assert.equal(s.phase,'battle');assert.equal(p.deck.length,0);
}));

test('Spreading Flames distributes three actually discarded Fire Energy across chosen Pokémon',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard.Fire=2;
 attack(s,'28');assert.equal(s.pendingChoice.options.length,3);
 choose(s,0);assert.equal(p.active.energy.Fire,1);choose(s,1);
 assert.equal(p.bench[0].energy.Fire,1);assert.equal(p.energyDiscard.Fire,0);assert.equal(s.phase,'battle');
}));

test('Rock Shower logs 3 coin flips and applies same damage to Active and Bench',()=>withCards(()=>{
 const s=scene();attack(s,'76');const log=s.log.find(e=>e.reason==='Rock Shower');assert.ok(log);assert.equal(log.results.length,3);
 const n=log.heads*20;assert.equal(s.sides.opponent.active.damage,n);assert.equal(s.sides.opponent.bench[0].damage,n);
}));

test('Twister flips twice and discards actual opponent Energy only for heads',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;foe.active.energy.Water=2;foe.active.specialEnergy=[ref('test-special','spe')];
 attack(s,'107');const log=s.log.find(e=>e.reason==='Twister');assert.ok(log);assert.equal(log.results.length,2);
 if(log.heads){assert.equal(s.phase,'effectChoice');choose(s,0);if(log.heads>1)choose(s,0);
   assert.equal(foe.energyDiscard.Water,log.heads);assert.equal(foe.active.energy.Water,2-log.heads);}
 else{assert.equal(foe.active.damage,0);assert.equal(s.phase,'battle');}
}));

test('Dragon Blast discards one Water and one Lightning after attack',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-108','dragon');p.active.energy.Water=2;p.active.energy.Lightning=1;
 use(s,'player',a=>a.type==='attack');assert.equal(p.active.energy.Water,1);assert.equal(p.active.energy.Lightning,0);
 assert.equal(p.energyDiscard.Water,1);assert.equal(p.energyDiscard.Lightning,1);
}));

test('Official generated print coverage and gating are checked by CI, not by an empty local stub',{skip:!fs.existsSync(path.join(root,'data/classic/xy5-print-compact.json'))},()=>{
 const primal=require(path.join(assets,'tcg-classic-primal-clash.js'));
 assert.equal(primal.CARDS.length,164);
 assert.equal(primal.coverage().battleEnabled,158,'Expected newly implemented physical-zone attacks and six remaining Omega-gated prints');
 assert.deepEqual(primal.coverage().gated.sort(),['xy5-9','xy5-24','xy5-60','xy5-77','xy5-86','xy5-151'].sort(),
   'Never silently unlock missing Omega protection or unresolved special effects');
 for(const n of ['28','40','49','54','61','65','76','88','97','99','101','107','108','114','148']){
  const c=primal.cardById('xy5-'+n);assert.ok(c?.battleEnabled,`Previously gated print ${n}: ${JSON.stringify(c?.support?.reasons)}`);
 }
 for(const c of primal.CARDS.filter(c=>c.ancientTrait?.name==='Ω Barrier'))assert.equal(c.battleEnabled,false,`${c.id} must remain gated`);
});


test('Trick moves an actual opponent Tool to another opponent Pokémon, preserving ownership',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;foe.active.tool=ref('test-special','tool-one');
 attack(s,'101');assert.equal(s.pendingChoice.options.length,1);choose(s,0); // choose opponent donor
 assert.equal(s.phase,'effectChoice');choose(s,0); // choose exact Tool
 assert.equal(s.phase,'effectChoice');choose(s,0); // opponent Bench recipient
 assert.equal(foe.active.tool,null);assert.equal(foe.bench[0].tool.uid,'tool-one');
 assert.equal(s.sides.player.discard.length,0);assert.equal(foe.discard.length,0);
 assert.ok(s.log.some(x=>x.type==='xy5Trick'&&x.ownerSide==='opponent'));
}));

test('Replace moves an actual Special Energy ref and one Basic Energy, then stops by choice',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-114','replace');
 p.active.energy.Water=2;p.active.specialEnergy=[ref('test-special','dce')];
 use(s,'player',a=>a.type==='attack');assert.equal(s.phase,'effectChoice');choose(s,0); // donor Active
 assert.equal(s.pendingChoice.options.length,2);choose(s,1); // chosen Special Energy
 choose(s,0);assert.equal(p.active.specialEnergy.length,0);assert.equal(p.bench[0].specialEnergy[0].uid,'dce');
 assert.equal(s.phase,'effectChoice');choose(s,0); // move again, choose Active donor
 choose(s,0);choose(s,0); // Basic Water -> Bench
 assert.equal(p.active.energy.Water,1);assert.equal(p.bench[0].energy.Water,1);
 assert.equal(s.phase,'effectChoice');choose(s,s.pendingChoice.options.length-1);assert.equal(s.phase,'battle');
}));

test('EX-only attack guard does not protect against non-EX side effects',()=>withCards(()=>{
 const s=scene();attack(s,'88');const defended=s.sides.player.active;
 assert.equal(effects.attackEffectsPrevented(s,'player',defended,mk('test-ex','ex'),data.cardById),true);
 assert.equal(effects.attackEffectsPrevented(s,'player',defended,mk('test-normal','normal'),data.cardById),false);
}));


test('Twister cannot discard a Fairy Pokémon’s Wonder Energy via attack effect',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;
 foe.active=mk('test-fairy','wonder');foe.active.energy.Water=2;
 foe.active.specialEnergy=[ref('xy5-144','real-wonder')];
 catalog['xy5-144']={id:'xy5-144',name:'Wonder Energy',kind:'energy',specialEnergy:true,energyType:'Fairy',subtype:'Fairy',effect:{type:'specialEnergy',provides:{Fairy:1}}};
 attack(s,'107');const log=s.log.find(l=>l.reason==='Twister');assert.ok(log);
 assert.equal(foe.energyDiscard.Water||0,0);assert.equal(foe.active.energy.Water,2);
 assert.equal(foe.active.specialEnergy[0].uid,'real-wonder');
}));

test('Mandatory Giant Whirlpool returns preserve the eight-card hand limit',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.handLimit=8;
 p.hand=Array.from({length:8},(_,i)=>ref('test-normal','held'+i));
 p.active=mk('xy5-54','ky');p.active.energy.Water=2;
 use(s,'player',a=>a.type==='attack');choose(s,0);choose(s,0);
 assert.equal(p.hand.length,8);
 assert.equal(p.hand.filter(r=>r.cardId==='neo1-111').length,2);
 assert.equal(p.deck.length,2);assert.equal(p.active.energy.Water,0);
}));
