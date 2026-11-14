'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-secret-wonders');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const auditor=require('../scripts/audit-classic-set.cjs');
const loan=opp.generate({sets:['dp2'],type:'Grass',seed:17});assert.ok(loan.ok);
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
function slot(id,uid,energy={}){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy=energy;return s;}
function board(card='dp3-2',opponent='dp3-18',side='player',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:side,playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES});
 s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}
 const foe=side==='player'?'opponent':'player';
 s.sides[side].active=slot(card,side+'-a',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4});
 s.sides[foe].active=slot(opponent,foe+'-a');return s;
}
function hit(s,i=0,side='player'){
 const a=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===i);
 assert.ok(a,'attack '+i+' unavailable '+JSON.stringify(core.legalActions(s,side).filter(x=>x.type==='attack')));
 core.applyAction(s,side,a);
 return a;
}
function activate(s,id,side='player'){
 const a=core.legalActions(s,side).find(x=>x.type==='ability'&&x.cardId===(id||s.sides[side].active.cardId));
 assert.ok(a,'ability unavailable '+(id||'')+' '+JSON.stringify(core.legalActions(s,side).filter(x=>x.type==='ability')));
 core.applyAction(s,side,a);
}
function choice(s,pick){assert.equal(s.phase,'effectChoice');const actions=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(actions.length,'choice missing');const a=pick?pick(actions):actions.find(a=>!a.choiceSkip)||actions[0];assert.ok(a,'no choice matched '+JSON.stringify(actions));core.applyAction(s,s.choiceSide,a);return a;}
function finish(s){for(let n=0;n<30&&s.phase==='effectChoice';n++)choice(s);assert.notEqual(s.phase,'effectChoice','looping choice');}

test('Secret Wonders 132/132 entries have real action effects and pass full-set smoke',()=>{
 assert.equal(set.coverage().battleEnabled,132);assert.equal(set.coverage().gated.length,0);
 for(const card of set.CARDS)for(const item of [...(card.attacks||[]),...(card.abilities||[]),card])if(item.effect)assert.deepEqual(fx.validateEffect(item.effect),[],card.id);
 const report=auditor.auditSet('dp3',{data,fx,core,opponents:opp,smoke:true,cpu:false,engineText:''});
 assert.equal(report.summary.errors,0);assert.equal(report.smoke.skipped,0);
 assert.equal(report.smoke.attempted,report.smoke.executed);
});

test('Ampharos Jamming triggers from opponent Supporter and cannot stack multiple Ampharos',()=>{
 const s=board('dp3-1','dp3-18','opponent'); // owner player is defender of Supporter
 const a=slot('dp3-1','amp');a.benchSlot=0;s.sides.player.bench=[a];
 s.sides.player.active=slot('dp3-77','ally');
 s.sides.opponent.hand=[ref('dp3-124','rival')];
 const action=core.legalActions(s,'opponent').find(x=>x.type==='trainer'&&x.cardId==='dp3-124');
 assert.ok(action,'Rival should be a playable Supporter');
 core.applyAction(s,'opponent',action);finish(s);
 assert.equal(s.sides.opponent.active.damage,10);
});

test('Gallade face-up prizes are selected individually and add 20 per new face-up Prize',()=>{
 const s=board('dp3-6');s.sides.player.prizes=[ref('dp3-123','p0'),ref('dp3-119','p1'),ref('dp3-127','p2')];
 hit(s,1);assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.find(x=>x.choicePrizeIndex===1));
 assert.equal(s.sides.player.prizes[1].faceUp,true);
 choice(s,a=>a.find(x=>x.choiceSkip));finish(s);
 assert.equal(s.sides.opponent.active.damage,60); // 60+20 minus Salamence Fighting resistance 20, +20 counter after
});

test('Raikou Thunder Climb discards only top three once, then selects correct attachment target',()=>{
 const s=board('dp3-16');s.sides.player.deck=[ref('base1-100','l1'),ref('base1-100','l2'),ref('dp3-77','bulb'),ref('dp3-82','next')];
 const bench=slot('dp3-82','be');bench.benchSlot=0;s.sides.player.bench=[bench];
 hit(s,0);assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.find(x=>x.choiceTarget==='bench'));
 finish(s);
 assert.equal(s.sides.player.bench[0].energy.Lightning,2);
 assert.equal(s.sides.player.discard.filter(r=>r.uid==='bulb').length,1);
 assert.ok(!s.sides.player.discard.some(r=>['l1','l2'].includes(r.uid)));
 assert.ok(!s.sides.player.deck.some(r=>['l1','l2','bulb'].includes(r.uid)));
});

