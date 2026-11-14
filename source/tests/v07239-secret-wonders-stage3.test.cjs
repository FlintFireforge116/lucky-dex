'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-secret-wonders');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const auditor=require('../scripts/audit-classic-set.cjs');
const loan=opp.generate({sets:['dp2'],type:'Grass',seed:17});assert.ok(loan.ok);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
function slot(id,uid,energy={}){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy=energy;return s;}
function board(card='dp3-2',opponent='dp3-49',side='player',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:side,playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}
 const foe=side==='player'?'opponent':'player';s.sides[side].active=slot(card,side+'-a',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4});s.sides[foe].active=slot(opponent,foe+'-a');return s;
}
function hit(s,side='player',i=0){const a=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,'attack '+i+' not available '+JSON.stringify(core.legalActions(s,side).filter(x=>x.type==='attack')));core.applyAction(s,side,a);return a;}
function activate(s,side='player'){const a=core.legalActions(s,side).find(x=>x.type==='ability'&&x.cardId===s.sides[side].active.cardId);assert.ok(a,'ability unavailable');core.applyAction(s,side,a);}
function choice(s,fn){assert.equal(s.phase,'effectChoice');const a=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(a.length,'no choices');const picked=fn?fn(a):a.find(a=>!a.choiceSkip)||a[0];assert.ok(picked,'no matching choice '+JSON.stringify(a));core.applyAction(s,s.choiceSide,picked);return picked;}
function finish(s){for(let i=0;i<30&&s.phase==='effectChoice';i++)choice(s);assert.notEqual(s.phase,'effectChoice','choice flow stalled');}

test('Stage 3 catalog validates 88 real effects and smoke paths, remaining 44 gated',()=>{
 assert.equal(set.coverage().battleEnabled,132);assert.equal(set.coverage().gated.length,0);
 for(const c of set.CARDS.filter(c=>c.battleEnabled))for(const a of [...(c.attacks||[]),...(c.abilities||[]),c])if(a.effect)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+(a.name||'card'));
 const report=auditor.auditSet('dp3',{data,fx,core,opponents:opp,smoke:true,cpu:false,engineText:''});
 assert.equal(report.summary.errors,0);assert.equal(report.smoke.executed,report.smoke.attempted);assert.equal(report.smoke.skipped,0);
});

test('Blastoise Waterlog only consumes physical Basic Water from hand, can attach to Bench and ends turn after finishing',()=>{
 const s=board('dp3-2');s.sides.player.hand=[ref('neo1-111','w1'),ref('neo1-111','w2'),ref('dp3-129','metal')];
 const b=slot('dp3-82','b1');b.benchSlot=0;s.sides.player.bench=[b];
 activate(s);assert.equal(s.phase,'effectChoice');
 choice(s,arr=>arr.find(x=>x.choiceCardId==='neo1-111'));
 choice(s,arr=>arr.find(x=>x.choiceTarget==='bench'));
 assert.equal(b.energy.Water,1);assert.equal(s.sides.player.hand.filter(r=>r.cardId==='neo1-111').length,1);
 choice(s,arr=>arr.find(x=>x.choiceSkip));
 assert.equal(s.phase,'battle');assert.equal(s.activeSide,'opponent','Waterlog must end its user’s turn');
 assert.equal(s.sides.player.energySupply.length>0,true,'Waterlog never consumes the Energy Zone');
 const blocked=board('dp3-2');blocked.sides.player.active.conditions={sleep:true};blocked.sides.player.hand=[ref('neo1-111','w')];
 assert.ok(!core.legalActions(blocked,'player').some(a=>a.type==='ability'&&a.cardId==='dp3-2'));
});

test('Blastoise Hydro Pump adds at most 40 beyond required Water and Colorless energy',()=>{
 for(const [water,other,expected] of [[2,1,50],[3,1,70],[5,1,90],[3,0,50]]){
  const s=board('dp3-2','dp3-18');s.sides.player.active.energy={Water:water,Grass:other};hit(s);assert.equal(s.sides.opponent.active?.damage,expected);
 }
});

