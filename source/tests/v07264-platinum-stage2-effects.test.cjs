'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path='../app/src/main/assets/';
const core=require(path+'tcgp-battle-core.js'),fx=require(path+'tcgp-battle-effects.js'),
  data=require(path+'tcg-classic-battle-data.js'),cpu=require(path+'tcg-classic-opponents.js');
const deck=cpu.generate({sets:['dp5'],type:'Grass',seed:49});assert.equal(deck.ok,true);
function battle(){
  const state=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,
    seed:19,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water'],opponentEnergyTypes:['Grass','Fire','Water']});
  state.phase='battle';state.turnNumber=10;state.activeSide='player';
  for(const side of ['player','opponent']){const s=state.sides[side];s.turnCount=6;s.bench=[];s.hand=[];s.supporterUsed=false;s.handEnergyUsed=false;s.energyUsed=false;}
  state.sides.player.active=core.makePokemonSlot('pl1-96',2,'owner');
  state.sides.opponent.active=core.makePokemonSlot('pl1-70',2,'foe');
  return state;
}
function action(state,type,cardId){return core.legalActions(state,'player').find(x=>x.type===type&&(cardId==null||x.cardId===cardId));}
function perform(state,type,cardId){const a=action(state,type,cardId);assert.ok(a,`${type} ${cardId||''} not legal`);core.applyAction(state,'player',a);return a;}
function choice(state,match=()=>true){assert.equal(state.phase,'effectChoice','choice not presented');const legal=core.legalActions(state,state.choiceSide),hit=legal.find(match);assert.ok(hit,'missing selectable choice');core.applyAction(state,state.choiceSide,hit);return hit;}
function bench(state,id,side='player'){const s=state.sides[side],slot=core.makePokemonSlot(id,2,id+'-uid-'+s.bench.length);slot.benchSlot=s.bench.length;s.bench.push(slot);return slot;}

test('Platinum: Rainbow Energy is exactly ONE wild Energy and places ten damage when attached',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-70',2,'starter');
  s.sides.player.hand=[{uid:'r1',cardId:'pl1-121'}];perform(s,'attachSpecial','pl1-121');
  const energy=core.effectiveEnergy(s,'player',s.sides.player.active);
  assert.equal(energy.Miracle,1);assert.equal(s.sides.player.active.damage,10);
  const legal=core.legalActions(s,'player').filter(x=>x.type==='attack').map(x=>x.attackIndex);
  assert.deepEqual(legal,[0],'a single Rainbow can pay Bite, not Fire Punch (two total Energy)');
});

test('Platinum: Broken Time-Space allows same-turn and first-turn evolution; normal field does not',()=>{
  const s=battle();s.sides.player.turnCount=1;
  s.sides.player.hand=[{uid:'worm',cardId:'pl1-103'},{uid:'silcoon',cardId:'pl1-63'}];
  perform(s,'bench','pl1-103');
  assert.equal(core.legalActions(s,'player').some(a=>a.type==='evolve'&&a.cardId==='pl1-63'),false);
  s.stadium={uid:'bt',cardId:'pl1-104',ownerSide:'player'};
  const evo=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='pl1-63');
  assert.ok(evo,'Broken Time-Space must bypass both timing restrictions');
  core.applyAction(s,'player',evo);
  assert.equal(s.sides.player.bench[0].cardId,'pl1-63');
});

test('Platinum: Miasma Valley damages only non-Grass/non-Psychic hand-bench Basics',()=>{
  const s=battle();s.stadium={uid:'valley',cardId:'pl1-111',ownerSide:'opponent'};
  for(const [id,expected] of [['pl1-70',20],['pl1-15',0],['pl1-75',0]]){
    const ref={uid:id+'-hand',cardId:id};s.sides.player.hand.push(ref);
    const a=action(s,'bench',id);assert.ok(a,id+' cannot be benched');core.applyAction(s,'player',a);
    const mon=s.sides.player.bench.find(b=>b?.cardId===id);assert.ok(mon,id+' not on bench');assert.equal(mon.damage,expected,id);
  }
});

test('Platinum: Galactic HQ places exactly 20 damage on every hand evolution',()=>{
  const s=battle();s.stadium={uid:'hq',cardId:'pl1-106',ownerSide:'opponent'};
  s.sides.player.active=core.makePokemonSlot('pl1-103',2,'wurmple');s.sides.player.active.playedOnSideTurn=2;
  s.sides.player.hand=[{uid:'cascoon',cardId:'pl1-44'}];
  perform(s,'evolve','pl1-44');assert.equal(s.sides.player.active.damage,20);
  assert.ok(s.log.some(x=>x.stadium==='pl1-106'&&x.amount===20));
});

