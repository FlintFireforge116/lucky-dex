// Compare with the untouched supplied v0.40.0 extraction, not an older release.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),base=path.resolve(process.argv[2]||path.join(root,'artifacts/v0401-baseline/source'));
const ui=new Set(['adventure-battle.js','adventure-battle.css','adventure-move-view.js','adventure-tools.js','adventure-tools.css','adventure-regional-ui.js','adventure-controller.js','adventure-hub.css'].map(f=>'app/src/main/assets/adventure/'+f));
const metadata=new Set(['app/build.gradle','app/src/main/assets/index.html','app/src/main/assets/app-v0167.js']);
const read=(r,f)=>fs.readFileSync(path.join(r,f)),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),lf=s=>s.replace(/\r\n/g,'\n');
function normalized(f,b){let s=b.toString('utf8');if(f==='app/build.gradle')return s.replaceAll('LuckyDex-asset-builder/0.40.1','LuckyDex-asset-builder/0.40.0').replace(/versionCode\s+4001\b/,'versionCode 4000').replace(/versionName '0\.40\.1'/,"versionName '0.40.0'").replace("commandLine (System.getenv('LUCKYDEX_PYTHON') ?: 'python3'),","commandLine 'python3',").replace(/\n    \/\/ UX401 catalog byte guard[\s\S]*?    \/\/ UX401 end catalog byte guard\n/,'\n');if(f.endsWith('index.html'))return s.replaceAll('0.40.1','0.40.0');return s.replace("__LUCKYDEX_BUILD='0.40.1'","__LUCKYDEX_BUILD='0.40.0'");}
let preserved=0;const changed=[];
function walk(dir){for(const e of fs.readdirSync(path.join(base,dir),{withFileTypes:true})){const f=dir+'/'+e.name;if(e.isDirectory())walk(f);else{
 if(ui.has(f)){if(hash(read(root,f))!==hash(read(base,f)))changed.push(f);continue;}
 if(metadata.has(f))assert.equal(normalized(f,read(root,f)),normalized(f,read(base,f)),'Only release metadata may change: '+f);
 else assert.equal(hash(read(root,f)),hash(read(base,f)),'Protected v0.40.0 file changed: '+f);preserved++;
}}}
walk('app');
const battle='app/src/main/assets/adventure/adventure-battle.js',tools='app/src/main/assets/adventure/adventure-tools.js',move='app/src/main/assets/adventure/adventure-move-view.js';
assert.equal(lf(read(root,battle).toString()).split('  function actorAsset')[0],lf(read(base,battle).toString()).split('  function actorAsset')[0],'Battle reducer core changed');
assert.equal(lf(read(root,tools).toString()).split('// UI-only')[0].trimEnd(),lf(read(base,tools).toString()).split('function moveView(')[0].trimEnd(),'Party/transaction core changed');
assert.equal(lf(read(root,move).toString()).split('  function compact')[0],lf(read(base,move).toString()).split('  return Object.freeze')[0],'Canonical move formatter changed');
console.log(JSON.stringify({preservedAppFiles:preserved,approvedChangedUIFiles:changed,battleReducerUnchanged:true,partyAndTransactionCoreUnchanged:true,canonicalMoveFormatterUnchanged:true},null,2));
