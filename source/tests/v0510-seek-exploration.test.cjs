'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets'),C=require(path.join(root,'arcade-pokemon-seek-core.js'));
function data(){const p=path.join(root,'arcade-pokemon-seek-locations.js');assert.ok(fs.existsSync(p),'verified location graph must exist');return require(p);}
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};

test('supported areas have canonical names, local art, connected named destinations and visible prop-backed search spots',()=>{
  const D=data();assert.ok(D.AREAS.length>=3);assert.ok(D.AREAS.every(a=>a.id!=='ruins'),'unsupported Ruins omitted');
  for(const a of D.AREAS){
    assert.ok(a.name&&a.shortName&&a.encounterSource&&a.targets.length>=2);
    const ids=new Set(a.locations.map(n=>n.id));assert.equal(ids.size,a.locations.length);
    for(const n of a.locations){
      assert.ok(n.name&&n.areaId===a.id&&n.background.startsWith('arcade/dream-world/seek/'));
      assert.ok(fs.existsSync(path.join(root,n.background)),n.background);
      assert.ok(n.connections.length>0&&n.spots.length>=2);
      for(const edge of n.connections){assert.ok(ids.has(edge.to));const dest=a.locations.find(r=>r.id===edge.to);assert.equal(edge.label,dest.shortName||dest.name);}
      for(const s of n.spots){
        const layer=n.layers.find(l=>l.id===s.layerId);assert.ok(layer,`${n.id}/${s.id} needs visible art evidence`);assert.ok(s.evidence&&s.label);
        assert.ok(s.x>=0&&s.x<=100&&s.y>=0&&s.y<=100&&s.w>0&&s.h>0);
        assert.ok(Math.abs(s.x-layer.x)<=layer.w/2&&Math.abs(s.y-layer.y)<=layer.h/2,`${s.id} hotspot must overlap its visible layer`);
      }
    }
    const seen=new Set([a.locations[0].id]),q=[a.locations[0]];while(q.length){for(const e of q.shift().connections)if(!seen.has(e.to)){seen.add(e.to);q.push(a.locations.find(n=>n.id===e.to));}}
    assert.equal(seen.size,ids.size,a.id+' disconnected map');
  }
});

test('difficulty changes accessible map, timer, clue precision and decoys without invalid targets',()=>{
  const runs=['easy','normal','hard'].map(difficulty=>C.createRun({areaId:'manor',difficulty,rng:seeded(29),dreamRate:0}));
  assert.equal(runs[0].areaId,'manor');assert.ok(runs[0].rooms.length<runs[2].rooms.length);
  assert.ok(C.remainingMs(runs[0])>C.remainingMs(runs[2]));
  for(const r of runs){assert.ok(r.rooms[r.targetRoom]);assert.equal(r.rooms.flatMap(n=>n.spots).filter(s=>s.kind==='target').length,1);assert.ok(r.rooms.every(n=>n.spots.every(s=>!s.pokemon||s.pokemon.dex!==r.target.dex||s.kind==='target')));}
  assert.ok(runs[0].rooms.flatMap(r=>r.spots).filter(s=>s.kind==='pokemon').length<=runs[2].rooms.flatMap(r=>r.spots).filter(s=>s.kind==='pokemon').length);
});

test('navigation uses graph edges and displayed destination names, not imaginary grid directions',()=>{
  const r=C.createRun({areaId:'forest',difficulty:'hard',rng:seeded(4),dreamRate:0}),room=C.currentRoom(r);
  const edge=room.connections[0];assert.ok(C.move(r,edge.to));assert.equal(C.currentRoom(r).id,edge.to);assert.equal(r.moves,1);
  assert.equal(C.move(r,'not-a-location'),false);assert.equal(r.moves,1);assert.equal(r.selectedSpotId,null);
});

test('Listen reports actual graph distance and a real closer neighbour; Hard does not give the route outright',()=>{
  const r=C.createRun({areaId:'manor',difficulty:'easy',rng:seeded(10),dreamRate:0});
  r.targetRoom=r.rooms.length-1;r.currentRoom=0;
  const h=C.listenHint(r);assert.ok(Number.isFinite(h.distance)&&h.distance>0);assert.ok(h.nextId&&C.currentRoom(r).connections.some(e=>e.to===h.nextId));
  assert.ok(C.move(r,h.nextId));assert.ok(C.listenHint(r).distance<h.distance);
  r.currentRoom=r.targetRoom;assert.equal(C.listenHint(r).strength,'close');
  r.difficulty='hard';r.currentRoom=0;assert.equal(C.listenHint(r).nextId,null);assert.ok(C.listenHint(r).distance>0);
});

