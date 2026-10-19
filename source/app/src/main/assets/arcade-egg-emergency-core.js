(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexEggEmergencyCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const LANES=Object.freeze([-1,0,1]);
  const CONFIG=Object.freeze({
    eggTarget:100,
    voltorbCount:12,
    dropIntervalMs:520,
    fallDurationMs:1500,
    voltorbPenalty:5,
    shockMs:340,
    countdownMs:3000
  });
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',cpuAccuracy:.66,reactionMs:720}),
    normal:Object.freeze({key:'normal',label:'Normal',cpuAccuracy:.80,reactionMs:600}),
    hard:Object.freeze({key:'hard',label:'Hard',cpuAccuracy:.92,reactionMs:470})
  });
  const REWARDS=Object.freeze({
    easy:Object.freeze([90,55,35,20]),
    normal:Object.freeze([125,80,50,25]),
    hard:Object.freeze([165,105,65,35])
  });

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999);
  const profileFor=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const laneFrom=value=>value<=-.5?-1:value>=.5?1:0;
  const randomLane=rng=>LANES[Math.floor(rand(rng)*LANES.length)];
  const wrongLane=(lane,rng)=>{const safe=LANES.filter(x=>x!==lane);return safe[Math.floor(rand(rng)*safe.length)];};
  const safeLane=(hazardLane,rng)=>wrongLane(hazardLane,rng);

  function countdownState(elapsedMs){
    const t=Math.max(0,Number(elapsedMs)||0);
    if(t>=CONFIG.countdownMs)return{label:'GO!',done:true};
    if(t>=2000)return{label:'1',done:false};
    if(t>=1000)return{label:'2',done:false};
    return{label:'3',done:false};
  }

  function createPlayer(id,index,kind){
    return {
      id,index,kind,
      label:id==='player'?'YOU':`COM ${index}`,
      lean:0,
      eggsCaught:0,
      eggsMissed:0,
      voltorbsCaught:0,
      voltorbsAvoided:0,
      shockUntil:0,
      lastDecisionEvent:null,
      perfectCatchStreak:0,
      bestCatchStreak:0
    };
  }

  function makeHazardSlots(rng){
    const used=new Set();
    for(let i=0;i<CONFIG.voltorbCount;i++){
      let slot=Math.round(7+i*8.55+(rand(rng)*4-2));
      slot=clamp(slot,5,CONFIG.eggTarget+CONFIG.voltorbCount-3);
      while(used.has(slot)&&slot<CONFIG.eggTarget+CONFIG.voltorbCount-2)slot++;
      while(used.has(slot)&&slot>5)slot--;
      used.add(slot);
    }
    return used;
  }

  function makeSchedule(rng=Math.random){
    const total=CONFIG.eggTarget+CONFIG.voltorbCount;
    const hazards=makeHazardSlots(rng);
    const out=[];
    for(let i=0;i<total;i++){
      const type=hazards.has(i)?'voltorb':'egg';
      const spawnAt=i*CONFIG.dropIntervalMs;
      out.push({
        id:`drop${i+1}`,
        index:i,
        type,
        lane:randomLane(rng),
        spawnAt,
        resolveAt:spawnAt+CONFIG.fallDurationMs,
        resolved:false
      });
    }
    return out;
  }

  function createGame({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const key=profileFor(difficulty).key;
    const players=[0,1,2,3].map(i=>createPlayer(i===0?'player':`cpu${i}`,i,i===0?'player':'cpu'));
    return {
      difficulty:key,
      phase:'ready',
      createdAt:Number(nowMs)||0,
      startedAt:null,
      lastAdvancedAt:null,
      finalized:false,
      finalizedAt:null,
      schedule:makeSchedule(rng),
      resolvedEvents:0,
      eggsResolved:0,
      hazardsResolved:0,
      players,
      player:players[0],
      ranking:null
    };
  }

  function startGame(game,atMs){
    if(!game||game.finalized)return false;
    const t=Number(atMs)||0;
    game.phase='running';game.startedAt=t;game.lastAdvancedAt=t;
    return true;
  }

  function setLean(player,value){if(!player)return false;player.lean=laneFrom(value);return true;}

  function resolveDropForPlayer(player,drop,atMs){
    if(!player||!drop)return{caught:false};
    const aligned=player.lean===drop.lane;
    if(drop.type==='voltorb'){
      if(!aligned){player.voltorbsAvoided++;return{caught:false,avoided:true,voltorb:true,penalty:0};}
      const before=Math.max(0,Number(player.eggsCaught)||0);
      player.eggsCaught=Math.max(0,before-CONFIG.voltorbPenalty);
      player.voltorbsCaught++;
      player.shockUntil=(Number(atMs)||0)+CONFIG.shockMs;
      player.perfectCatchStreak=0;
      return{caught:true,voltorb:true,penalty:CONFIG.voltorbPenalty,removed:before-player.eggsCaught};
    }
    if(aligned){
      player.eggsCaught++;
      player.perfectCatchStreak++;
      player.bestCatchStreak=Math.max(player.bestCatchStreak,player.perfectCatchStreak);
      return{caught:true,egg:true};
    }
    player.eggsMissed++;
    player.perfectCatchStreak=0;
    return{caught:false,egg:true,missed:true};
  }

  function decideCpuForDrop(cpu,drop,profile,rng){
    const accurate=rand(rng)<profile.cpuAccuracy;
    let lane;
    if(drop.type==='egg')lane=accurate?drop.lane:wrongLane(drop.lane,rng);
    else lane=accurate?safeLane(drop.lane,rng):drop.lane;
    cpu.lean=lane;
    cpu.lastDecisionEvent=drop.id;
    return lane;
  }

  function earliestActive(game,elapsed){
    return game.schedule.find(d=>!d.resolved&&d.spawnAt<=elapsed&&d.resolveAt>elapsed)||null;
  }

  function updateCpuLeans(game,elapsed,rng){
    const drop=earliestActive(game,elapsed);if(!drop)return;
    const profile=profileFor(game.difficulty);
    const age=elapsed-drop.spawnAt;
    if(age<profile.reactionMs)return;
    for(let i=1;i<game.players.length;i++){
      const cpu=game.players[i];
      if(cpu.lastDecisionEvent!==drop.id)decideCpuForDrop(cpu,drop,profile,rng);
    }
  }

  function resolveEvent(game,drop,absoluteMs,rng){
    const profile=profileFor(game.difficulty);
    for(let i=1;i<game.players.length;i++){
      const cpu=game.players[i];
      if(cpu.lastDecisionEvent!==drop.id)decideCpuForDrop(cpu,drop,profile,rng);
    }
    for(const p of game.players)resolveDropForPlayer(p,drop,absoluteMs);
    drop.resolved=true;
    game.resolvedEvents++;
    if(drop.type==='egg')game.eggsResolved++;else game.hazardsResolved++;
  }

  function rankGame(game){
    return (game?.players||[]).slice().sort((a,b)=>
      Number(b.eggsCaught||0)-Number(a.eggsCaught||0)||
      Number(a.voltorbsCaught||0)-Number(b.voltorbsCaught||0)||
      Number(a.eggsMissed||0)-Number(b.eggsMissed||0)||
      a.index-b.index
    );
  }
  function placeFor(game,id='player'){const i=rankGame(game).findIndex(p=>p.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[clamp((Number(place)||1)-1,0,3)];}
  function finalizeGame(game,atMs){if(!game)return[];if(!game.finalized){game.finalized=true;game.phase='finished';game.finalizedAt=Number(atMs)||0;game.ranking=rankGame(game);}return (game.ranking||rankGame(game)).slice();}

  function advanceGame(game,nowMs,rng=Math.random){
    if(!game||game.finalized||game.phase!=='running')return game;
    const now=Number(nowMs)||0;
    if(now<Number(game.lastAdvancedAt||game.startedAt||0))return game;
    const elapsed=Math.max(0,now-Number(game.startedAt||0));
    updateCpuLeans(game,elapsed,rng);
    for(const drop of game.schedule){
      if(drop.resolved||drop.resolveAt>elapsed)continue;
      resolveEvent(game,drop,Number(game.startedAt||0)+drop.resolveAt,rng);
    }
    game.lastAdvancedAt=now;
    if(game.resolvedEvents>=game.schedule.length)finalizeGame(game,now);
    return game;
  }

  function activeDrops(game,atMs){
    if(!game?.startedAt)return[];
    const elapsed=Math.max(0,(Number(atMs)||0)-Number(game.startedAt||0));
    return game.schedule.filter(d=>!d.resolved&&d.spawnAt<=elapsed&&d.resolveAt>elapsed).map(d=>({
      ...d,
      progress:clamp((elapsed-d.spawnAt)/(d.resolveAt-d.spawnAt),0,1)
    }));
  }

  function matchDurationMs(){
    const total=CONFIG.eggTarget+CONFIG.voltorbCount;
    return (total-1)*CONFIG.dropIntervalMs+CONFIG.fallDurationMs;
  }

  function shiftTimestamps(game,delta){
    if(!game||!Number(delta))return game;
    const d=Number(delta);
    for(const key of ['createdAt','startedAt','lastAdvancedAt','finalizedAt'])if(game[key]!=null)game[key]+=d;
    for(const p of game.players)if(p.shockUntil)p.shockUntil+=d;
    return game;
  }

  return Object.freeze({
    LANES,CONFIG,DIFFICULTIES,REWARDS,profileFor,countdownState,createPlayer,makeSchedule,createGame,startGame,setLean,
    resolveDropForPlayer,decideCpuForDrop,advanceGame,activeDrops,rankGame,placeFor,rewardFor,finalizeGame,matchDurationMs,shiftTimestamps
  });
});
