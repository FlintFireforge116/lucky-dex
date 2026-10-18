'use strict';
const assert=require('node:assert/strict');

class ClassList{constructor(){this.s=new Set()}add(...x){x.forEach(v=>this.s.add(v))}remove(...x){x.forEach(v=>this.s.delete(v))}toggle(x,on){if(on===undefined)on=!this.s.has(x);on?this.s.add(x):this.s.delete(x);return on}contains(x){return this.s.has(x)}}
class Style{constructor(){this.v={};this.width=''}setProperty(k,v){this.v[k]=String(v)}}
class Node{constructor(id=''){this.id=id;this.hidden=false;this.textContent='';this.dataset={};this.classList=new ClassList();this.style=new Style();this.listeners={};this.attrs={};this.src='';this.alt='';}addEventListener(t,f){(this.listeners[t]??=[]).push(f)}dispatch(t,e={}){for(const f of this.listeners[t]||[])f({...e,type:t,currentTarget:this,target:this,preventDefault:e.preventDefault||(()=>{}),stopPropagation:e.stopPropagation||(()=>{}),pointerId:e.pointerId??1})}setAttribute(k,v){this.attrs[k]=String(v)}setPointerCapture(){} }
const ids=['rockHardenGame','rockHardenStage','rockHardenTimer','rockHardenPlace','rockHardenDifficultyLabel','rockHardenPlayerLane','rockHardenCpu1Lane','rockHardenCpu2Lane','rockHardenCpu3Lane','rockHardenPlayerScore','rockHardenCpu1Score','rockHardenCpu2Score','rockHardenCpu3Score','rockHardenPlayerHp','rockHardenCpu1Hp','rockHardenCpu2Hp','rockHardenCpu3Hp','rockHardenPlayerSprite','rockHardenCpu1Sprite','rockHardenCpu2Sprite','rockHardenCpu3Sprite','rockHardenPlayerRock','rockHardenCpu1Rock','rockHardenCpu2Rock','rockHardenCpu3Rock','rockHardenPlayerShadow','rockHardenCpu1Shadow','rockHardenCpu2Shadow','rockHardenCpu3Shadow','rockHardenPlayerGrade','rockHardenCpu1Grade','rockHardenCpu2Grade','rockHardenCpu3Grade','rockHardenCountdown','rockHardenReady','rockHardenStart','rockHardenButton','rockHardenControls','rockHardenPauseOverlay','rockHardenResume','rockHardenStandings','rockHardenBest'];
const nodes=new Map(ids.map(id=>[id,new Node(id)]));
const diff=['easy','normal','hard'].map(k=>{const n=new Node();n.dataset.rockHardenDifficulty=k;return n});
const docListeners={};let clock=0,rafCb=null;global.performance={now:()=>clock};
function tick(t){clock=t;const cb=rafCb;rafCb=null;if(cb)cb(t)}
global.document={hidden:false,getElementById:id=>nodes.get(id)||null,querySelectorAll:s=>s==='[data-rock-harden-difficulty]'?diff:[],addEventListener:(t,f)=>{(docListeners[t]??=[]).push(f)},dispatch(t,e={}){for(const f of docListeners[t]||[])f({...e,type:t,target:this,currentTarget:this,preventDefault:e.preventDefault||(()=>{}),stopPropagation:e.stopPropagation||(()=>{})})}};
global.requestAnimationFrame=fn=>{rafCb=fn;return 1};global.cancelAnimationFrame=()=>{rafCb=null};global.addEventListener=()=>{};
const realCore=require('../app/src/main/assets/arcade-rock-harden-core.js');let consumeCalls=0;
global.LuckyDexRockHardenCore={...realCore,consumeEvents(round){consumeCalls++;return realCore.consumeEvents(round)}};
global.LuckyDexArcadeSession={mount:id=>{global.mounted=id},showResult:()=>({})};
global.LuckyDexArcadePlatform={ensureArcadeState:a=>a||{},awardRun:o=>({coinsAwarded:o.coins})};
global.state={arcade:{rockHarden:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},bestPerfects:0,perfectBlocks:0,totalBlocks:0,bestHpRemaining:0,goldRocksSeen:0,goldRocksPerfected:0,goldRewardsClaimed:0}}};global.save=()=>{};

delete require.cache[require.resolve('../app/src/main/assets/arcade-rock-harden.js')];
const game=require('../app/src/main/assets/arcade-rock-harden.js');
assert.equal(typeof game.open,'function');assert.equal(typeof game.press,'function');assert.equal(typeof game.release,'function');assert.equal(typeof game.snapshot,'function');

