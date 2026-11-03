'use strict';
const assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const base=require('../app/src/main/assets/tcg-classic-base1.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');

const coverage=base.coverage();
assert.deepEqual({FULL:coverage.FULL,PARTIAL:coverage.PARTIAL,UNSUPPORTED:coverage.UNSUPPORTED,total:coverage.total},{FULL:102,PARTIAL:0,UNSUPPORTED:0,total:102});
for(const n of [21,22,28,60,65,67,70]){
  const card=classic.cardById(`base1-${n}`);
  assert.equal(card?.support?.status,'FULL',`${card?.name||n} should be FULL`);
  assert.equal(card?.battleEnabled,true,`${card?.name||n} should be battle-enabled`);
}

function deck(){return classic.CLASSIC30_LOANER_DECK.slice();}
function battle(seed=6640){return core.createBattle({format:'classic',playerDeck:deck(),opponentDeck:deck(),playerEnergyTypes:['Fire','Water','Lightning'],opponentEnergyTypes:['Fire','Water','Lightning'],firstSide:'player',seed});}
function slot(id,energy={},uid=id){const x=core.makePokemonSlot(id,0,uid);x.energy={...energy};return x;}
function prep(s,side='player',turn=3){s.phase='battle';s.activeSide=side;s.turnNumber=turn;s.sides.player.turnCount=2;s.sides.opponent.turnCount=2;}

// The four missed vanilla Pokemon are real Base Set identities, not placeholders.
{
  const expected={
    28:['Growlithe','Fire',60,'RC',20],
    60:['Ponyta','Fire',40,'CC',20],
    65:['Staryu','Water',40,'W',20],
    67:['Voltorb','Lightning',40,'C',10]
  };
  for(const [n,[name,type,hp,cost,damage]] of Object.entries(expected)){
    const c=classic.cardById(`base1-${n}`);assert.equal(c.name,name);assert.equal(c.subtype,type);assert.equal(c.hp,hp);assert.equal(c.attacks[0].cost,cost);assert.equal(c.attacks[0].damage,damage);
  }
}

// Buzzap: KO Electrode, award a Prize, discard its pre-evolution/attachments,
// then attach the Electrode card itself as two Energy of the chosen type.
{
  const s=battle(6641);prep(s);
  s.sides.player.active=slot('base1-28',{},'growlithe');
  const electrode=slot('base1-21',{Lightning:1},'electrode');electrode.stack=['base1-67','base1-21'];electrode.benchSlot=0;s.sides.player.bench=[electrode];
  s.sides.opponent.active=slot('base1-67',{Lightning:1},'foe');const ob=slot('base1-26',{},'ob');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const prizesBefore=s.sides.opponent.prizesTaken;
  const buzz=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-21');assert.ok(buzz,'Buzzap should be legal from the Bench');
  core.applyAction(s,'player',buzz);assert.equal(s.phase,'effectChoice');
  let choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceTarget==='active');assert.ok(choice,'Buzzap should choose another own Pokemon');
  core.applyAction(s,'player',choice);assert.equal(s.phase,'effectChoice');
  choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceLabel==='Fire');assert.ok(choice,'Buzzap should choose an Energy type');
  core.applyAction(s,'player',choice);
  assert.equal(s.sides.player.bench.some(x=>x.uid==='electrode'),false,'Electrode leaves the board');
  assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-67'),'Voltorb pre-evolution is discarded');
  assert.equal(s.sides.player.energyDiscard.Lightning,1,'attached generated Energy is discarded');
  assert.equal(s.sides.opponent.prizesTaken,prizesBefore+1,'Buzzap counts as Knocking Out Electrode');
  const buzzEnergy=s.sides.player.active.specialEnergy.find(r=>r.cardId==='base1-21');assert.ok(buzzEnergy,'Electrode itself becomes the attached Energy card');
  assert.equal(buzzEnergy.provides.Fire,2);
  assert.equal(core.attackAvailability(s,'player',0).usable,true,'Buzzap Fire pays Growlithe Flare');
}

