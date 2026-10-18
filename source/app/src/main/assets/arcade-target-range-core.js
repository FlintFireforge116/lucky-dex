(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexTargetRangeCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const COMBO_CAP=3;
  // One rise, not a cap: held focus always comes back down.
  const FOCUS_CAP_MS=1400;
  const ATTACKS=Object.freeze({
    normal:'Swift',fire:'Flamethrower',water:'Water Pulse',electric:'Thunderbolt',grass:'Energy Ball',ice:'Ice Beam',
    fighting:'Aura Sphere',poison:'Sludge Bomb',ground:'Mud Bomb',flying:'Air Slash',psychic:'Psybeam',bug:'Signal Beam',
    rock:'Power Gem',ghost:'Shadow Ball',dragon:'Dragon Pulse',dark:'Dark Pulse',steel:'Flash Cannon',fairy:'Moonblast'
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({id:'easy',roundName:'PRACTICE RANGE',targetCount:8,windMax:.45,motionChance:.18,farChance:.18,popupMs:2500,sway:.45,outerBreaksCombo:false,armorChance:.04,recoveryMs:260}),
    normal:Object.freeze({id:'normal',roundName:'STANDARD RANGE',targetCount:10,windMax:.85,motionChance:.34,farChance:.32,popupMs:2100,sway:.70,outerBreaksCombo:false,armorChance:.10,recoveryMs:300}),
    hard:Object.freeze({id:'hard',roundName:'EXPERT RANGE',targetCount:12,windMax:1.35,motionChance:.52,farChance:.48,popupMs:1750,sway:1,outerBreaksCombo:true,armorChance:.18,recoveryMs:340})
  });
  const DIVISION_BASE=Object.freeze({
    rookie:{windMax:.50,motionChance:.18,farChance:.18,popupMs:2450,sway:.48,outerBreaksCombo:false,armorChance:.05,recoveryMs:280},
    poke:{windMax:.72,motionChance:.28,farChance:.27,popupMs:2250,sway:.60,outerBreaksCombo:false,armorChance:.08,recoveryMs:290},
    great:{windMax:.98,motionChance:.38,farChance:.38,popupMs:2050,sway:.73,outerBreaksCombo:false,armorChance:.12,recoveryMs:305},
    ultra:{windMax:1.22,motionChance:.48,farChance:.50,popupMs:1850,sway:.86,outerBreaksCombo:true,armorChance:.17,recoveryMs:320},
    master:{windMax:1.48,motionChance:.58,farChance:.60,popupMs:1650,sway:1,outerBreaksCombo:true,armorChance:.22,recoveryMs:335}
  });
  const ROUND_NAMES=['MARKSMAN','MOVING RANGE','CHAMPIONSHIP RANGE'];

  function hashSeed(seed){
    if(Number.isFinite(Number(seed)))return (Number(seed)>>>0)||0x6d2b79f5;
    let h=2166136261;for(const ch of String(seed??'target-range')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0||0x6d2b79f5;
  }
  function createSeededRng(seed){let a=hashSeed(seed);return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  function statQuality(spAtk){const curve=(typeof globalThis!=='undefined'&&globalThis.LuckyDexGoldenrodStatCurve)||(typeof require==='function'?require('./arcade-goldenrod-stat-curve.js'):null);return curve?.factor?curve.factor(spAtk):1;}
  function statAssist(spAtk){const f=statQuality(spAtk),normalized=clamp((f-.65)/.63,0,1);return {quality:f,stability:.88+normalized*.18,tolerance:.98+normalized*.04,power:.62+normalized*.54,velocity:.72+normalized*.48,windResistance:.78+normalized*.38};}
  function focusQuality(elapsedMs,profileOrRiseMs=FOCUS_CAP_MS){
    const rise=Math.max(1,Number(profileOrRiseMs?.focusRiseMs||profileOrRiseMs)||FOCUS_CAP_MS);
    return (1-Math.cos(Math.max(0,Number(elapsedMs)||0)/rise*Math.PI))/2;
  }
  function releaseQuality(charge,profile={}){
    const start=clamp(profile.idealStart??.84,.5,.95);
    return Math.min(1,Math.pow(clamp(charge,0,1)/start,1.25));
  }

  function difficultyProfile(id='normal'){
    const p=DIFFICULTIES[id]||DIFFICULTIES.normal,timing={easy:[1600,.76],normal:[1400,.84],hard:[1200,.89]}[p.id];return {...p,focusRiseMs:timing[0],idealStart:timing[1],difficultyId:p.id,mode:'exhibition'};
  }
  function divisionProfile(id='rookie',roundIndex=0){
    const divisionId=Object.prototype.hasOwnProperty.call(DIVISION_BASE,id)?id:'rookie',base=DIVISION_BASE[divisionId],r=clamp(Math.trunc(roundIndex),0,2);
    const timing={rookie:[1600,.76],poke:[1500,.80],great:[1400,.84],ultra:[1300,.87],master:[1200,.90]}[divisionId];
    return {...base,focusRiseMs:timing[0]-r*40,idealStart:timing[1],divisionId,roundIndex:r,roundName:ROUND_NAMES[r],targetCount:9+r,windMax:base.windMax*(1+r*.12),motionChance:clamp(base.motionChance+r*.18,0,.88),farChance:clamp(base.farChance+r*.16,0,.88),popupMs:Math.round(base.popupMs*(1-r*.07)),armorChance:clamp(base.armorChance+r*.05,0,.35),mode:'cup'};
  }

  function projectileSolution({distanceM=20,wind=0,focus=1,spAtk=60}={}){
    const d=clamp(distanceM,5,60),f=clamp(focus,0,1),assist=statAssist(spAtk);
    const stability=assist.stability*(.65+.35*f);
    const travelMs=Math.round((430+d*18)/assist.velocity);
    const drop=(Math.pow(d/50,1.72)*.12)/(stability*assist.velocity);
    const drift=(Number(wind)||0)*(d/50)*.048/(stability*assist.windResistance);
    const sway=(1-f)*.018/stability;
    return {travelMs,drop,drift,sway,impactPower:assist.power*(.62+.38*f),stability};
  }
  function targetPositionAt(target,tMs=0){
    const x=clamp(target?.x??.5,0,1),y=clamp(target?.y??.45,0,1),m=target?.motion||null;if(!m||m.type==='stationary')return {x,y};
    const amp=Number(m.amplitude)||.15,period=Math.max(300,Number(m.periodMs)||1800),phase=Number(m.phase)||0,t=(Number(tMs)||0)/period*Math.PI*2+phase;
    if(m.type==='crossing')return {x:clamp(x+Math.sin(t)*amp,.07,.93),y};
    if(m.type==='swinging')return {x:clamp(x+Math.sin(t)*amp,.07,.93),y:clamp(y+Math.abs(Math.sin(t*.5))*amp*.18,.12,.78)};
    if(m.type==='popup')return {x,y};
    return {x,y};
  }
  function resolveShot({aimX=.5,aimY=.45,firedAtMs=0,distanceM=20,wind=0,focus=1,spAtk=60,target,fieldAspect=1}={}){
    const trajectory=projectileSolution({distanceM,wind,focus,spAtk});
    const impactAtMs=Number(firedAtMs)+trajectory.travelMs;
    const deterministic=Math.sin((Number(firedAtMs)||0)*.017+Number(distanceM)*.31)*trajectory.sway;
    const impactX=clamp(Number(aimX)+trajectory.drift+deterministic,0,1),impactY=clamp(Number(aimY)+(trajectory.drop+deterministic*.35)*clamp(fieldAspect,.25,2),0,1);
    return {impactX,impactY,impactAtMs,trajectory,targetAtImpact:targetPositionAt(target,impactAtMs)};
  }
  function projectileVisualPoint({startX=.18,startY=.72,aimX=.5,aimY=.42,impactX=.5,impactY=.42,progress=0}={}){
    const p=clamp(progress,0,1);
    if(p<=0)return {x:Number(startX),y:Number(startY)};
    if(p>=1)return {x:Number(impactX),y:Number(impactY)};
    const q=1-p,sx=Number(startX),sy=Number(startY),ix=Number(impactX),iy=Number(impactY);
    const controlX=Number(aimX),controlY=Math.min(Number(aimY)-.055,(sy+iy)/2-.035);
    return {x:q*q*sx+2*q*p*controlX+p*p*ix,y:q*q*sy+2*q*p*controlY+p*p*iy};
  }

  function scoreImpact({impactX,impactY,target,targetX,targetY,spAtk=60,focus=1,fieldAspect=1}={}){
    const radius=Math.max(.012,Number(target?.radius)||.07),assist=statAssist(spAtk),effective=radius*assist.tolerance*(.96+.04*clamp(focus,0,1));
    const dx=Number(impactX)-Number(targetX??target?.x??.5),dy=(Number(impactY)-Number(targetY??target?.y??.5))/clamp(fieldAspect,.25,2),ratio=Math.hypot(dx,dy)/effective;
    let ring='miss',points=0;if(ratio<=.18){ring='bullseye';points=10;}else if(ratio<=.42){ring='inner';points=8;}else if(ratio<=.68){ring='middle';points=6;}else if(ratio<=1){ring='outer';points=3;}
    return {ring,points,ratio,distanceFromCenter:Math.hypot(dx,dy)};
  }
  function nextCombo(combo,hit,profileOrDivision='normal'){
    const current=Math.max(1,Number(combo)||1),ring=hit?.ring||'miss';
    if(ring==='miss')return 1;
    const p=typeof profileOrDivision==='object'?profileOrDivision:(DIFFICULTIES[profileOrDivision]||DIVISION_BASE[profileOrDivision]||{});
    if(ring==='outer'&&p.outerBreaksCombo)return 1;
    if(ring==='bullseye')return Math.min(COMBO_CAP,Math.round((current+.25)*100)/100);
    return current;
  }
  function armourBreaks(target,hit,{spAtk=60,focus=1,priorHits=0}={}){
    if(!target?.armored)return hit?.points>0;
    if(hit?.ring==='bullseye')return true;
    if(hit?.points<=0)return false;
    const power=statAssist(spAtk).power*(.62+.38*clamp(focus,0,1));
    return power>=Number(target.armorPower||.88)||Number(priorHits)>=1;
  }

  function chooseDistance(rng,farChance){const r=rng();if(r<farChance)return Math.round(35+rng()*15);if(r<farChance+.38)return Math.round(20+rng()*11);return Math.round(10+rng()*6);}
  function rangeYForDistance(distanceM){const depth=clamp((Number(distanceM)-10)/40,0,1);return .68-depth*.34;}
  function chooseMotion(rng,profile,index){if(index===0||rng()>profile.motionChance)return {type:'stationary'};const choices=profile.roundIndex>=1?['crossing','swinging','popup']:['crossing'];const type=choices[Math.floor(rng()*choices.length)];return {type,amplitude:type==='swinging'?.025+rng()*.025:.035+rng()*.035,periodMs:6500+Math.round(rng()*3500),phase:rng()*Math.PI*2};}
  function createRound({participant=null,profile=null,attackType='normal',seed=1,goldenRate=0}={}){
    const p={...(profile||difficultyProfile('normal'))},rng=createSeededRng(seed),count=Math.max(6,Math.min(14,Math.trunc(p.targetCount||10))),golden=rng()<clamp(goldenRate,0,1)?Math.floor(rng()*count):-1;
    let clock=0;const targets=[];
    for(let i=0;i<count;i++){
      const distanceM=chooseDistance(rng,p.farChance||.25),radius=.105/(1+(distanceM-10)*.035),kind=i===golden?'golden':(rng()<(p.armorChance||0)?'armored':'standard'),motion=chooseMotion(rng,p,i);
      clock+=920+Math.round(rng()*620);
      const sceneY=rangeYForDistance(distanceM);
      targets.push({id:`target-${i+1}`,index:i,kind,golden:i===golden,armored:kind==='armored',armorPower:.84+rng()*.12,distanceM,x:.40+rng()*.20,y:sceneY,radius,motion,appearsAtMs:clock,exposureMs:motion.type==='popup'?Math.max(p.popupMs+1200,3600):Math.max(p.popupMs+1700,4000),wind:Number(((rng()*2-1)*(p.windMax||.8)).toFixed(2)),hits:0});
    }
    return {participant:{...(participant||{})},profile:p,attackType:ATTACKS[attackType]?attackType:'normal',seed:hashSeed(seed),targets,currentIndex:0,score:0,combo:1,bestCombo:1,shots:0,hits:0,bullseyes:0,bullseyeStreak:0,bestBullseyeStreak:0,longestBullseyeM:0,goldenSeen:golden>=0?1:0,goldenWon:0,rareReceipt:null,complete:false,results:[]};
  }
  function applyShot(round,{aimX,aimY,firedAtMs=0,focus=1,fieldAspect=1}={}){
    if(!round||round.complete)return null;const target=round.targets[round.currentIndex];if(!target){round.complete=true;return null;}
    const spAtk=Number(round.participant?.baseStat)||60,shot=resolveShot({aimX,aimY,firedAtMs,distanceM:target.distanceM,wind:target.wind,focus,spAtk,target,fieldAspect}),hit=scoreImpact({impactX:shot.impactX,impactY:shot.impactY,target,targetX:shot.targetAtImpact.x,targetY:shot.targetAtImpact.y,spAtk,focus,fieldAspect}),priorHits=target.hits||0;
    if(hit.points>0)target.hits=priorHits+1;
    const broken=armourBreaks(target,hit,{spAtk,focus,priorHits});
    const multiplier=round.combo,awarded=Math.round(hit.points*multiplier);round.score+=awarded;round.shots++;if(hit.points>0)round.hits++;if(hit.ring==='bullseye'){round.bullseyes++;round.bullseyeStreak=(Number(round.bullseyeStreak)||0)+1;round.bestBullseyeStreak=Math.max(Number(round.bestBullseyeStreak)||0,round.bullseyeStreak);round.longestBullseyeM=Math.max(round.longestBullseyeM,target.distanceM);if(target.golden)round.goldenWon=1;}else round.bullseyeStreak=0;
    round.combo=nextCombo(round.combo,hit,round.profile);round.bestCombo=Math.max(round.bestCombo,round.combo);
    const result={targetId:target.id,hit,broken,awarded,multiplier,shot,distanceM:target.distanceM,golden:!!target.golden,goldenWon:!!(target.golden&&hit.ring==='bullseye')};round.results.push(result);
    if(broken||!target.armored||target.hits>=2||hit.points===0){round.currentIndex++;if(round.currentIndex>=round.targets.length)round.complete=true;}
    return result;
  }
  function roundMetric(round){return Math.max(0,Math.round(Number(round?.score)||0));}

  return Object.freeze({ATTACKS,DIFFICULTIES,DIVISION_BASE,COMBO_CAP,FOCUS_CAP_MS,createSeededRng,statQuality,statAssist,focusQuality,releaseQuality,difficultyProfile,divisionProfile,projectileSolution,targetPositionAt,resolveShot,projectileVisualPoint,rangeYForDistance,scoreImpact,nextCombo,armourBreaks,createRound,applyShot,roundMetric});
});