test('Platinum: Crobat G Flash Bite is optional and places one targeted damage counter',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-47',2,'crobat');
  const second=bench(s,'pl1-70','opponent');
  const context=core.effectContext(s,'player',{},s.sides.player.active);
  fx.applyEffect(data.cardById('pl1-47').abilities[0].effect,context);
  assert.equal(s.phase,'effectChoice');
  choice(s,a=>a.choiceTarget==='bench');
  assert.equal(second.damage,10);
  assert.equal(s.sides.opponent.active.damage,0);
});

test('Platinum: Happiny Baby Evolution turns a physical Chansey from hand into its evolution',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-76',2,'happiny');
  s.sides.player.active.damage=20;s.sides.player.hand=[{uid:'chansey-hand',cardId:'pl1-69'}];
  const a=action(s,'ability','pl1-76');assert.ok(a);core.applyAction(s,'player',a);
  choice(s,x=>x.choiceCardId==='pl1-69');
  assert.equal(s.sides.player.active.cardId,'pl1-69');assert.equal(s.sides.player.active.damage,0);
  assert.deepEqual(s.sides.player.active.stack,['pl1-76','pl1-69']);
});

test('Platinum: Skuntank G Poison Structure requires Stadium and excludes Pokémon SP',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-94',2,'skuntank');
  s.sides.player.active.energy={Darkness:2};
  assert.ok(!s.stadium);perform(s,'ability','pl1-94');
  assert.equal(!!s.sides.opponent.active.conditions.poison,false);
  s.stadium={uid:'arena',cardId:'pl1-104',ownerSide:'player'};
  // Power can only be used once per turn; advance artificial test turn.
  s.turnNumber++;s.sides.player.turnCount++;
  perform(s,'ability','pl1-94');
  assert.ok(s.sides.opponent.active.conditions.poison,'normal opposing active gets Poisoned');
  assert.equal(!!s.sides.player.active.conditions.poison,false,'SP active must be exempt');
});

test('Platinum: Vulpix Reheat discards physical Energy and draws two per card, no phantom Energy',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-102',2,'vulpix');
  s.sides.player.hand=[{uid:'firehand',cardId:'dp1-124'},{uid:'waterhand',cardId:'dp1-125'}];
  s.sides.player.deck=[{uid:'a',cardId:'pl1-96'},{uid:'b',cardId:'pl1-70'},{uid:'c',cardId:'pl1-75'},{uid:'d',cardId:'pl1-15'}];
  const a=action(s,'attack','pl1-102');assert.ok(a);core.applyAction(s,'player',a);
  choice(s,x=>x.choiceCardId==='dp1-124');
  assert.equal(s.sides.player.energyDiscard.Fire,1);
  assert.equal(s.sides.player.hand.length,3,'one remaining physical Energy and two drawn cards');
  assert.equal(s.sides.player.deck.length,2);
  choice(s,x=>x.choiceCardId==='dp1-125');
  assert.equal(s.sides.player.energyDiscard.Water,1);
  assert.equal(s.sides.player.hand.length,4);
  assert.equal(s.sides.player.deck.length,0);
});

test('Platinum: Looker Investigation lets attacker select either hand and draw 0-5',()=>{
  const s=battle();s.sides.player.hand=[{uid:'s',cardId:'pl1-109'},{uid:'d',cardId:'pl1-96'}];
  s.sides.opponent.hand=[{uid:'o1',cardId:'pl1-70'},{uid:'o2',cardId:'pl1-75'}];
  s.sides.opponent.deck=[{uid:'fresh',cardId:'pl1-15'}];
  perform(s,'trainer','pl1-109');
  choice(s,a=>a.choiceOption===1); // pick the opponent
  choice(s,a=>a.choiceOption===0); // draw zero
  assert.equal(s.sides.opponent.hand.length,0);
  assert.equal(s.sides.opponent.deck.length,3);
});

test('Platinum: PlusPower expires at end of owner turn',()=>{
  const s=battle();s.sides.player.hand=[{uid:'pp',cardId:'pl1-112'}];
  perform(s,'trainer','pl1-112');
  assert.equal(s.sides.player.active.temporaryTrainers?.length,1);
  core.endTurn(s);
  assert.equal(s.sides.player.active.temporaryTrainers?.length,0);
  assert.ok(s.sides.player.discard.some(r=>r.cardId==='pl1-112'));
});

