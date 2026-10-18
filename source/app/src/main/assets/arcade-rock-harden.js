(function(root,factory){
  const core=root.LuckyDexRockHardenCore||(typeof require==='function'?require('./arcade-rock-harden-core.js'):null);
  const api=factory(root,core);root.LuckyDexRockHarden=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexRockHardenCore required');

  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const fossilBridge=()=>root.LuckyDexFossilMuseumBridge||globalThis.LuckyDexFossilMuseumBridge;
  const rareOdds=()=>({goldRock:.10,...(root.state?.settings?.rareOdds||{})});
  const laneIds=['rockHardenPlayerLane','rockHardenCpu1Lane','rockHardenCpu2Lane','rockHardenCpu3Lane'];
  const hpIds=['rockHardenPlayerHp','rockHardenCpu1Hp','rockHardenCpu2Hp','rockHardenCpu3Hp'];
  const scoreIds=['rockHardenPlayerScore','rockHardenCpu1Score','rockHardenCpu2Score','rockHardenCpu3Score'];
  const spriteIds=['rockHardenPlayerSprite','rockHardenCpu1Sprite','rockHardenCpu2Sprite','rockHardenCpu3Sprite'];
  const rockIds=['rockHardenPlayerRock','rockHardenCpu1Rock','rockHardenCpu2Rock','rockHardenCpu3Rock'];
  const shadowIds=['rockHardenPlayerShadow','rockHardenCpu1Shadow','rockHardenCpu2Shadow','rockHardenCpu3Shadow'];
  const gradeIds=['rockHardenPlayerGrade','rockHardenCpu1Grade','rockHardenCpu2Grade','rockHardenCpu3Grade'];

  let opened=false,phase='closed',difficulty='normal',round=null,rafId=0,countdownEndsAt=0,countdownTotalMs=0,hardenFlashUntil=0;
  let pausedFrom=null,pauseStartedAt=0,pausedTimerMs=core.CONFIG.safetyCapMs,countdownRemainingMs=0,completionHandled=false,finalResult=null,rng=Math.random,activePointer=null,setupRoster=null;
  const heldKeys=new Set(),gradeUntil=new Map(),impactUntil=new Map(),goldContexts=new WeakMap(),presentedRounds=new WeakSet();
  let currentGoldContext=null,playerGrades={perfect:0,good:0,safe:0,miss:0};


  function rockRecord(){
    const p=platform();if(!root.state||!p?.ensureArcadeState)return null;root.state.arcade=p.ensureArcadeState(root.state.arcade);return root.state.arcade.rockHarden;
  }
  function newGoldContext(r){
    const ctx={round:r,seenRecorded:false,perfectRecorded:false,settlementStarted:false,settled:false,award:null,promise:null};goldContexts.set(r,ctx);currentGoldContext=ctx;return ctx;
  }
  function recordGoldStat(ctx,key){
    if(!ctx)return;
    const flag=key==='goldRocksSeen'?'seenRecorded':'perfectRecorded';if(ctx[flag])return;ctx[flag]=true;
    const rec=rockRecord();if(rec){rec[key]=Number(rec[key]||0)+1;root.save?.();}
  }
  function profileAward(prize,{fallbackFrom=null}={}){
    const bridge=fossilBridge();if(!bridge?.grantProfileReward)throw new Error('LuckyDex bonus reward bridge unavailable');
    const category=String(prize?.category||''),coins=Math.max(0,Math.round(Number(prize?.coins)||0)),dust=Math.max(0,Math.round(Number(prize?.dust)||0)),tickets=Math.max(0,Math.floor(Number(prize?.tickets)||0));
    const label=category==='coins'?`Gold Rock · ${coins} Lucky Coins`:category==='dust'?`Gold Rock · ${dust} Dust`:`Gold Rock · ${tickets} Pack Ticket${tickets===1?'':'s'}`;
    const granted=bridge.grantProfileReward({coins,dust,tickets,label});if(!granted)throw new Error('Gold Rock profile reward was not granted');
    return {category,label,coins:Number(granted.coins)||0,dust:Number(granted.dust)||0,tickets:Number(granted.tickets)||0,...(fallbackFrom?{fallbackFrom}:{})};
  }
  function rewardDeadline(factory,ms=4500){
    return new Promise(resolve=>{
      let done=false,timer=null;const finish=value=>{if(done)return;done=true;if(timer!=null)(root.clearTimeout||globalThis.clearTimeout)?.(timer);resolve(value);};
      timer=(root.setTimeout||globalThis.setTimeout)(()=>finish({status:'timeout'}),ms);
      Promise.resolve().then(factory).then(value=>finish({status:'ok',value}),error=>finish({status:'error',error}));
    });
  }
  function markGoldClaimed(ctx,award){
    if(!ctx||ctx.settled)return ctx?.award||award;ctx.settled=true;ctx.award=award;
    const rec=rockRecord();if(rec){rec.goldRewardsClaimed=Number(rec.goldRewardsClaimed||0)+1;root.save?.();}
    if(round===ctx.round&&finalResult)finalResult.goldAward=JSON.parse(JSON.stringify(award));
    try{fossilBridge()?.vibrate?.([18,24,42]);}catch(_){ }
    return award;
  }
  function fallbackGold(ctx,from){return markGoldClaimed(ctx,profileAward(ctx.round.gold.fallbackPrize,{fallbackFrom:from}));}
  async function settleGold(ctx){
    const prize=ctx?.round?.gold?.prize;if(!prize)throw new Error('Gold Rock prize missing');const bridge=fossilBridge();
    if(['coins','dust','ticket'].includes(prize.category))return markGoldClaimed(ctx,profileAward(prize));
    if(prize.category==='card'){
      const outcome=await rewardDeadline(()=>bridge?.resolveBuriedCard?.(),4500);
      if(outcome.status==='ok'&&outcome.value?.card){try{const granted=await Promise.resolve(bridge?.grantCard?.(outcome.value.card,outcome.value.set));if(granted){const label=`Gold Rock · ${granted.name||outcome.value.card.name||'Random Card'}`;return markGoldClaimed(ctx,{category:'card',label,coins:0,dust:0,tickets:0,card:granted,set:outcome.value.set||null});}}catch(_){ }}
      return fallbackGold(ctx,'card');
    }
    if(prize.category==='booster'){
      const outcome=await rewardDeadline(()=>bridge?.resolveBuriedBooster?.(),4500);
      if(outcome.status==='ok'&&outcome.value){try{const granted=await Promise.resolve(bridge?.grantBooster?.(outcome.value));if(Number(granted)>0){const label=`Gold Rock · Sealed Booster · ${outcome.value.set?.name||'Mystery Pack'}`;return markGoldClaimed(ctx,{category:'booster',label,coins:0,dust:0,tickets:0,boosterReward:outcome.value});}}catch(_){ }}
      return fallbackGold(ctx,'booster');
    }
    return fallbackGold(ctx,String(prize.category||'unknown'));
  }
  function beginGoldFulfilment(ctx){
    if(!ctx||ctx.settlementStarted)return ctx?.promise||Promise.resolve(ctx?.award||null);ctx.settlementStarted=true;ctx.promise=settleGold(ctx).catch(()=>{try{return fallbackGold(ctx,String(ctx.round?.gold?.prize?.category||'unknown'));}catch(_){return null;}});return ctx.promise;
  }
  function goldResultDetail(award){
    if(!award)return null;return {title:`GOLD ROCK · ${award.label.replace(/^Gold Rock · /,'')}`,subtitle:award.fallbackFrom?`Offline fallback from ${award.fallbackFrom}`:'Perfect Harden prize',kind:'find'};
  }

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['countdown','running'].includes(phase))rafId=raf(frame);}
  function profile(){return core.difficultyProfile(difficulty);}
  function timerAt(t=now()){
    if(!round)return core.CONFIG.safetyCapMs;
    if(phase==='paused')return pausedTimerMs;
    return Math.max(0,Math.round(round.safetyCapAt-Number(t)));
  }
  function setControls(active){if($('rockHardenReady'))$('rockHardenReady').hidden=active;if($('rockHardenControls'))$('rockHardenControls').hidden=!active;}
  function renderDifficulty(){
    if($('rockHardenDifficultyLabel'))$('rockHardenDifficultyLabel').textContent=String(profile().label||difficulty).toUpperCase();
    if(typeof document!=='undefined')for(const btn of document.querySelectorAll?.('[data-rock-harden-difficulty]')||[]){const active=btn.dataset.rockHardenDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const best=root.state?.arcade?.rockHarden?.bestScore||0;if($('rockHardenBest'))$('rockHardenBest').textContent=best?`BEST ${best}`:'BEST —';
  }
  function nextPendingWave(){return round?.waves?.find(w=>!w.processed)||null;}
  function renderLane(racer,index,t){
    if(!racer)return;
    const lane=$(laneIds[index]),hp=$(hpIds[index]),score=$(scoreIds[index]),sprite=$(spriteIds[index]),rock=$(rockIds[index]),shadow=$(shadowIds[index]),grade=$(gradeIds[index]);
    const impactActive=Number(impactUntil.get(racer.id)||0)>=t,gradeActive=Number(gradeUntil.get(racer.id)||0)>=t;
    lane?.classList?.toggle?.('is-hardened',!!racer.hardened);lane?.classList?.toggle?.('is-ko',!racer.alive);lane?.classList?.toggle?.('is-impact',impactActive);
    if(!impactActive){lane?.classList?.remove?.('is-hit','is-shatter');}
    if(!gradeActive)lane?.classList?.remove?.('is-grade-perfect','is-grade-good','is-grade-safe');
    if(hp){const pct=Math.max(0,Math.min(100,Number(racer.hp)||0));hp.style?.setProperty?.('--rock-harden-hp',String(pct));hp.style.width=`${pct}%`;}
    if(score)score.textContent=String(Number(racer.score)||0);
    if(sprite){const asset=racer.species?.asset||`arcade/sprites/actors/pokemon/${racer.species?.dex||11}.png`;if(sprite.src!==asset)sprite.src=asset;sprite.alt=`${racer.id==='player'?'Your':racer.id.replace('cpu','COM ')} ${racer.species?.name||'competitor'}`;}
    const current=racer.currentRock;
    if(rock){
      rock.classList?.toggle?.('is-active',!!current);rock.classList?.toggle?.('is-gold',!!current?.gold);rock.dataset.rockClass=current?.rockClass||'';rock.dataset.hazardKind=current?.hazardKind||'';
      if(rock.style)rock.style.backgroundImage=current?.asset?`url("${current.asset}")`:'';
      const lead=Math.max(1,Number(current?.telegraphLeadMs)||Number(profile().telegraphLeadMs)||900),progress=current?Math.max(0,Math.min(1,(Number(t)-(Number(current.impactAt)-lead))/lead)):0;rock.style?.setProperty?.('--rock-harden-y',`${Math.round(progress*74)}%`);
    }
    if(shadow){const lead=Math.max(1,Number(current?.telegraphLeadMs)||Number(profile().telegraphLeadMs)||900),progress=current?Math.max(0,Math.min(1,(Number(t)-(Number(current.impactAt)-lead))/lead)):0;shadow.classList?.toggle?.('is-active',!!current);shadow.classList?.toggle?.('is-gold',!!current?.gold);shadow.style?.setProperty?.('--rock-shadow-scale',String((.45+progress*.75).toFixed(2)));shadow.style?.setProperty?.('--rock-shadow-opacity',String((.28+progress*.58).toFixed(2)));}
    if(grade&&Number(gradeUntil.get(racer.id)||0)<t){grade.textContent='';grade.hidden=true;}
  }
  function handleEvents(t){
    if(!round)return;const ctx=goldContexts.get(round);
    for(const event of core.consumeEvents(round)){
      if(event.type==='goldSeen')recordGoldStat(ctx,'goldRocksSeen');
      if(event.type==='goldPerfect'){recordGoldStat(ctx,'goldRocksPerfected');beginGoldFulfilment(ctx);}
      if(event.type==='block'||event.type==='miss'||event.type==='heal'||event.type==='berryMissed'){
        if(event.racerId==='player'&&(event.type==='block'||event.type==='miss')){const key=event.type==='miss'?'miss':event.grade;if(Object.prototype.hasOwnProperty.call(playerGrades,key))playerGrades[key]+=1;}
        const i=round.racers.findIndex(r=>r.id===event.racerId),grade=$(gradeIds[i]);
        if(grade){const label=event.type==='heal'?`+${Math.round(Number(event.heal)||0)} HP!`:event.type==='berryMissed'?'BERRY MISSED':event.type==='miss'?'HIT!':event.grade==='perfect'?'PERFECT! +3':event.grade==='good'?'GOOD! +2':'BLOCK +1';grade.textContent=label;grade.hidden=false;gradeUntil.set(event.racerId,t+520);}
        const lane=$(laneIds[i]);if(event.type==='miss')lane?.classList?.add?.('is-hit');else if(event.type==='block'){lane?.classList?.remove?.('is-grade-perfect','is-grade-good','is-grade-safe');lane?.classList?.add?.(`is-grade-${event.grade}`,'is-shatter');}
      }
      if(event.type==='impact'){impactUntil.set(event.racerId,t+180);}
    }
  }
  function renderStandings(rows){const el=$('rockHardenStandings');if(!el)return;if(!rows){el.hidden=true;el.textContent='';return;}el.hidden=false;el.textContent=rows.map(r=>`${core.placeFor(round,r.id)} · ${r.id==='player'?'YOU':r.id.replace('cpu','COM ')} · ${r.score}`).join('   ');}
  function render(t=now()){
    if(!round)return;
    if($('rockHardenTimer'))$('rockHardenTimer').textContent=(timerAt(t)/1000).toFixed(2);
    const place=core.placeFor(round,'player');if($('rockHardenPlace'))$('rockHardenPlace').textContent=place?`${place}${place===1?'ST':place===2?'ND':place===3?'RD':'TH'}`:'—';
    round.racers?.forEach((r,i)=>renderLane(r,i,t));
    const count=$('rockHardenCountdown');
    if(count){
      if(phase==='countdown'){const rem=Math.max(0,countdownEndsAt-Number(t)),third=Math.max(1,countdownTotalMs/3);count.hidden=false;count.textContent=rem>third*2?'3':rem>third?'2':'1';}
      else if(phase==='running'&&Number(t)<=hardenFlashUntil){count.hidden=false;count.textContent='HARDEN!';}
      else count.hidden=true;
    }
    $('rockHardenStage')?.classList?.toggle?.('is-running',phase==='running');$('rockHardenStage')?.classList?.toggle?.('is-finished',phase==='finished');$('rockHardenButton')?.classList?.toggle?.('is-held',!!round.player?.hardened);
  }
  function frame(t){
    rafId=0;
    if(phase==='countdown'){
      if(t>=countdownEndsAt){phase='running';hardenFlashUntil=t+300;core.advanceRound(round,t);}render(t);
    }else if(phase==='running'){
      core.advanceRound(round,t);handleEvents(t);render(t);if(round.finalized){finishRound(t);return;}
    }
    schedule();
  }
  function showReady({difficulty:key=difficulty}={}){
    stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';phase='idle';round=core.createRound({difficulty,rng,nowMs:now(),goldRoundChance:rareOdds().goldRock});setupRoster=round.racers.map(r=>r.species);newGoldContext(round);pausedFrom=null;completionHandled=false;finalResult=null;activePointer=null;heldKeys.clear();gradeUntil.clear();impactUntil.clear();playerGrades={perfect:0,good:0,safe:0,miss:0};setControls(false);renderStandings(null);renderDifficulty();render();return snapshot();
  }
  function selectDifficulty(key){if(phase!=='idle'||!core.DIFFICULTIES[key])return false;difficulty=key;round=core.createRound({difficulty,rng,nowMs:now(),roster:setupRoster,goldRoundChance:rareOdds().goldRock});newGoldContext(round);renderDifficulty();render();return true;}
  function startRound({difficulty:key=difficulty,countdownMs=1200}={}){
    stopLoop();difficulty=core.DIFFICULTIES[key]?key:'normal';const t=now(),delay=Math.max(0,Number(countdownMs)||0),start=t+delay;
    round=core.createRound({difficulty,rng,nowMs:start,roster:setupRoster,goldRoundChance:rareOdds().goldRock});newGoldContext(round);phase=delay?'countdown':'running';countdownEndsAt=start;countdownTotalMs=delay;countdownRemainingMs=delay;hardenFlashUntil=delay?0:t+300;pausedFrom=null;completionHandled=false;finalResult=null;activePointer=null;heldKeys.clear();gradeUntil.clear();impactUntil.clear();playerGrades={perfect:0,good:0,safe:0,miss:0};setControls(true);renderStandings(null);renderDifficulty();handleEvents(t);render(t);schedule();return snapshot();
  }
  function press(){if(!round||phase!=='running')return false;const accepted=core.pressPlayer(round,now());if(accepted){try{root.navigator?.vibrate?.(5);}catch(_){ }handleEvents(now());render();}return !!accepted;}
  function release(){if(!round||!['running','paused'].includes(phase))return false;const releaseAt=phase==='paused'?pauseStartedAt:now();const accepted=core.releasePlayer(round,releaseAt);if(accepted&&phase==='running'){handleEvents(now());render();}return !!accepted;}
  function pause(){
    if(!['countdown','running'].includes(phase))return false;
    const t=now();
    if(phase==='running'){core.advanceRound(round,t);handleEvents(t);render(t);if(round.finalized){finishRound(t);return false;}}
    pausedFrom=phase;pauseStartedAt=t;pausedTimerMs=timerAt(t);
    if(phase==='countdown')countdownRemainingMs=Math.max(0,countdownEndsAt-t);
    phase='paused';stopLoop();$('rockHardenStage')?.classList?.add?.('is-paused');if($('rockHardenPauseOverlay'))$('rockHardenPauseOverlay').hidden=false;
    return true;
  }
  function resume(){
    if(phase!=='paused'||!pausedFrom)return false;
    const t=now(),delta=Math.max(0,t-pauseStartedAt),restore=pausedFrom;
    core.shiftRoundTimestamps(round,delta);
    if(restore==='countdown')countdownEndsAt=t+countdownRemainingMs;
    for(const [id,until] of gradeUntil)gradeUntil.set(id,until+delta);for(const [id,until] of impactUntil)impactUntil.set(id,until+delta);
    if(hardenFlashUntil)hardenFlashUntil+=delta;
    phase=restore;pausedFrom=null;$('rockHardenStage')?.classList?.remove?.('is-paused');if($('rockHardenPauseOverlay'))$('rockHardenPauseOverlay').hidden=true;render(t);schedule();return true;
  }
  function presentFinishedRound(roundRef,ranking,place,reward,score,perfects,award,previousBestScore=0,previousBestPerfects=0){
    if(round!==roundRef||phase!=='finished'||presentedRounds.has(roundRef))return false;presentedRounds.add(roundRef);
    const rec=root.state?.arcade?.rockHarden||{},details=ranking.map(r=>({title:`${core.placeFor(roundRef,r.id)} · ${r.id==='player'?'YOU':r.id.replace('cpu','COM ')} · ${Math.round(Number(r.hp)||0)} HP · ${Number(r.score)||0} PTS`,subtitle:r.id==='player'?`${profile().label} · ${perfects} PERFECT`:'',kind:r.id==='player'?'find':'neutral'}));
    const goldDetail=goldResultDetail(award);if(goldDetail)details.unshift(goldDetail);
    const player=roundRef.player||{},goldValue=award?.label?award.label.replace(/^Gold Rock · /,''):(roundRef.gold?.seen?'No prize':'Not seen'),review={title:place===1?'ROCK SOLID!':'ROUND OVER',mode:'Survival',difficulty:profile().label,metricLabel:'SCORE',metricValue:String(score),scoreboard:ranking.map(r=>({rank:String(core.placeFor(roundRef,r.id)),label:r.id==='player'?'YOU':r.id.replace('cpu','COM '),value:`${Number(r.score)||0} PTS · ${Math.max(0,Math.round(Number(r.hp)||0))} HP`,subtitle:r.alive?'SURVIVED':'KO',player:r.id==='player'})),stats:[{label:'Perfect',value:String(playerGrades.perfect)},{label:'Good',value:String(playerGrades.good)},{label:'Safe',value:String(playerGrades.safe)},{label:'Miss',value:String(playerGrades.miss)},{label:'HP Remaining',value:String(Math.max(0,Math.round(Number(player.hp)||0)))},{label:'Gold Rock',value:goldValue}],pbs:[{label:`${profile().label} Best Score`,value:String(rec.bestScores?.[difficulty]||score),isNew:Number(score)>previousBestScore},{label:'Best Perfects',value:String(rec.bestPerfects||perfects),isNew:Number(perfects)>previousBestPerfects}],rewards:[{label:'Lucky Coins',value:String(reward||0)},...(award?.label?[{label:'Gold Rock',value:goldValue}]:[])]};
    session()?.showResult?.('rockHarden',{title:place===1?'ROCK SOLID!':'ROUND OVER',metricLabel:'SCORE',metricValue:String(score),coinsAwarded:reward,bestText:`BEST ${rec.bestScore||score}`,details,review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return true;
  }
  function finishRound(t=now()){
    if(finalResult)return finalResult;if(!round||!round.finalized)return null;
    handleEvents(t);
    const roundRef=round,ctx=goldContexts.get(roundRef),ranking=core.rankRound(roundRef),place=core.placeFor(roundRef,'player'),reward=core.rewardFor(place,difficulty),player=roundRef.player||{},score=Number(player.score)||0,perfects=Number(player.perfects)||0,blocks=Number(player.blocks)||0,hp=Math.max(0,Number(player.hp)||0);
    finalResult={place,reward,difficulty,score,perfects,blocks,hpRemaining:hp,ranking:ranking.map(r=>({id:r.id,score:Number(r.score)||0,hp:Math.max(0,Number(r.hp)||0),alive:!!r.alive,place:core.placeFor(roundRef,r.id)})),goldAward:ctx?.settled&&ctx.award?JSON.parse(JSON.stringify(ctx.award)):null};
    const priorRecord=root.state?.arcade?.rockHarden||{},previousBestScore=Number(priorRecord.bestScores?.[difficulty]||0),previousBestPerfects=Number(priorRecord.bestPerfects||0);
    phase='finished';stopLoop();setControls(false);renderStandings(ranking);render(t);
    if(!completionHandled){
      completionHandled=true;const p=platform();let coinsAwarded=reward;
      if(root.state&&p?.ensureArcadeState){
        root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.rockHarden;
        rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;
        if(place===1){rec.wins=Number(rec.wins||0)+1;rec.winsByDifficulty=rec.winsByDifficulty||{easy:0,normal:0,hard:0};rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty[difficulty]||0)+1;rec.bestHpRemaining=Math.max(Number(rec.bestHpRemaining||0),hp);}
        if(place<=3)rec.podiums=Number(rec.podiums||0)+1;
        rec.bestScore=Math.max(Number(rec.bestScore||0),score);rec.bestScores=rec.bestScores||{easy:0,normal:0,hard:0};rec.bestScores[difficulty]=Math.max(Number(rec.bestScores[difficulty]||0),score);
        rec.bestPerfects=Math.max(Number(rec.bestPerfects||0),perfects);rec.perfectBlocks=Number(rec.perfectBlocks||0)+perfects;rec.totalBlocks=Number(rec.totalBlocks||0)+blocks;
        const awarded=p.awardRun?.({gameId:'rockHarden',label:'Rock Harden',score,coins:reward})||{coinsAwarded:reward};coinsAwarded=awarded.coinsAwarded;root.save?.();
      }
      const show=()=>presentFinishedRound(roundRef,ranking,place,coinsAwarded,score,perfects,ctx?.award||null,previousBestScore,previousBestPerfects);
      if(ctx?.settlementStarted&&!ctx.settled)ctx.promise.finally(show);else show();
    }
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('rockHarden',$('rockHardenGame'));showReady({difficulty:'normal'});return true;}
  function close(){opened=false;stopLoop();phase='closed';round=null;setupRoster=null;currentGoldContext=null;pausedFrom=null;completionHandled=false;finalResult=null;activePointer=null;heldKeys.clear();playerGrades={perfect:0,good:0,safe:0,miss:0};setControls(false);renderStandings(null);if($('rockHardenPauseOverlay'))$('rockHardenPauseOverlay').hidden=true;return true;}
  function keyName(e){const k=String(e?.key||'').toLowerCase();return k===' '||k==='spacebar'?'space':k==='a'?'a':null;}
  function keydown(e){const k=keyName(e);if(!k||e?.repeat||heldKeys.has(k))return false;heldKeys.add(k);const accepted=press();if(accepted)e?.preventDefault?.();return accepted;}
  function keyup(e){const k=keyName(e);if(!k||!heldKeys.has(k))return false;heldKeys.delete(k);const accepted=release();if(accepted)e?.preventDefault?.();return accepted;}
  function pointerDown(e){if(activePointer!=null)return;activePointer=e?.pointerId??0;e?.preventDefault?.();e?.stopPropagation?.();e?.currentTarget?.setPointerCapture?.(activePointer);press();}
  function pointerUp(e){const id=e?.pointerId??0;if(activePointer==null||id!==activePointer)return;activePointer=null;e?.preventDefault?.();e?.stopPropagation?.();release();}
  function snapshot(){
    const t=now(),player=round?.player||{},next=nextPendingWave();
    return {phase,difficulty,timerMs:timerAt(t),place:round?core.placeFor(round,'player'):4,nextImpactAt:next?.impactAt??null,finalized:!!round?.finalized,player:{id:'player',hp:Number(player.hp)||0,score:Number(player.score)||0,species:player.species?{...player.species}:null,alive:!!player.alive,hardened:!!player.hardened,hardenStartedAt:player.hardenStartedAt??null,lastGrade:player.lastGrade??null,lastImpactAt:player.lastImpactAt??null,perfects:Number(player.perfects)||0,blocks:Number(player.blocks)||0},racers:(round?.racers||[]).map(r=>({id:r.id,hp:Number(r.hp)||0,score:Number(r.score)||0,species:r.species?{...r.species}:null,alive:!!r.alive,hardened:!!r.hardened,hardenStartedAt:r.hardenStartedAt??null,lastGrade:r.lastGrade??null,lastImpactAt:r.lastImpactAt??null,perfects:Number(r.perfects)||0,blocks:Number(r.blocks)||0,currentRock:r.currentRock?{...r.currentRock}:null})),gold:round?.gold?{present:!!round.gold.present,waveIndex:round.gold.waveIndex,seen:!!round.gold.seen,perfected:!!round.gold.perfected,lost:!!round.gold.lost,award:(goldContexts.get(round)?.settled&&goldContexts.get(round)?.award)?JSON.parse(JSON.stringify(goldContexts.get(round).award)):null}:{present:false,waveIndex:null,seen:false,perfected:false,lost:false,award:null},finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};
  }
  function wire(){
    $('rockHardenStart')?.addEventListener?.('click',()=>startRound());$('rockHardenResume')?.addEventListener?.('click',resume);const b=$('rockHardenButton');b?.addEventListener?.('pointerdown',pointerDown);b?.addEventListener?.('pointerup',pointerUp);b?.addEventListener?.('pointercancel',pointerUp);
    for(const btn of document.querySelectorAll?.('[data-rock-harden-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.rockHardenDifficulty));
    document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('keyup',keyup,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});
  }
  if(typeof document!=='undefined')wire();
  return {open,close,showReady,startRound,press,release,pause,resume,finishRound,selectDifficulty,snapshot};
});
