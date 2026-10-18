(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexRampageRolloutCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const TAU=Math.PI*2;
  const DONPHAN=Object.freeze({dex:232,name:'Donphan'});
  const CONFIG=Object.freeze({
    lapsToWin:9,
    centreX:360,centreY:360,
    innerRadius:158,outerRadius:302,
    startRadius:230,
    minRaceRadius:178,maxRaceRadius:282,
    playerAcceleration:470,
    playerBrake:650,
    playerDrag:260,
    playerMaxSpeed:330,
    rolloutMaxSpeed:455,
    radialSpeed:92,
    maxDust:3,
    dustRadius:31,
    dustLifetimeMs:9000,
    dustStunMs:850,
    dustSpeedFactor:.28,
    racerRadius:19,
    maxStepMs:32,
    safetyCapMs:90000
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',cpuSpeed:242,cpuRolloutSpeed:340,laneWobble:18,dustAvoidChance:.82,dustDropChance:.45,reactionMs:520}),
    normal:Object.freeze({key:'normal',label:'Normal',cpuSpeed:278,cpuRolloutSpeed:385,laneWobble:14,dustAvoidChance:.90,dustDropChance:.62,reactionMs:400}),
    hard:Object.freeze({key:'hard',label:'Hard',cpuSpeed:312,cpuRolloutSpeed:425,laneWobble:10,dustAvoidChance:.96,dustDropChance:.78,reactionMs:300})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([95,60,40,25]),normal:Object.freeze([130,85,55,30]),hard:Object.freeze([170,110,70,40])});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  const between=(rng,a,b)=>a+rand(rng)*(b-a);
  const profileFor=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const normalizeAngle=a=>{let x=Number(a)||0;while(x<=-Math.PI)x+=TAU;while(x>Math.PI)x-=TAU;return x;};
  const progressFor=r=>Math.max(0,Number(r?.angularTravel||0)/TAU);
  const coordsFor=r=>({x:CONFIG.centreX+Math.cos(r.angle)*r.radius,y:CONFIG.centreY+Math.sin(r.angle)*r.radius});
  const distance=(a,b)=>{const ac=coordsFor(a),bc=('x'in b&&'y'in b)?b:coordsFor(b);return Math.hypot(ac.x-bc.x,ac.y-bc.y);};
  const dustAwardForPlace=place=>clamp(Math.trunc(Number(place)||1)-1,0,3);
  function makeRacer(id,index,kind,profile,rng,now){
    const laneOffset=[0,-34,34,-68][index]||0;
    const angle=-Math.PI/2-(index*.045);
    return {id,index,kind,label:id==='player'?'YOU':`COM ${index}`,species:{...DONPHAN},angle,radius:clamp(CONFIG.startRadius+laneOffset,CONFIG.minRaceRadius,CONFIG.maxRaceRadius),speed:0,angularTravel:0,lapsCompleted:0,rollout:false,dust:0,dustDropped:0,dustHits:0,dustHitsTaken:0,stunnedUntil:0,finishedAt:null,inputX:0,inputY:0,targetRadius:clamp(CONFIG.startRadius+laneOffset,CONFIG.minRaceRadius,CONFIG.maxRaceRadius),nextDustAt:(Number(now)||0)+between(rng,1800,3400)+index*180,profileKey:profile.key};
  }
  function createRace({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const profile=profileFor(difficulty),start=Number(nowMs)||0;
    const racers=[0,1,2,3].map(i=>makeRacer(i===0?'player':`cpu${i}`,i,i===0?'player':'cpu',profile,rng,start));
    return {difficulty:profile.key,startedAt:start,lastAdvancedAt:start,racers,player:racers[0],hazards:[],hazardSeq:0,finalized:false,finalizedAt:null,winnerId:null,ranking:null};
  }
  function rankRace(race){return (race?.racers||[]).slice().sort((a,b)=>{const af=a.finishedAt!=null,bf=b.finishedAt!=null;if(af&&bf)return Number(a.finishedAt)-Number(b.finishedAt)||a.index-b.index;if(af!==bf)return af?-1:1;return progressFor(b)-progressFor(a)||Number(b.speed||0)-Number(a.speed||0)||a.index-b.index;});}
  function placeFor(race,id='player'){const i=rankRace(race).findIndex(r=>r.id===id);return i<0?4:i+1;}
  function awardLapDust(race,racer,place){if(!race||!racer)return 0;const award=dustAwardForPlace(place),before=Number(racer.dust||0);racer.dust=Math.min(CONFIG.maxDust,before+award);return racer.dust-before;}
  function finalizeRace(race,nowMs){if(!race)return[];if(!race.finalized){race.finalized=true;race.finalizedAt=Number(nowMs)||0;race.ranking=rankRace(race);race.winnerId=race.ranking[0]?.id||null;}return (race.ranking||rankRace(race)).slice();}
  function applyAngularAdvance(race,racer,delta,atMs){
    if(!race||!racer||race.finalized||racer.finishedAt!=null)return racer;
    const oldLaps=Math.floor(Math.max(0,racer.angularTravel)/TAU);
    racer.angularTravel=Math.max(0,Number(racer.angularTravel||0)+Math.max(0,Number(delta)||0));
    racer.angle=normalizeAngle(-Math.PI/2+racer.angularTravel);
    const newLaps=Math.min(CONFIG.lapsToWin,Math.floor(racer.angularTravel/TAU));
    if(newLaps>oldLaps){
      for(let lap=oldLaps+1;lap<=newLaps;lap++){
        racer.lapsCompleted=lap;
        if(lap>=CONFIG.lapsToWin){racer.finishedAt=Number(atMs)||0;finalizeRace(race,atMs);break;}
        const place=placeFor(race,racer.id);awardLapDust(race,racer,place);
        if(lap===CONFIG.lapsToWin-1)racer.rollout=true;
      }
    }else racer.lapsCompleted=Math.max(racer.lapsCompleted,newLaps);
    if(racer.lapsCompleted>=CONFIG.lapsToWin-1)racer.rollout=true;
    return racer;
  }
  function setPlayerInput(race,x,y){if(!race?.player||race.finalized)return false;let vx=Number(x)||0,vy=Number(y)||0,mag=Math.hypot(vx,vy);if(mag>1){vx/=mag;vy/=mag;mag=1;}race.player.inputX=vx;race.player.inputY=vy;return true;}
  function approach(value,target,amount){const v=Number(value)||0,t=Number(target)||0,a=Math.max(0,Number(amount)||0);return v<t?Math.min(t,v+a):Math.max(t,v-a);}
  function stepPlayer(race,r,dt,atMs){
    if(r.finishedAt!=null)return;
    const stunned=Number(r.stunnedUntil||0)>atMs;
    const tx=-Math.sin(r.angle),ty=Math.cos(r.angle),rx=Math.cos(r.angle),ry=Math.sin(r.angle);
    const tangent=stunned?0:clamp(r.inputX*tx+r.inputY*ty,-1,1);
    const radial=stunned?0:clamp(r.inputX*rx+r.inputY*ry,-1,1);
    const max=r.rollout?CONFIG.rolloutMaxSpeed:CONFIG.playerMaxSpeed;
    if(tangent>.05)r.speed=approach(r.speed,max*tangent,CONFIG.playerAcceleration*dt);
    else if(tangent<-.05)r.speed=approach(r.speed,0,CONFIG.playerBrake*dt*(.7+Math.abs(tangent)));
    else r.speed=approach(r.speed,0,CONFIG.playerDrag*dt);
    if(stunned)r.speed=approach(r.speed,0,CONFIG.playerBrake*dt);
    r.radius=clamp(r.radius+radial*CONFIG.radialSpeed*dt,CONFIG.minRaceRadius,CONFIG.maxRaceRadius);
    const delta=(Math.max(0,r.speed)/Math.max(1,r.radius))*dt;
    applyAngularAdvance(race,r,delta,atMs);
  }
  function nearestThreat(race,r){
    let best=null,bestAhead=Infinity;
    for(const h of race.hazards){if(h.ownerId===r.id)continue;const ahead=(h.travel-r.angularTravel);if(ahead>0&&ahead<TAU*.24&&Math.abs(h.radius-r.radius)<CONFIG.dustRadius*1.5&&ahead<bestAhead){best=h;bestAhead=ahead;}}
    return best;
  }
  function stepCpu(race,r,profile,dt,atMs,rng){
    if(r.finishedAt!=null)return;
    const stunned=Number(r.stunnedUntil||0)>atMs;
    let target=r.targetRadius;
    const threat=nearestThreat(race,r);
    if(threat&&rand(rng)<profile.dustAvoidChance){const outward=threat.radius<=r.radius?1:-1;target=clamp(r.radius+outward*58,CONFIG.minRaceRadius,CONFIG.maxRaceRadius);}
    else if(Math.abs(r.radius-r.targetRadius)<5&&rand(rng)<.006)r.targetRadius=clamp(CONFIG.startRadius+between(rng,-profile.laneWobble*2.2,profile.laneWobble*2.2),CONFIG.minRaceRadius,CONFIG.maxRaceRadius);
    r.radius=approach(r.radius,target,CONFIG.radialSpeed*.7*dt);
    const targetSpeed=stunned?0:(r.rollout?profile.cpuRolloutSpeed:profile.cpuSpeed);
    r.speed=approach(r.speed,targetSpeed,(stunned?CONFIG.playerBrake:390)*dt);
    const delta=(Math.max(0,r.speed)/Math.max(1,r.radius))*dt;
    applyAngularAdvance(race,r,delta,atMs);
    if(!race.finalized&&r.dust>0&&atMs>=r.nextDustAt){
      if(rand(rng)<profile.dustDropChance)dropDust(race,r,atMs);
      r.nextDustAt=atMs+between(rng,1800,3300)+profile.reactionMs;
    }
  }
  function dropDust(race,racer,atMs){
    if(!race||!racer||race.finalized||racer.finishedAt!=null||Number(racer.dust||0)<=0)return {accepted:false};
    racer.dust--;racer.dustDropped++;
    const c=coordsFor(racer),h={id:++race.hazardSeq,ownerId:racer.id,angle:racer.angle,radius:racer.radius,travel:racer.angularTravel,x:c.x,y:c.y,createdAt:Number(atMs)||0,expiresAt:(Number(atMs)||0)+CONFIG.dustLifetimeMs,hitIds:new Set()};
    race.hazards.push(h);return {accepted:true,hazard:h,dust:racer.dust};
  }
  function resolveDustHits(race,atMs){
    if(!race)return 0;const now=Number(atMs)||0;race.hazards=race.hazards.filter(h=>h.expiresAt>now);let hits=0;
    for(const h of race.hazards){for(const r of race.racers){if(r.id===h.ownerId||r.finishedAt!=null||h.hitIds.has(r.id))continue;if(distance(r,h)<=CONFIG.dustRadius+CONFIG.racerRadius){h.hitIds.add(r.id);r.stunnedUntil=Math.max(Number(r.stunnedUntil||0),now+CONFIG.dustStunMs);r.speed*=CONFIG.dustSpeedFactor;r.dustHitsTaken++;const owner=race.racers.find(x=>x.id===h.ownerId);if(owner)owner.dustHits++;hits++;}}}
    return hits;
  }
  function advanceRace(race,nowMs,rng=Math.random){
    if(!race||race.finalized)return race;const now=Number(nowMs)||0;if(now<=race.lastAdvancedAt)return race;
    let cursor=race.lastAdvancedAt,guard=0;
    while(cursor<now&&!race.finalized&&guard++<4096){const end=Math.min(now,cursor+CONFIG.maxStepMs),dt=(end-cursor)/1000;stepPlayer(race,race.player,dt,end);const profile=profileFor(race.difficulty);for(let i=1;i<race.racers.length&&!race.finalized;i++)stepCpu(race,race.racers[i],profile,dt,end,rng);resolveDustHits(race,end);cursor=end;}
    race.lastAdvancedAt=now;
    if(!race.finalized&&now-race.startedAt>=CONFIG.safetyCapMs)finalizeRace(race,now);
    return race;
  }
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[clamp(Math.trunc(Number(place)||1)-1,0,3)];}
  function shiftTimestamps(race,delta){if(!race||!delta)return race;race.startedAt+=delta;race.lastAdvancedAt+=delta;if(race.finalizedAt!=null)race.finalizedAt+=delta;for(const r of race.racers){if(r.stunnedUntil)r.stunnedUntil+=delta;if(r.finishedAt!=null)r.finishedAt+=delta;if(r.nextDustAt)r.nextDustAt+=delta;}for(const h of race.hazards){h.createdAt+=delta;h.expiresAt+=delta;}return race;}
  return {TAU,DONPHAN,CONFIG,DIFFICULTIES,REWARDS,profileFor,progressFor,coordsFor,dustAwardForPlace,awardLapDust,createRace,rankRace,placeFor,setPlayerInput,dropDust,resolveDustHits,applyAngularAdvance,advanceRace,finalizeRace,rewardFor,shiftTimestamps};
});
