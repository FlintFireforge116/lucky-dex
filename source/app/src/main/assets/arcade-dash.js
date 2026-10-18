(function(root){

  'use strict';

  const config=root.LuckyDexDashConfig||(typeof require==='function'?require('./arcade-dash-config.js'):null);

  const leagueApi=root.LuckyDexDashLeague||(typeof require==='function'?require('./arcade-dash-league.js'):null);

  const courseApi=root.LuckyDexDashCourse||(typeof require==='function'?require('./arcade-dash-course.js'):null);

  const statCurve=root.LuckyDexGoldenrodStatCurve||(typeof require==='function'?require('./arcade-goldenrod-stat-curve.js'):null);

  const CONSTANTS={

    BASE_PACE:78,

    MIN_RAW_SPEED:10,

    MAX_RAW_SPEED:180,

    MIN_PACE_MOD:0.80,

    MAX_PACE_MOD:1.20,

    MAX_LEVEL_BONUS:0.04,

    STAMINA_MAX:100,

    SPRINT_DRAIN:30,

    STAMINA_REGEN:26,

    RECOVERY_DELAY:0.38,

    SPRINT_REARM:24,

    SPRINT_MULTIPLIER:1.26,

    BOOST_MULTIPLIER:1.18,

    BOOST_DURATION:1.15,

    ROCK_FACTOR:0.82,

    ROCK_DURATION:0.75,

    MUD_FACTOR:0.68,

    MUD_DURATION:1.0,

    STAMINA_PICKUP:34,

    LANE_SPEED:5.2,

    PLAYER_STEER_SPEED:7.2,

    MAX_FRAME_DT:0.05,

    AI_LOOKAHEAD:120,

    TOP_DOWN_DISTANCE_SCALE:3.05,

    IMPACT_DURATION:0.28,

    BODY_BUMP_DURATION:0.20,

    CONTACT_SLOW_DURATION:0.16,

    CONTACT_FACTOR:0.94,

    CONTACT_COOLDOWN:0.30,

    RACER_CONTACT_DISTANCE:9,

    RACER_CONTACT_LANE:0.26,

    CONTACT_LANE_NUDGE:0.08,

    ROCK_KNOCKBACK:6

  };

  const REWARDS=[0,120,80,55,35,25,20];

  function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0));}

  function paceModifier(rawSpeed){return statCurve?.factor?statCurve.factor(rawSpeed):1;}

  function accelerationModifier(rawSpeed){const f=paceModifier(rawSpeed);return clamp(.72+(f-.65)*.90,.72,1.29);}

  function levelModifier(level){const l=clamp(level,1,50);return ((l-1)/49)*CONSTANTS.MAX_LEVEL_BONUS;}

  function stepStamina(src,sprinting,dt){

    const out={stamina:clamp(src?.stamina??CONSTANTS.STAMINA_MAX,0,CONSTANTS.STAMINA_MAX),recoveryDelay:Math.max(0,Number(src?.recoveryDelay)||0),sprintExhausted:!!src?.sprintExhausted};

    const t=Math.max(0,Number(dt)||0);
    if(out.sprintExhausted&&out.stamina>=CONSTANTS.SPRINT_REARM)out.sprintExhausted=false;
    const canSprint=!!sprinting&&!out.sprintExhausted&&out.stamina>0;

    if(canSprint){out.stamina=clamp(out.stamina-CONSTANTS.SPRINT_DRAIN*t,0,CONSTANTS.STAMINA_MAX);out.recoveryDelay=CONSTANTS.RECOVERY_DELAY;if(out.stamina<=0)out.sprintExhausted=true;}

    else if(out.recoveryDelay>0){const wait=Math.min(out.recoveryDelay,t);out.recoveryDelay=Math.max(0,out.recoveryDelay-wait);const regenTime=Math.max(0,t-wait);if(regenTime>0)out.stamina=clamp(out.stamina+CONSTANTS.STAMINA_REGEN*regenTime,0,CONSTANTS.STAMINA_MAX);}

    else out.stamina=clamp(out.stamina+CONSTANTS.STAMINA_REGEN*t,0,CONSTANTS.STAMINA_MAX);

    if(out.sprintExhausted&&out.stamina>=CONSTANTS.SPRINT_REARM)out.sprintExhausted=false;
    return out;

  }

  function tickEffects(racer,dt){

    const t=Math.max(0,Number(dt)||0);

    racer.slowTimer=Math.max(0,Number(racer.slowTimer||0)-t);

    racer.boostTimer=Math.max(0,Number(racer.boostTimer||0)-t);

    racer.impactTimer=Math.max(0,Number(racer.impactTimer||0)-t);

    racer.bodyBumpTimer=Math.max(0,Number(racer.bodyBumpTimer||0)-t);

    racer.contactSlowTimer=Math.max(0,Number(racer.contactSlowTimer||0)-t);

    racer.contactCooldown=Math.max(0,Number(racer.contactCooldown||0)-t);

    racer.boostFlashTimer=Math.max(0,Number(racer.boostFlashTimer||0)-t);

    racer.pickupFlashTimer=Math.max(0,Number(racer.pickupFlashTimer||0)-t);

    if(racer.slowTimer<=0)racer.slowFactor=1;

    if(racer.impactTimer<=0)racer.impactKind=null;

    return racer;

  }

  function applyCourseObject(racer,obj){

    if(!racer||!obj)return racer;

    const effect=obj.effect;

    if(effect==='rock'){racer.slowFactor=Math.min(Number(racer.slowFactor)||1,CONSTANTS.ROCK_FACTOR);racer.slowTimer=Math.max(Number(racer.slowTimer)||0,CONSTANTS.ROCK_DURATION);racer.impactTimer=CONSTANTS.IMPACT_DURATION;racer.impactKind='rock';}

    else if(effect==='mud'){racer.slowFactor=Math.min(Number(racer.slowFactor)||1,CONSTANTS.MUD_FACTOR);racer.slowTimer=Math.max(Number(racer.slowTimer)||0,CONSTANTS.MUD_DURATION);racer.impactTimer=Math.max(Number(racer.impactTimer)||0,0.16);racer.impactKind='mud';}

    else if(effect==='speed-pad'){racer.boostTimer=Math.max(Number(racer.boostTimer)||0,CONSTANTS.BOOST_DURATION);racer.boostFlashTimer=0.34;}

    else if(effect==='stamina-pickup'){racer.stamina=clamp((Number(racer.stamina)||0)+CONSTANTS.STAMINA_PICKUP,0,CONSTANTS.STAMINA_MAX);racer.pickupFlashTimer=0.42;}

    return racer;

  }

  function clampLane(lane){return Math.round(clamp(lane,0,2));}

  function rankRacers(rows){return [...(rows||[])].sort((a,b)=>{

    const af=!!a.finished,bf=!!b.finished;

    if(af!==bf)return af?-1:1;

    if(af&&bf){const at=Number(a.finishTimeMs)||Infinity,bt=Number(b.finishTimeMs)||Infinity;if(at!==bt)return at-bt;}

    const diff=(Number(b.distance)||0)-(Number(a.distance)||0);if(Math.abs(diff)>1e-9)return diff;

    return (Number(a.index)||0)-(Number(b.index)||0);

  });}

  function rewardForPlace(place){return REWARDS[Math.round(Number(place)||0)]||0;}

  function randomStep(state){let x=(Number(state.rngState)||1)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;state.rngState=x>>>0;return state.rngState/4294967296;}

  function difficultyProfile(key){const src=config?.DIFFICULTIES?.[key]?.ai||config?.DIFFICULTIES?.normal?.ai||{reaction:0.45,avoidance:0.70,boostSeeking:0.50,sprintAggression:0.56,mistake:0.15,conserveAt:24};return {...src};}

  function makeRacer(entry,index,isPlayer=false,difficulty='normal',aiProfile=null){return {...entry,index,isPlayer,lane:isPlayer?1:([0,2,0,2,1][index-1]),laneVisual:isPlayer?1:([0,2,0,2,1][index-1]),targetLane:isPlayer?1:([0,2,0,2,1][index-1]),distance:0,stamina:CONSTANTS.STAMINA_MAX,recoveryDelay:0,sprintExhausted:false,slowFactor:1,slowTimer:0,boostTimer:0,boostFlashTimer:0,pickupFlashTimer:0,impactTimer:0,impactKind:null,bodyBumpTimer:0,contactSlowTimer:0,contactCooldown:0,contactSide:0,currentPace:0,sprinting:false,finished:false,finishTimeMs:null,hitObjects:new Set(),ai:isPlayer?null:{...(aiProfile||difficultyProfile(difficulty))},aiDecisionIn:0};}

  function createRaceState(player,aiRacers=[],options={}){

    const seed=(Number(options.seed)||Date.now())>>>0||1,difficulty=config?.DIFFICULTIES?.[options.difficulty]?options.difficulty:'normal';

    const mode=options.mode==='league'?'league':options.mode==='goldenrod'?'goldenrod':'quick',theme=String(options.theme||(mode==='league'?options.type:'normal')||'normal').toLowerCase();

    const course=options.course||courseApi.generateCourse(seed,{theme});

    const racers=[makeRacer(player,0,true,difficulty),...aiRacers.slice(0,5).map((r,i)=>makeRacer(r,i+1,false,difficulty,options.aiProfile))];

    if(racers.length<6){const fallback=aiPool(player,seed,{difficulty,type:mode==='league'?theme:null});if(!fallback.length)throw new Error('No eligible AI racers for this course');while(racers.length<6){const i=racers.length;racers.push(makeRacer({...fallback[(i-1)%fallback.length],key:`ai-fallback:${i}`},i,false,difficulty,options.aiProfile));}}

    return {seed,rngState:seed,phase:'racing',elapsedMs:0,course,finishDistance:Number(course.finishDistance)||courseApi.FINISH_DISTANCE,racers,completed:false,completionHandled:false,difficulty,mode,theme,lastPlayerPlace:1,positionSignal:null,finalStretch:false,finalStretchSignalUntil:0};

  }

  function safeLaneFor(course,distance,currentLane){

    const nearby=courseApi.objectsNear(course,distance,CONSTANTS.AI_LOOKAHEAD).filter(o=>o.distance>distance+8);

    const firstDistance=nearby.length?Math.min(...nearby.map(o=>o.distance)):Infinity;

    const cluster=nearby.filter(o=>Math.abs(o.distance-firstDistance)<2);

    const hazard=new Set(cluster.filter(o=>courseApi.isHazard(o.effect)).map(o=>o.lane));

    const beneficial=cluster.find(o=>!courseApi.isHazard(o.effect));

    if(!hazard.has(currentLane))return {lane:currentLane,beneficial};

    const choices=[0,1,2].filter(l=>!hazard.has(l));

    return {lane:choices.sort((a,b)=>Math.abs(a-currentLane)-Math.abs(b-currentLane))[0]??currentLane,beneficial};

  }

  function aiControls(state,racer,dt){

    racer.aiDecisionIn=Math.max(0,(Number(racer.aiDecisionIn)||0)-dt);

    if(racer.aiDecisionIn<=0){

      const p=racer.ai||difficultyProfile(state.difficulty),safe=safeLaneFor(state.course,racer.distance,racer.targetLane);

      const mistake=randomStep(state)<p.mistake;

      if(!mistake&&randomStep(state)<p.avoidance)racer.targetLane=clampLane(safe.lane);

      if(!mistake&&safe.beneficial&&randomStep(state)<p.boostSeeking)racer.targetLane=clampLane(safe.beneficial.lane);

      racer.aiDecisionIn=Math.max(0.14,p.reaction*(0.72+randomStep(state)*0.65));

    }

    const p=racer.ai||difficultyProfile(state.difficulty);

    const sprint=racer.stamina>p.conserveAt&&randomStep(state)<p.sprintAggression;

    return {sprint,targetLane:racer.targetLane};

  }

  function moveLane(racer,targetLane,dt){

    racer.targetLane=clampLane(targetLane);

    const delta=racer.targetLane-racer.laneVisual,step=CONSTANTS.LANE_SPEED*dt;

    racer.laneVisual+=Math.sign(delta)*Math.min(Math.abs(delta),step);

    racer.lane=clampLane(racer.laneVisual);

  }

  function objectFootprint(obj){const key=obj.assetKey||({rock:'route-rock',mud:'grass-patch','speed-pad':'mossdeep-pad','stamina-pickup':'oran-berry'})[obj.effect],d=assets.descriptor(key);if(!d)return {laneReach:.34,distanceReach:4,centerDistance:Number(obj.distance)||0};const f=d.footprint||[0,0,...d.nativeSize],repeat=['mud','speed-pad'].includes(obj.effect)&&d.kind!=='patch'?2:1,pixel=renderer.PIXEL_SCALE,laneReach=clamp((f[2]*pixel*repeat/2+15)/(540*.22),.22,.60),offset=(d.nativeSize[1]-f[1]-f[3]/2)*pixel/renderer.WORLD_SCALE;return {laneReach,distanceReach:Math.max(2,(f[3]*pixel/2+6)/renderer.WORLD_SCALE),centerDistance:(Number(obj.distance)||0)+offset};}

  function interactCourse(racer,state,fromDistance,toDistance){

    for(const obj of state.course.objects||[]){

      const footprint=objectFootprint(obj),reach=footprint.distanceReach;

      if(footprint.centerDistance<fromDistance-reach||footprint.centerDistance>toDistance+reach)continue;

      if(racer.hitObjects.has(obj.id))continue;
      if(obj.effect==='stamina-pickup'&&obj.consumed)continue;

      const laneReach=footprint.laneReach;

      if(Math.abs(Number(racer.laneVisual)-Number(obj.lane))>laneReach)continue;

      racer.hitObjects.add(obj.id);applyCourseObject(racer,obj);if(obj.effect==='stamina-pickup')obj.consumed=true;if(obj.effect==='rock')racer.distance=Math.max(0,Number(racer.distance)-CONSTANTS.ROCK_KNOCKBACK);

    }

  }

  function stepOneRacer(state,racer,dt,controls){

    if(racer.finished)return;

    tickEffects(racer,dt);const section=courseApi.sectionAt?.(state.course,racer.distance),steerFactor=clamp(section?.steerFactor??1,.65,1.20);if(racer.isPlayer&&controls.steer!=null){racer.steering=clamp(controls.steer,-1,1);racer.laneVisual=clamp(racer.laneVisual+racer.steering*CONSTANTS.PLAYER_STEER_SPEED*steerFactor*dt,0,2);racer.targetLane=racer.laneVisual;racer.lane=clampLane(racer.laneVisual);}else moveLane(racer,controls.targetLane,dt);

    const requestedSprint=!!controls.sprint;

    const st=stepStamina(racer,requestedSprint,dt);racer.stamina=st.stamina;racer.recoveryDelay=st.recoveryDelay;racer.sprintExhausted=st.sprintExhausted;

    const sprinting=requestedSprint&&!racer.sprintExhausted&&racer.stamina>0;racer.sprinting=sprinting;

    const base=CONSTANTS.BASE_PACE*paceModifier(racer.baseSpeed)*(1+levelModifier(racer.level));

    const contact=racer.contactSlowTimer>0?CONSTANTS.CONTACT_FACTOR:1;

    const targetPace=base*(Number(racer.slowFactor)||1)*contact*(racer.boostTimer>0?CONSTANTS.BOOST_MULTIPLIER:1)*(sprinting?CONSTANTS.SPRINT_MULTIPLIER:1);

    const accel=Math.max(35,CONSTANTS.BASE_PACE*3.4*accelerationModifier(racer.baseSpeed));
    const current=Number(racer.currentPace)||Math.min(targetPace,base*.58);
    racer.currentPace=current+Math.sign(targetPace-current)*Math.min(Math.abs(targetPace-current),accel*dt);
    const pace=racer.currentPace;

    const from=racer.distance,to=from+pace*dt;racer.distance=to;interactCourse(racer,state,from,to);

    if(racer.distance>=state.finishDistance){racer.distance=state.finishDistance;racer.finished=true;racer.finishTimeMs=state.elapsedMs;}

  }

  function resolveRacerContacts(state){

    const rows=state?.racers||[];let contacts=0;

    for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){

      const a=rows[i],b=rows[j];if(a.finished||b.finished)continue;if((a.contactCooldown||0)>0||(b.contactCooldown||0)>0)continue;

      if(Math.abs(Number(a.distance)-Number(b.distance))>CONSTANTS.RACER_CONTACT_DISTANCE)continue;

      if(Math.abs(Number(a.laneVisual)-Number(b.laneVisual))>CONSTANTS.RACER_CONTACT_LANE)continue;

      const side=(Number(a.laneVisual)<=Number(b.laneVisual))?-1:1;

      for(const [r,s] of [[a,side],[b,-side]]){r.laneVisual=clamp(Number(r.laneVisual)+s*CONSTANTS.CONTACT_LANE_NUDGE,0,2);r.bodyBumpTimer=CONSTANTS.BODY_BUMP_DURATION;r.contactSlowTimer=CONSTANTS.CONTACT_SLOW_DURATION;r.contactCooldown=CONSTANTS.CONTACT_COOLDOWN;r.contactSide=s;}

      contacts++;

    }

    return contacts;

  }

  function stepRace(state,dt,playerControls={}){

    if(!state||state.phase!=='racing'||state.completed)return {dt:0};

    const usedDt=clamp(dt,0,CONSTANTS.MAX_FRAME_DT);if(usedDt<=0)return {dt:0};

    state.elapsedMs+=usedDt*1000;

    for(const racer of state.racers){const controls=racer.isPlayer?{sprint:!!playerControls.sprint,steer:playerControls.steer,targetLane:clampLane(playerControls.targetLane??racer.targetLane)}:aiControls(state,racer,usedDt);stepOneRacer(state,racer,usedDt,controls);}

    resolveRacerContacts(state);

    const player=state.racers[0],ranked=rankRacers(state.racers),place=Math.max(1,ranked.indexOf(player)+1);
    if(Number(state.lastPlayerPlace||place)!==place)state.positionSignal={from:Number(state.lastPlayerPlace||place),to:place,untilMs:state.elapsedMs+900};
    state.lastPlayerPlace=place;
    if(!state.finalStretch&&player&&!player.finished&&player.distance>=state.finishDistance*.85){state.finalStretch=true;state.finalStretchSignalUntil=state.elapsedMs+1250;}
    if(player?.finished)state.completed=true;

    return {dt:usedDt,completed:state.completed,ranked,positionSignal:state.positionSignal,finalStretch:state.finalStretch};

  }

  function finishRaceOnce(race,fn){if(!race||race.completionHandled)return false;race.completionHandled=true;if(typeof fn==='function')fn();return true;}

  function ordinal(n){const v=Math.round(Number(n)||0);const mod100=v%100;if(mod100>=11&&mod100<=13)return `${v}th`;return `${v}${v%10===1?'st':v%10===2?'nd':v%10===3?'rd':'th'}`;}

  function formatTime(ms){const total=Math.max(0,Number(ms)||0);const seconds=total/1000;return `${seconds.toFixed(2)}s`;}

  function pauseRaceState(race){if(!race||!['countdown','racing'].includes(race.phase))return false;race.phaseBeforePause=race.phase;race.phase='paused';race.lastFrameMs=null;return true;}

  function resumeRaceState(race){if(!race||race.phase!=='paused')return false;race.phase=race.phaseBeforePause||'racing';race.phaseBeforePause=null;race.lastFrameMs=null;return true;}

  function abandonRace(race){if(!race||race.phase==='finished')return false;race.phase='abandoned';race.completed=false;race.lastFrameMs=null;return true;}

  function ensureDashRecord(state,platform){

    state.arcade=platform?.ensureArcadeState?platform.ensureArcadeState(state.arcade):(state.arcade||{});

    const old=state.arcade.dash||{};

    state.arcade.dash={lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null,lastQuickRacerKey:null,lastLeagueRacerKey:null,quickBestTimes:{easy:null,normal:null,hard:null,expert:null},leagueRecords:{},...old,quickBestTimes:{easy:null,normal:null,hard:null,expert:null,...(old.quickBestTimes||{})},leagueRecords:{...(old.leagueRecords||{})}};

    return state.arcade.dash;

  }

  function raceResults(race){

    const ranked=rankRacers(race?.racers||[]),finish=Math.max(1,Number(race?.finishDistance)||courseApi.FINISH_DISTANCE),elapsed=Math.max(0,Number(race?.elapsedMs)||0);

    return ranked.map((r,i)=>{const remaining=Math.max(0,finish-(Number(r.distance)||0)),base=CONSTANTS.BASE_PACE*paceModifier(r.baseSpeed)*(1+levelModifier(r.level)),estimate=elapsed+(remaining/Math.max(1,base))*1000;return {key:String(r.key),place:i+1,timeMs:Math.round(r.finished&&Number.isFinite(Number(r.finishTimeMs))?Number(r.finishTimeMs):estimate)};});

  }

  function applyCareerResult(dash,player,place,timeMs,mode){

    const time=Math.max(0,Math.round(Number(timeMs)||0));dash.races=Math.max(0,Number(dash.races)||0)+1;if(place===1)dash.wins=Math.max(0,Number(dash.wins)||0)+1;if(place<=3)dash.podiums=Math.max(0,Number(dash.podiums)||0)+1;const previous=Number(dash.bestTimeMs)||null;if(!previous||time<previous)dash.bestTimeMs=time;

    if(mode==='league')dash.lastLeagueRacerKey=player?.key||dash.lastLeagueRacerKey||null;else{dash.lastQuickRacerKey=player?.key||dash.lastQuickRacerKey||null;dash.lastRacerKey=player?.key||dash.lastRacerKey||null;}

    return {timeMs:time,newBest:!previous||time<previous};

  }

  function updateLeagueRecord(dash,type,difficulty,{trophy=null,points=0,totalTimeMs=0}={}){

    if(!dash.leagueRecords||typeof dash.leagueRecords!=='object')dash.leagueRecords={};if(!dash.leagueRecords[type]||typeof dash.leagueRecords[type]!=='object')dash.leagueRecords[type]={};

    const old=dash.leagueRecords[type][difficulty]||{trophy:null,bestPoints:null,bestTotalTimeMs:null},rank={null:0,bronze:1,silver:2,gold:3};

    const nextTrophy=(rank[trophy]||0)>(rank[old.trophy]||0)?trophy:(old.trophy||trophy||null),score=Math.max(0,Number(points)||0),time=Math.max(0,Math.round(Number(totalTimeMs)||0));

    let bestPoints=old.bestPoints==null?score:Number(old.bestPoints),bestTotalTimeMs=old.bestTotalTimeMs==null?time:Number(old.bestTotalTimeMs);

    if(score>bestPoints){bestPoints=score;bestTotalTimeMs=time;}else if(score===bestPoints&&time>0&&(!bestTotalTimeMs||time<bestTotalTimeMs))bestTotalTimeMs=time;

    const rec={trophy:nextTrophy,bestPoints,bestTotalTimeMs};dash.leagueRecords[type][difficulty]=rec;return rec;

  }

  function finalizeQuickRace(race,options={}){

    if(!race||race.phase==='abandoned'||!race.completed||!race.racers?.[0]?.finished)return false;

    return finishRaceOnce(race,()=>{

      const results=raceResults(race),player=race.racers[0],playerResult=results.find(r=>r.key===String(player.key))||results[0],place=playerResult.place,difficulty=config.DIFFICULTIES[race.difficulty]?race.difficulty:'normal',coins=config.quickReward(place,difficulty);

      const state=root.state||globalThis.state||{},platform=root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform,dash=ensureDashRecord(state,platform),career=applyCareerResult(dash,player,place,playerResult.timeMs,'quick');

      const oldQuick=Number(dash.quickBestTimes[difficulty])||null,quickNewBest=!oldQuick||career.timeMs<oldQuick;if(quickNewBest)dash.quickBestTimes[difficulty]=career.timeMs;

      const award=platform?.awardRun?platform.awardRun({gameId:'dash',label:'Pokémon Dash',score:Math.max(0,7-place),coins,dailyEligible:false}):{coinsAwarded:coins,itemAwarded:null};

      const saveFn=root.save||globalThis.save;if(typeof saveFn==='function')saveFn();race.phase='finished';race.result={place,timeMs:career.timeMs,coinsAwarded:award.coinsAwarded,newBest:career.newBest,difficulty,mode:'quick'};

      const session=root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession,leaderTime=results[0]?.timeMs||career.timeMs;
      const review={title:'RACE COMPLETE',mode:'Quick Race',difficulty:config.DIFFICULTIES[difficulty].label,metricLabel:'PLACE',metricValue:ordinal(place),scoreboard:results.map(row=>{const racer=race.racers.find(r=>String(r.key)===String(row.key))||{};return {rank:ordinal(row.place),label:`${racer.shiny?'★ ':''}${racer.name||row.key}`,value:formatTime(row.timeMs),subtitle:`Lv.${racer.level||'?'} · Speed ${racer.baseSpeed||'?'}`,player:String(row.key)===String(player.key)};}),stats:[{label:'Your Time',value:formatTime(career.timeMs)},{label:'Gap to Winner',value:place===1?'WINNER':`+${formatTime(Math.max(0,career.timeMs-leaderTime))}`},{label:'Racer',value:`${player.shiny?'★ ':''}${player.name}`},{label:'Speed',value:String(player.baseSpeed)}],pbs:[{label:`${config.DIFFICULTIES[difficulty].label} Best`,value:formatTime(dash.quickBestTimes[difficulty]||career.timeMs),isNew:quickNewBest}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};
      if(session?.showResult&&options.showResult!==false)session.showResult('dash',{title:'RACE COMPLETE',metricLabel:'PLACE',metricValue:ordinal(place),coinsAwarded:award.coinsAwarded,itemAwarded:award.itemAwarded,bestText:quickNewBest?'NEW BEST TIME':'',details:[{title:`${player.shiny?'★ ':''}${player.name}`,subtitle:`Lv.${player.level} · Speed ${player.baseSpeed} · ${config.DIFFICULTIES[difficulty].label}`,kind:'racer'},{title:formatTime(career.timeMs),subtitle:`${ordinal(place)} of 6`,kind:'time'}],review,replayLabel:'RACE AGAIN',changeLabel:'CHANGE RACER',onReplay:options.onReplay,onChange:options.onChange,onBack:options.onBack});

    });

  }

  function finalizeRace(race,options={}){return finalizeQuickRace(race,options);}

  function completeLeagueRace(race,cup,options={}){

    if(!cup||cup.raceIndex>=3||cup.completionHandled||!race||race.phase==='abandoned'||!race.completed||!race.racers?.[0]?.finished||race.completionHandled)return {accepted:false,final:!!cup?.completionHandled};

    let outcome={accepted:false,final:false};finishRaceOnce(race,()=>{

      const results=raceResults(race),player=race.racers[0],playerResult=results.find(r=>r.key===String(player.key))||results[0],state=root.state||globalThis.state||{},platform=root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform,dash=ensureDashRecord(state,platform);

      applyCareerResult(dash,player,playerResult.place,playerResult.timeMs,'league');leagueApi.recordRace(cup,results);race.phase='finished';race.result={place:playerResult.place,timeMs:playerResult.timeMs,coinsAwarded:0,mode:'league',raceIndex:cup.raceIndex};

      const standingRows=leagueApi.standings(cup);outcome={accepted:true,final:cup.raceIndex>=3,standings:standingRows,coinsAwarded:0,trophy:null,overallPlace:null};

      if(cup.raceIndex>=3){const playerStanding=standingRows.find(r=>String(r.key)===String(cup.playerKey)),overallPlace=playerStanding?.overallPlace||6,trophy=leagueApi.trophyForPlace(overallPlace),coins=config.leagueReward(overallPlace,cup.difficulty);leagueApi.finishCupOnce(cup,()=>{const award=platform?.awardRun?platform.awardRun({gameId:'dash',label:`${titleType(cup.type)} League`,score:Math.max(0,7-overallPlace),coins,dailyEligible:false}):{coinsAwarded:coins,itemAwarded:null};const previous=dash.leagueRecords?.[cup.type]?.[cup.difficulty]||null,record=updateLeagueRecord(dash,cup.type,cup.difficulty,{trophy,points:playerStanding?.points||0,totalTimeMs:playerStanding?.totalTimeMs||0}),session=root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;outcome.coinsAwarded=award.coinsAwarded;outcome.trophy=trophy;outcome.overallPlace=overallPlace;const review={title:'CUP COMPLETE',mode:`${titleType(cup.type)} League`,difficulty:config.DIFFICULTIES[cup.difficulty].label,metricLabel:'PLACE',metricValue:ordinal(overallPlace),scoreboard:standingRows.map(row=>({rank:ordinal(row.overallPlace),label:row.name||row.key,value:`${row.points} PTS`,subtitle:formatTime(row.totalTimeMs),player:String(row.key)===String(cup.playerKey)})),stats:[{label:'Trophy',value:trophy?titleType(trophy):'—'},{label:'Points',value:String(playerStanding?.points||0)},{label:'Total Time',value:formatTime(playerStanding?.totalTimeMs||0)}],pbs:[{label:'League Best',value:`${record.bestPoints||0} PTS · ${formatTime(record.bestTotalTimeMs||0)}`,isNew:!previous||Number(playerStanding?.points||0)>Number(previous.bestPoints||0)||(Number(playerStanding?.points||0)===Number(previous.bestPoints||0)&&Number(playerStanding?.totalTimeMs||0)>0&&Number(playerStanding?.totalTimeMs||0)<Number(previous.bestTotalTimeMs||Infinity))}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};if(session?.showResult&&options.showResult!==false)session.showResult('dash',{title:'CUP COMPLETE',metricLabel:'PLACE',metricValue:ordinal(overallPlace),coinsAwarded:award.coinsAwarded,itemAwarded:award.itemAwarded,review,replayLabel:'NEW CUP',onReplay:options.onReplay,onBack:options.onBack});});}

      const saveFn=root.save||globalThis.save;if(typeof saveFn==='function')saveFn();race.leagueOutcome=outcome;

    });return outcome;

  }





  let opened=false,activeRace=null,activeCup=null,goldenrodRound=null,rafId=0,selectedKey=null,pickerRows=[],allPickerRows=[],cleanupFns=[];

  let currentMode='quick',currentDifficulty='normal',currentLeagueType=null,standingsAction=null;

  const input={sprint:false,targetLane:1,pointerSprint:false,pointerDir:0,sprintPointer:null,steerPointer:null,keys:new Set()};
  function resetInput(){input.sprint=false;input.pointerSprint=false;input.pointerDir=0;input.sprintPointer=null;input.steerPointer=null;input.keys.clear();}
  function heldSteer(){return input.pointerDir||Number(input.keys.has('ArrowRight'))-Number(input.keys.has('ArrowLeft'));}
  function heldSprint(){return input.pointerSprint||input.keys.has(' ')||input.keys.has('Shift');}
  let homeParent=null,homeNext=null;
  function mountViewport(){const game=el('dashGame');if(game&&game.parentNode!==document.body){homeParent=game.parentNode;homeNext=game.nextSibling;document.body.appendChild(game);}sizeViewport();}
  function restoreViewport(){const game=el('dashGame');if(game&&homeParent){homeParent.insertBefore(game,homeNext?.parentNode===homeParent?homeNext:null);homeParent=null;homeNext=null;}}
  function sizeViewport(){const game=el('dashGame'),v=root.visualViewport;if(game){game.style.setProperty('--dash-viewport-height',Math.round(v?.height||root.innerHeight||720)+'px');game.style.setProperty('--dash-viewport-top',Math.round(v?.offsetTop||0)+'px');}}

  const assets=root.LuckyDexDashAssets||(typeof require==='function'?require('./arcade-dash-assets.js'):null);

  const renderer=root.LuckyDexDashRenderer||(typeof require==='function'?require('./arcade-dash-renderer.js'):null);

  let loadingToken=0;

  function el(id){return typeof document!=='undefined'?document.getElementById(id):null;}

  function platform(){return root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;}

  function stateRef(){return root.state||globalThis.state||null;}

  function saveState(){const fn=root.save||globalThis.save;if(typeof fn==='function')fn();}

  function listen(target,type,fn,options){if(!target?.addEventListener)return;target.addEventListener(type,fn,options);cleanupFns.push(()=>target.removeEventListener(type,fn,options));}

  function cancelFrame(){if(rafId&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(rafId);rafId=0;}

  function queueFrame(){cancelFrame();if(opened&&activeRace&&['countdown','racing'].includes(activeRace.phase)&&typeof requestAnimationFrame==='function')rafId=requestAnimationFrame(frame);}

  function setHidden(id,hidden){const node=el(id);if(node)node.hidden=!!hidden;}

  function setText(id,text){const node=el(id);if(node)node.textContent=String(text??'');}

  function showOnly(id){for(const view of ['dashModeView','dashLeagueView','dashDifficultyView','dashPickerView','dashStandingsView','dashRaceView'])setHidden(view,view!==id);}

  function dashState(){const s=stateRef(),p=platform();if(!s)return null;s.arcade=p?.ensureArcadeState?p.ensureArcadeState(s.arcade):(s.arcade||{});const old=s.arcade.dash||{};s.arcade.dash={lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null,lastQuickRacerKey:null,lastLeagueRacerKey:null,quickBestTimes:{easy:null,normal:null,hard:null,expert:null},leagueRecords:{},...old,quickBestTimes:{easy:null,normal:null,hard:null,expert:null,...(old.quickBestTimes||{})},leagueRecords:{...(old.leagueRecords||{})}};return s.arcade.dash;}

  function setLastRacer(key){const ds=dashState();if(!ds)return;if(currentMode==='league')ds.lastLeagueRacerKey=key||null;else{ds.lastQuickRacerKey=key||null;ds.lastRacerKey=key||null;}saveState();}

  function clearNode(node){if(node)while(node.firstChild)node.removeChild(node.firstChild);}

  function imgNode(src,alt){const img=document.createElement('img');img.src=src;img.alt=alt||'';img.draggable=false;return img;}

  function titleType(type){const v=String(type||'');return v?v[0].toUpperCase()+v.slice(1):'';}

  function entryOptions(){return {mode:currentMode,type:currentLeagueType,difficulty:currentDifficulty};}

  function isEligible(row){return config.isRacerEligible(row,entryOptions()).eligible;}

  function discoverRacers(rows){return [...(rows||[])].filter(r=>currentMode!=='league'||r.types?.includes(currentLeagueType));}

  function eligibleRacersForCurrentMode(rows){return discoverRacers(rows).filter(isEligible);}

  function filterAndSortRacers(rows,{query='',sort='speed'}={}){const q=String(query||'').trim().toLowerCase(),out=[...(rows||[])].filter(r=>!q||String(r.name||'').toLowerCase().includes(q)||String(r.id).includes(q));out.sort(sort==='name'?((a,b)=>a.name.localeCompare(b.name)||a.id-b.id):sort==='level'?((a,b)=>b.level-a.level||b.baseSpeed-a.baseSpeed):((a,b)=>b.baseSpeed-a.baseSpeed||b.level-a.level||a.name.localeCompare(b.name)));return out;}

  function sortedFilteredRows(){return filterAndSortRacers(pickerRows,{query:el('dashRacerSearch')?.value||'',sort:el('dashRacerSort')?.value||'speed'}).sort((a,b)=>Number(isEligible(b))-Number(isEligible(a)));}

  function trophySummary(type,records){const rec=records?.[type]||{},icon={gold:'🥇',silver:'🥈',bronze:'🥉'};return config.DIFFICULTY_ORDER.map(k=>`${config.DIFFICULTIES[k].label[0]+config.DIFFICULTIES[k].label.slice(1).toLowerCase()} ${icon[rec?.[k]?.trophy]||'—'}`).join(' · ');}

  function racerFitLabel(row){const result=config.isRacerEligible(row,entryOptions());return `SPD ${row?.baseSpeed??0} · ${result.eligible?'ELIGIBLE':result.reason==='too-fast'?'TOO FAST':result.reason==='too-slow'?'TOO SLOW':'WRONG TYPE'}`;}

  function renderCareer(){const host=el('dashCareerStats'),ds=dashState();if(!host||!ds)return;host.innerHTML=`<span><small>RACES</small><b>${Number(ds.races)||0}</b></span><span><small>WINS</small><b>${Number(ds.wins)||0}</b></span><span><small>PODIUMS</small><b>${Number(ds.podiums)||0}</b></span><span><small>BEST</small><b>${ds.bestTimeMs?formatTime(ds.bestTimeMs):'—'}</b></span>`;}

  function renderSelected(){const host=el('dashSelectedRacer'),start=el('dashStartBtn'),row=pickerRows.find(r=>r.key===selectedKey);if(start)start.disabled=!row||!isEligible(row);if(!host)return;if(!row){host.hidden=true;clearNode(host);return;}host.hidden=false;clearNode(host);host.appendChild(imgNode(row.image,row.name));const copy=document.createElement('div'),name=document.createElement('b'),meta=document.createElement('span');name.textContent=`${row.shiny?'★ ':''}${row.name}`;meta.textContent=`Lv.${row.level} · ${racerFitLabel(row)}`;copy.append(name,meta);host.appendChild(copy);}

  function selectRacer(key,{persist=true}={}){if(!pickerRows.some(r=>r.key===key&&isEligible(r)))return false;selectedKey=key;if(persist)setLastRacer(key);renderRacerGrid();renderSelected();return true;}

  function renderRacerGrid(){const grid=el('dashRacerGrid');if(!grid)return;clearNode(grid);const rows=sortedFilteredRows();for(const row of rows){const btn=document.createElement('button');btn.type='button';btn.className=`dash-racer-card${row.key===selectedKey?' selected':''}`;btn.disabled=!isEligible(row);btn.setAttribute('aria-disabled',String(btn.disabled));btn.dataset.dashRacerKey=row.key;btn.appendChild(imgNode(row.image,row.name));const copy=document.createElement('div'),name=document.createElement('b'),meta=document.createElement('span'),fit=document.createElement('em');name.textContent=`${row.shiny?'★ ':''}${row.name}`;meta.textContent=`Lv.${row.level}`;fit.textContent=racerFitLabel(row);copy.append(name,meta,fit);btn.appendChild(copy);grid.appendChild(btn);}const empty=el('dashEmptyState');if(empty){empty.hidden=pickerRows.length!==0;const label=empty.querySelector?.('span');if(label)label.textContent=currentMode==='league'&&currentLeagueType?`Catch a ${titleType(currentLeagueType)}-type Pokémon to enter.`:'Catch a Pokémon in Adventure, then return to the Race Course.';}renderSelected();}

  function renderLeagueGrid(){const grid=el('dashLeagueGrid');if(!grid||typeof document==='undefined')return;clearNode(grid);const rows=platform()?.dashRacers?.()||[],ds=dashState();for(const type of config.TYPE_ORDER){const eligible=rows.filter(r=>config.DIFFICULTY_ORDER.some(difficulty=>config.isRacerEligible(r,{mode:'league',type,difficulty}).eligible)),btn=document.createElement('button');btn.type='button';btn.className=`dash-league-card${eligible.length?'':' locked'}`;btn.disabled=!eligible.length;btn.style.setProperty('--type-accent',config.themeFor(type).palette.accent);btn.style.setProperty('--type-verge',config.themeFor(type).palette.edge);btn.dataset.dashLeague=type;const b=document.createElement('b'),span=document.createElement('span'),small=document.createElement('small');b.textContent=`${titleType(type)} League`;span.textContent=config.DIFFICULTY_ORDER.map(k=>({gold:'🥇',silver:'🥈',bronze:'🥉'}[ds?.leagueRecords?.[type]?.[k]?.trophy]||'—')).join('  ');span.title=trophySummary(type,ds?.leagueRecords||{});span.setAttribute('aria-label',span.title);small.textContent=eligible.length?`${eligible.length} eligible racer${eligible.length===1?'':'s'}`:`Catch a ${titleType(type)}-type Pokémon to enter.`;const preview=imgNode(`arcade/dash/gen3/previews/${type}.png`,'');preview.className='dash-league-scene';btn.append(preview,b,span,small);grid.appendChild(btn);}}

  function refreshPicker(){allPickerRows=platform()?.dashRacers?.()||[];pickerRows=discoverRacers(allPickerRows);const valid=eligibleRacersForCurrentMode(allPickerRows),ds=dashState(),remembered=currentMode==='league'?ds?.lastLeagueRacerKey:(ds?.lastQuickRacerKey||ds?.lastRacerKey);selectedKey=valid.some(r=>r.key===remembered)?remembered:(valid[0]?.key||null);const band=config.DIFFICULTIES[currentDifficulty];setText('dashPickerEyebrow',`${currentMode==='league'?titleType(currentLeagueType)+' LEAGUE':'QUICK RACE'} · ${band.label}`);setText('dashPickerHint',`ELIGIBLE SPEED ${band.minSpeed}–${band.maxSpeed}${currentMode==='league'?' · '+titleType(currentLeagueType)+' type':''} · ${valid.length} owned`);renderCareer();renderRacerGrid();renderSelected();}

  function renderDifficulties(){if(typeof document==='undefined')return;for(const btn of el('dashDifficultyButtons')?.querySelectorAll('[data-dash-difficulty]')||[]){const key=btn.dataset.dashDifficulty,band=config.DIFFICULTIES[key],count=(platform()?.dashRacers?.()||[]).filter(r=>config.isRacerEligible(r,{mode:currentMode,type:currentLeagueType,difficulty:key}).eligible).length;btn.querySelector('span').textContent=`SPEED ${band.minSpeed}–${band.maxSpeed}`;let owned=btn.querySelector('.dash-owned');if(!owned){owned=document.createElement('em');owned.className='dash-owned';btn.appendChild(owned)}owned.textContent=`${count} eligible owned`;}}

  function showModeMenu(){if(activeRace&&activeRace.phase!=='finished')abandonRace(activeRace);cancelFrame();activeRace=null;activeCup=null;resetInput();currentLeagueType=null;renderCareer();showOnly('dashModeView');return true;}

  function chooseMode(mode){if(!['quick','league'].includes(mode))return false;currentMode=mode;if(mode==='league'){renderLeagueGrid();showOnly('dashLeagueView');}else{currentLeagueType=null;setText('dashDifficultyEyebrow','QUICK RACE');renderDifficulties();showOnly('dashDifficultyView');}return true;}

  function chooseLeague(type){const t=String(type||'').toLowerCase();if(!config.TYPE_ORDER.includes(t))return false;currentMode='league';currentLeagueType=t;setText('dashDifficultyEyebrow',`${titleType(t)} LEAGUE`);renderDifficulties();showOnly('dashDifficultyView');return true;}

  function chooseDifficulty(key){if(!config.DIFFICULTIES[key])return false;currentDifficulty=key;showPicker();return true;}

  function showPicker(){if(activeRace&&activeRace.phase!=='finished')abandonRace(activeRace);cancelFrame();activeRace=null;resetInput();showOnly('dashPickerView');setHidden('dashPauseOverlay',true);setHidden('dashCountdown',true);refreshPicker();return true;}

  function renderStandings(cup,outcome){if(!cup)return false;const rows=outcome?.standings||leagueApi.standings(cup),final=!!outcome?.final,table=el('dashStandingsTable');setText('dashStandingsEyebrow',`${titleType(cup.type)} LEAGUE · ${config.DIFFICULTIES[cup.difficulty].label}`);setText('dashStandingsTitle',final?'CUP COMPLETE':`RACE ${cup.raceIndex} COMPLETE`);setText('dashStandingsSubtitle',final?`${ordinal(outcome.overallPlace||6)} overall · ${outcome.coinsAwarded||0} Lucky Coins`:`Standings after race ${cup.raceIndex} of 3`);setText('dashStandingsTrophy',outcome?.trophy==='gold'?'🥇':outcome?.trophy==='silver'?'🥈':outcome?.trophy==='bronze'?'🥉':'');if(table&&typeof document!=='undefined'){clearNode(table);for(const row of rows){const div=document.createElement('div');div.className=`dash-standing-row${String(row.key)===String(cup.playerKey)?' player':''}`;div.innerHTML=`<b>${ordinal(row.overallPlace)}</b><span>${row.name||row.key}</span><span>${row.points} pts</span><span>${formatTime(row.totalTimeMs)}</span>`;table.appendChild(div);}}const btn=el('dashStandingsContinue');if(btn)btn.textContent=final?'BACK TO DASH':'NEXT RACE';standingsAction=final?()=>showModeMenu():()=>startRace(selectedKey);showOnly('dashStandingsView');return true;}

  function cupRaceSeed(cup){return (((Number(cup.seed)||1)^(0x9e3779b9*Math.max(1,cup.raceIndex+1)))>>>0)||1;}

  function aiPool(player,seed,options={}){

    const data=root.LuckyDexAdventureSpecies||globalThis.LuckyDexAdventureSpecies||{},byId=data.byId||{},difficulty=config.DIFFICULTIES[options.difficulty]?options.difficulty:'normal',band=config.DIFFICULTIES[difficulty],rng=courseApi.rngFrom((Number(seed)||1)^0x9e3779b9);

    const candidates=Object.values(byId).map(meta=>({id:Number(meta.id),meta,types:meta.types||[],baseSpeed:Number(meta.baseStats?.speed)})).filter(r=>config.isRacerEligible(r,{mode:options.type?'league':'quick',type:options.type,difficulty}).eligible).sort((a,b)=>a.baseSpeed-b.baseSpeed||a.id-b.id);

    if(!candidates.length)return [];

    const remaining=[...candidates],profile=[];

    for(const percentile of [.1,.3,.5,.7,.9]){const target=band.minSpeed+(band.maxSpeed-band.minSpeed)*percentile,pool=remaining.length?remaining:candidates;const ranked=pool.map(row=>({row,delta:Math.abs(row.baseSpeed-target),tie:rng()})).sort((a,b)=>a.delta-b.delta||a.tie-b.tie);const row=ranked[0].row;profile.push(row);if(remaining.length)remaining.splice(remaining.indexOf(row),1);}

    for(let i=profile.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[profile[i],profile[j]]=[profile[j],profile[i]];}

    return profile.map((row,i)=>({key:`ai:${row.id}:${i}`,id:row.id,name:row.meta.name,shiny:false,level:clamp((Number(player?.level)||1)+Math.round((rng()-.5)*18),1,50),baseSpeed:row.baseSpeed,types:row.types,image:`arcade/sprites/actors/pokemon/${row.id}.png`}));

  }

  function laneToCanvasX(laneVisual,width){const w=Math.max(1,Number(width)||1);const lane=clamp(Number(laneVisual),0,2);const centers=[w*.28,w*.50,w*.72];if(lane<=1)return centers[0]+(centers[1]-centers[0])*lane;return centers[1]+(centers[2]-centers[1])*(lane-1);}

  function distanceToCanvasY(racerDistance,playerDistance,height){const h=Math.max(1,Number(height)||1),anchor=h*.70;return anchor-(Number(racerDistance||0)-Number(playerDistance||0))*CONSTANTS.TOP_DOWN_DISTANCE_SCALE;}

  function racerPixelSize(width,height){const raw=Math.min((Number(width)||0)/4.8,(Number(height)||0)/6.4);return Math.round(clamp(raw,96,112));}

  function renderRace(){

    if(!activeRace)return false;const canvas=el('dashCanvas'),ctx=canvas?.getContext?.('2d');if(!ctx){setHidden('dashUnavailable',false);return false;}setHidden('dashUnavailable',true);const bounds=canvas.getBoundingClientRect?.();if(bounds?.width>0&&bounds?.height>0){const height=Math.round(540*bounds.height/bounds.width);if(canvas.height!==height)canvas.height=height;}

    renderer.drawScene(ctx,activeRace);

    renderHud();renderRaceFeedback(activeRace);return true;

  }

  function renderRaceFeedback(race){const node=el('dashRaceFeedback'),player=race?.racers?.[0];if(!node||!player)return;let text='',kind='';if(player.impactTimer>0){text=player.impactKind==='mud'?'SLOWED!':'BUMP!';kind='impact';}else if(player.pickupFlashTimer>0){text='STAMINA +';kind='pickup';}else if(player.boostFlashTimer>0){text='BOOST!';kind='boost';}else if(race.positionSignal&&race.positionSignal.untilMs>race.elapsedMs){const gain=race.positionSignal.to<race.positionSignal.from;text=gain?`${ordinal(race.positionSignal.to)} PLACE!`:`DOWN TO ${ordinal(race.positionSignal.to)}`;kind=gain?'position-up':'position-down';}else if(race.finalStretch&&race.finalStretchSignalUntil>race.elapsedMs){text='FINAL STRETCH!';kind='final';}node.textContent=text;node.dataset.kind=kind;node.hidden=!text;}

  function renderHud(){if(!activeRace)return;const player=activeRace.racers[0],ranked=rankRacers(activeRace.racers),place=ranked.indexOf(player)+1,progress=clamp(player.distance/activeRace.finishDistance*100,0,100);setText('dashPlace',ordinal(place));const pf=el('dashProgressFill'),sf=el('dashStaminaFill');if(pf)pf.style.width=`${progress}%`;if(sf)sf.style.width=`${clamp(player.stamina,0,100)}%`;setText('dashProgressText',`${Math.floor(progress)}%`);setText('dashStaminaText',Math.round(player.stamina));el('dashSprintBtn')?.classList.toggle('active',!!input.sprint&&player.stamina>0);}

  function frame(ts){

    input.sprint=heldSprint();rafId=0;if(!opened||!activeRace||!['countdown','racing'].includes(activeRace.phase))return;const now=Number(ts)||0;if(activeRace.lastFrameMs==null){activeRace.lastFrameMs=now;renderRace();queueFrame();return;}const dt=clamp((now-activeRace.lastFrameMs)/1000,0,CONSTANTS.MAX_FRAME_DT);activeRace.lastFrameMs=now;

    if(activeRace.phase==='countdown'){activeRace.countdownMs=Math.max(0,Number(activeRace.countdownMs||0)-dt*1000);const n=Math.ceil(activeRace.countdownMs/1000);setHidden('dashCountdown',false);setText('dashCountdown',n>0?n:'GO!');if(activeRace.countdownMs<=0){activeRace.phase='racing';setTimeout(()=>{if(activeRace?.phase==='racing')setHidden('dashCountdown',true);},240);}}

    else{const out=stepRace(activeRace,dt,{sprint:heldSprint(),steer:heldSteer(),targetLane:input.targetLane});if(out.completed){renderRace();const key=activeRace.racers[0].key;if(currentMode==='goldenrod'&&goldenrodRound){completeGoldenrodRound(activeRace,goldenrodRound);return;}if(currentMode==='league'&&activeCup){const leagueOutcome=completeLeagueRace(activeRace,activeCup,{showStandings:false});renderStandings(activeCup,leagueOutcome);}else finalizeQuickRace(activeRace,{onReplay:()=>startRace(key),onChange:()=>showPicker(),onBack:()=>showModeMenu()});return;}}

    renderRace();queueFrame();

  }

  function normalizeGoldenrodDashEntrant(row){return {...row,baseSpeed:Number(row?.baseSpeed??row?.baseStat)||60};}

  function prepareGoldenrodRound({mode='division',divisionId='rookie',type=null,seed=1,player,aiEntrants=[]}={}){
    const theme=mode==='type'&&type?String(type).toLowerCase():'normal';
    const difficulty=config.goldenrodDifficultyForDivision?.(divisionId)||'easy';
    const aiProfile=config.goldenrodAiProfile?.(divisionId)||difficultyProfile(difficulty);
    const race=createRaceState(normalizeGoldenrodDashEntrant(player),(aiEntrants||[]).map(normalizeGoldenrodDashEntrant),{seed,difficulty,mode:'goldenrod',theme,aiProfile});
    return {race,theme,difficulty,aiProfile};
  }

  function completeGoldenrodRound(race,{onComplete}={}){
    if(!race||race._goldenrodReported)return false;
    race._goldenrodReported=true;
    const results=raceResults(race),player=race.racers?.[0],row=results.find(r=>String(r.key)===String(player?.key))||results[0]||{};
    const payload={eventId:'dash',metric:Number(row.timeMs)||0,raw:{place:Number(row.place)||6,timeMs:Number(row.timeMs)||0,results},rareReceipts:[]};
    if(typeof onComplete==='function')onComplete(payload);
    return payload;
  }

  function launchPreparedRace(prepared){
    activeRace=prepared.race;activeRace.phase='loading';resetInput();input.targetLane=1;showOnly('dashRaceView');setHidden('dashPauseOverlay',true);setHidden('dashCountdown',false);setText('dashCountdown','LOADING');const canvas=el('dashCanvas'),ctx=canvas?.getContext?.('2d');if(!ctx){abandonRace(activeRace);setHidden('dashUnavailable',false);return false;}
    const race=activeRace,token=++loadingToken;
    assets.preload(prepared.theme,race.racers).then(()=>{if(!opened||activeRace!==race||token!==loadingToken||race.phase==='abandoned')return;race.countdownMs=3000;race.lastFrameMs=null;if(typeof document!=='undefined'&&document.hidden){race.phase='paused';race.phaseBeforePause='countdown';setHidden('dashPauseOverlay',false);}else{race.phase='countdown';setText('dashCountdown','3');renderRace();queueFrame();}}).catch(()=>{if(activeRace!==race||token!==loadingToken)return;abandonRace(race);setHidden('dashCountdown',true);setHidden('dashUnavailable',false);});return true;
  }

  function startGoldenrodRound({cupId,mode='division',divisionId='rookie',type=null,roundIndex=0,seed=1,player,aiEntrants=[],onComplete}={}){
    if(!player||!Array.isArray(aiEntrants)||aiEntrants.length<5)return false;
    currentMode='goldenrod';currentDifficulty=config.goldenrodDifficultyForDivision?.(divisionId)||'easy';currentLeagueType=mode==='type'?type:null;activeCup=null;selectedKey=player.key||null;
    const prepared=prepareGoldenrodRound({mode,divisionId,type,seed,player,aiEntrants});
    goldenrodRound={cupId,mode,divisionId,type,roundIndex,onComplete};
    return launchPreparedRace(prepared);
  }

  function startExhibition({difficulty='normal',participant}={}){
    if(!participant)return false;
    currentMode='quick';currentDifficulty=config.DIFFICULTIES[difficulty]?difficulty:'normal';currentLeagueType=null;goldenrodRound=null;activeCup=null;selectedKey=participant.key||null;setLastRacer(selectedKey);
    const seed=((Date.now()>>>0)^(Number(participant.id)<<12)^Math.round(Number(participant.level)||1))>>>0||1,ai=aiPool(participant,seed,{difficulty:currentDifficulty});
    const race=createRaceState(participant,ai,{seed,difficulty:currentDifficulty,mode:'quick',theme:'normal'});
    return launchPreparedRace({race,theme:'normal'});
  }

  function startRace(key){

    const rows=platform()?.dashRacers?.()||[],player=rows.find(r=>r.key===key);if(!player){showPicker();return false;}if(!config.isRacerEligible(player,entryOptions()).eligible){showPicker();return false;}

    selectedKey=player.key;setLastRacer(player.key);let seed,ai,theme=currentMode==='league'?currentLeagueType:'normal';

    if(currentMode==='league'){

      if(!activeCup){const cupSeed=((Date.now()>>>0)^(Number(player.id)<<12)^Math.round(Number(player.level)||1)^currentLeagueType.length)>>>0||1;ai=aiPool(player,cupSeed,{difficulty:currentDifficulty,type:currentLeagueType});activeCup=leagueApi.createCup({type:currentLeagueType,difficulty:currentDifficulty,player,aiRacers:ai,seed:cupSeed});}

      seed=cupRaceSeed(activeCup);ai=activeCup.entrants.slice(1).map(({points,totalTimeMs,places,index,...r})=>({...r}));

    }else{activeCup=null;seed=((Date.now()>>>0)^(Number(player.id)<<12)^Math.round(Number(player.level)||1))>>>0||1;ai=aiPool(player,seed,{difficulty:currentDifficulty});}

    goldenrodRound=null;activeRace=createRaceState(player,ai,{seed,difficulty:currentDifficulty,mode:currentMode,theme});return launchPreparedRace({race:activeRace,theme});

  }



  function pause(){if(!activeRace||!pauseRaceState(activeRace))return false;cancelFrame();resetInput();setHidden('dashPauseOverlay',false);renderRace();return true;}

  function resume(){if(!activeRace||!resumeRaceState(activeRace))return false;setHidden('dashPauseOverlay',true);if(activeRace.phase==='racing')setHidden('dashCountdown',true);queueFrame();return true;}

  function shiftLane(delta){if(!activeRace||!['countdown','racing'].includes(activeRace.phase))return false;input.targetLane=clampLane(input.targetLane+delta);return true;}

  function bindUi(){

    cleanupFns.splice(0).forEach(fn=>fn());const search=el('dashRacerSearch'),sort=el('dashRacerSort'),grid=el('dashRacerGrid'),start=el('dashStartBtn'),left=el('dashLeftBtn'),right=el('dashRightBtn'),sprint=el('dashSprintBtn');

    listen(el('dashQuickBtn'),'click',()=>chooseMode('quick'));listen(el('dashLeaguesBtn'),'click',()=>chooseMode('league'));

    listen(el('dashDifficultyButtons'),'click',e=>{const btn=e.target.closest?.('[data-dash-difficulty]');if(btn)chooseDifficulty(btn.dataset.dashDifficulty);});

    listen(el('dashLeagueGrid'),'click',e=>{const btn=e.target.closest?.('[data-dash-league]');if(!btn)return;const type=btn.dataset.dashLeague,rows=platform()?.dashRacers?.()||[];if(rows.some(r=>r.types?.includes(type)))chooseLeague(type);});

    if(typeof document!=='undefined')for(const back of document.querySelectorAll?.('[data-dash-back]')||[])listen(back,'click',()=>{const dest=back.dataset.dashBack;if(dest==='mode')showModeMenu();else if(dest==='difficulty'){if(currentMode==='league'){renderLeagueGrid();showOnly('dashLeagueView');}else showModeMenu();}else if(dest==='picker')showOnly('dashDifficultyView');});

    listen(search,'input',renderRacerGrid);listen(sort,'change',renderRacerGrid);listen(grid,'click',e=>{const btn=e.target.closest?.('[data-dash-racer-key]');if(btn)selectRacer(btn.dataset.dashRacerKey);});listen(start,'click',()=>startRace(selectedKey));listen(el('dashStandingsContinue'),'click',()=>{const fn=standingsAction;standingsAction=null;if(typeof fn==='function')fn();});

    const racing=()=>activeRace&&['countdown','racing'].includes(activeRace.phase);
    const capture=(node,e)=>{try{node.setPointerCapture?.(e.pointerId);}catch(_){};};
    for(const [node,dir] of [[left,-1],[right,1]])listen(node,'pointerdown',e=>{if(!racing())return;if(e.cancelable)e.preventDefault();input.pointerDir=dir;input.steerPointer=e.pointerId;capture(node,e);},{passive:false});
    listen(sprint,'pointerdown',e=>{if(!racing())return;if(e.cancelable)e.preventDefault();input.pointerSprint=true;input.sprintPointer=e.pointerId;input.sprint=true;capture(sprint,e);},{passive:false});
    const released=e=>{if(e.pointerId===input.steerPointer){input.pointerDir=0;input.steerPointer=null;}if(e.pointerId===input.sprintPointer){input.pointerSprint=false;input.sprintPointer=null;input.sprint=heldSprint();}};
    listen(root,'pointerup',released);listen(root,'pointercancel',released);listen(root,'blur',resetInput);
    listen(root,'keydown',e=>{if(!opened||!racing())return;if(['ArrowLeft','ArrowRight',' ','Shift'].includes(e.key)){e.preventDefault();input.keys.add(e.key);input.sprint=heldSprint();}});listen(root,'keyup',e=>{input.keys.delete(e.key);input.sprint=heldSprint();});
    listen(root,'resize',sizeViewport);listen(root.visualViewport,'resize',sizeViewport);listen(root.visualViewport,'scroll',sizeViewport);

    if(typeof document!=='undefined')listen(document,'visibilitychange',()=>{if(document.hidden)pause();else resume();});listen(root,'pagehide',()=>pause());

  }

  function open(){if(typeof document==='undefined')return false;opened=true;mountViewport();root.LuckyDexArcadeSession?.mount?.('dash',el('dashGame'));root.LuckyDexArcadeSession?.hideResult?.();bindUi();setHidden('dashUnavailable',true);showModeMenu();return true;}

  function close(){loadingToken++;assets.release?.();cancelFrame();if(activeRace&&activeRace.phase!=='finished')abandonRace(activeRace);activeRace=null;activeCup=null;goldenrodRound=null;standingsAction=null;resetInput();cleanupFns.splice(0).forEach(fn=>{try{fn();}catch(_){}});opened=false;restoreViewport();setHidden('dashPauseOverlay',true);setHidden('dashCountdown',true);return true;}



  const api={CONSTANTS,paceModifier,accelerationModifier,levelModifier,stepStamina,tickEffects,applyCourseObject,resolveRacerContacts,objectFootprint,clampLane,rankRacers,rewardForPlace,aiPool,laneToCanvasX,distanceToCanvasY,racerPixelSize,createRaceState,stepRace,finishRaceOnce,pauseRaceState,resumeRaceState,abandonRace,raceResults,applyCareerResult,updateLeagueRecord,finalizeQuickRace,completeLeagueRace,finalizeRace,ordinal,formatTime,prepareGoldenrodRound,completeGoldenrodRound,startGoldenrodRound,startExhibition,open,close,pause,resume,startRace,showModeMenu,showPicker,chooseMode,chooseDifficulty,chooseLeague,eligibleRacersForCurrentMode,filterAndSortRacers,racerFitLabel,trophySummary,selectRacer};

  root.LuckyDexDash=api;

  if(typeof module!=='undefined'&&module.exports)module.exports=api;

})(typeof window!=='undefined'?window:globalThis);

