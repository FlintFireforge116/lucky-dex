'use strict';
const assert=require('node:assert/strict');
class ClassList{constructor(){this.s=new Set()}add(...x){x.forEach(v=>this.s.add(v))}remove(...x){x.forEach(v=>this.s.delete(v))}toggle(x,on){if(on===undefined)on=!this.s.has(x);on?this.s.add(x):this.s.delete(x);return on}contains(x){return this.s.has(x)}}
class Style{constructor(){this.v={}}setProperty(k,v){this.v[k]=String(v)}}
class Node{constructor(id=''){this.id=id;this.hidden=false;this.textContent='';this.dataset={};this.classList=new ClassList();this.style=new Style();this.listeners={};this.attrs={};}addEventListener(t,f){(this.listeners[t]??=[]).push(f)}dispatch(t,e={}){for(const f of this.listeners[t]||[])f({...e,type:t,currentTarget:this,target:this,preventDefault:e.preventDefault||(()=>{})})}setAttribute(k,v){this.attrs[k]=String(v)}querySelector(sel){if(sel==='[data-dig-progress]')return this.progressNode||(this.progressNode=new Node());if(sel==='.dig-sandshrew')return this.sprite||(this.sprite=new Node());return null}}
const ids=['digDigDigGame','digDigDigStage','digDigDigReady','digDigDigStart','digDigDigCountdown','digDigDigPlace','digDigDigTimer','digDigDigDifficultyLabel','digDigDigRace','digDigDigPlayerLane','digDigDigCpu1Lane','digDigDigCpu2Lane','digDigDigCpu3Lane','digDigDigLeft','digDigDigRight','digDigDigControls','digDigDigPauseOverlay','digDigDigResume','digDigDigBest','digDigDigNext','digDigDigStandings'];
const nodes=new Map(ids.map(id=>[id,new Node(id)]));
const docListeners={};
let clock=0,rafCb=null;global.performance={now:()=>clock};
function tick(t){clock=t;const cb=rafCb;rafCb=null;if(cb)cb(t);}
global.document={hidden:false,getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],addEventListener:(t,f)=>{(docListeners[t]??=[]).push(f)},dispatch(t,e={}){for(const f of docListeners[t]||[])f({...e,type:t,target:this,currentTarget:this,preventDefault:e.preventDefault||(()=>{})})}};
global.requestAnimationFrame=fn=>{rafCb=fn;return 1};global.cancelAnimationFrame=()=>{rafCb=null};
global.LuckyDexDigDigDigCore=require('../app/src/main/assets/arcade-dig-dig-dig-core.js');
global.LuckyDexArcadeSession={mount:(id)=>{global.mounted=id},update:()=>{},showResult:()=>({})};
global.LuckyDexArcadePlatform={ensureArcadeState:a=>a||{},awardRun:()=>({coinsAwarded:0})};
global.state={arcade:{digDigDig:{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0}}}};
delete require.cache[require.resolve('../app/src/main/assets/arcade-dig-dig-dig.js')];
const game=require('../app/src/main/assets/arcade-dig-dig-dig.js');
assert.equal(typeof game.open,'function');assert.equal(typeof game.input,'function');assert.equal(typeof game.snapshot,'function');
game.open();let s=game.snapshot();assert.equal(global.mounted,'digDigDig');assert.equal(s.phase,'idle');assert.equal(s.difficulty,'normal');assert.deepEqual(s.racers.map(r=>r.progress),[0,0,0,0]);
game.startRound({countdownMs:1200,difficulty:'normal'});assert.equal(nodes.get('digDigDigCountdown').textContent,'3');tick(400);assert.equal(nodes.get('digDigDigCountdown').textContent,'2');tick(800);assert.equal(nodes.get('digDigDigCountdown').textContent,'1');tick(1200);assert.equal(game.snapshot().phase,'racing');assert.equal(nodes.get('digDigDigCountdown').textContent,'DIG!');assert.equal(nodes.get('digDigDigCountdown').hidden,false,'DIG flash is visible as racing begins');tick(1450);assert.equal(nodes.get('digDigDigCountdown').hidden,true,'DIG flash clears after a short beat');
game.showReady({difficulty:'normal'});game.startRound({countdownMs:0,difficulty:'normal'});s=game.snapshot();assert.equal(s.phase,'racing');
game.input('left');assert.equal(game.snapshot().racers[0].progress,1);const scroll1=nodes.get('digDigDigPlayerLane').style.v['--dig-scroll'];
game.input('left');assert.equal(game.snapshot().racers[0].progress,1);assert.equal(nodes.get('digDigDigPlayerLane').style.v['--dig-scroll'],scroll1,'rejected repeat does not fake terrain movement');
game.input('right');s=game.snapshot();assert.equal(s.racers[0].progress,2);assert.equal(s.playerLastSide,'right');
const before=s.racers[0].progress;document.dispatch('keydown',{key:'ArrowLeft',repeat:true});assert.equal(game.snapshot().racers[0].progress,before,'auto repeat ignored');document.dispatch('keydown',{key:'a',repeat:false});assert.equal(game.snapshot().racers[0].progress,before+1);document.dispatch('keydown',{key:'d',repeat:false});assert.equal(game.snapshot().racers[0].progress,before+2);
function digTo(target){while(game.snapshot().racers[0].progress<target){const last=game.snapshot().playerLastSide;game.input(last==='left'?'right':'left');}}
digTo(30);assert.equal(nodes.get('digDigDigPlayerLane').classList.contains('is-mid'),true,'mid-depth terrain stratum appears');digTo(60);assert.equal(nodes.get('digDigDigPlayerLane').classList.contains('is-deep'),true,'deep rocky stratum appears');digTo(74);assert.equal(nodes.get('digDigDigPlayerLane').classList.contains('is-breakthrough'),true,'breakthrough stratum appears near the bottom');digTo(80);s=game.snapshot();assert.ok(s.racers.every(r=>r.progress>=0&&r.progress<=80));assert.equal(s.racers[0].progress,80);
game.close();assert.equal(game.snapshot().phase,'closed');
console.log('PASS v0.36.0 Dig runtime controls and four-racer render model');
