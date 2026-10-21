'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('app/src/main/assets/arcade-fishing.js','utf8');

test('spot cards distinguish unlock progress from full local completion',()=>{
  assert.match(src,/Spot unlock:/i);
  assert.match(src,/Unique here:/i);
  assert.match(src,/reachable caught/i);
  assert.doesNotMatch(src,/3\/3 local species · COMPLETE/);
});
