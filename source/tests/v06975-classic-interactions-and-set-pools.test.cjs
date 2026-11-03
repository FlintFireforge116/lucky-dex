'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(assets,'tcg-classic-battle-data.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const owned=cards.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
function validDeck(result,sets){assert.equal(result.ok,true,result.errors?.join('; ')||result.error);assert.equal(result.cards.length,30);assert.ok(result.cards.every(id=>sets.includes(cards.cardById(id).setId)), 'deck contains disallowed set');assert.equal(cards.validateDeck(result.cards).ok,true);assert.ok(result.energyTypes.every(t=>decks.ENERGY_TYPES.includes(t)),'Energy Zone cannot generate Colorless');}
test('Colorless is a legitimate competitive archetype, not an Energy Zone type',()=>{
  const r=builder.buildDeck(owned,{style:'competitive',types:['Colorless'],sets:['base1','base2']});validDeck(r,['base1','base2']);
  assert.ok(r.cards.some(id=>cards.cardById(id)?.types?.includes('Colorless')),'Colorless Pokémon core required');
  assert.match(r.strategy,/Colorless/i);
});
test('builder honours Base-only and Jungle-only source pools',()=>{
  for(const set of ['base1','base2']){
   const r=builder.buildDeck(owned,{style:'random',types:['Colorless'],sets:[set],randomSeed:13});validDeck(r,[set]);
  }
});
test('opponent builder can target Colorless and strictly limits source sets',()=>{
  for(const set of ['base1','base2'])for(const type of ['Colorless','Grass','Fire']){
    const r=opponents.generate({seed:237,sets:[set],type});validDeck(r,[set]);
    assert.equal(r.type,type);assert.ok(r.cards.some(id=>cards.cardById(id)?.types?.includes(type)));
  }
});
test('combined random opponents actually include Jungle cards over a seed sample',()=>{
  const matches=Array.from({length:24},(_,seed)=>opponents.generate({seed:seed*79+22,sets:['base1','base2']}));
  assert.ok(matches.every(r=>r.ok),'all seeded opponents are legal');
  assert.ok(matches.some(r=>r.cards.some(id=>id.startsWith('base2-'))),'Jungle must be selectable for random opponents');
});
test('a bench Mewtwo can be switched into Active using a Switch card from hand',()=>{
 const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:decks.LOANER_DECK,playerEnergyTypes:['Psychic'],opponentEnergyTypes:['Fire'],seed:75});
 s.phase='battle';s.activeSide='player';s.turnNumber=5;s.sides.player.turnCount=3;
 s.sides.player.active=core.makePokemonSlot('base1-3',0,'chansey');s.sides.player.bench=[core.makePokemonSlot('base1-10',0,'mewtwo')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=core.makePokemonSlot('base1-28',0,'growlithe');s.sides.player.hand=[{cardId:'base1-95',uid:'switch'}];
 const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='base1-95'&&a.target==='bench'&&a.benchIndex===0);
 assert.ok(a,'Switch targeting bench Mewtwo is legal');
 assert.ok(ui._test?.benchSwitchActionIndices,'UI should surface legal Switch actions when selecting Mewtwo');
 assert.deepEqual(ui._test.benchSwitchActionIndices([a],0),[0]);
 core.applyAction(s,'player',a);assert.equal(s.sides.player.active.cardId,'base1-10');
});
test('Classic battle UI renders explicit source pool and opponent type controls',()=>{
 const code=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
 assert.match(code,/data-tcgp-action="classic-opponent-set"/);
 assert.match(code,/data-tcgp-action="classic-opponent-type"/);
 const editor=fs.readFileSync(path.join(assets,'tcg-classic-deck-editor.js'),'utf8');
 assert.match(editor,/btn\('auto-set'/);
 assert.match(editor,/Colorless/);
});

test('Mewtwo Barrier can be inspected and previews never assume effects is an array',()=>{
 const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:decks.LOANER_DECK,playerEnergyTypes:['Psychic'],opponentEnergyTypes:['Fire'],seed:75});
 s.phase='battle';s.activeSide='player';s.turnNumber=5;s.sides.player.turnCount=3;
 s.sides.player.active=core.makePokemonSlot('base1-10',0,'mewtwo');s.sides.player.active.energy={Psychic:3};s.sides.opponent.active=core.makePokemonSlot('base1-28',0,'growlithe');
 assert.equal(core.attackAvailability(s,'player',1).usable,true);
 assert.doesNotThrow(()=>core.attackDamagePreview(s,'player',1));
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='attack').length,2);
});

test('mixed and set-specific Jungle opponents can complete full simulated battles',()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 for(const sets of [['base1'],['base2'],['base1','base2']])for(const type of ['Colorless','Grass','Fire']){
  const cpu=opponents.generate({seed:751+sets.length*37+type.length,sets,type});
  validDeck(cpu,sets);
  const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:cpu.cards,playerEnergyTypes:['Fighting'],opponentEnergyTypes:cpu.energyTypes,firstSide:'opponent',seed:501});
  let steps=0;while(s.phase!=='finished'&&steps<950){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const act=ai.chooseAction(s,side,'Beginner',steps);assert.ok(act,`missing action: ${sets} ${type} ${s.phase} turn ${s.turnNumber}`);core.applyAction(s,side,act);steps++;}
  assert.equal(s.phase,'finished',`deadlock: ${sets} ${type}, ${steps} actions`);
 }
});
test('Classic turn-counter uses 100 turns while Pocket keeps 50',()=>{
 const code=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
 assert.match(code,/format==='classic'\?100:50/);
});
