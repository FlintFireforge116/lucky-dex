'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
const ui=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');

test('v06961 battlefield reset owns the six vertical regions explicitly',()=>{
  const s=css();
  assert.match(s,/\/\* v0\.69\.61 battlefield reset[\s\S]*?\.tcgp-live-arena\{[^}]*grid-template-rows:\s*56px\s+var\(--tcgp-mat-h\)\s+34px\s+var\(--tcgp-mat-h\)\s+auto\s+minmax\(118px,1fr\)/s);
  assert.match(s,/\.tcgp-live-opponent-top\{[^}]*grid-row:1[^}]*position:relative!important/s);
  assert.match(s,/\.tcgp-live-opponent\.tcgp-live-mat-half\{[^}]*grid-row:2/s);
  assert.match(s,/\.tcgp-live-mid\{[^}]*grid-row:3/s);
  assert.match(s,/\.tcgp-live-player\.tcgp-live-mat-half\{[^}]*grid-row:4/s);
  assert.match(s,/\.tcgp-live-player-actions\{[^}]*grid-row:5/s);
  assert.match(s,/\.tcgp-live-player-bottom\{[^}]*grid-row:6[^}]*position:relative!important/s);
});

test('both playmat halves have one explicit width-derived height and card-shaped slots',()=>{
  const s=css();
  assert.match(s,/--tcgp-mat-h:calc\(var\(--tcgp-board-w\) \* \.5\)/);
  assert.match(s,/\.tcgp-live-mat-half\{[^}]*height:var\(--tcgp-mat-h\)!important[^}]*aspect-ratio:auto!important/s);
});

test('mat Pokemon slots are card-shaped wrappers instead of percentage-height boxes',()=>{
  const s=css();
  assert.match(s,/\.tcgp-live-mat-half \.tcgp-live-card-wrap\{[^}]*height:auto!important[^}]*aspect-ratio:2\.5\s*\/\s*3\.5/s);
  assert.match(s,/\.tcgp-live-opponent-active,\.tcgp-live-player-active\{[^}]*width:12%[^}]*height:auto!important/s);
  assert.match(s,/\.tcgp-live-opponent-bench,\.tcgp-live-player-bench\{[^}]*width:42%[^}]*height:auto!important/s);
});

test('hand row is visually and physically clipped outside the mat',()=>{
  const s=css();
  assert.match(s,/\.tcgp-live-player-bottom\{[^}]*overflow:hidden!important[^}]*background:/s);
  assert.match(s,/\.tcgp-live-player-bottom \.tcgp-live-hand\{[^}]*height:112px!important/s);
});

test('tools stay on the lower-right edge of the Pokemon card footprint',()=>{
  const s=css();
  assert.match(s,/\.tcgp-live-card-wrap \.tcgp-live-tool-stack\{[^}]*right:-20px!important[^}]*bottom:3px!important/s);
});

test('stadium is detached at far right and does not share active card coordinates',()=>{
  const s=css();
  assert.match(s,/\.tcgp-live-player>\.tcgp-live-stadium-slot\{[^}]*right:2%[^}]*top:8%/s);
});

test('active controls are temporary overlays and centre drop fallback remains absent',()=>{
  const source=ui();
  assert.match(source,/tcgp-live-pokemon-action-sheet/);
  assert.doesNotMatch(source,/<section class="tcgp-live-player-actions"/);
  assert.doesNotMatch(source,/data-card-play-zone=["']1["']/);
});
