(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexPowerTrialCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const round1=n=>Math.round((Number(n)||0)*10)/10;
  function sharedStatFactor(value){
    const curve=(typeof globalThis!=='undefined'&&globalThis.LuckyDexGoldenrodStatCurve)||(typeof require==='function'?require('./arcade-goldenrod-stat-curve.js'):null);
    return curve?.factor?curve.factor(value):1;
  }


  const TARGETS=Object.freeze([
    Object.freeze({id:'rock-small',name:'Loose Rock',threshold:48,visual:'CHIPPED',impactText:'Small rock breaks cleanly',sprite:'adventure/art/objects/strength_boulder.png',spriteScale:5.0,accent:'light'}),
    Object.freeze({id:'rock-mid',name:'Field Stone',threshold:58,visual:'CRACKED',impactText:'Stone splits with a clean hit',sprite:'arcade/dash/gen3/route-rock.png',spriteScale:2.8,accent:'mid'}),
    Object.freeze({id:'rock-heavy',name:'Strength Boulder',threshold:68,visual:'SHIFT',impactText:'Boulder rolls under the force',sprite:'adventure/art/objects/strength_boulder.png',spriteScale:6.6,accent:'heavy'}),
    Object.freeze({id:'rock-dense',name:'Dense Boulder',threshold:78,visual:'SMASH',impactText:'Heavy boulder caves in',sprite:'arcade/dash/gen3/cave-rock.png',spriteScale:3.2,accent:'dense'}),
    Object.freeze({id:'rock-grand',name:'Grand Boulder',threshold:88,visual:'LAUNCH',impactText:'Massive boulder is blasted away',sprite:'adventure/art/objects/strength_boulder.png',spriteScale:8.1,accent:'grand'})
  ]);

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',chargePeakMs:1050,maxChargeMs:2300,impactCycleMs:1500,impactTimeoutMs:3900,thresholdBonus:-4,rewardMultiplier:1.0}),
    normal:Object.freeze({key:'normal',label:'Normal',chargePeakMs:900,maxChargeMs:1900,impactCycleMs:1200,impactTimeoutMs:3100,thresholdBonus:0,rewardMultiplier:1.2}),
    hard:Object.freeze({key:'hard',label:'Hard',chargePeakMs:760,maxChargeMs:1550,impactCycleMs:940,impactTimeoutMs:2350,thresholdBonus:4,rewardMultiplier:1.5})
  });

  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}

  const DIVISION_PROFILES=Object.freeze({
    rookie:Object.freeze({chargePeakMs:1100,maxChargeMs:2400,impactCycleMs:1550,impactTimeoutMs:4100,thresholdBonus:-5}),
    poke:Object.freeze({chargePeakMs:1000,maxChargeMs:2150,impactCycleMs:1380,impactTimeoutMs:3550,thresholdBonus:-2}),
    great:Object.freeze({chargePeakMs:900,maxChargeMs:1900,impactCycleMs:1200,impactTimeoutMs:3100,thresholdBonus:0}),
    ultra:Object.freeze({chargePeakMs:820,maxChargeMs:1700,impactCycleMs:1050,impactTimeoutMs:2650,thresholdBonus:2}),
    master:Object.freeze({chargePeakMs:740,maxChargeMs:1500,impactCycleMs:900,impactTimeoutMs:2250,thresholdBonus:5})
  });
  function divisionProfile(divisionId='rookie',roundIndex=0){
    const id=DIVISION_PROFILES[divisionId]?divisionId:'rookie',base=DIVISION_PROFILES[id],round=Math.max(0,Math.min(2,Math.trunc(Number(roundIndex)||0))),scale=round===1?.96:round===2?.92:1;
    return Object.freeze({key:`division-${id}-${round+1}`,label:id.toUpperCase(),divisionId:id,roundIndex:round,chargePeakMs:Math.round(base.chargePeakMs*scale),maxChargeMs:Math.round(base.maxChargeMs*scale),impactCycleMs:Math.round(base.impactCycleMs*scale),impactTimeoutMs:Math.round(base.impactTimeoutMs*scale),thresholdBonus:base.thresholdBonus+round,rewardMultiplier:1});
  }

  function chargeQuality(elapsedMs,profile=DIFFICULTIES.normal){
    const t=Math.max(0,Number(elapsedMs)||0),peak=Math.max(1,Number(profile.chargePeakMs)||900),max=Math.max(peak+1,Number(profile.maxChargeMs)||1900);
    if(t<=peak)return clamp(t/peak,0,1);
    return clamp(1-(t-peak)/(max-peak),0,1);
  }

  function chargePosition(elapsedMs,profile=DIFFICULTIES.normal){
    const t=Math.max(0,Number(elapsedMs)||0),peak=Math.max(1,Number(profile.chargePeakMs)||900),max=Math.max(peak+1,Number(profile.maxChargeMs)||1900);
    if(t<=peak)return clamp((t/peak)*.5,0,.5);
    return clamp(.5+((t-peak)/(max-peak))*.5,.5,1);
  }

  function impactPosition(elapsedMs,profile=DIFFICULTIES.normal){
    const cycle=Math.max(1,Number(profile.impactCycleMs)||1200);
    return ((Math.max(0,Number(elapsedMs)||0)%cycle)/cycle);
  }

  function impactQuality(elapsedMs,profile=DIFFICULTIES.normal){
    const p=impactPosition(elapsedMs,profile);
    return clamp(1-Math.abs(p-.5)*2,0,1);
  }

  function statQuality(attack){return sharedStatFactor(attack);}

  function strikePower({attack=60,chargeQuality:charge=0,impactQuality:impact=0,difficulty='normal'}={}){
    const cq=clamp(charge,0,1),iq=clamp(impact,0,1),execution=cq*.55+iq*.45,stat=statQuality(attack);
    const ceiling=100*stat;
    const realized=.22+.78*execution;
    const power=round1(ceiling*realized);
    return {power,execution:round1(execution*100),statInfluence:round1(stat*100),chargeQuality:cq,impactQuality:iq,perfect:cq>=.96&&iq>=.96};
  }

  function thresholdFor(index,difficulty='normal',profileOverride=null){
    const target=TARGETS[Math.max(0,Math.min(TARGETS.length-1,Math.trunc(Number(index)||0)))],profile=profileOverride||difficultyProfile(difficulty);
    return target.threshold+profile.thresholdBonus;
  }

  function resolveStrike({index=0,difficulty='normal',profile=null,attack=60,chargeQuality:charge=0,impactQuality:impact=0,golden=false}={}){
    const hit=strikePower({attack,chargeQuality:charge,impactQuality:impact,difficulty});
    const target=TARGETS[Math.max(0,Math.min(TARGETS.length-1,Math.trunc(Number(index)||0)))];
    const threshold=thresholdFor(index,difficulty,profile),cleared=hit.power>=threshold;
    const ratio=threshold>0?hit.power/threshold:0;
    const grade=hit.perfect?'PERFECT':hit.power>=threshold+8?'POWERFUL':cleared?'CLEARED':ratio>=.9?'CLOSE':'MISSED';
    const score=Math.max(0,Math.round(hit.power)+(cleared?10:0)+(golden&&cleared?50:0));
    return {...hit,index:Math.trunc(Number(index)||0),target,threshold,cleared,ratio:round1(ratio),grade,golden:!!golden,score};
  }

  function rollGoldenTarget(rng=Math.random,rate=.02){return clamp(Number((rng||Math.random)())||0,0,.999999)<clamp(rate,0,1);}

  function createRun({difficulty='normal',profile=null,participant=null,rng=Math.random,goldenRate=.02}={}){
    const d=difficultyProfile(difficulty),p=profile?{...profile}:null,golden=rollGoldenTarget(rng,goldenRate),goldenIndex=golden?Math.floor(clamp(Number(rng())||0,0,.999999)*TARGETS.length):-1;
    return {difficulty:d.key,profile:p,participant:participant?{...participant}:null,goldenIndex,strikes:[],score:0,clears:0,perfects:0,bestSingleHit:0,finished:false};
  }

  function applyStrike(run,{chargeQuality:charge=0,impactQuality:impact=0}={}){
    if(!run||run.finished||run.strikes.length>=TARGETS.length)return null;
    const index=run.strikes.length,attack=Number(run.participant?.baseStat)||60,golden=index===run.goldenIndex;
    const out=resolveStrike({index,difficulty:run.difficulty,profile:run.profile,attack,chargeQuality:charge,impactQuality:impact,golden});
    run.strikes.push(out);
    run.score+=out.score;
    run.clears+=out.cleared?1:0;
    run.perfects+=out.perfect?1:0;
    run.bestSingleHit=Math.max(run.bestSingleHit,out.power);
    if(run.strikes.length>=TARGETS.length)run.finished=true;
    return out;
  }

  function rewardForRun(run){
    const d=difficultyProfile(run?.difficulty),score=Math.max(0,Number(run?.score)||0),clears=Math.max(0,Number(run?.clears)||0),full=clears>=TARGETS.length;
    return Math.max(20,Math.round((25+clears*18+score*.10+(full?40:0))*d.rewardMultiplier));
  }

  return Object.freeze({TARGETS,DIFFICULTIES,DIVISION_PROFILES,difficultyProfile,divisionProfile,chargeQuality,chargePosition,impactPosition,impactQuality,statQuality,strikePower,thresholdFor,resolveStrike,rollGoldenTarget,createRun,applyStrike,rewardForRun});
});
