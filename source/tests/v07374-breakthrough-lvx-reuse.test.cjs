'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');

const fake={
 'xy8-test-prior':{id:'xy8-test-prior',setId:'xy8',name:'Raichu',kind:'pokemon',stage:'Stage 1',hp:90,types:['Lightning'],retreat:2,weakness:'Fighting',weaknessValue:'×2',resistance:'Metal',resistanceValue:'-20',attacks:[{name:'Inherited Zap',cost:'L',damage:30,effect:{type:'noop'}}],abilities:[],battleEnabled:true},
 'xy8-test-break':{id:'xy8-test-break',setId:'xy8',name:'Raichu BREAK',kind:'pokemon',stage:'BREAK',breakEvolution:true,evolvesFrom:'Raichu',hp:130,types:['Lightning'],retreat:0,weakness:null,resistance:null,attacks:[{name:'Grand Bolt',cost:'LLC',damage:170,effect:{type:'discardEnergyCard',target:'self',amount:'all'}}],abilities:[],battleEnabled:true},
 'xy8-test-basic':{id:'xy8-test-basic',setId:'xy8',name:'Pikachu',kind:'pokemon',stage:'Basic',hp:50,types:['Lightning'],retreat:1,attacks:[{name:'Gnaw',cost:'C',damage:10,effect:{type:'noop'}}],abilities:[],battleEnabled:true},
 'xy8-test-lvx':{id:'xy8-test-lvx',setId:'xy8',name:'Raichu LV.X',kind:'pokemon',stage:'Level-Up',isLevelX:true,levelUpFrom:'Raichu',evolvesFrom:'Raichu',hp:120,types:['Lightning'],retreat:1,attacks:[{name:'Level Strike',cost:'L',damage:40,effect:{type:'noop'}}],abilities:[],battleEnabled:true}
};
const original=data.cardById;
const read=id=>fake[id]||original(id);
const slot=(id,stack=[id])=>({uid:'s-'+id,cardId:id,stack,energy:{Lightning:4},specialEnergy:[],damage:10,conditions:{},tool:null,extraTools:[],temporaryTrainers:[],playedOnSideTurn:0});
const stateFor=(active,hand=[],bench=[])=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:3,log:[],modifiers:[],sides:{player:{active,bench,hand,deck:[],discard:[],prizes:[],turnCount:3,benchLimit:3,energyAvailable:true,energyUsed:false},opponent:{active:slot('xy8-test-basic'),bench:[],hand:[],deck:[],discard:[],prizes:[],turnCount:2,benchLimit:3}}});

test('BREAK reuses LV.X previous attack inheritance but keeps its own HP and previous Retreat/typing',()=>{
 data.cardById=read;
 try{
  const b=slot('xy8-test-break',['xy8-test-basic','xy8-test-prior','xy8-test-break']),s=stateFor(b);
  const moves=core.attackOptions(s,'player').map(x=>x.attack.name);
  assert.deepEqual(moves,['Grand Bolt','Inherited Zap']);
  assert.equal(core.maxHp(s,'player',b),130);
  assert.equal(core.retreatCost(s,'player'),2);
  assert.deepEqual(effects.effectiveTypes(s,'player',b,read),['Lightning']);
  const x=slot('xy8-test-lvx',['xy8-test-basic','xy8-test-prior','xy8-test-lvx']);
  assert.deepEqual(core.attackOptions(stateFor(x),'player').map(x=>x.attack.name),['Level Strike','Inherited Zap']);
 }finally{data.cardById=original;}
});

test('BREAK can evolve its named Stage 1 while Benched, unlike LV.X Active-only',()=>{
 data.cardById=read;
 try{
  const active=slot('xy8-test-basic'),bench=[slot('xy8-test-prior')],s=stateFor(active,[{uid:'break',cardId:'xy8-test-break'},{uid:'lvx',cardId:'xy8-test-lvx'}],bench);
  const actions=core.legalActions(s,'player');
  assert.ok(actions.some(a=>a.type==='evolve'&&a.cardId==='xy8-test-break'&&a.target==='bench'),JSON.stringify(actions.filter(a=>a.type==='evolve')));
  assert.ok(!actions.some(a=>a.type==='evolve'&&a.cardId==='xy8-test-lvx'&&a.target==='bench'));
 }finally{data.cardById=original;}
});

test('BREAK evolution preserves physical stack and attachments but clears ordinary evolution statuses',()=>{
 data.cardById=read;
 try{
  const active=slot('xy8-test-basic'),bench=[slot('xy8-test-prior')];
  bench[0].conditions={poison:1,confusion:true};
  bench[0].tool={uid:'tool1',cardId:'xy5-142'};
  const s=stateFor(active,[{uid:'break',cardId:'xy8-test-break'}],bench);
  const action=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy8-test-break'&&a.target==='bench');
  assert.ok(action);
  core.applyAction(s,'player',action);
  assert.equal(bench[0].cardId,'xy8-test-break');
  assert.deepEqual(bench[0].stack,['xy8-test-prior','xy8-test-break']);
  assert.equal(bench[0].energy.Lightning,4);
  assert.equal(bench[0].tool.cardId,'xy5-142');
  assert.deepEqual(bench[0].conditions,{});
  assert.equal(bench[0].damage,10);
 }finally{data.cardById=original;}
});

test('BREAK receives inherited Weakness and Resistance from the exact previous print',()=>{
 data.cardById=read;
 try{
  const b=slot('xy8-test-break',['xy8-test-prior','xy8-test-break']);
  const attacker=slot('xy8-test-basic');
  const s=stateFor(attacker);
  s.sides.opponent.active=b;
  assert.equal(effects.attackDamageWithState(s,'player',attacker,'opponent',b,30,read),30,
    'Pikachu Lightning attack should neither exploit Fighting weakness nor Metal resistance');
  const fighting={...fake['xy8-test-basic'],id:'xy8-test-fighting',types:['Fighting'],subtype:'Fighting'};
  fake[fighting.id]=fighting;
  attacker.cardId=fighting.id;
  assert.equal(effects.attackDamageWithState(s,'player',attacker,'opponent',b,30,read),60,
    'BREAK inherited Fighting weakness is doubled');
  const metal={...fighting,id:'xy8-test-metal',types:['Metal'],subtype:'Metal'};
  fake[metal.id]=metal;
  attacker.cardId=metal.id;
  assert.equal(effects.attackDamageWithState(s,'player',attacker,'opponent',b,30,read),10,
    'BREAK inherited Metal resistance reduces damage by 20');
 }finally{
  data.cardById=original;
  delete fake['xy8-test-fighting'];delete fake['xy8-test-metal'];
 }
});