test('Gastrodon West Sea heals after Raging Flood and Wild Waves hits both Benches',()=>{
 const s=board('dp3-9','dp3-18');s.sides.player.active.damage=40;hit(s,'player',0);
 assert.equal(s.sides.opponent.active.damage,40);assert.equal(s.sides.player.active.damage,20);
 const w=board('dp3-9','dp3-18');const b1=slot('dp3-82','b1');b1.benchSlot=0;w.sides.player.bench=[b1];const b2=slot('dp3-17','b2');b2.benchSlot=0;w.sides.opponent.bench=[b2];
 hit(w,'player',1);assert.equal(b1.damage,10);assert.equal(b2.damage,10);assert.equal(w.sides.opponent.active.damage,60) // Salamence resists Fighting;
});

test('Gastrodon East Sea chooses how many counters to move to a West Sea target',()=>{
 const s=board('dp3-8');s.sides.player.active.damage=50;const west=slot('dp3-9','west');west.benchSlot=0;s.sides.player.bench=[west];activate(s);
 choice(s,arr=>arr.find(x=>x.choiceOption===2));choice(s,arr=>arr.find(x=>x.choiceCardId==='dp3-9'));
 assert.equal(s.sides.player.active.damage,30);assert.equal(west.damage,20);
});

test('Lugia Psychic Destruction checks defender Energy and Silver Wing returns selected card on heads',()=>{
 const s=board('dp3-14','dp3-18');s.sides.opponent.active.energy={Water:2};hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,70); // Salamence is weak to Colorless
 const x=board('dp3-14','dp3-3');hit(x,'player',1);assert.equal(x.sides.opponent.active?.damage,120);
 let heads=0;for(let seed=1;seed<=25;seed++){const p=board('dp3-14','dp3-18','player',seed);p.sides.opponent.active.energy={Water:2,Fire:1};hit(p);
  const flipped=p.log.find(e=>e.reason==='Silver Wing');assert.ok(flipped);if(!flipped.heads)continue;heads++;
  choice(p,arr=>arr.find(a=>a.choiceLabel?.includes('Fire')));finish(p);
  assert.equal(p.sides.opponent.active.energy.Fire,0);assert.ok(p.sides.opponent.hand.some(r=>data.cardById(r.cardId)?.subtype==='Fire'));
 }assert.ok(heads>=3);
});

test('Absol Baleful Wind removes random opponent hand cards; Raid only boosts when played from hand this turn',()=>{
 const s=board('dp3-21','dp3-18');s.sides.opponent.hand=[ref('dp3-127','t'),ref('dp3-122','sup')];hit(s,'player',0);assert.equal(s.sides.opponent.hand.length,1); // opponent draws for its new turn
 assert.equal(s.sides.opponent.discard.filter(r=>['t','sup'].includes(r.uid)).length,2);
 const x=board('dp3-21','dp3-18');x.sides.player.active.playedOnSideTurn=7;hit(x,'player',1);assert.equal(x.sides.opponent.active.damage,40);
 const y=board('dp3-21','dp3-18');hit(y,'player',1);assert.equal(y.sides.opponent.active.damage,10);
});

test('Electivire Motor Drive retrieves discarded Lightning and Discharge discards each energy before flipping',()=>{
 const x=board('dp3-25','dp3-18');x.sides.player.active.energy={Fire:1,Lightning:2};x.sides.player.energyDiscard={Lightning:1};activate(x);choice(x);assert.equal(x.sides.player.active.energy.Lightning,3);assert.equal(x.sides.player.energyDiscard.Lightning,0);
 const s=board('dp3-25','dp3-18');s.sides.player.active.energy={Lightning:3,Grass:1};hit(s);
 const flip=s.log.find(e=>e.reason==='Discharge');assert.ok(flip);assert.equal(flip.results.length,3);assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.energyDiscard.Lightning,3);assert.equal(s.sides.opponent.active?.damage,flip.heads*50);
});

