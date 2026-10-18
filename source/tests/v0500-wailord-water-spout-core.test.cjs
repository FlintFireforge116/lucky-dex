const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const corePath=path.join(__dirname,'..','app','src','main','assets','arcade-wailord-water-spout-core.js');

function core(){ delete require.cache[require.resolve(corePath)]; return require(corePath); }

test('Wailord core keeps the 90 second four-Pokemon Dream World progression',()=>{
  const c=core();
  assert.equal(c.CONFIG.durationMs,90000);
  assert.deepEqual(Object.keys(c.DIFFICULTIES),['easy','normal','hard']);
  assert.deepEqual(c.availableSpecies(0).map(x=>x.id),['pikachu']);
  assert.deepEqual(c.availableSpecies(5000).map(x=>x.id),['pikachu','meowth']);
  assert.deepEqual(c.availableSpecies(30000).map(x=>x.id),['pikachu','meowth','piplup']);
  assert.deepEqual(c.availableSpecies(60000).map(x=>x.id),['pikachu','meowth','piplup','buizel']);
});

test('position on the spout controls launch direction while difficulty controls forgiveness',()=>{
  const c=core();
  const centre=c.launchVector(0,'normal');
  const left=c.launchVector(-.8,'normal');
  const right=c.launchVector(.8,'normal');
  assert.ok(Math.abs(centre.vx)<.001);
  assert.ok(left.vx<0);
  assert.ok(right.vx>0);
  assert.ok(centre.vy<0);
  assert.ok(c.DIFFICULTIES.easy.catchWidth>c.DIFFICULTIES.hard.catchWidth);
  assert.ok(c.DIFFICULTIES.easy.ballRadius>c.DIFFICULTIES.hard.ballRadius);
});

test('matching Pokemon open balls and build the multiplier toward the 15-ball objective',()=>{
  const c=core();
  const run=c.createRun({difficulty:'normal',rng:()=>.3,rainbowRate:0});
  for(let i=0;i<5;i++){
    const out=c.hitBall(run,'pikachu',{id:`b${i}`,colour:'yellow',rainbow:false});
    assert.equal(out.opened,true);
  }
  assert.equal(run.openedBalls,5);
  assert.equal(run.multiplier,2);
  assert.equal(run.combo,5);
  for(let i=5;i<15;i++)c.hitBall(run,'pikachu',{id:`b${i}`,colour:'yellow',rainbow:false});
  assert.equal(run.goalReached,true);
  assert.equal(run.openedBalls,15);
  assert.ok(run.score>0);
});

test('wrong-colour contact does not open the ball or advance the combo',()=>{
  const c=core();
  const run=c.createRun({difficulty:'normal',rng:()=>.2,rainbowRate:0});
  const out=c.hitBall(run,'pikachu',{id:'blue',colour:'blue',rainbow:false});
  assert.equal(out.opened,false);
  assert.equal(run.openedBalls,0);
  assert.equal(run.combo,0);
});

test('falling in the water resets combo and multiplier but preserves score',()=>{
  const c=core();
  const run=c.createRun({difficulty:'normal',rng:()=>.2,rainbowRate:0});
  for(let i=0;i<7;i++)c.hitBall(run,'pikachu',{id:`y${i}`,colour:'yellow',rainbow:false});
  const score=run.score;
  assert.ok(run.multiplier>1);
  c.registerFall(run,'pikachu');
  assert.equal(run.falls,1);
  assert.equal(run.combo,0);
  assert.equal(run.multiplier,1);
  assert.equal(run.maxMultiplier,2);
  assert.equal(run.score,score);
});

test('Rainbow Dream Ball can be forced and any Pokemon can open it for the rare prize',()=>{
  const c=core();
  const run=c.createRun({difficulty:'normal',rng:()=>0,rainbowRate:1});
  assert.equal(run.rainbowEvent,true);
  assert.ok(run.rainbowSpawnMs>=12000&&run.rainbowSpawnMs<=42000);
  const ball=c.makeBall(run,()=>.5,{forceRainbow:true});
  assert.equal(ball.rainbow,true);
  const out=c.hitBall(run,'piplup',ball);
  assert.equal(out.opened,true);
  assert.equal(run.rainbowOpened,true);
});

test('reward rises with score and a no-fall run earns a clear bonus',()=>{
  const c=core();
  const clean=c.createRun({difficulty:'hard',rng:()=>.2,rainbowRate:0});
  for(let i=0;i<15;i++)c.hitBall(clean,'pikachu',{id:`y${i}`,colour:'yellow',rainbow:false});
  const messy=c.createRun({difficulty:'hard',rng:()=>.2,rainbowRate:0});
  for(let i=0;i<8;i++)c.hitBall(messy,'pikachu',{id:`m${i}`,colour:'yellow',rainbow:false});
  c.registerFall(messy,'pikachu');
  assert.ok(c.rewardForRun(clean)>c.rewardForRun(messy));
  assert.ok(c.finalScore(clean)>clean.score);
});
