'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const dir='../app/src/main/assets/';
const core=require(dir+'tcgp-battle-core.js'),db=require(dir+'tcg-classic-battle-data.js'),pl=require(dir+'tcg-classic-platinum.js'),ai=require(dir+'tcg-classic-opponents.js');
const loan=ai.generate({sets:['dp5'],type:'Grass',seed:45});assert.ok(loan.ok);
const battle=()=>{
  const state=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:75,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Psychic'],opponentEnergyTypes:['Grass','Fire','Water','Psychic']});
  state.phase='battle';state.turnNumber=10;state.activeSide='player';
  for(const side of ['player','opponent']){const ss=state.sides[side];ss.turnCount=6;ss.bench=[];ss.hand=[];ss.discard=[];ss.lostZone=[];ss.energyDiscard={};}
  state.sides.player.active=core.makePokemonSlot('pl1-3',3,'player-active');
  state.sides.opponent.active=core.makePokemonSlot('pl1-70',3,'opponent-active');
  return state;
};
const bench=(s,side,id)=>{const ss=s.sides[side],p=core.makePokemonSlot(id,3,id+'-'+ss.bench.length);p.benchSlot=ss.bench.length;ss.bench.push(p);return p;};
const choose=(s,match)=>{assert.equal(s.phase,'effectChoice','expected choice prompt');const a=core.legalActions(s,s.choiceSide).find(match||(()=>true));assert.ok(a,'missing choice action');core.applyAction(s,s.choiceSide,a);return a;};

test('Platinum completion catalogue retains all 133 unique prints and no unresolved runtime effect types',()=>{
  assert.equal(pl.CARDS.length,133);assert.equal(pl.CARDS.filter(c=>c.battleEnabled).length,133);
  const ids=new Set(pl.CARDS.map(c=>c.id));assert.equal(ids.size,133);
  for(const n of ['1','47','94','104','105','110','116','117','118','119','120','121','122','123','124','125','126','127','130','SH4','SH5','SH6'])assert.ok(ids.has('pl1-'+n));
});
test('Power Spray is NOT a playable own-turn Trainer; opponent can interrupt a Poké-Power with three SP',()=>{
  const s=battle();const opp=s.sides.opponent,owner=s.sides.player;
  opp.active=core.makePokemonSlot('pl1-17',2,'sp1');bench(s,'opponent','pl1-12');bench(s,'opponent','pl1-47');
  opp.hand=[{uid:'spray',cardId:'pl1-117'}];owner.active=core.makePokemonSlot('pl1-3',2,'blaziken');
  const attack=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='pl1-3');assert.ok(attack);
  core.applyAction(s,'player',attack);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
  choose(s,a=>a.choiceOption===1);
  assert.ok(!opp.hand.length);assert.ok(opp.discard.some(r=>r.cardId==='pl1-117'));
  assert.ok(!s.sides.opponent.active.conditions?.burn);
  assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='pl1-117'));
});
test('Invisible Tentacles requires a real hand discard before opponents attack; handless attack fails',()=>{
  const s=battle();s.sides.opponent.active=core.makePokemonSlot('pl1-124',2,'giratina');
  s.sides.player.active=core.makePokemonSlot('pl1-70',2,'attacker');s.sides.player.active.energy={Fire:3,Grass:3};
  s.sides.player.hand=[{uid:'discard-this',cardId:'pl1-96'}];
  const atk=core.legalActions(s,'player').find(a=>a.type==='attack');assert.ok(atk);
  core.applyAction(s,'player',atk);assert.equal(s.phase,'effectChoice');
  choose(s,a=>a.choiceHandIndex===0);
  assert.ok(s.sides.player.discard.some(r=>r.uid==='discard-this'));
  assert.ok(s.log.some(x=>x.type==='platinumInvisibleTentacles'));
});
test('Ampharos Damage Bind suppresses Powers only on damaged Pokémon',()=>{
  const s=battle();s.sides.opponent.active=core.makePokemonSlot('pl1-1',2,'ampharos');
  s.sides.player.active=core.makePokemonSlot('pl1-3',2,'blaziken');
  assert.ok(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='pl1-3'));
  s.sides.player.active.damage=10;
  assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='pl1-3'));
});
test('Platinum Grass LV.X Thankfulness +40 HP is team-wide but excludes Shaymin',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-15',2,'shaymin');
  const grass=bench(s,'player','pl1-103');
  const orig=core.maxHp(s,'player',grass);
  bench(s,'player','pl1-126');
  assert.equal(core.maxHp(s,'player',grass),orig+40);
  assert.equal(core.maxHp(s,'player',s.sides.player.active),db.cardById('pl1-15').hp);
});
test('Energy Gain cannot attach to non-SP Pokémon, and can attach to SP',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-17',2,'weavile-sp');
  bench(s,'player','pl1-70');s.sides.player.hand=[{uid:'gain',cardId:'pl1-116'}];
  const picks=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='pl1-116');
  assert.equal(picks.length,1);assert.equal(picks[0].target,'active');
});