test('Search only inspects the selected valid scene spot, rejecting foreign, repeated and unselected searches',()=>{
  const r=C.createRun({areaId:'forest',difficulty:'normal',rng:seeded(33),dreamRate:0});
  assert.equal(C.search(r).accepted,false);assert.equal(C.selectSpot(r,'not-a-spot'),false);
  const here=C.currentRoom(r),spot=here.spots.find(s=>s.kind!=='target');assert.ok(spot);assert.ok(C.selectSpot(r,spot.id));
  const outcome=C.search(r);assert.equal(outcome.accepted,true);assert.equal(r.searchedSpots,1);assert.equal(C.search(r).accepted,false);
  assert.equal(r.complete,false);assert.equal(C.search(r,r.rooms.find(n=>n.index!==r.currentRoom)?.spots[0].id).accepted,false);
});

test('wrong Pokémon pauses belong to the renderer; only a correct selected target completes the core run',()=>{
  const r=C.createRun({areaId:'manor',difficulty:'hard',rng:seeded(4),dreamRate:0});
  const wrong=r.rooms.find(n=>n.spots.some(s=>s.kind==='pokemon'));assert.ok(wrong);r.currentRoom=wrong.index;C.selectSpot(r,wrong.spots.find(s=>s.kind==='pokemon').id);assert.equal(C.search(r).kind,'pokemon');assert.equal(r.complete,false);
  r.currentRoom=r.targetRoom;C.selectSpot(r,C.currentRoom(r).spots.find(s=>s.kind==='target').id);assert.equal(C.search(r).foundTarget,true);assert.equal(r.complete,true);assert.equal(C.search(r).accepted,false);
});

test('timer honours difficulty, stops at expiry, and never allows a late find',()=>{
  const r=C.createRun({areaId:'sky',difficulty:'hard',rng:seeded(91),dreamRate:0});assert.equal(typeof C.advanceTime,'function');
  C.advanceTime(r,1000);assert.equal(r.elapsedMs,1000);C.advanceTime(r,1000000);assert.equal(C.remainingMs(r),0);assert.equal(r.complete,true);assert.equal(r.foundTarget,false);
  r.currentRoom=r.targetRoom;assert.equal(C.selectSpot(r,C.currentRoom(r).spots.find(s=>s.kind==='target').id),false);assert.equal(C.search(r).accepted,false);
});

test('score breakdown explains modest deduction costs and matches final score exactly',()=>{
  const r=C.createRun({areaId:'forest',difficulty:'normal',rng:seeded(1),dreamRate:0});r.elapsedMs=30000;r.foundTarget=true;r.itemFound=true;
  assert.equal(C.finalScore(r),40000);r.listens=2;r.wrongFinds=1;r.moves=8;r.searchedSpots=5;
  const parts=C.scoreBreakdown(r);assert.equal(parts.reduce((a,b)=>a+b.value,0),C.finalScore(r));assert.ok(C.finalScore(r)>35000);assert.ok(C.finalScore(r)<40000);
  assert.ok(parts.some(p=>p.label==='Listen'&&p.value<0));assert.ok(parts.some(p=>p.label==='Wrong searches'&&p.value<0));
});

test('Dream Sparkle Off, Vanilla, Test and Always follow exact existing settings probabilities',()=>{
  for(const [rate,roll,want] of [[0,0,false],[.02,.01,true],[.02,.03,false],[.25,.24,true],[.25,.26,false],[1,.999999,true]]){
    const r=C.createRun({areaId:'park',difficulty:'normal',rng:()=>roll,dreamRate:rate});assert.equal(r.dreamEvent,want,`${rate}/${roll}`);
    if(want){assert.ok(r.rooms[r.dreamRoom].spots.some(s=>s.kind==='dream'));r.currentRoom=r.dreamRoom;C.selectSpot(r,C.currentRoom(r).spots.find(s=>s.kind==='dream').id);assert.equal(C.search(r).kind,'dream');assert.equal(r.dreamFound,true);assert.equal(C.search(r).accepted,false);}
  }
});
