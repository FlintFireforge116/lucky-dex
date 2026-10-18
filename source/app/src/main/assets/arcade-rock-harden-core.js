(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexRockHardenCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const EPS=1e-7;
  const CONFIG=Object.freeze({
    startingHp:100,
    hardenDrainPerSecond:18,
    perfectLeadMs:110,
    goodLeadMs:260,
    safetyCapMs:45000,
    goldRoundChance:.10,
    endBufferMs:300
  });
  const ROSTER=Object.freeze([
    {dex:11,name:'Metapod'},{dex:14,name:'Kakuna'},{dex:204,name:'Pineco'},{dex:247,name:'Pupitar'},
    {dex:266,name:'Silcoon'},{dex:268,name:'Cascoon'},{dex:412,name:'Burmy'},{dex:541,name:'Swadloon'},
    {dex:544,name:'Whirlipede'},{dex:616,name:'Shelmet'},{dex:665,name:'Spewpa'},{dex:737,name:'Charjabug'},
    {dex:825,name:'Dottler'},{dex:917,name:'Tarountula'}
  ].map(x=>Object.freeze({...x,asset:`arcade/sprites/actors/pokemon/${x.dex}.png`})));
  const ROCK_CLASSES=Object.freeze({
    small:Object.freeze({key:'small',damage:18}),
    medium:Object.freeze({key:'medium',damage:26}),
    heavy:Object.freeze({key:'heavy',damage:34})
  });
  const HAZARDS=Object.freeze({
    caveRock:Object.freeze({key:'caveRock',kind:'rock',label:'Cave Rock',asset:'arcade/dash/gen3/cave-rock.png'}),
    routeRock:Object.freeze({key:'routeRock',kind:'rock',label:'Route Rock',asset:'arcade/dash/gen3/route-rock.png'}),
    lavaRock:Object.freeze({key:'lavaRock',kind:'rock',label:'Lava Rock',asset:'arcade/dash/gen3/lava-rock.png'}),
    iceRock:Object.freeze({key:'iceRock',kind:'rock',label:'Ice Rock',asset:'arcade/dash/gen3/ice-rock.png'}),
    graveler:Object.freeze({key:'graveler',kind:'pokemon',label:'Graveler',asset:'arcade/sprites/actors/pokemon/75.png',damage:42,rockClass:'heavy'}),
    golem:Object.freeze({key:'golem',kind:'pokemon',label:'Golem',asset:'arcade/sprites/actors/pokemon/76.png',damage:50,rockClass:'heavy'}),
    ferroseed:Object.freeze({key:'ferroseed',kind:'pokemon',label:'Ferroseed',asset:'arcade/sprites/actors/pokemon/597.png',damage:44,rockClass:'medium'}),
    pincurchin:Object.freeze({key:'pincurchin',kind:'pokemon',label:'Pincurchin',asset:'arcade/sprites/actors/pokemon/871.png',damage:46,rockClass:'medium'}),
    oran:Object.freeze({key:'oran',kind:'berry',label:'Oran Berry',asset:'adventure/art/objects/oran_berry.png',heal:20,rockClass:'small'}),
    sitrus:Object.freeze({key:'sitrus',kind:'berry',label:'Sitrus Berry',asset:'adventure/art/objects/sitrus_berry.png',heal:35,rockClass:'small'}),
    goldRock:Object.freeze({key:'goldRock',kind:'rock',label:'Gold Rock',asset:'arcade/dash/gen3/cave-rock.png',rockClass:'medium'})
  });
  const ROCK_HAZARD_KEYS=Object.freeze(['caveRock','routeRock','lavaRock','iceRock']);
  const POKEMON_HAZARD_KEYS=Object.freeze(['graveler','golem','ferroseed','pincurchin']);
  const BERRY_HAZARD_KEYS=Object.freeze(['oran','sitrus']);
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',telegraphLeadMs:1150,waveGapMs:[2400,2700],perfectRate:.37,missRate:.14,goodShare:.48,perfectLead:[45,108],goodLead:[150,255],safeLead:[360,680],postHold:[220,430]}),
    normal:Object.freeze({key:'normal',label:'Normal',telegraphLeadMs:900,waveGapMs:[2150,2450],perfectRate:.40,missRate:.09,goodShare:.84,perfectLead:[38,106],goodLead:[135,250],safeLead:[290,430],postHold:[120,240]}),
    hard:Object.freeze({key:'hard',label:'Hard',telegraphLeadMs:700,waveGapMs:[1900,2200],perfectRate:.76,missRate:.025,goodShare:.91,perfectLead:[28,103],goodLead:[125,238],safeLead:[275,335],postHold:[45,125]})
  });
  const REWARDS=Object.freeze({
    easy:Object.freeze([80,55,35,20]),
    normal:Object.freeze([100,70,45,25]),
    hard:Object.freeze([130,90,60,35])
  });
  const GOLD_PRIZES=Object.freeze({
    coins:Object.freeze({weight:.40,min:300,max:600}),
    dust:Object.freeze({weight:.30,min:40,max:80}),
    ticket:Object.freeze({weight:.15,amount:1}),
    card:Object.freeze({weight:.10}),
    booster:Object.freeze({weight:.05})
  });

  const finite=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp01=v=>Math.max(0,Math.min(.999999,finite(v)));
  const rand=rng=>clamp01((rng||Math.random)());
  const between=(rng,a,b)=>a+rand(rng)*(b-a);
  const randint=(rng,a,b)=>Math.floor(between(rng,a,b+1));
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}

  function shuffledRoster(rng){
    const arr=ROSTER.slice();
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(rand(rng)*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr;
  }
  function rockClassForRoll(v){return v<.35?'small':v<.78?'medium':'heavy';}
  function hazardForWave(rng){
    const p=rand(rng);
    if(p<.82){
      const key=ROCK_HAZARD_KEYS[Math.floor(rand(rng)*ROCK_HAZARD_KEYS.length)];
      const rockClass=rockClassForRoll(rand(rng));
      return {...HAZARDS[key],rockClass,damage:ROCK_CLASSES[rockClass].damage,heal:0};
    }
    if(p<.94){
      const key=POKEMON_HAZARD_KEYS[Math.floor(rand(rng)*POKEMON_HAZARD_KEYS.length)];
      return {...HAZARDS[key],heal:0};
    }
    const key=BERRY_HAZARD_KEYS[Math.floor(rand(rng)*BERRY_HAZARD_KEYS.length)];
    return {...HAZARDS[key],damage:0};
  }
  function buildWaves(start,rng,profile){
    const first=start+2500+Math.round(between(rng,0,350));
    const end=start+CONFIG.safetyCapMs-CONFIG.endBufferMs;
    const gapRange=profile.waveGapMs||[2150,2450],mean=(gapRange[0]+gapRange[1])/2;
    const count=Math.max(17,Math.ceil(Math.max(0,end-first)/mean)+1),raw=[];
    for(let i=1;i<count;i++)raw.push(between(rng,gapRange[0],gapRange[1]));
    const rawTotal=raw.reduce((n,v)=>n+v,0)||1,scale=Math.max(0,end-first)/rawTotal;
    const impacts=[first];let at=first;
    for(const gap of raw){at+=gap*scale;impacts.push(at);}
    return impacts.map((impactAt,i)=>{
      const hazard=hazardForWave(rng),rounded=Math.round(i===impacts.length-1?end:impactAt);
      const telegraphLeadMs=profile.key==='hard'?Math.round(between(rng,520,850)):profile.telegraphLeadMs;
      return {
        index:i,impactAt:rounded,telegraphLeadMs,telegraphAt:rounded-telegraphLeadMs,
        hazardKey:hazard.key,hazardKind:hazard.kind,label:hazard.label,asset:hazard.asset,
        rockClass:hazard.rockClass||'medium',damage:finite(hazard.damage),heal:finite(hazard.heal),
        gold:false,goldLane:null,processed:false,telegraphed:false,
        visualLaneOffsets:Object.freeze([-36,-12,12,36])
      };
    });
  }
  function _rollGoldPrize(rng=Math.random){
    const p=rand(rng);
    if(p<.40)return {category:'coins',coins:randint(rng,300,600),dust:0,tickets:0};
    if(p<.70)return {category:'dust',coins:0,dust:randint(rng,40,80),tickets:0};
    if(p<.85)return {category:'ticket',coins:0,dust:0,tickets:1};
    if(p<.95)return {category:'card',coins:0,dust:0,tickets:0};
    return {category:'booster',coins:0,dust:0,tickets:0};
  }
  function _rollFallbackPrize(rng=Math.random){
    const q=rand(rng)*.85;
    if(q<.40)return {category:'coins',coins:randint(rng,300,600),dust:0,tickets:0};
    if(q<.70)return {category:'dust',coins:0,dust:randint(rng,40,80),tickets:0};
    return {category:'ticket',coins:0,dust:0,tickets:1};
  }
  function createRacer(id,index,kind,species,start){
    return {
      id,index,kind,species,hp:CONFIG.startingHp,score:0,perfects:0,blocks:0,alive:true,hardened:false,hardenStartedAt:null,
      koAt:null,currentRock:null,lastGrade:null,lastImpactAt:null,hardenDrainPerSecond:CONFIG.hardenDrainPerSecond,physicsKey:'shared',
      lastAdvancedAt:start,wastedHardenMs:0,cpuActions:[]
    };
  }
  function leadFor(profile,grade,rng){
    const range=grade==='perfect'?profile.perfectLead:grade==='good'?profile.goodLead:profile.safeLead;
    return Math.round(between(rng,range[0],range[1]));
  }
  function cpuGrade(profile,rng){
    const p=rand(rng);
    if(p<profile.missRate)return 'miss';
    if(p<profile.missRate+profile.perfectRate)return 'perfect';
    return rand(rng)<profile.goodShare?'good':'safe';
  }
  function buildCpuActions(racer,waves,profile,rng){
    racer.cpuActions=waves.map(wave=>{
      if(wave.hazardKind==='berry')return {waveIndex:wave.index,expectedGrade:'collect',pressAt:null,releaseAt:null,donePress:true,doneRelease:true};
      const expectedGrade=cpuGrade(profile,rng);
      if(expectedGrade==='miss')return {waveIndex:wave.index,expectedGrade,pressAt:null,releaseAt:null,donePress:true,doneRelease:true};
      const leadMs=leadFor(profile,expectedGrade,rng);
      const postHoldMs=Math.round(between(rng,profile.postHold[0],profile.postHold[1]));
      return {waveIndex:wave.index,expectedGrade,leadMs,postHoldMs,pressAt:wave.impactAt-leadMs,releaseAt:wave.impactAt+postHoldMs,donePress:false,doneRelease:false};
    });
  }
  function createRound({difficulty='normal',rng=Math.random,nowMs=0,roster=null,goldRoundChance=CONFIG.goldRoundChance}={}){
    const start=finite(nowMs),profile=difficultyProfile(difficulty);
    const requested=Array.isArray(roster)?roster.map(x=>ROSTER.find(r=>r.dex===Number(x?.dex??x))).filter(Boolean):[];
    const chosen=requested.length>=4&&new Set(requested.slice(0,4).map(x=>x.dex)).size===4?requested.slice(0,4):shuffledRoster(rng).slice(0,4);
    const waves=buildWaves(start,rng,profile);
    const racers=chosen.map((species,index)=>createRacer(index===0?'player':`cpu${index}`,index,index===0?'player':'cpu',species,start));
    const chance=Math.max(0,Math.min(1,finite(goldRoundChance)));const goldPresent=rand(rng)<chance;
    let goldWaveIndex=null;
    if(goldPresent){
      goldWaveIndex=4+Math.floor(rand(rng)*Math.max(1,waves.length-4));
      goldWaveIndex=Math.min(waves.length-1,goldWaveIndex);
      Object.assign(waves[goldWaveIndex],{gold:true,goldLane:'player',hazardKey:'goldRock',hazardKind:'rock',label:HAZARDS.goldRock.label,asset:HAZARDS.goldRock.asset,rockClass:'medium',damage:ROCK_CLASSES.medium.damage,heal:0});
    }
    const prize=goldPresent?_rollGoldPrize(rng):null;
    const fallbackPrize=goldPresent?_rollFallbackPrize(rng):null;
    for(const racer of racers)if(racer.kind==='cpu')buildCpuActions(racer,waves,profile,rng);
    const round={
      difficulty:profile.key,startedAt:start,safetyCapAt:start+CONFIG.safetyCapMs,racers,player:racers[0],waves,nextWaveIndex:0,
      finalized:false,finishedAt:null,ranking:null,events:[],lastAdvancedAt:start,
      gold:{present:goldPresent,waveIndex:goldWaveIndex,seen:false,perfected:false,lost:false,prize,fallbackPrize}
    };
    return round;
  }

  function emit(round,type,data={}){round.events.push({type,at:data.at==null?round.lastAdvancedAt:data.at,...data});}
  function koRacer(round,racer,at,cause){
    if(!racer.alive)return;
    racer.hp=0;racer.alive=false;racer.hardened=false;racer.hardenStartedAt=null;racer.koAt=at;
    emit(round,'ko',{at,racerId:racer.id,cause});
  }
  function drainAll(round,from,to){
    if(to<=from)return;
    const newlyKo=[];
    for(const racer of round.racers){
      if(!racer.alive||!racer.hardened)continue;
      const rate=finite(racer.hardenDrainPerSecond)||CONFIG.hardenDrainPerSecond;
      const span=to-from;
      racer.hp=Math.max(0,racer.hp-rate*span/1000);
      racer.wastedHardenMs+=span;
      if(racer.hp<=EPS)newlyKo.push(racer);
    }
    for(const racer of newlyKo)koRacer(round,racer,to,'hardenDrain');
  }
  function hardenDepletionAt(racer,cursor){
    if(!racer.alive||!racer.hardened)return Infinity;
    const rate=finite(racer.hardenDrainPerSecond)||CONFIG.hardenDrainPerSecond;
    return cursor+racer.hp/rate*1000;
  }
  function gradeForLead(leadMs){
    if(leadMs<0)return null;
    if(leadMs<=CONFIG.perfectLeadMs)return 'perfect';
    if(leadMs<=CONFIG.goodLeadMs)return 'good';
    return 'safe';
  }
  function gradePoints(grade){return grade==='perfect'?3:grade==='good'?2:grade==='safe'?1:0;}
  function pressRacer(racer,at){
    if(!racer||!racer.alive||racer.hardened)return false;
    racer.hardened=true;racer.hardenStartedAt=at;return true;
  }
  function releaseRacer(racer){
    if(!racer||!racer.hardened)return false;
    racer.hardened=false;racer.hardenStartedAt=null;return true;
  }
  function processTelegraph(round,wave){
    if(wave.telegraphed)return;wave.telegraphed=true;
    for(const racer of round.racers){
      if(racer.alive)racer.currentRock={waveIndex:wave.index,hazardKey:wave.hazardKey,hazardKind:wave.hazardKind,label:wave.label,asset:wave.asset,rockClass:wave.rockClass,damage:wave.damage,heal:wave.heal,telegraphLeadMs:wave.telegraphLeadMs,gold:wave.gold&&racer.id==='player',impactAt:wave.impactAt};
    }
    emit(round,'telegraph',{at:wave.telegraphAt,waveIndex:wave.index,hazardKey:wave.hazardKey,hazardKind:wave.hazardKind,label:wave.label,rockClass:wave.rockClass,impactAt:wave.impactAt,telegraphLeadMs:wave.telegraphLeadMs});
    if(wave.gold&&round.gold.present&&!round.gold.seen){round.gold.seen=true;emit(round,'goldSeen',{at:wave.telegraphAt,waveIndex:wave.index});}
  }
  function processImpactForRacer(round,wave,racer){
    if(!racer.alive)return;
    const lead=racer.hardened&&racer.hardenStartedAt!=null?wave.impactAt-racer.hardenStartedAt:null;
    const grade=racer.hardened?gradeForLead(lead):null;
    racer.lastImpactAt=wave.impactAt;
    if(wave.hazardKind==='berry'){
      if(racer.hardened){
        racer.lastGrade='berry-missed';
        emit(round,'berryMissed',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id,hazardKey:wave.hazardKey,label:wave.label});
      }else{
        const before=racer.hp,heal=Math.max(0,finite(wave.heal));
        racer.hp=Math.min(CONFIG.startingHp,racer.hp+heal);racer.lastGrade='heal';
        emit(round,'heal',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id,hazardKey:wave.hazardKey,label:wave.label,heal:racer.hp-before});
      }
      emit(round,'impact',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id,grade:racer.lastGrade,hazardKey:wave.hazardKey,hazardKind:wave.hazardKind,rockClass:wave.rockClass,gold:false});
      racer.currentRock=null;return;
    }
    if(grade){
      const points=gradePoints(grade);
      racer.lastGrade=grade;racer.blocks+=1;racer.score+=points;if(grade==='perfect')racer.perfects+=1;
      emit(round,'block',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id,grade,points,leadMs:lead,hazardKey:wave.hazardKey,hazardKind:wave.hazardKind,gold:wave.gold&&racer.id==='player'});
      if(wave.gold&&racer.id==='player'&&round.gold.present&&!round.gold.perfected&&!round.gold.lost){
        if(grade==='perfect'){round.gold.perfected=true;emit(round,'goldPerfect',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id});}
        else round.gold.lost=true;
      }
    }else{
      racer.lastGrade='miss';racer.hp=Math.max(0,racer.hp-wave.damage);
      emit(round,'miss',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id,damage:wave.damage,hazardKey:wave.hazardKey,hazardKind:wave.hazardKind,label:wave.label,gold:wave.gold&&racer.id==='player'});
      if(wave.gold&&racer.id==='player'&&round.gold.present&&!round.gold.perfected)round.gold.lost=true;
      if(racer.hp<=EPS)koRacer(round,racer,wave.impactAt,wave.hazardKind==='pokemon'?'pokemon':'rock');
    }
    emit(round,'impact',{at:wave.impactAt,waveIndex:wave.index,racerId:racer.id,grade:racer.lastGrade,hazardKey:wave.hazardKey,hazardKind:wave.hazardKind,rockClass:wave.rockClass,gold:wave.gold&&racer.id==='player'});
    racer.currentRock=null;
  }
  function processImpact(round,wave){
    if(wave.processed)return;wave.processed=true;
    for(const racer of round.racers)processImpactForRacer(round,wave,racer);
    round.nextWaveIndex=Math.max(round.nextWaveIndex,wave.index+1);
  }
  function cpuActionAt(racer,at,kind){
    for(const action of racer.cpuActions){
      if(kind==='press'&&!action.donePress&&action.pressAt!=null&&Math.abs(action.pressAt-at)<=EPS)return action;
      if(kind==='release'&&!action.doneRelease&&action.releaseAt!=null&&Math.abs(action.releaseAt-at)<=EPS)return action;
    }
    return null;
  }
  function nextEventTime(round,cursor,target){
    let next=Infinity;
    const consider=t=>{if(t>=cursor-EPS&&t<=target+EPS&&t<next)next=t;};
    for(const wave of round.waves){if(!wave.telegraphed)consider(wave.telegraphAt);if(!wave.processed)consider(wave.impactAt);}
    for(const racer of round.racers){
      if(racer.kind!=='cpu'||!racer.alive)continue;
      for(const action of racer.cpuActions){if(!action.donePress&&action.pressAt!=null)consider(action.pressAt);if(!action.doneRelease&&action.releaseAt!=null)consider(action.releaseAt);}
      consider(hardenDepletionAt(racer,cursor));
    }
    consider(hardenDepletionAt(round.player,cursor));
    if(!round.finalized)consider(round.safetyCapAt);
    return next;
  }
  function metricCompare(a,b){
    if(a.alive!==b.alive)return a.alive?-1:1;
    if(a.alive){return finite(b.score)-finite(a.score)||finite(b.hp)-finite(a.hp)||a.index-b.index;}
    const ak=a.koAt==null?-Infinity:finite(a.koAt),bk=b.koAt==null?-Infinity:finite(b.koAt);
    return bk-ak||finite(b.score)-finite(a.score)||a.index-b.index;
  }
  function rankRound(round){return (round?.racers||[]).slice().sort(metricCompare);}
  function outranks(a,b){
    if(a.alive!==b.alive)return a.alive&&!b.alive;
    if(a.alive){return finite(a.score)>finite(b.score)||(finite(a.score)===finite(b.score)&&finite(a.hp)>finite(b.hp));}
    const ak=a.koAt==null?-Infinity:finite(a.koAt),bk=b.koAt==null?-Infinity:finite(b.koAt);
    return ak>bk||(ak===bk&&finite(a.score)>finite(b.score));
  }
  function placeFor(round,id){
    const target=(round?.racers||[]).find(r=>r.id===id);if(!target)return 4;
    return 1+(round.racers||[]).filter(r=>r!==target&&outranks(r,target)).length;
  }
  function finalizeRound(round,at){
    if(round.finalized)return round;
    round.finalized=true;round.finishedAt=at;round.ranking=rankRound(round);
    emit(round,'roundEnd',{at,ranking:round.ranking.map(r=>r.id)});
    return round;
  }
  function maybeFinalize(round,at,{force=false}={}){
    if(round.finalized)return true;
    const alive=round.racers.filter(r=>r.alive).length;
    const cpuHasWon=alive===1&&!round.player.alive;
    if(force||alive===0||cpuHasWon){finalizeRound(round,at);return true;}
    return false;
  }
  function processAt(round,at){
    for(const wave of round.waves)if(!wave.telegraphed&&Math.abs(wave.telegraphAt-at)<=EPS)processTelegraph(round,wave);
    for(const racer of round.racers){
      if(racer.kind!=='cpu'||!racer.alive)continue;
      for(let action=cpuActionAt(racer,at,'press');action;action=cpuActionAt(racer,at,'press')){action.donePress=true;pressRacer(racer,at);}
    }
    for(const wave of round.waves)if(!wave.processed&&Math.abs(wave.impactAt-at)<=EPS)processImpact(round,wave);
    for(const racer of round.racers){
      if(racer.kind!=='cpu')continue;
      for(let action=cpuActionAt(racer,at,'release');action;action=cpuActionAt(racer,at,'release')){action.doneRelease=true;releaseRacer(racer);}
    }
    if(at>=round.safetyCapAt-EPS)maybeFinalize(round,round.safetyCapAt,{force:true});
    else maybeFinalize(round,at);
  }
  function advanceRound(round,nowMs){
    if(!round||round.finalized)return round;
    const target=Math.max(round.lastAdvancedAt,finite(nowMs));
    let cursor=round.lastAdvancedAt,guard=0;
    while(!round.finalized&&guard++<8192){
      const next=nextEventTime(round,cursor,target);
      if(!Number.isFinite(next)||next>target+EPS)break;
      if(next>cursor+EPS)drainAll(round,cursor,next);
      else if(next>cursor)drainAll(round,cursor,next);
      round.lastAdvancedAt=next;for(const racer of round.racers)racer.lastAdvancedAt=next;
      processAt(round,next);
      cursor=next;
      if(next>=target-EPS)break;
      // Every event at `next` has been consumed; pending event search now advances naturally.
    }
    if(!round.finalized&&target>cursor+EPS){
      drainAll(round,cursor,target);round.lastAdvancedAt=target;for(const racer of round.racers)racer.lastAdvancedAt=target;
      maybeFinalize(round,target);
    }
    return round;
  }
  function pressPlayer(round,nowMs){
    if(!round||round.finalized)return false;
    const now=Math.max(round.lastAdvancedAt,finite(nowMs));advanceRound(round,now);
    if(round.finalized)return false;
    return pressRacer(round.player,now);
  }
  function releasePlayer(round,nowMs){
    if(!round)return false;
    const now=Math.max(round.lastAdvancedAt,finite(nowMs));advanceRound(round,now);
    return releaseRacer(round.player);
  }
  function shiftRoundTimestamps(round,deltaMs){
    const d=finite(deltaMs);if(!round||!d)return round;
    round.startedAt+=d;round.safetyCapAt+=d;round.lastAdvancedAt+=d;
    for(const wave of round.waves){wave.impactAt+=d;wave.telegraphAt+=d;}
    for(const racer of round.racers){
      if(racer.hardenStartedAt!=null)racer.hardenStartedAt+=d;
      if(racer.koAt!=null)racer.koAt+=d;
      if(racer.lastImpactAt!=null)racer.lastImpactAt+=d;
      if(racer.lastAdvancedAt!=null)racer.lastAdvancedAt+=d;
      for(const action of racer.cpuActions||[]){if(action.pressAt!=null)action.pressAt+=d;if(action.releaseAt!=null)action.releaseAt+=d;}
    }
    if(round.finishedAt!=null)round.finishedAt+=d;
    for(const event of round.events)if(event.at!=null)event.at+=d;
    return round;
  }
  function consumeEvents(round){const out=(round?.events||[]).slice();if(round)round.events.length=0;return out;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal;return row[Math.max(0,Math.min(3,Math.trunc(finite(place)||1)-1))];}

  return {CONFIG,ROSTER,ROCK_CLASSES,HAZARDS,DIFFICULTIES,REWARDS,GOLD_PRIZES,difficultyProfile,createRound,pressPlayer,releasePlayer,advanceRound,shiftRoundTimestamps,consumeEvents,rankRound,placeFor,rewardFor,_rollGoldPrize,_rollFallbackPrize};
});
