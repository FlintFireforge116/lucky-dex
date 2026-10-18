(function(root,factory){
  const core=root.LuckyDexIceCreamScoopCore||(typeof require==='function'?require('./arcade-ice-cream-scoop-core.js'):null);
  const api=factory(root,core);root.LuckyDexIceCreamScoop=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexIceCreamScoopCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const rareRewards=()=>root.LuckyDexArcadeRareRewards||globalThis.LuckyDexArcadeRareRewards;
  const rareBridge=()=>root.LuckyDexRareRewardBridge||globalThis.LuckyDexRareRewardBridge;
  const giftCore=()=>root.LuckyDexVoltorbGiftCore||globalThis.LuckyDexVoltorbGiftCore;
  let opened=false,phase='closed',difficulty='normal',run=null,rafId=0,cycleStartedAt=0,dropStartedAt=0,dropX=.5,resultUntil=0,lastResult=null,pausedFrom=null,pauseStartedAt=0,completionHandled=false,finalResult=null,rng=Math.random,lastPhysicsAt=0;

  function profile(){return core.difficultyProfile(difficulty);}
  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['aiming','dropping','result'].includes(phase))rafId=raf(frame);}
  function rareRate(){return Math.max(0,Math.min(1,Number(root.state?.settings?.rareOdds?.iceCreamDreamScoop??core.CONFIG.dreamRate)||0));}
  function setControls(active){const b=$('iceCreamDrop');if(b)b.disabled=!active;}
  function showReady(nextDifficulty=difficulty){
    difficulty=core.DIFFICULTIES[nextDifficulty]?nextDifficulty:'normal';phase='ready';run=null;lastResult=null;completionHandled=false;finalResult=null;stopLoop();setControls(false);
    const ready=$('iceCreamReady');if(ready)ready.hidden=false;const pause=$('iceCreamPauseOverlay');if(pause)pause.hidden=true;const field=$('iceCreamPlayfield');field?.classList?.remove('is-collapse');
    document.querySelectorAll?.('[data-icecream-difficulty]')?.forEach(btn=>{const on=btn.dataset.icecreamDifficulty===difficulty;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',on?'true':'false');});
    const meta=$('iceCreamReadyMeta');if(meta)meta.textContent=`${profile().label.toUpperCase()} · STACK UNTIL IT FALLS`;renderHud();renderStack();renderMoving();renderDreamBanner();return true;
  }
  function selectDifficulty(key){if(phase!=='ready'||!core.DIFFICULTIES[key])return false;return showReady(key);}
  function startRun(){
    if(!opened||phase!=='ready')return false;session()?.hideResult?.();const ready=$('iceCreamReady');if(ready)ready.hidden=true;const field=$('iceCreamPlayfield');field?.classList?.remove('is-collapse');
    run=core.createRun({difficulty,rng,dreamRate:rareRate()});phase='aiming';cycleStartedAt=now();lastPhysicsAt=cycleStartedAt;lastResult=null;completionHandled=false;finalResult=null;setControls(true);renderAll(cycleStartedAt);schedule();return true;
  }
  function drop(){
    if(phase!=='aiming'||!run?.current)return {accepted:false};dropX=core.movingXAt(run,Math.max(0,now()-cycleStartedAt));dropStartedAt=now();phase='dropping';setControls(false);renderMoving(dropStartedAt);schedule();return {accepted:true,x:dropX};
  }
  function scoopSizePx(){const field=$('iceCreamPlayfield'),w=Math.max(280,Number(field?.clientWidth)||360);return Math.max(58,Math.min(82,w*profile().scoopWidth));}
  function cameraOffset(){const count=run?.stack?.length||0;return Math.max(0,(count-6)*42);}
  function scoopBottom(index,body=null){const y=Number.isFinite(Number(body?.y))?Number(body.y):index;return 121+y*42-cameraOffset();}
  function movingBottom(t){
    const target=scoopBottom(run?.stack?.length||0),field=$('iceCreamPlayfield'),top=Math.max(target+98,Math.min((Number(field?.clientHeight)||460)-105,target+172));
    if(phase!=='dropping')return top;const u=Math.max(0,Math.min(1,(Number(t)-dropStartedAt)/core.CONFIG.dropDurationMs)),ease=1-Math.pow(1-u,3);return top+(target-top)*ease;
  }
  function renderHud(){
    if($('iceCreamHeight'))$('iceCreamHeight').textContent=String(run?.stack?.length||0);if($('iceCreamScore'))$('iceCreamScore').textContent=Number(run?.score||0).toLocaleString('en-GB');if($('iceCreamCombo'))$('iceCreamCombo').textContent=`×${Math.max(0,run?.perfectStreak||0)}`;if($('iceCreamDifficultyLabel'))$('iceCreamDifficultyLabel').textContent=profile().label.toUpperCase();
    const best=Number(root.state?.arcade?.iceCreamScoop?.bestHeights?.[difficulty]||0);if($('iceCreamBest'))$('iceCreamBest').textContent=`BEST ${best}`;
  }
  function scoopHtml(s,index){const cls=['icecream-scoop',s.flavor?.className||'vanilla',s.perfect?'perfect':'',s.falling?'is-falling':''].filter(Boolean).join(' '),size=scoopSizePx(),rot=(Number(s.angle)||0)*180/Math.PI;return `<div class="${cls}" data-stack-scoop="${index}" style="--x:${(Number(s.x||.5)*100).toFixed(2)}%;--y:${scoopBottom(index,s).toFixed(1)}px;--size:${size.toFixed(1)}px;--rot:${rot.toFixed(2)}deg" title="${String(s.flavor?.label||'Scoop')}"></div>`;}
  function renderStack(){const host=$('iceCreamTower');if(!host)return;const scoops=run?.stack||[];host.innerHTML='<div class="icecream-cone"></div>'+scoops.map(scoopHtml).join('');}
  function renderMoving(t=now()){
    const node=$('iceCreamMovingScoop');if(!node)return;if(!run?.current||!['aiming','dropping'].includes(phase)){node.hidden=true;return;}node.hidden=false;const x=phase==='dropping'?dropX:core.movingXAt(run,Math.max(0,t-cycleStartedAt)),size=scoopSizePx();node.className=`icecream-scoop icecream-moving ${run.current.flavor?.className||'vanilla'}${phase==='dropping'?' is-dropping':''}`;node.style.setProperty('--x',`${(x*100).toFixed(2)}%`);node.style.setProperty('--y',`${movingBottom(t).toFixed(1)}px`);node.style.setProperty('--size',`${size.toFixed(1)}px`);node.setAttribute('aria-label',run.current.flavor?.label||'Ice cream scoop');
    const shadow=$('iceCreamShadow');if(shadow){shadow.style.left=`${(x*100).toFixed(2)}%`;shadow.style.bottom=`${Math.max(105,scoopBottom(run.stack.length)-6)}px`;}
  }
  function renderDreamBanner(){const b=$('iceCreamDreamBanner');if(!b)return;const active=!!run?.current?.isDream&&['aiming','dropping'].includes(phase);b.hidden=!active;if(active)b.textContent='✦ DREAM SCOOP · LAND IT FOR A RARE PRIZE ✦';}
  function renderStatus(){const s=$('iceCreamStatus');if(!s)return;if(phase==='aiming')s.textContent=run?.current?.isDream?'DREAM SCOOP! CENTRE IT AND DROP':'TAP DROP WHEN THE SCOOP IS CENTRED';else if(phase==='dropping')s.textContent='DROPPING…';else if(phase==='result'&&lastResult)s.textContent=lastResult.safe?`${core.judgement(lastResult)} · +${lastResult.scoreAdded}`:'THE STACK COLLAPSED';else s.textContent='BUILD THE TALLEST STABLE STACK';}
  function showJudgement(result){const n=$('iceCreamJudgement');if(!n)return;const j=core.judgement(result);n.className=`icecream-judgement ${j==='PERFECT'?'perfect':j==='COLLAPSE'?'collapse':''}`;n.innerHTML=result.safe?`<b>${j}</b><span>+${result.scoreAdded} · ${Math.round((result.quality?.overlap||0)*100)}% overlap</span>`:'<b>COLLAPSE!</b><span>The scoop was too far off-centre.</span>';n.hidden=false;}
  function hideJudgement(){const n=$('iceCreamJudgement');if(n)n.hidden=true;}
  function renderAll(t=now()){renderHud();renderStack();renderMoving(t);renderDreamBanner();renderStatus();}
  function resolveDrop(t){
    lastResult=core.resolveDrop(run,dropX,rng);showJudgement(lastResult);renderHud();renderStack();renderDreamBanner();renderMoving(t);renderStatus();phase='result';resultUntil=t+core.CONFIG.resultHoldMs;if(lastResult.collapsed)$('iceCreamPlayfield')?.classList?.add('is-collapse');return lastResult;
  }
  function updatePhysics(t){
    if(!run?.stack?.length)return;const dt=Math.min(.04,Math.max(0,(t-(lastPhysicsAt||t))/1000));lastPhysicsAt=t;if(dt<=0)return;const wasCollapsed=!!run.collapsed;core.stepPhysics(run,dt);if(!wasCollapsed&&run.collapsed){lastResult={...(lastResult||{}),accepted:true,safe:false,collapsed:true,quality:lastResult?.quality||{overlap:0,accuracy:0}};phase='result';resultUntil=t+core.CONFIG.resultHoldMs;setControls(false);$('iceCreamPlayfield')?.classList?.add('is-collapse');showJudgement(lastResult);}renderStack();
  }
  function nextTurn(t){hideJudgement();if(lastResult?.collapsed||run?.collapsed||run?.complete){void finishRun();return;}phase='aiming';cycleStartedAt=t;lastResult=null;setControls(true);renderAll(t);}
  function pause(){if(!['aiming','dropping','result'].includes(phase))return false;pauseStartedAt=now();pausedFrom=phase;phase='paused';stopLoop();setControls(false);if($('iceCreamPauseOverlay'))$('iceCreamPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||!pausedFrom)return false;const t=now(),delta=Math.max(0,t-pauseStartedAt);if(pausedFrom==='aiming')cycleStartedAt+=delta;if(pausedFrom==='dropping')dropStartedAt+=delta;if(pausedFrom==='result')resultUntil+=delta;lastPhysicsAt=t;phase=pausedFrom;pausedFrom=null;if($('iceCreamPauseOverlay'))$('iceCreamPauseOverlay').hidden=true;setControls(phase==='aiming');renderAll(t);schedule();return true;}
  function frame(t){
    rafId=0;if(!['aiming','dropping','result'].includes(phase))return;updatePhysics(t);if(phase==='dropping'&&t-dropStartedAt>=core.CONFIG.dropDurationMs)resolveDrop(t);else if(phase==='result'&&t>=resultUntil)nextTurn(t);else{renderMoving(t);renderDreamBanner();renderStatus();}schedule();
  }
  async function claimDreamPrize(){
    if(!run?.dreamLanded)return {label:'',reveal:null,pending:false};const rr=rareRewards(),bridge=rareBridge(),gift=giftCore();if(!root.state||!rr||!bridge||!gift)return {label:'Dream Prize Reserved',reveal:null,pending:true};
    let attempt=rr.getOrCreateAttempt(root.state,'iceCreamDreamScoop',()=>{const pick=gift.rewardForRoll(rng());return {kind:pick.kind,reward:pick.reward,source:'ice-cream-dream-scoop'};});
    try{
      if(!attempt.reward&&['card','pack'].includes(attempt.kind)){const reward=await bridge.resolveArcadeReward?.(attempt.kind);if(!reward)throw new Error('Dream Scoop reward could not be resolved');attempt=rr.patchAttempt(root.state,'iceCreamDreamScoop',attempt.id,{reward})||attempt;bridge.save?.();}
      if(!attempt.reward)throw new Error('Dream Scoop reward missing');const claim=await rr.claimAttempt(root.state,'iceCreamDreamScoop',attempt.id,r=>bridge.grantReward?.(r));bridge.save?.();return {label:claim?.result?.label||attempt.reward.label||'Dream Prize',reveal:bridge.rewardReveal?.(attempt.reward,claim?.result,'DREAM SCOOP PRIZE')||null,pending:false};
    }catch(error){console.warn?.('[LuckyDex] Dream Scoop prize remains reserved',error);bridge.save?.();return {label:'Dream Prize Reserved',reveal:null,pending:true};}
  }
  async function finishRun(){
    if(finalResult)return finalResult;if(!run)return null;phase='finishing';stopLoop();setControls(false);const p=platform();if(!root.state||!p?.ensureArcadeState)return null;root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.iceCreamScoop,prevHeight=Number(rec.bestHeights?.[difficulty]||0),prevScore=Number(rec.bestScores?.[difficulty]||0),prevStreak=Number(rec.bestPerfectStreak||0),prize=await claimDreamPrize();
    const height=run.stack.length,score=run.score,reward=core.rewardForRun(run);rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;rec.bestHeight=Math.max(Number(rec.bestHeight||0),height);rec.bestHeights[difficulty]=Math.max(Number(rec.bestHeights?.[difficulty]||0),height);rec.bestScore=Math.max(Number(rec.bestScore||0),score);rec.bestScores[difficulty]=Math.max(Number(rec.bestScores?.[difficulty]||0),score);rec.bestPerfects=Math.max(Number(rec.bestPerfects||0),run.perfects);rec.bestPerfectStreak=Math.max(Number(rec.bestPerfectStreak||0),run.bestPerfectStreak);rec.totalScoops=Number(rec.totalScoops||0)+height;rec.totalPerfects=Number(rec.totalPerfects||0)+run.perfects;if(run.collapsed)rec.collapses=Number(rec.collapses||0)+1;if(run.dreamSeen)rec.dreamScoopsSeen=Number(rec.dreamScoopsSeen||0)+1;if(run.dreamLanded)rec.dreamScoopsLanded=Number(rec.dreamScoopsLanded||0)+1;if(run.dreamLanded&&!prize.pending)rec.dreamPrizes=Number(rec.dreamPrizes||0)+1;
    const award=p.awardRun?.({gameId:'iceCreamScoop',label:'Ice Cream Scoop',score,coins:reward})||{coinsAwarded:reward};root.save?.();finalResult={height,score,perfects:run.perfects,perfectStreak:run.bestPerfectStreak,dreamLanded:run.dreamLanded,reward:award.coinsAwarded||0,prize:prize.label||''};phase='finished';if(completionHandled)return finalResult;completionHandled=true;
    const stats=[{label:'Scoops Landed',value:String(height)},{label:'Score',value:score.toLocaleString('en-GB')},{label:'Perfect Scoops',value:String(run.perfects)},{label:'Best Perfect Chain',value:`×${run.bestPerfectStreak}`},{label:'Finish',value:run.complete?'20-SCOOP TOWER':run.collapsed?'COLLAPSED':'COMPLETE'},{label:'Dream Scoop',value:run.dreamLanded?(prize.pending?'LANDED · PRIZE RESERVED':`LANDED · ${prize.label}`):run.dreamSeen?'MISSED':'—'}];
    const review={title:run.complete?'DREAM TOWER COMPLETE!':height>=10?'SKY-HIGH STACK!':'SCOOP RUN COMPLETE',mode:'Dream World · Ice Cream Scoop',difficulty:profile().label,metricLabel:'SCORE',metricValue:score.toLocaleString('en-GB'),stats,pbs:[{label:`${profile().label} Height`,value:String(rec.bestHeights[difficulty]),isNew:height>prevHeight},{label:`${profile().label} Score`,value:Number(rec.bestScores[difficulty]||0).toLocaleString('en-GB'),isNew:score>prevScore},{label:'Perfect Chain',value:`×${rec.bestPerfectStreak||0}`,isNew:run.bestPerfectStreak>prevStreak}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)},...(prize.label?[{label:'Dream Scoop',value:prize.label}]:[])]};
    session()?.showResult?.('iceCreamScoop',{title:review.title,metricLabel:'SCORE',metricValue:score.toLocaleString('en-GB'),coinsAwarded:award.coinsAwarded,bestText:prize.pending?'DREAM PRIZE RESERVED':prize.label?`DREAM SCOOP · ${prize.label}`:`BEST ${rec.bestHeight} SCOOPS`,rewardReveals:prize.reveal?[prize.reveal]:[],review,replayLabel:'SCOOP AGAIN',onReplay:()=>showReady(difficulty),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return finalResult;
  }
  function open(){opened=true;session()?.mount?.('iceCreamScoop',$('iceCreamScoopGame'));showReady(difficulty);return true;}
  function close(){opened=false;stopLoop();phase='closed';run=null;lastResult=null;pausedFrom=null;completionHandled=false;finalResult=null;setControls(false);hideJudgement();if($('iceCreamPauseOverlay'))$('iceCreamPauseOverlay').hidden=true;return true;}
  function keydown(e){if(e?.repeat)return false;const key=String(e?.key||'').toLowerCase();if(![' ','enter','a'].includes(key))return false;const out=drop();if(out.accepted)e?.preventDefault?.();return out.accepted;}
  function snapshot(){return {phase,difficulty,run:core.snapshot(run),lastResult:lastResult?JSON.parse(JSON.stringify(lastResult)):null,finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};}
  function wire(){if(typeof document==='undefined')return;$('iceCreamStart')?.addEventListener?.('click',startRun);$('iceCreamDrop')?.addEventListener?.('pointerdown',e=>{e.preventDefault?.();drop();});$('iceCreamResume')?.addEventListener?.('click',resume);for(const btn of document.querySelectorAll?.('[data-icecream-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.icecreamDifficulty));document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  wire();return {open,close,showReady,startRun,drop,pause,resume,finishRun,selectDifficulty,snapshot,_setRng:fn=>{if(typeof fn==='function')rng=fn;}};
});
