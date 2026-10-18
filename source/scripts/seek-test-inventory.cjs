// Reusable test inventory; product code and existing assertions remain untouched.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
const opt=(name,fallback)=>{const at=args.indexOf(name);return at<0?fallback:args[at+1];};
const tag=opt('--tag','baseline'),filter=new RegExp(opt('--filter','v0490|v050[0-5]|v040[68]|v0409-rare-odds|v0413-achievements|v0341-bugfix-achievements'));
const files=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.cjs')&&filter.test(f)).sort();
const report={tag,startedAt:new Date().toISOString(),filter:filter.source,node:process.execPath,results:[]};
for(const file of files){
 const startedAt=new Date().toISOString();
 const run=spawnSync(process.execPath,['-r',path.join(__dirname,'test-browser-runtime.cjs'),path.join(root,'tests',file)],{cwd:root,encoding:'utf8',env:process.env,timeout:180000,maxBuffer:20*1024*1024});
 const result={file,startedAt,finishedAt:new Date().toISOString(),status:run.status,signal:run.signal,error:run.error?.message||null,stdout:run.stdout||'',stderr:run.stderr||''};
 report.results.push(result);console.log(`${run.status===0?'PASS':'FAIL'} ${file}`);
}
report.finishedAt=new Date().toISOString();report.passed=report.results.filter(r=>r.status===0).length;report.failed=report.results.length-report.passed;
const destination=path.resolve(root,opt('--out',`artifacts/v0510/${tag}-tests.json`));fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({destination,passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