test('Donphan Bash In doubles damage against Tool and Rapid Spin offers opponent then own Bench switches',()=>{
 const s=board('dp3-48','dp3-18');s.sides.opponent.active.tool=ref('dp2-66','tool');hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,110); // Salamence resists Fighting
 const x=board('dp3-48','dp3-18');const own=slot('dp3-82','own'),enemy=slot('dp3-17','enemy');own.benchSlot=0;enemy.benchSlot=0;x.sides.player.bench=[own];x.sides.opponent.bench=[enemy];hit(x);
 assert.equal(x.choiceSide,'opponent');choice(x);assert.equal(x.sides.opponent.active.uid,'enemy');
 assert.equal(x.choiceSide,'player');choice(x);assert.equal(x.sides.player.active.uid,'own');
});

test('Miltank Healing Milk heals selected damaged Pokémon based on two flips',()=>{
 let seen=0;for(let seed=1;seed<=20;seed++){
  const s=board('dp3-55','dp3-18','player',seed);s.sides.player.active.damage=50;
  hit(s);const roll=s.log.find(e=>e.reason==='Healing Milk');assert.ok(roll);if(roll.heads>0){seen++;choice(s,arr=>arr.find(x=>x.choiceTarget==='active'));assert.equal(s.sides.player.active.damage,50-Math.min(50,roll.heads*30));}
 }assert.ok(seen>=4);
});

test('Miltank Healing Milk does not open an unresolvable choice when nobody is damaged',()=>{
 for(let seed=1;seed<12;seed++){
  const s=board('dp3-55','dp3-18','player',seed);
  hit(s);
  assert.notEqual(s.phase,'effectChoice','a fully healthy board must not open a healing menu');
 }
});

test('Sableye Rummage reveals top five and lets player choose Trainers without taking other types',()=>{
 const s=board('dp3-63');s.sides.player.deck=[ref('dp3-127','potion'),ref('dp3-82','charm'),ref('dp3-125','rose'),ref('dp3-83','clef'),ref('dp3-84','cors'),ref('dp3-85','sixth')];
 hit(s);assert.equal(s.phase,'effectChoice');choice(s,arr=>arr.find(x=>x.choiceLabel?.includes('Potion')));
 choice(s,arr=>arr.find(x=>x.choiceLabel?.includes('Finish')));finish(s);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='potion'));assert.ok(!s.sides.player.hand.some(r=>r.uid==='charm'));
});

test('Corsola Rally benches up to 3 different Basic types with actual deck picks',()=>{
 const s=board('dp3-84');s.sides.player.deck=[ref('dp3-77','grass'),ref('dp3-82','fire'),ref('dp3-103','colour'),ref('dp3-99','other-colour')];hit(s);
 for(let i=0;i<3&&s.phase==='effectChoice';i++)choice(s,arr=>arr.find(x=>!x.choiceSkip));finish(s);
 assert.equal(s.sides.player.bench.length,3);
 const types=new Set(s.sides.player.bench.map(p=>data.cardById(p.cardId).subtype));assert.equal(types.size,3);
});

test('Natu Future Sight offers either player deck and can reorder all five cards',()=>{
 const s=board('dp3-96');s.sides.opponent.deck=[ref('dp3-77','one'),ref('dp3-82','two'),ref('dp3-103','three'),ref('dp3-99','four'),ref('dp3-84','five'),ref('dp3-85','six')];hit(s,'player',1);
 choice(s,arr=>arr.find(x=>x.choiceOption===1));
 choice(s,arr=>arr.find(x=>x.choiceDeckIndex===4));for(let i=0;i<4;i++)choice(s);finish(s);
 assert.ok(s.sides.opponent.hand.some(r=>r.uid==='five'),'reordered top card should be drawn as opponent turn begins');
});

test('Roseanne Research gets a physical Basic Pokémon and a Basic Energy from supply with independent choices',()=>{
 const s=board('dp3-82');s.sides.player.hand=[ref('dp3-125','rose')];s.sides.player.deck=[ref('dp3-77','bulb'),ref('dp3-122','trainer')];s.sides.player.energySupply=['Water','Fire'];
 const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp3-125');assert.ok(act);core.applyAction(s,'player',act);
 choice(s,arr=>arr.find(a=>a.choiceLabel?.includes('Bulbasaur')));
 choice(s,arr=>arr.find(a=>a.choiceLabel?.includes('Water')));finish(s);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='bulb'));assert.ok(s.sides.player.hand.some(r=>data.cardById(r.cardId)?.basicEnergy&&data.cardById(r.cardId)?.subtype==='Water'));
 assert.deepEqual(s.sides.player.energySupply,['Fire']);
});

