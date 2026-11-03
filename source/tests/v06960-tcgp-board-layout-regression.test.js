'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const data=require(path.join(assets,'tcgp-battle-data.js'));
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
const js=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');

function side(active,bench,hand){
  return {active,bench:bench||[],hand:hand||[],deck:[],discard:[],energyDiscard:{},turnCount:2,energyAvailable:false,energyUsed:false,energyType:'Grass',energyTypes:['Grass'],nextEnergyType:'Grass',retreated:false,supporterUsed:false,stadiumUsed:false,abilityUsed:{},points:0};
}

test('playmat halves use an undistorted 2:1 crop coordinate system',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-mat-half\{[^}]*aspect-ratio:2\s*\/\s*1[^}]*background-size:100% 200%/s);
});

test('hand piles and energy live outside the player playmat',()=>{
  const source=js();
  assert.match(source,/<section class="tcgp-live-player tcgp-live-mat-half"[^`]*<\/section>\s*<section class="tcgp-live-player-bottom"/s);
});

test('opponent hand and piles live outside the opponent playmat',()=>{
  const source=js();
  assert.match(source,/<section class="tcgp-live-opponent-top"[^`]*<\/section>\s*<section class="tcgp-live-opponent tcgp-live-mat-half"/s);
});

test('mat slot geometry uses fixed normalized positions and card-sized wrappers',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-opponent-bench\{[^}]*top:30%[^}]*width:44%[^}]*height:32%/s);
  assert.match(styles,/\.tcgp-live-opponent-active\{[^}]*top:70%[^}]*width:12%[^}]*height:32%/s);
  assert.match(styles,/\.tcgp-live-player-active\{[^}]*top:24%[^}]*width:12%[^}]*height:32%/s);
  assert.match(styles,/\.tcgp-live-player-bench\{[^}]*top:67%[^}]*width:44%[^}]*height:32%/s);
});

test('active battle controls are temporary and not embedded in the Pokemon slot',()=>{
  const html=ui._test.liveCardHtml({uid:'p1',cardId:'A1-001',damage:0,energy:{},conditions:{}},{side:'player',zone:'active',showActions:false});
  assert.doesNotMatch(html,/tcgp-live-card-actions/);
  const source=js();
  assert.match(source,/livePokemonActionsOverlayHtml/);
  assert.doesNotMatch(source,/<section class="tcgp-live-player-actions"/);
});

test('Tool mini-cards anchor to the Pokemon side edge away from HP and action controls',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-card-wrap \.tcgp-live-tool-stack\{[^}]*left:100%[^}]*top:58%[^}]*transform:translate\(4px,-50%\)/s);
});

test('Stadium uses the far-right mat coordinate and a larger landscape footprint',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-player>\.tcgp-live-stadium-slot\{[^}]*right:3%[^}]*top:24%/s);
  assert.match(styles,/\.tcgp-live-player>\.tcgp-live-stadium-slot \.tcgp-live-stadium-card\{[^}]*width:58px[^}]*height:82px[^}]*rotate\(90deg\)/s);
});

test('battle HUD has no generic centre card-play drop zone that can reopen target choice',()=>{
  const source=js();
  assert.doesNotMatch(source,/data-card-play-zone=\"1\"/);
});

test('targeted Trainer legal actions are spatial before play, never generic',()=>{
  const active=core.makePokemonSlot('A1-001',1,'a');
  const bench=core.makePokemonSlot('A1-008',1,'b'); bench.benchSlot=0;
  active.damage=40; bench.damage=40;
  const player=side(active,[bench],[{uid:'h1',cardId:'C1-119'}]);
  const opponent=side(core.makePokemonSlot('A1-009',1,'o'),[],[]);
  const state={schema:1,rngState:1,phase:'battle',winner:null,reason:null,firstSide:'player',activeSide:'player',turnNumber:3,log:[],sides:{player,opponent}};
  const actions=core.legalActions(state,'player').filter(a=>a.type==='trainer'&&a.cardId==='C1-119');
  assert.deepEqual(actions.map(a=>[a.target,a.benchIndex??null]),[['active',null],['bench',0]]);
  assert.equal(actions.some(a=>a.target==null),false);
});
