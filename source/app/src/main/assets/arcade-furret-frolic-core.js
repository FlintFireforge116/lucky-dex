(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexFurretFrolicCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    width:720,height:720,durationMs:60000,
    wallInset:34,goalDepth:64,goalHalfWidth:108,
    patchReach:82,playerRadius:18,playerMoveSpeed:1180,returnSpeed:1480,
    hitRadius:58,hitSpeed:790,hitCooldownMs:220,
    ballFriction:.08,wallBounce:.96,ballBounce:.94,
    spawnStartMs:850,spawnBaseMs:2050,spawnFastMs:1120,maxBalls:9,spawnSpeed:255,spawnCornerInset:52,
    greatUnlockMs:15000,ultraUnlockMs:30000,masterUnlockMs:42000
  });

  const BALL_TYPES=Object.freeze({
    poke:Object.freeze({key:'poke',label:'Poké Ball',value:1,radius:14,weight:1}),
    great:Object.freeze({key:'great',label:'Great Ball',value:2,radius:17,weight:.74}),
    ultra:Object.freeze({key:'ultra',label:'Ultra Ball',value:3,radius:21,weight:.48}),
    master:Object.freeze({key:'master',label:'Master Ball',value:5,radius:26,weight:.22})
  });

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({label:'Easy',reactionMs:470,hitAccuracy:.62,moveSpeed:.78,targetNoise:78,decisionJitter:190}),
    normal:Object.freeze({label:'Normal',reactionMs:245,hitAccuracy:.84,moveSpeed:.91,targetNoise:40,decisionJitter:95}),
    hard:Object.freeze({label:'Hard',reactionMs:105,hitAccuracy:.97,moveSpeed:1.06,targetNoise:14,decisionJitter:36})
  });

  const PLAYER_META=Object.freeze([
    Object.freeze({goal:'south',label:'YOU',colour:'blue',home:[360,446],goalVector:[0,1]}),
    Object.freeze({goal:'west',label:'COM 1',colour:'green',home:[274,360],goalVector:[-1,0]}),
    Object.freeze({goal:'north',label:'COM 2',colour:'red',home:[360,274],goalVector:[0,-1]}),
    Object.freeze({goal:'east',label:'COM 3',colour:'gold',home:[446,360],goalVector:[1,0]})
  ]);

  const ZONE_VECTORS=Object.freeze({
    center:Object.freeze([0,0]),up:Object.freeze([0,-1]),right:Object.freeze([1,0]),down:Object.freeze([0,1]),left:Object.freeze([-1,0])
  });
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const r01=rng=>clamp(typeof rng==='function'?rng():Math.random(),0,.999999);
  const difficultyProfile=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const sq=v=>v*v;
  const distance=(a,b)=>Math.sqrt(sq((a?.x||0)-(b?.x||0))+sq((a?.y||0)-(b?.y||0)));
  const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return [x/d,y/d];};

  function inputZone(input){
    if(input?.up)return 'up';
    if(input?.right)return 'right';
    if(input?.down)return 'down';
    if(input?.left)return 'left';
    return 'center';
  }
  function zonePosition(p,zone){
    const [dx,dy]=ZONE_VECTORS[zone]||ZONE_VECTORS.center;
    return {x:p.homeX+dx*CONFIG.patchReach,y:p.homeY+dy*CONFIG.patchReach};
  }
  function nearestZoneForPoint(p,x,y){
    const dx=(Number(x)||0)-p.homeX,dy=(Number(y)||0)-p.homeY;
    if(Math.abs(dx)>Math.abs(dy))return dx>=0?'right':'left';
    return dy>=0?'down':'up';
  }

  function availableBallKinds(elapsedMs){
    const t=Math.max(0,Number(elapsedMs)||0),out=['poke'];
    if(t>=CONFIG.greatUnlockMs)out.push('great');
    if(t>=CONFIG.ultraUnlockMs)out.push('ultra');
    if(t>=CONFIG.masterUnlockMs)out.push('master');
    return out;
  }

  function pickBallKind(run){
    const kinds=availableBallKinds(run.elapsedMs);
    if(kinds.includes('master')&&r01(run.rng)<clamp(run.masterBallRate,0,1))return 'master';
    const weighted=kinds.filter(k=>k!=='master').map(k=>({k,w:BALL_TYPES[k].weight}));
    let total=weighted.reduce((s,v)=>s+v.w,0),roll=r01(run.rng)*total;
    for(const row of weighted){if((roll-=row.w)<=0)return row.k;}
    return weighted[weighted.length-1]?.k||'poke';
  }

  function makePlayer(index,dex=162){
    const meta=PLAYER_META[index],isPlayer=index===0;
    return {index,isPlayer,label:meta.label,goal:meta.goal,colour:meta.colour,dex:Number(dex)||162,species:Number(dex)===203?'Girafarig':'Furret',
      homeX:meta.home[0],homeY:meta.home[1],x:meta.home[0],y:meta.home[1],vx:0,vy:0,
      zone:'center',targetZone:'center',pendingZone:null,motionState:'home',heldDirection:null,
      score:0,ballsScored:0,pokeBalls:0,greatBalls:0,ultraBalls:0,masterBalls:0,hits:0,hitCooldownMs:0,hitFlashMs:0,
      aiThinkMs:0,aiTargetId:null,aiZone:'center',place:index+1};
  }

  function createMatch({difficulty='normal',rng=Math.random,masterBallRate=.08,playerDex=162}={}){
    const key=DIFFICULTIES[difficulty]?difficulty:'normal';
    const playerSpecies=Number(playerDex)===203?203:162;
    return {difficulty:key,profile:difficultyProfile(key),rng,masterBallRate:clamp(masterBallRate,0,1),elapsedMs:0,remainingMs:CONFIG.durationMs,
      finished:false,players:[makePlayer(0,playerSpecies),makePlayer(1,162),makePlayer(2,162),makePlayer(3,162)],balls:[],events:[],ranking:[],
      spawnInMs:CONFIG.spawnStartMs,nextBallId:1,masterBallsSeen:0};
  }

  function spawnBall(run,{force=false,corner=null}={}){
    if(!run||run.finished)return null;
    if(!force&&run.balls.filter(b=>!b.scored).length>=CONFIG.maxBalls)return null;
    const kind=pickBallKind(run),type=BALL_TYPES[kind];
    const cornerIndex=Number.isInteger(corner)?((corner%4)+4)%4:Math.floor(r01(run.rng)*4);
    const inset=CONFIG.spawnCornerInset+type.radius;
    const corners=[[inset,inset],[CONFIG.width-inset,inset],[CONFIG.width-inset,CONFIG.height-inset],[inset,CONFIG.height-inset]];
    const [x,y]=corners[cornerIndex];
    const jitter=(r01(run.rng)-.5)*.28;
    const base=Math.atan2(CONFIG.height/2-y,CONFIG.width/2-x)+jitter;
    const speed=CONFIG.spawnSpeed*(.9+r01(run.rng)*.2);
    const ball={id:`ball-${run.nextBallId++}`,kind,value:type.value,radius:type.radius,x,y,vx:Math.cos(base)*speed,vy:Math.sin(base)*speed,scored:false,lastHitBy:null};
    run.balls.push(ball);
    if(kind==='master'){run.masterBallsSeen++;run.events.push({type:'master-spawn',ballId:ball.id,at:run.elapsedMs});}
    return ball;
  }

  function moveToward(p,target,speed,sec){
    const dx=target.x-p.x,dy=target.y-p.y,dist=Math.hypot(dx,dy);
    if(dist<=.5){p.x=target.x;p.y=target.y;p.vx=p.vy=0;return true;}
    const step=Math.min(dist,speed*sec),nx=dx/dist,ny=dy/dist;
    p.x+=nx*step;p.y+=ny*step;p.vx=nx*speed;p.vy=ny*speed;
    if(step>=dist-.001){p.x=target.x;p.y=target.y;p.vx=p.vy=0;return true;}
    return false;
  }

  function applyPlayerMotion(run,p,dt,input){
    const ms=Math.max(0,Number(dt)||0),sec=ms/1000,profile=run.profile;
    p.hitCooldownMs=Math.max(0,p.hitCooldownMs-ms);p.hitFlashMs=Math.max(0,p.hitFlashMs-ms);
    const desired=inputZone(input),outSpeed=CONFIG.playerMoveSpeed*(p.isPlayer?1:profile.moveSpeed),backSpeed=CONFIG.returnSpeed*(p.isPlayer?1:profile.moveSpeed);
    p.heldDirection=desired==='center'?null:desired;

    if(desired==='center'){
      p.pendingZone=null;
      if(p.zone==='center'&&p.motionState==='home'){p.x=p.homeX;p.y=p.homeY;p.vx=p.vy=0;return;}
      p.targetZone='center';p.motionState='returning';
      if(moveToward(p,{x:p.homeX,y:p.homeY},backSpeed,sec)){p.zone='center';p.targetZone='center';p.motionState='home';}
      return;
    }

    if(p.motionState==='locked'&&p.zone===desired){
      const target=zonePosition(p,desired);p.x=target.x;p.y=target.y;p.vx=p.vy=0;return;
    }

    if(p.zone==='center'&&p.motionState==='home'){
      const next=p.pendingZone||desired;p.pendingZone=null;p.targetZone=next;p.motionState='out';
    }else if((p.zone!=='center'||p.motionState==='returning')&&p.targetZone!==desired){
      p.pendingZone=desired;p.targetZone='center';p.motionState='returning';
    }

    if(p.motionState==='returning'||p.targetZone==='center'){
      if(moveToward(p,{x:p.homeX,y:p.homeY},backSpeed,sec)){
        p.zone='center';p.motionState='home';p.targetZone='center';
      }
      return;
    }

    const target=zonePosition(p,p.targetZone);
    if(moveToward(p,target,outSpeed,sec)){p.zone=p.targetZone;p.motionState='locked';}
  }

  function shotVectorForPlayer(p,accuracy=1,rng=Math.random){
    const meta=PLAYER_META[p.index],base=Math.atan2(meta.goalVector[1],meta.goalVector[0]);
    const maxError=(1-clamp(accuracy,0,1))*.62,angle=base+(r01(rng)-.5)*2*maxError;
    return [Math.cos(angle),Math.sin(angle)];
  }

  function hit(run,index=0,accuracy=1){
    const p=run?.players?.[index];
    if(!p||run.finished||p.hitCooldownMs>0)return {accepted:false,ballId:null};
    p.hitCooldownMs=CONFIG.hitCooldownMs;p.hitFlashMs=145;p.hits++;
    if(p.zone==='center'||p.motionState!=='locked'){
      run.events.push({type:'whiff',player:index,at:run.elapsedMs});return {accepted:true,ballId:null};
    }
    const candidates=run.balls.filter(b=>!b.scored&&distance(p,b)<=CONFIG.hitRadius+b.radius).sort((a,b)=>distance(p,a)-distance(p,b));
    if(!candidates.length){run.events.push({type:'whiff',player:index,at:run.elapsedMs});return {accepted:true,ballId:null};}
    const ball=candidates[0],[sx,sy]=shotVectorForPlayer(p,accuracy,run.rng),boost=CONFIG.hitSpeed*(.95+r01(run.rng)*.1);
    ball.vx=sx*boost;ball.vy=sy*boost;ball.lastHitBy=index;ball.x+=sx*3;ball.y+=sy*3;
    run.events.push({type:'hit',player:index,ballId:ball.id,kind:ball.kind,at:run.elapsedMs});return {accepted:true,ballId:ball.id};
  }

  function playerInputForAi(run,p){
    p.aiThinkMs-=run._lastDt||0;
    if(p.aiThinkMs<=0){
      const active=run.balls.filter(b=>!b.scored);let best=null,bestScore=-Infinity;
      for(const b of active){
        const valueWeight=b.value*185,d=distance(p,b),noise=(r01(run.rng)-.5)*run.profile.targetNoise;
        const score=valueWeight-d+noise;if(score>bestScore){bestScore=score;best=b;}
      }
      p.aiTargetId=best?.id||null;
      p.aiZone=best?nearestZoneForPoint(p,best.x,best.y):'center';
      p.aiThinkMs=run.profile.reactionMs+r01(run.rng)*run.profile.decisionJitter;
    }
    const ball=run.balls.find(b=>b.id===p.aiTargetId&&!b.scored);if(!ball)return {};
    const zone=p.aiZone||nearestZoneForPoint(p,ball.x,ball.y),input={[zone]:true};
    if(p.motionState==='locked'&&p.zone===zone&&distance(p,ball)<=CONFIG.hitRadius+ball.radius-2&&p.hitCooldownMs<=0)hit(run,p.index,run.profile.hitAccuracy);
    return input;
  }

  function goalOwner(ball){
    const x=Number(ball?.x)||0,y=Number(ball?.y)||0;
    if(y>=CONFIG.height-CONFIG.goalDepth&&Math.abs(x-CONFIG.width/2)<=CONFIG.goalHalfWidth)return 0;
    if(x<=CONFIG.goalDepth&&Math.abs(y-CONFIG.height/2)<=CONFIG.goalHalfWidth)return 1;
    if(y<=CONFIG.goalDepth&&Math.abs(x-CONFIG.width/2)<=CONFIG.goalHalfWidth)return 2;
    if(x>=CONFIG.width-CONFIG.goalDepth&&Math.abs(y-CONFIG.height/2)<=CONFIG.goalHalfWidth)return 3;
    return -1;
  }

  function scoreBall(run,ball,playerIndex){
    if(ball.scored)return false;const p=run.players[playerIndex];if(!p)return false;
    ball.scored=true;p.score+=ball.value;p.ballsScored++;
    const key=`${ball.kind}Balls`;p[key]=(p[key]||0)+1;
    run.events.push({type:'score',player:playerIndex,ballId:ball.id,kind:ball.kind,points:ball.value,at:run.elapsedMs});return true;
  }

  function resolveWallAndGoal(run,ball){
    const owner=goalOwner(ball);if(owner>=0){scoreBall(run,ball,owner);return;}
    const min=CONFIG.wallInset+ball.radius,maxX=CONFIG.width-min,maxY=CONFIG.height-min;
    if(ball.x<min){ball.x=min;ball.vx=Math.abs(ball.vx)*CONFIG.wallBounce;run.events.push({type:'wall-bounce',axis:'x',ballId:ball.id,at:run.elapsedMs});}
    else if(ball.x>maxX){ball.x=maxX;ball.vx=-Math.abs(ball.vx)*CONFIG.wallBounce;run.events.push({type:'wall-bounce',axis:'x',ballId:ball.id,at:run.elapsedMs});}
    if(ball.y<min){ball.y=min;ball.vy=Math.abs(ball.vy)*CONFIG.wallBounce;run.events.push({type:'wall-bounce',axis:'y',ballId:ball.id,at:run.elapsedMs});}
    else if(ball.y>maxY){ball.y=maxY;ball.vy=-Math.abs(ball.vy)*CONFIG.wallBounce;run.events.push({type:'wall-bounce',axis:'y',ballId:ball.id,at:run.elapsedMs});}
  }

  function resolveBallPair(a,b){
    if(a.scored||b.scored)return false;
    const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),minDist=a.radius+b.radius;
    if(!dist||dist>=minDist)return false;
    const nx=dx/dist,ny=dy/dist,overlap=minDist-dist;
    a.x-=nx*overlap/2;a.y-=ny*overlap/2;b.x+=nx*overlap/2;b.y+=ny*overlap/2;
    const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(rel>=0)return true;
    const ma=a.radius*a.radius,mb=b.radius*b.radius,e=CONFIG.ballBounce;
    const j=-(1+e)*rel/(1/ma+1/mb);
    a.vx-=j*nx/ma;a.vy-=j*ny/ma;b.vx+=j*nx/mb;b.vy+=j*ny/mb;
    return true;
  }

  function updateBalls(run,dt){
    const sec=dt/1000,drag=Math.exp(-CONFIG.ballFriction*sec),active=run.balls.filter(b=>!b.scored);
    for(const ball of active){ball.x+=ball.vx*sec;ball.y+=ball.vy*sec;ball.vx*=drag;ball.vy*=drag;}
    for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++)if(resolveBallPair(active[i],active[j]))run.events.push({type:'ball-bounce',a:active[i].id,b:active[j].id,at:run.elapsedMs});
    for(const ball of active)if(!ball.scored)resolveWallAndGoal(run,ball);
  }

  function spawnCadence(run){const t=clamp(run.elapsedMs/CONFIG.durationMs,0,1);return CONFIG.spawnBaseMs+(CONFIG.spawnFastMs-CONFIG.spawnBaseMs)*t;}
  function finishMatch(run){
    if(!run||run.finished)return run?.ranking||[];run.finished=true;run.remainingMs=0;
    run.ranking=run.players.slice().sort((a,b)=>b.score-a.score||b.masterBalls-a.masterBalls||a.index-b.index);run.ranking.forEach((p,i)=>{run.players[p.index].place=i+1;});
    run.events.push({type:'finish',at:run.elapsedMs});return run.ranking;
  }

  function stepMatch(run,dt,input={}){
    if(!run||run.finished)return run;
    const ms=Math.max(0,Number(dt)||0);run._lastDt=ms;run.elapsedMs=Math.min(CONFIG.durationMs,run.elapsedMs+ms);run.remainingMs=Math.max(0,CONFIG.durationMs-run.elapsedMs);
    applyPlayerMotion(run,run.players[0],ms,input);
    for(let i=1;i<run.players.length;i++){const aiInput=playerInputForAi(run,run.players[i]);applyPlayerMotion(run,run.players[i],ms,aiInput);}
    updateBalls(run,ms);
    run.spawnInMs-=ms;if(run.spawnInMs<=0){spawnBall(run);run.spawnInMs+=spawnCadence(run);}
    run.balls=run.balls.filter(b=>!b.scored||run.elapsedMs-(run.events.findLast?.(e=>e.type==='score'&&e.ballId===b.id)?.at||run.elapsedMs)<700);
    if(run.elapsedMs>=CONFIG.durationMs)finishMatch(run);return run;
  }

  function rewardForResult({place=4,score=0,difficulty='normal'}={}){
    const base=[0,105,70,45,25][clamp(Math.floor(place),1,4)]||25,mult={easy:.9,normal:1,hard:1.2}[difficulty]||1;
    return Math.max(20,Math.round((base+Math.max(0,Number(score)||0)*6)*mult));
  }

  return {CONFIG,BALL_TYPES,DIFFICULTIES,PLAYER_META,ZONE_VECTORS,difficultyProfile,inputZone,zonePosition,nearestZoneForPoint,availableBallKinds,createMatch,spawnBall,hit,stepMatch,finishMatch,rewardForResult,goalOwner,scoreBall};
});
