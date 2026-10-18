(function(root,factory){
  const core=root.LuckyDexWailordWaterSpoutCore||(typeof require==='function'?require('./arcade-wailord-water-spout-core.js'):null);
  const api=factory(root,core);root.LuckyDexWailordWaterSpout=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core){
  'use strict';
  if(!core)throw new Error('LuckyDexWailordWaterSpoutCore required');
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const raf=fn=>(root.requestAnimationFrame||((f)=>setTimeout(()=>f(now()),16)))(fn);
  const caf=id=>(root.cancelAnimationFrame||clearTimeout)(id);
  const session=()=>root.LuckyDexArcadeSession||globalThis.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform;
  const rareRewards=()=>root.LuckyDexArcadeRareRewards||globalThis.LuckyDexArcadeRareRewards;
  const rareBridge=()=>root.LuckyDexRareRewardBridge||globalThis.LuckyDexRareRewardBridge;
  const giftCore=()=>root.LuckyDexVoltorbGiftCore||globalThis.LuckyDexVoltorbGiftCore;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  let opened=false,phase='closed',difficulty='normal',run=null,balls=[],pokemon=[],wailordX=.5,rafId=0,lastFrame=0,completionHandled=false,finalResult=null,rng=Math.random,pressed=new Set(),flash=null,flashUntil=0,ballsDirty=true,pokemonSignature='';

  function profile(){return core.difficultyProfile(difficulty);}
  function rareRate(){return clamp(root.state?.settings?.rareOdds?.wailordRainbowBall??core.CONFIG.rainbowRate,0,1);}
  function stopLoop(){if(rafId){caf(rafId);rafId=0;}}
  function schedule(){if(!rafId&&phase==='running')rafId=raf(frame);}
  function resetPokemonEntity(spec,{initial=false}={}){
    const spread=initial?.05:.20,p={id:spec.id,dex:spec.dex,label:spec.label,colour:spec.colour,active:false,joined:false,held:false,holdOffset:0,x:clamp(wailordX+(rng()-.5)*spread,.08,.92),y:initial?.69:.58,vx:(rng()-.5)*.05,vy:.10+rng()*.05,rotation:0,fallFlashUntil:0};
    return p;
  }
  function buildPokemon(){return core.SPECIES.map((spec,i)=>resetPokemonEntity(spec,{initial:i===0}));}
  function spawnBall(forceRainbow=false){
    const candidate=core.makeBall(run,rng,{forceRainbow});
    for(let tries=0;tries<8;tries++){
      const crowded=balls.some(b=>Math.hypot(b.x-candidate.x,b.y-candidate.y)<profile().ballRadius*2.25);
      if(!crowded)break;candidate.x=.11+rng()*.78;candidate.y=.11+rng()*.40;
    }
    candidate.cooldownUntil=0;return candidate;
  }
  function refillBalls(){let changed=false;while(balls.length<profile().ballCount){balls.push(spawnBall(false));changed=true;}if(changed)ballsDirty=true;}
  function showReady(next=difficulty){
    difficulty=core.DIFFICULTIES[next]?next:'normal';phase='ready';run=null;balls=[];pokemon=[];wailordX=.5;ballsDirty=true;pokemonSignature='';completionHandled=false;finalResult=null;flash=null;stopLoop();pressed.clear();
    const ready=$('wailordReady');if(ready)ready.hidden=false;const pause=$('wailordPauseOverlay');if(pause)pause.hidden=true;
    document.querySelectorAll?.('[data-wailord-difficulty]')?.forEach(btn=>{const on=btn.dataset.wailordDifficulty===difficulty;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',on?'true':'false');});
    const meta=$('wailordReadyMeta');if(meta)meta.textContent=`${profile().label.toUpperCase()} · 90 SECONDS · 15 TO CLEAR`;
    renderAll();return true;
  }
  function selectDifficulty(key){if(phase!=='ready'||!core.DIFFICULTIES[key])return false;return showReady(key);}
  function startRun(){
    if(!opened||phase!=='ready')return false;session()?.hideResult?.();run=core.createRun({difficulty,rng,rainbowRate:rareRate()});balls=[];pokemon=buildPokemon();wailordX=.5;ballsDirty=true;pokemonSignature='';refillBalls();phase='running';lastFrame=now();completionHandled=false;finalResult=null;flash=null;const ready=$('wailordReady');if(ready)ready.hidden=true;renderAll();schedule();return true;
  }
  function keyboardMove(dt){const dir=(pressed.has('arrowright')?1:0)-(pressed.has('arrowleft')?1:0);if(!dir)return;wailordX=clamp(wailordX+dir*profile().moveSpeed*dt,.12,.88);}
  function activatePokemon(){
    const ids=new Set(core.availableSpecies(run?.elapsedMs||0).map(x=>x.id));
    for(const p of pokemon){if(ids.has(p.id)&&!p.joined){p.joined=true;p.active=true;p.x=clamp(wailordX+(rng()-.5)*.08,.1,.9);p.y=.64;p.vx=(rng()-.5)*.04;p.vy=.10;flash=`${p.label.toUpperCase()} JOINED!`;flashUntil=now()+1000;}}
  }
  function maybeSpawnRainbow(){if(!run?.rainbowEvent||run.rainbowSpawned||run.elapsedMs<run.rainbowSpawnMs)return;const replace=Math.floor(rng()*Math.max(1,balls.length));balls.splice(replace,1,spawnBall(true));ballsDirty=true;flash='✦ RAINBOW DREAM BALL! ✦';flashUntil=now()+1400;}
  function resetAfterFall(p,t){
    core.registerFall(run,p.id);p.held=false;p.holdOffset=0;p.x=clamp(wailordX+(rng()-.5)*.34,.08,.92);p.y=.55;p.vx=(rng()-.5)*.06;p.vy=.08;p.rotation=0;p.fallFlashUntil=t+550;flash=`${p.label.toUpperCase()} SPLASH! · COMBO RESET`;flashUntil=t+900;
  }
  function catchOnSpout(p){
    const half=profile().catchWidth/2,dx=p.x-wailordX;if(p.held||p.vy<=0||p.y<core.CONFIG.catchY-.035||p.y>core.CONFIG.catchY+.055||Math.abs(dx)>half)return false;
    p.held=true;p.holdOffset=clamp(dx,-half,half);p.x=clamp(wailordX+p.holdOffset,.045,.955);p.y=core.CONFIG.catchY-.025;p.vx=0;p.vy=0;p.rotation=0;flash=`${p.label.toUpperCase()} READY · TAP SHOOT`;flashUntil=now()+650;return true;
  }
  function shootHeldPokemon(){
    if(phase!=='running')return false;const half=profile().catchWidth/2,held=pokemon.filter(p=>p.active&&p.held);if(!held.length){flash='CATCH A POKÉMON ON THE SPOUT FIRST';flashUntil=now()+650;return false;}
    for(const p of held){const vec=core.launchVector(clamp(p.holdOffset/Math.max(.001,half),-1,1),difficulty);p.held=false;p.x=clamp(wailordX+p.holdOffset,.045,.955);p.y=core.CONFIG.catchY-.04;p.vx=vec.vx;p.vy=vec.vy;p.rotation=0;}
    flash=held.length>1?`WATER SPOUT! · ${held.length} POKÉMON LAUNCHED`:'WATER SPOUT!';flashUntil=now()+520;return true;
  }
  function ballCollision(p,b,t){const radius=profile().ballRadius+.032;if(t<(b.cooldownUntil||0)||Math.hypot(p.x-b.x,p.y-b.y)>radius)return false;const out=core.hitBall(run,p.id,b);if(out.opened){const i=balls.indexOf(b);if(i>=0)balls.splice(i,1);balls.push(spawnBall(false));ballsDirty=true;p.vy=Math.max(.12,Math.abs(p.vy)*.42);p.vx*=.72;flash=out.rainbow?`RAINBOW OPEN! · +${out.scoreAdded}`:`${p.label.toUpperCase()} · +${out.scoreAdded} · ×${run.multiplier}`;flashUntil=t+(out.rainbow?1300:520);return true;}b.cooldownUntil=t+360;p.vy=Math.max(.10,Math.abs(p.vy)*.35);p.vx*=-.45;flash=`${p.label.toUpperCase()} NEEDS ${String(b.colour).toUpperCase()}`;flashUntil=t+460;return false;}
  function stepPokemon(dt,t){
    for(const p of pokemon){if(!p.active)continue;if(p.held){p.x=clamp(wailordX+p.holdOffset,.045,.955);p.y=core.CONFIG.catchY-.025;p.vx=0;p.vy=0;p.rotation=0;continue;}p.vy+=profile().gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rotation=clamp(p.vx*48,-28,28);if(p.x<.035){p.x=.035;p.vx=Math.abs(p.vx)*.72;}else if(p.x>.965){p.x=.965;p.vx=-Math.abs(p.vx)*.72;}if(p.y<.035){p.y=.035;p.vy=Math.abs(p.vy)*.34;}if(catchOnSpout(p))continue;for(const b of [...balls]){if(ballCollision(p,b,t))break;}if(p.y>core.CONFIG.waterY)resetAfterFall(p,t);}
  }
  function tick(dt,t){if(!run)return;run.elapsedMs=Math.min(core.CONFIG.durationMs,run.elapsedMs+dt*1000);keyboardMove(dt);activatePokemon();maybeSpawnRainbow();stepPokemon(dt,t);if(run.elapsedMs>=core.CONFIG.durationMs){run.complete=true;void finishRun();}}
  function renderHud(){
    const remaining=Math.max(0,core.CONFIG.durationMs-(run?.elapsedMs||0)),secs=Math.ceil(remaining/1000);if($('wailordTimer'))$('wailordTimer').textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;if($('wailordOpened'))$('wailordOpened').textContent=`${run?.openedBalls||0}/15`;if($('wailordCombo'))$('wailordCombo').textContent=`×${run?.multiplier||1}`;if($('wailordScore'))$('wailordScore').textContent=Number(run?.score||0).toLocaleString('en-GB');
    const rec=root.state?.arcade?.wailordWaterSpout;if($('wailordBest'))$('wailordBest').textContent=`BEST ${Number(rec?.bestBallsByDifficulty?.[difficulty]||0)} BALLS`;
  }
  function renderWailord(){const w=$('wailordActor');if(w)w.style.left=`${(wailordX*100).toFixed(2)}%`;const s=$('wailordSpout');if(s)s.style.left=`${(wailordX*100).toFixed(2)}%`;const shoot=$('wailordShoot'),held=pokemon.filter(p=>p.active&&p.held).length;if(shoot){shoot.disabled=phase!=='running'||held===0;shoot.textContent=held>1?`SHOOT ×${held}`:'SHOOT';}}
  function renderBalls(){const host=$('wailordBalls');if(!host||!ballsDirty)return;host.innerHTML=balls.map(b=>`<div class="wailord-ball ${b.rainbow?'wailord-rainbow-ball':`wailord-ball-${b.colour}`}" style="left:${(b.x*100).toFixed(2)}%;top:${(b.y*100).toFixed(2)}%;--ball-size:${Math.round(profile().ballRadius*460)}px" aria-label="${b.rainbow?'Rainbow Dream Ball':`${b.colour} ball`}"><i></i></div>`).join('');ballsDirty=false;}
  function renderPokemon(){const host=$('wailordPokemon');if(!host)return;const active=pokemon.filter(p=>p.active),sig=active.map(p=>p.id).join('|');if(sig!==pokemonSignature){host.innerHTML=active.map(p=>`<div class="wailord-pokemon" data-wailord-pokemon="${p.id}"><img src="arcade/sprites/pokemon/${p.dex}.png" alt="${p.label}" draggable="false"></div>`).join('');pokemonSignature=sig;}const t=now();for(const p of active){const node=host.querySelector?.(`[data-wailord-pokemon="${p.id}"]`);if(!node)continue;node.style.left=`${(p.x*100).toFixed(2)}%`;node.style.top=`${(p.y*100).toFixed(2)}%`;node.style.transform=`translate(-50%,-50%) rotate(${p.rotation.toFixed(1)}deg)`;node.classList.toggle('is-splash',p.fallFlashUntil>t);}}
  function renderStatus(){const s=$('wailordStatus');if(!s)return;s.hidden=phase!=='running';if(s.hidden)return;const held=pokemon.filter(p=>p.active&&p.held);if(flash&&now()<flashUntil)s.textContent=flash;else if(run?.goalReached)s.textContent='CLEAR TARGET REACHED · KEEP SCORING!';else if(held.length)s.textContent=`${held.map(p=>p.label.toUpperCase()).join(' + ')} READY · TAP SHOOT`;else s.textContent='HOLD ◀ ▶ · CATCH THEM ON THE SPOUT · TAP SHOOT';}
  function renderLegend(){for(const spec of core.SPECIES){const n=$(`wailordLegend${spec.label}`);if(n)n.classList.toggle('is-active',!!run&&run.elapsedMs>=spec.unlockMs);}}
  function renderAll(){renderHud();renderWailord();renderBalls();renderPokemon();renderStatus();renderLegend();}
  function frame(t){rafId=0;if(phase!=='running')return;const dt=Math.min(.04,Math.max(0,(t-lastFrame)/1000||0));lastFrame=t;tick(dt,t);if(phase==='running'){renderAll();schedule();}}
  function pause(){if(phase!=='running')return false;phase='paused';stopLoop();pressed.clear();if($('wailordPauseOverlay'))$('wailordPauseOverlay').hidden=false;return true;}
  function resume(){if(phase!=='paused')return false;phase='running';lastFrame=now();if($('wailordPauseOverlay'))$('wailordPauseOverlay').hidden=true;renderAll();schedule();return true;}
  async function claimRainbowPrize(){
    if(!run?.rainbowOpened)return {label:'',reveal:null,pending:false};const rr=rareRewards(),bridge=rareBridge(),gift=giftCore();if(!root.state||!rr||!bridge||!gift)return {label:'Rainbow Prize Reserved',reveal:null,pending:true};
    let attempt=rr.getOrCreateAttempt(root.state,'wailordRainbowBall',()=>{const pick=gift.rewardForRoll(rng());return {kind:pick.kind,reward:pick.reward,source:'wailord-rainbow-ball'};});
    try{if(!attempt.reward&&['card','pack'].includes(attempt.kind)){const reward=await bridge.resolveArcadeReward?.(attempt.kind);if(!reward)throw new Error('Rainbow Dream Ball reward could not be resolved');attempt=rr.patchAttempt(root.state,'wailordRainbowBall',attempt.id,{reward})||attempt;bridge.save?.();}if(!attempt.reward)throw new Error('Rainbow Dream Ball reward missing');const claim=await rr.claimAttempt(root.state,'wailordRainbowBall',attempt.id,r=>bridge.grantReward?.(r));bridge.save?.();return {label:claim?.result?.label||attempt.reward.label||'Dream Prize',reveal:bridge.rewardReveal?.(attempt.reward,claim?.result,'RAINBOW DREAM BALL')||null,pending:false};}
    catch(error){console.warn?.('[LuckyDex] Rainbow Dream Ball prize remains reserved',error);bridge.save?.();return {label:'Rainbow Prize Reserved',reveal:null,pending:true};}
  }
  async function finishRun(){
    if(finalResult)return finalResult;if(!run)return null;phase='finishing';stopLoop();pressed.clear();const p=platform();if(!root.state||!p?.ensureArcadeState)return null;root.state.arcade=p.ensureArcadeState(root.state.arcade);const rec=root.state.arcade.wailordWaterSpout,prevBalls=Number(rec.bestBallsByDifficulty?.[difficulty]||0),prevScore=Number(rec.bestScores?.[difficulty]||0),prevCombo=Number(rec.bestCombo||0),prize=await claimRainbowPrize();
    const openedBalls=run.openedBalls,score=core.finalScore(run),cleared=run.goalReached,perfectClear=cleared&&run.falls===0,reward=core.rewardForRun(run);
    rec.gamesPlayed=Number(rec.gamesPlayed||0)+1;if(cleared)rec.clears=Number(rec.clears||0)+1;if(cleared&&difficulty==='hard')rec.hardClears=Number(rec.hardClears||0)+1;if(perfectClear)rec.perfectClears=Number(rec.perfectClears||0)+1;rec.bestScore=Math.max(Number(rec.bestScore||0),score);rec.bestScores[difficulty]=Math.max(Number(rec.bestScores?.[difficulty]||0),score);rec.bestBalls=Math.max(Number(rec.bestBalls||0),openedBalls);rec.bestBallsByDifficulty[difficulty]=Math.max(Number(rec.bestBallsByDifficulty?.[difficulty]||0),openedBalls);rec.bestCombo=Math.max(Number(rec.bestCombo||0),run.bestCombo);rec.maxMultiplier=Math.max(Number(rec.maxMultiplier||0),Number(run.maxMultiplier||run.multiplier||1));rec.totalBallsOpened=Number(rec.totalBallsOpened||0)+openedBalls;rec.totalFalls=Number(rec.totalFalls||0)+run.falls;if(run.rainbowSeen)rec.rainbowBallsSeen=Number(rec.rainbowBallsSeen||0)+1;if(run.rainbowOpened)rec.rainbowBallsOpened=Number(rec.rainbowBallsOpened||0)+1;if(run.rainbowOpened&&!prize.pending)rec.rainbowPrizes=Number(rec.rainbowPrizes||0)+1;
    const award=p.awardRun?.({gameId:'wailordWaterSpout',label:'Wailord’s Water Spout',score,coins:reward})||{coinsAwarded:reward};root.save?.();finalResult={openedBalls,score,cleared,perfectClear,bestCombo:run.bestCombo,falls:run.falls,reward:award.coinsAwarded||0,prize:prize.label||''};phase='finished';if(completionHandled)return finalResult;completionHandled=true;
    const title=perfectClear?'PERFECT WATER SPOUT!':cleared?'DREAM WORLD CLEAR!':'TIME UP!';const stats=[{label:'Balls Opened',value:`${openedBalls} / 15`},{label:'Final Score',value:score.toLocaleString('en-GB')},{label:'Best Combo',value:`×${run.bestCombo}`},{label:'Falls',value:String(run.falls)},{label:'Max Multiplier',value:`×${run.maxMultiplier||run.multiplier||1}`},{label:'Rainbow Ball',value:run.rainbowOpened?(prize.pending?'OPENED · PRIZE RESERVED':`OPENED · ${prize.label}`):run.rainbowSeen?'MISSED':'—'}];
    const review={title,mode:'Dream World · Wailord’s Water Spout',difficulty:profile().label,metricLabel:'SCORE',metricValue:score.toLocaleString('en-GB'),stats,pbs:[{label:`${profile().label} Balls`,value:String(rec.bestBallsByDifficulty[difficulty]),isNew:openedBalls>prevBalls},{label:`${profile().label} Score`,value:Number(rec.bestScores[difficulty]||0).toLocaleString('en-GB'),isNew:score>prevScore},{label:'Best Combo',value:`×${rec.bestCombo||0}`,isNew:run.bestCombo>prevCombo}],rewards:[{label:'Lucky Coins',value:String(award.coinsAwarded||0)},...(prize.label?[{label:'Rainbow Dream Ball',value:prize.label}]:[])]};
    session()?.showResult?.('wailordWaterSpout',{title,metricLabel:'SCORE',metricValue:score.toLocaleString('en-GB'),coinsAwarded:award.coinsAwarded,bestText:prize.pending?'RAINBOW PRIZE RESERVED':prize.label?`RAINBOW BALL · ${prize.label}`:`BEST ${rec.bestBalls} BALLS`,rewardReveals:prize.reveal?[prize.reveal]:[],review,replayLabel:'PLAY AGAIN',onReplay:()=>showReady(difficulty),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return finalResult;
  }
  function open(){opened=true;session()?.mount?.('wailordWaterSpout',$('wailordWaterSpoutGame'));showReady(difficulty);return true;}
  function close(){opened=false;stopLoop();phase='closed';run=null;balls=[];pokemon=[];ballsDirty=true;pokemonSignature='';pressed.clear();completionHandled=false;finalResult=null;if($('wailordPauseOverlay'))$('wailordPauseOverlay').hidden=true;return true;}
  function keydown(e){const key=String(e?.key||'').toLowerCase();if([' ','enter'].includes(key)){if(phase==='running'){e?.preventDefault?.();shootHeldPokemon();}return;}if(!['arrowleft','arrowright'].includes(key))return;pressed.add(key);if(phase==='running')e?.preventDefault?.();}
  function keyup(e){pressed.delete(String(e?.key||'').toLowerCase());}
  function bindHold(id,key){const el=$(id);if(!el)return;const down=e=>{e.preventDefault?.();pressed.add(key);};const up=()=>pressed.delete(key);el.addEventListener?.('pointerdown',down);el.addEventListener?.('pointerup',up);el.addEventListener?.('pointercancel',up);el.addEventListener?.('pointerleave',up);}
  function snapshot(){return {phase,difficulty,wailordX,run:core.snapshot(run),balls:JSON.parse(JSON.stringify(balls||[])),pokemon:JSON.parse(JSON.stringify(pokemon||[])),finalResult:finalResult?JSON.parse(JSON.stringify(finalResult)):null};}
  function wire(){if(typeof document==='undefined')return;$('wailordStart')?.addEventListener?.('click',startRun);$('wailordResume')?.addEventListener?.('click',resume);$('wailordShoot')?.addEventListener?.('click',shootHeldPokemon);for(const btn of document.querySelectorAll?.('[data-wailord-difficulty]')||[])btn.addEventListener?.('click',()=>selectDifficulty(btn.dataset.wailordDifficulty));bindHold('wailordLeft','arrowleft');bindHold('wailordRight','arrowright');document.addEventListener?.('keydown',keydown,{capture:true});document.addEventListener?.('keyup',keyup,{capture:true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});}
  wire();return {open,close,showReady,startRun,shootHeldPokemon,pause,resume,finishRun,selectDifficulty,snapshot,_setRng:fn=>{if(typeof fn==='function')rng=fn;}};
});
