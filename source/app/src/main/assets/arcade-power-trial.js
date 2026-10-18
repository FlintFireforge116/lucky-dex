(function(root,factory){
  const core=root.LuckyDexPowerTrialCore||(typeof require==='function'?require('./arcade-power-trial-core.js'):null);
  const api=factory(root,core);root.LuckyDexPowerTrial=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexPowerTrialCore required');

  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const rareRewards=()=>root.LuckyDexArcadeRareRewards||globalThis.LuckyDexArcadeRareRewards;
  const rareBridge=()=>root.LuckyDexRareRewardBridge||globalThis.LuckyDexRareRewardBridge;
  const giftCore=()=>root.LuckyDexVoltorbGiftCore||globalThis.LuckyDexVoltorbGiftCore;
  const PICKER_PAGE_SIZE=6;

  let opened=false,difficulty='normal',participants=[],selectedKey=null,pickerQuery='',pickerSort='attack',pickerPage=0,run=null,tournamentContext=null,phase='setup',rafId=0,chargePressedAt=null,lockedCharge=0,impactStartedAt=0,resultUntil=0,lastStrike=null,completionHandled=false,finishPromise=null,hostClick=null,hostInput=null,hostChange=null,hostContext=null,hostSelectStart=null,keyDown=null,keyUp=null,chargePointer=null,pokemonAnimTimer=0;

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(opened&&!rafId&&['charge','impact','result'].includes(phase))rafId=raf(frame);}
  function saveState(){try{root.save?.();}catch(_){} }
  function powerState(){const s=root.state||globalThis.state;if(!s)return null;s.arcade=platform()?.ensureArcadeState?.(s.arcade)||s.arcade||{};return s.arcade.powerTrial;}
  function rareRate(){return Math.max(0,Math.min(1,Number(root.state?.settings?.rareOdds?.powerTrialGolden??.02)||0));}
  function currentParticipant(){return participants.find(row=>row.key===selectedKey)||null;}
  function profile(){return run?.profile||core.difficultyProfile(difficulty);}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function shell(){
    const host=$('powerTrialGame');if(!host)return null;
    host.innerHTML=`<div class="arcade-full-head"><button class="game-exit" data-exit-game>‹ ARCADE</button><div class="powertrial-head-actions"><div class="arcade-mascot"><img src="arcade/sprites/actors/pokemon/68.png" alt="Machamp"><span>POKÉMON CHALLENGE COURSE</span></div><button id="powerTrialInfo" class="powertrial-info" type="button" aria-label="How to play Power Trial">i</button></div></div>
      <div class="powertrial-shell">
        <section id="powerTrialSetup" class="powertrial-setup">
          <div class="powertrial-title"><div><div class="eyebrow">ATTACK EVENT</div><h2>Power Trial</h2><p>Charge your Pokémon's strike, then nail the impact timing. Attack raises the ceiling, but your timing still decides the result.</p></div><div class="powertrial-record"><small>BEST</small><b id="powerTrialBest">0</b></div></div>
          <div class="powertrial-difficulties" aria-label="Power Trial difficulty"><button data-power-difficulty="easy">EASY<small>Wider timing</small></button><button data-power-difficulty="normal">NORMAL<small>Balanced</small></button><button data-power-difficulty="hard">HARD<small>Tighter timing</small></button></div>
          <div class="powertrial-picker-head"><b>CHOOSE YOUR POKÉMON</b><span>Base Attack helps, but clean timing matters more.</span></div>
          <div class="powertrial-picker-tools"><input id="powerTrialSearch" type="search" autocomplete="off" spellcheck="false" placeholder="Search caught Pokémon" aria-label="Search caught Pokémon"><select id="powerTrialSort" aria-label="Sort caught Pokémon"><option value="attack">Highest Attack</option><option value="level">Highest Level</option><option value="name">Name A–Z</option></select></div>
          <div id="powerTrialPicker" class="powertrial-picker"></div>
          <div id="powerTrialEmpty" class="powertrial-empty" hidden>No caught Pokémon match that search.</div>
          <div class="powertrial-pager"><button id="powerTrialPrev" type="button">‹ PREV</button><b id="powerTrialPage">1 / 1</b><button id="powerTrialNext" type="button">NEXT ›</button></div>
          <button id="powerTrialStart" class="primary powertrial-start" type="button">START POWER TRIAL</button>
        </section>
        <section id="powerTrialPlay" class="powertrial-play" hidden>
          <div class="powertrial-hud"><span>TARGET <b id="powerTrialRound">1 / 5</b></span><span>ATTACK <b id="powerTrialAttack">60</b></span><span>SCORE <b id="powerTrialScore">0</b></span></div>
          <div class="powertrial-arena">
            <div id="powerTrialFeedback" class="powertrial-feedback"><b>CHARGE</b><span>Build your strike.</span></div>
            <div class="powertrial-lane"></div>
            <div class="powertrial-target-wrap">
              <div id="powerTrialGolden" class="powertrial-golden" hidden><b>★ GOLDEN TARGET! ★</b><span id="powerTrialGoldenPrize">BREAK IT FOR A PRIZE</span></div>
              <div id="powerTrialTarget" class="powertrial-target" data-kind="rock-small">
                <div class="powertrial-target-visual"><img id="powerTrialTargetSprite" class="powertrial-target-sprite" src="adventure/art/objects/strength_boulder.png" alt=""></div>
                <div class="powertrial-target-meta"><b id="powerTrialTargetName">Loose Rock</b><small id="powerTrialThreshold">POWER 48 TO CLEAR</small></div>
              </div>
            </div>
            <div id="powerTrialPokemonWrap" class="powertrial-pokemon"><img id="powerTrialPokemon" src="arcade/sprites/actors/pokemon/25.png" alt=""></div>
          </div>
          <div class="powertrial-meter charge">
            <div class="powertrial-meter-head"><b>STEP 1 · CHARGE</b><span>Release on centre · <strong id="powerTrialChargeValue">0%</strong></span></div>
            <div class="powertrial-track"><i id="powerTrialChargeFill"></i><em></em></div>
          </div>
          <div class="powertrial-meter impact">
            <div class="powertrial-meter-head"><b>STEP 2 · IMPACT</b><span>Tap on centre · <strong id="powerTrialImpactValue">0%</strong></span></div>
            <div class="powertrial-impact-track"><i></i><em id="powerTrialImpactMarker"></em></div>
          </div>
          <div class="powertrial-controls"><button id="powerTrialCharge" type="button"><b>CHARGE</b><span>HOLD, THEN RELEASE</span></button><button id="powerTrialHit" type="button" disabled><b>HIT!</b><span>TAP ON THE WHITE LINE</span></button></div>
        </section>
      </div>
      <dialog id="powerTrialHelp" class="powertrial-help">
        <div class="powertrial-help-card"><div class="powertrial-help-head"><div><small>POWER TRIAL</small><h3>How to Play</h3></div><button type="button" data-power-help-close aria-label="Close instructions">×</button></div>
          <ol><li>Hold <b>CHARGE</b>.</li><li>Release when the charge reaches the <b>white centre line</b>.</li><li>Then tap <b>HIT!</b> when the red marker reaches the <b>white centre line</b>.</li><li>Better timing produces more power. Your Pokémon's Attack stat also helps.</li><li>Reach the required power to break the rock. Break all five targets to clear the run.</li></ol>
          <button class="primary powertrial-help-done" type="button" data-power-help-close>GOT IT</button>
        </div>
      </dialog>`;
    return host;
  }

  function clearPokemonAnimationTimer(){if(pokemonAnimTimer){clearTimeout(pokemonAnimTimer);pokemonAnimTimer=0;}}
  function setPokemonPose(state){
    const node=$('powerTrialPokemonWrap');if(!node)return;
    clearPokemonAnimationTimer();
    node.classList.remove('is-charging','is-ready','is-striking','is-recoil');
    if(state)node.classList.add(state);
  }
  function flashPokemonPose(primary,followUp,delay=220){
    const node=$('powerTrialPokemonWrap');if(!node)return;
    setPokemonPose(primary);
    if(followUp){pokemonAnimTimer=setTimeout(()=>setPokemonPose(followUp),delay);}
  }
  function refreshParticipants(){
    participants=platform()?.challengeParticipants?.('attack')||[];
    const ps=powerState(),remembered=ps?.lastPokemonKey;
    selectedKey=participants.some(x=>x.key===remembered)?remembered:(participants[0]?.key||null);
    pickerPage=0;
    renderSetup();
  }

  function filteredParticipants(){
    const q=pickerQuery.trim().toLowerCase();
    const rows=participants.filter(row=>!q||row.name.toLowerCase().includes(q)||String(row.id).includes(q));
    rows.sort((a,b)=>pickerSort==='name'?a.name.localeCompare(b.name):pickerSort==='level'?(b.level-a.level||b.baseStat-a.baseStat||a.name.localeCompare(b.name)):(b.baseStat-a.baseStat||b.level-a.level||a.name.localeCompare(b.name)));
    return rows;
  }

  function renderPicker(){
    const grid=$('powerTrialPicker');if(!grid)return;
    const rows=filteredParticipants(),pages=Math.max(1,Math.ceil(rows.length/PICKER_PAGE_SIZE));
    pickerPage=Math.max(0,Math.min(pages-1,pickerPage));
    const shown=rows.slice(pickerPage*PICKER_PAGE_SIZE,(pickerPage+1)*PICKER_PAGE_SIZE);
    grid.innerHTML=shown.map(row=>`<button type="button" data-power-pokemon="${esc(row.key)}" class="${row.key===selectedKey?'selected':''}"><img src="${esc(row.image)}" alt=""><span><b>${row.shiny?'★ ':''}${esc(row.name)}</b><small>Lv.${row.level} · ATTACK ${row.baseStat}</small></span></button>`).join('');
    $('powerTrialEmpty').hidden=rows.length>0;
    $('powerTrialPrev').disabled=pickerPage<=0;
    $('powerTrialNext').disabled=pickerPage>=pages-1;
    $('powerTrialPage').textContent=`${pickerPage+1} / ${pages} · ${rows.length} Pokémon`;
  }

  function renderSetup(){
    renderPicker();
    $('powerTrialStart').disabled=!selectedKey;
    const search=$('powerTrialSearch');if(search&&search.value!==pickerQuery)search.value=pickerQuery;
    const sort=$('powerTrialSort');if(sort)sort.value=pickerSort;
    for(const btn of document.querySelectorAll('[data-power-difficulty]'))btn.classList.toggle('active',btn.dataset.powerDifficulty===difficulty);
    const best=Number(powerState()?.bestScores?.[difficulty]||0);
    $('powerTrialBest').textContent=String(best);
  }

  function setSetupVisible(value){$('powerTrialSetup').hidden=!value;$('powerTrialPlay').hidden=!!value;}

  function setTarget(index){
    const target=core.TARGETS[index],golden=run?.goldenIndex===index,node=$('powerTrialTarget');
    if(!target||!node)return;
    const sprite=$('powerTrialTargetSprite');
    node.dataset.kind=target.id;
    node.className=`powertrial-target${golden?' is-golden':''}`;
    node.classList.remove('is-cleared','is-failed','is-perfect');
    if(sprite){
      sprite.src=target.sprite;
      sprite.alt=target.name;
      sprite.style.setProperty('--target-scale', String(target.spriteScale||5));
    }
    $('powerTrialTargetName').textContent=target.name;
    $('powerTrialThreshold').textContent=`POWER ${core.thresholdFor(index,difficulty,run?.profile)} TO CLEAR`;
    $('powerTrialGolden').hidden=!golden;
    if(golden){node.classList.add('is-golden');$('powerTrialGoldenPrize').textContent='BREAK IT FOR A PRIZE';}
    $('powerTrialRound').textContent=`${index+1} / ${core.TARGETS.length}`;
  }

  function setParticipant(row){
    if(!row)return;
    $('powerTrialAttack').textContent=String(row.baseStat);
    $('powerTrialPokemon').src=row.image;
    $('powerTrialPokemon').alt=row.name;
  }

  function resetMeters(){
    $('powerTrialChargeFill').style.width='0%';
    $('powerTrialImpactMarker').style.left='0%';
    $('powerTrialChargeValue').textContent='0%';
    $('powerTrialImpactValue').textContent='0%';
    $('powerTrialHit').disabled=true;
  }

  function setFeedback(title,body){
    const node=$('powerTrialFeedback');
    if(node)node.innerHTML=`<b>${esc(title)}</b><span>${esc(body)}</span>`;
  }

  function beginTarget(){
    const index=run?.strikes?.length||0;
    if(index>=core.TARGETS.length)return finishRun();
    setTarget(index);
    resetMeters();
    chargePressedAt=null;
    lockedCharge=0;
    impactStartedAt=0;
    lastStrike=null;
    phase='charge';
    $('powerTrialCharge').disabled=false;
    setPokemonPose(null);
    const golden=run?.goldenIndex===index;
    setFeedback(golden?'★ GOLDEN TARGET!':'CHARGE',golden?'Break it to win a bonus prize — pack, card, dust, ticket or coins.':'Build your strike.');
    session()?.update?.('powerTrial',{runText:'5 rock targets · charge + impact timing',rewardText:'Lucky Coins · Golden Target can award packs, cards, dust or tickets',liveLabel:'TARGET',liveValue:`${index+1}/5`});
    schedule();
  }

  function beginRun(row,{profileOverride=null,tournament=null}={}){
    if(!row)return false;
    const ps=powerState();if(ps)ps.lastPokemonKey=row.key;saveState();
    session()?.hideResult?.();
    tournamentContext=tournament;
    run=core.createRun({difficulty,profile:profileOverride,participant:row,rng:Math.random,goldenRate:rareRate()});
    completionHandled=false;finishPromise=null;
    phase='charge';
    setSetupVisible(false);
    setParticipant(row);
    $('powerTrialScore').textContent='0';
    beginTarget();
    return true;
  }

  function startRun(){return beginRun(currentParticipant(),{tournament:null});}

  function startExhibition({difficulty:requested='normal',participant}={}){
    if(!participant)return false;
    difficulty=core.DIFFICULTIES[requested]?requested:'normal';
    participants=[participant,...participants.filter(p=>p.key!==participant.key)];selectedKey=participant.key;
    return beginRun(participant,{tournament:null});
  }

  function startGoldenrodRound({cupId,mode='division',divisionId='rookie',type=null,roundIndex=0,seed=1,player,onComplete}={}){
    if(!player)return false;
    difficulty='normal';participants=[player];selectedKey=player.key||null;
    const division=core.divisionProfile(divisionId,roundIndex);
    return beginRun(player,{profileOverride:division,tournament:{cupId,mode,divisionId,type,roundIndex,seed,onComplete}});
  }

  function pressCharge(pointerId=null){
    if(phase!=='charge'||chargePressedAt!=null)return false;
    chargePressedAt=now();
    chargePointer=pointerId;
    $('powerTrialCharge').classList.add('active');
    setPokemonPose('is-charging');
    return true;
  }

  function releaseCharge(){
    if(phase!=='charge'||chargePressedAt==null)return false;
    const t=now(),elapsed=t-chargePressedAt;
    lockedCharge=core.chargeQuality(elapsed,profile());
    chargePressedAt=null;
    chargePointer=null;
    $('powerTrialCharge').classList.remove('active');
    $('powerTrialCharge').disabled=true;
    phase='impact';
    impactStartedAt=t;
    $('powerTrialHit').disabled=false;
    setPokemonPose('is-ready');
    const pct=Math.round(lockedCharge*100);
    $('powerTrialChargeValue').textContent=`${pct}%`;
    const title=pct>=96?'GREAT CHARGE':pct>=80?'GOOD CHARGE':pct>=55?'OK CHARGE':'WEAK CHARGE';
    setFeedback(`${title} · ${pct}%`,'Impact ready.');
    schedule();
    return true;
  }

  function strike(impactOverride=null){
    if(phase!=='impact'||!run)return false;
    const q=impactOverride==null?core.impactQuality(now()-impactStartedAt,profile()):Math.max(0,Math.min(1,Number(impactOverride)||0));
    lastStrike=core.applyStrike(run,{chargeQuality:lockedCharge,impactQuality:q});
    if(!lastStrike)return false;

    phase='result';
    resultUntil=now()+1100;
    $('powerTrialHit').disabled=true;
    $('powerTrialScore').textContent=String(run.score);

    const target=$('powerTrialTarget');
    target.classList.add(lastStrike.cleared?'is-cleared':'is-failed');
    if(lastStrike.perfect)target.classList.add('is-perfect');

    flashPokemonPose(lastStrike.cleared?'is-striking':'is-recoil',null);

    const impactPct=Math.round(q*100);
    $('powerTrialImpactValue').textContent=`${impactPct}%`;
    const impactText=impactPct>=96?'Perfect impact':impactPct>=80?'Good impact':impactPct>=55?'Late / early impact':'Poor impact';
    const bonus=lastStrike.golden&&lastStrike.cleared?' · PRIZE SECURED!':'';
    const body=lastStrike.cleared
      ? `${impactText}. ${lastStrike.target.impactText}. +${lastStrike.score}${bonus}`
      : `${impactText}. Needed ${lastStrike.threshold} power · +${lastStrike.score}`;
    setFeedback(`${lastStrike.grade} · ${lastStrike.power.toFixed(1)} POWER`,body);

    root.navigator?.vibrate?.(lastStrike.perfect?[22,28,38]:lastStrike.cleared?25:12);
    schedule();
    return true;
  }

  async function claimGoldenPrize(goldStrike){
    if(!goldStrike?.cleared)return {label:'',reveal:null,pending:false};
    const rr=rareRewards(),bridge=rareBridge(),gift=giftCore();
    if(!root.state||!rr||!bridge||!gift)return {label:'Prize unavailable',reveal:null,pending:true};
    let attempt=rr.getOrCreateAttempt(root.state,'powerTrialGolden',()=>{const pick=gift.rewardForRoll(Math.random());return {kind:pick.kind,reward:pick.reward,source:'power-trial-golden'};});
    try{
      if(!attempt.reward&&['card','pack'].includes(attempt.kind)){
        const reward=await bridge.resolveArcadeReward?.(attempt.kind);
        if(!reward)throw new Error('Golden Target reward could not be resolved');
        attempt=rr.patchAttempt(root.state,'powerTrialGolden',attempt.id,{reward})||attempt;
        bridge.save?.();
      }
      if(!attempt.reward)throw new Error('Golden Target reward missing');
      const claim=await rr.claimAttempt(root.state,'powerTrialGolden',attempt.id,reward=>bridge.grantReward?.(reward));
      bridge.save?.();
      const label=claim?.result?.label||attempt.reward.label||'Golden Target Prize';
      return {label,reveal:bridge.rewardReveal?.(attempt.reward,claim?.result,'GOLDEN TARGET PRIZE')||null,pending:false};
    }catch(error){
      console.warn?.('[LuckyDex] Golden Target prize remains reserved',error);
      bridge.save?.();
      return {label:'Golden Target Prize Reserved',reveal:null,pending:true};
    }
  }

  function tournamentResultPayload(activeRun,goldenPrize={label:'',reveal:null,pending:false}){
    if(!activeRun)return null;
    const goldStrike=activeRun.goldenIndex>=0?activeRun.strikes?.[activeRun.goldenIndex]:null;
    const powers=(activeRun.strikes||[]).reduce((sum,x)=>sum+(Number(x?.power)||0),0);
    const metric=Math.round((powers+(Number(activeRun.clears)||0)*10+(Number(activeRun.perfects)||0)*5)*10)/10;
    const rareReceipts=goldStrike?.cleared?[{source:'powerTrialGolden',label:goldenPrize.label||'Golden Target Prize',meta:goldenPrize.pending?'Prize reserved safely':'Awarded during this cup',reveal:goldenPrize.reveal||null,pending:!!goldenPrize.pending}]:[];
    return {eventId:'powerTrial',metric,raw:{score:Number(activeRun.score)||0,clears:Number(activeRun.clears)||0,perfects:Number(activeRun.perfects)||0,bestSingleHit:Number(activeRun.bestSingleHit)||0},rareReceipts};
  }

  function commitTournamentStats(){
    if(completionHandled||!run?.finished)return null;completionHandled=true;
    const ps=powerState(),goldStrike=run.goldenIndex>=0?run.strikes[run.goldenIndex]:null,full=run.clears===core.TARGETS.length;
    if(ps){ps.gamesPlayed++;ps.fullClears+=full?1:0;ps.bestScore=Math.max(Number(ps.bestScore)||0,run.score);ps.bestSingleHit=Math.max(Number(ps.bestSingleHit)||0,run.bestSingleHit);ps.bestPerfects=Math.max(Number(ps.bestPerfects)||0,run.perfects);ps.perfectHits+=run.perfects;ps.totalTargetsCleared+=run.clears;if(run.goldenIndex>=0)ps.goldenTargetsSeen++;if(goldStrike?.cleared)ps.goldenTargetsCleared++;ps.lastPokemonKey=run.participant?.key||ps.lastPokemonKey;}saveState();return {goldStrike,full};
  }

  function commitResult(){
    if(completionHandled||!run?.finished)return null;
    completionHandled=true;
    const ps=powerState(),goldStrike=run.goldenIndex>=0?run.strikes[run.goldenIndex]:null,full=run.clears===core.TARGETS.length,newBest=run.score>Number(ps?.bestScores?.[difficulty]||0);
    if(ps){
      ps.gamesPlayed++;
      ps.fullClears+=full?1:0;
      ps.hardClears+=full&&difficulty==='hard'?1:0;
      ps.bestScore=Math.max(Number(ps.bestScore)||0,run.score);
      ps.bestScores[difficulty]=Math.max(Number(ps.bestScores?.[difficulty])||0,run.score);
      ps.bestSingleHit=Math.max(Number(ps.bestSingleHit)||0,run.bestSingleHit);
      ps.bestPerfects=Math.max(Number(ps.bestPerfects)||0,run.perfects);
      ps.perfectHits+=run.perfects;
      ps.totalTargetsCleared+=run.clears;
      if(run.goldenIndex>=0)ps.goldenTargetsSeen++;
      if(goldStrike?.cleared)ps.goldenTargetsCleared++;
      ps.lastPokemonKey=run.participant?.key||ps.lastPokemonKey;
    }
    const award=platform()?.awardRun?.({gameId:'powerTrial',label:'Power Trial',score:run.score,coins:core.rewardForRun(run),dailyEligible:false})||{coinsAwarded:0};
    saveState();
    return {award,full,newBest,goldStrike};
  }

  async function finishRun(){
    if(finishPromise)return finishPromise;
    finishPromise=(async()=>{
      stopLoop();
      phase='finished';
      if(tournamentContext){
        const committed=commitTournamentStats();if(!committed)return false;
        const goldenPrize=await claimGoldenPrize(committed.goldStrike),payload=tournamentResultPayload(run,goldenPrize),callback=tournamentContext.onComplete;
        tournamentContext={...tournamentContext,completed:true};
        if(typeof callback==='function')callback(payload);
        return payload;
      }
      const committed=commitResult();if(!committed)return false;
      const {award,full,newBest,goldStrike}=committed,row=run.participant,ps=powerState();
      const goldenPrize=await claimGoldenPrize(goldStrike);
      const goldenValue=run.goldenIndex<0?'NOT SEEN':goldStrike?.cleared?(goldenPrize.pending?'CLEARED · PRIZE RESERVED':`CLEARED · ${goldenPrize.label}`):'MISSED';
      const review={title:'POWER TRIAL COMPLETE',mode:'Attack Event',difficulty:profile().label,metricLabel:'SCORE',metricValue:String(run.score),stats:[{label:'Pokémon',value:`${row.shiny?'★ ':''}${row.name}`},{label:'Base Attack',value:String(row.baseStat)},{label:'Targets Cleared',value:`${run.clears}/5`},{label:'Perfect Strikes',value:String(run.perfects)},{label:'Best Hit',value:`${run.bestSingleHit.toFixed(1)} power`},...(run.goldenIndex>=0?[{label:'Golden Target',value:goldenValue}]:[])],pbs:[{label:`${profile().label} Best`,value:String(ps?.bestScores?.[difficulty]||run.score),isNew:newBest}],rewards:[{label:'Run Reward',value:`${award.coinsAwarded||0} Lucky Coins`},...(goldStrike?.cleared?[{label:'Golden Target Prize',value:goldenPrize.label||'Prize Reserved'}]:[])]};
      session()?.showResult?.('powerTrial',{title:'POWER TRIAL COMPLETE',metricLabel:'SCORE',metricValue:run.score,coinsAwarded:award.coinsAwarded,itemAwarded:award.itemAwarded,bestText:goldenPrize.pending?'GOLDEN PRIZE RESERVED':newBest?'NEW BEST SCORE':full?'ALL FIVE CLEARED':'',rewardReveals:goldenPrize.reveal?[goldenPrize.reveal]:[],details:[{title:`${row.shiny?'★ ':''}${row.name}`,subtitle:`Attack ${row.baseStat} · ${profile().label}`,kind:'racer'},{title:`${run.clears}/5 targets`,subtitle:`${run.perfects} perfect · best ${run.bestSingleHit.toFixed(1)}`,kind:'score'}],review,replayLabel:'TRY AGAIN',changeLabel:'CHANGE POKÉMON',onReplay:()=>startRun(),onChange:()=>showSetup(),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
      return true;
    })().finally(()=>{finishPromise=null;});
    return finishPromise;
  }

  function showSetup(){
    stopLoop();
    phase='setup';
    run=null;tournamentContext=null;
    setSetupVisible(true);
    setPokemonPose(null);
    refreshParticipants();
    return true;
  }

  function frame(t){
    rafId=0;if(!opened)return;
    if(phase==='charge'&&chargePressedAt!=null){
      const elapsed=t-chargePressedAt,q=core.chargeQuality(elapsed,profile()),pos=core.chargePosition(elapsed,profile());
      const pct=Math.round(q*100);
      $('powerTrialChargeFill').style.width=`${Math.round(pos*100)}%`;
      $('powerTrialChargeValue').textContent=`${pct}%`;
      if(elapsed>=profile().maxChargeMs)releaseCharge();
    } else if(phase==='impact'){
      const elapsed=t-impactStartedAt,pos=core.impactPosition(elapsed,profile()),q=core.impactQuality(elapsed,profile());
      $('powerTrialImpactMarker').style.left=`${(pos*100).toFixed(1)}%`;
      $('powerTrialImpactValue').textContent=`${Math.round(q*100)}%`;
      if(elapsed>=profile().impactTimeoutMs)strike(0);
    } else if(phase==='result'&&t>=resultUntil){
      if(run?.finished)void finishRun();else beginTarget();
    }
    schedule();
  }

  function onClick(e){
    if(e.target.closest?.('#powerTrialInfo')){const help=$('powerTrialHelp');if(help?.showModal)help.showModal();else help?.setAttribute('open','');return;}
    if(e.target.closest?.('[data-power-help-close]')){const help=$('powerTrialHelp');if(help?.close)help.close();else help?.removeAttribute('open');return;}
    const d=e.target.closest?.('[data-power-difficulty]');
    if(d&&phase==='setup'){difficulty=core.DIFFICULTIES[d.dataset.powerDifficulty]?d.dataset.powerDifficulty:'normal';renderSetup();return;}
    const p=e.target.closest?.('[data-power-pokemon]');
    if(p&&phase==='setup'){if(participants.some(x=>x.key===p.dataset.powerPokemon)){selectedKey=p.dataset.powerPokemon;renderSetup();}return;}
    if(e.target.closest?.('#powerTrialPrev')){pickerPage=Math.max(0,pickerPage-1);renderPicker();return;}
    if(e.target.closest?.('#powerTrialNext')){pickerPage++;renderPicker();return;}
    if(e.target.closest?.('#powerTrialStart')){startRun();return;}
    if(e.target.closest?.('#powerTrialHit')){strike();return;}
  }

  function bind(){
    const host=$('powerTrialGame');
    hostClick=onClick;host.addEventListener('click',hostClick);
    hostInput=e=>{if(e.target?.id==='powerTrialSearch'){pickerQuery=String(e.target.value||'');pickerPage=0;renderPicker();}};host.addEventListener('input',hostInput);
    hostChange=e=>{if(e.target?.id==='powerTrialSort'){pickerSort=['attack','level','name'].includes(e.target.value)?e.target.value:'attack';pickerPage=0;renderPicker();}};host.addEventListener('change',hostChange);
    hostContext=e=>{if(!e.target?.closest?.('input,textarea'))e.preventDefault();};host.addEventListener('contextmenu',hostContext);
    hostSelectStart=e=>{if(!e.target?.closest?.('input,textarea'))e.preventDefault();};host.addEventListener('selectstart',hostSelectStart);
    const charge=$('powerTrialCharge');
    charge.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;if(pressCharge(e.pointerId)){charge.setPointerCapture?.(e.pointerId);e.preventDefault();}});
    charge.addEventListener('pointerup',e=>{if(chargePointer==null||e.pointerId===chargePointer){releaseCharge();charge.releasePointerCapture?.(e.pointerId);e.preventDefault();}});
    charge.addEventListener('pointercancel',()=>releaseCharge());
    keyDown=e=>{
      if(e.repeat)return;
      if((e.code==='Space'||e.key===' ')&&phase==='charge'){pressCharge('keyboard');e.preventDefault();}
      else if((e.code==='Enter'||String(e.key).toLowerCase()==='a')&&phase==='impact'){strike();e.preventDefault();}
    };
    keyUp=e=>{if((e.code==='Space'||e.key===' ')&&chargePointer==='keyboard'){releaseCharge();e.preventDefault();}};
    root.addEventListener?.('keydown',keyDown);root.addEventListener?.('keyup',keyUp);
  }

  function unbind(){
    const host=$('powerTrialGame');
    if(host&&hostClick)host.removeEventListener('click',hostClick);
    if(host&&hostInput)host.removeEventListener('input',hostInput);
    if(host&&hostChange)host.removeEventListener('change',hostChange);
    if(host&&hostContext)host.removeEventListener('contextmenu',hostContext);
    if(host&&hostSelectStart)host.removeEventListener('selectstart',hostSelectStart);
    if(keyDown)root.removeEventListener?.('keydown',keyDown);
    if(keyUp)root.removeEventListener?.('keyup',keyUp);
    hostClick=hostInput=hostChange=hostContext=hostSelectStart=keyDown=keyUp=null;
    chargePointer=null;
    clearPokemonAnimationTimer();
  }

  function open(){opened=true;tournamentContext=null;shell();session()?.mount?.('powerTrial',$('powerTrialGame'));bind();difficulty='normal';pickerQuery='';pickerSort='attack';pickerPage=0;refreshParticipants();showSetup();return true;}
  function close(){opened=false;stopLoop();unbind();session()?.hideResult?.();const help=$('powerTrialHelp');if(help?.open)help.close?.();phase='closed';run=null;tournamentContext=null;chargePressedAt=null;setPokemonPose(null);return true;}
  function pause(){stopLoop();return true;}
  function resume(){schedule();return true;}
  function snapshot(){return {opened,phase,difficulty,selectedKey,run:run?{difficulty:run.difficulty,score:run.score,clears:run.clears,perfects:run.perfects,goldenIndex:run.goldenIndex,strikes:run.strikes.length}:null};}

  return Object.freeze({open,close,pause,resume,startRun,startExhibition,startGoldenrodRound,tournamentResultPayload,showSetup,pressCharge,releaseCharge,strike,snapshot});
});