test('Broken-space Blow sends knocked-out Pokémon and attached Energy to the Lost Zone, not discard',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-27',2,'giratina-basic');
  s.sides.player.active.energy={Psychic:4,Colorless:2};
  s.sides.opponent.active=core.makePokemonSlot('pl1-70',2,'ko-target');
  s.sides.opponent.active.energy={Fire:2};s.sides.opponent.active.damage=45;
  bench(s,'opponent','pl1-96');
  const atk=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);
  assert.ok(atk,'Broken-space Blow should be available');core.applyAction(s,'player',atk);
  const lost=s.sides.opponent.lostZone;
  assert.ok(lost.some(r=>r.cardId==='pl1-70'),'KO Pokémon should be in Lost Zone');
  assert.ok(lost.some(r=>r.cardId==='base1-98'),'attached Fire Energy is in Lost Zone');
  assert.ok(!s.sides.opponent.discard.some(r=>r.cardId==='pl1-70'),'no ordinary discard for Lost Zone KO');
});

test('Cheerful Voice ends this turn and boosts Ludicolo only on its next turn',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-34',3,'singing-ludicolo');
  s.sides.player.active.energy={Water:2,Grass:3,Colorless:2};
  s.sides.opponent.active=core.makePokemonSlot('pl1-70',3,'dummy');
  const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='pl1-34');assert.ok(a);
  core.applyAction(s,'player',a);assert.equal(s.activeSide,'opponent');assert.equal(s.turnNumber,11);
  core.applyAction(s,'opponent',core.legalActions(s,'opponent').find(a=>a.type==='endTurn'));
  assert.equal(s.turnNumber,12);assert.equal(s.activeSide,'player');
  const atk=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(atk);
  core.applyAction(s,'player',atk);
  assert.ok(s.log.some(x=>x.type==='platinumCheerfulVoice'&&x.bonus===60));
});

test('Psychic Connect moves one Psychic Energy from Bench to Active without destination ambiguity',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-70',3,'recipient');
  const garde=bench(s,'player','pl1-8');garde.energy={Psychic:2};
  const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='pl1-8');assert.ok(a);
  core.applyAction(s,'player',a);
  choose(s,a=>a.choiceBenchIndex===garde.benchSlot);
  choose(s,a=>a.choiceOption===0);
  assert.equal(s.sides.player.active.energy.Psychic,1);
  assert.equal(garde.energy.Psychic,1);
});

test('Platinum Fossil Stone reactions are handled as real active defenders',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-70',3,'attacker');s.sides.player.active.energy={Fire:3};
  s.sides.opponent.active=core.makePokemonSlot('pl1-119',3,'armor');
  const atk=core.legalActions(s,'player').find(a=>a.type==='attack');assert.ok(atk);
  core.applyAction(s,'player',atk);
  assert.ok(s.log.some(x=>x.type==='coin'&&x.reason==='Armor Stone'));
});
