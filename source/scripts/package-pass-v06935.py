"""Create a changed-only canonical-source patch and independent reconstruction audit."""
import hashlib
import json
import os
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'v0.69.35'


def include(name):
    return (not any(p in {'.git', '.gradle', 'node_modules', '__pycache__', 'artifacts'} for p in Path(name).parts)
            and not name.startswith(('app/build/', 'build/', 'qa/')) and name != 'local.properties')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def file_sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024*1024), b''):
            h.update(block)
    return h.hexdigest()


def main(baseline, output):
    output.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(baseline) as z:
        assert z.testzip() is None
        entries = {n[7:]: n for n in z.namelist() if n.startswith('source/') and not n.endswith('/') and include(n[7:])}
        before = {n: sha(z.read(p)) for n, p in entries.items()}
        current = {}
        for folder, dirs, files in os.walk(ROOT):
            dirs[:] = [d for d in dirs if include((Path(folder)/d).relative_to(ROOT).as_posix()+'/')]
            for name in files:
                p = Path(folder)/name
                rel = p.relative_to(ROOT).as_posix()
                if include(rel):
                    current[rel] = p
        after = {n: file_sha(p) for n, p in current.items()}
        changed = sorted(n for n in after if before.get(n) != after[n])
        deleted = sorted(set(before)-set(after))
        allowed = {'app-v0167.js', 'index.html', 'tcgp-battle-core.js', 'tcgp-battle-effects.js', 'tcgp-battle-decks.js', 'tcgp-battle-solo.js', 'tcgp-battle-ui.js', 'tcgp-battle.css', 'tcgp/generated/catalogue.js', 'tcgp/generated/THIRD_PARTY_NOTICES.txt'}
        unexpected = [n for n in changed+deleted if n.startswith('app/src/main/assets/') and n.removeprefix('app/src/main/assets/') not in allowed]
        assert not unexpected, 'Unrelated runtime asset changes: '+repr(unexpected)
        assert not deleted, 'Unexpected source deletions: '+repr(deleted)
        for p in ['app/luckydex-dev.keystore', 'app/src/main/assets/tcgp-battle-ai.js', 'app/src/main/assets/tcgp-battle-progress.js', 'app/src/main/assets/tcgp-battle-data.js']:
            assert before[p] == after[p], 'Protected source changed: '+p
        p = 'app/src/main/assets/app-v0167.js'
        assert z.read(entries[p]).replace(b"__LUCKYDEX_BUILD='0.69.33'", b"__LUCKYDEX_BUILD='0.69.35'") == current[p].read_bytes(), 'App shell changed beyond release marker'
        assert z.read('.github/workflows/build-apk.yml') == (ROOT.parent/'.github/workflows/build-apk.yml').read_bytes()
    patch = output/f'LuckyDex_patch_{VERSION}.zip'
    with zipfile.ZipFile(patch, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in changed:
            assert '..' not in Path(name).parts and not name.startswith(('source/', '/'))
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 30, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, current[name].read_bytes())
    reconstructed = dict(before)
    with zipfile.ZipFile(patch) as z:
        assert z.testzip() is None and sorted(z.namelist()) == changed
        for n in z.namelist():
            h = sha(z.read(n))
            assert before.get(n) != h, 'Unchanged file included: '+n
            reconstructed[n] = h
    assert reconstructed == after
    apk = ROOT/'app/build/outputs/apk/debug/app-debug.apk'
    with zipfile.ZipFile(apk) as z:
        for name in allowed:
            assert z.read('assets/'+name) == (ROOT/'app/src/main/assets'/name).read_bytes(), 'Stale APK asset: '+name
    report = dict(baseline=str(baseline), baselineSha256=file_sha(baseline), patch=str(patch),
                  patchSha256=file_sha(patch), bytes=patch.stat().st_size, files=changed, deleted=deleted,
                  unchangedSourceFiles=len(before)-sum(n in before for n in changed),
                  sourceReconstructionMatches=True, noUnrelatedRuntimeChanges=True, appShellOnlyVersionChanged=True,
                  permanentSignerAndWorkflowUnchanged=True, apkAssetsMatch=True, apkSha256=file_sha(apk))
    (output/f'LuckyDex_patch_audit_{VERSION}.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main(Path(sys.argv[1]).resolve(strict=True), Path(sys.argv[2]).resolve())
