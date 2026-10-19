'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const core=require(path.join(ROOT,'app/src/main/assets/arcade-tumbling-togepi-core.js'));

test('Tumbling touch stick preserves full forward throttle while steering diagonally',()=>{
  assert.equal(typeof core.stickAxes,'function','core must expose a testable stickAxes helper');
  const diagonal=core.stickAxes(34,34,34);
  assert.equal(diagonal.inputX,1);
  assert.equal(diagonal.inputY,1,'full down must remain full speed even while steering');
  assert.ok(Math.hypot(diagonal.visualX,diagonal.visualY)<=1.000001,'visual knob must remain inside circular pad');
  const half=core.stickAxes(-17,34,34);
  assert.equal(half.inputX,-.5);
  assert.equal(half.inputY,1);
});

test('Tumbling countdown progresses 3, 2, 1, GO and only completes afterward',()=>{
  assert.equal(typeof core.countdownState,'function','core must expose countdownState');
  assert.deepEqual(core.countdownState(0),{label:'3',done:false});
  assert.deepEqual(core.countdownState(750),{label:'2',done:false});
  assert.deepEqual(core.countdownState(1450),{label:'1',done:false});
  assert.deepEqual(core.countdownState(2150),{label:'GO!',done:false});
  assert.deepEqual(core.countdownState(2600),{label:'GO!',done:true});
});

test('Tumbling UI wires a visible countdown and permits pre-positioning the stick',()=>{
  const js=read('app/src/main/assets/arcade-tumbling-togepi.js');
  const html=read('app/src/main/assets/index.html');
  assert.match(html,/id="tumblingTogepiCountdown"/);
  assert.match(js,/phase='countdown'/);
  assert.match(js,/\['countdown','racing'\]\.includes\(phase\)/);
  assert.match(js,/core\.stickAxes\(/);
  assert.match(js,/core\.countdownState\(/);
  assert.match(js,/core\.shiftTimestamps\(race,/);
});
