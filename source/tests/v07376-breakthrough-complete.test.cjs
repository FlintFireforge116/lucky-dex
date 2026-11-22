'use strict';
// BREAKthrough completion: verify physical choices, flexible Energy, reactive
// passive rules and the future build-time generated 165-print coverage gate.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const py=src=>{const r=spawnSync('python3',['-c',src,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
const mons={a:{id:'a',name:'Haxorus',kind:'pokemon',types:['Dragon'],subtype:'Dragon',stage:'Stage 2',retreat:2,hp:170},
 b:{id:'b',name:'Raichu',kind:'pokemon',types:['Lightning'],subtype:'Lightning',stage:'Stage 1',retreat:1,hp:140},
 c:{id:'c',name:'Florges',kind:'pokemon',types:['Fairy'],subtype:'Fairy',stage:'Stage 2',retreat:2,hp:150},
 e:{id:'e',name:'basic Fire',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
 l:{id:'l',name:'basic Lightning',kind:'energy',basicEnergy:true,subtype:'Lightning',energyType:'Lightning'},
 p:{id:'p',name:'Basic Pokémon',kind:'pokemon',stage:'Basic',hp:80},
 ex:{id:'ex',name:'Basic Pokémon-EX',kind:'pokemon',stage:'Basic',pokemonEX:true,hp:180},
 item:{id:'item',name:'Item',kind:'trainer',trainerType:'Item'},
 'xy8-151':{id:'xy8-151',name:'Burning Energy',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Fire:1}}},
 'xy8-152':{id:'xy8-152',name:'Rainbow Energy',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Miracle:1}}},
 'xy8-145':{id:'xy8-145',name:'Parallel City',kind:'trainer',trainerType:'Stadium'}};
