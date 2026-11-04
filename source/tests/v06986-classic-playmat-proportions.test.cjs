'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle.css'),'utf8');

test('Classic taller player playmat preserves image proportions rather than scaling to 100% x 200%',()=>{
  assert.match(css,/\.tcgp-live-arena\.format-classic\s*>\s*\.tcgp-live-player\.tcgp-live-mat-half\s*\{[^}]*background-size:\s*cover\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\.format-classic\s*>\s*\.tcgp-live-player\.tcgp-live-mat-half\s*\{[^}]*background-position:\s*center\s+bottom\s*!important/s);
});

test('Pocket and opponent playmats retain their previous presentation',()=>{
  assert.match(css,/\.tcgp-live-mat-half\.tcgp-live-opponent\{background-position:center top!important\}/);
  assert.match(css,/\.tcgp-live-mat-half\{[^}]*background-size:100% 200%!important/s);
  assert.match(css,/html\.android-native-inset body\.tcgp-battle-live \.tcgp-live-arena\.format-classic\{[^}]*padding-bottom:6px!important/s);
});
