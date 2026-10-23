const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const solo=require('../app/src/main/assets/tcgp-battle-solo.js');
const decks=require('../app/src/main/assets/tcgp-battle-decks.js');

test('manual player setup starts with an empty player board and explicit setup placement actions',()=>{
  const battle=solo.createBattle({playerDeck:decks.LOANER_PLAYER_DECK,seed:123,firstSide:'player',manualPlayerSetup:true});
  assert.equal(battle.phase,'setup');
  assert.equal(battle.setupSide,'player');
  assert.equal(battle.sides.player.active,null);
  assert.equal(battle.sides.player.bench.length,0);
  assert.equal(battle.sides.player.hand.length,5);
  const actions=core.legalActions(battle,'player');
  assert.ok(actions.some(a=>a.type==='setupActive'));
  assert.ok(!actions.some(a=>a.type==='setupReady'),'cannot confirm before choosing Active');
});

test('player chooses Active and optional Bench during setup, then setupReady begins turn 1',()=>{
  const battle=solo.createBattle({playerDeck:decks.LOANER_PLAYER_DECK,seed:456,firstSide:'player',manualPlayerSetup:true});
  let actions=core.legalActions(battle,'player');
  const active=actions.find(a=>a.type==='setupActive');
  core.applyAction(battle,'player',active);
  assert.ok(battle.sides.player.active);
  assert.equal(battle.sides.player.bench.length,0);
  actions=core.legalActions(battle,'player');
  const bench=actions.find(a=>a.type==='setupBench');
  if(bench) core.applyAction(battle,'player',bench);
  actions=core.legalActions(battle,'player');
  const ready=actions.find(a=>a.type==='setupReady');
  assert.ok(ready);
  core.applyAction(battle,'player',ready);
  assert.equal(battle.phase,'battle');
  assert.equal(battle.turnNumber,1);
  assert.equal(battle.activeSide,'player');
  assert.equal(battle.sides.player.energyAvailable,false);
});

test('battle UI uses draggable hand cards, explicit board drop zones and central End Turn',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  const css=read('app/src/main/assets/tcgp-battle.css');
  assert.match(ui,/data-tcgp-hand-drag=/);
  assert.match(ui,/data-card-drop-zone=/);
  assert.match(ui,/function handPointerDown\(/);
  assert.match(ui,/function applyHandDrop\(/);
  assert.match(ui,/tcgp-live-mid-controls/);
  assert.doesNotMatch(ui,/tcgp-live-turn[^`]*\$\{endTurnButtonHtml\(\)\}/s);
  assert.match(css,/\.tcgp-live-mid-controls/);
});

test('empty discard pile renders as a genuinely empty slot and piles are enlarged',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  const css=read('app/src/main/assets/tcgp-battle.css');
  assert.match(ui,/emptyDiscard=isDiscard&&!count/);
  assert.match(css,/\.tcgp-live-pile\.discard \.tcgp-live-pile-card\.empty/);
  assert.match(css,/\.tcgp-live-pile\s*\{[^}]*width\s*:\s*clamp\(/s);
  assert.match(css,/\.tcgp-live-pile-card\s*\{[^}]*aspect-ratio\s*:\s*2\.5\s*\/\s*3\.5/s);
});

test('v0.69.26+ manual board release metadata stays aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  const version=pkg.version.replace(/\./g,'\\.');
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=7007);
  assert.match(gradle,new RegExp("versionName '"+version+"'"));
  assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.ok((html.match(new RegExp('v'+version,'g'))||[]).length>=2);
});
