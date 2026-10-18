(function(root,factory){
  const api=factory(root);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexPokemonSeekCore=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  const CONFIG=Object.freeze({durationMs:90000,foundScore:5000,lostItemScore:5000,dreamScore:2500,timeScorePerSecond:500,dreamRate:.02});
  const DIFFICULTIES=Object.freeze({
    easy:Object.freeze({key:'easy',label:'Easy',durationMs:110000,maxRooms:2,decoys:1,rustleChance:.9}),
    normal:Object.freeze({key:'normal',label:'Normal',durationMs:90000,maxRooms:3,decoys:3,rustleChance:.65}),
    hard:Object.freeze({key:'hard',label:'Hard',durationMs:75000,maxRooms:Infinity,decoys:6,rustleChance:.22})
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const rand=rng=>clamp((rng||Math.random)(),0,.999999999);
  const pick=(items,rng)=>items[Math.floor(rand(rng)*items.length)];
  const clone=value=>JSON.parse(JSON.stringify(value));
  function locations(){return root.LuckyDexPokemonSeekLocations||(typeof require==='function'?require('./arcade-pokemon-seek-locations.js'):null);}
  function difficultyProfile(key){return DIFFICULTIES[key]||DIFFICULTIES.normal;}
  function accessibleRooms(area,limit){
    const all=new Map(area.locations.map(node=>[node.id,node])),queue=[area.locations[0]],seen=new Set(),nodes=[];
    while(queue.length&&nodes.length<limit){const node=queue.shift();if(!node||seen.has(node.id))continue;seen.add(node.id);nodes.push(node);for(const edge of node.connections)if(!seen.has(edge.to))queue.push(all.get(edge.to));}
    const ids=new Set(nodes.map(node=>node.id));
    return nodes.map((node,index)=>({...clone(node),index,connections:node.connections.filter(edge=>ids.has(edge.to)).map(clone),spots:node.spots.map(spot=>({...clone(spot),kind:'empty',pokemon:null,searched:false,rustle:false}))}));
  }
  function createRun({areaId='manor',difficulty='normal',rng=Math.random,dreamRate=CONFIG.dreamRate}={}){
    // Consume the event roll before content rolls; constant RNG remains testable.
    const dreamRoll=rand(rng),rate=clamp(dreamRate,0,1),dreamEvent=rate>0&&dreamRoll<rate;
    const data=locations(),area=data?.getArea?.(areaId)||data?.AREAS?.find(a=>a.id===areaId)||data?.AREAS?.[0];
    if(!area?.locations?.length||!area.targets?.length)throw new Error('Verified Pokémon Seek location data required');
    const profile=difficultyProfile(difficulty),rooms=accessibleRooms(area,profile.maxRooms),target=clone(pick(area.targets,rng));
    const available=rooms.flatMap(room=>room.spots.map(spot=>({room,spot})));
    for(let i=available.length-1;i>0;i--){const j=Math.floor(rand(rng)*(i+1));[available[i],available[j]]=[available[j],available[i]];}
    const targetEntry=available.pop();if(!targetEntry)throw new Error('Pokémon Seek locations need searchable spots');
    Object.assign(targetEntry.spot,{kind:'target',pokemon:target,rustle:rand(rng)<profile.rustleChance});
    const itemEntry=available.pop();if(itemEntry)itemEntry.spot.kind='item';
    const dreamEntry=dreamEvent?available.pop():null;if(dreamEntry){dreamEntry.spot.kind='dream';dreamEntry.spot.rustle=true;}
    const decoyPool=area.targets.filter(pokemon=>pokemon.dex!==target.dex);
    for(let i=0;i<profile.decoys&&available.length&&decoyPool.length;i++){
      const {spot}=available.pop();Object.assign(spot,{kind:'pokemon',pokemon:clone(pick(decoyPool,rng)),rustle:rand(rng)<profile.rustleChance});
    }
    const clue=available.pop();if(clue){clue.spot.kind='clue';clue.spot.rustle=profile.key==='easy';}
    return {difficulty:profile.key,durationMs:profile.durationMs,areaId:area.id,areaName:area.name,elapsedMs:0,currentRoom:0,target,targetRoom:targetEntry.room.index,rooms,
      itemRoom:itemEntry?.room.index??null,itemFound:false,dreamEvent:!!dreamEntry,dreamRoom:dreamEntry?.room.index??null,dreamFound:false,dreamSeen:false,
      foundTarget:false,complete:false,listens:0,wrongFinds:0,emptySearches:0,searchedSpots:0,moves:0,selectedSpotId:null,visitedRooms:[0]};
  }
  function currentRoom(run){return run?.rooms?.[run.currentRoom]||null;}
  function remainingMs(run){return Math.max(0,(Number(run?.durationMs)||CONFIG.durationMs)-Math.max(0,Number(run?.elapsedMs)||0));}
  function active(run){return !!run&&!run.complete&&remainingMs(run)>0;}
  function advanceTime(run,deltaMs){
    if(!run||run.complete)return remainingMs(run);run.elapsedMs=Math.min(run.durationMs||CONFIG.durationMs,Math.max(0,Number(run.elapsedMs)||0)+Math.max(0,Number(deltaMs)||0));
    if(remainingMs(run)===0)run.complete=true;return remainingMs(run);
  }
  function move(run,destination){
    if(!active(run))return false;const edge=currentRoom(run)?.connections.find(edge=>edge.to===destination||edge.direction===destination);
    if(!edge)return false;const index=run.rooms.findIndex(room=>room.id===edge.to);if(index<0||index===run.currentRoom)return false;
    run.currentRoom=index;run.moves++;run.selectedSpotId=null;if(!run.visitedRooms.includes(index))run.visitedRooms.push(index);return true;
  }
  function roomDistance(run,from=run?.currentRoom,to=run?.targetRoom){
    const start=typeof from==='string'?run?.rooms?.find(room=>room.id===from):run?.rooms?.[from],target=typeof to==='string'?run?.rooms?.find(room=>room.id===to):run?.rooms?.[to];
    if(!start||!target)return Infinity;const queue=[[start.id,0]],seen=new Set([start.id]);
    while(queue.length){const [id,distance]=queue.shift();if(id===target.id)return distance;const room=run.rooms.find(node=>node.id===id);for(const edge of room?.connections||[])if(!seen.has(edge.to)){seen.add(edge.to);queue.push([edge.to,distance+1]);}}
    return Infinity;
  }
  function roomsWithin(run,target,maxDistance){return (run?.rooms||[]).filter(room=>roomDistance(run,room.index,target)<=maxDistance).map(room=>room.index);}
  function listenHint(run){
    if(!active(run))return {distance:Infinity,strength:'none',nextId:null,message:'The search has ended.'};
    run.listens++;const distance=roomDistance(run),profile=difficultyProfile(run.difficulty),closer=currentRoom(run).connections.find(edge=>roomDistance(run,edge.to,run.targetRoom)<distance);
    const nextId=distance>0&&profile.key!=='hard'&&(profile.key==='easy'||distance===1)?closer?.to||null:null;
    const destination=run.rooms.find(room=>room.id===nextId),strength=distance===0?'close':distance===1?'near':distance===2?'faint':'none';
    const message=distance===0?'You hear something very close.':destination?`The sound seems to come from ${destination.shortName||destination.name}.`:distance===1?'You hear a rustle nearby.':distance===2?'A faint sound reaches you from farther away.':"You don't hear anything nearby.";
    return {distance,strength,nextId,message};
  }
  function selectSpot(run,spotId){
    if(!active(run))return false;const spot=currentRoom(run)?.spots.find(spot=>spot.id===spotId);if(!spot||spot.searched)return false;run.selectedSpotId=spot.id;return true;
  }
  function search(run,spotId=run?.selectedSpotId){
    if(!active(run))return {accepted:false,reason:'inactive'};
    if(!run.selectedSpotId||spotId!==run.selectedSpotId)return {accepted:false,reason:'unselected'};
    const spot=currentRoom(run)?.spots.find(spot=>spot.id===spotId);if(!spot)return {accepted:false,reason:'missing'};if(spot.searched)return {accepted:false,reason:'searched'};
    spot.searched=true;run.searchedSpots++;const outcome={accepted:true,foundTarget:false,kind:spot.kind,pokemon:spot.pokemon,spot};
    if(spot.kind==='target'){run.foundTarget=true;run.complete=true;outcome.foundTarget=true;}
    else if(spot.kind==='pokemon')run.wrongFinds++;
    else if(spot.kind==='item')run.itemFound=true;
    else if(spot.kind==='dream'){run.dreamFound=true;run.dreamSeen=true;}
    else if(spot.kind==='clue'){const targetRoom=run.rooms[run.targetRoom];outcome.message=difficultyProfile(run.difficulty).key==='easy'?`A trail leads toward ${targetRoom.shortName||targetRoom.name}.`:'Fresh tracks suggest the lost Pokémon is still nearby.';}
    else run.emptySearches++;
    return outcome;
  }
  function collectKind(run,kind){
    const spot=currentRoom(run)?.spots.find(spot=>spot.kind===kind&&!spot.searched);if(!spot||!selectSpot(run,spot.id))return {collected:false};const result=search(run);return {collected:result.accepted,score:kind==='dream'?CONFIG.dreamScore:CONFIG.lostItemScore};
  }
  function collectLostItem(run){return collectKind(run,'item');}
  function collectDreamSparkle(run){return collectKind(run,'dream');}
  function markDreamSeen(run){if(active(run)&&run.dreamEvent&&run.currentRoom===run.dreamRoom)run.dreamSeen=true;return !!run?.dreamSeen;}
  function scoreBreakdown(run){
    if(!run)return [];const parts=[{label:'Target found',value:run.foundTarget?CONFIG.foundScore:0},{label:'Time remaining',value:run.foundTarget?Math.floor(remainingMs(run)/1000)*CONFIG.timeScorePerSecond:0},
      {label:'Lost item',value:run.itemFound?CONFIG.lostItemScore:0},{label:'Dream Sparkle',value:run.dreamFound?CONFIG.dreamScore:0},
      {label:'Wrong searches',value:-Math.max(0,Number(run.wrongFinds)||0)*200},{label:'Listen',value:-Math.max(0,Number(run.listens)||0)*25},
      {label:'Extra searches',value:-Math.max(0,(Number(run.searchedSpots)||0)-1)*15},{label:'Extra movement',value:-Math.max(0,(Number(run.moves)||0)-Math.max(0,run.rooms.length-1))*10}];
    const total=parts.reduce((sum,part)=>sum+part.value,0);if(total<0)parts.push({label:'Minimum score',value:-total});return parts;
  }
  function finalScore(run){return Math.round(scoreBreakdown(run).reduce((sum,part)=>sum+part.value,0));}
  function rewardForRun(run){const mult=run?.difficulty==='hard'?1.12:run?.difficulty==='easy'?.94:1;return Math.max(20,Math.round(Math.min(650,30+finalScore(run)/110)*mult));}
  function roomLabel(index,run){const room=run?.rooms?.[index];return room?.shortName||room?.name||String(Number(index)+1);}
  function snapshot(run){return run?clone(run):null;}
  return Object.freeze({CONFIG,DIFFICULTIES,difficultyProfile,createRun,move,listenHint,currentRoom,selectSpot,search,advanceTime,roomDistance,roomsWithin,collectLostItem,collectDreamSparkle,markDreamSeen,remainingMs,scoreBreakdown,finalScore,rewardForRun,roomLabel,snapshot});
});
