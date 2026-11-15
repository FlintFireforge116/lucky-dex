'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:47});assert.ok(loan.ok,loan.error);
const added=[11,20,35,53,61,62,63,65,72,74,86,88,89,94,96,97,98,103,106,109,113,114,119,123,124,125,128];
const slot=(id,uid)=>core.makePokemonSlot(id,2,uid||id);
function board(id,defender='dp5-17',seed=27){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];}
 s.sides.player.active=slot(id,'actor');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};
 s.sides.opponent.active=slot(defender,'defender');return s;
}
function attack(s,i=0,selector={}){const list=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(list.length,`${s.sides.player.active?.cardId} attack ${i} missing`);const a=list.find(x=>Object.entries(selector).every(([k,v])=>x[k]===v))||list[0];core.applyAction(s,'player',a);return {s,action:a};}
function damage(s){return s.sides.opponent.active?.damage||0;}
function coin(s){return s.log.find(x=>x.type==='coin'&&x.side==='player');}
test('45 enabled dp6 prints, 101 remaining gated; metadata and effects are genuinely implemented',()=>{
 assert.equal(la.CARDS.length,146);assert.equal(la.CARDS.filter(c=>c.battleEnabled).length,45);
 for(const n of added){const c=data.cardById(`dp6-${n}`);assert.ok(c?.battleEnabled,c?.id);assert.equal(c.deckEligible,true);assert.equal(c.support.status,'FULL');assert.ok(c.hp>0);assert.equal(c.attacks.length,2);for(const a of c.attacks){assert.ok(a.name&&a.text!=null);assert.deepEqual(fx.validateEffect(a.effect),[],`${c.id} ${a.name}`);}}
 for(const n of [1,4,7,16,23,24,25,26,138,139,140,141,142,143,144,145,146])assert.equal(data.isBattleEnabled(`dp6-${n}`),false);
});
test('every new attack can be triggered without throwing in physical Classic battle',()=>{
 for(const n of added)for(let i=0;i<2;i++){const s=board(`dp6-${n}`);s.sides.opponent.bench=[slot('dp5-12',`target-${n}`)];if(n===125)s.sides.opponent.active.energy={Water:2,Grass:1};
  assert.doesNotThrow(()=>attack(s,i),`dp6-${n} attack ${i}`);
  assert.notEqual(s.phase,'error',`dp6-${n} attack ${i}`);
 }
});
test('Mewtwo Psychic counts defending attached Energy; Bellossom blend counts own named species',()=>{
 let s=board('dp6-11');s.sides.opponent.active.energy={Psychic:3};attack(s,1);assert.equal(damage(s),70);
 s=board('dp6-20');s.sides.player.active.damage=20;s.sides.player.bench=[slot('dp6-20','bell2')];s.sides.player.bench[0].damage=30;attack(s,0);assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.player.bench[0].damage,20);
 s=board('dp6-20');s.sides.player.bench=[slot('dp6-20','bell2')];attack(s,1);assert.equal(damage(s),100);
});
test('energy-dependent and conditional extra damage resolve BEFORE target damage',()=>{
 let s=board('dp6-72','ex2-100');s.sides.opponent.active.damage=115;attack(s,0);assert.equal(damage(s),195);
 s=board('dp6-72','dp5-17');s.sides.player.active.damage=80;attack(s,0);assert.equal(damage(s),30);
 s=board('dp6-88','dp5-20');attack(s,1);assert.equal(damage(s),30);
 s=board('dp6-88','dp5-20');delete s.sides.player.active.energy.Water;attack(s,1);assert.equal(damage(s),20);
 s=board('dp6-109');attack(s,1);assert.equal(damage(s),20);
 s=board('dp6-109');s.sides.player.bench=[slot('dp6-13','nose2')];attack(s,1);assert.equal(damage(s),40);
 s=board('dp6-61');s.sides.opponent.active.damage=10;attack(s,1);assert.equal(damage(s),90);
});
test('two-coin, three-coin, per-Tauros and until-tails damage resolve from visible rolls',()=>{
 for(const [id,index,base,per] of [['dp6-65',1,40,20],['dp6-86',1,0,20],['dp6-106',1,0,10],['dp6-63',1,0,50]]){
  const s=board(id,'dp5-17',14);attack(s,index);const c=coin(s);assert.ok(c,`${id} missing coin`);assert.equal(damage(s),base+c.heads*per,`${id} damage mismatch`);
 }
 let s=board('dp6-74');s.sides.player.bench=[slot('dp6-74','tauros2'),slot('dp6-74','tauros3')];attack(s,0);assert.equal(coin(s).results.length,3);assert.equal(damage(s),coin(s).heads*20);
});
test('Gligar Light Poison tails deals zero, heads deals damage and applies poison',()=>{
 for(let seed=1;seed<10;seed++){const s=board('dp6-94','dp5-17',seed);attack(s,0);const result=coin(s);assert.ok(result);assert.equal(damage(s)>=10,!!result.heads);assert.equal(s.log.some(x=>x.type==='status'&&x.status==='poison'),!!result.heads);}
});
test('Buneary and Gloom healing plus conditions; Meowth Pay Day draws',()=>{
 let s=board('dp6-86');s.sides.player.active.damage=50;s.sides.player.active.conditions={poison:{amount:10}};attack(s,0);assert.equal(s.sides.player.active.damage,10);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='sleep'&&x.side==='player'));
 s=board('dp6-97');s.sides.player.active.damage=30;attack(s,0);assert.equal(s.sides.player.active.damage,10);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='sleep'&&x.side==='player'));
 for(let seed=1;seed<10;seed++){s=board('dp6-106','dp5-17',seed);const before=s.sides.player.hand.length;attack(s,0);assert.equal(s.sides.player.hand.length,before+Number(!!coin(s).heads));}
});
test('Marowak only locks Heavy Bone when coin tails; other attack remains usable',()=>{
 for(let seed=1;seed<10;seed++){const s=board('dp6-63','dp5-17',seed);attack(s,0);const result=coin(s);assert.equal((s.sides.player.active.locks||[]).some(x=>x.attackName==='Heavy Bone'),!result.heads);}
});
test('Pineco Selfdestruct hits both benches and itself while attacking opponent',()=>{
 const s=board('dp6-113','dp5-12');s.sides.player.bench=[slot('dp5-17','myBench')];s.sides.opponent.bench=[slot('dp5-17','theirBench')];attack(s,1);
 assert.equal(s.sides.player.bench[0].damage,10);assert.equal(s.sides.opponent.bench[0].damage,10);assert.equal(damage(s),40);
 assert.ok(s.log.some(x=>x.type==='benchDamage'&&x.targetSide==='opponent'));
});
test('Poliwag Twiddle chooses one condition from actual coin outcome',()=>{
 for(let seed=1;seed<=8;seed++){const s=board('dp6-114','dp5-17',seed);attack(s,1);const result=coin(s);assert.ok(result);assert.ok(s.log.some(x=>x.type==='status'&&x.status===(result.heads?'confusion':'sleep')));}
});
test('Lucario Focus Blast offers real Active/Bench targeting and damages only chosen target',()=>{
 let s=board('dp6-61','dp5-17');s.sides.opponent.bench=[slot('dp5-12','benchOne')];
 const a=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);
 assert.equal(a.length,2);assert.equal(a.filter(x=>x.target==='opponentBench').length,1);
 attack(s,0,{target:'opponentBench'});
 assert.equal(s.sides.opponent.active.damage,0);
 assert.equal(s.sides.opponent.bench[0].damage,30);
});
test('Luxio Spark requests a bench target, not invisible automatic blanket damage',()=>{
 const s=board('dp6-62','dp5-17');s.sides.opponent.bench=[slot('dp5-12','benchOne'),slot('dp5-20','benchTwo')];s.sides.opponent.bench[1].benchSlot=1;
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(actions.length,2);
 const chosen=actions.find(a=>a.target==='opponentBench'&&a.benchIndex===1);
 assert.ok(chosen);core.applyAction(s,'player',chosen);
 assert.equal(s.sides.opponent.bench[0].damage,0);
 assert.equal(s.sides.opponent.bench[1].damage,10);
 assert.equal(s.sides.opponent.active.damage,60,'Empoleon Lightning Weakness adds 30 to Spark');
});
test('Gulpin Amnesia exposes defender attack names as separate choices',()=>{
 const s=board('dp6-98','dp5-17');attack(s,0);
 assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.equal(choices.length,2);assert.deepEqual(choices.map(a=>a.choiceAttackIndex),[0,1]);
 core.applyAction(s,'player',choices[1]);
 assert.ok(s.sides.opponent.active.locks.some(x=>x.attackName===data.cardById('dp5-17').attacks[1].name));
 assert.ok(!s.sides.opponent.active.locks.some(x=>x.attackName===data.cardById('dp5-17').attacks[0].name));
});
test('Taillow Focus Energy boosts only the next own-turn Peck, not immediately',()=>{
 const s=board('dp6-124','dp5-17');attack(s,0);
 assert.deepEqual(s.sides.player.active.nextAttackBonuses.map(x=>x.attackName),['Peck']);
 s.phase='battle';s.activeSide='player';s.turnNumber=12;s.sides.player.turnCount+=1;
 attack(s,1);assert.equal(damage(s),30);
});
test('Skitty Growl weakens the former defender attacks only through the opponent turn',()=>{
 const s=board('dp6-119','dp6-117');s.sides.opponent.active.energy={Fighting:5};
 attack(s,0);assert.equal(s.activeSide,'opponent');
 assert.ok(s.modifiers?.some(x=>x.stat==='attackDamage'&&x.amount===-20&&x.expiresTurn===s.turnNumber));
 const actions=core.legalActions(s,'opponent').filter(a=>a.type==='attack');assert.ok(actions.length>0);
 const hit=actions.find(a=>a.attackIndex===1)||actions[0];core.applyAction(s,'opponent',hit);
 assert.equal(s.sides.player.active.damage,20,'Riolu Low Kick 30 minus Growl 20, then Fighting Weakness +10');
});

