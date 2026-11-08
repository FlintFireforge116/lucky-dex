'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'../app/src/main/assets');
const load=n=>require(path.join(base,n));
const Lab=load('tcg-test-lab-decks.js');

test('Test Lab CPU deck filters persist separately from owned decks and normal opponent settings',()=>{
 const player={tcgpBattle:{decks:[{id:'normal-pocket'}],opponentTheme:'heal'},tcgClassicBattle:{decks:[{id:'normal-classic'}],opponentSets:['base1'],opponentType:'Fire'},profile:{coins:51}};
 const normal=JSON.stringify({p:player.tcgpBattle,c:player.tcgClassicBattle,profile:player.profile});
 const lab={tcgpBattle:{decks:[{id:'test-p'}],activeDeckId:'test-p',opponentRarityFocus:4,opponentBasicOnly:true,opponentTheme:'sleep',stats:{wins:900}},tcgClassicBattle:{decks:[{id:'test-c'}],activeDeckId:'test-c',opponentSets:['ex1'],opponentType:'Psychic',opponentRarityFocus:'ultra',opponentDifficulty:'Expert',opponentBasicOnly:true,opponentTheme:'sleep',stats:{wins:900}}};
 assert.equal(Lab.persist(player,lab),true);
 assert.equal(player.tcgTestLabDecks.schema,2);
 assert.deepEqual(player.tcgTestLabDecks.classic.opponent.opponentSets,['ex1']);
 assert.equal(player.tcgTestLabDecks.pocket.opponent.opponentRarityFocus,4);
 assert.equal(player.tcgTestLabDecks.classic.stats,undefined);
 assert.equal(JSON.stringify({p:player.tcgpBattle,c:player.tcgClassicBattle,profile:player.profile}),normal);
 const restored={tcgpBattle:{decks:[],activeDeckId:null},tcgClassicBattle:{decks:[],activeDeckId:null}};
 Lab.restore(JSON.parse(JSON.stringify(player)),restored);
 assert.deepEqual(restored.tcgClassicBattle.opponentSets,['ex1']);
 assert.equal(restored.tcgClassicBattle.opponentType,'Psychic');
 assert.equal(restored.tcgClassicBattle.opponentRarityFocus,'ultra');
 assert.equal(restored.tcgClassicBattle.opponentDifficulty,'Expert');
 assert.equal(restored.tcgpBattle.opponentTheme,'sleep');
 assert.equal(restored.tcgpBattle.opponentBasicOnly,true);
 assert.equal(restored.tcgpBattle.opponentRarityFocus,4);
 assert.equal(restored.tcgClassicBattle.decks[0].id,'test-c');
 restored.tcgClassicBattle.opponentSets.push('sv1');
 assert.deepEqual(player.tcgTestLabDecks.classic.opponent.opponentSets,['ex1'],'save snapshot not aliased');
});

test('Old Test Lab schema 1 decks migrate with no CPU filters lost from normal play',()=>{
 const saved={tcgTestLabDecks:{schema:1,pocket:{decks:[{id:'oldp'}],activeDeckId:'oldp'},classic:{decks:[{id:'oldc'}],activeDeckId:'oldc'}}};
 const sandbox={tcgpBattle:{decks:[]},tcgClassicBattle:{decks:[]}};
 Lab.restore(saved,sandbox);
 assert.equal(sandbox.tcgpBattle.activeDeckId,'oldp');
 assert.equal(sandbox.tcgClassicBattle.activeDeckId,'oldc');
 assert.equal(sandbox.tcgClassicBattle.opponentSets,undefined);
 Lab.persist(saved,sandbox);
 assert.equal(saved.tcgTestLabDecks.schema,2);
 assert.equal(saved.tcgTestLabDecks.classic.decks[0].id,'oldc');
});

