'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path='../app/src/main/assets/';
const dp=require(path+'tcg-classic-diamond-pearl'),data=require(path+'tcg-classic-battle-data'),builder=require(path+'tcg-classic-deck-builder'),opponents=require(path+'tcg-classic-opponents'),core=require(path+'tcgp-battle-core'),fx=require(path+'tcgp-battle-effects');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const owned=dp.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const base=opponents.generate({sets:['dp1'],type:'Grass',seed:17});
function setup(att='dp1-84',def='dp1-94'){
 assert.ok(base.ok,base.error);
 const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:31,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=7;s.sides.opponent.turnCount=7;
 s.sides.player.active=core.makePokemonSlot(att,4,'attack');s.sides.opponent.active=core.makePokemonSlot(def,4,'defend');
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Colorless:4};
 s.sides.opponent.active.energy={Grass:1};s.sides.player.bench=[core.makePokemonSlot('dp1-85',3,'bench')];
 s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench=[core.makePokemonSlot('dp1-93',3,'otherbench')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function attack(s,index=0){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,`Attack ${index} was not legal`);core.applyAction(s,'player',a);}
function play(s,id){s.sides.player.hand=[{uid:'played-'+id,cardId:id}];const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId===id);assert.ok(a,`${id} Trainer legal`);core.applyAction(s,'player',a);return a;}
function finishChoices(s){for(let n=0;n<12&&s.phase==='effectChoice';n++){const a=core.legalActions(s,s.choiceSide).find(x=>x.type==='effectChoice'&&!x.choiceSkip);assert.ok(a,`choice must resolve in ${n} steps`);core.applyAction(s,s.choiceSide,a);}assert.notEqual(s.phase,'effectChoice');}
test('DP1 complete collector catalogue: 130 unique identities, exact printed Weakness modifiers and 3 gated LV.X',()=>{
 assert.equal(dp.CARDS.length,130);assert.deepEqual(dp.CARDS.map(x=>Number(x.number)),Array.from({length:130},(_,i)=>i+1));
 assert.equal(dp.CARDS.filter(x=>x.kind==='pokemon').length,107);assert.equal(dp.CARDS.filter(x=>x.kind==='trainer').length,15);assert.equal(dp.CARDS.filter(x=>x.kind==='energy').length,8);
 assert.equal(dp.CARDS.filter(x=>x.battleEnabled).length,48);assert.equal(dp.CARDS.filter(x=>!x.battleEnabled).length,82);
 for(const id of ['dp1-120','dp1-121','dp1-122']){const c=dp.cardById(id);assert.equal(c.isLevelX,true);assert.equal(c.battleEnabled,false);assert.equal(c.stage,'Level-Up');}
 assert.equal(dp.cardById('dp1-28').weaknessValue,'+20');assert.equal(dp.cardById('dp1-28').retreat,2);
 assert.equal(dp.cardById('dp1-129').subtype,'Darkness');assert.equal(dp.cardById('dp1-130').subtype,'Metal');
 assert.ok(dp.CARDS.every(c=>c.setId==='dp1'&&c.image.includes('images.pokemontcg.io/dp1/')));
});
test('gated printed Powers, LV.X and complex attacks are NOT playable or visible in deck pool',()=>{
 for(const c of dp.CARDS){const inData=data.cardById(c.id);assert.ok(inData,`missing in combined Classic catalogue: ${c.id}`);assert.equal(inData.battleEnabled,c.battleEnabled);if(!c.battleEnabled)assert.equal(c.deckEligible,false);}
 const d=builder.buildDeck(owned,{sets:['dp1'],focusCardId:'dp1-28',types:['Grass'],randomSeed:6});assert.ok(d.ok,JSON.stringify(d.errors));assert.equal(d.cards.length,30);
 assert.ok(d.cards.every(id=>{const c=data.cardById(id);return c.battleEnabled&&c.deckEligible!==false&&c.setId==='dp1';}));
 assert.equal(d.cards.includes('dp1-120'),false);
});
test('verified battle cards never advertise placeholder effect description',()=>{
 for(const c of dp.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled)){
  for(const a of c.attacks){assert.ok(!/See the original card/.test(a.text));assert.ok(a.effect&&a.effect.type);assert.equal(fx.validateEffect(a.effect).length,0,`${c.id} ${a.name}`);}
 }
 for(const c of dp.CARDS.filter(x=>x.kind==='trainer'&&x.battleEnabled))assert.equal(fx.validateEffect(c.effect).length,0,c.id);
});
test('new +20 Weakness adds 20 and does NOT double attacker damage',()=>{
 const s=setup('ex16-48','dp1-28');attack(s,0);assert.equal(s.sides.opponent.active.damage,30,'Charmander 10 + printed Fire +20');
});
test('new +10 weakness adds 10 and legacy ×2 still multiplies',()=>{
 let s=setup('dp1-84','dp1-94');attack(s,0);assert.equal(s.sides.opponent.active.damage,20,'Goldeen 10 + Ponyta +10');
 s=setup('ex16-53','ex16-21');attack(s,0);assert.equal(s.sides.opponent.active.damage,40,'Legacy ex16 Machop 20 × 2');
});
test('Ponyta Tackle/Flame Tail, Machop Low Kick and Turtwig Razor Leaf inflict printed damage',()=>{
 for(const [att,index,expected] of [['dp1-94',0,10],['dp1-94',1,30],['dp1-86',0,20],['dp1-103',1,20]]){
  const s=setup(att,'dp1-93');attack(s,index);assert.equal(s.sides.opponent.active.damage,expected,`${att} attack ${index}`);
 }
});
test('Goldeen Take Down applies self recoil, Stunky Severe Gas poisons',()=>{
 let s=setup('dp1-84','dp1-93');attack(s,1);assert.equal(s.sides.opponent.active.damage,30);assert.equal(s.sides.player.active.damage,10);
 s=setup('dp1-102','dp1-93');attack(s,1);assert.equal(s.sides.opponent.active.damage,20,'10 attack + 10 between-turn Poison');assert.ok(s.log.some(x=>x.type==='status'&&x.status==='poison'),'Poison must apply before end-turn tick');
});
test('Chatot Me First draws real physical card; Hoothoot Hypnosis sleeps',()=>{
 let s=setup('dp1-74');const before=s.sides.player.hand.length;s.sides.player.deck=[{uid:'draw-1',cardId:'dp1-85'}];attack(s,0);assert.equal(s.sides.player.hand.length,before+1);assert.equal(s.sides.player.deck.length,0);
 s=setup('dp1-85');attack(s,0);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='sleep'),'Sleep must apply before between-turn wake check');
});

