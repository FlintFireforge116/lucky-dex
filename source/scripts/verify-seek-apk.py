"""Verify final APK contains the exact current Seek source and bundled assets."""
import hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
apk=ROOT/'app/build/outputs/apk/debug/app-debug.apk'
assets=ROOT/'app/src/main/assets'
files=['arcade-pokemon-seek-locations.js','arcade-pokemon-seek-core.js','arcade-pokemon-seek.js','arcade-pokemon-seek.css','arcade-pokemon-seek-prizes.js','index.html','app-v0167.js']
files += [f.relative_to(assets).as_posix() for f in (assets/'arcade/dream-world/seek').iterdir() if f.is_file()]
with zipfile.ZipFile(apk) as z:
    for file in files:
        assert z.read('assets/'+file)==(assets/file).read_bytes(),file
    assert z.testzip() is None
metadata=json.loads((apk.parent/'output-metadata.json').read_text())
assert metadata['applicationId']=='com.example.luckydex'
assert metadata['elements'][0]['versionName']=='0.51.0'
assert metadata['elements'][0]['versionCode']==5100
result={'apkSha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'exactBundledFiles':len(files),'versionName':'0.51.0','versionCode':5100,'applicationId':metadata['applicationId'],'zipCrcVerified':True}
with (ROOT/'artifacts/v0510/apk-verification.txt').open('a',encoding='utf-8') as f:f.write('\n'+json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
