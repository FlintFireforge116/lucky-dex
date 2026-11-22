'use strict';
// Real battle outcome tests for first-pass reusable Fates Collide effects.
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const root=path.resolve(__dirname,'..');
function mapping(){const py=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy10_verified as m
print(json.dumps({'attacks':{n+':'+t:e for (n,t),e in m.ATK.items()},'trainers':{n:v[1] for n,v in m.TRAINERS.items()},'abilities':m.ABILITIES,'energy':m.ENERGIES}))`;
 const r=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
const m=mapping();
function scene(){
 const cards={self:{id:'self',kind:'pokemon',hp:140,stage:'Basic',types:['Psychic'],attacks:[]},foe:{id:'foe',kind:'pokemon',hp:160,stage:'Basic',types:['Darkness'],attacks:[]},fairy:{id:'fairy',kind:'pokemon',hp:100,stage:'Basic',types:['Fairy'],attacks:[]},double:{id:'xy10-114',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Colorless:2}}},rainbow:{id:'rainbow',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Miracle:1}}},stadium:{id:'xy10-100',kind:'trainer',trainerType:'Stadium',effect:m.trainers['100']},tool:{id:'xy10-93',kind:'trainer',trainerType:'Tool',effect:m.trainers['93']}};
 cards['xy10-100']=cards.stadium;cards['xy10-93']=cards.tool;
 const slot=(id,uid,other={})=>({uid,cardId:id,benchSlot:0,stack:[id],energy:{},specialEnergy:[],tool:null,damage:0,conditions:{},...other});
 const p={active:slot('self','a'),bench:[],deck:[],discard:[],hand:[],prizes:[],energySupply:[],turnCount:2},o={active:slot('foe','b'),bench:[],deck:[],discard:[],hand:[],prizes:[],energySupply:[],turnCount:2};
 const state={format:'classic',turnNumber:4,activeSide:'player',sides:{player:p,opponent:o},log:[]};
 const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,random:()=>.1,requestChoice:()=>{},isAttack:true};
 return {cards,slot,p,o,state,ctx};
}
test('Every declared XY10 mapping is valid against existing effect DSL',()=>{
 for(const [id,e] of Object.entries(m.attacks))assert.deepEqual(fx.validateEffect(e),[],id);
 for(const [id,e] of Object.entries(m.trainers))assert.deepEqual(fx.validateEffect(e),[],id);
 for(const [name,ability] of Object.entries(m.abilities))assert.deepEqual(fx.validateEffect(ability.effect),[],name);
 for(const [id,e] of Object.entries(m.energy))assert.deepEqual(fx.validateEffect(e),[],id);
});
test('Zen Force counts actual damage counters on opposing Active, in addition to 10 base',()=>{
 const s=scene();s.o.active.damage=40;
 const a=fx.resolveAttack({name:'Zen Force',damage:10,effect:m.attacks['26:Zen Force']},s.ctx);
 assert.equal(a.damage,130);
});
test('Psystorm counts actual Energy on both full boards, not just the two Active Pokémon',()=>{
 const s=scene();s.p.active.energy.Psychic=1;s.o.active.energy.Darkness=2;
 s.p.bench=[s.slot('self','pa',{energy:{Fire:2}})];s.o.bench=[s.slot('foe','ob',{energy:{Water:1}})];
 const a=fx.resolveAttack({name:'Psystorm',damage:0,effect:m.attacks['13:Psystorm']},s.ctx);
 assert.equal(a.damage,120);
});
test('Mist Purge requires physically attached Special Energy, not only Basic Energy',()=>{
 const s=scene();const a={name:'Mist Purge',damage:100,effect:m.attacks['69:Mist Purge']};
 s.p.active.energy.Psychic=3;assert.equal(fx.resolveAttack(a,s.ctx).damage,100);
 s.p.active.specialEnergy=[{uid:'dce',cardId:'xy10-114',provides:{Colorless:2}}];
 assert.equal(fx.resolveAttack(a,s.ctx).damage,130);
});
test('Double Colorless provides exactly two Colorless units in the physical Energy card',()=>{
 assert.deepEqual(m.energy['114'].provides,{Colorless:2});
});
test('Fairy Garden reduces retreat on both sides only for Pokémon with Fairy Energy, including Special Energy',()=>{
 const s=scene();s.state.stadium={uid:'st',cardId:'xy10-100'};
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'retreatCost',s.ctx.cardById),0);
 s.p.active.energy.Fairy=1;
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'retreatCost',s.ctx.cardById),-99);
 s.p.active.energy={};s.o.active.specialEnergy=[{uid:'r',cardId:'rainbow',provides:{Miracle:1}}];
 assert.equal(fx.modifierAmount(s.state,'opponent',s.o.active,'retreatCost',s.ctx.cardById),-99);
});
test('All three Fates Collide Spirit Links exempt only their matching Mega Evolutions',()=>{
 const js=require('node:fs').readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8');
 for(const [link,ids] of [['xy10-90',['xy10-26','xy10-118']],['xy10-91',['xy10-69','xy10-121']],['xy10-92',['xy10-85']]]){
  assert.ok(js.includes(`cardId==='${link}'`));for(const id of ids)assert.ok(js.includes(`'${id}'`));
 }
});
test('Still-unverified Fossil, Power Memory, alternate KO and global effects remain gated',()=>{
 for(const [num,name] of [['14','Flare Witch'],['19','Dangerous Tentacle'],['25','Kinesis'],['62','Metal Rain'],['82','Cacophony']]){
  assert.equal(m.attacks[num+':'+name],undefined);
 }
 for(const n of ['94','96','102','108'])assert.equal(m.trainers[n]||m.energy[n],undefined);
});
test('Fates Collide Link Fusion bonuses require matching distinct named Pokémon on the Bench',()=>{
 const s=scene(),a={name:'Link Fusion',damage:10,effect:m.attacks['35:Link Fusion']};
 assert.equal(fx.resolveAttack(a,s.ctx).damage,10);
 for(const [i,name] of ['Solosis','Duosion','Reuniclus'].entries()){
  const id='line-'+i;s.cards[id]={id,name,kind:'pokemon',stage:i?'Stage 1':'Basic',types:['Psychic']};
  s.p.bench.push(s.slot(id,'line'+i,{benchSlot:i}));
 }
 assert.equal(fx.resolveAttack(a,s.ctx).damage,190);
 s.p.bench.pop();assert.equal(fx.resolveAttack(a,s.ctx).damage,100);
});
test('Fates Collide Balloon Bomb and Team Rocket Handiwork discard only on successful coins',()=>{
 for(const e of [m.attacks['28:Balloon Bomb'],m.trainers['112'],m.trainers['124']]){
  const s=scene();s.o.deck=Array.from({length:5},(_,i)=>({uid:'u'+i,cardId:'foe'}));
  let rolls=[0.1,0.9];s.ctx.random=()=>rolls.shift();
  fx.applyEffect(e,s.ctx);assert.equal(s.o.deck.length,3);assert.deepEqual(s.o.discard.map(c=>c.uid),['u0','u1']);
 }
});
test('Fates Collide N shuffles each player hand and draws by that player remaining Prize count',()=>{
 const s=scene();s.p.points=1;s.o.points=2;
 s.p.hand=[{uid:'ph0',cardId:'self'}];s.o.hand=[{uid:'oh0',cardId:'foe'},{uid:'oh1',cardId:'foe'}];
 s.p.deck=[{uid:'pd0',cardId:'self'},{uid:'pd1',cardId:'self'}];s.o.deck=[{uid:'od0',cardId:'foe'}];
 s.ctx.shuffle=()=>{};
 s.ctx.drawCard=side=>{const ref=side.deck.shift();if(ref)side.hand.push(ref);};
 fx.applyEffect(m.trainers['105'],s.ctx);
 assert.equal(s.p.hand.length,2);assert.equal(s.o.hand.length,1);
 assert.equal(s.p.deck.length,1);assert.equal(s.o.deck.length,2);
});
test('Fates Collide Crystal Ray protects only against Evolved Pokémon attacks',()=>{
 const s=scene();fx.applyEffect(m.attacks['20:Crystal Ray'],s.ctx);
 s.cards.foe.stage='Stage 1';assert.ok(fx.attackIsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById));
 s.cards.foe.stage='Basic';assert.equal(fx.attackIsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById),null);
});
test('Fates Collide Shining Wind grants temporary Weakness protection',()=>{
 const s=scene();fx.applyEffect(m.attacks['83:Shining Wind'],s.ctx);
 assert.equal(s.p.active.weaknessGuard.duration,'opponentTurn');
 assert.equal(s.p.active.weaknessGuard.expiresTurn,5);
});
