const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const core=require(path.join(ASSETS,'arcade-picross-core.js'));

test('Picross can hydrate an already-cleared puzzle as a locked solved board',()=>{
  const puzzle={resource_id:'P',width:3,height:2,solution_rows:['101','010']};
  const board=core.createSolvedBoard(puzzle,{timeMs:12345,bestMistakes:4,completedAt:777});
  assert.deepEqual(board.cells,[['fill','x','fill'],['x','fill','x']]);
  assert.equal(board.completedAt,777);
  assert.equal(board.startedAt,777-12345);
  assert.equal(board.mistakes,4);
  assert.equal(core.isSolved(board),true);
  assert.deepEqual(board.history,[]);
});

test('Picross first-clear payouts make larger puzzles meaningfully rewarding without mistake penalties',()=>{
  assert.equal(core.firstClearCoins({width:5,height:5}),60);
  assert.equal(core.firstClearCoins({width:10,height:10}),150);
  assert.equal(core.firstClearCoins({width:15,height:15}),300);
  assert.equal(core.firstClearCoins({width:20,height:15}),450);
});

test('Opening a completed Picross level uses solved review mode and offers an explicit replay',()=>{
  const js=fs.readFileSync(path.join(ASSETS,'arcade-picross.js'),'utf8');
  assert.match(js,/createSolvedBoard/);
  assert.match(js,/REPLAY PUZZLE/);
  assert.match(js,/completed\?\./);
});
