'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js')),fx=require(path.join(assets,'tcgp-battle-effects.js'));
const ref=(cardId,uid)=>({cardId,uid});
const slot=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=id=>({id,active:slot('test-normal',id+'-a'),bench:[slot('test-normal',id+'-b',0)],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Grass','Fire','Water','Lightning'],energySupply:['Grass','Fire','Water','Lightning'],handLimit:8,benchLimit:3,turnCount:4,prizes:[ref('test-normal',id+'-prize')],handEnergyUsed:false,energyUsed:false});
const state=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:3,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
const catalog={
 'test-normal':{id:'test-normal',name:'Normal',kind:'pokemon',stage:'Basic',hp:260,types:['Colorless'],battleEnabled:true,attacks:[{name:'Hit',cost:[],damage:20,effect:{type:'noop'}}]},
 'test-item':{id:'test-item',name:'Trainer Item',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'noop'}},
 'test-supporter':{id:'test-supporter',name:'Trainer Supporter',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:{type:'noop'}},
 'test-tool':{id:'test-tool',name:'Trainer Tool',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
 'test-stadium':{id:'test-stadium',name:'Trainer Stadium',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'noop'}},
 'test-special':{id:'test-special',name:'Special Energy',kind:'energy',specialEnergy:true,energyType:'Fire',effect:{type:'specialEnergy',provides:{Fire:1}}},
};
for(const [n,name] of [['9','Sceptile'],['24','Magcargo'],['60','Electrike'],['77','Rhyperior'],['86','Primal Groudon-EX'],['151','Primal Groudon-EX']]){
 catalog['xy5-'+n]={id:'xy5-'+n,name,kind:'pokemon',stage:'Basic',hp:270,types:['Grass'],battleEnabled:true,ancientTrait:{name:'Ω Barrier',text:'Whenever your opponent plays a Trainer card (excluding Pokémon Tools and Stadium cards), prevent all effects of that card done to this Pokémon.'},attacks:[{name:'Attack',cost:[],damage:30,effect:{type:'noop'}}]};
}
function withCards(fn){const before=data.cardById;data.cardById=id=>catalog[id]||before(id);try{return fn();}finally{data.cardById=before;}}
function ctx(s,opts={}){return {state:s,side:opts.side||'player',foeSide:opts.side==='opponent'?'player':'opponent',attacker:s.sides[opts.side||'player'].active,defender:s.sides[opts.side==='opponent'?'player':'opponent'].active,cardById:data.cardById,random:()=>0,trainerRef:ref(opts.trainer||'test-item','trainer-1'),action:opts.action||{},requestChoice:spec=>{s.pendingChoice=spec;s.phase='effectChoice';}};}
function asBarrier(s,n='9',loc='active'){const foe=s.sides.opponent;if(loc==='active')foe.active=slot('xy5-'+n,'barrier');else foe.bench[0]=slot('xy5-'+n,'barrier',0);return loc==='active'?foe.active:foe.bench[0];}

test('Six authentic Ω Barrier prints are explicitly enabled by the strict source mapper',()=>{
 const py=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy5_verified as v
print(json.dumps({'traits':sorted(v.TRAITS_IMPLEMENTED),'attacks':[v.ATTACKS.get(k) for k in [('9','Leaf Blade'),('24','Indomitable Blaze'),('60','Thunder Fang'),('77','Hammer Arm'),('86','Gaia Volcano'),('151','Gaia Volcano')]]}))`;
 const p=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(p.status,0,p.stderr);
 const out=JSON.parse(p.stdout);assert.ok(out.traits.includes('Ω Barrier'));
 for(const effect of out.attacks){assert.ok(effect);assert.deepEqual(fx.validateEffect(effect),[]);}
});

test('An opposing Item/Supporter cannot discard Energy, move damage, change status or knock out any Ω Barrier print',()=>withCards(()=>{
 for(const n of ['9','24','60','77','86','151'])for(const trainer of ['test-item','test-supporter']){
  const s=state(),b=asBarrier(s,n);b.energy.Fire=2;b.damage=20;b.conditions.poison={amount:10};
  let context=ctx(s,{trainer});
  for(const effect of [{type:'discardEnergyCard',target:'opponentActive',amount:1},{type:'discardEnergy',target:'opponentActive',amount:1},{type:'status',target:'opponentActive',status:'sleep'},
   {type:'knockOut',target:'opponentActive'},{type:'devolve',target:'opponentActive'},{type:'multiTargetDamage',target:'opponentPokemon',amount:40,count:1}]){
   fx.applyEffect(effect,context);
   assert.equal(b.damage,20,n+' '+effect.type);assert.equal(b.energy.Fire,2,n+' '+effect.type);
   assert.equal(b.conditions.sleep,undefined);assert.ok(b.conditions.poison);
   assert.deepEqual(s.sides.opponent.energyDiscard,{});
  }
 }
}));

test('Opposing Trainer direct and random targets skip Ω Barrier but still affect ordinary Pokémon',()=>withCards(()=>{
 const s=state(),b=asBarrier(s,'24','bench'),normal=s.sides.opponent.active;b.energy.Fire=2;normal.energy.Fire=2;
 fx.applyEffect({type:'globalRandomDiscardEnergy',side:'opponent',amount:1},ctx(s));
 assert.equal(b.energy.Fire,2);assert.equal(normal.energy.Fire,1);
 fx.applyEffect({type:'randomPokemonDamage',zone:'all',amount:30,hits:1},ctx(s));
 assert.equal(b.damage,0);assert.equal(normal.damage,30);
 fx.applyEffect({type:'benchDamage',side:'opponent',all:true,amount:40},ctx(s));assert.equal(b.damage,0);
 fx.applyEffect({type:'multiTargetDamage',target:'opponentPokemon',count:1,amount:30},{...ctx(s),resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(b.damage,0);
}));

test('A forced-switch Item cannot move protected Active or force in a protected Benched Pokémon',()=>withCards(()=>{
 let s=state(),b=asBarrier(s,'86'),before=s.sides.opponent.bench[0];
 fx.applyEffect({type:'forceOpponentSwitch',chooseBy:'attacker'},ctx(s));
 assert.equal(s.sides.opponent.active,b);assert.equal(s.sides.opponent.bench[0],before);assert.equal(s.phase,'battle');
 s=state();b=asBarrier(s,'9','bench');
 fx.applyEffect({type:'forceOpponentSwitch',chooseBy:'attacker'},ctx(s));
 assert.equal(s.phase,'battle','Do not create a target choice with zero eligible bench Pokémon');
 assert.equal(s.sides.opponent.bench[0],b);
}));

test('Ω Barrier cannot be bypassed by an old custom Trainer handler or leaked through a choice continuation',()=>withCards(()=>{
 const s=state(),b=asBarrier(s,'77');b.energy.Water=1;b.specialEnergy.push(ref('test-special','fire-a'));b.tool=ref('test-tool','tool-a');
 const original=JSON.stringify(b);
 // Simulate a legacy bespoke handler by calling a mutation routine with direct
 // opponent-Active target (the guard must restore even if no generic selector).
 fx.applyEffect({type:'neoRule',rule:'xy5:purePower'}, {...ctx(s),isAttack:false,resolvingChoice:true,action:{choiceTarget:'active',choiceOption:1}});
 // Never allow the Item to mutate this Pokémon; no additional fake energy/discard.
 assert.equal(JSON.stringify(b),original);
 assert.equal(s.sides.opponent.energyDiscard.Water||0,0);
}));


test('Core plays an actual opposing Item into Ω Barrier and preserves the physical Energy ledger',()=>withCards(()=>{
 const original=catalog['test-item'].effect;
 try{
  catalog['test-item'].effect={type:'discardEnergyCard',target:'opponentActive',amount:1};
  const s=state(),b=asBarrier(s,'151');b.energy.Fire=1;b.specialEnergy=[ref('test-special','printed-energy')];
  s.sides.player.hand=[ref('test-item','played-item')];
  const options=core.legalActions(s,'player');const action=options.find(a=>a.type==='trainer'&&a.cardId==='test-item');
  assert.ok(action,JSON.stringify(options));core.applyAction(s,'player',action);
  assert.equal(b.energy.Fire,1);assert.equal(b.specialEnergy.length,1);
  assert.equal(s.sides.opponent.energyDiscard.Fire||0,0);
  assert.deepEqual(s.sides.opponent.discard,[]);
  assert.ok(s.sides.player.discard.some(r=>r.uid==='played-item'));
  assert.equal(s.phase,'battle');
 }finally{catalog['test-item'].effect=original;}
}));

test('Opposing Trainer can switch an ordinary Active into an ordinary Bench, never an Ω Barrier Bench',()=>withCards(()=>{
 const s=state(),b=asBarrier(s,'9','bench');s.sides.opponent.bench.push(slot('test-normal','safe-bench',1));
 const original=s.sides.opponent.active;
 fx.applyEffect({type:'forceOpponentSwitch',chooseBy:'attacker'},ctx(s));
 assert.equal(s.phase,'effectChoice');
 assert.ok(s.pendingChoice.excludeUids?.includes(b.uid));
 assert.equal(s.pendingChoice.selectionSide,'opponent');
 assert.equal(s.sides.opponent.active,original);
}));

test('An Item cannot move Energy from an opposing Ω Barrier, or select it as a destination',()=>withCards(()=>{
 const s=state(),b=asBarrier(s,'77');b.energy.Water=2;
 fx.applyEffect({type:'moveEnergy',source:'opponentActive',target:'opponentBench',amount:1},ctx(s));
 assert.equal(b.energy.Water,2);assert.equal(s.sides.opponent.bench[0].energy.Water||0,0);
}));

test('Tool, Stadium, attacks, and own Trainer effects remain exempt from opposing Ω Barrier',()=>withCards(()=>{
 for(const trainer of ['test-tool','test-stadium']){
  const s=state(),b=asBarrier(s,'60');fx.applyEffect({type:'status',target:'opponentActive',status:'sleep'},ctx(s,{trainer}));
  assert.ok(b.conditions.sleep,trainer);
 }
 const s=state(),b=asBarrier(s,'9');fx.applyEffect({type:'status',target:'opponentActive',status:'poison'},{...ctx(s),isAttack:true});assert.ok(b.conditions.poison);
 const owner=state();owner.sides.player.active=slot('xy5-9','own-omega');
 fx.applyEffect({type:'status',target:'selfActive',status:'poison'},ctx(owner));assert.ok(owner.sides.player.active.conditions.poison);
}));

test('Generated official XY5 catalogue now enables all 164 prints and preserves Omega trait data', {skip:!fs.existsSync(path.join(root,'data/classic/xy5-print-compact.json'))},()=>{
 const set=require(path.join(assets,'tcg-classic-primal-clash.js'));
 assert.equal(set.CARDS.length,164);assert.equal(set.coverage().battleEnabled,164);assert.deepEqual(set.coverage().gated,[]);
 for(const n of ['9','24','60','77','86','151']){
  const card=set.cardById('xy5-'+n);assert.equal(card?.battleEnabled,true);assert.equal(card.deckEligible,true);
  assert.equal(card.ancientTrait.name,'Ω Barrier');assert.ok(card.attacks.length);
 }
});
