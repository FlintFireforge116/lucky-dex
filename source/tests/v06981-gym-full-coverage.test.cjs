'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const G=require(path.join(assets,'tcg-classic-gym-heroes.js'));
const FX=require(path.join(assets,'tcgp-battle-effects.js'));
test('all 126 Gym Heroes non-Basic-Energy prints have executable rule definitions',()=>{
  assert.equal(G.CARDS.length,132);
  const unfinished=G.CARDS.filter(c=>!c.basicEnergy&&!c.battleEnabled);
  assert.deepEqual(unfinished.map(c=>`${c.number} ${c.name}: ${c.support.reasons.join(', ')}`),[]);
  for(const c of G.CARDS.filter(c=>!c.basicEnergy)){
    if(c.kind==='pokemon')assert.ok(c.attacks?.length>0,`missing attacks on ${c.id}`);
    if(c.kind==='trainer')assert.ok(c.effect&&FX.supportsEffect(c.effect),`missing trainer effect on ${c.id}`);
    for(const a of c.attacks||[])assert.ok(FX.supportsEffect(a.effect),`unsupported attack ${c.id} ${a.name}`);
    for(const a of c.abilities||[])assert.ok(FX.supportsEffect(a.effect),`unsupported power ${c.id} ${a.name}`);
  }
});
test('Gym Heroes Basic Energy remains in the separate Zone',()=>{
  assert.equal(G.CARDS.filter(c=>c.basicEnergy).length,6);
  assert.ok(G.CARDS.filter(c=>c.basicEnergy).every(c=>!c.deckEligible));
});
const Core=require(path.join(assets,'tcgp-battle-core.js'));
const Decks=require(path.join(assets,'tcg-classic-decks.js'));
function battle(seed=8101){const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK,opponentDeck:Decks.LOANER_DECK,seed,playerEnergyTypes:['Grass','Psychic'],opponentEnergyTypes:['Fighting']});s.phase='battle';s.activeSide='player';s.turnNumber=12;s.sides.player.turnCount=7;s.sides.opponent.turnCount=6;return s;}
function trainer(s,id){const ref={uid:'gym-trainer-'+id,cardId:id};s.sides.player.hand.push(ref);const a=Core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId===id);assert.ok(a,`${id} missing Trainer action`);Core.applyAction(s,'player',a);return s;}
function choose(s,pick){const options=Core.legalActions(s,s.choiceSide);assert.ok(options.length,`missing choices: ${JSON.stringify(s.pendingChoice)}`);const a=pick(options);assert.ok(a);Core.applyAction(s,s.choiceSide,a);return s;}
test('Erika lets each player independently choose to draw zero to three cards',()=>{
 const s=battle();const p=s.sides.player,o=s.sides.opponent;const before=[p.hand.length,o.hand.length];trainer(s,'gym1-100');
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 const choices=Core.legalActions(s,'player');assert.equal(choices.filter(x=>x.type==='effectChoice').length,4);
 choose(s,a=>a.find(x=>x.choiceOption===1));assert.equal(s.choiceSide,'opponent');
 choose(s,a=>a.find(x=>x.choiceOption===0));
 assert.equal(s.phase,'battle');assert.equal(p.hand.length,before[0]+1);assert.equal(o.hand.length,before[1]);
});
test('Blaine Quiz uses an explicit coin-flip adaptation and printed two-card draw outcome',()=>{
 const s=battle();const ss=s.sides.player,op=s.sides.opponent;ss.hand.push({uid:'quiz-bulba',cardId:'base1-44'});
 const before=[ss.hand.length,op.hand.length];
 trainer(s,'gym1-97');assert.equal(s.phase,'effectChoice');
 const hand=Core.legalActions(s,'player');assert.ok(hand.some(x=>x.choiceCardId==='base1-44'));
 choose(s,a=>a.find(x=>x.choiceCardId==='base1-44'));
 assert.equal(s.phase,'battle');
 assert.equal(ss.hand.length+op.hand.length,before[0]+before[1]+2);
 assert.ok(s.log.some(x=>x.rule==='blainesQuiz'&&x.quizAdaptation==='coinFlip'));
 assert.ok(s.log.some(x=>x.type==='coin'&&x.reason==='blainesQuiz'));
 const actual=G.CARDS.find(c=>c.id==='gym1-97');assert.match(actual.text,/coin/i);
});
test('new Gym Stadiums, Gym protection and alternate Energy stay executable',()=>{
 const s=battle();s.stadium={uid:'stadium',cardId:'gym1-104',ownerSide:'opponent'};
 s.sides.player.active=Core.makePokemonSlot('gym1-42',0,'dratini');s.sides.player.active.energy={Colorless:3};
 s.sides.opponent.active=Core.makePokemonSlot('base1-7',0,'hitmonchan');s.sides.opponent.active.energy={Fighting:3};
 // Rocket Gym adds one Colorless to retreat costs, without preventing attacks.
 assert.ok(Core.legalActions(s,'player').some(x=>x.type==='attack'));
});
test('Good Manners lets player choose which Basic Pokémon to search after revealing no Basics in hand',()=>{
 const s=battle();const ss=s.sides.player;ss.hand=[];ss.deck=[{uid:'search1',cardId:'gym1-90'},{uid:'search2',cardId:'gym1-81'}, {uid:'search3',cardId:'gym1-83'}];
 trainer(s,'gym1-111');assert.equal(s.phase,'effectChoice','Gym Trainer searches should present a card choice');
 assert.equal(s.pendingChoice.kind,'deckCard');
 const found=Core.legalActions(s,'player').find(x=>x.choiceCardId==='gym1-81');assert.ok(found);
 Core.applyAction(s,'player',found);assert.ok(ss.hand.some(x=>x.cardId==='gym1-81'));
});
test('Rocket Minion offers a target Bench Pokémon if both coin flips are heads',()=>{
 const s=battle();const ss=s.sides.opponent;ss.bench=[Core.makePokemonSlot('gym1-81',1,'b1'),Core.makePokemonSlot('gym1-83',1,'b2')];ss.bench.forEach((slot,i)=>slot.benchSlot=i);
 const ctx={...Core.effectContext(s,'player'),random:()=>0.1};FX.applyEffect({type:'gymRule',rule:'rocketMinion'},ctx);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 assert.equal(s.pendingChoice.kind,'pokemon');
 const pick=Core.legalActions(s,'player').find(x=>x.choiceCardId==='gym1-83');assert.ok(pick);
 Core.applyAction(s,'player',pick);assert.ok(ss.hand.some(ref=>ref.cardId==='gym1-83'));
});
test('Sabrina ESP attaches to a named Sabrina Pokémon and expires at end of turn',()=>{
 const s=battle(),ss=s.sides.player;ss.active=Core.makePokemonSlot('gym1-91',1,'abra');ss.active.energy={Psychic:3};
 trainer(s,'gym1-117');assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.find(x=>x.choiceTarget==='active'));
 assert.ok(ss.active.temporaryTrainers.some(x=>x.cardId==='gym1-117'));
 Core.endTurn(s);assert.ok(!ss.active.temporaryTrainers?.some(x=>x.cardId==='gym1-117'));
});
