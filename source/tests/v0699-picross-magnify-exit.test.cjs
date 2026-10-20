'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const js=fs.readFileSync(path.join(ASSETS,'arcade-picross.js'),'utf8');

test('Picross Magnify always enters in PAN and remembers the drawing tool',()=>{
  assert.match(js,/let\s+focusPreviousTool\s*=\s*['"]fill['"]/);
  assert.match(js,/function\s+openFocusMode\s*\([^)]*\)[\s\S]{0,700}focusPreviousTool\s*=\s*tool===['"]x['"]\?['"]x['"]:['"]fill['"]/);
  assert.match(js,/function\s+openFocusMode\s*\([^)]*\)[\s\S]{0,900}setTool\(['"]pan['"]\)/);
});

test('Picross restores the previous drawing tool when DONE closes Magnify',()=>{
  assert.match(js,/function\s+closeFocusMode\s*\([^)]*\)[\s\S]{0,900}setTool\(focusPreviousTool\)/);
});

test('Picross resets the normal board viewport after Magnify geometry is restored',()=>{
  assert.match(js,/function\s+resetBoardViewport\s*\(/);
  assert.match(js,/resetBoardViewport[\s\S]{0,500}scrollLeft\s*=\s*0/);
  assert.match(js,/resetBoardViewport[\s\S]{0,650}scrollTop\s*=\s*0/);
  assert.match(js,/function\s+closeFocusMode\s*\([^)]*\)[\s\S]{0,1200}applyBoardGeometry\(\)[\s\S]{0,500}resetBoardViewport\(\)/);
});
