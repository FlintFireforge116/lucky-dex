'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('../app/src/main/assets/arcade-rock-harden-core.js');

function rng(){return .5;}
for(const [key,lead] of [['easy',1150],['normal',900],['hard',700]]){
  const round=core.createRound({difficulty:key,rng,nowMs:1000});
  assert.equal(core.difficultyProfile(key).telegraphLeadMs,lead,`${key} fall/telegraph time`);
  assert.ok(round.waves.length>16,`${key} should keep scheduling rocks beyond the old fixed 16-wave cap`);
  const last=round.waves.at(-1);
  assert.ok(last.impactAt>=round.safetyCapAt-500,`${key} last rock should land within 500ms of round end`);
  assert.ok(last.impactAt<=round.safetyCapAt,`${key} last rock cannot land after round end`);
  for(const wave of round.waves){const fall=wave.impactAt-wave.telegraphAt;if(key==='hard')assert.ok(fall>=520&&fall<=850,`hard per-wave fall time ${fall}`);else assert.equal(fall,lead,`${key} per-wave fall time`);}
}
const easy=core.createRound({difficulty:'easy',rng,nowMs:0});
const hard=core.createRound({difficulty:'hard',rng,nowMs:0});
const avgGap=r=>r.waves.slice(1).reduce((n,w,i)=>n+(w.impactAt-r.waves[i].impactAt),0)/(r.waves.length-1);
assert.ok(avgGap(hard)<avgGap(easy),'Hard rock cadence should be quicker than Easy');

const survivor=core.createRound({difficulty:'easy',rng,nowMs:0});
for(const r of survivor.racers.slice(1)){r.alive=false;r.hp=0;r.koAt=10000;}
survivor.player.hp=999;
core.advanceRound(survivor,12000);
assert.equal(survivor.finalized,false,'player as sole survivor must keep receiving rocks until the round clock ends');
core.advanceRound(survivor,survivor.safetyCapAt);
assert.equal(survivor.finalized,true,'sole-survivor round still ends at the 45-second cap');

const locked=[core.ROSTER[0],core.ROSTER[3],core.ROSTER[7],core.ROSTER[12]];
const lockedRound=core.createRound({difficulty:'hard',rng,nowMs:0,roster:locked});
assert.deepEqual(lockedRound.racers.map(r=>r.species.dex),locked.map(s=>s.dex),'createRound must accept a locked setup roster');

const css=fs.readFileSync('app/src/main/assets/arcade-rock-harden.css','utf8');
const mobile=css.match(/@media\(max-width:420px\)\{([\s\S]*?)\}\s*@media\(max-width:340px\)/)?.[1]||'';
const arenaH=Number(mobile.match(/\.rock-harden-arena\{[^}]*min-height:(\d+)px/)?.[1]||0);
assert.ok(arenaH>=380,`mobile arena should be substantially taller (found ${arenaH}px)`);
assert.match(css,/\.rock-harden-drop::before\s*\{[^}]*cave-wall\.png[^}]*cave-wall\.png/s,'quarry should gain multiple Gen III strata bands');

const ach=fs.readFileSync('app/src/main/assets/achievements-v0341.js','utf8');
for(const id of ['rock_harden_first_win','rock_harden_games_25','rock_harden_hard_win','rock_harden_all_difficulties','rock_harden_perfect_10','rock_harden_hp_50'])assert.ok(ach.includes(id),`achievement ${id} must remain`);

const pkg=require('../package.json');
const gradle=fs.readFileSync('app/build.gradle','utf8');
assert.ok(pkg.version.localeCompare('0.38.1',undefined,{numeric:true})>=0,'release must remain v0.38.1 or newer');
assert.ok(Number((gradle.match(/versionCode\s+(\d+)/)||[])[1])>=3801,'versionCode must preserve the v0.38.1 floor');
assert.match(gradle,new RegExp(`versionName\\s+['\"]${pkg.version.replace(/\./g,'\\.')}['\"]`));
console.log('PASS v0.38.1 Rock Harden phone polish contract');