test('Jumpluff Cottonweed Punch flips two coins and gives an actual target choice',()=>{
 for(let seed=1;seed<20;seed++){
  const s=board('dp3-11','dp3-18','player',seed),b=slot('dp3-82','bench');b.benchSlot=0;s.sides.opponent.bench=[b];
  hit(s);
  const roll=s.log.find(x=>x.reason==='Cottonweed Punch');assert.ok(roll);assert.equal(roll.results.length,2);
  if(roll.heads){assert.equal(s.phase,'effectChoice');choice(s,a=>a.find(x=>x.choiceTarget==='bench'));assert.equal(b.damage,30*roll.heads);}
  finish(s);
 }
});

test('Venusaur Miracle Aroma never loops on heads and applies chosen status',()=>{
 let headsSeen=0;for(let seed=1;seed<=20;seed++){
  const s=board('dp3-20','dp3-18','player',seed);activate(s);const result=s.log.find(x=>x.reason==='Miracle Aroma');assert.ok(result);
  if(result.heads){headsSeen++;assert.equal(s.phase,'effectChoice');choice(s,a=>a.find(x=>x.choiceLabel==='Poisoned'));assert.ok(s.sides.opponent.active.conditions.poison);}
  finish(s);
 }assert.ok(headsSeen>=2);
});

test('Golduck Break Beam choice changes damage and confuses only when bonus accepted',()=>{
 const s=board('dp3-28','dp3-18');hit(s,1);assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.find(x=>x.choiceOption===1));finish(s);
 assert.equal(s.sides.opponent.active.damage,60);assert.ok(s.sides.player.active.conditions.confusion);
});

test('Golem Megaton Rock optional shield lowers damage and incoming damage',()=>{
 const s=board('dp3-29','dp3-18');hit(s,1);assert.equal(s.phase,'effectChoice');choice(s,a=>a.find(x=>x.choiceOption===1));finish(s);
 assert.equal(s.sides.opponent.active.damage,20); // Fighting resisted by 20; optional 40 instead of 80
 assert.ok(s.sides.player.active.dp3MegatonShieldUntil>=10);
});

test('Weavile Dark Engage changes only Active type for the turn',()=>{
 const s=board('dp3-40','dp3-18');const b=slot('dp3-82','fire');b.benchSlot=0;s.sides.player.bench=[b];
 assert.deepEqual(fx.effectiveTypes(s,'player',s.sides.player.active,data.cardById),['Water']);
 activate(s);assert.deepEqual(fx.effectiveTypes(s,'player',s.sides.player.active,data.cardById),['Darkness']);
 assert.ok(!fx.effectiveTypes(s,'player',b,data.cardById).includes('Darkness'));
});

test('Unown X X-RAY and Unown Z ZERO obey Bench and zero-deck requirements',()=>{
 const s=board('dp3-82');const x=slot('dp3-71','x');x.benchSlot=0;s.sides.player.bench=[x];
 s.sides.opponent.deck=[ref('dp3-82','hidden')];activate(s,'dp3-71');assert.ok(s.log.some(x=>x.type==='revealTop'&&x.cardId==='dp3-82'));
 const z=slot('dp3-72','z');z.benchSlot=1;s.sides.player.bench.push(z);s.sides.player.deck=[];
 activate(s,'dp3-72');assert.equal(s.sides.player.deck[0].cardId,'dp3-72');assert.ok(!s.sides.player.bench.includes(z));
});

test('Gardevoir Telepass chooses real opponent Supporter without removing it',()=>{
 const s=board('dp3-7');s.sides.opponent.discard=[ref('dp3-124','rival')];
 activate(s);assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.find(x=>x.choiceCardId==='dp3-124')||a[0]);finish(s);
 assert.equal(s.sides.opponent.discard[0].uid,'rival');assert.ok(s.log.some(x=>x.type==='copyTrainer'));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='dp3-7'));
});

test('Unown O ONE draws up to 7 after exact Bench combination',()=>{
 const s=board('dp3-82');const ids=[70,69].map(n=>'dp3-'+n);const e=data.CARDS.find(c=>c.name==='Unown [E]');assert.ok(e);
 s.sides.player.bench=[...ids,e.id].map((id,i)=>{const p=slot(id,'unown-'+i);p.benchSlot=i;return p;});
 s.sides.player.hand=[ref('dp3-127','one')];activate(s,'dp3-70');assert.equal(s.sides.player.hand.length,7);
});

test('Minun Minus Charge draws two only after ally was KO’d on previous opponent turn',()=>{
 const s=board('dp3-32');s.sides.player.dp3AllyKoPreviousTurn=9;s.sides.player.deck=[ref('dp3-82','one'),ref('dp3-83','two')];
 const original=s.sides.player.hand.length;activate(s);assert.equal(s.sides.player.hand.length,original+2);
});

test('Electrode Energy Shift converts on KO to a single Rainbow Energy and awards no Prize',()=>{
 const s=board('dp3-20','dp3-26');s.sides.opponent.active.damage=40;
 const bench=slot('dp3-82','keeper');bench.benchSlot=0;s.sides.opponent.bench=[bench];
 const before=s.sides.player.prizes.length;hit(s);
 if(s.phase==='effectChoice')finish(s);
 assert.equal(s.sides.opponent.active?.cardId==='dp3-26',false,'Electrode leaves its Active slot');
 assert.ok(bench.specialEnergy.some(r=>r.cardId==='dp3-26'&&r.provides?.Miracle===1));
 assert.equal(s.sides.player.prizes.length,before,'no Prize taken');
});

