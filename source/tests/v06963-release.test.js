'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const app=read('app/src/main/assets/app-v0167.js');
const html=read('app/src/main/assets/index.html');
const ui=read('app/src/main/assets/tcgp-battle-ui.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');

test('release markers remain at or beyond v0.69.63 and agree',()=>{
  const runtime=/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/.exec(app)?.[1];
  const visible=/LUCKY DEX · v(0\.69\.\d+)/.exec(html)?.[1];
  assert.ok(runtime&&visible);assert.equal(runtime,visible);assert.ok(Number(runtime.split('.').at(-1))>=63);
});

test('Classic modules load before the shared Pocket battle data and UI',()=>{
  const base=html.indexOf('tcg-classic-base1.js');
  const battleData=html.indexOf('tcg-classic-battle-data.js');
  const classicDecks=html.indexOf('tcg-classic-decks.js');
  const sharedData=html.indexOf('tcgp-battle-data.js');
  const battleUi=html.indexOf('tcgp-battle-ui.js');
  assert.ok(base>=0&&battleData>base&&classicDecks>battleData&&sharedData>classicDecks&&battleUi>sharedData);
});

test('Base Set catalogue and Classic30 practice are available without weakening compatibility gates',()=>{
  const coverage=classic.coverage();
  assert.equal(coverage.total,102);
  assert.equal(decks.LOANER_DECK.length,30);
  assert.equal(classic.validateDeck(decks.LOANER_DECK).ok,true);
  assert.equal(coverage.FULL+coverage.PARTIAL+coverage.UNSUPPORTED,102,'Base Set coverage classifications must remain exhaustive');
  assert.match(ui,/CLASSIC TCG/);
  assert.match(ui,/format-classic/);
  assert.match(ui,/classic-practice/);
  assert.match(ui,/format:'classic'/);
});
