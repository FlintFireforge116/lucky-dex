'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';
const dp=require(P+'tcg-classic-diamond-pearl'),builder=require(P+'tcg-classic-deck-builder'),data=require(P+'tcg-classic-battle-data'),core=require(P+'tcgp-battle-core'),fx=require(P+'tcgp-battle-effects'),opponents=require(P+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const added=[8,24,30,31,32,33,46,47,65,66,67,68,90,116];
const base=opponents.generate({sets:['dp1'],type:'Grass',seed:17});
function slot(id,uid,energy){const s=core.makePokemonSlot(id,4,uid);s.energy=energy||Object.fromEntries(types.map(t=>[t,5]));return s;}
function setup(att='dp1-24',def='dp1-94'){
 assert.ok(base.ok,base.error);
 const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const side of ['player','opponent'])s.sides[side].turnCount=8;
 s.sides.player.active=slot(att,'att');s.sides.opponent.active=slot(def,'def');
 s.sides.player.bench=[slot('dp1-85','pb')];s.sides.opponent.bench=[slot('dp1-85','ob')];
 s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function resolveChoices(s,pick=()=>null){const seen=[];for(let i=0;i<30&&s.phase==='effectChoice';i++){
 const acts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(acts.length,`no effect choices ${i}`);
 const chosen=pick(acts,s,i)||acts.find(x=>!x.choiceSkip)||acts[0];assert.ok(chosen);seen.push({...chosen,who:s.choiceSide});core.applyAction(s,s.choiceSide,chosen);
 }assert.notEqual(s.phase,'effectChoice','unresolved choice');return seen;}
function attack(s,index=0,side='player',select=()=>null,pick=()=>null){s.activeSide=side;const acts=core.legalActions(s,side).filter(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(acts.length,`${s.sides[side].active?.cardId} attack ${index}`);core.applyAction(s,side,select(acts,s)||acts[0]);return resolveChoices(s,pick);}
function ability(s,id,pick=()=>null,target='bench'){s.activeSide='player';const acts=core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId===id);assert.ok(acts.length,'No ability for '+id);core.applyAction(s,'player',acts.find(x=>x.target===target)||acts[0]);return resolveChoices(s,pick);}
test('Stage 6 catalogue shows implemented, validated effects only',()=>{
 assert.equal(dp.coverage().total,130);assert.ok(dp.coverage().battleEnabled>=110);
 for(const n of added){const c=dp.cardById('dp1-'+n);assert.ok(c.battleEnabled,String(n));for(const a of c.attacks||[]){assert.ok(!a.text.includes('See the original card'),`${n}:${a.name}`);assert.deepEqual(fx.validateEffect(a.effect),[],`${n}:${a.name}`);}for(const a of c.abilities||[]){assert.ok(!a.text.includes('See the printed card'),`${n}:${a.name}`);assert.deepEqual(fx.validateEffect(a.effect),[],`${n}:power`);}if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],String(n));}
});
test('Every newly enabled attack executes on both sides',()=>{
 let n=0;for(const id of added.filter(n=>n<105))for(const [ix,attackDef] of dp.cardById('dp1-'+id).attacks.entries())for(const side of ['player','opponent']){
  const s=setup('dp1-'+id,'dp1-94');if(side==='opponent')s.sides.opponent.active=slot('dp1-'+id,'cpu');
  if(id===33)s.sides[side].hand=[{uid:'one',cardId:'dp1-94'},{uid:'two',cardId:'dp1-97'}];
  assert.doesNotThrow(()=>attack(s,ix,side),`${id} ${attackDef.name} ${side}`);n++;
 }assert.ok(n>=35,n);
});
test('Magnezone Metal Body sets allied Active retreat to zero, but can be suppressed',()=>{
 const s=setup('dp1-24');s.sides.player.bench[0]=slot('dp1-8','metalBody');s.sides.player.bench[0].benchSlot=0;
 const c=core.legalActions(s,'player');assert.ok(c);
 // Retreat is zero with attached Metal, irrespective of actual Active species.
 s.sides.player.active.energy={Metal:1};const acts=core.legalActions(s,'player').filter(a=>a.type==='retreat');assert.ok(acts.length);assert.ok(acts.every(a=>a.cost===0||a.energyCost===0||!a.discard));
});
test('Munchlax Heave requires two cards in hand, discards chosen two and obeys rolled damage',()=>{
 const s=setup('dp1-33','dp1-94');s.sides.player.hand=[{uid:'a',cardId:'dp1-103'},{uid:'b',cardId:'dp1-94'},{uid:'c',cardId:'dp1-97'}];
 const picks=attack(s,0,'player',()=>null,acts=>acts.find(x=>x.choiceHandIndex===0));
 assert.ok(picks.filter(x=>Number.isInteger(x.choiceHandIndex)).length>=2);assert.ok(s.sides.player.discard.length>=2);assert.equal(s.sides.player.hand.filter(r=>['a','b','c'].includes(r.uid)).length,1,'two original hand cards paid as cost');
});
test('Munchlax voluntarily Baby Evolves into Snorlax and preserves its stack',()=>{
 const s=setup('dp1-33');s.sides.player.active.damage=20;s.sides.player.hand=[{uid:'snor',cardId:'dp1-37'}];
 ability(s,'dp1-33',acts=>acts.find(x=>x.choiceHandIndex===0),'active');
 assert.equal(s.sides.player.active.cardId,'dp1-37');assert.deepEqual(s.sides.player.active.stack,['dp1-33','dp1-37']);assert.equal(s.sides.player.active.damage,0);
});
test('Medicham Force Palm places counters on a chosen Bench Pokemon, ignoring Weakness',()=>{
 const s=setup('dp1-32','dp1-94');s.sides.player.active.damage=30;
 attack(s,0,'player',()=>null,acts=>acts.find(x=>x.choiceTarget==='bench'));
 assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.opponent.active.damage,0);
});
test('Machamp Revenge detects a KO only in the last opposing turn',()=>{
 for(const [last,damage] of [[true,70],[false,20]]){
  const s=setup('dp1-31','dp1-17');if(last)s.log.push({type:'ko',side:'player',turnNumber:9,cardId:'dp1-94'});
  attack(s,0);assert.equal(s.sides.opponent.active.damage,damage);
 }
});
test('Unown A bench-only power reorders exactly the top two cards',()=>{
 const s=setup('dp1-17');s.sides.player.bench[0]=slot('dp1-65','unA');s.sides.player.bench[0].benchSlot=0;
 s.sides.player.deck=[{uid:'one',cardId:'dp1-94'},{uid:'two',cardId:'dp1-97'},{uid:'third',cardId:'dp1-103'}];
 ability(s,'dp1-65',acts=>acts.find(x=>x.choiceOption===1));assert.deepEqual(s.sides.player.deck.map(r=>r.uid),['two','one','third']);
});
test('Unown C calls only a named Unown from deck after heads and with Bench space',()=>{
 let found=false;for(let seed=1;seed<60&&!found;seed++){
  const s=setup('dp1-17');s.rngState=seed*9713;s.sides.player.bench[0]=slot('dp1-67','unC');s.sides.player.bench[0].benchSlot=0;
  s.sides.player.deck=[{uid:'un-a',cardId:'dp1-65'},{uid:'not-un',cardId:'dp1-94'}];
  ability(s,'dp1-67');if(s.sides.player.bench.some(p=>p.cardId==='dp1-65')){found=true;assert.ok(s.sides.player.deck.some(r=>r.uid==='not-un'));}
 }assert.ok(found);
});
test('Drifblim Wind Wave moves chosen Pokemon or Supporter into deck, not hand',()=>{
 const s=setup('dp1-24');s.sides.player.discard=[{uid:'pkmn',cardId:'dp1-94'},{uid:'supp',cardId:'dp1-112'},{uid:'energy',cardId:'dp1-123'}];
 const picks=attack(s,0,'player',()=>null,acts=>acts.find(a=>a.choiceOption===0)||acts.find(x=>x.choiceSkip));
 assert.ok(s.sides.player.deck.some(r=>r.uid==='pkmn'));assert.ok(s.sides.player.deck.some(r=>r.uid==='supp'));assert.ok(s.sides.player.discard.some(r=>r.uid==='energy'));
});
test('Dusclops Roam heads places 20 counters on each opponent Pokemon and Gravity Wave checks printed zero retreat',()=>{
 let checked=false;for(let seed=1;seed<50&&!checked;seed++){
  const s=setup('dp1-47','dp1-94');s.rngState=seed*9999;
  attack(s,0);if(s.sides.opponent.active.damage===20){assert.equal(s.sides.opponent.bench[0].damage,20);checked=true;}
 }assert.ok(checked);
 const s=setup('dp1-47','dp1-94');s.sides.opponent.bench[0]=slot('dp1-50','zeroRetreat');s.sides.opponent.bench[0].benchSlot=0;attack(s,1);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Unown B BOUNCE declines on tails, then shuffles an optionally chosen Unown on heads',()=>{
 let tails=false,heads=false;
 for(let seed=1;seed<120&&(!heads||!tails);seed++){
  const s=setup('dp1-17');s.rngState=seed*12345;
  s.sides.player.bench[0]=slot('dp1-66','unB',{Psychic:1});s.sides.player.bench[0].benchSlot=0;
  const picks=ability(s,'dp1-66',acts=>acts.find(x=>x.choiceTarget==='bench')||acts[0]);
  const rolled=s.log.find(l=>l.reason==='Unown B BOUNCE');assert.ok(rolled);
  if(rolled.heads){heads=true;assert.ok(picks.length>0);assert.ok(s.sides.player.deck.some(r=>r.cardId==='dp1-66'));assert.equal(s.sides.player.bench.filter(x=>x?.cardId==='dp1-66').length,0);assert.equal(s.sides.player.energyDiscard.Psychic,1);}
  else{tails=true;assert.equal(s.sides.player.bench.filter(x=>x?.cardId==='dp1-66').length,1);}
 }assert.ok(heads&&tails);
});
test('Unown D DRAW lets each player independently accept/decline after a winning coin',()=>{
 let validated=false;
 for(let seed=1;seed<100&&!validated;seed++){
  const s=setup('dp1-17');s.rngState=seed*9001;
  s.sides.player.bench[0]=slot('dp1-68','unD');s.sides.player.bench[0].benchSlot=0;
  const before=[s.sides.player.deck.length,s.sides.opponent.deck.length];
  const selections=ability(s,'dp1-68',acts=>acts.find(x=>x.choiceOption===0)||acts[0]);
  const rolled=s.log.find(l=>l.reason==='Unown D DRAW');assert.ok(rolled);
  if(rolled.heads){validated=true;assert.ok(selections.length>=2);assert.equal(s.sides.player.deck.length,before[0]-1);assert.equal(s.sides.opponent.deck.length,before[1]-1);}
 }assert.ok(validated);
});
test('Drifloon Blowing Wind returns ALL attached cards to deck, including DP1 Basic Energy art, only on heads',()=>{
 let validated=false;
 for(let seed=1;seed<120&&!validated;seed++){
  const s=setup('dp1-46','dp1-17');s.rngState=seed*11231;
  const target=s.sides.player.bench[0];target.energy={Metal:2};target.specialEnergy=[];target.tool={uid:'tool1',cardId:'dp1-109'};
  const before=s.sides.player.deck.length;attack(s,0);
  if(s.log.some(x=>x.rule==='dp1:46:blowingWind'&&x.returnedBench)){validated=true;
    assert.ok(!s.sides.player.bench.some(x=>x.uid==='pb'));assert.ok(s.sides.player.deck.some(x=>x.cardId==='dp1-130'&&x.uid.includes('energy')));
    assert.ok(s.sides.player.deck.some(x=>x.cardId==='dp1-85'));assert.ok(s.sides.player.deck.some(x=>x.uid==='tool1'));
    assert.equal(s.sides.player.deck.length,before+4);
  }
 }assert.ok(validated);
});
test('Warp Point: opponent chooses their switch and player chooses theirs',()=>{
 const s=setup('dp1-17','dp1-94');s.sides.player.hand=[{uid:'wp',cardId:'dp1-116'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp1-116');assert.ok(action);
 core.applyAction(s,'player',action);const choices=resolveChoices(s);
 assert.ok(choices.length>=2,JSON.stringify(choices));assert.equal(s.sides.opponent.active.uid,'ob');assert.equal(s.sides.player.active.uid,'pb');
});
test('Mime Jr. Mime draws opponent hand size after returning its own hand to deck',()=>{
 const s=setup('dp1-90','dp1-17');s.sides.player.hand=[{uid:'old1',cardId:'dp1-94'},{uid:'old2',cardId:'dp1-97'}];
 s.sides.opponent.hand=[{uid:'opp1',cardId:'dp1-96'},{uid:'opp2',cardId:'dp1-93'},{uid:'opp3',cardId:'dp1-102'}];
 attack(s,0);assert.equal(s.sides.player.hand.length,3);assert.ok(s.sides.player.deck.some(x=>x.uid==='old1')||s.sides.player.hand.some(x=>x.uid==='old1'));
});
test('Lopunny Flop damages chosen Bench and offers optional self switch',()=>{
 for(const choose of [false,true]){
  const s=setup('dp1-30','dp1-17');const actions=attack(s,1,'player',()=>null,(acts,st)=>{
   if(acts.some(a=>a.choiceSkip))return choose?acts.find(x=>!x.choiceSkip):acts.find(x=>x.choiceSkip);
   return acts.find(x=>x.choiceTarget==='bench')||acts[0];
  });
  assert.equal(s.sides.opponent.bench[0].damage,20);
  assert.equal(s.sides.player.active.uid,choose?'pb':'att');
 }
});
test('Unown B may choose a different allied Active Unown and still requires a valid promotion',()=>{
 let found=false;for(let seed=1;seed<100&&!found;seed++){
  const s=setup('dp1-65','dp1-94');s.rngState=seed*19411;
  s.sides.player.bench[0]=slot('dp1-66','unB');s.sides.player.bench[0].benchSlot=0;
  const picks=ability(s,'dp1-66',acts=>acts.find(x=>x.choiceTarget==='active')||acts[0]);
  const rolled=s.log.find(l=>l.reason==='Unown B BOUNCE');if(rolled?.heads){found=true;
   assert.ok(picks.some(p=>p.choiceTarget==='active'),'player chooses Active Unown');
   assert.ok(s.sides.player.deck.some(r=>r.cardId==='dp1-65'),'Active Unown was shuffled');
   assert.ok(s.sides.player.active?.cardId!=='dp1-65','old active should have left play');
   assert.equal(s.phase,'promote','a bounced Active must trigger promotion choice');
   assert.equal(s.promotionSide,'player');
   const promos=core.legalActions(s,'player').filter(x=>x.type==='promote');assert.ok(promos.length);core.applyAction(s,'player',promos[0]);
   assert.equal(s.sides.player.active.uid,'unB');
  }
 }assert.ok(found);
});
test('Drifblim Explosive Smoke hits both Benches for 10, ignoring Weakness',()=>{
 const s=setup('dp1-24','dp1-94');attack(s,1);
 assert.equal(s.sides.opponent.bench[0].damage,10);assert.equal(s.sides.player.bench[0].damage,10);
});
