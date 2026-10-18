(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexTopsyTurvyCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    width:720,height:720,durationMs:60000,knockoutsToWin:5,
    centreX:360,centreY:360,arenaRadius:306,playerRadius:28,
    acceleration:900,maxSpeed:355,maxImpactSpeed:900,drag:2.15,bodyPush:120,bodyTransfer:.72,
    spinCooldownMs:3000,spinActiveMs:500,spinReach:22,spinPush:720,spinRecoil:.68,spinClashPush:680,respawnDelayMs:900,respawnInvulnerableMs:550,creditWindowMs:2600
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({label:'Easy',reactionMs:430,moveScale:.72,aimNoise:.52,spinChance:.46}),normal:Object.freeze({label:'Normal',reactionMs:235,moveScale:.88,aimNoise:.27,spinChance:.68}),hard:Object.freeze({label:'Hard',reactionMs:105,moveScale:1,aimNoise:.10,spinChance:.86})
  });
  const SPAWNS=Object.freeze([[360,468],[252,360],[360,252],[468,360]]);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const norm=(x,y)=>{const d=Math.hypot(x,y);return d>0?[x/d,y/d]:[0,0];};

  function makePlayer(index){
    const [x,y]=SPAWNS[index];
    return {index,dex:237,species:'Hitmontop',x,y,vx:0,vy:0,knockouts:0,falls:0,place:index+1,respawnMs:0,invulnerableMs:0,spinCooldownMs:0,spinActiveMs:0,lastHitBy:null,lastHitAt:-Infinity,personality:null,aiThinkMs:0,aiTargetIndex:null};
  }
  function shuffledPersonalities(rng){
    const out=['bully','counter','opportunist'];
    for(let i=out.length-1;i>0;i--){const j=Math.floor(clamp(typeof rng==='function'?rng():Math.random(),0,.999999)*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  }
  function createMatch({difficulty='normal',rng=Math.random}={}){
    const key=DIFFICULTIES[difficulty]?difficulty:'normal',players=Array.from({length:4},(_,index)=>makePlayer(index)),personalities=shuffledPersonalities(rng);
    for(let i=1;i<players.length;i++)players[i].personality=personalities[i-1];
    return {difficulty:key,profile:DIFFICULTIES[key],rng,elapsedMs:0,remainingMs:CONFIG.durationMs,finished:false,winnerIndex:null,players,events:[],ranking:[]};
  }

  function chooseAiTarget(run,p){
    const rivals=run.players.filter(o=>o.index!==p.index&&o.respawnMs<=0);
    if(!rivals.length)return null;
    if(p.personality==='bully')return rivals.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    if(p.personality==='opportunist')return rivals.sort((a,b)=>Math.hypot(b.x-CONFIG.centreX,b.y-CONFIG.centreY)-Math.hypot(a.x-CONFIG.centreX,a.y-CONFIG.centreY)||Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    return rivals.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  }
  function aiInputFor(run,p,ms){
    const profile=run.profile||DIFFICULTIES.normal;p.aiThinkMs=(p.aiThinkMs||0)-ms;
    if(p.aiThinkMs<=0){const target=chooseAiTarget(run,p);p.aiTargetIndex=target?.index??null;p.aiThinkMs=profile.reactionMs*(.78+(run.rng?.()??Math.random())*.55);
      if(target&&p.spinCooldownMs<=0&&Math.hypot(target.x-p.x,target.y-p.y)<CONFIG.playerRadius*2.65&&(run.rng?.()??Math.random())<profile.spinChance)rapidSpin(run,p.index);}
    const target=run.players[p.aiTargetIndex];
    const radial=Math.hypot(p.x-CONFIG.centreX,p.y-CONFIG.centreY);
    let tx=target?.x??CONFIG.centreX,ty=target?.y??CONFIG.centreY;
    if(p.personality==='counter'&&(radial>CONFIG.arenaRadius*.58||!target||Math.hypot(tx-p.x,ty-p.y)>170)){tx=CONFIG.centreX;ty=CONFIG.centreY;}
    if(p.personality==='opportunist'&&target){const dx=target.x-CONFIG.centreX,dy=target.y-CONFIG.centreY,[nx,ny]=norm(dx,dy);tx=target.x+nx*34;ty=target.y+ny*34;}
    const [nx,ny]=norm(tx-p.x,ty-p.y),noise=profile.aimNoise,angle=((run.rng?.()??Math.random())-.5)*noise;
    const ca=Math.cos(angle),sa=Math.sin(angle),scale=profile.moveScale;return {x:(nx*ca-ny*sa)*scale,y:(nx*sa+ny*ca)*scale};
  }
  function applyMotion(p,dt,input){
    if(p.respawnMs>0)return;
    const sec=dt/1000;
    let ix=clamp(input?.x,-1,1),iy=clamp(input?.y,-1,1);
    const mag=Math.hypot(ix,iy);if(mag>1){ix/=mag;iy/=mag;}
    const speedBeforeInput=Math.hypot(p.vx,p.vy);
    p.vx+=ix*CONFIG.acceleration*sec;p.vy+=iy*CONFIG.acceleration*sec;
    const speed=Math.hypot(p.vx,p.vy),driveCap=Math.max(CONFIG.maxSpeed,Math.min(CONFIG.maxImpactSpeed,speedBeforeInput));
    if(speed>driveCap){p.vx=p.vx/speed*driveCap;p.vy=p.vy/speed*driveCap;}
    const damp=Math.exp(-CONFIG.drag*sec);p.vx*=damp;p.vy*=damp;
    p.x+=p.vx*sec;p.y+=p.vy*sec;
  }
  function capImpact(p){
    const speed=Math.hypot(p.vx,p.vy);
    if(speed>CONFIG.maxImpactSpeed){p.vx=p.vx/speed*CONFIG.maxImpactSpeed;p.vy=p.vy/speed*CONFIG.maxImpactSpeed;}
  }
  function collide(a,b){
    if(a.respawnMs>0||b.respawnMs>0)return;
    const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),aSpin=a.spinActiveMs>0,bSpin=b.spinActiveMs>0;
    const minDist=CONFIG.playerRadius*2+((aSpin||bSpin)?CONFIG.spinReach:0);
    if(dist>=minDist)return;
    const [nx,ny]=dist>0?[dx/dist,dy/dist]:[1,0];
    const overlap=minDist-(dist||1),sep=overlap*.5;
    a.x-=nx*sep;a.y-=ny*sep;b.x+=nx*sep;b.y+=ny*sep;
    const closing=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
    a.lastHitBy=b.index;a.lastHitAt=a._runElapsedMs||0;b.lastHitBy=a.index;b.lastHitAt=b._runElapsedMs||0;

    if(aSpin&&bSpin){
      const clash=CONFIG.spinClashPush+Math.max(0,closing)*.45;
      a.vx-=nx*clash;a.vy-=ny*clash;b.vx+=nx*clash;b.vy+=ny*clash;
      capImpact(a);capImpact(b);
      return;
    }

    if(aSpin||bSpin){
      const spinner=aSpin?a:b,victim=aSpin?b:a,sx=aSpin?nx:-nx,sy=aSpin?ny:-ny;
      const approach=(spinner.vx-victim.vx)*sx+(spinner.vy-victim.vy)*sy;
      const blast=CONFIG.spinPush+Math.max(0,approach)*.4;
      victim.vx+=sx*blast;victim.vy+=sy*blast;
      spinner.vx-=sx*blast*CONFIG.spinRecoil;spinner.vy-=sy*blast*CONFIG.spinRecoil;
      victim.lastHitBy=spinner.index;victim.lastHitAt=spinner._runElapsedMs||0;
      capImpact(spinner);capImpact(victim);
      return;
    }

    const impulse=Math.max(CONFIG.bodyPush,closing*CONFIG.bodyTransfer);
    b.vx+=nx*impulse;b.vy+=ny*impulse;a.vx-=nx*impulse*.35;a.vy-=ny*impulse*.35;
  }


  function rankPlayers(run){
    run.ranking=[...run.players].sort((a,b)=>b.knockouts-a.knockouts||a.falls-b.falls||a.index-b.index);
    run.ranking.forEach((p,i)=>{p.place=i+1;});
    run.winnerIndex=run.ranking[0]?.index??null;
    return run.ranking;
  }
  function finishMatch(run){
    if(run.finished)return run;
    rankPlayers(run);run.finished=true;run.remainingMs=Math.max(0,run.remainingMs);
    run.events.push({type:'finish',winner:run.winnerIndex,at:run.elapsedMs});
    return run;
  }
  function ringOut(run,p){
    if(p.respawnMs>0||p.invulnerableMs>0)return false;
    p.falls++;
    const hitter=run.players[p.lastHitBy];
    const credited=hitter&&hitter.index!==p.index&&(run.elapsedMs-(p.lastHitAt||0)<=CONFIG.creditWindowMs);
    if(credited){hitter.knockouts++;run.events.push({type:'ring-out',attacker:hitter.index,victim:p.index,score:hitter.knockouts,at:run.elapsedMs});}
    else run.events.push({type:'fall',victim:p.index,at:run.elapsedMs});
    p.respawnMs=CONFIG.respawnDelayMs;p.vx=p.vy=0;
    p.x=CONFIG.centreX+(p.x-CONFIG.centreX)*1.08;p.y=CONFIG.centreY+(p.y-CONFIG.centreY)*1.08;
    p.spinActiveMs=0;
    if(credited&&hitter.knockouts>=CONFIG.knockoutsToWin)finishMatch(run);
    return true;
  }
  function updateRespawn(p,ms){
    const before=p.respawnMs||0;
    p.respawnMs=Math.max(0,before-ms);
    if(before>0&&p.respawnMs===0){const [x,y]=SPAWNS[p.index];p.x=x;p.y=y;p.vx=p.vy=0;p.invulnerableMs=CONFIG.respawnInvulnerableMs;p.lastHitBy=null;p.lastHitAt=-Infinity;}
  }
  function rapidSpin(run,index=0){
    const p=run?.players?.[index];
    if(!p||run.finished||p.respawnMs>0||p.spinCooldownMs>0)return false;
    p.spinCooldownMs=CONFIG.spinCooldownMs;p.spinActiveMs=CONFIG.spinActiveMs;
    run.events.push({type:'spin',player:index,at:run.elapsedMs});
    return true;
  }
  function stepMatch(run,dt,inputs=[]){
    if(!run||run.finished)return run;
    const ms=clamp(dt,0,100);
    run.elapsedMs+=ms;run.remainingMs=Math.max(0,CONFIG.durationMs-run.elapsedMs);
    for(const p of run.players){
      updateRespawn(p,ms);p.invulnerableMs=Math.max(0,(p.invulnerableMs||0)-ms);p.spinCooldownMs=Math.max(0,(p.spinCooldownMs||0)-ms);p.spinActiveMs=Math.max(0,(p.spinActiveMs||0)-ms);p._runElapsedMs=run.elapsedMs;
      const input=inputs[p.index]!==undefined?inputs[p.index]:(p.index===0?{}:aiInputFor(run,p,ms));applyMotion(p,ms,input);
    }
    for(let i=0;i<run.players.length;i++)for(let j=i+1;j<run.players.length;j++)collide(run.players[i],run.players[j]);
    for(const p of run.players){if(p.respawnMs<=0&&Math.hypot(p.x-CONFIG.centreX,p.y-CONFIG.centreY)>CONFIG.arenaRadius+10){ringOut(run,p);if(run.finished)break;}}
    if(!run.finished&&run.remainingMs<=0)finishMatch(run);
    return run;
  }
  return {CONFIG,DIFFICULTIES,createMatch,rapidSpin,stepMatch,rankPlayers};
});