function slot(id,uid,extra={}){return {uid,cardId:id,benchSlot:null,energy:{},specialEnergy:[],conditions:{},damage:0,...extra};}
function scene(){const one=slot('a','one'),two=slot('b','two');const player={active:one,bench:[],deck:[],hand:[],discard:[],energySupply:[],energyDiscard:{},prizes:[],handLimit:8,benchLimit:3},opponent={active:two,bench:[],deck:[],hand:[],discard:[],energySupply:[],energyDiscard:{},prizes:[],handLimit:8,benchLimit:3};const state={sides:{player,opponent},format:'classic',turnNumber:12,activeSide:'player',log:[],rngState:123};const picked=[];const ctx={state,side:'player',foeSide:'opponent',attacker:one,defender:two,cardById:id=>mons[id]||null,random:()=>0.1,shuffle:()=>{},drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},benchCard:(ss,r)=>{const x=slot(r.cardId,r.uid,{benchSlot:ss.bench.length});ss.bench.push(x);return x;},onEnergyAttached:()=>{},requestChoice:q=>picked.push(q),isAttack:true};return {state,player,opponent,one,two,ctx,picked};}
function apply(x,key,extra={}){fx.applyEffect({type:'neoRule',rule:'xy8:'+key,...extra},x.ctx);return x.picked.at(-1);}
function choose(x,q,action){x.picked.length=0;fx.applyEffect(q.effect,{...x.ctx,action,resolvingChoice:true});return x.picked.at(-1);}
const ref=(id,uid)=>({cardId:id,uid});
test('All newly mapped XY8 effects validate as real supported engine effects',()=>{
 const found=py(`import sys,json;sys.path.insert(0,sys.argv[1]);import xy8_verified as v
print(json.dumps({'attacks':list(v.ATTACKS.values()),'abilities':[a['effect'] for a in v.ABILITIES.values()],'trainers':[t[1] for t in v.TRAINERS.values()],'energy':list(v.ENERGIES.values()),'mapped':len(v.ATTACKS)}))`);
 assert.ok(found.mapped>=115);
 for(const e of [...found.attacks,...found.abilities,...found.trainers,...found.energy])assert.deepEqual(fx.validateEffect(e),[],JSON.stringify(e));
});
test('Seaking and Xerneas reuse the real healed-this-turn predicate',()=>{
 const x=scene(),a=x.ctx.attacker;
 const spell={name:'Soaking Horn',damage:40,effect:{type:'bonusDamage',amount:80,condition:{type:'xy8HealedThisTurn'}}};
 assert.equal(fx.resolveAttack(spell,x.ctx).damage,40);
 a.xy8HealedTurn=x.state.turnNumber;assert.equal(fx.resolveAttack(spell,x.ctx).damage,120);
 x.state.turnNumber++;assert.equal(fx.resolveAttack(spell,x.ctx).damage,40);
});
test('Dragon Dance is a +100 active-only modifier, not indefinitely stackable',()=>{
 const x=scene();x.one.cardId='xy8-111';mons['xy8-111']={...mons.a,id:'xy8-111'};
 apply(x,'dragonDance');apply(x,'dragonDance');
 assert.equal(fx.modifierAmount(x.state,'player',x.one,'attackDamage',x.ctx.cardById),100);
});
test('Parallel City orientation applies the -20 only to selected affected side and types',()=>{
 const x=scene();x.state.stadium={cardId:'xy8-145',ownerSide:'player',xy8BenchSide:'player',xy8DamageSide:'opponent'};
 mons.b.types=['Fire'];assert.equal(fx.modifierAmount(x.state,'opponent',x.two,'attackDamage',x.ctx.cardById),-20);
 assert.equal(fx.modifierAmount(x.state,'player',x.one,'attackDamage',x.ctx.cardById),0);
 x.state.stadium.xy8DamageSide='player';mons.a.types=['Water'];assert.equal(fx.modifierAmount(x.state,'player',x.one,'attackDamage',x.ctx.cardById),-20);
});
test('Damage Change swaps actual counters without adding base damage',()=>{
 const x=scene();x.one.damage=60;x.two.damage=20;apply(x,'damageChange');assert.equal(x.one.damage,20);assert.equal(x.two.damage,60);
});
test('Heavy Perfume adds six-counter confusion and obeys existing Special Conditions engine',()=>{
 const x=scene();apply(x,'heavyPerfume');assert.equal(x.two.conditions.confusion.selfDamage,60);
});
test('Overhead Throw explicitly selects one own Benched Pokémon for its 20 self-team damage',()=>{
 const x=scene(),target=slot('b','target',{benchSlot:0});x.player.bench=[target];const q=apply(x,'overheadThrow');assert.equal(q.kind,'pokemon');assert.equal(q.includeActive,false);
 choose(x,q,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(target.damage,20);assert.equal(x.one.damage,0);
});
test('Magnetic Circuit selects a physical Lightning card and attaches without consuming normal attachment',()=>{
 const x=scene();x.player.hand=[ref('l','l1')];x.player.handEnergyUsed=false;const q=apply(x,'magneticCircuit');assert.equal(q.kind,'handCard');
 const p=choose(x,q,{choiceHandIndex:0});assert.equal(p.kind,'pokemon');choose(x,p,{choiceTarget:'active'});
 assert.equal(x.one.energy.Lightning,1);assert.equal(x.player.hand.length,0);assert.equal(x.player.handEnergyUsed,false);
});
test('Energy Color coin heads attaches one actual physical Basic Energy from deck',()=>{
 const x=scene();x.player.deck=[ref('e','energy-1')];const q=apply(x,'energyColor');assert.equal(q.kind,'energyTarget');
 choose(x,q,{choiceTarget:'active',effectEnergyType:'Fire'});
 assert.equal(x.one.energy.Fire,1);assert.equal(x.player.deck.length,0);
});
test('Parasect Colorful Spores uses three different Basic Energy types and unique targets',()=>{
 const x=scene();const p1=slot('b','bench-1',{benchSlot:0}),p2=slot('c','bench-2',{benchSlot:1});x.player.bench=[p1,p2];
 x.player.deck=[ref('e','f1'),ref('l','l1'),ref('e','f2')];x.player.energySupply=['Water'];
 let q=apply(x,'colorfulSpores');assert.equal(q.kind,'energyTarget');
 q=choose(x,q,{choiceTarget:'active',effectEnergyType:'Fire'});assert.equal(q.kind,'energyTarget');assert.ok(q.excludeUids.includes('one'));
 q=choose(x,q,{choiceTarget:'bench',choiceBenchIndex:0,effectEnergyType:'Lightning'});assert.equal(q.kind,'energyTarget');
 choose(x,q,{choiceTarget:'bench',choiceBenchIndex:1,effectEnergyType:'Water'});
 assert.equal(x.one.energy.Fire,1);assert.equal(p1.energy.Lightning,1);assert.equal(p2.energy.Water,1);
});
test('Reserved Ticket moves the selected physical card to deck top after coin flip',()=>{
 const x=scene();x.player.deck=[ref('p','p1'),ref('item','i1')];const q=apply(x,'reservedTicket');assert.equal(q.kind,'deckCard');
 choose(x,q,{choiceDeckIndex:1});assert.equal(x.player.deck[0].uid,'i1');assert.equal(x.player.deck.length,2);
});
test('Super Rod only selects Pokémon/basic Energy; selected physical card is returned to deck',()=>{
 const x=scene();x.player.discard=[ref('p','p1'),ref('e','e1'),ref('item','t1'),ref('xy8-151','special')];const q=apply(x,'superRod');
 assert.equal(q.kind,'discardCard');assert.deepEqual(q.allowedKinds,['pokemon','energy']);assert.equal(q.basicEnergyOnly,true);
 choose(x,q,{choiceDiscardIndex:0});assert.equal(x.player.deck[0].uid,'p1');assert.equal(x.player.discard.length,3);
});
test('Buddy-Buddy Rescue makes opponent choose their own discarded Pokémon first',()=>{
 const x=scene();x.opponent.discard=[ref('p','opp1')];x.player.discard=[ref('p','own1')];const q=apply(x,'buddyBuddyRescue');
 assert.equal(q.discardZone,'opponent');assert.equal(q.selectionSide,'opponent');
 const q2=choose(x,q,{choiceDiscardIndex:0});assert.equal(x.opponent.hand[0].uid,'opp1');assert.equal(q2.kind,'discardCard');
 choose(x,q2,{choiceDiscardIndex:0});assert.equal(x.player.hand[0].uid,'own1');
});
test('Town Map turns all remaining physical Prize cards face up',()=>{
 const x=scene();x.player.prizes=[ref('p','pr1'),ref('p','pr2')];apply(x,'townMap');assert.ok(x.player.prizes.every(r=>r.faceUp));
});
test('Rainbow Energy is ONE flexible Energy unit and Burning Energy is Fire-only',()=>{
 const x=scene();assert.equal(fx.canPayCost({Miracle:1},'G'),true);assert.equal(fx.canPayCost({Miracle:1},'GG'),false);
 const items=py(`import sys,json;sys.path.insert(0,sys.argv[1]);import xy8_verified as v;print(json.dumps(v.ENERGIES))`);
 assert.deepEqual(items['152'].provides,{Miracle:1});assert.deepEqual(items['151'].attachOnlyTypes,['Fire']);
});
test('Physical Energy, Stadium, Tool and pending attack completion hooks are present in core',()=>{
 const src=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 assert.match(src,/xy8BurningEnergyReturn/);assert.match(src,/card\.id==='xy8-151'&&!mon\?\.types\?\.includes\('Fire'\)/);
 assert.match(src,/xy8DamageSide/);assert.match(src,/xy8BenchSide/);
 assert.match(src,/card\.id==='xy8-141'&&Number/);
 // The shared hook must accept XY8 and newer Rainbow Energy printings.
 // Do not lock this test to the final ID in a string: future sets will extend it.
 const rainbowHook=src.match(/if\(\[([^\]\n]+)\]\.includes\(card\.id\)\)\{\s*target\.damage=Number\(target\.damage\|\|0\)\+10;/);
 assert.ok(rainbowHook,'Rainbow Energy hand attachment must add 10 damage');
 assert.match(rainbowHook[1],/'xy8-152'/);
 assert.match(rainbowHook[1],/'sm1-137'/);
 assert.match(src,/p\.excludeUids\|\|\[\]\)\.includes\(slot\.uid\)/);
});

