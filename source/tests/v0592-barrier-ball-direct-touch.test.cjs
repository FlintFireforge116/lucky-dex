'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const CORE=path.join(ASSETS,'arcade-barrier-ball-core.js');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');
function load(){delete require.cache[require.resolve(CORE)];return require(CORE);}

test('direct touch target puts the human Barrier under the finger in one simulation step',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  core.stepMatch(run,16,[{targetOffset:150}]);
  assert.equal(run.players[0].offset,150);
  assert.equal(run.players[0].x,core.CONFIG.centreX+150);
});

test('releasing direct touch stops the human immediately instead of coasting',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  core.stepMatch(run,16,[{targetOffset:150}]);
  assert.notEqual(run.players[0].velocity,0,'drag gesture should still produce return-curve velocity');
  const x=run.players[0].x;
  core.stepMatch(run,16,[{move:0,targetOffset:null}]);
  assert.equal(run.players[0].velocity,0);
  assert.equal(run.players[0].x,x,'player must not glide after the finger stops');
});

test('direct dragging still derives lateral velocity so moving contact can bend a return',()=>{
  const core=load(),run=core.createMatch({rng:()=>0.5,skipInitialBall:true});
  const you=run.players[0];
  const ball=core.spawnBall(run,{x:core.CONFIG.centreX+105,y:you.y-28,vx:0,vy:330});
  core.stepMatch(run,16,[{targetOffset:105}]);
  assert.equal(you.offset,105);
  assert.ok(you.velocity>core.CONFIG.paddleMaxSpeed*.9,'fast finger travel should create useful curve velocity');
  assert.ok(ball.vx>80,'rightward drag at contact should bend the return right');
});

test('keyboard movement is responsive and stops immediately while CPU movement keeps acceleration',()=>{
  const core=load(),run=core.createMatch({difficulty:'normal',rng:()=>0.9,skipInitialBall:true});
  core.spawnBall(run,{x:core.CONFIG.centreX+170,y:core.CONFIG.centreY,vx:0,vy:320});
  core.stepMatch(run,16,[{move:1}]);
  assert.equal(run.players[0].velocity,core.CONFIG.paddleMaxSpeed);
  assert.ok(Math.abs(run.players[1].velocity)<core.CONFIG.paddleMaxSpeed*run.profile.moveScale,
    'CPU should still accelerate rather than teleporting to full speed');
  core.stepMatch(run,16,[{move:0}]);
  assert.equal(run.players[0].velocity,0);
});

test('Barrier Ball phone UI uses the court itself for drag control and removes the slider',()=>{
  const html=read('index.html'),js=read('arcade-barrier-ball.js'),css=read('arcade-barrier-ball.css');
  assert.doesNotMatch(html,/id="barrierBallSlider"/);
  assert.doesNotMatch(html,/id="barrierBallSliderKnob"/);
  assert.match(html,/id="barrierBallSmash"/);
  assert.match(html,/DRAG ON COURT · A = SMASH/);
  assert.match(js,/targetOffset/);
  assert.match(js,/barrierBallArena/);
  assert.match(js,/setPointerCapture/);
  assert.match(css,/\.barrier-ball-arena\{[^}]*touch-action:none/);
  assert.doesNotMatch(css,/\.barrier-ball-slider\{/);
});

test('phone court expands to almost the full viewport and has no centre obstruction decoration',()=>{
  const css=read('arcade-barrier-ball.css');
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.barrier-ball-stage\{[^}]*100vw[^}]*max-width:none/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.barrier-ball-arena\{[^}]*width:100%[^}]*max-width:none/);
  assert.match(css,/\.barrier-ball-arena:after\{content:none\}/,
    'unused centre/decorative pseudo layer should be explicitly removed');
  assert.doesNotMatch(css,/radial-gradient\(circle at 50% 50%/,
    'court should not render a centre marker that can be mistaken for gameplay');
  assert.match(css,/\.barrier-line\.b1\{left:auto;right:6\.1%;bottom:auto\}/,
    'COM 1 Barrier must reset the old global .b1 left position instead of leaking into centre court');
  assert.match(css,/\.barrier-line\.b2\{right:auto;bottom:auto;top:6\.1%\}/,
    'top Barrier must reset opposite-edge coordinates inherited from generic b2 styles');
  assert.match(css,/\.barrier-line\.b3\{left:6\.1%;right:auto;bottom:auto\}/,
    'left Barrier must reset opposite-edge coordinates inherited from generic b3 styles');
});

test('shared help explains direct court dragging rather than the removed slider',()=>{
  const help=read('arcade-help.js');
  assert.match(help,/barrierBall:\{name:'Barrier Ball'[\s\S]*?controls:'Drag[^']*court[^']*Press A/s);
  assert.doesNotMatch(help,/barrierBall:\{[^\n]*controls:'Slide the Barrier/);
});

test('v0.59.2 direct-touch release remains present in later aligned releases',()=>{
  const pkg=require(path.join(ROOT,'package.json'));
  const parts=String(pkg.version).split('.').map(Number);
  assert.ok(parts[0]>0 || parts[1]>59 || (parts[1]===59 && parts[2]>=2));
  const escaped=String(pkg.version).replace(/\./g,'\\.');
  assert.match(fs.readFileSync(path.join(ROOT,'package-lock.json'),'utf8'),new RegExp(`\"version\": \"${escaped}\"`));
  assert.match(fs.readFileSync(path.join(ROOT,'app','build.gradle'),'utf8'),new RegExp(`versionName '${escaped}'`));
  assert.match(read('app-v0167.js'),new RegExp(`__LUCKYDEX_BUILD='${escaped}'`));
  assert.match(read('index.html'),new RegExp(`v${escaped}`));
});
