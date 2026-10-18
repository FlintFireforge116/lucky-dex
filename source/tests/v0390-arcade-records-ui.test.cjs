'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');const css=fs.readFileSync('app/src/main/assets/arcade-records.css','utf8');const world=fs.readFileSync('app/src/main/assets/arcade-world.js','utf8');const records=fs.readFileSync('app/src/main/assets/arcade-records.js','utf8');
for(const id of ['arcadeRecordsView','arcadeRecordsTitle','arcadeRecordsSummary','arcadeRecordsList','arcadeRecordsDetail','arcadeResultMode','arcadeResultScoreboard','arcadeResultStats','arcadeResultPbs','arcadeResultRewards','arcadeResultAchievements','arcadeResultRecords'])assert.ok(html.includes(`id="${id}"`),`missing ${id}`);
assert.match(world,/data-arcade-records/);assert.match(world,/LuckyDexArcadeRecords/);
for(const name of ['open','openGame','openStoredRun','close','isOpen'])assert.match(records,new RegExp(`\\b${name}\\b`),`records API ${name}`);
assert.match(records,/Detailed run history starts with v0\.39\.0/i);assert.match(records,/recent\.length/);assert.match(css,/arcade-records-view/);assert.match(css,/overflow-y:auto/);assert.match(css,/arcade-review-score-row\.player/);
console.log('PASS v0.39.0 arcade records UI contract');
assert.match(records,/Goldenrod Cups/, 'records view should expose Goldenrod cup summaries');
