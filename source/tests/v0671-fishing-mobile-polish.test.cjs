'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets','adventure');
const css=fs.readFileSync(path.join(root,'adventure-activities.css'),'utf8');
const shell=fs.readFileSync(path.join(root,'adventure-activity-shell.js'),'utf8');
const fishing=fs.readFileSync(path.join(root,'adventure-fishing.js'),'utf8');

test('shared activity shell keeps controls in the dedicated footer row and always styles the help overlay',()=>{
  assert.match(css,/\.adv-activity-controls\{[^}]*position:\s*relative/,'activity controls should live in the footer row rather than a sticky overlay');
  assert.doesNotMatch(css,/\.adv-activity-controls\{[^}]*position:\s*sticky/,'fishing controls must not float mid-screen on phones');
  assert.match(shell,/modal\.className='adv-activity-help'/,'help overlay should always receive the shared modal styling');
});

test('fishing exposes a bottom control stack with chunky rod buttons and a more game-like water scene',()=>{
  assert.match(fishing,/class="adv-fish-control-stack"/,'fishing controls should render inside a dedicated bottom stack');
  assert.match(css,/\.adv-fish-control-stack\{[^}]*display:\s*grid/,'bottom control stack should use a stable vertical layout');
  assert.match(css,/\.adv-fish-rods\{[^}]*display:\s*grid/,'rod buttons should sit in a compact grid instead of a cramped inline row');
  assert.match(css,/\.adv-fishing-water\{[^}]*repeating-linear-gradient/,'water scene should use a richer Gen 3 style treatment');
});
