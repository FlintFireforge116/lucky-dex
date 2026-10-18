(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexPikachuBeachCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    startingHp:6000,
    hpDrainPerSecond:60,
    spinRateDegPerSecond:900,
    luckyWaveRate:.02,
    maxRecordedFlips:3,
    minMomentum:.52,
    maxMomentum:2.05
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',landingToleranceDeg:42,baseProgressPerSecond:.0115,waveEveryMs:5000,airtimeMs:1880,momentumGain:.24,wipeoutLoss:.22,rewardMultiplier:1}),
    normal:Object.freeze({key:'normal',label:'Normal',landingToleranceDeg:29,baseProgressPerSecond:.0102,waveEveryMs:4550,airtimeMs:1660,momentumGain:.22,wipeoutLoss:.30,rewardMultiplier:1.18}),
    hard:Object.freeze({key:'hard',label:'Hard',landingToleranceDeg:20,baseProgressPerSecond:.0094,waveEveryMs:4050,airtimeMs:1450,momentumGain:.20,wipeoutLoss:.36,rewardMultiplier:1.38})
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp(Number((rng||Math.random)())||0,0,.999999);
  const direction=d=>String(d||'').toLowerCase()==='right'?'right':'left';

  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function scoreTrick(flips){
    const seq=(Array.isArray(flips)?flips:[]).slice(0,3).map(direction),n=seq.length;
    if(n<=0)return 0;
    if(n===1)return 50;
    const same=seq.every(x=>x===seq[0]);
    if(n===2)return same?150:180;
    return same?350:500;
  }
  function normalizedLandingError(angleDeg){
    let a=((Number(angleDeg)||0)%360+360)%360;if(a>180)a=360-a;return Math.abs(a);
  }
  function rollLuckyWave(rate,rng=Math.random){return rand(rng)<clamp(rate,0,1);}
  function createRun({difficulty='normal',luckyWave=false,rng=Math.random}={}){
    const profile=difficultyProfile(difficulty);
    return {
      difficulty:profile.key,hp:CONFIG.startingHp,radness:0,progress:0,momentum:1,waveIndex:0,air:null,
      successfulLandings:0,wipeouts:0,bestTrick:0,bestFlips:0,totalFlips:0,elapsedMs:0,finished:false,cleared:false,finalScore:0,
      luckyWaveActive:!!luckyWave,luckyWaveIndex:luckyWave?2+Math.floor(rand(rng)*4):null,luckyWaveSeen:false,luckyWaveLanded:false
    };
  }
  function startWave(run){
    if(!run||run.finished||run.air)return null;
    run.waveIndex+=1;
    const lucky=!!run.luckyWaveActive&&run.waveIndex===run.luckyWaveIndex;
    if(lucky)run.luckyWaveSeen=true;
    run.air={angleDeg:0,flips:[],segmentDirection:null,segmentTravelDeg:0,lucky,elapsedMs:0};
    return run.air;
  }
  function rotate(run,dir,dtMs){
    if(!run?.air||run.finished)return run?.air||null;
    const air=run.air,d=direction(dir),ms=Math.max(0,Number(dtMs)||0),delta=CONFIG.spinRateDegPerSecond*(ms/1000),sign=d==='right'?1:-1;
    air.angleDeg+=sign*delta;air.elapsedMs+=ms;
    if(air.segmentDirection!==d){air.segmentDirection=d;air.segmentTravelDeg=0;}
    air.segmentTravelDeg+=delta;
    while(air.segmentTravelDeg>=360){
      if(air.flips.length<CONFIG.maxRecordedFlips)air.flips.push(d);
      air.segmentTravelDeg-=360;run.totalFlips+=1;
    }
    return air;
  }
  function finishLanding(run){
    if(!run?.air)return {safe:false,points:0,errorDeg:180,lucky:false,flips:[]};
    const profile=difficultyProfile(run.difficulty),air=run.air,errorDeg=normalizedLandingError(air.angleDeg),safe=errorDeg<=profile.landingToleranceDeg,flips=air.flips.slice(0,3),lucky=!!air.lucky;
    let points=0;
    if(safe){
      points=scoreTrick(flips);run.radness+=points;run.successfulLandings+=1;run.bestTrick=Math.max(run.bestTrick,points);run.bestFlips=Math.max(run.bestFlips,flips.length);
      run.momentum=clamp(run.momentum+profile.momentumGain+flips.length*.06,CONFIG.minMomentum,CONFIG.maxMomentum);
      if(lucky)run.luckyWaveLanded=true;
    }else{
      run.wipeouts+=1;run.momentum=clamp(run.momentum-profile.wipeoutLoss,CONFIG.minMomentum,CONFIG.maxMomentum);
    }
    run.air=null;
    return {safe,points,errorDeg,lucky,flips};
  }
  function advanceRun(run,dtMs){
    if(!run||run.finished)return run;
    const ms=Math.max(0,Number(dtMs)||0),seconds=ms/1000,profile=difficultyProfile(run.difficulty);
    run.elapsedMs+=ms;
    run.hp=Math.max(0,run.hp-CONFIG.hpDrainPerSecond*seconds);
    run.progress=clamp(run.progress+profile.baseProgressPerSecond*run.momentum*seconds,0,1);
    if(run.hp<=0||run.progress>=1)run.finished=true;
    return run;
  }
  function finishRun(run){
    if(!run)return {cleared:false,finalScore:0,remainingHp:0,radness:0};
    const cleared=run.progress>=1&&run.hp>0,remainingHp=Math.max(0,Math.floor(run.hp)),finalScore=Math.max(0,Math.round(run.radness+(cleared?remainingHp:0)));
    run.finished=true;run.cleared=cleared;run.finalScore=finalScore;
    return {cleared,finalScore,remainingHp,radness:run.radness,wipeouts:run.wipeouts,bestTrick:run.bestTrick,bestFlips:run.bestFlips,luckyWaveSeen:run.luckyWaveSeen,luckyWaveLanded:run.luckyWaveLanded};
  }
  function rewardCoins(score,difficulty='normal',cleared=true){
    const profile=difficultyProfile(difficulty),s=Math.max(0,Number(score)||0),raw=(cleared?45:20)+s*.026*profile.rewardMultiplier;
    return Math.max(20,Math.min(360,Math.round(raw)));
  }
  function shiftAirTime(run,deltaMs){if(run?.air)run.air.elapsedMs=Math.max(0,run.air.elapsedMs+(Number(deltaMs)||0));return run?.air||null;}

  return Object.freeze({CONFIG,DIFFICULTIES,difficultyProfile,scoreTrick,normalizedLandingError,rollLuckyWave,createRun,startWave,rotate,finishLanding,advanceRun,finishRun,rewardCoins,shiftAirTime});
});
