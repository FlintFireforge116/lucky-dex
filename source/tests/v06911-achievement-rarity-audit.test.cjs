'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const Ach=require('../app/src/main/assets/achievements-v0341.js');
const Exp=require('../app/src/main/assets/achievements-expansion-v0413.js');
const Rarity=require('../app/src/main/assets/card-rarity-v0253.js');

test('Darkrai-bound Unown achievement is earned by five consecutive Normal decodes',()=>{
  const state={arcade:{unown:{normalBestStreak:4}}};
  const a=Ach.buildCoreAchievements(()=>state).find(x=>x.id==='unown_perfect_5');
  assert.ok(a,'unown_perfect_5 must still exist for its catalogue reward');
  assert.match(a.desc,/5|five/i);
  assert.match(a.desc,/normal/i);
  assert.deepEqual(a.progress(),[4,5]);
  state.arcade.unown.normalBestStreak=5;
  assert.deepEqual(a.progress(),[5,5]);
  assert.equal(a.legacyHidden,undefined,'replacement achievement remains active');
});

test('obsolete Safari, single-perfect Unown and expedition-retreat achievements are legacy hidden without deleting their IDs',()=>{
  const state={arcade:{safariCaught:999,unownPerfect:99},stats:{expeditionRetreats:99}};
  const core=Ach.buildCoreAchievements(()=>state);
  const expansion=Exp.build(()=>state);
  assert.equal(core.find(x=>x.id==='safari_50')?.legacyHidden,true);
  assert.equal(expansion.find(x=>x.id==='v0413_retreats_10')?.legacyHidden,true);
  const binder=read('app/src/main/assets/binder-controls.js');
  assert.match(binder,/id:'unown_perfect'[^\n]*legacyHidden:true/);
  assert.match(binder,/id:'safari_ten'[^\n]*legacyHidden:true/);
});

test('legacy-hidden achievements are excluded from active totals, but a previously claimed legacy row can remain in history',()=>{
  const rows=[
    {a:{id:'active',hidden:false},p:{complete:false,claimed:false,value:0,target:1}},
    {a:{id:'legacy-unclaimed',legacyHidden:true,hidden:false},p:{complete:true,claimed:false,value:10,target:10}},
    {a:{id:'legacy-claimed',legacyHidden:true,hidden:false},p:{complete:true,claimed:true,value:10,target:10}},
  ];
  const active=Ach.achievementRowsForDisplay(rows,'active');
  const complete=Ach.achievementRowsForDisplay(rows,'complete');
  const summary=Ach.achievementSummary(rows);
  assert.deepEqual(active.map(x=>x.a.id),['active']);
  assert.deepEqual(complete.map(x=>x.a.id),['legacy-claimed']);
  assert.deepEqual(summary,{earned:0,total:1});
});

test('known dead metric families are never used by a visible v0.69.11 achievement',()=>{
  const sources=[read('app/src/main/assets/achievements-v0341.js'),read('app/src/main/assets/achievements-expansion-v0413.js')].join('\n');
  // Dead metrics may survive only inside explicitly legacy-hidden definitions.
  const activeCore=Ach.buildCoreAchievements(()=>({})).filter(a=>!a.legacyHidden);
  const activeExp=Exp.build(()=>({})).filter(a=>!a.legacyHidden);
  assert.ok(activeCore.every(a=>a.id!=='safari_50'));
  assert.ok(activeExp.every(a=>a.id!=='v0413_retreats_10'));
  assert.doesNotMatch(String(activeCore.find(a=>a.id==='unown_perfect_5')?.progress),/unownPerfect|perfectRuns/);
  assert.match(sources,/legacyHidden/,'legacy status should be encoded in source, not a destructive migration');
});



test('Lavender achievements still have current earning routes',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  const wild=read('app/src/main/assets/adventure/adventure-wild-hunt.js');
  assert.match(app,/id:'haunted_visit'.*adventureV2\?\.destinations\?\.haunted\?\.encounters/,'prior Wild Hunt activity should count');
  assert.match(wild,/visitedLocations\[id\]\s*=\s*true/,'opening a current Wild Hunt destination must record the visit');
  assert.match(app,/id:'haunted_clear'.*Pok[eé]mon Tower/,'the old Haunted House achievement should map to the current Kanto Pokémon Tower route');
  assert.match(app,/completedLocations/,'current Regional Adventure completion state must drive the migrated clear');
});

