'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

const html=read('index.html');
const css=read('arcade-fishing.css');
const js=read('arcade-fishing.js');
const help=read('arcade-help.js');

test('Fishing separates setup from the focused play screen and uses one context-sensitive action button',()=>{
  assert.match(html,/id="fishingSetupView"/);
  assert.match(html,/id="fishingPlayView"[^>]*hidden/);
  assert.match(html,/id="fishingStartBtn"/);
  assert.match(html,/id="fishingActionBtn"/);
  assert.doesNotMatch(html,/id="fishingReelBtn"/);
  assert.doesNotMatch(html,/id="fishingCastBtn"/);
  assert.match(html,/id="fishingChangeSpotBtn"/);
  assert.match(help,/START FISHING/);
  assert.match(help,/same action button/i);
});

test('Fishing play layout makes the catch lane primary with a vertical progress meter and background art',()=>{
  assert.match(html,/class="fishing-play-scene"/);
  assert.match(html,/id="fishingProgressFill"/);
  assert.match(css,/\.fishing-catch-stage\{[^}]*grid-template-columns:[^;}]*minmax\(0,1fr\)[^;}]*[0-9]+px/);
  assert.match(css,/\.fishing-progress\{[^}]*width:[^;}]*[0-9]+px[^}]*height:/);
  assert.match(css,/\.fishing-progress i\{[^}]*height:/);
  assert.match(css,/\.fishing-play-scene\{[^}]*background-image:/);
});

test('hidden Fishing subviews always stay hidden instead of bleeding into one another',()=>{
  assert.match(css,/\.fishing-game \[hidden\]\{display:none!important\}/);
});

test('Angler log exposes independent search, filters and ordering controls',()=>{
  for(const id of ['fishingBookSearch','fishingBookRegion','fishingBookCategory','fishingBookStatus','fishingBookSort'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(js,/filterBookRows/);
  assert.match(js,/best-value/);
  assert.match(js,/largest/);
});
