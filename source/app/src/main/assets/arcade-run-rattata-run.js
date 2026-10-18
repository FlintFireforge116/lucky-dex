(function(root,factory){
  const core=root.LuckyDexRunRattataRunCore||(typeof require==='function'?require('./arcade-run-rattata-run-core.js'):null);
  const view=root.LuckyDexRunRattataRunView||(typeof require==='function'?require('./arcade-run-rattata-run-view.js'):null);
  const api=factory(root,core,view);root.LuckyDexRunRattataRun=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core,view){
  'use strict';
  if(!core)throw new Error('LuckyDexRunRattataRunCore required');
  if(!view)throw new Error('LuckyDexRunRattataRunView required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const laneIds=['runRattataRunPlayerLane','runRattataRunCpu1Lane','runRattataRunCpu2Lane','runRattataRunCpu3Lane'];
  let opened=false,phase='closed',difficulty='normal',race=null,rafId=0,countdownEndsAt=0,countdownRemainingMs=0,pausedFrom=null,pauseStartedAt=0,pausedElapsedMs=0,completionHandled=false,finalResult=null,rng=Math.random;

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['countdown','racing'].includes(phase))rafId=raf(frame);}
  function profile(){return core.difficultyProfile(difficulty);}
  function elapsedAt(t=now()){
    if(!race)return 0;if(phase==='countdown')return 0;if(phase==='paused'&&pausedFrom==='racing')return pausedElapsedMs;
    const end=phase==='finished'&&race.finalizedAt!=null?race.finalizedAt:Number(t)||0;return Math.max(0,end-Number(race.startedAt||0));
  }
  function setControls(active){const ready=$('runRattataRunReady'),controls=$('runRattataRunControls');if(ready)ready.hidden=active;if(controls)controls.hidden=!active;}
  function ensureHurdles(){
    if(typeof document==='undefined')return;
    const host=$('runRattataRunHurdles');if(!host||host.childElementCount)return;
    for(const pos of core.CONFIG.hurdles){const h=document.createElement('i');h.className='rattata-hurdle';h.dataset.distance=String(pos);for(let lane=0;lane<4;lane++)h.appendChild(document.createElement('span'));host.appendChild(h);}
  }
  function renderDifficulty(){
    if($('runRattataRunDifficultyLabel'))$('runRattataRunDifficultyLabel').textContent=profile().label.toUpperCase();
    if(typeof document!=='undefined')for(const btn of document.querySelectorAll?.('[data-rattata-difficulty]')||[]){const active=btn.dataset.rattataDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const best=root.state?.arcade?.runRattataRun?.bestTimes?.[difficulty];if($('runRattataRunBest'))$('runRattataRunBest').textContent=best?`BEST ${(Number(best)/1000).toFixed(2)} SEC`:'BEST —';
  }
  function renderLane(racer,index,t,camera,width,height){
    const lane=$(laneIds[index]);if(!lane||!racer)return;const pct=Math.max(0,Math.min(100,(Number(racer.progress||0)/core.CONFIG.courseDistance)*100));
    const x=view.laneToX(index,width),y=view.worldToY(Number(racer.progress||0),camera,height);
    lane.style?.setProperty?.('--rattata-x',`${x}px`);lane.style?.setProperty?.('--rattata-y',`${y}px`);lane.style?.setProperty?.('--rattata-momentum',String(Math.max(0,Math.min(1,Number(racer.momentum||0)))));
    lane.classList?.toggle?.('is-airborne',core.isAirborne(racer,t));lane.classList?.toggle?.('is-stumbling',core.isStumbling(racer,t));lane.classList?.toggle?.('is-finished',racer.finishedAt!=null);lane.classList?.toggle?.('is-offscreen',y<-70||y>height+70);
    const progress=lane.querySelector?.('[data-rattata-progress]');if(progress)progress.textContent=racer.finishedAt!=null?'FINISH':`${Math.round(pct)}%`;
    const clears=lane.querySelector?.('[data-rattata-clears]');if(clears)clears.textContent=`${racer.hurdlesCleared}/${core.CONFIG.hurdles.length}`;
    const bar=lane.querySelector?.('[data-rattata-momentum]');if(bar)bar.style.width=`${Math.round(Number(racer.momentum||0)*100)}%`;
  }
  function renderCourse(t){
    ensureHurdles();const course=$('runRattataRunCourse');if(!course)return;const width=Math.max(1,Number(course.clientWidth)||360),height=Math.max(1,Number(course.clientHeight)||320),camera=Number(race?.player?.progress||0);
    course.style?.setProperty?.('--rattata-course-offset',`${view.courseOffset(camera)}px`);
    const hurdles=$('runRattataRunHurdles');if(hurdles)for(const h of hurdles.children||[]){const distance=Number(h.dataset?.distance||0),y=view.worldToY(distance,camera,height);h.style?.setProperty?.('--rattata-hurdle-y',`${y}px`);h.style.visibility=y<-view.CONFIG.hurdleCullMargin||y>height+view.CONFIG.hurdleCullMargin?'hidden':'visible';}
    const finish=$('runRattataRunFinish');if(finish){const y=view.worldToY(core.CONFIG.courseDistance,camera,height);finish.style?.setProperty?.('--rattata-finish-y',`${y}px`);finish.style.visibility=y<-32||y>height+32?'hidden':'visible';}
    if(race)race.racers.forEach((r,i)=>renderLane(r,i,t,camera,width,height));
  }
  function render(t=now()){
    const ranking=race?core.rankRace(race):[],place=race?ranking.findIndex(r=>r.id==='player')+1:0;
    if($('runRattataRunPlace'))$('runRattataRunPlace').textContent=place>0?String(place):'—';if($('runRattataRunTimer'))$('runRattataRunTimer').textContent=(elapsedAt(t)/1000).toFixed(2);
    renderCourse(t);
    const cd=$('runRattataRunCountdown');if(cd){if(phase==='countdown'){const rem=Math.max(0,countdownEndsAt-t),step=Math.ceil(rem/400);cd.hidden=false;cd.textContent=step>=3?'3':step===2?'2':'1';}else cd.hidden=true;}
    const grace=$('runRattataRunGrace');if(grace){const active=phase==='racing'&&race?.graceEndsAt!=null&&!race.finalized;if(active){grace.hidden=false;const b=grace.querySelector?.('b');if(b)b.textContent=Math.max(0,(race.graceEndsAt-t)/1000).toFixed(1);}else grace.hidden=true;}
    session()?.update?.('runRattataRun',{runText:'Sprint · 6 hurdles',rewardText:'Placement · Lucky Coins',liveLabel:'PLACE',liveValue:place>0?String(place):'—'});
  }
  function transitionFromCore(t){if(race?.finalized&&phase!=='finished')finishRound(t);}
  function frame(){rafId=0;const t=now();if(phase==='countdown'&&t>=countdownEndsAt){phase='racing';countdownRemainingMs=0;}if(phase==='racing'){core.advanceRace(race,t,rng);transitionFromCore(t);}render(t);schedule();}
  function showReady({difficulty:key=difficulty}={}){
    stopLoop();session()?.hideResult?.();difficulty=core.DIFFICULTIES[key]?key:'normal';phase='idle';race=core.createRace({difficulty,rng,nowMs:now()});pausedFrom=null;pausedElapsedMs=0;completionHandled=false;finalResult=null;countdownRemainingMs=0;setControls(false);renderDifficulty();render();return snapshot();
  }
  function selectDifficulty(key){if(phase!=='idle'||!core.DIFFICULTIES[key])return false;difficulty=key;race=core.createRace({difficulty,rng,nowMs:now()});renderDifficulty();render();return true;}
  function startRound({difficulty:key=difficulty,countdownMs=1200}={}){
    stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';const t=now(),delay=Math.max(0,Number(countdownMs)||0),startAt=t+delay;race=core.createRace({difficulty,rng,nowMs:startAt});phase=delay>0?'countdown':'racing';countdownEndsAt=startAt;countdownRemainingMs=delay;pausedFrom=null;pausedElapsedMs=0;completionHandled=false;finalResult=null;setControls(true);renderDifficulty();render(t);schedule();return snapshot();
  }
  function run(){if(!race||phase!=='racing')return {accepted:false};const t=now(),out=core.pressRun(race,race.player,t);if(out.accepted){core.advanceRace(race,t,rng);transitionFromCore(t);render(t);}return out;}
  function jump(){if(!race||phase!=='racing')return {accepted:false};const t=now(),out=core.pressJump(race,race.player,t);if(out.accepted)render(t);return out;}
  function shiftRace(delta){
    if(!race||!delta)return;race.startedAt+=delta;for(const r of race.racers){for(const key of ['lastMomentumAt','lastRunAt','jumpUntil','jumpCooldownUntil','stumblingUntil','finishedAt','nextRunAt'])if(r[key]!=null&&Number(r[key])>0)r[key]+=delta;}for(const key of ['firstFinishAt','graceEndsAt','finalizedAt'])if(race[key]!=null)race[key]+=delta;
  }
  function pause(){if(!['countdown','racing'].includes(phase))return false;const t=now();pausedFrom=phase;pauseStartedAt=t;pausedElapsedMs=elapsedAt(t);if(phase==='countdown')countdownRemainingMs=Math.max(0,countdownEndsAt-t);phase='paused';stopLoop();$('runRattataRunStage')?.classList?.add?.('is-paused');if($('runRattataRunPauseOverlay'))$('runRattataRunPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||!pausedFrom)return false;const t=now(),delta=Math.max(0,t-pauseStartedAt),restore=pausedFrom;pausedFrom=null;phase=restore;if(restore==='countdown'){countdownEndsAt=t+countdownRemainingMs;shiftRace(delta);}else shiftRace(delta);$('runRattataRunStage')?.classList?.remove?.('is-paused');if($('runRattataRunPauseOverlay'))$('runRattataRunPauseOverlay').hidden=true;render(t);schedule();return true;}
  function finishRound(t=now()){
    if(finalResult)return finalResult;
    if(!race)return null;
    const ranking=core.finalizeRace(race,t);
    const found=ranking.findIndex(r=>r.id==='player');
    const place=found>=0?found+1:4;
    const player=race.player;
    const reward=core.rewardFor(place,difficulty);
    const playerTimeMs=player.finishedAt==null?null:Math.max(0,Math.round(player.finishedAt-race.startedAt));
    const flawless=player.finishedAt!=null&&Number(player.hurdlesHit||0)===0;
    finalResult={place,reward,difficulty,playerTimeMs,flawless,ranking:ranking.map(r=>r.id)};
    phase='finished';stopLoop();setControls(false);render(t);
    if(completionHandled)return finalResult;
    completionHandled=true;
    const p=platform();
    if(!root.state||!p?.ensureArcadeState)return finalResult;
    root.state.arcade=p.ensureArcadeState(root.state.arcade);
    const rec=root.state.arcade.runRattataRun;
    const prevBest=rec.bestTimes?.[difficulty]==null?null:Number(rec.bestTimes[difficulty]);
    rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;
    if(place===1){
      rec.wins=Number(rec.wins||0)+1;
      rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty?.[difficulty]||0)+1;
      if(flawless)rec.flawlessWins=Number(rec.flawlessWins||0)+1;
    }
    if(place<=3)rec.podiums=Number(rec.podiums||0)+1;
    rec.totalHurdlesCleared=Number(rec.totalHurdlesCleared||0)+Number(player.hurdlesCleared||0);
    rec.totalHurdlesHit=Number(rec.totalHurdlesHit||0)+Number(player.hurdlesHit||0);
    if(playerTimeMs!=null){
      if(rec.bestTimeMs==null||playerTimeMs<Number(rec.bestTimeMs))rec.bestTimeMs=playerTimeMs;
      if(rec.bestTimes[difficulty]==null||playerTimeMs<Number(rec.bestTimes[difficulty]))rec.bestTimes[difficulty]=playerTimeMs;
    }
    const award=p.awardRun?.({gameId:'runRattataRun',label:'Run, Rattata, Run',score:Math.max(0,5-place),coins:reward})||{coinsAwarded:reward};
    root.save?.();
    const ordinal=place===1?'1ST':place===2?'2ND':place===3?'3RD':'4TH';
    const scoreboard=ranking.map((r,i)=>({
      rank:String(i+1),
      label:r.id==='player'?'YOU':r.label||`COM ${i}`,
      value:r.finishedAt!=null?`${((r.finishedAt-race.startedAt)/1000).toFixed(2)} SEC`:`${Math.round((r.progress/core.CONFIG.courseDistance)*100)}%`,
      subtitle:`HURDLES ${r.hurdlesCleared}/${core.CONFIG.hurdles.length}${r.hurdlesHit?` · ${r.hurdlesHit} HIT`:''}`,
      player:r.id==='player'
    }));
    const review={
      title:place===1?'RATTATA CHAMPION!':'RACE COMPLETE',mode:'Obstacle Sprint',difficulty:profile().label,metricLabel:'PLACE',metricValue:ordinal,scoreboard,
      stats:[
        {label:'Your Time',value:playerTimeMs!=null?`${(playerTimeMs/1000).toFixed(2)} SEC`:'DNF'},
        {label:'Run Presses',value:String(player.runPresses||0)},
        {label:'Hurdles Cleared',value:`${player.hurdlesCleared}/${core.CONFIG.hurdles.length}`},
        {label:'Hurdles Hit',value:String(player.hurdlesHit||0)},
        {label:'Flawless',value:flawless?'YES':'NO'}
      ],
      pbs:[{label:`${profile().label} Best`,value:rec.bestTimes?.[difficulty]!=null?`${(Number(rec.bestTimes[difficulty])/1000).toFixed(2)} SEC`:'—',isNew:playerTimeMs!=null&&(prevBest==null||playerTimeMs<prevBest)}],
      rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]
    };
    session()?.showResult?.('runRattataRun',{
      title:place===1?'RATTATA CHAMPION!':'RACE COMPLETE',metricLabel:'PLACE',metricValue:ordinal,coinsAwarded:award.coinsAwarded,
      bestText:rec.bestTimeMs!=null?`BEST ${(Number(rec.bestTimeMs)/1000).toFixed(2)} SEC`:'',review,replayLabel:'PLAY AGAIN',
      onReplay:()=>showReady({difficulty}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()
    });
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('runRattataRun',$('runRattataRunGame'));showReady({difficulty:'normal'});return true;}
  function close(){opened=false;stopLoop();phase='closed';race=null;pausedFrom=null;completionHandled=false;finalResult=null;setControls(false);if($('runRattataRunPauseOverlay'))$('runRattataRunPauseOverlay').hidden=true;return true;}
  function keydown(e){if(e?.repeat)return false;const k=String(e?.key||'').toLowerCase();let out=null;if(k==='a'||k===' '||k==='enter')out=run();else if(k==='arrowup'||k==='w')out=jump();else return false;if(out?.accepted)e?.preventDefault?.();return !!out?.accepted;}
  function snapshot(){const ranking=race?core.rankRace(race):[];return {phase,difficulty,elapsedMs:elapsedAt(),place:race?ranking.findIndex(r=>r.id==='player')+1:null,firstFinishAt:race?.firstFinishAt??null,graceEndsAt:race?.graceEndsAt??null,racers:(race?.racers||[]).map(r=>({id:r.id,progress:r.progress,momentum:r.momentum,hurdlesCleared:r.hurdlesCleared,hurdlesHit:r.hurdlesHit,finishedAt:r.finishedAt,airborne:core.isAirborne(r,now()),stumbling:core.isStumbling(r,now())})),finalResult:finalResult?{...finalResult,ranking:[...finalResult.ranking]}:null};}
  function wire(){if(typeof document==='undefined')return;$('runRattataRunStart')?.addEventListener?.('click',()=>startRound());$('runRattataRunResume')?.addEventListener?.('click',resume);$('runRattataRunRun')?.addEventListener?.('pointerdown',e=>{e.preventDefault?.();run();});$('runRattataRunJump')?.addEventListener?.('pointerdown',e=>{e.preventDefault?.();jump();});for(const btn of document.querySelectorAll?.('[data-rattata-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.rattataDifficulty));document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  wire();return {open,close,showReady,startRound,run,jump,pause,resume,finishRound,selectDifficulty,snapshot};
});
