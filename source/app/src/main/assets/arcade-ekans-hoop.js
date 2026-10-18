(function(root,factory){
  const core=root.LuckyDexEkansHoopCore||(typeof require==='function'?require('./arcade-ekans-hoop-core.js'):null);
  const api=factory(root,core);
  root.LuckyDexEkansHoop=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexEkansHoopCore required');

  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>root.performance?.now?.()??Date.now();
  const rafFn=cb=>root.requestAnimationFrame?root.requestAnimationFrame(cb):setTimeout(()=>cb(now()),16);
  const cafFn=id=>root.cancelAnimationFrame?root.cancelAnimationFrame(id):clearTimeout(id);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const lanePct=lane=>17+clamp(Number(lane)||0,0,2)*33;
  const depthPct=depth=>83-clamp(Number(depth)||0,0,2)*33;
  const AIM_NEAR_PULL_PX=22,AIM_DEPTH_STEP_PX=61.5,AIM_REST_DEPTH=-AIM_NEAR_PULL_PX/AIM_DEPTH_STEP_PX;
  const aimDepthPct=depth=>83-clamp(Number(depth)||0,AIM_REST_DEPTH,2)*33;

  let round=null,phase='closed',pausedFrom=null,remainingMs=0,countdownRemainingMs=0,countdownEndsAt=0,roundEndsAt=0,rafId=0;
  let aim={lane:1,depth:AIM_REST_DEPTH},dragging=false,dragStart=null,dragOffset={x:0,y:0},activePointerId=null,playerThrow=null;
  let lastHudSecond=null,opened=false,firstThrow=true,completionHandled=false,finalResult=null;
  let currentDifficulty='normal',roundDifficulty='normal';

  function session(){return root.LuckyDexArcadeSession;}
  function difficulty(key=currentDifficulty){return core.difficultyProfile?core.difficultyProfile(key):(core.DIFFICULTIES?.[key]||core.DIFFICULTIES?.normal||{key:'normal',label:'Normal',durationMs:60000,targetLifetimeScale:1,thresholds:[20,35,55,80]});}
  function schedule(){if(!rafId&&['countdown','playing','finishing'].includes(phase))rafId=rafFn(frame);}
  function stopLoop(){if(rafId){cafFn(rafId);rafId=0;}}
  function desiredTargetCount(){return Number(round?.score||0)>=Number(difficulty(roundDifficulty).thresholds?.[2]||55)?3:2;}
  function ensureTargets(t=now()){
    if(!round)return;
    const desired=Math.min(core.CONFIG.maxActiveTargets,desiredTargetCount());
    const lifetimeScale=Number(difficulty(roundDifficulty).targetLifetimeScale)||1;
    while(round.targets.length<desired)core.spawnTarget(round,Math.random,t,{lifetimeScale});
  }
  function setAim(lane,depth){
    aim={lane:clamp(Number(lane)||0,0,2),depth:clamp(Number(depth)||0,AIM_REST_DEPTH,2)};
    renderAim();return {...aim};
  }
  function snapshot(){
    return {
      phase,difficulty:roundDifficulty||currentDifficulty,remainingMs:Math.max(0,Math.round(remainingMs)),countdownRemainingMs:Math.max(0,Math.round(countdownRemainingMs)),
      score:Number(round?.score||0),streak:Number(round?.streak||0),bestStreak:Number(round?.bestStreak||0),
      totalHoops:Number(round?.totalHoops||0),shinyHits:Number(round?.shinyHits||0),
      targets:round?round.targets.map(t=>({...t})):[],aim:{...aim},dragging,playerAirborne:!!playerThrow,pausedFrom,completionHandled
    };
  }
  function nextTierLabel(score){
    const profile=difficulty(roundDifficulty),tier=core.rewardTier(score,roundDifficulty);
    if(tier.nextAt===null)return 'MASTER · 250 COINS';
    const [bronze,silver,gold,master]=profile.thresholds||[20,35,55,80];
    const name=tier.nextAt===bronze?'BRONZE':tier.nextAt===silver?'SILVER':tier.nextAt===gold?'GOLD':tier.nextAt===master?'MASTER':'NEXT';
    return `NEXT · ${name} ${tier.nextAt}`;
  }
  function renderHud(){
    const profile=difficulty(roundDifficulty);
    const seconds=phase==='idle'?Math.round(profile.durationMs/1000):phase==='countdown'?Math.max(1,Math.ceil(countdownRemainingMs/1000)):Math.max(0,Math.ceil(remainingMs/1000));
    if($('ekansHoopTimer'))$('ekansHoopTimer').textContent=String(seconds);
    if($('ekansHoopScore'))$('ekansHoopScore').textContent=String(round?.score||0);
    if($('ekansHoopStreak'))$('ekansHoopStreak').textContent=String(round?.streak||0);
    if($('ekansHoopMultiplier'))$('ekansHoopMultiplier').textContent=`×${core.streakMultiplier(round?.streak||0)}`;
    if($('ekansHoopTier'))$('ekansHoopTier').textContent=nextTierLabel(round?.score||0);
    const countdown=$('ekansHoopCountdown');
    if(countdown){
      if(phase==='countdown'){countdown.hidden=false;countdown.textContent=String(Math.max(1,Math.ceil(countdownRemainingMs/1000)));}
      else{countdown.hidden=true;countdown.textContent='';}
    }
    const tier=core.rewardTier(round?.score||0,roundDifficulty);
    const runText=phase==='idle'?`${profile.label} · press START`:phase==='countdown'?'Get ready…':`${seconds}s · streak ${round?.streak||0}`;
    const rewardText=phase==='idle'?`${Math.round(profile.durationMs/1000)} seconds · ${profile.label}`:`${tier.tier} · ${tier.coins} coins`;
    session()?.update?.('ekansHoop',{runText,rewardText,liveLabel:'SCORE',liveValue:String(round?.score||0)});
  }
  function renderAim(){
    const marker=$('ekansHoopAimMarker');
    if(marker){marker.style.left=`${lanePct(aim.lane)}%`;marker.style.top=`${aimDepthPct(aim.depth)}%`;}
  }
  function renderDifficulty(){
    if(typeof document==='undefined')return;
    for(const btn of document.querySelectorAll?.('[data-ekans-difficulty]')||[]){
      const active=btn.dataset.ekansDifficulty===currentDifficulty;
      btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',active?'true':'false');
    }
    const p=difficulty(currentDifficulty),meta=$('ekansHoopReadyMeta');
    if(meta)meta.textContent=`${p.label.toUpperCase()} · ${Math.round(p.durationMs/1000)} SEC`;
  }
  function setGameplayControls(active){
    const ready=$('ekansHoopReady'),launcher=$('ekansHoopLauncher'),hint=$('ekansHoopHint');
    if(ready)ready.hidden=!!active;
    if(launcher)launcher.hidden=!active;
    if(hint)hint.hidden=!active||!firstThrow;
  }
  function spriteForTarget(target){return `arcade/sprites/actors/pokemon/${target.shiny?'shiny/':''}${target.speciesId}.png`;}
  function targetName(target){return `${target.shiny?'Shiny ':''}${target.speciesId===51?'Dugtrio':'Diglett'}`;}
  function renderTargets(){
    const field=$('ekansHoopField');if(!field)return;
    field.querySelectorAll('.ekans-hoop-target').forEach(n=>n.remove());
    if(!round)return;
    for(const target of round.targets){
      const n=document.createElement('div');
      n.className='ekans-hoop-target'+(target.speciesId===51?' is-dugtrio':'')+(target.shiny?' is-shiny':'');
      n.dataset.token=String(target.token);n.dataset.kind=target.kind;
      n.style.left=`${lanePct(target.lane)}%`;n.style.top=`${depthPct(target.depth)}%`;
      const img=document.createElement('img');img.src=spriteForTarget(target);img.alt=targetName(target);img.draggable=false;n.appendChild(img);
      if(target.shiny){const star=document.createElement('span');star.className='ekans-hoop-shiny-star';star.textContent='★';star.setAttribute('aria-hidden','true');n.appendChild(star);}
      field.appendChild(n);
    }
  }
  function clearEffects(){
    if(typeof document==='undefined')return;
    document.querySelectorAll('#ekansHoopField .ekans-hoop-airborne,#ekansHoopField .ekans-hoop-score-pop,#ekansHoopField .ekans-hoop-miss-pop').forEach(n=>n.remove());
  }
  function animateThrow(spec){
    const field=$('ekansHoopField');if(!field)return;
    const img=document.createElement('img');img.src='arcade/sprites/actors/pokemon/23.png';img.alt='';img.draggable=false;img.className='ekans-hoop-airborne';
    img.style.setProperty('--throw-x',`${lanePct(spec.lane)}%`);img.style.setProperty('--throw-y',`${depthPct(spec.depth)}%`);img.style.setProperty('--throw-duration','390ms');field.appendChild(img);
    setTimeout(()=>img.remove(),460);
  }
  function scoreFlash(result){
    const field=$('ekansHoopField');if(!field||!result?.target)return;
    const pop=document.createElement('b');pop.className='ekans-hoop-score-pop'+(result.basePoints>1?' is-special':'')+(result.target.shiny?' is-shiny':'');
    pop.textContent=result.multiplier>1?`+${result.points} · ×${result.multiplier}`:`+${result.points}`;
    pop.style.left=`${lanePct(result.target.lane)}%`;pop.style.top=`${depthPct(result.target.depth)}%`;field.appendChild(pop);setTimeout(()=>pop.remove(),650);
    try{root.navigator?.vibrate?.(result.target.shiny?[28,22,28,22,48]:result.basePoints>1?[28,22,42]:24);}catch(_){ }
  }
  function missFlash(){
    const field=$('ekansHoopField');if(!field)return;
    const pop=document.createElement('b');pop.className='ekans-hoop-miss-pop';pop.textContent='MISS';pop.style.left=`${lanePct(aim.lane)}%`;pop.style.top=`${depthPct(aim.depth)}%`;field.appendChild(pop);setTimeout(()=>pop.remove(),480);
  }
  function resolvePlayerThrow(t){
    if(!playerThrow||t<playerThrow.resolveAt)return false;
    const spec=playerThrow.spec;playerThrow=null;
    const result=core.resolveThrow(round,spec,t);
    if(result.hit)scoreFlash(result);else missFlash();
    ensureTargets(t);renderTargets();renderHud();
    if(phase==='finishing')finishRound();
    return result;
  }
  function startPlayerThrow(){
    if(phase!=='playing'||playerThrow)return false;
    const t=now();
    const spec={lane:aim.lane,depth:aim.depth};
    playerThrow={spec,resolveAt:t+390,remainingMs:390};
    firstThrow=false;const hint=$('ekansHoopHint');if(hint)hint.hidden=true;
    animateThrow(spec);schedule();return true;
  }
  function frame(ts){
    rafId=0;const t=Number(ts)||now();
    if(phase==='countdown'){
      countdownRemainingMs=Math.max(0,countdownEndsAt-t);renderHud();
      if(countdownRemainingMs<=0){
        const duration=difficulty(roundDifficulty).durationMs;phase='playing';remainingMs=duration;round.startedAt=t;roundEndsAt=t+remainingMs;round.endsAt=roundEndsAt;
        ensureTargets(t);renderTargets();
        const launcher=$('ekansHoopLauncher'),hint=$('ekansHoopHint');if(launcher)launcher.hidden=false;if(hint)hint.hidden=!firstThrow;
        renderHud();
      }
    }else if(phase==='playing'||phase==='finishing'){
      if(phase==='playing')remainingMs=Math.max(0,roundEndsAt-t);
      resolvePlayerThrow(t);
      if(phase==='playing'){
        const expired=core.expireTargets(round,t);
        if(expired.length){ensureTargets(t);renderTargets();}
        if(remainingMs<=0){phase=playerThrow?'finishing':'finished';if(phase==='finished')finishRound();}
      }
      const sec=Math.ceil(remainingMs/1000);if(sec!==lastHudSecond){lastHudSecond=sec;renderHud();}
    }
    if(['countdown','playing','finishing'].includes(phase))schedule();
  }
  function resetDragVisual(){
    dragging=false;dragStart=null;dragOffset={x:0,y:0};activePointerId=null;
    const launcher=$('ekansHoopLauncher');if(launcher)launcher.classList.remove('is-dragging');
    $('ekansHoopStage')?.classList?.remove('is-aiming');
  }
  function showReady({difficulty:key=currentDifficulty}={}){
    stopLoop();clearEffects();
    currentDifficulty=core.DIFFICULTIES?.[key]?key:'normal';roundDifficulty=currentDifficulty;
    round=core.createRound();phase='idle';pausedFrom=null;playerThrow=null;remainingMs=difficulty(currentDifficulty).durationMs;countdownRemainingMs=0;countdownEndsAt=0;roundEndsAt=0;
    aim={lane:1,depth:AIM_REST_DEPTH};completionHandled=false;finalResult=null;firstThrow=true;lastHudSecond=null;resetDragVisual();
    setGameplayControls(false);renderDifficulty();renderAim();renderTargets();renderHud();
    return snapshot();
  }
  function selectDifficulty(key){
    if(!['idle','closed'].includes(phase)||!core.DIFFICULTIES?.[key])return false;
    currentDifficulty=key;roundDifficulty=key;remainingMs=difficulty(key).durationMs;renderDifficulty();renderHud();return true;
  }
  function startRound({countdownMs=3000,difficulty:key=currentDifficulty}={}){
    stopLoop();clearEffects();currentDifficulty=core.DIFFICULTIES?.[key]?key:'normal';roundDifficulty=currentDifficulty;
    const duration=difficulty(roundDifficulty).durationMs;
    round=core.createRound();remainingMs=duration;countdownRemainingMs=Math.max(0,Number(countdownMs)||0);
    phase=countdownRemainingMs>0?'countdown':'playing';pausedFrom=null;playerThrow=null;aim={lane:1,depth:AIM_REST_DEPTH};completionHandled=false;finalResult=null;firstThrow=true;lastHudSecond=null;resetDragVisual();
    const t=now();if(phase==='playing')ensureTargets(t);round.startedAt=phase==='playing'?t:null;roundEndsAt=t+duration;round.endsAt=roundEndsAt;countdownEndsAt=t+countdownRemainingMs;
    setGameplayControls(true);
    if(phase==='countdown'){const launcher=$('ekansHoopLauncher'),hint=$('ekansHoopHint');if(launcher)launcher.hidden=true;if(hint)hint.hidden=true;}
    renderDifficulty();renderAim();renderTargets();renderHud();schedule();return snapshot();
  }
  function pause(){
    if(!['countdown','playing','finishing'].includes(phase))return false;
    const t=now();pausedFrom=phase;
    if(phase==='countdown')countdownRemainingMs=Math.max(0,countdownEndsAt-t);
    if(phase==='playing'||phase==='finishing')remainingMs=Math.max(0,roundEndsAt-t);
    if(playerThrow)playerThrow.remainingMs=Math.max(0,playerThrow.resolveAt-t);
    resetDragVisual();phase='paused';stopLoop();$('ekansHoopStage')?.classList?.add('is-paused');const overlay=$('ekansHoopPauseOverlay');if(overlay)overlay.hidden=false;return true;
  }
  function resume(){
    if(phase!=='paused'||!pausedFrom)return false;
    const t=now(),restore=pausedFrom;phase=restore;pausedFrom=null;
    if(restore==='countdown')countdownEndsAt=t+countdownRemainingMs;else roundEndsAt=t+remainingMs;
    if(playerThrow)playerThrow.resolveAt=t+Math.max(0,playerThrow.remainingMs||0);
    $('ekansHoopStage')?.classList?.remove('is-paused');const overlay=$('ekansHoopPauseOverlay');if(overlay)overlay.hidden=true;schedule();renderHud();return true;
  }
  function finishRound(){
    if(finalResult)return finalResult;
    const score=Number(round?.score||0),tier=core.rewardTier(score,roundDifficulty),profile=difficulty(roundDifficulty);
    finalResult={score,tier:tier.tier,coins:tier.coins,difficulty:roundDifficulty,bestStreak:Number(round?.bestStreak||0),totalHoops:Number(round?.totalHoops||0),shinyHits:Number(round?.shinyHits||0)};
    phase='finished';stopLoop();remainingMs=0;renderHud();
    if(completionHandled||!round)return finalResult;
    completionHandled=true;
    const platform=root.LuckyDexArcadePlatform;
    if(root.state&&platform?.ensureArcadeState){
      root.state.arcade=platform.ensureArcadeState(root.state.arcade);
      const rec=root.state.arcade.ekansHoop,previousBest=Number(rec.bestScore||0),previousStreak=Number(rec.bestStreak||0);
      rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;
      rec.bestScore=Math.max(previousBest,score);
      rec.bestStreak=Math.max(previousStreak,Number(round.bestStreak||0));
      rec.totalHoops=Number(rec.totalHoops||0)+Number(round.totalHoops||0);
      rec.shinyHits=Number(rec.shinyHits||0)+Number(round.shinyHits||0);
      const award=platform.awardRun?.({gameId:'ekansHoop',label:'Ekans’ Hoop Hurl',score,coins:tier.coins})||{coinsAwarded:tier.coins};
      root.save?.();
      const title=tier.tier==='Master'?'MASTER HOOPER!':tier.tier==='Participation'?'ROUND COMPLETE':`${tier.tier.toUpperCase()} SCORE!`;
      const details=[
        {title:`${profile.label} · ${tier.tier}`,subtitle:`${tier.coins} Lucky Coins · ${Math.round(profile.durationMs/1000)} sec`,kind:'find'},
        {title:`Best streak · ${round.bestStreak||0}`,subtitle:`${round.totalHoops||0} hoop${round.totalHoops===1?'':'s'} landed`,kind:'neutral'}
      ];
      if(round.shinyHits)details.push({title:`Shiny hits · ${round.shinyHits}`,subtitle:'Rare targets hooped',kind:'find'});
      session()?.showResult?.('ekansHoop',{title,metricLabel:'SCORE',metricValue:String(score),coinsAwarded:award.coinsAwarded,bestText:`BEST ${rec.bestScore}`,details,review:{title,mode:'Hoop Hurl',difficulty:profile.label,metricLabel:'SCORE',metricValue:String(score),stats:[{label:'Reward Tier',value:String(tier.tier)},{label:'Best Streak',value:String(round.bestStreak||0)},{label:'Hoops Landed',value:String(round.totalHoops||0)},{label:'Shiny Hits',value:String(round.shinyHits||0)}],pbs:[{label:'Best Score',value:String(rec.bestScore||0),isNew:score>previousBest},{label:'Best Streak',value:String(rec.bestStreak||0),isNew:Number(round.bestStreak||0)>previousStreak}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]},replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty:roundDifficulty}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
    }
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('ekansHoop',$('ekansHoopGame'));showReady({difficulty:'normal'});return true;}
  function close(){opened=false;stopLoop();phase='closed';pausedFrom=null;remainingMs=0;countdownRemainingMs=0;round=null;playerThrow=null;completionHandled=false;finalResult=null;currentDifficulty='normal';roundDifficulty='normal';resetDragVisual();clearEffects();$('ekansHoopPauseOverlay')?.setAttribute?.('hidden','');return true;}
  function isActivePointer(e){return activePointerId===null||e?.pointerId===undefined||e.pointerId===activePointerId;}
  function pointerDown(e){
    if(phase!=='playing'||playerThrow)return;
    dragging=true;activePointerId=e?.pointerId??null;dragStart={x:Number(e.clientX)||0,y:Number(e.clientY)||0};dragOffset={x:0,y:0};setAim(1,AIM_REST_DEPTH);
    const launcher=$('ekansHoopLauncher');launcher?.classList?.add('is-dragging');$('ekansHoopStage')?.classList?.add('is-aiming');
    try{e.currentTarget?.setPointerCapture?.(e.pointerId);}catch(_){ }e.preventDefault?.();
  }
  function pointerMove(e){
    if(!dragging||!dragStart||!isActivePointer(e))return;
    const pullX=clamp((Number(e.clientX)||0)-dragStart.x,-100,100);
    const pullBack=clamp((Number(e.clientY)||0)-dragStart.y,0,150);
    dragOffset={x:pullX,y:pullBack};setAim(1-pullX/100,(pullBack-AIM_NEAR_PULL_PX)/AIM_DEPTH_STEP_PX);
    e.preventDefault?.();
  }
  function finishDrag(e,{refreshPointer=false}={}){
    if(!dragging)return false;
    if(e&&e.pointerId!==undefined&&!isActivePointer(e))return false;
    if(refreshPointer&&e?.clientX!==undefined&&e?.clientY!==undefined)pointerMove(e);
    const deliberate=dragOffset.y>=6;
    const canThrow=deliberate&&phase==='playing'&&!document?.hidden;
    resetDragVisual();
    if(canThrow)startPlayerThrow();
    e?.preventDefault?.();
    return canThrow;
  }
  function pointerUp(e){finishDrag(e,{refreshPointer:true});}
  function pointerCancel(e){finishDrag(e);}
  function lostPointerCapture(e){finishDrag(e);}
  function touchEndFallback(e){if(!dragging)return;finishDrag(e);}
  function wire(){
    const launcher=$('ekansHoopLauncher');if(!launcher||launcher.dataset.wired)return;launcher.dataset.wired='1';
    launcher.addEventListener('pointerdown',pointerDown);
    launcher.addEventListener('lostpointercapture',lostPointerCapture);
    document.addEventListener('pointermove',pointerMove,{capture:true,passive:false});
    document.addEventListener('pointerup',pointerUp,{capture:true,passive:false});
    document.addEventListener('pointercancel',pointerCancel,{capture:true,passive:false});
    document.addEventListener('touchend',touchEndFallback,{capture:true,passive:false});
    document.addEventListener('touchcancel',touchEndFallback,{capture:true,passive:false});
    $('ekansHoopResume')?.addEventListener('click',resume);
    $('ekansHoopStart')?.addEventListener('click',()=>startRound());
    for(const btn of document.querySelectorAll?.('[data-ekans-difficulty]')||[])btn.addEventListener('click',()=>selectDifficulty(btn.dataset.ekansDifficulty));
  }
  if(typeof document!=='undefined'){wire();document.addEventListener('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  return {open,close,pause,resume,startRound,showReady,selectDifficulty,snapshot,setAim,throwNow:startPlayerThrow,finishRound};
});
