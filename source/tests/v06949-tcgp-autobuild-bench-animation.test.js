'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

test('competitive autobuild does not add Lt. Surge when its named Active targets are absent',()=>{
  const rows=data.CARDS.filter(card=>card.battleEnabled&&!card.loaner).map(card=>({gameplayId:card.id,quantity:2,battleEnabled:true}));
  const result=decks.buildQuickDeck(rows,{cardId:'A1-129'}); // Mewtwo ex
  assert.equal(result.ok,true);
  const names=result.cards.map(id=>data.cardById(id)?.name);
  assert.equal(names.includes('Lt. Surge'),false,'Lt. Surge is dead without Raichu, Electrode, or Electabuzz');
});

test('benchDamage logs each damaged Bench target with enough metadata to animate it',()=>{
  const attacker={uid:'p-active',cardId:'A1-129',energy:{},conditions:{}};
  const bench0={uid:'o-b0',cardId:'A1-001',benchSlot:0,damage:0,energy:{},conditions:{},stack:['A1-001']};
  const bench1={uid:'o-b1',cardId:'A1-008',benchSlot:1,damage:5,energy:{},conditions:{},stack:['A1-008']};
  const state={turnNumber:3,log:[],modifiers:[],stadium:null,sides:{player:{active:attacker,bench:[]},opponent:{active:null,bench:[bench0,bench1]}}};
  const cards={
    'A1-129':{id:'A1-129',name:'Mewtwo ex',kind:'pokemon',types:['Psychic'],abilities:[]},
    'A1-001':{id:'A1-001',name:'Bulbasaur',kind:'pokemon',types:['Grass'],abilities:[]},
    'A1-008':{id:'A1-008',name:'Weedle',kind:'pokemon',types:['Grass'],abilities:[]}
  };
  effects.applyEffect({type:'benchDamage',side:'opponent',all:true,amount:20},{
    state,side:'player',foeSide:'opponent',attacker,defender:null,isAttack:true,attack:{name:'Bench Burst'},
    cardById:id=>cards[id]||{id,name:id,kind:'pokemon',types:['Colorless'],abilities:[]}
  });
  assert.equal(bench0.damage,20);
  assert.equal(bench1.damage,25);
  assert.deepEqual(state.log.filter(entry=>entry.type==='benchDamage'),[
    {type:'benchDamage',side:'player',targetSide:'opponent',sourceCardId:'A1-129',targetCardId:'A1-001',benchIndex:0,amount:20,attack:'Bench Burst'},
    {type:'benchDamage',side:'player',targetSide:'opponent',sourceCardId:'A1-129',targetCardId:'A1-008',benchIndex:1,amount:20,attack:'Bench Burst'}
  ]);
});

test('bench damage presentation reuses the attack type while targeting the actual Bench slot',()=>{
  const entry={type:'benchDamage',side:'player',targetSide:'opponent',sourceCardId:'A1-129',targetCardId:'A1-001',benchIndex:2,amount:30,attack:'Bench Burst'};
  assert.deepEqual(ui._test.benchDamagePresentationEntry(entry),{
    type:'attack',side:'player',targetSide:'opponent',cardId:'A1-129',attack:'Bench Burst',damage:30,target:'bench',benchIndex:2,secondary:true
  });
});

test('battle summary counts secondary Bench damage in total damage dealt and taken',()=>{
  const stats=ui._test.battleSummaryStats({turnNumber:4,sides:{player:{points:1},opponent:{points:0}},log:[
    {type:'attack',side:'player',cardId:'A1-129',attack:'Bench Burst',damage:60},
    {type:'benchDamage',side:'player',targetSide:'opponent',sourceCardId:'A1-129',targetCardId:'A1-001',benchIndex:0,amount:20,attack:'Bench Burst'},
    {type:'benchDamage',side:'opponent',targetSide:'player',sourceCardId:'A1-084',targetCardId:'A1-008',benchIndex:1,amount:30,attack:'Blizzard'}
  ]});
  assert.equal(stats.damageDealt,80);
  assert.equal(stats.damageTaken,30);
  assert.equal(stats.biggestHit,60,'secondary chip damage should not replace the primary biggest-hit record');
});