test('all catalogue achievement rewards resolve to live achievement IDs',()=>{
  const core=Ach.buildCoreAchievements(()=>({}));
  const expansion=Exp.build(()=>({}));
  const app=read('app/src/main/assets/app-v0167.js');
  const chunk=app.slice(app.indexOf('const ACHIEVEMENTS = ['),app.indexOf('const defaultState'));
  const base=[...chunk.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
  const ids=new Set([...base,...core.map(a=>a.id),...expansion.map(a=>a.id)]);
  const catalogue=require('../app/src/main/assets/cosmetics-catalog-v0413.js').CATALOGUE;
  const refs=catalogue.filter(x=>x.sourceAchievementId);
  assert.ok(refs.length>0);
  assert.deepEqual(refs.filter(x=>!ids.has(x.sourceAchievementId)).map(x=>[x.id,x.sourceAchievementId]),[]);
  assert.ok(ids.has('unown_perfect_5'),'Darkrai source achievement must remain live');
});

test('achievement card rewards and Celestial Storm were verified in the audited card catalogue',()=>{
  const report=read('docs/ACHIEVEMENT_CARD_AUDIT_v06911.md');
  assert.match(report,/Ancient Mew.*Miscellaneous.*available/i);
  assert.match(report,/Victory Medal.*Victory Medals.*available/i);
  assert.match(report,/Celestial Storm.*200.*available/i);
  assert.match(report,/21,337 cards/i);
  assert.match(report,/743.*Unknown/i);
});

test('Unown runtime persists Normal streak progress immediately and Easy cannot advance it',()=>{
  const js=read('app/src/main/assets/arcade-unown.js');
  assert.match(js,/function\s+recordNormalAchievementStreak\s*\(/);
  assert.match(js,/g\.mode\s*!==\s*['"]normal['"]\)return/);
  assert.match(js,/normalBestStreak/);
  assert.match(js,/recordNormalAchievementStreak\(g\)/);
  assert.match(js,/root\.save\?\.\(\)/,'streak progress must save on the correct answer, before cash-out');
});

test('every explicit physical TCG rarity label in the audited index maps to a real LuckyDex rarity class',()=>{
  const expected={
    'Shiny Rare':'ultra',
    'Holo Rare V':'ultra',
    'Holo Rare VMAX':'ultra',
    'Holo Rare VSTAR':'ultra',
    'Rare Shiny GX':'special-illustration',
    'Shiny Rare V or VMAX':'special-illustration',
    'Rare Prism Star':'ultra',
    'Rare Holo Star':'historic-chase',
    'Mega Attack Rare':'secret',
    'Black White Rare':'secret',
    'RGB Rare':'secret',
    'Futuristic Rare':'secret',
  };
  for(const [label,rarityClass] of Object.entries(expected)){
    const c=Rarity.classify({name:'Audit fixture',rarity:label});
    assert.equal(c.rarityClass,rarityClass,`${label} should not display as Unknown`);
    assert.equal(c.diagnostic,null,`${label} should not emit unknown-rarity diagnostics`);
    assert.doesNotMatch(c.revealLabel,/UNKNOWN/i,`${label} should have a useful reveal label`);
  }
});

test('genuinely rarity-less products stay explicit No Rarity instead of being guessed upward',()=>{
  const kit={id:'TK9A',name:'XY Trainer Kit—Pikachu Libre'};
  const c=Rarity.classify({name:'Pikachu Libre',rarity:'No Rarity',set:kit},kit);
  assert.equal(c.rarityClass,'unknown');
  assert.equal(c.diagnostic,null);
  assert.equal(c.revealLabel,'NO RARITY');
  assert.equal(c.originalRarity,'No Rarity');
});

test('v0.69.11 release identity is consistent everywhere',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.69.11');
  assert.equal(lock.version,'0.69.11');
  assert.equal(lock.packages[''].version,'0.69.11');
  assert.match(gradle,/versionCode 6992\b/);
  assert.match(gradle,/versionName '0\.69\.11'/);
  assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.11/);
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.11'/);
  assert.equal((html.match(/v0\.69\.11/g)||[]).length,2);
});
