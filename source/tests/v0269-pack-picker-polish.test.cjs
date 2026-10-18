'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/styles-v013.css'),'utf8');
const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');

const dwell=flow.match(/const PACK_FAST_CARD_DWELL_MS\s*=\s*(\d+)/);
assert.ok(dwell,'fast reveal should define an explicit readable per-card dwell');
assert.ok(Number(dwell[1])>=550,`fast reveal dwell should be readable, got ${dwell?.[1]}ms`);
assert.match(flow,/session\.skip\(\);packFastRevealTimer=setTimeout\(packFastRevealStep,PACK_FAST_CARD_DWELL_MS\)/,'fast reveal should leave the settled card visible for the readable dwell');

assert.match(css,/\.pack-home\{[^}]*overflow-y:auto/s,'pack shop should be able to scroll when the set picker grows');
assert.match(css,/\.pack-selector-card\{[^}]*flex:0 0 auto[^}]*overflow:visible/s,'pack selector should size to its contents instead of crushing/overlapping rows');
assert.match(css,/\.pack-set-accordion\.open \.pack-set-accordion-panel\{[^}]*height:min\(58dvh,520px\)/s,'expanded set picker should get a tall dedicated viewport');
assert.match(css,/\.pack-set-browser\{[^}]*min-height:0[^}]*overflow-y:auto/s,'set rows should scroll inside the tall picker');
assert.match(css,/\.pack-format-row\{[^}]*flex:0 0 auto/s,'booster format row should not be compressed into the set picker');

const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
const currentVersion=(gradle.match(/versionName\s+['"]([^'"]+)['"]/)||[])[1];
assert.ok(versionCode>=269,'Android versionCode must remain at least 269');
assert.ok(currentVersion&&currentVersion.localeCompare('0.26.9',undefined,{numeric:true})>=0,'Android version must remain at v0.26.9 or later');
assert.ok(html.includes(`v${currentVersion}`),'visible app version should match the current release');
console.log('PASS v0.26.9 readable fast reveal and non-overlapping tall pack picker');
