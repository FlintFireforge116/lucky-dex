'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets','adventure');
const css=fs.readFileSync(path.join(root,'adventure-activities.css'),'utf8');
const js=fs.readFileSync(path.join(root,'adventure-fishing.js'),'utf8');

test('fishing uses a dedicated scene card and body dialog instead of duplicate footer copy',()=>{
  assert.match(js,/class="adv-fish-scene-card"/,'fishing should render a dedicated scene card');
  assert.match(js,/class="adv-fishing-dialog"/,'fishing should render a body dialog/message box');
  assert.doesNotMatch(js,/adv-fish-control-hint/,'footer controls should not duplicate status copy');
});

test('fishing presentation styles lean on scene art and game-style windows',()=>{
  assert.match(css,/\.adv-fish-scene-card\{[^}]*image-rendering:\s*pixelated/,'scene card should preserve pixel-art presentation');
  assert.match(css,/\.adv-fishing-dialog\{[^}]*border:\s*3px solid/,'dialog should use a chunky game-style frame');
  assert.match(css,/\.adv-fishing-water-backdrop\{[^}]*object-fit:\s*cover/,'water panel should use place backdrop art');
  assert.match(css,/\.adv-activity-controls\{[^}]*background:\s*#0b1b2b/,'footer should be a solid dock to avoid visual overlap');
});
