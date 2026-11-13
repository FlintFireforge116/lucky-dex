'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const root='../app/src/main/assets/';
const mt=require(root+'tcg-classic-mysterious-treasures'),data=require(root+'tcg-classic-battle-data');
const core=require(root+'tcgp-battle-core'),fx=require(root+'tcgp-battle-effects'),opp=require(root+'tcg-classic-opponents');
const ui=require(root+'tcgp-battle-ui');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const loaner=opp.generate({sets:['dp2'],type:'Grass',seed:17});
const ref=(id,uid)=>({uid:uid||'card-'+id,cardId:id});
function slot(id,uid,energy={}){const p=core.makePokemonSlot(id,2,uid);p.energy=energy;return p;}
function stage(id='dp2-18',foe='dp1-17'){
 const s=core.createBattle({format:'classic',playerDeck:loaner.cards,opponentDeck:loaner.cards,seed:23,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const w of ['player','opponent']){s.sides[w].turnCount=7;s.sides[w].bench=[];s.sides[w].hand=[];}
 s.sides.player.active=slot(id,'pa');s.sides.opponent.active=slot(foe,'oa');return s;
}
function use(s,side,predicate){const a=core.legalActions(s,side).find(predicate);assert.ok(a,`missing legal action ${side}`);core.applyAction(s,side,a);return a;}
function finishChoices(s,pick=acts=>acts.find(a=>!a.choiceSkip)||acts[0]){let n=0;while(s.phase==='effectChoice'&&n++<30){const acts=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(acts.length,'missing legal continuation');const a=pick(acts,s);assert.ok(a,'missing pick');core.applyAction(s,s.choiceSide,a);}assert.notEqual(s.phase,'effectChoice','stalled resolving choices');}

test('independent catalog metadata audit: all 124 ordered unique prints, types, stages, printed moves, named powers, valid effects and complete evolution chains',()=>{
 assert.equal(mt.CARDS.length,124);assert.deepEqual(mt.coverage().gated,[]);
 const names=new Set(mt.CARDS.map(x=>x.id));assert.equal(names.size,124);
 let moves=0,powers=0,trainers=0;
 for(let n=1;n<=124;n++){
   const c=data.cardById('dp2-'+n);assert.ok(c,'missing collector print '+n);assert.equal(c.setId,'dp2');assert.equal(Number(c.number),n);
   assert.equal(c.battleEnabled,true,c.id);assert.equal(c.deckEligible,true,c.id);
   assert.ok(c.image&&c.imageLarge,c.id+' art');
   if(c.kind==='pokemon'){
     assert.ok(['Basic','Stage 1','Stage 2','Level-Up'].includes(c.stage),c.id);
     assert.ok(Number(c.hp)>0&&Number(c.hp)<=300,c.id);
     for(const a of c.attacks){moves++;assert.ok(a.name&&a.cost!=null,c.id+' printed move');assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
     for(const a of c.abilities||[]){powers++;assert.ok(a.name,c.id);assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
     if(c.stage!=='Basic'&&c.evolvesFrom){
       const candidate=data.CARDS.some(p=>p.name===c.evolvesFrom);
       assert.ok(candidate||['Armor Fossil','Skull Fossil','Electivire','Lucario','Magmortar'].includes(c.evolvesFrom),c.id+' missing previous evo '+c.evolvesFrom);
     }
   }else if(c.kind==='trainer'){trainers++;assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}
 }
 assert.ok(moves>=140&&powers>=30&&trainers>=10,{moves,powers,trainers});
});

test('Altaria ex Extra Boost correctly excludes Special Energy, permits actual Basic Energy, attaches to chosen Stage 2 ex, both sides',()=>{
 for(const side of ['player','opponent']){
  const s=stage('ex15-93','dp2-19'),other=side==='player'?'opponent':'player';
  s.activeSide=side;s.sides[side].active=slot('ex15-93',side+'active');
  s.sides[other].active=slot('dp2-19',other+'active');
  const alt=slot('ex15-90',side+'alt');alt.benchSlot=0;s.sides[side].bench=[alt];
  s.sides[side].hand=[ref('dp2-118','rainbow')];
  assert.ok(!core.legalActions(s,side).some(a=>a.type==='ability'&&a.cardId==='ex15-90'),'Special Energy must not offer the ability');
  s.sides[side].hand.push(ref('dp1-125','physical-water'));
  use(s,side,a=>a.type==='ability'&&a.cardId==='ex15-90');
  assert.equal(s.phase,'effectChoice');
  finishChoices(s,(acts,st)=>acts.find(a=>a.choiceCardId==='dp1-125')||acts.find(a=>a.choiceTarget==='active')||acts.find(a=>!a.choiceSkip)||acts[0]);
  assert.equal(s.sides[side].active.energy.Water,1);assert.ok(s.sides[side].hand.some(r=>r.uid==='rainbow'));assert.ok(!s.sides[side].hand.some(r=>r.uid==='physical-water'));
  assert.ok(!core.legalActions(s,side).some(a=>a.type==='ability'&&a.cardId==='ex15-90'),'once per turn');
 }
});

test('Unown T Tell is useable while affected by Special Conditions and produces true one-shot hand reveal on heads',()=>{
 for(const status of [{},{sleep:true},{paralysis:true},{confusion:true}]){
  let gotHeads=false;
  for(let seed=1;seed<60&&!gotHeads;seed++){
   const s=stage('neo4-88','dp2-19');s.rngState=seed;s.sides.player.active.conditions=status;
   s.sides.player.hand=[ref('dp2-79','own-card')];s.sides.opponent.hand=[ref('dp2-72','opponent-a'),ref('dp2-80','opponent-b')];
   use(s,'player',a=>a.type==='ability'&&a.cardId==='neo4-88');
   const roll=s.log.filter(l=>l.type==='coin'&&l.reason.includes('Tell')).at(-1);assert.ok(roll);
   if(roll.heads){gotHeads=true;const e=s.log.find(l=>l.type==='revealHand'&&l.reason==='Unown [T] Tell');assert.ok(e);assert.deepEqual(e.cards,['dp2-72','dp2-80']);assert.deepEqual(e.sharedHand,['dp2-79']);assert.equal(e.revealedSide,'opponent');
    assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='neo4-88'));
    const reveal=ui._test.tellRevealFromLogs(s.log);assert.deepEqual(reveal.cards,['dp2-72','dp2-80']);ui._test.setCurrentBattleForTests(s);ui._test.setHandRevealForTests(reveal);ui._test.setBattleOverlayForTests('hand-reveal');
    // UI output is tested on the original log/HTML contracts, not a DOM simulation.
    assert.match(ui._test.liveHandRevealOverlayHtml?.()||'',/UNOWN \[T\]/i);
   }else assert.ok(!s.log.some(l=>l.type==='revealHand'&&l.reason==='Unown [T] Tell'));
  }
  assert.equal(gotHeads,true,'seed sweep must see at least one heads');
 }
});

test('no new set metadata-only attacks or trainers and full CPU-deck legality for each of eight Energy types',()=>{
 for(const c of mt.CARDS){for(const a of c.attacks||[])assert.notEqual(a.text?.trim(),'Special effect',c.id+' '+a.name);if(c.kind==='trainer')assert.ok(c.text?.trim(),c.id+' trainer text');}
 for(const type of types){for(const seed of [3,17,43]){const deck=opp.generate({sets:['dp2'],type,seed});assert.ok(deck.ok,type+' '+seed);assert.equal(deck.cards.length,30);assert.deepEqual(data.validateDeck(deck.cards).errors,[]);}}
});


test('Altaria hand-sourced Basic Energy triggers Mysterious Treasures Electivire LV.X Shocking Tail, but the Zone does not',()=>{
 for(const side of ['player','opponent']){
  const rival=side==='player'?'opponent':'player';
  const s=stage('ex15-93','dp2-121');s.activeSide=side;
  s.sides[side].active=slot('ex15-93',side+'stage2');
  s.sides[rival].active=slot('dp2-121',rival+'electivire');
  const alt=slot('ex15-90',side+'alt');alt.benchSlot=0;s.sides[side].bench=[alt];
  s.sides[side].hand=[ref('dp1-125',side+'hand-water')];
  use(s,side,a=>a.type==='ability'&&a.cardId==='ex15-90');
  finishChoices(s,acts=>acts.find(a=>a.choiceCardId==='dp1-125')||acts.find(a=>a.choiceTarget==='active')||acts.find(a=>!a.choiceSkip)||acts[0]);
  assert.equal(s.sides[side].active.damage,20,'Shocking Tail must react to the physical hand attachment');
  assert.ok(s.log.some(e=>e.type==='neoEffect'&&e.rule==='dp2:121:shockingTail'),'reactive Body triggered');
  const zone=stage('ex15-93','dp2-121');zone.activeSide=side;
  zone.sides[side].active=slot('ex15-93',side+'zone-stage2');zone.sides[rival].active=slot('dp2-121',rival+'zone-electivire');
  zone.sides[side].energyType='Water';zone.sides[side].energySupply=['Water','Water'];zone.sides[side].energyAvailable=true;zone.sides[side].energyUsed=false;
  use(zone,side,a=>a.type==='attach'&&a.target==='active');
  assert.equal(zone.sides[side].active.damage,0,'Zone attachment must not trigger Shocking Tail');
 }
});

test('the action sheet explains unavailable Altaria Extra Boost without incorrectly treating Rainbow Energy as Basic',()=>{
 const s=stage('ex15-93','dp2-19');s.sides.player.bench=[slot('ex15-90','alt-bench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.player.hand=[ref('dp2-118','rainbow')];
 ui._test.setCurrentBattleForTests(s,core.legalActions(s,'player'));
 ui._test.setBattleOverlayForTests('pokemon-actions');ui._test.setPokemonActionSpecForTests({side:'player',zone:'bench',index:0});
 const html=ui._test.livePokemonActionsOverlayHtml();assert.match(html,/needs a physical Basic Energy card/i);assert.match(html,/Rainbow Energy, Double Colorless/i);
 s.sides.player.hand.push(ref('dp1-125','hand-water'));ui._test.setCurrentBattleForTests(s,core.legalActions(s,'player'));
 assert.doesNotMatch(ui._test.livePokemonActionsOverlayHtml(),/needs a physical Basic Energy card/i);
});
