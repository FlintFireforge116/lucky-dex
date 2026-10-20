(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LuckyDexAdventureModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DESTINATIONS = {
    meadow: {id:'meadow',name:'Viridian Wilds',rank:1,minLevel:2,maxLevel:8,levels:[2,8]},
    cave: {id:'cave',name:'Mt. Moon',rank:3,minLevel:6,maxLevel:14,levels:[6,14]},
    haunted: {id:'haunted',name:'Lavender',rank:5,minLevel:10,maxLevel:20,levels:[10,20]},
    coast: {id:'coast',name:'Seafoam Islands',rank:6,minLevel:10,maxLevel:20,levels:[10,20]},
    volcano: {id:'volcano',name:'Cinnabar Crater',rank:10,minLevel:16,maxLevel:28,levels:[16,28]}
  };
  const HOTSPOT_BLUEPRINTS = {
    meadow: [
      {clue:'Fresh tracks',x:20,y:10,effect:'sand_footprints'},
      {clue:'Shaking tree',x:80,y:6,effect:'ground_impact_dust'},
      {clue:'Falling leaves',x:67,y:38,effect:'ground_impact_dust'},
      {clue:'Rustling grass',x:28,y:64,effect:'short_grass'},
      {clue:'Rustling grass',x:69,y:78,effect:'short_grass'}
    ],
    cave: [
      {clue:'Loose stones',x:20,y:10,effect:'ground_impact_dust'},
      {clue:'Drifting dust',x:73,y:20,effect:'ground_impact_dust'},
      {clue:'Glinting stone',x:38,y:43,effect:'small_sparkle'},
      {clue:'Fresh tracks',x:77,y:59,effect:'sand_footprints'},
      {clue:'Cave shadow',x:18,y:80,effect:'shadow_medium'}
    ],
    haunted: [
      {clue:'Rattling grave',x:22,y:33,effect:'ground_impact_dust'},
      {clue:'Purple glow',x:50,y:46,effect:'small_sparkle'},
      {clue:'Drifting wisp',x:75,y:31,effect:'small_sparkle'},
      {clue:'Cold spot',x:28,y:70,effect:'ripple'},
      {clue:'Strange shadow',x:76,y:76,effect:'shadow_medium'}
    ],
    coast: [
      {clue:'Water ripple',x:38,y:15,effect:'ripple'},
      {clue:'Rising bubbles',x:35,y:28,effect:'ripple'},
      {clue:'Cracked ice',x:77,y:20,effect:'ground_impact_dust'},
      {clue:'Moving shadow',x:80,y:56,effect:'shadow_medium'},
      {clue:'Quiet splash',x:44,y:75,effect:'jump_small_splash'}
    ],
    volcano: [
      {clue:'Heat shimmer',x:50,y:20,effect:'small_sparkle'},
      {clue:'Shifting rocks',x:30,y:39,effect:'ground_impact_dust'},
      {clue:'Ember trail',x:62,y:47,effect:'small_sparkle'},
      {clue:'Ash plume',x:80,y:66,effect:'ground_impact_dust'},
      {clue:'Fresh tracks',x:34,y:76,effect:'sand_footprints'}
    ]
  };
  const ENCOUNTER_POOLS = {
    meadow: {
      normal:[10,13,16,19,21,25,29,32,35,39,43,46,48,52,69,102,133],
      rare:[113,123],
      legendary:[]
    },
    cave: {
      normal:[41,50,66,74,95,111,246,304,524,529,703,744],
      rare:[51,67,75,443],
      legendary:[]
    },
    haunted: {
      normal:[41,42,63,92,93,96,200,302,353,355,425,607,708],
      rare:[64,97,442,778],
      legendary:[]
    },
    coast: {
      normal:[54,60,72,79,86,90,98,116,118,120,129,170,194,223,278,320,363],
      rare:[87,91,121,130,226,350],
      legendary:[144]
    },
    volcano: {
      normal:[37,58,74,77,95,111,126,218,228,240,322,324,390,636,757],
      rare:[38,59,78,110,112,136,219,323],
      legendary:[146,485]
    }
  };
  const isObject = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const owns = (obj,key) => !!obj && Object.prototype.hasOwnProperty.call(obj,key);
  const finite = (x,fallback) => Number.isFinite(x) ? x : fallback;
  const count = x => Math.max(0,Math.floor(finite(x,0)));
  const clone = x => JSON.parse(JSON.stringify(x));
  function destinationFor(id) {
    const key = typeof id === 'string' ? id : id && id.id;
    return owns(DESTINATIONS,key) ? DESTINATIONS[key] : DESTINATIONS.meadow;
  }
  function normalizeHunt(hunt) {
    if(!isObject(hunt))hunt={};
    const target=Number(hunt.targetId);
    hunt.targetId=Number.isInteger(target)&&target>0?target:null;
    hunt.chain=count(hunt.chain);
    if(!isObject(hunt.bestBySpecies))hunt.bestBySpecies={};
    for(const [id,value] of Object.entries(hunt.bestBySpecies)){const numeric=Number(id);if(!Number.isInteger(numeric)||numeric<=0)delete hunt.bestBySpecies[id];else hunt.bestBySpecies[String(numeric)]=count(value);}
    hunt.startedAt=Number.isFinite(hunt.startedAt)&&hunt.startedAt>0?hunt.startedAt:null;
    if(hunt.targetId){const key=String(hunt.targetId);hunt.bestBySpecies[key]=Math.max(count(hunt.bestBySpecies[key]),hunt.chain);}
    return hunt;
  }
  function normalizeRecord(record) {
    if(!isObject(record))record={};
    for(const key of ['encounters','shiny','clears','chain'])record[key]=count(record[key]);
    for(const key of ['seen','caught','rare'])if(!isObject(record[key]))record[key]={};
    record.huntV2=normalizeHunt(record.huntV2);
    if(!owns(record,'boss'))record.boss=false;
    return record;
  }
  function ensureState(save) {
    if(!isObject(save))throw new TypeError('Adventure state requires a save object.');
    if(!isObject(save.adventureV2))save.adventureV2={};
    const v2=save.adventureV2;
    if(!owns(v2,'schema'))v2.schema=1;
    if(!isObject(v2.destinations))v2.destinations={};
    for(const id of Object.keys(DESTINATIONS))v2.destinations[id]=normalizeRecord(v2.destinations[id]);
    if(!owns(DESTINATIONS,v2.lastDestination))v2.lastDestination='meadow';
    if(!owns(DESTINATIONS,v2.activeTargetHuntDestination))v2.activeTargetHuntDestination=null;
    else if(!fieldRecord(v2,v2.activeTargetHuntDestination).huntV2.targetId)v2.activeTargetHuntDestination=null;
    if(!isObject(v2.activeRoam)||!owns(DESTINATIONS,v2.activeRoam.destination))v2.activeRoam=null;
    else {
      const record=fieldRecord(v2,v2.activeRoam.destination);
      record.chain=Math.max(count(record.chain),count(v2.activeRoam.chain));
      v2.activeRoam.chain=record.chain;
      if(!Array.isArray(v2.activeRoam.hotspots))v2.activeRoam.hotspots=[];
    }
    if(isObject(v2.activeExpedition)&&!v2.retiredExpedition)v2.retiredExpedition=clone(v2.activeExpedition);
    v2.activeExpedition=null;
    return v2;
  }
  function fieldRecord(v2,destination) {
    if(!isObject(v2.destinations))v2.destinations={};const id=destinationFor(destination).id;
    return v2.destinations[id]=normalizeRecord(v2.destinations[id]);
  }
  function huntState(v2,destination) {
    return fieldRecord(v2,destination).huntV2=normalizeHunt(fieldRecord(v2,destination).huntV2);
  }
  function preserveBest(hunt) {
    if(hunt.targetId){const key=String(hunt.targetId);hunt.bestBySpecies[key]=Math.max(count(hunt.bestBySpecies[key]),count(hunt.chain));}
    return hunt;
  }
  function startTargetHunt(v2,destination,targetId) {
    const dest=destinationFor(destination).id,target=Number(targetId);
    if(!Number.isInteger(target)||target<=0)throw new TypeError('Target hunt requires a valid species id.');
    if(v2.activeTargetHuntDestination&&v2.activeTargetHuntDestination!==dest){const previous=huntState(v2,v2.activeTargetHuntDestination);preserveBest(previous);previous.targetId=null;previous.chain=0;previous.startedAt=null;}
    const hunt=huntState(v2,dest);
    if(hunt.targetId!==target){preserveBest(hunt);hunt.targetId=target;hunt.chain=0;hunt.startedAt=Date.now();}
    else if(!hunt.startedAt)hunt.startedAt=Date.now();
    v2.activeTargetHuntDestination=dest;preserveBest(hunt);return hunt;
  }
  function updateTargetHunt(v2,destination,outcome={}) {
    const hunt=huntState(v2,destination);if(!hunt.targetId)return hunt;
    const id=Number(isObject(outcome)?(outcome.speciesId??outcome.id):null),target=id===hunt.targetId,kind=String(outcome?.kind||'');
    if(target&&kind==='capture'){hunt.chain=count(hunt.chain)+1;preserveBest(hunt);}
    else if(target&&['fled','loss'].includes(kind)&&outcome.committed!==false){preserveBest(hunt);hunt.chain=0;}
    return hunt;
  }
  function targetChainInfo(v2,destination) {
    const hunt=huntState(v2,destination),chain=count(hunt.chain),best=hunt.targetId?Math.max(count(hunt.bestBySpecies[String(hunt.targetId)]),chain):0;
    let milestone={targetWeight:1,clueTier:0,rareBonus:0,itemBonus:0,shinyMultiplier:1,nextThreshold:3};
    if(chain>=20)milestone={targetWeight:4,clueTier:4,rareBonus:2,itemBonus:3,shinyMultiplier:2,nextThreshold:null};
    else if(chain>=10)milestone={targetWeight:3,clueTier:3,rareBonus:1.5,itemBonus:2,shinyMultiplier:1.5,nextThreshold:20};
    else if(chain>=5)milestone={targetWeight:2,clueTier:2,rareBonus:1,itemBonus:1.5,shinyMultiplier:1.25,nextThreshold:10};
    else if(chain>=3)milestone={targetWeight:1.5,clueTier:1,rareBonus:.5,itemBonus:1,shinyMultiplier:1,nextThreshold:5};
    return {targetId:hunt.targetId,chain,best,...milestone};
  }
  function fieldChain(v2,destination) {
    return count(fieldRecord(v2,destination).chain);
  }
  function updateFieldChain(v2,destination,kind) {
    const record=fieldRecord(v2,destination);
    if(['capture','victory'].includes(kind))record.chain=count(record.chain)+1;
    else if(['fled','loss'].includes(kind))record.chain=0;
    return record.chain;
  }
  function speciesId(encounter) {
    const id=isObject(encounter)?encounter.id:encounter;
    return Number.isInteger(Number(id))&&Number(id)>0?String(Number(id)):null;
  }
  function recordEncounter(v2,dest,encounter) {
    const id=speciesId(encounter);if(!id)return false;
    const record=fieldRecord(v2,dest);record.encounters++;record.seen[id]=count(record.seen[id])+1;
    if(encounter&&encounter.rare)record.rare[id]=count(record.rare[id])+1;
    if(encounter&&(encounter.shiny||encounter.isShiny))record.shiny++;
    return record;
  }
  function recordCatch(v2,dest,encounter) {
    const id=speciesId(encounter);if(!id)return false;
    const record=fieldRecord(v2,dest);record.caught[id]=count(record.caught[id])+1;
    return record;
  }
  function mastery(record) {
    if(!isObject(record))return 0;
    const unique=key=>isObject(record[key])?Object.keys(record[key]).filter(id=>record[key][id]>0).length:0;
    return Math.min(5,(count(record.encounters)>0?1:0)+(unique('seen')>=5?1:0)+(unique('caught')>=3?1:0)+(unique('rare')>0||count(record.shiny)>0?1:0)+(count(record.clears)>0||record.boss?1:0));
  }
  function knownTargetIds(v2,destination) {
    const id=destinationFor(destination).id,record=fieldRecord(v2,id),pool=ENCOUNTER_POOLS[id]||ENCOUNTER_POOLS.meadow,allowed=new Set([...pool.normal,...pool.rare,...pool.legendary].map(Number));
    return [...new Set([...Object.keys(record.seen||{}),...Object.keys(record.caught||{})].map(Number).filter(n=>Number.isInteger(n)&&n>0&&allowed.has(n)))].sort((a,b)=>a-b);
  }
  function weightedPick(ids,targetId,targetWeight=1,randomValue=0) {
    if(!Array.isArray(ids)||!ids.length)return null;const target=Number(targetId),weight=Math.max(1,Number(targetWeight)||1),r=Math.max(0,Math.min(.999999999,Number(randomValue)||0));
    const weights=ids.map(id=>Number(id)===target?weight:1),total=weights.reduce((a,b)=>a+b,0);let cursor=r*total;
    for(let i=0;i<ids.length;i++){cursor-=weights[i];if(cursor<0)return ids[i];}return ids[ids.length-1];
  }
  function chainInfo(v2,id){const chain=fieldChain(v2,id);return {chain,rareBonus:Math.round(Math.min(.02,chain*.002)*1000)/10,itemBonus:Math.round(Math.min(.03,chain*.003)*1000)/10,nextThreshold:chain>=10?null:chain<5?5:10};}
  return {DESTINATIONS,HOTSPOT_BLUEPRINTS,ENCOUNTER_POOLS,ensureState,mastery,recordEncounter,recordCatch,huntState,startTargetHunt,updateTargetHunt,targetChainInfo,knownTargetIds,weightedPick,fieldChain,updateFieldChain,chainInfo};
});
