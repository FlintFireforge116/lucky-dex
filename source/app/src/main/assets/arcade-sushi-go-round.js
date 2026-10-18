(function(root,factory){
  const core=root.LuckyDexSushiGoRoundCore||(typeof require==='function'?require('./arcade-sushi-go-round-core.js'):null);
  const api=factory(root,core);root.LuckyDexSushiGoRound=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexSushiGoRoundCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||globalThis.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||globalThis.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const racerIds=['sushiGoRoundPlayer','sushiGoRoundCpu1','sushiGoRoundCpu2','sushiGoRoundCpu3'];
  const ringRadius=[.245,.345,.445];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let opened=false,phase='closed',difficulty='normal',round=null,rafId=0,pausedFrom=null,pauseStartedAt=0,completionHandled=false,finalResult=null,rng=Math.random,tongueTimer=0;

  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&phase==='racing')rafId=raf(frame);}
  function profile(){return core.difficultyProfile(difficulty);}
  function setControls(active){const ready=$('sushiGoRoundReady'),controls=$('sushiGoRoundControls');if(ready)ready.hidden=active;if(controls)controls.hidden=!active;}
  function renderDifficulty(){
    if($('sushiGoRoundDifficultyLabel'))$('sushiGoRoundDifficultyLabel').textContent=profile().label.toUpperCase();
    if(typeof document!=='undefined')for(const btn of document.querySelectorAll?.('[data-sushi-difficulty]')||[]){const active=btn.dataset.sushiDifficulty===difficulty;btn.classList?.toggle?.('active',active);btn.setAttribute?.('aria-pressed',String(active));}
    const best=Number(root.state?.arcade?.sushiGoRound?.bestBills?.[difficulty]||0);if($('sushiGoRoundBest'))$('sushiGoRoundBest').textContent=best?`BEST ¥${best.toLocaleString()}`:'BEST —';
  }
  function plateNode(host,slot,plate){
    let node=host.querySelector?.(`[data-sushi-slot="${slot}"]`);
    if(!node){node=document.createElement('button');node.type='button';node.className='sushi-plate';node.dataset.sushiSlot=String(slot);node.innerHTML='<i aria-hidden="true"></i>';host.appendChild(node);}
    if(node.dataset.plateId!==plate.id){node.dataset.plateId=plate.id;node.setAttribute?.('aria-label',`${plate.name}, ¥${plate.value}`);}
    return node;
  }
  function renderPlates(t){
    const host=$('sushiGoRoundPlates'),conveyor=$('sushiGoRoundConveyor');if(!host||!conveyor||!round)return;
    const diameter=Math.max(160,Number(conveyor.clientWidth)||210),reachable=new Set();
    if(phase==='racing'&&!core.isStunned(round.player,t))for(const row of core.reachablePlates(round,'player',t))reachable.add(row.plate.id);
    for(let slot=0;slot<core.CONFIG.plateCount;slot++){
      const plate=round.plates[slot],existing=host.querySelector?.(`[data-sushi-slot="${slot}"]`);
      if(!plate){existing?.remove?.();continue;}
      const node=plateNode(host,slot,plate),track=core.trackForSlot(slot),angle=core.plateAngleDeg(round,slot,t),rad=angle*Math.PI/180,radius=diameter*ringRadius[track.ring];
      const x=Math.sin(rad)*radius,y=-Math.cos(rad)*radius;
      node.className=`sushi-plate tier-${plate.tier}${plate.hot?' is-hot':''}${reachable.has(plate.id)?' is-reachable':''}`;
      node.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      node.style.zIndex=String(10+Math.round((Math.cos(rad)+1)*3)+track.ring);
      node.setAttribute?.('aria-disabled',String(!reachable.has(plate.id)));
    }
  }

  function returnPlateNode(host,key,plate){
    let node=host.querySelector?.(`[data-return-key="${key}"]`);
    if(!node){node=document.createElement('div');node.className='sushi-plate sushi-return-plate';node.dataset.returnKey=String(key);node.innerHTML='<i aria-hidden="true"></i>';host.appendChild(node);}
    node.className=`sushi-plate sushi-return-plate tier-${plate.tier}${plate.hot?' is-hot':''}`;
    return node;
  }
  function renderReturnLane(t){
    const lane=$('sushiGoRoundReturnLane'),host=$('sushiGoRoundReturnPlates');
    if(!lane||!host||!round)return;
    const h=Math.max(120,Number(lane.clientHeight)||180),seen=new Set(),items=(round.pendingRespawns||[]).slice(0,6);
    for(const item of items){
      if(!item?.plate)continue;
      const key=`${item.slot}-${item.enteredAt}`;
      seen.add(key);
      const node=returnPlateNode(host,key,item.plate);
      const span=Math.max(1,Number(item.dueAt||0)-Number(item.enteredAt||0));
      const prog=clamp((Number(t||0)-Number(item.enteredAt||0))/span,0,1);
      const y=18+prog*(h-36);
      const wobble=Math.sin((prog*3.14159)+(item.slot||0))*(lane.clientWidth>38?4:3);
      node.style.transform=`translate(-50%,-50%) translate3d(${wobble.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      node.style.zIndex=String(5+Math.round(prog*5));
      node.dataset.reason=item.reason||'refresh';
    }
    for(const node of host.querySelectorAll?.('.sushi-return-plate')||[])if(!seen.has(node.dataset.returnKey||''))node.remove?.();
  }

  function renderRacers(t){
    if(!round)return;round.racers.forEach((r,i)=>{const el=$(racerIds[i]);if(!el)return;el.classList?.toggle?.('is-stunned',core.isStunned(r,t));el.classList?.toggle?.('is-player',r.id==='player');const bill=el.querySelector?.('[data-sushi-bill]');if(bill)bill.textContent=`¥${Math.round(r.bill).toLocaleString()}`;const combo=el.querySelector?.('[data-sushi-combo]');if(combo)combo.textContent=r.combo>1?`×${r.combo}`:'×1';});
  }
  function render(t=now()){
    if(!round)return;const place=core.placeFor(round,'player');
    if($('sushiGoRoundPlace'))$('sushiGoRoundPlace').textContent=String(place);if($('sushiGoRoundBill'))$('sushiGoRoundBill').textContent=`¥${Math.round(round.player.bill).toLocaleString()}`;
    renderPlates(t);renderReturnLane(t);renderRacers(t);
    const combo=$('sushiGoRoundCombo');if(combo)combo.textContent=`×${Math.max(1,round.player.combo||1)}`;
    const stun=$('sushiGoRoundStun');if(stun){const hot=core.isStunned(round.player,t);stun.textContent=hot?`${Math.max(0,(round.player.stunnedUntil-t)/1000).toFixed(1)}s`:'READY';stun.classList?.toggle?.('is-hot',hot);}
    const ending=$('sushiGoRoundEnding');if(ending){const remaining=core.remainingMs(round,t);ending.hidden=phase!=='racing'||remaining>10000;ending.textContent=remaining<=0?'TIME!':`LAST ${Math.max(1,Math.ceil(remaining/1000))}!`;}
    session()?.update?.('sushiGoRound',{runText:'1 minute · Tap glowing plates across 3 rings · Chain ×5',rewardText:'Highest bill · Lucky Coins',liveLabel:'BILL',liveValue:`¥${Math.round(round.player.bill).toLocaleString()}`});
  }
  function showReady({difficulty:key=difficulty}={}){
    stopLoop();session()?.hideResult?.();difficulty=core.DIFFICULTIES[key]?key:'normal';phase='idle';round=core.createRound({difficulty,rng,nowMs:now()});pausedFrom=null;completionHandled=false;finalResult=null;setControls(false);renderDifficulty();render();return true;
  }
  function selectDifficulty(key){if(phase==='racing'||phase==='paused')return false;if(!core.DIFFICULTIES[key])return false;difficulty=key;round=core.createRound({difficulty,rng,nowMs:now()});renderDifficulty();render();return true;}
  function startRound(){if(!opened||phase==='racing')return false;session()?.hideResult?.();round=core.createRound({difficulty,rng,nowMs:now()});phase='racing';completionHandled=false;finalResult=null;setControls(true);render();schedule();return true;}
  function animateTongue(node){
    const board=node?.closest?.('.sushi-board'),player=$('sushiGoRoundPlayer'),tongue=$('sushiGoRoundTongue');if(!board||!player||!tongue)return;
    const br=board.getBoundingClientRect?.(),pr=player.querySelector?.('img')?.getBoundingClientRect?.(),tr=node.getBoundingClientRect?.();if(!br||!pr||!tr)return;
    const x1=pr.left+pr.width/2-br.left,y1=pr.top+pr.height*.38-br.top,x2=tr.left+tr.width/2-br.left,y2=tr.top+tr.height/2-br.top,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),deg=Math.atan2(dy,dx)*180/Math.PI;
    tongue.style.left=`${x1}px`;tongue.style.top=`${y1}px`;tongue.style.width=`${len}px`;tongue.style.transform=`rotate(${deg}deg)`;tongue.hidden=false;tongue.classList.remove('lick');void tongue.offsetWidth;tongue.classList.add('lick');clearTimeout(tongueTimer);tongueTimer=setTimeout(()=>{tongue.hidden=true;tongue.classList.remove('lick');},190);
  }
  function feedbackFor(out){
    if(!out?.accepted)return;const fx=$('sushiGoRoundFeedback');if(fx){fx.hidden=false;fx.textContent=out.hot?'HOT!':`+¥${out.gain.toLocaleString()}${out.multiplier>1?` · ×${out.multiplier}`:''}`;fx.classList.remove('pop');void fx.offsetWidth;fx.classList.add('pop');setTimeout(()=>{if(fx)fx.hidden=true;},650);}root.navigator?.vibrate?.(out.hot?[40,35,70]:18);
  }
  function eatPlateById(plateId,node){
    if(phase!=='racing'||!round)return {accepted:false,reason:'inactive'};const t=now();core.advanceRound(round,t,rng);const out=core.eatPlate(round,'player',plateId,t);if(out.accepted){animateTongue(node);feedbackFor(out);}render(t);if(round.finalized)finishRound(t);return out;
  }
  function eatBestReachable(){
    if(phase!=='racing'||!round)return {accepted:false,reason:'inactive'};const t=now(),choices=core.reachablePlates(round,'player',t);if(!choices.length)return {accepted:false,reason:'out-of-reach'};const multiplierFor=p=>round.player.lastType===p.type?Math.min(core.CONFIG.comboCap,(round.player.combo||0)+1):1;choices.sort((a,b)=>b.plate.value*multiplierFor(b.plate)-a.plate.value*multiplierFor(a.plate));const chosen=choices[0],node=$('sushiGoRoundPlates')?.querySelector?.(`[data-plate-id="${chosen.plate.id}"]`);return eatPlateById(chosen.plate.id,node);
  }
  function shiftRound(delta){if(!round||!delta)return;round.startedAt+=delta;round.endsAt+=delta;for(const item of round.pendingRespawns||[]){item.enteredAt+=delta;item.dueAt+=delta;}for(const r of round.racers){if(r.stunnedUntil)r.stunnedUntil+=delta;if(r.lastEatAt!=null)r.lastEatAt+=delta;}}
  function pause(){if(phase!=='racing')return false;pauseStartedAt=now();pausedFrom='racing';phase='paused';stopLoop();if($('sushiGoRoundPauseOverlay'))$('sushiGoRoundPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused'||pausedFrom!=='racing')return false;const t=now(),delta=Math.max(0,t-pauseStartedAt);shiftRound(delta);phase='racing';pausedFrom=null;if($('sushiGoRoundPauseOverlay'))$('sushiGoRoundPauseOverlay').hidden=true;render(t);schedule();return true;}
  function frame(){rafId=0;if(phase!=='racing')return;const t=now();core.advanceRound(round,t,rng);if(round.finalized)finishRound(t);else{render(t);schedule();}}
  function finishRound(t=now()){
    if(finalResult)return finalResult;if(!round)return null;const ranking=core.finalizeRound(round,t),place=core.placeFor(round,'player'),player=round.player,reward=core.rewardFor(place,difficulty);
    finalResult={place,reward,difficulty,bill:player.bill,bestCombo:player.bestCombo,eaten:player.eaten,hotPenalties:player.hotPenalties,ranking:ranking.map(r=>r.id)};phase='finished';stopLoop();setControls(false);render(t);
    if(completionHandled)return finalResult;completionHandled=true;
    const p=platform();if(!root.state||!p?.ensureArcadeState)return finalResult;root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.sushiGoRound,prevBest=Number(rec.bestBills?.[difficulty]||0),prevCombo=Number(rec.bestCombo||0);
    rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;if(place===1){rec.wins=Number(rec.wins||0)+1;rec.winsByDifficulty[difficulty]=Number(rec.winsByDifficulty?.[difficulty]||0)+1;}if(place<=3)rec.podiums=Number(rec.podiums||0)+1;
    rec.bestBill=Math.max(Number(rec.bestBill||0),Number(player.bill||0));rec.bestBills[difficulty]=Math.max(Number(rec.bestBills?.[difficulty]||0),Number(player.bill||0));rec.bestCombo=Math.max(Number(rec.bestCombo||0),Number(player.bestCombo||0));rec.totalSushiEaten=Number(rec.totalSushiEaten||0)+Number(player.eaten||0);rec.hotPenalties=Number(rec.hotPenalties||0)+Number(player.hotPenalties||0);
    const award=p.awardRun?.({gameId:'sushiGoRound',label:'Sushi-Go-Round',score:Math.max(0,5-place),coins:reward})||{coinsAwarded:reward};root.save?.();
    const ordinal=place===1?'1ST':place===2?'2ND':place===3?'3RD':'4TH',scoreboard=ranking.map((r,i)=>({rank:String(i+1),label:r.id==='player'?'YOU':r.label,value:`¥${Math.round(r.bill).toLocaleString()}`,subtitle:`${r.eaten} EATEN · BEST ×${r.bestCombo||1}`,player:r.id==='player'}));
    const review={title:place===1?'SUSHI CHAMPION!':'BILL SETTLED',mode:'Sushi-Go-Round',difficulty:profile().label,metricLabel:'PLACE',metricValue:ordinal,scoreboard,stats:[{label:'Your Bill',value:`¥${Math.round(player.bill).toLocaleString()}`},{label:'Sushi Eaten',value:String(player.eaten||0)},{label:'Best Chain',value:`×${player.bestCombo||1}`},{label:'Hot Tea',value:String(player.hotPenalties||0)}],pbs:[{label:`${profile().label} Best Bill`,value:`¥${Math.round(rec.bestBills[difficulty]||0).toLocaleString()}`,isNew:Number(player.bill||0)>prevBest},{label:'Best Combo',value:`×${rec.bestCombo||0}`,isNew:Number(player.bestCombo||0)>prevCombo}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)}]};
    session()?.showResult?.('sushiGoRound',{title:place===1?'SUSHI CHAMPION!':'BILL SETTLED',metricLabel:'PLACE',metricValue:ordinal,coinsAwarded:award.coinsAwarded,bestText:`BEST ¥${Math.round(rec.bestBill||0).toLocaleString()}`,review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady({difficulty}),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
    return finalResult;
  }
  function open(){opened=true;session()?.mount?.('sushiGoRound',$('sushiGoRoundGame'));showReady({difficulty:'normal'});return true;}
  function close(){opened=false;stopLoop();phase='closed';round=null;pausedFrom=null;completionHandled=false;finalResult=null;clearTimeout(tongueTimer);setControls(false);if($('sushiGoRoundPauseOverlay'))$('sushiGoRoundPauseOverlay').hidden=true;return true;}
  function keydown(e){if(e?.repeat)return false;const k=String(e?.key||'').toLowerCase();if(!['a',' ','enter'].includes(k))return false;const out=eatBestReachable();if(out?.accepted)e?.preventDefault?.();return !!out?.accepted;}
  function snapshot(){return {phase,difficulty,place:round?core.placeFor(round,'player'):null,remainingMs:round?core.remainingMs(round,now()):0,player:round?{bill:round.player.bill,eaten:round.player.eaten,combo:round.player.combo,bestCombo:round.player.bestCombo,hotPenalties:round.player.hotPenalties}:null,plates:(round?.plates||[]).map((p,slot)=>p?{...p,ring:core.trackForSlot(slot).ring}:null),finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};}
  function wire(){
    if(typeof document==='undefined')return;
    $('sushiGoRoundStart')?.addEventListener?.('click',startRound);$('sushiGoRoundResume')?.addEventListener?.('click',resume);
    $('sushiGoRoundPlates')?.addEventListener?.('pointerdown',e=>{const node=e.target?.closest?.('.sushi-plate');if(!node)return;e.preventDefault?.();const plateId=node.dataset.plateId;if(plateId)eatPlateById(plateId,node);});
    for(const btn of document.querySelectorAll?.('[data-sushi-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.sushiDifficulty));
    document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});
  }
  wire();return {open,close,showReady,startRound,eatPlateById,eatBestReachable,pause,resume,finishRound,selectDifficulty,snapshot};
});
