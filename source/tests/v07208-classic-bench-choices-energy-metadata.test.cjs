'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const A='../app/src/main/assets/';
const core=require(A+'tcgp-battle-core.js'),data=require(A+'tcg-classic-battle-data.js'),cpu=require(A+'tcg-classic-opponents.js'),builder=require(A+'tcg-classic-deck-builder.js'),decks=require(A+'tcg-classic-decks.js'),ui=require(A+'tcgp-battle-ui.js'),assets=require(A+'tcgp-ui-assets.js');
const rows=data.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
function match(attackerId,type='Fire'){
 const deck=cpu.generate({sets:['ex13'],type,seed:17}).cards;
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,firstSide:'player',seed:137,playerEnergyTypes:['Fire','Metal','Psychic'],opponentEnergyTypes:['Fire','Metal','Psychic']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(attackerId,2,'pa');s.sides.player.active.energy={Fire:4,Psychic:4,Water:4,Metal:4,Fighting:4};
 s.sides.opponent.active=core.makePokemonSlot('ex13-58',2,'oa');
 for(const side of ['player','opponent'])s.sides[side].bench=[0,1].map(i=>{const p=core.makePokemonSlot('ex13-58',2,side+'b'+i);p.benchSlot=i;return p;});
 return s;
}
function attack(s,index=0){const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(a,`missing attack ${index}`);core.applyAction(s,'player',a);return s;}
function checkBenchLogs(s,targetSide,count,amount){
 const logs=s.log.filter(x=>x.type==='benchDamage'&&x.targetSide===targetSide);
 assert.equal(logs.length,count,`${targetSide}: wrong number of bench FX events: ${JSON.stringify(logs)}`);
 assert.deepEqual(logs.map(x=>x.amount),Array(count).fill(amount));
 assert.deepEqual(logs.map(x=>x.benchIndex),Array.from({length:count},(_,i)=>i));
 assert.ok(logs.every(x=>x.side==='player'&&x.sourceCardId===s.sides.player.active.cardId));
}
test('Camerupt Magnitude logs real hit animations on both Benches, not just HP',()=>{
 const s=attack(match('ex13-36'));
 assert.equal(s.sides.opponent.active.damage,20);
 for(const side of ['player','opponent']){
  assert.deepEqual(s.sides[side].bench.map(x=>x.damage),[10,10]);
  checkBenchLogs(s,side,2,10);
 }
});
test('Claydol Wide Laser logs both opponent Bench hit animations as well as Active damage',()=>{
 const s=attack(match('ex13-38','Psychic'));
 assert.equal(s.sides.opponent.active.damage,10);
 assert.deepEqual(s.sides.opponent.bench.map(x=>x.damage),[10,10]);
 checkBenchLogs(s,'opponent',2,10);
 assert.equal(s.log.filter(x=>x.type==='benchDamage'&&x.targetSide==='player').length,0);
});
test('Generic board-wide damage also emits exactly one FX event for each hit Bench slot',()=>{
 const fx=require(A+'tcgp-battle-effects.js'),s=match('ex13-36');
 fx.applyEffect({type:'damage',target:'opponentAll',amount:10},{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,attack:{name:'Board Attack'}});
 assert.equal(s.sides.opponent.active.damage,10);
 assert.deepEqual(s.sides.opponent.bench.map(p=>p.damage),[10,10]);
 checkBenchLogs(s,'opponent',2,10);
});
test('Mr Stone selection renders Psychic and Metal Basic Energy card images, but not generic two-energy choice',()=>{
 const labels=['Recover Psychic Basic Energy','Find Metal Basic Energy','Recover 2 Basic Energy from discard','Search Energy Zone for 2 Basic Energy'];
 const actions=labels.map((choiceLabel,choiceOption)=>({type:'effectChoice',choiceOption,choiceLabel}));
 ui._test.setCurrentBattleForTests({format:'classic',phase:'effectChoice',choiceSide:'player',pendingChoice:{kind:'option',options:labels},sides:{player:{},opponent:{}}},actions);
 for(const [i,type] of [[0,'Psychic'],[1,'Metal']]){
  const choice=ui._test.choiceCardModel(actions[i],i);
  assert.equal(choice.title,`${type} Energy`);assert.equal(choice.art,assets.energyCardUrl(type));assert.equal(choice.detail,'BASIC ENERGY');
 }
 assert.equal(ui._test.choiceCardModel(actions[2],2).art,'');assert.equal(ui._test.choiceCardModel(actions[3],3).art,'');
 const uiJs=fs.readFileSync(require.resolve(A+'tcgp-battle-ui.js'),'utf8'),css=fs.readFileSync(require.resolve(A+'tcgp-battle.css'),'utf8');
 assert.match(uiJs,/text-option/);assert.match(css,/tcgp-live-choice-card\.text-option/);
 assert.match(css,/overflow-wrap:anywhere/);
});
test('Crawdaunt ex Splash Back works at the actual 3-Bench limit and returns attached cards',()=>{
 const s=match('ex13-99','Water');
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='ex13-99'),false,'Power must not appear until Bench is full');
 const target=s.sides.opponent.bench[0];target.energy={Water:1};target.specialEnergy=[{uid:'react-energy',cardId:'ex12-82'}];
 // Add the third Pokémon to the Bench; previous two are not enough.
 const third=core.makePokemonSlot('ex13-58',2,'ob2');third.benchSlot=2;s.sides.opponent.bench.push(third);
 const power=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='ex13-99');
 assert.ok(power,'Power should appear when three Bench slots are occupied');
 assert.match(data.cardById('ex13-99').abilities[0].text,/3 or more Benched/);
 core.applyAction(s,'player',power);
 assert.equal(s.phase,'effectChoice');
 const choice=core.legalActions(s,s.choiceSide).find(a=>a.type==='effectChoice'&&a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 assert.ok(choice,'No bench target offered at 3 Pokémon');core.applyAction(s,s.choiceSide,choice);
 assert.equal(s.sides.opponent.bench.length,2);
 assert.ok(s.sides.opponent.hand.some(c=>c.cardId==='ex12-82'));
 assert.ok(s.sides.opponent.hand.some(c=>data.cardById(c.cardId)?.basicEnergy));
});
test('Kingdra delta dual-cost metadata preserves Fire and Metal in built and saved decks',()=>{
 const kingdra=data.cardById('ex13-10');assert.deepEqual(kingdra.deckMeta.requiredEnergyTypes,['Fire','Metal']);
 assert.equal(kingdra.attacks[1].cost,'RMCC');assert.equal(kingdra.attacks[1].text,'Deals 80 damage.');
 const r=builder.buildDeck(rows,{sets:['ex13'],types:['Fire'],focusCardId:'ex13-10',randomSeed:3});
 assert.ok(r.ok,r.errors?.join('; '));assert.deepEqual(r.energyTypes,['Fire','Metal']);
 assert.ok(r.cards.includes('ex13-95'),'Special Metal mitigates incoming damage on Kingdra and supplies Metal');
 const saved=decks.saveDraft({}, {...r,name:'Kingdra',energyMode:'auto'},rows);
 assert.ok(saved.ok);assert.deepEqual(saved.deck.energyTypes,['Fire','Metal']);
 assert.equal(saved.readiness.errors.length,0);
});
