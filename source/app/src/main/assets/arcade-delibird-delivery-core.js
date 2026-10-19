(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexDelibirdDeliveryCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    durationMs:60000,
    countdownMs:3000,
    maxCarry:5,
    width:100,
    height:100,
    homeY:10,
    giftMinY:58,
    giftMaxY:90,
    baseSpeed:35,
    pickupRadius:5.2,
    bankRadius:8,
    swinubCollisionRadius:5.4,
    stunMs:850,
    hitGraceMs:1050,
    maxStepMs:40,
    giftTargetCount:14,
    maxSwinub:3
  });

  const GIFTS=Object.freeze([
    Object.freeze({key:'candy',name:'Candy',points:20,weight:.10,visual:'🍬'}),
    Object.freeze({key:'stocking',name:'Stocking',points:50,weight:.18,visual:'🧦'}),
    Object.freeze({key:'gameBoy',name:'Game Boy',points:100,weight:.35,visual:'GB'}),
    Object.freeze({key:'n64',name:'Nintendo 64',points:250,weight:.50,visual:'64'}),
    Object.freeze({key:'snorlax',name:'Snorlax Doll',points:350,weight:.80,visual:'143'}),
    Object.freeze({key:'piano',name:'Piano',points:600,weight:1.10,visual:'🎹'}),
    Object.freeze({key:'ring',name:'Ring',points:1000,weight:.12,visual:'💍'})
  ]);

  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',cpuThinkMs:410,bankThreshold:2,cpuSteerNoise:.13,swinubSpeed:.92}),
    normal:Object.freeze({key:'normal',label:'Normal',cpuThinkMs:285,bankThreshold:3,cpuSteerNoise:.075,swinubSpeed:1}),
    hard:Object.freeze({key:'hard',label:'Hard',cpuThinkMs:190,bankThreshold:4,cpuSteerNoise:.035,swinubSpeed:1.08})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([100,65,40,25]),normal:Object.freeze([135,90,55,30]),hard:Object.freeze([175,115,75,40])});

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  const between=(rng,a,b)=>a+rand(rng)*(b-a);
  const profileFor=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const dist=(a,b)=>Math.hypot(Number(a.x||0)-Number(b.x||0),Number(a.y||0)-Number(b.y||0));
  function shuffle(rng,list){const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(rand(rng)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function countdownState(elapsedMs){const t=Math.max(0,Number(elapsedMs)||0);if(t>=3000)return{label:'GO!',done:true};if(t>=2000)return{label:'1',done:false};if(t>=1000)return{label:'2',done:false};return{label:'3',done:false};}
  function giftByKey(key){return GIFTS.find(g=>g.key===key)||GIFTS[0];}
  function createPlayer(id,index,kind){const x=[14,38,62,86][index]||14;return{id,index,kind,label:id==='player'?'YOU':`COM ${index}`,x,y:CONFIG.homeY+3,homeX:x,inputX:0,inputY:0,carried:[],score:0,delivered:0,bestMatchChain:0,bigBagDeliveries:0,swinubHits:0,stunnedUntil:0,hitGraceUntil:0,targetGiftId:null,nextThinkAt:0};}
  function makeGiftDeck(rng){return shuffle(rng,GIFTS.flatMap(g=>[{...g},{...g}]));}
  function spawnGift(game,rng){
    if(!game.deck.length)game.deck=makeGiftDeck(rng);
    const base=game.deck.pop()||GIFTS[0];
    const gift={...base,id:`gift${++game.giftSeq}`,x:between(rng,7,93),y:between(rng,CONFIG.giftMinY,CONFIG.giftMaxY)};
    game.gifts.push(gift);return gift;
  }
  function makeSwinub(index,profile,rng){
    const dir=index%2===0?1:-1;
    return{id:`swinub${index+1}`,x:dir>0?-8:108,y:35+index*14,vx:dir*(14+index*2)*profile.swinubSpeed,phase:between(rng,0,Math.PI*2)};
  }
  function createGame({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const profile=profileFor(difficulty),players=[0,1,2,3].map(i=>createPlayer(i===0?'player':`cpu${i}`,i,i===0?'player':'cpu'));
    const game={difficulty:profile.key,phase:'ready',createdAt:Number(nowMs)||0,startedAt:null,endsAt:null,lastAdvancedAt:null,finalized:false,finalizedAt:null,players,player:players[0],gifts:[],giftSeq:0,deck:makeGiftDeck(rng),swinub:[],ranking:null};
    for(let i=0;i<CONFIG.giftTargetCount;i++)spawnGift(game,rng);
    for(let i=0;i<CONFIG.maxSwinub;i++)game.swinub.push(makeSwinub(i,profile,rng));
    return game;
  }
  function startGame(game,atMs){if(!game||game.finalized)return false;const t=Number(atMs)||0;game.phase='running';game.startedAt=t;game.endsAt=t+CONFIG.durationMs;game.lastAdvancedAt=t;for(const p of game.players)p.nextThinkAt=t;return true;}
  function setInput(player,x,y){if(!player)return false;player.inputX=clamp(x,-1,1);player.inputY=clamp(y,-1,1);return true;}
  function speedForPlayer(player){
    const list=Array.isArray(player?.carried)?player.carried:[];
    const burden=list.length*.045+list.reduce((n,g)=>n+Number(g.weight||0)*.055,0);
    return CONFIG.baseSpeed*clamp(1-burden,.53,1);
  }
  function collectGift(player,gift){
    if(!player||!gift)return{accepted:false,reason:'invalid'};
    if(player.carried.length>=CONFIG.maxCarry)return{accepted:false,reason:'full',count:player.carried.length};
    player.carried.push({...gift});return{accepted:true,count:player.carried.length};
  }
  function bankCarried(player){
    if(!player||!player.carried.length)return{accepted:false,basePoints:0,comboBonus:0,totalPoints:0,count:0,bestChain:0};
    let basePoints=0,totalPoints=0,bestChain=0,chain=0,last=null;
    for(const gift of player.carried){
      const points=Math.max(0,Number(gift.points)||0);basePoints+=points;
      chain=gift.key===last?chain+1:1;last=gift.key;bestChain=Math.max(bestChain,chain);
      totalPoints+=points*Math.min(3,chain);
    }
    const count=player.carried.length,comboBonus=totalPoints-basePoints;
    player.score+=totalPoints;player.delivered+=count;player.bestMatchChain=Math.max(player.bestMatchChain,bestChain);if(count===CONFIG.maxCarry)player.bigBagDeliveries++;
    player.carried=[];
    return{accepted:true,basePoints,comboBonus,totalPoints,count,bestChain};
  }
  function hitSwinub(player,atMs){
    if(!player)return{dropped:0};const now=Number(atMs)||0;if(now<Number(player.hitGraceUntil||0))return{dropped:0,ignored:true};
    const dropped=player.carried.length;player.carried=[];player.swinubHits++;player.stunnedUntil=now+CONFIG.stunMs;player.hitGraceUntil=now+CONFIG.hitGraceMs;return{dropped};
  }
  function rankGame(game){return (game?.players||[]).slice().sort((a,b)=>Number(b.score||0)-Number(a.score||0)||Number(b.delivered||0)-Number(a.delivered||0)||a.index-b.index);}
  function placeFor(game,id='player'){const i=rankGame(game).findIndex(p=>p.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[clamp((Number(place)||1)-1,0,3)];}
  function removeGift(game,gift){const i=game.gifts.findIndex(g=>g.id===gift.id);if(i>=0)game.gifts.splice(i,1);}
  function tryPickup(game,player,rng){
    if(player.carried.length>=CONFIG.maxCarry)return false;
    let best=null,bestD=Infinity;for(const g of game.gifts){const d=dist(player,g);if(d<=CONFIG.pickupRadius&&d<bestD){best=g;bestD=d;}}
    if(!best)return false;collectGift(player,best);removeGift(game,best);spawnGift(game,rng);return true;
  }
  function tryBank(player){return player.y<=CONFIG.homeY+5&&Math.abs(player.x-player.homeX)<=CONFIG.bankRadius?bankCarried(player):null;}
  function movePlayer(player,dt,now){
    if(now<Number(player.stunnedUntil||0))return;
    const speed=speedForPlayer(player),x=Number(player.inputX)||0,y=Number(player.inputY)||0,mag=Math.hypot(x,y),scale=mag>1?1/mag:1;
    player.x=clamp(player.x+x*scale*speed*dt,3,97);player.y=clamp(player.y+y*scale*speed*dt,6,95);
  }
  function chooseCpuTarget(game,cpu,profile,rng,now){
    const carriedValue=cpu.carried.reduce((n,g)=>n+g.points,0),full=cpu.carried.length>=CONFIG.maxCarry;
    if(cpu.carried.length&&(full||cpu.carried.length>=profile.bankThreshold||carriedValue>=900)){cpu.targetGiftId=null;return{x:cpu.homeX,y:CONFIG.homeY};}
    let best=null,bestScore=-Infinity;
    for(const g of game.gifts){
      const d=Math.max(3,dist(cpu,g)),score=(g.points+70)/d;
      if(score>bestScore){best=g;bestScore=score;}
    }
    cpu.targetGiftId=best?.id||null;cpu.nextThinkAt=now+profile.cpuThinkMs;return best||{x:cpu.homeX,y:75};
  }
  function stepCpu(game,cpu,profile,dt,now,rng){
    let target=null;
    if(cpu.carried.length&&(cpu.carried.length>=CONFIG.maxCarry||cpu.carried.length>=profile.bankThreshold||cpu.carried.reduce((n,g)=>n+g.points,0)>=900))target={x:cpu.homeX,y:CONFIG.homeY};
    else target=game.gifts.find(g=>g.id===cpu.targetGiftId)||null;
    if(!target||now>=cpu.nextThinkAt)target=chooseCpuTarget(game,cpu,profile,rng,now);
    let dx=target.x-cpu.x,dy=target.y-cpu.y,mag=Math.hypot(dx,dy)||1;
    let ix=dx/mag,iy=dy/mag;
    // Lightweight hazard awareness: sidestep a nearby Swinub instead of receiving a hidden speed bonus.
    for(const s of game.swinub){if(dist(cpu,s)<13){iy+=cpu.y<s.y?-.45:.45;ix+=cpu.x<s.x?-.18:.18;}}
    ix+=between(rng,-profile.cpuSteerNoise,profile.cpuSteerNoise);iy+=between(rng,-profile.cpuSteerNoise,profile.cpuSteerNoise);setInput(cpu,ix,iy);movePlayer(cpu,dt,now);
  }
  function stepSwinub(game,dt){
    for(const s of game.swinub){s.x+=s.vx*dt;if(s.vx>0&&s.x>108)s.x=-8;else if(s.vx<0&&s.x<-8)s.x=108;s.y+=Math.sin(s.phase+s.x*.05)*.025;}
  }
  function resolveInteractions(game,now,rng){
    for(const p of game.players){
      tryPickup(game,p,rng);tryBank(p);
      for(const s of game.swinub){if(dist(p,s)<=CONFIG.swinubCollisionRadius){hitSwinub(p,now);break;}}
    }
  }
  function finalizeGame(game,atMs){if(!game)return[];if(!game.finalized){game.finalized=true;game.phase='finished';game.finalizedAt=Number(atMs)||0;game.ranking=rankGame(game);}return (game.ranking||rankGame(game)).slice();}
  function advanceGame(game,nowMs,rng=Math.random){
    if(!game||game.finalized||game.phase!=='running')return game;const now=Number(nowMs)||0;if(now<=Number(game.lastAdvancedAt||0))return game;
    const profile=profileFor(game.difficulty);let cursor=Number(game.lastAdvancedAt||game.startedAt||0),guard=0;
    while(cursor<now&&!game.finalized&&guard++<4096){const end=Math.min(now,cursor+CONFIG.maxStepMs,game.endsAt),dt=Math.max(0,end-cursor)/1000;movePlayer(game.player,dt,end);for(let i=1;i<game.players.length;i++)stepCpu(game,game.players[i],profile,dt,end,rng);stepSwinub(game,dt);resolveInteractions(game,end,rng);cursor=end;if(cursor>=game.endsAt){finalizeGame(game,game.endsAt);break;}}
    game.lastAdvancedAt=Math.min(now,game.endsAt);return game;
  }
  function shiftTimestamps(game,delta){if(!game||!Number(delta))return game;const d=Number(delta);for(const k of ['createdAt','startedAt','endsAt','lastAdvancedAt','finalizedAt'])if(game[k]!=null)game[k]+=d;for(const p of game.players){p.stunnedUntil+=d;p.hitGraceUntil+=d;p.nextThinkAt+=d;}return game;}

  return {CONFIG,GIFTS,DIFFICULTIES,REWARDS,profileFor,countdownState,giftByKey,createGame,startGame,setInput,speedForPlayer,collectGift,bankCarried,hitSwinub,advanceGame,finalizeGame,rankGame,placeFor,rewardFor,shiftTimestamps};
});
