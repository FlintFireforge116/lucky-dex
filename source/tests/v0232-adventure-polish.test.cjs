const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const wildHunt = fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-wild-hunt.js'),'utf8');
const css = fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure.css'),'utf8');
const battle = fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-battle.js'),'utf8');
const model = require(path.join(root,'app/src/main/assets/adventure/adventure-model.js'));
const gradle = fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');

function test(name, fn){
  try { fn(); console.log('PASS', name); }
  catch (err) { console.error('FAIL', name, '\n ', err.message); process.exitCode = 1; }
}

test('coin field discoveries use a Lucky Coin visual and label, not the Lucky Egg asset', () => {
  assert.match(wildHunt, /adv-discovery-coin/);
  assert.match(wildHunt, /Lucky Coins/);
  assert.match(wildHunt, /function syncHotspots/);
  assert.doesNotMatch(wildHunt, /item\(e\.key==='coins'\?'coin':e\.key\)/);
});

test('Wild Hunt hotspots share the same scene coordinate space as the displayed habitat', () => {
  assert.match(css, /\.adv-roam \.adv-environment\s*\{[^}]*opacity\s*:\s*0/);
  assert.match(css, /\.adv-habitat\s*\{[^}]*background-image\s*:\s*var\(--adv-scene\)/);
  const meadow = model.HOTSPOT_BLUEPRINTS.meadow;
  const tracks = meadow.find(x => x.clue === 'Fresh tracks');
  const tree = meadow.find(x => x.clue === 'Shaking tree');
  assert(tracks && tracks.y <= 14, `Fresh tracks should sit on the upper path, got y=${tracks?.y}`);
  assert(tree && tree.x >= 65 && tree.y <= 10, `Shaking tree should sit on the isolated upper-right tree, got ${tree?.x},${tree?.y}`);
});

test('battle UI does not jump both HP bars to the final turn state before animation', () => {
  const actStart = wildHunt.indexOf('async function act(command,args={})');
  const actEnd = wildHunt.indexOf('function guideView()', actStart);
  assert(actStart>=0 && actEnd>actStart, 'Wild Hunt battle action must be found');
  const actBody = wildHunt.slice(actStart, actEnd);
  assert.match(actBody, /await B\.animate\(host,result\.action/);
  assert(actBody.indexOf('await B.animate(')<actBody.lastIndexOf('renderBattle()'), 'animation must finish before the final battle render');
  assert.doesNotMatch(actBody, /B\.update\(host,f\);busy=true/);
  assert.match(battle, /ENEMY_TURN_DELAY\s*=\s*420/);
  assert.match(battle, /updateEventHud/);
});

test('release metadata preserves the v0.23.2 update floor', () => {
  const code=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
  assert(code>=232, `versionCode must remain >=232, got ${code}`);
  assert.match(gradle, /versionName\s+['"][0-9]+\.[0-9]+\.[0-9]+['"]/);
});