test('Platinum: Energy Stream lets the owner choose and attach a discarded Basic Energy',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-23',2,'dialga');
  s.sides.player.energyDiscard={Fire:1,Water:2};
  const ref={uid:'physical-energy',cardId:'dp1-124'};s.sides.player.discard.push(ref);
  fx.applyEffect({type:'neoRule',rule:'pl1:energyStream'},core.effectContext(s,'player',{},s.sides.player.active));
  assert.equal(s.phase,'effectChoice');
  choice(s,x=>x.choiceLabel?.includes('Water'));
  assert.equal(s.sides.player.active.energy.Water,1);
  assert.equal(s.sides.player.energyDiscard.Water,1);
  assert.equal(s.sides.player.energyDiscard.Fire,1);
  assert.ok(s.sides.player.discard.some(r=>r.uid===ref.uid));
});

test('Platinum: Life Herb flips once then selects any friendly Pokémon to cure and heal 60',()=>{
  const s=battle();s.sides.player.active.damage=40;s.sides.player.active.conditions={poison:{amount:10}};
  const alt=bench(s,'pl1-15');alt.damage=50;alt.conditions={sleep:true};
  const ctx=core.effectContext(s,'player',{},s.sides.player.active);ctx.random=()=>0.1;
  fx.applyEffect(data.cardById('pl1-108').effect,ctx);
  assert.equal(s.phase,'effectChoice');
  choice(s,x=>x.choiceTarget==='bench');
  assert.equal(alt.damage,0);assert.deepEqual(alt.conditions,{});
  assert.equal(s.sides.player.active.damage,40);
  assert.ok(s.log.some(e=>e.type==='coin'&&e.reason==='Life Herb'&&e.heads===true));
});

test('Platinum: Hospitality chooses new opposing Active and heals that Pokémon, not old Active',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-76',2,'happiny');
  const newActive=bench(s,'pl1-75','opponent');newActive.damage=30;
  s.sides.opponent.active.damage=40;
  fx.applyEffect(data.cardById('pl1-76').attacks[0].effect,core.effectContext(s,'player',{},s.sides.player.active));
  assert.equal(s.phase,'effectChoice');
  choice(s,x=>x.choiceTarget==='bench');
  assert.equal(s.sides.opponent.active.cardId,'pl1-75');
  assert.equal(s.sides.opponent.active.damage,10);
  assert.equal(s.sides.opponent.bench[0].cardId,'pl1-70');
  assert.equal(s.sides.opponent.bench[0].damage,40);
});

test('Platinum: PlusPower adds exactly ten damage to the attached Pokémon attack',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-70',2,'chimchar');s.sides.player.active.energy={Colorless:1};
  s.sides.player.hand=[{uid:'boost',cardId:'pl1-112'}];perform(s,'trainer','pl1-112');
  const a=action(s,'attack','pl1-70');assert.ok(a);core.applyAction(s,'player',a);
  assert.equal(s.sides.opponent.active.damage,20);
});

test('Platinum: Dialga Time Aura blocks opposing Active evolution but not Bench evolution',()=>{
  const s=battle();s.sides.opponent.active=core.makePokemonSlot('pl1-6',2,'time-aura');
  s.sides.player.active=core.makePokemonSlot('pl1-103',2,'worm-active');s.sides.player.active.playedOnSideTurn=2;
  bench(s,'pl1-103').playedOnSideTurn=2;
  s.sides.player.hand=[{uid:'silcoon',cardId:'pl1-63'},{uid:'cascoon',cardId:'pl1-44'}];
  const e=core.legalActions(s,'player').filter(a=>a.type==='evolve');
  assert.ok(e.some(x=>x.target==='bench'));
  assert.ok(!e.some(x=>x.target==='active'));
  s.sides.opponent.active.abilitySuppressed=true;
  assert.ok(core.legalActions(s,'player').some(x=>x.type==='evolve'&&x.target==='active'));
});

test('Platinum: Dialga Metal Burn discards ALL Metal including Rainbow Energy, not unrelated Energy',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-6',2,'metal-dialga');
  s.sides.player.active.energy={Metal:3,Fire:1};
  s.sides.player.active.specialEnergy=[{uid:'r',cardId:'pl1-121'}];
  const burn=action(s,'attack','pl1-6');assert.ok(burn);core.applyAction(s,'player',burn);
  assert.equal(s.sides.player.active.energy.Metal,0);
  assert.equal(s.sides.player.active.energy.Fire,1);
  assert.equal(s.sides.player.energyDiscard.Metal,3);
  assert.equal(s.sides.player.active.specialEnergy.length,0);
  assert.ok(s.sides.player.discard.some(ref=>ref.cardId==='pl1-121'));
});

