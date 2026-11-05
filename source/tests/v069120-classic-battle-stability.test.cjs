'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js')),decks=require(path.join(A,'tcg-classic-decks.js')),
 ui=require(path.join(A,'tcgp-battle-ui.js'));
const src=fs.readFileSync(path.join(A,'tcgp-battle-ui.js'),'utf8'),css=fs.readFileSync(path.join(A,'tcgp-battle.css'),'utf8');
const slot=(id,uid)=>core.makePokemonSlot(id,1,uid);
function battle(){const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),playerEnergyTypes:['Water','Grass'],opponentEnergyTypes:['Water'],seed:199,firstSide:'player'});s.phase='battle';s.activeSide='player';s.sides.player.turnCount=3;return s;}
const available=(s,type)=>core.legalActions(s,'player').filter(a=>a.type===type);
for(const stadium of ['SNAPFLORIO-111','SNAPFLORIO-112']){
 test(`${stadium} does not remove Energy when played; retreat retains remaining attachments`,()=>{
  const st=battle(),p=st.sides.player;
  p.active=slot('SNAPFLORIO-081','owl');p.active.energy={Water:2,Grass:1};
  p.bench=[{...slot('SNAPFLORIO-076','dodrio'),benchSlot:1,energy:{Water:1}}];
  p.hand=[{uid:'park',cardId:stadium}];
  const play=available(st,'trainer').find(a=>a.cardId===stadium);assert.ok(play,'stadium legal');
  core.applyAction(st,'player',play);
  assert.equal(st.stadium.cardId,stadium);
  assert.deepEqual(p.active.energy,{Water:2,Grass:1},'playing Stadium must NOT remove Hoothoot attachments');
  assert.deepEqual(p.bench[0].energy,{Water:1},'Stadium must not change Dodrio attachments');
  const retreat=available(st,'retreat').find(a=>a.benchIndex===1);assert.ok(retreat,'can switch to Dodrio');
  core.applyAction(st,'player',retreat);
  assert.equal(p.active.cardId,'SNAPFLORIO-076');assert.deepEqual(p.active.energy,{Water:1},'Dodrio retains its Energy after promotion');
  assert.equal(p.bench[0].cardId,'SNAPFLORIO-081');
  const record=st.log.findLast(x=>x.type==='retreat');assert.ok(record);
  if(stadium==='SNAPFLORIO-111'){
   assert.deepEqual(p.bench[0].energy,{Water:2,Grass:1},'Florio Park Night enables free retreat for Basic Hoothoot');
   assert.equal(Object.values(record.spentEnergy).reduce((a,b)=>a+b,0),0);
  }else{
   assert.equal(Object.values(p.bench[0].energy).reduce((a,b)=>a+b,0),2,'only one Energy is spent on retreat');
   assert.equal(Object.values(record.spentEnergy).reduce((a,b)=>a+b,0),1);
  }
  assert.match(ui.actionEventText(record),/Energy/);
 });
}
test('new GX requirement is Water on opposing Active, including Special Energy',()=>{
 const attacker='SNAPFLORIO-072';
 for(const energy of [{Water:2},{Darkness:2}]){
  const st=battle();st.sides.player.active=slot(attacker,'gx');st.sides.player.active.energy={Colorless:3};st.sides.opponent.active=slot('SNAPFLORIO-041','magikarp');st.sides.opponent.active.energy=energy;
  const gx=available(st,'attack').find(a=>a.attackIndex===1);assert.ok(gx);core.applyAction(st,'player',gx);
  assert.equal(st.log.some(l=>l.type==='ko'&&l.side==='opponent'),!!energy.Water);
 }
 assert.match(ui.cardRulesHtml(require(path.join(A,'tcg-classic-battle-data.js')).cardById(attacker)),/Water Energy/);
});
test('Heads and Tails are unambiguous and only one coin row remains onscreen',()=>{
 const state={cosmetics:{unlockedCoins:['pocket-coin-mewtwo'],activeCoin:'pocket-coin-mewtwo'}};
 assert.match(ui._test.coinPresentationHtml(true,'player',state),/TCGP_Coin_Mewtwo/);
 assert.match(ui._test.coinPresentationHtml(false,'player',state),/TAILS/);
 assert.doesNotMatch(ui._test.coinPresentationHtml(false,'player',state),/Pok%C3%A9_Ball|Mewtwo/);
 assert.match(src,/for\(const previous of stage\.querySelectorAll\('\.tcgp-present-coins'\)\)previous\.remove\(\)/);
 assert.match(css,/\.tcgp-present-coin-face\.is-tails/);
});
test('active area is selectable after retreat and presentation does not block tap targets',()=>{
 assert.match(src,/tcgp-live-player-active.*data-tcgp-action=\\?"open-pokemon-actions/);
 assert.match(src,/currentBattle\?\.format==='classic'\?interactionAttrs:''/);
 assert.match(src,/if\(battlePresentationBusy\)\{/);
 assert.match(src,/finishBattlePresentation\(true\)/);
 assert.match(css,/\.tcgp-present-layer\{pointer-events:none!important\}/);
 assert.match(css,/\.tcgp-present-skip\{inset:8px/);
 assert.doesNotMatch(css,/\.tcgp-present-skip\{[^}]+pointer-events:none/);
});
