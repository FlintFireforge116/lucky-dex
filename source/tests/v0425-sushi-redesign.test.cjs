'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('Sushi-Go-Round uses three synchronized continuous conveyor rings',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  assert.equal(core.CONFIG.ringCount,3);
  assert.equal(core.CONFIG.plateCount,12);
  assert.ok(core.CONFIG.lapMs>6240,'new belt should be a little slower than the old 12×520ms lap');
  const round=core.createRound({difficulty:'normal',rng:()=>.3,nowMs:1000});
  const rings=new Set(round.plates.map((p,slot)=>p&&core.trackForSlot(slot).ring));
  assert.deepEqual([...rings].sort(),[0,1,2]);
  const a0=core.plateAngleDeg(round,0,1000),a1=core.plateAngleDeg(round,0,1123.5);
  const b0=core.plateAngleDeg(round,4,1000),b1=core.plateAngleDeg(round,4,1123.5);
  const delta=(x,y)=>(y-x+360)%360;
  assert.ok(delta(a0,a1)>0&&delta(a0,a1)<15,'movement should be continuous, not a full slot step');
  assert.ok(Math.abs(delta(a0,a1)-delta(b0,b1))<1e-9,'all normal rings share one angular speed');
});

test('player chooses among reachable plates by tapping the exact plate',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  const round=core.createRound({difficulty:'normal',rng:()=>.2,nowMs:0});
  const choices=core.reachablePlates(round,'player',0);
  assert.equal(new Set(choices.map(x=>x.ring)).size,3,'all three rings should offer nearby choices at the station');
  const chosen=choices.find(x=>x.ring===2)||choices[0];
  const other=choices.find(x=>x.plate.id!==chosen.plate.id);
  const beforeBill=round.player.bill,beforeOther=round.plates[other.slot]?.id;
  const out=core.eatPlate(round,'player',chosen.plate.id,0);
  assert.equal(out.accepted,true);
  assert.equal(out.plate.id,chosen.plate.id);
  assert.equal(round.plates[chosen.slot],null);
  assert.equal(round.plates[other.slot]?.id,beforeOther,'untapped reachable plates stay on the belt');
  assert.ok(round.player.bill>beforeBill);
});

test('a plate outside the player reach cannot be eaten by direct tap',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  const round=core.createRound({difficulty:'normal',rng:()=>.2,nowMs:0});
  const reachable=new Set(core.reachablePlates(round,'player',0).map(x=>x.plate.id));
  const far=round.plates.find(p=>p&&!reachable.has(p.id));
  assert.ok(far,'fixture should contain a distant plate');
  const out=core.eatPlate(round,'player',far.id,0);
  assert.equal(out.accepted,false);
  assert.equal(out.reason,'out-of-reach');
});

test('Sushi-Go-Round shell is cleaned up for tap-to-eat three-ring play',()=>{
  const html=read('index.html');
  const a=html.indexOf('id="sushiGoRoundGame"'),b=html.indexOf('id="dashGame"',a),shell=html.slice(a,b);
  assert.ok(a>0);
  assert.match(shell,/id="sushiGoRoundMenu"/);
  assert.match(shell,/id="sushiGoRoundTongue"/);
  assert.doesNotMatch(shell,/id="sushiGoRoundEat"/,'large EAT button should be removed');
  assert.doesNotMatch(shell,/sushi-conveyor-center/,'centre title copy should be removed');
  assert.doesNotMatch(shell,/id="sushiGoRoundTarget"/,'old one-slot target readout should be removed');
  assert.match(shell,/Tap a glowing plate/i);
});

test('Sushi-Go-Round plate renderer uses ring geometry and direct pointer selection',()=>{
  const js=read('arcade-sushi-go-round.js'),css=read('arcade-sushi-go-round.css');
  assert.match(js,/plateAngleDeg\(round,slot,t\)/);
  assert.match(js,/trackForSlot\(slot\)/);
  assert.match(js,/reachablePlates\(round,'player',t\)/);
  assert.match(js,/dataset\.plateId/);
  assert.match(js,/pointerdown/);
  assert.match(js,/eatPlate\(round,'player',plateId,t\)/);
  assert.doesNotMatch(js,/querySelector\('b'\)\.textContent=plate\.mark/,'plate names should not be printed on dishes');
  assert.doesNotMatch(js,/textContent=`¥\$\{plate\.value\}`/,'plate prices should not be printed on dishes');
  assert.match(css,/\.sushi-ring-guide/);
  assert.match(css,/\.sushi-menu/);
  assert.match(css,/\.sushi-plate\.is-reachable/);
});
