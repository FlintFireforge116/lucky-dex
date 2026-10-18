const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('rare gameplay sprites use transparent containers instead of square card-like backgrounds',()=>{
  const arcade=read('app/src/main/assets/arcade.css');
  const rock=read('app/src/main/assets/arcade-rock-harden.css');
  assert.match(arcade,/\.fossil-find-v0250\{[^}]*background\s*:\s*transparent[^}]*border\s*:\s*0[^}]*box-shadow\s*:\s*none/i);
  assert.match(rock,/\.rock-harden-rock\{[^}]*background-color\s*:\s*transparent[^}]*border\s*:\s*0[^}]*box-shadow\s*:\s*none/i);
});
