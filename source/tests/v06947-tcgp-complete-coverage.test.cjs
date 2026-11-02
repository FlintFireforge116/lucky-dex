const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const child=require('node:child_process');

test('all released TCG Pocket gameplay identities are battle-ready',()=>{
  child.execFileSync(process.execPath,['scripts/build-tcgp-catalogue.cjs'],{cwd:path.resolve(__dirname,'..'),stdio:'pipe'});
  const report=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../generated/tcgp-card-coverage.json'),'utf8'));
  assert.equal(report.statusCounts.PARTIAL,0,`remaining PARTIAL: ${report.statusCounts.PARTIAL}`);
  assert.equal(report.statusCounts.UNSUPPORTED,0);
  assert.equal(Number(report.schemaErrors?.length ?? report.schemaErrors ?? 0),0);
});
