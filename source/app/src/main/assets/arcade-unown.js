/* LuckyDex v0.28.8 — authoritative Unown Decoder streak owner. */
(function(root){
'use strict';

const $=id=>document.getElementById(id);
const MODES=['easy','normal','hard'];
const managedTimeouts=new Set();
let game=null,timerInterval=0,selectedMode='easy',tokenCounter=0,installed=false;
const data=()=>root.LuckyDexUnownData;
const specialEvents=()=>root.LuckyDexArcadeSpecialEvents;
const rareOdds=()=>({unown:.004,...(root.state?.settings?.rareOdds||{})});
const rareRewards=()=>root.LuckyDexArcadeRareRewards;
const rareBridge=()=>root.LuckyDexRareRewardBridge;
function persistUnownAttempt(){try{rareBridge()?.save?.();}catch(_){try{root.save?.();}catch(__){}}}
const now=()=>root.performance?.now?.()??Date.now();
const fmt=n=>root.fmt?.(n)??Number(n||0).toLocaleString();

function clearTimer(){if(timerInterval){root.clearInterval(timerInterval);timerInterval=0;}}
function clearManagedTimeouts(){for(const id of managedTimeouts)root.clearTimeout(id);managedTimeouts.clear();}
function managedTimeout(fn,ms,token=game?.token){
  const id=root.setTimeout(()=>{managedTimeouts.delete(id);if(!game||game.token!==token)return;fn();},ms);
  managedTimeouts.add(id);return id;
}
function closeTypedScreen(refocus=false){
  const screen=$('unownAnswerScreen'),input=$('unownInput');
  if(screen)screen.hidden=true;
  document.body?.classList?.remove('unown-answer-open');
  document.documentElement?.classList?.remove('unown-answer-open');
  try{root.scrollTo?.({top:0,left:0,behavior:'instant'});}catch(_){root.scrollTo?.(0,0);}
  input?.blur?.();
  if(refocus&&game?.phase==='question'&&game.mode!=='easy')root.requestAnimationFrame?.(()=>$('unownAnswerOpenBtn')?.focus?.());
  return true;
}
function invalidateRun(){clearTimer();clearManagedTimeouts();closeTypedScreen(false);tokenCounter++;if(game){game.active=false;game.token=tokenCounter;}}
function stop(){invalidateRun();if(game)game.phase='finished';disableQuestionControls();return true;}
function unownImg(ch){return `arcade/sprites/actors/unown/${String(ch).toLowerCase()}.png`;}

function updateStats(){if(!game)return;$('unownStreak').textContent=String(game.streak);$('unownScore').textContent=fmt(game.score);}
function setButtonsForPhase(){
  if(!game)return;
  const start=$('unownStartBtn'),cash=$('unownCashBtn'),answerOpen=$('unownAnswerOpenBtn');
  start.hidden=game.phase==='question'||game.phase==='finished';
  start.textContent=game.phase==='between'?'NEXT MESSAGE':'START DECODER';
  const canCash=game.phase==='between'&&game.bank>0;cash.disabled=!canCash;cash.hidden=!canCash;cash.parentElement?.classList?.toggle('cash-available',canCash);
  if(answerOpen){const canOpen=game.phase==='question'&&game.mode!=='easy'&&!game.current?.answered;answerOpen.hidden=!canOpen;answerOpen.disabled=!canOpen;if(answerOpen.parentElement)answerOpen.parentElement.hidden=!canOpen;}
  document.querySelectorAll('[data-unown-difficulty]').forEach(b=>b.disabled=game.active);
}
function applyModeClass(){
  const host=$('unownGame');if(!host)return;
  for(const mode of MODES)host.classList.toggle(`mode-${mode}`,selectedMode===mode);
  document.querySelectorAll('[data-unown-difficulty]').forEach(b=>b.classList.toggle('active',b.dataset.unownDifficulty===selectedMode));
}
function setMirroredCategory(text){for(const id of ['unownCategory','unownAnswerCategory']){const node=$(id);if(node)node.textContent=text;}}
function setMirroredClue(text,hidden=false){for(const id of ['unownClue','unownAnswerClue']){const node=$(id);if(node){node.hidden=hidden;node.textContent=hidden?'':text;}}}
function setTimerFraction(fraction){const width=`${Math.max(0,Math.min(1,fraction))*100}%`;for(const id of ['unownTimerFill','unownAnswerTimerFill']){const node=$(id);if(node)node.style.width=width;}}
function setGlyphState(state){for(const id of ['unownGlyphs','unownAnswerGlyphs']){const host=$(id);if(host){host.classList.remove('decoded','failed');if(state)host.classList.add(state);}}}
function setMode(mode){
  if(!MODES.includes(mode)||game?.active)return false;
  selectedMode=mode;if(game)game.mode=mode;applyModeClass();closeTypedScreen(false);
  if(game?.phase==='ready')setMirroredClue(mode==='easy'?'Four choices · clue shown':mode==='normal'?'Type the message · clue shown':'Type the message · no clue',false);
  return true;
}


function fitGlyphRows(host){
  if(!host)return;
  const words=[...host.querySelectorAll('.unown-word')],wordCount=Math.max(1,words.length),hostHeight=Math.max(0,Number(host.clientHeight)||0);
  words.forEach(slot=>{
    const row=slot.querySelector('.unown-word-glyphs');
    if(!row)return;
    const glyphCount=Math.max(1,row.children.length);
    const style=root.getComputedStyle?root.getComputedStyle(slot):null;
    const baseSize=parseFloat(style?.getPropertyValue('--glyph-base'))||54;
    const padX=parseFloat(style?.getPropertyValue('--glyph-fit-pad'))||8;
    const available=Math.max(72,slot.clientWidth-padX);
    const size=Math.max(26,Math.min(baseSize,Math.floor(available/glyphCount)));
    const verticalSize=hostHeight?Math.max(22,Math.floor((hostHeight-Math.max(0,wordCount-1)*6-10)/wordCount)-4):size;
    const fittedSize=Math.min(size,verticalSize);
    slot.style.setProperty('--glyph-size',`${fittedSize}px`);
    slot.style.height=`${Math.max(26,fittedSize+4)}px`;
  });
}
function queueGlyphFit(){
  const run=()=>{fitGlyphRows($('unownGlyphs'));fitGlyphRows($('unownAnswerGlyphs'));};
  root.requestAnimationFrame?.(()=>root.requestAnimationFrame?.(run)||run())||run();
}
function renderGlyphsInto(host,entry){
  if(!host)return;host.innerHTML='';host.classList.remove('decoded','failed');
  const glyphs=data().glyphWords(entry.answer),canonical=String(entry.answer).trim().split(/\s+/).filter(Boolean),shiny=entry._shinyGlyph||null;let glyphCursor=0;
  glyphs.forEach((word,wordIndex)=>{
    const slot=document.createElement('div');slot.className='unown-word';slot.style.setProperty('--unown-count',String(word.length));
    const row=document.createElement('div');row.className='unown-word-glyphs';
    [...word].forEach((ch,i)=>{const glyph=document.createElement('div');glyph.className='unown-glyph';glyph.style.setProperty('--unown-rot',`${(i%3-1)*2}deg`);if(shiny&&Number(shiny.glyphIndex)===glyphCursor){glyph.dataset.shinyUnown='true';glyph.title=`Shiny Unown ${shiny.letter||ch}`;}const img=document.createElement('img');img.src=unownImg(ch);img.alt=shiny&&Number(shiny.glyphIndex)===glyphCursor?`Shiny Unown ${String(ch).toUpperCase()} glyph`:'Unown glyph';if(!img.complete)img.addEventListener('load',queueGlyphFit,{once:true});glyph.appendChild(img);row.appendChild(glyph);glyphCursor++;});
    const latin=document.createElement('span');latin.className='unown-canonical';latin.textContent=canonical[wordIndex]||word;
    slot.append(row,latin);host.appendChild(slot);
  });
}
function renderGlyphs(entry){renderGlyphsInto($('unownGlyphs'),entry);renderGlyphsInto($('unownAnswerGlyphs'),entry);queueGlyphFit();}
function renderIdle(){renderGlyphs({answer:'UNOWN'});setMirroredCategory('RUINS MESSAGE');}
function disableQuestionControls(){
  $('unownAnswers')?.querySelectorAll('button').forEach(b=>b.disabled=true);
  if($('unownInput'))$('unownInput').disabled=true;
  if($('unownDecodeBtn'))$('unownDecodeBtn').disabled=true;
  if($('unownAnswerOpenBtn'))$('unownAnswerOpenBtn').disabled=true;
}
function reset(){
  invalidateRun();
  const pool=root.LuckyDexUnownData.buildPool(root.LuckyDexAdventureSpecies.byId),token=++tokenCounter;
  game={mode:selectedMode,active:false,phase:'ready',streak:0,score:0,bank:0,rewardReveals:[],usedKeys:new Set(),usedNormalised:new Set(),current:null,pool,token};
  $('unownAnswers').innerHTML='';$('unownInput').value='';$('unownInput').disabled=true;$('unownDecodeBtn').disabled=true;setTimerFraction(0);
  updateStats();applyModeClass();renderIdle();setMirroredClue('Choose a difficulty and press START DECODER.',false);setButtonsForPhase();
  return game;
}
function open(){if(!installed)install();return reset();}
function close(){return stop();}

function chooseEntry(){
  let picked=data().pickEntry(game.pool,{mode:game.mode,streak:game.streak,usedKeys:game.usedKeys,usedNormalised:game.usedNormalised,rng:Math.random});
  if(!picked){game.usedKeys.clear();game.usedNormalised.clear();picked=data().pickEntry(game.pool,{mode:game.mode,streak:game.streak,usedKeys:game.usedKeys,usedNormalised:game.usedNormalised,rng:Math.random});}
  return picked;
}
function openTypedScreen({focus=true}={}){
  if(!game||game.phase!=='question'||game.mode==='easy'||game.current?.answered)return false;
  const screen=$('unownAnswerScreen');if(!screen)return false;
  screen.hidden=false;document.body?.classList?.add('unown-answer-open');document.documentElement?.classList?.add('unown-answer-open');
  try{root.scrollTo?.({top:0,left:0,behavior:'instant'});}catch(_){root.scrollTo?.(0,0);}
  document.documentElement.scrollTop=0;document.body.scrollTop=0;screen.scrollTop=0;
  if(focus){const token=game.token,current=game.current;root.requestAnimationFrame?.(()=>{if(game?.token===token&&game.phase==='question'&&game.current===current&&!screen.hidden){const input=$('unownInput');try{input?.focus?.({preventScroll:true});}catch(_){input?.focus?.();}}});}
  return true;
}
function startTimer(current){
  clearTimer();const token=game.token;setTimerFraction(1);
  timerInterval=root.setInterval(()=>{
    if(!game||game.token!==token||game.phase!=='question'||game.current!==current||current.answered){clearTimer();return;}
    const remaining=Math.max(0,1-(now()-current.started)/current.duration);setTimerFraction(remaining);
    if(remaining<=0)submitAnswer('',{timeout:true});
  },80);
}
function renderQuestion(entry){
  setMirroredCategory(entry.category||'MESSAGE');renderGlyphs(entry);
  const isHard=game.mode==='hard';setMirroredClue(isHard?'':`CLUE · ${entry.clue||'Decode the ancient message.'}`,isHard);
  const answers=$('unownAnswers'),input=$('unownInput'),decode=$('unownDecodeBtn');answers.innerHTML='';input.value='';
  if(game.mode==='easy'){
    closeTypedScreen(false);
    const choices=data().buildChoices(entry,game.pool,4,Math.random);
    for(const choice of choices){const b=document.createElement('button');b.type='button';b.dataset.unownAnswer=choice.answer;b.textContent=choice.answer;b.onclick=()=>submitAnswer(choice.answer);answers.appendChild(b);}
    input.disabled=true;decode.disabled=true;
  }else{input.disabled=false;decode.disabled=false;openTypedScreen();}
}
function persistedUnownEntry(){const attempt=rareRewards()?.currentAttempt?.(root.state,'unown');return attempt?.entry||null;}
function ensureUnownAttempt(entry){
  const rr=rareRewards(),state=root.state;if(!rr||!state)return {id:'volatile-unown',kind:'unownQuestion',entry,shinyGlyph:specialEvents()?.createUnownShiny?.(entry.answer,Math.random,rareOdds().unown)||null};
  let attempt=rr.currentAttempt(state,'unown');if(attempt)return attempt;
  const clean={key:entry.key,answer:entry.answer,category:entry.category||'MESSAGE',clue:entry.clue||''};attempt=rr.getOrCreateAttempt(state,'unown',()=>({kind:'unownQuestion',entry:clean,shinyGlyph:specialEvents()?.createUnownShiny?.(entry.answer,Math.random,rareOdds().unown)||null}));persistUnownAttempt();return attempt;
}
async function resolveUnownReward(current){
  if(!current?.shinyGlyph||!current.attempt?.id)return null;if(current.attempt.reward)return current.attempt.reward;if(current.rewardPromise)return current.rewardPromise;
  current.rewardPromise=Promise.resolve(rareBridge()?.resolveCardForLetter?.(current.shinyGlyph.letter)).then(reward=>{if(!reward)throw new Error('No matching card reward available');rareRewards()?.patchAttempt?.(root.state,'unown',current.attempt.id,{reward});current.attempt.reward=reward;persistUnownAttempt();return reward;}).finally(()=>{current.rewardPromise=null;});return current.rewardPromise;
}
async function claimUnownReward(current){
  const reward=await resolveUnownReward(current);if(!reward)return {label:'',reward:null,claim:null};
  const claim=await rareRewards()?.claimAttempt?.(root.state,'unown',current.attempt.id,r=>rareBridge()?.grantReward?.(r));persistUnownAttempt();
  return {label:claim?.result?.label||reward.label||`${current.shinyGlyph.letter} card`,reward,claim};
}
function beginQuestion(forcedEntry=null){
  if(!game?.active)return false;
  clearTimer();clearManagedTimeouts();
  const persisted=forcedEntry?null:persistedUnownEntry(),entry=forcedEntry||persisted||chooseEntry();if(!entry)return false;
  const attempt=ensureUnownAttempt(entry),liveEntry=attempt?.entry?{...entry,...attempt.entry}:entry;
  game.phase='question';game.mode=selectedMode;game.usedKeys.add(liveEntry.key);game.usedNormalised.add(data().normaliseAnswer(liveEntry.answer));
  const duration=data().MODE_CONFIG[game.mode].durationMs,current={entry:liveEntry,answered:false,started:now(),duration,attempt,shinyGlyph:attempt?.shinyGlyph||null,rewardPromise:null};game.current=current;
  renderQuestion({...liveEntry,_shinyGlyph:current.shinyGlyph});if(current.shinyGlyph&&!attempt?.reward)resolveUnownReward(current).catch(()=>{});setButtonsForPhase();startTimer(current);return true;
}
function start(){
  if(!game||game.phase==='finished')reset();
  if(game.phase==='between')return beginQuestion();
  if(game.phase!=='ready')return false;
  game.active=true;game.mode=selectedMode;game.token=++tokenCounter;game.usedKeys.clear();game.usedNormalised.clear();game.current=null;setButtonsForPhase();return beginQuestion();
}

function finishRun(kind){
  if(!game||game.phase==='finished')return false;
  clearTimer();clearManagedTimeouts();closeTypedScreen(false);const g=game;g.active=false;g.phase='finished';
  const cashing=kind==='cashout',payout=cashing?Math.round(g.bank):Math.round(g.bank*.20);
  const previousBest=Number(root.state?.arcade?.bestUnown||0),isBest=g.score>previousBest;
  if(root.state?.arcade)root.state.arcade.bestUnown=Math.max(previousBest,g.score);root.save?.();
  const awarded=payout>0?(root.awardArcadeCoins?root.awardArcadeCoins(payout,'Unown Decoder','unown'):payout):0;
  setButtonsForPhase();
  root.LuckyDexArcadeSession?.showResult?.('unown',{title:cashing?'CASHED OUT':'STREAK ENDED',metricLabel:'STREAK',metricValue:`${g.streak} · ${g.mode.toUpperCase()} · ${fmt(g.score)} pts`,coinsAwarded:awarded,itemAwarded:null,bestText:isBest?'NEW BEST SCORE':`Bank ${fmt(g.bank)}`,rewardReveals:g.rewardReveals||[],review:{title:cashing?'CASHED OUT':'STREAK ENDED',mode:g.mode.toUpperCase(),difficulty:g.mode.toUpperCase(),metricLabel:'STREAK',metricValue:String(g.streak),stats:[{label:'Score',value:fmt(g.score)},{label:'Bank',value:fmt(g.bank)},{label:'Outcome',value:cashing?'CASH OUT':'FAILED'}],pbs:[{label:'Best Score',value:fmt(root.state?.arcade?.bestUnown||g.score),isNew:isBest}],rewards:[{label:'Lucky Coins',value:String(awarded||0)}]},onReplay:reset,onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.(true)});
  return true;
}
function cashOut(){if(!game||game.phase!=='between'||game.bank<=0)return false;return finishRun('cashout');}

function submitAnswer(answer,{timeout=false}={}){
  const g=game,current=g?.current;if(!g||g.phase!=='question'||!current||current.answered)return false;
  current.answered=true;clearTimer();disableQuestionControls();
  const entered=data().normaliseAnswer(answer),expected=data().normaliseAnswer(current.entry.answer),ok=entered!==''&&entered===expected;
  const remainingFraction=Math.max(0,1-(now()-current.started)/current.duration);setGlyphState(ok?'decoded':'failed');setTimerFraction(0);
  if(ok){
    const reward=data().scoreFor(current.entry,{mode:g.mode,streak:g.streak,remainingFraction});g.streak++;g.score+=reward.points;g.bank+=reward.coins;updateStats();root.vibrate?.([9,12,18]);
    setMirroredClue(current.shinyGlyph?`SHINY ${current.shinyGlyph.letter} · Decode confirmed · securing card reward…`:`DECODED · +${fmt(reward.points)} pts · bank ${fmt(g.bank)}`,false);
  }else{if(current.attempt?.id&&current.attempt.id!=='volatile-unown')rareRewards()?.abandonAttempt?.(root.state,'unown',current.attempt.id);persistUnownAttempt();root.vibrate?.(20);setMirroredClue(timeout?`TIME · ${current.entry.answer}`:`THE MESSAGE WAS · ${current.entry.answer}`,false);}
  const token=g.token;
  managedTimeout(async()=>{
    if(game!==g||game.token!==token)return;
    closeTypedScreen(false);
    if(ok){
      let rareLabel='';try{if(current.shinyGlyph){const won=await claimUnownReward(current);rareLabel=won.label;const reveal=rareBridge()?.rewardReveal?.(won.reward,won.claim?.result,`UNOWN ${current.shinyGlyph.letter} REWARD`);if(reveal)g.rewardReveals.push(reveal);}else if(current.attempt?.id&&current.attempt.id!=='volatile-unown'){rareRewards()?.abandonAttempt?.(root.state,'unown',current.attempt.id);persistUnownAttempt();}}catch(error){console.error?.('[LuckyDex] Shiny Unown reward claim failed',error);setMirroredClue(`SHINY ${current.shinyGlyph?.letter||''} reward reserved · reopen this message to retry.`,false);return;}
      g.phase='between';g.current=null;setMirroredClue(rareLabel?`✨ SHINY ${current.shinyGlyph.letter} · WON ${rareLabel}`:'Decoded. Risk the bank on another message or cash out.',false);setButtonsForPhase();
    }else finishRun(timeout?'timeout':'wrong');
  },650,token);
  return ok;
}

function install(){
  if(installed||typeof document==='undefined')return;installed=true;
  $('unownStartBtn').onclick=start;$('unownCashBtn').onclick=cashOut;
  $('unownAnswerOpenBtn').onclick=()=>openTypedScreen();$('unownAnswerCloseBtn').onclick=()=>closeTypedScreen(false);
  document.querySelectorAll('[data-unown-difficulty]').forEach(b=>b.onclick=()=>setMode(b.dataset.unownDifficulty));
  $('unownTypedForm').addEventListener('submit',event=>{event.preventDefault();submitAnswer($('unownInput').value);});
  root.addEventListener?.('resize',queueGlyphFit,{passive:true});
  const answerScreen=$('unownAnswerScreen');
  const preventOverlayScroll=event=>{if(event.target?.closest?.('#unownInput'))return;event.preventDefault();};
  answerScreen?.addEventListener?.('touchmove',preventOverlayScroll,{passive:false});
  answerScreen?.addEventListener?.('wheel',preventOverlayScroll,{passive:false});
  answerScreen?.addEventListener?.('scroll',()=>{if(answerScreen.scrollTop!==0)answerScreen.scrollTop=0;});
  root.LuckyDexDebug=Object.assign(root.LuckyDexDebug||{}, {
    forceUnownRound(entry,mode='normal'){
      if(!game||game.phase==='finished')reset();if(game.active)stop();game=reset();setMode(MODES.includes(mode)?mode:'normal');game.mode=selectedMode;game.active=true;game.token=++tokenCounter;const fixture={key:entry.key||`debug:${data().normaliseAnswer(entry.answer)}`,answer:entry.answer,category:entry.category||'POKÉMON',clue:entry.clue||'Debug message'};return beginQuestion(fixture);
    },
    unownState(){return game?{mode:game.mode,active:game.active,phase:game.phase,streak:game.streak,score:game.score,bank:game.bank,current:game.current?.entry?.answer||null,token:game.token,answerScreenOpen:!$('unownAnswerScreen')?.hidden}:null;}
  });
}

const api={open,close,start,cashOut,submitAnswer,openTypedScreen,closeTypedScreen,state:()=>game};root.LuckyDexUnown=api;if(typeof document!=='undefined')install();
})(typeof window!=='undefined'?window:globalThis);
