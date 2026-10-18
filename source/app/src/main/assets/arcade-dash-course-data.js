(function(root){
  'use strict';
  // Source-sized Emerald tile families, never colour filters over one road.
  // The canonical event rhythm is shared so Type League art cannot change balance.
  const SECTION_BOUNDARIES=[0,260,500,720,950,1170,1410,1600,1800];
  const SECTION_ORDER=['open','chicane','boost-hall','bridge','squeeze','meadow','landmark','finish'];
  const PREVIEW_DISTANCE={normal:385,fire:825,water:825,electric:1505,grass:385,ice:1075,fighting:600,poison:825,
    ground:1505,flying:825,psychic:600,bug:385,rock:1075,ghost:1505,dragon:1505,dark:1075,steel:1075,fairy:1310};
  const SECTION_TEMPLATES={
    open:{label:'Open straight',scenerySpacing:54,stagger:true,events:[{offset:225,kind:'pickup'}]},
    chicane:{label:'Tree-lined chicane',scenerySpacing:32,stagger:true,events:[{offset:36,kind:'hazard'},{offset:123,kind:'hazard'},{offset:203,kind:'mixed'}]},
    'boost-hall':{label:'Mossdeep boost hall',scenerySpacing:42,stagger:false,events:[{offset:26,kind:'boost'},{offset:105,kind:'boost'},{offset:173,kind:'pickup'}]},
    bridge:{label:'Bridge run',scenerySpacing:48,stagger:false,events:[{offset:35,kind:'boost'},{offset:118,kind:'mixed'},{offset:193,kind:'pickup'}]},
    squeeze:{label:'Rock squeeze',scenerySpacing:38,stagger:true,events:[{offset:47,kind:'pair'},{offset:130,kind:'pair'},{offset:199,kind:'pickup'}]},
    meadow:{label:'Recovery sprint',scenerySpacing:32,stagger:true,events:[{offset:60,kind:'boost'},{offset:135,kind:'pickup'},{offset:211,kind:'pickup'}]},
    landmark:{label:'Landmark approach',scenerySpacing:42,stagger:false,events:[{offset:56,kind:'mixed'},{offset:133,kind:'mixed'}]},
    finish:{label:'Final stretch',scenerySpacing:44,stagger:false,events:[{offset:18,kind:'mixed'},{offset:91,kind:'random'}]}
  };
  function sections(overrides){return SECTION_ORDER.map((template,index)=>Object.assign({template},overrides?.[index]||{}));}
  function profile(id,label,environment,ground,path,edge,commonScenery,uncommonScenery,hazards,ambient,overrides){
    return {id,label,environment,ground,path,edge,commonScenery,uncommonScenery,hazards,
      boost:{idle:'mossdeep-pad',active:'mossdeep-pad-active'},ambient,sections:sections(overrides),preview:{distance:PREVIEW_DISTANCE[id],seed:7331}};
  }
  const COURSES={
    normal:profile('normal','Hoenn Route Circuit','route','route-grass','shore-sand','forest-grass',['tree','fence'],['sign','route-rock'],{rock:'route-rock',mud:'grass-patch'},null,{
      1:{commonScenery:['tree','pine']},3:{ground:'shore-water',path:'bridge-floor',edge:'shore-edge',commonScenery:['fence'],uncommonScenery:['sign']},
      5:{ground:'flowers',commonScenery:['fence','tree']},6:{landmark:'sign',commonScenery:['tree','fence']}}),
    fire:profile('fire','Volcanic Ash Run','volcano','lava-floor','ash-floor','lava-edge',['lava-rock','cave-rock'],['column','sign'],{rock:'lava-rock',mud:'lava-floor'},'ash',{
      0:{ground:'cave-floor'},1:{commonScenery:['cave-rock','lava-rock']},2:{ground:'cave-floor'},3:{path:'ancient-floor',commonScenery:['column']},
      4:{ground:'cave-wall',path:'ash-floor'},5:{ground:'ash-floor',path:'cave-floor'},6:{landmark:'column',ground:'lava-floor'},7:{ground:'ash-floor'}}),
    water:profile('water','Tidal Bridge Course','coast','shore-water','shore-sand','shore-edge',['fence','route-rock'],['tree','sign'],{rock:'route-rock',mud:'shallow-water'},'water',{
      0:{ground:'shore-sand',path:'route-path'},1:{ground:'shallow-water',commonScenery:['fence','tree']},2:{path:'bridge-floor'},
      3:{path:'bridge-floor',commonScenery:['fence'],uncommonScenery:['sign']},4:{ground:'shore-sand',path:'shore-sand'},
      5:{ground:'route-grass',path:'shore-sand',commonScenery:['tree','fence']},6:{landmark:'sign',path:'bridge-floor'},7:{ground:'shore-sand'}}),
    electric:profile('electric','Mauville Generator Circuit','electric-gym','gym-floor','metal-floor','mossdeep-floor',['machine','fence'],['column','sign'],{rock:'machine',mud:'mossdeep-floor'},'electric',{
      0:{commonScenery:['fence','machine']},1:{commonScenery:['machine']},2:{path:'gym-floor',commonScenery:['column','machine']},
      3:{ground:'metal-floor',path:'bridge-floor',commonScenery:['fence']},4:{commonScenery:['machine','column']},5:{ground:'gym-floor',commonScenery:['fence']},
      6:{landmark:'machine',path:'mossdeep-floor'},7:{commonScenery:['machine','fence']}}),
    grass:profile('grass','Flowering Woodland','woodland','forest-grass','forest-path','tall-grass',['tree','pine'],['fence','sign'],{rock:'route-rock',mud:'long-grass-patch'},null,{
      0:{ground:'route-grass'},1:{commonScenery:['tree']},2:{ground:'flowers'},3:{ground:'shore-water',path:'bridge-floor',edge:'shore-edge',commonScenery:['fence','tree']},
      4:{ground:'tall-grass',commonScenery:['pine','tree']},5:{ground:'flowers',path:'route-path',commonScenery:['fence','tree']},6:{landmark:'tree'},7:{ground:'route-grass'}}),
    ice:profile('ice','Shoal Ice Passage','ice-cave','ice-wall','ice-floor','cave-wall',['ice-rock','column'],['sign','pine'],{rock:'ice-rock',mud:'ice-cracked'},'snow',{
      0:{ground:'cave-floor'},1:{commonScenery:['cave-rock']},2:{ground:'ice-floor'},3:{ground:'ice-wall',path:'bridge-floor',commonScenery:['column']},
      4:{ground:'cave-wall',path:'ice-floor'},5:{ground:'ice-floor',commonScenery:['column','cave-rock']},6:{landmark:'column'},7:{ground:'ice-floor'}}),
    fighting:profile('fighting','Stone Training Court','training-court','ash-floor','gym-floor','ancient-floor',['column','fence'],['route-rock','sign'],{rock:'route-rock',mud:'mud'},null,{
      0:{ground:'route-grass',path:'route-path'},1:{ground:'cave-floor',path:'ancient-floor',commonScenery:['column']},2:{ground:'gym-floor',path:'gym-floor'},
      3:{path:'ancient-floor',commonScenery:['fence','column']},4:{ground:'cave-wall',path:'cave-floor',commonScenery:['cave-rock']},
      5:{ground:'route-grass',path:'route-path',commonScenery:['fence']},6:{landmark:'column',ground:'gym-floor'},7:{ground:'gym-floor'}}),
    poison:profile('poison','Marsh Boardwalk','marsh','shallow-water','forest-path','forest-grass',['pine','fence'],['machine','sign'],{rock:'route-rock',mud:'grass-patch'},'water',{
      0:{ground:'forest-grass'},1:{ground:'tall-grass',commonScenery:['pine']},2:{ground:'shallow-water',path:'bridge-floor'},
      3:{ground:'shallow-water',path:'bridge-floor',commonScenery:['fence']},4:{ground:'cave-floor',path:'mud',commonScenery:['cave-rock','pine']},
      5:{ground:'forest-grass',path:'forest-path',commonScenery:['pine','fence']},6:{landmark:'machine',ground:'mud'},7:{ground:'forest-grass'}}),
    ground:profile('ground','Desert Ruin Crossing','desert','desert-sand','desert-sand','cave-floor',['route-rock','column'],['cave-rock','sign'],{rock:'route-rock',mud:'desert-sand'},'sand',{
      0:{commonScenery:['route-rock']},1:{commonScenery:['column','route-rock']},2:{path:'ancient-floor'},3:{ground:'cave-floor',path:'ancient-floor',commonScenery:['column']},
      4:{ground:'cave-wall',path:'desert-sand',commonScenery:['cave-rock']},5:{ground:'desert-sand',commonScenery:['route-rock']},
      6:{landmark:'column',path:'ancient-floor'},7:{ground:'desert-sand'}}),
    flying:profile('flying','Fortree Canopy Bridges','high-route','forest-grass','bridge-floor','tall-grass',['pine','fence'],['tree','sign'],{rock:'route-rock',mud:'long-grass-patch'},'wind',{
      0:{ground:'route-grass',path:'route-path'},1:{commonScenery:['pine','tree']},2:{ground:'forest-grass',path:'bridge-floor'},
      3:{ground:'forest-grass',path:'bridge-floor',commonScenery:['fence']},4:{path:'forest-path',commonScenery:['pine']},
      5:{ground:'flowers',path:'forest-path',commonScenery:['tree','fence']},6:{landmark:'sign',path:'bridge-floor'},7:{path:'route-path'}}),
    psychic:profile('psychic','Mossdeep Reflective Hall','mossdeep-gym','mossdeep-floor','mossdeep-floor','gym-floor',['column','fence'],['machine','sign'],{rock:'cave-rock',mud:'metal-floor'},'sparkle',{
      0:{ground:'gym-floor'},1:{commonScenery:['column']},2:{ground:'mossdeep-floor',commonScenery:['column','machine']},
      3:{ground:'gym-floor',path:'metal-floor',commonScenery:['fence','column']},4:{commonScenery:['column','machine']},
      5:{ground:'mossdeep-floor',commonScenery:['fence']},6:{landmark:'column',path:'ancient-floor'},7:{ground:'gym-floor'}}),
    bug:profile('bug','Deep Forest Traverse','deep-forest','long-grass','forest-grass','forest-grass',['pine','tree'],['route-rock','fence'],{rock:'route-rock',mud:'long-grass-patch'},null,{
      0:{ground:'forest-grass'},1:{commonScenery:['pine']},2:{ground:'route-grass'},3:{ground:'shallow-water',path:'bridge-floor',edge:'shore-edge',commonScenery:['fence','pine']},
      4:{ground:'tall-grass',commonScenery:['tree','pine']},5:{ground:'flowers',path:'forest-path'},6:{landmark:'pine',commonScenery:['pine','tree']},7:{ground:'forest-grass'}}),
    rock:profile('rock','Granite Cave Circuit','quarry','cave-wall','cave-floor','ancient-floor',['cave-rock','route-rock'],['column','sign'],{rock:'cave-rock',mud:'ash-floor'},null,{
      0:{ground:'desert-sand'},1:{commonScenery:['cave-rock']},2:{path:'ancient-floor'},3:{path:'ancient-floor',commonScenery:['column']},
      4:{ground:'cave-wall',commonScenery:['cave-rock','route-rock']},5:{ground:'cave-floor',commonScenery:['route-rock']},
      6:{landmark:'column',path:'ancient-floor'},7:{ground:'desert-sand'}}),
    ghost:profile('ghost','Mt. Pyre Memorial Walk','mt-pyre','mtpyre-floor','mtpyre-floor','cave-floor',['grave','column'],['pine','sign'],{rock:'grave',mud:'cave-floor'},'mist',{
      0:{ground:'forest-grass',path:'forest-path',commonScenery:['pine','grave']},1:{commonScenery:['grave']},2:{path:'mossdeep-floor'},
      3:{ground:'cave-floor',path:'ancient-floor',commonScenery:['column','grave']},4:{commonScenery:['grave','column']},
      5:{ground:'mtpyre-floor',commonScenery:['grave']},6:{landmark:'grave',commonScenery:['column','grave']},7:{ground:'mtpyre-floor'}}),
    dragon:profile('dragon','Ancient Meteor Passage','ancient-cave','cave-floor','ancient-floor','cave-wall',['column','cave-rock'],['route-rock','sign'],{rock:'cave-rock',mud:'ash-floor'},'sparkle',{
      0:{ground:'desert-sand',path:'cave-floor'},1:{commonScenery:['column','cave-rock']},2:{ground:'ancient-floor'},
      3:{ground:'cave-wall',path:'ancient-floor',commonScenery:['column']},4:{ground:'cave-wall',path:'cave-floor',commonScenery:['cave-rock']},
      5:{ground:'cave-floor',path:'ancient-floor',commonScenery:['column']},6:{landmark:'column',ground:'ancient-floor'},7:{ground:'cave-floor'}}),
    dark:profile('dark','Deep Cave Night Run','deep-cave','cave-wall','mtpyre-floor','cave-floor',['cave-rock','grave'],['column','sign'],{rock:'cave-rock',mud:'mud'},'mist',{
      0:{ground:'forest-grass',path:'forest-path',commonScenery:['pine']},1:{commonScenery:['cave-rock']},2:{path:'cave-floor'},
      3:{ground:'cave-wall',path:'ancient-floor',commonScenery:['column']},4:{ground:'cave-wall',path:'mtpyre-floor'},
      5:{ground:'cave-floor',path:'mtpyre-floor',commonScenery:['grave']},6:{landmark:'column',commonScenery:['grave','column']},7:{ground:'cave-floor'}}),
    steel:profile('steel','Industrial Service Run','industrial','metal-floor','gym-floor','mossdeep-floor',['fence','machine'],['column','sign'],{rock:'machine',mud:'mossdeep-floor'},null,{
      0:{ground:'metal-floor',path:'metal-floor'},1:{commonScenery:['fence']},2:{path:'mossdeep-floor',commonScenery:['machine','column']},
      3:{ground:'metal-floor',path:'bridge-floor',commonScenery:['fence']},4:{ground:'gym-floor',path:'metal-floor',commonScenery:['machine']},
      5:{ground:'metal-floor',path:'gym-floor',commonScenery:['fence']},6:{landmark:'machine',commonScenery:['machine','fence']},7:{path:'metal-floor'}}),
    fairy:profile('fairy','Hoenn Flower Garden','flower-garden','flowers','route-path','route-grass',['tree','fence'],['pine','sign'],{rock:'route-rock',mud:'long-grass-patch'},'sparkle',{
      0:{ground:'route-grass'},1:{ground:'flowers',commonScenery:['tree','fence']},2:{ground:'flowers',path:'forest-path'},
      3:{ground:'shore-water',path:'bridge-floor',edge:'shore-edge',commonScenery:['fence','tree']},4:{ground:'tall-grass',path:'forest-path'},
      5:{ground:'flowers',path:'route-path',commonScenery:['fence','tree']},6:{landmark:'tree',ground:'flowers'},7:{ground:'flowers'}})
  };

  const TYPE_MECHANICS=Object.freeze({
    normal:Object.freeze({signature:'balanced-route',featureSection:1,feature:'balanced',lanePattern:[0,1,0,2,1,2,0,1],mudBias:.30,steerFactor:1,safeLaneWidth:3}),
    fire:Object.freeze({signature:'volcanic-slalom',featureSection:4,feature:'slalom',lanePattern:[2,0,1,2,1,0,2,0],mudBias:.18,steerFactor:.96,safeLaneWidth:2.65}),
    water:Object.freeze({signature:'tidal-risk-line',featureSection:3,feature:'risk-line',lanePattern:[1,2,0,1,0,2,1,2],mudBias:.58,steerFactor:.90,safeLaneWidth:2.55}),
    electric:Object.freeze({signature:'mauville-boost-chain',featureSection:2,feature:'boost-chain',lanePattern:[0,2,1,0,2,1,2,0],mudBias:.16,steerFactor:1.08,safeLaneWidth:2.85}),
    grass:Object.freeze({signature:'woodland-recovery-line',featureSection:5,feature:'recovery-line',lanePattern:[1,0,2,1,2,0,1,0],mudBias:.46,steerFactor:1,safeLaneWidth:2.8}),
    ice:Object.freeze({signature:'shoal-ice-drift',featureSection:4,feature:'slalom',lanePattern:[2,1,0,2,0,1,2,1],mudBias:.62,steerFactor:.72,safeLaneWidth:2.45}),
    fighting:Object.freeze({signature:'training-gates',featureSection:4,feature:'squeeze',lanePattern:[0,1,2,0,1,2,1,0],mudBias:.22,steerFactor:1.12,safeLaneWidth:2.35}),
    poison:Object.freeze({signature:'marsh-rough-line',featureSection:4,feature:'rough-line',lanePattern:[1,2,1,0,2,0,1,2],mudBias:.78,steerFactor:.88,safeLaneWidth:2.5}),
    ground:Object.freeze({signature:'desert-risk-line',featureSection:6,feature:'risk-line',lanePattern:[2,0,2,1,0,1,2,0],mudBias:.20,steerFactor:.93,safeLaneWidth:2.5}),
    flying:Object.freeze({signature:'canopy-boost-run',featureSection:3,feature:'boost-chain',lanePattern:[0,1,0,2,0,2,1,2],mudBias:.28,steerFactor:1.10,safeLaneWidth:2.7}),
    psychic:Object.freeze({signature:'mossdeep-zigzag',featureSection:2,feature:'zigzag',lanePattern:[2,1,2,0,1,0,2,1],mudBias:.34,steerFactor:1.06,safeLaneWidth:2.55}),
    bug:Object.freeze({signature:'forest-chicane',featureSection:1,feature:'slalom',lanePattern:[1,0,1,2,0,2,1,0],mudBias:.50,steerFactor:.98,safeLaneWidth:2.4}),
    rock:Object.freeze({signature:'granite-squeeze',featureSection:4,feature:'squeeze',lanePattern:[0,2,0,1,2,1,0,2],mudBias:.14,steerFactor:.86,safeLaneWidth:2.25}),
    ghost:Object.freeze({signature:'pyre-switchback',featureSection:6,feature:'zigzag',lanePattern:[2,0,1,0,2,1,0,1],mudBias:.42,steerFactor:.95,safeLaneWidth:2.5}),
    dragon:Object.freeze({signature:'meteor-risk-run',featureSection:6,feature:'risk-line',lanePattern:[1,2,0,2,1,0,2,1],mudBias:.12,steerFactor:1.04,safeLaneWidth:2.45}),
    dark:Object.freeze({signature:'shadow-switchback',featureSection:7,feature:'zigzag',lanePattern:[0,2,1,2,0,1,0,2],mudBias:.56,steerFactor:.92,safeLaneWidth:2.45}),
    steel:Object.freeze({signature:'factory-squeeze',featureSection:4,feature:'squeeze',lanePattern:[2,1,0,1,2,0,1,2],mudBias:.10,steerFactor:.94,safeLaneWidth:2.3}),
    fairy:Object.freeze({signature:'flower-recovery-run',featureSection:5,feature:'recovery-line',lanePattern:[1,0,2,0,1,2,0,1],mudBias:.40,steerFactor:1.03,safeLaneWidth:2.75})
  });
  for(const [type,mechanics] of Object.entries(TYPE_MECHANICS))if(COURSES[type])COURSES[type].mechanics=mechanics;

  function courseFor(type){return COURSES[String(type||'normal').toLowerCase()]||COURSES.normal;}
  const api={COURSES,TYPE_MECHANICS,SECTION_TEMPLATES,SECTION_BOUNDARIES,SECTION_ORDER,courseFor};
  root.LuckyDexDashCourseData=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
