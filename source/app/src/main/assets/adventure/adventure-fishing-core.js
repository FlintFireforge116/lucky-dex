(function(root,factory){'use strict';const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexAdventureFishingCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){'use strict';
const ROD_RULES={
 old:{badge:0,bite:[1150,2450],hookWindow:1050,progress:.115,tension:.15,recover:.19,level:[5,15]},
 good:{badge:3,bite:[900,2050],hookWindow:850,progress:.105,tension:.175,recover:.18,level:[12,28]},
 super:{badge:6,bite:[700,1750],hookWindow:700,progress:.097,tension:.205,recover:.17,level:[22,40]}
};
const POOLS={
 kanto:{old:[129,60,118],good:[129,60,118,72,98,116],super:[130,119,121,117,90]},
 johto:{old:[129,60,118],good:[170,223,194,98,116],super:[130,171,224,211]},
 hoenn:{old:[129,118,72],good:[320,318,341,349],super:[321,319,342,350,369]}
};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
function seed32(value){let n=Number(value);if(!Number.isFinite(n))n=Date.now();n=(n>>>0)||0x6d2b79f5;n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);n^=n>>>16;return(n>>>0)||0x6d2b79f5;}
function rand(run){let x=run.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;run.rngState=x>>>0;return (run.rngState>>>0)/4294967296;}
function slugRegion(poolKey){const s=String(poolKey||'kanto-');if(s.startsWith('johto-'))return'johto';if(s.startsWith('hoenn-'))return'hoenn';return'kanto';}
function badgeCount(journey){if(Number.isFinite(journey?.badges))return Math.max(0,journey.badges|0);if(Array.isArray(journey?.badges))return journey.badges.length;return 0;}
function availableRods(_save,journey){const b=badgeCount(journey);return Object.entries(ROD_RULES).filter(([,r])=>b>=r.badge).map(([k])=>k);}
function ensureState(save){if(!save||typeof save!=='object')throw new TypeError('Fishing records require a save object.');let activities;
 const A=root?.LuckyDexAdventureActivities; if(A?.ensureState)activities=A.ensureState(save); else {if(!save.adventureActivities||typeof save.adventureActivities!=='object')save.adventureActivities={schema:1,helpSeen:{},records:{}};activities=save.adventureActivities;if(!activities.records||typeof activities.records!=='object')activities.records={};}
 const existing=activities.records.fishing&&typeof activities.records.fishing==='object'?activities.records.fishing:{};
 const numeric=['casts','hooked','landed','catches','escapes','bestStreak','currentStreak','rare','shiny'];for(const key of numeric)if(!Number.isFinite(existing[key])||existing[key]<0)existing[key]=0;
 activities.records.fishing=existing;return existing;
}
function start(config={}){const rod=ROD_RULES[config.rod]?config.rod:'old';const rawSeed=Number.isFinite(Number(config.seed))?(Number(config.seed)>>>0):(Date.now()>>>0),mixedSeed=seed32(rawSeed);return{phase:'ready',capability:config.capability||{},rod,seed:rawSeed,rngState:mixedSeed,now:Number(config.now)||0,castQuality:0,biteAt:null,hookDeadline:null,speciesId:null,level:null,rare:false,shiny:false,tension:0,progress:0,hooked:false,terminal:null};}
function chooseFish(run){const region=slugRegion(run.capability?.poolKey);const pool=POOLS[region]?.[run.rod]||POOLS.kanto.old;const r=rand(run);run.speciesId=pool[Math.min(pool.length-1,Math.floor(r*pool.length))];const lv=ROD_RULES[run.rod].level;run.level=lv[0]+Math.floor(rand(run)*(lv[1]-lv[0]+1));run.rare=false;run.shiny=false;return run.speciesId;}
function cast(run,input={}){if(!run||run.phase!=='ready'||run.terminal)return false;const power=clamp(input.power);run.now=Number.isFinite(input.now)?input.now:run.now;run.castQuality=clamp(1-Math.abs(power-.75)/.75,.08,1);const rule=ROD_RULES[run.rod];const span=rule.bite[1]-rule.bite[0];const qualityReduction=run.castQuality*span*.28;const jitter=rand(run)*span;run.biteAt=Math.round(run.now+rule.bite[0]+Math.max(0,jitter-qualityReduction));run.phase='wait';return true;}
function escape(run,reason){run.phase='result';run.terminal={kind:'escaped',reason,hooked:!!run.hooked,speciesId:run.speciesId,level:run.level,rare:!!run.rare,shiny:!!run.shiny,seed:run.seed};return run.terminal;}
function advance(run,now){if(!run||run.terminal)return run?.terminal||null;run.now=Number.isFinite(now)?now:run.now;if(run.phase==='wait'&&run.now>=run.biteAt){run.phase='bite';run.hookDeadline=run.biteAt+ROD_RULES[run.rod].hookWindow;}if(run.phase==='bite'&&run.now>run.hookDeadline)return escape(run,'missed-hook');return null;}
function hook(run,now){if(!run||run.terminal)return false;advance(run,now);if(run.phase!=='bite'||run.now>run.hookDeadline)return false;chooseFish(run);run.hooked=true;run.phase='reel';run.tension=.32+rand(run)*.08;run.progress=0;return true;}
function reel(run,input={},dt=0){if(!run||run.phase!=='reel'||run.terminal)return run?.terminal||null;const seconds=clamp((Number(dt)||0)/1000,0,1);if(seconds<=0)return null;const rule=ROD_RULES[run.rod];const pull=!!input.pull;const fishSurge=.78+rand(run)*.48; if(pull){run.progress=clamp(run.progress+rule.progress*seconds*3.1*(.9+run.castQuality*.18),0,1.2);run.tension+=rule.tension*seconds*4.25*fishSurge;}else{run.progress=Math.max(0,run.progress-.012*seconds);run.tension-=rule.recover*seconds*3.2;}
 run.tension=clamp(run.tension,0,1.2);if(run.tension>=1)return escape(run,'line-break');if(run.progress>=1){run.phase='result';run.terminal={kind:'landed',speciesId:run.speciesId,level:run.level,rare:!!run.rare,shiny:!!run.shiny,hooked:true,seed:run.seed};return run.terminal;}return null;}
function cancel(run){if(!run||run.terminal)return false;run.phase='result';run.terminal={kind:'cancelled'};return true;}
function result(run){return run?.terminal||null;}
function record(save,outcome={}){const r=ensureState(save);if(!outcome||outcome.kind==='cancelled')return r;r.casts+=1;if(outcome.hooked)r.hooked+=1;if(outcome.kind==='escaped'){r.escapes+=1;r.currentStreak=0;return r;}if(outcome.kind==='landed'){r.landed+=1;r.currentStreak+=1;r.bestStreak=Math.max(r.bestStreak,r.currentStreak);if(outcome.caught)r.catches+=1;if(outcome.rare)r.rare+=1;if(outcome.shiny)r.shiny+=1;}return r;}
return{ROD_RULES,POOLS,ensureState,availableRods,start,cast,advance,hook,reel,cancel,result,record};
});
