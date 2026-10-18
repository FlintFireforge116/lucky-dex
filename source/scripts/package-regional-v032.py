"""Package the v032 source with baseline layout, then verify the exact archive."""
from pathlib import Path
import zipfile,hashlib,json,subprocess,shutil
root=Path(__file__).resolve().parents[1];parent=root.parent;baseline=parent/'LuckyDex_source_v0.31.0.zip';out=parent/'LuckyDex_source_v0.32.0.zip'
included=set()
with zipfile.ZipFile(baseline) as old,zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for entry in old.infolist():
  if entry.is_dir():continue
  p=root/entry.filename;assert p.is_file(),entry.filename;z.write(p,entry.filename);included.add(entry.filename)
 for folder in ['data/adventure-moves','artifacts/v0320']:
  for p in sorted((root/folder).rglob('*')):
   if p.is_file() and p.suffix not in ['.apk','.gradle']:
    name=p.relative_to(root).as_posix()
    if name not in included:z.write(p,name);included.add(name)
 additions=[root/'TEST_REPORT_v0.32.0.md',*list((root/'docs').glob('*V032*')),*list((root/'docs').glob('ADVENTURE_*')),*list((root/'tests').glob('*.cjs')),*list((root/'scripts').glob('*regional*')),*list((root/'scripts').glob('*adventure_moves*')),*list((root/'app/src/main/assets/adventure').glob('*.js')),*list((root/'app/src/main/assets/adventure').glob('*.css'))]
 for p in sorted(set(additions)):
  if p.is_file():
   name=p.relative_to(root).as_posix()
   if name not in included:z.write(p,name);included.add(name)
fresh=parent/'LuckyDex_v0.32.0_reverified';assert not fresh.exists(),'Fresh extraction path already exists'
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None;assert 'package.json' in z.namelist();assert not any(n.startswith('LuckyDex_v0.32.0/') for n in z.namelist());z.extractall(fresh)
tests=['adventure-move-data.test.cjs','adventure-regions.test.cjs','adventure-progression-v032.test.cjs','adventure-real-battle.test.cjs','adventure-status-residual.test.cjs','adventure-regional-cap.test.cjs','adventure-run-tm-slots.test.cjs','adventure-regional-extensibility.test.cjs','adventure-regional-engine.test.cjs','adventure-regional-balance.test.cjs','adventure-regional-ui.test.cjs','adventure-regional-browser.test.cjs','adventure-battle.test.cjs','adventure-model.test.cjs','v0320-ball-drop-slopes.test.cjs','v0320-ball-drop-render.test.cjs','arcade-ball-drop.test.cjs','v0223-ball-stalls.test.cjs','v0320-release.test.cjs']+[p.name for p in (fresh/'tests').glob('arcade-dash*.test.cjs')]
results=[]
for f in sorted(set(tests)):
 r=subprocess.run(['node',str(fresh/'tests'/f)],cwd=fresh,capture_output=True,encoding='utf-8',errors='replace',timeout=90);print(f,r.returncode,flush=True);results.append({'file':f,'status':r.returncode,'output':r.stdout+r.stderr});assert r.returncode==0,r.stdout+r.stderr
with zipfile.ZipFile(baseline) as z:assert (fresh/'app/luckydex-dev.keystore').read_bytes()==z.read('app/luckydex-dev.keystore')
for path in ['adventure-move-data.js','adventure-regions.js','adventure-progression.js','adventure-regional-engine.js','adventure-regional-ui.js','adventure-regional.css']:assert (fresh/'app/src/main/assets/adventure'/path).is_file()
sha=hashlib.sha256(out.read_bytes()).hexdigest();report={'source':str(out),'sha256':sha,'bytes':out.stat().st_size,'rootLayoutPreserved':True,'freshExtraction':str(fresh),'targetedPassed':len(results),'versionName':'0.32.0','versionCode':320,'package':'com.example.luckydex','keystoreByteIdentical':True,'results':results}
Path(str(out)+'.sha256').write_text(sha+'  '+out.name+'\n',encoding='ascii');Path(str(out)+'.verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');shutil.copyfile(out,parent/'LuckyDex_source.zip')
print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))
