(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexEagerEeveeCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({rounds:10,countdownMs:3000,minRevealMs:1050,maxRevealMs:2300,revealWindowMs:1250,resultHoldMs:620,pinecoChance:.18});
  const FRUITS=Object.freeze([
    Object.freeze({kind:'fruit',key:'oranBerry',name:'Oran Berry',asset:'arcade/sprites/items/oran-berry.png'}),
    Object.freeze({kind:'fruit',key:'cheriBerry',name:'Cheri Berry',asset:'arcade/sprites/items/cheri-berry.png'}),
    Object.freeze({kind:'fruit',key:'chestoBerry',name:'Chesto Berry',asset:'arcade/sprites/items/chesto-berry.png'}),
    Object.freeze({kind:'fruit',key:'aspearBerry',name:'Aspear Berry',asset:'arcade/sprites/items/aspear-berry.png'})
  ]);
  const PINECO=Object.freeze({kind:'pineco',key:'pineco',name:'Pineco',asset:'arcade/sprites/actors/pokemon/204.png'});
  const PERSONALITIES=Object.freeze([
    Object.freeze({key:'aggressive',label:'Aggressive',reactionBias:-80,baitChance:.72,feintChance:.24}),
    Object.freeze({key:'cautious',label:'Cautious',reactionBias:85,baitChance:.18,feintChance:.08}),
    Object.freeze({key:'chaotic',label:'Chaotic',reactionBias:10,baitChance:.46,feintChance:.34})
  ]);
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',reactionMs:820,reactionSpread:260,baitScale:.82,feintScale:.55,minRevealMs:1250,maxRevealMs:2700,revealWindowMs:1650}),
    normal:Object.freeze({key:'normal',label:'Normal',reactionMs:360,reactionSpread:180,baitScale:1,feintScale:1,minRevealMs:1050,maxRevealMs:2300,revealWindowMs:1250}),
    hard:Object.freeze({key:'hard',label:'Hard',reactionMs:245,reactionSpread:130,baitScale:.88,feintScale:1.05,minRevealMs:1000,maxRevealMs:2200,revealWindowMs:1250})
  });
  const REWARDS=Object.freeze({easy:[90,55,35,20],normal:[125,80,50,25],hard:[165,105,65,35]});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  function seededRng(seed=1){let s=(Number(seed)||1)>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/0x100000000);}
  function profileFor(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function shuffle(rng,list){const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(rand(rng)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function countdownState(ms){const t=Math.max(0,Number(ms)||0);if(t>=3000)return{label:'GO!',done:true};if(t>=2000)return{label:'1',done:false};if(t>=1000)return{label:'2',done:false};return{label:'3',done:false};}
  function createPlayer(id,index,kind,personality=null){return{id,index,kind,label:id==='player'?'YOU':`COM ${index}`,personality,score:0,roundWins:0,pinecoHits:0,falseStarts:0,feints:0,skipNext:false,sittingOut:false,lockedRound:false,lastFeintAt:0,nextActionAt:null,dashingUntil:0};}
  function createGame({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const personalities=shuffle(rng,PERSONALITIES.map(p=>p.key));
    const players=[createPlayer('player',0,'player'),...personalities.map((p,i)=>createPlayer(`cpu${i+1}`,i+1,'cpu',p))];
    return{difficulty:profileFor(difficulty).key,createdAt:Number(nowMs)||0,startedAt:null,lastAdvancedAt:null,phase:'ready',roundIndex:-1,round:null,players,player:players[0],finalized:false,finalizedAt:null,ranking:null};
  }
  function playerById(game,id){return game?.players?.find(p=>p.id===id)||null;}
  function personalityFor(player){return PERSONALITIES.find(p=>p.key===player?.personality)||PERSONALITIES[1];}
  function randomTarget(rng){if(rand(rng)<CONFIG.pinecoChance)return PINECO;return FRUITS[Math.floor(rand(rng)*FRUITS.length)];}
  function prepareRound(game,atMs,rng){
    for(const p of game.players){p.sittingOut=!!p.skipNext;p.skipNext=false;p.lockedRound=false;p.nextActionAt=null;}
    const profile=profileFor(game?.difficulty);
    const startAt=Number(atMs)||0;
    const minReveal=profile.minRevealMs||CONFIG.minRevealMs,maxReveal=profile.maxRevealMs||CONFIG.maxRevealMs;
    game.round={index:game.roundIndex,state:'hidden',target:null,startAt,revealAt:startAt+minReveal+rand(rng)*(maxReveal-minReveal),resolvedAt:null,claimedBy:null,lastFeintBy:null};
    return game.round;
  }
  function startGame(game,atMs,rng=Math.random){if(!game||game.finalized)return false;const t=Number(atMs)||0;game.phase='running';game.startedAt=t;game.lastAdvancedAt=t;game.roundIndex=0;prepareRound(game,t,rng);return true;}
  function startNextRound(game,atMs,rng=Math.random){if(!game||game.finalized)return false;if(game.roundIndex>=CONFIG.rounds-1){finalizeGame(game,atMs);return false;}game.roundIndex++;prepareRound(game,atMs,rng);return true;}
  function scheduleCpuReactions(game,atMs,rng){const profile=profileFor(game.difficulty);for(const p of game.players.slice(1)){if(p.sittingOut||p.lockedRound){p.nextActionAt=null;continue;}const persona=personalityFor(p);p.nextActionAt=Number(atMs)+Math.max(90,profile.reactionMs+persona.reactionBias+(rand(rng)-.5)*profile.reactionSpread);}}
  function forceReveal(game,target,atMs,rng=Math.random){if(!game?.round||game.round.state!=='hidden')return false;game.round.target={...(target||randomTarget(rng))};game.round.state='revealed';game.round.revealAt=Number(atMs)||game.round.revealAt;scheduleCpuReactions(game,game.round.revealAt,rng);return true;}
  function dash(game,id,atMs){const p=playerById(game,id);const r=game?.round;if(!p||!r||game.finalized||p.sittingOut||p.lockedRound)return{accepted:false};const t=Number(atMs)||0;p.dashingUntil=t+240;
    if(r.state==='hidden'){p.falseStarts++;p.lockedRound=true;return{accepted:false,falseStart:true};}
    if(r.state!=='revealed'||r.claimedBy)return{accepted:false};
    r.claimedBy=p.id;r.state='resolved';r.resolvedAt=t;p.roundWins++;
    if(r.target?.kind==='pineco'){p.pinecoHits++;p.skipNext=true;return{accepted:true,claimed:true,pineco:true,skipNext:true};}
    p.score++;return{accepted:true,claimed:true,fruit:true,score:p.score};
  }
  function reactCpusToFeint(game,sourceId,atMs,rng=Math.random){if(!game?.round||game.round.state!=='hidden')return 0;let baited=0;const profile=profileFor(game.difficulty);for(const p of game.players.slice(1)){if(p.id===sourceId||p.sittingOut||p.lockedRound)continue;const chance=personalityFor(p).baitChance*profile.baitScale;if(rand(rng)<chance){p.falseStarts++;p.lockedRound=true;p.dashingUntil=Number(atMs)+220;baited++;}}return baited;}
  function feint(game,id,atMs,rng=Math.random){const p=playerById(game,id);if(!p||!game?.round||game.round.state!=='hidden'||p.sittingOut||p.lockedRound)return{accepted:false};p.feints++;p.lastFeintAt=Number(atMs)||0;game.round.lastFeintBy=id;const baited=reactCpusToFeint(game,id,atMs,rng);return{accepted:true,baited};}
  function maybeCpuFeints(game,now,rng){if(game.round.state!=='hidden')return;const profile=profileFor(game.difficulty);const minReveal=profile.minRevealMs||CONFIG.minRevealMs;const age=now-game.round.startAt;if(age<350||age>minReveal-100)return;for(const p of game.players.slice(1)){if(p.sittingOut||p.lockedRound||p.lastFeintAt>=game.round.startAt)continue;const persona=personalityFor(p);if(rand(rng)<persona.feintChance*.012*(profile.feintScale||1)){p.feints++;p.lastFeintAt=now;game.round.lastFeintBy=p.id;reactCpusToFeint(game,p.id,now,rng);}}
  }
  function advanceGame(game,nowMs,rng=Math.random){if(!game||game.finalized||game.phase!=='running'||!game.round)return game;const now=Number(nowMs)||0;if(now<Number(game.lastAdvancedAt||0))return game;const r=game.round;
    if(r.state==='hidden'){maybeCpuFeints(game,now,rng);if(now>=r.revealAt)forceReveal(game,randomTarget(rng),r.revealAt,rng);}
    if(game.round.state==='revealed'){
      for(const p of game.players.slice(1)){if(game.round.state!=='revealed')break;if(p.nextActionAt!=null&&now>=p.nextActionAt){p.nextActionAt=null;dash(game,p.id,now);}}
      if(game.round.state==='revealed'&&now>=game.round.revealAt+(profileFor(game.difficulty).revealWindowMs||CONFIG.revealWindowMs)){game.round.state='resolved';game.round.resolvedAt=now;}
    }
    if(game.round.state==='resolved'&&now>=Number(game.round.resolvedAt||now)+CONFIG.resultHoldMs){if(game.roundIndex>=CONFIG.rounds-1)finalizeGame(game,now);else startNextRound(game,now,rng);}
    game.lastAdvancedAt=now;return game;
  }
  function rankGame(game){return (game?.players||[]).slice().sort((a,b)=>b.score-a.score||a.pinecoHits-b.pinecoHits||a.falseStarts-b.falseStarts||a.index-b.index);}
  function placeFor(game,id='player'){const i=rankGame(game).findIndex(p=>p.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[clamp((Number(place)||1)-1,0,3)];}
  function finalizeGame(game,atMs){if(!game)return[];if(!game.finalized){game.finalized=true;game.phase='finished';game.finalizedAt=Number(atMs)||0;game.ranking=rankGame(game);}return (game.ranking||rankGame(game)).slice();}
  function shiftTimestamps(game,delta){if(!game||!Number(delta))return game;const d=Number(delta);for(const k of ['createdAt','startedAt','lastAdvancedAt','finalizedAt'])if(game[k]!=null)game[k]+=d;if(game.round){for(const k of ['startAt','revealAt','resolvedAt'])if(game.round[k]!=null)game.round[k]+=d;}for(const p of game.players){if(p.lastFeintAt)p.lastFeintAt+=d;if(p.nextActionAt!=null)p.nextActionAt+=d;if(p.dashingUntil)p.dashingUntil+=d;}return game;}
  return Object.freeze({CONFIG,FRUITS,PINECO,PERSONALITIES,DIFFICULTIES,REWARDS,seededRng,profileFor,countdownState,createPlayer,createGame,startGame,startNextRound,forceReveal,dash,feint,reactCpusToFeint,advanceGame,rankGame,placeFor,rewardFor,finalizeGame,shiftTimestamps});
});