// Pidgeotto Mirror Move repeats the final damage Pidgeotto actually received
// during the immediately preceding opponent turn.
{
  const s=battle(6642);prep(s,'opponent',4);
  const pidgeotto=slot('base1-22',{Fire:3},'pidgeotto');s.sides.player.active=pidgeotto;const pb=slot('base1-26',{},'pb');pb.benchSlot=0;s.sides.player.bench=[pb];
  s.sides.opponent.active=slot('base1-67',{Lightning:1},'voltorb');const ob=slot('base1-26',{},'ob');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const tackle=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(tackle);core.applyAction(s,'opponent',tackle);
  assert.equal(pidgeotto.damage,20,'Lightning Tackle is doubled by Pidgeotto weakness');
  assert.equal(s.activeSide,'player');
  const mirror=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(mirror);core.applyAction(s,'player',mirror);
  assert.equal(s.sides.opponent.active.damage,20,'Mirror Move copies the final 20 damage result');
}

// Clefairy Doll is played to the Bench as a 10 HP Pokemon-like card, ignores
// the four Base Set Special Conditions, gives no Prize when KO'd, and can be
// voluntarily discarded before attacking.
{
  const s=battle(6643);prep(s);
  s.sides.player.active=slot('base1-28',{Fire:2},'growlithe');s.sides.player.bench=[];
  s.sides.opponent.active=slot('base1-7',{Fighting:1},'hitmonchan');const ob=slot('base1-26',{},'ob');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  s.sides.player.hand=[{uid:'doll-hand',cardId:'base1-70'}];
  const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='base1-70'&&a.target==='bench');assert.ok(play);core.applyAction(s,'player',play);
  const doll=s.sides.player.bench[0];assert.equal(doll.cardId,'base1-70');assert.equal(classic.cardById('base1-70').hp,10);
  for(const status of ['sleep','confusion','paralysis','poison'])assert.equal(effects.statusIsPrevented(s,doll,classic.cardById,status),true,`Doll should ignore ${status}`);
  const discard=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-70');assert.ok(discard,'Doll should be voluntarily discardable');core.applyAction(s,'player',discard);assert.equal(s.sides.player.bench.length,0);assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-70'));
}
{
  const s=battle(6644);prep(s,'opponent',4);
  s.sides.player.active=slot('base1-70',{},'doll');const pb=slot('base1-28',{},'pb');pb.benchSlot=0;s.sides.player.bench=[pb];
  s.sides.opponent.active=slot('base1-7',{Fighting:1},'hitmonchan');const ob=slot('base1-26',{},'ob');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const before=s.sides.opponent.prizesTaken;const jab=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(jab);core.applyAction(s,'opponent',jab);
  assert.equal(s.sides.opponent.prizesTaken,before,'KOing Clefairy Doll awards no Prize');
  assert.ok(s.sides.player.discard.some(r=>r.cardId==='base1-70'));
}

console.log('v0.69.64 complete Base Set coverage tests passed');

// Clefairy Doll's printed "doesn't count as a Knocked Out Pokemon" rule also
// keeps it out of KO history/counters, not merely out of Prize scoring.
{
  const s=battle(6645);prep(s,'opponent',4);
  s.sides.player.active=slot('base1-70',{},'doll-history');const pb=slot('base1-28',{},'pb-history');pb.benchSlot=0;s.sides.player.bench=[pb];
  s.sides.opponent.active=slot('base1-7',{Fighting:1},'hitmonchan-history');const ob=slot('base1-26',{},'ob-history');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const kosBefore=s.sides.player.knockoutsTaken;const jab=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);core.applyAction(s,'opponent',jab);
  assert.equal(s.sides.player.knockoutsTaken,kosBefore,'Clefairy Doll must not increment Pokemon KO history');
  assert.equal((s.sides.player.lastKnockedOutCardIds||[]).includes('base1-70'),false,'Clefairy Doll must not enter last-KO Pokemon history');
}

// Buzzap needs another Pokemon to receive Electrode, so it is not a legal
// button when Electrode is the player's only Pokemon in play.
{
  const s=battle(6646);prep(s);
  s.sides.player.active=slot('base1-21',{Lightning:3},'solo-electrode');s.sides.player.bench=[];
  s.sides.opponent.active=slot('base1-67',{Lightning:1},'foe-solo');s.sides.opponent.bench=[];
  assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='base1-21'),false,'Buzzap requires another own Pokemon');
}

// Clefairy Doll is immune to the four conditions printed on the 1999 card,
// not every Special Condition later introduced by the TCG.
{
  const s=battle(6647);prep(s);const doll=slot('base1-70',{},'doll-status');s.sides.player.active=doll;s.sides.player.bench=[];
  assert.equal(effects.statusIsPrevented(s,doll,classic.cardById,'burn'),false,'Clefairy Doll should not gain future-condition immunity');
}

