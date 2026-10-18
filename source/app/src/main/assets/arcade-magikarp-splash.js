(function(root,factory){
  const core=root.LuckyDexMagikarpSplashCore||(typeof require==='function'?require('./arcade-magikarp-splash-core.js'):null);
  const api=factory(root,core);root.LuckyDexMagikarpSplash=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexMagikarpSplashCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const laneIds=['magikarpSplashPlayerLane','magikarpSplashCpu1Lane','magikarpSplashCpu2Lane','magikarpSplashCpu3Lane'];
  const scoreIds=['magikarpSplashPlayerScore','magikarpSplashCpu1Score','magikarpSplashCpu2Score','magikarpSplashCpu3Score'];
  let opened=false,phase='closed',difficulty='normal',round=null,rafId=0,countdownEndsAt=0,countdownTotalMs=0,countdownRemainingMs=0,splashFlashUntil=0,pausedFrom=null,pauseStartedAt=0,pausedTimerMs=core.CONFIG.roundMs,completionHandled=false,finalResult=null,rng=Math.random,activePointer=null;
  const heldKeys=new Set();

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['countdown','running'].includes(phase))rafId=raf(frame);}
  function profile(){return core.difficultyProfile(difficulty);}
  function timerAt(t=now()){
    if(!round)return core.CONFIG.roundMs;
    if(phase==='paused')return pausedTimerMs;
    return Math.max(0,Math.round(round.cutoffAt-Number(t)));
  }
  function setControls(active){if($('magikarpSplashReady'))$('magikarpSplashReady').hidden=active;if($('magikarpSplashControls'))$('magikarpSplashControls').hidden=!active;}
  function renderDifficulty(){
    if($('magikarpSplashDifficultyLabel'))$('magikarpSplashDifficultyLabel').textContent=String(profile().label||difficulty).toUpperCase();
    if(typeof document!=='undefined')for(const btn of document.querySelectorAll?.('[data-magikarp-difficulty]')||[]){const active=btn.dataset.magikarpDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const best=root.state?.arcade?.magikarpSplash?.bestScores?.[difficulty]||0;if($('magikarpSplashBest'))$('magikarpSplashBest').textContent=best?`BEST ${best}`:'BEST —';
  }
  function renderLane(lane,index,t){
    const el=$(laneIds[index]);if(!el||!lane)return;
    const rise=Math.min(1.55,Math.max(0,Number(lane.y)||0));el.style?.setProperty?.('--magikarp-y',String(rise));el.style?.setProperty?.('--magikarp-rise',`${Math.round(-rise*78)}px`);
    el.classList?.toggle?.('is-airborne',lane.phase==='airborne');el.classList?.toggle?.('is-held',!!lane.held);el.classList?.toggle?.('is-landing',lane.phase==='landing');
    const hit=lane.lastImpactAt!=null&&Math.abs(Number(t)-Number(lane.lastImpactAt))<=130,quick=lane.lastQuickAt!=null&&Math.abs(Number(t)-Number(lane.lastQuickAt))<=180;
    el.classList?.toggle?.('is-counter-hit',hit);el.classList?.toggle?.('is-quick',quick);el.classList?.toggle?.('is-finished',!!round?.finalized);
    const score=$(scoreIds[index]);if(score)score.textContent=String(Number(lane.score)||0);
  }
  function renderStandings(rows){const el=$('magikarpSplashStandings');if(!el)return;if(!rows){el.hidden=true;el.textContent='';return;}el.hidden=false;el.textContent=rows.map(r=>`${core.placeFor(round,r.id)} · ${r.id==='player'?'YOU':r.id.replace('cpu','COM ')} · ${r.score}`).join('   ');}
  function render(t=now()){
    if(!round)return;
    const tm=timerAt(t);if($('magikarpSplashTimer'))$('magikarpSplashTimer').textContent=(tm/1000).toFixed(2);
    const place=core.placeFor(round,'player');if($('magikarpSplashPlace'))$('magikarpSplashPlace').textContent=place?`${place}${place===1?'ST':place===2?'ND':place===3?'RD':'TH'}`:'—';
    if($('magikarpSplashQuickChain'))$('magikarpSplashQuickChain').textContent=String(round.player?.quickChain||0);
    round.racers?.forEach((lane,i)=>renderLane(lane,i,t));
    const count=$('magikarpSplashCountdown');
    if(count){
      if(phase==='countdown'){
        const rem=Math.max(0,countdownEndsAt-Number(t)),third=Math.max(1,countdownTotalMs/3);count.hidden=false;count.textContent=rem>third*2?'3':rem>third?'2':'1';
      }else if(phase==='running'&&Number(t)<=splashFlashUntil){count.hidden=false;count.textContent='SPLASH!';}else count.hidden=true;
    }
    $('magikarpSplashStage')?.classList?.toggle?.('is-running',phase==='running');$('magikarpSplashStage')?.classList?.toggle?.('is-finished',phase==='finished');
  }
  function frame(t){
    rafId=0;
    if(phase==='countdown'){
      if(t>=countdownEndsAt){phase='running';splashFlashUntil=t+260;core.advanceRound(round,t,rng);}render(t);
    }else if(phase==='running'){
      core.advanceRound(round,t,rng);render(t);if(round.finalized){finishRound(t);return;}
    }
    schedule();
  }
  function showReady({difficulty:key=difficulty}={}){
    stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';phase='idle';round=core.createRound({difficulty,rng,nowMs:now()});pausedFrom=null;completionHandled=false;finalResult=null;activePointer=null;heldKeys.clear();setControls(false);renderStandings(null);renderDifficulty();render();return snapshot();
  }
  function selectDifficulty(key){if(phase!=='idle'||!core.DIFFICULTIES[key])return false;difficulty=key;round=core.createRound({difficulty,rng,nowMs:now()});renderDifficulty();render();return true;}
  function startRound({difficulty:key=difficulty,countdownMs=1200}={}){
    stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';const t=now(),delay=Math.max(0,Number(countdownMs)||0),start=t+delay;
    round=core.createRound({difficulty,rng,nowMs:start});phase=delay?'countdown':'running';countdownEndsAt=start;countdownTotalMs=delay;countdownRemainingMs=delay;splashFlashUntil=delay?0:t+260;pausedFrom=null;completionHandled=false;finalResult=null;activePointer=null;heldKeys.clear();setControls(true);renderStandings(null);renderDifficulty();render(t);schedule();return snapshot();
  }
  function press(){if(!round||phase!=='running')return {accepted:false};const r=core.pressPlayer(round,now());if(r?.accepted){try{root.navigator?.vibrate?.(5);}catch(_){ }render();}return r||{accepted:false};}
  function release(){if(!round||!['running','paused'].includes(phase))return false;const releaseAt=phase==='paused'?pauseStartedAt:now();const ok=core.releasePlayer(round,releaseAt);if(ok&&phase==='running')render();return !!ok;}
  function shiftRound(delta){
    if(!round||!delta)return;
    for(const k of ['startedAt','cutoffAt','finishedAt'])if(round[k]!=null&&Number.isFinite(Number(round[k])))round[k]=Number(round[k])+delta;
    const keys=['jumpStartedAt','releasedAt','expectedLandingAt','lastImpactAt','lastQuickAt','landedAt','recoveryUntil','queuedQuickAt','queuedQuickReleaseAt','nextActionAt','cpuReleaseAt'];
    for(const lane of round.racers||[])for(const k of keys)if(lane[k]!=null&&Number.isFinite(Number(lane[k])))lane[k]=Number(lane[k])+delta;
  }
  function pause(){if(!['countdown','running'].includes(phase))return false;const t=now();if(phase==='running')core.advanceRound(round,t,rng);pausedFrom=phase;pauseStartedAt=t;pausedTimerMs=timerAt(t);if(phase==='countdown')countdownRemainingMs=Math.max(0,countdownEndsAt-t);phase='paused';stopLoop();$('magikarpSplashStage')?.classList?.add?.('is-paused');if($('magikarpSplashPauseOverlay'))$('magikarpSplashPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||!pausedFrom)return false;const t=now(),delta=Math.max(0,t-pauseStartedAt),restore=pausedFrom;shiftRound(delta);if(restore==='countdown')countdownEndsAt=t+countdownRemainingMs;phase=restore;pausedFrom=null;$('magikarpSplashStage')?.classList?.remove?.('is-paused');if($('magikarpSplashPauseOverlay'))$('magikarpSplashPauseOverlay').hidden=true;render(t);schedule();return true;}
  function finishRound(t=now()){
    if(finalResult)return finalResult;if(!round)return null;
    const ranking=core.rankRound(round),place=core.placeFor(round,'player'),reward=core.rewardFor(place,difficulty),score=Number(round.player?.score)||0,bestQuick=Number(round.player?.bestQuickChain)||0;
    finalResult={place,reward,difficulty,score,bestQuickChain:bestQuick,ranking:ranking.map(r=>({id:r.id,score:r.score,place:core.placeFor(round,r.id)}))};phase='finished';stopLoop();setControls(false);renderStandings(ranking);render(t);
    if(!completionHandled){completionHandled=true;const p=platform();if(root.state&&p?.ensureArcadeState){root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.magikarpSplash,previousBest=Number(rec.bestScores?.[difficulty]||0),previousQuick=Number(rec.bestQuickChain||0);rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;if(place===1){rec.wins=Number(rec.wins||0)+1;rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty?.[difficulty]||0)+1;}if(place<=3)rec.podiums=Number(rec.podiums||0)+1;rec.bestScore=Math.max(Number(rec.bestScore||0),score);rec.bestScores[difficulty]=Math.max(Number(rec.bestScores?.[difficulty]||0),score);rec.bestQuickChain=Math.max(Number(rec.bestQuickChain||0),bestQuick);const award=p.awardRun?.({gameId:'magikarpSplash',label:'Magikarp’s Splash',score,coins:reward})||{coinsAwarded:reward};root.save?.();const ordinal=place===1?'1ST':place===2?'2ND':place===3?'3RD':'4TH',review={title:place===1?'SPLASH CHAMPION!':'TIME!',mode:'20-Second Splash',difficulty:profile().label,metricLabel:'SCORE',metricValue:String(score),scoreboard:ranking.map(r=>({rank:String(core.placeFor(round,r.id)),label:r.id==='player'?'YOU':r.id.replace('cpu','COM '),value:String(Number(r.score)||0),subtitle:`BEST QUICK ${Number(r.bestQuickChain)||0}`,player:r.id==='player'})),stats:[{label:'Best Quick Chain',value:String(bestQuick)},{label:'Final Place',value:ordinal}],pbs:[{label:`${profile().label} Best Score`,value:String(rec.bestScores[difficulty]||0),isNew:score>previousBest},{label:'Best Quick Chain',value:String(rec.bestQuickChain||0),isNew:bestQuick>previousQuick}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};session()?.showResult?.('magikarpSplash',{title:place===1?'SPLASH CHAMPION!':'TIME!',metricLabel:'SCORE',metricValue:String(score),coinsAwarded:award.coinsAwarded,bestText:`BEST ${rec.bestScore}`,details:ranking.map(r=>({title:`${core.placeFor(round,r.id)} · ${r.id==='player'?'YOU':r.id.replace('cpu','COM ')} · ${r.score}`,subtitle:r.id==='player'?`${profile().label} · ${ordinal}`:'',kind:r.id==='player'?'find':'neutral'})),review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});}}
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('magikarpSplash',$('magikarpSplashGame'));showReady({difficulty:'normal'});return true;}
  function close(){opened=false;stopLoop();phase='closed';round=null;pausedFrom=null;completionHandled=false;finalResult=null;activePointer=null;heldKeys.clear();setControls(false);renderStandings(null);if($('magikarpSplashPauseOverlay'))$('magikarpSplashPauseOverlay').hidden=true;return true;}
  function keyName(e){const k=String(e?.key||'').toLowerCase();return k===' '||k==='spacebar'?'space':k==='a'?'a':null;}
  function keydown(e){const k=keyName(e);if(!k||e?.repeat||heldKeys.has(k))return false;heldKeys.add(k);const r=press();if(r.accepted)e?.preventDefault?.();return !!r.accepted;}
  function keyup(e){const k=keyName(e);if(!k||!heldKeys.has(k))return false;heldKeys.delete(k);const ok=release();if(ok)e?.preventDefault?.();return ok;}
  function pointerDown(e){if(activePointer!=null)return;activePointer=e?.pointerId??0;e?.preventDefault?.();e?.stopPropagation?.();e?.currentTarget?.setPointerCapture?.(activePointer);press();}
  function pointerUp(e){const id=e?.pointerId??0;if(activePointer==null||id!==activePointer)return;activePointer=null;e?.preventDefault?.();e?.stopPropagation?.();release();}
  function snapshot(){
    const t=now(),player=round?.player||{};return {phase,difficulty,timerMs:timerAt(t),place:round?core.placeFor(round,'player'):4,quickChain:Number(player.quickChain||0),cutoffAt:round?.cutoffAt??null,finalized:!!round?.finalized,player:{score:Number(player.score||0),quickChain:Number(player.quickChain||0),bestQuickChain:Number(player.bestQuickChain||0),phase:player.phase||'grounded',y:Number(player.y||0),held:!!player.held,jumpStartedAt:player.jumpStartedAt??null,expectedLandingAt:player.expectedLandingAt??null,lastImpactAt:player.lastImpactAt??null,lastQuickAt:player.lastQuickAt??null},racers:(round?.racers||[]).map(r=>({id:r.id,score:Number(r.score||0),quickChain:Number(r.quickChain||0),bestQuickChain:Number(r.bestQuickChain||0),phase:r.phase,y:Number(r.y||0),held:!!r.held,jumpStartedAt:r.jumpStartedAt??null,expectedLandingAt:r.expectedLandingAt??null,nextActionAt:r.nextActionAt??null,recoveryUntil:r.recoveryUntil??null,lastImpactAt:r.lastImpactAt??null,lastQuickAt:r.lastQuickAt??null})),finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};
  }
  function wire(){
    $('magikarpSplashStart')?.addEventListener?.('click',()=>startRound());$('magikarpSplashResume')?.addEventListener?.('click',resume);const b=$('magikarpSplashButton');b?.addEventListener?.('pointerdown',pointerDown);b?.addEventListener?.('pointerup',pointerUp);b?.addEventListener?.('pointercancel',pointerUp);
    for(const btn of document.querySelectorAll?.('[data-magikarp-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.magikarpDifficulty));document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('keyup',keyup,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});
  }
  if(typeof document!=='undefined')wire();
  return {open,close,showReady,startRound,press,release,pause,resume,finishRound,selectDifficulty,snapshot};
});
