(function(root){
  'use strict';
  const core=root.LuckyDexPokemonSeekCore,data=root.LuckyDexPokemonSeekLocations;
  if(!core||!data)throw new Error('Pokémon Seek core and locations required');
  const $=id=>typeof document==='undefined'?null:document.getElementById(id);
  const nodes=selector=>typeof document==='undefined'?[]:document.querySelectorAll(selector);
  const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
  const session=()=>root.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform;
  const prizes=()=>root.LuckyDexPokemonSeekPrizes;
  const text=(id,value)=>{const n=$(id);if(n)n.textContent=String(value);};
  const hidden=(id,value)=>{const n=$(id);if(n)n.hidden=value;};
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let opened=false,phase='closed',difficulty='normal',areaId='manor',run=null,owner=null,frameId=0,lastFrame=0,revealTimer=0,finishPromise=null,finalResult=null,rng=Math.random,flash='',hintNext=null,token=0,renderedScene='';
  function stop(){if(frameId){(root.cancelAnimationFrame||clearTimeout)(frameId);frameId=0;}}
  function clearReveal(){if(revealTimer){clearTimeout(revealTimer);revealTimer=0;}hidden('pokemonSeekReveal',true);}
  function schedule(){if(!frameId&&phase==='running')frameId=(root.requestAnimationFrame||(fn=>setTimeout(()=>fn(now()),16)))(frame);}
  function rareRate(){return Math.max(0,Math.min(1,Number(root.state?.settings?.rareOdds?.pokemonSeekDreamSparkle??core.CONFIG.dreamRate)));}
  function showReady(next=difficulty){
    token++;stop();clearReveal();difficulty=core.DIFFICULTIES[next]?next:'normal';phase='ready';run=null;finishPromise=null;finalResult=null;hintNext=null;flash='Choose an area, then start your search.';renderedScene='';renderAll();return true;
  }
  function selectDifficulty(key){if(phase!=='ready'||!core.DIFFICULTIES[key])return false;return showReady(key);}
  function selectArea(id){if(phase!=='ready'||!data.AREAS.some(a=>a.id===id))return false;areaId=id;renderedScene='';renderAll();return true;}
  function startRun(){
    if(!opened||phase!=='ready')return false;
    owner=root.state;if(!owner||!platform()?.ensureArcadeState)return false;
    owner.arcade=platform().ensureArcadeState(owner.arcade);
    session()?.hideResult?.();session()?.beginRun?.('pokemonSeek');
    run=core.createRun({areaId,difficulty,rng,dreamRate:rareRate()});phase='running';finishPromise=null;finalResult=null;lastFrame=now();flash='Tap a visible spot, then SEARCH. Listen for a route clue.';renderedScene='';renderAll();schedule();return true;
  }
  function frame(t){
    frameId=0;if(phase!=='running'||!run)return;
    core.advanceTime(run,Math.max(0,t-lastFrame));lastFrame=t;
    if(run.complete){void finishRun();return;}renderHud();schedule();
  }
  function move(destination){
    if(phase!=='running'||!core.move(run,destination))return false;
    hintNext=null;flash='Choose a visible search spot.';renderedScene='';renderAll();return true;
  }
  function listen(){if(phase!=='running')return false;const hint=core.listenHint(run);flash=hint.message;hintNext=hint.nextId;renderAll();return hint;}
  function selectSpot(id){if(phase!=='running'||!core.selectSpot(run,id))return false;flash='Ready to search '+core.currentRoom(run).spots.find(s=>s.id===id).label+'.';renderInteraction();renderStatus();return true;}
  function showReveal(result){
    const img=$('pokemonSeekRevealSprite');if(img){img.src='arcade/sprites/pokemon/'+result.pokemon.dex+'.png';img.alt=result.pokemon.label;}
    text('pokemonSeekRevealTitle',result.foundTarget?'FOUND '+result.pokemon.label.toUpperCase()+'!':result.pokemon.label+' · NOT OUR TARGET');
    hidden('pokemonSeekReveal',false);
  }
  function reserveDream(){
    if(!run||run.dreamRecorded)return;run.dreamRecorded=true;
    const rec=owner.arcade.pokemonSeek;rec.dreamSparklesFound++;rec.dreamSparklesSeen++;run.dreamSeenRecorded=true;
    // Reserve/save before starting asynchronous delivery. Closing never cancels it.
    run.prizeAttempt=prizes()?.reserve(owner,rng)||null;root.save?.();
    if(run.prizeAttempt){const captured=run;void prizes().deliver(owner,run.prizeAttempt).then(prize=>{captured.prize=prize;if(run===captured&&opened&&phase==='running'){flash=prize.pending?'Dream prize reserved. Retry on your next visit.':'Dream Sparkle · '+prize.label;renderStatus();}});}
  }
  function searchSelected(){
    if(phase!=='running'||!run)return {accepted:false};const result=core.search(run);if(!result.accepted)return result;
    if(result.kind==='dream'){reserveDream();flash='Dream Sparkle found · prize saved safely!';}
    else if(result.kind==='item')flash='Lost berry found · +5,000 bonus points.';
    else if(result.kind==='clue')flash=result.message;
    else if(result.kind==='empty')flash='Nothing here. Try another spot or follow a sound.';
    if(result.pokemon){
      phase='reveal';stop();showReveal(result);flash=result.foundTarget?'You found the lost Pokémon!':'A decoy! The clock pauses briefly while it slips away.';
      const captured=run,capturedToken=token;
      revealTimer=setTimeout(()=>{revealTimer=0;if(run!==captured||token!==capturedToken||!opened||phase!=='reveal')return;hidden('pokemonSeekReveal',true);if(result.foundTarget)void finishRun();else {phase='running';lastFrame=now();renderAll();schedule();}},result.foundTarget?650:780);
    }
    renderAll();return result;
  }
  // Compatibility entry points still use the exact production selection/search path.
  function searchSpot(id){return selectSpot(id)?searchSelected():{accepted:false};}
  function collectKind(kind){const spot=core.currentRoom(run)?.spots.find(s=>s.kind===kind&&!s.searched);return !!(spot&&selectSpot(spot.id)&&searchSelected().accepted);}
  function renderHud(){
    const secs=Math.ceil(run?core.remainingMs(run)/1000:core.difficultyProfile(difficulty).durationMs/1000);
    text('pokemonSeekTimer',Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0'));text('pokemonSeekScore',core.finalScore(run).toLocaleString('en-GB'));text('pokemonSeekWrong',run?.wrongFinds||0);
    text('pokemonSeekBest','BEST '+Number(root.state?.arcade?.pokemonSeek?.bestScores?.[difficulty]||0).toLocaleString('en-GB'));
  }
  function renderScene(){
    const area=data.getArea(areaId),scene=run?core.currentRoom(run):area.locations[0],key=scene.id;
    text('pokemonSeekRoom',scene.shortName);text('pokemonSeekAreaName',area.name);text('pokemonSeekMap',run?run.visitedRooms.length+'/'+run.rooms.length+' LOCATIONS':'EXPLORE · LISTEN · FIND');
    const field=$('pokemonSeekPlayfield');if(field){field.setAttribute('aria-label',area.name+' · '+scene.name);field.dataset.area=area.id;}
    if(renderedScene===key)return;renderedScene=key;
    const host=$('pokemonSeekScenery');if(host)host.innerHTML=scene.layers.map(l=>l.background?'<img class="pokemonseek-background" src="'+escape(l.asset)+'" alt="" draggable="false">':'<img class="pokemonseek-layer" src="'+escape(l.asset)+'" alt="" draggable="false" style="left:'+l.x+'%;top:'+l.y+'%;width:'+l.w+'%;height:'+l.h+'%;z-index:'+l.z+'">').join('');
  }
  function renderInteraction(){
    const room=core.currentRoom(run),active=phase==='running';
    const spots=$('pokemonSeekSpots');if(spots)spots.innerHTML=(room?.spots||[]).map(s=>'<button type="button" class="pokemonseek-hotspot '+(s.id===run.selectedSpotId?'is-selected ':'')+(s.searched?'is-searched ':'')+(s.kind==='dream'&&!s.searched?'is-dream ':s.rustle&&!s.searched?'is-rustling ':'')+'" data-pokemonseek-select="'+escape(s.id)+'" aria-label="'+escape(s.label)+(s.searched?' · searched':'')+'" aria-pressed="'+(s.id===run.selectedSpotId)+'" style="left:'+s.x+'%;top:'+s.y+'%;width:'+s.w+'%;height:'+s.h+'%" '+(!active||s.searched?'disabled':'')+'><i aria-hidden="true">'+(s.searched?'✓':s.kind==='dream'?'✧':'·')+'</i></button>').join('');
    const choices=$('pokemonSeekSpotChoices');if(choices)choices.innerHTML=(room?.spots||[]).map(s=>'<button type="button" data-pokemonseek-select="'+escape(s.id)+'" aria-pressed="'+(s.id===run.selectedSpotId)+'" '+(!active||s.searched?'disabled':'')+'>'+escape(s.label)+(s.searched?' ✓':'')+'</button>').join('');
    const selected=room?.spots.find(s=>s.id===run?.selectedSpotId);
    text('pokemonSeekSelected',selected?(selected.searched?'CHECKED · ':'SELECTED · ')+selected.label:'SELECT A VISIBLE SPOT');
    const search=$('pokemonSeekSearch');if(search)search.disabled=!active||!selected||selected.searched;
    const listen=$('pokemonSeekListen');if(listen)listen.disabled=!active;
    const nav=$('pokemonSeekNavigation');if(nav)nav.innerHTML=(room?.connections||[]).map(e=>'<button type="button" data-pokemonseek-destination="'+escape(e.to)+'" '+(!active?'disabled':'')+' class="'+(hintNext===e.to?'sound-route':'')+'"><span aria-hidden="true">›</span> '+escape(e.label)+(hintNext===e.to?' ♪':'')+'</button>').join('');
    if(run?.dreamEvent&&run.currentRoom===run.dreamRoom&&!run.dreamFound){core.markDreamSeen(run);}
  }
  function renderReady(){
    const ready=phase==='ready';hidden('pokemonSeekReady',!ready);hidden('pokemonSeekActions',ready);hidden('pokemonSeekPauseOverlay',phase!=='paused');
    const picker=$('pokemonSeekAreaPicker');if(picker&&ready)picker.innerHTML=data.AREAS.map(a=>'<button type="button" data-pokemonseek-area="'+a.id+'" aria-pressed="'+(a.id===areaId)+'" title="'+escape(a.name)+'">'+escape(a.shortName)+'</button>').join('');
    for(const b of nodes('[data-pokemonseek-difficulty]')){const on=b.dataset.pokemonseekDifficulty===difficulty;b.setAttribute('aria-pressed',String(on));}
    const p=core.difficultyProfile(difficulty);text('pokemonSeekReadyMeta',p.label+' · '+p.durationMs/1000+' seconds · '+Math.min(data.getArea(areaId).locations.length,p.maxRooms)+' locations');
    const img=$('pokemonSeekTargetSprite');if(img){img.hidden=!run;if(run){img.src='arcade/sprites/pokemon/'+run.target.dex+'.png';img.alt=run.target.label;}}
    text('pokemonSeekTargetName',run?'FIND '+run.target.label.toUpperCase():'POKÉMON SEEK');
    text('pokemonSeekTargetHint',run?'A lost friend is hiding in this area.':'Choose your Dream World destination.');
  }
  function renderStatus(){text('pokemonSeekStatus',phase==='paused'?'Search paused. Your timer is safe.':flash);}
  function renderAll(){renderHud();renderReady();renderScene();renderInteraction();renderStatus();}
  function pause(){if(phase!=='running'&&!(phase==='reveal'&&run&&!run.complete))return false;clearReveal();phase='paused';stop();renderAll();return true;}
  function resume(){if(phase!=='paused')return false;phase='running';lastFrame=now();renderAll();schedule();return true;}
  function finishRun(){
    if(finishPromise)return finishPromise;if(!run||!owner)return Promise.resolve(null);
    const captured=run,capturedOwner=owner,capturedToken=token;phase='finishing';stop();clearReveal();captured.complete=true;
    // All records and normal coin payout commit synchronously once. No network
    // resolution can delay results, duplicate a run or redirect a stale result.
    const rec=capturedOwner.arcade.pokemonSeek,score=core.finalScore(captured),remainingMs=core.remainingMs(captured),found=captured.foundTarget,clean=found&&!captured.wrongFinds,prev=Number(rec.bestScores[captured.difficulty]||0);
    rec.gamesPlayed++;if(found){rec.clears++;if(captured.difficulty==='hard')rec.hardClears++;if(clean)rec.cleanFinds++;if(captured.searchedSpots===1)rec.firstSearchFinds++;rec.areaClears[captured.areaId]=Number(rec.areaClears[captured.areaId]||0)+1;rec.bestRemainingMs=Math.max(rec.bestRemainingMs,remainingMs);if(clean)rec.bestCleanScore=Math.max(rec.bestCleanScore,score);}
    if(!rec.visitedAreas.includes(captured.areaId))rec.visitedAreas.push(captured.areaId);
    if(captured.itemFound)rec.lostItemsFound++;rec.bestScore=Math.max(rec.bestScore,score);rec.bestScores[captured.difficulty]=Math.max(prev,score);rec.totalWrongFinds+=captured.wrongFinds;rec.totalListens+=captured.listens;rec.totalRoomsVisited+=captured.visitedRooms.length;
    if(captured.dreamSeen&&!captured.dreamSeenRecorded)rec.dreamSparklesSeen++;
    const award=capturedOwner===root.state?platform().awardRun?.({gameId:'pokemonSeek',label:'Pokémon Seek',score,coins:core.rewardForRun(captured)}):null;
    if(capturedOwner===root.state)root.save?.();
    const prize=captured.prize||{pending:captured.dreamFound,label:captured.dreamFound?'Dream Prize Reserved':''};
    finalResult={found,score,remainingMs,wrongFinds:captured.wrongFinds,listens:captured.listens,itemFound:captured.itemFound,dreamFound:captured.dreamFound,reward:award?.coinsAwarded||0,prize:prize.label};
    finishPromise=Promise.resolve(finalResult);phase='finished';
    const stats=[{label:'Pokémon',value:captured.target.label},{label:'Area',value:captured.areaName},{label:'Time left',value:(remainingMs/1000).toFixed(1)+'s'},{label:'Rooms visited',value:captured.visitedRooms.length+'/'+captured.rooms.length},{label:'Searches',value:captured.searchedSpots},{label:'Wrong searches',value:captured.wrongFinds},{label:'Listen uses',value:captured.listens},{label:'Bonus item',value:captured.itemFound?'LOST BERRY FOUND':'—'},{label:'Dream Sparkle',value:captured.dreamFound?prize.label:captured.dreamSeen?'MISSED':'—'},...core.scoreBreakdown(captured).map(p=>({label:'Score · '+(p.label==='Time remaining'?'Time left':p.label),value:(p.value>0?'+':'')+p.value.toLocaleString('en-GB')}))];
    const title=found?'POKÉMON FOUND!':'TIME UP!';
    if(opened&&token===capturedToken&&run===captured&&capturedOwner===root.state)session()?.showResult?.('pokemonSeek',{title,metricLabel:'SCORE',metricValue:score.toLocaleString('en-GB'),coinsAwarded:award?.coinsAwarded||0,bestText:(score>prev?'NEW BEST · ':'BEST · ')+rec.bestScores[captured.difficulty].toLocaleString('en-GB'),review:{title,mode:'Dream World · Pokémon Seek',difficulty:core.difficultyProfile(captured.difficulty).label,metricLabel:'SCORE',metricValue:score.toLocaleString('en-GB'),stats,pbs:[{label:'Best score',value:rec.bestScores[captured.difficulty].toLocaleString('en-GB'),isNew:score>prev}],rewards:[{label:'Lucky Coins',value:award?.coinsAwarded||0},...(prize.label?[{label:'Dream Sparkle',value:prize.label}]:[])]},rewardReveals:prize.reveal?[prize.reveal]:[],replayLabel:'PLAY AGAIN',onReplay:()=>showReady(difficulty),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
    renderInteraction();return finishPromise;
  }
  function open(){opened=true;session()?.mount?.('pokemonSeek',$('pokemonSeekGame'));showReady(difficulty);if(root.state&&prizes())void prizes().retry(root.state);return true;}
  function close(){opened=false;if(run?.foundTarget&&!finishPromise)void finishRun();token++;stop();clearReveal();phase='closed';run=null;finishPromise=null;finalResult=null;renderedScene='';hidden('pokemonSeekPauseOverlay',true);return true;}
  function wire(){
    if(typeof document==='undefined')return;
    $('pokemonSeekStart')?.addEventListener('click',startRun);$('pokemonSeekSearch')?.addEventListener('click',searchSelected);$('pokemonSeekListen')?.addEventListener('click',listen);$('pokemonSeekResume')?.addEventListener('click',resume);$('pokemonSeekPauseButton')?.addEventListener('click',pause);
    document.addEventListener('click',e=>{const area=e.target.closest?.('[data-pokemonseek-area]'),diff=e.target.closest?.('[data-pokemonseek-difficulty]'),spot=e.target.closest?.('[data-pokemonseek-select]'),dest=e.target.closest?.('[data-pokemonseek-destination]');if(area)selectArea(area.dataset.pokemonseekArea);else if(diff)selectDifficulty(diff.dataset.pokemonseekDifficulty);else if(spot)selectSpot(spot.dataset.pokemonseekSelect);else if(dest)move(dest.dataset.pokemonseekDestination);});
    document.addEventListener('keydown',e=>{if(phase!=='running'||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key?.toLowerCase()==='l'){e.preventDefault();listen();}else if(e.key==='Enter'&&e.target===document.body){e.preventDefault();searchSelected();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&opened)pause();});root.addEventListener?.('pagehide',()=>{if(opened)pause();});
  }
  wire();root.LuckyDexPokemonSeek={open,close,showReady,selectArea,selectDifficulty,startRun,move,listen,selectSpot,searchSelected,searchSpot,collectLostItem:()=>collectKind('item'),collectDreamSparkle:()=>collectKind('dream'),pause,resume,finishRun,snapshot:()=>({phase,difficulty,areaId,run:core.snapshot(run),finalResult:finalResult?{...finalResult}:null}),_setRng:fn=>{if(typeof fn==='function')rng=fn;}};
})(typeof window!=='undefined'?window:globalThis);
