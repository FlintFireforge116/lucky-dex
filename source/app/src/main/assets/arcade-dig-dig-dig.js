(function(root,factory){
  const core=root.LuckyDexDigDigDigCore||(typeof require==='function'?require('./arcade-dig-dig-dig-core.js'):null);
  const api=factory(root,core);
  root.LuckyDexDigDigDig=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexDigDigDigCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const laneIds=['digDigDigPlayerLane','digDigDigCpu1Lane','digDigDigCpu2Lane','digDigDigCpu3Lane'];
  const digPulseMs=96;
  let opened=false,phase='closed',difficulty='normal',race=null,rafId=0,countdownEndsAt=0,countdownRemainingMs=0,digFlashUntil=0,pausedFrom=null,pauseStartedAt=0,pausedElapsedMs=0,completionHandled=false,finalResult=null,lastPoseSide=null,rng=Math.random;

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['countdown','racing'].includes(phase))rafId=raf(frame);}
  function profile(){return core.difficultyProfile(difficulty);}
  function liveRanking(){
    if(!race)return [];
    return race.racers.slice().sort((a,b)=>{
      const af=a.finishedAt!=null,bf=b.finishedAt!=null;
      if(af&&bf)return a.finishedAt-b.finishedAt||a.index-b.index;
      if(af!==bf)return af?-1:1;
      return Number(b.progress||0)-Number(a.progress||0)||Number(b.lastAcceptedAt??-Infinity)-Number(a.lastAcceptedAt??-Infinity)||a.index-b.index;
    });
  }
  function elapsedAt(t=now()){
    if(!race||race.startedAt==null)return 0;
    if(phase==='paused'&&pausedFrom==='racing')return pausedElapsedMs;
    const end=phase==='finished'&&race.finalizedAt!=null?race.finalizedAt:(Number(t)||0);
    return Math.max(0,end-race.startedAt);
  }
  function setControls(active){const ready=$('digDigDigReady'),controls=$('digDigDigControls');if(ready)ready.hidden=active;if(controls)controls.hidden=!active;}
  function renderDifficulty(){
    if($('digDigDigDifficultyLabel'))$('digDigDigDifficultyLabel').textContent=profile().label.toUpperCase();
    if(typeof document!=='undefined')for(const btn of document.querySelectorAll?.('[data-dig-difficulty]')||[]){const active=btn.dataset.digDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const best=root.state?.arcade?.digDigDig?.bestTimes?.[difficulty];if($('digDigDigBest'))$('digDigDigBest').textContent=best?`BEST ${(best/1000).toFixed(2)} SEC`:'BEST —';
  }
  function renderLane(racer,index,t){
    const lane=$(laneIds[index]);if(!lane||!racer)return;
    const progress=Math.min(core.CONFIG.raceDistance,Number(racer.progress||0)),stamp=Number(racer.lastAcceptedAt);
    const digging=racer.finishedAt==null&&racer.lastAcceptedAt!=null&&Math.max(0,(Number(t)||0)-stamp)<=digPulseMs;
    lane.style?.setProperty?.('--dig-scroll',`${Math.round((progress/core.CONFIG.raceDistance)*320)}px`);
    lane.style?.setProperty?.('--dig-depth',String(progress/core.CONFIG.raceDistance));
    lane.classList?.toggle?.('is-finished',racer.finishedAt!=null);
    lane.classList?.toggle?.('is-mid',progress>=27&&progress<54);
    lane.classList?.toggle?.('is-deep',progress>=54);
    lane.classList?.toggle?.('is-breakthrough',progress>=72);
    lane.classList?.toggle?.('is-dig-left',digging&&racer.lastAcceptedSide==='left');
    lane.classList?.toggle?.('is-dig-right',digging&&racer.lastAcceptedSide==='right');
    lane.classList?.toggle?.('is-digging',digging);
    const p=lane.querySelector?.('[data-dig-progress]');if(p)p.textContent=`${progress}/${core.CONFIG.raceDistance}`;
  }
  function renderStandings(ranking){
    const panel=$('digDigDigStandings');if(!panel)return;
    if(!ranking?.length){panel.hidden=true;panel.textContent='';return;}
    const labels={player:'YOU',cpu1:'COM 1',cpu2:'COM 2',cpu3:'COM 3'};
    panel.hidden=false;
    panel.innerHTML=`<b>RACE COMPLETE</b><ol>${ranking.map(r=>`<li>${labels[r.id]||r.id}</li>`).join('')}</ol>`;
  }
  function render(t=now()){
    const racers=race?.racers||[];racers.forEach((r,i)=>renderLane(r,i,t));
    const ranking=liveRanking(),place=Math.max(0,ranking.findIndex(r=>r.id==='player'))+1;
    if($('digDigDigPlace'))$('digDigDigPlace').textContent=place?`${place}${place===1?'ST':place===2?'ND':place===3?'RD':'TH'}`:'—';
    if($('digDigDigTimer'))$('digDigDigTimer').textContent=(elapsedAt(t)/1000).toFixed(2);
    const expected=race?.player?.lastAcceptedSide==='left'?'right':race?.player?.lastAcceptedSide==='right'?'left':null;
    const next=$('digDigDigNext');if(next){next.textContent=expected==='right'?'R':expected==='left'?'L':'L / R';next.parentElement?.classList?.toggle?.('expect-left',expected==='left');next.parentElement?.classList?.toggle?.('expect-right',expected==='right');}
    $('digDigDigLeft')?.classList?.toggle?.('is-next',expected==='left');$('digDigDigRight')?.classList?.toggle?.('is-next',expected==='right');
    const count=$('digDigDigCountdown');
    if(count){
      if(phase==='countdown'){const rem=Math.max(0,countdownEndsAt-(Number(t)||0));const sec=Math.ceil(rem/400);count.hidden=false;count.textContent=sec>=3?'3':sec===2?'2':'1';}
      else if(phase==='racing'&&(Number(t)||0)<digFlashUntil){count.hidden=false;count.textContent='DIG!';}
      else count.hidden=true;
    }
    session()?.update?.('digDigDig',{runText:'80 digs · 4 Sandshrew',rewardText:'Placement · Lucky Coins',liveLabel:'PLACE',liveValue:place?String(place):'—'});
  }
  function transitionFromCore(t){
    if(!race)return;
    if(race.finalized&&phase!=='finished')finishRound(t);
  }
  function frame(ts){
    rafId=0;const t=Number(ts)||now();
    if(phase==='countdown'){
      if(t>=countdownEndsAt){phase='racing';countdownRemainingMs=0;digFlashUntil=t+220;}
    }
    if(phase==='racing'){
      core.advanceRace(race,t,rng);transitionFromCore(t);
    }
    render(t);schedule();
  }
  function showReady({difficulty:key=difficulty}={}){
    stopLoop();session()?.hideResult?.();difficulty=core.DIFFICULTIES[key]?key:'normal';phase='idle';race=core.createRace({difficulty,rng,nowMs:now()});pausedFrom=null;pausedElapsedMs=0;completionHandled=false;finalResult=null;lastPoseSide=null;countdownRemainingMs=0;digFlashUntil=0;renderStandings(null);setControls(false);renderDifficulty();render();return snapshot();
  }
  function selectDifficulty(key){if(phase!=='idle'||!core.DIFFICULTIES[key])return false;difficulty=key;race=core.createRace({difficulty,rng,nowMs:now()});renderDifficulty();render();return true;}
  function startRound({difficulty:key=difficulty,countdownMs=1200}={}){
    stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';const t=now(),delay=Math.max(0,Number(countdownMs)||0),startAt=t+delay;
    race=core.createRace({difficulty,rng,nowMs:startAt});phase=delay>0?'countdown':'racing';countdownEndsAt=startAt;countdownRemainingMs=delay;pausedFrom=null;pausedElapsedMs=0;completionHandled=false;finalResult=null;lastPoseSide=null;renderStandings(null);setControls(true);renderDifficulty();render(t);schedule();return snapshot();
  }
  function input(side){
    if(!race||phase!=='racing')return {accepted:false,progress:Number(race?.player?.progress||0),finished:Boolean(race?.player?.finishedAt!=null)};
    const t=now(),result=core.acceptInput(race.player,String(side).toLowerCase(),t);
    if(result.accepted){lastPoseSide=String(side).toLowerCase();core.advanceRace(race,t,rng);transitionFromCore(t);render(t);}
    return result;
  }
  function shiftRace(delta){
    if(!race||!delta)return;
    race.startedAt+=delta;
    for(const r of race.racers){if(r.nextActionAt!=null)r.nextActionAt+=delta;if(r.lastAcceptedAt!=null)r.lastAcceptedAt+=delta;if(r.finishedAt!=null)r.finishedAt+=delta;}
    if(race.firstFinishAt!=null)race.firstFinishAt+=delta;if(race.finalizedAt!=null)race.finalizedAt+=delta;
  }
  function pause(){
    if(!['countdown','racing'].includes(phase))return false;
    const t=now();pausedFrom=phase;pauseStartedAt=t;pausedElapsedMs=elapsedAt(t);if(phase==='countdown')countdownRemainingMs=Math.max(0,countdownEndsAt-t);phase='paused';stopLoop();$('digDigDigStage')?.classList?.add?.('is-paused');if($('digDigDigPauseOverlay'))$('digDigDigPauseOverlay').hidden=false;return true;
  }
  function resume(){
    if(phase!=='paused'||!pausedFrom)return false;
    const t=now(),delta=Math.max(0,t-pauseStartedAt),restore=pausedFrom;pausedFrom=null;phase=restore;if(restore==='countdown'){countdownEndsAt=t+countdownRemainingMs;shiftRace(delta);}else shiftRace(delta);
    $('digDigDigStage')?.classList?.remove?.('is-paused');if($('digDigDigPauseOverlay'))$('digDigDigPauseOverlay').hidden=true;render(t);schedule();return true;
  }
  function finishRound(t=now()){
    if(finalResult)return finalResult;if(!race)return null;
    const ranking=core.finalizeRace(race,t),playerIndex=ranking.findIndex(r=>r.id==='player'),place=playerIndex>=0?playerIndex+1:4,reward=core.rewardFor(place,difficulty),playerTimeMs=race.player.finishedAt!=null?Math.max(0,Math.round(race.player.finishedAt-race.startedAt)):null;
    finalResult={place,reward,difficulty,playerTimeMs,ranking:ranking.map(r=>r.id)};phase='finished';stopLoop();setControls(false);renderStandings(ranking);render(t);
    if(!completionHandled){
      completionHandled=true;
      const p=platform();
      if(root.state&&p?.ensureArcadeState){
        root.state.arcade=p.ensureArcadeState(root.state.arcade);
        const rec=root.state.arcade.digDigDig,previousBest=rec.bestTimes?.[difficulty]==null?null:Number(rec.bestTimes[difficulty]);
        rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;
        if(place===1){rec.wins=Number(rec.wins||0)+1;rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty?.[difficulty]||0)+1;}
        if(place<=3)rec.podiums=Number(rec.podiums||0)+1;
        if(playerTimeMs!=null){
          if(rec.bestTimeMs==null||playerTimeMs<Number(rec.bestTimeMs))rec.bestTimeMs=playerTimeMs;
          if(rec.bestTimes[difficulty]==null||playerTimeMs<Number(rec.bestTimes[difficulty]))rec.bestTimes[difficulty]=playerTimeMs;
        }
        const award=p.awardRun?.({gameId:'digDigDig',label:'Dig! Dig! Dig!',score:Math.max(0,5-place),coins:reward})||{coinsAwarded:reward};
        root.save?.();
        const ordinal=place===1?'1ST':place===2?'2ND':place===3?'3RD':'4TH';
        const details=[{title:`${profile().label} · ${ordinal}`,subtitle:`${reward} Lucky Coins · 80 digs`,kind:'find'}];
        if(playerTimeMs!=null)details.push({title:`Time · ${(playerTimeMs/1000).toFixed(2)} sec`,subtitle:`Best · ${rec.bestTimeMs!=null?(rec.bestTimeMs/1000).toFixed(2)+' sec':'—'}`,kind:'neutral'});
        const scoreboard=ranking.map((r,index)=>{const elapsed=r.finishedAt!=null?Math.max(0,Math.round(r.finishedAt-race.startedAt)):null;return {rank:String(index+1),label:r.id==='player'?'YOU':r.id.replace('cpu','COM '),value:elapsed!=null?`${(elapsed/1000).toFixed(2)} SEC`:`${Number(r.progress||0)}/80 DIGS`,subtitle:r.finishedAt!=null?'FINISHED':'INCOMPLETE',player:r.id==='player'};});
        const review={title:place===1?'DIGGING CHAMPION!':'RACE COMPLETE',mode:'80-Dig Race',difficulty:profile().label,metricLabel:'PLACE',metricValue:ordinal,scoreboard,stats:[{label:'Your Time',value:playerTimeMs!=null?`${(playerTimeMs/1000).toFixed(2)} SEC`:'DNF'},{label:'Progress',value:`${Number(race.player.progress||0)}/80 DIGS`}],pbs:[{label:`${profile().label} Best`,value:rec.bestTimes?.[difficulty]!=null?`${(Number(rec.bestTimes[difficulty])/1000).toFixed(2)} SEC`:'—',isNew:playerTimeMs!=null&&(previousBest==null||playerTimeMs<previousBest)}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};
        session()?.showResult?.('digDigDig',{title:place===1?'DIGGING CHAMPION!':'RACE COMPLETE',metricLabel:'PLACE',metricValue:ordinal,coinsAwarded:award.coinsAwarded,bestText:rec.bestTimeMs!=null?`BEST ${(rec.bestTimeMs/1000).toFixed(2)} SEC`:'',details,review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
      }
    }
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('digDigDig',$('digDigDigGame'));showReady({difficulty:'normal'});return true;}
  function close(){opened=false;stopLoop();phase='closed';race=null;pausedFrom=null;completionHandled=false;finalResult=null;lastPoseSide=null;setControls(false);renderStandings(null);if($('digDigDigPauseOverlay'))$('digDigDigPauseOverlay').hidden=true;return true;}
  function keyboardSide(e){if(e?.repeat)return null;const k=String(e?.key||'').toLowerCase();if(k==='arrowleft'||k==='a')return'left';if(k==='arrowright'||k==='d')return'right';return null;}
  function keydown(e){const side=keyboardSide(e);if(!side)return false;const result=input(side);if(result.accepted)e?.preventDefault?.();return result.accepted;}
  function pointerInput(side,e){e?.preventDefault?.();input(side);}
  function snapshot(){
    const ranking=liveRanking();return {phase,difficulty,elapsedMs:elapsedAt(),countdownRemainingMs:phase==='countdown'?Math.max(0,countdownEndsAt-now()):countdownRemainingMs,firstFinishAt:race?.firstFinishAt??null,currentRanking:ranking.map(r=>r.id),racers:(race?.racers||[]).map(r=>({id:r.id,progress:r.progress,lastAcceptedSide:r.lastAcceptedSide,lastAcceptedAt:r.lastAcceptedAt,finishedAt:r.finishedAt,nextActionAt:r.nextActionAt??null})),playerLastSide:race?.player?.lastAcceptedSide??null,playerExpectedSide:race?.player?.lastAcceptedSide?(race.player.lastAcceptedSide==='left'?'right':'left'):null,completionHandled,finalResult:finalResult?{...finalResult,ranking:[...finalResult.ranking]}:null};
  }
  function wire(){
    $('digDigDigStart')?.addEventListener?.('click',()=>startRound());$('digDigDigResume')?.addEventListener?.('click',resume);
    $('digDigDigLeft')?.addEventListener?.('pointerdown',e=>pointerInput('left',e));$('digDigDigRight')?.addEventListener?.('pointerdown',e=>pointerInput('right',e));
    for(const btn of document.querySelectorAll?.('[data-dig-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.digDifficulty));
    document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});
  }
  if(typeof document!=='undefined')wire();
  return {open,close,showReady,startRound,input,pause,resume,finishRound,snapshot,selectDifficulty};
});
