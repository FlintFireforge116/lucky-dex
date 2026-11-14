'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-great-encounters');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const auditor=require('../scripts/audit-classic-set.cjs');
const loan=opp.generate({sets:['dp2'],type:'Grass',seed:17});assert.ok(loan.ok);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
function slot(id,uid,energy={}){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy=energy;return s;}
function board(card='dp4-3',opponent='dp4-61',side='player',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:side,playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}
 const foe=side==='player'?'opponent':'player';s.sides[side].active=slot(card,side+'-a',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4});s.sides[foe].active=slot(opponent,foe+'-a');return s;
}
function hit(s,side='player',i=0){const a=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,'attack '+i+' not available');core.applyAction(s,side,a);return a;}
function power(s,side='player'){const a=core.legalActions(s,side).find(x=>x.type==='ability'&&x.cardId===s.sides[side].active.cardId);assert.ok(a,'ability unavailable: '+s.sides[side].active.cardId);core.applyAction(s,side,a);return a;}
function choose(s,pred){assert.equal(s.phase,'effectChoice','expected choice');const a=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(a.length,'no legal effect choices');const pick=pred?a.find(pred):a.find(x=>!x.choiceSkip)||a[0];assert.ok(pick,'missing desired choice '+JSON.stringify(a));core.applyAction(s,s.choiceSide,pick);return pick;}
function finish(s){for(let i=0;i<25&&s.phase==='effectChoice';i++)choose(s);assert.notEqual(s.phase,'effectChoice','choice stalled');}
test('Great Encounters has 106 distinct canonical art prints; all six remaining cards enabled',()=>{
 assert.equal(set.CARDS.length,106);assert.equal(new Set(set.CARDS.map(x=>x.id)).size,106);
 assert.equal(set.coverage().battleEnabled,106);assert.equal(set.coverage().gated.length,0);
 for(const c of set.CARDS){assert.equal(c.image,`https://images.pokemontcg.io/dp4/${c.number}.png`);assert.equal(data.cardById(c.id).name,c.name);
  if(c.battleEnabled)for(const part of [...(c.attacks||[]),...(c.abilities||[]),c])if(part.effect)assert.deepEqual(fx.validateEffect(part.effect),[],c.id+' '+(part.name||''));
 }
 const report=auditor.auditSet('dp4',{data,fx,core,opponents:opp,smoke:true,cpu:false,engineText:''});
 assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0);
 assert.equal(report.smoke.executed+report.smoke.skipped,report.smoke.attempted);
});
test('Darkrai Darkness Pursuit recognises Cresselia and Sleep Hole uses sleeping target state',()=>{
 let s=board('dp4-3','dp4-2');hit(s,'player',1);assert.equal(s.sides.opponent.active,null,'100 damage should Knock Out 80-HP Cresselia');
 s=board('dp4-4','dp4-61');hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,40);
 s=board('dp4-4','dp4-9');s.sides.opponent.active.conditions={sleep:true};hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,80);
});
test('Darkrai Darkness Roar gives attacker optional choice then lets defender owner switch',()=>{
 const s=board('dp4-4','dp4-61');const b=slot('dp4-62','foe-b');b.benchSlot=0;s.sides.opponent.bench=[b];hit(s);assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceOption===1);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');choose(s);assert.equal(s.sides.opponent.active.uid,'foe-b');
});
test('Butterfree Parallel Drain heals a chosen friendly Pokemon for actual damage',()=>{
 const s=board('dp4-14','dp4-61');const b=slot('dp4-62','heal-b');b.benchSlot=0;b.damage=50;s.sides.player.bench=[b];hit(s,'player',0);
 assert.equal(s.sides.opponent.active.damage,30);choose(s,x=>x.choiceTarget==='bench');assert.equal(b.damage,20);
});
test('Lapras Carry In searches actual Tool, Supporter and Basic Energy cards without inventing stock',()=>{
 const s=board('dp4-21','dp4-61');s.sides.player.deck=[ref('neo1-86','tool'),ref('dp3-125','supporter'),ref('neo1-111','energy'),ref('dp4-93','weedle')];
 hit(s);const taken=[];for(let i=0;i<3&&s.phase==='effectChoice';i++){const ch=choose(s);taken.push(ch.choiceCardId);}
 finish(s);assert.equal(s.sides.player.hand.length,3);assert.ok(s.sides.player.hand.some(x=>x.uid==='tool'));assert.ok(s.sides.player.hand.some(x=>x.uid==='supporter'));assert.ok(s.sides.player.hand.some(x=>x.uid==='energy'));assert.ok(s.sides.player.deck.some(x=>x.uid==='weedle'));
});
test('Wigglytuff Balloon Attack requires Igglybuff under it, and Good Night Melody sleeps both actives',()=>{
 let s=board('dp4-32','dp4-61');hit(s);assert.equal(s.sides.opponent.active.damage,40);
 s=board('dp4-32','dp4-30');s.sides.player.active.stack=['dp4-70','dp4-72','dp4-32'];hit(s);assert.equal(s.sides.opponent.active.damage,60);
 s=board('dp4-32','dp4-61');power(s);assert.ok(s.sides.player.active.conditions.sleep);assert.ok(s.sides.opponent.active.conditions.sleep);
});
test('Togetic Sweet Kiss lets the opponent decide whether to draw',()=>{
 const s=board('dp4-55','dp4-61');s.sides.opponent.deck=[ref('dp4-62','draw'),ref('dp4-64','other')];hit(s,'player',1);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');choose(s,x=>x.choiceOption===1);
 assert.ok(s.sides.opponent.hand.some(x=>x.uid==='draw'));
});
test('Feebas searches a real Evolution card but not a Basic Pokemon',()=>{
 const s=board('dp4-67');s.sides.player.deck=[ref('dp4-93','weedle'),ref('dp4-25','milotic'),ref('dp4-103','lvx')];hit(s,'player',1);
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceCardId==='dp4-25');finish(s);
 assert.ok(s.sides.player.hand.some(x=>x.uid==='milotic'));assert.ok(s.sides.player.deck.some(x=>x.uid==='weedle'));
});
test('Igglybuff Baby Evolution consumes Jigglypuff from hand and heals all damage',()=>{
 const s=board('dp4-70');s.sides.player.active.damage=40;s.sides.player.hand=[ref('dp4-72','jigg')];
 power(s);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceCardId==='dp4-72');finish(s);
 assert.equal(s.sides.player.active.cardId,'dp4-72');assert.equal(s.sides.player.active.damage,0);assert.ok(!s.sides.player.hand.some(x=>x.uid==='jigg'));
});
test('Igglybuff Inquire and Luvdisc Rendezvous draw physical cards, preserving top-deck order',()=>{
 let s=board('dp4-70');s.sides.player.deck=[ref('dp4-93','w1'),ref('dp4-91','w2'),ref('dp4-96','w3'),ref('dp4-61','w4')];hit(s);assert.equal(s.sides.player.hand.length,3);
 s=board('dp4-70');s.sides.player.supporterUsed=true;s.sides.player.deck=[ref('dp4-93','w1'),ref('dp4-91','w2')];hit(s);assert.equal(s.sides.player.hand.length,1);
 s=board('dp4-77');s.sides.player.deck=[ref('dp4-93','w1'),ref('dp4-91','w2'),ref('dp4-96','w3')];hit(s);assert.equal(s.sides.player.hand.length,3);assert.ok(s.log.some(l=>l.type==='revealTop'&&l.cardId==='dp4-93'));
 s=board('dp4-77');s.sides.player.deck=[ref('dp3-127','potion'),ref('dp4-91','w2'),ref('dp4-96','w3')];hit(s);assert.equal(s.sides.player.hand.length,1);
});
test('Zigzagoon Pull Out returns the chosen physical discard card to top of deck',()=>{
 const s=board('dp4-96');s.sides.player.discard=[ref('dp4-93','weed'),ref('dp3-127','potion')];hit(s);
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceCardId==='dp3-127');finish(s);
 assert.equal(s.sides.player.deck[0].uid,'potion');assert.equal(s.sides.player.discard.length,1);
});
test('Treecko Energy Ball and Primeape Spirited Throw calculate before Weakness and Resistance',()=>{
 for(const [extra,expected] of [[0,10],[1,20],[3,30]]){const s=board('dp4-90','dp4-61');s.sides.player.active.energy={Grass:extra+1};hit(s);assert.equal(s.sides.opponent.active.damage,expected);}
 let s=board('dp4-41','dp4-30');s.sides.player.active.damage=50;hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,80);
 s=board('dp4-41','dp4-42');hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,50);
});
test('Claydol Cosmic Power puts selected physical cards on bottom then draws until six',()=>{
 const s=board('dp4-15');s.sides.player.hand=[ref('dp4-93','weed'),ref('dp4-61','buiz'),ref('dp4-70','igg')];s.sides.player.deck=Array.from({length:9},(_,i)=>ref('dp4-65','card'+i));
 power(s);choose(s,x=>x.choiceOption===2);choose(s,x=>x.choiceCardId==='dp4-93');choose(s,x=>x.choiceCardId==='dp4-61');finish(s);
 assert.equal(s.sides.player.hand.length,6);assert.ok(s.sides.player.deck.some(x=>x.uid==='weed'));assert.ok(s.sides.player.deck.some(x=>x.uid==='buiz'));
});
test('Hypno Dream Catcher transfers damage counters only if target is sleeping',()=>{
 const s=board('dp4-19','dp4-9');s.sides.player.active.damage=30;s.sides.opponent.active.conditions={sleep:true};hit(s);
 assert.equal(s.sides.player.active.damage,0);assert.equal(s.sides.opponent.active.damage,30);
 const x=board('dp4-19','dp4-9');x.sides.player.active.damage=30;hit(x);assert.equal(x.sides.player.active.damage,30);assert.equal(x.sides.opponent.active.damage,0);
});
test('Latias Miraculous Light heals and clears Special Conditions',()=>{
 const s=board('dp4-22','dp4-30');s.sides.player.active.damage=30;s.sides.player.active.conditions={poison:{amount:10}};hit(s);
 assert.equal(s.sides.player.active.damage,10);assert.ok(!s.sides.player.active.conditions.poison);
});
test('Gorebyss Sweet Temptation switches opponent target then hits new Active; Psychic Snap checks Energy',()=>{
 const s=board('dp4-38','dp4-30');const b=slot('dp4-61','foe-b');b.benchSlot=0;s.sides.opponent.bench=[b];hit(s);
 choose(s,x=>x.choiceTarget==='bench');finish(s);
 assert.equal(s.sides.opponent.active.uid,'foe-b');assert.equal(s.sides.opponent.active.damage,10);
 const x=board('dp4-38','dp4-30');x.sides.player.active.energy={Water:1,Psychic:1};hit(x,'player',1);
 assert.equal(x.sides.opponent.active.damage,50);assert.ok(x.sides.opponent.active.conditions.confusion);
});
test('Illumise Firefly Scent distinguishes Poké-Body from Poké-Power; Scent Conduct benches a real Grass Basic',()=>{
 let s=board('dp4-71','dp4-12');hit(s);assert.equal(s.sides.opponent.active.damage,30);assert.ok(!s.sides.opponent.active.conditions.sleep);
 s=board('dp4-71','dp4-27');hit(s);assert.ok(s.sides.opponent.active.conditions.sleep);
 let heads=0;for(let seed=1;seed<20;seed++){s=board('dp4-71','dp4-30','player',seed);s.sides.player.deck=[ref('dp4-93','weed')];power(s);
  const roll=s.log.find(x=>x.type==='coin');if(!roll?.heads)continue;heads++;
  if(s.phase==='effectChoice'){choose(s,x=>x.choiceCardId==='dp4-93');finish(s);}
  assert.ok(s.sides.player.bench.some(x=>x.cardId==='dp4-93'));
 }assert.ok(heads>3);
});
test('Lunatone Gravity Change discards real hand card and draws only with Solrock present',()=>{
 let s=board('dp4-76');s.sides.player.hand=[ref('dp4-93','weed')];s.sides.player.deck=[ref('dp4-61','buiz')];
 power(s);choose(s,x=>x.choiceCardId==='dp4-93');assert.equal(s.sides.player.hand.length,0);
 s=board('dp4-76');s.sides.player.hand=[ref('dp4-93','weed')];s.sides.player.deck=[ref('dp4-61','buiz')];const b=slot('dp4-85','sol');b.benchSlot=0;s.sides.player.bench=[b];
 power(s);choose(s,x=>x.choiceCardId==='dp4-93');assert.equal(s.sides.player.hand[0].uid,'buiz');assert.ok(s.sides.player.discard.some(x=>x.uid==='weed'));
});
test('Volbeat Light Conduct returns a selected Supporter from discard to top with Illumise synergy',()=>{
 const s=board('dp4-92');s.sides.player.discard=[ref('dp3-125','rose'),ref('dp4-93','weed')];const b=slot('dp4-71','illum');b.benchSlot=0;s.sides.player.bench=[b];power(s);
 choose(s,x=>x.choiceCardId==='dp3-125');assert.equal(s.sides.player.deck[0].uid,'rose');assert.equal(s.sides.player.discard.length,1);
});
test('Felicity Drawing discards exactly chosen hand cards and draws 3 or 4 physical cards',()=>{
 for(const number of [1,2]){const s=board('dp4-3');s.sides.player.hand=[ref('dp4-93','weed'),ref('dp4-61','buiz')];s.sides.player.deck=Array.from({length:10},(_,i)=>ref('dp4-65','d'+i));
  const e=set.cardById('dp4-98').effect;const context={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,
   random:fx.random,requestChoice:(args)=>{throw new Error('do not call free-floating test context') }};
  // Play from the normal Trainer action, which manages supporter locking.
  s.sides.player.hand.push(ref('dp4-98','felicity'));const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp4-98');assert.ok(act,'Felicity unavailable');core.applyAction(s,'player',act);
  choose(s,a=>a.choiceOption===number);for(let j=0;j<number;j++)choose(s);
  assert.equal(s.sides.player.hand.length,2-number+number+2);assert.equal(s.sides.player.discard.filter(x=>['weed','buiz'].includes(x.uid)).length,number);
 }
});
test('Premier Ball searches both deck and discard for the real LV.X print with card artwork IDs',()=>{
 const s=board('dp4-3');s.sides.player.hand=[ref('dp4-101','ball')];s.sides.player.deck=[ref('dp4-103','moon')];s.sides.player.discard=[ref('dp4-106','palkia')];
 const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp4-101');assert.ok(act,'Premier Ball unavailable');core.applyAction(s,'player',act);
 const ch=choose(s,a=>a.choiceCardId==='dp4-106');finish(s);assert.ok(s.sides.player.hand.some(x=>x.uid==='palkia'));
 assert.ok(s.sides.player.deck.some(x=>x.uid==='moon'));
});
test('Magcargo Lava Plume is optional and the Body prevents Sleep and Paralysis',()=>{
 const s=board('dp4-45','dp4-30');s.sides.player.deck=[ref('dp4-93','weed')];hit(s);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===1);assert.ok(s.sides.opponent.active.conditions.burn);assert.ok(s.sides.player.discard.some(x=>x.uid==='weed'));
 const x=board('dp4-71','dp4-45');hit(x);
 assert.ok(!x.sides.opponent.active.conditions?.sleep,'Magma Armor prevents Sleep');
});
test('New expansion print ownership maps Great Encounters by name, number and set ID, never to Secret Wonders',()=>{
 const found=data.projectOwnedCards([{source:'tcg',setName:'Great Encounters',localId:'70',count:2}]);
 assert.ok(found.some(row=>row.gameplayId==='dp4-70'&&row.quantity===2));
 assert.ok(data.SETS.some(row=>row.id==='dp4'));
 const byId=data.cardById('dp4-70');assert.equal(byId.name,'Igglybuff');
});
test('Great Encounters-only CPU builds are legal in all eight types on two seeds',()=>{
 const r=auditor.auditSet('dp4',{data,fx,core,opponents:opp,smoke:false,cpu:true,engineText:''});
 assert.equal(r.cpu.valid,16,JSON.stringify(r.cpu.failures));
});
test('Pachirisu Smash Short discards the attached Tool and each matching opponent hand Tool',()=>{
 const s=board('dp4-5','dp4-30');s.sides.opponent.active.tool=ref('neo1-86','tool1');s.sides.opponent.hand=[ref('neo1-86','tool2'),ref('dp4-93','weed')];hit(s,'player',1);finish(s);
 assert.equal(s.sides.opponent.active.damage,80);assert.ok(!s.sides.opponent.active.tool);
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='tool1'));assert.ok(s.sides.opponent.discard.some(r=>r.uid==='tool2'));
 assert.ok(s.log.some(x=>x.type==='revealHand'&&x.reason==='Smash Short'));
});
test('Tangrowth Power Whip targets real opponent cards and counts Basic Energy, not Special Energy',()=>{
 const s=board('dp4-10','dp4-30');s.sides.player.active.energy={Grass:2,Fire:1};s.sides.player.active.specialEnergy=[ref('dp3-129','special')];
 const b=slot('dp4-93','bench');b.benchSlot=0;s.sides.opponent.bench=[b];hit(s,'player',0);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceTarget==='bench');finish(s);
 assert.equal(b.damage,30);assert.equal(s.sides.opponent.active.damage,0);
});
test('Exploud Ambient Noise resolves two distinct flips, and one branch locks Trainer card families',()=>{
 for(let seed=1;seed<15;seed++){
  const s=board('dp4-17','dp4-30','player',seed);const b=slot('dp4-93','bench');b.benchSlot=0;s.sides.opponent.bench=[b];hit(s);
  const roll=s.log.find(x=>x.reason==='Ambient Noise');assert.ok(roll);assert.equal(roll.results.length,2);
  assert.equal(s.sides.opponent.active.damage,roll.results[0]?50:0);
  assert.equal(b.damage,roll.results[0]?0:20);
  if(!roll.results[1])assert.ok(s.sides.opponent.actionLocks?.some(l=>l.cardType==='Supporter'));
 }
});
test('Huntail Threaten and Drop boosts with Darkness Energy and discards a selected Special Energy',()=>{
 const s=board('dp4-42','dp4-30');s.sides.player.active.energy={Water:1,Darkness:1};s.sides.opponent.active.specialEnergy=[ref('dp3-129','dark')];hit(s,'player',1);
 assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceCardId==='dp3-129');finish(s);
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='dark'));
});
test('Linoone Switcheroo transfers the actual Tool only between opponent Pokemon',()=>{
 const s=board('dp4-43','dp4-30'),b=slot('dp4-93','bench');b.benchSlot=0;s.sides.opponent.bench=[b];s.sides.opponent.active.tool=ref('neo1-86','tool');
 hit(s,'player',0);choose(s);choose(s);finish(s);
 assert.equal(s.sides.opponent.active.tool,null);assert.equal(b.tool.uid,'tool');
});
test('Caterpie and Metapod evolution Powers require Active status; use real Evolution from deck on heads',()=>{
 for(const [num,target] of [[63,47],[47,14]]){
  let seen=0;
  for(let seed=1;seed<=25;seed++){
   const s=board('dp4-'+num,'dp4-30','player',seed);s.sides.player.deck=[ref('dp4-'+target,'evo')];
   power(s);const result=s.log.find(x=>x.type==='coin');if(!result?.heads)continue;
   if(s.phase==='effectChoice')choose(s);finish(s);seen++;
   assert.equal(s.sides.player.active.cardId,'dp4-'+target);
  }
  assert.ok(seen>=3);
 }
 const s=board('dp4-61');const b=slot('dp4-63','caterpie');b.benchSlot=0;s.sides.player.bench=[b];s.sides.player.deck=[ref('dp4-47','evo')];
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='ability'&&x.cardId==='dp4-63'),'Pupate must not appear on Bench');
});
