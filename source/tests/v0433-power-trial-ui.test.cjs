const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Power Trial removes arena step cards and Pokemon name badge',()=>{
  const js=read('app/src/main/assets/arcade-power-trial.js');
  assert.doesNotMatch(js,/powerTrialGuideCharge|powerTrialGuideImpact|powertrial-guide-step/);
  assert.doesNotMatch(js,/id="powerTrialPokemonName"/);
});

test('Power Trial uses a compact info button and readable instruction dialog',()=>{
  const js=read('app/src/main/assets/arcade-power-trial.js');
  assert.match(js,/id="powerTrialInfo"/);
  assert.match(js,/id="powerTrialHelp"/);
  assert.match(js,/How to Play/);
  assert.match(js,/Hold <b>CHARGE<\/b>/);
  assert.match(js,/white centre line/);
  assert.match(js,/Break all five targets/);
});

test('Power Trial target has no framed card background',()=>{
  const css=read('app/src/main/assets/arcade-power-trial.css');
  assert.match(css,/\.powertrial-target\{[^}]*background:none/);
  assert.match(css,/\.powertrial-target\{[^}]*border:0/);
  assert.doesNotMatch(css,/\.powertrial-target:before\{/);
});

test('Power Trial play screen is height bounded and disables page scrolling',()=>{
  const css=read('app/src/main/assets/arcade-power-trial.css');
  assert.match(css,/\.powertrial-play\{[^}]*height:calc\(100dvh/);
  assert.match(css,/\.powertrial-play\{[^}]*overflow:hidden/);
  assert.match(css,/\.powertrial-arena\{[^}]*min-height:0/);
  assert.match(css,/\.powertrial-arena\{[^}]*flex:1/);
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
