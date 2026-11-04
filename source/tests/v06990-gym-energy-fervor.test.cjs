'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const classicDecks=require(path.join(assets,'tcg-classic-decks.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

function battle(){
 const s=core.createBattle({format:'classic',playerDeck:classicDecks.LOANER_DECK,opponentDeck:classicDecks.LOANER_DECK,seed:6990,playerEnergyTypes:['Fire'],opponentEnergyTypes:['Psychic']});
 s.phase='battle';s.activeSide='player';s.turnNumber=4;s.sides.player.turnCount=3;
 s.sides.player.active=core.makePokemonSlot('base1-28',2,'my-growlithe');
 return s;
}

test('All Gym Challenge Basic Energy cards have the right typed identity',()=>{
 const names={127:'Fighting',128:'Fire',129:'Grass',130:'Lightning',131:'Psychic',132:'Water'};
 for(const [number,type] of Object.entries(names)){
  const card=data.cardById(`gym2-${number}`);
  assert.equal(card.basicEnergy,true);
  assert.equal(card.subtype,type,card.id);
  assert.deepEqual(card.types,[type],card.id);
  assert.equal(card.deckEligible,false,'Classic Energy comes from the Energy Zone, not the deck');
 }
});

test('Fervor explains its separate Energy Zone adaptation while retaining printed rules',()=>{
 const card=data.cardById('gym2-124');
 assert.match(card.text,/Reveal the top three cards/);
 const rules=ui.cardRulesHtml(card);
 assert.match(rules,/Reveal the top three cards/);
 assert.match(rules,/Classic 30 adaptation:/);
 assert.match(rules,/Discard up to three cards/);
 assert.match(rules,/one Fire Energy card/);
 assert.match(rules,/without using your normal Energy Zone attachment/);
 assert.doesNotMatch(ui.cardRulesHtml(data.cardById('gym2-126')),/Classic 30 adaptation:/);
});

test('Fervor gives Fire Energy from the Zone after discarding 3, and Fire attachment remains typed',()=>{
 const s=battle(),ss=s.sides.player;
 ss.deck=[{uid:'deck1',cardId:'base1-44'},{uid:'deck2',cardId:'base1-28'},{uid:'deck3',cardId:'base1-92'},{uid:'deck4',cardId:'base1-44'}];
 ss.hand=[{uid:'fervor',cardId:'gym2-124'}];
 // Fervor can be used even after the regular Energy Zone attachment is spent.
 ss.energyUsed=true;
 const fervor=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='gym2-124');
 assert.ok(fervor,'Fervor is playable');
 core.applyAction(s,'player',fervor);
 assert.deepEqual(ss.discard.filter(r=>r.uid.startsWith('deck')).map(r=>r.uid),['deck1','deck2','deck3']);
 assert.deepEqual(ss.deck.map(r=>r.uid),['deck4']);
 const generated=ss.hand.find(r=>r.cardId==='gym2-128');
 assert.ok(generated,'Fervor should generate the Fire Energy card in hand');
 assert.equal(generated.zoneGenerated,true);
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='gym2-128'&&a.target==='active');
 assert.ok(action,'generated Energy can be attached despite having already spent regular Energy');
 core.applyAction(s,'player',action);
 assert.equal(ss.active.energy.Fire,1);
 assert.equal(ss.active.energy.Colorless||0,0);
 assert.equal(ss.active.energy.undefined||0,0);
 assert.equal(ss.hand.some(r=>r.uid===generated.uid),false);
 const html=ui._test.liveAttachedEnergyHtml({energyPool:ss.active.energy,specialEnergy:ss.active.specialEnergy});
 assert.match(html,/data-energy="Fire"/);
 assert.doesNotMatch(html,/data-energy="Colorless"/);
});
