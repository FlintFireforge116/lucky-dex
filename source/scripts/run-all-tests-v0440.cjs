'use strict';
// Diagnostic companion to run-tests: retain each failure instead of stopping at
// the first historical assertion. No test assertions or app code are altered.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const activeRoot=path.resolve(__dirname,'..');
const options=Object.fromEntries(process.argv.slice(2).map(arg=>{const at=arg.indexOf('=');return [arg.slice(2,at),arg.slice(at+1)];}));
const root=path.resolve(options.root||activeRoot),label=(options.label||'active').replace(/[^a-z0-9-]/gi,'-');
const output=path.join(activeRoot,'qa/v0440'),prefix=path.join(output,`suite-diagnostic-${label}`);
fs.mkdirSync(output,{recursive:true});
const selected=options.only?new Set(options.only.split(',')):null;
const excluded=options.exclude?new Set(options.exclude.split(',')):new Set();
const files=fs.readdirSync(path.join(root,'tests')).filter(file=>file.endsWith('.cjs')&&(!selected||selected.has(file))&&!excluded.has(file)).sort();
if(selected&&files.length!==selected.size)throw new Error('A requested test file is missing from '+root);
const runtime=path.join(__dirname,'test-browser-runtime.cjs');
const preload=`--require="${runtime.replace(/\\/g,'/')}"`;
const env={...process.env,NODE_PATH:process.env.NODE_PATH||'C:/Users/sjwal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules',NODE_OPTIONS:[process.env.NODE_OPTIONS||'',preload].filter(Boolean).join(' ')};
const previous=options.resume==='true'?JSON.parse(fs.readFileSync(prefix+'.json','utf8')):null;
const startedAt=previous?.startedAt||new Date().toISOString(),results=previous?.results||[];
const completedFiles=new Set(results.map(row=>row.file));
const initialRoot=previous?.initialRoot||previous?.root||root;
const executionRoots=[...new Set([...(previous?.executionRoots||[initialRoot]),root])];
if(previous)fs.appendFileSync(prefix+'.log',`\nRESUME at ${new Date().toISOString()}\nRemaining root: ${root}\nCompleted retained: ${results.length}\nExcluded explicitly: ${[...excluded].join(', ')||'none'}\n`);
else fs.writeFileSync(prefix+'.log',`Root: ${root}\nStarted: ${startedAt}\nBrowser preload: ${runtime}\nPrograms: ${files.length}\n`);
for(const [index,file] of files.entries()){
  if(completedFiles.has(file))continue;
  const started=Date.now(),result=spawnSync(process.execPath,[path.join(root,'tests',file)],{cwd:root,env,encoding:'utf8',timeout:120000,maxBuffer:20*1024*1024,windowsHide:true});
  const row={file,status:result.status,signal:result.signal,error:result.error?.message||null,timedOut:result.error?.code==='ETIMEDOUT',passed:result.status===0&&!result.error,durationMs:Date.now()-started,...(previous?{executedRoot:root}:{})};
  results.push(row);
  const heading=`\nTEST ${index+1}/${files.length} ${file} — ${row.passed?'PASS':'FAIL'} (${row.durationMs} ms)\n`;
  fs.appendFileSync(prefix+'.log',heading+(result.stdout||'')+(result.stderr||'')+(row.error?'\n'+row.error+'\n':''));
  const summary={root,initialRoot,executionRoots,excluded:[...excluded],startedAt,updatedAt:new Date().toISOString(),node:process.version,preload:runtime,planned:files.length,completed:results.length,passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results};
  fs.writeFileSync(prefix+'.json',JSON.stringify(summary,null,2));
  console.log(`${index+1}/${files.length} ${row.passed?'PASS':'FAIL'} ${file} (${row.durationMs} ms)`);
}
const failed=results.filter(row=>!row.passed);
fs.appendFileSync(prefix+'.log',`\nFINISHED ${results.length} programs: ${results.length-failed.length} passed, ${failed.length} failed\n`);
console.log(JSON.stringify({root,completed:results.length,passed:results.length-failed.length,failed:failed.map(row=>row.file),json:prefix+'.json',log:prefix+'.log'},null,2));
process.exitCode=failed.length?1:0;
