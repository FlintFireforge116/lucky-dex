'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=require('../app/src/main/assets/arcade-pikachu-beach-dx-core.js');
const content=require('../app/src/main/assets/arcade-pikachu-beach-dx-content.js');

function quiet(run){run.spawnTimerMs=run.ringTimerMs=run.waveTimerMs=999999;}

test('Beach House exposes DX directly with no Classic picker or Tail/Tilt control',()=>{
  const html=read('app/src/main/assets/index.html');
  const launcher=read('app/src/main/assets/arcade-pikachu-beach.js');
  assert.doesNotMatch(html,/pikachuBeachModePicker|pikachuBeachClassicView|data-pikachu-beach-mode="classic"/);
  assert.doesNotMatch(html,/data-dx-control="tilt"|TAIL\s*\/\s*TILT/);
  assert.match(html,/data-dx-control="jump"/);
  assert.match(html,/data-dx-control="attack"/);
  assert.doesNotMatch(html,/arcade-pikachu-beach-classic(?:-core)?\.js/);
  assert.match(launcher,/LuckyDexPikachuBeachDx/);
  assert.doesNotMatch(launcher,/LuckyDexPikachuBeachClassic|selectMode\(|showModePicker\(/);
});

test('ATTACK is context sensitive and airborne steering performs tricks without tilt input',()=>{
  const water=core.createRun({rng:()=>.5});quiet(water);
  core.setInput(water,{attack:true});let events=core.step(water,20);
  assert.ok(events.some(e=>e.type==='shot'));
  assert.equal(Object.hasOwn(water.input,'tilt'),false);

  const air=core.createRun({rng:()=>.5});quiet(air);air.player.airborne=true;air.player.y=.42;air.player.landingY=.62;
  core.setInput(air,{attack:true,right:true});events=core.step(air,20);
  assert.ok(events.some(e=>e.type==='ironTail'));
  assert.ok(air.player.rotation>0,'right should rotate Pikachu while airborne without a tilt button');
});

test('waves use varied lanes, require vertical alignment, and land Pikachu back on the launch lane',()=>{
  const low=core.createRun({rng:()=>.1});quiet(low);low.waveTimerMs=0;core.step(low,20);
  const high=core.createRun({rng:()=>.9});quiet(high);high.waveTimerMs=0;core.step(high,20);
  assert.equal(low.waves.length,1);assert.equal(high.waves.length,1);
  assert.notEqual(low.waves[0].y,high.waves[0].y);
  assert.ok(low.waves[0].y>=.42&&low.waves[0].y<=.72);
  assert.ok(high.waves[0].y>=.42&&high.waves[0].y<=.72);

  const miss=core.createRun({rng:()=>.5});quiet(miss);miss.player.y=.50;miss.waves=[{id:1,x:miss.player.x+.01,y:.70,lucky:false}];
  core.setInput(miss,{jump:true});let events=core.step(miss,20);
  assert.ok(events.some(e=>e.type==='jump'&&!e.waveBoost));
  assert.ok(!events.some(e=>e.type==='waveBoost'));

  const hit=core.createRun({rng:()=>.5});quiet(hit);hit.player.y=.56;hit.waves=[{id:2,x:hit.player.x+.01,y:.57,lucky:false}];
  core.setInput(hit,{jump:true});events=core.step(hit,20);
  assert.ok(events.some(e=>e.type==='waveBoost'));
  assert.equal(hit.player.landingY,.56);
  hit.player.y=.559;hit.player.vy=.7;core.setInput(hit,{});events=core.step(hit,20);
  assert.ok(events.some(e=>e.type==='landing'));
  assert.equal(hit.player.y,.56);
});

test('companions explain their effects and Natu actually fires at threats',()=>{
  assert.match(content.ALLIES.seaking.description,/ring/i);
  assert.match(content.ALLIES.lapras.description,/shield|HP/i);
  assert.match(content.ALLIES.natu.description,/fire|attack|enemy/i);
  const html=read('app/src/main/assets/index.html');
  for(const id of ['seaking','lapras','natu'])assert.match(html,new RegExp(`data-dx-ally-guide="${id}"`));

  const r=core.createRun({distance:'long',rng:()=>.5});quiet(r);r.allies=['natu'];r.allyFlags.natu=true;r.allyFireCooldownMs=0;
  r.enemies=[{id:22,type:'wingull',x:.65,y:.4,hp:3,radius:.045,damage:8,score:90,vx:0}];
  const events=core.step(r,20);
  assert.ok(events.some(e=>e.type==='allyFire'&&e.ally==='natu'));
  assert.ok(r.projectiles.some(p=>p.source==='natu'));
});

test('boss attacks are visible collision entities rather than instant random damage',()=>{
  const r=core.createRun({distance:'long',rng:()=>.5});quiet(r);const def=content.BOSSES[0];
  r.player.x=.20;r.player.y=.50;r.player.hp=100;
  r.boss={def,hp:def.hp,maxHp:def.hp,x:.82,y:.45,attackTimerMs:0};
  let events=core.step(r,20);
  assert.ok(events.some(e=>e.type==='bossAttack'));
  assert.equal(r.player.hp,100,'attack spawn must not deal invisible immediate damage');
  assert.equal(r.bossAttacks.length,1);
  assert.equal(r.bossAttacks[0].sprite,def.attackSprite);
  let damaged=false;
  for(let i=0;i<120&&!damaged;i++){
    events=core.step(r,20);
    damaged=events.some(e=>e.type==='damage'&&e.source===def.id);
  }
  assert.equal(damaged,true,'visible attack should damage only after reaching Pikachu');
});

test('DX renderer cycles recovered animation frames and uses the compact wave sprite',()=>{
  const ui=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  assert.match(ui,/SPRITE_FRAMES/);
  assert.match(ui,/padStart\(3,['"]0['"]\)/);
  assert.match(ui,/s_wave1/);
  assert.match(ui,/bossAttacks/);
  assert.match(ui,/attackSprite|sprite/);
});

test('result achievement descriptions have an explicit readable colour',()=>{
  const css=read('app/src/main/assets/arcade-records.css');
  assert.match(css,/\.arcade-review-achievement span\s*\{[^}]*color\s*:/s);
});

test('Classic achievements and record panels are retired while legacy save data can remain',()=>{
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  const retired=read('app/src/main/assets/retired-achievement-migrations-v0410.js');
  const records=read('app/src/main/assets/arcade-records.js');
  for(const id of ['pikachubeach_first_clear','pikachubeach_radness_1000','pikachubeach_hard_clear','pikachubeach_flawless','pikachubeach_triple_mixed','secret_pikachubeach_lucky_wave','secret_pikachubeach_5500']){
    assert.ok(!achievements.includes(`push('${id}'`),id+' should not remain active');
    assert.ok(retired.includes(id),id+' should be retired');
  }
  assert.doesNotMatch(records,/Classic Career|Classic Best Scores/);
  assert.match(records,/Boss Defeats/);
  assert.match(records,/Allies Befriended/);
});

test('v0.53.3 release behavior remains present with current aligned metadata',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=pkg.version,parts=version.split('.').map(Number);
  assert.ok(parts[0]>0||parts[1]>53||(parts[1]===53&&parts[2]>=3),`expected >=0.53.3, got ${version}`);
  assert.equal(lock.version,version); if(lock.packages?.[''])assert.equal(lock.packages[''].version,version);
  const escaped=version.replace(/\./g,'\\.'),gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  assert.match(gradle,new RegExp(`versionName\\s+['\"]${escaped}['\"]`));
  assert.match(gradle,new RegExp(`LuckyDex-asset-builder/${escaped}`));
  assert.match(app,new RegExp(`__LUCKYDEX_BUILD=['\"]${escaped}['\"]`));
  assert.ok((html.match(new RegExp(`v${escaped}`,'g'))||[]).length>=1);
});

test('Lucky Wave prize requires actually catching the rare wave before landing',()=>{
  const r=core.createRun({luckyWave:true,rng:()=>0});quiet(r);
  r.distance=r.targetDistance*(r.luckyWaveAt+.001);let events=core.step(r,20);
  assert.ok(events.some(e=>e.type==='luckyWave'));assert.equal(r.luckyWaveSeen,true);assert.equal(r.luckyWavePendingLanding,false);
  r.player.airborne=true;r.player.landingY=r.waterline;r.player.y=r.waterline-.001;r.player.vy=.8;r.player.rotation=0;
  events=core.step(r,20);assert.equal(r.luckyWaveLanded,false,'an unrelated clean landing must not claim the rare wave');
  r.waves[0].x=r.player.x+.01;r.player.y=r.waves[0].y;r.player.landingY=r.player.y;r.player.airborne=false;r.player.vy=0;r.inputPrev.jump=false;core.setInput(r,{jump:true});events=core.step(r,20);
  assert.ok(events.some(e=>e.type==='waveBoost'&&e.lucky));assert.equal(r.luckyWavePendingLanding,true);
  r.player.y=r.player.landingY-.001;r.player.vy=.8;core.setInput(r,{});events=core.step(r,20);
  assert.equal(r.luckyWaveLanded,true);
});

test('surface ATTACK feedback consistently calls the move Thunderbolt',()=>{
  const ui=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  assert.match(ui,/THUNDERBOLT/);assert.doesNotMatch(ui,/THUNDERSHOCK/);
});

test('every DX controller audio reference resolves to a bundled recovered WAV',()=>{
  const ui=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  const refs=[...new Set([...ui.matchAll(/['"](a_[A-Za-z0-9_]+)['"]/g)].map(m=>m[1]))];
  assert.ok(refs.length>=10);
  for(const ref of refs)assert.equal(fs.existsSync(path.join(root,'app/src/main/assets/arcade/pikachu-beach/dx/audio',`${ref}.wav`)),true,`${ref}.wav`);
});
