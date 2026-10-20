'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const js=fs.readFileSync(path.join(root,'adventure','adventure-fishing.js'),'utf8');
const css=fs.readFileSync(path.join(root,'adventure','adventure-activities.css'),'utf8');

test('Gen III fishing dialogue is rendered inside the scene overlay instead of below the map',()=>{
  assert.match(js,/adv-fishing-gen3-ripple[^`]*<\/span>\$\{dialogMarkup\(s\)\}<\/div><\/div>/s,
    'dialogMarkup should be nested inside .adv-fishing-gen3-scene');
});

test('Gen III fishing dialogue is anchored visibly over the bottom of the scene',()=>{
  const block=css.match(/\.adv-fishing-gen3-dialog\{([^}]*)\}/)?.[1]||'';
  assert.match(block,/position\s*:\s*absolute/);
  assert.match(block,/z-index\s*:\s*[2-9]/);
  assert.match(block,/bottom\s*:/);
  assert.match(block,/left\s*:/);
  assert.match(block,/right\s*:/);
});

test('tappable bite dialog respects the scene overlay insets on narrow screens',()=>{
  const block=css.match(/\.adv-fishing-gen3-dialog\.is-action\{([^}]*)\}/)?.[1]||'';
  assert.match(block,/width\s*:\s*auto/);
});
