'use strict';
const assert=require('node:assert/strict');
class ClassList{constructor(){this.s=new Set()}add(...x){x.forEach(v=>this.s.add(v))}remove(...x){x.forEach(v=>this.s.delete(v))}toggle(x,on){if(on===undefined)on=!this.s.has(x);on?this.s.add(x):this.s.delete(x);return on}}
class Style{constructor(){this.v={};this.width=''}setProperty(k,v){this.v[k]=String(v)}}
class Node{constructor(id=''){this.id=id;this.hidden=false;this.textContent='';this.dataset={};this.classList=new ClassList();this.style=new Style();this.listeners={};this.attrs={};this.src='';this.alt='';}addEventListener(t,f){(this.listeners[t]??=[]).push(f)}setAttribute(k,v){this.attrs[k]=String(v)}setPointerCapture(){}}
const ids=['rockHardenGame','rockHardenStage','rockHardenTimer','rockHardenPlace','rockHardenDifficultyLabel','rockHardenPlayerLane','rockHardenCpu1Lane','rockHardenCpu2Lane','rockHardenCpu3Lane','rockHardenPlayerScore','rockHardenCpu1Score','rockHardenCpu2Score','rockHardenCpu3Score','rockHardenPlayerHp','rockHardenCpu1Hp','rockHardenCpu2Hp','rockHardenCpu3Hp','rockHardenPlayerSprite','rockHardenCpu1Sprite','rockHardenCpu2Sprite','rockHardenCpu3Sprite','rockHardenPlayerRock','rockHardenCpu1Rock','rockHardenCpu2Rock','rockHardenCpu3Rock','rockHardenPlayerShadow','rockHardenCpu1Shadow','rockHardenCpu2Shadow','rockHardenCpu3Shadow','rockHardenPlayerGrade','rockHardenCpu1Grade','rockHardenCpu2Grade','rockHardenCpu3Grade','rockHardenCountdown','rockHardenReady','rockHardenStart','rockHardenButton','rockHardenControls','rockHardenPauseOverlay','rockHardenResume','rockHardenStandings','rockHardenBest'];
const nodes=new Map(ids.map(id=>[id,new Node(id)]));
const diff=['easy','normal','hard'].map(k=>{const n=new Node();n.dataset.rockHardenDifficulty=k;return n});
global.performance={now:()=>0};global.document={hidden:false,getElementById:id=>nodes.get(id)||null,querySelectorAll:s=>s==='[data-rock-harden-difficulty]'?diff:[],addEventListener:()=>{}};global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};global.addEventListener=()=>{};
global.LuckyDexRockHardenCore=require('../app/src/main/assets/arcade-rock-harden-core.js');global.LuckyDexArcadeSession={mount:()=>{},showResult:()=>({})};global.LuckyDexArcadePlatform={ensureArcadeState:a=>a||{},awardRun:o=>({coinsAwarded:o.coins})};global.state={arcade:{rockHarden:{}}};global.save=()=>{};
let seed=1;const oldRandom=Math.random;Math.random=()=>((seed=seed*1664525+1013904223>>>0)/4294967296);
delete require.cache[require.resolve('../app/src/main/assets/arcade-rock-harden.js')];const game=require('../app/src/main/assets/arcade-rock-harden.js');
game.open();const roster0=game.snapshot().racers.map(r=>r.species.dex);assert.equal(new Set(roster0).size,4);
game.selectDifficulty('easy');assert.deepEqual(game.snapshot().racers.map(r=>r.species.dex),roster0,'Easy selection must preserve setup roster');
game.selectDifficulty('hard');assert.deepEqual(game.snapshot().racers.map(r=>r.species.dex),roster0,'Hard selection must preserve setup roster');
game.startRound({difficulty:'hard',countdownMs:0});assert.deepEqual(game.snapshot().racers.map(r=>r.species.dex),roster0,'START must carry setup roster into match');
Math.random=oldRandom;game.close();
console.log('PASS v0.38.1 Rock Harden locked setup roster');
