(function(root,factory){
  const core=root.LuckyDexClearCutCore||(typeof require==='function'?require('./arcade-clear-cut-core.js'):null);
  const api=factory(root,core);root.LuckyDexClearCut=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexClearCutCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const rareRewards=()=>root.LuckyDexArcadeRareRewards||globalThis.LuckyDexArcadeRareRewards;
  const rareBridge=()=>root.LuckyDexRareRewardBridge||globalThis.LuckyDexRareRewardBridge;
  const giftCore=()=>root.LuckyDexVoltorbGiftCore||globalThis.LuckyDexVoltorbGiftCore;
  let opened=false,phase='closed',difficulty='normal',playerDex=123,match=null,rafId=0,phaseUntil=0,pausedFrom=null,pauseStartedAt=0,completionHandled=false,finalResult=null,rng=Math.random,frozenProgress=0;

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['ready-round','ready-bonus','dropping','result'].includes(phase))rafId=raf(frame);}
  function profile(){return core.difficultyProfile(difficulty);}
  function activeRound(){return match?.activeRound||null;}
  function setControls(active){const ready=$('clearCutReady'),controls=$('clearCutControls');if(ready)ready.hidden=active;if(controls)controls.hidden=!active;const cut=$('clearCutButton');if(cut)cut.disabled=phase!=='dropping';}
  function scoreAccuracy(){const cuts=match?.player?.roundScores?.length||0;if(!cuts)return '—';return `${Math.max(0,Math.round((Number(match.player.total)||0)/(cuts*core.CONFIG.maxScore)*100))}%`;}
  function renderDifficulty(){
    if($('clearCutDifficultyLabel'))$('clearCutDifficultyLabel').textContent=profile().label.toUpperCase();
    if(typeof document!=='undefined')for(const btn of document.querySelectorAll?.('[data-clear-cut-difficulty]')||[]){const active=btn.dataset.clearCutDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const best=Number(root.state?.arcade?.clearCutChallenge?.bestScores?.[difficulty]||0);if($('clearCutBest'))$('clearCutBest').textContent=best?`BEST ${best}/100`:'BEST —';
  }
  function renderPokemonPicker(){
    if(typeof document==='undefined')return;for(const btn of document.querySelectorAll?.('[data-clear-cut-pokemon]')||[]){const active=Number(btn.dataset.clearCutPokemon)===playerDex;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const img=$('clearCutPlayer')?.querySelector?.('img');if(img){img.src=`arcade/sprites/actors/pokemon/${playerDex}.png`;img.alt=`Your ${core.CUTTERS.find(x=>x.dex===playerDex)?.name||'cutter'}`;}
  }
  function resetRoundVisual(index=0,kind='log'){
    const object=$('clearCutLog'),actual=$('clearCutActual'),slash=$('clearCutSlash'),judge=$('clearCutJudgement'),bag=$('clearCutMysteryBag');
    if(object){object.classList.remove('is-cut');object.dataset.kind=kind;object.style.setProperty('--split-pct','50%');object.style.transform='translate3d(-50%,-130%,0) rotate(var(--cut-angle,0deg))';}
    if(bag)bag.hidden=kind!=='mystery-bag';
    if(actual){actual.hidden=true;actual.style.top='50%';}
    if(slash)slash.hidden=true;if(judge){judge.hidden=true;judge.className='clearcut-judgement';judge.textContent='';}
    if($('clearCutRound'))$('clearCutRound').textContent=kind==='mystery-bag'?'BONUS':`${index+1}/5`;
  }
  function positionTarget(log){const target=$('clearCutTarget');if(target)target.style.top=`${(Number(log?.targetPct||.5)*100).toFixed(1)}%`;}
  function objectProgressAt(t){const round=activeRound();if(!round)return 0;return phase==='result'?frozenProgress:core.motionProgress(round.log,t);}
  function renderObject(t){
    const round=activeRound(),zone=$('clearCutDropZone'),object=$('clearCutLog'),guide=$('clearCutBladeGuide'),slash=$('clearCutSlash');if(!round||!zone||!object)return;
    const angle=Number(round.log.angleDeg)||0;object.style.setProperty('--cut-angle',`${angle}deg`);guide?.style?.setProperty('--cut-angle',`${angle}deg`);slash?.style?.setProperty('--cut-angle',`${angle}deg`);positionTarget(round.log);
    const progress=objectProgressAt(t),zoneH=Math.max(280,Number(zone.clientHeight)||390),objectH=Math.max(round.objectKind==='mystery-bag'?150:180,Number(object.offsetHeight)||240),bladeY=zoneH*.56,targetLocal=objectH*Number(round.log.targetPct||.5),idealProgress=core.motionProgress(round.log,round.log.idealTimeMs),travel=zoneH+objectH*1.45,startTop=bladeY-targetLocal-idealProgress*travel,top=startTop+progress*travel;
    object.style.transform=`translate3d(-50%,${top.toFixed(2)}px,0) rotate(var(--cut-angle,0deg))`;
  }
  function showRoundResult(out){
    if(!out?.accepted)return;const result=out.result,round=out.round,object=$('clearCutLog'),actual=$('clearCutActual'),slash=$('clearCutSlash'),judge=$('clearCutJudgement');frozenProgress=core.motionProgress(round.log,result.cutAt);
    const actualPct=Math.max(3,Math.min(97,Number(round.log.targetPct||.5)*100-Number(result.errorPct||0)));
    if(actual){actual.style.top=`${actualPct.toFixed(1)}%`;actual.hidden=false;}
    if(object){object.style.setProperty('--split-pct',`${actualPct.toFixed(1)}%`);object.classList.add('is-cut');}
    if(slash){slash.hidden=false;slash.classList.remove('flash');void slash.offsetWidth;slash.classList.add('flash');}
    if(judge){judge.hidden=false;judge.className=`clearcut-judgement is-${result.judgement.toLowerCase()}`;if(round.isBonus)judge.innerHTML=`<b>${result.judgement}</b><strong>${out.perfect?'PRIZE!':'NO PRIZE'}</strong><small>${Math.abs(result.errorPct).toFixed(2)}% OFF</small>`;else judge.innerHTML=`<b>${result.judgement}</b><strong>${result.score>=0?'+':''}${result.score}</strong><small>${Math.abs(result.errorPct).toFixed(2)}% OFF</small>`;}
    render();root.navigator?.vibrate?.(result.score===20?[20,25,30]:16);
  }
  function render(t=now()){
    if(!match)return;if($('clearCutTotal'))$('clearCutTotal').textContent=`${match.player.total}/100`;if($('clearCutAccuracy'))$('clearCutAccuracy').textContent=scoreAccuracy();if(['dropping','result'].includes(phase))renderObject(t);
    const status=$('clearCutStatus');if(status){if(phase==='ready-round')status.textContent='READY';else if(phase==='ready-bonus')status.textContent='BONUS';else if(phase==='dropping')status.textContent=activeRound()?.isBonus?'CUT THE BAG':'CUT THE LINE';else if(phase==='result')status.textContent=activeRound()?.isBonus?'BAG CUT':'CUT SCORED';else status.textContent='';}
    session()?.update?.('clearCutChallenge',{runText:'5 accuracy cuts · rotating angles · bonus Mystery Bag',rewardText:'Accuracy · Lucky Coins · Perfect bag prize',liveLabel:'TOTAL',liveValue:`${match.player.total}/100`});
  }
  function showReady({difficulty:key=difficulty,playerDex:dex=playerDex}={}){
    stopLoop();session()?.hideResult?.();difficulty=core.DIFFICULTIES[key]?key:'normal';playerDex=core.CUTTERS.some(x=>x.dex===Number(dex))?Number(dex):123;phase='idle';match=core.createMatch({difficulty,playerDex,rng,nowMs:now()});pausedFrom=null;completionHandled=false;finalResult=null;phaseUntil=0;setControls(false);resetRoundVisual(0,'log');renderDifficulty();renderPokemonPicker();render();return true;
  }
  function selectDifficulty(key){if(!['idle','finished'].includes(phase)||!core.DIFFICULTIES[key])return false;difficulty=key;match=core.createMatch({difficulty,playerDex,rng,nowMs:now()});renderDifficulty();render();return true;}
  function selectPokemon(dex){if(!['idle','finished'].includes(phase))return false;const n=Number(dex);if(!core.CUTTERS.some(x=>x.dex===n))return false;playerDex=n;match=core.createMatch({difficulty,playerDex,rng,nowMs:now()});renderPokemonPicker();render();return true;}
  function prepareRound(index,t=now()){
    resetRoundVisual(index,'log');phase='ready-round';phaseUntil=t+core.CONFIG.readyHoldMs;setControls(true);const banner=$('clearCutRoundBanner');if(banner){banner.hidden=false;banner.classList.remove('is-bonus');banner.textContent=`CUT ${index+1} · ${Math.abs(match.logs[index]?.angleDeg||0)}°${Number(match.logs[index]?.angleDeg||0)<0?' LEFT':Number(match.logs[index]?.angleDeg||0)>0?' RIGHT':' STRAIGHT'}`;}schedule();
  }
  function prepareBonus(t=now()){
    resetRoundVisual(core.CONFIG.rounds,'mystery-bag');phase='ready-bonus';phaseUntil=t+core.CONFIG.bonusReadyHoldMs;setControls(true);const banner=$('clearCutRoundBanner');if(banner){banner.hidden=false;banner.classList.add('is-bonus');banner.textContent='MYSTERY BAG · PERFECT = PRIZE';}schedule();
  }
  function beginDrop(t=now()){
    const isBonus=phase==='ready-bonus';const round=isBonus?core.startBonusRound(match,t,rng):core.startRound(match,Math.max(0,match?.currentRoundIndex+1||0),t);if(!round)return false;resetRoundVisual(round.index,round.objectKind);phase='dropping';phaseUntil=0;const banner=$('clearCutRoundBanner');if(banner)banner.hidden=true;const btn=$('clearCutButton');if(btn)btn.disabled=false;render(t);return true;
  }
  function startMatch(){if(!opened||['dropping','ready-round','ready-bonus','result','finishing'].includes(phase))return false;session()?.hideResult?.();match=core.createMatch({difficulty,playerDex,rng,nowMs:now()});completionHandled=false;finalResult=null;setControls(true);prepareRound(0,now());render();return true;}
  function cut(){
    if(phase!=='dropping'||!match)return {accepted:false,reason:'inactive'};const t=now(),round=activeRound(),out=round?.isBonus?core.cutBonus(match,t):core.cutPlayer(match,t);if(!out.accepted)return out;phase='result';phaseUntil=t+core.CONFIG.resultHoldMs;const btn=$('clearCutButton');if(btn)btn.disabled=true;showRoundResult(out);render(t);schedule();return out;
  }
  function advanceFromResult(t){
    if(match?.finalized){void finishMatch(t);return true;}if(match?.scoredComplete&&!match?.bonusRound){prepareBonus(t);return true;}prepareRound((match?.currentRoundIndex||0)+1,t);return true;
  }
  function pause(){if(!['ready-round','ready-bonus','dropping','result'].includes(phase))return false;pauseStartedAt=now();pausedFrom=phase;phase='paused';stopLoop();if($('clearCutPauseOverlay'))$('clearCutPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||!pausedFrom)return false;const t=now(),delta=Math.max(0,t-pauseStartedAt);if(pausedFrom==='dropping')core.shiftActiveRound(match,delta);else if(phaseUntil)phaseUntil+=delta;phase=pausedFrom;pausedFrom=null;if($('clearCutPauseOverlay'))$('clearCutPauseOverlay').hidden=true;render(t);schedule();return true;}
  function frame(){
    rafId=0;if(!['ready-round','ready-bonus','dropping','result'].includes(phase))return;const t=now();
    if((phase==='ready-round'||phase==='ready-bonus')&&t>=phaseUntil)beginDrop(t);
    else if(phase==='dropping'){
      const auto=core.autoMissIfNeeded(match,t);if(auto?.accepted){phase='result';phaseUntil=t+core.CONFIG.resultHoldMs;showRoundResult(auto);}render(t);
    }else if(phase==='result'&&t>=phaseUntil)advanceFromResult(t);else render(t);
    schedule();
  }
  async function claimMysteryBagPrize(){
    const bonus=match?.bonusRound;if(!bonus?.playerResult||bonus.playerResult.score!==core.CONFIG.maxScore)return {won:false,label:'',reveal:null,pending:false};
    const rr=rareRewards(),bridge=rareBridge(),gift=giftCore();if(!root.state||!rr||!bridge||!gift)return {won:true,label:'Prize unavailable',reveal:null,pending:true};
    let attempt=rr.getOrCreateAttempt(root.state,'clearCutBag',()=>{const pick=gift.rewardForRoll(rng());return {kind:pick.kind,reward:pick.reward,source:'clear-cut-mystery-bag'};});
    try{
      if(!attempt.reward&&['card','pack'].includes(attempt.kind)){const reward=await bridge.resolveArcadeReward?.(attempt.kind);if(!reward)throw new Error('Mystery Bag reward could not be resolved');attempt=rr.patchAttempt(root.state,'clearCutBag',attempt.id,{reward})||attempt;bridge.save?.();}
      if(!attempt.reward)throw new Error('Mystery Bag reward missing');
      const claim=await rr.claimAttempt(root.state,'clearCutBag',attempt.id,r=>bridge.grantReward?.(r));bridge.save?.();
      return {won:true,label:claim?.result?.label||attempt.reward.label||'Mystery Prize',reveal:bridge.rewardReveal?.(attempt.reward,claim?.result,'MYSTERY BAG PRIZE')||null,pending:false};
    }catch(error){console.warn?.('[LuckyDex] Clear Cut Mystery Bag prize remains reserved',error);bridge.save?.();return {won:true,label:'Mystery Prize Reserved',reveal:null,pending:true};}
  }
  async function finishMatch(){
    if(finalResult)return finalResult;if(!match)return null;phase='finishing';stopLoop();setControls(false);const player=match.player,reward=core.rewardForScore(player.total,difficulty),bagPerfect=match?.bonusRound?.playerResult?.score===core.CONFIG.maxScore,bagPrize=await claimMysteryBagPrize();finalResult={reward,difficulty,total:player.total,perfects:player.perfects,closestCutPct:player.closestCutPct,roundScores:[...player.roundScores],bagPerfect,bagPrize:bagPrize.label||''};phase='finished';
    if(completionHandled)return finalResult;completionHandled=true;const p=platform();if(!root.state||!p?.ensureArcadeState)return finalResult;root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.clearCutChallenge,prevBest=Number(rec.bestScores?.[difficulty]||0),prevClosest=rec.closestCutPct==null?null:Number(rec.closestCutPct),prevBagPerfect=Number(rec.bagsPerfect||0);
    rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;rec.bestScore=Math.max(Number(rec.bestScore||0),Number(player.total||0));rec.bestScores[difficulty]=Math.max(Number(rec.bestScores?.[difficulty]||0),Number(player.total||0));rec.totalPerfects=Number(rec.totalPerfects||0)+Number(player.perfects||0);rec.totalAbsErrorPct=Number(rec.totalAbsErrorPct||0)+Number(player.totalAbsError||0);rec.totalCuts=Number(rec.totalCuts||0)+player.roundResults.length;if(player.closestCutPct!=null&&(rec.closestCutPct==null||Number(player.closestCutPct)<Number(rec.closestCutPct)))rec.closestCutPct=Number(player.closestCutPct);if(bagPerfect)rec.bagsPerfect=Number(rec.bagsPerfect||0)+1;if(bagPerfect&&!bagPrize.pending)rec.bagPrizes=Number(rec.bagPrizes||0)+1;
    const award=p.awardRun?.({gameId:'clearCutChallenge',label:'Clear Cut Challenge',score:Math.max(0,Number(player.total)||0),coins:reward})||{coinsAwarded:reward};root.save?.();const avgError=player.roundResults.length?player.totalAbsError/player.roundResults.length:0;
    const stats=player.roundScores.map((score,i)=>({label:`Cut ${i+1}`,value:`${score>=0?'+':''}${score}`}));stats.push({label:'Perfect Cuts',value:String(player.perfects)},{label:'Closest Cut',value:player.closestCutPct==null?'—':`${player.closestCutPct.toFixed(2)}%`},{label:'Average Error',value:`${avgError.toFixed(2)}%`},{label:'Mystery Bag',value:bagPerfect?(bagPrize.pending?'PERFECT · PRIZE RESERVED':`PERFECT · ${bagPrize.label}`):'NO PRIZE'});
    const review={title:player.total===100?'MASTER CUTTER!':'CHALLENGE COMPLETE',mode:'Clear Cut Challenge',difficulty:profile().label,metricLabel:'ACCURACY SCORE',metricValue:`${player.total}/100`,stats,pbs:[{label:`${profile().label} Best`,value:`${rec.bestScores[difficulty]}/100`,isNew:player.total>prevBest},{label:'Closest Ever',value:rec.closestCutPct==null?'—':`${Number(rec.closestCutPct).toFixed(2)}%`,isNew:player.closestCutPct!=null&&(prevClosest==null||player.closestCutPct<prevClosest)},{label:'Perfect Bags',value:String(rec.bagsPerfect||0),isNew:bagPerfect&&Number(rec.bagsPerfect||0)>prevBagPerfect}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)},...(bagPrize.label?[{label:'Mystery Bag',value:bagPrize.label}]:[])]};
    session()?.showResult?.('clearCutChallenge',{title:player.total===100?'MASTER CUTTER!':'CHALLENGE COMPLETE',metricLabel:'TOTAL',metricValue:`${player.total}/100`,coinsAwarded:award.coinsAwarded,bestText:bagPrize.pending?'MYSTERY PRIZE RESERVED':bagPrize.label?`MYSTERY BAG · ${bagPrize.label}`:`BEST ${rec.bestScore}/100`,rewardReveals:bagPrize.reveal?[bagPrize.reveal]:[],review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty,playerDex}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return finalResult;
  }
  function open(){opened=true;session()?.mount?.('clearCutChallenge',$('clearCutGame'));showReady({difficulty:'normal',playerDex});return true;}
  function close(){opened=false;stopLoop();phase='closed';match=null;pausedFrom=null;completionHandled=false;finalResult=null;setControls(false);if($('clearCutPauseOverlay'))$('clearCutPauseOverlay').hidden=true;return true;}
  function keydown(e){if(e?.repeat)return false;const k=String(e?.key||'').toLowerCase();if(!['a',' ','enter'].includes(k))return false;const out=cut();if(out?.accepted)e?.preventDefault?.();return !!out?.accepted;}
  function snapshot(){return {phase,difficulty,playerDex,roundIndex:match?.currentRoundIndex??-1,total:match?.player?.total??0,accuracy:scoreAccuracy(),bonus:!!match?.activeRound?.isBonus,activeResult:match?.activeRound?.playerResult?{...match.activeRound.playerResult}:null,finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};}
  function wire(){if(typeof document==='undefined')return;$('clearCutStart')?.addEventListener?.('click',startMatch);$('clearCutResume')?.addEventListener?.('click',resume);$('clearCutButton')?.addEventListener?.('pointerdown',e=>{e.preventDefault?.();cut();});for(const btn of document.querySelectorAll?.('[data-clear-cut-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.clearCutDifficulty));for(const btn of document.querySelectorAll?.('[data-clear-cut-pokemon]')||[])btn.addEventListener?.('click',()=>selectPokemon(btn.dataset.clearCutPokemon));document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  wire();return {open,close,showReady,startMatch,cut,pause,resume,finishMatch,selectDifficulty,selectPokemon,snapshot};
});
