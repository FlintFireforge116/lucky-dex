'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

const KANTO_PLACES=[
  'Pallet Town','Route 1','Viridian City','Viridian Forest','Pewter City','Pewter Gym',
  'Route 3','Mt. Moon','Cerulean City','Cerulean Gym','Nugget Bridge','Route 5','Route 6',
  'Vermilion City','Vermilion Gym','Rock Tunnel','Lavender Town','Route 8','Celadon City','Celadon Gym',
  'Cycling Road','Route 15','Fuchsia City','Fuchsia Gym','Pokémon Tower','Saffron City','Saffron approach','Saffron Gym',
  'Route 19','Seafoam Islands','Cinnabar Island','Pokémon Mansion','Cinnabar Gym','Route 21','Route 22','Viridian Gym',
  'Route 23','Victory Road','Indigo Plateau'
];

test('Kanto canonical scene overlay covers every authored Kanto journey place',()=>{
  const mod=require('../app/src/main/assets/adventure/adventure-kanto-canonical-v0410.js');
  for(const name of KANTO_PLACES){
    const row=mod.MAPS[name];
    assert.ok(row,`missing canonical scene mapping for ${name}`);
    assert.equal(row.canonicalMapScreenshot,true,`${name} must be marked canonical`);
    assert.match(row.path,/^https:\/\//,`${name} should resolve to canonical remote map source`);
    assert.ok(Number(row.width)>0&&Number(row.height)>0,`${name} needs dimensions`);
  }
});

test('canonical Kanto overlay installs into the shared scene catalog without deleting fallbacks',()=>{
  const mod=require('../app/src/main/assets/adventure/adventure-kanto-canonical-v0410.js');
  const catalog={scenes:{fallback:{id:'fallback',path:'local.png'}},named:{kanto:{Legacy:'fallback'}},places:{legacy:'fallback'}};
  mod.install(catalog);
  assert.equal(catalog.scenes.fallback.path,'local.png');
  assert.equal(catalog.named.kanto['Pallet Town'],'kanto-canonical-pallet-town');
  assert.equal(catalog.places['kanto-pallet-town'],'kanto-canonical-pallet-town');
  assert.equal(catalog.scenes['kanto-canonical-pallet-town'].canonicalMapScreenshot,true);
});

test('Adventure loads the canonical overlay before location flow and regional UI',()=>{
  const html=read('app/src/main/assets/index.html');
  const scenes=html.indexOf('adventure-location-scenes.js');
  const overlay=html.indexOf('adventure/adventure-kanto-canonical-v0410.js');
  const flow=html.indexOf('adventure/adventure-location-flow.js');
  const ui=html.indexOf('adventure/adventure-regional-ui.js');
  assert.ok(scenes>=0&&overlay>scenes&&flow>overlay&&ui>flow,'script order must install canonical scenes before flow/UI capture catalog');
});

test('journey scene renderer falls back locally if a canonical remote map fails',()=>{
  const ui=read('app/src/main/assets/adventure/adventure-regional-ui.js');
  assert.match(ui,/data-place-fallback=/);
  assert.match(ui,/onerror=/);
});

test('obsolete Gold Rock secret achievement is removed from definitions and migrated state',()=>{
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.doesNotMatch(achievements,/rock_harden_gold_perfect/);
  assert.doesNotMatch(achievements,/Perfect Harden a Gold Rock/);
  assert.match(app,/LuckyDexRetiredAchievementMigrationV0410[^\n]*scrub/);
});

test('Gold Rock shine has no square outline/background treatment',()=>{
  const css=read('app/src/main/assets/arcade-rock-harden.css');
  const rule=(css.match(/\.rock-harden-rock\.is-gold\{([^}]*)\}/)||[])[1]||'';
  assert.ok(rule,'missing Gold Rock style');
  assert.doesNotMatch(rule,/box-shadow\s*:/i);
  assert.doesNotMatch(rule,/background\s*:/i);
  assert.doesNotMatch(rule,/outline\s*:/i);
  assert.match(rule,/filter\s*:/i);
});

