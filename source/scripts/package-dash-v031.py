"""Preserve baseline root layout; verify the exact output ZIP in a fresh checkout."""
from pathlib import Path
import zipfile,hashlib,json,subprocess,shutil,os
root=Path(__file__).resolve().parents[1];out=root.parent/'LuckyDex_source_v0.31.0.zip';baseline=Path(r'C:\Users\sjwal\Downloads\LuckyDex_source_v0.30.0.zip')
included=set()
with zipfile.ZipFile(baseline) as old,zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for entry in old.infolist():
  if entry.is_dir():continue
  p=root/entry.filename
  assert p.is_file(),f'Missing baseline source file {entry.filename}'
  z.write(p,entry.filename);included.add(entry.filename)
 additions=[root/'app/src/main/assets/arcade/dash',root/'scripts/dash-source',root/'artifacts/dash-before',root/'artifacts/dash-v0310']
 for folder in additions:
  for p in sorted(folder.rglob('*')):
   if p.is_file():name=p.relative_to(root).as_posix();z.write(p,name);included.add(name)
 files=['app/src/main/assets/arcade-dash-assets.js','app/src/main/assets/arcade-dash-renderer.js','TEST_REPORT_v0.31.0.md','docs/DASH_ASSET_SOURCES.md','docs/DASH_V031_PLAN.md','docs/CODEX_DASH_V2_GEN3_POLISH_PASS.md','artifacts/dash-targeted.json','artifacts/test-inventory.json','artifacts/baseline-failures.json','artifacts/android-build-final.log','artifacts/v0310-apk-metadata.log','artifacts/v0310-apk-signature.log']
 files += [p.relative_to(root).as_posix() for p in (root/'scripts').glob('*dash*') if p.is_file()]
 files += [p.relative_to(root).as_posix() for p in (root/'tests').glob('arcade-dash*.test.cjs')]+['tests/v0310-release.test.cjs']
 for name in sorted(set(files)-included):z.write(root/name,name);included.add(name)
fresh=root.parent/'LuckyDex_v0.31.0_reverified'
assert not fresh.exists(),'Use a new extraction path; never overwrite a verification checkout'
with zipfile.ZipFile(out) as z:
 assert 'package.json' in z.namelist() and 'app/build.gradle' in z.namelist()
 assert not any(n.startswith('LuckyDex_v0.31.0/') for n in z.namelist())
 assert z.testzip() is None
 z.extractall(fresh)
tests=sorted(p.name for p in (fresh/'tests').glob('arcade-dash*.test.cjs'))+['v0310-release.test.cjs'];results=[]
for name in tests:
 r=subprocess.run(['node',str(fresh/'tests'/name)],cwd=fresh,capture_output=True,encoding='utf-8',errors='replace',timeout=60);results.append({'file':name,'exitCode':r.returncode,'output':r.stdout+r.stderr});print(name,r.returncode,flush=True);assert r.returncode==0,r.stdout+r.stderr
paths=list((fresh/'app/src/main/assets/arcade/dash').rglob('*.png'));assert len(paths)==221
with zipfile.ZipFile(baseline) as old:assert (fresh/'app/luckydex-dev.keystore').read_bytes()==old.read('app/luckydex-dev.keystore')
sha=hashlib.sha256(out.read_bytes()).hexdigest();report={'zip':str(out),'sha256':sha,'bytes':out.stat().st_size,'rootLayoutPreserved':True,'freshExtraction':str(fresh),'versionName':'0.31.0','versionCode':310,'package':'com.example.luckydex','keystoreByteIdentical':True,'localDashAssets':len(paths),'targetedPassed':len(results),'results':results}
Path(str(out)+'.verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');Path(str(out)+'.sha256').write_text(sha+'  '+out.name+'\n',encoding='ascii')
# Canonical source filename is used by the repository export workflow; update only after verification.
canonical=out.parent/'LuckyDex_source.zip';shutil.copyfile(out,canonical);assert hashlib.sha256(canonical.read_bytes()).hexdigest()==sha
print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))
