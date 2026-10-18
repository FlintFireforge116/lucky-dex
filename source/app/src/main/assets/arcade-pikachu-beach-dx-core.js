(function(root,factory){const content=root.LuckyDexPikachuBeachDxContent||(typeof require==='function'?require('./arcade-pikachu-beach-dx-content.js'):null);const api=factory(content);if(typeof module==='object'&&module.exports){module.exports=api;return;}root.LuckyDexPikachuBeachDxCore=api;})(typeof window!=='undefined'?window:globalThis,function(content){
'use strict';
if(!content)throw new Error('LuckyDexPikachuBeachDxContent required');
const FIXED=20;
const CONFIG=Object.freeze({fixedStepMs:FIXED,maxHp:100,waterline:.72,waveMinY:.44,waveMaxY:.70,waveCatchRadius:.085,natuFireEveryMs:760,luckyWaveRate:.02});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rand=r=>clamp((r||Math.random)(),0,.999999);

function createRun({difficulty='normal',distance='standard',luckyWave=false,rng=Math.random}={}){
  const d=content.DIFFICULTIES[difficulty]||content.DIFFICULTIES.normal;
  const route=content.DISTANCES[distance]||content.DISTANCES.standard;
  const r=rand(rng);
  return {difficulty:d.key,distanceKey:route.key,targetDistance:route.target,distance:0,progress:0,elapsedMs:0,carryMs:0,waterline:CONFIG.waterline,score:0,trickScore:0,bestTrick:0,bestCombo:0,combo:0,ringsCollected:0,enemiesDefeated:0,damageTaken:0,healed:0,finished:false,cleared:false,
    input:{up:false,down:false,left:false,right:false,jump:false,attack:false},inputPrev:{jump:false,attack:false},
    player:{x:.23,y:CONFIG.waterline,landingY:CONFIG.waterline,vx:0,vy:0,airborne:false,rotation:0,hp:CONFIG.maxHp,invulnMs:0,attackCooldownMs:0,shieldMs:0,ironTailMs:0,ironTailHitMs:0},
    enemies:[],rings:[],pickups:[],waves:[],projectiles:[],bossAttacks:[],allies:[],allyFlags:{},allyFireCooldownMs:0,boss:null,nextBossIndex:0,bossesDefeated:[],
    spawnTimerMs:500+Math.floor(r*400),ringTimerMs:1000,waveTimerMs:1200,projectileSeq:0,entitySeq:0,luckyWaveActive:!!luckyWave,luckyWaveAt:luckyWave?.28+r*.28:null,luckyWaveSeen:false,luckyWaveLanded:false,luckyWavePendingLanding:false,_rng:rng};
}
function setInput(run,v={}){if(!run)return null;for(const k of ['up','down','left','right','jump','attack'])run.input[k]=!!v[k];return run.input;}
function spawnEnemy(run){const keys=Object.keys(content.ENEMIES),def=content.ENEMIES[keys[Math.floor(rand(run._rng)*keys.length)]],p=content.DIFFICULTIES[run.difficulty];run.enemies.push({id:++run.entitySeq,type:def.id,x:1.08,y:.24+rand(run._rng)*.48,hp:Math.max(1,Math.round(def.hp*p.enemyHpMultiplier)),radius:def.radius,damage:def.damage,score:def.score,vx:-def.speed,frameOffset:Math.floor(rand(run._rng)*11)});}
function spawnRing(run){run.rings.push({id:++run.entitySeq,x:1.04,y:.3+rand(run._rng)*.37,radius:.05,frameOffset:Math.floor(rand(run._rng)*7)});}
function spawnWave(run,lucky=false){const y=lucky?clamp(run.player.airborne?run.player.landingY:run.player.y,CONFIG.waveMinY,CONFIG.waveMaxY):CONFIG.waveMinY+rand(run._rng)*(CONFIG.waveMaxY-CONFIG.waveMinY);run.waves.push({id:++run.entitySeq,x:1.06,y,lucky:!!lucky,frameOffset:Math.floor(rand(run._rng)*6)});}
function spawnHp(run){run.pickups.push({id:++run.entitySeq,type:'hpUp',x:1.03,y:.4+rand(run._rng)*.25,radius:content.PICKUPS.hpUp.radius,frameOffset:Math.floor(rand(run._rng)*5)});}
function damagePlayer(run,amount,events,source){if(run.player.invulnMs>0||run.player.shieldMs>0)return false;const p=content.DIFFICULTIES[run.difficulty],dmg=Math.max(1,Math.round(amount*p.damageMultiplier));run.player.hp=Math.max(0,run.player.hp-dmg);run.damageTaken+=dmg;run.player.invulnMs=700;run.combo=0;events.push({type:'damage',amount:dmg,source,hp:run.player.hp});return true;}
function addScore(run,n){run.score+=Math.round(n*content.DIFFICULTIES[run.difficulty].scoreMultiplier);}
function hitBoss(run,damage,events){if(!run.boss)return;run.boss.hp=Math.max(0,run.boss.hp-damage);if(run.boss.hp<=0){const b=run.boss.def;addScore(run,b.score);run.bossesDefeated.push(b.id);events.push({type:'bossDefeat',boss:b.id,name:b.name,score:b.score});run.boss=null;run.combo++;run.bestCombo=Math.max(run.bestCombo,run.combo);}}
function countEnemyDefeat(run,e,events,attack){if(e._counted)return;e._counted=true;run.enemiesDefeated++;addScore(run,e.score);run.combo++;run.bestCombo=Math.max(run.bestCombo,run.combo);events.push({type:'enemyHit',enemy:e.type,defeated:true,attack});}
function doAttack(run,events){if(run.player.attackCooldownMs>0)return;if(run.player.airborne){run.player.attackCooldownMs=360;run.player.ironTailMs=220;let hit=false;for(const e of run.enemies){if(e.hp>0&&dist(run.player,e)<.14){e.hp-=3;hit=true;if(e.hp<=0)countEnemyDefeat(run,e,events,'ironTail');}}if(run.boss&&dist(run.player,run.boss)<.22){hitBoss(run,25,events);hit=true;}run.player.ironTailHitMs=hit?220:0;events.push({type:'ironTail',hit});if(hit)addScore(run,80);}else{run.player.attackCooldownMs=220;const p={id:++run.projectileSeq,x:run.player.x+.04,y:run.player.y-.03,vx:.82,vy:0,damage:2,source:'pikachu',sprite:'s_bullet_small'};run.projectiles.push(p);events.push({type:'shot',id:p.id});}}
function updatePlayer(run,dt,events){
  const p=run.player,i=run.input,sec=dt/1000,acc=.85,max=.34,fr=.9;
  if(i.left&&!i.right)p.vx=Math.max(-max,p.vx-acc*sec);else if(i.right&&!i.left)p.vx=Math.min(max,p.vx+acc*sec);else p.vx*=fr;
  if(!p.airborne){if(i.up&&!i.down)p.y-=.31*sec;if(i.down&&!i.up)p.y+=.31*sec;p.y=clamp(p.y,.14,run.waterline);}
  p.x=clamp(p.x+p.vx*sec,.08,.72);
  const jumpEdge=i.jump&&!run.inputPrev.jump,attackEdge=i.attack&&!run.inputPrev.attack;
  if(jumpEdge&&!p.airborne){
    const wave=run.waves.find(w=>Math.abs(w.x-p.x)<.12&&Math.abs(w.y-p.y)<=CONFIG.waveCatchRadius);
    let boost=false;p.landingY=p.y;
    if(wave){boost=true;events.push({type:'waveBoost',lucky:wave.lucky});if(wave.lucky){run.luckyWaveSeen=true;run.luckyWavePendingLanding=true;}run.waves=run.waves.filter(w=>w!==wave);}
    p.airborne=true;p.vy=boost?-.86:-.62;events.push({type:'jump',waveBoost:boost});
  }
  if(attackEdge)doAttack(run,events);
  if(p.airborne){
    p.vy+=1.42*sec;p.y+=p.vy*sec;
    if(i.left!==i.right){const sign=i.left?-1:1;p.rotation+=sign*540*sec;}
    if(p.y>=p.landingY&&p.vy>0){
      p.y=p.landingY;p.vy=0;p.airborne=false;
      const a=((p.rotation%360)+360)%360,err=Math.min(a,360-a),spins=Math.floor(Math.abs(p.rotation)/360),perfect=err<=22,poor=err>85;
      let bank=spins?spins*250*(1+Math.min(3,run.combo)*.25):0;if(perfect&&spins)bank+=150;
      if(poor){damagePlayer(run,5,events,'landing');run.combo=0;}else if(spins){run.combo++;run.bestCombo=Math.max(run.bestCombo,run.combo);run.trickScore+=Math.round(bank);run.bestTrick=Math.max(run.bestTrick,Math.round(bank));addScore(run,bank);}
      events.push({type:'landing',perfect,poor,spins,points:Math.round(bank)});if(run.luckyWavePendingLanding&&!poor){run.luckyWaveLanded=true;run.luckyWavePendingLanding=false;events.push({type:'luckyWaveLanded'});}p.rotation=0;
    }
  }
  if(p.invulnMs>0)p.invulnMs=Math.max(0,p.invulnMs-dt);if(p.attackCooldownMs>0)p.attackCooldownMs=Math.max(0,p.attackCooldownMs-dt);if(p.shieldMs>0)p.shieldMs=Math.max(0,p.shieldMs-dt);if(p.ironTailMs>0)p.ironTailMs=Math.max(0,p.ironTailMs-dt);if(p.ironTailHitMs>0)p.ironTailHitMs=Math.max(0,p.ironTailHitMs-dt);
  run.inputPrev={jump:i.jump,attack:i.attack};
}
function fireNatu(run,events){
  if(!run.allyFlags.natu)return;
  if(run.allyFireCooldownMs>0)return;
  const target=run.boss||run.enemies.filter(e=>e.hp>0).sort((a,b)=>dist({x:.31,y:.18},a)-dist({x:.31,y:.18},b))[0];
  if(!target)return;
  const tx=run.boss?target.x:target.x,ty=run.boss?target.y:target.y,sx=.31,sy=.18,dx=tx-sx,dy=ty-sy,len=Math.max(.001,Math.hypot(dx,dy)),speed=.68;
  const p={id:++run.projectileSeq,x:sx,y:sy,vx:dx/len*speed,vy:dy/len*speed,damage:1.4,source:'natu',sprite:'s_electroBall'};run.projectiles.push(p);run.allyFireCooldownMs=CONFIG.natuFireEveryMs;events.push({type:'allyFire',ally:'natu',target:run.boss?run.boss.def.id:target.type,id:p.id});
}
function updateEntities(run,dt,events){
  const sec=dt/1000,p=run.player;
  for(const w of run.waves)w.x-=.18*sec;run.waves=run.waves.filter(w=>w.x>-.1);
  for(const ring of run.rings)ring.x-=.16*sec;for(const ring of run.rings){if(dist(p,ring)<ring.radius+.045){ring.collected=true;run.ringsCollected++;run.combo++;run.bestCombo=Math.max(run.bestCombo,run.combo);addScore(run,100);events.push({type:'ring',combo:run.combo});}}run.rings=run.rings.filter(x=>!x.collected&&x.x>-.1);
  for(const item of run.pickups)item.x-=.12*sec;for(const item of run.pickups){if(dist(p,item)<item.radius+.05){item.collected=true;if(item.type==='hpUp'){const before=p.hp;p.hp=Math.min(CONFIG.maxHp,p.hp+content.PICKUPS.hpUp.heal);const heal=p.hp-before;run.healed+=heal;events.push({type:'heal',amount:heal,hp:p.hp});}}}run.pickups=run.pickups.filter(x=>!x.collected&&x.x>-.1);
  for(const e of run.enemies){e.x+=e.vx*sec;if(e.hp>0&&dist(p,e)<e.radius+.045){if(damagePlayer(run,e.damage,events,e.type))e.hp=0;}}
  for(const shot of run.projectiles){
    shot.x+=shot.vx*sec;shot.y+=(shot.vy||0)*sec;
    for(const e of run.enemies){if(e.hp>0&&Math.hypot(shot.x-e.x,shot.y-e.y)<e.radius+.025){e.hp-=shot.damage;shot.dead=true;if(e.hp<=0)countEnemyDefeat(run,e,events,shot.source);break;}}
    if(run.boss&&!shot.dead&&Math.hypot(shot.x-run.boss.x,shot.y-run.boss.y)<.12){shot.dead=true;hitBoss(run,shot.damage*(shot.source==='natu'?2:3),events);}
  }
  for(const attack of run.bossAttacks){attack.x+=attack.vx*sec;attack.y+=(attack.vy||0)*sec;if(!attack.dead&&Math.hypot(attack.x-p.x,attack.y-p.y)<attack.radius+.045){attack.dead=true;damagePlayer(run,attack.damage,events,attack.boss);}}
  run.enemies=run.enemies.filter(e=>e.hp>0&&e.x>-.15);run.projectiles=run.projectiles.filter(s=>!s.dead&&s.x<1.15&&s.x>-.15&&s.y>-.2&&s.y<1.2);run.bossAttacks=run.bossAttacks.filter(a=>!a.dead&&a.x>-.15&&a.x<1.15);
}
function updateSpawns(run,dt){const d=content.DIFFICULTIES[run.difficulty];run.spawnTimerMs-=dt;run.ringTimerMs-=dt;run.waveTimerMs-=dt;if(run.spawnTimerMs<=0&&!run.boss){spawnEnemy(run);run.spawnTimerMs=d.enemyIntervalMs*(.8+rand(run._rng)*.45);}if(run.ringTimerMs<=0){spawnRing(run);run.ringTimerMs=850+rand(run._rng)*1000;}if(run.waveTimerMs<=0){spawnWave(run,false);run.waveTimerMs=1900+rand(run._rng)*1700;}if(run.player.hp<65&&run.pickups.length===0&&rand(run._rng)<.012)spawnHp(run);}
function updateAllies(run,dt,events){
  const frac=run.targetDistance?run.distance/run.targetDistance:0;
  for(const a of Object.values(content.ALLIES))if(!run.allyFlags[a.id]&&frac>=a.spawnAt){run.allyFlags[a.id]=true;run.allies.push(a.id);events.push({type:'ally',ally:a.id,name:a.name,effect:a.effect,description:a.description});if(a.effect==='ringSweep'){run.ringsCollected+=5;addScore(run,500);}else if(a.effect==='shield'){const before=run.player.hp;run.player.shieldMs=Math.max(run.player.shieldMs,5000);run.player.hp=Math.min(CONFIG.maxHp,run.player.hp+20);run.healed+=run.player.hp-before;}else if(a.effect==='assistFire'){addScore(run,700);run.allyFireCooldownMs=0;}}
  if(run.allyFireCooldownMs>0)run.allyFireCooldownMs=Math.max(0,run.allyFireCooldownMs-dt);fireNatu(run,events);
}
function updateLucky(run,events){if(!run.luckyWaveActive||run.luckyWaveSeen)return;const frac=run.targetDistance?run.distance/run.targetDistance:0;if(frac>=run.luckyWaveAt){run.luckyWaveSeen=true;spawnWave(run,true);events.push({type:'luckyWave'});}}
function maybeSpawnBoss(run,events){if(run.boss||run.nextBossIndex>=content.BOSSES.length)return;const def=content.BOSSES[run.nextBossIndex],frac=run.targetDistance?run.distance/run.targetDistance:0;if(frac>=def.spawnAt){run.nextBossIndex++;const hp=Math.round(def.hp*content.DIFFICULTIES[run.difficulty].enemyHpMultiplier);run.boss={def,hp,maxHp:hp,x:.82,y:.34+rand(run._rng)*.25,attackTimerMs:300};events.push({type:'bossSpawn',boss:def.id,name:def.name});}}
function spawnBossAttack(run,events){
  const b=run.boss;if(!b)return;
  const targetY=clamp(run.player.y+(rand(run._rng)-.5)*.035,.16,.72),speed=b.def.attackSpeed||.5;
  const attack={id:++run.entitySeq,boss:b.def.id,pattern:b.def.pattern,sprite:b.def.attackSprite,x:b.x-.06,y:targetY,vx:-speed,vy:0,radius:b.def.attackRadius||.06,damage:b.def.damage,frameOffset:Math.floor(rand(run._rng)*7)};
  run.bossAttacks.push(attack);events.push({type:'bossAttack',boss:b.def.id,pattern:b.def.pattern,damage:b.def.damage,attackId:attack.id});
}
function updateBoss(run,dt,events){if(!run.boss)return;const b=run.boss;b.attackTimerMs-=dt;b.y=clamp(b.y+Math.sin(run.elapsedMs/550)*.0008,.2,.62);if(b.attackTimerMs<=0){b.attackTimerMs=b.def.attackEveryMs;spawnBossAttack(run,events);}}
function fixed(run,events){if(run.finished)return;run.elapsedMs+=FIXED;updatePlayer(run,FIXED,events);const bossSlow=run.boss?.def?.id==='wailord'?.45:(run.boss?.def?.id?.7:1);const forward=1.05*content.DIFFICULTIES[run.difficulty].forwardMultiplier*bossSlow;run.distance=Math.min(run.targetDistance,run.distance+forward*(FIXED/1000));run.progress=clamp(run.distance/run.targetDistance,0,1);updateSpawns(run,FIXED);updateEntities(run,FIXED,events);updateAllies(run,FIXED,events);updateLucky(run,events);maybeSpawnBoss(run,events);updateBoss(run,FIXED,events);if(run.player.hp<=0){run.finished=true;run.cleared=false;events.push({type:'finish',cleared:false});}else if(run.distance>=run.targetDistance&&!run.boss&&run.nextBossIndex>=content.BOSSES.length){run.finished=true;run.cleared=true;events.push({type:'finish',cleared:true});}}
function step(run,dtMs){if(!run||run.finished)return [];const events=[];run.carryMs+=Math.max(0,Number(dtMs)||0);let guard=0;while(run.carryMs>=FIXED&&!run.finished&&guard++<1000){run.carryMs-=FIXED;fixed(run,events);}return events;}
function finishRun(run){if(!run)return {cleared:false,finalScore:0};const hp=Math.max(0,Math.round(run.player.hp)),finalScore=Math.max(0,Math.round(run.score+(run.cleared?hp*12:0)));return {cleared:!!run.cleared,finalScore,score:run.score,distance:run.distanceKey,distanceTravelled:run.distance,hp,damageTaken:run.damageTaken,rings:run.ringsCollected,enemies:run.enemiesDefeated,bosses:run.bossesDefeated.slice(),bossCount:run.bossesDefeated.length,allies:run.allies.slice(),bestCombo:run.bestCombo,bestTrick:run.bestTrick,trickScore:run.trickScore,luckyWaveSeen:run.luckyWaveSeen,luckyWaveLanded:run.luckyWaveLanded};}
function snapshot(run){if(!run)return null;return {difficulty:run.difficulty,distanceKey:run.distanceKey,targetDistance:run.targetDistance,distance:run.distance,progress:run.progress,score:run.score,trickScore:run.trickScore,bestTrick:run.bestTrick,bestCombo:run.bestCombo,ringsCollected:run.ringsCollected,enemiesDefeated:run.enemiesDefeated,damageTaken:run.damageTaken,elapsedMs:run.elapsedMs,finished:run.finished,cleared:run.cleared,player:{...run.player},enemies:run.enemies.map(x=>({...x})),rings:run.rings.map(x=>({...x})),pickups:run.pickups.map(x=>({...x})),waves:run.waves.map(x=>({...x})),projectiles:run.projectiles.map(x=>({...x})),bossAttacks:run.bossAttacks.map(x=>({...x})),allies:run.allies.slice(),boss:run.boss?{id:run.boss.def.id,name:run.boss.def.name,sprite:run.boss.def.sprite,attackSprite:run.boss.def.attackSprite,hp:run.boss.hp,maxHp:run.boss.maxHp,x:run.boss.x,y:run.boss.y}:null,bossesDefeated:run.bossesDefeated.slice(),luckyWaveSeen:run.luckyWaveSeen,luckyWaveLanded:run.luckyWaveLanded};}
return Object.freeze({CONFIG,createRun,setInput,step,finishRun,snapshot});
});
