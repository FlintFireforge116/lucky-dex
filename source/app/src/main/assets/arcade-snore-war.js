(function(root,factory){
  const core=root.LuckyDexSnoreWarCore||(typeof require==='function'?require('./arcade-snore-war-core.js'):null);
  const api=factory(root,core);
  root.LuckyDexSnoreWar=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>root.performance?.now?.()??Date.now();
  const platform=()=>root.LuckyDexArcadePlatform||(typeof require==='function'?require('./arcade-platform.js'):null);
  const session=()=>root.LuckyDexArcadeSession;
  const rng=()=>Math.random();
  const racerIds=['snoreWarPlayer','snoreWarCpu1','snoreWarCpu2','snoreWarCpu3'];
  let race=null,difficulty='normal',mode='match',phase='closed',opened=false,rafId=0,pausedFrom=null,pauseStartedAt=0,completionHandled=false,finalResult=null;
  function profile(){return core.difficultyProfile(difficulty);}
  function stopLoop(){if(rafId){root.cancelAnimationFrame?.(rafId);rafId=0;}}
  function schedule(){if(!rafId&&phase==='racing')rafId=root.requestAnimationFrame?.(frame)||0;}
  function setControls(on){const ready=$('snoreWarReady');if(ready)ready.hidden=!!on;const c=$('snoreWarControls');if(c)c.hidden=!on;const b=$('snoreWarButton');if(b)b.disabled=!on;}
  function liveRanking(){return race?core.rankRace(race):[];}
  function renderDifficulty(){
    if($('snoreWarDifficultyLabel'))$('snoreWarDifficultyLabel').textContent=profile().label;
    for(const btn of document.querySelectorAll?.('[data-snore-war-difficulty]')||[]){const active=btn.dataset.snoreWarDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    for(const btn of document.querySelectorAll?.('[data-snore-war-mode]')||[]){const active=btn.dataset.snoreWarMode===mode;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const rec=root.state?.arcade?.snoreWar;
    if($('snoreWarBest'))$('snoreWarBest').textContent=mode==='endless'?(rec?.bestEndlessHits?`BEST ${rec.bestEndlessHits} HITS`:'BEST —'):(rec?.bestStreak?`BEST STREAK ${rec.bestStreak}`:'BEST —');
    if($('snoreWarInstructions'))$('snoreWarInstructions').textContent=mode==='endless'?'Survive as long as you can. The pendulum keeps accelerating and your third miss ends the run.':'Press A as the pendulum crosses the red centre marker. Miss and Drowzee sleeps for two swings. Last one awake wins.';
  }
  function renderRacer(r,index,t){const el=$(racerIds[index]);if(!el||!r)return;const sleeping=core.isSleeping(r,race.currentCrossing);el.classList?.toggle?.('is-sleeping',sleeping);el.classList?.toggle?.('is-leading',mode==='match'&&liveRanking()[0]?.id===r.id);el.classList?.toggle?.('is-hit',r.lastHitAt!=null&&t-r.lastHitAt<180);const status=el.querySelector?.('[data-snore-status]');if(status)status.textContent=sleeping?'Z Z Z':'AWAKE';const hits=el.querySelector?.('[data-snore-hits]');if(hits)hits.textContent=String(r.hits||0);const streak=el.querySelector?.('[data-snore-streak]');if(streak)streak.textContent=`×${r.streak||0}`;}
  function renderStandings(ranking){const panel=$('snoreWarStandings');if(!panel)return;if(!ranking?.length){panel.hidden=true;panel.textContent='';return;}panel.hidden=false;panel.innerHTML=ranking.map((r,i)=>`<div${r.id==='player'?' class="player"':''}><b>${i+1}</b><span>${r.id==='player'?'YOU':r.label}</span><em>${r.hits} HIT${r.hits===1?'':'S'}</em></div>`).join('');}
  function render(t=now()){
    if(!race)return;const ranking=liveRanking(),place=ranking.findIndex(r=>r.id==='player')+1,liveValue=mode==='endless'?`×${race.player.streak||0}`:(place?String(place):'—');
    if($('snoreWarMetricLabel'))$('snoreWarMetricLabel').textContent=mode==='endless'?'STREAK':'PLACE';if($('snoreWarPlace'))$('snoreWarPlace').textContent=liveValue;race.racers.forEach((r,i)=>renderRacer(r,i,t));
    const pend=$('snoreWarPendulum'),pos=core.pendulumPosition(race,t);if(pend){pend.style?.setProperty?.('--snore-angle',`${(pos*43).toFixed(2)}deg`);pend.classList?.toggle?.('is-center',Math.abs(pos)<.075);}
    const arena=$('snoreWarArena');arena?.classList?.toggle?.('player-sleeping',core.isSleeping(race.player,race.currentCrossing));
    session()?.update?.('snoreWar',{runText:mode==='endless'?'3 misses · pendulum keeps accelerating':'Hit A at centre · last awake wins',rewardText:mode==='endless'?'Hits · Lucky Coins':'Placement · Lucky Coins',liveLabel:mode==='endless'?'STREAK':'PLACE',liveValue});
  }
  function frame(){rafId=0;const t=now();if(phase==='racing'){core.advanceRace(race,t,rng);if(race.finalized){finishRound(t);return;}}render(t);schedule();}
  function showReady({difficulty:key=difficulty,mode:kind=mode}={}){stopLoop();session()?.hideResult?.();difficulty=core.DIFFICULTIES[key]?key:'normal';mode=kind==='endless'?'endless':'match';phase='idle';race=core.createRace({difficulty,mode,rng,nowMs:now()});pausedFrom=null;completionHandled=false;finalResult=null;setControls(false);renderStandings(null);renderDifficulty();render();return snapshot();}
  function selectDifficulty(key){if(phase!=='idle'||!core.DIFFICULTIES[key])return false;difficulty=key;race=core.createRace({difficulty,mode,rng,nowMs:now()});renderDifficulty();render();return true;}
  function selectMode(kind){if(phase!=='idle'||!['match','endless'].includes(kind))return false;mode=kind;race=core.createRace({difficulty,mode,rng,nowMs:now()});renderStandings(null);renderDifficulty();render();return true;}
  function startRound({difficulty:key=difficulty,mode:kind=mode}={}){stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';mode=kind==='endless'?'endless':'match';race=core.createRace({difficulty,mode,rng,nowMs:now()});phase='racing';pausedFrom=null;completionHandled=false;finalResult=null;renderStandings(null);setControls(true);renderDifficulty();render();schedule();return snapshot();}
  function press(){if(!race||phase!=='racing')return {accepted:false,hit:false};const t=now();core.advanceRace(race,t,rng);if(race.finalized){finishRound(t);return {accepted:false,hit:false};}const result=core.pressPlayer(race,t);if(result.accepted){try{root.navigator?.vibrate?.(result.hit?10:28);}catch(_){ }if(race.finalized)finishRound(t);else render(t);}return result;}
  function pause(){if(phase!=='racing')return false;pauseStartedAt=now();pausedFrom=phase;phase='paused';stopLoop();$('snoreWarStage')?.classList?.add?.('is-paused');if($('snoreWarPauseOverlay'))$('snoreWarPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||!pausedFrom)return false;const t=now(),delta=Math.max(0,t-pauseStartedAt);core.shiftRaceTimestamps(race,delta);phase=pausedFrom;pausedFrom=null;$('snoreWarStage')?.classList?.remove?.('is-paused');if($('snoreWarPauseOverlay'))$('snoreWarPauseOverlay').hidden=true;render(t);schedule();return true;}
  function finishRound(t=now()){
    if(finalResult)return finalResult;if(!race)return null;
    if(!race.finalized){race.finalized=true;race.finalizedAt=t;if(mode==='match')race.winnerId=core.rankRace(race)[0]?.id||'player';}
    const ranking=core.rankRace(race),place=core.placeFor(race,'player'),player=race.player,accuracyPct=Math.round(core.accuracyFor(player)*100),periodMs=Math.round(core.fullPeriodAt(race,race.finalizedAt??t)),reward=mode==='endless'?core.endlessRewardFor(player.hits):core.rewardFor(place,difficulty);
    finalResult={mode,place:mode==='match'?place:null,reward,difficulty,hits:player.hits,misses:player.misses,bestStreak:player.bestStreak,accuracy:accuracyPct,crossings:race.currentCrossing+1,periodMs,ranking:ranking.map(r=>r.id)};phase='finished';stopLoop();setControls(false);renderStandings(mode==='match'?ranking:null);render(t);
    if(!completionHandled){completionHandled=true;const p=platform();if(root.state&&p?.ensureArcadeState){
      root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.snoreWar,prevStreak=Number(rec.bestStreak||0),prevAccuracy=Number(rec.bestAccuracy||0),prevEndlessHits=Number(rec.bestEndlessHits||0),prevEndlessStreak=Number(rec.bestEndlessStreak||0),prevEndlessPeriod=rec.bestEndlessPeriodMs==null?null:Number(rec.bestEndlessPeriodMs);
      rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;rec.bestAccuracy=Math.max(prevAccuracy,accuracyPct);rec.totalHits=Number(rec.totalHits||0)+Number(player.hits||0);rec.totalMisses=Number(rec.totalMisses||0)+Number(player.misses||0);
      if(mode==='match'){if(place===1){rec.wins=Number(rec.wins||0)+1;rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty?.[difficulty]||0)+1;}if(place<=3)rec.podiums=Number(rec.podiums||0)+1;rec.bestStreak=Math.max(prevStreak,Number(player.bestStreak||0));}
      else {rec.endlessRuns=Number(rec.endlessRuns||0)+1;rec.bestEndlessHits=Math.max(prevEndlessHits,Number(player.hits||0));rec.bestEndlessStreak=Math.max(prevEndlessStreak,Number(player.bestStreak||0));if(prevEndlessPeriod==null||periodMs<prevEndlessPeriod)rec.bestEndlessPeriodMs=periodMs;}
      const award=p.awardRun?.({gameId:'snoreWar',label:'Snore War',score:mode==='endless'?Number(player.hits||0):Math.max(0,5-place),coins:reward})||{coinsAwarded:reward};root.save?.();
      if(mode==='endless'){
        const review={title:'ENDLESS RUN OVER',mode:'Endless survival',difficulty:profile().label,metricLabel:'HITS',metricValue:String(player.hits||0),scoreboard:[{rank:'—',label:'YOU',value:`${player.hits||0} HITS`,subtitle:`BEST ×${player.bestStreak||0} · ${player.misses||0} / ${core.CONFIG.endlessMissLimit} MISSES`,player:true}],stats:[{label:'Hypnosis Hits',value:String(player.hits||0)},{label:'Misses',value:`${player.misses||0} / ${core.CONFIG.endlessMissLimit}`},{label:'Accuracy',value:`${accuracyPct}%`},{label:'Best Streak',value:`×${player.bestStreak||0}`},{label:'Fastest Pendulum',value:`${periodMs} MS / SWING`}],pbs:[{label:'Best Endless Hits',value:String(rec.bestEndlessHits||0),isNew:Number(player.hits||0)>prevEndlessHits},{label:'Best Endless Streak',value:`×${rec.bestEndlessStreak||0}`,isNew:Number(player.bestStreak||0)>prevEndlessStreak},{label:'Fastest Pendulum',value:rec.bestEndlessPeriodMs==null?'—':`${Math.round(rec.bestEndlessPeriodMs)} MS / SWING`,isNew:prevEndlessPeriod==null||periodMs<prevEndlessPeriod}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};
        session()?.showResult?.('snoreWar',{title:'ENDLESS RUN OVER',metricLabel:'HITS',metricValue:String(player.hits||0),coinsAwarded:award.coinsAwarded,bestText:`BEST ${rec.bestEndlessHits||0} HITS`,review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty,mode}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
      }else{
        const ordinal=place===1?'1ST':place===2?'2ND':place===3?'3RD':'4TH',scoreboard=ranking.map((r,i)=>({rank:String(i+1),label:r.id==='player'?'YOU':r.label,value:`${r.hits} HITS`,subtitle:`${Math.round(core.accuracyFor(r)*100)}% ACC · BEST ×${r.bestStreak}`,player:r.id==='player'})),review={title:place===1?'LAST DROWZEE AWAKE!':'SNORE WAR OVER',mode:'Pendulum survival',difficulty:profile().label,metricLabel:'PLACE',metricValue:ordinal,scoreboard,stats:[{label:'Hypnosis Hits',value:String(player.hits||0)},{label:'Misses',value:String(player.misses||0)},{label:'Accuracy',value:`${accuracyPct}%`},{label:'Best Streak',value:`×${player.bestStreak||0}`},{label:'Pendulum Crossings',value:String(race.currentCrossing+1)}],pbs:[{label:'Best Streak',value:`×${rec.bestStreak}`,isNew:Number(player.bestStreak||0)>prevStreak},{label:'Best Accuracy',value:`${rec.bestAccuracy}%`,isNew:accuracyPct>prevAccuracy}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};
        session()?.showResult?.('snoreWar',{title:place===1?'LAST DROWZEE AWAKE!':'SNORE WAR OVER',metricLabel:'PLACE',metricValue:ordinal,coinsAwarded:award.coinsAwarded,bestText:`BEST STREAK ×${rec.bestStreak}`,review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty,mode}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
      }
    }}
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('snoreWar',$('snoreWarGame'));showReady({difficulty:'normal',mode:'match'});return true;}
  function close(){opened=false;stopLoop();phase='closed';race=null;pausedFrom=null;completionHandled=false;finalResult=null;mode='match';setControls(false);renderStandings(null);if($('snoreWarPauseOverlay'))$('snoreWarPauseOverlay').hidden=true;return true;}
  function keydown(e){if(e?.repeat)return false;const k=String(e?.key||'').toLowerCase();if(k!=='a'&&k!==' '&&k!=='enter')return false;const out=press();if(out.accepted)e?.preventDefault?.();return out.accepted;}
  function snapshot(){return {phase,difficulty,mode,place:race&&mode==='match'?core.placeFor(race,'player'):null,currentCrossing:race?.currentCrossing??0,pendulum:race?core.pendulumPosition(race,now()):-1,periodMs:race?Math.round(core.fullPeriodAt(race,now())):core.CONFIG.initialFullPeriodMs,racers:(race?.racers||[]).map(r=>({id:r.id,hits:r.hits,misses:r.misses,streak:r.streak,bestStreak:r.bestStreak,sleeping:core.isSleeping(r,race.currentCrossing)})),finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};}
  function wire(){if(typeof document==='undefined')return;$('snoreWarStart')?.addEventListener?.('click',()=>startRound());$('snoreWarResume')?.addEventListener?.('click',resume);$('snoreWarButton')?.addEventListener?.('pointerdown',e=>{e.preventDefault?.();press();});for(const btn of document.querySelectorAll?.('[data-snore-war-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.snoreWarDifficulty));for(const btn of document.querySelectorAll?.('[data-snore-war-mode]')||[])btn.addEventListener?.('click',()=>selectMode(btn.dataset.snoreWarMode));document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  wire();return {open,close,showReady,startRound,press,pause,resume,finishRound,selectDifficulty,selectMode,snapshot};
});
