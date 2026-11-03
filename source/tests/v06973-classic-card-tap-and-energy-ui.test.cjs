'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(assets,'tcgp-battle-core.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const data=require(path.join(assets,'tcgp-battle-data.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
const src=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');

function match(){const b=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),seed:73});b.phase='battle';b.activeSide='player';b.sides.player.active=core.makePokemonSlot('base1-3',0,'chansey');const mewtwo=core.makePokemonSlot('base1-10',0,'mewtwo');mewtwo.benchSlot=0;mewtwo.energy={Psychic:1};mewtwo.specialEnergy=[{uid:'dce-1',cardId:'base1-96'}];b.sides.player.bench=[mewtwo];b.sides.opponent.active=core.makePokemonSlot('base1-7',0,'hitmonchan');return b;}

test('Mewtwo on Bench has no attack actions; as Active Psychic works with 1 Psychic + DCE while Barrier still needs 2 Psychic',()=>{
 const b=match();assert.equal(core.legalActions(b,'player').filter(a=>a.type==='attack').length,0,'Chansey on Active does not have Energy');
 const mewtwo=b.sides.player.bench[0];b.sides.player.active=mewtwo;b.sides.player.bench=[];
 assert.equal(core.attackAvailability(b,'player',0).usable,true,'Psychic is usable with a Psychic + Double Colorless Energy');
 assert.equal(core.attackAvailability(b,'player',1).usable,false,'Barrier requires two real Psychic Energy');
 assert.equal(core.legalActions(b,'player').filter(a=>a.type==='attack'&&a.attackCardId==='base1-10').length,1);
});

test('own Benched Pokémon can be tapped for a non-attack explanation and readable move costs',()=>{
 assert.match(src(),/zone==='bench'[^\n]*open-pokemon-actions|benchActionView/,'Benched tap opens helpful action sheet');
 const html=ui._test.liveBenchReadOnlyMovesHtml(data.cardById('base1-10'));
 assert.match(html,/Bench.*cannot attack|attacks.*Active/i);
 assert.match(html,/Psychic/);
 assert.match(html,/Barrier/);
 assert.match(html,/tcgp-cost/);
 assert.doesNotMatch(html,/data-action-index=/,'Bench must not provide illegal attack buttons');
});

test('Double Colorless has a small badge clearly labelled as providing two Colorless Energy',()=>{
 const b=match(),html=ui._test.liveAttachedEnergyHtml({energyPool:b.sides.player.bench[0].energy,specialEnergy:b.sides.player.bench[0].specialEnergy});
 assert.match(html,/DCE/);
 assert.match(html,/2 Colorless/);
 assert.match(html,/tcgp-live-special-energy-count/);
 assert.match(html,/×2/);
 assert.match(html,/Psychic/);
});

test('Classic player cards grow without affecting Pocket sizing and Special Energy badges stay compact',()=>{
 const style=css();assert.match(style,/\.format-classic\s+\.tcgp-live-player-active\s*\{[^}]*width:\s*19/);
 assert.match(style,/\.format-classic\s+\.tcgp-live-player-bench\s*\{[^}]*width:\s*5[5-9]/);
 assert.match(style,/\.format-classic\s+\.tcgp-live-opponent-active\s*\{[^}]*width:\s*16/);
 assert.match(style,/\.format-classic\s+\.tcgp-live-opponent-bench\s*\{[^}]*width:\s*48/);
 assert.match(style,/\.tcgp-live-special-energy-count/);
 assert.match(style,/\.format-classic\s+\.tcgp-live-attached-energy/);
});