test('Unown letter rewards accept ordinary cards and are not filtered to shiny or rare cards',()=>{
  const helper=require('../app/src/main/assets/arcade-special-events-v0407.js');
  const rows=[{id:'a',name:'Gardevoir',rarity:'Common'},{id:'b',name:'Gastly',rarity:'Common'},{id:'c',name:'Pikachu',rarity:'Rare'}];
  assert.deepEqual(helper.cardsForLetter(rows,'G').map(x=>x.id),['a','b']);
  const app=read('app/src/main/assets/app-v0167.js');
  const fn=(app.match(/async function resolveCardForLetterV0407\(letter\)\{([\s\S]*?)\n\}/)||[])[1]||'';
  assert.doesNotMatch(fn,/shiny|looksRare|rarityTier|rareHit/i);
});

test('Unown reward reveal describes the letter reward without implying the card itself is shiny',()=>{
  const unown=read('app/src/main/assets/arcade-unown.js');
  assert.doesNotMatch(unown,/SHINY UNOWN REWARD/);
  assert.match(unown,/UNOWN[^'"`]*REWARD|LETTER REWARD/);
});

test('canonical Kanto maps use a stable phone-friendly display frame even for very tall routes',()=>{
  const mod=require('../app/src/main/assets/adventure/adventure-kanto-canonical-v0410.js');
  assert.equal(mod.MAPS['Route 23'].displayAspect,'4/3');
  assert.equal(mod.MAPS['Cycling Road'].displayAspect,'4/3');
  const ui=read('app/src/main/assets/adventure/adventure-regional-ui.js');
  assert.match(ui,/displayAspect/,'renderer should honour a display aspect independent of source dimensions');
  assert.match(ui,/aspect-ratio:\$\{displayAspect\}/,'canonical frame should use the display aspect');
});

test('retired achievement migration scrubs old claims and stored Arcade review rows',()=>{
  const migration=require('../app/src/main/assets/retired-achievement-migrations-v0410.js');
  const state={
    profile:{achievementClaims:['rock_harden_gold_perfect','other']},
    arcade:{records:{games:{unown:{recent:[
      {achievements:[{id:'rock_harden_gold_perfect',name:'All That Glitters'},{id:'keep',name:'Keep'}]},
      {achievements:[{id:'keep2',name:'Keep 2'}]}
    ]}}}}
  };
  migration.scrub(state);
  assert.deepEqual(state.profile.achievementClaims,['other']);
  assert.deepEqual(state.arcade.records.games.unown.recent[0].achievements,[{id:'keep',name:'Keep'}]);
  assert.deepEqual(state.arcade.records.games.unown.recent[1].achievements,[{id:'keep2',name:'Keep 2'}]);
});

test('retired achievement migration loads before app state initialization',()=>{
  const html=read('app/src/main/assets/index.html');
  const migration=html.indexOf('retired-achievement-migrations-v0410.js');
  const app=html.indexOf('app-v0167.js');
  assert.ok(migration>=0&&migration<app,'migration helper must exist before app-v0167 initializes state');
  const source=read('app/src/main/assets/app-v0167.js');
  assert.match(source,/LuckyDexRetiredAchievementMigrationV0410[^\n]*scrub/);
});

test('canonical Kanto scenes retain a visible player marker without baking it into map art',()=>{
  const mod=require('../app/src/main/assets/adventure/adventure-kanto-canonical-v0410.js');
  const row=mod.MAPS['Pallet Town'];
  assert.equal(row.playerMarker,true);
  const ui=read('app/src/main/assets/adventure/adventure-regional-ui.js');
  assert.match(ui,/adv3-canonical-player-marker/);
  assert.match(ui,/adventure\/art\/trainers\/red\.png/);
});
