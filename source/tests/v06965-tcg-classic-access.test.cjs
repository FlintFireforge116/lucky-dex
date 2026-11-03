'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const assets=path.join(root,'app/src/main/assets');
const ui=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');

test('Classic TCG deck persistence module is shipped',()=>{
  assert.equal(fs.existsSync(path.join(assets,'tcg-classic-decks.js')),true,'tcg-classic-decks.js must exist because index.html loads it');
});

test('Battle Lab exposes an explicit Classic TCG route and builder',()=>{
  assert.match(ui,/CLASSIC TCG/);
  assert.match(ui,/format-classic/);
  assert.match(ui,/classic-build/);
  assert.match(ui,/classic-practice/);
  assert.match(ui,/format:'classic'/);
  assert.match(html,/CARD BATTLES/);
});

test('shared battle data bridges Base Set cards without adding them to the Pocket catalogue',()=>{
  const data=require('../app/src/main/assets/tcgp-battle-data.js');
  assert.ok(data.CLASSIC?.cardById('base1-4'));
  assert.equal(data.cardById('base1-4')?.name,'Charizard');
  assert.equal(data.CARDS.some(card=>String(card.id).startsWith('base1-')),false,'Pocket deck catalogue must remain Pocket-only');
});

test('Classic deck builder persists an owned 30-card Base Set deck and exposes it as active',()=>{
  const classicDecks=require('../app/src/main/assets/tcg-classic-decks.js');
  const counts=new Map();for(const id of classicDecks.LOANER_DECK)counts.set(id,(counts.get(id)||0)+1);
  const cards={};for(const [id,count] of counts){cards[id]={id,source:'tcg',setId:'base1',name:id,count};}
  const state={cards};
  const rows=classicDecks.ownedRows(cards);
  const saved=classicDecks.saveDraft(state,{name:'Base Set Test',cards:classicDecks.LOANER_DECK.slice()},rows);
  assert.equal(saved.ok,true);
  assert.equal(saved.readiness.ok,true);
  assert.equal(saved.deck.cards.length,30);
  assert.equal(classicDecks.activeDeck(state,rows)?.name,'Base Set Test');
});

test('Classic Battle Lab uses five Prize cards and summary scoring reads prizes instead of Pocket points',()=>{
  const classicDecks=require('../app/src/main/assets/tcg-classic-decks.js');
  const core=require('../app/src/main/assets/tcgp-battle-core.js');
  const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
  const cards=classicDecks.LOANER_DECK.slice(),energy=classicDecks.analyzeDeck(cards).recommendedEnergyTypes;
  const battle=core.createBattle({format:'classic',playerDeck:cards,opponentDeck:cards,playerEnergyTypes:energy,opponentEnergyTypes:energy,seed:69});
  assert.equal(battle.sides.player.prizes.length,5);
  assert.equal(battle.sides.opponent.prizes.length,5);
  battle.sides.player.prizesTaken=2;battle.sides.player.points=0;
  const summary=ui._test.battleSummaryStats(battle);
  assert.equal(summary.playerPoints,2);
});

test('v0.69.65 Classic integration remains present in later releases',()=>{
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const runtime=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const code=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
  const name=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
  assert.ok(code>=7045);
  assert.ok(name&&name.localeCompare('0.69.65',undefined,{numeric:true})>=0);
  assert.ok(runtime.includes(`window.__LUCKYDEX_BUILD='${name}'`));
  assert.ok(html.includes(`LUCKY DEX · v${name}`));
});
