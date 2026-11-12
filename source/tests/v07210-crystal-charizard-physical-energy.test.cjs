'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const cat=require(A+'tcg-classic-battle-data'),builder=require(A+'tcg-classic-deck-builder'),core=require(A+'tcgp-battle-core'),cpu=require(A+'tcg-classic-opponents');
const owned=cat.CARDS.filter(c=>c.setId==='ex14'&&c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
const build=rows=>builder.buildDeck(rows,{sets:['ex14'],focusCardId:'ex14-4',types:['Lightning','Metal'],style:'competitive',randomSeed:21});
function battle(){
 const deck=cpu.generate({sets:['ex14'],type:'Lightning',seed:31}).cards;
 assert.equal(deck.length,30);
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:313,firstSide:'player',playerEnergyTypes:['Lightning','Metal'],opponentEnergyTypes:['Lightning','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot('ex14-4',2,'char');s.sides.opponent.active=core.makePokemonSlot('ex14-58',2,'foe');
 s.sides.player.bench=[core.makePokemonSlot('ex14-48',2,'charmander')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex14-58',2,'ob0')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
const choose=(s,pred)=>{assert.equal(s.phase,'effectChoice');const actions=core.legalActions(s,s.choiceSide||s.activeSide).filter(a=>a.type==='effectChoice');const a=actions.find(pred);assert.ok(a,'choice unavailable '+JSON.stringify(actions));core.applyAction(s,s.choiceSide||s.activeSide,a);return s;};
test('A Charizard δ-focused, ex14-only deck reserves physical Double Rainbow before Trainers',()=>{
 const d=build(owned);assert.ok(d.ok,d.errors?.join('; '));assert.equal(d.cards.filter(id=>id==='ex14-88').length,3);assert.deepEqual(d.energyTypes,['Lightning','Metal']);assert.equal(d.cards.length,30);
 assert.ok(cat.validateDeck(d.cards).ok);
 assert.equal(d.cards.filter(id=>id==='ex14-30').length,3,'select Lightning Charmeleon δ');
 assert.equal(d.cards.filter(id=>id==='ex14-49').length,4,'select Lightning Charmander δ');
 assert.equal(d.cards.filter(id=>['ex14-29','ex14-48'].includes(id)).length,0,'avoid off-type Fire line');
 assert.ok(cat.cardById('ex14-4').deckMeta.triggerDependencies.includes('top-five-physical-deck-energy'));
 assert.ok(cat.cardById('ex14-4').deckMeta.physicalDeckEnergyPayoffs.includes('Double Rainbow Energy'));
});
test('No unowned physical Energy invented; printed Peal of Thunder limitation is visible',()=>{
 const d=build(owned.filter(r=>r.gameplayId!=='ex14-88'));assert.ok(d.ok,d.errors?.join('; '));assert.equal(d.cards.filter(id=>cat.cardById(id)?.kind==='energy').length,0);
 assert.ok(d.warnings.some(w=>/Peal of Thunder.*real draw deck/.test(w.message)));
});
test('Other EX Crystal Guardians cores do not blindly receive Double Rainbow filler',()=>{
 const d=builder.buildDeck(owned,{sets:['ex14'],focusCardId:'ex14-93',types:['Fighting'],randomSeed:30});
 assert.ok(d.ok,d.errors?.join('; '));assert.equal(d.cards.filter(id=>id==='ex14-88').length,0);
});
test('Peal attaches actual revealed Double Rainbow to Charizard, not Basic Energy from Zone',()=>{
 const s=battle(),p=s.sides.player;p.active=core.makePokemonSlot('ex14-29',2,'char');p.active.playedOnSideTurn=2;
 p.hand=[{uid:'evo',cardId:'ex14-4'}];p.deck=[{uid:'d',cardId:'ex14-88'},{uid:'non',cardId:'ex14-71'},{uid:'still',cardId:'ex14-65'}];
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex14-4');assert.ok(evolve);core.applyAction(s,'player',evolve);
 choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceTarget==='active');choose(s,a=>a.choiceOption===0);
 assert.equal(s.phase,'battle');assert.equal(p.active.specialEnergy.filter(x=>x.cardId==='ex14-88').length,1);
 assert.equal(p.active.energy.Metal||0,0);assert.equal(p.deck.length,0);assert.deepEqual(p.discard.map(r=>r.uid).sort(),['non','still']);
});
test('Peal cannot bypass Double Rainbow restriction when choosing a Basic recipient',()=>{
 const s=battle(),p=s.sides.player;p.active=core.makePokemonSlot('ex14-29',2,'char');p.active.playedOnSideTurn=2;
 p.hand=[{uid:'evo',cardId:'ex14-4'}];p.deck=[{uid:'d',cardId:'ex14-88'},{uid:'n',cardId:'ex14-71'}];
 core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex14-4'));
 choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 assert.equal(s.phase,'battle');assert.equal(p.bench[0].specialEnergy.length,0);assert.ok(p.discard.some(r=>r.uid==='d'));
});
test('Metal Burn discards Basic Metal and Double Rainbow as real physical Special Energy',()=>{
 const s=battle(),p=s.sides.player;p.active.energy={Lightning:1,Metal:1};p.active.specialEnergy=[{uid:'d',cardId:'ex14-88'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action,'Metal Burn needs available Energy');
 core.applyAction(s,'player',action);assert.equal(p.active.energy.Metal,0);assert.ok(p.discard.some(r=>r.uid==='d'));assert.equal(p.energyDiscard.Metal,1);
 assert.ok(s.log.some(l=>l.type==='ex14MetalBurnDiscard'&&l.basic===1&&l.physical===1));
 assert.equal(s.log.filter(l=>l.type==='attack').at(-1).damage,110);
});

test('Crystal Beach converts Double Rainbow to Colorless and Metal Burn only discards current Metal',()=>{
 const s=battle(),p=s.sides.player;s.stadium={uid:'beach',cardId:'ex14-75',ownerSide:'player'};
 p.active.energy={Lightning:1,Metal:2,Colorless:1};p.active.specialEnergy=[{uid:'d',cardId:'ex14-88'}];
 assert.equal(core.effectiveEnergy(s,'player',p.active).Colorless,2);
 assert.equal(core.effectiveEnergy(s,'player',p.active).Miracle||0,0);
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(p.active.energy.Metal,0);assert.equal(p.energyDiscard.Metal,2);
 assert.equal(p.active.specialEnergy.length,1,'DRE no longer provides Metal under Crystal Beach');
 assert.ok(!p.discard.some(r=>r.uid==='d'));
});

test('Selected older EX Emerald Double Rainbow print is an eligible fallback, not a free off-set card',()=>{
 const older=[...owned.filter(r=>r.gameplayId!=='ex14-88'),{gameplayId:'ex9-87',quantity:4}];
 const d=builder.buildDeck(older,{sets:['ex14','ex9'],focusCardId:'ex14-4',types:['Lightning','Metal']});
 assert.ok(d.ok,d.errors?.join('; '));assert.equal(d.cards.filter(id=>id==='ex9-87').length,3);
 assert.equal(d.cards.filter(id=>id==='ex14-88').length,0);
 const noOldSet=build(older);assert.ok(noOldSet.ok);assert.equal(noOldSet.cards.filter(id=>id==='ex9-87').length,0);
 assert.ok(noOldSet.warnings.some(w=>/Peal of Thunder.*real draw deck/.test(w.message)));
});
