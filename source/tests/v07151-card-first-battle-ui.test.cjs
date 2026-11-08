'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../app/src/main/assets'),ui=require(path.join(dir,'tcgp-battle-ui.js'));
const t=ui._test;
function choiceState(kind,actions,extra={}){
 const state={phase:'effectChoice',choiceSide:'player',pendingChoice:{kind,side:'player',...extra},sides:{player:{active:{uid:'a',cardId:'ecard3-54'},bench:[{uid:'f1',benchSlot:0,cardId:'ecard3-8'},{uid:'f2',benchSlot:1,cardId:'ecard3-8'}],hand:[{cardId:'ecard3-54'},{cardId:'ecard3-98'}]},opponent:{active:{uid:'oa',cardId:'ecard3-65'},bench:[]}}};
 t.setCurrentBattleForTests(state,actions);return state;
}
test('Two identical Pokémon on distinct Bench slots are separate direct targets',()=>{
 const actions=[{type:'effectChoice',choiceTarget:'bench',choiceBenchIndex:0,choiceCardId:'ecard3-8'},{type:'effectChoice',choiceTarget:'bench',choiceBenchIndex:1,choiceCardId:'ecard3-8'}];
 const s=choiceState('pokemon',actions,{includeActive:false});
 assert.equal(t.canChooseBoardDirect(s,actions),true);
 assert.deepEqual(t.choiceBoardActions(s,actions,'player','bench',0),[0]);
 assert.deepEqual(t.choiceBoardActions(s,actions,'player','bench',1),[1]);
 assert.deepEqual(t.choiceBoardActions(s,actions,'opponent','bench',0),[]);
 const attrs=t.pokemonInteractionAttrs('player','bench',1,s.sides.player.bench[1]);
 assert.match(attrs,/choose-board-card/);assert.match(attrs,/data-index="1"/);
});
test('Opponent cards in play can be selected in place by a player resolving an effect',()=>{
 const actions=[{type:'effectChoice',choiceTarget:'active',choiceCardId:'ecard3-65'}];
 const s=choiceState('pokemon',actions,{selectionSide:'opponent'});
 assert.deepEqual(t.choiceBoardActions(s,actions,'opponent','active',0),[0]);
 assert.match(t.pokemonInteractionAttrs('opponent','active',0,s.sides.opponent.active),/choose-board-card/);
});
test('Hand effect choices raise only valid cards, not unrelated cards',()=>{
 choiceState('handCard',[{type:'effectChoice',choiceHandIndex:1,choiceCardId:'ecard3-98'}]);
 assert.deepEqual(t.handChoiceActionIndices(0),[]);
 assert.deepEqual(t.handChoiceActionIndices(1),[0]);
});
test('Deck and discard choices expose card metadata but do not resolve before confirming',()=>{
 choiceState('deckCard',[{type:'effectChoice',choiceDeckIndex:1,choiceCardId:'ecard3-8'}]);
 const item=t.choiceCardModel({type:'effectChoice',choiceDeckIndex:1,choiceCardId:'ecard3-8'},0);
 assert.equal(item.cardId,'ecard3-8');assert.equal(item.sourceLabel,'DECK');assert.ok(item.title);
 choiceState('discardCard',[{type:'effectChoice',choiceDiscardIndex:0,choiceCardId:'ecard3-98'}]);
 assert.equal(t.choiceCardModel({type:'effectChoice',choiceDiscardIndex:0,choiceCardId:'ecard3-98'},0).sourceLabel,'DISCARD');
});
test('Attack subchoices remain distinct when two attacks are on the same target',()=>{
 const actions=[{type:'effectChoice',choiceTarget:'active',choiceCardId:'ecard3-65',choiceAttackIndex:0},{type:'effectChoice',choiceTarget:'active',choiceCardId:'ecard3-65',choiceAttackIndex:1}];
 const s=choiceState('attack',actions,{attackSide:'opponent'});
 assert.deepEqual(t.choiceBoardActions(s,actions,'opponent','active',0),[0,1]);
});
test('CPU reveals played Trainers and attacks, with readable per-action pacing',()=>{
 t.setCurrentBattleForTests({sides:{opponent:{active:{cardId:'ecard3-65'}}}},[]);
 assert.equal(t.cpuActionCardId({type:'trainer',cardId:'ecard3-125'},[]),'ecard3-125');
 assert.equal(t.cpuActionCardId({type:'attack',attackCardId:'ecard3-65'},[]),'ecard3-65');
 assert.ok(t.cpuActionDwellMs({type:'trainer'},[])>=2200);
 assert.ok(t.cpuActionDwellMs({type:'attack'},[])>=2600);
 assert.ok(t.cpuActionDwellMs({type:'effectChoice'},[])>=1700);
});
test('Centre rail, CPU reporting, in-place board choices, and version are present in app files',()=>{
 const js=fs.readFileSync(path.join(dir,'tcgp-battle-ui.js'),'utf8'),css=fs.readFileSync(path.join(dir,'tcgp-battle.css'),'utf8');
 assert.match(js,/liveEffectChoiceCenterHtml\(\)/);assert.match(js,/data-tcgp-action="select-choice-card"/);assert.match(js,/data-tcgp-action="confirm-choice-card"/);
 assert.match(js,/tcgp-live-cpu-card-reveal/);assert.match(js,/battleEventSide==='opponent'/);
 assert.match(css,/\.tcgp-live-hand-wrap\.effect-choice-eligible/);assert.match(css,/\.tcgp-live-choice-rail/);assert.match(css,/\.tcgp-live-mid\.is-reporting/);
 // Check synchronized version metadata rather than freezing this UI test to
 // the build number at which the UI was introduced.
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),app=fs.readFileSync(path.join(dir,'app-v0167.js'),'utf8'),gradle=fs.readFileSync(path.join(dir,'../../../build.gradle'),'utf8');
 const version=app.match(/__LUCKYDEX_BUILD='(0\.69\.\d+)'/)?.[1];
 assert.ok(version);assert.ok(html.includes('id="titleBuildVersion">v'+version));
 assert.ok(html.includes('id="appBuildVersion">LUCKY DEX · v'+version));
 assert.ok(gradle.includes("versionName '"+version+"'"));
 assert.match(gradle,/versionCode 7\d{3}/);
});