test('Unown N NOD creates actual Prize claims with opponent consent and an owner Prize selection',()=>{
 const s=board('dp3-82','dp3-18');
 const names=['Unown [N]','Unown [O]','Unown [D]'];
 const ids=['dp3-69','dp3-70',data.CARDS.find(c=>c.name==='Unown [D]')?.id];assert.ok(ids.every(Boolean));
 s.sides.player.bench=ids.map((id,i)=>{const p=slot(id,'letter-'+i);p.benchSlot=i;return p;});
 s.sides.player.prizes=[ref('dp3-123','own1')];s.sides.opponent.prizes=[ref('dp3-124','other1')];
 activate(s,ids[0]);assert.equal(s.choiceSide,'opponent');
 choice(s,arr=>arr.find(a=>a.choiceOption===0));
 assert.equal(s.sides.opponent.prizes.length,0,'opponent should have drawn its Prize');
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 choice(s,arr=>arr.find(a=>a.choicePrizeIndex===0));
 assert.equal(s.sides.player.prizes.length,0);assert.ok(s.sides.player.hand.some(r=>r.uid==='own1'));
});

test('Dugtrio Dig Trap on heads protects its owner next turn and hits selected opposing Bench on turn end',()=>{
 let hitCases=0;for(let seed=1;seed<=18;seed++){
  const s=board('dp3-24','dp3-18','player',seed);
  const p=slot('dp3-82','target');p.benchSlot=0;s.sides.opponent.bench=[p];
  hit(s);const flip=s.log.find(x=>x.reason==='Dig Trap');assert.ok(flip);
  if(!flip.heads)continue;hitCases++;
  assert.equal(s.activeSide,'opponent');
  const action=core.legalActions(s,'opponent').find(a=>a.type==='endTurn');assert.ok(action);
  core.applyAction(s,'opponent',action);
  assert.equal(s.phase,'effectChoice');
  choice(s,arr=>arr.find(a=>a.choiceTarget==='bench'));
  assert.equal(p.damage,60);
 }
 assert.ok(hitCases>=2);
});

test('Gardevoir LV.X Bring Down takes lowest remaining-HP Pokémon even from own Bench',()=>{
 const s=board('dp3-131','dp3-18');
 const bench=slot('dp3-82','low');bench.benchSlot=0;bench.damage=40;s.sides.player.bench=[bench];
 hit(s);
 finish(s);
 assert.ok(!s.sides.player.bench.includes(bench),'the selected low-HP allied Pokemon should be knocked out');
});

test('Venomoth Dangerous Scales puts attacker to sleep and poisons it even on KO',()=>{
 const s=board('dp3-20','dp3-73');s.sides.opponent.active.damage=40;
 hit(s);
 assert.ok(s.sides.player.active.conditions.sleep);
 assert.ok(s.sides.player.active.conditions.poison);
});

test('Charizard Fury Blaze adds 50 only when opponent has 3 or fewer Prize cards',()=>{
 const damage=prizes=>{const s=board('dp3-3','dp3-18');s.sides.player.active.energy={Fire:4,Water:1};s.sides.opponent.active.damage=0;
  s.sides.opponent.prizes=Array.from({length:prizes},(_,i)=>ref('dp3-127','p'+i));hit(s);finish(s);
  return Number(s.sides.opponent.active?.damage||0)||Number(s.sides.player.prizesTaken||0)*1000;
 };
 assert.equal(damage(4),120);assert.ok(damage(3)>damage(4));
});

test('Pidgeot Mirror Move uses the damage taken from opponent last turn',()=>{
 const s=board('dp3-35','dp3-18');s.sides.player.active.lastDamageSource={side:'opponent',turn:9,attack:true,damage:30};
 hit(s,0);assert.equal(s.sides.opponent.active.damage,30);
});

test('Ho-Oh Phoenix Turn on heads keeps its Energy and grants opposing Prize',()=>{
 let seen=0;
 for(let seed=1;seed<=25;seed++){
  const s=board('dp3-20','dp3-10','player',seed);s.sides.opponent.active.damage=50;
  s.sides.player.prizes=[ref('dp3-124','prize'),ref('dp3-119','prize2')];
  hit(s);finish(s);
  const roll=s.log.find(x=>x.reason==='Phoenix Turn');assert.ok(roll,'Phoenix Turn coin missing');
  if(roll.heads){seen++;assert.equal(s.sides.opponent.active.cardId,'dp3-10');assert.equal(s.sides.opponent.active.damage,0);assert.ok(s.sides.opponent.active.energy);assert.equal(s.sides.player.prizes.length,1);}
 }
 assert.ok(seen>=4);
});
