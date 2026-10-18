'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const CORE_PATH=path.join(__dirname,'..','app','src','main','assets','arcade-pichu-power-plant-core.js');
function load(){if(!fs.existsSync(CORE_PATH))return null;delete require.cache[require.resolve(CORE_PATH)];return require(CORE_PATH);}
const seq=(values)=>{let i=0;return()=>values[i++%values.length];};

test('Pichu Power Plant core exists and starts four racers with direction plus colour signal',()=>{
  const core=load();assert.ok(core,'Pichu Power Plant core should exist');
  const match=core.createMatch({difficulty:'normal',rng:seq([0,.1,.2,.3,.4,.5]),nowMs:0});
  assert.equal(match.players.length,4);
  assert.ok(['up','right','down','left'].includes(match.signal.direction));
  assert.ok(['a','b'].includes(match.signal.button));
  assert.equal(match.player.charge,0);
});

test('correct direction plus matching colour charges while wrong combinations drain',()=>{
  const core=load();assert.ok(core);
  const match=core.createMatch({difficulty:'normal',rng:()=>0,nowMs:0});
  const d=match.signal.direction,b=match.signal.button;
  core.setPlayerDirection(match,d,true,10);
  const good=core.pressPlayer(match,b,20);
  assert.equal(good.correct,true);
  assert.ok(match.player.charge>0);
  const after=match.player.charge;
  const wrong=core.pressPlayer(match,b==='a'?'b':'a',40);
  assert.equal(wrong.correct,false);
  assert.ok(match.player.charge<after);
});

test('direction must be actively held when zapping',()=>{
  const core=load();assert.ok(core);
  const match=core.createMatch({difficulty:'normal',rng:()=>0,nowMs:0});
  const out=core.pressPlayer(match,match.signal.button,10);
  assert.equal(out.accepted,true);
  assert.equal(out.correct,false);
  assert.equal(match.player.correctPresses,0);
});

test('first racer to full charge finalizes and ranks the match',()=>{
  const core=load();assert.ok(core);
  const match=core.createMatch({difficulty:'normal',rng:()=>0,nowMs:0});
  match.player.charge=core.CONFIG.maxCharge-core.CONFIG.correctCharge;
  core.setPlayerDirection(match,match.signal.direction,true,10);
  const out=core.pressPlayer(match,match.signal.button,20);
  assert.equal(out.finished,true);
  assert.equal(match.finalized,true);
  assert.equal(core.placeFor(match,'player'),1);
});

test('signal changes preserve the two-part direction and A/B reaction mechanic',()=>{
  const core=load();assert.ok(core);
  const match=core.createMatch({difficulty:'normal',rng:seq([0,.9,.2,.8,.4,.7]),nowMs:0});
  const before={...match.signal};
  core.advanceMatch(match,5000,seq([.9,.1,.8,.2,.7,.3]));
  assert.ok(match.signal.version>before.version);
  assert.ok(['up','right','down','left'].includes(match.signal.direction));
  assert.ok(['a','b'].includes(match.signal.button));
});
