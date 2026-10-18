const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('roulette empty landing sockets read as empty holes and only occupied sockets render balls',()=>{
  const js=read('app/src/main/assets/arcade-roulette.js');
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(js,/roulette-wheel-pocket[^`]*\$\{isOcc\?`<b class="\$\{goldenSlots\.has\(slot\.key\)\?'golden':'silver'\}"><\/b>`:''\}/s);
  assert.match(css,/\.roulette-wheel-pocket\{[^}]*background:radial-gradient\([^}]*#1[0-9a-f]{5}/is);
  assert.doesNotMatch(css,/\.roulette-wheel-pocket\{[^}]*background:#dad7bd/is);
});

test('roulette puts a prominent balls-left counter in the wheel hub',()=>{
  const html=read('app/src/main/assets/index.html');
  const js=read('app/src/main/assets/arcade-roulette.js');
  assert.match(html,/roulette-wheel-hub[\s\S]*BALLS LEFT[\s\S]*id="rouletteBallCount"/);
  assert.doesNotMatch(html,/roulette-ball-counter/);
  assert.match(js,/rouletteBallCount'\)\)\$\('rouletteBallCount'\)\.textContent=String\(Math\.max\(0,6-r\.occupied\.length\)\)/);
});

test('roulette vanity bulbs are offset from the four corners instead of sharing corner origins',()=>{
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(css,/\.roulette-wheel-panel:before\{[^}]*background-position:12px 0,12px 100%,0 12px,100% 12px/is);
});
