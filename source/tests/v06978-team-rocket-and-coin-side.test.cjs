'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const src=name=>fs.readFileSync(path.join(assets,name),'utf8');
test('coin presentation follows the player who flipped, including CPU-triggered flips',()=>{
 const ui=src('tcgp-battle-ui.js'),css=src('tcgp-battle.css');
 assert.match(ui,/spawnCoinRow\(stage,entry\)[\s\S]*?entry\?\.side==='opponent'/);
 assert.match(css,/\.tcgp-present-coins\.is-opponent\s*\{[^}]*top:/);
 assert.match(css,/\.tcgp-present-coins\.is-player\s*\{[^}]*top:/);
});
test('Team Rocket has all 83 correctly numbered printed cards, with unsupported mechanics visibly gated',()=>{
 const rocket=require(path.join(assets,'tcg-classic-team-rocket.js'));
 assert.equal(rocket.CARDS.length,83);
 assert.equal(rocket.CARDS[0].name,'Dark Alakazam');
 assert.equal(rocket.CARDS[16].name,'Rainbow Energy');
 assert.equal(rocket.cardById('base5-83').name,'Dark Raichu');
 assert.ok(rocket.CARDS.every(c=>c.image.includes('/base5/')&&c.setId==='base5'&&c.support));
 assert.ok(rocket.CARDS.filter(c=>!c.battleEnabled).every(c=>c.support.reasons.length));
});
test('Team Rocket is available in Classic set pools and does not displace older sets',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
 const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
 assert.deepEqual(data.SETS.slice(0,4).map(s=>s.id),['base1','base2','base3','base5']);
 assert.ok(builder.SET_IDS.includes('base5'));
 assert.ok(opponents.SETS.includes('base5'));
 assert.ok(data.cardById('base3-45'));
 assert.equal(data.cardById('base5-51').evolvesFrom,'Rattata');
});
test('Team Rocket owned library prints map to battle card IDs and retain copy counts',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const owned=data.projectOwnedCards([
 {id:'RO-51',setId:'library:RO',_librarySetKey:'RO',number:'51',count:3,source:'tcg'},
 {id:'RO-83',setId:'library:RO',_librarySetKey:'RO',number:'83',count:1,source:'tcg'}]);
 assert.equal(owned.find(x=>x.gameplayId==='base5-51')?.quantity,3);
 assert.equal(owned.find(x=>x.gameplayId==='base5-83')?.quantity,1);
});
test('Team Rocket-only and mixed-pool CPU opponents produce legal 30-card decks',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
 for(const sets of [['base5'],['base1','base5'],['base1','base2','base3','base5']]){
   const result=opponents.generate({seed:1243,sets,includeColorless:true});
   assert.ok(result.ok,`${sets.join('+')}: ${result.error}`);
   assert.equal(result.cards.length,30);
   assert.ok(data.validateDeck(result.cards).ok);
   assert.ok(result.cards.every(id=>sets.includes(data.cardById(id).setId)));
 }
});
test('Team Rocket Dark Raichu and Dark Blastoise have real supported effects, not placeholder damage',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const core=require(path.join(assets,'tcgp-battle-core.js'));
 const decks=require(path.join(assets,'tcg-classic-decks.js'));
 const r=data.cardById('base5-83'),b=data.cardById('base5-3');
 assert.ok(r.battleEnabled&&b.battleEnabled);
 assert.equal(r.attacks[0].effect.type,'coinFlip');
 assert.equal(b.attacks[0].effect.type,'energyDamage');
 const state=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:decks.LOANER_DECK,seed:331,playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Grass']});
 state.phase='battle';state.activeSide='player';state.turnNumber=7;state.sides.player.turnCount=3;
 state.sides.player.active=core.makePokemonSlot('base5-83',0,'dark-raichu');
 state.sides.player.active.energy={Lightning:3};
 state.sides.opponent.active=core.makePokemonSlot('base1-28',0,'growlithe');
 state.sides.opponent.bench=[core.makePokemonSlot('base1-60',0,'ponyta')];state.sides.opponent.bench[0].benchSlot=0;
 const action=core.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(action,'Dark Raichu attack should be selectable');
 core.applyAction(state,'player',action);
 assert.ok(state.log.some(e=>e.type==='coin'&&e.side==='player'));
 assert.ok(state.log.some(e=>e.type==='attack'&&e.attack==='Surprise Thunder'));
});
test('Dark Charizard Continuous Fireball is playable only with per-head Fire Energy discard',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const card=data.cardById('base5-4');
 assert.ok(card.battleEnabled,'Dark Charizard should be supported');
 assert.deepEqual(card.attacks[1].effect,{type:'coinDamageByEnergy',energyType:'Fire',amount:50,discardHeads:true});
});
test('Dark Muk raises opposing Active retreat cost by two while it is Active',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const card=data.cardById('base5-41');assert.ok(card.battleEnabled);
 const power=card.abilities[0];assert.equal(power.type,'passive');assert.equal(power.activeOnly,true);
 assert.equal(power.effect.stat,'retreatCost');assert.equal(power.effect.amount,2);
});
test('Dark Dragonair searches for evolutions with a once-per-turn Power',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const card=data.cardById('base5-33');assert.ok(card.battleEnabled);
 assert.equal(card.abilities[0].oncePerTurn,true);
 assert.equal(card.abilities[0].effect.type,'searchChosen');
});
test('Continuous Fireball actually deals 50 per heads and discards precisely that many Fire Energy',()=>{
 const core=require(path.join(assets,'tcgp-battle-core.js')),decks=require(path.join(assets,'tcg-classic-decks.js'));
 const seen=[];
 for(let seed=11;seed<20;seed++){
  const state=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:decks.LOANER_DECK,seed,playerEnergyTypes:['Fire'],opponentEnergyTypes:['Grass']});
  state.phase='battle';state.activeSide='player';state.turnNumber=9;state.sides.player.turnCount=4;
  state.sides.player.active=core.makePokemonSlot('base5-4',0,'dark-charizard');state.sides.player.active.energy={Fire:3};
  state.sides.opponent.active=core.makePokemonSlot('base1-7',0,'hitmonchan');
  const a=core.legalActions(state,'player').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(a);
  core.applyAction(state,'player',a);
  const entry=state.log.filter(x=>x.type==='coin'&&x.side==='player').at(-1);assert.ok(entry);
  const n=Number(entry.heads);seen.push(n);
  assert.equal(state.sides.player.active.energy.Fire,3-n);
  assert.equal(Number(state.sides.player.energyDiscard?.Fire||0),n);
  const attack=state.log.filter(x=>x.type==='attack'&&x.side==='player').at(-1);assert.ok(attack);
  assert.equal(attack.damage,n*50,'Fighting Hitmonchan has no Fire Weakness or Resistance');
 }
 assert.ok(new Set(seen).size>=2,'test needs multiple outcomes');
});
test('Team Rocket-only CPU decks complete full Classic matches without stalling',()=>{
 const data=require(path.join(assets,'tcg-classic-battle-data.js'));
 const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
 const core=require(path.join(assets,'tcgp-battle-core.js'));
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 const deck=require(path.join(assets,'tcg-classic-decks.js'));
 for(const seed of [781,782,783,784]){
  const cpu=opponents.generate({sets:['base5'],seed,includeColorless:true});assert.ok(cpu.ok,cpu.error);
  const state=core.createBattle({format:'classic',playerDeck:deck.LOANER_DECK.slice(),opponentDeck:cpu.cards,playerEnergyTypes:['Grass','Fire'],opponentEnergyTypes:cpu.energyTypes,firstSide:'opponent',seed});
  let step=0;
  while(state.phase!=='finished'&&step<900){
   const side=state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.phase==='setup'?state.setupSide:state.activeSide;
   const action=ai.chooseAction(state,side,'Beginner',step);
   assert.ok(action,`CPU stalled: ${cpu.name} phase ${state.phase} turn ${state.turnNumber}`);
   core.applyAction(state,side,action);step++;
  }
  assert.equal(state.phase,'finished',`${cpu.name} did not finish in ${step} actions`);
 }
});
