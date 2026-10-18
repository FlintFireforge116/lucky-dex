from pathlib import Path
import zipfile,json,hashlib,sys
R=Path(__file__).resolve().parents[1];Z=R.parent/'LuckyDex_source_v0.34.0.zip';V=R.parent/'LuckyDex_v0.34.0_verified'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pin=(R/'data/dash-gen3/PIN.txt').read_text().strip();required=set(json.loads((R/'data/dash-gen3/sources-sha256.json').read_text()))
def selected(p):
    rel=p.relative_to(R).as_posix();parts=rel.split('/')
    if any(x in {'.git','.gradle','node_modules','__pycache__','build'} for x in parts):return False
    if p.name in {'local.properties','source.zip'} or p.suffix in {'.apk','.pyc'}:return False
    prefix='data/dash-gen3/upstream/pokeemerald-'+pin+'/'
    if rel.startswith('data/dash-gen3/upstream/'):return rel.startswith(prefix) and rel[len(prefix):] in required
    return True
if '--package' in sys.argv:
    files=sorted(p for p in R.rglob('*') if p.is_file() and selected(p))
    with zipfile.ZipFile(Z,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in files:z.write(p,p.relative_to(R).as_posix())
    print(f'Packaged {len(files)} files; {Z.stat().st_size} bytes')
if '--verify' in sys.argv:
    V.mkdir(exist_ok=True)
    with zipfile.ZipFile(Z) as z:
        assert z.testzip() is None
        for name in z.namelist():
            dest=(V/name).resolve();assert dest.is_relative_to(V.resolve()),name
            assert (R/name).read_bytes()==z.read(name),'ZIP/source drift: '+name
        z.extractall(V)
        for name in z.namelist():assert (V/name).read_bytes()==z.read(name),'Extraction drift: '+name
        assert not any('/build/' in n or n.startswith('build/') or n=='local.properties' for n in z.namelist())
        assert len([n for n in z.namelist() if n.startswith('data/dash-gen3/upstream/')])==len(required)
        with zipfile.ZipFile(R/'artifacts/LuckyDex-v0.34.0-debug.apk') as apk:
            files=[p for p in (V/'app/src/main/assets').rglob('*') if p.is_file()]
            for p in files:assert apk.read('assets/'+p.relative_to(V/'app/src/main/assets').as_posix())==p.read_bytes(),'APK/ZIP differs: '+str(p)
    report={'zip':Z.name,'bytes':Z.stat().st_size,'sha256':sha(Z),'extracted':str(V),'allExtractedAssetsMatchApk':len(files),'essentialSourceFiles':len(required)}
    (R.parent/'LuckyDex_v0.34.0_package-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    (R.parent/'LuckyDex_source_v0.34.0.zip.sha256').write_text(report['sha256']+'  '+Z.name+'\n')
    print(json.dumps(report,indent=2))
