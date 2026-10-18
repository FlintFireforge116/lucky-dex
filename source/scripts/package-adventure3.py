from pathlib import Path
import zipfile, json, hashlib, tempfile
R = Path(__file__).resolve().parents[1]
out = R / 'releases'
out.mkdir(exist_ok=True)
Z = out / 'LuckyDex_source_v0.40.1.zip'
APK = out / 'LuckyDex-v0.40.1-debug.apk'
if not APK.is_file():
    raise RuntimeError('Copy the verified v0.40.1 APK into releases first.')
check = R / 'qa'
check.mkdir(exist_ok=True)
V = Path(tempfile.mkdtemp(prefix='verified-', dir=check))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
scratch = {'refactor-wild-hunt-v040.py', 'integrate-adventure3.py'}
def selected(p):
    rel = p.relative_to(R).as_posix()
    parts = rel.split('/')
    if any(x in {'.git', '.gradle', '.tools', 'node_modules', '__pycache__', 'build', 'cache', 'caches', 'qa', 'releases'} for x in parts):
        return False
    if p.name in scratch or p.name == 'local.properties' or p.suffix in {'.apk', '.pyc'}:
        return False
    if parts[0] == 'artifacts':
        return rel.startswith('artifacts/v0401/') and p.name != 'progress.md'
    return True
files = sorted(p for p in R.rglob('*') if p.is_file() and selected(p))
with zipfile.ZipFile(Z, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in files:
        z.write(p, p.relative_to(R).as_posix())
with zipfile.ZipFile(Z) as z:
    assert z.testzip() is None
    for name in z.namelist():
        assert (V / name).resolve().is_relative_to(V.resolve()), name
        assert (R / name).read_bytes() == z.read(name), 'source ZIP drift: ' + name
    z.extractall(V)
    for name in z.namelist():
        assert (V / name).read_bytes() == z.read(name), 'extraction drift: ' + name
    with zipfile.ZipFile(APK) as apk:
        assets = list(p for p in (V / 'app/src/main/assets').rglob('*') if p.is_file())
        for p in assets:
            asset = 'assets/' + p.relative_to(V / 'app/src/main/assets').as_posix()
            assert apk.read(asset) == p.read_bytes(), 'APK/ZIP mismatch: ' + str(p)
report = {
    'zip': str(Z), 'zipBytes': Z.stat().st_size, 'zipSha256': sha(Z),
    'apk': str(APK), 'apkBytes': APK.stat().st_size, 'apkSha256': sha(APK),
    'sourceFiles': len(files), 'allExtractedAssetsMatchApk': len(assets),
    'freshExtraction': str(V),
    'excluded': 'Git, dependencies/build/tool caches, SDK properties, APKs, source baselines and old/scratch QA',
}
(out / 'LuckyDex_v0.40.1_package-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
