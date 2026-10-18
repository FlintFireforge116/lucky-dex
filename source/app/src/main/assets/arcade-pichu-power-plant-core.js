(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexPichuPowerPlantCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const DIRECTIONS=Object.freeze(['up','right','down','left']);
  const CONFIG=Object.freeze({maxCharge:100,correctCharge:8,playerCorrectCharge:8,cpuCorrectCharge:4,wrongDrain:6,safetyCapMs:45000});
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',signalMinMs:1550,signalMaxMs:2150,reactionMinMs:480,reactionMaxMs:700,zapMinMs:360,zapMaxMs:500,errorChance:.18}),
    normal:Object.freeze({key:'normal',label:'Normal',signalMinMs:1200,signalMaxMs:1750,reactionMinMs:350,reactionMaxMs:520,zapMinMs:270,zapMaxMs:390,errorChance:.11}),
    hard:Object.freeze({key:'hard',label:'Hard',signalMinMs:900,signalMaxMs:1350,reactionMinMs:240,reactionMaxMs:380,zapMinMs:190,zapMaxMs:290,errorChance:.05})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([90,60,40,25]),normal:Object.freeze([120,80,50,30]),hard:Object.freeze([155,105,70,40])});
  const clamp01=v=>Math.max(0,Math.min(.999999,Number(v)||0));
  const rand=rng=>clamp01((rng||Math.random)());
  const between=(rng,min,max)=>min+rand(rng)*(max-min);
  const pickDirection=rng=>DIRECTIONS[Math.min(DIRECTIONS.length-1,Math.floor(rand(rng)*DIRECTIONS.length))];
  const pickButton=rng=>rand(rng)<.5?'a':'b';
  const profileFor=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const signalDelay=(profile,rng)=>Math.round(between(rng,profile.signalMinMs,profile.signalMaxMs));
  const reactionDelay=(profile,rng)=>Math.round(between(rng,profile.reactionMinMs,profile.reactionMaxMs));
  const zapDelay=(profile,rng)=>Math.round(between(rng,profile.zapMinMs,profile.zapMaxMs));
  function newSignal(profile,rng,now,version=1){return {direction:pickDirection(rng),button:pickButton(rng),version,nextAt:(Number(now)||0)+signalDelay(profile,rng)};}
  function makePlayer(id,index,kind,profile,rng,now){const signal=newSignal(profile,rng,now,1);return {id,index,kind,charge:0,correctPresses:0,wrongPresses:0,totalPresses:0,finishedAt:null,signal,nextZapAt:kind==='cpu'?(Number(now)||0)+reactionDelay(profile,rng):null};}
  function createMatch({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const profile=profileFor(difficulty),start=Number(nowMs)||0;
    const players=[makePlayer('player',0,'player',profile,rng,start),makePlayer('cpu1',1,'cpu',profile,rng,start),makePlayer('cpu2',2,'cpu',profile,rng,start),makePlayer('cpu3',3,'cpu',profile,rng,start)];
    return {difficulty:profile.key,startedAt:start,lastAdvancedAt:start,players,player:players[0],signal:players[0].signal,heldDirection:null,finalized:false,finalizedAt:null,winnerId:null,ranking:null};
  }
  function applyAttempt(match,p,direction,button,atMs){
    if(!match||!p||match.finalized||p.finishedAt!=null)return {accepted:false,correct:false,charge:Number(p?.charge||0),finished:Boolean(p?.finishedAt!=null)};
    const dir=String(direction||'').toLowerCase(),btn=String(button||'').toLowerCase();
    if(!['a','b'].includes(btn))return {accepted:false,correct:false,charge:p.charge,finished:false};
    const correct=dir===p.signal.direction&&btn===p.signal.button;
    p.totalPresses++;
    if(correct){p.correctPresses++;const gain=p.kind==='player'?CONFIG.playerCorrectCharge:CONFIG.cpuCorrectCharge;p.charge=Math.min(CONFIG.maxCharge,p.charge+gain);}else{p.wrongPresses++;p.charge=Math.max(0,p.charge-CONFIG.wrongDrain);}
    if(p.charge>=CONFIG.maxCharge){p.charge=CONFIG.maxCharge;p.finishedAt=Number(atMs)||0;match.winnerId=p.id;finalizeMatch(match,p.finishedAt);}
    return {accepted:true,correct,charge:p.charge,finished:p.finishedAt!=null};
  }
  function setPlayerDirection(match,direction,active=true){
    if(!match)return false;const dir=String(direction||'').toLowerCase();
    if(active&&DIRECTIONS.includes(dir)){match.heldDirection=dir;return true;}
    if(!active&&(!dir||match.heldDirection===dir)){match.heldDirection=null;return true;}
    return false;
  }
  function pressPlayer(match,button,atMs){return applyAttempt(match,match?.player,match?.heldDirection,button,atMs);}
  function rotateSignal(match,p,atMs,rng){
    const profile=profileFor(match.difficulty),nextVersion=Number(p.signal?.version||0)+1;
    p.signal=newSignal(profile,rng,atMs,nextVersion);
    if(p===match.player)match.signal=p.signal;
    if(p.kind==='cpu'&&p.finishedAt==null)p.nextZapAt=(Number(atMs)||0)+reactionDelay(profile,rng);
  }
  function cpuZap(match,p,atMs,rng){
    const profile=profileFor(match.difficulty),mistake=rand(rng)<profile.errorChance;
    let direction=p.signal.direction,button=p.signal.button;
    if(mistake){if(rand(rng)<.5)direction=DIRECTIONS[(DIRECTIONS.indexOf(direction)+1+Math.floor(rand(rng)*3))%4];else button=button==='a'?'b':'a';}
    applyAttempt(match,p,direction,button,atMs);
    if(!match.finalized&&p.finishedAt==null)p.nextZapAt=(Number(atMs)||0)+zapDelay(profile,rng);
  }
  function nextEvent(match){
    let at=Infinity,type=null,player=null;
    for(const p of match.players){
      if(p.finishedAt!=null)continue;
      if(p.signal?.nextAt!=null&&p.signal.nextAt<at){at=p.signal.nextAt;type='signal';player=p;}
      if(p.kind==='cpu'&&p.nextZapAt!=null&&p.nextZapAt<at){at=p.nextZapAt;type='zap';player=p;}
    }
    return {at,type,player};
  }
  function advanceMatch(match,nowMs,rng=Math.random){
    if(!match||match.finalized)return match;const now=Number(nowMs)||0;if(now<match.lastAdvancedAt)return match;
    let guard=0;
    while(!match.finalized&&guard++<4096){const ev=nextEvent(match);if(!ev.type||ev.at>now)break;if(ev.type==='signal')rotateSignal(match,ev.player,ev.at,rng);else cpuZap(match,ev.player,ev.at,rng);}
    match.lastAdvancedAt=now;
    if(!match.finalized&&now-match.startedAt>=CONFIG.safetyCapMs)finalizeMatch(match,now);
    return match;
  }
  function rankMatch(match){return (match?.players||[]).slice().sort((a,b)=>{const af=a.finishedAt!=null,bf=b.finishedAt!=null;if(af&&bf)return a.finishedAt-b.finishedAt||a.index-b.index;if(af!==bf)return af?-1:1;return b.charge-a.charge||b.correctPresses-a.correctPresses||a.wrongPresses-b.wrongPresses||a.index-b.index;});}
  function finalizeMatch(match,nowMs){if(!match)return[];if(!match.finalized){match.finalized=true;match.finalizedAt=Number(nowMs)||0;match.ranking=rankMatch(match);}return (match.ranking||rankMatch(match)).slice();}
  function placeFor(match,id){const list=match?.ranking||rankMatch(match),i=list.findIndex(p=>p.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal,idx=Math.max(0,Math.min(3,(Number(place)||1)-1));return row[idx];}
  function accuracyFor(p){return p?.totalPresses?Number(p.correctPresses||0)/Number(p.totalPresses||1):0;}
  function shiftTimestamps(match,delta){if(!match||!delta)return match;match.startedAt+=delta;match.lastAdvancedAt+=delta;if(match.finalizedAt!=null)match.finalizedAt+=delta;for(const p of match.players){if(p.finishedAt!=null)p.finishedAt+=delta;if(p.nextZapAt!=null)p.nextZapAt+=delta;if(p.signal?.nextAt!=null)p.signal.nextAt+=delta;}return match;}
  return {DIRECTIONS,CONFIG,DIFFICULTIES,REWARDS,profileFor,createMatch,setPlayerDirection,pressPlayer,advanceMatch,rankMatch,finalizeMatch,placeFor,rewardFor,accuracyFor,shiftTimestamps};
});
