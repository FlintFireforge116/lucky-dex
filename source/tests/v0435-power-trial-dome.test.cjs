
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Power Trial uses an indoor Challenge Course dome arena and centres the action higher',()=>{
  const css=read('app/src/main/assets/arcade-power-trial.css');
  assert.match(css,/\.powertrial-arena\{[^}]*background-image:url\(["']arcade\/challenge-course\/power-trial-dome\.svg["']\)/s);
  assert.match(css,/\.powertrial-pokemon\{[^}]*bottom:22%/s);
  assert.match(css,/\.powertrial-target-wrap\{[^}]*bottom:22%/s);
  assert.match(css,/\.powertrial-lane\{display:none\}/);
});

test('Power Trial dome background is bundled locally',()=>{
  const bg=path.join(root,'app/src/main/assets/arcade/challenge-course/power-trial-dome.svg');
  assert.ok(fs.existsSync(bg),'missing local dome background');
  const text=fs.readFileSync(bg,'utf8');
  assert.match(text,/Pokéathlon Dome indoor training arena/);
  assert.match(text,/stadium-crowd/);
  assert.match(text,/arena-ring/);
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
