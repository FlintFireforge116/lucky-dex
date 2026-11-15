'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:47});assert.ok(loan.ok,loan.error);
const added=[3,4,17,22,29,32,47,58,59,70,71,93,101,102,107,121,122];
const slot=(id,uid)=>{let s=core.makePokemonSlot(id,2,uid||id);return s;};
function board(id,defender='dp5-17',seed=27){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];}
 s.sides.player.active=slot(id,'actor');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};
 s.sides.opponent.active=slot(defender,'defender');return s;
}
function attack(s,i=0,selector={}){const options=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(options.length,`${s.sides.player.active?.cardId} attack ${i} missing`);const a=options.find(x=>Object.entries(selector).every(([k,v])=>x[k]===v))||options[0];core.applyAction(s,'player',a);return a;}
function choose(s,index=0,side='player'){const options=core.legalActions(s,side).filter(x=>x.type==='effectChoice');assert.ok(options.length,`No choice for ${side} phase=${s.phase}`);core.applyAction(s,side,options[index]);return options[index];}
function coin(s){return s.log.find(x=>x.type==='coin'&&x.side==='player');}

test('17 fully registered new prints, non-compliant prints remain gated',()=>{
 assert.equal(la.CARDS.length,146);assert.ok(la.coverage().battleEnabled>=62);
 for(const n of added){const c=data.cardById(`dp6-${n}`);assert.equal(c?.battleEnabled,true,`dp6-${n}`);assert.equal(c.attacks.length,2);for(const a of c.attacks)assert.deepEqual(fx.validateEffect(a.effect),[],`${c.name} ${a.name}`);}
 for(const n of [7,16,19,21,27,42])assert.equal(data.isBattleEnabled(`dp6-${n}`),true);
});
test('all 34 newly enabled attacks have actionable, non-throwing paths',()=>{
 for(const n of added)for(let i=0;i<2;i++){
  const s=board(`dp6-${n}`);s.sides.player.bench=[slot('dp6-117','ownBench')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench=[slot('dp5-12','foeBench')];s.sides.opponent.bench[0].benchSlot=0;
  s.sides.opponent.active.energy={Water:2,Grass:1};
  if(n===71&&i===1)s.sides.opponent.active=slot('dp5-1','poweredDefender');
  assert.doesNotThrow(()=>attack(s,i),`dp6-${n} attack ${i}`);assert.notEqual(s.phase,'error');
 }
});

test('Froslass discards Psychic for Destiny Bond and Icy Breath sleeps and hits every enemy Bench',()=>{
 let s=board('dp6-3','dp5-17');attack(s,0);assert.equal(s.sides.player.active.energy.Psychic,4);assert.ok(s.sides.player.active.destinyBond);
 s=board('dp6-3','dp5-17');s.sides.opponent.bench=[slot('dp5-12','b1'),slot('dp5-20','b2')];attack(s,1);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='sleep'));assert.equal(s.sides.opponent.bench[0].damage,10);assert.equal(s.sides.opponent.bench[1].damage,10);
});
test('Giratina Shadow Force targets bench, Brutal Edge uses existing defender counters',()=>{
 let s=board('dp6-4','dp5-17');s.sides.opponent.bench=[slot('dp5-12','b1')];const opts=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);assert.equal(opts.length,1);assert.equal(opts[0].target,'opponentBench');attack(s,0);assert.equal(s.sides.opponent.bench[0].damage,20);assert.equal(s.sides.opponent.active.damage,0);assert.ok(coin(s));
 s=board('dp6-4','dp5-17');s.sides.opponent.active.damage=30;attack(s,1);assert.equal(s.sides.opponent.active.damage,110); // 50 + 30 from counters
});
test('Yanmega Sonic Wave damages all benches, defender chooses switch, Pursue rewards 20+ counters',()=>{
 let s=board('dp6-17','dp5-17');s.sides.opponent.bench=[slot('dp5-12','b1')];attack(s,0);assert.equal(s.sides.opponent.bench[0].damage,10);assert.equal(s.phase,'effectChoice');choose(s,0,'opponent');assert.equal(s.sides.opponent.active.uid,'b1');
 s=board('dp6-17','dp5-17');s.sides.opponent.active.damage=20;s.sides.player.bench=[slot('dp6-117','ownBench')];attack(s,1);assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.player.active.uid,'ownBench');
});
test('Crawdaunt Gripthrow returns defender attachments on heads, TM bonus must be TM only',()=>{
 for(let seed=1;seed<8;seed++){const s=board('dp6-22','dp5-17',seed);s.sides.opponent.active.energy={Water:1};attack(s,0);const hit=!!coin(s)?.heads;assert.equal(s.sides.opponent.hand.some(r=>r.cardId==='dp5-17'),hit);}
 let s=board('dp6-22','dp5-17');attack(s,1);assert.equal(s.sides.opponent.active.damage,50);
});
test('Groudon and Kyogre let player choose acceleration from actual hand; discard attached Energy when attacking',()=>{
 for(const [id,type,energyId] of [['dp6-29','Fighting','dp1-128'],['dp6-32','Water','dp1-125']]){
  let s=board(id);s.sides.player.hand=[{uid:'energy1',cardId:energyId},{uid:'energy2',cardId:energyId}];
  s.sides.player.bench=[slot('dp6-117','bench')];attack(s,0);assert.equal(s.phase,'effectChoice');
  const options=core.legalActions(s,'player').filter(x=>x.type==='effectChoice');assert.equal(options.length,3);choose(s,2);
  if(s.phase==='effectChoice')choose(s,1);
  assert.equal(s.sides.player.hand.length,0);assert.ok(s.sides.player.active.energy[type]>=5||s.sides.player.bench[0].energy[type]>=2);
  s=board(id);s.sides.player.bench=[slot('dp6-117','bench')];s.sides.opponent.bench=[slot('dp5-12','enemy')];attack(s,1);assert.equal(s.sides.player.active.energy[type],3);
  assert.equal(id==='dp6-29'?s.sides.player.bench[0].damage:s.sides.opponent.bench[0].damage,id==='dp6-29'?10:20);
 }
});
test('Lanturn moves exactly one opposing attached Energy to chosen opposing bench',()=>{
 const s=board('dp6-58','dp5-17');s.sides.opponent.active.energy={Water:2};s.sides.opponent.bench=[slot('dp5-12','b1')];attack(s,0);assert.equal(s.sides.opponent.active.energy.Water,1);assert.equal(s.sides.opponent.bench[0].energy.Water,1);
});
test('Exeggcute Call for Family offers selected Grass/Psychic Basic from draw deck',()=>{
 const s=board('dp6-93');s.sides.player.deck=[{uid:'p1',cardId:'dp6-117'},{uid:'p2',cardId:'dp6-121'},{uid:'p3',cardId:'dp6-122'}];attack(s,0);assert.equal(s.phase,'effectChoice');let options=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');assert.ok(options.length);assert.ok(options.every(a=>a.choiceDeckIndex!==2));choose(s,0);assert.equal(s.sides.player.bench.length,1);
});
test('Hitmontop does 20 per heads; Gut Spin only offers switch if Tyrogue is in evolution stack',()=>{
 let s=board('dp6-101');attack(s,0);assert.equal(s.sides.opponent.active.damage,coin(s).heads*20);
 s=board('dp6-101');s.sides.player.bench=[slot('dp6-117','b1')];attack(s,1);assert.notEqual(s.phase,'effectChoice');
 s=board('dp6-101');s.sides.player.active.stack=['dp6-126','dp6-101'];s.sides.player.bench=[slot('dp6-117','b1')];attack(s,1);assert.equal(s.phase,'effectChoice');choose(s,1);if(s.phase==='effectChoice')choose(s,0);assert.equal(s.sides.player.active.uid,'b1');
});
test('Horsea Smokescreen checks opponent attacks; Reverse Thrust switches attacker',()=>{
 let s=board('dp6-102','dp6-117');s.sides.opponent.active.energy={Fighting:3};attack(s,0);assert.ok(s.sides.opponent.active.attackGate);
 s=board('dp6-102');s.sides.player.bench=[slot('dp6-117','b1')];attack(s,1);assert.equal(s.sides.player.active.uid,'b1');
});
test('Misdreavus Show Off offers physical/zone Basic Energy; Payback checks remaining prizes',()=>{
 let s=board('dp6-107');s.sides.player.deck=[{uid:'energy1',cardId:'dp1-125'}];attack(s,0);assert.equal(s.phase,'effectChoice');
 s=board('dp6-107');s.sides.opponent.prizes=[{uid:'one',cardId:'dp5-17'}];attack(s,1);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp6-107');s.sides.opponent.prizes=[{uid:'one',cardId:'dp5-17'},{uid:'two',cardId:'dp5-12'}];attack(s,1);assert.equal(s.sides.opponent.active.damage,10);
});
test('Spoink Bounce offers keep or switch; Staryu Recover discards Energy and heals',()=>{
 let s=board('dp6-121');s.sides.player.bench=[slot('dp6-117','b1')];attack(s,1);assert.equal(s.phase,'effectChoice');const options=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');assert.equal(options.length,2);choose(s,1);if(s.phase==='effectChoice')choose(s,0);assert.equal(s.sides.player.active.uid,'b1');
 s=board('dp6-122');s.sides.player.active.damage=40;attack(s,0);assert.equal(s.sides.player.active.damage,10);assert.equal(Object.values(s.sides.player.active.energy).reduce((n,x)=>n+x,0),39);
});
test('Camerupt Eruption discards physical top cards from both players and gains 30 per Energy',()=>{
 const s=board('dp6-47');s.sides.player.deck=[{uid:'myEnergy',cardId:'dp1-125'},{uid:'myOther',cardId:'dp6-117'}];s.sides.opponent.deck=[{uid:'theirEnergy',cardId:'dp1-128'},{uid:'theirOther',cardId:'dp6-117'}];
 attack(s,0);assert.equal(s.sides.opponent.active.damage,90);assert.equal(s.sides.player.discard.some(x=>x.uid==='myEnergy'),true);assert.equal(s.sides.opponent.discard.some(x=>x.uid==='theirEnergy'),true);
 const q=board('dp6-47');q.sides.player.deck=[{uid:'one',cardId:'dp6-117'}];q.sides.opponent.deck=[{uid:'two',cardId:'dp6-117'}];attack(q,0);assert.equal(q.sides.opponent.active.damage,30);
});
test('Lanturn Energy Split only hits opponent Pokemon with attached Energy; Aqua Bolt Water multiplier',()=>{
 let s=board('dp6-59','dp5-17');s.sides.opponent.bench=[slot('dp5-12','b1'),slot('dp5-20','b2')];s.sides.opponent.active.energy={Grass:2};s.sides.opponent.bench[0].energy={Water:1};attack(s,0);
 assert.equal(s.sides.opponent.active.damage,60);assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.opponent.bench[1].damage,0);
 s=board('dp6-59');s.sides.opponent.active.energy={};attack(s,0);assert.equal(s.sides.opponent.active.damage,0);
 s=board('dp6-59');s.sides.player.active.energy={Lightning:1,Water:3};attack(s,1);assert.equal(s.sides.opponent.active.damage,120);
});
test('Seadra Aqua Pump offers no discard, one or two real Water Energy from hand for attack bonus',()=>{
 let s=board('dp6-70','dp5-17');s.sides.player.hand=[{uid:'w1',cardId:'dp1-125'},{uid:'w2',cardId:'dp1-125'},{uid:'f1',cardId:'dp1-128'}];
 const moves=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(moves.length>=4);
 assert.ok(moves.some(x=>x.effectSelection==='w1,w2'||x.effectSelection==='w2,w1'));
 const action=moves.find(x=>x.effectSelection==='w1,w2'||x.effectSelection==='w2,w1');core.applyAction(s,'player',action);
 assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.sides.player.hand.length,1);assert.ok(s.sides.player.discard.some(x=>x.uid==='w1'));
 s=board('dp6-70');attack(s,1);assert.equal(s.sides.opponent.active.damage,50);
});
test('Starmie Star Boomerang asks whether to return stack and Energy; Core Flash only targets Pokemon with abilities',()=>{
 let s=board('dp6-71','dp5-17');s.sides.player.active.energy={Water:1};s.sides.player.active.stack=['dp6-122','dp6-71'];attack(s,0);
 assert.equal(s.phase,'effectChoice');assert.equal(core.legalActions(s,'player').filter(a=>a.type==='effectChoice').length,2);choose(s,1);
 assert.ok(s.sides.player.hand.some(r=>r.cardId==='dp6-71'));assert.ok(s.sides.player.hand.some(r=>r.cardId==='dp1-125')||s.sides.player.hand.some(r=>data.cardById(r.cardId)?.basicEnergy));
 s=board('dp6-71','dp5-17');s.sides.opponent.bench=[slot('dp5-1','powerBench')];
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(actions.length,1);assert.equal(actions[0].target,'opponentBench');core.applyAction(s,'player',actions[0]);assert.equal(s.sides.opponent.bench[0].damage,50);assert.equal(s.sides.opponent.active.damage,0);
});

