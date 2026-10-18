(function(root,factory){
  const core=root.LuckyDexImpactTrialCore||(typeof require==='function'?require('./arcade-impact-trial-core.js'):null);
  const api=factory(root,core);root.LuckyDexImpactTrial=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexImpactTrialCore required');

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

  let opened=false,difficulty='normal',participants=[],selectedKey=null,pickerQuery='',pickerSort='defense',pickerPage=0,run=null,tournamentContext=null,phase='setup',rafId=0,cueUntil=0,hardenStartedAt=0,resultUntil=0,lastDefense=null,targetPlan=null,targetStates=[],hitValue=0,targetsHit=0,goldenTargetsHit=0,completionHandled=false,finishPromise=null,hostClick=null,hostInput=null,hostChange=null,hostContext=null,hostSelectStart=null,keyDown=null,fieldPointerDown=null,fieldPointerMove=null,fieldPointerUp=null,swipePointerId=null,lastSwipePoint=null,countdownStartedAt=0,pokemonAnimTimer=0;

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(opened&&!rafId&&['countdown','cue','harden','result'].includes(phase))rafId=raf(frame);}
  function saveState(){try{root.save?.();}catch(_){} }
  function impactState(){const s=root.state||globalThis.state;if(!s)return null;s.arcade=platform()?.ensureArcadeState?.(s.arcade)||s.arcade||{};return s.arcade.impactTrial;}
  function rareRate(){return Math.max(0,Math.min(1,Number(root.state?.settings?.rareOdds?.impactTrialGolden??.02)||0));}
  function currentParticipant(){return participants.find(row=>row.key===selectedKey)||null;}
  function profile(){return run?.profile||core.difficultyProfile(difficulty);}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function shell(){
    const host=$('impactTrialGame');if(!host)return null;
    host.innerHTML=`<div class="arcade-full-head"><button class="game-exit" data-exit-game>‹ ARCADE</button><div class="impacttrial-head-actions"><div class="arcade-mascot"><img src="arcade/sprites/actors/pokemon/306.png" alt="Aggron"><span>POKÉMON CHALLENGE COURSE</span></div><button id="impactTrialInfo" class="impacttrial-info" type="button" aria-label="How to play Impact Trial">i</button></div></div>
      <div class="impacttrial-shell">
        <section id="impactTrialSetup" class="impacttrial-setup">
          <div class="impacttrial-title"><div><div class="eyebrow">DEFENSE EVENT</div><h2>Impact Trial</h2><p>When the hit is coming, HARDEN! Tap or swipe through as many shield points as you can. Your Defense softens what gets through, but your reactions matter most.</p></div><div class="impacttrial-record"><small>BEST</small><b id="impactTrialBest">0</b></div></div>
          <div class="impacttrial-difficulties" aria-label="Impact Trial difficulty"><button data-impact-difficulty="easy">EASY<small>More time · bigger shields</small></button><button data-impact-difficulty="normal">NORMAL<small>Balanced</small></button><button data-impact-difficulty="hard">HARD<small>Faster patterns · still readable</small></button></div>
          <div class="impacttrial-picker-head"><b>CHOOSE YOUR POKÉMON</b><span>Base Defense reduces leftover impact. Fast, accurate Harden play does the heavy lifting.</span></div>
          <div class="impacttrial-picker-tools"><input id="impactTrialSearch" type="search" autocomplete="off" spellcheck="false" placeholder="Search caught Pokémon" aria-label="Search caught Pokémon"><select id="impactTrialSort" aria-label="Sort caught Pokémon"><option value="defense">Highest Defense</option><option value="level">Highest Level</option><option value="name">Name A–Z</option></select></div>
          <div id="impactTrialPicker" class="impacttrial-picker"></div>
          <div id="impactTrialEmpty" class="impacttrial-empty" hidden>No caught Pokémon match that search.</div>
          <div class="impacttrial-pager"><button id="impactTrialPrev" type="button">‹ PREV</button><b id="impactTrialPage">1 / 1</b><button id="impactTrialNext" type="button">NEXT ›</button></div>
          <button id="impactTrialStart" class="primary impacttrial-start" type="button">START IMPACT TRIAL</button>
        </section>
        <section id="impactTrialPlay" class="impacttrial-play" hidden>
          <div class="impacttrial-hud"><span>HAZARD <b id="impactTrialRound">1 / 5</b></span><span>DEFENSE <b id="impactTrialDefense">60</b></span><span>INTEGRITY <b id="impactTrialIntegrity">100%</b></span><span>SCORE <b id="impactTrialScore">0</b></span></div>
          <div class="impacttrial-arena">
            <div id="impactTrialFeedback" class="impacttrial-feedback"><b>GET READY</b><span>The impact is coming.</span></div>
            <div id="impactTrialCountdown" class="impacttrial-countdown" hidden>3</div>
            <div id="impactTrialCue" class="impacttrial-cue"><small>DEFENSE CALL</small><b>HARDEN!</b></div>
            <div id="impactTrialGolden" class="impacttrial-golden" hidden><b><i class="impacttrial-gold-icon">★</i> GOLDEN HAZARD! <i class="impacttrial-gold-icon">★</i></b><span id="impactTrialGoldenText">HIT ALL GOLD SHIELDS + SURVIVE</span></div>
            <div id="impactTrialPokemonWrap" class="impacttrial-pokemon"><img id="impactTrialPokemon" src="arcade/sprites/actors/pokemon/306.png" alt=""></div>
            <div id="impactTrialHazard" class="impacttrial-hazard" data-kind="roll">
              <div id="impactTrialHazardVisual" class="impacttrial-hazard-visual"><img id="impactTrialHazardSprite" src="adventure/art/objects/strength_boulder.png" alt=""></div>
              <div class="impacttrial-hazard-meta"><b id="impactTrialHazardName">Rolling Boulder</b><small id="impactTrialHazardHint">Tap the shields before the boulder hits.</small></div>
            </div>
            <div id="impactTrialTargetField" class="impacttrial-target-field" data-mode="burst" aria-label="Harden shield targets"></div>
          </div>
          <div class="impacttrial-harden-meter" data-grade="CRUSHED">
            <div class="impacttrial-harden-head"><b>HARDEN <strong id="impactTrialHardenValue">0%</strong></b><span id="impactTrialHardenGrade">GET READY</span><em id="impactTrialGoldCount" hidden>GOLD 0 / 3</em></div>
            <div id="impactTrialHardenSegments" class="impacttrial-harden-segments" aria-hidden="true">${'<i></i>'.repeat(10)}</div>
          </div>
          <div class="impacttrial-integrity"><span><b>TRAINING INTEGRITY</b><small id="impactTrialDamageText">No damage</small></span><div><i id="impactTrialIntegrityFill"></i></div></div>
          <div class="impacttrial-instruction"><b>TAP / SWIPE THE SHIELDS!</b><span>Fill HARDEN before the impact lands.</span></div>
        </section>
      </div>
      <dialog id="impactTrialHelp" class="impacttrial-help">
        <div class="impacttrial-help-card"><div class="impacttrial-help-head"><div><small>IMPACT TRIAL</small><h3>How to Play</h3></div><button type="button" data-impact-help-close aria-label="Close instructions">×</button></div>
          <ol><li>Every hazard gives you a short <b>HARDEN!</b> phase before impact.</li><li><b>Tap or swipe</b> through the shield points as quickly and accurately as you can.</li><li>Different hazards change the pattern: bursts, rushes, falling shields that stop on the guard line, precision points and a final barrage.</li><li>Your HARDEN percentage determines how much of the impact you stop. The grades climb <b>HARDENED → SOLID → IRONCLAD → IMPENETRABLE</b>; 100% means no damage.</li><li>Your Pokémon's Defense stat reduces the damage that remains, but cannot replace good play.</li><li>On a <b>Golden Hazard</b>, hit <b>every gold shield</b> and survive to secure a rare prize, revealed at the end of the run.</li></ol>
          <button class="primary impacttrial-help-done" type="button" data-impact-help-close>GOT IT</button>
        </div>
      </dialog>`;
    return host;
  }

  function clearPokemonAnimationTimer(){if(pokemonAnimTimer){clearTimeout(pokemonAnimTimer);pokemonAnimTimer=0;}}
  function setPokemonPose(state){const node=$('impactTrialPokemonWrap');if(!node)return;clearPokemonAnimationTimer();node.classList.remove('is-hardening','is-hit','is-perfect','is-braced');if(state)node.classList.add(state);}
  function flashPokemonPose(primary,delay=460){setPokemonPose(primary);pokemonAnimTimer=setTimeout(()=>setPokemonPose(null),delay);}

  function refreshParticipants(){participants=platform()?.challengeParticipants?.('defense')||[];const ps=impactState(),remembered=ps?.lastPokemonKey;selectedKey=participants.some(x=>x.key===remembered)?remembered:(participants[0]?.key||null);pickerPage=0;renderSetup();}
  function filteredParticipants(){const q=pickerQuery.trim().toLowerCase(),rows=participants.filter(row=>!q||row.name.toLowerCase().includes(q)||String(row.id).includes(q));rows.sort((a,b)=>pickerSort==='name'?a.name.localeCompare(b.name):pickerSort==='level'?(b.level-a.level||b.baseStat-a.baseStat||a.name.localeCompare(b.name)):(b.baseStat-a.baseStat||b.level-a.level||a.name.localeCompare(b.name)));return rows;}
  function renderPicker(){
    const grid=$('impactTrialPicker');if(!grid)return;const rows=filteredParticipants(),pages=Math.max(1,Math.ceil(rows.length/PICKER_PAGE_SIZE));pickerPage=Math.max(0,Math.min(pages-1,pickerPage));const shown=rows.slice(pickerPage*PICKER_PAGE_SIZE,(pickerPage+1)*PICKER_PAGE_SIZE);
    grid.innerHTML=shown.map(row=>`<button type="button" data-impact-pokemon="${esc(row.key)}" class="${row.key===selectedKey?'selected':''}"><img src="${esc(row.image)}" alt=""><span><b>${row.shiny?'★ ':''}${esc(row.name)}</b><small>Lv.${row.level} · DEFENSE ${row.baseStat}</small></span></button>`).join('');
    $('impactTrialEmpty').hidden=rows.length>0;$('impactTrialPrev').disabled=pickerPage<=0;$('impactTrialNext').disabled=pickerPage>=pages-1;$('impactTrialPage').textContent=`${pickerPage+1} / ${pages} · ${rows.length} Pokémon`;
  }
  function renderSetup(){renderPicker();$('impactTrialStart').disabled=!selectedKey;const search=$('impactTrialSearch');if(search&&search.value!==pickerQuery)search.value=pickerQuery;const sort=$('impactTrialSort');if(sort)sort.value=pickerSort;for(const btn of document.querySelectorAll('[data-impact-difficulty]'))btn.classList.toggle('active',btn.dataset.impactDifficulty===difficulty);$('impactTrialBest').textContent=String(Number(impactState()?.bestScores?.[difficulty]||0));}
  function setSetupVisible(value){$('impactTrialSetup').hidden=!value;$('impactTrialPlay').hidden=!!value;}
  function setFeedback(title,body){const node=$('impactTrialFeedback');if(node)node.innerHTML=`<b>${esc(title)}</b><span>${esc(body)}</span>`;}
  function setParticipant(row){if(!row)return;$('impactTrialDefense').textContent=String(row.baseStat);$('impactTrialPokemon').src=row.image;$('impactTrialPokemon').alt=row.name;}
  function updateIntegrity(){const value=Math.max(0,Math.round(Number(run?.integrity)||0));$('impactTrialIntegrity').textContent=`${value}%`;$('impactTrialIntegrityFill').style.width=`${value}%`;$('impactTrialIntegrityFill').parentElement?.classList.toggle('is-low',value<=35);}
  function currentHardenPct(){return Math.round(core.hardenCoverage(hitValue,targetPlan?.totalValue||1)*100);}
  function updateHardenMeter(){
    const pct=currentHardenPct(),grade=core.hardenGrade(pct/100),meter=document.querySelector('.impacttrial-harden-meter');$('impactTrialHardenValue').textContent=`${pct}%`;$('impactTrialHardenGrade').textContent=phase==='harden'?grade:(lastDefense?.grade||'GET READY');if(meter)meter.dataset.grade=grade;
    const active=Math.ceil(pct/10);for(const [i,seg] of [...$('impactTrialHardenSegments').children].entries())seg.classList.toggle('active',i<active);
    const gold=$('impactTrialGoldCount');if(gold){const total=targetPlan?.goldenTargetCount||0,quota=targetPlan?.goldenQuota||0;gold.hidden=!total;gold.textContent=total?`GOLD ${goldenTargetsHit} / ${quota}`:'';gold.classList.toggle('secured',!!total&&goldenTargetsHit>=quota);}
  }
  function resetHardenField(){const field=$('impactTrialTargetField');if(field){field.innerHTML='';field.dataset.mode='burst';}targetPlan=null;targetStates=[];hitValue=0;targetsHit=0;goldenTargetsHit=0;updateHardenMeter();}

  function renderHazardMotion(progress){
    const visual=$('impactTrialHazardVisual'),hazard=core.HAZARDS[run?.hazards?.length||0];if(!visual||!hazard)return;const p=Math.max(0,Math.min(1,Number(progress)||0));
    if(hazard.kind==='fall'||hazard.kind==='weight')visual.style.transform=`translate(${((1-p)*30).toFixed(1)}px, ${((-1+p)*70).toFixed(1)}px)`;
    else if(hazard.kind==='ram'||hazard.kind==='charge')visual.style.transform=`translateX(${((1-p)*116).toFixed(1)}px)`;
    else visual.style.transform=`translateX(${((1-p)*126).toFixed(1)}px) rotate(${(p*42).toFixed(1)}deg)`;
  }
  function setHazard(index){
    const hazard=core.HAZARDS[index],golden=run?.goldenIndex===index,node=$('impactTrialHazard');if(!hazard||!node)return;
    node.dataset.kind=hazard.kind;node.className=`impacttrial-hazard${golden?' is-golden':''}`;const sprite=$('impactTrialHazardSprite');sprite.src=hazard.sprite;sprite.alt=hazard.name;sprite.style.setProperty('--hazard-scale',String(hazard.spriteScale||4));$('impactTrialHazardName').textContent=hazard.name;$('impactTrialHazardHint').textContent=hazard.hint;$('impactTrialRound').textContent=`${index+1} / ${core.HAZARDS.length}`;$('impactTrialGolden').hidden=!golden;renderHazardMotion(0);
  }
  function buildTargetField(plan){
    const field=$('impactTrialTargetField');if(!field)return;field.dataset.mode=plan.mode;field.innerHTML='';targetStates=plan.targets.map(target=>({...target,state:'pending'}));
    for(const target of targetStates){
      const button=document.createElement('button');button.type='button';button.className=`impacttrial-harden-target is-pending${target.golden?' is-golden':''}`;button.dataset.impactTarget=target.id;button.setAttribute('aria-label',target.golden?'Golden Harden shield':'Harden shield');button.style.left=`${target.x}%`;button.style.top=`${target.y}%`;button.style.setProperty('--target-scale',String(target.scale||1));button.innerHTML=target.golden?'<b class="impacttrial-gold-icon">★</b>':'<b>◆</b>';field.appendChild(button);
    }
  }
  function beginCountdown(){
    resetHardenField();setPokemonPose(null);lastDefense=null;phase='countdown';countdownStartedAt=now();const node=$('impactTrialCountdown');if(node){node.hidden=false;node.textContent='3';}const cue=$('impactTrialCue');cue?.classList.remove('is-live');const golden=$('impactTrialGolden');if(golden)golden.hidden=true;$('impactTrialDamageText').textContent='No damage';setFeedback('READY','Impact Trial starts on GO!');schedule();
  }
  function updateCountdown(t){const node=$('impactTrialCountdown');if(!node)return;const label=core.countdownLabel(Math.max(0,t-countdownStartedAt));node.textContent=label||'GO!';}
  function endCountdown(){const node=$('impactTrialCountdown');if(node)node.hidden=true;beginHazard();}

  function beginHarden(){
    if(!run)return;const index=run.hazards.length,hazard=core.HAZARDS[index],golden=run.goldenIndex===index;targetPlan=core.createTargetPlan({hazard,difficulty,profile:run?.profile,rng:Math.random,golden,defense:Number(run?.participant?.baseStat)||60});hitValue=0;targetsHit=0;goldenTargetsHit=0;buildTargetField(targetPlan);phase='harden';hardenStartedAt=now();setPokemonPose('is-hardening');$('impactTrialCue').classList.add('is-live');$('impactTrialGoldenText').textContent=golden?`HIT ALL ${targetPlan.goldenTargetCount} GOLD SHIELDS + SURVIVE`:'HIT THE SHIELDS';$('impactTrialDamageText').textContent='Impact incoming';let instruction='TAP / SWIPE every shield you can!';if(hazard.mode==='lanes')instruction='Tap the falling shields near the white guard line.';else if(hazard.mode==='precision')instruction='Small shield points — be fast and accurate.';else if(hazard.mode==='barrage')instruction='Multiple waves — keep swiping through the barrage!';else if(hazard.mode==='rush')instruction='Short burst — react immediately!';setFeedback('HARDEN!',instruction);updateHardenMeter();schedule();
  }
  function beginHazard(){
    const index=run?.hazards?.length||0;if(index>=core.HAZARDS.length||run?.integrity<=0)return void finishRun();setHazard(index);resetHardenField();setPokemonPose(null);lastDefense=null;phase='cue';cueUntil=now()+620;const hazard=core.HAZARDS[index],golden=run?.goldenIndex===index;$('impactTrialCue').classList.remove('is-live');$('impactTrialDamageText').textContent='No damage';setFeedback(golden?'★ GOLDEN HAZARD!':'INCOMING',golden?`${hazard.name} · gold shields are mixed into the Harden pattern.`:`${hazard.name} · get ready to HARDEN!`);session()?.update?.('impactTrial',{runText:'5 hazards · frantic tap/swipe Harden phases',rewardText:'Lucky Coins · Golden Hazard can award packs, cards, dust, tickets or coins',liveLabel:'HAZARD',liveValue:`${index+1}/5`});schedule();
  }
  function beginRun(row,{profileOverride=null,tournament=null}={}){if(!row)return false;const ps=impactState();if(ps)ps.lastPokemonKey=row.key;saveState();session()?.hideResult?.();tournamentContext=tournament;run=core.createRun({difficulty,profile:profileOverride,participant:row,rng:Math.random,goldenRate:rareRate()});completionHandled=false;finishPromise=null;setSetupVisible(false);setParticipant(row);$('impactTrialScore').textContent='0';updateIntegrity();beginCountdown();return true;}
  function startRun(){return beginRun(currentParticipant(),{tournament:null});}
  function startExhibition({difficulty:requested='normal',participant}={}){if(!participant)return false;difficulty=core.DIFFICULTIES[requested]?requested:'normal';participants=[participant,...participants.filter(p=>p.key!==participant.key)];selectedKey=participant.key;return beginRun(participant,{tournament:null});}
  function startGoldenrodRound({cupId,mode='division',divisionId='rookie',type=null,roundIndex=0,seed=1,player,onComplete}={}){if(!player)return false;difficulty='normal';participants=[player];selectedKey=player.key||null;return beginRun(player,{profileOverride:core.divisionProfile(divisionId,roundIndex),tournament:{cupId,mode,divisionId,type,roundIndex,seed,onComplete}});}

  function hitTargetElement(el,time=now()){
    if(phase!=='harden'||!el)return false;const id=el.dataset?.impactTarget,state=targetStates.find(t=>t.id===id);if(!state||state.state!=='live')return false;const elapsed=Math.max(0,time-hardenStartedAt-state.spawnAt),value=core.targetHitValue(state,elapsed);state.state='hit';state.hitValue=value;hitValue+=value;if(value>=.35)targetsHit++;if(state.golden&&value>=.35)goldenTargetsHit++;el.classList.remove('is-live','is-hot','is-fading');el.classList.add('is-hit');el.disabled=true;const quality=Math.round(value*100);el.querySelector('b').textContent=state.golden?'★':quality>=85?'✦':'◆';if(state.golden&&value>=.35)setFeedback('GOLD SHIELD!',`${goldenTargetsHit} / ${targetPlan.goldenTargetCount} gold shields`);updateHardenMeter();setTimeout(()=>el.remove?.(),150);if(root.state?.settings?.vibration!==false)root.navigator?.vibrate?.(state.golden?[12,18,18]:8);return true;
  }
  function resolveHardenPhase(){
    if(phase!=='harden'||!run||!targetPlan)return false;phase='result';$('impactTrialCue').classList.remove('is-live');lastDefense=core.applyHarden(run,{hitValue,totalValue:targetPlan.totalValue,targetsHit,targetsTotal:targetPlan.targets.length,goldenTargetsHit,goldenTargetsTotal:targetPlan.goldenTargetCount,goldenQuota:targetPlan.goldenQuota});if(!lastDefense)return false;resultUntil=now()+1120;$('impactTrialScore').textContent=String(run.score);updateIntegrity();updateHardenMeter();const node=$('impactTrialHazard');node.classList.add(lastDefense.perfect?'is-perfect':lastDefense.survived?'is-cleared':'is-failed');flashPokemonPose(lastDefense.perfect?'is-perfect':lastDefense.damage?'is-hit':'is-braced');$('impactTrialDamageText').textContent=lastDefense.damage?`-${lastDefense.damage} integrity`:'NO DAMAGE';const goldText=lastDefense.golden?(lastDefense.goldenCleared?' · GOLDEN PRIZE SECURED!':` · GOLD ${lastDefense.goldenTargetsHit}/${lastDefense.goldenQuota}`):'';const body=lastDefense.damage?`${lastDefense.damage} integrity lost · ${Math.round(run.integrity)}% remains${goldText}`:`Impact completely stopped${goldText}`;setFeedback(`${lastDefense.grade} · ${Math.round(lastDefense.percent)}% HARDEN`,body);if(root.state?.settings?.vibration!==false)root.navigator?.vibrate?.(lastDefense.perfect?[24,24,42]:lastDefense.survived?[18,16,28]:[20,20,20,20,45]);schedule();return true;
  }

  async function claimGoldenPrize(goldDefense){
    if(!goldDefense?.goldenCleared)return {label:'',reveal:null,pending:false};const rr=rareRewards(),bridge=rareBridge(),gift=giftCore();if(!root.state||!rr||!bridge||!gift)return {label:'Prize unavailable',reveal:null,pending:true};let attempt=rr.getOrCreateAttempt(root.state,'impactTrialGolden',()=>{const pick=gift.rewardForRoll(Math.random());return {kind:pick.kind,reward:pick.reward,source:'impact-trial-golden'};});
    try{if(!attempt.reward&&['card','pack'].includes(attempt.kind)){const reward=await bridge.resolveArcadeReward?.(attempt.kind);if(!reward)throw new Error('Golden Hazard reward could not be resolved');attempt=rr.patchAttempt(root.state,'impactTrialGolden',attempt.id,{reward})||attempt;bridge.save?.();}if(!attempt.reward)throw new Error('Golden Hazard reward missing');const claim=await rr.claimAttempt(root.state,'impactTrialGolden',attempt.id,reward=>bridge.grantReward?.(reward));bridge.save?.();const label=claim?.result?.label||attempt.reward.label||'Golden Hazard Prize';return {label,reveal:bridge.rewardReveal?.(attempt.reward,claim?.result,'GOLDEN HAZARD PRIZE')||null,pending:false};}catch(error){console.warn?.('[LuckyDex] Golden Hazard prize remains reserved',error);bridge.save?.();return {label:'Golden Hazard Prize Reserved',reveal:null,pending:true};}
  }

  function tournamentResultPayload(activeRun,goldenPrize={label:'',reveal:null,pending:false}){
    if(!activeRun)return null;const goldDefense=activeRun.goldenIndex>=0?activeRun.hazards?.[activeRun.goldenIndex]:null,hazards=activeRun.hazards||[];
    const average=hazards.length?hazards.reduce((sum,h)=>sum+(Number(h?.percent)||0),0)/hazards.length:0;
    const metric=Math.round((average+(Number(activeRun.integrity)||0)*.25+(Number(activeRun.perfects)||0)*3)*10)/10;
    const rareReceipts=goldDefense?.goldenCleared?[{source:'impactTrialGolden',label:goldenPrize.label||'Golden Hazard Prize',meta:goldenPrize.pending?'Prize reserved safely':'Awarded during this cup',reveal:goldenPrize.reveal||null,pending:!!goldenPrize.pending}]:[];
    return {eventId:'impactTrial',metric,raw:{score:Number(activeRun.score)||0,integrity:Number(activeRun.integrity)||0,perfects:Number(activeRun.perfects)||0,targetsHit:Number(activeRun.targetsHit)||0,targetsTotal:Number(activeRun.targetsTotal)||0,bestHardenPct:Number(activeRun.bestHardenPct)||0},rareReceipts};
  }
  function commitTournamentStats(){if(completionHandled||!run?.finished)return null;completionHandled=true;const ps=impactState(),goldDefense=run.goldenIndex>=0?run.hazards[run.goldenIndex]:null,full=!!run.fullClear,noDamage=full&&run.integrity>=100;if(ps){ps.gamesPlayed++;ps.fullClears+=full?1:0;ps.noDamageClears+=noDamage?1:0;ps.bestScore=Math.max(Number(ps.bestScore)||0,run.score);ps.bestIntegrity=Math.max(Number(ps.bestIntegrity)||0,run.integrity);ps.bestPerfects=Math.max(Number(ps.bestPerfects)||0,run.perfects);ps.bestHardenPct=Math.max(Number(ps.bestHardenPct)||0,run.bestHardenPct);ps.perfectDefenses+=run.perfects;ps.totalHazardsSurvived+=run.hazards.filter(h=>h.survived).length;ps.hardenTargetsHit=(Number(ps.hardenTargetsHit)||0)+run.targetsHit;ps.hardenTargetsSeen=(Number(ps.hardenTargetsSeen)||0)+run.targetsTotal;if(run.goldenIndex>=0)ps.goldenHazardsSeen++;if(goldDefense?.goldenCleared)ps.goldenHazardsCleared++;ps.lastPokemonKey=run.participant?.key||ps.lastPokemonKey;}saveState();return {goldDefense,full,noDamage};}

  function commitResult(){
    if(completionHandled||!run?.finished)return null;completionHandled=true;const ps=impactState(),goldDefense=run.goldenIndex>=0?run.hazards[run.goldenIndex]:null,full=!!run.fullClear,noDamage=full&&run.integrity>=100,newBest=run.score>Number(ps?.bestScores?.[difficulty]||0);
    if(ps){ps.gamesPlayed++;ps.fullClears+=full?1:0;ps.hardClears+=full&&difficulty==='hard'?1:0;ps.noDamageClears+=noDamage?1:0;ps.bestScore=Math.max(Number(ps.bestScore)||0,run.score);ps.bestScores[difficulty]=Math.max(Number(ps.bestScores?.[difficulty])||0,run.score);ps.bestIntegrity=Math.max(Number(ps.bestIntegrity)||0,run.integrity);ps.bestPerfects=Math.max(Number(ps.bestPerfects)||0,run.perfects);ps.bestHardenPct=Math.max(Number(ps.bestHardenPct)||0,run.bestHardenPct);ps.perfectDefenses+=run.perfects;ps.totalHazardsSurvived+=run.hazards.filter(h=>h.survived).length;ps.hardenTargetsHit=(Number(ps.hardenTargetsHit)||0)+run.targetsHit;ps.hardenTargetsSeen=(Number(ps.hardenTargetsSeen)||0)+run.targetsTotal;if(run.goldenIndex>=0)ps.goldenHazardsSeen++;if(goldDefense?.goldenCleared)ps.goldenHazardsCleared++;ps.lastPokemonKey=run.participant?.key||ps.lastPokemonKey;}
    const award=platform()?.awardRun?.({gameId:'impactTrial',label:'Impact Trial',score:run.score,coins:core.rewardForRun(run),dailyEligible:false})||{coinsAwarded:0};saveState();return {award,full,noDamage,newBest,goldDefense};
  }
  async function finishRun(){
    if(finishPromise)return finishPromise;finishPromise=(async()=>{stopLoop();phase='finished';if(tournamentContext){const committed=commitTournamentStats();if(!committed)return false;const goldenPrize=await claimGoldenPrize(committed.goldDefense),payload=tournamentResultPayload(run,goldenPrize),callback=tournamentContext.onComplete;tournamentContext={...tournamentContext,completed:true};if(typeof callback==='function')callback(payload);return payload;}const committed=commitResult();if(!committed)return false;const {award,full,noDamage,newBest,goldDefense}=committed,row=run.participant,ps=impactState(),goldenPrize=await claimGoldenPrize(goldDefense);const goldenValue=run.goldenIndex<0?'NOT SEEN':goldDefense?.goldenCleared?(goldenPrize.pending?'CLEARED · PRIZE RESERVED':`CLEARED · ${goldenPrize.label}`):`MISSED · GOLD ${goldDefense?.goldenTargetsHit||0}/${goldDefense?.goldenTargetsTotal||goldDefense?.goldenQuota||3}`;
      const average=run.targetsTotal?Math.round((run.targetsHit/run.targetsTotal)*100):0,review={title:'IMPACT TRIAL COMPLETE',mode:'Defense Event · Harden',difficulty:profile().label,metricLabel:'SCORE',metricValue:String(run.score),stats:[{label:'Pokémon',value:`${row.shiny?'★ ':''}${row.name}`},{label:'Base Defense',value:String(row.baseStat)},{label:'Hazards Faced',value:`${run.hazards.length}/5`},{label:'Integrity',value:`${Math.round(run.integrity)}%`},{label:'Perfect Hardens',value:String(run.perfects)},{label:'Best Harden',value:`${Math.round(run.bestHardenPct)}%`},{label:'Shield Hits',value:`${run.targetsHit}/${run.targetsTotal} (${average}%)`},{label:'Damage Taken',value:String(run.damageTaken)},...(run.goldenIndex>=0?[{label:'Golden Hazard',value:goldenValue}]:[])],pbs:[{label:`${profile().label} Best`,value:String(ps?.bestScores?.[difficulty]||run.score),isNew:newBest}],rewards:[{label:'Run Reward',value:`${award.coinsAwarded||0} Lucky Coins`},...(goldDefense?.goldenCleared?[{label:'Golden Hazard Prize',value:goldenPrize.label||'Prize Reserved'}]:[])]};
      session()?.showResult?.('impactTrial',{title:full?'IMPACT TRIAL COMPLETE':'TRAINING STOPPED',metricLabel:'SCORE',metricValue:run.score,coinsAwarded:award.coinsAwarded,itemAwarded:award.itemAwarded,bestText:goldenPrize.pending?'GOLDEN PRIZE RESERVED':goldDefense?.goldenCleared?'GOLDEN PRIZE WON':newBest?'NEW BEST SCORE':noDamage?'NO-DAMAGE CLEAR':full?'ALL FIVE SURVIVED':'',rewardReveals:goldenPrize.reveal?[goldenPrize.reveal]:[],details:[{title:`${row.shiny?'★ ':''}${row.name}`,subtitle:`Defense ${row.baseStat} · ${profile().label}`,kind:'racer'},{title:`${Math.round(run.integrity)}% integrity`,subtitle:`${run.perfects} perfect Hardens · ${run.targetsHit}/${run.targetsTotal} shields`,kind:'score'}],review,replayLabel:'TRY AGAIN',changeLabel:'CHANGE POKÉMON',onReplay:()=>startRun(),onChange:()=>showSetup(),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return true;
    })().finally(()=>{finishPromise=null;});return finishPromise;
  }

  function showSetup(){stopLoop();const countdown=$('impactTrialCountdown');if(countdown)countdown.hidden=true;phase='setup';run=null;tournamentContext=null;resetHardenField();setSetupVisible(true);setPokemonPose(null);refreshParticipants();return true;}
  function updateTargetStates(t){
    if(!targetPlan)return;const elapsed=t-hardenStartedAt,field=$('impactTrialTargetField');
    for(const state of targetStates){const el=field?.querySelector?.(`[data-impact-target="${state.id}"]`);if(!el)continue;const age=elapsed-state.spawnAt,grace=Math.max(0,Number(state.graceMs)||0);if(state.state==='pending'&&age>=0){state.state='live';state.fading=false;el.classList.remove('is-pending');el.classList.add('is-live');}
      if(state.state==='live'){
        if(state.mode==='lanes'){el.style.top=`${core.laneTargetY(state,age)}%`;const quality=core.targetHitValue(state,age);el.classList.toggle('is-hot',quality>=.72);}
        if(age>state.lifeMs&&!state.fading){state.fading=true;el.classList.add('is-fading');}
        if(age>state.lifeMs+grace){state.state='miss';el.classList.remove('is-live','is-hot','is-fading');el.classList.add('is-miss');el.disabled=true;setTimeout(()=>el.remove?.(),140);}
      }
    }
    renderHazardMotion(Math.max(0,Math.min(1,elapsed/Math.max(1,targetPlan.windowMs))));
  }

  function hitTargetsAlongPath(from,to,time=now()){
    if(phase!=='harden'||!from||!to)return 0;const field=$('impactTrialTargetField');if(!field)return 0;let hit=0;
    for(const state of targetStates){if(state.state!=='live')continue;const el=field.querySelector?.(`[data-impact-target="${state.id}"]`);if(!el)continue;const rect=el.getBoundingClientRect?.();if(!rect)continue;const centre={x:rect.left+rect.width/2,y:rect.top+rect.height/2},baseRadius=Math.max(28,Math.min(38,Math.max(rect.width,rect.height)*.72)),hitRadiusScale=Number(targetPlan?.hitRadiusScale)||1,radius=baseRadius*hitRadiusScale;if(core.segmentHitsCircle(from,to,centre,radius)&&hitTargetElement(el,time))hit++;}
    return hit;
  }

  function frame(t){
    rafId=0;if(!opened)return;
    if(phase==='countdown'){updateCountdown(t);if(t-countdownStartedAt>=core.COUNTDOWN_END_MS)endCountdown();}
    else if(phase==='cue'&&t>=cueUntil)beginHarden();
    else if(phase==='harden'){updateTargetStates(t);if(t-hardenStartedAt>=targetPlan.windowMs)resolveHardenPhase();}
    else if(phase==='result'&&t>=resultUntil){if(run?.finished)void finishRun();else beginHazard();}
    schedule();
  }

  function onClick(e){
    if(e.target.closest?.('#impactTrialInfo')){const help=$('impactTrialHelp');if(help?.showModal)help.showModal();else help?.setAttribute('open','');return;}if(e.target.closest?.('[data-impact-help-close]')){const help=$('impactTrialHelp');if(help?.close)help.close();else help?.removeAttribute('open');return;}
    const d=e.target.closest?.('[data-impact-difficulty]');if(d&&phase==='setup'){difficulty=core.DIFFICULTIES[d.dataset.impactDifficulty]?d.dataset.impactDifficulty:'normal';renderSetup();return;}const p=e.target.closest?.('[data-impact-pokemon]');if(p&&phase==='setup'){if(participants.some(x=>x.key===p.dataset.impactPokemon)){selectedKey=p.dataset.impactPokemon;renderSetup();}return;}if(e.target.closest?.('#impactTrialPrev')){pickerPage=Math.max(0,pickerPage-1);renderPicker();return;}if(e.target.closest?.('#impactTrialNext')){pickerPage++;renderPicker();return;}if(e.target.closest?.('#impactTrialStart')){startRun();return;}const target=e.target.closest?.('[data-impact-target]');if(target){hitTargetElement(target);return;}
  }
  function bind(){
    const host=$('impactTrialGame');hostClick=onClick;host.addEventListener('click',hostClick);hostInput=e=>{if(e.target?.id==='impactTrialSearch'){pickerQuery=String(e.target.value||'');pickerPage=0;renderPicker();}};host.addEventListener('input',hostInput);hostChange=e=>{if(e.target?.id==='impactTrialSort'){pickerSort=['defense','level','name'].includes(e.target.value)?e.target.value:'defense';pickerPage=0;renderPicker();}};host.addEventListener('change',hostChange);hostContext=e=>{if(!e.target?.closest?.('input,textarea'))e.preventDefault();};host.addEventListener('contextmenu',hostContext);hostSelectStart=e=>{if(!e.target?.closest?.('input,textarea'))e.preventDefault();};host.addEventListener('selectstart',hostSelectStart);
    const field=$('impactTrialTargetField');fieldPointerDown=e=>{if(phase!=='harden')return;swipePointerId=e.pointerId;lastSwipePoint={x:e.clientX,y:e.clientY};field?.setPointerCapture?.(e.pointerId);hitTargetsAlongPath(lastSwipePoint,lastSwipePoint,now());e.preventDefault();};fieldPointerMove=e=>{if(phase!=='harden'||swipePointerId!==e.pointerId)return;const events=typeof e.getCoalescedEvents==='function'?[...e.getCoalescedEvents(),e]:[e];for(const sample of events){const next={x:sample.clientX,y:sample.clientY};hitTargetsAlongPath(lastSwipePoint||next,next,now());lastSwipePoint=next;}e.preventDefault();};fieldPointerUp=e=>{if(swipePointerId===e.pointerId){swipePointerId=null;lastSwipePoint=null;}};field?.addEventListener('pointerdown',fieldPointerDown,{passive:false});field?.addEventListener('pointermove',fieldPointerMove,{passive:false});field?.addEventListener('pointerup',fieldPointerUp);field?.addEventListener('pointercancel',fieldPointerUp);
    keyDown=e=>{if(e.repeat||phase!=='harden')return;const k=String(e.key||'').toLowerCase();if(k===' '||k==='enter'){const live=targetStates.filter(t=>t.state==='live').sort((a,b)=>(a.spawnAt+a.lifeMs)-(b.spawnAt+b.lifeMs))[0];if(live){const el=$('impactTrialTargetField')?.querySelector?.(`[data-impact-target="${live.id}"]`);hitTargetElement(el);e.preventDefault();}}};root.addEventListener?.('keydown',keyDown);
  }
  function unbind(){const host=$('impactTrialGame');if(host&&hostClick)host.removeEventListener('click',hostClick);if(host&&hostInput)host.removeEventListener('input',hostInput);if(host&&hostChange)host.removeEventListener('change',hostChange);if(host&&hostContext)host.removeEventListener('contextmenu',hostContext);if(host&&hostSelectStart)host.removeEventListener('selectstart',hostSelectStart);const field=$('impactTrialTargetField');if(field&&fieldPointerDown)field.removeEventListener('pointerdown',fieldPointerDown);if(field&&fieldPointerMove)field.removeEventListener('pointermove',fieldPointerMove);if(field&&fieldPointerUp){field.removeEventListener('pointerup',fieldPointerUp);field.removeEventListener('pointercancel',fieldPointerUp);}if(keyDown)root.removeEventListener?.('keydown',keyDown);hostClick=hostInput=hostChange=hostContext=hostSelectStart=keyDown=fieldPointerDown=fieldPointerMove=fieldPointerUp=null;swipePointerId=null;lastSwipePoint=null;clearPokemonAnimationTimer();}

  function open(){opened=true;tournamentContext=null;shell();session()?.mount?.('impactTrial',$('impactTrialGame'));bind();difficulty='normal';pickerQuery='';pickerSort='defense';pickerPage=0;refreshParticipants();showSetup();return true;}
  function close(){opened=false;stopLoop();unbind();session()?.hideResult?.();const help=$('impactTrialHelp');if(help?.open)help.close?.();phase='closed';run=null;tournamentContext=null;resetHardenField();setPokemonPose(null);return true;}
  function pause(){stopLoop();return true;}function resume(){schedule();return true;}
  function snapshot(){return {opened,phase,difficulty,selectedKey,run:run?{difficulty:run.difficulty,score:run.score,integrity:run.integrity,perfects:run.perfects,goldenIndex:run.goldenIndex,hazards:run.hazards.length,targetsHit:run.targetsHit,targetsTotal:run.targetsTotal,bestHardenPct:run.bestHardenPct}:null,harden:targetPlan?{percent:currentHardenPct(),targetsHit,goldenTargetsHit,totalTargets:targetPlan.targets.length}:null};}
  return Object.freeze({open,close,pause,resume,startRun,startExhibition,startGoldenrodRound,tournamentResultPayload,showSetup,snapshot});
});
