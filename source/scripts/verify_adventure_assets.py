#!/usr/bin/env python3
"""Offline checksum, image, registry and complete species audit for Adventure 2."""
from pathlib import Path
import hashlib,json,subprocess,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'app/src/main/assets'
ART=ASSETS/'adventure/art'
QA=ROOT/'artifacts/v0230/assets'
errors=[]
rows=json.loads((ART/'manifest.json').read_text(encoding='utf-8'))
for row in rows:
    p=ASSETS/row['path']
    if not p.is_file():errors.append(row['path']+': missing');continue
    if hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:errors.append(row['path']+': checksum mismatch')
    try:
        with Image.open(p) as im:
            im.load()
            if im.format!='PNG' or im.size!=(row['width'],row['height']):errors.append(row['path']+': encoding/dimensions mismatch')
            if im.width*im.height>384*704:errors.append(row['path']+': oversized decoded image')
    except Exception as exc:errors.append(row['path']+': '+str(exc))
    if not row.get('source_urls') or not row.get('adaptation') or not row.get('original_game'):errors.append(row['path']+': provenance missing')
manifest_paths={r['path'] for r in rows}
disk_paths={str(p.relative_to(ASSETS)).replace('\\','/') for p in ART.rglob('*.png')}
if manifest_paths!=disk_paths:errors.append('PNG manifest coverage mismatch: '+str(manifest_paths^disk_paths))
dm=json.loads((ART/'data-manifest.json').read_text())
for row in dm['files']:
    if hashlib.sha256((ASSETS/row['path']).read_bytes()).hexdigest()!=row['sha256']:errors.append(row['path']+': bundle checksum mismatch')
for row in dm['sources']:
    if hashlib.sha256((ROOT/row['path']).read_bytes()).hexdigest()!=row['sha256']:errors.append(row['path']+': source CSV checksum mismatch')
source_manifest=QA/'source/source-manifest.json'
if source_manifest.exists():
    for row in json.loads(source_manifest.read_text())['files']:
        p=QA/'source/pokefirered-master'/row['file']
        if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:errors.append(row['file']+': original art source checksum mismatch')
js=r'''
const fs=require('node:fs');const path=require('node:path');
const root=process.argv[1];const a=require(path.join(root,'adventure/adventure-assets.js'));const s=require(path.join(root,'adventure/adventure-species.js'));
const errors=[];const types=new Set(['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']);
function verify(p){if(typeof p==='string'&&p.endsWith('.png')&&!fs.existsSync(path.join(root,p)))errors.push('Missing local registry image: '+p);else if(p&&typeof p==='object')Object.values(p).forEach(verify);}
verify(a);
if(Object.keys(s.byId).length!==1025)errors.push('Species count');
for(let id=1;id<=1025;id++){
 const p=s.byId[id];if(!p||p.id!==id||!p.name||!p.types.length||p.types.some(t=>!types.has(t)))errors.push('Invalid species '+id);
 if(!p||['hp','attack','defense','speed'].some(k=>!Number.isInteger(p.baseStats[k])||p.baseStats[k]<1||p.baseStats[k]>255))errors.push('Invalid stats '+id);
 for(const shiny of [false,true])for(const back of [false,true])verify(a.pokemon(id,shiny,back));
}
for(const id of ['meadow','cave','haunted','coast','volcano']){const d=a.destinations[id];if(!d||!d.scene||!d.battle||!d.boss||!d.trainer)errors.push('Incomplete destination '+id);}
if(a.backIds.length!==386)errors.push('Expected 386 native Gen III backs');
for(const file of ['adventure-assets.js','adventure-species.js'])if(/https?:\/\//.test(fs.readFileSync(path.join(root,'adventure',file),'utf8')))errors.push('Runtime URL in '+file);
console.log(JSON.stringify({errors,species:Object.keys(s.byId).length,backSpecies:a.backIds.length,registryObjects:Object.keys(a.objects).length}));
'''
try:
    check=subprocess.run(['node','-e',js,str(ASSETS)],capture_output=True,text=True,check=True)
    result=json.loads(check.stdout);errors.extend(result.pop('errors'))
except Exception as exc:errors.append('Node registry audit: '+str(exc));result={}
summary={'passed':not errors,'images':len(rows),'imageBytes':sum(r['bytes'] for r in rows),**result,'errors':errors}
QA.mkdir(parents=True,exist_ok=True)
(QA/'verification.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
raise SystemExit(bool(errors))