test('Drapion evolution line, poison, and seeded Stomp coin bonus',()=>{
 const d=dp.cardById('dp1-23');assert.equal(d.evolvesFrom,'Skorupi');
 let s=setup('dp1-23','dp1-93');attack(s,0);assert.ok([20,40].includes(s.sides.opponent.active.damage));
 s=setup('dp1-23','dp1-93');attack(s,1);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='poison'));
});
test('Riolu Wild Kick gates damage on a coin; Chimchar Ember tails spends actual Fire Energy',()=>{
 let s=setup('dp1-61','dp1-93');attack(s,0);assert.ok([0,30].includes(s.sides.opponent.active.damage));assert.ok(s.log.some(x=>x.type==='coin'));
 s=setup('dp1-76','dp1-93');s.sides.player.active.energy={Fire:3,Colorless:1};attack(s,1);
 assert.equal(s.sides.opponent.active.damage,30);assert.ok([2,3].includes(s.sides.player.active.energy.Fire));assert.ok(s.log.some(x=>x.type==='coin'));
});
test('Skorupi Pin Missile and Starly Quick Attack record real coin outcomes',()=>{
 for(const [id,index] of [['dp1-99',1],['dp1-101',1]]){
  const s=setup(id);attack(s,index);assert.ok(s.log.some(x=>x.type==='coin'),`${id} must roll coin(s)`);
  assert.ok(Number(s.sides.opponent.active.damage)>=0);
 }
});
test('Double Full Heal removes every Active Special Condition, not bench statuses',()=>{
 const s=setup();s.sides.player.active.conditions={poison:true,burn:true,sleep:true,paralysis:true,confusion:true};s.sides.player.bench[0].conditions={poison:true};
 play(s,'dp1-105');assert.equal(Object.values(s.sides.player.active.conditions).some(Boolean),false);assert.equal(s.sides.player.bench[0].conditions.poison,true);
});
test('Potion heals exactly two damage counters on chosen Pokémon',()=>{
 const s=setup();s.sides.player.active.damage=40;play(s,'dp1-118');assert.equal(s.sides.player.active.damage,20);
});
test('Switch moves actual Bench Pokémon to Active',()=>{
 const s=setup();play(s,'dp1-119');assert.equal(s.sides.player.active.cardId,'dp1-85');assert.equal(s.sides.player.bench[0].cardId,'dp1-84');
});
test('Poké Ball heads exposes real deck Pokémon choice (not arbitrary free card)',()=>{
 const s=setup();s.sides.player.deck=[{uid:'search-poke',cardId:'dp1-74'},{uid:'search-item',cardId:'dp1-119'}];play(s,'dp1-110');
 if(s.phase==='effectChoice'){finishChoices(s);assert.equal(s.sides.player.hand.some(r=>r.cardId==='dp1-74'),true);}
 else assert.equal(s.sides.player.hand.some(r=>r.cardId==='dp1-74'),false,'tails may only skip search');
});

