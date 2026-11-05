'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(assets,'tcgp-battle-core.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const uiSource=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
function battle(){
 const state=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),playerEnergyTypes:['Water','Grass'],opponentEnergyTypes:['Darkness','Fire'],seed:8127,firstSide:'player'});
 state.phase='battle';state.activeSide='player';state.sides.player.turnCount=3;return state;
}
function slot(id,uid){return core.makePokemonSlot(id,0,uid);}
test('Predator Plunge condition depends on attached Water Energy, not Darkness Energy',()=>{
 const water=battle();water.sides.player.active=slot('SNAPFLORIO-072','hunter');water.sides.player.active.energy={Colorless:3};
 water.sides.opponent.active=slot('SNAPFLORIO-041','magikarp');water.sides.opponent.active.energy={Water:2};
 const action=core.legalActions(water,'player').find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(action,'attack is legal with 3 Colorless requirements');
 core.applyAction(water,'player',action);
 assert.equal(water.log.some(l=>l.rule==='predatorPlunge114'&&l.conditionFailed),false);
 assert.equal(water.log.some(l=>l.type==='ko'&&l.side==='opponent'),true);
 const dark=battle();dark.sides.player.active=slot('SNAPFLORIO-072','hunter');dark.sides.player.active.energy={Colorless:3};
 dark.sides.opponent.active=slot('SNAPFLORIO-041','magikarp');dark.sides.opponent.active.energy={Darkness:1};
 const attack=core.legalActions(dark,'player').find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(attack);core.applyAction(dark,'player',attack);
 assert.equal(dark.log.some(l=>l.type==='ko'&&l.side==='opponent'),false);assert.ok(dark.log.some(l=>l.conditionFailed));
});
test('Pichu & Scorbunny Surprise consumes each side ordered Energy Zone top and preserves normal attachment',()=>{
 const st=battle(),p=st.sides.player,o=st.sides.opponent;
 p.active=slot('SNAPFLORIO-091','pichu');o.active=slot('SNAPFLORIO-041','magikarp');
 p.energySupply=['Water','Grass'];o.energySupply=['Darkness','Fire'];p.energyUsed=false;o.energyUsed=false;
 p.hand=[{uid:'surprise',cardId:'SNAPFLORIO-119'}];
 const action=core.legalActions(st,'player').find(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-119');
 assert.ok(action);core.applyAction(st,'player',action);
 assert.equal(p.active.energy.Water,1);assert.equal(o.active.energy.Darkness,1);
 assert.deepEqual(p.energySupply,['Grass']);assert.deepEqual(o.energySupply,['Fire']);
 assert.equal(p.energyUsed,false);assert.equal(o.energyUsed,false);
 assert.equal(st.log.filter(l=>l.type==='energyFromSupply'&&l.reason==='Florio Energy Zone attachment').length,2);
});
test('Garden Flourish can take a Grass Energy from top of Energy Zone for a Benched Pokémon',()=>{
 const st=battle(),p=st.sides.player;
 p.active=slot('SNAPFLORIO-055','florges');p.active.energy={Psychic:1,Colorless:1};
 p.bench=[{...slot('SNAPFLORIO-041','bench-victim'),benchSlot:0}];
 p.energySupply=['Grass','Water'];st.stadium={cardId:'SNAPFLORIO-105',ownerSide:'player'};
 const action=core.legalActions(st,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(action,'Florges attack is legal');core.applyAction(st,'player',action);
 const choices=core.legalActions(st,'player');
 const choose=choices.find(a=>a.type==='effectChoice'&&a.choiceBenchIndex===0);
 assert.ok(choose,'bench target choice exists');core.applyAction(st,'player',choose);
 assert.equal(p.bench[0].energy.Grass,1);assert.deepEqual(p.energySupply,['Water']);
});
test('Classic Active selection is unconditional on attack eligibility; tap menu reaches hand and Energy',()=>{
 assert.match(uiSource,/currentBattle\?\.format==='classic'&&\['bench','active'\]\.includes\(zone\)/);
 assert.match(uiSource,/data-tcgp-action="open-pokemon-actions"/);
 assert.match(uiSource,/data-tcgp-action="open-hand-picker"/);
 assert.match(uiSource,/data-tcgp-action="open-energy-actions"/);
 assert.match(uiSource,/function openHandPicker\(\)/);
 assert.match(css,/format-classic \.tcgp-live-player-active\{width:clamp\(62px/);
 assert.match(ui._test.pokemonInteractionAttrs('player','active',0,{cardId:'SNAPFLORIO-041'}),/data-tcgp-action="inspect-card"/); // No match open without battle state
});
test('Mobile hand and energy drag previews survive layout resize and have a broken-art fallback',()=>{
 assert.doesNotMatch(uiSource,/ResizeObserver\(\(\)=>\{cancelGesture\?\.\(\);layoutPlayerHand\(\);\}/);
 assert.match(uiSource,/ghost\.textContent=cardName\(ref\?\.cardId\)/);
 assert.match(uiSource,/img\.onerror=\(\)=>img\.remove\(\)/);
 assert.match(uiSource,/source\.setPointerCapture\?\.\(event\.pointerId\)/);
 assert.match(css,/tcgp-live-hand-drag>img/);
});
test('Pikachu Charge attaches the next matching Lightning Energy from the hybrid Classic Zone, never skipping top',()=>{
 for(const top of ['Lightning','Water']){
  const st=battle(),p=st.sides.player;
  p.active=slot('SNAPFLORIO-050','pikachu');p.active.energy={Lightning:1};
  st.sides.opponent.active=slot('SNAPFLORIO-041','magikarp');
  p.energySupply=top==='Lightning'?['Lightning','Water']:['Water','Lightning'];
  p.hand=[];
  const action=core.legalActions(st,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
  assert.ok(action,'Charge is a legal attack with one Lightning Energy');
  core.applyAction(st,'player',action);
  assert.equal(p.active.energy.Lightning,top==='Lightning'?2:1);
  assert.deepEqual(p.energySupply,top==='Lightning'?['Water']:['Water','Lightning']);
 }
 const recovered=battle(),side=recovered.sides.player;
 side.active=slot('SNAPFLORIO-050','pikachu-recovered');side.active.energy={Lightning:1};
 recovered.sides.opponent.active=slot('SNAPFLORIO-041','magikarp');
 side.energySupply=['Water','Lightning'];
 side.hand=[{uid:'recovered-lightning',cardId:'neo1-109'}];
 core.applyAction(recovered,'player',core.legalActions(recovered,'player').find(a=>a.type==='attack'&&a.attackIndex===0));
 assert.equal(side.active.energy.Lightning,2,'real Lightning Energy in hand remains valid');
 assert.equal(side.hand.length,0,'hand Energy was spent, not duplicated');
 assert.deepEqual(side.energySupply,['Water','Lightning'],'the wrong-type Zone top remains untouched');
 assert.match(ui.cardRulesHtml(data.cardById('SNAPFLORIO-050')),/next Energy Zone card in Classic/i);
});
