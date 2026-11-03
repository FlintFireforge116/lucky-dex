'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const uiJs=()=>fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');

test('empty Stadium state renders no battlefield placeholder',()=>{
  const js=uiJs();
  assert.match(js,/if\(!model\.cardId\)return\s*['"]{2}/);
  assert.ok(!js.includes('SHARED FIELD'),'empty Stadium placeholder copy should not exist');
});

test('occupied Stadium is rendered beside the player Active rather than in the middle control strip',()=>{
  const js=uiJs();
  const mid=js.match(/<section class="tcgp-live-mid"[\s\S]*?<\/section>/)?.[0]||'';
  assert.ok(!mid.includes('liveStadiumSlotHtml()'),'middle strip must not own the Stadium');
  assert.match(js,/tcgp-live-player-active[^`]*<\/div>\$\{liveStadiumSlotHtml\(\)\}/s,'Stadium should be a player-mat sibling beside the Active, not anchored inside it');
});

test('Stadium presentation is landscape card art only with no STADIUM/owner caption',()=>{
  const js=uiJs();
  const styles=css();
  assert.match(js,/class="tcgp-live-stadium-card[^\"]*"[^>]*>[\s\S]*?<img/);
  assert.ok(!js.includes('· STADIUM</small>'),'Stadium card should not carry a type caption');
  assert.ok(!js.includes('<span>${esc(card?.name||model.cardId)}</span>'),'Stadium name should not overlay the card art');
  assert.match(styles,/\.tcgp-live-stadium-card\{[^}]*width:[^;}]+;[^}]*height:[^;}]+;[^}]*transform:rotate\(90deg\)/s);
});

test('middle strip no longer reserves Stadium width and is slimmer',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-mid\{[^}]*grid-template-columns:auto minmax\(0,1fr\)[^}]*padding:0 2px/s);
  assert.match(styles,/\.tcgp-live-arena\{[^}]*grid-template-rows:minmax\(0,\.36fr\) 26px minmax\(0,\.64fr\)/s);
});
