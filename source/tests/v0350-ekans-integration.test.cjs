'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const world=read('app/src/main/assets/arcade-world.js');
const session=read('app/src/main/assets/arcade-session.js');
const html=read('app/src/main/assets/index.html');

assert.match(world,/id:"stadiumKidsClub"[^\n]*games:\['ekansHoop','digDigDig'(?:,'[^']+')*\]/,'Kids Club venue preserves Ekans Hoop Hurl alongside Dig Dig Dig');
for(const id of ['amieGarden','goldenrod','celadonPrize','lilycoveContest','oreburghMuseum','ruinsAlph','indigoQuiz','dashCourse'])assert.match(world,new RegExp(`id:"${id}"`),`existing venue ${id} preserved`);
assert.match(world,/ekansHoop:'Ekans[’'] Hoop Hurl'/);
assert.match(world,/ekansHoop:'(?:Drag, aim and release|Pull back and release) Ekans to hoop [^']+\.'/);
assert.match(world,/ekansHoop:\(\)=>window\.LuckyDexEkansHoop/);
assert.match(session,/ekansHoop:/,'session has Ekans rule metadata');

const shell=html.slice(html.indexOf('id="ekansHoopGame"'),html.indexOf('id="dashGame"'));
for(const id of ['ekansHoopGame','ekansHoopTimer','ekansHoopScore','ekansHoopStreak','ekansHoopMultiplier','ekansHoopField','ekansHoopLauncher','ekansHoopAimMarker','ekansHoopPauseOverlay','ekansHoopResume'])assert.match(shell,new RegExp(`id="${id}"`),`missing shell id ${id}`);
for(const removed of ['ekansHoopScores','ekansHoopCpuRow','ekansHoopLeft','ekansHoopRight','ekansHoopNear','ekansHoopMid','ekansHoopFar','ekansHoopThrow'])assert.doesNotMatch(shell,new RegExp(`id="${removed}"`));
assert.match(shell,/arcade\/sprites\/actors\/pokemon\/23\.png/,'shell uses local authentic Ekans sprite');
for(const src of ['50.png','51.png','shiny/50.png','shiny/51.png'])assert.match(shell,new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
assert.doesNotMatch(shell,/https?:\/\//,'Ekans shell has no runtime remote URL');

const coreAt=html.indexOf('<script src="arcade-ekans-hoop-core.js"></script>');
const runtimeAt=html.indexOf('<script src="arcade-ekans-hoop.js"></script>');
const worldAt=html.indexOf('<script src="arcade-world.js"></script>');
assert.ok(coreAt>0&&runtimeAt>coreAt&&worldAt>runtimeAt,'core and runtime load before Arcade world');
assert.match(html,/<link rel="stylesheet" href="arcade-ekans-hoop\.css" \/>/);

for(const p of ['app/src/main/assets/arcade/kids-club/emerald-gym-floor.png','app/src/main/assets/arcade/kids-club/kids-club-venue.webp','app/src/main/assets/arcade/kids-club/SOURCES.md'])assert.ok(fs.existsSync(path.join(root,p)),`missing Kids Club asset ${p}`);
console.log('PASS Ekans Kids Club integration regression');
