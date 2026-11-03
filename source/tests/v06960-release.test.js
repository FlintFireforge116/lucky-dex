const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const app = read('app/src/main/assets/app-v0167.js');
const html = read('app/src/main/assets/index.html');
const ui = read('app/src/main/assets/tcgp-battle-ui.js');
const css = read('app/src/main/assets/tcgp-battle.css');

test('runtime remains at or beyond v0.69.60 and visible/runtime markers agree', () => {
  const runtime=app.match(/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/)?.[1];
  assert.ok(runtime);
  assert.ok(Number(runtime.split('.').at(-1))>=60);
  assert.match(html,new RegExp(`v${runtime.replace(/\./g,'\\.')}`));
});

test('battle no longer exposes the generic centre card drop target', () => {
  assert.doesNotMatch(ui, /data-card-play-zone=["']1["']/);
});

test('battle layout uses a fixed 2:1 playmat coordinate system', () => {
  assert.match(css, /\.tcgp-live-mat-half\s*\{[^}]*aspect-ratio:\s*2\s*\/\s*1/s);
  assert.match(css, /background-size:\s*100%\s+200%/);
});

test('active actions are temporary and no longer embedded in the player mat card slot', () => {
  assert.match(ui, /open-pokemon-actions/);
  assert.match(ui, /tcgp-live-pokemon-action-sheet/);
  assert.doesNotMatch(ui, /<section class="tcgp-live-player-actions"/);
});
