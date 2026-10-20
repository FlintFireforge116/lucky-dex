'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

function rng(seed){let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;}
function timeFor(place,lo,hi){const mix=Math.imul(place.length+7,2654435761);for(let n=1;n<50000;n++){const seed=(n^mix)>>>0,r=rng(seed);if(r>=lo&&r<hi)return n;}throw new Error('seed not found');}
function harness(){
 const timers=new Map();let timerId=0;
 const body={innerHTML:''},controls={innerHTML:''};
 const shell={config:null,open(config){this.config=config;config.render(body,controls);return config;},close(){this.config=null;return true;}};
 global.LuckyDexAdventureActivityShell=shell;
 global.LuckyDexAdventureActivities={capabilitiesFor:()=>[{type:'fish',poolKey:'hoenn'}],ensureState:s=>s.adventureActivities||(s.adventureActivities={helpSeen:{fishing:true}})};
 global.LuckyDexRegionalEngine={enterFishingWild:()=>true};
 global.setTimeout=(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;};
 global.clearTimeout=id=>timers.delete(id);
 const runNext=()=>{const entry=[...timers.entries()].sort((a,b)=>a[0]-b[0])[0];if(!entry)return false;timers.delete(entry[0]);entry[1].fn();return true;};
 delete require.cache[require.resolve('../app/src/main/assets/adventure/adventure-fishing.js')];
 const Fishing=require('../app/src/main/assets/adventure/adventure-fishing.js');
 const save={adventureRegional:{active:{}},adventureActivities:{helpSeen:{fishing:true}}},place={name:'Dewford Town',region:'hoenn'},host={};
 Fishing.open(save,place,{host,saveNow(){}});
 const press=(attr)=>shell.config?.onInput?.({dataset:{},hasAttribute:n=>n===attr});
 return{Fishing,shell,body,controls,place,press,runNext};
}

test('after casting, Gen III fishing feedback is rendered in the fixed controls row, not inside the map body',()=>{
 const h=harness(),original=Date.now;Date.now=()=>timeFor(h.place.name,0,.30);
 h.press('data-fish-cast');
 assert.match(h.controls.innerHTML,/adv-fishing-gen3-dialog/);
 assert.match(h.controls.innerHTML,/\./);
 assert.doesNotMatch(h.body.innerHTML,/adv-fishing-gen3-dialog/);
 Date.now=original;
});

test('Oh! A bite! is a visible tappable control in the fixed controls row',()=>{
 const h=harness(),original=Date.now;Date.now=()=>timeFor(h.place.name,.44,1);
 h.press('data-fish-cast');h.runNext();h.runNext();h.runNext();
 assert.match(h.controls.innerHTML,/Oh! A bite!/);
 assert.match(h.controls.innerHTML,/data-fish-hook/);
 assert.match(h.controls.innerHTML,/adv-fishing-gen3-dialog[^\"]*is-action/);
 assert.doesNotMatch(h.body.innerHTML,/data-fish-hook/);
 Date.now=original;
});

test('ready state keeps rod and CAST LINE controls instead of the feedback box',()=>{
 const h=harness();
 assert.match(h.controls.innerHTML,/data-fish-cast/);
 assert.match(h.controls.innerHTML,/data-fish-rod/);
 assert.doesNotMatch(h.controls.innerHTML,/adv-fishing-gen3-dialog/);
});
