'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const assets=path.join(__dirname,'../app/src/main/assets');
const read=name=>fs.readFileSync(path.join(assets,name),'utf8');

const index=read('index.html');
const world=read('arcade-world.js');
const help=read('arcade-help.js');
const platform=read('arcade-platform.js');
const session=read('arcade-session.js');
const achievements=read('achievements-v0341.js');
const records=read('arcade-records.js');

assert.ok(index.includes('arcade-egg-emergency.css'));
assert.ok(index.includes('id="eggEmergencyGame"'));
assert.ok(index.includes('arcade-egg-emergency-core.js'));
assert.ok(index.includes('arcade-egg-emergency.js'));
assert.ok(world.includes("'eggEmergency'"),'Stadium 2 venue must list Egg Emergency');
assert.ok(world.includes("eggEmergency:()=>window.LuckyDexEggEmergency"),'Arcade world must own the Egg Emergency lifecycle');
assert.ok(help.includes('eggEmergency:{name:\'Egg Emergency\''),'shared first-open/help registry must include Egg Emergency');
assert.ok(platform.includes('eggEmergency:{gamesPlayed:0'),'save defaults must include Egg Emergency records');
assert.ok(platform.includes('eggEmergency:(()=>'),'save migration must preserve/default Egg Emergency records');
assert.ok(session.includes("eggEmergency:{run:'100 Eggs"),'shared result/session strip must know Egg Emergency rules');
assert.ok(achievements.includes('egg_emergency_first_match'),'Egg Emergency needs achievements');
assert.ok(records.includes("'eggEmergency'"),'Arcade Records must include Egg Emergency');
assert.ok(records.includes('eggEmergency:a=>'),'Arcade Records needs a permanent-record adapter');
const eggPath=path.join(assets,'arcade/egg-emergency/egg-gen2.png');
assert.ok(fs.existsSync(eggPath),'game must bundle an actual Pokémon Egg sprite');
const png=fs.readFileSync(eggPath);
assert.equal(png.readUInt32BE(16),40,'bundled Egg frame should be cropped to one 40px sprite');
assert.equal(png.readUInt32BE(20),40,'bundled Egg frame should be cropped to one 40px sprite');

const platformApi=require('../app/src/main/assets/arcade-platform.js');
const migrated=platformApi.ensureArcadeState({delibirdDelivery:{gamesPlayed:9,bestScore:1234},records:{version:1,games:{}}});
assert.equal(migrated.delibirdDelivery.gamesPlayed,9,'existing arcade records must survive migration');
assert.equal(migrated.eggEmergency.gamesPlayed,0,'new Egg Emergency save fields need safe defaults');

console.log('arcade-egg-emergency integration tests passed');
