'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');

const indexWorkflow=fs.readFileSync(path.join(root,'.github/workflows/build-card-art-index.yml'),'utf8');
const releaseDatesPath=path.join(root,'scripts/physical-set-release-dates-v0244.json');
assert.ok(fs.existsSync(releaseDatesPath),'shared physical release-date registry is packaged for index generation');
const sharedDates=JSON.parse(fs.readFileSync(releaseDatesPath,'utf8'));
assert.ok(Object.keys(sharedDates).length>=199,'shared registry covers the validated physical set catalogue');
assert.match(indexWorkflow,/physical-set-release-dates-v0244\.json/,'card-art index generator consumes the shared release-date registry');
assert.match(indexWorkflow,/missing_dates|Missing release dates|release date/i,'card-art index generation fails when any validated set remains undated');

assert.match(flow,/PHYSICAL_SET_RELEASE_DATES_V0244/,'v0.24.4 owns a comprehensive physical release-date table');
function context(){
  const c={console,window:null,state:{cards:{},ui:{packBrowser:{sortKey:'releaseDate',sortDir:'desc',chronologyV0242:true},packMetrics:{}},settings:{}},setCache:{tcg:[],tcgp:[]},document:{getElementById(){return null;}},LuckyDexDebug:{},LuckyDexPack:{dateValue(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;return Date.parse(value+'T00:00:00Z');},placeholder:()=>''},escapeHtml:String,AbortController,URL,setTimeout,clearTimeout,Promise,Date};
  c.window=c;vm.createContext(c);vm.runInContext(flow,c,{filename:'pack-flow-v0165.js'});return c;
}
const c=context();
assert.ok(c.LuckyDexPackReleaseDates,'release-date registry is exposed for verification');
const dates=c.LuckyDexPackReleaseDates;
assert.ok(Object.keys(dates).length>=199,`expected at least 199 assigned physical release dates, got ${Object.keys(dates).length}`);
for(const [name,date] of Object.entries(dates)) assert.match(date,/^\d{4}-\d{2}-\d{2}$/,`${name} must have an exact ISO release date`);
const exact={
  'Base Set':'1999-01-09',
  'Supreme Victors':'2009-08-19',
  'Black & White':'2011-04-25',
  'XY Trainer Kit—Sylveon':'2014-03-12',
  'Hidden Fates':'2019-08-23',
  'Celebrations':'2021-10-08',
  '151':'2023-09-22',
  'My First Battle':'2023-09-29',
  'Prismatic Evolutions':'2025-01-17',
  'Mega Evolution':'2025-09-26',
  '30th Celebration':'2026-09-16'
};
for(const [name,want] of Object.entries(exact)) assert.equal(c.LuckyDexPackReleaseDateForName(name),want,`${name} date`);
c.setCache.tcg=[
  {id:'sv3',name:'Obsidian Flames',cardCount:{total:230}},
  {id:'m23',name:"McDonald's Collection 2023",cardCount:{total:15}},
  {id:'151',name:'151',cardCount:{total:207}},
  {id:'mfb',name:'My First Battle',cardCount:{total:48}},
];
assert.deepEqual(Array.from(c.LuckyDexPackBrowser.rows('tcg','','releaseDate','desc')).map(x=>x.id),['mfb','151','m23','sv3'],'2023 release sort is true chronology, not alphabetical');
const currentCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
const currentName=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
assert.ok(currentCode>=244,'later releases never lower versionCode below the v0.24.4 floor');
const versionParts=String(currentName||'').split('.').map(Number);assert.ok(versionParts[0]>0||versionParts[1]>=24,'later releases remain newer than the v0.24 baseline');
console.log('PASS v0.24.4 comprehensive physical release dates');
