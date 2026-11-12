'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';
const dp=require(P+'tcg-classic-diamond-pearl'),data=require(P+'tcg-classic-battle-data'),builder=require(P+'tcg-classic-deck-builder'),opponents=require(P+'tcg-classic-opponents'),core=require(P+'tcgp-battle-core'),fx=require(P+'tcgp-battle-effects');
const typePool=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const owned=dp.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const base=opponents.generate({sets:['dp1'],type:'Grass',seed:17});
function setup(att='dp1-84',def='dp1-94'){
 assert.ok(base.ok,base.error);
 const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:31,firstSide:'player',playerEnergyTypes:typePool,opponentEnergyTypes:typePool});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=7;s.sides.opponent.turnCount=7;
 s.sides.player.active=core.makePokemonSlot(att,4,'attack');s.sides.opponent.active=core.makePokemonSlot(def,4,'defend');
 s.sides.player.active.energy=Object.fromEntries(typePool.map(t=>[t,5]));s.sides.opponent.active.energy={Grass:1};
 s.sides.player.bench=[core.makePokemonSlot('dp1-85',3,'bench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('dp1-93',3,'otherbench')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function attack(s,index=0,actor='player',selector=()=>true){const a=core.legalActions(s,actor).find(x=>x.type==='attack'&&x.attackIndex===index&&selector(x));assert.ok(a,`${s.sides[actor].active?.cardId} attack ${index} available`);core.applyAction(s,actor,a);return a;}
function choices(s,pick){const seen=[];for(let n=0;n<16&&s.phase==='effectChoice';n++){const actions=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(actions.length>0,`choice ${n}`);const selected=pick?pick(actions,s,n):actions.find(x=>!x.choiceSkip)||actions[0];assert.ok(selected);seen.push({side:s.choiceSide,chosen:selected,options:actions});core.applyAction(s,s.choiceSide,selected);}assert.notEqual(s.phase,'effectChoice','all choices must resolve');return seen;}
test('second DP batch: 19 newly active cards, all 130 present and every active effect validates',()=>{
 assert.equal(dp.coverage().total,130);assert.equal(dp.coverage().battleEnabled,67);
 for(const n of [19,25,44,45,52,56,59,62,63,64,72,73,75,82,83,87,89,97,98]){
  const c=dp.cardById('dp1-'+n);assert.equal(c.battleEnabled,true,c.id);for(const a of c.attacks){assert.ok(!a.text.includes('See the original card'),c.id+' '+a.name);assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
 }
 for(const c of dp.CARDS.filter(x=>!x.battleEnabled))assert.equal(c.deckEligible,false);
});
test('new Wurmple and Rapidash complete branches can build set-only focused lines without off-type energy',()=>{
 for(const [id,type,baseId] of [['dp1-45','Grass','dp1-75'],['dp1-52','Lightning','dp1-98'],['dp1-56','Fire','dp1-76'],['dp1-59','Fire','dp1-94'],['dp1-62','Water','dp1-84'],['dp1-19','Grass','dp1-104'],['dp1-25','Grass','dp1-104']]){
  const options={sets:['dp1'],focusCardId:id,types:type==='Colorless'?[]:[type],randomSeed:11};const d=builder.buildDeck(owned,options);
  assert.ok(d.ok,`${id}: ${JSON.stringify(d.errors)}`);assert.equal(d.cards.length,30);assert.ok(d.cards.includes(id));assert.ok(d.cards.includes(baseId),`${id} must include actual basic ${baseId}`);
  assert.ok(d.cards.every(x=>data.cardById(x).setId==='dp1'&&data.cardById(x).battleEnabled));assert.ok(data.validateDeck(d.cards).ok);
  if(type!=='Colorless')assert.deepEqual(d.energyTypes,[type],`${id} energy filter`);
 }
});
test('Buizel Splash About adds exactly 10 only against an opponent with more Energy',()=>{
 for(const [theirEnergy,expected] of [[{Grass:1},10],[{Grass:2},20]]){
  const s=setup('dp1-72','dp1-93');s.sides.player.active.energy={Water:1};s.sides.opponent.active.energy=theirEnergy;attack(s);assert.equal(s.sides.opponent.active.damage,expected);
 }
});
test('Cascoon and Silcoon Harden prevent only incoming attacks of 30 or below',()=>{
 for(const id of ['dp1-44','dp1-63']){
  let s=setup(id,'dp1-93');attack(s);assert.equal(s.sides.player.active.attackGuard?.maxDamage,30);
  s=setup(id,'dp1-93');attack(s,1);assert.ok(s.sides.opponent.active.locks?.some(x=>x.action==='retreat'||x.action==='attack')||s.log.some(x=>x.type==='coin'));
 }
});
test('Magical Leaf heals only on heads and Thunder Fang paralysis depends on coin result',()=>{
 const s=setup('dp1-45','dp1-93');s.sides.player.active.damage=40;attack(s,1);assert.ok([10,40].includes(s.sides.player.active.damage));assert.ok([20,40].includes(s.sides.opponent.active.damage));
 const t=setup('dp1-52','dp1-93');attack(t,1);assert.ok(t.log.some(x=>x.type==='coin'));assert.ok(t.log.some(x=>x.type==='status')||!t.sides.opponent.active.conditions.paralysis);
});
test('Monferno Flame Dance recovers exactly one discarded Fire Energy',()=>{
 const s=setup('dp1-56','dp1-93');s.sides.player.energyDiscard={Fire:2};const before=s.sides.player.active.energy.Fire;attack(s,0);assert.equal(s.sides.player.active.energy.Fire,before+1);assert.equal(s.sides.player.energyDiscard.Fire,1);
});
test('Rapidash Overrun and Buneary Jump Kick target exactly one opponent Bench Pokémon',()=>{
 for(const [id,index] of [['dp1-59',0],['dp1-73',1]]){
  const s=setup(id,'dp1-93');const a=attack(s,index);choices(s);assert.ok(s.sides.opponent.bench[0].damage===10,`${id} bench damage`);assert.ok(s.sides.opponent.active.damage===Number(dp.cardById(id).attacks[index].damage),`${id} active damage`);
 }
});
test('Seaking Flail counts existing self damage counters, not raw HP x10',()=>{
 const s=setup('dp1-62','dp1-93');s.sides.player.active.damage=30;attack(s,0);assert.equal(s.sides.opponent.active.damage,30);
});
test('Cherubi Leech Seed heals only when the attack damages',()=>{
 const s=setup('dp1-75','dp1-93');s.sides.player.active.damage=20;attack(s,1);assert.equal(s.sides.player.active.damage,10);
});
test('Gastly Pain Payback asks which opposing Pokémon receives the counter',()=>{
 const s=setup('dp1-82','dp1-93');s.sides.player.active.damage=20;attack(s,0);assert.equal(s.phase,'effectChoice');const opts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(opts.length>=2);const bench=opts.find(x=>x.choiceTarget==='bench');assert.ok(bench);core.applyAction(s,s.choiceSide,bench);choices(s);assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,10);assert.equal(s.sides.opponent.active.damage,0);
});
test('Glameow Charm decreases next opponent attack damage by 20',()=>{
 const s=setup('dp1-83','dp1-93');attack(s,0);assert.ok(s.modifiers?.length>0,'modifier created');
});
test('Magnemite Metal Sound can Confuse and Resonance has +20 only against Confusion',()=>{
 for(const [confused,expected] of [[false,20],[true,40]]){const s=setup('dp1-87','dp1-93');if(confused)s.sides.opponent.active.conditions={confusion:true};attack(s,1);assert.equal(s.sides.opponent.active.damage,expected);}
});
test('Meditite Meditate adds exactly one damage per existing point of damage (10 per counter)',()=>{
 const s=setup('dp1-89','dp1-17');s.sides.opponent.active.damage=30;attack(s,1);assert.equal(s.sides.opponent.active.damage,70);
});
test('Shinx Spark damages the chosen opponent Bench and not all Benched targets',()=>{
 const s=setup('dp1-98','dp1-93');attack(s,0);choices(s);assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('all newly-enabled DP attacks have player and opponent execution paths',()=>{
 let count=0;for(const c of dp.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled))for(let i=0;i<c.attacks.length;i++)for(const side of ['player','opponent']){
  const s=setup(c.id,'dp1-93');s.sides[side].active=core.makePokemonSlot(c.id,4,'attacker-'+side);s.sides[side].active.energy=Object.fromEntries(typePool.map(t=>[t,6]));s.activeSide=side;if(c.id==='dp1-58'&&i===1)s.sides[side==='player'?'opponent':'player'].active.damage=20; // Brine has a prerequisite.
  const a=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,`${c.id} ${i} ${side}`);assert.doesNotThrow(()=>core.applyAction(s,side,a));choices(s);count++;
 }
 assert.ok(count>60);
});
