(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexClearCutCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    rounds:5,
    maxScore:20,
    minScore:-10,
    perfectErrorPct:1.5,
    earlyPenaltyMultiplier:1.20,
    penaltyPerPct:.70,
    resultHoldMs:1250,
    readyHoldMs:700,
    bonusReadyHoldMs:900
  });
  const CUTTERS=Object.freeze([
    Object.freeze({dex:123,name:'Scyther'}),
    Object.freeze({dex:127,name:'Pinsir'}),
    Object.freeze({dex:212,name:'Scizor'})
  ]);
  const CUTTER_BY_DEX=Object.freeze(Object.fromEntries(CUTTERS.map(x=>[x.dex,x])));
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',durationMinMs:3000,durationMaxMs:3600,speedVariation:.045,targetMin:.34,targetMax:.66}),
    normal:Object.freeze({key:'normal',label:'Normal',durationMinMs:2350,durationMaxMs:3000,speedVariation:.095,targetMin:.29,targetMax:.71}),
    hard:Object.freeze({key:'hard',label:'Hard',durationMinMs:1800,durationMaxMs:2350,speedVariation:.16,targetMin:.24,targetMax:.76})
  });
  const ANGLES=Object.freeze([0,-18,18,-32,32]);
  const SCORE_REWARD_MULTIPLIERS=Object.freeze({easy:1.10,normal:1.40,hard:1.75});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rand=rng=>clamp(Number((rng||Math.random)())||0,0,.999999);
  const round3=n=>Math.round(Number(n)*1000)/1000;

  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function judgementForScore(score){const s=Number(score)||0;return s>=20?'PERFECT':s>=17?'GREAT':s>=12?'GOOD':s>=5?'CLOSE':'MISS';}
  function scoreCut(errorPct){
    const error=Number(errorPct)||0,abs=Math.abs(error);
    let score;
    if(abs<=CONFIG.perfectErrorPct)score=CONFIG.maxScore;
    else{
      const penaltyDistance=abs*(error<0?CONFIG.earlyPenaltyMultiplier:1);
      score=Math.round(CONFIG.maxScore-penaltyDistance*CONFIG.penaltyPerPct);
      score=clamp(score,CONFIG.minScore,CONFIG.maxScore);
    }
    return {score,judgement:judgementForScore(score)};
  }
  function cutterForDex(dex){return CUTTER_BY_DEX[Number(dex)]||CUTTERS[0];}
  function createPlayer(species){return {species:{...species},total:0,perfects:0,totalAbsError:0,closestCutPct:null,roundScores:[],roundResults:[]};}
  function shuffledAngles(rng=Math.random){
    const values=ANGLES.slice();
    for(let i=values.length-1;i>0;i--){const j=Math.floor(rand(rng)*(i+1));[values[i],values[j]]=[values[j],values[i]];}
    return values;
  }
  function generateLog({difficulty='normal',roundIndex=0,rng=Math.random,startAt=0,angleDeg=0,objectKind='log'}={}){
    const profile=difficultyProfile(difficulty),round=Math.max(0,Math.min(CONFIG.rounds-1,Math.trunc(Number(roundIndex)||0)));
    const base=profile.durationMinMs+rand(rng)*(profile.durationMaxMs-profile.durationMinMs);
    const durationMs=Math.max(profile.durationMinMs*.82,base*(1-round*.035));
    const targetPct=profile.targetMin+rand(rng)*(profile.targetMax-profile.targetMin);
    const curve=(rand(rng)*2-1)*profile.speedVariation;
    const idealU=clamp(.50+(targetPct-.5)*.44,.34,.66);
    const startedAt=Number(startAt)||0;
    return {roundIndex:round,difficulty:profile.key,targetPct:round3(targetPct),durationMs:round3(durationMs),curve:round3(curve),idealU:round3(idealU),startedAt,idealTimeMs:startedAt+durationMs*idealU,endsAt:startedAt+durationMs,angleDeg:clamp(Number(angleDeg)||0,-36,36),objectKind:String(objectKind||'log')};
  }
  function retimeLog(log,startAt){const start=Number(startAt)||0;log.startedAt=start;log.idealTimeMs=start+log.durationMs*log.idealU;log.endsAt=start+log.durationMs;return log;}
  function motionProgress(log,at){
    const d=Math.max(1,Number(log?.durationMs)||1),u=clamp(((Number(at)||0)-Number(log?.startedAt||0))/d,0,1),curve=Number(log?.curve)||0;
    return clamp(u+curve*Math.sin(Math.PI*u),0,1);
  }
  function cutErrorPctAtTime(log,at){const idealProgress=motionProgress(log,log.idealTimeMs),actual=motionProgress(log,at);return round3((actual-idealProgress)*100);}
  function createMatch({difficulty='normal',playerDex=123,rng=Math.random,nowMs=0}={}){
    const profile=difficultyProfile(difficulty),playerSpecies=cutterForDex(playerDex),angles=shuffledAngles(rng),logs=[];
    for(let i=0;i<CONFIG.rounds;i++)logs.push(generateLog({difficulty:profile.key,roundIndex:i,rng,startAt:nowMs,angleDeg:angles[i],objectKind:'log'}));
    return {difficulty:profile.key,playerDex:playerSpecies.dex,player:createPlayer(playerSpecies),logs,rounds:new Array(CONFIG.rounds).fill(null),currentRoundIndex:-1,activeRound:null,scoredComplete:false,bonusRound:null,finalized:false};
  }
  function startRound(match,index,nowMs=0){
    if(!match||match.finalized||match.scoredComplete)return null;
    const i=clamp(Math.trunc(Number(index)||0),0,CONFIG.rounds-1),log=retimeLog(match.logs[i],nowMs);
    const round={index:i,objectKind:'log',log,resolved:false,playerResult:null,resolvedAt:null,isBonus:false};
    match.rounds[i]=round;match.activeRound=round;match.currentRoundIndex=i;return round;
  }
  function applyResult(player,result){
    player.total+=Number(result.score)||0;player.perfects+=result.score===CONFIG.maxScore?1:0;player.totalAbsError+=Math.abs(Number(result.errorPct)||0);player.closestCutPct=player.closestCutPct==null?Math.abs(Number(result.errorPct)||0):Math.min(player.closestCutPct,Math.abs(Number(result.errorPct)||0));player.roundScores.push(Number(result.score)||0);player.roundResults.push({...result});
  }
  function resultForCut(log,at){const errorPct=cutErrorPctAtTime(log,at),scored=scoreCut(errorPct);return {cutAt:Number(at)||0,errorPct,...scored};}
  function cutPlayer(match,at){
    const round=match?.activeRound;if(!round||round.isBonus)return {accepted:false,reason:'inactive'};if(round.resolved)return {accepted:false,reason:'already-cut'};
    const result=resultForCut(round.log,at);round.playerResult=result;round.resolved=true;round.resolvedAt=Number(at)||0;applyResult(match.player,result);
    if(round.index>=CONFIG.rounds-1)match.scoredComplete=true;
    return {accepted:true,result,round};
  }
  function startBonusRound(match,nowMs=0,rng=Math.random){
    if(!match||match.finalized||!match.scoredComplete)return null;
    const angle=ANGLES[Math.floor(rand(rng)*ANGLES.length)];
    const log=generateLog({difficulty:match.difficulty,roundIndex:CONFIG.rounds-1,rng,startAt:nowMs,angleDeg:angle,objectKind:'mystery-bag'});
    retimeLog(log,nowMs);
    const round={index:CONFIG.rounds,objectKind:'mystery-bag',log,resolved:false,playerResult:null,resolvedAt:null,isBonus:true};
    match.bonusRound=round;match.activeRound=round;match.currentRoundIndex=CONFIG.rounds;return round;
  }
  function cutBonus(match,at){
    const round=match?.activeRound;if(!round?.isBonus)return {accepted:false,reason:'inactive'};if(round.resolved)return {accepted:false,reason:'already-cut'};
    const result=resultForCut(round.log,at);round.playerResult=result;round.resolved=true;round.resolvedAt=Number(at)||0;match.finalized=true;
    return {accepted:true,result,perfect:result.score===CONFIG.maxScore,round};
  }
  function autoMissIfNeeded(match,at){
    const round=match?.activeRound;if(!round||round.resolved||Number(at)<round.log.endsAt)return null;
    return round.isBonus?cutBonus(match,round.log.endsAt):cutPlayer(match,round.log.endsAt);
  }
  function rewardForScore(score,difficulty='normal'){
    const s=clamp(Number(score)||0,0,100),mult=SCORE_REWARD_MULTIPLIERS[difficulty]||SCORE_REWARD_MULTIPLIERS.normal;
    return Math.round(25+s*mult);
  }
  function shiftActiveRound(match,deltaMs){
    const round=match?.activeRound,delta=Number(deltaMs)||0;if(!round||!delta)return round;round.log.startedAt+=delta;round.log.idealTimeMs+=delta;round.log.endsAt+=delta;if(round.resolvedAt!=null)round.resolvedAt+=delta;if(round.playerResult?.cutAt!=null)round.playerResult.cutAt+=delta;return round;
  }

  return {CONFIG,CUTTERS,DIFFICULTIES,ANGLES,SCORE_REWARD_MULTIPLIERS,difficultyProfile,judgementForScore,scoreCut,generateLog,motionProgress,cutErrorPctAtTime,createMatch,startRound,cutPlayer,startBonusRound,cutBonus,autoMissIfNeeded,rewardForScore,shiftActiveRound};
});
