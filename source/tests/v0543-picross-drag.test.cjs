const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const core=require(path.join(ASSETS,'arcade-picross-core.js'));

test('fast Picross drag interpolation includes every crossed cell',()=>{
  assert.deepEqual(core.cellsBetween(0,0,5,0),[
    {x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},
  ]);
  assert.deepEqual(core.cellsBetween(0,0,3,3),[
    {x:0,y:0},{x:1,y:1},{x:2,y:2},{x:3,y:3},
  ]);
});

test('Picross drag cannot overwrite the opposite mark',()=>{
  assert.equal(core.dragMarkAllowed('blank','fill','fill'),true);
  assert.equal(core.dragMarkAllowed('x','fill','fill'),false);
  assert.equal(core.dragMarkAllowed('fill','x','x'),false);
  assert.equal(core.dragMarkAllowed('fill','fill','blank'),true);
  assert.equal(core.dragMarkAllowed('x','fill','blank'),false);
  assert.equal(core.dragMarkAllowed('x','x','blank'),true);
});

test('tap can deliberately replace an opposite mark',()=>{
  const board=core.createBoard({width:1,height:1,solution_rows:['1']},1000);
  core.setMark(board,0,0,'x',1001);
  assert.equal(board.cells[0][0],'x');
  const result=core.setMark(board,0,0,'fill',1002);
  assert.equal(result.accepted,true);
  assert.equal(board.cells[0][0],'fill');
});

test('Picross UI uses interpolated drag paths and drag-only overlap guard',()=>{
  const js=fs.readFileSync(path.join(ASSETS,'arcade-picross.js'),'utf8');
  assert.match(js,/core\.cellsBetween\(/);
  assert.match(js,/core\.dragMarkAllowed\(/);
  assert.match(js,/function\s+tapCell\s*\(/);
});
