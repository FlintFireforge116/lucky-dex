"""Create the clean source archive and detached final-hash test report."""
import argparse, hashlib, json, re, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EXCLUDED_DOCS={
    'docs/superpowers/plans/2026-10-08-pokemon-dash-v2-implementation.md',
    'docs/superpowers/plans/2026-10-11-arcade-records-game-review-v0390.md',
    'docs/superpowers/plans/2026-10-11-magikarps-splash.md',
}
EVIDENCE={'baseline-tests.json','final-tests.json','focused-final.log','full-runner.log','baseline-comparison.json','build-final.log','apk-verification.txt'}
def include(rel):
    parts=rel.parts;name=rel.as_posix()
    if any(x in parts for x in ('.git','.gradle','node_modules','__pycache__')):return False
    if name.startswith('app/build/') or name in EXCLUDED_DOCS or name=='local.properties':return False
    if name.startswith('reference/dw-candidates/') and rel.suffix.lower() not in ('.json',):return False
    if name.startswith('artifacts/'):
        return name.startswith('artifacts/v0510/visual/') or (name.startswith('artifacts/v0510/') and rel.name in EVIDENCE)
    return rel.suffix.lower() not in ('.apk','.aab','.hprof','.zip')
def main():
    p=argparse.ArgumentParser();p.add_argument('destination');a=p.parse_args();dest=Path(a.destination).resolve();dest.mkdir(parents=True,exist_ok=True)
    assert ROOT not in dest.parents and dest!=ROOT,'Output must be outside source root'
    files=sorted((f for f in ROOT.rglob('*') if f.is_file() and include(f.relative_to(ROOT))),key=lambda f:f.relative_to(ROOT).as_posix())
    assert files and (ROOT/'TEST_REPORT_v0.51.0.md') in files
    # Explicit safety gate: obsolete archived upload instructions are not shipped.
    command=re.compile(r'(?im)^\s*(?:cd\s+~/lucky-dex|cp\s+/sdcard/|pkg\s+install|termux-setup-storage)')
    for f in files:
        if f.suffix.lower() in {'.md','.txt','.sh','.yml','.yaml'}:
            assert not command.search(f.read_text(encoding='utf-8',errors='replace')),f
    archive=dest/'LuckyDex_source_v0.51.0.zip'
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for f in files:
            info=zipfile.ZipInfo(f.relative_to(ROOT).as_posix(),date_time=(2026,10,17,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
            z.writestr(info,f.read_bytes())
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert z.read('app/src/main/assets/arcade-pokemon-seek.js')==(ROOT/'app/src/main/assets/arcade-pokemon-seek.js').read_bytes()
        assert z.read('app/luckydex-dev.keystore')==(ROOT/'app/luckydex-dev.keystore').read_bytes()
        assert all(not n.startswith(('app/build/','.gradle/')) for n in z.namelist())
        assert len([n for n in z.namelist() if n.startswith('app/src/main/assets/arcade/dream-world/seek/')])==39
    digest=hashlib.sha256(archive.read_bytes()).hexdigest()
    (dest/(archive.name+'.sha256')).write_text(digest+'  '+archive.name+'\n',encoding='utf-8')
    report=(ROOT/'TEST_REPORT_v0.51.0.md').read_text(encoding='utf-8').replace('<!-- FINAL_ZIP_SHA256 -->','**Final source ZIP SHA-256:** `'+digest+'`')
    (dest/'TEST_REPORT_v0.51.0.md').write_text(report,encoding='utf-8')
    result={'archive':str(archive),'bytes':archive.stat().st_size,'files':len(files),'sha256':digest,'zipCrcVerified':True,'excludedArchivedCommandDocs':sorted(EXCLUDED_DOCS),'candidateBinaryCacheExcluded':True,'buildCachesAndApkExcluded':True}
    (dest/'package-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,indent=2))
if __name__=='__main__':main()
