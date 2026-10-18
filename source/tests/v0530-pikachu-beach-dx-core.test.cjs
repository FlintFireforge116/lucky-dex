const test=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');
const core=require(path.resolve(__dirname,'../app/src/main/assets/arcade-pikachu-beach-dx-core.js'));
const content=require(path.resolve(__dirname,'../app/src/main/assets/arcade-pikachu-beach-dx-content.js'));
const rng=()=>.5;

test('DX content exposes three difficulties/distances, allies, pickups, enemies and five recovered bosses',()=>{
  assert.deepEqual(Object.keys(content.DIFFICULTIES),['easy','normal','hard']);assert.equal(Object.keys(content.DISTANCES).length,3);
  for(const id of ['seaking','lapras','natu'])assert.ok(content.ALLIES[id]);
  assert.ok(content.PICKUPS.hpUp);assert.ok(Object.keys(content.ENEMIES).length>=6);
  assert.deepEqual(content.BOSSES.map(x=>x.name),['Articuno','Zapdos','Moltres','Lugia','Wailord']);
});

test('DX movement is slippery and direction can coexist with jump/attack input',()=>{
  const r=core.createRun({rng});core.setInput(r,{right:true,jump:true,attack:true});let ev=core.step(r,20);
  assert.ok(r.player.vx>0);assert.equal(r.input.right,true);assert.equal(r.input.jump,true);assert.ok(ev.some(x=>x.type==='jump'));assert.ok(ev.some(x=>['ironTail','shot'].includes(x.type)));
  const vx=r.player.vx;core.setInput(r,{right:false});core.step(r,20);assert.ok(r.player.vx>0&&r.player.vx<vx,'momentum should decay instead of stopping instantly');
});

test('DX wave assisted jump, airborne steering/spin and landing bank a trick',()=>{
  const r=core.createRun({rng});r.waves=[{id:1,x:r.player.x+.01,y:r.waterline,lucky:false}];core.setInput(r,{jump:true,right:true});let ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='waveBoost'));assert.equal(r.player.airborne,true);
  core.setInput(r,{right:true});core.step(r,800);assert.ok(Math.abs(r.player.rotation)>180);
  r.player.y=r.waterline-.001;r.player.vy=.8;r.player.rotation=360;ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='landing'));assert.ok(r.trickScore>0);assert.ok(r.bestCombo>=1);
});

test('DX ranged attack, Iron Tail, rings, enemy damage and HP Up are functional',()=>{
  const r=core.createRun({rng});core.setInput(r,{attack:true});let ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='shot'));assert.ok(r.projectiles.length>0);
  r.rings=[{id:1,x:r.player.x,y:r.player.y,radius:.06}];core.setInput(r,{});ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='ring'));assert.equal(r.ringsCollected,1);
  r.player.hp=50;r.pickups=[{id:2,type:'hpUp',x:r.player.x,y:r.player.y,radius:.06}];ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='heal'));assert.ok(r.player.hp>50);
  r.player.invulnMs=0;r.enemies=[{id:3,type:'wingull',x:r.player.x,y:r.player.y,hp:1,radius:.05,damage:10,score:100,vx:0}];ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='damage'));assert.ok(r.player.hp<100);
  r.player.airborne=true;r.player.attackCooldownMs=0;r.inputPrev.attack=false;core.setInput(r,{attack:true});ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='ironTail'));
});

test('DX delayed frame uses fixed steps deterministically',()=>{
 const a=core.createRun({rng}),b=core.createRun({rng});a.spawnTimerMs=b.spawnTimerMs=99999;a.ringTimerMs=b.ringTimerMs=99999;a.waveTimerMs=b.waveTimerMs=99999;core.setInput(a,{right:true});core.setInput(b,{right:true});core.step(a,240);for(let i=0;i<12;i++)core.step(b,20);for(const key of ['distance','score','ringsCollected','elapsedMs'])assert.equal(a[key],b[key],key);assert.equal(a.player.x,b.player.x);assert.equal(a.player.vx,b.player.vx);
});

test('Seaking Lapras and Natu ally milestones all trigger',()=>{
 const r=core.createRun({distance:'long',rng});const got=[];for(const frac of [.21,.46,.71]){r.distance=r.targetDistance*frac;r.spawnTimerMs=r.ringTimerMs=r.waveTimerMs=99999;got.push(...core.step(r,20).filter(x=>x.type==='ally').map(x=>x.ally));}assert.deepEqual([...new Set(got)],['seaking','lapras','natu']);
});

test('all five bosses can spawn attack take damage and be defeated',()=>{
 const r=core.createRun({distance:'long',rng});r.spawnTimerMs=r.ringTimerMs=r.waveTimerMs=99999;
 for(let i=0;i<content.BOSSES.length;i++){
   r.distance=r.targetDistance*(content.BOSSES[i].spawnAt+.002);let ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='bossSpawn'&&x.boss===content.BOSSES[i].id),content.BOSSES[i].name+' spawn');
   r.boss.attackTimerMs=0;ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='bossAttack'),content.BOSSES[i].name+' attack');
   r.boss.hp=1;r.player.airborne=true;r.player.attackCooldownMs=0;r.player.x=r.boss.x;r.player.y=r.boss.y;r.inputPrev.attack=false;core.setInput(r,{attack:true});ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='bossDefeat'),content.BOSSES[i].name+' defeat');core.setInput(r,{});core.step(r,20);
 }
 assert.equal(r.bossesDefeated.length,5);
});

test('difficulty raises pressure/damage and distance changes target run length',()=>{
 assert.ok(content.DIFFICULTIES.hard.enemyIntervalMs<content.DIFFICULTIES.easy.enemyIntervalMs);assert.ok(content.DIFFICULTIES.hard.damageMultiplier>content.DIFFICULTIES.easy.damageMultiplier);
 const short=core.createRun({distance:'short',rng}),long=core.createRun({distance:'long',rng});assert.ok(long.targetDistance>short.targetDistance);
});

test('DX Lucky Wave is seen at its milestone and banked by a clean landing',()=>{
 const r=core.createRun({luckyWave:true,rng:()=>0});r.distance=r.targetDistance*(r.luckyWaveAt+.001);r.spawnTimerMs=r.ringTimerMs=r.waveTimerMs=99999;let ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='luckyWave'));assert.equal(r.luckyWaveSeen,true);assert.equal(r.luckyWavePendingLanding,false);const lucky=r.waves.find(w=>w.lucky);assert.ok(lucky);lucky.x=r.player.x+.01;r.player.y=lucky.y;r.inputPrev.jump=false;core.setInput(r,{jump:true});ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='waveBoost'&&x.lucky));assert.equal(r.luckyWavePendingLanding,true);r.player.y=r.player.landingY-.001;r.player.vy=.8;r.player.rotation=0;core.setInput(r,{});ev=core.step(r,20);assert.equal(r.luckyWaveLanded,true);
});
test('Iron Tail defeats are counted once and removed cleanly',()=>{const r=core.createRun({rng});r.spawnTimerMs=r.ringTimerMs=r.waveTimerMs=99999;r.player.airborne=true;r.player.attackCooldownMs=0;r.player.y=.4;r.enemies=[{id:77,type:'wingull',x:r.player.x+.01,y:r.player.y,hp:1,radius:.05,damage:8,score:90,vx:0}];core.setInput(r,{attack:true});const ev=core.step(r,20);assert.ok(ev.some(x=>x.type==='ironTail'));assert.equal(r.enemiesDefeated,1);assert.equal(r.enemies.length,0);});
