'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const classicBuilder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const classicOpponents=require('../app/src/main/assets/tcg-classic-opponents.js');
const classicDecks=require('../app/src/main/assets/tcg-classic-decks.js');
const pocket=require('../app/src/main/assets/tcgp-battle-data.js');
const pocketDecks=require('../app/src/main/assets/tcgp-battle-decks.js');
const solo=require('../app/src/main/assets/tcgp-battle-solo.js');
const fullClassic=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const fullPocket=pocket.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2}));

test('Classic rarity uses printed classifications, including legacy Base Set and Lental',()=>{
 assert.equal(classicBuilder.rarityTier(classic.cardById('base1-4')),'rare');
 assert.equal(classicBuilder.rarityTier(classic.cardById('base1-52')),'common');
 assert.equal(classicBuilder.rarityTier(classic.cardById('SNAPFLORIO-010')),'ultra');
 assert.equal(classicBuilder.rarityTier(classic.cardById('SNAPFOUNJA-073')),'ultra');
});

test('Classic rarity-focused auto builds remain legal and feature the chosen rarity',()=>{
 for(const rarityFocus of ['common','uncommon','rare','ultra'])for(const seed of [13,47,103]){
  const basicOnly=rarityFocus==='common';
  const result=classicBuilder.buildDeck(fullClassic,{style:'random',rarityFocus,basicOnly,randomSeed:seed});
  assert.equal(result.ok,true,result.errors?.join(' '));
  assert.equal(result.cards.length,30);
  assert.equal(classicDecks.validateDraft(result.cards,fullClassic,{requireFull:true}).ok,true);
  assert.equal(classicBuilder.rarityTier(classic.cardById(result.focusCardId)),rarityFocus);
  if(basicOnly)for(const id of result.cards){const c=classic.cardById(id);if(c?.kind==='pokemon'){assert.equal(c.stage,'Basic');assert.equal(classicBuilder.rarityTier(c),'common');}}
 }
});

test('Classic Ultra Rare VMAX core can retain required lower-rarity evolution steps',()=>{
 const result=classicBuilder.buildDeck(fullClassic,{rarityFocus:'ultra',focusCardId:'SNAPFLORIO-010'});
 assert.equal(result.ok,true,result.errors?.join(' '));
 assert.ok(result.cards.includes('SNAPFLORIO-010'));
 assert.ok(result.cards.includes('SNAPFLORIO-009'));
 assert.ok(result.cards.length===30);
});

test('Classic CPU honours rarity, basic-only and pool selections',()=>{
 for(const rarityFocus of ['common','rare','ultra']){
  const result=classicOpponents.generate({seed:13579,rarityFocus,basicOnly:rarityFocus==='common'});
  assert.equal(result.ok,true,result.error);
  assert.equal(result.cards.length,30);
  assert.equal(classicDecks.validateDraft(result.cards,fullClassic,{requireFull:true}).ok,true);
  if(rarityFocus==='common')assert.ok(result.cards.every(id=>classic.cardById(id)?.kind!=='pokemon'||classic.cardById(id).stage==='Basic'));
 }
 const impossible=classicOpponents.generate({seed:1,sets:['base1'],rarityFocus:'ultra'});
 assert.equal(impossible.ok,false);
});

test('Pocket rarity focus maps game-play diamond tier, not cosmetic artwork',()=>{
 assert.equal(pocketDecks.gameplayRarityRank(pocket.cardById('A1-001')),1);
 assert.equal(pocketDecks.gameplayRarityRank(pocket.cardById('A1-002')),2);
 assert.equal(pocketDecks.gameplayRarityRank(pocket.cardById('A1-003')),3);
 assert.equal(pocketDecks.gameplayRarityRank(pocket.cardById('A1-004')),4);
});