test('Test Lab battle UI exposes card and CPU deck filters with set choices saved across reentry',()=>{
 const noop=()=>{},listeners={};
 const elements={};for(const id of ['tcgpBattleEntry','tcgpBattleContent','tcgpBattleView','tcgpBattleBack','tcgpBattleInfo','tcgpBattleHelp','packHome','packStage']) elements[id]={innerHTML:'',hidden:false,addEventListener:(type,fn)=>{if(id==='tcgpBattleContent')listeners[type]=fn;},querySelector:()=>null,classList:{add:noop,remove:noop}};
 const document={readyState:'complete',body:{classList:{add:noop,remove:noop}},getElementById:id=>elements[id]||null,addEventListener:noop};
 const real={tcgpBattle:{decks:[],opponentTheme:'any'},tcgClassicBattle:{decks:[],opponentSets:['base1']},profile:{coins:100}};
 let deckBuilderOpts=null;
 const context={document,state:real,console,Date,Math,Set,Map,WeakMap,Array,Object,Number,String,JSON,RegExp,Promise,setTimeout,clearTimeout,addEventListener:noop,
 LuckyDexTCGPBattleLayout:load('tcgp-battle-layout.js'),LuckyDexTCGPBattleData:load('tcgp-battle-data.js'),LuckyDexTCGPBattleDecks:load('tcgp-battle-decks.js'),LuckyDexTCGPBattleCore:load('tcgp-battle-core.js'),LuckyDexTCGPBattleAI:load('tcgp-battle-ai.js'),LuckyDexTCGPBattleSolo:load('tcgp-battle-solo.js'),LuckyDexTCGPBattleProgress:load('tcgp-battle-progress.js'),LuckyDexTCGPDeckWorkspace:load('tcgp-deck-workspace.js'),LuckyDexClassicTCGDecks:load('tcg-classic-decks.js'),LuckyDexClassicTCGOpponents:load('tcg-classic-opponents.js'),LuckyDexClassicSetPicker:load('tcg-classic-set-picker.js'),LuckyDexClassicTCGBattleData:load('tcg-classic-battle-data.js'),LuckyDexTCGPBattleEffects:load('tcgp-battle-effects.js'),LuckyDexTCGTestLabDecks:Lab,
 LuckyDexTCGPDeckEditor:{open:o=>{deckBuilderOpts=o;},close:noop},LuckyDexClassicTCGDeckEditor:{open:o=>{deckBuilderOpts=o;},close:noop},showToast:noop,save:noop};
 vm.runInNewContext(fs.readFileSync(path.join(base,'tcgp-battle-ui.js'),'utf8'),context);
 const click=(action,id)=>{const btn={dataset:{tcgpAction:action,id},closest:s=>s==='[data-tcgp-action]'?btn:null};listeners.click({target:btn});};
 context.LuckyDexTCGPBattleUI.open();click('open-sandbox');
 assert.match(elements.tcgpBattleContent.innerHTML,/CPU DECK FILTERS/);
 assert.match(elements.tcgpBattleContent.innerHTML,/tcgp-pocket-opponent-filters\" open/,'Pocket CPU deck filters expanded in Test Lab');
 let scrolled=0;const pocketPanel={tagName:'DETAILS',open:false,scrollIntoView:()=>scrolled++};
 elements.tcgpBattleContent.querySelector=selector=>selector==='.tcgp-pocket-opponent-filters'?pocketPanel:null;
 click('open-opponent-filters');assert.equal(scrolled,1);assert.equal(pocketPanel.open,true);
 elements.tcgpBattleContent.querySelector=()=>null;
 click('pocket-opponent-rarity','4');click('pocket-opponent-basic');click('pocket-opponent-theme','sleep');
 click('format-classic');
 assert.match(elements.tcgpBattleContent.innerHTML,/Allowed opponent expansions/);
 click('classic-opponent-type','Psychic');click('classic-opponent-rarity','ultra');click('classic-opponent-difficulty','Expert');
 assert.equal(real.tcgTestLabDecks.classic.opponent.opponentType,'Psychic');
 click('classic-build');assert.ok(deckBuilderOpts.sandbox);
 const state=deckBuilderOpts.state();state.tcgClassicBattle.opponentSets=['ex1'];deckBuilderOpts.save();
 click('exit-sandbox');assert.deepEqual(real.tcgClassicBattle.opponentSets,['base1'],'normal CPU restrictions unchanged');
 click('open-sandbox');click('classic-build');
 assert.deepEqual(deckBuilderOpts.state().tcgClassicBattle.opponentSets,['ex1']);
 assert.equal(deckBuilderOpts.state().tcgClassicBattle.opponentType,'Psychic');
 click('format-pocket');click('build');
 assert.equal(deckBuilderOpts.state().tcgpBattle.opponentRarityFocus,4);
 assert.equal(deckBuilderOpts.state().tcgpBattle.opponentTheme,'sleep');
 for(const name of ['tcgp-deck-editor.js','tcg-classic-deck-editor.js']){
  const src=fs.readFileSync(path.join(base,name),'utf8');
  assert.match(src,/Filter cards/);
  assert.match(src,/action==='filters'/);
  assert.match(src,/function filterSheet\(/);
 }
});
