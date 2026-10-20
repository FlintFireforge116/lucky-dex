'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');const js=fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-fishing.js'),'utf8');
test('Fishing feedback is no longer coupled to the activity footer row',()=>{assert.doesNotMatch(js,/controlsMarkup|s\.controls|data-activity-controls/);assert.match(js,/adv-fishing-inline-anchor/)});
test('Oh! A bite remains a tappable A-style inline control',()=>{assert.match(js,/Oh! A bite!/);assert.match(js,/data-fish-hook/);assert.match(js,/adv-fishing-inline-a/)});
test('ready state still offers rod choice and CAST LINE in the inline card',()=>{assert.match(js,/adv-fish-rods/);assert.match(js,/data-fish-cast>CAST LINE/)});
