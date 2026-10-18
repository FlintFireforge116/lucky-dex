/* LuckyDex v0.22 — restored Moon Stage Clefairy Match.
   Mechanics/presentation are transplanted from the v0.17 implementation,
   with one namespaced owner and cancellable lifecycle. */
(function(root){
'use strict';
const ACTIONS=['star','song','moon','spin'];
const SYMBOLS=['⭐','🎵','🌙','💫'];
const $=id=>document.getElementById(id);
let game=null,scene=null,runController=null,playbackController=null,resetTimer=0,installed=false;
const platform=()=>root.LuckyDexArcadePlatform;
const session=()=>root.LuckyDexArcadeSession;
function rewardForRound(round){const r=Math.max(1,Number(round)||1);return Math.round(8*Math.pow(1.32,r-1));}
function markup(){const host=$('clefairyGame');if(!host)return;host.className='arcade-game clefairy-moon-game';host.innerHTML=`
<div class="arcade-full-head"><button class="game-exit" data-exit-game>‹ MOON STAGE</button><div class="arcade-mascot"><img src="clefairy_pose_idle.png" alt="Clefairy"><span>MOON STAGE</span></div></div>
<div class="section-head"><div><div class="eyebrow">CLEFAIRY MATCH</div><h2>Round <span id="clefairyRound">0</span></h2></div><div class="bank-display">BANK <b id="clefairyBank">0</b></div></div>
<div class="memory-display" id="memoryDisplay">Tap START and watch the sequence.</div>
<div class="clefairy-scene" data-state="idle" data-action="idle" id="clefairyStage" role="img" aria-label="Clefairy on the moonlit lake stage">
  <img id="clefairyBackground" class="clefairy-background" src="moon_stage_bg3.png" alt="">
  <canvas class="clefairy-fx-rear" aria-hidden="true"></canvas>
  <div class="clefairy-reflection" aria-hidden="true"><div class="clefairy-mirror"><div class="clefairy-motion">
    <div class="clefairy-pose" data-pose="idle"><img src="clefairy_pose_idle.png" alt=""></div>
    <div class="clefairy-pose" data-pose="star"><img src="clefairy_pose_star.png" alt=""></div>
    <div class="clefairy-pose" data-pose="song"><img src="clefairy_pose_song.png" alt=""></div>
    <div class="clefairy-pose" data-pose="moon"><img src="clefairy_pose_moon.png" alt=""></div>
    <div class="clefairy-pose" data-pose="spin"><img src="clefairy_pose_spin.png" alt=""></div>
  </div></div></div>
  <div class="clefairy-water" aria-hidden="true"></div>
  <div class="clefairy-character"><div class="clefairy-motion">
    <div class="clefairy-pose" data-pose="idle"><img src="clefairy_pose_idle.png" alt=""></div>
    <div class="clefairy-pose" data-pose="star"><img src="clefairy_pose_star.png" alt=""></div>
    <div class="clefairy-pose" data-pose="song"><img src="clefairy_pose_song.png" alt=""></div>
    <div class="clefairy-pose" data-pose="moon"><img src="clefairy_pose_moon.png" alt=""></div>
    <div class="clefairy-pose" data-pose="spin"><img src="clefairy_pose_spin.png" alt=""></div>
  </div></div>
  <canvas class="clefairy-fx-front" aria-hidden="true"></canvas>
</div>
<div class="memory-pad">${ACTIONS.map((a,i)=>`<button type="button" data-memory="${i}" disabled><span>${SYMBOLS[i]}</span><small>${a.toUpperCase()}</small></button>`).join('')}</div>
<div class="game-actions"><button class="secondary" id="memoryStartBtn">START</button><button class="primary" id="memoryCashBtn" disabled>CASH OUT</button></div>`;
}
function delay(ms,signal){return new Promise(resolve=>{if(signal?.aborted)return resolve(false);let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(t);signal?.removeEventListener('abort',cancel);resolve(ok)},cancel=()=>finish(false),t=setTimeout(()=>finish(true),ms);signal?.addEventListener('abort',cancel,{once:true});});}
function stop(){runController?.abort();playbackController?.abort();runController=playbackController=null;clearTimeout(resetTimer);resetTimer=0;game=null;scene?.suspend();return true;}
function reset(){runController?.abort();playbackController?.abort();clearTimeout(resetTimer);resetTimer=0;runController=new AbortController();playbackController=null;game={sequence:[],round:0,bank:0,input:0,accepting:false,finished:false};$('clefairyRound').textContent='0';$('clefairyBank').textContent='0';$('memoryDisplay').textContent='Tap START and watch the sequence.';$('memoryStartBtn').textContent='START';$('memoryStartBtn').disabled=false;$('memoryCashBtn').disabled=true;document.querySelectorAll('[data-memory]').forEach(b=>b.disabled=true);scene?.reset();scene?.resume();return game;}
async function playAction(n){return scene?.play(ACTIONS[n]||'idle')??false;}
async function playback(){if(!game||playbackController)return false;const current=game,run=runController;if(!run||run.signal.aborted)return false;const control=new AbortController();playbackController=control;const abort=()=>{control.abort();scene?.reset();};run.signal.addEventListener('abort',abort,{once:true});try{for(const n of [...current.sequence]){if(control.signal.aborted||run.signal.aborted||game!==current)return false;root.vibrate?.(8);if(!await playAction(n))return false;if(!await delay(100,control.signal))return false;}return game===current&&!run.signal.aborted;}finally{run.signal.removeEventListener('abort',abort);if(playbackController===control)playbackController=null;}}
async function nextRound(){if(!game||playbackController||$('memoryStartBtn').disabled)return false;const current=game,run=runController;current.round++;current.sequence.push(Math.floor(Math.random()*4));current.input=0;current.accepting=false;$('clefairyRound').textContent=String(current.round);$('memoryStartBtn').disabled=true;$('memoryCashBtn').disabled=true;$('memoryDisplay').textContent='Watch Clefairy…';document.querySelectorAll('[data-memory]').forEach(b=>b.disabled=true);if(!await playback()||run.signal.aborted||game!==current)return false;current.accepting=true;$('memoryDisplay').textContent='Your turn — copy the symbols.';document.querySelectorAll('[data-memory]').forEach(b=>b.disabled=false);return true;}
function updateBest(round){const a=root.state?.arcade;if(a)a.bestMemory=Math.max(Number(a.bestMemory||0),Number(round||0));root.save?.();}
function awardCoins(coins,label){const out=platform()?.awardRun?.({gameId:'clefairy',label,score:game?.round||0,coins,dailyEligible:false,dailyReward:null})||{coinsAwarded:coins,itemAwarded:null};return out.coinsAwarded??coins;}
function tap(n){if(!game?.accepting||!Number.isInteger(n)||n<0||n>3)return false;const current=game;playAction(n);if(n!==current.sequence[current.input]){current.accepting=false;current.finished=true;document.querySelectorAll('[data-memory]').forEach(b=>b.disabled=true);const consolation=Math.round(current.bank*.2),awarded=consolation?awardCoins(consolation,'Clefairy consolation'):0;$('memoryDisplay').textContent=`Miss! ${awarded?`Consolation ${awarded} coins.`:'Bank lost.'}`;const completed=Math.max(0,current.round-1);const previousBest=Number(root.state?.arcade?.bestMemory||0);updateBest(completed);session()?.showResult?.('clefairy',{title:'SEQUENCE BROKEN',metricLabel:'ROUND',metricValue:`Round ${current.round}`,coinsAwarded:awarded,itemAwarded:null,bestText:`Completed ${completed}`,review:{title:'SEQUENCE BROKEN',mode:'Clefairy Match',difficulty:'Memory',metricLabel:'ROUND REACHED',metricValue:String(current.round),stats:[{label:'Completed Rounds',value:String(completed)},{label:'Sequence Progress',value:`${current.input}/${current.sequence.length}`},{label:'Bank at Risk',value:String(current.bank)}],pbs:[{label:'Best Completed Round',value:String(root.state?.arcade?.bestMemory||completed),isNew:completed>previousBest}],rewards:[{label:'Consolation Coins',value:String(awarded||0)}]},onReplay:reset,onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return false;}current.input++;if(current.input===current.sequence.length){current.accepting=false;document.querySelectorAll('[data-memory]').forEach(b=>b.disabled=true);current.bank+=rewardForRound(current.round);$('clefairyBank').textContent=String(current.bank);$('memoryDisplay').textContent='Matched! Cash out or push another round.';$('memoryCashBtn').disabled=false;$('memoryStartBtn').disabled=false;$('memoryStartBtn').textContent='NEXT ROUND';}return true;}
function cash(){if(!game||game.bank<=0)return false;const current=game;current.finished=true;const awarded=awardCoins(current.bank,'Clefairy Match');const previousBest=Number(root.state?.arcade?.bestMemory||0);updateBest(current.round);session()?.showResult?.('clefairy',{title:'MOON STAGE COMPLETE',metricLabel:'ROUND',metricValue:`Round ${current.round}`,coinsAwarded:awarded,itemAwarded:null,bestText:`Banked ${current.bank}`,review:{title:'MOON STAGE COMPLETE',mode:'Clefairy Match',difficulty:'Memory',metricLabel:'ROUND',metricValue:String(current.round),stats:[{label:'Completed Rounds',value:String(current.round)},{label:'Sequence Length',value:String(current.sequence.length)},{label:'Banked',value:String(current.bank)}],pbs:[{label:'Best Round',value:String(root.state?.arcade?.bestMemory||current.round),isNew:current.round>previousBest}],rewards:[{label:'Lucky Coins',value:String(awarded||0)}]},onReplay:reset,onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});return true;}
function open(){if(!installed)install();$('clefairyGame').hidden=false;document.body.classList.add('arcade-open');session()?.mount?.('clefairy');reset();return true;}
function close(){stop();$('clefairyGame')&&($('clefairyGame').hidden=true);return true;}
function install(){if(installed||typeof document==='undefined')return;markup();scene=root.LuckyDexClefairy?.mount?.($('clefairyStage'))||null;$('memoryStartBtn').onclick=nextRound;$('memoryCashBtn').onclick=cash;document.querySelectorAll('[data-memory]').forEach(b=>b.onclick=()=>tap(Number(b.dataset.memory)));root.LuckyDexDebug=Object.assign(root.LuckyDexDebug||{},{playClefairyAction(action='idle'){if(!['idle',...ACTIONS].includes(action)||playbackController)return Promise.resolve(false);return scene?.play(action)||Promise.resolve(false);}});installed=true;scene?.suspend();}
const api={ACTIONS,SYMBOLS,rewardForRound,open,close,reset,nextRound,tap,cash,stop,state:()=>game};root.LuckyDexClefairyGame=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof document!=='undefined')install();
})(typeof window!=='undefined'?window:globalThis);
