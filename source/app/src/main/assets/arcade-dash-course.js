(function(root){
  'use strict';
  const config=root.LuckyDexDashConfig||(typeof require==='function'?require('./arcade-dash-config.js'):null);
  const data=root.LuckyDexDashCourseData||(typeof require==='function'?require('./arcade-dash-course-data.js'):null);
  const LANE_COUNT=3;
  const FINISH_DISTANCE=1800;
  const MIN_CLUSTER_SPACING=52;
  const START_CLEAR_DISTANCE=150;
  const HAZARDS=new Set(['rock','mud']);

  function seed32(value){let x=(Number(value)||1)>>>0;return x||0x6d2b79f5;}
  function rngFrom(seed){let x=seed32(seed);return function(){x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
  function pickLane(rng,exclude=[]){const available=[0,1,2].filter(x=>!exclude.includes(x));return available[Math.floor(rng()*available.length)]??1;}
  function add(objects,id,effect,lane,distance,theme,profile,sectionId,mechanic=''){
    const skin=(theme?.skins||{})[effect]||effect;
    const assetKey=effect==='speed-pad'?profile.boost.idle:effect==='stamina-pickup'?'oran-berry':profile.hazards[effect];
    objects.push({id:`dash-${id}`,effect,skin,assetKey,lane,distance:Math.round(distance),sectionId,mechanic});return id+1;
  }
  function planSections(profile){
    const mechanics=profile.mechanics||{};
    return profile.sections.map((override,index)=>{
      const template=data.SECTION_TEMPLATES[override.template],featured=index===Number(mechanics.featureSection);
      return Object.assign({id:`dash-section-${index}`,index,start:data.SECTION_BOUNDARIES[index],end:data.SECTION_BOUNDARIES[index+1],
        ground:profile.ground,path:profile.path,edge:profile.edge,commonScenery:profile.commonScenery,uncommonScenery:profile.uncommonScenery,
        ambient:profile.ambient,scenerySpacing:template.scenerySpacing,stagger:template.stagger,mechanicTag:featured?mechanics.signature:'',
        steerFactor:featured?Number(mechanics.steerFactor||1):1,safeLaneWidth:featured?Number(mechanics.safeLaneWidth||3):3},override);
    });
  }
  function makeScenery(sectionPlan,seed){
    // Decorations have a separate stream: changing trees never changes collisions.
    const rng=rngFrom(seed^0x5ce9e27b),scenery=[];
    for(const section of sectionPlan){
      const landmarkDistance=Math.round((section.start+section.end)/2);
      let row=0;
      for(let distance=section.start+18;distance<section.end-12;distance+=section.scenerySpacing){
        if(section.landmark&&Math.abs(distance-landmarkDistance)<52){row++;continue;}
        for(const side of [-1,1]){
          const uncommon=rng()<0.18,keys=uncommon?section.uncommonScenery:section.commonScenery;
          const slot=section.stagger&&((row+(side>0?1:0))%2)?'outer':'inner';
          scenery.push({id:`dash-scenery-${section.index}-${row}-${side}`,sectionId:section.id,
            assetKey:keys[Math.floor(rng()*keys.length)],side,slot,lateral:slot==='inner'?0.18:0.76,
            distance:Math.round(distance+rng()*4),scale:1});
        }
        row++;
      }
      if(section.landmark){
        for(const side of [-1,1])scenery.push({id:`dash-landmark-${section.index}-${side}`,sectionId:section.id,
          assetKey:section.landmark,side,slot:'inner',lateral:0.18,distance:landmarkDistance,scale:1,landmark:true});
      }
    }
    return scenery.sort((a,b)=>a.distance-b.distance);
  }
  function authoredLane(rng,mechanics,sectionIndex,eventIndex,exclude=[]){
    const available=[0,1,2].filter(x=>!exclude.includes(x));if(!available.length)return 1;
    const base=Math.floor(rng()*available.length),pattern=mechanics?.lanePattern||[0],shift=Number(pattern[(sectionIndex*3+eventIndex)%pattern.length]||0)%available.length;
    return available[(base+shift)%available.length];
  }
  function featureKind(kind,mechanics,sectionIndex,eventIndex){
    if(sectionIndex!==Number(mechanics?.featureSection))return kind;
    const seq={
      'boost-chain':['boost','boost','mixed'],
      'recovery-line':['mixed','pickup','pickup'],
      'squeeze':['pair','pair','mixed'],
      'risk-line':['mixed','pair','mixed'],
      'slalom':['hazard','pair','hazard'],
      'rough-line':['hazard','pair','mixed'],
      'zigzag':['pair','mixed','pair'],
      balanced:['hazard','mixed','pickup']
    }[mechanics?.feature];
    return seq?.[eventIndex%seq.length]||kind;
  }
  function hazardEffect(rng,mechanics){return rng()<Number(mechanics?.mudBias??.35)?'mud':'rock';}

  function generateCourse(seed=Date.now(),options={}){
    const profile=data.courseFor(options?.theme),themeKey=profile.id;
    const theme=config?.themeFor?config.themeFor(themeKey):{skins:{}};
    const normalizedSeed=seed32(seed),rng=rngFrom(normalizedSeed),objects=[],sectionPlan=planSections(profile);
    let id=1;
    // Eight short authored sequences. Only lane, surface hazard and a small
    // arrival jitter vary; no cluster can occupy all three hidden racing lanes.
    const mechanics=profile.mechanics||{};
    for(const section of sectionPlan){
      const template=data.SECTION_TEMPLATES[section.template];
      for(let eventIndex=0;eventIndex<template.events.length;eventIndex++){
        const event=template.events[eventIndex],distance=section.start+event.offset+Math.floor(rng()*10),kind=featureKind(event.kind,mechanics,section.index,eventIndex),lane=authoredLane(rng,mechanics,section.index,eventIndex),mechanic=section.mechanicTag||'';
        if(kind==='boost'||kind==='pickup'){
          id=add(objects,id,kind==='boost'?'speed-pad':'stamina-pickup',lane,distance,theme,profile,section.id,mechanic);
        }else if(kind==='hazard'||kind==='pair'||kind==='mixed'){
          id=add(objects,id,hazardEffect(rng,mechanics),lane,distance,theme,profile,section.id,mechanic);
          if(kind==='pair')id=add(objects,id,hazardEffect(rng,mechanics),authoredLane(rng,mechanics,section.index,eventIndex+1,[lane]),distance,theme,profile,section.id,mechanic);
          if(kind==='mixed')id=add(objects,id,rng()<0.55?'speed-pad':'stamina-pickup',authoredLane(rng,mechanics,section.index,eventIndex+1,[lane]),distance,theme,profile,section.id,mechanic);
        }else{
          const roll=rng(),effect=roll<0.4?'rock':roll<0.65?'speed-pad':roll<0.82?'stamina-pickup':'mud';
          id=add(objects,id,effect,lane,distance,theme,profile,section.id,mechanic);
        }
      }
    }
    return {seed:normalizedSeed,theme:themeKey,profile,finishDistance:FINISH_DISTANCE,laneCount:LANE_COUNT,objects,
      sections:data.SECTION_BOUNDARIES.slice(),sectionPlan,scenery:makeScenery(sectionPlan,normalizedSeed)};
  }
  function objectsNear(course,distance,lookAhead=120){const from=Number(distance)||0,to=from+Math.max(0,Number(lookAhead)||0);return (course?.objects||[]).filter(o=>o.distance>=from&&o.distance<=to);}
  function sceneryNear(course,distance,lookAhead=120){const from=Number(distance)||0,to=from+Math.max(0,Number(lookAhead)||0);return (course?.scenery||[]).filter(o=>o.distance>=from&&o.distance<=to);}
  function sectionAt(course,distance){const plan=course?.sectionPlan||[];if(!plan.length)return null;const at=Number(distance)||0;return plan.find(section=>at<section.end)||plan[plan.length-1];}
  function isHazard(effect){return HAZARDS.has(effect);}
  const api={LANE_COUNT,FINISH_DISTANCE,MIN_CLUSTER_SPACING,START_CLEAR_DISTANCE,generateCourse,objectsNear,sceneryNear,sectionAt,isHazard,rngFrom};
  root.LuckyDexDashCourse=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
