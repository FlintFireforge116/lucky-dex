'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=path.join(__dirname,'../app/src/main/assets');
const O=require(path.join(dir,'tcg-deck-optimizer.js')),C=require(path.join(dir,'tcg-classic-battle-data.js')),B=require(path.join(dir,'tcg-classic-deck-builder.js')),CD=require(path.join(dir,'tcg-classic-decks.js'));
const D=require(path.join(dir,'tcgp-battle-data.js')),P=require(path.join(dir,'tcgp-battle-decks.js')),S=require(path.join(dir,'tcgp-battle-solo.js'));
const cr=C.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&!c.basicEnergy).map(c=>({gameplayId:c.id,quantity:4}));
const pr=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind!=='energy').map(c=>({gameplayId:c.id,quantity:2}));
test('all-card test catalogues can legally build an owned-independent deck for both formats',()=>{
 const classic=B.buildDeck(cr,{style:'competitive',theme:'sleep',randomSeed:88});assert.equal(classic.ok,true,classic.errors?.join(' '));assert.ok(CD.validateDraft(classic.cards,cr,{requireFull:true}).ok);
 const pocket=P.buildQuickDeck(pr,{style:'competitive',theme:'sleep',variant:2});assert.equal(pocket.ok,true,pocket.errors?.join(' '));assert.ok(P.validateLoanerDeck(pocket.cards,pocket.energyTypes).ok);
});
test('candidate comparison remains legal and deterministic for a fixed seed',async()=>{
 const input={format:'classic',rows:cr,options:{style:'competitive',types:['Psychic'],theme:'sleep',sets:B.SET_IDS},seed:9876,maxCandidates:3,simulate:false,build:(rows,options)=>B.buildDeckAsync(rows,options)};
 const a=await O.optimise(input),b=await O.optimise(input);
 assert.equal(a.ok,true);assert.equal(a.optimisation.candidates>0,true);assert.deepEqual(a.cards,b.cards);assert.equal(CD.validateDraft(a.cards,cr,{requireFull:true}).ok,true);assert.equal(a.optimisation.simulated,false);
 assert.ok(a.optimisation.assessment.plan.enablers.length);
});
test('real battle playtests run without rewarding player collections or changing deck data',async()=>{
 const player={cards:CD.LOANER_DECK,energyTypes:CD.analyzeDeck(CD.LOANER_DECK).recommendedEnergyTypes};
 const before=JSON.stringify(player);
 const result=await O.playtest('classic',player,player,111,{maxActions:42});
 assert.ok(result.actions>0);assert.ok(result.actions<=42);assert.equal(result.errors,0);assert.equal(JSON.stringify(player),before);
 const pocket={cards:P.LOANER_PLAYER_DECK,energyTypes:P.analyzeDeck(P.LOANER_PLAYER_DECK).recommendedEnergyTypes};
 const p=await O.playtest('pocket',pocket,pocket,113,{maxActions:42});assert.ok(p.actions>0);assert.equal(p.errors,0);
});
test('testing mode can face a random Pocket CPU using a themed deck without rewards',()=>{
 const challenge=S.CHALLENGES.find(c=>c.randomPool&&c.difficulty==='Beginner');
 const battle=S.createBattle({challengeId:challenge.id,testMode:true,playerDeck:P.LOANER_PLAYER_DECK,cpuTheme:'sleep',seed:136,manualPlayerSetup:false});
 assert.equal(battle.testMode,true);
 assert.equal(P.validateLoanerDeck(battle.opponentDeck,battle.sides.opponent.energyTypes).ok,true);
});
// Run the browser-side controller with an isolated fake WebView. This tests the
// actual click wiring and state separation without installing an Android APK.
test('Test Lab switch exposes all cards, normal deck builders, then restores normal collection',()=>{
 const noop=()=>{},listeners={};let captured=null;
 const elements={};for(const id of ['tcgpBattleEntry','tcgpBattleContent','tcgpBattleView','tcgpBattleBack','tcgpBattleInfo','tcgpBattleHelp','packHome','packStage'])elements[id]={innerHTML:'',hidden:false,addEventListener:(type,fn)=>{if(id==='tcgpBattleContent')listeners[type]=fn;},querySelector:()=>null,classList:{add:noop,remove:noop}};
 const document={readyState:'complete',body:{classList:{add:noop,remove:noop}},getElementById:id=>elements[id]||null,addEventListener:noop};
 const state={cards:{},profile:{coins:900},tcgpBattle:{helpSeen:true},tcgClassicBattle:{}};
 const context={document,state,console,Date,Math,Set,Map,WeakMap,Array,Object,Number,String,JSON,RegExp,Promise,setTimeout,clearTimeout,addEventListener:noop,
  LuckyDexTCGPBattleLayout:require(path.join(dir,'tcgp-battle-layout.js')),
  LuckyDexTCGPBattleData:D,LuckyDexTCGPBattleDecks:P,LuckyDexTCGPBattleCore:require(path.join(dir,'tcgp-battle-core.js')),
  LuckyDexTCGPBattleAI:require(path.join(dir,'tcgp-battle-ai.js')),LuckyDexTCGPBattleSolo:S,
  LuckyDexTCGPBattleProgress:require(path.join(dir,'tcgp-battle-progress.js')),LuckyDexTCGPDeckWorkspace:require(path.join(dir,'tcgp-deck-workspace.js')),
  LuckyDexClassicTCGDecks:CD,LuckyDexClassicTCGOpponents:require(path.join(dir,'tcg-classic-opponents.js')),
  LuckyDexTCGPBattleEffects:require(path.join(dir,'tcgp-battle-effects.js')),
  LuckyDexTCGTestLabDecks:require(path.join(dir,'tcg-test-lab-decks.js')),
  LuckyDexClassicTCGBattleData:C,
  LuckyDexClassicSetPicker:require(path.join(dir,'tcg-classic-set-picker.js')),
  LuckyDexTCGPDeckEditor:{open:opts=>{captured=opts},close:noop},LuckyDexClassicTCGDeckEditor:{open:opts=>{captured=opts},close:noop},
  showToast:noop,save:()=>{}
 };
 vm.runInNewContext(fs.readFileSync(path.join(dir,'tcgp-battle-ui.js'),'utf8'),context,{filename:'tcgp-battle-ui.js'});
 const click=(action,id)=>{const node={dataset:{tcgpAction:action,id},closest:sel=>sel==='[data-tcgp-action]'?node:null};listeners.click({target:node});};
 context.LuckyDexTCGPBattleUI.open();assert.match(elements.tcgpBattleContent.innerHTML,/TEST LAB · ALL CARDS/);
 click('open-sandbox');assert.match(elements.tcgpBattleContent.innerHTML,/All battle-ready cards/);
 click('build');assert.ok(captured.sandbox);assert.ok(captured.owned().length>1000);assert.notEqual(captured.state(),state);captured.save();assert.equal(state.profile.coins,900);
 context.LuckyDexTCGPBattleUI.renderHome(true);click('format-classic');click('classic-build');assert.ok(captured.sandbox);assert.ok(captured.owned().length>900);assert.notEqual(captured.state(),state);
 context.LuckyDexTCGPBattleUI.renderHome(true);click('exit-sandbox');assert.doesNotMatch(elements.tcgpBattleContent.innerHTML,/All battle-ready cards are available/);
 click('classic-build');assert.equal(captured.sandbox,false);assert.equal(captured.owned().length,0);assert.equal(captured.state(),state);
});
