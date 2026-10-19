'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const core=require(path.join(ROOT,'app/src/main/assets/arcade-tumbling-togepi-core.js'));

test('Tumbling Togepi camera keeps racers near the top third and uses most of the course ahead',()=>{
  assert.ok(core.CONFIG.racerScreenY<=32,`racerScreenY should be near the top third, got ${core.CONFIG.racerScreenY}`);
  assert.ok(core.CONFIG.visibleDistance>=240,`visibleDistance should expose more upcoming course, got ${core.CONFIG.visibleDistance}`);
  const js=read('app/src/main/assets/arcade-tumbling-togepi.js');
  assert.match(js,/const cameraY=Number\(core\.CONFIG\.racerScreenY/);
  assert.match(js,/avatar\.style\.top=`\$\{cameraY\}%`/);
  assert.match(js,/y=cameraY\+\(delta\/core\.CONFIG\.visibleDistance\)\*100/);
});

test('Rampage Rollout exit resets live input before discarding race state',()=>{
  const js=read('app/src/main/assets/arcade-rampage-rollout.js');
  const close=js.match(/function close\(\)\{([^}]*)\}/)?.[1]||'';
  assert.ok(close.includes('resetStick()'),'close should reset the joystick');
  assert.ok(close.indexOf('resetStick()')<close.indexOf('race=null'),'joystick/input must reset before race is nulled');
  assert.match(js,/function resetStick\(\)\{stickPointer=null;if\(race\)core\.setPlayerInput\(race,0,0\)/);
});
