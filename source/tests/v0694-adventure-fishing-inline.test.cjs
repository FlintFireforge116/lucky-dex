'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

function rng(seed){let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;}
function timeFor(place,lo,hi){const mix=Math.imul(place.length+7,2654435761);for(let n=1;n<50000;n++){const seed=(n^mix)>>>0,r=rng(seed);if(r>=lo&&r<hi)return n;}throw new Error('seed not found');}
class FakeNode{
 constructor(){this.innerHTML='';this.parent=null;this.listeners={};this.removed=false;}
 addEventListener(type,fn){this.listeners[type]=fn;}
 removeEventListener(type,fn){if(this.listeners[type]===fn)delete this.listeners[type];}
 remove(){this.removed=true;if(this.parent)this.parent.child=null;}
 contains(){return true;}
 fire(button){this.listeners.click?.({target:{closest:()=>button},preventDefault(){},stopPropagation(){}});}
}
function harness(){
 const timers=new Map();let timerId=0,encounters=0,closed=0;
 const host={innerHTML:'<section data-town-menu>DEWFORD TOWN</section>',child:null,appendChild(node){this.child=node;node.parent=this;return node;}};
 global.document={createElement:()=>new FakeNode()};
 global.LuckyDexAdventureActivityShell={open(){throw new Error('Fishing must not open the full activity shell');},close(){return true;}};
 global.LuckyDexAdventureActivities={capabilitiesFor:()=>[{type:'fish',poolKey:'hoenn'}],ensureState:s=>s.adventureActivities||(s.adventureActivities={helpSeen:{fishing:true}})};
 global.LuckyDexRegionalEngine={enterFishingWild:()=>{encounters++;return true;}};
 global.setTimeout=(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;};
 global.clearTimeout=id=>timers.delete(id);
 const runNext=()=>{const entry=[...timers.entries()].sort((a,b)=>a[0]-b[0])[0];if(!entry)return false;timers.delete(entry[0]);entry[1].fn();return true;};
 delete require.cache[require.resolve('../app/src/main/assets/adventure/adventure-fishing.js')];
 const Fishing=require('../app/src/main/assets/adventure/adventure-fishing.js');
 const save={adventureRegional:{active:{badges:0}},adventureActivities:{helpSeen:{fishing:true},records:{}},arcade:{fishing:{}}},place={name:'Dewford Town',region:'hoenn'};
 Fishing.open(save,place,{host,saveNow(){},onClose(){closed++;},onEncounter(){}});
 const press=(attr,dataset={})=>{const b={dataset,hasAttribute:n=>n===attr};host.child.fire(b);};
 return{Fishing,host,place,runNext,press,get encounters(){return encounters},get closed(){return closed}};
}

test('Adventure Fishing stays on the town screen and opens a compact inline fishing overlay',()=>{
 const h=harness();
 assert.match(h.host.innerHTML,/data-town-menu/);
 assert.ok(h.host.child,'inline fishing overlay was not appended');
 assert.match(h.host.child.innerHTML,/CAST LINE/);
 assert.match(h.host.child.innerHTML,/adv-fishing-inline/);
});

test('casting shows the Gen III dot sequence in the inline box without replacing Dewford',()=>{
 const h=harness(),original=Date.now;Date.now=()=>timeFor(h.place.name,0,.30);
 h.press('data-fish-cast');
 assert.match(h.host.child.innerHTML,/adv-fishing-inline-message/);
 assert.match(h.host.child.innerHTML,/>\.<\/p>/);
 assert.match(h.host.innerHTML,/DEWFORD TOWN/);
 h.runNext();assert.match(h.host.child.innerHTML,/>\.\.<\/p>/);
 h.runNext();assert.match(h.host.child.innerHTML,/>\.\.\.<\/p>/);
 Date.now=original;
});

test('Oh! A bite! is tapped in the inline box and a successful hook enters one battle',()=>{
 const h=harness(),original=Date.now;Date.now=()=>timeFor(h.place.name,.44,1);
 h.press('data-fish-cast');h.runNext();h.runNext();h.runNext();
 assert.match(h.host.child.innerHTML,/Oh! A bite!/);
 assert.match(h.host.child.innerHTML,/data-fish-hook/);
 h.press('data-fish-hook');assert.match(h.host.child.innerHTML,/Pokémon(?:'|&#39;)s on the hook!/);h.runNext();
 Date.now=original;
 assert.equal(h.encounters,1);
});
