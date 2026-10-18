const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corePath=path.join(__dirname,'..','app','src','main','assets','arcade-pokemon-seek-core.js');

function loadCore(){
  assert.ok(fs.existsSync(corePath),'Pokémon Seek core module must exist');
  delete require.cache[require.resolve(corePath)];
  return require(corePath);
}

function seq(values){let i=0;return ()=>values[Math.min(i++,values.length-1)]??0;}

test('Pokemon Seek core uses a 90 second search and faithful score components',()=>{
  const core=loadCore();
  assert.equal(core.CONFIG.durationMs,90000);
  assert.equal(core.CONFIG.foundScore,5000);
  assert.equal(core.CONFIG.lostItemScore,5000);
  const run=core.createRun({difficulty:'normal',rng:seq([0,.4,.2,.7,.1,.8,.3,.6,.5]),dreamRate:0});
  run.elapsedMs=30000;
  run.foundTarget=true;
  run.itemFound=true;
  assert.equal(core.finalScore(run),40000); // 5k found + 60s*500 + 5k item
});

// v0.51.0: replace obsolete Manhattan-grid assertions with the real location graph.
test('Listen Carefully reports actual connected-room distance bands',()=>{
  const core=loadCore(),run=core.createRun({areaId:'manor',difficulty:'hard',rng:()=>0,dreamRate:0});
  run.targetRoom=4;run.currentRoom=4;assert.equal(core.listenHint(run).strength,'close');
  run.currentRoom=3;assert.equal(core.listenHint(run).distance,1);assert.equal(core.listenHint(run).strength,'near');
  run.currentRoom=1;assert.equal(core.listenHint(run).distance,2);assert.equal(core.listenHint(run).strength,'faint');
  run.currentRoom=0;assert.equal(core.listenHint(run).distance,3);assert.equal(core.listenHint(run).strength,'none');
});

test('movement stays inside the supported graph and exposes visible scene search spots',()=>{
  const core=loadCore(),run=core.createRun({areaId:'manor',difficulty:'hard',rng:seq([.1,.2,.3,.4,.5,.6,.7,.8,.9]),dreamRate:0});
  assert.equal(run.rooms.length,5);assert.ok(run.rooms.every(room=>room.spots.length>=2));
  assert.equal(core.move(run,'not-a-destination'),false);
  const edge=run.rooms[0].connections[0];assert.equal(core.move(run,edge.to),true);assert.equal(run.rooms[run.currentRoom].id,edge.to);
  assert.ok(run.rooms[run.currentRoom].connections.some(e=>e.to===run.rooms[0].id));
});

test('searching a wrong Pokemon never completes the run while finding the target does',()=>{
  const core=loadCore();
  const run=core.createRun({difficulty:'normal',rng:seq([.2,.4,.6,.8,.1,.3,.5,.7,.9]),dreamRate:0});
  const wrongRoom=run.rooms.find(r=>r.index!==run.targetRoom&&r.spots.some(s=>s.kind==='pokemon'));
  if(wrongRoom){
    run.currentRoom=wrongRoom.index;
    const wrongSpot=wrongRoom.spots.find(s=>s.kind==='pokemon');
    assert.ok(core.selectSpot(run,wrongSpot.id));
    const wrong=core.search(run);
    assert.equal(wrong.foundTarget,false);
    assert.equal(run.complete,false);
    assert.equal(run.wrongFinds,1);
  }
  run.currentRoom=run.targetRoom;
  const targetSpot=run.rooms[run.targetRoom].spots.find(s=>s.kind==='target');
  assert.ok(core.selectSpot(run,targetSpot.id));
  const found=core.search(run);
  assert.equal(found.foundTarget,true);
  assert.equal(run.foundTarget,true);
  assert.equal(run.complete,true);
});

test('lost item stays within two rooms of the target and rare Dream Sparkle can be forced',()=>{
  const core=loadCore();
  const run=core.createRun({difficulty:'normal',rng:seq([0,.2,.4,.6,.8,.1,.3,.5,.7,.9]),dreamRate:1});
  assert.equal(run.dreamEvent,true);
  assert.ok(core.roomDistance(run,run.itemRoom,run.targetRoom)<=2);
  assert.ok(core.roomDistance(run,run.dreamRoom,run.targetRoom)<=2);
  run.currentRoom=run.itemRoom;
  assert.equal(core.collectLostItem(run).collected,true);
  assert.equal(run.itemFound,true);
  run.currentRoom=run.dreamRoom;
  assert.equal(core.collectDreamSparkle(run).collected,true);
  assert.equal(run.dreamFound,true);
});
