const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=name=>fs.readFileSync(path.join(ASSETS,name),'utf8');
const core=require(path.join(ASSETS,'arcade-gutsy-golbat-core.js'));

function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

test('racer contact always separates and rebounds even without a hard-hit scatter',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.entities=[];
  run.players[2].x=850; run.players[2].y=100;
  run.players[3].x=850; run.players[3].y=460;
  const a=run.players[0],b=run.players[1];
  a.x=300;a.y=280;a.vx=0;a.vy=0;
  b.x=320;b.y=280;b.vx=0;b.vy=0;b.aiThinkMs=999999;b.aiTarget={x:320,y:280};
  const before=distance(a,b);
  core.stepRun(run,16,{});
  assert.ok(distance(a,b)>before+20,`contact should physically separate racers; ${before} -> ${distance(a,b)}`);
  assert.ok(a.vx<0&&b.vx>0,`racers should rebound apart; vx=${a.vx}/${b.vx}`);
  assert.equal(a.heartsLost+b.heartsLost,0,'soft contact should bounce without scattering hearts');
});

test('player can traverse almost the full cave width instead of stopping at 60%',()=>{
  assert.ok(core.CONFIG.maxX>=core.CONFIG.width*0.9,`maxX ${core.CONFIG.maxX} should reach the right side of ${core.CONFIG.width}`);
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.entities=[];
  for(let i=0;i<20;i++)core.stepRun(run,100,{right:true});
  assert.ok(run.players[0].x>800,`right steering should carry YOU deep into the right side; x=${run.players[0].x}`);
});

test('finish marker enters a reachable part of the cave by the end of the course',()=>{
  assert.equal(typeof core.finishLinePct,'function');
  assert.ok(core.finishLinePct(.84)>100,'finish should begin offscreen');
  assert.ok(core.finishLinePct(1)<=90,'finish should sweep into the playable cave by 100%');
});

test('hard CPUs are seeded with distinct movement personalities instead of one shared target line',()=>{
  const run=core.createRun({difficulty:'hard',rng:()=>0.42,goldenHeartRate:0});
  const cpu=run.players.slice(1);
  assert.equal(new Set(cpu.map(p=>p.aiLaneBias)).size,3);
  assert.ok(cpu.every(p=>Number.isFinite(p.aiJukeMs)));
  assert.ok(cpu.every(p=>Math.abs(p.aiLaneBias)>=30));
});

test('Gutsy controls default to steering left / FLAP right and can persistently mirror for left-handed play',()=>{
  const html=read('index.html');
  const css=read('arcade-gutsy-golbat.css');
  const js=read('arcade-gutsy-golbat.js');
  const app=read('app-v0167.js');
  assert.match(html,/id="gutsyGolbatSteerPad"/);
  assert.match(html,/id="gutsyGolbatHandedness"/);
  assert.match(css,/\.gutsy-controls\.is-left-handed/);
  assert.match(js,/gutsyGolbatLeftHanded/);
  assert.match(js,/function\s+toggleHandedness\s*\(/);
  assert.match(app,/gutsyGolbatLeftHanded\s*:\s*false/);
});
