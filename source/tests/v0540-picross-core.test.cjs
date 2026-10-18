const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..','app','src','main','assets');

const loadCore=()=>require(path.join(ROOT,'arcade-picross-core.js'));

test('Picross core derives standard nonogram clues including empty lines',()=>{
  const core=loadCore();
  assert.deepEqual(core.cluesForLine('0011100110'),[3,2]);
  assert.deepEqual(core.cluesForLine('00000'),[0]);
  assert.deepEqual(core.cluesForRows(['101','111']),[[1,1],[3]]);
  assert.deepEqual(core.cluesForColumns(['101','111']),[[2],[1],[2]]);
});

test('Picross board rejects incorrect fills, auto-marks them X, and tracks mistakes',()=>{
  const core=loadCore();
  const puzzle={resource_id:'T',width:3,height:2,solution_rows:['101','010']};
  const board=core.createBoard(puzzle,0);
  const miss=core.applyMark(board,1,0,'fill',250);
  assert.equal(miss.accepted,true);
  assert.equal(miss.mistake,true);
  assert.equal(board.cells[0][1],'x');
  assert.equal(board.mistakes,1);
  const hit=core.applyMark(board,0,0,'fill',500);
  assert.equal(hit.mistake,false);
  assert.equal(board.cells[0][0],'fill');
});

test('Picross board supports X marks, erase/toggle, undo, and exact completion',()=>{
  const core=loadCore();
  const puzzle={resource_id:'T',width:2,height:2,solution_rows:['10','01']};
  const board=core.createBoard(puzzle,1000);
  core.applyMark(board,1,0,'x',1100);
  core.applyMark(board,0,0,'fill',1200);
  core.applyMark(board,0,1,'x',1300);
  assert.equal(core.isSolved(board),false);
  core.applyMark(board,1,1,'fill',1400);
  assert.equal(core.isSolved(board),true);
  assert.equal(core.elapsedMs(board,1500),400);
  assert.equal(core.undo(board),true);
  assert.equal(core.isSolved(board),false);
  assert.equal(board.cells[1][1],'blank');
});

test('Picross progress counts unique clears and completed areas',()=>{
  const core=loadCore();
  const areas=[
    {area:0,slots:[{resource_id:'A'},{resource_id:'B'}]},
    {area:1,slots:[{resource_id:'C'}]}
  ];
  const record={completed:{A:{timeMs:1000},B:{timeMs:2000},C:{timeMs:3000}}};
  assert.deepEqual(core.progressSummary(areas,record),{uniqueClears:3,totalStages:3,areasCleared:2,totalAreas:2});
  assert.ok(core.firstClearCoins({width:5,height:5})>=20);
  assert.ok(core.firstClearCoins({width:20,height:15})>core.firstClearCoins({width:5,height:5}));
});

test('Picross resolves individual clue numbers from visible marks only and can resolve them retroactively',()=>{
  const core=loadCore();
  const ambiguous=['blank','blank','blank','fill','fill','blank','blank','blank'];
  assert.deepEqual(core.resolvedCluesForLine(ambiguous,[2,2]),[false,false]);
  const narrowed=['x','x','x','fill','fill','blank','blank','blank'];
  assert.deepEqual(core.resolvedCluesForLine(narrowed,[2,2]),[true,false]);
  const fullyMarked=['x','x','x','fill','fill','x','fill','fill'];
  assert.deepEqual(core.resolvedCluesForLine(fullyMarked,[2,2]),[true,true]);
});

test('Picross clue resolution never needs the hidden solution grid',()=>{
  const core=loadCore();
  assert.deepEqual(core.resolvedCluesForLine(['fill','fill','x','blank','blank'],[2,1]),[true,false]);
  assert.deepEqual(core.resolvedCluesForLine(['x','x','x'],[0]),[true]);
  assert.deepEqual(core.resolvedCluesForLine(['blank','x','x'],[0]),[false]);
});
