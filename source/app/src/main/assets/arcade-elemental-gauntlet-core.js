(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexElementalGauntletCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const round1=n=>Math.round(Number(n||0)*10)/10;
  const COUNTDOWN_STEP_MS=650;
  const HEALTH_MAX=30;
  const COUNTDOWN_END_MS=COUNTDOWN_STEP_MS*4;
  const WAVES=Object.freeze([
    Object.freeze({id:'fire',type:'fire',name:'FIRESTORM',move:'Flamethrower',baseDamage:24,pattern:'firestorm'}),
    Object.freeze({id:'water',type:'water',name:'RIPTIDE',move:'Water Pulse',baseDamage:22,pattern:'riptide'}),
    Object.freeze({id:'electric',type:'electric',name:'THUNDER FIELD',move:'Thunderbolt',baseDamage:25,pattern:'thunder'}),
    Object.freeze({id:'ice',type:'ice',name:'ICE SHARDS',move:'Ice Beam',baseDamage:23,pattern:'ice'}),
    Object.freeze({id:'psychic',type:'psychic',name:'PSYCHIC PRESSURE',move:'Psybeam',baseDamage:27,pattern:'psychic'}),
  ]);
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({id:'easy',label:'EASY',telegraphMs:1080,cadenceMinMs:300,cadenceMaxMs:680,burstChance:.12,burstMinMs:120,burstMaxMs:230,groupGapMs:680,clusterSize:1,clusterGapMs:0,hazardScale:.90,damageScale:.88,shieldDamageScale:1,guardDrain:0,guardRegen:0,countScale:1.10,rewardMultiplier:.82}),
    normal:Object.freeze({id:'normal',label:'NORMAL',telegraphMs:820,cadenceMinMs:210,cadenceMaxMs:500,burstChance:.16,burstMinMs:80,burstMaxMs:170,groupGapMs:500,clusterSize:2,clusterGapMs:145,hazardScale:1,damageScale:1,shieldDamageScale:1,guardDrain:0,guardRegen:0,countScale:2.10,rewardMultiplier:1}),
    hard:Object.freeze({id:'hard',label:'HARD',telegraphMs:535,cadenceMinMs:185,cadenceMaxMs:355,burstChance:.18,burstMinMs:45,burstMaxMs:110,groupGapMs:355,clusterSize:3,clusterGapMs:65,hazardScale:1.04,damageScale:1.28,shieldDamageScale:1.60,guardDrain:0,guardRegen:0,countScale:3.85,rewardMultiplier:1.38}),
  });
  const DIVISION_BASE=Object.freeze({
    rookie:{telegraphMs:1010,cadenceMinMs:285,cadenceMaxMs:650,burstChance:.12,burstMinMs:115,burstMaxMs:220,groupGapMs:650,clusterSize:1,clusterGapMs:0,hazardScale:.92,damageScale:.92,shieldDamageScale:1,guardDrain:0,guardRegen:0,countScale:1.10},
    poke:{telegraphMs:900,cadenceMinMs:245,cadenceMaxMs:570,burstChance:.14,burstMinMs:95,burstMaxMs:190,groupGapMs:570,clusterSize:2,clusterGapMs:175,hazardScale:.96,damageScale:.96,shieldDamageScale:1,guardDrain:0,guardRegen:0,countScale:1.60},
    great:{telegraphMs:785,cadenceMinMs:210,cadenceMaxMs:500,burstChance:.16,burstMinMs:80,burstMaxMs:170,groupGapMs:500,clusterSize:2,clusterGapMs:145,hazardScale:1,damageScale:1.03,shieldDamageScale:1,guardDrain:0,guardRegen:0,countScale:2.10},
    ultra:{telegraphMs:650,cadenceMinMs:195,cadenceMaxMs:415,burstChance:.17,burstMinMs:60,burstMaxMs:135,groupGapMs:415,clusterSize:2,clusterGapMs:105,hazardScale:1.04,damageScale:1.14,shieldDamageScale:1.25,guardDrain:0,guardRegen:0,countScale:2.65},
    master:{telegraphMs:535,cadenceMinMs:180,cadenceMaxMs:355,burstChance:.19,burstMinMs:45,burstMaxMs:105,groupGapMs:355,clusterSize:3,clusterGapMs:70,hazardScale:1.07,damageScale:1.27,shieldDamageScale:1.60,guardDrain:0,guardRegen:0,countScale:3.60},
  });

  function hashSeed(seed){if(Number.isFinite(Number(seed)))return (Number(seed)>>>0)||0x6d2b79f5;let h=2166136261;for(const ch of String(seed??'elemental-gauntlet')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0||0x6d2b79f5;}
  function createSeededRng(seed){let a=hashSeed(seed);return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  function difficultyProfile(id='normal'){return {...(DIFFICULTIES[id]||DIFFICULTIES.normal),mode:'exhibition'};}
  function divisionProfile(id='rookie',roundIndex=0){const key=DIVISION_BASE[id]?id:'rookie',r=clamp(Math.trunc(roundIndex),0,2),b=DIVISION_BASE[key];return {...b,id:key,label:key.toUpperCase(),mode:'cup',divisionId:key,roundIndex:r,telegraphMs:Math.max(455,Math.round(b.telegraphMs-r*45)),groupGapMs:Math.max(350,Math.round(b.groupGapMs-r*20)),hazardScale:b.hazardScale+r*.025,damageScale:b.damageScale+r*.04,countScale:b.countScale+r*.08,rewardMultiplier:1};}
  function countdownLabel(elapsedMs){const t=Math.max(0,Number(elapsedMs)||0);if(t<COUNTDOWN_STEP_MS)return '3';if(t<COUNTDOWN_STEP_MS*2)return '2';if(t<COUNTDOWN_STEP_MS*3)return '1';if(t<COUNTDOWN_END_MS)return 'GO!';return '';}

  // Sp. Def changes both the punishment for an unshielded mistake and the strength of the emergency shield.
  function spDefDamageMultiplier(spDef){const n=clamp(Number(spDef)||60,5,180);if(n<60)return 1.15+((60-n)/55)*.55;return clamp(1.15-((n-60)/120)*.65,.50,1.15);}
  function spDefPerformance(spDef){const m=spDefDamageMultiplier(spDef);return clamp(1.62-m*.62,.52,1.31);}
  function shieldCapacityForSpDef(spDef){const n=clamp(Number(spDef)||60,5,180);return Math.round(42+n*.95);}
  function shieldRegenPerSecond(){return 0;}
  function guardMultiplier(guardStrength=1){return clamp(.58-clamp(guardStrength,0,1)*.28,.30,.58);}
  function resolveImpact({spDef=60,baseDamage=24,damageScale=1,hit=true,guarding=false,guardStrength=1}={}){
    if(!hit)return {hit:false,guarding:false,damage:0,multiplier:0,grade:'DODGED'};
    const statMultiplier=spDefDamageMultiplier(spDef),guard=guarding?guardMultiplier(guardStrength):1;
    const damage=Math.max(1,Math.round(Math.max(1,Number(baseDamage)||1)*Math.max(.25,Number(damageScale)||1)*statMultiplier*guard));
    return {hit:true,guarding:!!guarding,damage,statMultiplier:round1(statMultiplier),guardMultiplier:round1(guard),multiplier:round1(statMultiplier*guard),grade:guarding?'GUARDED':'HIT'};
  }

  function rollPrismaticStorm(rng=Math.random,rate=.02){return clamp(Number((rng||Math.random)())||0,0,.999999)<clamp(rate,0,1);}
  function rand(rng,a,b){return a+clamp(rng(),0,.999999)*(b-a);}
  const ATTACK_FAMILIES=Object.freeze({
    fire:Object.freeze(['meteor','fire-sweep']),
    water:Object.freeze(['riptide','whirlpool']),
    electric:Object.freeze(['bolt-strike','chain-arc']),
    ice:Object.freeze(['shard-volley','freeze-burst']),
    psychic:Object.freeze(['mind-wave','psi-beam']),
  });
  function mechanicFor(type,index,rng){
    const list=ATTACK_FAMILIES[type]||ATTACK_FAMILIES.fire;
    if(index<list.length)return list[index];
    return list[Math.floor(clamp(rng(),0,.999999)*list.length)];
  }
  function pointPair(random,minDistance=.35){
    let x1=rand(random,.08,.92),y1=rand(random,.10,.90),x2=rand(random,.08,.92),y2=rand(random,.10,.90);
    for(let i=0;i<5&&Math.hypot(x2-x1,y2-y1)<minDistance;i++){x2=rand(random,.08,.92);y2=rand(random,.10,.90);}
    return {x1,y1,x2,y2};
  }
  function geometryFor(type,mechanic,random,scale=1){
    if(mechanic==='meteor')return {shape:'circle',visual:'meteor',x:rand(random,.09,.91),y:rand(random,.14,.86),size:rand(random,.06,.095)*scale,originX:rand(random,.06,.94),originY:-.12};
    if(mechanic==='fire-sweep'){
      const vertical=random()<.5;
      return vertical?{shape:'wall-gap-v',visual:'fire-sweep',x:rand(random,.16,.84),size:rand(random,.105,.145)*scale,gapCenter:rand(random,.24,.76),gapSize:rand(random,.20,.30),direction:random()<.5?-1:1}:{shape:'wall-gap-h',visual:'fire-sweep',y:rand(random,.18,.82),size:rand(random,.10,.14)*scale,gapCenter:rand(random,.20,.80),gapSize:rand(random,.20,.30),direction:random()<.5?-1:1};
    }
    if(mechanic==='riptide')return {shape:'wall-gap-h',visual:'riptide',y:rand(random,.15,.85),size:rand(random,.12,.17)*scale,gapCenter:rand(random,.20,.80),gapSize:rand(random,.20,.32),direction:random()<.5?-1:1};
    if(mechanic==='whirlpool')return {shape:'ring',visual:'whirlpool',x:rand(random,.16,.84),y:rand(random,.17,.84),size:rand(random,.15,.24)*scale,ringWidth:rand(random,.038,.062)*scale};
    if(mechanic==='bolt-strike')return {shape:'cross',visual:'bolt-strike',x:rand(random,.13,.87),y:rand(random,.15,.85),size:rand(random,.038,.060)*scale,reach:rand(random,.24,.38)*scale};
    if(mechanic==='chain-arc'){const q=pointPair(random,.34);return {shape:'segment',visual:'chain-arc',...q,width:rand(random,.032,.052)*scale};}
    if(mechanic==='shard-volley'){
      const leftToRight=random()<.5,x1=leftToRight?-.04:1.04,x2=leftToRight?1.04:-.04,y1=rand(random,.08,.92);let y2=rand(random,.08,.92);if(Math.abs(y2-y1)<.22)y2=clamp(y1+(random()<.5?-.32:.32),.04,.96);
      return {shape:'segment',visual:'shard-volley',x1,y1,x2,y2,width:rand(random,.022,.040)*scale};
    }
    if(mechanic==='freeze-burst')return {shape:'diamond',visual:'freeze-burst',x:rand(random,.13,.87),y:rand(random,.15,.85),size:rand(random,.085,.135)*scale};
    if(mechanic==='mind-wave')return {shape:'ring',visual:'mind-wave',x:rand(random,.16,.84),y:rand(random,.17,.84),size:rand(random,.18,.30)*scale,ringWidth:rand(random,.034,.058)*scale};
    if(mechanic==='psi-beam')return {shape:'beam',visual:'psi-beam',x:rand(random,.42,.58),y:rand(random,.40,.60),angle:rand(random,0,180),width:rand(random,.045,.075)*scale};
    return {shape:'circle',visual:type,x:rand(random,.12,.88),y:rand(random,.14,.86),size:rand(random,.10,.15)*scale};
  }
  function createWavePlan({wave=WAVES[0],profile=difficultyProfile('normal'),rng=Math.random,prismatic=false,waveIndex=0}={}){
    const p=profile||difficultyProfile('normal'),random=typeof rng==='function'?rng:Math.random;
    const wi=clamp(Math.trunc(waveIndex),0,4),baseCounts=[7,8,9,10,11];
    const count=Math.max(5,Math.round(baseCounts[wi]*(Number(p.countScale)||1)+(prismatic?2:0)));
    const telegraphBase=Math.max(430,Number(p.telegraphMs)||820),scale=Number(p.hazardScale)||1,hazards=[];
    const minGap=Math.max(35,Number(p.cadenceMinMs)||Math.max(120,(Number(p.groupGapMs)||520)*.45));
    const maxGap=Math.max(minGap+25,Number(p.cadenceMaxMs)||Number(p.groupGapMs)||520);
    const burstChance=clamp(Number(p.burstChance)||.14,0,.65),burstMin=Math.max(25,Number(p.burstMinMs)||55),burstMax=Math.max(burstMin+15,Number(p.burstMaxMs)||145);
    let impactAt=Math.max(760,Math.round(telegraphBase*.88+230));
    for(let i=0;i<count;i++){
      if(i>0){const burst=random()<burstChance;impactAt+=Math.round(rand(random,burst?burstMin:minGap,burst?burstMax:maxGap));}
      const baseType=prismatic?WAVES[(wi+i)%WAVES.length].type:wave.type;
      const mechanic=mechanicFor(baseType,i,random),geometry=geometryFor(baseType,mechanic,random,scale);
      const telegraph=Math.round(rand(random,telegraphBase*.72,telegraphBase*1.18));
      const late=i>=Math.ceil(count*.62),damageBoost=late?3:0;
      const lingerMs=['riptide','fire-sweep','psi-beam'].includes(mechanic)?360:['mind-wave','whirlpool'].includes(mechanic)?330:270;
      const hazard={id:`${wave.id}-${i+1}`,index:i,waveIndex:wi,type:baseType,mechanic,...geometry,telegraphAt:Math.max(0,impactAt-telegraph),impactAt,lingerMs,baseDamage:wave.baseDamage+damageBoost+(p.id==='hard'?2:0),resolved:false};
      for(const key of ['x','y','x1','y1','x2','y2','size','width','reach','gapCenter','gapSize','ringWidth','angle','originX','originY'])if(Number.isFinite(hazard[key]))hazard[key]=Math.round(hazard[key]*1000)/1000;
      hazards.push(hazard);
    }
    hazards.sort((a,b)=>a.impactAt-b.impactAt||a.index-b.index);
    const durationMs=(hazards.at(-1)?.impactAt||impactAt)+760;
    return {wave:{...wave},profile:{...p},prismatic:!!prismatic,hazards,durationMs};
  }
  function distanceToSegment(px,py,x1,y1,x2,y2){
    const dx=x2-x1,dy=y2-y1,len2=dx*dx+dy*dy;if(len2<=1e-9)return Math.hypot(px-x1,py-y1);
    const t=clamp(((px-x1)*dx+(py-y1)*dy)/len2,0,1),cx=x1+t*dx,cy=y1+t*dy;return Math.hypot(px-cx,py-cy);
  }
  function hazardHitsPlayer(hazard,player={x:.5,y:.72}){
    const x=clamp(player.x,.04,.96),y=clamp(player.y,.08,.92),hx=Number(hazard?.x)||.5,hy=Number(hazard?.y)||.5,size=Math.max(.02,Number(hazard?.size)||.15),shape=hazard?.shape||'circle';
    if(shape==='lane-v')return Math.abs(x-hx)<=size/2;
    if(shape==='lane-h')return Math.abs(y-hy)<=size/2;
    if(shape==='wall-gap-h')return Math.abs(y-hy)<=size/2&&Math.abs(x-clamp(hazard?.gapCenter,.05,.95))>Math.max(.06,Number(hazard?.gapSize)||.22)/2;
    if(shape==='wall-gap-v')return Math.abs(x-hx)<=size/2&&Math.abs(y-clamp(hazard?.gapCenter,.05,.95))>Math.max(.06,Number(hazard?.gapSize)||.22)/2;
    if(shape==='segment')return distanceToSegment(x,y,Number(hazard?.x1)||0,Number(hazard?.y1)||0,Number(hazard?.x2)||1,Number(hazard?.y2)||1)<=Math.max(.015,Number(hazard?.width)||.04)/2;
    if(shape==='cross'){const reach=Math.max(.08,Number(hazard?.reach)||.3),half=Math.max(.015,size/2),dx=Math.abs(x-hx),dy=Math.abs(y-hy);return (dx<=half&&dy<=reach)||(dy<=half&&dx<=reach);}
    if(shape==='diamond')return Math.abs(x-hx)+Math.abs(y-hy)<=size;
    if(shape==='beam'){const a=(Number(hazard?.angle)||0)*Math.PI/180,w=Math.max(.02,Number(hazard?.width)||.06);return Math.abs(-Math.sin(a)*(x-hx)+Math.cos(a)*(y-hy))<=w/2;}
    const d=Math.hypot(x-hx,y-hy);
    if(shape==='ring'){const w=Math.max(.025,Number(hazard?.ringWidth)||.06);return d>=Math.max(0,size-w)&&d<=size+w;}
    return d<=size;
  }

  function createRun({difficulty='normal',profile=null,participant=null,rng=Math.random,goldenRate=.02,seed=null}={}){
    const p=profile?{...profile}:difficultyProfile(difficulty),random=seed==null?(typeof rng==='function'?rng:Math.random):createSeededRng(seed),prismatic=rollPrismaticStorm(random,goldenRate);
    const spDef=Number(participant?.baseStat)||60,shieldMax=shieldCapacityForSpDef(spDef);
    return {difficulty:p.id||difficulty,profile:p,participant:participant?{...participant}:null,prismatic,waveIndex:0,waves:[],healthMax:HEALTH_MAX,health:HEALTH_MAX,shieldMax,shield:shieldMax,guard:100,score:0,damageTaken:0,shieldDamageTaken:0,shieldBreaks:0,hits:0,guards:0,dodges:0,perfectWaves:0,finished:false,fullClear:false,prismaticCleared:false};
  }
  function syncGuardAlias(run){if(run)run.guard=run.shieldMax>0?clamp(run.shield/run.shieldMax*100,0,100):0;}
  function applyImpact(run,{hazard,hit}={}){
    if(!run||run.finished)return null;
    const spDef=Number(run.participant?.baseStat)||60;
    if(!hit){run.dodges++;run.score+=28;return {hit:false,shielded:false,damage:0,shieldDamage:0,shieldBroken:false,multiplier:0,grade:'DODGED',health:run.health,shield:run.shield,score:run.score};}

    const impact=resolveImpact({spDef,baseDamage:hazard?.baseDamage||24,damageScale:run.profile?.damageScale||1,hit:true,guarding:false});
    let hpDamage=impact.damage,shieldDamage=0,shieldBroken=false,grade='HIT';
    const shieldBefore=Math.max(0,Number(run.shield)||0),shielded=shieldBefore>0;
    if(shielded){
      const shieldDamageScale=Math.max(.5,Number(run.profile?.shieldDamageScale)||1);
      const requested=Math.max(1,Math.round(impact.damage*.92*shieldDamageScale));
      shieldDamage=Math.min(shieldBefore,requested);
      run.shield=clamp(shieldBefore-shieldDamage,0,run.shieldMax||shieldBefore);
      const overflow=Math.max(0,requested-shieldDamage);
      hpDamage=overflow>0?Math.max(1,Math.round(impact.damage*(overflow/requested)*.86)):0;
      shieldBroken=run.shield<=0;
      grade=shieldBroken?'SHIELD BREAK':'SHIELDED';
      run.guards++;
      run.shieldDamageTaken+=shieldDamage;
      if(shieldBroken)run.shieldBreaks++;
    }
    const healthMax=Math.max(1,Number(run.healthMax)||HEALTH_MAX);
    if(hpDamage>0){run.health=clamp(run.health-hpDamage,0,healthMax);run.damageTaken+=hpDamage;run.hits++;}
    syncGuardAlias(run);
    const points=shielded?(hpDamage===0?18:Math.max(6,18-hpDamage*.18)):Math.max(2,12-hpDamage*.18);
    run.score+=Math.round(points);
    if(run.health<=0){run.finished=true;run.fullClear=false;}
    return {hit:true,shielded,guarding:shielded,damage:hpDamage,shieldDamage,shieldBroken,shield:run.shield,shieldMax:run.shieldMax,statMultiplier:impact.statMultiplier,multiplier:impact.multiplier,grade,health:run.health,score:run.score};
  }
  function regenShield(run){
    // v0.45.3: the Sp. Def shield is a finite resource for the entire run.
    // It never regenerates between impacts, waves, or during downtime.
    return run?.shield||0;
  }
  function healthPercent(run){const max=Math.max(1,Number(run?.healthMax)||HEALTH_MAX);return clamp((Number(run?.health)||0)/max*100,0,100);}
  function finishWave(run,{damageBefore=0,shieldDamageBefore=0}={}){
    if(!run||run.finished&&run.health<=0)return null;const clean=run.damageTaken<=Number(damageBefore||0)&&run.shieldDamageTaken<=Number(shieldDamageBefore||0);if(clean){run.perfectWaves++;run.score+=45;}else run.score+=Math.max(8,Math.round(healthPercent(run)*.12));run.waves.push({index:run.waveIndex,clean,health:run.health,shield:run.shield,score:run.score});run.waveIndex++;
    if(run.waveIndex>=WAVES.length||run.health<=0){run.finished=true;run.fullClear=run.waveIndex>=WAVES.length&&run.health>0;run.prismaticCleared=!!run.prismatic&&run.fullClear;run.score+=run.fullClear?Math.round(healthPercent(run)*.7)+70:0;}
    return {clean,waveIndex:run.waveIndex,finished:run.finished,fullClear:run.fullClear,score:run.score};
  }
  function roundMetric(run){return Math.round((Number(run?.score)||0)*10)/10;}
  function rewardForRun(run){const p=run?.profile||difficultyProfile(run?.difficulty),score=Math.max(0,Number(run?.score)||0),health=healthPercent(run),full=!!run?.fullClear;return Math.max(30,Math.round((35+score*.18+health*.25+(full?55:0)+(run?.prismaticCleared?35:0))*(Number(p.rewardMultiplier)||1)));}

  return Object.freeze({WAVES,DIFFICULTIES,DIVISION_BASE,HEALTH_MAX,COUNTDOWN_STEP_MS,COUNTDOWN_END_MS,createSeededRng,difficultyProfile,divisionProfile,countdownLabel,spDefDamageMultiplier,spDefPerformance,shieldCapacityForSpDef,shieldRegenPerSecond,guardMultiplier,resolveImpact,rollPrismaticStorm,createWavePlan,hazardHitsPlayer,createRun,applyImpact,regenShield,healthPercent,finishWave,roundMetric,rewardForRun});
});
