'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-great-encounters');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opponent=require('../app/src/main/assets/tcg-classic-opponents');
const loan=opponent.generate({sets:['dp2'],type:'Grass',seed:17});assert(loan.ok);
const ref=(id,uid)=>({cardId:id,uid:uid||id+'-ref'});
function slot(id,uid,energy={}){const x=core.makePokemonSlot(id,2,uid||id+'-slot');x.energy=energy;return x;}
function board(id='dp4-2',enemy='dp4-61',seed=23){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=10;for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];s.sides[who].deck=[];}s.sides.player.active=slot(id,'our',{Grass:3,Fire:3,Water:3,Lightning:3,Psychic:3,Fighting:3,Darkness:3,Metal:3});s.sides.opponent.active=slot(enemy,'enemy');return s;}
function bench(s,who,id,uid='b',energy={}){const p=slot(id,uid,energy);p.benchSlot=s.sides[who].bench.length;s.sides[who].bench.push(p);return p;}
function act(s,type,pred){const a=core.legalActions(s,s.activeSide).find(x=>x.type===type&&(!pred||pred(x)));assert(a,`${type} unavailable`);core.applyAction(s,s.activeSide,a);return a;}
function hit(s,i=0){return act(s,'attack',x=>x.attackIndex===i);}
function power(s,id){return act(s,'ability',x=>!id||x.cardId===id);}
function choose(s,pred){assert.equal(s.phase,'effectChoice','no choice');const a=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');const next=pred?a.find(pred):a.find(x=>!x.choiceSkip)||a[0];assert(next,'matching choice missing '+JSON.stringify(a));core.applyAction(s,s.choiceSide,next);return next;}
function finish(s){for(let i=0;i<35&&s.phase==='effectChoice';i++)choose(s);assert.notEqual(s.phase,'effectChoice','looped pending choice');}
const n=s=>s.sides.player,foe=s=>s.sides.opponent;

test('Blaziken Fire Dance attaches a real discarded Fire Energy and Flame Kick targets Bench after paying two',()=>{
 const s=board('dp4-1'); n(s).energyDiscard.Fire=2; const b=bench(s,'player','dp4-89');
 hit(s);choose(s,a=>a.choiceTarget==='bench');finish(s);
 assert.equal(b.energy.Fire,1);assert.equal(n(s).energyDiscard.Fire,1);assert.equal(foe(s).active.damage,30);
 const x=board('dp4-1','dp4-61');const target=bench(x,'opponent','dp4-1','large');n(x).active.energy={Fire:4};
 hit(x,1);choose(x,a=>a.choiceTarget==='bench');finish(x);
 assert.equal(target.damage,80);assert.equal(foe(x).active.damage,0);assert.equal(n(x).active.energy.Fire,2);
});
test('Milotic Twister resolves both coins, gives physical Energy discard choices, and Marvel Scale blocks LV.X',()=>{
 let checked=false;
 for(let seed=1;seed<30&&!checked;seed++){
  const s=board('dp4-25','dp4-61',seed);foe(s).active.energy={Water:4};
  hit(s);const coins=s.log.find(x=>x.reason==='Twister');assert.ok(coins);assert.equal(coins.results.length,2);
  if(coins.heads){assert.equal(s.phase,'effectChoice');let pending=coins.heads;
    while(s.phase==='effectChoice'&&pending-- >0)choose(s,a=>a.effectEnergyType==='Water');
    assert.equal(foe(s).active.energy.Water,4-coins.heads);checked=true;
  }else assert.equal(foe(s).active.damage,0);
 }
 assert.ok(checked);
 const x=board('dp4-103','dp4-25');n(x).active.energy={Psychic:3};hit(x);
 assert.equal(foe(x).active.damage,0,'Marvel Scale must prevent damage from an attacking LV.X');
});
test('Wailord Sleeping Pulse heals between turns when it remains Asleep',()=>{
 const s=board('dp4-30');n(s).active.damage=30;n(s).active.conditions={sleep:true};
 act(s,'endTurn');assert.equal(n(s).active.damage,20);
});
test('Weezing Toxic Virus increases Poison damage to both players between turns',()=>{
 const s=board('dp4-31','dp4-61');bench(s,'player','dp4-61');
 n(s).active.conditions={poison:{amount:10}};foe(s).active.conditions={poison:{amount:10}};
 act(s,'endTurn');assert.equal(n(s).active.damage,20);assert.equal(foe(s).active.damage,20);
});
test('Unown F Hidden Power retains optional flip and FAKE gives opponent a real guess',()=>{
 const s=board('dp4-56');hit(s);
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceOption===0);finish(s);
 assert.equal(foe(s).active.damage,10);
 const x=board('dp4-61');bench(x,'player','dp4-56');n(x).deck=[ref('dp4-93','drawn')];
 const action=core.legalActions(x,'player').find(a=>a.type==='ability'&&a.cardId==='dp4-56');assert.ok(action,'Bench FAKE ability missing');
 core.applyAction(x,'player',action);assert.equal(x.phase,'effectChoice');assert.equal(x.choiceSide,'opponent');
 const hidden=x.pendingChoice?.effect?.hiddenHeads;assert.equal(typeof hidden,'boolean');
 choose(x,a=>a.choiceOption===(hidden?1:0));finish(x);
 assert.ok(n(x).hand.some(r=>r.uid==='drawn'),'wrong guess must draw card');
});
test('Cresselia LV.X Full Moon Dance moves one damage counter across boards, and Moon Skip awards a second Prize',()=>{
 const s=board('dp4-103','dp4-1');n(s).active.damage=30;
 power(s);choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceTarget==='active');choose(s,a=>a.choiceOption===1);choose(s,a=>a.choiceTarget==='active');finish(s);
 assert.equal(n(s).active.damage,20);assert.equal(foe(s).active.damage,10);
 const x=board('dp4-103','dp4-61');foe(x).active.damage=30;
 hit(x);const claims=(x.pendingPrizeClaims||[]).filter(c=>c.side==='player');
 assert.ok((claims.reduce((n,c)=>n+c.remaining,0)>=2)||x.phase==='prizeChoice'||x.pendingChoice?.kind==='prizeCard',JSON.stringify({claims,phase:x.phase,pending:x.pendingChoice,log:x.log.slice(-4)}));
});