test('full Classic hands do not block printed Pokemon-and-attachment returns on either side',()=>{
 let s=board('dp6-71','dp5-17');const p=s.sides.player;
 p.hand=Array.from({length:8},(_,i)=>({uid:`older-${i}`,cardId:'dp6-117'}));
 p.active.energy={Water:1};p.active.stack=['dp6-122','dp6-71'];
 attack(s,0);choose(s,1);
 assert.equal(p.active,null,'Star Boomerang must return the Active Pokemon');
 assert.equal(p.hand.length,8);assert.ok(p.hand.some(x=>x.cardId==='dp6-71'));
 assert.ok(p.hand.some(x=>x.cardId==='dp6-122'));
 assert.deepEqual(p.deck.slice(-3).map(x=>x.uid),['older-0','older-1','older-2']);
 assert.ok(s.log.some(x=>x.type==='handLimit'&&x.source==='returnToHand'&&x.amount===3));
 let observed=false;
 for(let seed=1;seed<=20&&!observed;seed++){
   s=board('dp6-22','dp5-17',seed);const o=s.sides.opponent;
   o.hand=Array.from({length:8},(_,i)=>({uid:`foe-older-${i}`,cardId:'dp6-117'}));
   o.active.energy={Water:1};attack(s,0);
   if(!coin(s)?.heads)continue;
   observed=true;
   assert.equal(o.hand.length,8,'CPU obeys the same eight-card limit');
   assert.ok(o.hand.some(x=>x.cardId==='dp5-17'),'Gripthrow must return the opposing Pokemon');
   assert.deepEqual(o.deck.slice(-2).map(x=>x.uid),['foe-older-0','foe-older-1']);
 }
 assert.ok(observed,'test must observe a real successful coin flip');
});
