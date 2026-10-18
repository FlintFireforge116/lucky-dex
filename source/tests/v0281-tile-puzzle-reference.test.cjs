'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('app/src/main/assets/index.html');
const css=read('app/src/main/assets/arcade-amie.css');
const js=read('app/src/main/assets/arcade-amie.js');

assert.match(html,/id="tilePuzzleReferenceBtn"/,'Tile Puzzle must expose a tappable completed-picture reference');
assert.match(html,/id="tilePuzzleReferenceOverlay"[^>]*hidden/,'Tile Puzzle must include a hidden enlarged-reference overlay');
assert.match(html,/id="tilePuzzleReferenceLarge"/,'Tile Puzzle enlarged overlay must contain its own reference image');
assert.match(html,/id="tilePuzzleReferenceClose"/,'Tile Puzzle enlarged reference must have an explicit close control');

assert.match(js,/function prepareTile\(running=false,sceneOverride=null\)/,'prepareTile must accept the scene already previewed');
assert.match(js,/const scene=sceneOverride\|\|pickTileScene\(\)/,'prepareTile must reuse the preview scene instead of always selecting again');
assert.match(js,/function startTile\(\)\{[^\n]*const scene=tile\?\.finished\?null:tile\?\.scene;[^\n]*dispose\(tile\);[^\n]*prepareTile\(true,scene\)/,'starting the puzzle must carry the preview scene into the running board');
assert.match(js,/tilePuzzleGame[^\n]*classList\.toggle\('is-running'/,'Tile Puzzle must expose ready/running state to its responsive layout');
assert.match(js,/tilePuzzleReferenceBtn[^\n]*addEventListener\('click'/,'reference preview must open from a tap/click');
assert.match(js,/tilePuzzleReferenceClose[^\n]*addEventListener\('click'/,'enlarged reference must close without restarting the puzzle');
assert.match(js,/tilePuzzleReferenceLarge[^\n]*\.src=target\.src/,'enlarged reference must use the exact image shown by the in-game reference');

assert.match(css,/#tilePuzzleGame:not\(\.is-running\)[\s\S]*?\.tile-target-mini img[\s\S]*?width:min\(100%,?\s*?340px\)/,'ready state should show a large study image');
assert.match(css,/#tilePuzzleGame\.is-running[\s\S]*?\.tile-target-mini img[\s\S]*?width:clamp\(120px,?\s*?42vw,?\s*?180px\)/,'running state should keep a phone-usable reference');
assert.match(css,/#tilePuzzleGame\.is-running\s+#tilePuzzleModes\s*\{[^}]*display:none/,'running layout should hide setup-only difficulty controls to preserve board space');
assert.match(css,/\.tile-reference-overlay\{[^}]*position:fixed[^}]*inset:0/,'enlarged reference must use a fullscreen overlay');

console.log('PASS v0.28.1 Tile Puzzle scene-lock and reference-layout contract');
