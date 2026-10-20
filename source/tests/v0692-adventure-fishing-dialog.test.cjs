'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const js=fs.readFileSync(path.join(root,'adventure','adventure-fishing.js'),'utf8');
const css=fs.readFileSync(path.join(root,'adventure','adventure-activities.css'),'utf8');

test('Gen III fishing dialogue is kept out of the scrollable map body',()=>{
  assert.doesNotMatch(js,/adv-fishing-gen3-ripple[^`]*\$\{dialogMarkup\(s\)\}/s);
  assert.match(js,/function controlsMarkup\(s\)\{if\(s\.phase!==['"]ready['"]\)return dialogMarkup\(s\)/);
});

test('Gen III fishing dialogue fills the fixed activity controls row',()=>{
  const block=css.match(/\.adv-fishing-gen3-dialog\{([^}]*)\}/)?.[1]||'';
  assert.match(block,/position\s*:\s*relative/);
  assert.match(block,/width\s*:\s*100%/);
  assert.match(block,/box-sizing\s*:\s*border-box/);
});

test('tappable bite dialog remains full-width on narrow screens',()=>{
  const block=css.match(/\.adv-fishing-gen3-dialog\.is-action\{([^}]*)\}/)?.[1]||'';
  assert.match(block,/width\s*:\s*100%/);
});