test('Pocket builder produces a legal 20-card deck for each diamond tier',()=>{
 for(const rarityFocus of [1,2,3,4])for(const seed of [5,23,44]){
  const basicOnly=rarityFocus===1;
  const result=pocketDecks.buildQuickDeck(fullPocket,{rarityFocus,basicOnly,style:'random',randomSeed:seed});
  assert.equal(result.ok,true,result.errors?.join(' '));
  assert.equal(result.cards.length,20);
  assert.equal(pocketDecks.validateLoanerDeck(result.cards).ok,true);
  assert.equal(pocketDecks.gameplayRarityRank(pocket.cardById(result.focusCardId)),rarityFocus);
  if(basicOnly)for(const id of result.cards){const c=pocket.cardById(id);if(c?.kind==='pokemon'){assert.equal(c.stage,'Basic');assert.equal(pocketDecks.gameplayRarityRank(c),1);}}
 }
});

test('Pocket rarity 4 can use Bulbasaur/Ivysaur to evolve Venusaur ex',()=>{
 const result=pocketDecks.buildQuickDeck(fullPocket,{rarityFocus:4,cardId:'A1-004'});
 assert.equal(result.ok,true,result.errors?.join(' '));
 for(const id of ['A1-001','A1-002','A1-004'])assert.ok(result.cards.includes(id),`missing prerequisite ${id}`);
});

test('Pocket Random Battle supports rarity-specific CPU decks without changing fixed official challenges',()=>{
 const random=solo.CHALLENGES.find(c=>c.randomPool&&c.difficulty==='Beginner');
 for(const rank of [1,3,4]){
  const battle=solo.createBattle({challengeId:random.id,cpuRarityFocus:rank,cpuBasicOnly:rank===1,seed:978+rank});
  assert.equal(battle.difficulty,'Beginner');
  assert.equal(pocketDecks.validateLoanerDeck(battle.opponentDeck).ok,true);
  const pokemonCards=battle.opponentDeck.map(pocket.cardById).filter(c=>c?.kind==='pokemon');
  assert.ok(pokemonCards.some(c=>pocketDecks.gameplayRarityRank(c)===rank));
  if(rank===1)assert.ok(pokemonCards.every(c=>c.stage==='Basic'&&pocketDecks.gameplayRarityRank(c)===1));
 }
 const official=solo.CHALLENGES.find(c=>!c.randomPool&&c.difficulty==='Beginner');
 const normal=solo.createBattle({challengeId:official.id,seed:123});
 const withFocus=solo.createBattle({challengeId:official.id,seed:123,cpuRarityFocus:4});
 assert.deepEqual(normal.opponentDeck,withFocus.opponentDeck);
});

test('Both deck editors and both combat settings expose the rarity controls',()=>{
 const dir=path.resolve(__dirname,'../app/src/main/assets');
 for(const name of ['tcgp-deck-editor.js','tcg-classic-deck-editor.js']){
  const s=fs.readFileSync(path.join(dir,name),'utf8');
  assert.match(s,/Pokémon rarity focus/);
  assert.match(s,/auto-basic-only/);
 }
 const ui=fs.readFileSync(path.join(dir,'tcgp-battle-ui.js'),'utf8');
 for(const action of ['classic-opponent-rarity','classic-opponent-basic','pocket-opponent-rarity','pocket-opponent-basic'])assert.ok(ui.includes(action));
});


test('Manual Classic and Pocket catalogue rarity filters use gameplay tiers',()=>{
 const cw=require('../app/src/main/assets/tcg-classic-deck-workspace.js');
 const pw=require('../app/src/main/assets/tcgp-deck-workspace.js');
 const cr=cw.query(cw.catalogue(fullClassic),{filters:{rarity:'ultra'},pageSize:200});
 assert.ok(cr.total>0);
 assert.ok(cr.rows.every(r=>r.card.kind==='pokemon'&&classicBuilder.rarityTier(r.card)==='ultra'));
 const pr=pw.query(pw.catalogue(fullPocket),{filters:{rarity:'1'},pageSize:200});
 assert.ok(pr.total>0);
 assert.ok(pr.rows.every(r=>r.card.kind==='pokemon'&&pocketDecks.gameplayRarityRank(r.card)===1));
});