test('Platinum: Bastiodon Metal Trait heals 10 between turns only when Tool attached and Body active',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-20',2,'bastiodon');
  s.sides.player.active.damage=40;core.checkup(s);
  assert.equal(s.sides.player.active.damage,40,'without tool cannot heal');
  s.sides.player.active.tool={uid:'tool-1',cardId:'pl1-110'};
  core.checkup(s);assert.equal(s.sides.player.active.damage,30);
  s.sides.player.active.abilitySuppressed=true;core.checkup(s);
  assert.equal(s.sides.player.active.damage,30,'suppressed Body cannot heal');
});

test('Platinum: Blissey Nurse Call discards hand card and heals one chosen teammate, shared once-per-turn',()=>{
  const s=battle();s.sides.player.active=core.makePokemonSlot('pl1-22',2,'blissey-one');
  const second=bench(s,'pl1-22');const injured=bench(s,'pl1-70');injured.damage=30;
  s.sides.player.hand=[{uid:'spare',cardId:'pl1-96'},{uid:'energy',cardId:'dp1-124'}];
  const power=action(s,'ability','pl1-22');assert.ok(power);core.applyAction(s,'player',power);
  choice(s,x=>x.choiceCardId==='pl1-96');
  choice(s,x=>x.choiceCardId==='pl1-70');
  assert.equal(injured.damage,10);
  assert.ok(s.sides.player.discard.some(r=>r.uid==='spare'));
  assert.equal(core.legalActions(s,'player').filter(x=>x.type==='ability'&&x.cardId==='pl1-22').length,0,
    'a second Blissey may not use Nurse Call in same turn');
  assert.equal(second.cardId,'pl1-22');
});

test('Platinum: Dugtrio Sinkhole puts 20 counters on opponent Pokémon after it retreats to Bench',()=>{
  const s=battle();s.sides.opponent.active=core.makePokemonSlot('pl1-24',2,'dugtrio');
  s.sides.player.active=core.makePokemonSlot('pl1-70',2,'retreating');s.sides.player.active.energy={Colorless:4};
  bench(s,'pl1-15');
  const a=action(s,'retreat');assert.ok(a,'no legal retreat available');core.applyAction(s,'player',a);
  const outgoing=s.sides.player.bench.find(p=>p.uid==='retreating');assert.ok(outgoing);
  assert.equal(outgoing.damage,20);
  assert.equal(s.sides.player.active.damage,0);
  assert.ok(s.log.some(e=>e.type==='platinumSinkhole'&&e.amount===20));
});

for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
  test(`Platinum CPU ${difficulty} takes discarded Energy from Energy Stream instead of Skip`,()=>{
    const s=battle(),ai=require(path+'tcgp-battle-ai.js');
    s.activeSide='opponent';s.sides.opponent.active=core.makePokemonSlot('pl1-23',2,'cpu-dialga');
    s.sides.opponent.energyDiscard={Fire:2};
    fx.applyEffect({type:'neoRule',rule:'pl1:energyStream'},core.effectContext(s,'opponent',{},s.sides.opponent.active));
    assert.equal(s.phase,'effectChoice');
    const picked=ai.chooseAction(s,'opponent',difficulty,1);
    assert.ok(picked,'CPU failed to choose');assert.notEqual(picked.choiceSkip,true,'CPU discarded a useful energy recovery');
    core.applyAction(s,'opponent',picked);
    assert.equal(s.sides.opponent.active.energy.Fire,1);
    assert.equal(s.sides.opponent.energyDiscard.Fire,1);
  });
}
for(const difficulty of ['Beginner','Advanced']){
  test(`Platinum CPU ${difficulty} uses Vulpix Reheat with Energy in hand and drawable deck`,()=>{
    const s=battle(),ai=require(path+'tcgp-battle-ai.js');
    s.activeSide='opponent';s.sides.opponent.active=core.makePokemonSlot('pl1-102',2,'cpu-vulpix');
    s.sides.opponent.hand=[{uid:'discard-fire',cardId:'dp1-124'}];
    s.sides.opponent.deck=[{uid:'p1',cardId:'pl1-70'},{uid:'p2',cardId:'pl1-96'}];
    fx.applyEffect({type:'neoRule',rule:'pl1:reheat'},core.effectContext(s,'opponent',{},s.sides.opponent.active));
    assert.equal(s.phase,'effectChoice');
    const picked=ai.chooseAction(s,'opponent',difficulty,1);
    assert.ok(picked&&!picked.choiceSkip);
    core.applyAction(s,'opponent',picked);
    assert.equal(s.sides.opponent.energyDiscard.Fire,1);
    assert.equal(s.sides.opponent.hand.length,2);
  });
}
