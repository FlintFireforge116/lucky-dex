"""Export committed source and QA, verify source/APK bytes, then emit release hashes."""
from pathlib import Path
import hashlib,json,shutil,subprocess,zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'
SOURCE=OUT/'LuckyDex_v0.23.0_SOURCE.zip'
APK=OUT/'LuckyDex-v0.23.0-debug.apk'
QA=OUT/'LuckyDex_v0.23.0_QA.zip'
assert not subprocess.check_output(['git','status','--porcelain'],cwd=ROOT).strip(),'Commit release files before export'
subprocess.run(['git','-c','core.autocrlf=false','archive','--format=zip','--output='+str(SOURCE),'HEAD'],cwd=ROOT,check=True)
shutil.copyfile(SOURCE,OUT/'LuckyDex_source.zip')
with zipfile.ZipFile(SOURCE) as source,zipfile.ZipFile(APK) as apk:
    assert not any(n.lower().endswith('.keystore') for n in source.namelist()),'Private signing key in source'
    count=0
    for p in (ROOT/'app/src/main/assets').rglob('*'):
        if p.is_file():
            name=p.relative_to(ROOT/'app/src/main/assets').as_posix()
            assert source.read('app/src/main/assets/'+name)==p.read_bytes()==apk.read('assets/'+name),name
            count+=1
revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
verification={'commit':revision,'sourceApkAssetsEqual':count,'sourcePrivateKeyExcluded':True}
(OUT/'v0230/source-verification.json').write_text(json.dumps(verification,indent=2)+'\n')
with zipfile.ZipFile(QA,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted((OUT/'v0230').rglob('*')):
        if p.is_file():z.write(p,p.relative_to(OUT/'v0230').as_posix())
    for p in [OUT/'v0230-android-build.log',OUT/'v0230-apk-metadata.log',OUT/'v0230-apk-signature.log',ROOT/'docs/V0230_REPORT.md',ROOT/'docs/ADVENTURE_ASSET_SOURCES.md']:
        z.write(p,p.relative_to(ROOT).as_posix() if p.is_relative_to(ROOT/'docs') else p.name)
    for p in sorted((ROOT/'docs/adventure').rglob('*')):
        if p.is_file():z.write(p,p.relative_to(ROOT).as_posix())
rows=[]
for p in [APK,SOURCE,OUT/'LuckyDex_source.zip',QA]:
    digest=hashlib.sha256(p.read_bytes()).hexdigest()
    rows.append(f'{digest}  {p.name}')
(OUT/'LuckyDex_v0.23.0_SHA256.txt').write_text('\n'.join(rows)+'\n',encoding='ascii')
print(json.dumps(verification,indent=2))
print('\n'.join(rows))
