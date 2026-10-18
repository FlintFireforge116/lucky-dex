"""Verify this bounded pass against the exact supplied archive, not an older tree."""
from pathlib import Path
import zipfile, hashlib, json, sys
R = Path(__file__).resolve().parents[1]
Z = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('C:/Users/sjwal/Downloads/LuckyDex_source_v0.42.2.zip')
runtime = {'app/src/main/assets/' + n for n in ('arcade-target-range.js', 'arcade-target-range-core.js', 'arcade-target-range.css')}
metadata = {'app/build.gradle', 'app/src/main/assets/index.html', 'app/src/main/assets/app-v0167.js'}
sha = lambda b: hashlib.sha256(b).hexdigest()
text = lambda b: b.decode('utf-8').replace('\r\n', '\n')
changed, protected = [], 0
with zipfile.ZipFile(Z) as z:
    app_names = {e.filename for e in z.infolist() if not e.is_dir() and e.filename.startswith('app/')}
    for name in sorted(app_names):
        old, new = z.read(name), (R / name).read_bytes()
        if old != new:
            changed.append(name)
        if name in runtime:
            continue
        if name in metadata:
            assert text(new).replace('0.42.3', '0.42.2').replace('versionCode 4203', 'versionCode 4202') == text(old), name
        else:
            assert new == old, 'Out-of-scope app change: ' + name
            protected += 1
    actual = {p.relative_to(R).as_posix() for p in (R / 'app').rglob('*') if p.is_file() and 'build' not in p.relative_to(R).parts}
    assert actual == app_names, 'Unexpected app source files: ' + str(actual ^ app_names)
    name = 'app/src/main/assets/arcade-target-range.js'
    def rewards(s): return s.split('  async function claimGoldenPrize()')[1].split('  function frame(')[0]
    assert rewards(text(z.read(name))) == rewards(text((R / name).read_bytes())), 'Reward/record/finish logic changed'
    name = 'app/src/main/assets/arcade-target-range.css'
    def attacks(s): return s.split('.target-range-projectile.attack-normal')[1].split('.target-range-pokemon{')[0].strip()
    assert attacks(text(z.read(name))) == attacks(text((R / name).read_bytes())), 'Attack silhouette rules changed'
def source_file(name):
    return not any(p in {'artifacts', 'qa', 'releases', 'build', '.gradle', '.superpowers', '__pycache__', 'node_modules'} for p in Path(name).parts) and not name.endswith(('.log', '.pyc', '.apk'))
with zipfile.ZipFile(Z) as z:
    originals = {e.filename for e in z.infolist() if not e.is_dir() and source_file(e.filename)}
    changed_source = sorted(n for n in originals if (R / n).read_bytes() != z.read(n))
current = {p.relative_to(R).as_posix() for p in R.rglob('*') if p.is_file() and source_file(p.relative_to(R).as_posix())}
report = {'baseline': Z.name, 'baselineSha256': sha(Z.read_bytes()), 'protectedAppFilesByteExact': protected, 'releaseOnlyFiles': sorted(metadata), 'changedAppFiles': changed, 'changedSourceFiles': changed_source, 'newSourceFiles': sorted(current-originals), 'rewardRecordSettlementUnchanged': True, 'all18AttackSilhouettesUnchanged': True}
(R / 'artifacts/v0423').mkdir(parents=True, exist_ok=True)
(R / 'artifacts/v0423/source-preservation.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
