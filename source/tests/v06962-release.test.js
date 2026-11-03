'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const app=read('app/src/main/assets/app-v0167.js');
const html=read('app/src/main/assets/index.html');
const ui=read('app/src/main/assets/tcgp-battle-ui.js');

test('release markers are v0.69.62',()=>{
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.62'/);
  assert.match(html,/v0\.69\.62/);
});

test('v06962 uses card-first Pokemon controls with no permanent action dock',()=>{
  assert.match(ui,/open-pokemon-actions/);
  assert.match(ui,/livePokemonActionsOverlayHtml/);
  assert.doesNotMatch(ui,/<section class="tcgp-live-player-actions"/);
});
