'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const B=require('../app/src/main/assets/adventure/adventure-battle.js');

const mon=(id,key,moves,pp)=>({
  id,key,name:id===129?'Magikarp':`Pokemon ${id}`,types:['water'],level:12,
  baseStats:{hp:60,attack:55,defense:55,spAttack:45,spDefense:45,speed:50},moves,pp
});
const player=()=>mon(7,'7:n',[33],{33:35});
const battle=enemy=>B.create([player()],enemy,{context:'regional',kind:'wild',seed:31});

function enemyMoveEvents(action, enemyKey){
  return action.events.filter(e=>e.key===enemyKey || e.target==='player').filter(e=>e.source==='move'||/used |Struggle|Splash|Tackle/.test(e.text||''));
}

test('status-only move with PP prevents Struggle and remains a legal enemy action',()=>{
  const f=battle(mon(129,'129:n',[150],{150:40}));
  const result=B.act(f,'move',{moveId:33},{});
  assert.equal(result.applied,true);
  assert.equal(f.enemy.lastMoveId,150,'Magikarp with usable Splash must use Splash, not Struggle');
  assert.doesNotMatch(result.action.text||'',/Struggle/i);
  assert.equal(result.action.events.some(e=>/Struggle/i.test(e.text||'')),false);
});

test('Magikarp with usable Tackle never receives a second Struggle fallback in the same turn',()=>{
  const f=battle(mon(129,'129:n',[150,33],{150:40,33:35}));
  const result=B.act(f,'move',{moveId:33},{});
  assert.equal(result.applied,true);
  assert.equal(f.enemy.lastMoveId,33);
  assert.equal(result.action.events.some(e=>/Struggle/i.test(e.text||'')),false);
  const enemyMoves=enemyMoveEvents(result.action,'129:n');
  assert.ok(enemyMoves.length<=1,'the enemy must execute at most one move in a turn');
});

test('Struggle becomes available only when every known move is unusable',()=>{
  const f=battle(mon(129,'129:n',[150,33],{150:0,33:0}));
  const result=B.act(f,'move',{moveId:33},{});
  assert.equal(result.applied,true);
  assert.equal(f.enemy.lastMoveId,165);
  assert.equal(result.action.events.some(e=>/Struggle/i.test(e.text||'')),true);
});

test('player cannot choose Struggle while Splash has PP, but can when all PP is exhausted',()=>{
  const usable=B.create([mon(129,'129:p',[150],{150:40})],mon(7,'7:e',[150],{150:40}),{context:'regional',kind:'wild',seed:7});
  assert.equal(B.act(usable,'move',{moveId:165},{}).applied,false);
  const usableHtml=B.markup(usable,{destinations:{meadow:{battle:'x.png'}},pokemon:id=>`${id}.png`});
  assert.equal(/data-move-id="165"/.test(usableHtml),false);

  const spent=B.create([mon(129,'129:p',[150],{150:0})],mon(7,'7:e',[150],{150:40}),{context:'regional',kind:'wild',seed:7});
  const spentHtml=B.markup(spent,{destinations:{meadow:{battle:'x.png'}},pokemon:id=>`${id}.png`});
  assert.equal(/data-move-id="165"/.test(spentHtml),true);
  assert.equal(B.act(spent,'move',{moveId:165},{}).applied,true);
  assert.equal(spent.party[0].lastMoveId,165);
});
