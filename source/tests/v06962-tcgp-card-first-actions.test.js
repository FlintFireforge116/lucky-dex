'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');

test('player Pokemon tap opens a temporary Pokemon action surface while opponent tap still inspects',()=>{
  const source=ui();
  assert.match(source,/data-tcgp-action="open-pokemon-actions"/);
  assert.match(source,/function livePokemonActionsOverlayHtml\(/);
  assert.match(source,/battleOverlay!?={0,2}'pokemon-actions'|battleOverlay!='pokemon-actions'/);
  assert.match(source,/side!=='player'.*inspectAttrs/s);
});

test('battlefield no longer renders the permanent Active action dock',()=>{
  const source=ui();
  assert.doesNotMatch(source,/<section class="tcgp-live-player-actions"/);
  assert.match(source,/livePokemonActionsOverlayHtml\(\)/);
});

test('Pokemon action sheet offers card info alongside contextual actions',()=>{
  const source=ui();
  assert.match(source,/tcgp-live-pokemon-action-sheet/);
  assert.match(source,/data-tcgp-action="inspect-pokemon-from-actions"/);
});

test('player board cards are larger than CPU cards while remaining card-shaped',()=>{
  const styles=css();
  assert.match(styles,/\/\* v0\.69\.62 Pocket-style card focus/);
  assert.match(styles,/\.tcgp-live-player-active\{[^}]*width:15\.5%/s);
  assert.match(styles,/\.tcgp-live-player-bench\{[^}]*width:49%/s);
  assert.match(styles,/\.tcgp-live-opponent-active\{[^}]*width:11\.5%/s);
  assert.match(styles,/\.tcgp-live-opponent-bench\{[^}]*width:39%/s);
});

test('removing persistent actions also removes the dedicated action grid row',()=>{
  const styles=css();
  assert.match(styles,/grid-template-rows:56px var\(--tcgp-mat-h\) 34px var\(--tcgp-mat-h\) minmax\(118px,1fr\)!important/);
  assert.match(styles,/\.tcgp-live-player-actions\{display:none!important\}/);
});
