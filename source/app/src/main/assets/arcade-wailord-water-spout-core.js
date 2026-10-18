(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexWailordWaterSpoutCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    durationMs:90000,
    goalBalls:15,
    baseHitScore:300,
    ballCounterBonus:500,
    comboBonus:100,
    perfectClearBonus:10000,
    rainbowRate:.02,
    rainbowMinMs:12000,
    rainbowMaxMs:42000,
    rainbowScoreBonus:2500,
    waterY:.94,
    catchY:.78
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',catchWidth:.36,ballRadius:.082,gravity:.44,launchSpeed:.94,horizontalLaunch:.56,moveSpeed:.82,ballCount:7}),
    normal:Object.freeze({key:'normal',label:'Normal',catchWidth:.30,ballRadius:.071,gravity:.49,launchSpeed:.99,horizontalLaunch:.62,moveSpeed:.76,ballCount:8}),
    hard:Object.freeze({key:'hard',label:'Hard',catchWidth:.25,ballRadius:.062,gravity:.55,launchSpeed:1.04,horizontalLaunch:.69,moveSpeed:.70,ballCount:9})
  });
  const SPECIES=Object.freeze([
    Object.freeze({id:'pikachu',dex:25,label:'Pikachu',colour:'yellow',unlockMs:0}),
    Object.freeze({id:'meowth',dex:52,label:'Meowth',colour:'brown',unlockMs:5000}),
    Object.freeze({id:'piplup',dex:393,label:'Piplup',colour:'blue',unlockMs:30000}),
    Object.freeze({id:'buizel',dex:418,label:'Buizel',colour:'orange',unlockMs:60000})
  ]);
  const byId=Object.freeze(Object.fromEntries(SPECIES.map(x=>[x.id,x])));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function speciesFor(id){return byId[String(id||'')]||SPECIES[0];}
  function availableSpecies(elapsedMs=0){const t=Math.max(0,Number(elapsedMs)||0);return SPECIES.filter(x=>t>=x.unlockMs);}
  function launchVector(offset=0,difficulty='normal'){
    const p=difficultyProfile(difficulty),o=clamp(offset,-1,1),edge=Math.abs(o);
    return {vx:o*p.horizontalLaunch,vy:-p.launchSpeed*(1-edge*.08)};
  }
  function createRun({difficulty='normal',rng=Math.random,rainbowRate=CONFIG.rainbowRate}={}){
    const p=difficultyProfile(difficulty),rate=clamp(rainbowRate,0,1),rainbowEvent=rate>0&&rand(rng)<rate;
    const min=CONFIG.rainbowMinMs,max=CONFIG.rainbowMaxMs;
    return {
      difficulty:p.key,elapsedMs:0,score:0,openedBalls:0,totalHits:0,wrongHits:0,combo:0,bestCombo:0,multiplier:1,falls:0,
      goalReached:false,complete:false,ballSerial:0,maxMultiplier:1,
      rainbowEvent,rainbowSpawnMs:rainbowEvent?Math.round(min+rand(rng)*(max-min)):Infinity,rainbowSpawned:false,rainbowSeen:false,rainbowOpened:false
    };
  }
  function normalBallSpecies(run,rng){
    const unlocked=availableSpecies(run?.elapsedMs||0);return unlocked[Math.floor(rand(rng)*unlocked.length)]||SPECIES[0];
  }
  function makeBall(run,rng=Math.random,{forceRainbow=false}={}){
    if(!run)throw new Error('Run required');
    const rainbow=!!forceRainbow||(!run.rainbowSpawned&&run.rainbowEvent&&(run.elapsedMs||0)>=run.rainbowSpawnMs);
    if(rainbow){run.rainbowSpawned=true;run.rainbowSeen=true;return {id:`ball-${++run.ballSerial}`,rainbow:true,colour:'rainbow',speciesId:null,x:.13+rand(rng)*.74,y:.12+rand(rng)*.36};}
    const species=normalBallSpecies(run,rng);return {id:`ball-${++run.ballSerial}`,rainbow:false,colour:species.colour,speciesId:species.id,x:.11+rand(rng)*.78,y:.11+rand(rng)*.40};
  }
  function hitBall(run,pokemonId,ball){
    if(!run||!ball)return {opened:false,reason:'invalid'};const species=speciesFor(pokemonId),match=!!ball.rainbow||species.colour===ball.colour;
    if(!match){run.wrongHits++;return {opened:false,reason:'wrong-colour',scoreAdded:0,multiplier:run.multiplier};}
    run.totalHits++;run.openedBalls++;run.combo++;run.bestCombo=Math.max(run.bestCombo,run.combo);run.multiplier=Math.min(10,1+Math.floor(run.combo/5));run.maxMultiplier=Math.max(run.maxMultiplier||1,run.multiplier);
    let scoreAdded=CONFIG.baseHitScore*run.multiplier;if(ball.rainbow){run.rainbowOpened=true;scoreAdded+=CONFIG.rainbowScoreBonus;}
    run.score+=scoreAdded;if(run.openedBalls>=CONFIG.goalBalls)run.goalReached=true;
    return {opened:true,scoreAdded,multiplier:run.multiplier,combo:run.combo,goalReached:run.goalReached,rainbow:!!ball.rainbow};
  }
  function registerFall(run){if(!run)return null;run.falls++;run.combo=0;run.multiplier=1;return {falls:run.falls,combo:0,multiplier:1};}
  function finalScore(run){if(!run)return 0;const base=Math.max(0,Number(run.score)||0),balls=Math.max(0,Number(run.openedBalls)||0),combo=Math.max(0,Number(run.bestCombo)||0),perfect=Number(run.falls||0)===0?CONFIG.perfectClearBonus:0;return Math.round(base+balls*CONFIG.ballCounterBonus+combo*CONFIG.comboBonus+perfect);}
  function rewardForRun(run){const score=finalScore(run),mult=run?.difficulty==='hard'?1.18:run?.difficulty==='easy'?.92:1;return Math.max(25,Math.round(Math.min(700,35+score/105)*mult));}
  function snapshot(run){return run?JSON.parse(JSON.stringify(run)):null;}
  return Object.freeze({CONFIG,DIFFICULTIES,SPECIES,difficultyProfile,speciesFor,availableSpecies,launchVector,createRun,makeBall,hitBall,registerFall,finalScore,rewardForRun,snapshot});
});
