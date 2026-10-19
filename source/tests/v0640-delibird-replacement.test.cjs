'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));

const assetFiles=['arcade-world.js','arcade-help.js','arcade-platform.js','arcade-session.js','achievements-v0341.js','index.html'].map(f=>`app/src/main/assets/${f}`);

test('Tumbling Togepi is completely removed from active LuckyDex source',()=>{
  for(const file of assetFiles)assert.doesNotMatch(read(file),/tumblingTogepi|Tumbling Togepi|tumbling-togepi/i,`${file} still contains Tumbling Togepi`);
  assert.equal(exists('app/src/main/assets/arcade-tumbling-togepi.js'),false);
  assert.equal(exists('app/src/main/assets/arcade-tumbling-togepi-core.js'),false);
  assert.equal(exists('app/src/main/assets/arcade-tumbling-togepi.css'),false);
  for(const report of ['TEST_REPORT_v0.63.0.md','TEST_REPORT_v0.63.1.md','TEST_REPORT_v0.63.2.md'])assert.equal(exists(report),false,`obsolete Tumbling report remains: ${report}`);
  for(const file of fs.readdirSync(path.join(ROOT,'tests')))assert.doesNotMatch(file,/tumbling/i,`obsolete Tumbling test remains: ${file}`);
});

test("Delibird's Delivery is registered across Stadium 2, help, session and page assets",()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const help=read('app/src/main/assets/arcade-help.js');
  const session=read('app/src/main/assets/arcade-session.js');
  const html=read('app/src/main/assets/index.html');
  assert.match(world,/stadium2KidsClub[\s\S]*delibirdDelivery/);
  assert.match(world,/delibirdDelivery:'Delibird’s Delivery'/);
  assert.match(world,/delibirdDelivery:\(\)=>window\.LuckyDexDelibirdDelivery/);
  assert.match(world,/delibirdDelivery:\{sprite:'225\.png',mechanic:'[^']+'\}/);
  assert.match(help,/delibirdDelivery:\{name:'Delibird’s Delivery'/);
  assert.match(session,/delibirdDelivery:\{run:'60 seconds/);
  assert.match(html,/id="delibirdDeliveryGame"/);
  assert.match(html,/id="delibirdDeliveryCountdown"/);
  assert.match(html,/arcade-delibird-delivery\.css/);
  assert.match(html,/arcade-delibird-delivery-core\.js/);
  assert.match(html,/arcade-delibird-delivery\.js/);
});

test("Delibird's Delivery has persistent records and achievements without inventing a rare event",()=>{
  const platform=read('app/src/main/assets/arcade-platform.js');
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(platform,/delibirdDelivery:\{gamesPlayed:0,wins:0,podiums:0,bestScore:0/);
  assert.match(achievements,/delibird_delivery_first_match/);
  assert.match(achievements,/delibird_delivery_first_win/);
  assert.match(achievements,/delibird_delivery_hard_win/);
  assert.match(achievements,/delibird_delivery_big_bag/);
  assert.doesNotMatch(app,/forceDelibirdDeliveryRare/i);
});

test('save migration drops obsolete Tumbling data while preserving unrelated Arcade state',()=>{
  const platformPath=path.join(ROOT,'app/src/main/assets/arcade-platform.js');
  delete require.cache[require.resolve(platformPath)];
  const platform=require(platformPath);
  const migrated=platform.ensureArcadeState({tumblingTogepi:{gamesPlayed:99},customKeep:{hello:'world'}});
  assert.equal(Object.prototype.hasOwnProperty.call(migrated,'tumblingTogepi'),false);
  assert.deepEqual(migrated.customKeep,{hello:'world'});
  assert.ok(migrated.delibirdDelivery);
});
