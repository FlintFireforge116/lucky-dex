(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexBarrierBallCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    width:760,height:760,centreX:380,centreY:380,durationMs:60000,scoreToWin:5,
    goalInset:58,goalHalf:220,barrierHalf:72,barrierThickness:11,ballRadius:13,
    paddleRange:202,paddleMaxSpeed:520,paddleAccel:2400,paddleDrag:8.5,
    baseBallSpeed:300,minReturnSpeed:330,maxBallSpeed:980,smashMultiplier:1.58,smashBonus:115,curveFactor:.62,
    smashActiveMs:210,smashCooldownMs:360,maxBalls:3,spawnMinMs:3900,spawnMaxMs:6900
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({label:'Easy',reactionMs:390,moveScale:.72,aimError:58,smashChance:.45}),
    normal:Object.freeze({label:'Normal',reactionMs:215,moveScale:.88,aimError:28,smashChance:.68}),
    hard:Object.freeze({label:'Hard',reactionMs:95,moveScale:1,aimError:10,smashChance:.86})
  });
  const SIDE_NAMES=['YOU','COM 1','COM 2','COM 3'];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const rand=(run)=>clamp(typeof run?.rng==='function'?run.rng():Math.random(),0,.999999);
  const sideAxis=side=>side===0||side===2?'x':'y';
  const sideNormal=side=>side===0?[0,-1]:side===1?[-1,0]:side===2?[0,1]:[1,0];
  const barrierCentre=(p)=>{
    if(p.side===0)return [CONFIG.centreX+p.offset,CONFIG.height-CONFIG.goalInset];
    if(p.side===1)return [CONFIG.width-CONFIG.goalInset,CONFIG.centreY+p.offset];
    if(p.side===2)return [CONFIG.centreX+p.offset,CONFIG.goalInset];
    return [CONFIG.goalInset,CONFIG.centreY+p.offset];
  };
  function syncPlayerPosition(p){const [x,y]=barrierCentre(p);p.x=x;p.y=y;return p;}
  function makePlayer(index){return syncPlayerPosition({index,side:index,dex:122,species:'Mr. Mime',score:0,goalsScored:0,goalsConceded:0,offset:0,velocity:0,smashActiveMs:0,smashCooldownMs:0,smashes:0,returns:0,place:index+1,aiThinkMs:0,aiTarget:0});}
  function scheduleSpawn(run,fast=false){run.nextSpawnMs=fast?0:CONFIG.spawnMinMs+rand(run)*(CONFIG.spawnMaxMs-CONFIG.spawnMinMs);}
  function createMatch({difficulty='normal',rng=Math.random,skipInitialBall=false}={}){
    const key=DIFFICULTIES[difficulty]?difficulty:'normal';
    const run={difficulty:key,profile:DIFFICULTIES[key],rng,elapsedMs:0,remainingMs:CONFIG.durationMs,finished:false,winnerIndex:null,players:Array.from({length:4},(_,i)=>makePlayer(i)),balls:[],events:[],ranking:[],nextBallId:1,nextSpawnMs:0};
    if(!skipInitialBall)spawnBall(run);
    scheduleSpawn(run);
    return run;
  }
  function spawnBall(run,overrides={}){
    if(!run||run.finished)return null;
    const angle=overrides.angle??(rand(run)*Math.PI*2);
    const speed=overrides.speed??CONFIG.baseBallSpeed*(.9+rand(run)*.22);
    const ball={id:run.nextBallId++,x:CONFIG.centreX,y:CONFIG.centreY,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,lastTouchedBy:null,hitCount:0,...overrides};
    run.balls.push(ball);run.events.push({type:'spawn',ball:ball.id,at:run.elapsedMs});
    return ball;
  }
  function smash(run,index=0){
    const p=run?.players?.[index];
    if(!p||run.finished||p.smashCooldownMs>0)return false;
    p.smashActiveMs=CONFIG.smashActiveMs;p.smashCooldownMs=CONFIG.smashCooldownMs;p.smashes++;
    run.events.push({type:'smash',player:index,at:run.elapsedMs});return true;
  }
  function updatePlayer(run,p,ms,input){
    p.smashActiveMs=Math.max(0,p.smashActiveMs-ms);p.smashCooldownMs=Math.max(0,p.smashCooldownMs-ms);
    const sec=Math.max(ms/1000,1/120);
    if(p.index===0){
      if(Number.isFinite(input?.targetOffset)){
        const previous=p.offset,next=clamp(input.targetOffset,-CONFIG.paddleRange,CONFIG.paddleRange);
        p.offset=next;
        p.velocity=clamp((next-previous)/sec,-CONFIG.paddleMaxSpeed*1.6,CONFIG.paddleMaxSpeed*1.6);
      }else{
        const move=clamp(input?.move,-1,1);
        p.velocity=move*CONFIG.paddleMaxSpeed;
        p.offset=clamp(p.offset+p.velocity*(ms/1000),-CONFIG.paddleRange,CONFIG.paddleRange);
        if(!move)p.velocity=0;
      }
      syncPlayerPosition(p);return;
    }
    const target=clamp(input?.move,-1,1)*CONFIG.paddleMaxSpeed*run.profile.moveScale;
    const delta=target-p.velocity,maxDelta=CONFIG.paddleAccel*(ms/1000);
    p.velocity+=clamp(delta,-maxDelta,maxDelta);
    if(Math.abs(target)<1)p.velocity*=Math.exp(-CONFIG.paddleDrag*(ms/1000));
    p.offset=clamp(p.offset+p.velocity*(ms/1000),-CONFIG.paddleRange,CONFIG.paddleRange);
    if(Math.abs(p.offset)>=CONFIG.paddleRange-.01&&Math.sign(p.velocity)===Math.sign(p.offset))p.velocity*=.25;
    syncPlayerPosition(p);
  }
  function predictedOffsetForBall(p,b){
    if(!b)return 0;
    if(p.side===0){if(b.vy<=15)return b.x-CONFIG.centreX;const t=(p.y-b.y)/b.vy;return b.x+b.vx*Math.max(0,t)-CONFIG.centreX;}
    if(p.side===2){if(b.vy>=-15)return b.x-CONFIG.centreX;const t=(p.y-b.y)/b.vy;return b.x+b.vx*Math.max(0,t)-CONFIG.centreX;}
    if(p.side===1){if(b.vx<=15)return b.y-CONFIG.centreY;const t=(p.x-b.x)/b.vx;return b.y+b.vy*Math.max(0,t)-CONFIG.centreY;}
    if(b.vx>=-15)return b.y-CONFIG.centreY;const t=(p.x-b.x)/b.vx;return b.y+b.vy*Math.max(0,t)-CONFIG.centreY;
  }
  function threatScore(p,b){
    if(p.side===0&&b.vy>0)return (p.y-b.y)/Math.max(1,b.vy);
    if(p.side===2&&b.vy<0)return (b.y-p.y)/Math.max(1,-b.vy);
    if(p.side===1&&b.vx>0)return (p.x-b.x)/Math.max(1,b.vx);
    if(p.side===3&&b.vx<0)return (b.x-p.x)/Math.max(1,-b.vx);
    return 99+Math.hypot(b.x-p.x,b.y-p.y)/500;
  }
  function aiInput(run,p,ms){
    p.aiThinkMs-=ms;
    if(p.aiThinkMs<=0){
      const balls=[...run.balls].sort((a,b)=>threatScore(p,a)-threatScore(p,b));
      const target=balls[0];let aim=predictedOffsetForBall(p,target);
      aim+=(rand(run)-.5)*2*run.profile.aimError;
      p.aiTarget=clamp(aim,-CONFIG.paddleRange,CONFIG.paddleRange);
      p.aiThinkMs=run.profile.reactionMs*(.8+rand(run)*.45);
      if(target&&p.smashCooldownMs<=0&&threatScore(p,target)<.28&&rand(run)<run.profile.smashChance)smash(run,p.index);
    }
    const error=p.aiTarget-p.offset;
    return {move:Math.abs(error)<5?0:Math.sign(error)};
  }
  function bounceCornerWalls(ball){
    const r=CONFIG.ballRadius,gh=CONFIG.goalHalf,cx=CONFIG.centreX,cy=CONFIG.centreY;
    if(ball.x<r&&Math.abs(ball.y-cy)>gh){ball.x=r;ball.vx=Math.abs(ball.vx);}
    if(ball.x>CONFIG.width-r&&Math.abs(ball.y-cy)>gh){ball.x=CONFIG.width-r;ball.vx=-Math.abs(ball.vx);}
    if(ball.y<r&&Math.abs(ball.x-cx)>gh){ball.y=r;ball.vy=Math.abs(ball.vy);}
    if(ball.y>CONFIG.height-r&&Math.abs(ball.x-cx)>gh){ball.y=CONFIG.height-r;ball.vy=-Math.abs(ball.vy);}
  }
  function capBall(ball){const s=Math.hypot(ball.vx,ball.vy);if(s>CONFIG.maxBallSpeed){ball.vx=ball.vx/s*CONFIG.maxBallSpeed;ball.vy=ball.vy/s*CONFIG.maxBallSpeed;}return ball;}
  function collideBarrier(run,p,ball){
    const [bx,by]=[p.x,p.y],[nx,ny]=sideNormal(p.side),axis=sideAxis(p.side);
    const dx=ball.x-bx,dy=ball.y-by,normalDist=dx*nx+dy*ny,tangentDist=axis==='x'?dx:dy;
    const toward=ball.vx*nx+ball.vy*ny;
    if(toward>=0||normalDist<-(CONFIG.ballRadius+CONFIG.barrierThickness*2)||normalDist>CONFIG.ballRadius+CONFIG.barrierThickness||Math.abs(tangentDist)>CONFIG.barrierHalf+CONFIG.ballRadius)return false;
    const smashHit=p.smashActiveMs>0;
    const tangentVelocity=p.velocity*CONFIG.curveFactor;
    let rvx=ball.vx-2*toward*nx,rvy=ball.vy-2*toward*ny;
    if(axis==='x')rvx+=tangentVelocity;else rvy+=tangentVelocity;
    let speed=Math.max(CONFIG.minReturnSpeed,Math.hypot(rvx,rvy));
    if(smashHit)speed=speed*CONFIG.smashMultiplier+CONFIG.smashBonus;
    const mag=Math.hypot(rvx,rvy)||1;ball.vx=rvx/mag*speed;ball.vy=rvy/mag*speed;capBall(ball);
    ball.x=bx+nx*(CONFIG.ballRadius+CONFIG.barrierThickness+2)+(axis==='x'?tangentDist:0);
    ball.y=by+ny*(CONFIG.ballRadius+CONFIG.barrierThickness+2)+(axis==='y'?tangentDist:0);
    ball.lastTouchedBy=p.index;ball.hitCount++;p.returns++;
    run.events.push({type:'return',player:p.index,ball:ball.id,smash:smashHit,speed:Math.hypot(ball.vx,ball.vy),at:run.elapsedMs});
    if(smashHit)p.smashActiveMs=0;
    return true;
  }
  function goalSide(ball){
    if(ball.y>CONFIG.height+CONFIG.ballRadius&&Math.abs(ball.x-CONFIG.centreX)<=CONFIG.goalHalf)return 0;
    if(ball.x>CONFIG.width+CONFIG.ballRadius&&Math.abs(ball.y-CONFIG.centreY)<=CONFIG.goalHalf)return 1;
    if(ball.y<-CONFIG.ballRadius&&Math.abs(ball.x-CONFIG.centreX)<=CONFIG.goalHalf)return 2;
    if(ball.x<-CONFIG.ballRadius&&Math.abs(ball.y-CONFIG.centreY)<=CONFIG.goalHalf)return 3;
    return null;
  }
  function rankPlayers(run){run.ranking=[...run.players].sort((a,b)=>b.score-a.score||b.goalsScored-a.goalsScored||a.goalsConceded-b.goalsConceded||a.index-b.index);run.ranking.forEach((p,i)=>p.place=i+1);run.winnerIndex=run.ranking[0]?.index??null;return run.ranking;}
  function finishMatch(run){if(run.finished)return run;rankPlayers(run);run.finished=true;run.remainingMs=Math.max(0,run.remainingMs);run.events.push({type:'finish',winner:run.winnerIndex,at:run.elapsedMs});return run;}
  function scoreGoal(run,ball,victimIndex){
    const victim=run.players[victimIndex],attacker=run.players[ball.lastTouchedBy];
    victim.goalsConceded++;
    if(victim.score>0)victim.score--;
    let scorer=null;
    if(attacker&&attacker.index!==victimIndex){attacker.score++;attacker.goalsScored++;scorer=attacker.index;}
    run.events.push({type:'goal',ball:ball.id,scorer,victim:victimIndex,score:scorer==null?null:run.players[scorer].score,at:run.elapsedMs});
    const idx=run.balls.indexOf(ball);if(idx>=0)run.balls.splice(idx,1);
    if(scorer!=null&&run.players[scorer].score>=CONFIG.scoreToWin)finishMatch(run);
    if(!run.finished&&run.balls.length===0)scheduleSpawn(run,true);
  }
  function stepBall(run,ball,ms){
    const sec=ms/1000;ball.x+=ball.vx*sec;ball.y+=ball.vy*sec;
    bounceCornerWalls(ball);
    for(const p of run.players)collideBarrier(run,p,ball);
    const side=goalSide(ball);if(side!=null)scoreGoal(run,ball,side);
  }
  function stepMatch(run,dt,inputs=[]){
    if(!run||run.finished)return run;
    const ms=clamp(dt,0,100);run.elapsedMs+=ms;run.remainingMs=Math.max(0,CONFIG.durationMs-run.elapsedMs);
    for(const p of run.players){const input=inputs[p.index]!==undefined?inputs[p.index]:(p.index===0?{}:aiInput(run,p,ms));updatePlayer(run,p,ms,input);}
    for(const ball of [...run.balls])stepBall(run,ball,ms);
    if(!run.finished){
      run.nextSpawnMs-=ms;
      if(run.balls.length===0&&run.nextSpawnMs>0)run.nextSpawnMs=0;
      if(run.nextSpawnMs<=0&&run.balls.length<CONFIG.maxBalls){spawnBall(run);scheduleSpawn(run);}
      if(run.remainingMs<=0)finishMatch(run);
    }
    return run;
  }
  return {CONFIG,DIFFICULTIES,SIDE_NAMES,createMatch,spawnBall,smash,stepMatch,rankPlayers};
});
