from pathlib import Path
import os, zipfile, hashlib, tempfile, json
R = Path(__file__).resolve().parents[1]
out = R / 'releases'
out.mkdir(exist_ok=True)
target = out / 'LuckyDex_source_v0.42.3.zip'
qa = R / 'qa'
qa.mkdir(exist_ok=True)
fresh = Path(tempfile.mkdtemp(prefix='verified-', dir=qa))
excluded = {'.git', '.gradle', '.tools', '.superpowers', 'node_modules', '__pycache__', 'build', 'cache', 'caches', 'qa', 'releases'}
files = []
for directory, dirs, names in os.walk(R):
    dirs[:] = [d for d in dirs if d not in excluded]
    for name in names:
        p = Path(directory) / name
        rel = p.relative_to(R).as_posix()
        if name == 'local.properties' or p.suffix in {'.apk', '.pyc', '.log'}:
            continue
        if rel.startswith('artifacts/') and not rel.startswith('artifacts/v0423/'):
            continue
        files.append(p)
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in sorted(files):
        z.write(p, p.relative_to(R).as_posix())
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    for name in z.namelist():
        assert (fresh / name).resolve().is_relative_to(fresh.resolve())
        assert z.read(name) == (R / name).read_bytes(), name
    z.extractall(fresh)
    for name in z.namelist():
        assert z.read(name) == (fresh / name).read_bytes(), name
digest = hashlib.sha256(target.read_bytes()).hexdigest()
(out / 'LuckyDex_source_v0.42.3.zip.sha256').write_text(digest + '  ' + target.name + '\n', encoding='ascii')
report = {'zip': str(target), 'bytes': target.stat().st_size, 'sha256': digest, 'sourceFiles': len(files), 'crcPassed': True, 'allSourceBytesMatch': True, 'allExtractedBytesMatch': True, 'freshExtraction': str(fresh)}
(out / 'LuckyDex_v0.42.3_package-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
