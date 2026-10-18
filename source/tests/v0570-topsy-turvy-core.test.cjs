'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const CORE_PATH=path.join(__dirname,'..','app','src','main','assets','arcade-topsy-turvy-core.js');

function loadCore(){
  assert.equal(fs.existsSync(CORE_PATH),true,'arcade-topsy-turvy-core.js must exist');
  delete require.cache[require.resolve(CORE_PATH)];
  return require(CORE_PATH);
}

test('Topsy-Turvy starts four Hitmontop in a 60 second first-to-five ring-out match',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  assert.equal(core.CONFIG.durationMs,60000);
  assert.equal(core.CONFIG.knockoutsToWin,5);
  assert.equal(run.players.length,4);
  assert.deepEqual(run.players.map(p=>p.dex),[237,237,237,237]);
  assert.ok(run.players.every(p=>p.knockouts===0&&p.falls===0));
  assert.equal(run.remainingMs,60000);
});



test('the enlarged arena gives Hitmontop more room to build momentum',()=>{
  const core=loadCore();
  assert.ok(core.CONFIG.arenaRadius>=305,'playable arena radius should be meaningfully larger than the original 276px ring');
  assert.ok(core.CONFIG.arenaRadius+core.CONFIG.playerRadius<core.CONFIG.width/2,'larger ring must still keep a full Hitmontop visible at the edge');
});

test('Rapid Spin has a wider collision envelope than an ordinary body bump',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=320;a.y=360;a.vx=220;a.vy=0;
  b.x=386;b.y=360;b.vx=0;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.ok(Math.abs(b.vx)<1,'66px separation should be outside normal body-contact range');

  a.x=320;a.y=360;a.vx=220;a.vy=0;b.x=386;b.y=360;b.vx=0;b.vy=0;
  assert.equal(core.rapidSpin(run,0),true);
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.ok(b.vx>400,'Rapid Spin should connect across a wider arc and launch the opponent decisively');
});

