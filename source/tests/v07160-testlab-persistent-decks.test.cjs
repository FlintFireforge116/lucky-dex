'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=path.join(__dirname,'../app/src/main/assets');
const Lab=require(path.join(dir,'tcg-test-lab-decks.js'));
const Pocket=require(path.join(dir,'tcgp-battle-decks.js'));
const PocketWorkspace=require(path.join(dir,'tcgp-deck-workspace.js'));
const PocketData=require(path.join(dir,'tcgp-battle-data.js'));
const Classic=require(path.join(dir,'tcg-classic-decks.js'));
const ClassicWorkspace=require(path.join(dir,'tcg-classic-deck-workspace.js'));
const ClassicData=require(path.join(dir,'tcg-classic-battle-data.js'));

test('Test Lab libraries persist only their decks and selected deck, separately from owned decks and statistics',()=>{
  const owned={profile:{coins:100},cards:{'A1-083':{count:1}},tcgpBattle:{decks:[{id:'owned',name:'Owned',cards:['A1-083']}],activeDeckId:'owned',stats:{wins:14}},tcgClassicBattle:{decks:[{id:'owned-c',cards:[]}],stats:{wins:4}}};
  const originalNormal=JSON.stringify({p:owned.tcgpBattle,c:owned.tcgClassicBattle,coins:owned.profile.coins,cards:owned.cards});
  const session={tcgpBattle:{decks:[{id:'pocket-1',name:'No collection required',cards:['A1-083'],energyTypes:['Water'],preferredPrints:{}}],activeDeckId:'pocket-1',stats:{wins:99}},tcgClassicBattle:{decks:[{id:'classic-1',name:'EX test',cards:['ex1-046'],energyMode:'auto',energyTypes:['Fighting']}],activeDeckId:'classic-1',stats:{wins:99}},cards:{'A1-083':{quantity:999}}};
  assert.equal(Lab.persist(owned,session),true);
  assert.equal(owned.tcgTestLabDecks.schema,2);
  assert.equal(owned.tcgTestLabDecks.pocket.decks[0].name,'No collection required');
  assert.equal(owned.tcgTestLabDecks.classic.decks[0].name,'EX test');
  assert.equal(owned.tcgTestLabDecks.pocket.stats,undefined);
  assert.equal(owned.tcgTestLabDecks.classic.stats,undefined);
  assert.equal(JSON.stringify({p:owned.tcgpBattle,c:owned.tcgClassicBattle,coins:owned.profile.coins,cards:owned.cards}),originalNormal);
  session.tcgpBattle.decks[0].cards.push('A1-002');
  assert.equal(owned.tcgTestLabDecks.pocket.decks[0].cards.length,1,'persistent data is not aliased with temporary state');
  const reloaded=JSON.parse(JSON.stringify(owned)),fresh={tcgpBattle:{decks:[],activeDeckId:null},tcgClassicBattle:{decks:[],activeDeckId:null}};
  Lab.restore(reloaded,fresh);
  assert.equal(fresh.tcgpBattle.activeDeckId,'pocket-1');
  assert.equal(fresh.tcgClassicBattle.activeDeckId,'classic-1');
  assert.equal(fresh.tcgpBattle.decks[0].cards[0],'A1-083');
  assert.equal(fresh.tcgClassicBattle.decks[0].name,'EX test');
  fresh.tcgpBattle.decks[0].cards.push('A1-002');
  assert.equal(reloaded.tcgTestLabDecks.pocket.decks[0].cards.length,1);
  assert.equal(Lab.restore({},{}).tcgpBattle.activeDeckId,null,'old saves load without a migration');
});

test('all-card Test Lab decks save using standard Pocket and Classic builders with no owned copies',()=>{
 const state={cards:{},tcgpBattle:{decks:[],activeDeckId:null},tcgClassicBattle:{decks:[],activeDeckId:null}};
 const pocketRows=PocketData.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind!=='energy').map(c=>({gameplayId:c.id,quantity:2}));
 const classicRows=ClassicData.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&!c.basicEnergy).map(c=>({gameplayId:c.id,quantity:4}));
 const pocketId=pocketRows.find(r=>PocketData.cardById(r.gameplayId)?.kind==='pokemon')?.gameplayId;
 const classicId=classicRows.find(r=>ClassicData.cardById(r.gameplayId)?.kind==='pokemon')?.gameplayId;
 assert.ok(pocketId&&classicId);
 const pr=PocketWorkspace.saveDraft(state,{name:'Pocket test',cards:[pocketId,pocketId],energyMode:'auto'},pocketRows);
 const cr=ClassicWorkspace.saveDraft(state,{name:'Classic test',cards:[classicId,classicId],energyMode:'auto'},classicRows);
 assert.equal(pr.ok,true,pr.errors?.join(', '));assert.equal(cr.ok,true,cr.errors?.join(', '));
 assert.equal(Pocket.validateDeck(pr.deck.cards,[],null).ok,false,'would not be legal with the actual collection');
 assert.equal(Classic.readiness(cr.deck,[]).ok,false,'would not be legal with the actual collection');
 const profile={tcgpBattle:{decks:[],activeDeckId:null},tcgClassicBattle:{decks:[],activeDeckId:null}};
 Lab.persist(profile,state);
 assert.equal(profile.tcgTestLabDecks.pocket.decks.length,1);
 assert.equal(profile.tcgTestLabDecks.classic.decks.length,1);
});

