'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const SOURCE=path.join(__dirname,'..');
const REPO=path.join(SOURCE,'..');
const exists=p=>fs.existsSync(path.join(SOURCE,p));
const rootExists=p=>fs.existsSync(path.join(REPO,p));

test('canonical repository excludes audited generated and historical clutter',()=>{
  assert.equal(rootExists('LuckyDex-APK-1.zip'),false,'top-level APK bundle should not be canonical source');
  const rootFiles=fs.readdirSync(SOURCE);
  assert.deepEqual(rootFiles.filter(f=>/^TEST_REPORT_v.*\.md$/i.test(f)),[]);
  assert.deepEqual(rootFiles.filter(f=>/^V.*_REPORT\.md$/i.test(f)),[]);
  assert.deepEqual(rootFiles.filter(f=>/^CODEX_.*\.md$/i.test(f)),[]);
  assert.equal(exists('LuckyDex_Master_Update_Continuation_Plan.txt'),false);
  for(const p of [
    'docs/CODEX_DASH_V2_GEN3_POLISH_PASS.md',
    'docs/V0223_REPORT.md','docs/V0230_REPORT.md','docs/V0231_REPORT.md','docs/V0232_REPORT.md','docs/V0240_REPORT.md',
    'tests/adventure-location-preservation-v0402.json','tests/adventure-scene-nav-preservation-v0403.json',
    'scripts/adventure-location-preservation-v0402.py','scripts/adventure-scene-nav-preservation-v0403.py'
  ]) assert.equal(exists(p),false,p+' should be removed');
  if(exists('artifacts')) assert.deepEqual(fs.readdirSync(path.join(SOURCE,'artifacts')),[],'generated artifacts directory must stay empty');
});

test('cleanup preserves audited live and reproducibility inputs',()=>{
  for(const p of ['data/adventure-moves','data/dash-gen3','reference']) assert.equal(exists(p),true,p+' must remain');
  assert.equal(rootExists('card-art-index.json'),true,'root card-art-index.json must remain');
});
