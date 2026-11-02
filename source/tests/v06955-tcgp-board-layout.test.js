'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));

test('attached Tools render as individually inspectable mini-card thumbnails on the Pokémon',()=>{
  const html=ui._test.liveCardHtml({
    uid:'p1',cardId:'A1-001',damage:0,energy:{},conditions:{},
    tool:{uid:'t1',cardId:'A2-147'},
    extraTools:[{uid:'t2',cardId:'A2-148'}]
  },{side:'player',zone:'active',index:0});

  assert.match(html,/tcgp-live-tool-stack/);
  assert.equal((html.match(/tcgp-live-tool-mini/g)||[]).length,2);
  assert.match(html,/data-zone="tool-active"/);
  assert.match(html,/data-tool-index="0"/);
  assert.match(html,/data-tool-index="1"/);
  assert.ok(!html.includes('class="tcgp-live-tools"'),'legacy TOOL text badge should be removed');
});

test('Bench Tools use the compact mini-card treatment and remain inspectable',()=>{
  const html=ui._test.liveCardHtml({
    uid:'p2',cardId:'A1-001',damage:0,energy:{},conditions:{},
    tool:{uid:'t1',cardId:'A2-147'},extraTools:[]
  },{compact:true,side:'opponent',zone:'bench',index:2});
  assert.match(html,/tcgp-live-tool-stack compact/);
  assert.match(html,/data-side="opponent"/);
  assert.match(html,/data-zone="tool-bench"/);
  assert.match(html,/data-index="2"/);
});

test('Stadium is a right-side field utility and no longer consumes a centre grid column',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.match(css,/\.tcgp-live-stadium-slot\{[^}]*position:absolute[^}]*right:/s);
  assert.match(css,/\.tcgp-live-mid\{[^}]*grid-template-columns:auto minmax\(0,1fr\)/s);
  assert.ok(css.lastIndexOf('grid-template-columns:auto minmax(0,1fr)')>css.lastIndexOf('grid-template-columns:auto clamp(54px,15vw,68px) minmax(0,1fr)'), 'right-side Stadium override must win the cascade');
});

test('battlefield middle lane is slimmer and Bench presentation gets more width',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.match(css,/\.tcgp-live-arena\{[^}]*grid-template-rows:minmax\(0,\.36fr\) 30px minmax\(0,\.64fr\)/s);
  assert.match(css,/\.tcgp-live-opponent-bench,\.tcgp-live-player-bench\{[^}]*width:88%[^}]*max-width:330px/s);
});
