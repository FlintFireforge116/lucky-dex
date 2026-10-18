'use strict';
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),targeted=process.argv.includes('--targeted');
const files=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.cjs')&&(!targeted||f.startsWith('arcade-dash')||f==='v0310-release.test.cjs')).sort();
const results=[];fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
for(const file of files){const r=spawnSync(process.execPath,[path.join(root,'tests',file)],{cwd:root,encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024});const entry={file,status:r.status,error:r.error?.message||null,output:r.stdout+r.stderr};results.push(entry);console.log((r.status===0?'PASS ':'FAIL ')+file);if(r.status!==0)console.log(entry.output.slice(-500));}
const report={total:results.length,passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0).map(r=>r.file),results};fs.writeFileSync(path.join(root,'artifacts',targeted?'dash-targeted.json':'test-inventory.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}));process.exitCode=report.failed.length?1:0;
