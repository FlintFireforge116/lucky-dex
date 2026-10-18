(function(root,factory){
  const core=root.LuckyDexTargetRangeCore||(typeof require==='function'?require('./arcade-target-range-core.js'):null);
  const api=factory(root,core);root.LuckyDexTargetRange=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexTargetRangeCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const rareRewards=()=>root.LuckyDexArcadeRareRewards||globalThis.LuckyDexArcadeRareRewards;
  const rareBridge=()=>root.LuckyDexRareRewardBridge||globalThis.LuckyDexRareRewardBridge;
  const giftCore=()=>root.LuckyDexVoltorbGiftCore||globalThis.LuckyDexVoltorbGiftCore;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  let opened=false,difficulty='normal',run=null,tournamentContext=null,participant=null,attackType='normal',phase='setup',aimX=.5,aimY=.70,pointerId=null,drawStartedAt=0,lastPointer=null,shotBusy=false,rafId=0,targetStartedAt=0,targetDeadline=Infinity,paused=false,bound=false,completionHandled=false,finishPromise=null,controlNode=null,visibilityHandler=null;
  let generation=0,flightFrame=0;
  const shotTimers=new Set();
  function later(fn,ms){const token=generation,id=setTimeout(()=>{shotTimers.delete(id);if(opened&&token===generation)fn();},ms);shotTimers.add(id);return id;}
  function cancelFlight(){generation++;if(flightFrame)caf(flightFrame);flightFrame=0;for(const id of shotTimers)clearTimeout(id);shotTimers.clear();$('targetRangeProjectile')?.classList.remove('is-flying','is-impact');$('targetRangePokemon')?.classList.remove('is-shooting');}

  function shell(){
    const host=$('targetRangeGame');if(!host)return null;
    host.innerHTML=`<div class="arcade-full-head"><button class="game-exit" data-exit-game>‹ ARCADE</button><div class="target-range-brand"><div class="arcade-mascot"><img src="arcade/sprites/actors/pokemon/65.png" alt="Alakazam"><span>POKÉMON CHALLENGE COURSE</span></div></div></div>
      <div class="target-range-shell">
        <section id="targetRangeSetup" class="target-range-setup"><div class="eyebrow">SP. ATK EVENT</div><h2>Target Range</h2><p>Aim beyond the target, read the wind, and release a focused special attack. Distance and moving targets make every shot count.</p><div class="target-range-setup-note">Choose Exhibition / Division Cup / Type Cup from the Goldenrod Challenge Course.</div></section>
        <section id="targetRangePlay" class="target-range-play" hidden>
          <div class="target-range-hud">
            <span><small>ROUND</small><b id="targetRangeRound">MARKSMAN</b><em id="targetRangeTargetCount">1/8</em></span>
            <span><small>SCORE</small><b id="targetRangeScore">0</b></span>
            <span><small>COMBO</small><b id="targetRangeCombo">×1.00</b></span>
          </div>
          <div id="targetRangeGallery" class="target-range-gallery" data-attack-type="normal">
            <div class="target-range-horizon" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="target-range-ground" aria-hidden="true"></div>
            <div class="target-range-lane" aria-hidden="true"></div>
            <div class="target-range-scenery" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="target-range-markers" aria-hidden="true"><i style="--marker-y:72%;--marker-x:79%;--marker-size:11px">10<small>m</small></i><i style="--marker-y:61%;--marker-x:74%;--marker-size:10px">20<small>m</small></i><i style="--marker-y:51%;--marker-x:69%;--marker-size:9px">30<small>m</small></i><i style="--marker-y:43%;--marker-x:65%;--marker-size:8px">40<small>m</small></i><i style="--marker-y:37%;--marker-x:61%;--marker-size:7px">50<small>m</small></i></div>
            <div class="target-range-firing-line" aria-hidden="true"></div>
            <div class="target-range-readout target-range-readout-left"><span id="targetRangeWind">WIND · CALM</span><b id="targetRangeDistance">20 m</b></div>
            <div class="target-range-readout target-range-readout-right"><span>SP. ATK <b id="targetRangeStat">60</b></span><strong id="targetRangeAttackName">Swift</strong></div>
            <div id="targetRangeTarget" class="target-range-target"><i class="ring outer"></i><i class="ring middle"></i><i class="ring inner"></i><i class="ring bull"></i><strong id="targetRangeGoldenLabel" hidden aria-label="Golden Target">★</strong></div>
            <div id="targetRangeReticle" class="target-range-reticle"><i></i></div>
            <div id="targetRangeProjectile" class="target-range-projectile attack-normal" aria-hidden="true"></div>
            <div id="targetRangeFeedback" class="target-range-feedback" hidden><b></b><span></span></div>
            <img id="targetRangePokemon" class="target-range-pokemon" src="arcade/sprites/actors/pokemon/25.png" alt="">
          </div>
          <div id="targetRangeControl" class="target-range-control">
            <div class="target-range-focus"><span>FOCUS</span><div><i id="targetRangeFocus"></i><em aria-hidden="true"></em></div><b id="targetRangeFocusValue">0%</b></div>
            <strong id="targetRangeCue">HOLD · AIM · RELEASE IN GOLD</strong>
          </div>
        </section>
      </div>`;
    return host;
  }
  function setPlay(v){const s=$('targetRangeSetup'),p=$('targetRangePlay'),host=$('targetRangeGame');if(s)s.hidden=!!v;if(p)p.hidden=!v;host?.classList.toggle('is-playing',!!v);}
  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(opened&&!paused&&!rafId&&phase==='playing')rafId=raf(frame);}
  function currentTarget(){return run?.targets?.[run.currentIndex]||null;}
  function profile(){return run?.profile||core.difficultyProfile(difficulty);}
  function saveState(){try{root.save?.();}catch(_){} }
  function targetState(){const st=root.state||globalThis.state;if(!st)return null;st.arcade=platform()?.ensureArcadeState?.(st.arcade)||st.arcade||{};return st.arcade.targetRange;}
  function rareRate(){return Math.max(0,Math.min(1,Number(root.state?.settings?.rareOdds?.targetRangeGolden??.02)||0));}
  function validAttackType(row,requested){const types=(row?.types||[]).map(t=>String(t).toLowerCase());const r=String(requested||types[0]||'normal').toLowerCase();return types.includes(r)&&core.ATTACKS[r]?r:(core.ATTACKS[types[0]]?types[0]:'normal');}

  function renderStatic(){
    if(!run||!participant)return;
    $('targetRangeStat').textContent=String(participant.baseStat||60);
    $('targetRangePokemon').src=participant.image||`arcade/sprites/actors/pokemon/${participant.id||25}.png`;$('targetRangePokemon').alt=participant.name||'Pokémon';
    $('targetRangeRound').textContent=profile().roundName||String(profile().label||'RANGE').toUpperCase();
    $('targetRangeAttackName').textContent=core.ATTACKS[attackType]||'Swift';
    const gallery=$('targetRangeGallery');if(gallery){gallery.dataset.attackType=attackType;}
    $('targetRangeControl')?.style.setProperty('--ideal-start',`${(profile().idealStart||.84)*100}%`);
    const proj=$('targetRangeProjectile');if(proj)proj.className=`target-range-projectile attack-${attackType}`;
  }
  function renderTarget(t=now()){
    const target=currentTarget(),node=$('targetRangeTarget');if(!target||!node)return;
    const pos=core.targetPositionAt(target,t),size=target.radius*2*($('targetRangeGallery')?.clientWidth||340);
    node.style.left=`${(pos.x*100).toFixed(4)}%`;node.style.top=`${(pos.y*100).toFixed(4)}%`;node.style.width=`${size}px`;node.style.height=`${size}px`;
    node.style.setProperty('--stand-height',`${Math.max(8,size*.38)}px`);
    node.classList.toggle('is-golden',!!target.golden);node.classList.toggle('is-armored',!!target.armored);node.classList.toggle('is-popup',target.motion?.type==='popup');
    $('targetRangeGoldenLabel').hidden=!target.golden;
    $('targetRangeWind').textContent=Math.abs(target.wind)<.08?'WIND · CALM':`WIND ${target.wind<0?'←':'→'} ${Math.abs(target.wind).toFixed(1)}`;
    $('targetRangeDistance').textContent=`${target.distanceM} m`;const counter=$('targetRangeTargetCount');if(counter)counter.textContent=`${Math.min(run.currentIndex+1,run.targets.length)}/${run.targets.length}`;
  }
  function renderAim(){const r=$('targetRangeReticle');if(r){r.style.left=`${aimX*100}%`;r.style.top=`${aimY*100}%`;}}
  function feedback(title,body=''){const n=$('targetRangeFeedback');if(!n)return;n.hidden=!title&&!body;n.innerHTML=`<b>${esc(title)}</b><span>${esc(body)}</span>`;}
  function renderScore(){if(!run)return;$('targetRangeScore').textContent=String(run.score);$('targetRangeCombo').textContent=`×${Number(run.combo||1).toFixed(2)}`;}
  function beginTarget(){
    if(!run)return false;if(run.currentIndex>=run.targets.length||run.complete)return void finishRun();
    targetStartedAt=now();targetDeadline=Infinity;shotBusy=false;phase='playing';
    // A low neutral rest allows a precise upward thumb stroke to reach every depth.
    // It never follows the target, wind or participant stat.
    aimX=.5;aimY=.70;
    const target=currentTarget();$('targetRangeTarget')?.classList.remove('is-hit','is-broken');$('targetRangeCue').textContent='HOLD · AIM · RELEASE IN GOLD';if(target.golden)feedback('★ GOLDEN TARGET!','Bullseye for a rare prize.');else feedback('', '');renderTarget(targetStartedAt);renderAim();schedule();return true;
  }
  function beginRound(row,{profileOverride=null,tournament=null,selectedAttackType=null,seed=Date.now()}={}){
    if(!row)return false;cancelFlight();cancelAim();stopLoop();participant=row;attackType=validAttackType(row,selectedAttackType);aimX=.5;aimY=.70;tournamentContext=tournament;difficulty=tournament?'normal':difficulty;
    run=core.createRound({participant:row,profile:profileOverride||core.difficultyProfile(difficulty),attackType,seed,goldenRate:rareRate()});phase='playing';completionHandled=false;finishPromise=null;setPlay(true);renderStatic();renderScore();beginTarget();
    session()?.update?.('targetRange',{runText:`${profile().roundName||'Range'} · settle, focus and release`,rewardText:'Goldenrod standings · trophies · rare Golden Target',liveLabel:'TARGET',liveValue:`1/${run.targets.length}`});return true;
  }
  function startExhibition({difficulty:requested='normal',participant:row,attackType:requestedType}={}){if(!row)return false;difficulty=core.DIFFICULTIES[requested]?requested:'normal';return beginRound(row,{selectedAttackType:requestedType,seed:Date.now()});}
  function startGoldenrodRound({cupId,mode='division',divisionId='rookie',type=null,roundIndex=0,seed=1,player,attackType:requestedType,onComplete}={}){if(!player)return false;const p=core.divisionProfile(divisionId,roundIndex);return beginRound(player,{profileOverride:p,selectedAttackType:requestedType,seed,tournament:{cupId,mode,divisionId,type,roundIndex,seed,attackType:requestedType,onComplete}});}

  function cancelAim(){if(pointerId!=null&&controlNode?.hasPointerCapture?.(pointerId))controlNode.releasePointerCapture(pointerId);pointerId=null;drawStartedAt=0;lastPointer=null;const c=$('targetRangeControl');c?.classList.remove('is-drawing','is-ideal');const f=$('targetRangeFocus');if(f)f.style.width='0%';const fv=$('targetRangeFocusValue');if(fv)fv.textContent='0%';const r=$('targetRangeReticle');r?.style.setProperty('--focus-scale','1');return true;}
  function pointerDown(e){if(!opened||paused||phase!=='playing'||shotBusy||pointerId!=null)return false;if(e.target?.closest&&!e.target.closest('#targetRangeGallery,#targetRangeControl'))return false;pointerId=e.pointerId??'mouse';drawStartedAt=now();lastPointer={x:Number(e.clientX)||0,y:Number(e.clientY)||0};e.currentTarget?.setPointerCapture?.(e.pointerId);e.preventDefault?.();$('targetRangeControl')?.classList.add('is-drawing');return true;}
  function pointerMove(e){if(pointerId==null||(e.pointerId??'mouse')!==pointerId||!lastPointer)return false;const host=$('targetRangeGallery'),rect=host?.getBoundingClientRect?.()||{width:600,height:420};const x=Number(e.clientX)||0,y=Number(e.clientY)||0,dx=(x-lastPointer.x)/Math.max(1,rect.width),dy=(y-lastPointer.y)/Math.max(1,rect.height);aimX=Math.max(.08,Math.min(.94,aimX+dx*1.08));aimY=Math.max(.12,Math.min(.72,aimY+dy*1.02));lastPointer={x,y};renderAim();e.preventDefault?.();return true;}
  function pointerUp(e){if(pointerId==null||(e.pointerId??'mouse')!==pointerId)return false;const focus=core.releaseQuality(core.focusQuality(now()-drawStartedAt,profile()),profile());cancelAim();e.preventDefault?.();return fire(focus);}
  function animateProjectile(proj,solution,{aimX:shotAimX,aimY:shotAimY}={}){
    if(!proj||!solution)return false;
    const started=now(),travel=Number(solution.trajectory?.travelMs)||820,token=generation,g=$('targetRangeGallery')?.getBoundingClientRect(),p=$('targetRangePokemon')?.getBoundingClientRect(),startX=g&&p?(p.x+p.width/2-g.x)/g.width:.5,startY=g&&p?(p.y+p.height*.35-g.y)/g.height:.88;
    proj.className=`target-range-projectile attack-${attackType} is-flying`;
    proj.style.left=`${startX*100}%`;proj.style.top=`${startY*100}%`;proj.style.setProperty('--flight-progress','0');
    const step=t=>{
      if(!opened||token!==generation)return;
      const progress=Math.max(0,Math.min(1,(Number(t)-started)/travel)),point=core.projectileVisualPoint({startX,startY,aimX:shotAimX,aimY:shotAimY,impactX:solution.impactX,impactY:solution.impactY,progress});
      proj.style.left=`${point.x*100}%`;proj.style.top=`${point.y*100}%`;proj.style.setProperty('--flight-progress',String(progress));
      if(progress<1)flightFrame=raf(step);else flightFrame=0;
    };
    flightFrame=raf(step);return true;
  }
  function fire(focus){
    if(!opened||paused||phase!=='playing'||shotBusy||!currentTarget())return false;shotBusy=true;
    const target=currentTarget(),gallery=$('targetRangeGallery'),fieldAspect=gallery?gallery.clientWidth/gallery.clientHeight:1,shotInput={aimX,aimY,firedAtMs:now(),focus,fieldAspect},solution=core.resolveShot({...shotInput,distanceM:target.distanceM,wind:target.wind,spAtk:participant.baseStat,target}),proj=$('targetRangeProjectile');
    $('targetRangePokemon')?.classList.add('is-shooting');$('targetRangeCue').textContent=focus>=.99?'CLEAN RELEASE':'SHOT AWAY';
    animateProjectile(proj,solution,shotInput);
    later(()=>{
      if(!run||phase!=='playing')return;renderTarget(solution.impactAtMs);phase='recovering';stopLoop();
      const result=core.applyShot(run,shotInput);
      if(flightFrame)caf(flightFrame);flightFrame=0;
      if(proj){proj.style.left=`${solution.impactX*100}%`;proj.style.top=`${solution.impactY*100}%`;proj.style.setProperty('--flight-progress','1');proj.classList.remove('is-flying');proj.classList.add('is-impact');later(()=>proj.classList.remove('is-impact'),240);}
      $('targetRangePokemon')?.classList.remove('is-shooting');
      if(result){const label=result.hit.ring==='bullseye'?'BULLSEYE!':result.hit.ring==='miss'?'MISS':`${result.hit.ring.toUpperCase()} · +${result.awarded}`,hitTarget=$('targetRangeTarget');if(result.hit.points>0&&hitTarget){hitTarget.classList.add('is-hit');hitTarget.classList.toggle('is-broken',!!result.broken);later(()=>hitTarget.classList.remove('is-hit','is-broken'),280);}feedback(label,result.goldenWon?'★ GOLDEN TARGET SECURED!':result.hit.points===0?'Settle, then try the next target.':result.broken?'Clean hit.':'Armour held — hit it again.');renderScore();}
      if(run.complete)return later(()=>finishRun(),1200);session()?.update?.('targetRange',{liveLabel:'TARGET',liveValue:`${Math.min(run.currentIndex+1,run.targets.length)}/${run.targets.length}`});later(()=>beginTarget(),1200);
    },solution.trajectory.travelMs);return true;
  }

  async function claimGoldenPrize(){
    if(!run?.goldenWon)return {label:'',reveal:null,pending:false};
    const rr=rareRewards(),bridge=rareBridge(),gift=giftCore();if(!root.state||!rr||!bridge||!gift)return {label:'Prize unavailable',reveal:null,pending:true};
    let attempt=rr.getOrCreateAttempt(root.state,'targetRangeGolden',()=>{const pick=gift.rewardForRoll(Math.random());return {kind:pick.kind,reward:pick.reward,source:'target-range-golden'};});
    try{
      if(!attempt.reward&&['card','pack'].includes(attempt.kind)){const reward=await bridge.resolveArcadeReward?.(attempt.kind);if(!reward)throw new Error('Golden Target reward could not be resolved');attempt=rr.patchAttempt(root.state,'targetRangeGolden',attempt.id,{reward})||attempt;bridge.save?.();}
      if(!attempt.reward)throw new Error('Golden Target reward missing');
      const claim=await rr.claimAttempt(root.state,'targetRangeGolden',attempt.id,reward=>bridge.grantReward?.(reward));bridge.save?.();
      const label=claim?.result?.label||attempt.reward.label||'Golden Target Prize';return {label,reveal:bridge.rewardReveal?.(attempt.reward,claim?.result,'GOLDEN TARGET PRIZE')||null,pending:false};
    }catch(error){console.warn?.('[LuckyDex] Target Range Golden Target prize remains reserved',error);bridge.save?.();return {label:'Golden Target Prize Reserved',reveal:null,pending:true};}
  }
  function tournamentResultPayload(round,rarePrize=null){return {eventId:'targetRange',metric:core.roundMetric(round),raw:{score:round?.score||0,hits:round?.hits||0,shots:round?.shots||0,bullseyes:round?.bullseyes||0,bestCombo:round?.bestCombo||1,bestBullseyeStreak:round?.bestBullseyeStreak||0,longestBullseyeM:round?.longestBullseyeM||0,goldenSeen:round?.goldenSeen||0,goldenWon:round?.goldenWon||0,attackType:round?.attackType||attackType},rareReceipts:rarePrize&&round?.goldenWon?[{source:'targetRangeGolden',label:rarePrize.label||'Golden Target Prize',meta:rarePrize.pending?'Prize reserved safely':'Awarded during this cup',awarded:!rarePrize.pending,reveal:rarePrize.reveal||null,pending:!!rarePrize.pending}]:[]};}
  function commitStats({exhibition=false}={}){
    if(completionHandled||!run?.complete)return null;completionHandled=true;const ps=targetState(),accuracy=run.shots?Math.round(run.hits/run.shots*100):0,newBest=exhibition&&run.score>Number(ps?.bestScores?.[difficulty]||0);
    if(ps){ps.gamesPlayed++;ps.bestScore=Math.max(Number(ps.bestScore)||0,run.score);if(exhibition)ps.bestScores[difficulty]=Math.max(Number(ps.bestScores?.[difficulty])||0,run.score);ps.bestAccuracy=Math.max(Number(ps.bestAccuracy)||0,accuracy);ps.bestBullseyes=Math.max(Number(ps.bestBullseyes)||0,run.bullseyes);ps.bestBullseyeStreak=Math.max(Number(ps.bestBullseyeStreak)||0,run.bestBullseyeStreak||0);ps.longestBullseyeM=Math.max(Number(ps.longestBullseyeM)||0,run.longestBullseyeM||0);ps.goldenTargetsSeen=(Number(ps.goldenTargetsSeen)||0)+(run.goldenSeen||0);ps.goldenTargetsWon=(Number(ps.goldenTargetsWon)||0)+(run.goldenWon||0);ps.totalShots=(Number(ps.totalShots)||0)+run.shots;ps.totalHits=(Number(ps.totalHits)||0)+run.hits;ps.totalBullseyes=(Number(ps.totalBullseyes)||0)+run.bullseyes;ps.lastPokemonKey=participant?.key||ps.lastPokemonKey;}
    const award=exhibition?(platform()?.awardRun?.({gameId:'targetRange',label:'Target Range',score:run.score,coins:Math.max(40,Math.round(run.score*1.5)),dailyEligible:false})||{coinsAwarded:0}):{coinsAwarded:0};saveState();return {accuracy,newBest,award};
  }
  async function finishRun(){
    if(finishPromise)return finishPromise;finishPromise=(async()=>{stopLoop();phase='finished';
      if(tournamentContext){const committed=commitStats();if(!committed)return false;const goldenPrize=await claimGoldenPrize(),payload=tournamentResultPayload(run,goldenPrize),cb=tournamentContext.onComplete;tournamentContext={...tournamentContext,completed:true};if(typeof cb==='function')cb(payload);return payload;}
      const committed=commitStats({exhibition:true});if(!committed)return false;const goldenPrize=await claimGoldenPrize(),payload=tournamentResultPayload(run,goldenPrize),ps=targetState();
      session()?.showResult?.('targetRange',{title:'TARGET RANGE COMPLETE',metricLabel:'SCORE',metricValue:run.score,coinsAwarded:committed.award.coinsAwarded,bestText:goldenPrize.pending?'GOLDEN PRIZE RESERVED':run.goldenWon?'GOLDEN TARGET BULLSEYE':committed.newBest?'NEW BEST SCORE':'',rewardReveals:goldenPrize.reveal?[goldenPrize.reveal]:[],details:[{title:`${participant?.name||'Pokémon'}`,subtitle:`Sp. Atk ${participant?.baseStat||60} · ${core.ATTACKS[attackType]}`,kind:'racer'},{title:`${run.bullseyes} bullseyes`,subtitle:`${committed.accuracy}% accuracy · ${run.longestBullseyeM} m longest · streak ${run.bestBullseyeStreak||0}`,kind:'score'}],review:{title:'TARGET RANGE COMPLETE',mode:'Special Attack Event',difficulty:profile().label,metricLabel:'SCORE',metricValue:String(run.score),stats:[{label:'Pokémon',value:participant?.name||'Pokémon'},{label:'Base Sp. Atk',value:String(participant?.baseStat||60)},{label:'Accuracy',value:`${committed.accuracy}%`},{label:'Bullseyes',value:String(run.bullseyes)},{label:'Best Bullseye Streak',value:String(run.bestBullseyeStreak||0)},{label:'Longest Bullseye',value:`${run.longestBullseyeM||0} m`},...(run.goldenSeen?[{label:'Golden Target',value:run.goldenWon?(goldenPrize.pending?'BULLSEYE · PRIZE RESERVED':`BULLSEYE · ${goldenPrize.label}`):'MISSED'}]:[])],pbs:[{label:`${profile().label} Best`,value:String(ps?.bestScores?.[difficulty]||run.score),isNew:committed.newBest}],rewards:[{label:'Run Reward',value:`${committed.award.coinsAwarded||0} Lucky Coins`},...(run.goldenWon?[{label:'Golden Target Prize',value:goldenPrize.label||'Prize Reserved'}]:[])]},onReplay:()=>startExhibition({difficulty,participant,attackType}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return payload;
    })().finally(()=>{finishPromise=null;});return finishPromise;
  }

  function frame(t){rafId=0;if(!opened||paused||phase!=='playing'||!run)return;renderTarget(t);if(pointerId!=null){const q=core.focusQuality(t-drawStartedAt,profile()),quality=core.releaseQuality(q,profile()),pct=Math.round(q*100);const f=$('targetRangeFocus');if(f)f.style.width=`${pct}%`;const v=$('targetRangeFocusValue');if(v)v.textContent=`${pct}%`;$('targetRangeControl')?.classList.toggle('is-ideal',quality>=.99);$('targetRangeCue').textContent=quality>=.99?'RELEASE · IDEAL':'STEADY · TIME YOUR RELEASE';const r=$('targetRangeReticle');r?.style.setProperty('--focus-scale',String((1-quality*.14).toFixed(3)));}
    schedule();}
  function bind(){if(bound||typeof document==='undefined')return;bound=true;controlNode=$('targetRangePlay');controlNode?.addEventListener('pointerdown',pointerDown);controlNode?.addEventListener('pointermove',pointerMove);controlNode?.addEventListener('pointerup',pointerUp);controlNode?.addEventListener('pointercancel',cancelAim);visibilityHandler=()=>{if(document.hidden){paused=true;cancelAim();stopLoop();}else{paused=false;if(phase==='playing')schedule();}};document.addEventListener('visibilitychange',visibilityHandler);}
  function unbind(){if(!bound)return;controlNode?.removeEventListener('pointerdown',pointerDown);controlNode?.removeEventListener('pointermove',pointerMove);controlNode?.removeEventListener('pointerup',pointerUp);controlNode?.removeEventListener('pointercancel',cancelAim);if(typeof document!=='undefined'&&visibilityHandler)document.removeEventListener('visibilitychange',visibilityHandler);controlNode=null;visibilityHandler=null;bound=false;}
  function open(){cancelFlight();stopLoop();cancelAim();unbind();opened=true;paused=false;phase='setup';run=null;shell();bind();session()?.mount?.('targetRange',$('targetRangeGame'));setPlay(false);return true;}
  function close(){opened=false;paused=false;cancelFlight();stopLoop();cancelAim();unbind();phase='closed';run=null;tournamentContext=null;session()?.hideResult?.();return true;}
  function pause(){paused=true;cancelAim();stopLoop();return true;}function resume(){paused=false;schedule();return true;}
  function snapshot(){return {opened,phase,difficulty,attackType,aimX,aimY,shots:run?.shots||0,lastResult:run?.results?.length?JSON.parse(JSON.stringify(run.results[run.results.length-1])):null,run:run?{score:run.score,currentIndex:run.currentIndex,bullseyes:run.bullseyes,combo:run.combo,goldenWon:run.goldenWon}:null};}
  return Object.freeze({open,close,pause,resume,startExhibition,startGoldenrodRound,tournamentResultPayload,pointerDown,pointerMove,pointerUp,cancelAim,fire,snapshot});
});
