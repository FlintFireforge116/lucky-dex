'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

function editorHarness(kind){
 const classic=kind==='classic';
 const prefix=classic?'classic':'tcgp';
 const factory=require(path.join(assets,classic?'tcg-classic-deck-editor.js':'tcgp-deck-editor.js'));
 const D=require(path.join(assets,classic?'tcg-classic-battle-data.js':'tcgp-battle-data.js'));
 const K=require(path.join(assets,classic?'tcg-classic-decks.js':'tcgp-battle-decks.js'));
 const W=require(path.join(assets,classic?'tcg-classic-deck-workspace.js':'tcgp-deck-workspace.js'));
 const state={};
 const id=classic?'base1-4':'A1-001';
 assert.ok(D.cardById(id),'Test card '+id+' exists');
 const saved={id:classic?'classic-1':'pocket-1',name:'My saved deck',cards:[id],energyMode:'manual',energyTypes:['Fire'],preferredPrints:{[id]:id}};
 const b=classic?K.ensureState(state):K.ensureBattleState(state);
 b.decks=[{...saved,cards:saved.cards.slice()}];b.activeDeckId=saved.id;
 const savedBefore=JSON.stringify(b.decks[0]);
 const elements=new Map();
 const sheet={scrollTop:0,getAttribute:()=>null,querySelector:sel=>sel.includes('close-sheet')?{focus(){}}:null,querySelectorAll:()=>[]};
 class FakeElement{
  constructor(){this.innerHTML='';this.scrollTop=0;this.scrollLeft=0;this.hidden=false;this.listeners={};this.dataset={};this.textContent='';}
  addEventListener(type,callback){this.listeners[type]=callback;}
  setAttribute(){}
  querySelector(selector){
   if(selector==='.tcgp-editor-deck-grid')return new FakeElement();
   if(selector==='.tcgp-editor-sheet')return this.innerHTML.includes('tcgp-editor-sheet')?sheet:null;
   if(selector.includes('clear-filters')||selector.includes('filters'))return new FakeElement();
   if(selector.includes('close-sheet'))return {focus(){}};
   return null;
  }
 }
 const document={activeElement:null,getElementById(id){if(!elements.has(id))elements.set(id,new FakeElement());return elements.get(id);}};
 const root={document,clearTimeout,setTimeout};
 root[classic?'LuckyDexClassicTCGBattleData':'LuckyDexTCGPBattleData']=D;
 if(classic){root.LuckyDexClassicTCGDecks=K;root.LuckyDexClassicTCGDeckWorkspace=W;root.LuckyDexClassicTCGDeckBuilder=require(path.join(assets,'tcg-classic-deck-builder.js'));root.LuckyDexClassicSetPicker=require(path.join(assets,'tcg-classic-set-picker.js'));}
 else{root.LuckyDexTCGPBattleDecks=K;root.LuckyDexTCGPDeckWorkspace=W;}
 const editor=factory(root);
 const container=new FakeElement();
 const host={container,sandbox:false,deck:saved,state:()=>state,owned:()=>[],art:()=>'',save:()=>{},rules:()=>''};
 editor.open(host);
 const actionName=classic?'classicDeckWorkspace':'tcgpDeckWorkspace',attr=classic?'data-classic-deck':'data-deck';
 function act(action){const button={dataset:{[classic?'classicDeck':'deck']:action}};const event={target:{closest(selector){return selector===`[${attr}]`?button:null;}},stopPropagation(){}};elements.get(actionName).listeners.click(event);}
 return {editor,saved,b,savedBefore,act,elements,prefix,kind,attr,container};
}
for(const kind of ['classic','pocket']){
 test(`${kind}: Clear deck requires confirmation, preserves saved state, and resets draft`,()=>{
  const h=editorHarness(kind);
  assert.match(h.container.innerHTML,/Clear deck/);
  h.act('clear-deck');
  const modal=h.elements.get(h.kind==='classic'?'classicEditorModal':'tcgpEditorModal');
  assert.match(modal.innerHTML,/Clear deck\?/);assert.match(modal.innerHTML,/confirm-clear-deck/);
  assert.equal(h.editor.isDirty(),false,'Opening confirmation must not change the deck');
  assert.equal(JSON.stringify(h.b.decks[0]),h.savedBefore,'Original saved deck must remain intact');
  h.act('close-sheet');assert.equal(h.editor.isDirty(),false,'Cancellation must leave the deck untouched');
  h.act('clear-deck');h.act('confirm-clear-deck');
  assert.equal(h.editor.isDirty(),true,'Draft is now dirty until saved');
  const deckNode=h.elements.get(h.kind==='classic'?'classicMyDeck':'tcgpMyDeck');
  assert.match(deckNode.innerHTML,/0 \/ (?:20|30)/);
  assert.match(deckNode.innerHTML,/data-(?:classic-)?deck="clear-deck"[^>]+disabled/);
  assert.equal(JSON.stringify(h.b.decks[0]),h.savedBefore,'Clear must not immediately overwrite an existing saved deck');
  h.act('save');
  assert.deepEqual(h.b.decks[0].cards,[]);
  assert.equal(h.b.decks[0].energyMode,'auto');
  assert.equal(h.b.decks[0].name,'My saved deck');
  assert.equal(h.b.decks[0].draft,true,'An empty saved deck remains an editable draft');
  assert.equal(h.editor.isDirty(),false,'Save establishes a new clean baseline');
  h.editor.close();
 });
}
test('Clear deck styling and Android, JS, and visible versions stay in sync',()=>{
 const css=fs.readFileSync(path.join(assets,'tcgp-deck-editor.css'),'utf8');
 assert.match(css,/tcgp-editor-deck-actions/);assert.match(css,/tcgp-editor-danger/);
 const gradle=fs.readFileSync(path.resolve(assets,'../../../build.gradle'),'utf8');
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
 const version=/versionName '([^']+)'/.exec(gradle)?.[1];
 assert.equal(version,'0.69.153');assert.match(gradle,/versionCode 7133/);
 assert.ok(app.includes("window.__LUCKYDEX_BUILD='"+version+"'"));
 assert.ok(html.includes('id="titleBuildVersion">v'+version));
 assert.ok(html.includes('id="appBuildVersion">LUCKY DEX · v'+version));
});
