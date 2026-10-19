'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Rampage Rollout exit resets live input before discarding race state',()=>{
  const js=read('app/src/main/assets/arcade-rampage-rollout.js');
  const close=js.match(/function close\(\)\{([^}]*)\}/)?.[1]||'';
  assert.ok(close.includes('resetStick()'),'close should reset the joystick');
  assert.ok(close.indexOf('resetStick()')<close.indexOf('race=null'),'joystick/input must reset before race is nulled');
  assert.match(js,/function resetStick\(\)\{stickPointer=null;if\(race\)core\.setPlayerInput\(race,0,0\)/);
});
