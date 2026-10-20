'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
function rng(seed){let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;}
function timeFor(place,lo,hi){const mix=Math.imul(place.length+7,2654435761);for(let n=1;n<50000;n++){const seed=(n^mix)>>>0,r=rng(seed);if(r>=lo&&r<hi)return n;}throw new Error('seed not found');}
function harness(){const timers=new Map();let timerId=0,closed=0,encounters=[];const body={innerHTML:''},controls={innerHTML:''};const shell={config:null,open(config){this.config=config;config.render(body,controls);return config;},close(silent=false){const c=this.config;this.config=null;if(!c)return false;if(!silent)c.onClose?.();return true;}};global.LuckyDexAdventureActivityShell=shell;global.LuckyDexAdventureActivities={capabilitiesFor:()=>[{type:'fish',poolKey:'kanto-coast'}],ensureState:s=>s.adventureActivities||(s.adventureActivities={helpSeen:{},records:{}})};global.LuckyDexRegionalEngine={enterFishingWild:(_save,_place,id,seed)=>{encounters.push({id,seed});return true;}};global.setTimeout=(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;};global.clearTimeout=id=>timers.delete(id);const runNext=()=>{const first=[...timers.entries()].sort((a,b)=>a[0]-b[0])[0];if(!first)return false;timers.delete(first[0]);first[1].fn();return true;};delete require.cache[require.resolve('../app/src/main/assets/adventure/adventure-fishing.js')];const Fishing=require('../app/src/main/assets/adventure/adventure-fishing.js');const save={adventureRegional:{active:{badges:0}},adventureActivities:{helpSeen:{fishing:true},records:{}}},place={name:'Dewford Town',region:'hoenn'},host={};Fishing.open(save,place,{host,saveNow(){},onClose(){closed++;}});const press=(attr)=>shell.config?.onInput?.({dataset:{},hasAttribute:n=>n===attr});return{Fishing,shell,body,controls,save,place,runNext,get closed(){return closed},encounters,press};}

test('Adventure Fishing has no CAST AGAIN limbo and waits for a bite press before battle',()=>{
 const h=harness(),original=Date.now;Date.now=()=>timeFor(h.place.name,.44,1);h.press('data-fish-cast');for(let i=0;i<3;i++)h.runNext();assert.match(h.body.innerHTML,/Oh! A bite!/);assert.doesNotMatch(h.controls.innerHTML,/CAST AGAIN|data-fish-encounter/);assert.equal(h.encounters.length,0);h.press('data-fish-hook');h.runNext();h.runNext();Date.now=original;assert.equal(h.encounters.length,1);
});

test('disposing Adventure Fishing cancels pending bite/outcome timers',()=>{
 const h=harness(),original=Date.now;Date.now=()=>timeFor(h.place.name,.44,1);h.press('data-fish-cast');h.Fishing.dispose(true);for(let i=0;i<10;i++)h.runNext();Date.now=original;assert.equal(h.encounters.length,0);assert.equal(h.closed,0);
});