test('battle UI save wiring writes only Test Lab decks to the full profile; exiting restores normal library',()=>{
 const noop=()=>{},listeners={};let currentOptions=null,saveCalls=0;
 const els={};for(const id of ['tcgpBattleEntry','tcgpBattleContent','tcgpBattleView','tcgpBattleBack','tcgpBattleInfo','tcgpBattleHelp','packHome','packStage'])els[id]={innerHTML:'',hidden:false,addEventListener:(type,fn)=>{if(id==='tcgpBattleContent')listeners[type]=fn;},querySelector:()=>null,classList:{add:noop,remove:noop}};
 const document={readyState:'complete',body:{classList:{add:noop,remove:noop}},getElementById:id=>els[id]||null,addEventListener:noop};
 const state={cards:{},profile:{coins:500},tcgpBattle:{decks:[{id:'ownedp',name:'My ordinary Pocket deck',cards:[]}],activeDeckId:'ownedp'},tcgClassicBattle:{decks:[{id:'ownedc',name:'My ordinary Classic deck',cards:[]}],activeDeckId:'ownedc'}};
 const original={p:JSON.stringify(state.tcgpBattle),c:JSON.stringify(state.tcgClassicBattle)};
 const context={document,state,console,Date,Math,Set,Map,WeakMap,Array,Object,Number,String,JSON,RegExp,Promise,setTimeout,clearTimeout,addEventListener:noop,
 LuckyDexTCGPBattleLayout:require(path.join(dir,'tcgp-battle-layout.js')),
 LuckyDexTCGPBattleData:PocketData,LuckyDexTCGPBattleDecks:Pocket,LuckyDexTCGPBattleCore:require(path.join(dir,'tcgp-battle-core.js')),
 LuckyDexTCGPBattleAI:require(path.join(dir,'tcgp-battle-ai.js')),LuckyDexTCGPBattleSolo:require(path.join(dir,'tcgp-battle-solo.js')),
 LuckyDexTCGPBattleProgress:require(path.join(dir,'tcgp-battle-progress.js')),LuckyDexTCGPDeckWorkspace:PocketWorkspace,
 LuckyDexClassicTCGDecks:Classic,LuckyDexClassicTCGOpponents:require(path.join(dir,'tcg-classic-opponents.js')),
 LuckyDexTCGPBattleEffects:require(path.join(dir,'tcgp-battle-effects.js')),LuckyDexClassicTCGBattleData:ClassicData,
 LuckyDexTCGTestLabDecks:Lab,LuckyDexClassicSetPicker:require(path.join(dir,'tcg-classic-set-picker.js')),
 LuckyDexTCGPDeckEditor:{open:o=>{currentOptions=o;},close:noop},LuckyDexClassicTCGDeckEditor:{open:o=>{currentOptions=o;},close:noop},showToast:noop,save:()=>saveCalls++};
 vm.runInNewContext(fs.readFileSync(path.join(dir,'tcgp-battle-ui.js'),'utf8'),context,{filename:'tcgp-battle-ui.js'});
 const click=(action)=>{const btn={dataset:{tcgpAction:action},closest:sel=>sel==='[data-tcgp-action]'?btn:null};listeners.click({target:btn});};
 context.LuckyDexTCGPBattleUI.open();click('open-sandbox');click('build');
 let result=PocketWorkspace.saveDraft(currentOptions.state(),{name:'Test Pocket',cards:['A1-083'],energyMode:'auto'},currentOptions.owned());
 assert.equal(result.ok,true,result.errors?.join(', '));currentOptions.save();
 assert.equal(state.tcgTestLabDecks.pocket.decks[0].name,'Test Pocket');
 assert.equal(state.tcgTestLabDecks.classic.decks.length,0);
 assert.match(els.tcgpBattleContent.innerHTML,/save separately from normal play/);
 click('format-classic');click('classic-build');
 const candidate=currentOptions.owned().find(r=>r.card.kind==='pokemon');
 result=ClassicWorkspace.saveDraft(currentOptions.state(),{name:'Test Classic',cards:[candidate.gameplayId],energyMode:'auto'},currentOptions.owned());
 assert.equal(result.ok,true,result.errors?.join(', '));currentOptions.save();
 assert.equal(state.tcgTestLabDecks.pocket.decks[0].name,'Test Pocket');
 assert.equal(state.tcgTestLabDecks.classic.decks[0].name,'Test Classic');
 assert.equal(saveCalls>=2,true);
 click('exit-sandbox');click('classic-build');
 assert.equal(currentOptions.state(),state);
 assert.deepEqual(state.tcgpBattle.decks,JSON.parse(original.p).decks);
 assert.equal(state.tcgpBattle.activeDeckId,'ownedp');
 assert.deepEqual(state.tcgClassicBattle.decks,JSON.parse(original.c).decks);
 assert.equal(state.tcgClassicBattle.activeDeckId,'ownedc');
 assert.equal(state.profile.coins,500);
 click('open-sandbox');click('classic-build');
 assert.equal(currentOptions.state().tcgClassicBattle.decks[0].name,'Test Classic');
 click('format-pocket');click('build');
 assert.equal(currentOptions.state().tcgpBattle.decks[0].name,'Test Pocket');
});
