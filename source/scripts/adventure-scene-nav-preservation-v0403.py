"""Check every pinned v0.40.2 original against exact approved path edits.

The input pin was generated on the untouched extraction. This checker cannot
regenerate it. Release normalization only accepts the intended 0.40.2→0.40.3
and 4002→4003 markers; all other original bytes must match or be approved by
one exact file path. Regional engine edits can never be approved.
"""
import argparse, hashlib, json, pathlib, re, zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
PIN=ROOT/'tests/adventure-scene-nav-preservation-v0403.json'
ENGINE='app/src/main/assets/adventure/adventure-regional-engine.js'
RELEASE={'package.json','package-lock.json','app/build.gradle','app/src/main/assets/app-v0167.js','app/src/main/assets/index.html'}
def sha(data): return hashlib.sha256(data).hexdigest()
def release_bytes(name,data):
    if name in ('package.json','package-lock.json'):
        # Replace only these exact top-level/root package version values. Every
        # nested dependency version and whitespace stays byte-identical.
        text=data.decode('utf-8')
        if name=='package.json':
            return re.sub(r'^(  "version": )"0\.40\.[23]"',r'\1"RELEASE"',text,flags=re.M).encode()
        obj=json.loads(text)
        if obj.get('version') not in ('0.40.2','0.40.3') or obj.get('packages',{}).get('',{}).get('version') not in ('0.40.2','0.40.3'): return data
        # Only the root's two version lines occur before the dependency list.
        prefix,separator,suffix=text.partition('    "node_modules/')
        prefix=re.sub(r'("version": )"0\.40\.[23]"',r'\1"RELEASE"',prefix)
        return (prefix+separator+suffix).encode()
    if name=='app/build.gradle':
        data=data.replace(b"versionName '0.40.2'",b"versionName 'RELEASE'").replace(b"versionName '0.40.3'",b"versionName 'RELEASE'")
        data=re.sub(rb'\bversionCode 400[23]\b',b'versionCode RELEASE',data)
        data=data.replace(b'LuckyDex-asset-builder/0.40.2',b'LuckyDex-asset-builder/RELEASE').replace(b'LuckyDex-asset-builder/0.40.3',b'LuckyDex-asset-builder/RELEASE')
    if name=='app/src/main/assets/app-v0167.js':
        data=data.replace(b"__LUCKYDEX_BUILD='0.40.2'",b"__LUCKYDEX_BUILD='RELEASE'").replace(b"__LUCKYDEX_BUILD='0.40.3'",b"__LUCKYDEX_BUILD='RELEASE'")
    if name=='app/src/main/assets/index.html':
        data=re.sub(rb'v0\.40\.[23](?!\d)',b'vRELEASE',data)
    return data
def check(archive,allowed,output):
    pin=json.loads(PIN.read_text(encoding='utf-8-sig'))
    assert sha(archive.read_bytes())==pin['archiveSha256'],'Sole baseline ZIP changed'
    assert ENGINE not in allowed,'Regional engine must remain byte exact'
    assert all('*' not in p and not p.endswith('/') and '\\' not in p and '..' not in pathlib.PurePosixPath(p).parts for p in allowed),'Approval paths must be exact safe POSIX file paths'
    exact=[];edited=[];release=[];failures=[]
    with zipfile.ZipFile(archive) as source:
        archive_files={e.filename for e in source.infolist() if not e.is_dir()}
        assert archive_files==set(pin['files']),'Pin inventory differs from sole supplied ZIP'
        for name,pinned in pin['files'].items():
            original=source.read(name)
            assert sha(original)==pinned['sha256'],'Pin digest no longer matches archive: '+name
            file=ROOT/name
            if not file.is_file(): failures.append({'path':name,'reason':'missing original file'});continue
            current=file.read_bytes()
            if sha(current)==pinned['sha256']: exact.append(name)
            elif name==ENGINE: failures.append({'path':name,'reason':'Regional engine must remain byte exact'})
            elif name in RELEASE and release_bytes(name,current)==release_bytes(name,original): release.append(name)
            elif name in allowed: edited.append(name)
            else: failures.append({'path':name,'reason':'unapproved original byte change'})
    unknown=sorted(allowed-set(pin['files']))
    report={'baselineSha256':pin['archiveSha256'],'originalFiles':len(pin['files']),'exactOriginalCount':len(exact),'approvedOriginalEdits':edited,'narrowReleaseMarkers':release,'engineByteExact':ENGINE in exact,'approvedExactPaths':sorted(allowed),'approvedPathsNotInBaseline':unknown,'failures':failures}
    if output: output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))
    if failures: raise SystemExit(1)
parser=argparse.ArgumentParser()
parser.add_argument('--archive',type=pathlib.Path,default=ROOT.parent/'LuckyDex_source_v0.40.2.zip')
parser.add_argument('--allow',action='append',default=[])
parser.add_argument('--allow-file',type=pathlib.Path)
parser.add_argument('--output',type=pathlib.Path)
args=parser.parse_args();allowed=set(args.allow)
if args.allow_file: allowed.update(json.loads(args.allow_file.read_text(encoding='utf-8-sig')))
check(args.archive,allowed,args.output)
