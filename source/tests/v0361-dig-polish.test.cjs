'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=require('../app/src/main/assets/arcade-dig-dig-dig-core.js');
const runtime=read('app/src/main/assets/arcade-dig-dig-dig.js');
const css=read('app/src/main/assets/arcade-dig-dig-dig.css');

// Hard should be a genuine high-speed challenge, while Easy/Normal keep their v0.36.0 identity.
assert.equal(core.DIFFICULTIES.easy.minIntervalMs,210);
assert.equal(core.DIFFICULTIES.easy.maxIntervalMs,300);
assert.equal(core.DIFFICULTIES.normal.minIntervalMs,155);
assert.equal(core.DIFFICULTIES.normal.maxIntervalMs,225);
assert.equal(core.DIFFICULTIES.hard.minIntervalMs,90);
assert.equal(core.DIFFICULTIES.hard.maxIntervalMs,130);
assert.ok(core.DIFFICULTIES.hard.errorChance<=.02);
assert.ok(core.DIFFICULTIES.hard.hesitationChance<=.03);

function seeded(seed=1){let x=seed>>>0;return ()=>{x=(1664525*x+1013904223)>>>0;return x/0x100000000;};}
const hardRace=core.createRace({difficulty:'hard',rng:seeded(4361),nowMs:0});
const hardRng=seeded(9361);
for(let t=10;t<=12000;t+=10)for(let i=1;i<4;i++)core.advanceCpu(hardRace,i,t,hardRng);
for(const cpu of hardRace.racers.slice(1)){
  assert.equal(cpu.progress,80,'Hard COM reaches all 80 digs inside the challenge window');
  assert.ok(cpu.finishedAt<=11500,`Hard COM finish ${cpu.finishedAt}ms should pressure a fast player`);
}

// Runtime polish: short-lived dig pulses animate every racer, not only the player.
assert.match(runtime,/function renderLane\(racer,index,t\)/);
assert.match(runtime,/lastAcceptedAt!=null[^\n]*digPulseMs/);
assert.match(runtime,/lastAcceptedSide==='left'/);
assert.match(runtime,/digDigDigLeft[^\n]*classList[^\n]*is-next/);
assert.match(runtime,/digDigDigRight[^\n]*classList[^\n]*is-next/);
assert.match(runtime,/digDigDigNext[^\n]*classList[^\n]*expect-/);
assert.match(runtime,/--dig-depth[^\n]*progress\/core\.CONFIG\.raceDistance/);
assert.doesNotMatch(css,/calc\(var\(--dig-depth[^)]*\)\s*\/\s*100%\)/,'depth meter avoids unsupported CSS calc division on Android WebView');
assert.match(css,/scaleX\(var\(--dig-depth,0\)\)/);

// Gen III presentation polish: per-dig burst, depth texture, active controls and animated water finish.
assert.match(css,/--dig-pulse-ms/);
assert.match(css,/\.dig-lane\.is-digging \.dig-dust/);
assert.match(css,/@keyframes digDustPop/);
assert.match(css,/\.dig-shaft::after/);
assert.match(css,/\.dig-control\.is-next/);
assert.match(css,/\.dig-control:active/);
assert.match(css,/shore-water\.png/);
assert.match(css,/@keyframes digWaterMove/);
assert.match(css,/\.dig-lane\.is-finished \.dig-sandshrew/);

console.log('PASS v0.36.1 Dig hard-mode tuning and Gen III feedback polish');
