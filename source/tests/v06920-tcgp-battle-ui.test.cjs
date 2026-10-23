const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname,'..','app','src','main','assets');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const cssPath = path.join(root,'tcgp-battle.css');
const uiPath = path.join(root,'tcgp-battle-ui.js');

test('Card Shop contains a dedicated TCG Battle subview and reusable help controls', () => {
  assert.match(html,/id="tcgpBattleEntry"/);
  assert.match(html,/id="tcgpBattleView"[^>]*hidden/);
  assert.match(html,/id="tcgpBattleBack"/);
  assert.match(html,/id="tcgpBattleInfo"/);
  assert.match(html,/id="tcgpBattleHelp"[^>]*hidden/);
  assert.match(html,/Goal/i);
  assert.match(html,/Controls/i);
  assert.match(html,/Important rules/i);
  assert.match(html,/Tip/i);
});

test('battle modules and stylesheet are wired in dependency order', () => {
  assert.ok(fs.existsSync(cssPath));
  assert.ok(fs.existsSync(uiPath));
  assert.match(html,/tcgp-battle\.css/);
  const names=['tcgp-battle-data.js','tcgp-battle-decks.js','tcgp-battle-effects.js','tcgp-battle-core.js','tcgp-battle-ai.js','tcgp-battle-solo.js','tcgp-battle-progress.js','tcgp-battle-ui.js'];
  const positions=names.map(name=>html.indexOf(name));
  positions.forEach((pos,i)=>assert.ok(pos>0,`${names[i]} must be loaded`));
  for(let i=1;i<positions.length;i++)assert.ok(positions[i]>positions[i-1],`${names[i]} must load after ${names[i-1]}`);
});

test('opening Battle Lab can actually hide the Pack home beneath it', () => {
  const appCss=fs.readFileSync(path.join(root,'styles-v013.css'),'utf8');
  assert.match(appCss,/\.pack-home\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/s);
});

test('mobile battle CSS keeps core controls touchable and battle content above navigation', () => {
  const css=fs.readFileSync(cssPath,'utf8');
  assert.match(css,/\.tcgp-battle-action[^}]*min-height:\s*44px/s);
  assert.match(css,/\.tcgp-battle-view[^}]*padding-bottom:/s);
  assert.match(css,/@media\s*\(max-width:\s*600px\)/);
});

test('UI labels the first playable actions clearly', () => {
  const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
  const fakeState={sides:{player:{active:{cardId:'A1-001'},bench:[{cardId:'A1-014'}]}}};
  assert.match(ui.actionLabel({type:'attach',target:'active'},fakeState,'player'),/ATTACH.*Bulbasaur/i);
  assert.match(ui.actionLabel({type:'retreat',benchIndex:0},fakeState,'player'),/RETREAT.*Paras/i);
  assert.match(ui.actionLabel({type:'trainer',cardId:'BASIC-POKE-BALL'},fakeState,'player'),/POKE BALL/i);
});

test('coverage summary distinguishes battle-enabled gameplay cards from the wider owned Pocket collection', () => {
  const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
  const summary=ui.coverageForOwnedCards({
    base:{source:'tcgp',id:'A1-001',setId:'A1',name:'Bulbasaur',count:1},
    alt:{source:'tcgp',id:'A1-227',setId:'A1',name:'Bulbasaur',count:1},
    supported:{source:'tcgp',id:'A1-014',setId:'A1',name:'Paras',count:1},
    future:{source:'tcgp',id:'A2-999',setId:'A2',name:'Future Card',count:1},
    physical:{source:'physical',id:'x',name:'Not Pocket',count:1}
  });
  assert.deepEqual(summary,{supportedGameplay:2,pocketPrints:4});
});
