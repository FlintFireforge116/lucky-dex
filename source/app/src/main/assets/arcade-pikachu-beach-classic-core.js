(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexPikachuBeachClassicCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const FIXED_STEP_MS=20;
  const CONFIG=Object.freeze({
    fixedStepMs:FIXED_STEP_MS,startingHp:6000,courseSections:24,initialSpeed:.25,maxSpeed:2,
    accelerationPerStep:1/128,spinRateDegPerSecond:900,luckyWaveRate:.02,maxRecordedFlips:3
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',cleanDeg:32,roughDeg:72,hardDeg:120,rewardMultiplier:1}),
    normal:Object.freeze({key:'normal',label:'Normal',cleanDeg:25,roughDeg:60,hardDeg:105,rewardMultiplier:1.18}),
    hard:Object.freeze({key:'hard',label:'Hard',cleanDeg:18,roughDeg:48,hardDeg:85,rewardMultiplier:1.38})
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const normAngle=a=>{let n=((Number(a)||0)%360+360)%360;if(n>180)n-=360;return n;};
  const direction=d=>String(d||'').toLowerCase()==='right'?'right':'left';
  function difficultyProfile(k){return DIFFICULTIES[k]||DIFFICULTIES.normal;}
  function scoreTrick(flips){
    const seq=(Array.isArray(flips)?flips:[]).slice(0,3).map(direction),n=seq.length;if(!n)return 0;if(n===1)return 50;
    const same=seq.every(x=>x===seq[0]);if(n===2)return same?150:180;return same?350:500;
  }
  function rollLuckyWave(rate,rng=Math.random){return clamp(rng(),0,.999999)<clamp(rate,0,1);}
  function createRun({difficulty='normal',luckyWave=false,rng=Math.random}={}){
    const p=difficultyProfile(difficulty),r=clamp(rng(),0,.999999);
    return {difficulty:p.key,state:'riding',hp:CONFIG.startingHp,radness:0,sections:0,distanceFraction:0,progress:0,
      speed:CONFIG.initialSpeed,speedUnits:Math.round(CONFIG.initialSpeed*256),waveTimerMs:1600+Math.floor(r*600),waveIndex:0,
      air:null,landingTimerMs:0,crashTimerMs:0,input:{left:false,right:false},elapsedMs:0,carryMs:0,finished:false,cleared:false,finalScore:0,
      successfulLandings:0,cleanLandings:0,roughLandings:0,hardLandings:0,wipeouts:0,bestTrick:0,bestFlips:0,totalFlips:0,
      luckyWaveActive:!!luckyWave,luckyWaveIndex:luckyWave?2+Math.floor(r*4):null,luckyWaveSeen:false,luckyWaveLanded:false,_rng:rng};
  }
  function setInput(run,input={}){if(!run)return null;run.input={left:!!input.left,right:!!input.right};return run.input;}
  function slopeTarget(slope){return slope==='rising'?-45:slope==='falling'?45:0;}
  function landingQuality(run,angle,slope){
    const p=difficultyProfile(run.difficulty),err=Math.abs(normAngle(angle-slopeTarget(slope)));
    if(err<=p.cleanDeg)return {quality:'clean',errorDeg:err};
    if(err<=p.roughDeg)return {quality:'rough',errorDeg:err};
    if(err<=p.hardDeg)return {quality:'hard',errorDeg:err};
    return {quality:'wipeout',errorDeg:err};
  }
  function nextSlope(run){const v=clamp(run._rng?.()??.5,0,.999999);return v<.25?'rising':v<.5?'crest':v<.75?'falling':'flat';}
  function startWave(run,events){
    run.waveIndex++;
    const lucky=!!run.luckyWaveActive&&run.waveIndex===run.luckyWaveIndex;if(lucky){run.luckyWaveSeen=true;events.push({type:'luckyWave',waveIndex:run.waveIndex});}
    const airMs=Math.round(930+run.speed*260);
    run.air={angleDeg:0,flips:[],segmentDirection:null,segmentTravelDeg:0,remainingMs:airMs,slope:nextSlope(run),lucky};
    run.state='jumping';events.push({type:'jump',lucky,airtimeMs:airMs,waveIndex:run.waveIndex});
    run.waveTimerMs=3200+Math.floor(clamp(run._rng?.()??.5,0,.999999)*1800);
  }
  function spinAir(run,ms,events){
    const a=run.air;if(!a)return;const dir=run.input.left&&!run.input.right?'left':run.input.right&&!run.input.left?'right':null;if(!dir)return;
    const delta=CONFIG.spinRateDegPerSecond*(ms/1000),sign=dir==='right'?1:-1;a.angleDeg+=sign*delta;
    if(a.segmentDirection!==dir){a.segmentDirection=dir;a.segmentTravelDeg=0;}a.segmentTravelDeg+=delta;
    while(a.segmentTravelDeg>=360){a.segmentTravelDeg-=360;run.totalFlips++;if(a.flips.length<CONFIG.maxRecordedFlips)a.flips.push(dir);events.push({type:'flip',direction:dir,count:a.flips.length});}
  }
  function applyLanding(run,events){
    const a=run.air,q=landingQuality(run,a.angleDeg,a.slope),flips=a.flips.slice(0,3),points=q.quality==='wipeout'?0:scoreTrick(flips),lucky=!!a.lucky;
    if(q.quality==='wipeout'){
      run.wipeouts++;run.speed=CONFIG.initialSpeed;run.speedUnits=Math.round(run.speed*256);run.state='crashed';run.crashTimerMs=1920;
      events.push({type:'wipeout',quality:'wipeout',errorDeg:q.errorDeg,flips,lucky});
    }else{
      if(q.quality==='rough')run.speed=Math.max(0,run.speed-.25);
      else if(q.quality==='hard')run.speed=Math.max(0,run.speed-.5);
      run.speedUnits=Math.round(run.speed*256);run.radness+=points;run.successfulLandings++;run[q.quality+'Landings']++;
      run.bestTrick=Math.max(run.bestTrick,points);run.bestFlips=Math.max(run.bestFlips,flips.length);if(lucky)run.luckyWaveLanded=true;
      run.state='landing';run.landingTimerMs=320;events.push({type:'landing',quality:q.quality,errorDeg:q.errorDeg,points,flips,lucky});
    }
    run.air=null;
  }
  function advanceDistance(run){
    run.distanceFraction+=run.speedUnits;
    while(run.distanceFraction>=65536){run.distanceFraction-=65536;run.sections++;}
    run.progress=clamp((run.sections+run.distanceFraction/65536)/CONFIG.courseSections,0,1);
  }
  function fixedStep(run,events){
    if(run.finished)return;
    run.elapsedMs+=FIXED_STEP_MS;run.hp=Math.max(0,run.hp-1);
    // Yellow accelerates while riding; landing/crash frames do not add acceleration.
    if(run.state==='riding'){
      run.speed=Math.min(CONFIG.maxSpeed,run.speed+CONFIG.accelerationPerStep);run.speedUnits=Math.round(run.speed*256);
      run.waveTimerMs-=FIXED_STEP_MS;
      if(run.waveTimerMs<=0&&run.speedUnits>=320)startWave(run,events);
    }else if(run.state==='jumping'){
      spinAir(run,FIXED_STEP_MS,events);run.air.remainingMs-=FIXED_STEP_MS;if(run.air.remainingMs<=0)applyLanding(run,events);
    }else if(run.state==='landing'){
      run.landingTimerMs-=FIXED_STEP_MS;if(run.landingTimerMs<=0){run.state='riding';events.push({type:'ride'});}
    }else if(run.state==='crashed'){
      run.crashTimerMs-=FIXED_STEP_MS;if(run.crashTimerMs<=0){run.state='riding';events.push({type:'ride'});}
    }
    advanceDistance(run);
    if(run.sections>=CONFIG.courseSections){run.finished=true;run.cleared=run.hp>0;run.state='finished';events.push({type:'finish',cleared:run.cleared});}
    else if(run.hp<=0){run.finished=true;run.cleared=false;run.state='finished';events.push({type:'finish',cleared:false});}
  }
  function step(run,dtMs){
    if(!run||run.finished)return [];const events=[];run.carryMs+=Math.max(0,Number(dtMs)||0);
    const maxSteps=1000;let n=0;while(run.carryMs>=FIXED_STEP_MS&&!run.finished&&n++<maxSteps){run.carryMs-=FIXED_STEP_MS;fixedStep(run,events);}return events;
  }
  function finishRun(run){
    if(!run)return {cleared:false,finalScore:0,remainingHp:0,radness:0};
    const remainingHp=Math.max(0,Math.floor(run.hp)),cleared=!!run.cleared,finalScore=Math.max(0,Math.round(run.radness+(cleared?remainingHp:0)));
    run.finalScore=finalScore;return {cleared,finalScore,remainingHp,radness:run.radness,wipeouts:run.wipeouts,cleanLandings:run.cleanLandings,roughLandings:run.roughLandings,hardLandings:run.hardLandings,bestTrick:run.bestTrick,bestFlips:run.bestFlips,luckyWaveSeen:run.luckyWaveSeen,luckyWaveLanded:run.luckyWaveLanded};
  }
  function rewardCoins(score,difficulty='normal',cleared=true){const p=difficultyProfile(difficulty),s=Math.max(0,Number(score)||0);return Math.max(20,Math.min(360,Math.round((cleared?45:20)+s*.026*p.rewardMultiplier)));}
  function snapshot(run){if(!run)return null;return {difficulty:run.difficulty,state:run.state,hp:Math.floor(run.hp),radness:run.radness,progress:run.progress,speed:run.speed,sections:run.sections,air:run.air?{angleDeg:run.air.angleDeg,flips:run.air.flips.slice(),slope:run.air.slope,lucky:run.air.lucky,remainingMs:run.air.remainingMs}:null,wipeouts:run.wipeouts,bestTrick:run.bestTrick,bestFlips:run.bestFlips,elapsedMs:run.elapsedMs,finished:run.finished,cleared:run.cleared,luckyWaveSeen:run.luckyWaveSeen,luckyWaveLanded:run.luckyWaveLanded};}
  return Object.freeze({CONFIG,DIFFICULTIES,difficultyProfile,scoreTrick,rollLuckyWave,createRun,setInput,step,finishRun,rewardCoins,snapshot,landingQuality});
});
