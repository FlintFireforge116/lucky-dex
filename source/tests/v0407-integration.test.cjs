'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('special-events helper loads before Berry Picker and Unown runtimes',()=>{
  const html=read('app/src/main/assets/index.html');
  const helper=html.indexOf('arcade-special-events-v0407.js');
  assert(helper>0);
  assert(helper<html.indexOf('arcade-amie.js'));
  assert(helper<html.indexOf('arcade-unown.js'));
});

test('Berry Picker uses the shared persisted rare reward attempt and end-of-run claim path',()=>{
  const js=read('app/src/main/assets/arcade-amie.js');
  assert.match(js,/berryPicker[\s\S]*getOrCreateAttempt/);
  assert.match(js,/special[\s\S]*delivered/);
  assert.match(js,/claimAttempt\(root\.state,'berryPicker'/);
  assert.match(js,/resolveArcadeReward/);
  assert.match(js,/berry-special-reward/);
});

test('Unown shiny glyphs persist on the question and claim a matching card after success',()=>{
  const js=read('app/src/main/assets/arcade-unown.js');
  assert.match(js,/createUnownShiny/);
  assert.match(js,/shinyGlyph/);
  assert.match(js,/dataset\.shinyUnown|data-shiny-unown/);
  assert.match(js,/resolveCardForLetter/);
  assert.match(js,/claimAttempt/);
});

test('Profile contains a compact achievements summary and a dedicated achievements sub-screen',()=>{
  const html=read('app/src/main/assets/index.html');
  assert.match(html,/id="achievementSummaryCard"/);
  assert.match(html,/id="profileAchievementsView"[^>]*hidden/);
  assert.match(html,/id="achievementsBackBtn"/);
  const profile=html.slice(html.indexOf('<section class="page" data-page="profile">'),html.indexOf('</section>',html.indexOf('<section class="page" data-page="profile">'))+10);
  assert(profile.indexOf('achievementSummaryCard')<profile.indexOf('profileAchievementsView'));
});

test('returning to Profile from bottom nav resets the achievements sub-screen without changing shared navigate()',()=>{
  const js=read('app/src/main/assets/app-v0167.js');
  assert.match(js,/\[data-nav\][\s\S]{0,220}dataset\.nav==='profile'[\s\S]{0,120}showProfileMainView\(\)[\s\S]{0,120}navigate\(b\.dataset\.nav\)/);
});
