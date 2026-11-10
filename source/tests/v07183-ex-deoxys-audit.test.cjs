'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const deoxys=require(path.join(A,'tcg-classic-deoxys.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const synergy=require(path.join(A,'tcg-deck-synergy.js'));
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const deck=opponent.generate({sets:['ex8'],seed:29});
assert.ok(deck.ok,deck.error);
const slot=(number,uid)=>core.makePokemonSlot('ex8-'+number,2,uid);
function battle(){
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:29,firstSide:'player',playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES});
  s.phase='battle';s.activeSide='player';s.turnNumber=9;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
  s.sides.player.active=slot(71,'own');s.sides.player.bench=[slot(72,'own-bench')];s.sides.player.bench[0].benchSlot=0;
  s.sides.opponent.active=slot(53,'foe');s.sides.opponent.bench=[slot(52,'foe-bench')];s.sides.opponent.bench[0].benchSlot=0;
  s.sides.player.active.energy={Grass:8,Fire:8,Water:8,Lightning:8,Psychic:8,Fighting:8};
  return s;
}
function choice(s, predicate){
  assert.equal(s.phase,'effectChoice','Expected a pending selection');
  const actions=core.legalActions(s,s.choiceSide),found=actions.find(predicate);
  assert.ok(found,JSON.stringify({pending:s.pendingChoice,actions}));
  core.applyAction(s,s.choiceSide,found);
  return s;
}
function trainer(s,n){
  s.sides.player.hand.unshift({uid:'ex8-trainer-'+n,cardId:'ex8-'+n});
  const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex8-'+n);
  assert.ok(action,'Trainer is legal: '+n);
  core.applyAction(s,'player',action);
  return s;
}
function attack(s,n,i){
  s.sides.player.active=slot(n,'attacking-'+n);
  s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,9]));
  const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);
  assert.ok(action,'Attack is legal: '+n+' / '+i);
  core.applyAction(s,'player',action);
  return s;
}
test('Energy Charge heads shuffles two basic Energy from Classic discard into draw deck',()=>{
  const s=battle(),p=s.sides.player;
  p.energyDiscard={Fire:2,Water:1};
  const supplyBefore=p.energySupply.length,deckBefore=p.deck.length;
  p.forceFirstCoinHeadTurn=s.turnNumber;
  trainer(s,86);
  assert.equal(s.pendingChoice?.kind,'option');
  choice(s,x=>x.choiceLabel?.includes('Fire'));
  assert.equal(s.pendingChoice?.kind,'option');
  choice(s,x=>x.choiceLabel?.includes('Water'));
  assert.equal(s.phase,'battle');
  assert.equal(p.energyDiscard.Fire,1);assert.equal(p.energyDiscard.Water,0);
  assert.equal(p.deck.length,deckBefore+2);
  assert.equal(p.energySupply.length,supplyBefore);
  const recovered=p.deck.filter(r=>r.uid.startsWith('ex8-energy-recovery-'));
  assert.deepEqual(new Set(recovered.map(r=>classic.cardById(r.cardId)?.subtype)),new Set(['Fire','Water']));
  assert.ok(recovered.every(r=>r.zoneGenerated===false));
  assert.equal(s.log.filter(x=>x.type==='ex8EnergyRecovery').length,2);
});
test('Energy Charge retrieves a discarded Special Energy card and one discarded basic Energy',()=>{
  const s=battle(),p=s.sides.player;
  p.energyDiscard={Psychic:1};
  p.discard.push({uid:'heal-energy',cardId:'ex8-94'});
  const deckBefore=p.deck.length,supplyBefore=p.energySupply.length;
  p.forceFirstCoinHeadTurn=s.turnNumber;
  trainer(s,86);
  choice(s,x=>x.choiceLabel?.includes('Heal Energy'));
  choice(s,x=>x.choiceLabel?.includes('Psychic'));
  assert.equal(s.phase,'battle');
  assert.ok(p.deck.some(r=>r.uid==='heal-energy'),'Special Energy returned to draw deck');
  assert.equal(p.deck.length,deckBefore+2);
  assert.equal(p.energySupply.length,supplyBefore);
  assert.equal(p.energyDiscard.Psychic,0);
  assert.ok(!p.discard.some(r=>r.uid==='heal-energy'));
});
test('Energy Charge recovers one discarded Energy when only one exists, and handles empty discard',()=>{
  for(const count of [0,1]){
    const s=battle(),p=s.sides.player;p.energyDiscard=count?{Fire:1}:{};
    p.forceFirstCoinHeadTurn=s.turnNumber;
    trainer(s,86);
    if(count)choice(s,x=>x.choiceLabel?.includes('Fire'));
    assert.equal(s.phase,'battle');assert.equal(p.energyDiscard.Fire||0,0);
    assert.equal(s.log.filter(x=>x.type==='ex8EnergyRecovery').length,count);
  }
});
test('EX Deoxys Camerupt takes two different basic Energy from Energy discard and attaches to chosen Pokémon',()=>{
  const s=battle(),p=s.sides.player;p.energyDiscard={Fire:1,Water:1};
  const startSupply=p.energySupply.length;
  attack(s,4,0);
  choice(s,x=>x.choiceLabel?.includes('Fire'));
  choice(s,x=>x.choiceTarget==='active');
  choice(s,x=>x.choiceLabel?.includes('Water'));
  choice(s,x=>x.choiceTarget==='bench');
  assert.equal(s.phase,'battle');
  assert.equal(p.energyDiscard.Fire,0);assert.equal(p.energyDiscard.Water,0);
  assert.equal(p.active.energy.Fire,10);
  assert.equal(p.bench[0].energy.Water,1);
  assert.equal(p.energySupply.length,startSupply,'attached Energy does not return to pool');
});
test('EX Deoxys Metagross Super Connectivity searches energyDiscard and only self-damages on recovery',()=>{
  for(const skip of [true,false]){
    const s=battle(),p=s.sides.player;p.active=slot(11,'metagross');p.energyDiscard={Psychic:1,Metal:1};
    const action=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='ex8-11');assert.ok(action);
    core.applyAction(s,'player',action);
    choice(s,x=>skip?x.choiceSkip:x.choiceLabel?.includes('Metal'));
    assert.equal(s.phase,'battle');assert.equal(p.active.energy.Metal||0,skip?0:1);
    assert.equal(p.active.damage,skip?0:10);
    assert.equal(p.energyDiscard.Metal,skip?1:0);
  }
});
test('Electrike Energy Draw searches Lightning from Energy Supply and not 30-card deck',()=>{
  const s=battle(),p=s.sides.player;
  const before=p.energySupply.filter(x=>x==='Lightning').length;
  attack(s,60,0);
  assert.equal(s.phase,'battle');
  assert.equal(p.active.energy.Lightning,10);
  assert.equal(p.energySupply.filter(x=>x==='Lightning').length,before-1);
});
test('Lady Outing chooses three distinct basic Energy types from Energy Supply into hand',()=>{
  const s=battle(),p=s.sides.player,start=p.energySupply.length;
  trainer(s,87);
  assert.equal(s.pendingChoice?.kind,'option');
  for(const type of ['Fire','Water','Psychic'])choice(s,x=>x.choiceLabel==='Find '+type+' Energy');
  assert.equal(s.phase,'battle');
  const gained=p.hand.filter(r=>r.zoneGenerated&&['Fire','Water','Psychic'].includes(classic.cardById(r.cardId)?.subtype));
  assert.equal(gained.length,3);
  assert.equal(p.energySupply.length,start-3);
  assert.deepEqual(new Set(gained.map(r=>classic.cardById(r.cardId).subtype)),new Set(['Fire','Water','Psychic']));
});
test('Altaria attacks only the active Defending Pokémon, not every Benched Pokémon',()=>{
  const s=battle();attack(s,1,0);
  assert.equal(s.sides.opponent.bench[0].damage,0);
  assert.ok(s.sides.opponent.active.damage>0);
});
test('Xatu Psyloop counts opposing Trainer cards on Bench, but not our Stadium',()=>{
  const first=battle();first.sides.opponent.active=slot(103,'sturdy-foe');first.stadium={uid:'our-stadium',cardId:'ex8-89'};first.stadiumOwner='player';attack(first,29,1);const baseline=first.sides.opponent.active.damage;
  const second=battle();second.sides.opponent.active=slot(103,'sturdy-foe');second.stadium={uid:'opposing-stadium',cardId:'ex8-89'};second.stadiumOwner='opponent';
  second.sides.opponent.active.tool={uid:'foe-tool-1',cardId:'ex8-84'};
  second.sides.opponent.bench[0].tool={uid:'foe-tool-2',cardId:'ex8-92'};
  second.sides.opponent.supporterZone=[{uid:'foe-supporter',cardId:'ex8-90'}];
  attack(second,29,1);
  assert.equal(second.sides.opponent.active.damage-baseline,120);
});
test('metadata excludes self-status and immunities from themed attack scores',()=>{
  for(const n of [9,15,31,66,83])assert.deepEqual(deoxys.cardById('ex8-'+n).deckMeta.inflicts,[],String(n));
  assert.deepEqual(deoxys.cardById('ex8-29').deckMeta.inflicts,['confusion']);
  assert.ok(synergy.pokemonThemeScore(deoxys.cardById('ex8-31'),'paralysis')===0);
  for(const n of [27,82])for(const status of ['sleep','poison','burn','paralysis'])assert.ok(synergy.metadata(deoxys.cardById('ex8-'+n)).inflicts.includes(status));
});
test('CPU/player 30-card builds remain legal after Lady Outing gains Classic Energy Zone search support',()=>{
  const owned=deoxys.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
  for(let i=0;i<12;i++){
    const player=builder.buildDeck(owned,{style:i%2?'competitive':'random',sets:['ex8'],randomSeed:i*59+11});
    const cpu=opponent.generate({sets:['ex8'],seed:i*31+3});
    for(const result of [player,cpu]){
      assert.ok(result.ok,result.error);
      assert.equal(result.cards.length,30);
      assert.equal(classic.validateDeck(result.cards).ok,true);
      assert.ok(result.cards.every(id=>deoxys.cardById(id)?.battleEnabled),'all cards must be supported by the selected set');
    }
  }
});
test('EX Deoxys Self-control / Carefree prevent only their printed Special Conditions',()=>{
  const effects=require(path.join(A,'tcgp-battle-effects.js'));
  for(const [number,immune,other] of [[31,'paralysis','poison'],[32,'confusion','sleep'],[83,'paralysis','burn']]){
    const s=battle(),target=slot(number,'immune');s.sides.opponent.active=target;
    assert.equal(effects.statusIsPrevented(s,target,classic.cardById,immune),true,number+' status protection');
    assert.equal(effects.statusIsPrevented(s,target,classic.cardById,other),false,number+' other status is allowed');
  }
});
test('Natu and Xatu Mirror Coat reflect poison from incoming attacks',()=>{
  for(const defenderNumber of [29,66]){
    const s=battle();s.sides.opponent.active=slot(defenderNumber,'mirror');
    attack(s,62,0); // Koffing's Smog always Poisons the Defending Pokémon.
    assert.ok(s.sides.opponent.active?.conditions.poison,defenderNumber+' becomes poisoned');
    assert.ok(s.sides.player.active.conditions.poison,defenderNumber+' reflects Poison to attacker');
  }
});
test('EX Deoxys Swablu Fluff coin guard blocks attacks only when damaged',()=>{
  for(const alreadyDamaged of [false,true]){
    const s=battle();s.rngState=1;s.sides.opponent.active=slot(79,'fluff');
    s.sides.opponent.active.damage=alreadyDamaged?10:0;
    attack(s,55,0); // Beldum Flip Over: no coin flips before the Fluff check.
    const last=s.log.find(x=>x.reason==='EX Deoxys Fluff');
    assert.equal(!!last,alreadyDamaged);
    if(alreadyDamaged){assert.equal(last.heads,true);assert.equal(s.sides.opponent.active.damage,10);}
    else assert.ok(s.sides.opponent.active.damage>0);
  }
});
test('Energy Charge tails leaves both discard zones untouched and never prompts',()=>{
  const s=battle(),p=s.sides.player;p.energyDiscard={Fire:2};p.discard.push({uid:'energy-on-tails',cardId:'ex8-94'});
  s.rngState=10000; // First xorshift random > 0.5, so Energy Charge lands tails.
  trainer(s,86);
  assert.equal(s.phase,'battle');
  assert.equal(p.energyDiscard.Fire,2);
  assert.ok(p.discard.some(x=>x.uid==='energy-on-tails'));
  assert.equal(s.log.filter(x=>x.type==='ex8EnergyRecovery').length,0);
  const coin=s.log.find(x=>x.reason==='EX Deoxys trainer:86');assert.equal(coin?.heads,false);
});
