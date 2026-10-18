const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const world=read('app/src/main/assets/arcade-world.js');
const html=read('app/src/main/assets/index.html');
const css=read('app/src/main/assets/arcade.css');
const amieCss=read('app/src/main/assets/arcade-amie.css');
const amie=read('app/src/main/assets/arcade-amie.js');
const ball=require(path.join(root,'app/src/main/assets/arcade-ball-drop.js'));
const classics=require(path.join(root,'app/src/main/assets/arcade-classics.js'));
const fossilCore=require(path.join(root,'app/src/main/assets/arcade-fossil-museum-core.js'));
assert(!world.includes("headIt:'Head It'"),'Head It must not remain in active world registry');
assert(!world.includes("games:['berryPicker','headIt','tilePuzzle']"),'Head It must not remain launchable from Amie venue');
assert(world.includes("arcade/venues-v0223/kalos-amie-nature-xy.png"),'Kalos world landmark must use the Amie hub image, not an in-game timer screenshot');
assert(!world.includes("art:'amie-play.jpg'"),'Berry Picker gameplay screenshot must not be used as Kalos venue art');
assert(!html.includes('id="headItGame"'),'Head It DOM must be removed');
assert.ok(ball.BALL_RADIUS>=26&&ball.BALL_RADIUS<=30,'Ball Drop main radius must stay large enough to read while preserving collision clearance');
assert(!amie.includes('setImmersive?.(true)'),'Amie games must respect Android system bars');
assert(!world.includes('setImmersive?.(true)'),'World must respect Android system bars');
assert(!css.includes('.tile-target-mini{display:none}'),'Tile target preview must not be globally hidden');
assert.match(css,/\.arcade-world-view\s*\{[^}]*height:\s*100%/s,'Arcade world view must fill the usable Arcade viewport');
assert(amie.includes('tilePuzzleTarget'),'Tile source must update the target preview');
const tileScenes=require(path.join(root,'app/src/main/assets/arcade-tile-scenes-v0253.js'));
assert.ok(Array.isArray(tileScenes)&&tileScenes.length>=8,'Tile Puzzle must define a richer curated local scene pool');
for(const scene of tileScenes) assert.ok(fs.existsSync(path.join(root,'app/src/main/assets',scene.src)),`Tile Puzzle scene must exist locally: ${scene.src}`);
assert.equal(classics.revealFossilCell,undefined,'legacy one-tap Fossil model must stay retired');
assert.deepEqual([fossilCore.BOARD_DEFAULTS.rows,fossilCore.BOARD_DEFAULTS.cols],[9,12],'Fossil Dig uses the Underground-style 12x9 wall');
const dig=fossilCore.generateDigSite({rng:()=>0.25});assert.equal(dig.depths.length,108);const before=dig.stability;fossilCore.strike(dig,1,'pickaxe');assert.equal(dig.stability,before-3,'pickaxe spends wall stability instead of a dig counter');
assert(fs.existsSync(path.join(root,'app/src/main/assets/clefairy-scene.js')),'old Clefairy scene helper must be restored');
assert(fs.existsSync(path.join(root,'app/src/main/assets/clefairy-memory.js')),'old Clefairy memory owner must be restored');
assert(fs.existsSync(path.join(root,'app/src/main/assets/berry-blender.css')),'old Berry Blender presentation must be restored');
console.log('PASS v0.22 targeted restore contract');

// Berry Service should use the available portrait height, not remain a fixed 5:3 web widget.
assert.match(amieCss,/\.berry-picker-stage\s*\{[^}]*flex:\s*1 1 auto/s);
assert.match(amieCss,/\.berry-picker-stage\s*\{[^}]*min-height:\s*260px/s);

// Underground-style dig keeps a 12x9 phone-scaled board and multi-cell finds.
const site=fossilCore.generateDigSite({rng:()=>0.4});assert.deepEqual([site.rows,site.cols,site.depths.length],[9,12,108]);assert(site.finds.every(f=>f.cells.length>1));

// Android-safe fullscreen: Arcade fills its usable page box rather than the physical viewport.
assert.match(css,/body\.arcade-mode main\{height:100%\}/);
assert.match(css,/\.arcade-game\{position:absolute/);
assert(!css.includes('body.arcade-mode main{height:100dvh}'));