test('Actual core resolves Rainbow damage, Fire-only Burning Energy and Heavy Boots HP',()=>{
 const data=require(path.join(assets,'tcgp-battle-data.js')),core=require(path.join(assets,'tcgp-battle-core.js'));
 const orig=data.cardById;
 const fake={
  fire:{id:'fire',name:'Fire Test',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:130,types:['Fire'],retreat:3,attacks:[{name:'Fire Hit',cost:'R',damage:40,effect:{type:'noop'}}]},
  water:{id:'water',name:'Water Test',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:130,types:['Water'],retreat:3,attacks:[{name:'Poke',cost:'C',damage:10,effect:{type:'noop'}}]},
  'xy8-151':{id:'xy8-151',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Fire:1},attachOnlyTypes:['Fire']}},
  'xy8-152':{id:'xy8-152',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Miracle:1}}},
  'sm1-137':{id:'sm1-137',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Miracle:1}}},
  'xy8-141':{id:'xy8-141',name:'Heavy Boots',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'modifier',stat:'maxHp',amount:20,scope:'self',duration:'whileInPlay',condition:{type:'selfRetreatCostAtLeast',amount:3}}}
 };
 data.cardById=id=>fake[id]||orig(id);
 const mon=(id,uid)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{},tool:null,extraTools:[],playedOnSideTurn:0});
 const battle=(id,hand)=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:3,rngState:1,log:[],rules:{winMode:'prizes',benchSize:3},sides:{
  player:{active:mon(id,'active'),bench:[],hand:hand.map((cardId,i)=>({uid:'hand-'+i,cardId})),deck:[],discard:[],prizes:[],energyDiscard:{},energySupply:[],energyTypes:['Fire'],turnCount:3,benchLimit:3,energyAvailable:true,energyUsed:false},
  opponent:{active:mon('water','foe'),bench:[],hand:[],deck:[],discard:[],prizes:[],energyDiscard:{},energySupply:[],energyTypes:['Water'],turnCount:2,benchLimit:3,energyAvailable:true,energyUsed:false}
 }});
 try{
  let s=battle('fire',['xy8-152']),action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial');assert.ok(action);
  core.applyAction(s,'player',action);assert.equal(s.sides.player.active.damage,10);
  assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Miracle,1);
  // Sun & Moon Rainbow Energy uses the same physical-card hook; neither
  // energy should be mistaken for a generated Energy Zone unit.
  s=battle('fire',['sm1-137']);action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial');assert.ok(action);
  core.applyAction(s,'player',action);assert.equal(s.sides.player.active.damage,10);
  assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Miracle,1);
  assert.deepEqual(s.sides.player.active.specialEnergy.map(x=>x.cardId),['sm1-137']);
  s=battle('water',['xy8-151']);assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attachSpecial'),'Burning cannot attach to Water');
  s=battle('fire',['xy8-141']);s.sides.player.active.conditions.confusion=true;
  action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.target==='active');assert.ok(action);
  core.applyAction(s,'player',action);assert.equal(s.sides.player.active.conditions.confusion,undefined);
  assert.equal(core.maxHp(s,'player',s.sides.player.active),150);
 }finally{data.cardById=orig;}
});
test('Actual core reattaches the original Burning Energy ref only after its own Fire attack discards it',()=>{
 const data=require(path.join(assets,'tcgp-battle-data.js')),core=require(path.join(assets,'tcgp-battle-core.js')),original=data.cardById;
 const cards={
  fire:{id:'fire',name:'Fire Attacker',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:130,types:['Fire'],retreat:1,attacks:[{name:'Flame',cost:'R',damage:40,effect:{type:'discardEnergyCard',target:'self',amount:1}}]},
  water:{id:'water',name:'Water Defender',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:130,types:['Water'],retreat:1,attacks:[]},
  'xy8-151':{id:'xy8-151',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Fire:1}}}
 };
 data.cardById=id=>cards[id]||original(id);
 const mon=(id,uid)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{},tool:null,extraTools:[],playedOnSideTurn:0});
 const s={format:'classic',phase:'battle',activeSide:'player',turnNumber:3,rngState:1,log:[],rules:{winMode:'prizes',benchSize:3},sides:{
  player:{active:mon('fire','f'),bench:[],hand:[],deck:[],discard:[],prizes:[],energyDiscard:{},energySupply:[],energyTypes:['Fire'],turnCount:3,benchLimit:3,energyAvailable:true,energyUsed:false},
  opponent:{active:mon('water','w'),bench:[],hand:[],deck:[],discard:[],prizes:[],energyDiscard:{},energySupply:[],energyTypes:['Water'],turnCount:2,benchLimit:3,energyAvailable:true,energyUsed:false}}};
 s.sides.player.active.specialEnergy=[{uid:'burning-real',cardId:'xy8-151'}];
 try{
  const action=core.legalActions(s,'player').find(a=>a.type==='attack');assert.ok(action);
  core.applyAction(s,'player',action);
  assert.equal(s.sides.opponent.active.damage,40);
  assert.deepEqual(s.sides.player.active.specialEnergy.map(r=>r.uid),['burning-real']);
  assert.equal(s.sides.player.discard.length,0);
  assert.equal(s.log.filter(e=>e.type==='xy8BurningEnergyReturn').length,1);
 }finally{data.cardById=original;}
});
test('Actual core exposes both Parallel City orientations and records selected damage side',()=>{
 const data=require(path.join(assets,'tcgp-battle-data.js')),core=require(path.join(assets,'tcgp-battle-core.js')),orig=data.cardById;
 const cards={fire:{id:'fire',name:'Fire',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Fire'],retreat:1,attacks:[]},
  'xy8-145':{id:'xy8-145',name:'Parallel City',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'neoRule',rule:'xy8:parallelCity'}}};
 data.cardById=id=>cards[id]||orig(id);
 const mon=(uid)=>({uid,cardId:'fire',stack:['fire'],energy:{},specialEnergy:[],damage:0,conditions:{},tool:null,extraTools:[],playedOnSideTurn:0});
 try{
  const s={format:'classic',phase:'battle',activeSide:'player',turnNumber:3,log:[],rngState:1,rules:{winMode:'prizes',benchSize:3},sides:{
   player:{active:mon('a'),bench:[],hand:[{uid:'stadium',cardId:'xy8-145'}],deck:[],discard:[],prizes:[],turnCount:3,benchLimit:3},
   opponent:{active:mon('b'),bench:[],hand:[],deck:[],discard:[],prizes:[],turnCount:2,benchLimit:3}}};
  const opts=core.legalActions(s,'player').filter(a=>a.type==='trainer');assert.deepEqual(opts.map(a=>a.effectSelection),['selfBench','opponentBench']);
  core.applyAction(s,'player',opts[1]);
  assert.equal(s.stadium.xy8BenchSide,'opponent');assert.equal(s.stadium.xy8DamageSide,'player');
  assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),-20);
 }finally{data.cardById=orig;}
});
