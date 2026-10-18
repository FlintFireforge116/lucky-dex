(function(root,factory){
  const core=root.LuckyDexGutsyGolbatCore||(typeof require==='function'?require('./arcade-gutsy-golbat-core.js'):null);
  const api=factory(root,core);root.LuckyDexGutsyGolbat=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexGutsyGolbatCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const ordinal=n=>`${n}${n===1?'ST':n===2?'ND':n===3?'RD':'TH'}`;
  let opened=false,phase='closed',difficulty='normal',playerDex=42,run=null,rafId=0,lastAt=0,countdownUntil=0,pausedFrom=null,pauseStartedAt=0,eventCursor=0,messageUntil=0,completionHandled=false,finalResult=null,rng=Math.random;
  const input={left:false,right:false};

  function profile(){return core.difficultyProfile(difficulty);}
  function rareRate(){return Math.max(0,Math.min(1,Number(root.state?.settings?.rareOdds?.gutsyGolbatGoldenHeart ?? .02)||0));}
  function leftHanded(){return !!root.state?.settings?.gutsyGolbatLeftHanded;}
  function renderHandedness(){const on=leftHanded(),host=$('gutsyGolbatControls'),btn=$('gutsyGolbatHandedness');host?.classList?.toggle('is-left-handed',on);if(btn){btn.textContent=on?'CONTROLS · LEFT-HANDED':'CONTROLS · RIGHT-HANDED';btn.setAttribute('aria-pressed',on?'true':'false');}}
  function toggleHandedness(){if(!root.state?.settings)return false;root.state.settings.gutsyGolbatLeftHanded=!leftHanded();root.save?.();renderHandedness();return true;}
  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&['countdown','running'].includes(phase))rafId=raf(frame);}
  function setControls(active){const host=$('gutsyGolbatControls');if(host)host.hidden=!active;for(const id of ['gutsyGolbatLeft','gutsyGolbatFlap','gutsyGolbatRight']){const b=$(id);if(b)b.disabled=!active;}}
  function clearInput(){input.left=false;input.right=false;for(const id of ['gutsyGolbatLeft','gutsyGolbatRight'])$(id)?.classList?.remove('is-held');}
  function livePlace(){if(!run)return 1;const you=run.players[0];return 1+run.players.filter(p=>p.index!==0&&(p.hearts>you.hearts||(p.hearts===you.hearts&&p.index<you.index))).length;}
  function bestHearts(){return Number(root.state?.arcade?.gutsyGolbat?.bestHeartsByDifficulty?.[difficulty]||0);}
  function selectedFlyer(){return core.caveFlier(playerDex);}
  function renderPicker(){for(const btn of document.querySelectorAll?.('[data-gutsy-pokemon]')||[]){const on=Number(btn.dataset.gutsyPokemon)===playerDex;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',on?'true':'false');}const n=$('gutsyGolbatFlyerName');if(n)n.textContent=selectedFlyer().name.toUpperCase();}
  function selectPokemon(dex){if(phase!=='ready')return false;const flyer=core.caveFlier(dex);playerDex=flyer.dex;renderPicker();return true;}

  function renderHud(){
    const you=run?.players?.[0];if($('gutsyGolbatHearts'))$('gutsyGolbatHearts').textContent=String(you?.hearts||0);if($('gutsyGolbatPlace'))$('gutsyGolbatPlace').textContent=ordinal(run?.finished?you?.place||4:livePlace());if($('gutsyGolbatProgress'))$('gutsyGolbatProgress').textContent=`${Math.round((run?.progress||0)*100)}%`;if($('gutsyGolbatDifficultyLabel'))$('gutsyGolbatDifficultyLabel').textContent=profile().label.toUpperCase();if($('gutsyGolbatBest'))$('gutsyGolbatBest').textContent=bestHearts()?`BEST ${bestHearts()} HEARTS`:'BEST —';
  }
  function renderPlayers(){
    if(!run)return;for(const p of run.players){const node=$(`gutsyGolbatPlayer${p.index}`);if(!node)continue;node.style.setProperty('--gx',`${(p.x/core.CONFIG.width*100).toFixed(2)}%`);node.style.setProperty('--gy',`${(p.y/core.CONFIG.height*100).toFixed(2)}%`);node.style.setProperty('--tilt',`${Math.max(-18,Math.min(18,(p.vy||0)*.045)).toFixed(1)}deg`);node.classList.toggle('is-leading',p.index===0&&livePlace()===1);const img=node.querySelector('img');if(img){const src=`arcade/sprites/actors/pokemon/${p.dex}.png`;if(!img.src.endsWith(src))img.src=src;img.alt=p.index===0?`Your ${p.species}`:`COM ${p.species}`;}const badge=node.querySelector('i');if(badge)badge.textContent=String(p.hearts||0);}
  }
  function entityHtml(e){
    const x=(e.x/core.CONFIG.width*100).toFixed(2),y=(e.y/core.CONFIG.height*100).toFixed(2);
    if(e.kind==='magnemite')return `<span class="gutsy-entity gutsy-magnemite" style="--ex:${x}%;--ey:${y}%"><img src="arcade/sprites/actors/pokemon/81.png" alt="" draggable="false"></span>`;
    const cls=e.golden?'gutsy-heart is-golden':'gutsy-heart';return `<span class="gutsy-entity ${cls}${e.kind==='loose-heart'?' is-loose':''}" style="--ex:${x}%;--ey:${y}%">${e.golden?'★':'♥'}</span>`;
  }
  function renderEntities(){const host=$('gutsyGolbatEntities');if(!host||!run)return;host.innerHTML=run.entities.filter(e=>!e.collected&&e.x>-85&&e.x<core.CONFIG.width+80).map(entityHtml).join('');}
  function renderFinish(){const n=$('gutsyGolbatFinish');if(!n)return;const show=!!run&&run.progress>=.82;n.hidden=!show;if(show)n.style.setProperty('--finish-x',`${core.finishLinePct(run.progress).toFixed(1)}%`);}
  function setStatus(text){const n=$('gutsyGolbatStatus');if(n)n.textContent=text;}
  function showMessage(text,kind=''){const n=$('gutsyGolbatMessage');if(!n)return;n.hidden=false;n.className=`gutsy-message ${kind?`is-${kind}`:''}`;n.textContent=text;messageUntil=now()+900;}
  function renderMessage(t){const n=$('gutsyGolbatMessage');if(n&&!n.hidden&&t>=messageUntil)n.hidden=true;}
  function renderAll(t=now()){renderHud();renderPlayers();renderEntities();renderFinish();renderMessage(t);session()?.update?.('gutsyGolbat',{runText:`${run?.players?.[0]?.hearts||0} hearts · ${ordinal(run?.finished?run.players[0].place:livePlace())} · ${Math.round((run?.progress||0)*100)}%`});}

  function processEvents(){
    if(!run)return;for(;eventCursor<run.events.length;eventCursor++){
      const e=run.events[eventCursor];if(e.player===0){
        if(e.type==='golden-heart'){showMessage('GOLDEN HEART! +5','gold');root.navigator?.vibrate?.([25,30,45]);}
        else if(e.type==='heart'){if(e.count>0)root.navigator?.vibrate?.(7);}
        else if(e.type==='magnemite-hit'){showMessage(e.count?`MAGNEMITE! -${e.count}`:'MAGNEMITE!','hit');root.navigator?.vibrate?.([45,30,45]);}
        else if(e.type==='scatter'&&e.reason==='rival'){showMessage(e.count?`HARD HIT! -${e.count}`:'HARD HIT!','hit');root.navigator?.vibrate?.(35);}
      }else if(e.type==='rival-hit'&&e.victim===0){showMessage(e.count?`BODY CHECK! -${e.count}`:'BODY CHECK!','hit');root.navigator?.vibrate?.(35);}
    }
  }

  function showReady(nextDifficulty=difficulty){
    difficulty=core.DIFFICULTIES[nextDifficulty]?nextDifficulty:'normal';phase='ready';run=null;finalResult=null;completionHandled=false;eventCursor=0;stopLoop();clearInput();setControls(false);if($('gutsyGolbatReady'))$('gutsyGolbatReady').hidden=false;if($('gutsyGolbatPauseOverlay'))$('gutsyGolbatPauseOverlay').hidden=true;if($('gutsyGolbatCountdown'))$('gutsyGolbatCountdown').hidden=true;if($('gutsyGolbatFinish'))$('gutsyGolbatFinish').hidden=true;if($('gutsyGolbatEntities'))$('gutsyGolbatEntities').innerHTML='';for(let i=0;i<4;i++)$(`gutsyGolbatPlayer${i}`)?.removeAttribute?.('style');
    for(const btn of document.querySelectorAll?.('[data-gutsy-difficulty]')||[]){const on=btn.dataset.gutsyDifficulty===difficulty;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',on?'true':'false');}renderPicker();renderHandedness();renderHud();setStatus('Collect the most hearts before the finish.');return true;
  }
  function selectDifficulty(key){if(phase!=='ready'||!core.DIFFICULTIES[key])return false;return showReady(key);}
  function startRun(){
    if(!opened||phase!=='ready')return false;session()?.hideResult?.();run=core.createRun({difficulty,rng,goldenHeartRate:rareRate(),playerDex});eventCursor=0;finalResult=null;completionHandled=false;phase='countdown';countdownUntil=now()+3000;lastAt=now();if($('gutsyGolbatReady'))$('gutsyGolbatReady').hidden=true;const c=$('gutsyGolbatCountdown');if(c){c.hidden=false;c.textContent='3';}setControls(true);setStatus('READY…');renderAll();schedule();return true;
  }
  function flap(){if(!run||!['countdown','running'].includes(phase))return false;if(phase==='countdown')return false;const ok=core.flap(run,0);if(ok){$('gutsyGolbatPlayer0')?.classList?.remove('is-flapping');void $('gutsyGolbatPlayer0')?.offsetWidth;$('gutsyGolbatPlayer0')?.classList?.add('is-flapping');root.navigator?.vibrate?.(6);}return ok;}
  function setSteer(side,on){if(!['left','right'].includes(side))return false;input[side]=!!on;$(`gutsyGolbat${side==='left'?'Left':'Right'}`)?.classList?.toggle('is-held',!!on);return true;}
  function pause(){if(!['countdown','running'].includes(phase))return false;pauseStartedAt=now();pausedFrom=phase;phase='paused';stopLoop();clearInput();setControls(false);if($('gutsyGolbatPauseOverlay'))$('gutsyGolbatPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||!pausedFrom)return false;const t=now(),delta=t-pauseStartedAt;if(pausedFrom==='countdown')countdownUntil+=delta;phase=pausedFrom;pausedFrom=null;lastAt=t;if($('gutsyGolbatPauseOverlay'))$('gutsyGolbatPauseOverlay').hidden=true;setControls(true);schedule();return true;}

  function updateStateAndFinish(){
    if(completionHandled||!run?.finished)return finalResult;completionHandled=true;stopLoop();clearInput();setControls(false);phase='finished';const p=platform();if(!root.state||!p?.ensureArcadeState)return null;root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.gutsyGolbat,you=run.players[0],place=you.place||4,prevBest=Number(rec.bestHeartsByDifficulty?.[difficulty]||0),prevWins=Number(rec.winsByDifficulty?.[difficulty]||0);
    rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;if(place===1)rec.wins=Number(rec.wins||0)+1;if(place<=3)rec.podiums=Number(rec.podiums||0)+1;rec.bestHearts=Math.max(Number(rec.bestHearts||0),you.hearts);rec.bestHeartsByDifficulty[difficulty]=Math.max(Number(rec.bestHeartsByDifficulty?.[difficulty]||0),you.hearts);if(place===1)rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty?.[difficulty]||0)+1;rec.totalHeartsCollected=Number(rec.totalHeartsCollected||0)+Number(you.heartsCollected||0);rec.totalHeartsLost=Number(rec.totalHeartsLost||0)+Number(you.heartsLost||0);rec.magnemiteHits=Number(rec.magnemiteHits||0)+Number(you.magnemiteHits||0);rec.rivalHits=Number(rec.rivalHits||0)+Number(you.rivalHits||0);if(run.goldenEvent)rec.goldenHeartsSeen=Number(rec.goldenHeartsSeen||0)+1;rec.goldenHeartsCollected=Number(rec.goldenHeartsCollected||0)+Number(you.goldenHearts||0);if(place===1&&you.magnemiteHits===0)rec.cleanWins=Number(rec.cleanWins||0)+1;
    const coins=core.rewardForResult({place,hearts:you.hearts,difficulty,goldenHearts:you.goldenHearts});const award=p.awardRun?.({gameId:'gutsyGolbat',label:'Gutsy Golbat',score:you.hearts,coins})||{coinsAwarded:coins};root.save?.();
    finalResult={place,hearts:you.hearts,coins:award.coinsAwarded||0,difficulty,goldenHearts:you.goldenHearts};
    const title=place===1?'CAVE CHAMPION!':place===2?'RUNNER-UP!':place===3?'PODIUM FINISH!':'CAVE COMPLETE';const review={title,mode:'Stadium 2 · Gutsy Golbat',difficulty:profile().label,metricLabel:'HEARTS',metricValue:String(you.hearts),stats:[{label:'Place',value:ordinal(place)},{label:'Hearts Collected',value:String(you.heartsCollected)},{label:'Hearts Scattered',value:String(you.heartsLost)},{label:'Magnemite Hits',value:String(you.magnemiteHits)},{label:'Rival Hits Landed',value:String(you.rivalHits)},{label:'Golden Hearts',value:String(you.goldenHearts)}],pbs:[{label:`${profile().label} Hearts`,value:String(rec.bestHeartsByDifficulty[difficulty]),isNew:you.hearts>prevBest},{label:`${profile().label} Wins`,value:String(rec.winsByDifficulty[difficulty]),isNew:place===1&&prevWins===0}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};
    session()?.showResult?.('gutsyGolbat',{title,metricLabel:'HEARTS',metricValue:String(you.hearts),coinsAwarded:award.coinsAwarded,bestText:`${ordinal(place)} · BEST ${rec.bestHearts} HEARTS`,review,replayLabel:'FLY AGAIN',onReplay:()=>showReady(difficulty),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});renderAll();return finalResult;
  }
  function frame(t){
    rafId=0;if(phase==='countdown'){
      const left=Math.max(0,countdownUntil-t),c=$('gutsyGolbatCountdown');if(left<=0){phase='running';lastAt=t;if(c)c.hidden=true;setStatus('FLAP · STEER · COLLECT!');}else if(c){c.hidden=false;c.textContent=String(Math.max(1,Math.ceil(left/1000)));}
      renderAll(t);schedule();return;
    }
    if(phase!=='running'||!run)return;const dt=Math.min(70,Math.max(0,t-lastAt));lastAt=t;core.stepRun(run,dt,input);processEvents();renderAll(t);if(run.finished){updateStateAndFinish();return;}schedule();
  }
  function open(){opened=true;session()?.mount?.('gutsyGolbat',$('gutsyGolbatGame'));showReady(difficulty);return true;}
  function close(){opened=false;stopLoop();phase='closed';run=null;eventCursor=0;finalResult=null;completionHandled=false;pausedFrom=null;clearInput();setControls(false);if($('gutsyGolbatPauseOverlay'))$('gutsyGolbatPauseOverlay').hidden=true;return true;}
  function keydown(e){if(!opened)return false;const k=String(e?.key||'').toLowerCase();if(k==='arrowleft'){setSteer('left',true);e.preventDefault?.();return true;}if(k==='arrowright'){setSteer('right',true);e.preventDefault?.();return true;}if(['a',' ','arrowup'].includes(k)){if(!e.repeat)flap();e.preventDefault?.();return true;}return false;}
  function keyup(e){if(!opened)return false;const k=String(e?.key||'').toLowerCase();if(k==='arrowleft'){setSteer('left',false);return true;}if(k==='arrowright'){setSteer('right',false);return true;}return false;}
  function holdButton(id,side){const b=$(id);if(!b)return;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);setSteer(side,true);});for(const ev of ['pointerup','pointercancel','lostpointercapture','pointerleave'])b.addEventListener(ev,()=>setSteer(side,false));}
  function snapshot(){return {phase,difficulty,run:run?JSON.parse(JSON.stringify(run)):null,finalResult:finalResult?{...finalResult}:null};}
  function wire(){if(typeof document==='undefined')return;$('gutsyGolbatStart')?.addEventListener('click',startRun);$('gutsyGolbatFlap')?.addEventListener('pointerdown',e=>{e.preventDefault();flap();});$('gutsyGolbatResume')?.addEventListener('click',resume);$('gutsyGolbatHandedness')?.addEventListener('click',toggleHandedness);holdButton('gutsyGolbatLeft','left');holdButton('gutsyGolbatRight','right');for(const btn of document.querySelectorAll?.('[data-gutsy-difficulty]')||[])btn.addEventListener('click',()=>selectDifficulty(btn.dataset.gutsyDifficulty));for(const btn of document.querySelectorAll?.('[data-gutsy-pokemon]')||[])btn.addEventListener('click',()=>selectPokemon(btn.dataset.gutsyPokemon));document.addEventListener('keydown',keydown,{capture:true});document.addEventListener('keyup',keyup,{capture:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  wire();return {open,close,showReady,startRun,flap,pause,resume,selectDifficulty,selectPokemon,toggleHandedness,snapshot,finishRun:updateStateAndFinish,_setRng:fn=>{if(typeof fn==='function')rng=fn;}};
});
