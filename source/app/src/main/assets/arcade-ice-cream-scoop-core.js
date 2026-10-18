(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexIceCreamScoopCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    maxScoops:20,
    perfectRatio:.10,
    resultHoldMs:780,
    dropDurationMs:360,
    dreamRate:.02,
    fallOutY:-3.5
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',travelMs:3300,scoopWidth:.225,friction:.82,angularDamping:.90,gravity:1.00,fallGravity:8.6,supportSoftness:.88}),
    normal:Object.freeze({key:'normal',label:'Normal',travelMs:2600,scoopWidth:.195,friction:.76,angularDamping:.86,gravity:1.12,fallGravity:9.4,supportSoftness:.82}),
    hard:Object.freeze({key:'hard',label:'Hard',travelMs:2050,scoopWidth:.168,friction:.68,angularDamping:.82,gravity:1.26,fallGravity:10.2,supportSoftness:.76})
  });
  const FLAVORS=Object.freeze([
    Object.freeze({id:'vanilla',label:'Vanilla',className:'vanilla'}),
    Object.freeze({id:'strawberry',label:'Strawberry',className:'strawberry'}),
    Object.freeze({id:'mint',label:'Mint',className:'mint'}),
    Object.freeze({id:'chocolate',label:'Chocolate',className:'chocolate'}),
    Object.freeze({id:'berry',label:'Berry',className:'berry'}),
    Object.freeze({id:'mango',label:'Mango',className:'mango'})
  ]);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function flavorForRoll(r){return FLAVORS[Math.floor(clamp(r,0,.999999)*FLAVORS.length)]||FLAVORS[0];}
  function makeScoop(run,index,rng=Math.random){
    const profile=difficultyProfile(run?.difficulty),dream=!!run?.dreamEvent&&index===run.dreamScoopIndex;
    const flavor=dream?{id:'dream',label:'Dream Scoop',className:'dream'}:flavorForRoll(rand(rng));
    return {index,flavor,phase:rand(rng)*Math.PI*2,width:profile.scoopWidth,isDream:dream};
  }
  function createRun({difficulty='normal',rng=Math.random,dreamRate=CONFIG.dreamRate}={}){
    const profile=difficultyProfile(difficulty),rate=clamp(dreamRate,0,1),dreamEvent=rate>0&&rand(rng)<rate;
    const run={difficulty:profile.key,stack:[],score:0,perfects:0,perfectStreak:0,bestPerfectStreak:0,collapsed:false,complete:false,dropCount:0,dreamEvent,dreamScoopIndex:dreamEvent?3+Math.floor(rand(rng)*4):-1,dreamSeen:false,dreamLanded:false,current:null,physicsTime:0};
    run.current=makeScoop(run,0,rng);if(run.current.isDream)run.dreamSeen=true;return run;
  }
  function movingXAt(run,atMs){
    if(!run?.current)return .5;const p=difficultyProfile(run.difficulty),t=Math.max(0,Number(atMs)||0),half=run.current.width/2,range=Math.max(.05,1-run.current.width);
    const wave=(Math.sin((t/p.travelMs)*Math.PI*2+run.current.phase)+1)/2;
    return half+wave*range;
  }
  function overlapRatio(a,b,width){const w=Math.max(.001,Number(width)||.001),d=Math.abs((Number(a)||0)-(Number(b)||0));return clamp(1-d/w,0,1);}
  function placementQuality(run,x){
    const p=difficultyProfile(run?.difficulty),width=run?.current?.width||p.scoopWidth,baseX=run?.stack?.length?run.stack[run.stack.length-1].x:.5,dropX=clamp(x,width/2,1-width/2),delta=dropX-baseX,overlap=overlapRatio(dropX,baseX,width),accuracy=clamp(1-Math.abs(delta)/(width*.92),0,1),perfect=Math.abs(delta)<=width*CONFIG.perfectRatio;
    return {x:dropX,baseX,delta,overlap,accuracy,perfect,safe:overlap>0};
  }
  function makeBody(scoop,q,height){
    const radius=Math.max(.001,Number(scoop.width||0)/2);
    return {...scoop,x:q.x,y:height,vx:0,vy:0,angle:0,omega:0,radius,mass:1,falling:false,settled:true,overlap:q.overlap,accuracy:q.accuracy,perfect:q.perfect};
  }
  function markFalling(run,startIndex,direction=0){
    const p=difficultyProfile(run?.difficulty),stack=run?.stack||[];if(startIndex<0||startIndex>=stack.length)return false;
    const sign=direction===0?(stack[startIndex].x>=.5?1:-1):Math.sign(direction);
    for(let i=startIndex;i<stack.length;i++){
      const body=stack[i];if(body.falling)continue;body.falling=true;body.settled=false;body.vx+=sign*(.12+(i-startIndex)*.018);body.vy=-.18-(i-startIndex)*.035;body.omega+=sign*(1.35+(i-startIndex)*.24)*(1+(1-p.angularDamping));
    }
    run.collapsed=true;run.perfectStreak=0;return true;
  }
  function upperCentreOfMass(stack,start){
    let total=0,sum=0;for(let i=start;i<stack.length;i++){const b=stack[i];if(b.falling)continue;const m=Math.max(.01,Number(b.mass)||1);total+=m;sum+=b.x*m;}return total?sum/total:stack[start]?.x??.5;
  }
  function stepPhysics(run,dt=1/60){
    if(!run?.stack?.length)return {collapsed:!!run?.collapsed,settled:true};
    const p=difficultyProfile(run.difficulty),step=clamp(dt,0,1/20),stack=run.stack;run.physicsTime=(Number(run.physicsTime)||0)+step;

    // A scoop is supported by the cone or the scoop beneath it. The upper segment's
    // centre of mass drives rolling/sliding; collapse happens only when physical support is lost.
    if(!run.collapsed){
      for(let i=0;i<stack.length;i++){
        const body=stack[i];if(body.falling)continue;
        const supportX=i===0?.5:stack[i-1].x;
        const supportRadius=i===0?body.radius*.94:Math.min(body.radius,stack[i-1].radius);
        const supportHalf=supportRadius*p.supportSoftness;
        const com=upperCentreOfMass(stack,i),offset=com-supportX,ratio=Math.abs(offset)/Math.max(.001,supportHalf);
        if(ratio>=1){markFalling(run,i,offset);break;}
        const slip=Math.max(0,ratio-p.friction);
        if(slip>0){
          const dir=Math.sign(offset)||1,accel=dir*p.gravity*slip*.22;
          for(let j=i;j<stack.length;j++){
            const upper=stack[j];if(upper.falling)continue;const weight=1+(j-i)*.10;upper.vx+=accel*weight*step;upper.omega+=accel*8*weight*step;upper.settled=false;
          }
        }
      }
    }

    let moving=false;
    for(let i=0;i<stack.length;i++){
      const b=stack[i];
      if(b.falling){
        b.vy-=p.fallGravity*step;b.x+=b.vx*step;b.y+=b.vy*step;b.angle+=b.omega*step;b.vx*=Math.pow(.993,step*60);b.omega*=Math.pow(.992,step*60);moving=true;continue;
      }
      const linearDamp=Math.pow(.72+(p.friction-.68)*.55,step*60),angularDamp=Math.pow(p.angularDamping,step*60);
      b.vx*=linearDamp;b.omega*=angularDamp;b.x+=b.vx*step;b.angle+=b.omega*step;
      if(Math.abs(b.vx)<.00035)b.vx=0;if(Math.abs(b.omega)<.004)b.omega=0;
      b.settled=b.vx===0&&b.omega===0;if(!b.settled)moving=true;
      // Soft scoops stay in contact vertically while supported; each still owns its own body state.
      b.y=i;
    }
    return {collapsed:!!run.collapsed,settled:!moving};
  }
  function isTowerSettled(run){return !!run&&!run.collapsed&&(run.stack||[]).every(b=>!b.falling&&Math.abs(Number(b.vx)||0)<.0005&&Math.abs(Number(b.omega)||0)<.006);}
  function resolveDrop(run,x,rng=Math.random){
    if(!run||run.collapsed||run.complete||!run.current)return {accepted:false,reason:'inactive'};
    const q=placementQuality(run,x),scoop=run.current,heightBefore=run.stack.length;run.dropCount++;
    const body=makeBody(scoop,q,heightBefore);
    if(!q.safe){run.stack.push(body);markFalling(run,heightBefore,q.delta);return {accepted:true,safe:false,collapsed:true,scoop:body,quality:q,height:heightBefore,scoreAdded:0};}
    run.perfectStreak=q.perfect?run.perfectStreak+1:0;run.bestPerfectStreak=Math.max(run.bestPerfectStreak,run.perfectStreak);if(q.perfect)run.perfects++;
    const scoreAdded=Math.round(85+q.accuracy*115+heightBefore*7+(q.perfect?45:0)+run.perfectStreak*12);
    body.scoreAdded=scoreAdded;run.stack.push(body);run.score+=scoreAdded;if(scoop.isDream)run.dreamLanded=true;
    // Let the new load transfer through the stack immediately. This catches physically unsupported
    // placements without an arbitrary "lean limit", while near-edge placements can still wobble first.
    for(let i=0;i<8&&!run.collapsed;i++)stepPhysics(run,1/120);
    if(run.collapsed)return {accepted:true,safe:false,collapsed:true,scoop:body,quality:q,height:run.stack.length,scoreAdded};
    if(run.stack.length>=CONFIG.maxScoops){run.complete=true;run.current=null;return {accepted:true,safe:true,complete:true,scoop:body,quality:q,height:run.stack.length,scoreAdded};}
    run.current=makeScoop(run,run.stack.length,rng);if(run.current.isDream)run.dreamSeen=true;
    return {accepted:true,safe:true,complete:false,scoop:body,quality:q,height:run.stack.length,scoreAdded,next:run.current};
  }
  function rewardForRun(run){const height=Math.max(0,Number(run?.stack?.filter?.(b=>!b.falling)?.length??run?.stack?.length)||0),score=Math.max(0,Number(run?.score)||0),mult=run?.difficulty==='hard'?1.25:run?.difficulty==='easy'?.9:1;return Math.round((35+height*20+score/18)*mult);}
  function judgement(result){if(!result?.safe)return 'COLLAPSE';if(result.quality?.perfect)return 'PERFECT';if((result.quality?.accuracy||0)>=.78)return 'GREAT';if((result.quality?.accuracy||0)>=.48)return 'GOOD';return 'WOBBLY';}
  function snapshot(run){return run?JSON.parse(JSON.stringify(run)):null;}
  return Object.freeze({CONFIG,DIFFICULTIES,FLAVORS,difficultyProfile,flavorForRoll,createRun,movingXAt,overlapRatio,placementQuality,stepPhysics,isTowerSettled,resolveDrop,rewardForRun,judgement,snapshot});
});
