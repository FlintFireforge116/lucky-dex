const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=f=>path.join(root,'app/src/main/assets',f);
const read=f=>fs.readFileSync(asset(f),'utf8');

// Removed game stays removed from runtime but its historical save field survives migrations.
const world=read('arcade-world.js'), platform=read('arcade-platform.js'), app=read('app-v0167.js');
assert(!world.includes("headIt:'Head It'"));
assert(!world.includes("'headIt'"));
assert(app.includes('bestHeadIt:{easy:0,normal:0,hard:0,unlimited:0,unlimitedStreak:0}'));
assert(platform.includes('bestHeadIt:{...ARCADE_DEFAULTS.bestHeadIt'));

// Moon Stage restoration is the v0.17 memory game, not classroom arrows.
const clefairy=require(asset('clefairy-memory.js'));
assert.deepEqual(clefairy.ACTIONS,['star','song','moon','spin']);
assert.equal(clefairy.SYMBOLS.join(''),'⭐🎵🌙💫');
for(const f of ['moon_stage_bg3.png','clefairy_pose_idle.png','clefairy_pose_star.png','clefairy_pose_song.png','clefairy_pose_moon.png','clefairy-scene.js','clefairy-scene.css'])assert(fs.existsSync(asset(f)),f+' must be packaged');
assert(world.includes("clefairy:()=>window.LuckyDexClefairyGame"));
assert(world.includes("clefairy:'Clefairy Says'"));
assert(!read('clefairy-memory.js').includes('classroom')); // game itself remains the restored Moon Stage memory game

// Historical v0.16.x Blender presentation/mechanics are active again.
const berryCss=read('berry-blender.css'), berryJs=read('berry-blender.js');
for(const marker of ['berry-player-hit-zone','berry-station-you','berry-station-mister','berry-station-laddie','berry-station-lassie'])assert(berryCss.includes(marker),marker);
for(const marker of ['const MIN_SPEED = 0x80','const HIGH_SPEED = 1500','const NPC_STATIONS = [224, 96, 160]','getPlayerProximity','processNpcCrossings'])assert(berryJs.includes(marker),marker);

// Save import is confirmation-gated and writes only after validation.
for(const marker of ['function parseImportedSave','function validateImportSave','function confirmImportSave','pendingImportedSave','settingsExportBtn','importSaveText'])assert(app.includes(marker),marker);
const confirmBody=app.slice(app.indexOf('function confirmImportSave'),app.indexOf('function confirmImportSave')+700);
assert(confirmBody.includes("localStorage.setItem('luckyDexSave'"));
assert(confirmBody.includes('location.reload()'));

// Arcade no longer asks Android to hide phone chrome.
for(const f of ['arcade-world.js','arcade-amie.js','arcade-ball-drop.js','arcade-classics.js','berry-blender.js','clefairy-memory.js'])assert(!read(f).includes('setImmersive(true)'),f+' must respect Android system bars');
console.log('PASS v0.22 restore/save/safe-area regressions');
