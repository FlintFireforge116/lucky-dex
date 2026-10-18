/* Lucky Dex v0.16.4 — Gen III Berry Blender
   Core timing/speed/progress values are ported from pret/pokeemerald's
   berry_blender.c, adapted to a touch UI and Lucky Dex arcade rewards. */
(() => {
  const MAX_POS = 0x10000;
  const MIN_SPEED = 0x80;          // Retail Emerald: 7.03 RPM
  const HIGH_SPEED = 1500;         // Retail threshold: ~82.39 RPM
  const MAX_PROGRESS = 1000;
  const PLAYERS = 4;
  const SPEED_DIVISOR = 4;
  const PLAYER_HIT_START = 32;     // Retail 4-player arrowId 0
  const NPC_STATIONS = [224, 96, 160];
  const NPC_FEEDBACK_IDS = ['berryFeedbackMister','berryFeedbackLaddie','berryFeedbackLassie'];
  const SYMBOL = { best:'◎', good:'○', miss:'×' };
  let sessionSerial = 0,berryGame=null,berryRaf=null;
  const pendingTimers=new Set();
  const setTimeout=(fn,ms)=>{const id=window.setTimeout(()=>{pendingTimers.delete(id);fn();},ms);pendingTimers.add(id);return id;};

  const $ = id => document.getElementById(id);
  const clampV = (v,a,b) => Math.max(a,Math.min(b,v));

  function rpmHundredths(speed){
    return Math.floor((60 * 60 * 100 * Math.max(0,speed)) / MAX_POS);
  }
  function rpmValue(speed){ return rpmHundredths(speed) / 100; }
  function rpmText(speed){ return rpmValue(speed).toFixed(2).padStart(6,'0'); }
  function arrowDegrees(pos){ return ((pos % MAX_POS) / MAX_POS) * 360; }

  function getPlayerProximity(pos){
    // Exact retail Emerald window from GetArrowProximity for player 0:
    // total GOOD window = 48/256 of a revolution; BEST = central 8/256.
    let p = Math.floor((((pos % MAX_POS) + MAX_POS) % MAX_POS) / 256) + 24;
    let bestLo = PLAYER_HIT_START + 20;
    let bestHi = PLAYER_HIT_START + 28;
    try{
      const helper = typeof helperAbility === 'function' ? helperAbility(state?.pokemon?.[state?.team?.[0]]) : null;
      if(helper?.name === 'Gentle Hands') { bestLo -= 4; bestHi += 4; }
    }catch(e){}
    if(p >= PLAYER_HIT_START && p < PLAYER_HIT_START + 48){
      if(p >= bestLo && p < bestHi) return 'best';
      return 'good';
    }
    return 'miss';
  }

  function syncPlayerHitZoneV163(){
    const target=$('berryPlayerHitZone');if(!target)return;
    let bestLo=PLAYER_HIT_START+20,bestHi=PLAYER_HIT_START+28;
    try{
      const helper=typeof helperAbility==='function'?helperAbility(state?.pokemon?.[state?.team?.[0]]):null;
      if(helper?.name==='Gentle Hands'){bestLo-=4;bestHi+=4;}
    }catch(e){}
    const goodRawLo=PLAYER_HIT_START-24,goodRawHi=PLAYER_HIT_START+48-24;
    const bestRawLo=bestLo-24,bestRawHi=bestHi-24;
    // The pointer is rendered counter-clockwise (negative rotation), while CSS
    // conic gradients advance clockwise. Start each highlighted arc at the
    // visual high edge and sweep clockwise back toward its low edge.
    const cssStart=raw=>((360-(raw/256)*360)%360+360)%360;
    target.style.setProperty('--berry-good-start',`${cssStart(goodRawHi)}deg`);
    target.style.setProperty('--berry-good-sweep',`${((goodRawHi-goodRawLo)/256)*360}deg`);
    target.style.setProperty('--berry-best-start',`${cssStart(bestRawHi)}deg`);
    target.style.setProperty('--berry-best-sweep',`${((bestRawHi-bestRawLo)/256)*360}deg`);

    // Put the fixed yellow target notch at the mathematical centre of the
    // player's GOOD window.  The same raw position is used by getPlayerProximity,
    // so the visual target cannot drift away from the actual scoring window.
    const midRaw=(goodRawLo+goodRawHi)/2,midDeg=cssStart(midRaw),rad=midDeg*Math.PI/180,radius=42.5;
    target.style.setProperty('--berry-target-x',`${50+Math.sin(rad)*radius}%`);
    target.style.setProperty('--berry-target-y',`${50-Math.cos(rad)*radius}%`);
    target.style.setProperty('--berry-target-rotate',`${midDeg}deg`);
  }

  function applySpeedHit(kind){
    if(!berryGame) return;
    if(kind === 'best') berryGame.speed += (berryGame.speed < HIGH_SPEED ? 384 : 128) / SPEED_DIVISOR;
    else if(kind === 'good' && berryGame.speed < HIGH_SPEED) berryGame.speed += 256 / SPEED_DIVISOR;
    else if(kind === 'miss') berryGame.speed -= 256 / SPEED_DIVISOR;
    berryGame.speed = Math.max(MIN_SPEED, berryGame.speed);
    berryGame.maxRpmHundredths = Math.max(berryGame.maxRpmHundredths, rpmHundredths(berryGame.speed));
  }

  function addProgress(kind){
    if(!berryGame) return;
    if(kind === 'best') berryGame.progress = Math.min(MAX_PROGRESS, berryGame.progress + Math.floor(berryGame.speed / 55));
    else if(kind === 'good') berryGame.progress = Math.min(MAX_PROGRESS, berryGame.progress + Math.floor(berryGame.speed / 70));
  }

  function scoreHit(playerIndex, kind, fromPlayer=false){
    if(!berryGame || berryGame.phase !== 'running') return;
    const row = berryGame.scores[playerIndex];
    row[kind]++;
    applySpeedHit(kind);
    addProgress(kind);

    if(fromPlayer){
      if(kind === 'best'){
        try{
          state.stats.perfectBerryRounds = Number(state.stats.perfectBerryRounds||0) + 1;
          if(typeof bumpDaily === 'function') bumpDaily('perfectBerry',1);
        }catch(e){}
        try{ if(typeof vibrate === 'function') vibrate([10,12,24]); }catch(e){}
      } else if(kind === 'good') {
        try{ if(typeof vibrate === 'function') vibrate(10); }catch(e){}
      } else {
        try{ if(typeof vibrate === 'function') vibrate(24); }catch(e){}
      }
      showFeedback('berryFeedbackYou', kind);
      const result = $('blendResult');
      if(result){
        result.textContent = kind === 'best' ? '◎ PERFECT!' : kind === 'good' ? '○ GOOD' : '× MISS';
        result.className = `blend-result ${kind === 'best' ? 'perfect' : kind}`;
      }
      if(kind === 'best' && berryGame.speed >= HIGH_SPEED) highSpeedShake();
    } else {
      showFeedback(NPC_FEEDBACK_IDS[playerIndex-1], kind);
    }
    burstParticles(kind);
    renderBerryHud();
  }

  function npcOutcome(index){
    const r = Math.floor(Math.random()*101); // Matches retail Random()/655 style (0..100).
    const s = berryGame.speed;

    if(index === 1){
      if(s < 500){
        // Use the documented/intended low-speed distribution rather than reproducing
        // Emerald's assignment-overwrite bug that forces this NPC to GOOD.
        return r > 75 ? 'best' : 'good';
      }
      if(s < HIGH_SPEED){
        if(r > 80) return 'best';
        if(r >= 21 && r <= 80) return 'good';
        if(r < 10) return 'miss';
        return null;
      }
      if(r > 90) return 'best';
      if(r >= 71 && r <= 90) return 'good';
      if(r < 30) return 'miss';
      return null;
    }

    if(index === 2){
      if(s < 500) return r > 66 ? 'best' : 'good';
      if(r > 65) return 'best';
      if(r > 40 && r <= 65) return 'good';
      if(r < 10) return 'miss';
      return null;
    }

    // LASSIE / third NPC.
    if(s < 500) return r > 88 ? 'best' : 'good';
    if(r > 60) return 'best';
    if(r > 55 && r <= 60) return 'good';
    if(r < 5) return 'miss';
    return null;
  }

  function crossedTarget(prev, next, target){
    prev = ((prev%MAX_POS)+MAX_POS)%MAX_POS;
    next = ((next%MAX_POS)+MAX_POS)%MAX_POS;
    if(next >= prev) return target > prev && target <= next;
    return target > prev || target <= next;
  }

  function processNpcCrossings(prevPos, nextPos){
    for(let i=0;i<3;i++){
      const target = NPC_STATIONS[i] * 256;
      if(crossedTarget(prevPos,nextPos,target)){
        const outcome = npcOutcome(i+1);
        if(outcome) scoreHit(i+1,outcome,false);
      }
    }
  }

  function renderBerryHud(){
    if(!berryGame) return;
    const rpm = rpmText(berryGame.speed);
    const max = (berryGame.maxRpmHundredths/100).toFixed(2);
    if($('berryRpmLarge')) $('berryRpmLarge').textContent = rpm;
    if($('berrySpeed')) $('berrySpeed').textContent = rpm;
    if($('berryScore')) $('berryScore').textContent = max;
    if($('berryHits')) $('berryHits').textContent = berryGame.scores[0].best;
    if($('berryCombo')) $('berryCombo').textContent = berryGame.scores[0].good;
    if($('berryMisses')) $('berryMisses').textContent = berryGame.scores[0].miss;
    const pct = Math.floor((berryGame.displayProgress/MAX_PROGRESS)*100);
    if($('berryProgressFill')) $('berryProgressFill').style.width = `${pct}%`;
    if($('berryProgressText')) $('berryProgressText').textContent = `${pct}%`;
    const intensity = clampV((rpmValue(berryGame.speed)-7.03)/93,0,1);
    $('berryGame')?.style.setProperty('--berry-speed',intensity.toFixed(3));
  }

  function renderArrow(){
    if(!berryGame) return;
    // Negative rotation keeps the player marker in the original top-left station.
    const deg = -arrowDegrees(berryGame.arrowPos);
    const arrow = $('berryMovingArrow');
    if(arrow) arrow.style.transform = `rotate(${deg}deg)`;
    const target=$('berryPlayerHitZone');
    if(target){
      const proximity=berryGame.phase==='running'?getPlayerProximity(berryGame.arrowPos):'miss';
      target.classList.toggle('in-good',proximity==='good');
      target.classList.toggle('in-best',proximity==='best');
    }
  }

  function showFeedback(id, kind){
    const el=$(id); if(!el) return;
    el.textContent=SYMBOL[kind];
    // Restart animation on rapid consecutive hits.
    el.className = kind === 'best' ? 'best' : kind;
    void el.offsetWidth;
    el.className = `${kind === 'best' ? 'best' : kind} pop`;
  }

  function burstParticles(kind){
    const host=$('berryParticles'); if(!host) return;
    const amount = kind === 'best' ? 4 : 2;
    for(let i=0;i<amount;i++){
      const p=document.createElement('i');
      p.className=`berry-particle ${kind === 'best' ? '' : kind}`;
      const ang=Math.random()*Math.PI*2,dist=18+Math.random()*42;
      p.style.setProperty('--px',`${Math.cos(ang)*dist}px`);
      p.style.setProperty('--py',`${Math.sin(ang)*dist}px`);
      host.appendChild(p);setTimeout(()=>p.remove(),600);
    }
  }

  function highSpeedShake(){
    const game=$('berryGame'); if(!game) return;
    game.classList.remove('berry-high-hit'); void game.offsetWidth; game.classList.add('berry-high-hit');
    setTimeout(()=>game.classList.remove('berry-high-hit'),280);
  }

  function clearFeedback(){
    ['berryFeedbackYou',...NPC_FEEDBACK_IDS].forEach(id=>{const e=$(id);if(e){e.textContent='';e.className='';}});
  }

  function stop(){sessionSerial++;if(berryRaf)cancelAnimationFrame(berryRaf);berryRaf=null;for(const id of pendingTimers)window.clearTimeout(id);pendingTimers.clear();if(berryGame){berryGame.running=false;berryGame.phase='stopped';}const c=$('berryCountdown');if(c)c.hidden=true;$('berryParticles')?.replaceChildren();clearFeedback();}
  function resetRseBerry(){
    stop();
    try{ if(berryRaf) cancelAnimationFrame(berryRaf); }catch(e){}
    berryGame={
      phase:'ready',running:false,arrowPos:0,speed:MIN_SPEED,progress:0,displayProgress:0,
      maxRpmHundredths:rpmHundredths(MIN_SPEED),lastTime:0,slowdownFrames:0,startTime:0,endTime:0,
      scores:[0,1,2,3].map(()=>({best:0,good:0,miss:0})),session:sessionSerial
    };
    clearFeedback();syncPlayerHitZoneV163();
    const game=$('berryGame'); if(game){game.classList.remove('berry-finishing','berry-high-hit');game.style.setProperty('--berry-speed','0');}
    const countdown=$('berryCountdown'); if(countdown){countdown.hidden=true;countdown.textContent='3';}
    if($('berryRound')) $('berryRound').textContent='READY';
    if($('blendResult')){$('blendResult').textContent='Press START BLENDER, then time A to your marker.';$('blendResult').className='blend-result';}
    if($('berryStartBtn')) $('berryStartBtn').disabled=false;
    if($('berryTapBtn')) $('berryTapBtn').disabled=true;
    renderArrow();renderBerryHud();
    try{ if(typeof renderArcadePerkButtons==='function') renderArcadePerkButtons(); }catch(e){}
  }

  async function countdown(token){
    const el=$('berryCountdown'); if(!el) return true;
    for(const value of ['3','2','1','START!']){
      if(token!==sessionSerial || $('berryGame')?.hidden) return false;
      el.hidden=false; el.textContent=value; el.style.animation='none'; void el.offsetWidth; el.style.animation='berryCountPulse .54s ease both';
      try{ if(typeof vibrate==='function' && value!=='START!') vibrate(7); }catch(e){}
      await new Promise(r=>setTimeout(r,value==='START!'?430:520));
    }
    el.hidden=true; return token===sessionSerial;
  }

  async function startRseBerry(){
    if(!berryGame || berryGame.phase!=='ready') return;
    const token=++sessionSerial; berryGame.session=token; berryGame.phase='countdown';
    if($('berryStartBtn')) $('berryStartBtn').disabled=true;
    if($('berryTapBtn')) $('berryTapBtn').disabled=true;
    if($('berryRound')) $('berryRound').textContent='STANDBY';
    if($('blendResult')) $('blendResult').textContent='Get ready…';
    const ok=await countdown(token); if(!ok) return;
    berryGame.phase='running';berryGame.running=true;berryGame.speed=MIN_SPEED;berryGame.arrowPos=0;
    berryGame.progress=0;berryGame.displayProgress=0;berryGame.slowdownFrames=0;berryGame.lastTime=performance.now();berryGame.startTime=berryGame.lastTime;
    berryGame.maxRpmHundredths=rpmHundredths(MIN_SPEED);
    if($('berryRound')) $('berryRound').textContent='BLENDING';
    if($('berryTapBtn')) $('berryTapBtn').disabled=false;
    if($('blendResult')) {$('blendResult').textContent='Press A when the pointer reaches YOU.';$('blendResult').className='blend-result';}
    renderBerryHud();renderArrow();
    try{ berryRaf=requestAnimationFrame(animateRseBerry); }catch(e){ requestAnimationFrame(animateRseBerry); }
  }

  function animateRseBerry(now){
    if(!berryGame || (berryGame.phase!=='running' && berryGame.phase!=='finishing')) return;
    const rawDt=Math.max(0,now-(berryGame.lastTime||now));berryGame.lastTime=now;
    const dt=Math.min(80,rawDt)/1000;
    const frameUnits=dt*60;

    const prev=berryGame.arrowPos;
    berryGame.arrowPos=(berryGame.arrowPos + berryGame.speed*frameUnits)%MAX_POS;
    renderArrow();

    if(berryGame.phase==='running'){
      processNpcCrossings(prev,berryGame.arrowPos);
      // Retail Emerald removes one speed unit every six 60 Hz frames.
      berryGame.slowdownFrames += frameUnits;
      while(berryGame.slowdownFrames>=6){
        if(berryGame.speed>MIN_SPEED) berryGame.speed-=1;
        berryGame.slowdownFrames-=6;
      }
      berryGame.speed=Math.max(MIN_SPEED,berryGame.speed);
      berryGame.maxRpmHundredths=Math.max(berryGame.maxRpmHundredths,rpmHundredths(berryGame.speed));

      // The visible bar trails the real progress by exactly 2 units/frame in Emerald.
      berryGame.displayProgress=Math.min(berryGame.progress,berryGame.displayProgress + 2*frameUnits);
      if(berryGame.displayProgress>=MAX_PROGRESS){ beginFinish(); }
    } else {
      // Retail end state subtracts 32 speed units every frame until the dial stops.
      berryGame.speed=Math.max(0,berryGame.speed - 32*frameUnits);
      berryGame.displayProgress=MAX_PROGRESS;
      if(berryGame.speed<=0){ completeRseBerry(); return; }
    }
    renderBerryHud();
    try{ berryRaf=requestAnimationFrame(animateRseBerry); }catch(e){ requestAnimationFrame(animateRseBerry); }
  }

  function tapRseBerry(ev){
    if(ev){ev.preventDefault?.();ev.stopPropagation?.();}
    if(!berryGame || berryGame.phase!=='running') return;
    const shell=$('berryBlenderShell');if(shell){shell.classList.remove('berry-tapped');void shell.offsetWidth;shell.classList.add('berry-tapped');setTimeout(()=>shell.classList.remove('berry-tapped'),120);}
    scoreHit(0,getPlayerProximity(berryGame.arrowPos),true);
  }

  function beginFinish(){
    if(!berryGame || berryGame.phase!=='running') return;
    berryGame.phase='finishing';berryGame.running=false;berryGame.endTime=performance.now();
    if($('berryTapBtn')) $('berryTapBtn').disabled=true;
    if($('berryRound')) $('berryRound').textContent='FINISH';
    if($('blendResult')){$('blendResult').textContent='Blend complete — slowing down…';$('blendResult').className='blend-result';}
    $('berryGame')?.classList.add('berry-finishing');
  }

  function playerRank(){
    if(!berryGame) return 4;
    const ranked=berryGame.scores.map((s,i)=>({i,...s})).sort((a,b)=>b.best-a.best || b.good-a.good || a.miss-b.miss || a.i-b.i);
    return ranked.findIndex(x=>x.i===0)+1;
  }

  function ordinal(n){return n===1?'1st':n===2?'2nd':n===3?'3rd':`${n}th`;}

  function completeRseBerry(){
    if(!berryGame || berryGame.phase==='done') return;
    berryGame.phase='done';berryGame.running=false;berryGame.speed=0;berryGame.displayProgress=MAX_PROGRESS;
    renderArrow();renderBerryHud();
    $('berryGame')?.classList.remove('berry-finishing');
    if($('berryRound')) $('berryRound').textContent='RESULTS';
    const s=berryGame.scores[0],rank=playerRank(),maxRpm=berryGame.maxRpmHundredths/100;
    const seconds=Math.max(0,((berryGame.endTime||performance.now())-berryGame.startTime)/1000);
    const accuracyDen=Math.max(1,s.best+s.good+s.miss),accuracy=(s.best+s.good)/accuracyDen;
    const basePayout=Math.max(80,Math.round(maxRpm*4.2+s.best*18+s.good*7-Math.min(100,s.miss*5)+(4-rank)*25));
    let awarded=basePayout;
    try{ if(typeof awardArcadeCoins==='function') awarded=awardArcadeCoins(basePayout,'Berry Blender','berry'); }catch(e){}
    const summary=`${ordinal(rank)} of 4 · ◎ ${s.best}  ○ ${s.good}  × ${s.miss} · Max ${maxRpm.toFixed(2)} RPM · ${seconds.toFixed(2)} sec`;
    if($('blendResult')){$('blendResult').textContent=`${ordinal(rank)} place · ${maxRpm.toFixed(2)} RPM`;$('blendResult').className='blend-result perfect';}
    try{
      if(window.LuckyDexArcadeSession?.showResult){
        window.LuckyDexArcadeSession.showResult?.('berry',{title:'BLENDING RESULTS',metricLabel:'PERFORMANCE',metricValue:summary,coinsAwarded:awarded,itemAwarded:null,bestText:'',review:{title:'BLENDING RESULTS',mode:'Berry Blender',difficulty:'Four-player',metricLabel:'PLACE',metricValue:ordinal(rank),stats:[{label:'Perfect',value:String(s.best)},{label:'Good',value:String(s.good)},{label:'Miss',value:String(s.miss)},{label:'Accuracy',value:`${Math.round(accuracy*100)}%`},{label:'Max RPM',value:maxRpm.toFixed(2)},{label:'Time',value:`${seconds.toFixed(2)} sec`}],rewards:[{label:'Lucky Coins',value:String(awarded||0)}]},onReplay:resetRseBerry,onBack:()=>window.LuckyDexArcadeWorld?.backFromGame?.(true)});
      } else setTimeout(resetRseBerry,900);
    }catch(e){ setTimeout(resetRseBerry,900); }
  }

  function install(){
    const start=$('berryStartBtn'),tap=$('berryTapBtn'); if(!start||!tap) return;
    start.onclick=startRseBerry;
    tap.onclick=e=>e.preventDefault();
    tap.onpointerdown=tapRseBerry;
    tap.onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)tapRseBerry(e);};
    const shell=$('berryBlenderShell');
    if(shell){
      shell.setAttribute('role','button');shell.setAttribute('aria-label','Tap Berry Blender');shell.tabIndex=0;
      shell.onpointerdown=tapRseBerry;
      shell.onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)tapRseBerry(e);};
    }
    syncPlayerHitZoneV163();
    resetRseBerry();

    window.LuckyDexBerryBlender={
      reset:resetRseBerry,start:startRseBerry,stop,tap:()=>tapRseBerry(),
      state:()=>berryGame ? JSON.parse(JSON.stringify(berryGame)) : null,
      rpm:()=>berryGame?rpmValue(berryGame.speed):0,
      forceRPM:(rpm)=>{if(!berryGame)return;berryGame.speed=Math.max(MIN_SPEED,Math.round((Number(rpm)||0)*MAX_POS/(60*60)));renderBerryHud();}
    };
  }

  install();
})();