test('all currently enabled DP1 attacks execute for player and CPU-side actors without unresolved choices',()=>{
 let count=0;
 for(const card of dp.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled))for(let attackIndex=0;attackIndex<card.attacks.length;attackIndex++)for(const actor of ['player','opponent']){
  const s=setup(card.id,'dp1-93');s.sides[actor].active=core.makePokemonSlot(card.id,4,'atk-'+actor);
  s.sides[actor].active.energy=Object.fromEntries(types.map(type=>[type,6]));
  s.sides[actor].bench=[core.makePokemonSlot('dp1-85',3,'bench-'+actor)];s.sides[actor].bench[0].benchSlot=0;
  s.activeSide=actor;
  const a=core.legalActions(s,actor).find(x=>x.type==='attack'&&x.attackIndex===attackIndex);
  assert.ok(a,`${card.id} attack ${attackIndex} ${actor} legal`);
  assert.doesNotThrow(()=>core.applyAction(s,actor,a),`${card.id} ${card.attacks[attackIndex].name} ${actor}`);
  finishChoices(s);count++;
 }
 assert.equal(count,dp.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled).reduce((n,x)=>n+x.attacks.length*2,0));
});
test('set-only builder makes complete 30-card playable focused decks, with no unrequested types',()=>{
 for(const [id,type] of [['dp1-28','Grass'],['dp1-93','Water'],['dp1-94','Fire'],['dp1-86','Fighting'],['dp1-99','Psychic'],['dp1-102','Darkness']]){
  const d=builder.buildDeck(owned,{sets:['dp1'],focusCardId:id,types:[type],randomSeed:19});assert.ok(d.ok,`${id}: ${JSON.stringify(d.errors)}`);assert.equal(d.cards.length,30);
  assert.deepEqual(d.energyTypes,[type]);assert.ok(d.cards.includes(id));assert.ok(data.validateDeck(d.cards).ok,`${id} legality`);
  assert.ok(d.cards.every(x=>data.cardById(x).battleEnabled&&data.cardById(x).setId==='dp1'));
 }
});
test('CPU can create a legal no-gated DP1 Grass opponent and fail explicitly when narrow pool unbuildable',()=>{
 for(const seed of [3,17,39,57]){const d=opponents.generate({sets:['dp1'],type:'Grass',seed});assert.ok(d.ok,`seed ${seed}: ${d.error}`);assert.equal(d.cards.length,30);assert.ok(data.validateDeck(d.cards).ok);}
 const unavailable=opponents.generate({sets:['dp1'],type:'Metal',seed:17});assert.equal(unavailable.ok,false);assert.match(unavailable.error,/No legal Classic CPU deck/);
});
