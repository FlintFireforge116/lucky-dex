const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const corePath=path.join(__dirname,'..','app','src','main','assets','arcade-roulette-core.js');
let core;
try{core=require(corePath);}catch(err){core=null;}

test('roulette core exposes the faithful 4 Pokémon x 3 colour wheel',()=>{
  assert.ok(core,'roulette core module must exist');
  assert.deepEqual(core.POKEMON.map(x=>x.name),['Makuhita','Azurill','Skitty','Wynaut']);
  assert.deepEqual(core.COLORS,['yellow','green','purple']);
  assert.equal(core.SLOTS.length,12);
  assert.equal(new Set(core.SLOTS.map(x=>x.key)).size,12);
});

test('roulette payout multiplier follows the remaining live wheel',()=>{
  assert.ok(core);
  const empty=core.createRound();
  assert.equal(core.multiplierFor(empty,{kind:'slot',slotKey:'makuhita:yellow'}),12);
  assert.equal(core.multiplierFor(empty,{kind:'pokemon',pokemon:'Makuhita'}),4);
  assert.equal(core.multiplierFor(empty,{kind:'color',color:'yellow'}),3);

  const reduced=core.createRound({occupied:['wynaut:yellow']});
  assert.equal(core.multiplierFor(reduced,{kind:'pokemon',pokemon:'Wynaut'}),11/2);
  const oneLeft=core.createRound({occupied:['skitty:yellow','skitty:green']});
  assert.equal(core.multiplierFor(oneLeft,{kind:'pokemon',pokemon:'Skitty'}),10);
});

test('occupied slots cannot receive another ball and wheel resets after six balls',()=>{
  assert.ok(core);
  let round=core.createRound({occupied:['makuhita:yellow','azurill:green','skitty:purple','wynaut:yellow','makuhita:green']});
  const result=core.resolveSpin(round,{kind:'color',color:'purple'},{random:()=>0});
  assert.equal(result.slot.key,'makuhita:purple');
  assert.equal(result.round.occupied.length,6);
  assert.equal(result.round.complete,true);
  const reset=core.nextRound(result.round);
  assert.equal(reset.occupied.length,0);
  assert.equal(reset.complete,false);
});

test('25/75 Lucky Coin tables become 25/150 on Service Day',()=>{
  assert.ok(core);
  assert.deepEqual(core.tableStakes(false),[25,75]);
  assert.deepEqual(core.tableStakes(true),[25,150]);
});

test('rescue event preserves the selected landing outcome and identifies Shroomish or Taillow',()=>{
  assert.ok(core);
  const round=core.createRound({occupied:['makuhita:yellow','azurill:yellow']});
  const rolls=[0.01,0.1,0.75]; let i=0;
  const result=core.resolveSpin(round,{kind:'pokemon',pokemon:'Wynaut'},{rescueRate:1,random:()=>rolls[i++]??0.5});
  assert.ok(['shroomish','taillow'].includes(result.rescue));
  assert.ok(result.slot);
  assert.ok(!round.occupied.includes(result.slot.key));
});
