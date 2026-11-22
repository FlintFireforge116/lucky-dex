'use strict';
// Release-contract consistency is tested before the official catalogue exists.
// Once CI generates the pinned catalogue, the independent printed-rule audit
// checks every card, not just these release expectations.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const contract=require('../scripts/xy9_release_contract.json');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('BREAKpoint has one independent release contract across previous and new stage tests',()=>{
 assert.equal(contract.set,'xy9');assert.equal(contract.printedTotal,126);
 assert.equal(contract.expectedPlayable,110);
 assert.equal(contract.expectedGated.length,contract.printedTotal-contract.expectedPlayable);
 const gated=new Set(contract.expectedGated),newly=new Set(contract.stage2Playable);
 assert.equal(gated.size,contract.expectedGated.length,'Duplicated gated print');
 assert.equal(newly.size,contract.stage2Playable.length,'Duplicated newly playable print');
 for(const id of newly)assert.ok(!gated.has(id),'Outdated gated assertion for newly playable print '+id);
 for(const id of contract.stage1BreakPlayable)assert.ok(!gated.has(id),'BREAK inheritance must remain usable: '+id);
 const early=read('tests/v07378-breakpoint-integration.test.cjs');
 const later=read('tests/v07379-breakpoint-continuation.test.cjs');
 for(const text of [early,later])assert.match(text,/releaseContract\.expectedGated/,'Every stage must share the same gated list');
 assert.doesNotMatch(early,/Unaudited printed effect must stay gated:/,'Old hardcoded Stage 1 gating assertion reintroduced');
 for(const id of ['40','41','57'])assert.ok(newly.has(id),'Regression coverage lost recently enabled #'+id);
});
test('BREAKpoint preflight is a mandatory upstream dependency in the Gradle APK build',()=>{
 const gradle=read('app/build.gradle');
 assert.match(gradle,/tasks\.register\('preflightXY9ContractForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('preflightXY9ContractForApk'\)/);
 assert.match(gradle,/tests\/v07379-breakpoint-release-contract\.test\.cjs/);
 const master=read('docs/LUCKYDEX_MASTER_RULES.txt');
 assert.match(master,/MANDATORY RELEASE-CONTRACT PREFLIGHT/);
});
