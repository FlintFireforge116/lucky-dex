'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const artPath=path.join(ROOT,'app/src/main/assets/booster-art-v0260.js');
const cssPath=path.join(ROOT,'app/src/main/assets/styles-v013.css');
const builderPath=path.join(ROOT,'scripts/build-booster-art-index.py');

(async()=>{
  const oldFetch=global.fetch;
  global.fetch=async(url)=>{
    if(String(url).includes('booster-art-index-v0260.json')) return {ok:true,json:async()=>({
      schema:2,
      byId:{base2:'booster-art-v0260/base2.webp',ex1:'booster-art-v0260/ex1.webp'},
      byName:{jungle:'booster-art-v0260/base2.webp','ruby sapphire':'booster-art-v0260/ex1.webp'},
      byAppKey:{JU:'booster-art-v0260/base2.webp',EX1:'booster-art-v0260/ex1.webp'}
    })};
    return {ok:false,json:async()=>({})};
  };
  delete require.cache[require.resolve(artPath)];
  const art=require(artPath);
  assert.equal(await art.resolve({_libraryKey:'JU',name:'Jungle'}),'booster-art-v0260/base2.webp',
    'Jungle must resolve by audited app-key/name alias, not fall through to generic art');
  assert.equal(await art.resolve({_libraryKey:'EX1',name:'Ruby & Sapphire'}),'booster-art-v0260/ex1.webp',
    'Ruby & Sapphire must resolve to its EX1 physical booster artwork');
  assert.equal(await art.resolve({_libraryKey:'ODD',name:'Jungle'}),'booster-art-v0260/base2.webp',
    'set-name matching must rescue catalogue key mismatches');
  global.fetch=oldFetch;

  const py=`
import importlib.util
from pathlib import Path
p=Path(r'${builderPath.replaceAll('\\','\\\\')}')
spec=importlib.util.spec_from_file_location('builder',p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
readme='''## English\n| ID | Language | Name | Series |\n|---|---|---|---|\n| base1 | en | Base | Base |\n| base2 | en | Jungle | Base |\n| ex1 | en | Ruby & Sapphire | EX |\n\n## Japanese\n'''
rows=m.english_sets(readme)
assert rows['base2']['name']=='Jungle'
selected={
 'base1':{'ext':'.webp'},
 'base2':{'ext':'.webp'},
 'ex1':{'ext':'.webp'},
}
app={'sets':[{'k':'BS','n':'Base Set'},{'k':'JU','n':'Jungle'},{'k':'EX1','n':'Ruby & Sapphire'}]}
manifest,coverage=m.build_runtime_manifest(rows,selected,app)
assert manifest['byAppKey']['JU'].endswith('/base2.webp')
assert manifest['byAppKey']['EX1'].endswith('/ex1.webp')
assert manifest['byName']['jungle'].endswith('/base2.webp')
assert manifest['byAppKey']['BS'].endswith('/base1.webp')
assert not [r for r in coverage if r.get('expected_art') and not r.get('asset')]
print('fixture ok')
`;
  const run=cp.spawnSync('python3',['-c',py],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr||run.stdout);

  const css=fs.readFileSync(cssPath,'utf8');
  assert.match(css,/\.sealed-pack\.pointy-pack\.real-pack\s*\{[^}]*border\s*:\s*(?:0|none)/s,
    'real booster art must not sit inside the old chunky gold outer border');
  assert.match(css,/\.sealed-pack\.pointy-pack\.real-pack\s+\.pack-art-shell\s*\{[^}]*inset\s*:\s*(?:0|[^;]*2%)/s,
    'real booster art should use almost the full pack footprint');
  assert.match(css,/\.sealed-pack\.pointy-pack\.real-pack\s+\.pack-crimp[^}]*display\s*:\s*none/s,
    'real packshots should not be covered by the old oversized striped crimps');

  console.log('PASS v0.26.4 audited booster aliases and slim real-pack presentation');
})().catch(err=>{console.error(err);process.exit(1);});
