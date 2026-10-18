"""Package the tested tree, freshly extract it, and compare every byte to source/APK."""
from pathlib import Path
import hashlib, json, tempfile, zipfile
R=Path(__file__).resolve().parents[1]
O=R/'releases';O.mkdir(exist_ok=True)
APK=O/'LuckyDex-v0.40.2-debug.apk'
Z=O/'LuckyDex_source_v0.40.2.zip'
if not APK.is_file(): raise RuntimeError('Copy the verified versioned APK into releases first.')
if 'PENDING' in (R/'TEST_REPORT_v0.40.2.md').read_text(encoding='utf-8-sig'): raise RuntimeError('Finish the report before packaging.')
sha=lambda b:hashlib.sha256(b).hexdigest()
review=json.loads((R/'artifacts/v0402/release-verification.json').read_text(encoding='utf-8-sig'))
assert review['apkSha256']==sha(APK.read_bytes()) and review['originalSignerPreserved']
skip_dirs={'.git','.gradle','.tools','node_modules','__pycache__','build','cache','caches','qa','releases'}
scratch={'refactor-wild-hunt-v040.py','integrate-adventure3.py','local.properties'}
def selected(p):
 rel=p.relative_to(R).as_posix();parts=rel.split('/')
 if any(x in skip_dirs for x in parts) or p.name in scratch or p.suffix in {'.apk','.zip','.pyc'}:return False
 if parts[0]=='artifacts':
  return (rel.startswith('artifacts/v0402/') or rel=='artifacts/adventure-location-scenes/contact-sheet.png') and not ('failure' in p.name or p.name=='progress.md')
 return True
files=sorted(p for p in R.rglob('*') if p.is_file() and selected(p))
Q=R/'qa';Q.mkdir(exist_ok=True);V=Path(tempfile.mkdtemp(prefix='verified-v0402-',dir=Q))
with zipfile.ZipFile(Z,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(R).as_posix())
with zipfile.ZipFile(Z) as z:
 assert z.testzip() is None
 for name in z.namelist():
  assert (V/name).resolve().is_relative_to(V.resolve()),name
  assert z.read(name)==(R/name).read_bytes(),'source ZIP drift: '+name
 z.extractall(V)
 for name in z.namelist():assert (V/name).read_bytes()==z.read(name),'extraction drift: '+name
 with zipfile.ZipFile(APK) as apk:
  assets=sorted(p for p in (V/'app/src/main/assets').rglob('*') if p.is_file())
  for p in assets:
   name='assets/'+p.relative_to(V/'app/src/main/assets').as_posix()
   assert apk.read(name)==p.read_bytes(),'APK/source mismatch: '+name
  assert len(assets)==review['allSourceAssetsVerified']
report={'versionName':'0.40.2','versionCode':4002,'zip':str(Z),'zipBytes':Z.stat().st_size,'zipSha256':sha(Z.read_bytes()),'apk':str(APK),'apkBytes':APK.stat().st_size,'apkSha256':sha(APK.read_bytes()),'sourceFiles':len(files),'allExtractedAssetsMatchApk':len(assets),'allZipEntriesMatchTestedTree':True,'allFreshlyExtractedBytesMatchZip':True,'zipCrcVerified':True,'freshExtraction':str(V),'signerSha256':review['signerSha256'],'freshExtractionTests':'Pending; run the focused/source/preservation checks from freshExtraction before delivering.','excluded':'Git/dependencies/build/SDK caches, local SDK properties, archives/APKs, historical/scratch/failure QA. Pinned native source inputs and all runtime assets retained.'}
(O/'LuckyDex_v0.40.2_package-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
