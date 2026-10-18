(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexSushiGoRoundCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const CONFIG=Object.freeze({
    durationMs:60000,
    plateCount:12,
    ringCount:3,
    lapMs:7200,
    comboCap:5,
    hotStunMs:1800,
    eatCooldownMs:220,
    respawnDelayMs:900,
    plateLifetimeMs:10800,
    cpuStartDelayMs:350,
    reachDegrees:19,
    respawnClearanceDegrees:28,
    stations:Object.freeze({player:0,cpu1:1,cpu2:2,cpu3:3}),
    stationAngles:Object.freeze({player:180,cpu1:90,cpu2:0,cpu3:270}),
    ringOffsets:Object.freeze([-10,0,10]),
    bigBill:15000
  });
  const SUSHI=Object.freeze([
    Object.freeze({id:'uni',name:'Uni',value:1000,tier:'orange',hot:false,mark:'UNI'}),
    Object.freeze({id:'toro',name:'Toro',value:600,tier:'red',hot:false,mark:'TORO'}),
    Object.freeze({id:'ebi',name:'Ebi',value:350,tier:'yellow',hot:false,mark:'EBI'}),
    Object.freeze({id:'ikura',name:'Ikura',value:250,tier:'orange',hot:false,mark:'IKURA'}),
    Object.freeze({id:'tekka',name:'Tekka',value:200,tier:'red',hot:false,mark:'TEKKA'}),
    Object.freeze({id:'tamago',name:'Tamago',value:150,tier:'yellow',hot:false,mark:'EGG'}),
    Object.freeze({id:'kappa',name:'Kappa Maki',value:50,tier:'green',hot:false,mark:'KAPPA'}),
    Object.freeze({id:'agari',name:'Hot Tea',value:20,tier:'tea',hot:true,mark:'HOT'})
  ]);
  const SUSHI_BY_ID=Object.freeze(Object.fromEntries(SUSHI.map(x=>[x.id,x])));
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',takeChance:.34,valueWeight:.12,comboWeight:.08,hotAversion:.30,decisionCooldownMs:1000}),
    normal:Object.freeze({key:'normal',label:'Normal',takeChance:.48,valueWeight:.24,comboWeight:.17,hotAversion:.58,decisionCooldownMs:850}),
    hard:Object.freeze({key:'hard',label:'Hard',takeChance:.58,valueWeight:.34,comboWeight:.24,hotAversion:.85,decisionCooldownMs:780})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([100,65,40,25]),normal:Object.freeze([130,85,55,30]),hard:Object.freeze([160,105,70,40])});
  const LICKITUNG=Object.freeze({dex:108,name:'Lickitung'});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rand=rng=>clamp(Number((rng||Math.random)())||0,0,.999999);
  const normDeg=n=>((Number(n)||0)%360+360)%360;
  const angleDistance=(a,b)=>Math.abs((((normDeg(a)-normDeg(b))+540)%360)-180);
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function createRacer(id,index,kind){return {id,index,kind,label:id==='player'?'YOU':`COM ${index}`,species:{...LICKITUNG},bill:0,eaten:0,combo:0,bestCombo:0,lastType:null,lastEatAt:null,stunnedUntil:0,hotPenalties:0,lastGain:0,lastReachSignature:'',nextCpuDecisionAt:0};}
  function sushiFromRoll(rng){
    const x=rand(rng);
    const thresholds=[.035,.10,.22,.36,.52,.69,.86,1];
    return SUSHI[thresholds.findIndex(t=>x<t)];
  }
  function makePlate(round,rng,nowMs){
    const s=sushiFromRoll(rng),id=`plate-${++round.nextPlateId}`;
    return {id,type:s.id,name:s.name,value:s.value,hot:!!s.hot,tier:s.tier,mark:s.mark,bornAt:Number(nowMs??round?.startedAt??0)||0};
  }
  function trackForSlot(slot){
    const n=((Math.trunc(Number(slot)||0)%CONFIG.plateCount)+CONFIG.plateCount)%CONFIG.plateCount;
    const ring=Math.floor(n/4),stationIndex=n%4;
    const stationBase=[180,90,0,270][stationIndex];
    return {slot:n,ring,stationIndex,baseAngle:normDeg(stationBase+CONFIG.ringOffsets[ring])};
  }
  function plateAngleDeg(round,slot,nowMs){
    const track=trackForSlot(slot),elapsed=(Number(nowMs)||0)-Number(round?.startedAt||0);
    return normDeg(track.baseAngle+(elapsed/CONFIG.lapMs)*360);
  }
  function createRound({difficulty='normal',rng=Math.random,nowMs=0}={}){
    const start=Number(nowMs)||0,profile=difficultyProfile(difficulty);
    const racers=[createRacer('player',0,'player'),createRacer('cpu1',1,'cpu'),createRacer('cpu2',2,'cpu'),createRacer('cpu3',3,'cpu')];
    const round={difficulty:profile.key,startedAt:start,endsAt:start+CONFIG.durationMs,cpuReadyAt:start+CONFIG.cpuStartDelayMs,racers,player:racers[0],plates:new Array(CONFIG.plateCount).fill(null),pendingRespawns:[],nextPlateId:0,finalized:false,finalizedAt:null,ranking:null};
    for(let i=0;i<CONFIG.plateCount;i++){
      const ageOffset=Math.floor((i/CONFIG.plateCount)*CONFIG.plateLifetimeMs);
      round.plates[i]=makePlate(round,rng,start-ageOffset);
    }
    return round;
  }
  function stationFor(id){return CONFIG.stations[id];}
  // Legacy helper retained for older tests/saves; new gameplay uses reachablePlates/eatPlate.
  function plateAt(round,id='player'){const slot=stationFor(id);return slot==null?null:round?.plates?.[slot]||null;}
  function isStunned(racer,nowMs){return Number(racer?.stunnedUntil||0)>Number(nowMs||0);}
  function reachablePlates(round,id='player',nowMs=0){
    if(!round)return[];
    const stationAngle=CONFIG.stationAngles[id];if(stationAngle==null)return[];
    const rows=[];
    for(let slot=0;slot<CONFIG.plateCount;slot++){
      const plate=round.plates[slot];if(!plate)continue;
      const angle=plateAngleDeg(round,slot,nowMs),distance=angleDistance(angle,stationAngle),track=trackForSlot(slot);
      if(distance<=CONFIG.reachDegrees)rows.push({slot,plate,ring:track.ring,angle,distance});
    }
    return rows.sort((a,b)=>a.distance-b.distance||b.plate.value-a.plate.value||a.ring-b.ring);
  }

  function queueRespawn(round,slot,plate,nowMs,reason='refresh'){
    round.plates[slot]=null;
    round.pendingRespawns.push({slot,plate,reason,enteredAt:Number(nowMs)||0,dueAt:(Number(nowMs)||0)+CONFIG.respawnDelayMs});
  }

  function consumePlate(round,racer,slot,nowMs){
    const plate=round.plates[slot];if(!plate)return {accepted:false,reason:'empty'};
    const same=racer.lastType===plate.type;racer.combo=same?Math.min(CONFIG.comboCap,Number(racer.combo||0)+1):1;racer.bestCombo=Math.max(Number(racer.bestCombo||0),racer.combo);racer.lastType=plate.type;
    const gain=Number(plate.value||0)*racer.combo;racer.bill+=gain;racer.eaten++;racer.lastGain=gain;racer.lastEatAt=Number(nowMs)||0;
    if(plate.hot){racer.stunnedUntil=(Number(nowMs)||0)+CONFIG.hotStunMs;racer.hotPenalties++;}
    queueRespawn(round,slot,plate,nowMs,'eaten');
    return {accepted:true,plate,slot,ring:trackForSlot(slot).ring,gain,multiplier:racer.combo,hot:!!plate.hot,bill:racer.bill};
  }
  function racerFor(round,id){return round?.racers?.find(r=>r.id===id)||null;}
  function canEat(racer,nowMs){
    const now=Number(nowMs)||0;if(!racer)return {ok:false,reason:'racer'};
    if(isStunned(racer,now))return {ok:false,reason:'stunned'};
    if(racer.lastEatAt!=null&&now-Number(racer.lastEatAt)<CONFIG.eatCooldownMs)return {ok:false,reason:'cooldown'};
    return {ok:true};
  }
  function eatPlate(round,id='player',plateId,nowMs=0){
    if(!round||round.finalized)return {accepted:false,reason:'finished'};
    const now=Number(nowMs)||0;if(now>=round.endsAt){finalizeRound(round,now);return {accepted:false,reason:'finished'};}
    const racer=racerFor(round,id),gate=canEat(racer,now);if(!gate.ok)return {accepted:false,reason:gate.reason};
    const slot=round.plates.findIndex(p=>p?.id===plateId);if(slot<0)return {accepted:false,reason:'plate'};
    const reachable=reachablePlates(round,id,now).some(x=>x.slot===slot);if(!reachable)return {accepted:false,reason:'out-of-reach'};
    return consumePlate(round,racer,slot,now);
  }
  function eatAtStation(round,id='player',nowMs=0){
    if(!round||round.finalized)return {accepted:false,reason:'finished'};
    const racer=racerFor(round,id),now=Number(nowMs)||0,gate=canEat(racer,now);if(!gate.ok)return {accepted:false,reason:gate.reason};
    if(now>=round.endsAt){finalizeRound(round,now);return {accepted:false,reason:'finished'};}
    const slot=stationFor(id);if(slot==null)return {accepted:false,reason:'station'};
    return consumePlate(round,racer,slot,now);
  }
  function cpuWantsPlate(racer,plate,profile,rng){
    if(!plate)return false;
    const valueScore=clamp(Number(plate.value||0)/1000,0,1)*profile.valueWeight;
    const comboScore=racer.lastType===plate.type?profile.comboWeight:0;
    const hotPenalty=plate.hot?profile.hotAversion:0;
    const chance=clamp(profile.takeChance+valueScore+comboScore-hotPenalty,0.03,.985);
    return rand(rng)<chance;
  }
  function cpuChoice(racer,choices,profile,rng){
    if(!choices.length)return null;
    const scored=choices.map(c=>{
      const combo=racer.lastType===c.plate.type?profile.comboWeight*1000:0;
      const hot=c.plate.hot?-profile.hotAversion*1100:0;
      const noise=rand(rng)*(profile.key==='hard'?80:profile.key==='normal'?220:430);
      return {choice:c,score:c.plate.value*(.45+profile.valueWeight)+combo+hot+noise};
    }).sort((a,b)=>b.score-a.score);
    return scored[0]?.choice||null;
  }
  function processCpuStations(round,at,rng){
    if(Number(at||0)<Number(round.cpuReadyAt||0))return;
    const profile=difficultyProfile(round.difficulty);
    for(let i=1;i<round.racers.length;i++){
      const racer=round.racers[i];if(!canEat(racer,at).ok||Number(at||0)<Number(racer.nextCpuDecisionAt||0))continue;
      const choices=reachablePlates(round,racer.id,at),signature=choices.map(c=>c.plate.id).sort().join('|');
      if(!signature){racer.lastReachSignature='';continue;}
      if(signature===racer.lastReachSignature)continue;
      racer.lastReachSignature=signature;racer.nextCpuDecisionAt=Number(at||0)+Number(profile.decisionCooldownMs||0);
      const choice=cpuChoice(racer,choices,profile,rng);
      if(choice&&cpuWantsPlate(racer,choice.plate,profile,rng))consumePlate(round,racer,choice.slot,at);
    }
  }

  function cycleAgedPlates(round,nowMs){
    if(!round||round.finalized)return;
    const now=Number(nowMs)||0;
    const candidates=[];
    for(let slot=0;slot<round.plates.length;slot++){
      const plate=round.plates[slot];
      if(!plate)continue;
      const age=now-Number(plate.bornAt||round.startedAt||0);
      if(age>=CONFIG.plateLifetimeMs)candidates.push({slot,plate,age});
    }
    candidates.sort((a,b)=>b.age-a.age||a.slot-b.slot);
    for(const item of candidates.slice(0,2))queueRespawn(round,item.slot,item.plate,now,'cycled');
  }

  function slotClearOfStations(round,slot,nowMs){
    const angle=plateAngleDeg(round,slot,nowMs);
    return Object.values(CONFIG.stationAngles).every(station=>angleDistance(angle,station)>CONFIG.respawnClearanceDegrees);
  }
  function respawnDue(round,nowMs,rng){
    const keep=[];
    for(const item of round.pendingRespawns){
      if(Number(item.dueAt||0)<=nowMs&&round.plates[item.slot]==null&&slotClearOfStations(round,item.slot,nowMs))round.plates[item.slot]=makePlate(round,rng,nowMs);
      else keep.push(item);
    }
    round.pendingRespawns=keep;
  }
  function rankRound(round){return (round?.racers||[]).slice().sort((a,b)=>Number(b.bill||0)-Number(a.bill||0)||Number(b.eaten||0)-Number(a.eaten||0)||Number(b.bestCombo||0)-Number(a.bestCombo||0)||a.index-b.index);}
  function finalizeRound(round,nowMs){if(!round)return[];if(!round.finalized){round.finalized=true;round.finalizedAt=Math.max(round.endsAt,Number(nowMs)||round.endsAt);round.ranking=rankRound(round);}return round.ranking.slice();}
  function advanceRound(round,nowMs,rng=Math.random){
    if(!round||round.finalized)return round;const now=Number(nowMs)||0;
    cycleAgedPlates(round,now);
    respawnDue(round,now,rng);processCpuStations(round,now,rng);
    if(now>=round.endsAt)finalizeRound(round,now);return round;
  }
  function placeFor(round,id='player'){const i=rankRound(round).findIndex(r=>r.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal,idx=clamp(Math.trunc(Number(place)||1)-1,0,3);return row[idx];}
  function remainingMs(round,nowMs){return Math.max(0,Number(round?.endsAt||0)-Number(nowMs||0));}

  return {CONFIG,SUSHI,SUSHI_BY_ID,DIFFICULTIES,REWARDS,LICKITUNG,difficultyProfile,createRound,trackForSlot,plateAngleDeg,reachablePlates,eatPlate,eatAtStation,advanceRound,rankRound,finalizeRound,placeFor,rewardFor,plateAt,isStunned,cpuWantsPlate,remainingMs,angleDistance};
});