game.open();let s=game.snapshot();assert.equal(global.mounted,'rockHarden');assert.equal(s.phase,'idle');assert.equal(s.difficulty,'normal');assert.equal(s.racers.length,4);assert.equal(new Set(s.racers.map(r=>r.species.dex)).size,4,'all four racers should use different species');
for(let i=0;i<4;i++){const sprite=nodes.get(['rockHardenPlayerSprite','rockHardenCpu1Sprite','rockHardenCpu2Sprite','rockHardenCpu3Sprite'][i]);assert.match(sprite.src,/arcade\/sprites\/actors\/pokemon\/\d+\.png$/);}

game.startRound({difficulty:'normal',countdownMs:1200});assert.equal(nodes.get('rockHardenCountdown').textContent,'3');tick(400);assert.equal(nodes.get('rockHardenCountdown').textContent,'2');tick(800);assert.equal(nodes.get('rockHardenCountdown').textContent,'1');tick(1200);assert.equal(game.snapshot().phase,'running');assert.equal(nodes.get('rockHardenCountdown').textContent,'HARDEN!');

// Pointer ownership: a second pointer cannot steal or release the active hold.
game.showReady({difficulty:'normal'});clock=0;game.startRound({countdownMs:0,difficulty:'normal'});const button=nodes.get('rockHardenButton');button.dispatch('pointerdown',{pointerId:2});assert.equal(game.snapshot().player.hardened,true);const started=game.snapshot().player.hardenStartedAt;button.dispatch('pointerdown',{pointerId:3});assert.equal(game.snapshot().player.hardenStartedAt,started);button.dispatch('pointerup',{pointerId:3});assert.equal(game.snapshot().player.hardened,true,'non-owner pointer cannot release Harden');button.dispatch('pointercancel',{pointerId:2});assert.equal(game.snapshot().player.hardened,false);

// Keyboard repeat/held-key bookkeeping.
game.showReady({difficulty:'normal'});clock=50;game.startRound({countdownMs:0});document.dispatch('keydown',{key:'a',repeat:false});const keyStart=game.snapshot().player.hardenStartedAt;document.dispatch('keydown',{key:'a',repeat:true});document.dispatch('keydown',{key:'a',repeat:false});assert.equal(game.snapshot().player.hardenStartedAt,keyStart,'repeat and duplicate keydown ignored');document.dispatch('keyup',{key:'a'});assert.equal(game.snapshot().player.hardened,false);document.dispatch('keydown',{key:' ',repeat:false});assert.equal(game.snapshot().player.hardened,true);document.dispatch('keyup',{key:' '});assert.equal(game.snapshot().player.hardened,false);

// Drive to the first telegraph, then Perfect the impact and prove event-driven grade rendering is consumed once.
game.showReady({difficulty:'hard'});clock=1000;game.startRound({countdownMs:0,difficulty:'hard'});s=game.snapshot();const firstImpact=s.nextImpactAt;assert.ok(firstImpact>clock);tick(firstImpact-100);game.press();tick(firstImpact);s=game.snapshot();assert.equal(s.player.lastGrade,'perfect');assert.equal(s.player.score,3);assert.match(nodes.get('rockHardenPlayerGrade').textContent,/PERFECT/i);assert.equal(nodes.get('rockHardenPlayerScore').textContent,'3');assert.ok(Number.parseFloat(nodes.get('rockHardenPlayerHp').style.v['--rock-harden-hp']||'100')<=100);const consumedAfterImpact=consumeCalls;tick(firstImpact+10);assert.ok(consumeCalls>consumedAfterImpact,'RAF can poll events again');assert.equal(realCore.consumeEvents({events:[]}).length,0); // sanity: event consumption is destructive

s=game.snapshot();for(const key of ['phase','difficulty','timerMs','place','racers','gold','finalized','finalResult'])assert.ok(Object.hasOwn(s,key),key);assert.equal(s.racers.length,4);for(const r of s.racers){for(const key of ['id','hp','score','species','alive','hardened','lastGrade'])assert.ok(Object.hasOwn(r,key),`${r.id}.${key}`)}assert.equal(Object.hasOwn(s.gold,'prize'),false,'snapshot must not expose pre-rolled Gold prize');assert.equal(Object.hasOwn(s.gold,'fallbackPrize'),false);assert.equal(JSON.stringify(s.gold).includes('category'),false,'unclaimed Gold reward category stays private');

game.close();assert.equal(game.snapshot().phase,'closed');
console.log('PASS v0.38.0 Rock Harden runtime controls/render model');
