"""Verify the APK's offline payload/version/signing evidence before delivery."""
from pathlib import Path
import hashlib,json,re,zipfile
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'app/src/main/assets';OUT=ROOT/'artifacts'
config=(ROOT/'app/build.gradle').read_text(encoding='utf-8')
VERSION=re.search(r"versionName\s+'([^']+)'",config).group(1)
VERSION_CODE=int(re.search(r'versionCode\s+(\d+)',config).group(1))
stem='v'+VERSION.replace('.','')
apk=OUT/f'LuckyDex-v{VERSION}-debug.apk'
sha=lambda b:hashlib.sha256(b).hexdigest()
entries=[]
for manifest in ['arcade/authentic-v0200/manifest.json','arcade/sprites/manifest.json','arcade/sprites/actors/manifest.json']:
 data=json.loads((A/manifest).read_text(encoding='utf-8'))
 if isinstance(data,dict):data=data.get('assets',data.get('files',[]))
 entries.extend(data)
venues=json.loads((A/'arcade/venues-v0223/manifest.json').read_text(encoding='utf-8'))
entries.extend(venues['venues']);entries.extend(venues['source_assets'])
adventure=json.loads((A/'adventure/art/manifest.json').read_text(encoding='utf-8'))
entries.extend(adventure)
with zipfile.ZipFile(apk) as z:
 for row in entries:
  name=row.get('path') or row.get('output') or row.get('relative')
  if not name.startswith(('arcade/','adventure/','moon_')):name='arcade/authentic-v0200/'+name
  assert sha(z.read('assets/'+name))==row['sha256'],f'APK payload differs: {name}'
 all_files=[p for p in A.rglob('*') if p.is_file()]
 for p in all_files:assert z.read('assets/'+p.relative_to(A).as_posix())==p.read_bytes(),f'Outdated APK: {p}'
 names=z.namelist()
 assert not any('assets/arcade/venues/' in n or 'assets/arcade/venues-v0190/' in n for n in names)
 assert not any(n.endswith('.keystore') for n in names)
metadata=(OUT/f'{stem}-apk-metadata.log').read_text(encoding='utf-8-sig')
assert f"name='com.example.luckydex' versionCode='{VERSION_CODE}' versionName='{VERSION}'" in metadata
cert_pattern=r'Signer #1 certificate SHA-256 digest: ([a-f0-9]+)'
cert=re.search(cert_pattern,(OUT/f'{stem}-apk-signature.log').read_text(encoding='utf-8-sig')).group(1)
baseline_cert='069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a'
assert cert==baseline_cert,'Signing identity changed'
report={'package':'com.example.luckydex','versionName':VERSION,'versionCode':VERSION_CODE,'apk':str(apk),'apkBytes':apk.stat().st_size,'apkSha256':sha(apk.read_bytes()),'signerSha256':cert,'originalSignerPreserved':True,'manifestEntriesVerified':len(entries),'allSourceAssetsVerified':len(all_files),'testPrograms':len(list((ROOT/'tests').glob('*.cjs'))),'androidRuntime':'not run: Android device/WebView execution not performed; Chrome mobile QA completed'}
layout=OUT/stem/'acceptance/acceptance.json'
if layout.exists():
 rows=json.loads(layout.read_text(encoding='utf-8'))['runs'];report['adventureViewports']=[r['viewport'] for r in rows];report['locationCaptures']=sum(len(r['records'])+len(r['spotChecks']) for r in rows);report['realBattleActions']=sum(len(r['battleActions']) for r in rows)
(OUT/stem).mkdir(exist_ok=True)
(OUT/stem/'release-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
