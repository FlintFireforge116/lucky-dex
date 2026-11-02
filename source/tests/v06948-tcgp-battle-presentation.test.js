'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

const {attackPresentationMeta,coinSequence,battleSummaryStats}=ui._test;

test('attack presentation uses Pokémon type and resolved damage intensity',()=>{
  assert.deepEqual(attackPresentationMeta({type:'attack',cardId:'A1-129',attack:'Psychic Sphere',damage:50}),{
    type:'psychic',intensity:'small',damage:50,attack:'Psychic Sphere'
  });
  assert.deepEqual(attackPresentationMeta({type:'attack',cardId:'A1-036',attack:'Crimson Storm',damage:200}),{
    type:'fire',intensity:'finisher',damage:200,attack:'Crimson Storm'
  });
  assert.equal(attackPresentationMeta({type:'attack',cardId:'A1-084',attack:'Blizzard',damage:80}).intensity,'medium');
  assert.equal(attackPresentationMeta({type:'attack',cardId:'A1-129',attack:'Psydrive',damage:150}).intensity,'big');
});


test('each Pokémon type has a distinct attack visual motif',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  for(const selector of ['.type-grass::after','.type-fire::after','.type-water::after','.type-lightning','.type-psychic::after','.type-fighting::after','.type-darkness::after','.type-metal::after','.type-dragon::after','.type-colorless::after']){
    assert.ok(css.includes(selector),`missing distinct visual motif ${selector}`);
  }
});

test('coin sequence preserves exact engine flip order and supports legacy aggregate logs',()=>{
  assert.deepEqual(coinSequence({type:'coin',heads:2,coins:3,results:[true,false,true]}),[true,false,true]);
  assert.deepEqual(coinSequence({type:'coin',heads:2,coins:3}),[true,true,false]);
  assert.deepEqual(coinSequence({type:'coin',heads:false}),[false]);
});

test('battle summary aggregates player-facing combat statistics from the log',()=>{
  const battle={
    turnNumber:11,
    sides:{player:{points:3},opponent:{points:1}},
    log:[
      {type:'attack',side:'player',cardId:'A1-129',attack:'Psychic Sphere',damage:50},
      {type:'coin',side:'player',heads:2,coins:3,results:[true,false,true]},
      {type:'trainer',side:'player',cardId:'A1-223'},
      {type:'attach',side:'player',energyType:'Psychic',cardId:'A1-129'},
      {type:'attack',side:'opponent',cardId:'A1-084',attack:'Blizzard',damage:80},
      {type:'attack',side:'player',cardId:'A1-129',attack:'Psydrive',damage:150},
      {type:'ko',side:'opponent',cardId:'A1-084',awarded:2}
    ]
  };
  assert.deepEqual(battleSummaryStats(battle),{
    turns:11,
    playerPoints:3,
    opponentPoints:1,
    damageDealt:200,
    damageTaken:80,
    attacksUsed:2,
    knockouts:1,
    trainersPlayed:1,
    energyAttached:1,
    coinHeads:2,
    coinTails:1,
    coinTotal:3,
    biggestHit:150,
    biggestAttack:'Psydrive',
    biggestAttacker:'Mewtwo ex'
  });
});

test('battle presentation stylesheet includes motion-safe attack, coin, movement and KO hooks',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  for(const token of ['.tcgp-present-layer','.tcgp-present-attack','.tcgp-present-coin','.tcgp-present-card-ghost','.tcgp-present-damage','.tcgp-present-ko']){
    assert.ok(css.includes(token),`missing ${token}`);
  }
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
});

test('battle action flow is wired through the queued presentation controller',()=>{
  const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  for(const token of ['capturePresentationAnchors','playBattlePresentation','finishBattlePresentation','battlePresentationBusy']){
    assert.ok(js.includes(token),`missing ${token}`);
  }
  assert.ok(js.includes("data-tcgp-action=\"skip-presentation\""),'presentation layer should be tappable to finish immediately');
});

test('result screen exposes the expanded battle summary and v0.69.48 runtime marker',()=>{
  const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  for(const label of ['DAMAGE DEALT','DAMAGE TAKEN','BIGGEST HIT','KNOCKOUTS','TRAINERS','ENERGY','COIN FLIPS']){
    assert.ok(js.includes(label),`missing result label ${label}`);
  }
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  assert.ok(app.includes("window.__LUCKYDEX_BUILD='0.69.48'"),'runtime build marker should be 0.69.48');
});

test('turn draws participate in card movement presentation',()=>{
  const uiSource=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  const coreSource=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
  assert.ok(coreSource.includes("type:'draw',side,amount:1"),'begin-turn draw should be logged');
  assert.ok(uiSource.includes('tcgp-present-draw'),'draw movement hook should exist');
});
