const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const core=require(path.join(ASSETS,'arcade-picross-core.js'));
const js=fs.readFileSync(path.join(ASSETS,'arcade-picross.js'),'utf8');

test('Picross maps viewport coordinates to cached grid cell rectangles',()=>{
  const xs=[{min:100,max:120},{min:120,max:140},{min:140,max:160}];
  const ys=[{min:200,max:220},{min:220,max:240}];
  assert.deepEqual(core.gridCellAtPoint(xs,ys,151,231),{x:2,y:1});
  assert.deepEqual(core.gridCellAtPoint(xs,ys,100,200),{x:0,y:0});
  assert.equal(core.gridCellAtPoint(xs,ys,80,231),null);
});

test('Picross swipe code uses board geometry and coalesced Android pointer samples',()=>{
  assert.match(js,/function\s+captureDragGeometry\s*\(/);
  assert.match(js,/core\.gridCellAtPoint\(/);
  assert.match(js,/getCoalescedEvents/);
  assert.doesNotMatch(js,/document\.elementFromPoint/);
});

test('Picross only treats a gesture as a tap below a movement threshold',()=>{
  assert.match(js,/tapThresholdPx/);
  assert.match(js,/Math\.hypot\(/);
  assert.match(js,/drag\.travel/);
});
