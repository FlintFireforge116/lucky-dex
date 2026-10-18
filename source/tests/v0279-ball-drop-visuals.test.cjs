'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js');
delete require.cache[modPath];
global.LuckyDexArcadePlatform={awardRun:({coins})=>({coinsAwarded:coins,itemAwarded:null})};
global.LuckyDexArcadeSession={update:()=>{},hideResult:()=>{},showResult:()=>true};
global.state={arcade:{bestBallDrop:0,ballDropJackpots:0}};
global.save=()=>{};
const b=require(modPath);

// Edge pegs should continue the same staggered lattice as the six-pin rows,
// rather than form a separate off-grid vertical rail.
{
  const pegs=b.pegs();
  const edges=pegs.filter(p=>p.edge);
  assert.ok(edges.length>=10,'expected edge pegs on alternating rows');
  assert.ok(edges.every(p=>p.row%2===0),'edge pegs should extend the six-pin rows');
  for(const row of [...new Set(edges.map(p=>p.row))]){
    const normal=pegs.filter(p=>p.row===row&&!p.edge).sort((a,c)=>a.x-c.x);
    const rowEdges=edges.filter(p=>p.row===row).sort((a,c)=>a.x-c.x);
    const spacing=normal[1].x-normal[0].x;
    assert.ok(Math.abs((normal[0].x-rowEdges[0].x)-spacing)<1.5,'left edge peg should continue row spacing');
    assert.ok(Math.abs((rowEdges[1].x-normal.at(-1).x)-spacing)<1.5,'right edge peg should continue row spacing');
    const leftGap=rowEdges[0].x-rowEdges[0].r;
    const rightGap=b.BOARD_CONFIG.width-(rowEdges[1].x+rowEdges[1].r);
    assert.ok(leftGap < b.BALL_COLLISION_RADIUS*2 && rightGap < b.BALL_COLLISION_RADIUS*2,'edge clearance must remain too tight to wedge the ball');
  }
}

const js=fs.readFileSync(modPath,'utf8');
assert.doesNotMatch(js,/strokeRect\(17,17,w-34,h-34\)/,'inner gold rectangle should not visually place edge pegs outside the playfield');
assert.match(js,/slice\(0,2\)/,'persistent event log should render only the two reserved rows');

const css=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade.css'),'utf8');
assert.match(css,/\.ball-drop-event-log\{[^}]*grid-template-columns:1fr/s,'notification rows should each span full width');
assert.match(css,/\.ball-drop-event-log\{[^}]*grid-template-rows:repeat\(2,24px\)/s,'notification area should reserve two readable rows');
assert.match(css,/\.ball-drop-log-entry\{[^}]*font-size:9px/s,'notification text should be readable on phone');
assert.doesNotMatch(css,/\.ball-drop-log-entry:first-child\{[^}]*grid-column:1\/-1/s,'full-width layout should not rely on first-child span hacks');

console.log('PASS v0.27.9 Ball Drop edge lattice and readable fixed notifications');
