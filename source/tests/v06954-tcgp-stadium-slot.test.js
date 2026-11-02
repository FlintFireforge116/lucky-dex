'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

test('stadium slot model exposes the shared Stadium and its once-per-turn action',()=>{
  const model=ui._test.stadiumSlotModel({
    phase:'battle',activeSide:'player',turnNumber:7,
    stadium:{uid:'st-1',cardId:'B3-153',ownerSide:'opponent'},
    sides:{player:{stadiumActionUsedTurn:null,stadiumActionUsedUid:null},opponent:{}}
  },[{type:'stadiumAction',cardId:'B3-153'}],'player');
  assert.equal(model.cardId,'B3-153');
  assert.equal(model.ownerSide,'opponent');
  assert.equal(model.actionIndex,0);
  assert.equal(model.status,'ACTIVATE');
  assert.equal(model.canActivate,true);
});

test('stadium slot shows used state after that player activates it this turn',()=>{
  const model=ui._test.stadiumSlotModel({
    phase:'battle',activeSide:'player',turnNumber:7,
    stadium:{uid:'st-1',cardId:'B3-153',ownerSide:'player'},
    sides:{player:{stadiumActionUsedTurn:7,stadiumActionUsedUid:'st-1'},opponent:{}}
  },[],'player');
  assert.equal(model.canActivate,false);
  assert.equal(model.status,'USED');
});

test('live battle uses a board Stadium slot instead of a generic centre STADIUM action',()=>{
  const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.ok(js.includes('function liveStadiumSlotHtml('),'missing shared Stadium slot renderer');
  assert.ok(js.includes('tcgp-live-stadium-slot'),'Stadium slot should be rendered in the battlefield');
  assert.ok(js.includes('tcgp-live-stadium-activate'),'Stadium action should live on the Stadium slot');
  assert.ok(!js.includes('>STADIUM</button>`'), 'generic centre STADIUM button should be removed');
  assert.ok(css.includes('.tcgp-live-stadium-slot'),'missing Stadium slot styling');
  assert.ok(css.includes('.tcgp-live-stadium-activate'),'missing Stadium activation styling');
});

test('Stadium play presentation moves the new card into the slot and replaces the old Stadium to discard',()=>{
  const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  assert.ok(js.includes('stadium:presentationRect('),'presentation anchors should capture the occupied Stadium slot');
  assert.ok(js.includes("trainerType==='Stadium'"),'presentation should distinguish Stadium Trainer movement');
  assert.ok(js.includes('tcgp-present-stadium-replace'),'replacement Stadium should animate to discard');
});

test('Stadium activation has its own board feedback',()=>{
  const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.ok(js.includes("entry.type==='stadiumAction'"),'Stadium activation should be presented from its slot');
  assert.ok(js.includes('tcgp-present-stadium-active'),'activation should pulse the Stadium card');
  assert.ok(css.includes('.tcgp-present-stadium-active'),'missing Stadium activation feedback');
});

test('Random Battle results do not offer rematch while named battles still do',()=>{
  const random=ui._test.resultActionsModel({randomPool:true},false);
  const named=ui._test.resultActionsModel({randomPool:false},false);
  assert.equal(random.canRematch,false);
  assert.equal(named.canRematch,true);
});
