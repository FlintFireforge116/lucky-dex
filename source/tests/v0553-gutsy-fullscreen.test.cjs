const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-gutsy-golbat-core.js'));

function seeded(seed=7){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

test('hard CPU pack uses both halves of the cave instead of camping at the front',()=>{
  const run=core.createRun({difficulty:'hard',rng:seeded(7),goldenHeartRate:0});
  run.entities=[];
  const mins=run.players.map(p=>p.x),maxs=run.players.map(p=>p.x);
  for(let elapsed=0;elapsed<24000;elapsed+=50){
    core.stepRun(run,50,{});
    run.players.forEach((p,i)=>{mins[i]=Math.min(mins[i],p.x);maxs[i]=Math.max(maxs[i],p.x);});
  }
  const cpuRanges=run.players.slice(1).map((_,i)=>maxs[i+1]-mins[i+1]);
  assert.ok(cpuRanges.some(range=>range>=500),`expected at least one aggressive CPU to traverse the cave; ranges=${cpuRanges.join(',')}`);
  assert.ok(Math.min(...mins.slice(1))<=180,`expected CPU pack to use the left side; mins=${mins.slice(1).join(',')}`);
  assert.ok(Math.max(...maxs.slice(1))>=820,`expected CPU pack to use the right side; maxs=${maxs.slice(1).join(',')}`);
});

test('racer collision strongly exchanges momentum and pings both racers apart',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.entities=[];
  run.players[2].x=850;run.players[2].y=100;
  run.players[3].x=850;run.players[3].y=460;
  const a=run.players[0],b=run.players[1];
  a.x=400;a.y=280;a.vx=220;a.vy=0;
  b.x=450;b.y=280;b.vx=-220;b.vy=0;b.aiThinkMs=999999;b.aiTarget={x:450,y:280};b.aiCrossCutMs=999999;
  core.stepRun(run,16,{});
  assert.ok(a.vx<=-300,`YOU should rebound hard to the left; vx=${a.vx}`);
  assert.ok(b.vx>=300,`COM should rebound hard to the right; vx=${b.vx}`);
  assert.ok(run.events.some(e=>e.type==='rival-bounce'),'collision should emit a bounce event');
});

test('side walls rebound horizontal velocity instead of dead-stopping racers',()=>{
  const right=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  right.entities=[];
  const p=right.players[0];p.x=core.CONFIG.maxX-1;p.vx=500;
  core.stepRun(right,16,{right:true});
  assert.equal(p.x,core.CONFIG.maxX);
  assert.ok(p.vx<=-180,`right wall should kick YOU back left; vx=${p.vx}`);

  const left=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  left.entities=[];
  const q=left.players[0];q.x=core.CONFIG.minX+1;q.vx=-500;
  core.stepRun(left,16,{left:true});
  assert.equal(q.x,core.CONFIG.minX);
  assert.ok(q.vx>=180,`left wall should kick YOU back right; vx=${q.vx}`);
});
