'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=name=>fs.readFileSync(path.join(ASSETS,name),'utf8');

test('Picross exposes a fullscreen focus mode with zoom controls',()=>{
  const html=read('index.html');
  const js=read('arcade-picross.js');
  const css=read('arcade-picross.css');
  assert.match(html,/id="picrossFocusBtn"[^>]*>[^<]*(?:MAGNIFY|FOCUS)/i);
  assert.match(html,/id="picrossFocusBar"/);
  assert.match(html,/id="picrossFocusClose"/);
  assert.match(html,/id="picrossZoomOut"/);
  assert.match(html,/id="picrossZoomIn"/);
  assert.match(html,/id="picrossZoomLabel"/);
  assert.match(js,/function openFocusMode/);
  assert.match(js,/function closeFocusMode/);
  assert.match(js,/function changeFocusZoom/);
  assert.match(css,/\.picross-puzzle-view\.picross-focus-mode\s*\{/);
});

test('Picross focus mode keeps row and column clues visible while the large board scrolls',()=>{
  const css=read('arcade-picross.css');
  assert.match(css,/\.picross-focus-mode \.picross-board-wrap[\s\S]*overflow:auto/);
  assert.match(css,/\.picross-focus-mode \.picross-column-clue[\s\S]*position:sticky[\s\S]*top:0/);
  assert.match(css,/\.picross-focus-mode \.picross-row-clue[\s\S]*position:sticky[\s\S]*left:0/);
  assert.match(css,/\.picross-focus-mode \.picross-corner[\s\S]*position:sticky[\s\S]*top:0[\s\S]*left:0/);
});

test('Picross focus zoom increases touch targets without changing puzzle state',()=>{
  const js=read('arcade-picross.js');
  assert.match(js,/FOCUS_CELL_SIZES\s*=\s*\[[^\]]*24[^\]]*32[^\]]*40[^\]]*\]/);
  assert.match(js,/focusZoomIndex/);
  assert.match(js,/applyBoardGeometry\(/);
  assert.doesNotMatch(js,/changeFocusZoom[\s\S]{0,500}core\.reset\(/);
});


test('Picross focus mode provides an explicit pan tool for moving around enlarged boards by touch',()=>{
  const html=read('index.html');
  const js=read('arcade-picross.js');
  const css=read('arcade-picross.css');
  assert.match(html,/data-picross-tool="pan"/);
  assert.match(js,/tool==='pan'/);
  assert.match(js,/setTool\(next\)[\s\S]{0,420}pan/);
  assert.match(css,/\.picross-focus-mode\.picross-pan-mode \.picross-board[\s\S]*touch-action:pan-x pan-y/);
});
test('TCG Pocket 10-pack enters the normal cinematic reveal flow instead of jumping to summary',()=>{
  const flow=read('pack-flow-v0165.js');
  assert.match(flow,/async function startPocketTenPackReveal/);
  assert.match(flow,/if\(Number\(pack\.packCount\|\|1\)>1\)\{await startPocketTenPackReveal\(run,pack\);return;\}/);
  assert.doesNotMatch(flow,/if\(Number\(pack\.packCount\|\|1\)>1\)\{renderPocketTenPackSummary\(\);return;\}/);
});

test('Each batch booster gets its own Rare Pack or God Pack intro at the pack boundary',()=>{
  const flow=read('pack-flow-v0165.js');
  assert.match(flow,/function pocketTenPackGroupAtIndex/);
  assert.match(flow,/async function playPocketTenPackGroupIntro/);
  assert.match(flow,/group\.godPack[\s\S]{0,220}playGodPackIntroV0291/);
  assert.match(flow,/group\.luckyPack[\s\S]{0,220}playRarePackIntroV04030/);
  assert.match(flow,/nextGroup\.groupIndex!==currentGroup\.groupIndex[\s\S]{0,260}playPocketTenPackGroupIntro/);
});

test('Batch card reveal shows per-pack progress while retaining the combined 10-pack summary',()=>{
  const flow=read('pack-flow-v0165.js');
  assert.match(flow,/PACK \$\{groupInfo\.groupIndex\+1\} \/ \$\{pack\.packGroups\.length\}/);
  assert.match(flow,/index:groupInfo\?groupInfo\.localIndex:index/);
  assert.match(flow,/count:groupInfo\?groupInfo\.cards\.length:pack\.cards\.length/);
  assert.match(flow,/function renderPocketTenPackSummary/);
});