test('movement accelerates Hitmontop and preserves momentum instead of teleporting',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const p=run.players[0],startX=p.x;
  core.stepMatch(run,250,[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
  assert.ok(p.x>startX+5,'right input should move Hitmontop across the ring');
  assert.ok(p.vx>0,'right input should build positive horizontal momentum');
  const movingX=p.x;
  core.stepMatch(run,80,[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
  assert.ok(p.x>movingX,'Hitmontop should coast briefly after input is released');
});

test('ordinary body contact transfers momentum even without Rapid Spin',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=330;a.y=360;a.vx=310;a.vy=0;
  b.x=372;b.y=360;b.vx=0;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.stepMatch(run,16,[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
  assert.ok(b.vx>70,'collision should shove the opponent in the direction of travel');
  assert.ok(a.vx<310,'attacker should lose some momentum on impact');
});

test('Rapid Spin gives a strong shove and cannot be used again for three seconds',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=330;a.y=360;a.vx=260;a.vy=0;
  b.x=372;b.y=360;b.vx=0;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  assert.equal(core.rapidSpin(run,0),true);
  assert.ok(a.spinCooldownMs>=3000,'Rapid Spin recharge should be at least three seconds');
  assert.equal(core.rapidSpin(run,0),false,'Rapid Spin must not be spammable during recharge');
  core.stepMatch(run,16,[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
  assert.ok(b.vx>300,'active Rapid Spin should hit much harder than ordinary body contact');
  core.stepMatch(run,100,[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
  assert.ok(a.spinCooldownMs<3000,'recharge should count down during the match');
});

test('a ring-out credits the last opponent who hit the victim and respawns the victim',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const victim=run.players[1];
  victim.x=core.CONFIG.centreX+core.CONFIG.arenaRadius+20;victim.y=core.CONFIG.centreY;
  victim.lastHitBy=0;victim.lastHitAt=run.elapsedMs;
  core.stepMatch(run,16,[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
  assert.equal(run.players[0].knockouts,1);
  assert.equal(victim.falls,1);
  assert.ok(victim.respawnMs>0,'ringed-out Hitmontop should wait briefly before returning');
  core.stepMatch(run,100,[{},{},{},{}]);
  while(victim.respawnMs>0)core.stepMatch(run,100,[{},{},{},{}]);
  assert.ok(Math.hypot(victim.x-core.CONFIG.centreX,victim.y-core.CONFIG.centreY)<core.CONFIG.arenaRadius*.6,'respawn returns Hitmontop safely inside the ring');
  assert.ok(victim.invulnerableMs>0,'respawn should have a short safe window');
});

test('the first player to five ring-outs wins immediately',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  run.players[0].knockouts=4;
  const victim=run.players[1];
  victim.x=core.CONFIG.centreX+core.CONFIG.arenaRadius+20;victim.y=core.CONFIG.centreY;victim.lastHitBy=0;victim.lastHitAt=run.elapsedMs;
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.equal(run.players[0].knockouts,5);
  assert.equal(run.finished,true);
  assert.equal(run.winnerIndex,0);
  assert.equal(run.players[0].place,1);
});

test('if nobody reaches five, the 60 second horn ranks players by ring-outs',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  run.players[0].knockouts=3;run.players[1].knockouts=1;run.players[2].knockouts=4;run.players[3].knockouts=2;
  run.elapsedMs=59960;run.remainingMs=40;
  core.stepMatch(run,60,[{},{},{},{}]);
  assert.equal(run.finished,true);
  assert.equal(run.winnerIndex,2);
  assert.deepEqual(run.ranking.map(p=>p.index),[2,0,3,1]);
});

test('CPU personalities are shuffled per match rather than tied to COM number',()=>{
  const core=loadCore();
  const seq=values=>{let i=0;return ()=>values[i++%values.length];};
  const a=core.createMatch({rng:seq([0.05,0.85,0.25,0.65])});
  const b=core.createMatch({rng:seq([0.95,0.15,0.75,0.35])});
  const pa=a.players.slice(1).map(p=>p.personality);
  const pb=b.players.slice(1).map(p=>p.personality);
  assert.deepEqual([...pa].sort(),['bully','counter','opportunist']);
  assert.deepEqual([...pb].sort(),['bully','counter','opportunist']);
  assert.notDeepEqual(pa,pb,'COM 1/2/3 should not permanently own one personality');
});

test('CPU steering noise is centred so a midpoint RNG value adds no directional bias',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const player=run.players[0],cpu=run.players[1];
  player.x=460;player.y=360;player.vx=player.vy=0;
  cpu.x=360;cpu.y=360;cpu.vx=cpu.vy=0;cpu.personality='bully';cpu.aiTargetIndex=0;cpu.aiThinkMs=9999;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.stepMatch(run,100,[{},undefined,{},{}]);
  assert.ok(cpu.vx>0,'CPU should accelerate toward the target');
  assert.ok(Math.abs(cpu.vy)<0.001,'RNG midpoint should not bias steering above or below the target');
});

test('a spinning Hitmontop still records the opponent as its last contact rather than itself',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=330;a.y=360;a.vx=100;a.vy=0;
  b.x=372;b.y=360;b.vx=0;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.rapidSpin(run,1);
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.equal(b.lastHitBy,0,'the spinner must not overwrite its last opponent contact with a self-hit');
});

test('Rapid Spin collisions ricochet the attacker and launch the victim at impact speed',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=330;a.y=360;a.vx=260;a.vy=0;
  b.x=372;b.y=360;b.vx=0;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.rapidSpin(run,0);
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.ok(b.vx>core.CONFIG.maxSpeed*1.8,'a spin hit should blast the victim far beyond ordinary movement speed');
  assert.ok(a.vx<0,'the spinning attacker should visibly recoil instead of pushing through like a soft shove');
});

test('impact velocity survives the next frame so spin hits feel like launches instead of capped movement',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=330;a.y=360;a.vx=300;a.vy=0;
  b.x=372;b.y=360;b.vx=0;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.rapidSpin(run,0);
  core.stepMatch(run,16,[{},{},{},{}]);
  const launched=Math.abs(b.vx);
  assert.ok(launched>core.CONFIG.maxSpeed*1.8,'first impact should exceed normal drive speed');
  b.x=500;b.y=360;
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.ok(Math.abs(b.vx)>core.CONFIG.maxSpeed,'impact momentum should decay naturally rather than being clamped to drive speed next frame');
});

test('Rapid Spin versus Rapid Spin explodes both Hitmontop apart like battling tops',()=>{
  const core=loadCore();
  const run=core.createMatch({rng:()=>0.5});
  const a=run.players[0],b=run.players[1];
  a.x=330;a.y=360;a.vx=180;a.vy=0;
  b.x=372;b.y=360;b.vx=-180;b.vy=0;
  run.players[2].respawnMs=9999;run.players[3].respawnMs=9999;
  core.rapidSpin(run,0);core.rapidSpin(run,1);
  core.stepMatch(run,16,[{},{},{},{}]);
  assert.ok(a.vx<-450,'left spinner should be blasted back from a spin clash');
  assert.ok(b.vx>450,'right spinner should be blasted back from a spin clash');
});
