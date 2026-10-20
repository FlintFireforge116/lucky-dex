const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const controller = fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-controller.js'),'utf8');
const ui = fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-regional-ui.js'),'utf8');

test('fishing encounter arms a battle input guard before returning to journey battle UI', () => {
  assert.match(controller, /journey\.guardBattleInput\?\.\(\d+\)/, 'fishing handoff should arm journey battle input guard');
  assert.match(ui, /function guardBattleInput\(ms=/, 'journey UI should expose battle input guard');
  assert.match(ui, /battleInputLockedUntil/, 'journey UI should track guarded-until timestamp');
});

test('battle action dispatch rejects taps during the fishing handoff guard', () => {
  assert.match(ui, /if\(\(el\.dataset\.advBattle\|\|el\.dataset\.advCommand\)&&Date\.now\(\)<battleInputLockedUntil\)return/, 'battle action dispatch must ignore guarded taps');
});

test('battle action buttons are visibly disabled during the guard and later re-enabled', () => {
  assert.match(ui, /querySelectorAll\('\[data-adv-command\],\[data-adv-battle="flee"\]'\).*disabled=true/, 'battle controls should render disabled during guard');
  assert.match(ui, /battleInputLockedUntil=0/, 'guard should clear after delay');
  assert.match(ui, /disabled=false/, 'battle controls should re-enable after delay');
});
