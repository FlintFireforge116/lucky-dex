'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const core=require(path.join(ASSETS,'arcade-picross-core.js'));
const js=fs.readFileSync(path.join(ASSETS,'arcade-picross.js'),'utf8');

test('normal Picross geometry fits a 20-column board inside a phone viewport',()=>{
  assert.equal(typeof core.normalBoardGeometry,'function');
  const g=core.normalBoardGeometry(20,7,344);
  assert.ok(g.cell>=12,'normal cells stay readable');
  assert.ok(g.rowClue>=36,'row clues retain usable width');
  assert.ok(g.totalWidth<=344,`board width ${g.totalWidth} must fit 344px viewport`);
});

test('normal Picross geometry never overflows even on a very narrow phone viewport',()=>{
  const g=core.normalBoardGeometry(20,7,280);
  assert.ok(g.totalWidth<=280,`board width ${g.totalWidth} must fit 280px viewport`);
});

test('normal Picross geometry can use larger cells on smaller puzzles',()=>{
  const g=core.normalBoardGeometry(10,4,344);
  assert.ok(g.cell>12);
  assert.ok(g.cell<=27);
  assert.ok(g.totalWidth<=344);
});

test('leaving Magnify reapplies fitted normal geometry after layout and recentres the viewport',()=>{
  assert.match(js,/function\s+settleNormalBoardLayout\s*\(/);
  assert.match(js,/settleNormalBoardLayout[\s\S]{0,900}requestAnimationFrame/);
  assert.match(js,/settleNormalBoardLayout[\s\S]{0,900}applyBoardGeometry\(\)/);
  assert.match(js,/function\s+centerBoardViewport\s*\([^)]*\)[\s\S]{0,700}scrollWidth[\s\S]{0,200}clientWidth/);
  assert.match(js,/function\s+closeFocusMode\s*\([^)]*\)[\s\S]{0,1200}settleNormalBoardLayout\(\)/);
});
