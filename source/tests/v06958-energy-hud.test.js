'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('TCG UI assets exposes real energy icon URLs for Pocket and future standard migration',()=>{
  const uiAssets=require(path.join(assets,'tcgp-ui-assets.js'));
  for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Dragon','Colorless']){
    assert.match(uiAssets.energyIconUrl(type),/archives\.bulbagarden\.net\/media\/upload/);
    assert.match(uiAssets.energyIconHtml(type,{className:'x'}),/<img/);
  }
});

test('battle UI uses icon energy markup and removes energy wording from the source control',()=>{
  const src=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  assert.match(src,/energyIconHtml/);
  assert.ok(!/\.toUpperCase\(\)}<br>NEXT/.test(src),'bottom-right energy source should not print ENERGY/NEXT words');
});

test('end turn control has a compact mobile-safe width',()=>{
  const css=fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
  assert.match(css,/\.tcgp-live-end-turn\{[^}]*max-width:[^;}]+[^}]*font-size:/s);
});
