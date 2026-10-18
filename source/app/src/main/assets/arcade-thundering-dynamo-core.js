(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexThunderingDynamoCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({maxCharge:100,correctCharge:3,wrongDrain:6,lampMinMs:700,lampMaxMs:1100,transitionMs:300,safetyCapMs:45000});
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',reactionMinMs:230,reactionMaxMs:390,tapIntervalMinMs:160,tapIntervalMaxMs:230,errorChance:.12}),
    normal:Object.freeze({key:'normal',label:'Normal',reactionMinMs:140,reactionMaxMs:260,tapIntervalMinMs:110,tapIntervalMaxMs:170,errorChance:.07}),
    hard:Object.freeze({key:'hard',label:'Hard',reactionMinMs:90,reactionMaxMs:170,tapIntervalMinMs:90,tapIntervalMaxMs:130,errorChance:.025})
  });
  const REWARDS=Object.freeze({
    easy:Object.freeze([80,55,35,20]),
    normal:Object.freeze([100,70,45,25]),
    hard:Object.freeze([130,90,60,35])
  });
  const SPECIES=Object.freeze({25:Object.freeze({dex:25,name:'Pikachu'}),100:Object.freeze({dex:100,name:'Voltorb'})});
  const clamp01=v=>Math.max(0,Math.min(.999999,Number(v)||0));
  const rand=rng=>clamp01((rng||Math.random)());
  const between=(rng,min,max)=>min+rand(rng)*(max-min);
  const other=button=>button==='a'?'b':'a';
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function speciesFor(rng){return SPECIES[rand(rng)<.5?25:100];}
  function lampDelay(rng){return Math.round(between(rng,CONFIG.lampMinMs,CONFIG.lampMaxMs));}
  function reactionDelay(profile,rng){return Math.round(between(rng,profile.reactionMinMs,profile.reactionMaxMs));}
  function tapDelay(profile,rng){return Math.round(between(rng,profile.tapIntervalMinMs,profile.tapIntervalMaxMs));}
  function createRacer(id,index,kind,rng){return {id,index,kind,species:{...speciesFor(rng)},charge:0,correctPresses:0,wrongPresses:0,totalPresses:0,lastPressAt:null,lastCorrectAt:null,finishedAt:null,nextTapAt:null,lampVersionSeen:0};}
  function createRace({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const profile=difficultyProfile(difficulty),start=Number(nowMs)||0,lamp=rand(rng)<.5?'a':'b';
    const racers=[createRacer('player',0,'player',rng),createRacer('cpu1',1,'cpu',rng),createRacer('cpu2',2,'cpu',rng),createRacer('cpu3',3,'cpu',rng)];
    const race={difficulty:profile.key,startedAt:start,lastAdvancedAt:start,lamp,pendingLamp:null,lampVersion:1,nextLampAt:start+lampDelay(rng),transitionEndsAt:null,racers,player:racers[0],winnerId:null,finalized:false,finalizedAt:null,ranking:null};
    for(const cpu of racers.slice(1)){cpu.lampVersionSeen=race.lampVersion;cpu.nextTapAt=start+reactionDelay(profile,rng);}
    return race;
  }
  function applyPress(race,racer,button,atMs){
    if(!race||!racer||race.finalized||racer.finishedAt!=null||race.lamp==='neutral'||!['a','b'].includes(button))return {accepted:false,correct:false,charge:Number(racer?.charge||0),finished:Boolean(racer?.finishedAt!=null)};
    const correct=button===race.lamp;
    racer.totalPresses=Number(racer.totalPresses||0)+1;racer.lastPressAt=Number(atMs)||0;
    if(correct){racer.correctPresses=Number(racer.correctPresses||0)+1;racer.lastCorrectAt=racer.lastPressAt;racer.charge=Math.min(CONFIG.maxCharge,Number(racer.charge||0)+CONFIG.correctCharge);}
    else{racer.wrongPresses=Number(racer.wrongPresses||0)+1;racer.charge=Math.max(0,Number(racer.charge||0)-CONFIG.wrongDrain);}
    if(racer.charge>=CONFIG.maxCharge&&racer.finishedAt==null){racer.charge=CONFIG.maxCharge;racer.finishedAt=racer.lastPressAt;race.winnerId=racer.id;finalizeRace(race,racer.lastPressAt);}
    return {accepted:true,correct,charge:racer.charge,finished:racer.finishedAt!=null};
  }
  function pressPlayer(race,button,atMs){return applyPress(race,race?.player,String(button||'').toLowerCase(),atMs);}
  function beginLampTransition(race,atMs){
    if(!race||race.finalized||race.lamp==='neutral')return;
    race.pendingLamp=race.difficulty==='hard'?'random':other(race.lamp);race.lamp='neutral';race.nextLampAt=null;race.transitionEndsAt=(Number(atMs)||0)+CONFIG.transitionMs;
    for(const cpu of race.racers.slice(1)){if(cpu.finishedAt==null)cpu.nextTapAt=null;}
  }
  function finishLampTransition(race,atMs,rng){
    if(!race||race.finalized||race.lamp!=='neutral')return;
    race.lamp=race.pendingLamp==='random'?(rand(rng)<.5?'a':'b'):(race.pendingLamp||'a');race.pendingLamp=null;race.transitionEndsAt=null;race.lampVersion++;race.nextLampAt=(Number(atMs)||0)+lampDelay(rng);
    const profile=difficultyProfile(race.difficulty);
    for(const cpu of race.racers.slice(1)){if(cpu.finishedAt!=null)continue;cpu.lampVersionSeen=race.lampVersion;cpu.nextTapAt=(Number(atMs)||0)+reactionDelay(profile,rng);}
  }
  function cpuPress(race,cpu,atMs,rng){
    if(!race||race.lamp==='neutral')return;
    const profile=difficultyProfile(race.difficulty),button=rand(rng)<profile.errorChance?other(race.lamp):race.lamp;
    applyPress(race,cpu,button,atMs);if(!race.finalized&&cpu.finishedAt==null)cpu.nextTapAt=(Number(atMs)||0)+tapDelay(profile,rng);
  }
  function advanceRace(race,nowMs,rng=Math.random){
    if(!race||race.finalized)return race;const now=Number(nowMs)||0;if(now<race.lastAdvancedAt)return race;
    let guard=0;
    while(!race.finalized&&guard++<4096){
      let eventAt=race.lamp==='neutral'?race.transitionEndsAt:race.nextLampAt,eventType=race.lamp==='neutral'?'transition':'lamp',cpu=null;
      if(eventAt==null)break;
      if(race.lamp!=='neutral')for(const r of race.racers.slice(1)){if(r.finishedAt==null&&r.nextTapAt!=null&&r.nextTapAt<eventAt){eventAt=r.nextTapAt;eventType='cpu';cpu=r;}}
      if(eventAt>now)break;
      if(eventType==='lamp')beginLampTransition(race,eventAt);
      else if(eventType==='transition')finishLampTransition(race,eventAt,rng);
      else cpuPress(race,cpu,eventAt,rng);
    }
    race.lastAdvancedAt=now;
    if(!race.finalized&&now-race.startedAt>=CONFIG.safetyCapMs)finalizeRace(race,now);
    return race;
  }
  function rankRace(race){
    const racers=(race?.racers||[]).slice();
    return racers.sort((a,b)=>{
      const af=a.finishedAt!=null,bf=b.finishedAt!=null;if(af&&bf)return a.finishedAt-b.finishedAt||a.index-b.index;if(af!==bf)return af?-1:1;
      return Number(b.charge||0)-Number(a.charge||0)||Number(b.correctPresses||0)-Number(a.correctPresses||0)||Number(a.wrongPresses||0)-Number(b.wrongPresses||0)||a.index-b.index;
    });
  }
  function finalizeRace(race,nowMs){if(!race)return[];if(!race.finalized){race.finalized=true;race.finalizedAt=Number(nowMs)||0;race.ranking=rankRace(race);}return (race.ranking||rankRace(race)).slice();}
  function placeFor(race,id){const ranking=race?.ranking||rankRace(race),i=ranking.findIndex(r=>r.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal,idx=Math.max(0,Math.min(3,Math.trunc(Number(place)||1)-1));return row[idx];}
  function accuracyFor(racer){const total=Number(racer?.totalPresses||0);return total?Number(racer.correctPresses||0)/total:0;}
  function shiftRaceTimestamps(race,delta){if(!race||!delta)return race;race.startedAt+=delta;race.lastAdvancedAt+=delta;if(race.nextLampAt!=null)race.nextLampAt+=delta;if(race.transitionEndsAt!=null)race.transitionEndsAt+=delta;if(race.finalizedAt!=null)race.finalizedAt+=delta;for(const r of race.racers){if(r.lastPressAt!=null)r.lastPressAt+=delta;if(r.lastCorrectAt!=null)r.lastCorrectAt+=delta;if(r.finishedAt!=null)r.finishedAt+=delta;if(r.nextTapAt!=null)r.nextTapAt+=delta;}return race;}
  return {CONFIG,DIFFICULTIES,REWARDS,SPECIES,difficultyProfile,createRace,pressPlayer,advanceRace,rankRace,finalizeRace,placeFor,rewardFor,accuracyFor,shiftRaceTimestamps};
});
