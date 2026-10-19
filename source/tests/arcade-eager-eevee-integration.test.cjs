'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'../app/src/main/assets');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const world=read('arcade-world.js');
const help=read('arcade-help.js');
const platform=read('arcade-platform.js');
const records=read('arcade-records.js');
const session=read('arcade-session.js');
const achievements=read('achievements-v0341.js');
const html=read('index.html');

assert.match(world,/games:\[[^\]]*'eggEmergency','eagerEevee'\]/,'Stadium 2 venue should list Eager Eevee after Egg Emergency');
assert.match(world,/eagerEevee:'Eager Eevee'/,'Arcade world should name Eager Eevee');
assert.match(world,/eagerEevee:\(\)=>window\.LuckyDexEagerEevee/,'Arcade lifecycle should own Eager Eevee');
assert.match(help,/eagerEevee:\{name:'Eager Eevee'/,'shared first-play instructions should cover Eager Eevee');
assert.match(platform,/eagerEevee:\{gamesPlayed:0/,'save defaults should include Eager Eevee records');
assert.match(platform,/eagerEevee:\(\(\)=>\{const r=src\.eagerEevee/,'save migration should preserve Eager Eevee records');
assert.match(records,/SUPPORTED_GAME_IDS=\[[^\]]*'eagerEevee'/,'Arcade Records should include Eager Eevee');
assert.match(records,/eagerEevee:a=>/,'Arcade Records should render Eager Eevee stats');
assert.match(session,/eagerEevee:\{run:/,'shared Arcade session header should describe Eager Eevee');
assert.match(achievements,/eager_eevee_first_match/,'Eager Eevee should have achievements');
assert.match(achievements,/eager_eevee_hard_win/,'Eager Eevee should reward a Hard win');
assert.match(html,/href="arcade-eager-eevee\.css"/,'Eager Eevee stylesheet should be loaded');
assert.match(html,/id="eagerEeveeGame"/,'Eager Eevee game panel should exist');
assert.match(html,/src="arcade-eager-eevee-core\.js"/,'Eager Eevee core script should be loaded');
assert.match(html,/src="arcade-eager-eevee\.js"/,'Eager Eevee runtime script should be loaded');
assert.ok(fs.existsSync(path.join(root,'arcade-eager-eevee.css')));
assert.ok(fs.existsSync(path.join(root,'arcade-eager-eevee.js')));

assert.doesNotMatch(html,/id="eagerEeveeB"/,'Eager Eevee should not render a B/Feint control');
assert.ok(!help.includes('Press B before the reveal to feint'),'shared Eager Eevee instructions should not mention Feint');
assert.ok(!session.includes('A to dash · B to feint'),'Arcade session copy should describe A-only controls');
assert.ok(!records.includes("['Feints',fmt(r.totalFeints)]"),'Arcade Records should not show a Feints statistic');
assert.ok(!platform.includes('totalFeints:0'),'new Eager Eevee save defaults should not create a Feints record');
assert.ok(!world.includes("eagerEevee:'Watch Aipom, feint rivals"),'Arcade world objective should not advertise Feint');

const css=read('arcade-eager-eevee.css');
assert.match(css,/\.eager-eevee-aipom\{[^}]*left:78%/,'Aipom should sit to the side of the tray rather than directly above it');
assert.match(css,/\.eager-eevee-player\{position:absolute;width:74px;height:74px/,'All Eevees should share the same base sprite size around the tray');
assert.doesNotMatch(css,/\.eager-eevee-player\.p0\{[^}]*width:96px/,'The player Eevee should no longer be oversized compared with the CPUs');

console.log('arcade-eager-eevee integration tests passed');
