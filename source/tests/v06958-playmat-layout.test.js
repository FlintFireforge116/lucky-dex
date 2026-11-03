'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

test('player and opponent halves can resolve different playmat art',()=>{
  const state={cosmetics:{unlockedPlaymats:['pocket-eevee','pocket-pikachu'],activePlaymat:'pocket-pikachu'}};
  assert.match(ui._test.playmatArtPath('player',state,{id:'x'}),/TCGP_Playmat_Pikachu\.png/);
  const cpu=ui._test.playmatArtPath('opponent',state,{id:'genetic-apex-beginner-ivysaur'});
  assert.match(cpu,/TCGP_Playmat_/);
});

test('battlefield markup applies playmat backgrounds to both halves',()=>{
  const src=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  assert.match(src,/tcgp-live-mat-half/);
  assert.match(src,/--tcgp-mat-image/);
});

test('playmat layout snaps active and bench wrappers to Pocket slot geometry while keeping visible slot outlines',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.match(css,/\.tcgp-live-mat-half\.tcgp-live-player[^}]*background-size:/s);
  assert.match(css,/\.tcgp-live-mat-half \.tcgp-live-card\.empty\{[^}]*border:1\.5px solid rgba\(255,255,255/s);
  assert.match(css,/\.tcgp-live-player-bench[^}]*position:absolute/s);
  assert.match(css,/\.tcgp-live-opponent-bench[^}]*position:absolute/s);
});

test('Tool stack is anchored to its card wrapper edge rather than board coordinates',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.match(css,/\.tcgp-live-card-wrap \.tcgp-live-tool-stack\{[^}]*right:/s);
  assert.ok(!/\.tcgp-live-tool-stack\{[^}]*left:calc\(50%/s.test(css.slice(css.lastIndexOf('v0.69.58'))),'latest Tool override must not be centre-relative');
});
