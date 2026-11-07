'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const lab=require(path.join(assets,'tcgp-substitute-lab.js'));
const source=name=>fs.readFileSync(path.join(assets,name),'utf8');
function fixture(){
  const listeners={};const container={innerHTML:'',contains:()=>true,addEventListener:(type,fn)=>listeners[type]=fn,removeEventListener:type=>delete listeners[type]};
  lab.open({container,art:()=>''});
  function tap(labAction,rest={}){const btn={dataset:{labAction,...rest}};listeners.click({target:{closest:()=>btn}});return container.innerHTML;}
  return{container,tap};
}
test('Build and both prominent version labels are updated',()=>{
 const version=require('node:fs').readFileSync(path.resolve(assets,'../../../build.gradle'),'utf8').match(/versionName '(\d+\.\d+\.\d+)'/)?.[1];assert.ok(version);
 assert.ok(source('index.html').includes('v'+version));
 assert.ok(source('app-v0167.js').includes("__LUCKYDEX_BUILD='"+version+"'"));
});
test('Android back delegates to active TCG screen before WebView history can break the shell',()=>{
 const app=source('app-v0167.js').split('window.handleLuckyBack=function(){')[1],ui=source('tcgp-battle-ui.js');
 assert.ok(app.indexOf("if(battleView&&!battleView.hidden)")<app.indexOf("document.body.classList.contains('pack-opening')"));
 assert.match(app,/LuckyDexTCGPBattleUI\?\.back\?\.\(\)/);
 assert.match(ui,/back\};\s*\}\);/);
 assert.match(ui,/if\(screen==='home'\)\{close\(\);return true;\}/);
 assert.match(ui,/setBattleLive\(true\);setScreen\('substitute-lab'\)/);
});
test('Lab has a fixed battlefield and its tools are hidden in modal sheets',()=>{
 const {container,tap}=fixture(),html=container.innerHTML;
 assert.match(html,/tcgp-lab-compact-header/);
 assert.match(html,/tcgp-lab-dock/);
 assert.doesNotMatch(html,/tcgp-lab-modal/);
 assert.equal((html.match(/data-lab-action="slot"/g)||[]).length,12);
 assert.equal((html.match(/data-lab-action="open-pile"/g)||[]).length,4);
 assert.match(tap('open-actions'),/tcgp-lab-modal/);
 assert.match(container.innerHTML,/Trigger actual effects/);
 assert.equal(lab.handleBack(),true);
 assert.doesNotMatch(container.innerHTML,/tcgp-lab-modal/);
 assert.equal(lab.handleBack(),false);
 lab.close();
});
test('Decks for each side can be opened and a chosen physical card removed out of game and restored',()=>{
 const {tap,container}=fixture();const state=lab.getState();
 const left=state.sides.player.deck.length,right=state.sides.opponent.deck.length;
 const ref=state.sides.opponent.deck[0];
 assert.match(tap('open-pile',{side:'opponent',kind:'deck'}),/CPU deck/);
 assert.match(container.innerHTML,/data-lab-action="remove-ref" data-side="opponent" data-kind="deck"/);
 tap('remove-ref',{side:'opponent',kind:'deck',refUid:ref.uid});
 assert.equal(state.sides.opponent.deck.length,right-1);
 assert.equal(state.sides.opponent.removed.length,1);
 assert.equal(state.sides.player.deck.length,left);
 assert.equal(state.sides.opponent.removed[0].uid,ref.uid);
 tap('open-pile',{side:'opponent',kind:'removed'});
 assert.match(container.innerHTML,/Restore/);
 tap('move-ref',{side:'opponent',kind:'removed',refUid:ref.uid,to:'deck'});
 assert.equal(state.sides.opponent.deck.length,right);
 assert.equal(state.sides.opponent.removed.length,0);
 lab.close();
});
test('Tapping board position opens mobile controls while full card catalogue is available behind Cards',()=>{
 const {tap,container}=fixture();
 tap('slot',{side:'player',zone:'bench',index:'4'});
 assert.match(container.innerHTML,/You · Bench 5/);
 assert.match(container.innerHTML,/data-lab-action="energy"/);
 assert.match(container.innerHTML,/data-lab-action="damage"/);
 tap('open-cards',{zone:'bench',side:'player'});
 assert.match(container.innerHTML,/All Classic Cards/);
 assert.match(container.innerHTML,/Florio Nature Park/);
 tap('select-card',{id:'SNAPFLORIO-001'});
 tap('place',{zone:'bench'});
 assert.equal(lab.getState().sides.player.bench.find(x=>x.benchSlot===4)?.cardId,'SNAPFLORIO-001');
 lab.close();
});
test('Native viewport lab CSS has no page scroll and resizes the battlefield to free space',()=>{
 const css=source('tcgp-substitute-lab.css');
 assert.match(css,/body\.tcgp-battle-live \.tcgp-substitute-lab\s*\{/);
 assert.match(css,/flex:1 1 0;min-height:0;max-width:none;width:100%;margin:0;overflow:hidden/);
 assert.match(css,/\.tcgp-lab-modal\{position:absolute/);
 assert.match(css,/\.tcgp-lab-zone-grid\{display:grid/);
});
