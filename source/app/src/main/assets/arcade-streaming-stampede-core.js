(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexStreamingStampedeCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const ROUND_MAX_POINTS=Object.freeze([10,10,20,20,40]);
  const AVATARS=Object.freeze([173,174]);
  const SPECIES=Object.freeze([
    Object.freeze({id:19,name:'Rattata'}),Object.freeze({id:52,name:'Meowth'}),Object.freeze({id:54,name:'Psyduck'}),
    Object.freeze({id:84,name:'Doduo'}),Object.freeze({id:161,name:'Sentret'}),Object.freeze({id:163,name:'Hoothoot'}),
    Object.freeze({id:179,name:'Mareep'}),Object.freeze({id:183,name:'Marill'}),Object.freeze({id:190,name:'Aipom'}),
    Object.freeze({id:194,name:'Wooper'}),Object.freeze({id:209,name:'Snubbull'}),Object.freeze({id:220,name:'Swinub'})
  ]);
  const ROUND_CONFIG=Object.freeze([
    Object.freeze({min:10,max:13,targetMin:4,targetMax:6,lanes:2,gapMin:460,gapMax:620,travelMin:4200,travelMax:4700}),
    Object.freeze({min:12,max:16,targetMin:5,targetMax:8,lanes:3,gapMin:390,gapMax:540,travelMin:3800,travelMax:4400}),
    Object.freeze({min:15,max:19,targetMin:6,targetMax:9,lanes:4,gapMin:320,gapMax:460,travelMin:3450,travelMax:4050}),
    Object.freeze({min:18,max:23,targetMin:8,targetMax:12,lanes:4,gapMin:255,gapMax:365,travelMin:3100,travelMax:3650}),
    Object.freeze({min:22,max:28,targetMin:22,targetMax:28,lanes:4,gapMin:190,gapMax:290,travelMin:2850,travelMax:3400})
  ]);
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',exactChance:.24,oneOffChance:.34,maxAnswerError:4,countScale:.88,gapScale:1.14,travelScale:1.12,entryMs:1600,promptMs:950}),
    normal:Object.freeze({key:'normal',label:'Normal',exactChance:.44,oneOffChance:.34,maxAnswerError:3,countScale:.95,gapScale:1.06,travelScale:1.05,entryMs:1500,promptMs:900}),
    hard:Object.freeze({key:'hard',label:'Hard',exactChance:.68,oneOffChance:.25,maxAnswerError:2,countScale:1,gapScale:1,travelScale:1,entryMs:1400,promptMs:850})
  });
  const REWARDS=Object.freeze({easy:Object.freeze([100,65,40,25]),normal:Object.freeze([135,90,55,30]),hard:Object.freeze([175,115,75,40])});
  const clamp01=v=>Math.max(0,Math.min(.999999,Number(v)||0));
  const rand=rng=>clamp01((rng||Math.random)());
  const int=(rng,min,max)=>Math.floor(min+rand(rng)*(max-min+1));
  const pick=(rng,list)=>list[Math.min(list.length-1,Math.floor(rand(rng)*list.length))];
  const profileFor=key=>DIFFICULTIES[key]||DIFFICULTIES.normal;
  const speciesName=id=>SPECIES.find(s=>s.id===Number(id))?.name||`Pokémon ${id}`;
  const scaledRange=(min,max,scale)=>{
    const a=Math.max(1,Math.round(min*scale));
    const b=Math.max(a,Math.round(max*scale));
    return [a,b];
  };
  function roundConfigFor(index,difficulty='normal'){
    const base=ROUND_CONFIG[index];
    const profile=profileFor(difficulty);
    if(!base)return null;
    const [min,max]=scaledRange(base.min,base.max,profile.countScale);
    const [targetMin,targetMax]=scaledRange(base.targetMin,base.targetMax,profile.countScale);
    return {
      ...base,
      min,max,targetMin,targetMax,
      gapMin:Math.max(100,Math.round(base.gapMin*profile.gapScale)),
      gapMax:Math.max(110,Math.round(base.gapMax*profile.gapScale)),
      travelMin:Math.max(800,Math.round(base.travelMin*profile.travelScale)),
      travelMax:Math.max(900,Math.round(base.travelMax*profile.travelScale)),
      entryMs:profile.entryMs,
      promptMs:profile.promptMs
    };
  }
  function shuffle(rng,list){const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(rand(rng)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function makeStream(index,targetId,difficulty,rng){
    const cfg=roundConfigFor(index,difficulty),total=int(rng,cfg.min,cfg.max),final=index===4;
    const targetCount=final?total:Math.min(total-2,int(rng,cfg.targetMin,cfg.targetMax));
    const distractors=SPECIES.filter(s=>s.id!==targetId),ids=[];
    if(final){for(let i=0;i<total;i++)ids.push(pick(rng,SPECIES).id);}
    else{
      for(let i=0;i<targetCount;i++)ids.push(targetId);
      for(let i=targetCount;i<total;i++)ids.push(pick(rng,distractors).id);
    }
    const ordered=shuffle(rng,ids);let cursor=450;
    return ordered.map((speciesId,i)=>{
      cursor+=int(rng,cfg.gapMin,cfg.gapMax);
      return {id:`r${index+1}p${i+1}`,speciesId,lane:int(rng,0,cfg.lanes-1),startMs:cursor,durationMs:int(rng,cfg.travelMin,cfg.travelMax),direction:rand(rng)<.16?'rtl':'ltr'};
    });
  }
  function makeRound(index,difficulty,rng,usedTargets){
    const cfg=roundConfigFor(index,difficulty),final=index===4;let targetId='all';
    if(!final){const available=SPECIES.filter(s=>!usedTargets.has(s.id));const chosen=pick(rng,available.length?available:SPECIES);targetId=chosen.id;usedTargets.add(chosen.id);}
    const stream=makeStream(index,targetId,difficulty,rng),actualCount=final?stream.length:stream.filter(p=>p.speciesId===targetId).length;
    return {index,number:index+1,targetId,targetName:final?'ALL POKÉMON':speciesName(targetId),maxPoints:ROUND_MAX_POINTS[index],stream,actualCount,phase:'pending',startedAt:null,entryStartedAt:null,revealedAt:null,streamDurationMs:Math.max(...stream.map(p=>p.startMs+p.durationMs),0)+150,entryDurationMs:cfg.entryMs,promptDurationMs:cfg.promptMs};
  }
  function makePlayer(id,index,kind,rng){return {id,index,kind,avatarId:pick(rng,AVATARS),score:0,roundCount:0,roundPoints:0,totalError:0,perfectRounds:0,answers:[]};}
  function createMatch({difficulty='normal',rng=Math.random}={}){
    const profile=profileFor(difficulty),usedTargets=new Set(),rounds=ROUND_MAX_POINTS.map((_,i)=>makeRound(i,profile.key,rng,usedTargets));
    const players=[makePlayer('player',0,'player',rng),makePlayer('cpu1',1,'cpu',rng),makePlayer('cpu2',2,'cpu',rng),makePlayer('cpu3',3,'cpu',rng)];
    return {difficulty:profile.key,startedAt:0,players,player:players[0],rounds,round:null,roundIndex:-1,phase:'ready',finalized:false,ranking:null};
  }
  function beginRound(match,index,atMs){if(!match||match.finalized||!match.rounds[index])return null;const r=match.rounds[index];match.roundIndex=index;match.round=r;match.phase='streaming';if(!match.startedAt)match.startedAt=Number(atMs)||0;r.phase='streaming';r.startedAt=Number(atMs)||0;r.entryStartedAt=null;r.revealedAt=null;for(const p of match.players){p.roundCount=0;p.roundPoints=0;}return r;}
  function beginEntryWindow(match,atMs){if(!match?.round||match.finalized)return false;match.phase='entry';match.round.phase='entry';match.round.entryStartedAt=Number(atMs)||0;return true;}
  function pressCount(match){if(!match?.player||!['streaming','entry'].includes(match.phase))return {accepted:false,count:Number(match?.player?.roundCount||0)};match.player.roundCount=Math.min(99,Number(match.player.roundCount||0)+1);return {accepted:true,count:match.player.roundCount};}
  function scoreAnswer(answer,actual,maxPoints){const error=Math.abs((Number(answer)||0)-(Number(actual)||0)),max=Math.max(0,Number(maxPoints)||0);if(error===0)return max;if(error===1)return Math.max(1,Math.round(max*.5));if(error===2)return Math.max(1,Math.round(max*.1));return 0;}
  function cpuAnswer(actual,profile,rng){
    const roll=rand(rng);let error=0;
    if(roll>=profile.exactChance){error=roll<profile.exactChance+profile.oneOffChance?1:int(rng,2,profile.maxAnswerError);}
    if(!error)return actual;const sign=rand(rng)<.5?-1:1;return Math.max(0,actual+sign*error);
  }
  function revealRound(match,atMs,rng=Math.random){
    if(!match?.round||match.finalized)return null;const r=match.round,profile=profileFor(match.difficulty);
    for(const p of match.players){
      const answer=p.kind==='player'?Number(p.roundCount||0):cpuAnswer(r.actualCount,profile,rng);
      const error=Math.abs(answer-r.actualCount),points=scoreAnswer(answer,r.actualCount,r.maxPoints);p.roundCount=answer;p.roundPoints=points;p.score+=points;p.totalError+=error;if(error===0)p.perfectRounds++;p.answers.push({round:r.number,targetId:r.targetId,actual:r.actualCount,answer,error,points,maxPoints:r.maxPoints});
    }
    match.phase='reveal';r.phase='reveal';r.revealedAt=Number(atMs)||0;return {round:r,ranking:rankMatch(match)};
  }
  function rankMatch(match){return (match?.players||[]).slice().sort((a,b)=>b.score-a.score||b.perfectRounds-a.perfectRounds||a.totalError-b.totalError||a.index-b.index);}
  function finalizeMatch(match){if(!match)return[];if(!match.finalized){match.finalized=true;match.phase='finished';match.ranking=rankMatch(match);}return (match.ranking||rankMatch(match)).slice();}
  function placeFor(match,id){const list=match?.ranking||rankMatch(match),i=list.findIndex(p=>p.id===id);return i<0?4:i+1;}
  function rewardFor(place,difficulty='normal'){const row=REWARDS[difficulty]||REWARDS.normal,idx=Math.max(0,Math.min(3,(Number(place)||1)-1));return row[idx];}
  function shiftTimestamps(match,delta){if(!match||!Number(delta))return match;const d=Number(delta);match.startedAt+=d;for(const r of match.rounds){if(r.startedAt!=null)r.startedAt+=d;if(r.entryStartedAt!=null)r.entryStartedAt+=d;if(r.revealedAt!=null)r.revealedAt+=d;}return match;}
  return {ROUND_MAX_POINTS,AVATARS,SPECIES,ROUND_CONFIG,DIFFICULTIES,REWARDS,profileFor,roundConfigFor,speciesName,createMatch,beginRound,beginEntryWindow,pressCount,scoreAnswer,revealRound,rankMatch,finalizeMatch,placeFor,rewardFor,shiftTimestamps};
});
