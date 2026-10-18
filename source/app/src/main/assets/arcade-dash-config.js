(function(root){

'use strict';

const TYPE_ORDER=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

const DIFFICULTIES={

  easy:{label:'EASY',minSpeed:20,maxSpeed:65,ai:{reaction:0.65,avoidance:0.52,boostSeeking:0.35,sprintAggression:0.45,mistake:0.26,conserveAt:32}},

  normal:{label:'NORMAL',minSpeed:55,maxSpeed:100,ai:{reaction:0.45,avoidance:0.70,boostSeeking:0.50,sprintAggression:0.56,mistake:0.15,conserveAt:24}},

  hard:{label:'HARD',minSpeed:90,maxSpeed:135,ai:{reaction:0.28,avoidance:0.84,boostSeeking:0.66,sprintAggression:0.64,mistake:0.08,conserveAt:18}},

  expert:{label:'EXPERT',minSpeed:100,maxSpeed:180,ai:{reaction:0.18,avoidance:0.94,boostSeeking:0.78,sprintAggression:0.72,mistake:0.035,conserveAt:14}}

};

const DIFFICULTY_ORDER=['easy','normal','hard','expert'];
const GOLDENROD_DIVISION_AI_KEYS=Object.freeze({rookie:'easy',poke:'poke',great:'normal',ultra:'hard',master:'expert'});
function blendAi(a,b,t=.5){const out={};for(const k of Object.keys(a||{}))out[k]=Number(a[k])+(Number(b?.[k])-Number(a[k]))*t;return out;}
function goldenrodAiProfile(divisionId){
  const key=GOLDENROD_DIVISION_AI_KEYS[String(divisionId||'rookie').toLowerCase()]||'easy';
  if(key==='poke')return blendAi(DIFFICULTIES.easy.ai,DIFFICULTIES.normal.ai,.5);
  return {...(DIFFICULTIES[key]?.ai||DIFFICULTIES.easy.ai)};
}
function goldenrodDifficultyForDivision(divisionId){
  const key=GOLDENROD_DIVISION_AI_KEYS[String(divisionId||'rookie').toLowerCase()]||'easy';
  return key==='poke'?'normal':key;
}

const QUICK_REWARDS={easy:[120,80,55,35,25,20],normal:[150,100,70,45,30,25],hard:[180,120,85,55,40,30],expert:[240,160,110,70,50,40]};

const theme=(label,surface,palette,skins,props)=>({label,surface,palette,skins,props:props||[]});

const LEAGUE_THEMES={

 normal:theme('Normal League','meadow',{ground:'#caa56a',edge:'#72a952',accent:'#f2ddb1',shadow:'#4d6f3e'},{rock:'route-rock',mud:'dirt-patch','speed-pad':'route-arrow','stamina-pickup':'oran-berry'},['tree','flower','fence']),

 fire:theme('Fire League','volcanic',{ground:'#7a4936',edge:'#3d302b',accent:'#ef8b48',shadow:'#231d1b'},{rock:'basalt',mud:'ash','speed-pad':'magma-chevron','stamina-pickup':'ember-orb'},['charred-tree','magma-crack','rock']),

 water:theme('Water League','coast',{ground:'#c8b57f',edge:'#4b9ec2',accent:'#dff3ff',shadow:'#2e6a80'},{rock:'drift-rock',mud:'shallows','speed-pad':'wave-arrow','stamina-pickup':'water-orb'},['reed','dock','shell']),

 electric:theme('Electric League','power-station',{ground:'#69717b',edge:'#3d444f',accent:'#f5df3b',shadow:'#2b2d35'},{rock:'transformer',mud:'cable-tangle','speed-pad':'charge-strip','stamina-pickup':'charge-cell'},['pylon','cable','warning-sign']),

 grass:theme('Grass League','woodland',{ground:'#b89b63',edge:'#4f8d4c',accent:'#a8dd72',shadow:'#31592f'},{rock:'stump',mud:'tall-grass','speed-pad':'leaf-arrow','stamina-pickup':'sitrus-berry'},['tree','flower','log']),

 ice:theme('Ice League','snowfield',{ground:'#d9eef1',edge:'#9bc7d6',accent:'#ffffff',shadow:'#729aa8'},{rock:'ice-boulder',mud:'powder-snow','speed-pad':'ice-arrow','stamina-pickup':'frost-orb'},['snow-pine','ice-pool','snowbank']),

 fighting:theme('Fighting League','training-pass',{ground:'#c89a67',edge:'#806247',accent:'#dc6b52',shadow:'#5a4435'},{rock:'training-post',mud:'rough-earth','speed-pad':'dojo-arrow','stamina-pickup':'focus-orb'},['banner','post','stone']),

 poison:theme('Poison League','marsh',{ground:'#765c66',edge:'#4b6b55',accent:'#aa68c4',shadow:'#3d3240'},{rock:'waste-barrel',mud:'toxic-mire','speed-pad':'toxin-chevron','stamina-pickup':'antidote-orb'},['pipe','dead-tree','marsh-grass']),

 ground:theme('Ground League','desert',{ground:'#d2a35e',edge:'#ba7939',accent:'#f3d58c',shadow:'#8d562d'},{rock:'sandstone',mud:'deep-sand','speed-pad':'sand-arrow','stamina-pickup':'desert-berry'},['cactus','dune','bones']),

 flying:theme('Flying League','highland',{ground:'#bca878',edge:'#7da08a',accent:'#c9ecff',shadow:'#597067'},{rock:'cliff-stone',mud:'crosswind','speed-pad':'wind-glyph','stamina-pickup':'feather-orb'},['bridge','cloud-shadow','flag']),

 psychic:theme('Psychic League','crystal-route',{ground:'#8e74a8',edge:'#594967',accent:'#f2b9ff',shadow:'#473550'},{rock:'crystal',mud:'mind-haze','speed-pad':'psi-glyph','stamina-pickup':'mind-orb'},['crystal','rune','star']),

 bug:theme('Bug League','deep-forest',{ground:'#917a50',edge:'#4b743f',accent:'#b7cf63',shadow:'#36502f'},{rock:'fallen-log',mud:'web-patch','speed-pad':'wing-arrow','stamina-pickup':'nectar-orb'},['mushroom','web','fern']),

 rock:theme('Rock League','quarry',{ground:'#998773',edge:'#6a5a4d',accent:'#d9c1a7',shadow:'#4a4038'},{rock:'quarry-boulder',mud:'gravel','speed-pad':'stone-chevron','stamina-pickup':'mineral-orb'},['boulder','rail','sign']),

 ghost:theme('Ghost League','graveyard',{ground:'#5b5363',edge:'#363449',accent:'#a98fc2',shadow:'#232234'},{rock:'gravestone',mud:'ectoplasm','speed-pad':'spirit-glyph','stamina-pickup':'will-o-orb'},['grave','dead-tree','lantern']),

 dragon:theme('Dragon League','summit',{ground:'#88765f',edge:'#53566a',accent:'#8bb1dc',shadow:'#3a3d50'},{rock:'ancient-pillar',mud:'rubble','speed-pad':'dragon-rune','stamina-pickup':'dragon-orb'},['pillar','banner','cliff']),

 dark:theme('Dark League','moonlit-forest',{ground:'#554f5b',edge:'#263344',accent:'#776b91',shadow:'#171c27'},{rock:'shadow-stump',mud:'dark-mist','speed-pad':'moon-arrow','stamina-pickup':'night-orb'},['dark-tree','moon-flower','mist']),

 steel:theme('Steel League','rail-yard',{ground:'#80878b',edge:'#4d565c',accent:'#c7d0d4',shadow:'#353b3f'},{rock:'machine-block',mud:'oil-slick','speed-pad':'rail-boost','stamina-pickup':'battery'},['rail','gear','pipe']),

 fairy:theme('Fairy League','luminous-grove',{ground:'#d2b9ae',edge:'#7f9a73',accent:'#ffd0e7',shadow:'#596d53'},{rock:'pastel-crystal',mud:'pollen-cloud','speed-pad':'fairy-glyph','stamina-pickup':'sparkle-orb'},['flower','crystal','glow-tree'])

};

function isRacerEligible(row,{mode='quick',type=null,difficulty='normal'}={}){

  const band=DIFFICULTIES[difficulty];

  if(mode==='league'&&(!type||!row?.types?.some(t=>String(t).toLowerCase()===String(type).toLowerCase())))return {eligible:false,reason:'wrong-type'};

  const speed=Number(row?.baseSpeed);

  if(!band||!Number.isFinite(speed)||speed<band.minSpeed)return {eligible:false,reason:'too-slow'};

  if(speed>band.maxSpeed)return {eligible:false,reason:'too-fast'};

  return {eligible:true,reason:'eligible'};

}

function difficultyFit(speed,key){const d=DIFFICULTIES[key];if(!d)return 'within';const v=Number(speed)||0;return v<d.minSpeed?'below':v>d.maxSpeed?'above':'within';}

function recommendedDifficulty(speed){const v=Number(speed)||0;let best='easy',bestDist=Infinity;for(const key of DIFFICULTY_ORDER){const d=DIFFICULTIES[key],mid=(d.minSpeed+d.maxSpeed)/2;let dist;if(v>=d.minSpeed&&v<=d.maxSpeed)dist=Math.abs(v-mid);else dist=Math.min(Math.abs(v-d.minSpeed),Math.abs(v-d.maxSpeed))+1000; if(dist<bestDist-1e-9){best=key;bestDist=dist;}}return best;}

function quickReward(place,key){const list=QUICK_REWARDS[key];const p=Math.round(Number(place)||0);return list&&p>=1&&p<=6?list[p-1]:0;}

function leagueReward(place,key){const q=quickReward(place,key);return q?q*3:0;}

function themeFor(type){return LEAGUE_THEMES[String(type||'normal').toLowerCase()]||LEAGUE_THEMES.normal;}

const api={isRacerEligible,TYPE_ORDER,DIFFICULTY_ORDER,DIFFICULTIES,GOLDENROD_DIVISION_AI_KEYS,QUICK_REWARDS,LEAGUE_THEMES,recommendedDifficulty,difficultyFit,quickReward,leagueReward,themeFor,goldenrodAiProfile,goldenrodDifficultyForDivision};

root.LuckyDexDashConfig=api;

if(typeof module!=='undefined'&&module.exports)module.exports=api;

})(typeof window!=='undefined'?window:globalThis);

