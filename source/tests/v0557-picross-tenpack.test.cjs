'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=name=>fs.readFileSync(path.join(ASSETS,name),'utf8');

test('Picross area cards use a non-overlapping header/footer layout and two columns on phones',()=>{
  const js=read('arcade-picross.js');
  const css=read('arcade-picross.css');
  assert.match(js,/picross-area-card-head/);
  assert.match(js,/picross-area-card-progress/);
  assert.match(js,/picross-area-card-action/);
  assert.match(css,/\.picross-area-card-head/);
  assert.match(css,/\.picross-area-card-progress/);
  assert.match(css,/@media\(max-width:520px\)[\s\S]*\.picross-area-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('TCG Pocket exposes a dedicated 10-pack control at exactly ten times the single-pack price',()=>{
  const html=read('index.html');
  const app=read('app-v0167.js');
  assert.match(html,/id="openTenPackBtn"[^>]*>[\s\S]*?4,500 COINS/);
  assert.match(app,/PACK_COST\s*=\s*\{tcgp:450\}/);
  assert.match(app,/TCGP_TEN_PACK_COUNT\s*=\s*10/);
  assert.match(app,/function pocketTenPackCost/);
  assert.match(app,/singleCost\s*\*\s*TCGP_TEN_PACK_COUNT/);
  assert.match(app,/openTenPackBtn/);
});

test('Pocket 10-pack construction rolls ten independent packs and preserves pack boundaries',()=>{
  const flow=read('pack-flow-v0165.js');
  assert.match(flow,/async function preparePocketTenPack/);
  assert.match(flow,/for\s*\(let\s+i=0;\s*i<TCGP_TEN_PACK_COUNT;\s*i\+\+\)/);
  assert.match(flow,/packGroups\.push\(\{cards,\s*luckyPack,\s*godPack\}\)/);
  assert.match(flow,/packCount:TCGP_TEN_PACK_COUNT/);
  assert.match(flow,/packGroups/);
});

test('Batch commit counts ten packs while keeping per-pack loaded-hit and rare-event accounting',()=>{
  const app=read('app-v0167.js');
  assert.match(app,/const\s+packGroups=preparedPack\.packGroups/);
  assert.match(app,/state\.stats\.packs\+=packCount/);
  assert.match(app,/bumpDaily\('packs',packCount\)/);
  assert.match(app,/Math\.max\([^\n]*\.\.\.packGroups\.map/);
  assert.match(app,/godPackCount/);
  assert.match(app,/luckyPackCount/);
});

test('10-pack summary groups the 50 cards by their original boosters',()=>{
  const flow=read('pack-flow-v0165.js');
  assert.match(flow,/function renderPocketTenPackSummary/);
  assert.match(flow,/PACK \$\{index\+1\}/);
  assert.match(flow,/10 PACKS COMPLETE/);
});
