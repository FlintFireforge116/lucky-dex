const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const tests=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.cjs')).sort();
for(const file of tests){
 console.log('\nTEST '+file);
 const result=spawnSync(process.execPath,[path.join(root,'tests',file)],{cwd:root,stdio:'inherit',env:process.env});
 if(result.status!==0){console.error('FAILED '+file);process.exit(result.status||1);}
}
const python=process.env.LUCKYDEX_PYTHON||(process.platform==='win32'?'python':'python3');
const assets=spawnSync(python,['scripts/fetch_arcade_v0200_assets.py','--check'],{cwd:root,stdio:'inherit'});
if(assets.status!==0)process.exit(assets.status||1);
const venues=spawnSync(python,['scripts/verify_v0223_venues.py'],{cwd:root,stdio:'inherit'});
if(venues.status!==0)process.exit(venues.status||1);
const adventure=spawnSync(python,['scripts/verify_adventure_assets.py'],{cwd:root,stdio:'inherit'});
if(adventure.status!==0)process.exit(adventure.status||1);
const fossilMuseum=spawnSync(python,['scripts/verify_fossil_museum_v0250_assets.py'],{cwd:root,stdio:'inherit'});
if(fossilMuseum.status!==0)process.exit(fossilMuseum.status||1);
const sleeves=spawnSync(python,['scripts/verify-sleeves-v0440.py'],{cwd:root,stdio:'inherit'});
if(sleeves.status!==0)process.exit(sleeves.status||1);
const tcgp=spawnSync(process.execPath,['scripts/verify-tcgp-catalogue.cjs'],{cwd:root,stdio:'inherit'});
if(tcgp.status!==0)process.exit(tcgp.status||1);
console.log('\nPASS entire active suite: '+tests.length+' test programs plus offline asset integrity');
