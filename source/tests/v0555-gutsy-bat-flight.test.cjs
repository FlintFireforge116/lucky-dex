const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-gutsy-golbat-core.js'));

function seeded(seed=1){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function sequence(values,tail=.5){let i=0;return ()=>i<values.length?values[i++]:tail;}

function chaosFixture(){
  const run=core.createRun({difficulty:'hard',rng:seeded(5),goldenHeartRate:0});
  run.entities=[
    {id:'heart-a',kind:'heart',x:420,y:160,collected:false},
    {id:'loose-a',kind:'loose-heart',x:610,y:360,collected:false,ttlMs:3000,vx:0,vy:0},
  ];
  const p=run.players[1];
  p.aiPersonality='brawler';p.x=500;p.y=260;p.vx=0;p.vy=0;
  run.players[0].x=250;run.players[0].y=120;run.players[0].hearts=99;run.players[0].place=1;
  run.players[2].x=520;run.players[2].y=300;run.players[2].hearts=0;run.players[2].place=4;
  run.players[3].x=820;run.players[3].y=430;run.players[3].hearts=2;run.players[3].place=3;
  return {run,p};
}

test('brawler racer targeting is unbiased by leader, hearts, or player identity',()=>{
  assert.equal(typeof core.chooseBrawlerIntent,'function','chooseBrawlerIntent should be exported for deterministic AI checks');
  const picked=[];
  for(const pick of [0.05,0.45,0.85]){
    const {run,p}=chaosFixture();
    run.rng=sequence([0.05,pick]); // racer mode, then equal rival pick
    const intent=core.chooseBrawlerIntent(run,p);
    assert.equal(intent.kind,'racer');
    picked.push(intent.targetIndex);
  }
  assert.deepEqual(picked,[0,2,3]);
});

test('brawler can abruptly target collectibles or empty cave space instead of a racer',()=>{
  const collectible=chaosFixture();
  collectible.run.rng=sequence([0.45,0.8]);
  const heartIntent=core.chooseBrawlerIntent(collectible.run,collectible.p);
  assert.equal(heartIntent.kind,'collectible');
  assert.ok(['heart-a','loose-a'].includes(heartIntent.entityId));

  const wander=chaosFixture();
  wander.run.rng=sequence([0.9,0.12,0.82]);
  const wanderIntent=core.chooseBrawlerIntent(wander.run,wander.p);
  assert.equal(wanderIntent.kind,'wander');
  assert.ok(wanderIntent.x<core.CONFIG.width*.35,'wander target should be able to jump to the rear side');
  assert.ok(wanderIntent.y>core.CONFIG.height*.65,'wander target should be able to jump vertically too');
});

test('player lateral flight is substantially faster than v0.55.4',()=>{
  const run=core.createRun({difficulty:'hard',rng:seeded(2),goldenHeartRate:0});
  run.entities=[];
  const p=run.players[0];p.x=300;p.y=280;p.vx=0;p.vy=0;
  core.stepRun(run,500,{right:true});
  assert.ok(p.x>610,`expected bat-like lateral travel past x=610, got ${p.x}`);
  assert.ok(p.vx>=600,`expected lateral speed >=600, got ${p.vx}`);
});

test('flap impulse produces a sharper vertical dart',()=>{
  const run=core.createRun({difficulty:'hard',rng:seeded(3),goldenHeartRate:0});
  run.entities=[];
  const p=run.players[0];p.x=300;p.y=300;p.vy=0;
  core.flap(run,0);
  core.stepRun(run,200,{});
  assert.ok(p.y<260,`expected a sharper upward dart below y=260, got ${p.y}`);
});

test('racer contact slings both bats apart with a stronger rebound',()=>{
  const run=core.createRun({difficulty:'hard',rng:seeded(4),goldenHeartRate:0});
  run.entities=[];
  const a=run.players[0],b=run.players[1];
  a.x=470;b.x=525;a.y=b.y=280;a.vx=200;b.vx=-200;a.vy=b.vy=0;
  for(let i=2;i<4;i++){
    run.players[i].x=100+i*100;run.players[i].y=80;
    run.players[i].aiThinkMs=999999;run.players[i].aiCrossCutMs=999999;run.players[i].aiJukeMs=999999;
    run.players[i].aiTarget={x:run.players[i].x,y:run.players[i].y};
  }
  core.stepRun(run,16,{});
  const separationSpeed=b.vx-a.vx;
  assert.ok(a.vx<-500&&b.vx>650,`expected both racers to be flung apart, got ${a.vx} / ${b.vx}`);
  assert.ok(separationSpeed>1200,`expected >1200 relative rebound speed, got ${separationSpeed}`);
});

test('collision rebound stays energetic long enough to visibly sling racers apart',()=>{
  const run=core.createRun({difficulty:'hard',rng:seeded(44),goldenHeartRate:0});
  run.entities=[];
  const a=run.players[0],b=run.players[1];
  a.x=470;b.x=525;a.y=b.y=280;a.vx=220;b.vx=-220;a.vy=b.vy=0;
  for(let i=2;i<4;i++){
    run.players[i].x=100+i*100;run.players[i].y=80;
    run.players[i].aiThinkMs=999999;run.players[i].aiCrossCutMs=999999;run.players[i].aiJukeMs=999999;
    run.players[i].aiTarget={x:run.players[i].x,y:run.players[i].y};
  }
  core.stepRun(run,16,{});
  const distanceAfterHit=Math.abs(b.x-a.x);
  core.stepRun(run,120,{});
  assert.ok(Math.abs(b.x-a.x)>distanceAfterHit+110,`rebound should visibly keep separating racers; ${distanceAfterHit} -> ${Math.abs(b.x-a.x)}`);
  assert.ok(Math.abs(a.vx)>500&&Math.abs(b.vx)>500,`rebound velocity should persist briefly; ${a.vx} / ${b.vx}`);
});