// Voluntarily discarding an Active Doll immediately enters normal promotion.
{
  const s=battle(6648);prep(s);
  s.sides.player.active=slot('base1-70',{},'active-doll');const bench=slot('base1-28',{},'growlithe-bench');bench.benchSlot=0;s.sides.player.bench=[bench];
  s.sides.opponent.active=slot('base1-67',{},'opp-active');const ob=slot('base1-26',{},'opp-bench');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const discard=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-70');assert.ok(discard);core.applyAction(s,'player',discard);
  assert.equal(s.phase,'promote');assert.equal(s.promotionSide,'player');
  const promote=core.legalActions(s,'player').find(a=>a.type==='promote'&&a.benchIndex===0);assert.ok(promote);core.applyAction(s,'player',promote);assert.equal(s.sides.player.active.cardId,'base1-28');
}

// Mirror Move replays the final attack result, including a Special Condition,
// without recalculating the original attack's Weakness/Resistance.
{
  const s=battle(2);prep(s,'opponent',4);
  const pidgeotto=slot('base1-22',{Grass:3},'pidgeotto-poison');s.sides.player.active=pidgeotto;const pb=slot('base1-26',{},'pb-poison');pb.benchSlot=0;s.sides.player.bench=[pb];
  s.sides.opponent.active=slot('base1-69',{Grass:1},'weedle');const ob=slot('base1-26',{},'ob-poison');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const sting=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(sting);core.applyAction(s,'opponent',sting);
  assert.equal(pidgeotto.lastAttackResult.damage,10);assert.ok(pidgeotto.lastAttackResult.conditions.poison,'the previous final result records Poison');
  const mirror=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(mirror);core.applyAction(s,'player',mirror);
  assert.equal(s.sides.opponent.active?.lastAttackResult?.damage,10,'Mirror Move replays the recorded 10 damage result');
  assert.ok(s.sides.opponent.active?.conditions?.poison,'Mirror Move replays the recorded Poison result');
}

// Discarding Clefairy Doll also cleans up everything attached to it using the
// normal Classic discard zones.
{
  const s=battle(6649);prep(s);
  s.sides.player.active=slot('base1-28',{},'doll-cleanup-active');const doll=slot('base1-70',{Fire:1},'doll-cleanup');doll.benchSlot=0;doll.specialEnergy=[{uid:'doll-dce',cardId:'base1-96'}];s.sides.player.bench=[doll];
  s.sides.opponent.active=slot('base1-67',{},'doll-cleanup-foe');s.sides.opponent.bench=[];
  const discard=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='base1-70');assert.ok(discard);core.applyAction(s,'player',discard);
  assert.equal(s.sides.player.energyDiscard.Fire,1,'generated Basic Energy follows Doll to the Energy discard');
  assert.ok(s.sides.player.discard.some(r=>r.uid==='doll-dce'&&r.cardId==='base1-96'),'DCE follows Doll to the normal discard');
}

// A Buzzap Electrode remains one attached card while providing two units of
// its chosen type. Two such cards can pay Charizard and are discarded as two
// cards, not four synthetic Energy units.
{
  const s=battle(6650);prep(s);
  const charizard=slot('base1-4',{},'charizard-buzz');charizard.specialEnergy=[
    {uid:'buzz-fire-1',cardId:'base1-21',provides:{Fire:2},transformedPokemon:true},
    {uid:'buzz-fire-2',cardId:'base1-21',provides:{Fire:2},transformedPokemon:true}
  ];s.sides.player.active=charizard;const pb=slot('base1-28',{},'buzz-pb');pb.benchSlot=0;s.sides.player.bench=[pb];
  s.sides.opponent.active=slot('base1-2',{},'buzz-foe');const ob=slot('base1-26',{},'buzz-ob');ob.benchSlot=0;s.sides.opponent.bench=[ob];
  const availability=core.attackAvailability(s,'player',0);assert.equal(availability.usable,true,'two Fire Buzzap cards provide four Fire Energy');
  const attack=availability.actions.find(a=>a.effectSpecialEnergyUid==='buzz-fire-1')||availability.actions[0];assert.ok(attack);core.applyAction(s,'player',attack);
  assert.equal(charizard.specialEnergy.length,0,'Fire Spin discards both required Energy cards');
  assert.equal(s.sides.player.discard.filter(r=>String(r.uid||'').startsWith('buzz-fire-')).length,2,'the two Electrode cards are discarded exactly once each');
}
