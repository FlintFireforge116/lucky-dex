'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Rampage Rollout stage stretches to the full game width instead of shrink-wrapping',()=>{
  const css=read('app/src/main/assets/arcade-rampage-rollout.css');
  assert.match(css,/\.rampage-rollout-stage\{[^}]*width:100%/);
  assert.match(css,/\.rampage-rollout-track\{[^}]*aspect-ratio:\s*1\.2\/1/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*\.rampage-rollout-track\{[^}]*aspect-ratio:\s*\.92\/1/);
  assert.match(css,/@media\(max-height:760px\) and \(max-width:600px\)\{\.rampage-rollout-track\{aspect-ratio:\.92\/1\}/);
});

test('Rampage Rollout renderer uses the same rounded-rectangle geometry as the race simulation',()=>{
  const js=read('app/src/main/assets/arcade-rampage-rollout.js');
  assert.match(js,/function visualPointFor\(/);
  assert.match(js,/core\.coursePointFor\(angle,radius\)/);
  assert.doesNotMatch(js,/superellipse/i);
  assert.match(js,/renderRacers\(\)[\s\S]*visualPointFor\(r\.angle,r\.radius\)/);
  assert.match(js,/renderDust\(\)[\s\S]*visualPointFor\(h\.angle,h\.radius\)/);
});

test('mobile controls are compact and do not print directional arrows outside the joystick',()=>{
  const css=read('app/src/main/assets/arcade-rampage-rollout.css');
  assert.doesNotMatch(css,/content:"▲/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*\.rampage-stick\{[^}]*width:min\(100%,112px\)/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*\.rampage-dirt-btn\{[^}]*width:min\(100%,104px\)/);
});

test('mobile ready overlay is compact and the track is labelled as a rounded course',()=>{
  const html=read('app/src/main/assets/index.html');
  const ready=(html.match(/<div id="rampageRolloutReady"[\s\S]*?<\/div><button type="button" id="rampageRolloutStart"[\s\S]*?<\/button><\/div>/)||[])[0]||'';
  assert.doesNotMatch(ready,/<span>/,'ready screen should not duplicate the full instructions inside the track');
  assert.match(html,/aria-label="Rampage Rollout nine-lap rounded Donphan race"/);
});

test('Rampage help describes the course without the old tiny-circle wording',()=>{
  const help=read('app/src/main/assets/arcade-help.js');
  assert.match(help,/rampageRollout:\{name:'Rampage Rollout'[\s\S]*fenced race course/);
  assert.doesNotMatch(help,/rampageRollout:\{name:'Rampage Rollout'[\s\S]{0,420}circular track/);
});
