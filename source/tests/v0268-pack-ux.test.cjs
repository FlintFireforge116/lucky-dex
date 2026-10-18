'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pack=require('../app/src/main/assets/pack-opening-v0160.js');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/styles-v013.css'),'utf8');
const revealCss=fs.readFileSync(path.join(root,'app/src/main/assets/pack-opening-v0160.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');

assert.equal(typeof pack.planTearGesture,'function','pack module should expose tear planning');
const rect={left:0,top:0,width:300,height:500};
const tear=pack.planTearGesture({x:42,y:94},{x:264,y:132},rect);
assert.equal(tear.valid,true,'a broad mostly-horizontal swipe should count as a tear');
assert.ok(Array.isArray(tear.points)&&tear.points.length>=7,'tear should generate a jagged path, not a canned single line');
assert.ok(tear.points.every(([x,y])=>x>=0.04&&x<=0.96&&y>=0.05&&y<=0.32),'tear path must remain inside safe pack margins');
assert.ok(Math.abs(tear.points[0][1]-(94/500))<0.04,'left edge should loosely follow swipe start height');
assert.ok(Math.abs(tear.points.at(-1)[1]-(132/500))<0.04,'right edge should loosely follow swipe end height');
assert.equal(pack.planTearGesture({x:140,y:70},{x:155,y:310},rect).valid,false,'mostly vertical gestures must not open the pack');
const low=pack.planTearGesture({x:25,y:430},{x:280,y:450},rect);
assert.ok(low.points.every(([,y])=>y<=0.32),'out-of-zone swipes should clamp to the tear band rather than slicing the middle of the pack');
assert.match(tear.topClip,/^polygon\(/,'tear planner should provide a top-piece clip path');
assert.match(tear.bottomClip,/^polygon\(/,'tear planner should provide a bottom-piece clip path');

assert.match(html,/class="pack-currency-guide"/,'pack shop should include a compact currency guide');
for(const phrase of ['Lucky Coins','Pack Tickets','Card Dust','Arcade','Dust Exchange']) assert.ok(html.includes(phrase),`currency guide should explain ${phrase}`);
assert.match(css,/\.pack-set-tools input,.pack-set-tools select\{[^}]*height:46px[^}]*font-size:10px/s,'set search/sort controls should be phone-readable');
assert.match(css,/\.pack-set-row\{[^}]*min-height:60px/s,'set rows should have a larger tap target');
assert.match(css,/\.pack-set-row b\{[^}]*font-size:11px/s,'set names should no longer be tiny');

assert.match(app,/Swipe across the pack to rip it open/,'sealed pack should explicitly prompt swipe-to-open');
assert.match(app,/planTearGesture/,'sealed-pack interaction should use the shared gesture planner');
assert.match(app,/pointerdown[\s\S]{0,1000}pointermove[\s\S]{0,1000}pointerup/,'sealed pack should track a live pointer swipe');
assert.match(app,/pack-rip-top/,'real booster art should have a detachable top piece');

assert.match(revealCss,/\.pack-skip\{(?![^}]*position:absolute)[^}]*min-height/s,'skip control should live in the bottom action row, not at the top of the screen');
assert.match(flow,/function startPackFastReveal\(/,'pack flow should provide hold-to-fast-reveal orchestration');
assert.match(flow,/function stopPackFastReveal\(/,'fast reveal must be explicitly stoppable');
assert.match(flow,/session\.skip\(\)[\s\S]{0,500}advancePackCard/,'fast reveal should skip cinematics then advance cards while held');

console.log('PASS v0.26.8 pack shop sizing, currency help, swipe tear and hold-fast reveal');
