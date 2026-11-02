'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));

test('fixed-count attack coin logs preserve exact flip order',()=>{
  const state={turnNumber:1,log:[],sides:{player:{active:null,bench:[]},opponent:{active:null,bench:[]}}};
  const attacker={uid:'p1',cardId:'A1-129',energy:{},conditions:{}},defender={uid:'o1',cardId:'A1-084',energy:{},conditions:{}};
  state.sides.player.active=attacker;state.sides.opponent.active=defender;
  const values=[0.1,0.9,0.2];
  const result=effects.resolveAttack({name:'Test Flip',damage:0,effect:{type:'coinDamage',coins:3,amount:10}}, {
    state,side:'player',foeSide:'opponent',attacker,defender,
    random:()=>values.shift(),cardById:id=>({id,name:id,kind:'pokemon',types:['Psychic']})
  });
  assert.equal(result.damage,20);
  const flip=state.log.find(entry=>entry.type==='coin');
  assert.deepEqual(flip.results,[true,false,true]);
  assert.equal(flip.heads,2);
  assert.equal(flip.coins,3);
});

test('core single-coin gates also log an exact one-flip sequence',()=>{
  const deck=Array(20).fill('A1-129');
  const state=core.createBattle({playerDeck:deck,opponentDeck:deck,playerEnergyType:'Psychic',opponentEnergyType:'Psychic',firstSide:'player',seed:12345});
  state.sides.player.active.energy={Psychic:4};
  state.sides.player.active.attackGate={expiresTurn:state.turnNumber};
  const action=core.legalActions(state,'player').find(item=>item.type==='attack');
  assert.ok(action,'expected a legal attack');
  const before=state.log.length;
  core.applyAction(state,'player',action);
  const flip=state.log.slice(before).find(entry=>entry.type==='coin'&&entry.reason==='attackGate');
  assert.ok(flip,'attack gate should flip a coin');
  assert.deepEqual(flip.results,[flip.heads]);
});
