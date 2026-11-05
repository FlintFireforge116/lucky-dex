'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');

test('Illumina Comfey Rejuvenate text explains discard-to-deck shuffle, not healing',()=>{
 const card=data.cardById('SNAPFLORIO-057');
 const attack=card.attacks.find(a=>a.name==='Rejuvenate');
 assert.ok(attack,'the creator card is present');
 assert.equal(attack.effect.rule,'rejuvenate');
 const description=ui._test.attackDescription(attack);
 assert.match(description,/damage counter/i);
 assert.match(description,/discard pile/i);
 assert.match(description,/shuffle/i);
 assert.doesNotMatch(description,/^Heal one of your Pok[eé]mon/i);
 assert.match(ui.cardRulesHtml(card),/shuffle your deck/i);
});

test('Rejuvenate moves one discard card per damage counter but does not heal',()=>{
 const state=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),playerEnergyTypes:['Psychic','Colorless'],opponentEnergyTypes:['Water'],seed:119,firstSide:'player'});
 state.phase='battle';state.activeSide='player';
 const mine=state.sides.player;
 mine.turnCount=3;mine.active=core.makePokemonSlot('SNAPFLORIO-057',1,'comfey');mine.active.energy={Psychic:1,Colorless:1};mine.active.damage=30;
 state.sides.opponent.active=core.makePokemonSlot('SNAPFLORIO-041',1,'magikarp');
 mine.discard=[{uid:'discard-a',cardId:'SNAPFLORIO-001'},{uid:'discard-b',cardId:'SNAPFLORIO-004'},{uid:'discard-c',cardId:'SNAPFLORIO-005'},{uid:'discard-d',cardId:'SNAPFLORIO-006'}];
 const before=mine.deck.length;
 const action=core.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(action,'attack is playable');core.applyAction(state,'player',action);
 assert.equal(mine.active.damage,30,'not healed');
 assert.equal(mine.discard.length,1,'three cards returned');
 assert.equal(mine.deck.length,before+3,'cards shuffled into deck');
 const ids=new Set(mine.deck.map(r=>r.uid));
 assert.ok(ids.has('discard-a')&&ids.has('discard-b')&&ids.has('discard-c'));
});

test('every Florio lental attack has a specific non-placeholder game effect summary',()=>{
 const cards=data.CARDS.filter(c=>c.setId==='SNAPFLORIO'&&c.battleEnabled);
 let found=0;
 for(const card of cards)for(const attack of card.attacks||[]){
  const effect=attack.effect;
  if(effect?.type==='lentalRule'){
   const message=ui._test.attackDescription(attack);
   assert.doesNotMatch(message,/^Resolve | according to | using the | special effect/i,`${card.name} ${attack.name}: ${message}`);
   found++;
  }
 }
 assert.ok(found>=60,found);
});

test('inspected card can expand full-screen, close without losing sheet or battle state',()=>{
 const btn=ui._test.zoomArtworkButtonHtml('card.webp','Illumina Comfey');
 const dialog=ui._test.cardZoomOverlayHtml('card.webp','Illumina Comfey');
 assert.match(btn,/data-tcgp-action="zoom-card"/);
 assert.match(btn,/ENLARGE/);
 assert.match(dialog,/role="dialog" aria-modal="true"/);
 assert.match(dialog,/data-tcgp-action="close-card-zoom"/);
 assert.match(dialog,/<img src="card.webp"/);
 assert.match(js,/liveInspectOverlayHtml\(\)/);
 assert.match(js,/cardZoomOverlayHtml\(art,card.name\)/);
 assert.match(js,/if\(action==='zoom-card'\)/);
 assert.match(js,/if\(action==='close-card-zoom'\)/);
 assert.match(css,/\.tcgp-live-card-zoom\[hidden\]\{display:none!important\}/);
 assert.match(css,/\.tcgp-live-card-zoom\{position:fixed/);
 // Escape user-provided names used as labels; never inject HTML into a dialog.
 assert.doesNotMatch(ui._test.cardZoomOverlayHtml('x.webp','<script>'),/<script>/);
});


test('dragged hand card and Energy are visually centred at the true touch drop point',()=>{
 const t=ui._test.dragPreviewTransform;
 assert.equal(t(220,425,76,106),'translate(182px,372px)');
 assert.equal(t(220,425,42,42),'translate(199px,404px)');
 assert.equal(t(25,25,76,106),'translate(-13px,-28px)', 'do not shift previews away from near-edge touch targets');
 assert.match(js,/ghost\.style\.transform=dragPreviewTransform\(e\.clientX,e\.clientY,ghost\.offsetWidth\|\|76,ghost\.offsetHeight\|\|106\)/);
 assert.match(js,/ghost\.style\.transform=dragPreviewTransform\(e\.clientX,e\.clientY,ghost\.offsetWidth\|\|42,ghost\.offsetHeight\|\|42\)/);
 assert.match(js,/elementFromPoint\?\.\(e\.clientX,e\.clientY\)/, 'drop hit-testing must use same pointer coordinates');
 assert.doesNotMatch(js,/e\.clientY-126|e\.clientY-68/,'previous above-finger offsets must not reappear');
});
