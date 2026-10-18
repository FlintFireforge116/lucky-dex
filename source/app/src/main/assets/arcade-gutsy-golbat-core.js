(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexGutsyGolbatCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CAVE_FLIERS=Object.freeze([
    Object.freeze({dex:41,name:'Zubat'}),
    Object.freeze({dex:42,name:'Golbat'}),
    Object.freeze({dex:169,name:'Crobat'}),
    Object.freeze({dex:527,name:'Woobat'}),
    Object.freeze({dex:528,name:'Swoobat'}),
    Object.freeze({dex:714,name:'Noibat'}),
    Object.freeze({dex:715,name:'Noivern'}),
    Object.freeze({dex:207,name:'Gligar'}),
    Object.freeze({dex:472,name:'Gliscor'}),
  ]);
  const caveFlier=dex=>CAVE_FLIERS.find(p=>p.dex===Number(dex))||CAVE_FLIERS[1];

  const CONFIG=Object.freeze({
    width:1000,
    height:560,
    courseDurationMs:42000,
    scrollSpeed:270,
    gravity:540,
    flapImpulse:340,
    maxRiseSpeed:560,
    horizontalAccel:1650,
    horizontalDrag:2.15,
    maxHorizontalSpeed:520,
    playerHorizontalSpeed:680,
    playerHorizontalResponse:16,
    playerHorizontalRelease:8.5,
    minX:80,
    maxX:920,
    minY:56,
    maxY:510,
    playerRadius:36,
    heartRadius:24,
    magnemiteRadius:39,
    rivalImpactThreshold:150,
    rivalContactDistance:66,
    rivalBounceImpulse:460,
    rivalBounceVelocityFactor:1.08,
    reboundHoldMs:190,
    reboundDrag:0.85,
    maxReboundHorizontalSpeed:920,
    wallBounce:0.72,
    hazardCooldownMs:900,
    rivalCooldownMs:780,
    looseHeartLifetimeMs:3800,
    ordinaryHeartValue:1,
    goldenHeartValue:5,
    magnemiteLoss:3,
    rivalLoss:1,
    heartCount:64,
    magnemiteCount:18,
    firstEntityX:1080,
    heartSpacing:175,
  });

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({label:'Easy',reactionMs:340,steer:0.64,aiMaxSpeed:0.74,flapMargin:40,jitter:62,aggression:0.12,crossCutMs:2700,skill:0.56}),
    normal:Object.freeze({label:'Normal',reactionMs:185,steer:0.86,aiMaxSpeed:0.90,flapMargin:25,jitter:34,aggression:0.30,crossCutMs:1750,skill:0.78}),
    hard:Object.freeze({label:'Hard',reactionMs:88,steer:1,aiMaxSpeed:1,flapMargin:14,jitter:16,aggression:0.52,crossCutMs:1150,skill:1}),
  });

  const AI_PERSONALITIES=Object.freeze({
    backmarker:Object.freeze({key:'backmarker',label:'Backmarker',steer:0.78,reaction:1.18,lanes:Object.freeze([105,165,245,335]),heartLookahead:0.72,contactBias:-1}),
    'front-runner':Object.freeze({key:'front-runner',label:'Front-runner',steer:1.08,reaction:0.92,lanes:Object.freeze([655,755,850,900]),heartLookahead:1.18,contactBias:0}),
    brawler:Object.freeze({key:'brawler',label:'Brawler',steer:1.16,reaction:0.74,lanes:Object.freeze([115,270,455,640,820,890]),heartLookahead:0.84,contactBias:1}),
  });

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
  const r01=rng=>clamp(typeof rng==='function'?rng():Math.random(),0,.999999);
  const difficultyProfile=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const aiPersonalityProfile=key=>AI_PERSONALITIES[key]||AI_PERSONALITIES['front-runner'];
  function shuffledAiPersonalities(rng=Math.random){
    const roles=['backmarker','front-runner','brawler'];
    for(let i=roles.length-1;i>0;i--){const j=Math.floor(r01(rng)*(i+1));[roles[i],roles[j]]=[roles[j],roles[i]];}
    return roles;
  }
  const sq=(v)=>v*v;
  const distance=(a,b)=>Math.sqrt(sq((a?.x||0)-(b?.x||0))+sq((a?.y||0)-(b?.y||0)));

  function makePlayer(index,dex=42,aiPersonality=null){
    const starts=[210,280,350,420];
    const flyer=caveFlier(dex);
    return {
      index,
      dex:flyer.dex,
      species:flyer.name,
      isPlayer:index===0,
      label:index===0?'YOU':`COM ${index}`,
      x:175+index*62,
      y:starts[index]||280,
      vx:0,
      vy:0,
      hearts:0,
      heartsCollected:0,
      heartsLost:0,
      goldenHearts:0,
      magnemiteHits:0,
      rivalHits:0,
      rivalHitsTaken:0,
      reboundMs:0,
      hazardCooldownMs:0,
      aiThinkMs:0,
      aiTargetId:null,
      aiPersonality:index===0?null:(AI_PERSONALITIES[aiPersonality]?aiPersonality:'front-runner'),
      aiLaneBias:[0,-105,55,125][index]||0,
      aiJukeMs:120+index*75,
      aiStrafe:index%2?1:-1,
      aiVerticalJuke:index%2?-1:1,
      aiChaosMs:0,
      aiChaosIntent:null,
      aiCrossCutMs:320+index*190,
      aiScreenTargetX:index===0?500:(()=>{const role=aiPersonalityProfile(aiPersonality);return role.lanes[(index-1)%role.lanes.length];})(),
      aiCrossDirection:index%2?1:-1,
      place:index+1,
    };
  }

  function generateCourse({rng=Math.random,goldenHeartRate=.02}={}){
    const goldenEvent=r01(rng)<clamp(goldenHeartRate,0,1);
    const entities=[];
    for(let i=0;i<CONFIG.heartCount;i++){
      const cluster=(i%6)-2.5;
      const x=CONFIG.firstEntityX+i*CONFIG.heartSpacing+cluster*13;
      const y=92+r01(rng)*(CONFIG.height-184);
      entities.push({id:`heart-${i}`,kind:'heart',x,y,collected:false,golden:false});
    }
    if(goldenEvent&&entities.length){
      const idx=Math.min(entities.length-1,Math.floor(r01(rng)*entities.length));
      entities[idx].golden=true;
    }
    for(let i=0;i<CONFIG.magnemiteCount;i++){
      const x=CONFIG.firstEntityX+390+i*((CONFIG.heartCount*CONFIG.heartSpacing-650)/CONFIG.magnemiteCount)+(r01(rng)-.5)*120;
      const edgeBias=i%3===0;
      const y=edgeBias?(i%2?78:CONFIG.height-78):(105+r01(rng)*(CONFIG.height-210));
      entities.push({id:`magnemite-${i}`,kind:'magnemite',x,y,collected:false});
    }
    entities.sort((a,b)=>a.x-b.x||String(a.id).localeCompare(String(b.id)));
    return {entities,goldenEvent};
  }

  function createRun({difficulty='normal',rng=Math.random,goldenHeartRate=.02,playerDex=42}={}){
    const key=DIFFICULTIES[difficulty]?difficulty:'normal';
    const course=generateCourse({rng,goldenHeartRate});
    return {
      difficulty:key,
      profile:difficultyProfile(key),
      rng,
      elapsedMs:0,
      progress:0,
      finished:false,
      goldenEvent:course.goldenEvent,
      players:(()=>{const chosen=caveFlier(playerDex),pool=CAVE_FLIERS.filter(p=>p.dex!==chosen.dex),dexes=[chosen.dex,...pool.slice(0,3).map(p=>p.dex)],roles=shuffledAiPersonalities(rng);return dexes.map((dex,index)=>makePlayer(index,dex,index?roles[index-1]:null));})(),
      entities:course.entities,
      bumpCooldowns:{},
      ranking:[],
      events:[],
    };
  }

  function flap(run,index=0){
    const p=run?.players?.[index];
    if(!p||run?.finished)return false;
    p.vy=Math.max(-CONFIG.maxRiseSpeed,Number(p.vy||0)-CONFIG.flapImpulse);
    return true;
  }

  function spawnLooseHearts(run,p,count){
    const n=Math.max(0,Math.floor(Number(count)||0));
    for(let i=0;i<n;i++){
      const angle=(-Math.PI*.85)+(r01(run.rng)*Math.PI*1.7);
      const speed=95+r01(run.rng)*115;
      run.entities.push({
        id:`loose-${run.elapsedMs}-${p.index}-${i}-${Math.floor(r01(run.rng)*1e6)}`,
        kind:'loose-heart',
        x:p.x+(r01(run.rng)-.5)*18,
        y:p.y+(r01(run.rng)-.5)*18,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed-45,
        ttlMs:CONFIG.looseHeartLifetimeMs,
        collected:false,
      });
    }
  }

  function loseHearts(run,p,count,reason){
    const lost=Math.min(Math.max(0,Math.floor(Number(count)||0)),Math.max(0,Math.floor(Number(p.hearts)||0)));
    if(lost<=0)return 0;
    p.hearts-=lost;p.heartsLost+=lost;spawnLooseHearts(run,p,lost);
    run.events.push({type:'scatter',player:p.index,count:lost,reason,at:run.elapsedMs});
    return lost;
  }

  function collectEntity(run,playerIndex,entityIndex){
    const p=run?.players?.[playerIndex],e=run?.entities?.[entityIndex];
    if(!p||!e||e.collected||run?.finished)return {accepted:false,gained:0,lost:0};
    if(e.kind==='heart'||e.kind==='loose-heart'){
      const gained=e.golden?CONFIG.goldenHeartValue:CONFIG.ordinaryHeartValue;
      e.collected=true;p.hearts+=gained;p.heartsCollected+=gained;
      if(e.golden)p.goldenHearts+=1;
      run.events.push({type:e.golden?'golden-heart':'heart',player:p.index,count:gained,at:run.elapsedMs});
      return {accepted:true,gained,lost:0,golden:!!e.golden};
    }
    if(e.kind==='magnemite'){
      if(p.hazardCooldownMs>0)return {accepted:false,gained:0,lost:0};
      p.hazardCooldownMs=CONFIG.hazardCooldownMs;p.magnemiteHits+=1;
      const lost=loseHearts(run,p,CONFIG.magnemiteLoss,'magnemite');
      p.vx*=-.55;p.vy=-Math.max(120,Math.abs(p.vy||0)*.55);
      run.events.push({type:'magnemite-hit',player:p.index,count:lost,at:run.elapsedMs});
      return {accepted:true,gained:0,lost};
    }
    return {accepted:false,gained:0,lost:0};
  }

  function bumpPlayer(run,attackerIndex,victimIndex,impact){
    const a=run?.players?.[attackerIndex],v=run?.players?.[victimIndex];
    if(!a||!v||a===v||Number(impact)<CONFIG.rivalImpactThreshold||run?.finished)return {accepted:false,lost:0};
    const key=`${Math.min(attackerIndex,victimIndex)}:${Math.max(attackerIndex,victimIndex)}`;
    if(Number(run.bumpCooldowns?.[key]||0)>0)return {accepted:false,lost:0};
    run.bumpCooldowns[key]=CONFIG.rivalCooldownMs;
    a.rivalHits+=1;v.rivalHitsTaken+=1;
    const lost=loseHearts(run,v,CONFIG.rivalLoss,'rival');
    const dx=(v.x-a.x)||1,dy=(v.y-a.y)||0,len=Math.max(1,Math.hypot(dx,dy));
    v.vx+=dx/len*145;v.vy+=dy/len*115;
    run.events.push({type:'rival-hit',attacker:attackerIndex,victim:victimIndex,count:lost,at:run.elapsedMs});
    return {accepted:true,lost};
  }

  function chooseAiTarget(run,p){
    const profile=run.profile,personality=aiPersonalityProfile(p.aiPersonality);
    const visible=run.entities.filter(e=>!e.collected&&(e.kind==='heart'||e.kind==='loose-heart')&&e.x>-80&&e.x<CONFIG.width+180);
    let target=null;
    if(visible.length){
      const candidates=visible.slice();
      if(p.aiPersonality==='front-runner')candidates.sort((a,b)=>b.x-a.x||Math.abs(a.y-p.y)-Math.abs(b.y-p.y));
      else if(p.aiPersonality==='backmarker')candidates.sort((a,b)=>Math.abs(a.x-p.x)*.55+Math.abs(a.y-p.y)- (Math.abs(b.x-p.x)*.55+Math.abs(b.y-p.y)));
      else candidates.sort((a,b)=>Math.abs(a.y-p.y)-Math.abs(b.y-p.y)||a.x-b.x);
      target=candidates[0];
    }
    const targetY=target?target.y:(110+r01(run.rng)*(CONFIG.height-220));
    const lane=Number.isFinite(p.aiScreenTargetX)?p.aiScreenTargetX:personality.lanes[Math.floor(personality.lanes.length/2)];
    const heartPull=target?clamp((target.x-p.x)/Math.max(1,CONFIG.width)*personality.heartLookahead,-.18,.18)*CONFIG.width:0;
    return {
      id:target?.id||null,
      x:clamp(lane+heartPull+(r01(run.rng)-.5)*profile.jitter,CONFIG.minX+35,CONFIG.maxX-35),
      y:clamp(targetY+p.aiLaneBias*.10+(r01(run.rng)-.5)*profile.jitter,72,CONFIG.height-72)
    };
  }

  function chooseCrossCut(run,p){
    const profile=run.profile,personality=aiPersonalityProfile(p.aiPersonality),lanes=personality.lanes;
    const pick=Math.min(lanes.length-1,Math.floor(r01(run.rng)*lanes.length));
    p.aiScreenTargetX=lanes[pick];
    p.aiCrossDirection=p.aiScreenTargetX>=p.x?-1:1;
    const roleCadence=p.aiPersonality==='backmarker'?1.18:p.aiPersonality==='brawler'?.60:.92;
    p.aiCrossCutMs=profile.crossCutMs*roleCadence*(.68+r01(run.rng)*.48);
    p.aiTarget=null;
    run.events.push({type:'cpu-cross-cut',player:p.index,personality:p.aiPersonality,x:p.aiScreenTargetX,at:run.elapsedMs});
  }

  function chooseBrawlerIntent(run,p){
    const mode=r01(run.rng);
    const rivals=run.players.filter(o=>o.index!==p.index);
    const collectibles=run.entities.filter(e=>!e.collected&&(e.kind==='heart'||e.kind==='loose-heart')&&e.x>-80&&e.x<CONFIG.width+180);
    if(mode<1/3&&rivals.length){
      const target=rivals[Math.min(rivals.length-1,Math.floor(r01(run.rng)*rivals.length))];
      return {kind:'racer',targetIndex:target.index,x:target.x,y:target.y};
    }
    if(mode<2/3&&collectibles.length){
      const target=collectibles[Math.min(collectibles.length-1,Math.floor(r01(run.rng)*collectibles.length))];
      return {kind:'collectible',entityId:target.id,x:target.x,y:target.y};
    }
    return {
      kind:'wander',
      x:CONFIG.minX+30+r01(run.rng)*(CONFIG.maxX-CONFIG.minX-60),
      y:72+r01(run.rng)*(CONFIG.height-144),
    };
  }

  function resolveBrawlerIntent(run,p,intent,profile){
    if(!intent)return null;
    if(intent.kind==='racer'){
      const rival=run.players.find(o=>o.index===intent.targetIndex&&o.index!==p.index);
      if(!rival)return null;
      const lead=.03+profile.skill*.09;
      return {x:clamp(rival.x+(rival.vx||0)*lead,CONFIG.minX+20,CONFIG.maxX-20),y:clamp(rival.y+(rival.vy||0)*lead,72,CONFIG.height-72)};
    }
    if(intent.kind==='collectible'){
      const entity=run.entities.find(e=>e.id===intent.entityId&&!e.collected);
      if(!entity)return null;
      return {x:clamp(entity.x,CONFIG.minX+20,CONFIG.maxX-20),y:clamp(entity.y,72,CONFIG.height-72)};
    }
    return {x:clamp(intent.x,CONFIG.minX+20,CONFIG.maxX-20),y:clamp(intent.y,72,CONFIG.height-72)};
  }

  function updateAi(run,p,dt){
    const profile=run.profile,personality=aiPersonalityProfile(p.aiPersonality);
    p.aiThinkMs-=dt*1000;
    p.aiJukeMs-=dt*1000;
    p.aiCrossCutMs-=dt*1000;
    p.aiChaosMs=Number(p.aiChaosMs||0)-dt*1000;
    if(p.aiCrossCutMs<=0)chooseCrossCut(run,p);
    if(p.aiJukeMs<=0){
      p.aiStrafe=r01(run.rng)<.5?-1:1;
      p.aiVerticalJuke=r01(run.rng)<.5?-1:1;
      const roleFactor=p.aiPersonality==='brawler'?.38:1;
      p.aiJukeMs=(520-profile.aggression*220)*roleFactor*(.62+r01(run.rng)*.58);
    }

    let target;
    if(p.aiPersonality==='brawler'){
      if(p.aiChaosMs<=0||!p.aiChaosIntent){
        p.aiChaosIntent=chooseBrawlerIntent(run,p);
        const base=760-profile.skill*360;
        p.aiChaosMs=base*(.62+r01(run.rng)*.62);
        run.events.push({type:'cpu-chaos-target',player:p.index,kind:p.aiChaosIntent.kind,targetIndex:p.aiChaosIntent.targetIndex??null,entityId:p.aiChaosIntent.entityId??null,x:p.aiChaosIntent.x,y:p.aiChaosIntent.y,at:run.elapsedMs});
      }
      target=resolveBrawlerIntent(run,p,p.aiChaosIntent,profile);
      if(!target){
        p.aiChaosIntent=chooseBrawlerIntent(run,p);
        p.aiChaosMs=0;
        target=resolveBrawlerIntent(run,p,p.aiChaosIntent,profile)||{x:p.aiScreenTargetX||500,y:280};
      }
      p.aiScreenTargetX=target.x;
    }else{
      if(p.aiThinkMs<=0||!p.aiTarget){p.aiTarget=chooseAiTarget(run,p);p.aiThinkMs=profile.reactionMs*personality.reaction*(.72+r01(run.rng)*.56);}
      target={...(p.aiTarget||{x:p.aiScreenTargetX||500,y:280})};
      if(p.aiPersonality==='backmarker'){
        const threat=run.players.find(o=>o.index!==p.index&&Math.abs(o.x-p.x)<145&&Math.abs(o.y-p.y)<115);
        if(threat){target.x=clamp(p.x+(p.x<=threat.x?-155:155),CONFIG.minX+20,CONFIG.width*.46);target.y=clamp(p.y+(p.y<=threat.y?-80:80),72,CONFIG.height-72);}
      }
    }

    const jukeScale=p.aiPersonality==='brawler'?1.75:1;
    target.x=clamp(target.x+p.aiStrafe*(12+profile.aggression*42)*jukeScale,CONFIG.minX+20,CONFIG.maxX-20);
    target.y=clamp(target.y+p.aiVerticalJuke*(12+profile.aggression*44)*jukeScale,72,CONFIG.height-72);
    const hazard=run.entities.find(e=>!e.collected&&e.kind==='magnemite'&&Math.abs(e.x-p.x)<(120+profile.skill*55)&&Math.abs(e.y-p.y)<(62+profile.skill*28));
    if(hazard&&p.aiPersonality!=='brawler'){
      target.x=clamp(p.x+(p.x<hazard.x?-175:175),CONFIG.minX+20,CONFIG.maxX-20);
      target.y=clamp(p.y+(p.y<hazard.y?-125:125),70,CONFIG.height-70);
    }
    const dx=target.x-p.x;
    const accel=CONFIG.horizontalAccel*profile.steer*personality.steer;
    p.vx+=clamp(dx/76,-1,1)*accel*dt;
    const flapGate=p.aiPersonality==='brawler'?-175:-135;
    if(p.y>target.y+profile.flapMargin&&p.vy>flapGate)flap(run,p.index);
  }

  function updatePlayerPhysics(run,p,dt,input){
    const rebounding=Number(p.reboundMs||0)>0;
    p.reboundMs=Math.max(0,Number(p.reboundMs||0)-dt*1000);
    if(rebounding){
      p.vx*=Math.max(0,1-CONFIG.reboundDrag*dt);
      p.vx=clamp(p.vx,-CONFIG.maxReboundHorizontalSpeed,CONFIG.maxReboundHorizontalSpeed);
    }else if(p.isPlayer){
      const axis=(input?.right?1:0)-(input?.left?1:0);
      if(axis){const target=axis*CONFIG.playerHorizontalSpeed;p.vx+=(target-p.vx)*Math.min(1,CONFIG.playerHorizontalResponse*dt);}
      else p.vx*=Math.max(0,1-CONFIG.playerHorizontalRelease*dt);
      p.vx=clamp(p.vx,-CONFIG.playerHorizontalSpeed,CONFIG.playerHorizontalSpeed);
    }else{
      updateAi(run,p,dt);
      p.vx*=Math.max(0,1-CONFIG.horizontalDrag*dt);
      const aiCap=CONFIG.maxHorizontalSpeed*(run.profile.aiMaxSpeed||1);
      p.vx=clamp(p.vx,-aiCap,aiCap);
    }
    p.vy+=CONFIG.gravity*dt;
    p.vy=clamp(p.vy,-CONFIG.maxRiseSpeed,520);
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.x<CONFIG.minX){p.x=CONFIG.minX;p.vx=Math.max(90,Math.abs(p.vx)*CONFIG.wallBounce);run.events.push({type:'wall-bounce',player:p.index,side:'left',at:run.elapsedMs});}
    if(p.x>CONFIG.maxX){p.x=CONFIG.maxX;p.vx=-Math.max(90,Math.abs(p.vx)*CONFIG.wallBounce);run.events.push({type:'wall-bounce',player:p.index,side:'right',at:run.elapsedMs});}
    if(p.y<CONFIG.minY){p.y=CONFIG.minY;p.vy=Math.max(25,p.vy)*.25;}
    if(p.y>CONFIG.maxY){p.y=CONFIG.maxY;p.vy=-Math.max(75,Math.abs(p.vy)*.28);}
    p.hazardCooldownMs=Math.max(0,p.hazardCooldownMs-dt*1000);
  }

  function updateEntities(run,dt){
    for(const e of run.entities){
      if(e.collected)continue;
      if(e.kind==='loose-heart'){
        e.ttlMs-=dt*1000;e.vy=(Number(e.vy)||0)+CONFIG.gravity*.46*dt;e.x+=(Number(e.vx)||0)*dt-CONFIG.scrollSpeed*.3*dt;e.y+=(Number(e.vy)||0)*dt;
        if(e.y<35){e.y=35;e.vy=Math.abs(e.vy)*.35;}if(e.y>CONFIG.height-30){e.y=CONFIG.height-30;e.vy=-Math.abs(e.vy)*.35;}
        if(e.ttlMs<=0||e.x<-60)e.collected=true;
      }else e.x-=CONFIG.scrollSpeed*dt;
    }
  }

  function resolveEntityCollisions(run){
    for(let ei=0;ei<run.entities.length;ei++){
      const e=run.entities[ei];if(e.collected||e.x<-70||e.x>CONFIG.width+80)continue;
      const radius=e.kind==='magnemite'?CONFIG.magnemiteRadius:CONFIG.heartRadius;
      for(const p of run.players){
        if(distance(p,e)<=CONFIG.playerRadius+radius){
          const out=collectEntity(run,p.index,ei);
          if((e.kind==='heart'||e.kind==='loose-heart')&&out.accepted)break;
        }
      }
    }
  }

  function resolveRivalCollisions(run){
    for(let a=0;a<run.players.length;a++)for(let b=a+1;b<run.players.length;b++){
      const pa=run.players[a],pb=run.players[b];
      let dx=pb.x-pa.x,dy=pb.y-pa.y,dist=Math.hypot(dx,dy);
      if(dist>=CONFIG.rivalContactDistance)continue;
      if(dist<.001){dx=(b-a)%2?1:-1;dy=.15;dist=Math.hypot(dx,dy);}
      const nx=dx/dist,ny=dy/dist,overlap=CONFIG.rivalContactDistance-dist;
      const push=overlap*.5+1.5;
      pa.x=clamp(pa.x-nx*push,CONFIG.minX,CONFIG.maxX);pa.y=clamp(pa.y-ny*push,CONFIG.minY,CONFIG.maxY);
      pb.x=clamp(pb.x+nx*push,CONFIG.minX,CONFIG.maxX);pb.y=clamp(pb.y+ny*push,CONFIG.minY,CONFIG.maxY);
      const rvx=(pa.vx||0)-(pb.vx||0),rvy=(pa.vy||0)-(pb.vy||0),impact=Math.hypot(rvx,rvy);
      const relativeNormal=((pb.vx||0)-(pa.vx||0))*nx+((pb.vy||0)-(pa.vy||0))*ny;
      const exchange=relativeNormal<0?Math.min(360,-relativeNormal*CONFIG.rivalBounceVelocityFactor):0;
      const impulse=CONFIG.rivalBounceImpulse+Math.min(150,overlap*3)+exchange;
      pa.vx-=nx*impulse;pa.vy-=ny*impulse*.72;
      pb.vx+=nx*impulse;pb.vy+=ny*impulse*.72;
      pa.reboundMs=CONFIG.reboundHoldMs;pb.reboundMs=CONFIG.reboundHoldMs;
      run.events.push({type:'rival-bounce',players:[a,b],impact,impulse,at:run.elapsedMs});
      if(impact>=CONFIG.rivalImpactThreshold){
        const speedA=Math.hypot(pa.vx||0,pa.vy||0),speedB=Math.hypot(pb.vx||0,pb.vy||0);
        if(speedA>=speedB)bumpPlayer(run,a,b,impact);else bumpPlayer(run,b,a,impact);
      }
    }
  }

  function finishLinePct(progress){
    const p=clamp(progress,0,1);
    if(p<.84)return 108;
    return 108-((p-.84)/.16)*24;
  }

  function finishRun(run){
    if(run.finished)return run;
    run.finished=true;run.progress=1;
    run.ranking=run.players.map((p,index)=>({index,hearts:p.hearts,goldenHearts:p.goldenHearts})).sort((a,b)=>b.hearts-a.hearts||b.goldenHearts-a.goldenHearts||a.index-b.index);
    run.ranking.forEach((row,i)=>{run.players[row.index].place=i+1;});
    run.events.push({type:'finish',at:run.elapsedMs,ranking:run.ranking.map(x=>({...x}))});
    return run;
  }

  function stepRun(run,dtMs,input={}){
    if(!run||run.finished)return run;
    let remaining=Math.max(0,Number(dtMs)||0);
    while(remaining>0&&!run.finished){
      const ms=Math.min(1000,remaining),dt=ms/1000;remaining-=ms;
      run.elapsedMs+=ms;
      run.progress=clamp(run.elapsedMs/CONFIG.courseDurationMs,0,1);
      for(const key of Object.keys(run.bumpCooldowns||{}))run.bumpCooldowns[key]=Math.max(0,Number(run.bumpCooldowns[key]||0)-ms);
      for(const p of run.players)updatePlayerPhysics(run,p,dt,input);
      updateEntities(run,dt);resolveEntityCollisions(run);resolveRivalCollisions(run);
      if(run.elapsedMs>=CONFIG.courseDurationMs)finishRun(run);
    }
    return run;
  }

  function rewardForResult({place=4,hearts=0,difficulty='normal',goldenHearts=0}={}){
    const placement=[0,500,320,220,150][clamp(Math.round(place),1,4)]||150;
    const mult={easy:.85,normal:1,hard:1.25}[difficulty]||1;
    const heartBonus=Math.max(0,Math.floor(Number(hearts)||0))*6;
    const goldBonus=Math.max(0,Math.floor(Number(goldenHearts)||0))*75;
    return Math.max(100,Math.round((placement+heartBonus+goldBonus)*mult));
  }

  return Object.freeze({CAVE_FLIERS,caveFlier,CONFIG,DIFFICULTIES,AI_PERSONALITIES,difficultyProfile,aiPersonalityProfile,chooseBrawlerIntent,generateCourse,createRun,flap,collectEntity,bumpPlayer,finishLinePct,stepRun,finishRun,rewardForResult});
});