test('Poliwrath Focus Punch remains selectable after an opposing attack but deals 0 if recently hit',()=>{
 let s=board('dp6-35','dp5-17');attack(s,0);assert.equal(damage(s),60);
 s=board('dp6-35','dp5-17');s.sides.player.active.lastDamageSource={side:'opponent',attack:true,turn:9};
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===0));
 attack(s,0);assert.equal(damage(s),0,'Focus Punch must do nothing after taking attack damage last opponent turn');
 s=board('dp6-35','dp5-17');s.sides.player.active.lastDamageSource={side:'opponent',attack:true,turn:8};
 attack(s,0);assert.equal(damage(s),60);
});
test('Drifblim Expand reduces the next opponent hit and Whirlwind asks defender to choose bench',()=>{
 let s=board('dp6-53','dp6-117');s.sides.opponent.active.energy={Fighting:3};attack(s,0);
 assert.ok(s.modifiers.some(m=>m.stat==='damageReduction'&&m.amount===10));
 const reply=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(reply);
 core.applyAction(s,'opponent',reply);assert.equal(s.sides.player.active.damage,20);
 s=board('dp6-53','dp5-17');s.sides.opponent.bench=[slot('dp5-12','windbench')];attack(s,1);
 assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,'opponent').filter(a=>a.type==='effectChoice');assert.ok(choices.length);
 core.applyAction(s,'opponent',choices[0]);assert.equal(s.sides.opponent.active.uid,'windbench');
});
test('Corphish Knock Off discards exactly one actual opposing hand card only on heads',()=>{
 for(let seed=1;seed<8;seed++){
  const s=board('dp6-89','dp5-17',seed);s.sides.opponent.hand=[{uid:'handA',cardId:'dp5-17'},{uid:'handB',cardId:'dp5-20'}];
  attack(s,0);const heads=!!coin(s).heads;
  assert.equal(s.sides.opponent.discard.filter(r=>['handA','handB'].includes(r.uid)).length,Number(heads),'Knock Off should move the discarded physical card, irrespective of the automatic next-turn draw');
 }
});
test('Gloom Frustration only targets Pokémon without damage counters',()=>{
 const s=board('dp6-96','dp5-17');s.sides.opponent.active.damage=10;
 s.sides.opponent.bench=[slot('dp5-12','clean'),slot('dp5-20','damaged')];s.sides.opponent.bench[0].benchSlot=0;s.sides.opponent.bench[1].benchSlot=1;s.sides.opponent.bench[1].damage=10;
 const choices=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(choices.length,1);assert.equal(choices[0].target,'opponentBench');
 core.applyAction(s,'player',choices[0]);assert.equal(s.sides.opponent.bench[0].damage,30);
 assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[1].damage,10);
});
test('Houndour Roar gives opponent the bench-switch decision, preserving damage',()=>{
 const s=board('dp6-103','dp5-17');s.sides.opponent.bench=[slot('dp5-12','houndBench')];
 attack(s,0);assert.equal(s.phase,'effectChoice');const options=core.legalActions(s,'opponent').filter(a=>a.type==='effectChoice');assert.equal(options.length,1);
 core.applyAction(s,'opponent',options[0]);assert.equal(s.sides.opponent.active.uid,'houndBench');
});
test('Swinub Sniff Out retrieves selected physical discard card only after heads',()=>{
 for(let seed=1;seed<8;seed++){
  const s=board('dp6-123','dp5-17',seed);s.sides.player.discard.push({uid:'discardx',cardId:'dp5-17'},{uid:'discardy',cardId:'dp5-20'});
  attack(s,0);const heads=!!coin(s).heads;
  if(heads){assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');assert.equal(choices.length,2);core.applyAction(s,'player',choices[1]);assert.ok(s.sides.player.hand.some(r=>r.uid==='discardy'));assert.ok(!s.sides.player.discard.some(r=>r.uid==='discardy'));}
  else{assert.equal(s.sides.player.hand.length,0);assert.equal(s.sides.player.discard.filter(r=>['discardx','discardy'].includes(r.uid)).length,2);}
 }
});
test('Tentacool Mysterious Beam heads removes an attached opponent energy and tails does not',()=>{
 for(let seed=1;seed<8;seed++){
  const s=board('dp6-125','dp5-17',seed);s.sides.opponent.active.energy={Grass:2};
  attack(s,1);assert.equal(s.sides.opponent.active.energy.Grass,2-Number(!!coin(s).heads));
 }
});
test('Yanma U-turn performs a real own-bench switch before passing turn',()=>{
 const s=board('dp6-128','dp5-17');s.sides.player.bench=[slot('dp6-117','yanBench')];
 attack(s,0);
 if(s.phase==='effectChoice'){
  const choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');assert.ok(choices.length);core.applyAction(s,'player',choices[0]);
 }
 assert.equal(s.sides.player.active.uid,'yanBench');
 assert.ok(s.sides.player.bench.some(c=>c.uid==='actor'));
});
