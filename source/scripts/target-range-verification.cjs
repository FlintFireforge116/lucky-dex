// Continuing scoped inventory: do not hide failures behind a fail-fast runner.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tag=process.argv[2]||'current';
const files=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.cjs')&&/target-range|goldenrod|power-trial|power-tournament|impact-trial|impact-tournament|impact-harden|impact-input|dash|records|achievements|rare-rewards|reward-reveal/.test(f)).sort();
const results=files.map(file=>{const r=spawnSync(process.execPath,['--require',path.join(__dirname,'test-browser-runtime.cjs'),path.join(root,'tests',file)],{cwd:root,encoding:'utf8',timeout:90000,maxBuffer:6*1024*1024});const result={file,status:r.status,error:r.error?.message||null,output:r.stdout+r.stderr};console.log(`${r.status===0?'PASS':'FAIL'} ${file}`);if(r.status!==0)console.log(result.output.slice(-1000));return result;});
const report={total:results.length,passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0).map(r=>r.file),results};
fs.mkdirSync(path.join(root,'artifacts/v0423'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/v0423',`${tag}-tests.json`),JSON.stringify(report,null,2));console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}));process.exitCode=report.failed.length?1:0;
