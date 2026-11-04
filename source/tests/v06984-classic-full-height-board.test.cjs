'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle.css'),'utf8');

test('Classic uses extra screen height for player playmat, not expanding the hand lane',()=>{
  assert.match(css,/\.tcgp-live-arena\.format-classic\s*\{[^}]*grid-template-rows:\s*56px\s+var\(--tcgp-mat-h\)\s+34px\s+minmax\(0,1fr\)\s+118px\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\.format-classic\s*>\s*\.tcgp-live-player\.tcgp-live-mat-half\s*\{[^}]*height:\s*100%\s*!important;[^}]*max-height:\s*none\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\.format-classic\s*>\s*\.tcgp-live-player-bottom\s*\{[^}]*height:\s*118px\s*!important/s);
});

test('Classic active and Bench are vertically separated; Narrow Gym keeps both playable slots',()=>{
  assert.match(css,/\.tcgp-live-arena\.format-classic\s+\.tcgp-live-player-active\s*\{[^}]*top:\s*5%\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\.format-classic\s+\.tcgp-live-player-bench\s*\{[^}]*bottom:\s*5%\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\.format-classic\.narrow-gym\s+\.tcgp-live-player-bench[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)\s*!important/s);
});

test('Pocket mat retains its established grid; Classic formatting does not alter gameplay',()=>{
  assert.match(css,/\.tcgp-live-arena\s*\{\s*grid-template-rows:56px var\(--tcgp-mat-h\) 34px var\(--tcgp-mat-h\) minmax\(118px,1fr\)!important;/);
  const battleUi=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle-ui.js'),'utf8');
  assert.match(battleUi,/narrowGym=classic&&currentBattle\.stadium\?\.cardId==='gym1-124'/);
});
