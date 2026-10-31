"""Changed-only patch against the untouched current v035 source directory."""
import hashlib
import json
import os
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def include(name):
    return not any(p in {'.git', '.gradle', 'node_modules', '__pycache__', 'artifacts'} for p in Path(name).parts) and not name.startswith(('app/build/', 'build/', 'qa/')) and name != 'local.properties'


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024*1024), b''):
            h.update(block)
    return h.hexdigest()


def inventory(root):
    paths = []
    for folder, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if include((Path(folder)/d).relative_to(root).as_posix()+'/')]
        for name in files:
            p = Path(folder)/name
            rel = p.relative_to(root).as_posix()
            if include(rel):
                paths.append((rel, p))
    with ThreadPoolExecutor(max_workers=8) as pool:
        return dict(pool.map(lambda item: (item[0], (item[1], digest(item[1]))), paths))


def main(baseline, output):
    print('Hashing untouched v035 canonical source...', flush=True)
    before = inventory(baseline)
    print('Hashing current canonical source...', flush=True)
    after = inventory(ROOT)
    changed = sorted(n for n in after if before.get(n, (None, None))[1] != after[n][1])
    deleted = sorted(set(before)-set(after))
    assert not deleted, 'Unexpected source deletion: '+repr(deleted)
    runtime = {'app-v0167.js', 'index.html', 'tcgp-battle-data.js', 'tcgp-battle-decks.js', 'tcgp-battle-effects.js', 'tcgp-battle-solo.js', 'tcgp-battle-ui.js', 'tcgp-battle.css', 'tcgp-deck-workspace.js', 'tcgp-deck-editor.js', 'tcgp-deck-editor.css', 'tcgp/generated/catalogue.js', 'tcgp/generated/THIRD_PARTY_NOTICES.txt'}
    unexpected = [n for n in changed if n.startswith('app/src/main/assets/') and n.removeprefix('app/src/main/assets/') not in runtime]
    assert not unexpected, 'Unrelated runtime changes: '+repr(unexpected)
    for n in ['app/luckydex-dev.keystore', 'app/src/main/assets/tcgp-battle-core.js', 'app/src/main/assets/tcgp-battle-ai.js', 'app/src/main/assets/tcgp-battle-progress.js']:
        assert before[n][1] == after[n][1], 'Protected source changed: '+n
    shell = 'app/src/main/assets/app-v0167.js'
    assert before[shell][0].read_bytes().replace(b"__LUCKYDEX_BUILD='0.69.35'", b"__LUCKYDEX_BUILD='0.69.36'") == after[shell][0].read_bytes(), 'Unrelated shell changes'
    assert (baseline.parent/'.github/workflows/build-apk.yml').read_bytes() == (ROOT.parent/'.github/workflows/build-apk.yml').read_bytes()
    output.mkdir(parents=True, exist_ok=True)
    patch = output/'LuckyDex_patch_v0.69.36.zip'
    with zipfile.ZipFile(patch, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for n in changed:
            entry = zipfile.ZipInfo(n, (2026, 10, 30, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            z.writestr(entry, after[n][0].read_bytes())
    reconstructed = {n: h for n, (_, h) in before.items()}
    with zipfile.ZipFile(patch) as z:
        assert z.testzip() is None and sorted(z.namelist()) == changed
        for n in z.namelist():
            assert not n.startswith(('source/', '/')) and '..' not in Path(n).parts
            reconstructed[n] = hashlib.sha256(z.read(n)).hexdigest()
    assert reconstructed == {n: h for n, (_, h) in after.items()}
    apk = ROOT/'app/build/outputs/apk/debug/app-debug.apk'
    with zipfile.ZipFile(apk) as z:
        for n in runtime:
            assert z.read('assets/'+n) == (ROOT/'app/src/main/assets'/n).read_bytes(), 'Stale APK '+n
    manifest = {n: h for n, (_, h) in before.items()}
    result = dict(version='0.69.36', androidVersionCode=7017, baseline=str(baseline), baselineManifestSha256=hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest(), patch=str(patch), patchSha256=digest(patch), bytes=patch.stat().st_size, changed=changed, deleted=deleted, sourceReconstructionMatches=True, unrelatedRuntimeUnchanged=True, coreCpuProgressSignerAndWorkflowUnchanged=True, apkAssetsMatch=True, apkSha256=digest(apk))
    (output/'LuckyDex_patch_audit_v0.69.36.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main(Path(sys.argv[1]).resolve(strict=True), Path(sys.argv[2]).resolve())
