'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

// Shared session strip must be styled, otherwise its RUN/REWARD/LIVE text collapses into raw text.
const arcadeCss=read('app/src/main/assets/arcade.css');
assert.match(arcadeCss,/\.arcade-session-strip\s*\{[^}]*display\s*:\s*grid/i,'shared Arcade RUN / REWARD / LIVE strip needs a real layout');
assert.match(arcadeCss,/\.arcade-session-strip[^}]*\[hidden\]|\.arcade-session-strip\s+\[hidden\]/i,'session strip hidden cells must stay hidden');

// Berry Picker: the stage, not the HUD, owns the flexible row.
const amieCss=read('app/src/main/assets/arcade-amie.css');
assert.match(amieCss,/#berryPickerGame\s*\{[^}]*grid-template-rows\s*:\s*auto\s+auto\s+auto\s+auto\s+minmax\(0,\s*1fr\)\s+auto/i,'Berry Picker flexible grid row must be the play stage');

// Oreburgh: content must scroll on short phones and the header uses a recognisable Gen IV Pokémon sprite.
assert.match(arcadeCss,/\.fossil-dig-v0250\s*\{[^}]*overflow-y\s*:\s*auto/i,'Fossil Dig must remain vertically scrollable on short phone viewports');
const fossilJs=read('app/src/main/assets/arcade-fossil-museum.js');
assert.match(fossilJs,/arcade\/sprites\/actors\/pokemon\/(408|410)\.png/,'Oreburgh header should use Cranidos or Shieldon rather than the tiny Odd Keystone item icon');
assert.doesNotMatch(fossilJs,/arcade-mascot[^\n]*odd-keystone\.png/,'Odd Keystone item art must not be used as the Fossil Dig header mascot');

// The retired Poké Ball Drop jackpot achievements must not leak into unrelated GAME REVIEW sheets.
const achievements=read('app/src/main/assets/achievements-v0341.js');
assert.doesNotMatch(achievements,/ball_drop_jackpots_(5|10)/,'retired jackpot achievements must be removed from the achievement catalogue');

// Ekans: default 3-second countdown, no live targets before it ends, targets appear as play begins.
let clock=0,queued=null;
global.performance={now:()=>clock};
global.requestAnimationFrame=fn=>{queued=fn;return 1};
global.cancelAnimationFrame=()=>{queued=null};
global.document={hidden:false,getElementById:()=>null,querySelectorAll:()=>[],addEventListener:()=>{}};
global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
const ekans=require('../app/src/main/assets/arcade-ekans-hoop.js');
const tick=t=>{clock=t;const fn=queued;queued=null;if(fn)fn(t);};
clock=1000;let es=ekans.startRound();
assert.equal(es.phase,'countdown');
assert.ok(es.countdownRemainingMs>=2990,'Ekans default countdown should be three seconds');
assert.equal(es.targets.length,0,'nothing may spawn during the Ekans countdown');
tick(2500);assert.equal(ekans.snapshot().targets.length,0,'targets remain absent while countdown is active');
tick(4001);es=ekans.snapshot();assert.equal(es.phase,'playing');assert.ok(es.targets.length>=1,'targets spawn only when the countdown ends');
const html=read('app/src/main/assets/index.html');
const ekansCss=read('app/src/main/assets/arcade-ekans-hoop.css');
assert.match(html,/id="ekansHoopCountdown"/,'Ekans field needs a visible countdown overlay');
assert.match(ekansCss,/\.ekans-hoop-countdown\s*\{/,'Ekans countdown overlay needs presentation styling');
ekans.close();

// Dig! Dig! Dig!: no grace timeout; the race completes only after all four racers finish.
const digCore=require('../app/src/main/assets/arcade-dig-dig-dig-core.js');
assert.equal('graceMs' in digCore.CONFIG,false,'Dig race must not have a grace timeout');
function seeded(seed=1){let x=seed>>>0;return ()=>{x=(1664525*x+1013904223)>>>0;return x/0x100000000;};}
const race=digCore.createRace({difficulty:'easy',rng:seeded(1),nowMs:0});
race.player.progress=79;race.player.lastAcceptedSide='right';digCore.acceptInput(race.player,'left',2000);digCore.advanceRace(race,2000,seeded(2));
assert.equal(race.finalized,false,'first finisher must not end the race');
digCore.advanceRace(race,20000,seeded(3));
assert.equal(race.finalized,false,'race must not expire while racers are still digging');
for(let i=1;i<race.racers.length;i++){race.racers[i].progress=79;race.racers[i].lastAcceptedSide='right';digCore.acceptInput(race.racers[i],'left',21000+i);}
digCore.advanceRace(race,22000,seeded(4));
assert.equal(race.finalized,true,'race finalizes after every racer has finished');
const digRuntime=read('app/src/main/assets/arcade-dig-dig-dig.js');
assert.doesNotMatch(digRuntime,/GRACE EXPIRED|Grace expired|phase==='grace'|['"]grace['"]/,'Dig UI must not expose the retired grace phase');
assert.match(digRuntime,/race\.finalizedAt[^\n]*race\.startedAt|phase==='finished'[^\n]*race\.finalizedAt/s,'display timer should keep running until the whole race finalizes');

// Pack opening: construction errors are diagnosable and explicitly non-charging; debit is revalidated at commit.
const flow=read('app/src/main/assets/pack-flow-v0165.js');
const app=read('app/src/main/assets/app-v0167.js');
assert.match(flow,/recordPackOpeningError\(error,\s*['"]prepare-pack['"]/,'prepare failures need persisted diagnostics with their set context');
assert.match(flow,/Nothing was spent|coins\/ticket were not spent|coins or tickets were not spent/i,'prepare error UI must explicitly tell the player no currency was consumed');
assert.match(flow,/buildBalancedPackWithRetry|buildPackWithRetry/,'pack construction should retry recoverable collation failures before showing PACK ERROR');
assert.match(app,/function canConsumePackEntitlement\s*\(/,'pack commit must revalidate the stored entitlement before charging');
assert.match(app,/function consumePackEntitlement\s*\([\s\S]{0,180}?if\(!canConsumePackEntitlement\(e\)\)return false/,'pack debit must fail closed when entitlement is stale');

console.log('PASS v0.39.1 on-device feedback regressions');
