const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
const deck=data.BEGINNER_IVYSAUR_DECK;
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

function lastOf(state,type){return [...state.log].reverse().find(e=>e.type===type);}

test('core logs visible placement, Energy, Trainer and attack actions with enough context to narrate them',()=>{
  const setup=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:931,firstSide:'player',manualPlayerSetup:true});
  let i=setup.sides.player.hand.findIndex(ref=>data.cardById(ref.cardId)?.stage==='Basic');
  core.applyAction(setup,'player',{type:'setupActive',handIndex:i});
  assert.equal(lastOf(setup,'setupActive').side,'player');

  const battle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:932,firstSide:'player'});
  battle.sides.player.energyAvailable=true;battle.sides.player.energyUsed=false;
  core.applyAction(battle,'player',{type:'attach',target:'active'});
  const attach=lastOf(battle,'attach');
  assert.equal(attach.side,'player');assert.equal(attach.target,'active');assert.equal(attach.energyType,'Grass');

  battle.sides.player.hand=[{uid:'ball-log',cardId:'BASIC-POKE-BALL'}];
  battle.sides.player.deck=[{uid:'basic-log',cardId:'A1-014'}];
  core.applyAction(battle,'player',{type:'trainer',handIndex:0,cardId:'BASIC-POKE-BALL'});
  assert.equal(lastOf(battle,'trainer').cardId,'BASIC-POKE-BALL');

  const attackBattle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:933,firstSide:'player'});
  attackBattle.sides.player.active=core.makePokemonSlot('A1-029',0);attackBattle.sides.player.active.energy={Grass:1};
  core.applyAction(attackBattle,'player',{type:'attack',attackIndex:0});
  const attack=lastOf(attackBattle,'attack');
  assert.equal(attack.side,'player');assert.equal(attack.attack,'Blot');assert.equal(typeof attack.damage,'number');
});

test('action summaries clearly distinguish CPU and player actions',()=>{
  assert.match(ui.actionEventText({type:'attack',side:'opponent',cardId:'A1-014',attack:'Peck',damage:20}),/CPU.*Peck.*20/i);
  assert.match(ui.actionEventText({type:'attack',side:'player',cardId:'A1-029',attack:'Blot',damage:10}),/You.*Blot.*10/i);
  assert.match(ui.actionEventText({type:'trainer',side:'opponent',cardId:'BASIC-POKE-BALL'}),/CPU.*Pok.*Ball/i);
  assert.match(ui.actionEventText({type:'bench',side:'player',cardId:'A1-014',benchIndex:2}),/You.*Bench 3/i);
  assert.match(ui.actionEventText({type:'promote',side:'player',cardId:'A1-014',benchIndex:1}),/You.*Active/i);
});

test('CPU turn UI uses one-action scheduling rather than resolving the whole turn invisibly',()=>{
  const src=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(src,/ai\.chooseAction\(/);
  assert.doesNotMatch(src,/ai\.runTurn\(currentBattle/);
  assert.match(src,/tcgp-live-action-event/);
});