test('Flygon Irritating Buzz only counters non-Fighting Active between turns, and Sand Sonic requires from-hand Fighting this turn',()=>{
 const s=board('dp3-5','dp3-17');
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 assert.equal(s.sides.opponent.active.damage,10);
 const f=board('dp3-5','dp3-48');core.applyAction(f,'player',core.legalActions(f,'player').find(x=>x.type==='endTurn'));
 assert.equal(f.sides.opponent.active.damage,0,'Fighting targets must not receive the counter');
 const x=board('dp3-5','dp3-18');x.sides.player.active.lastHandEnergyType='Fighting';x.sides.player.active.lastHandEnergyAttachedTurn=x.turnNumber;hit(x);assert.equal(x.sides.opponent.active.damage,70);
 const y=board('dp3-5','dp3-18');y.sides.player.active.lastHandEnergyType='Fighting';y.sides.player.active.lastHandEnergyAttachedTurn=y.turnNumber-1;hit(y);assert.equal(y.sides.opponent.active.damage,50);
});

test('Ludicolo Rain Dish heals between turns and Nature Power respects actual Stadium owner',()=>{
 const s=board('dp3-13','dp3-18');s.sides.player.active.damage=30;
 core.applyAction(s,'player',core.legalActions(s,'player').find(x=>x.type==='endTurn'));
 assert.equal(s.sides.player.active.damage,20);
 const mine=board('dp3-13','dp3-3');mine.stadium=ref('dp2-117','stad');mine.stadium.ownerSide='player';hit(mine);assert.equal(mine.sides.opponent.active.damage,120);
 const theirs=board('dp3-13','dp3-3');theirs.stadium=ref('dp2-117','stad');theirs.stadium.ownerSide='opponent';hit(theirs);assert.equal(theirs.sides.opponent.active.damage,100);assert.ok(theirs.sides.opponent.active.conditions.confusion);
});

test('Magmortar Flame Body heals only Fire Energy attached from hand, and Fireball Bazooka chooses two separate Benched targets',()=>{
 const s=board('dp3-31','dp3-3');s.sides.player.active.damage=50;
 s.sides.player.hand=[ref('neo1-107','fire-hand')];
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='neo1-107');assert.ok(action,'physical Fire Energy attachment should be available');core.applyAction(s,'player',action);
 assert.equal(s.sides.player.active.damage,30);
 const p=board('dp3-31','dp3-3');p.sides.player.active.energy={Fire:3};hit(p);assert.equal(p.sides.opponent.active.damage,60);
 const x=board('dp3-31','dp3-3');const a=slot('dp3-17','bench-a'),b=slot('dp3-82','bench-b');a.benchSlot=0;b.benchSlot=1;x.sides.opponent.bench=[a,b];
 hit(x,'player',1);assert.equal(x.phase,'effectChoice');choice(x,arr=>arr.find(y=>y.choiceBenchIndex===0));choice(x,arr=>arr.find(y=>y.choiceBenchIndex===1));
 assert.equal(a.damage,20);assert.equal(b.damage,20);assert.equal(x.sides.opponent.active.damage,40);
});

test('Sharpedo Rough Skin retaliates on real attack damage and Strike Wound ignores matchups',()=>{
 const s=board('dp3-82','dp3-37');hit(s);assert.equal(s.sides.player.active.damage,20,'reactive damage should land on attacker');
 const ko=board('dp3-82','dp3-37');ko.sides.opponent.active.damage=70;hit(ko);assert.equal(ko.sides.player.active.damage,20,'reactive damage must still land on attacker when Sharpedo is knocked out');
 const x=board('dp3-37','dp3-18');x.sides.opponent.active.damage=20;hit(x);assert.equal(x.sides.opponent.active.damage,100);
 const y=board('dp3-37','dp3-18');hit(y);assert.equal(y.sides.opponent.active.damage,60);
});
