'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const data=require(path.join(assets,'tcgp-battle-data.js'));
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
const js=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');

function choiceContext(){
  const active={uid:'a',cardId:'A1-001',damage:40,energy:{},conditions:{}};
  const bench={uid:'b',cardId:'A1-008',damage:40,energy:{},conditions:{},benchSlot:0};
  const state={rngState:1,turnNumber:3,log:[],sides:{player:{active,bench:[bench],hand:[],deck:[],discard:[]},opponent:{active:null,bench:[],hand:[],deck:[],discard:[]}}};
  return {state,active,bench,ctx:{state,side:'player',foeSide:'opponent',attacker:active,defender:null,action:{target:'bench',benchIndex:0},cardById:data.cardById,random:()=>0.1,requestChoice:()=>{throw new Error('direct board target must not open a second chooser');}}};
}

test('chooseTarget trainer effects expose board targets before the card is played',()=>{
  const sweetHoney=data.cardById('C1-119');
  const {ctx}=choiceContext();
  const choices=effects.choicesForEffect(sweetHoney.effect,ctx);
  assert.deepEqual(choices.map(x=>[x.target,x.benchIndex??null]),[['active',null],['bench',0]]);
});

test('a chooseTarget trainer dropped on a Pokemon resolves on that Pokemon without effectChoice',()=>{
  const sweetHoney=data.cardById('C1-119');
  const {ctx,bench,state}=choiceContext();
  let flips=0;
  ctx.random=()=>flips++===0?0.1:0.9; // one heads, then tails
  effects.applyEffect(sweetHoney.effect,ctx);
  assert.equal(bench.damage,20);
  assert.notEqual(state.phase,'effectChoice');
});

test('playmat artwork is cropped as one half of a square mat and board slots stay visible',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-mat-half\{[^}]*background-size:100% 200%/s);
  assert.match(styles,/\.tcgp-live-mat-half \.tcgp-live-card\.empty\{[^}]*border:1\.5px solid rgba\(255,255,255/s);
});

test('Pokemon wrappers are sized to Pocket-style printed card slots rather than oversized mat percentages',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-opponent-active\{[^}]*width:13%[^}]*height:30%/s);
  assert.match(styles,/\.tcgp-live-player-active\{[^}]*width:13%[^}]*height:30%/s);
  assert.match(styles,/\.tcgp-live-opponent-bench\{[^}]*width:40%[^}]*height:30%/s);
  assert.match(styles,/\.tcgp-live-player-bench\{[^}]*width:40%[^}]*height:30%/s);
});

test('energy source is icon-only and fallback letters stay hidden while images load',()=>{
  const html=ui._test.liveEnergySourceHtml({energyAvailable:true,energyUsed:false,energyType:'Grass',nextEnergyType:'Grass'});
  assert.doesNotMatch(html,/<small/);
  assert.doesNotMatch(html,/>→</);
  const styles=css();
  assert.match(styles,/\.tcgp-energy-icon>i\[hidden\]\{display:none!important\}/);
});

test('Stadium is rendered as a player-mat sibling, not positioned from the Active Pokemon wrapper',()=>{
  const source=js();
  assert.match(source,/tcgp-live-player-active[^`]*\$\{liveCardHtml\(p\.active[^`]*<\/div>\$\{liveStadiumSlotHtml\(\)\}/s);
  const styles=css();
  assert.match(styles,/\.tcgp-live-player>\.tcgp-live-stadium-slot\{[^}]*right:8px[^}]*top:23%/s);
  assert.match(styles,/\.tcgp-live-stadium-card\{[^}]*width:52px[^}]*height:73px/s);
});
