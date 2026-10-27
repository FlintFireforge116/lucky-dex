"""Create and audit a changed/new-files-only patch from the actual Git diff.

Run from canonical source/: python scripts/package-tcgp-cards-patch.py
  --base BASE_COMMIT --output OUTPUT_DIR
The optional --source-archive supplied.zip independently verifies original
source bytes. No repository-root files, secrets, caches or full source included.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
RELEASE = 'v0.69.33'
RUNTIME_ALLOWED = {'index.html', 'app-v0167.js', 'tcgp-battle-data.js',
                   'tcgp-battle-core.js', 'tcgp-battle-effects.js',
                   'tcgp-battle-decks.js', 'tcgp-battle-ai.js',
                   'tcgp-battle-solo.js', 'tcgp-battle-ui.js', 'tcgp-battle-progress.js'}


def git(*args):
    return subprocess.check_output(['git', '-c', 'core.autocrlf=false', *args], cwd=REPO).decode('utf-8')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def allowed(rel):
    parts = Path(rel).parts
    return not any(p in {'.git', '.gradle', '.tools', 'node_modules', 'artifacts', 'build', '__pycache__'} for p in parts) and not rel.endswith(('.apk', '.zip', '.keystore', '.jks', '.pyc')) and rel != 'local.properties'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--base', required=True)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--source-archive', type=Path)
    args = p.parse_args()
    base = git('rev-parse', args.base).strip()
    tracked = git('diff', '--name-only', '--diff-filter=ACMRT', base, '--', 'source/').splitlines()
    untracked = git('ls-files', '--others', '--exclude-standard', '--', 'source/').splitlines()
    deleted = git('diff', '--name-only', '--diff-filter=D', base, '--', 'source/').splitlines()
    candidates = sorted(set(tracked + untracked))
    base_files = set(git('ls-tree', '-r', '--name-only', base, '--', 'source/').splitlines())
    chosen = []
    for full in candidates:
        assert full.startswith('source/'), full
        rel = full[len('source/'):]
        if not allowed(rel):
            continue
        f = ROOT / rel
        if full in tracked and full in base_files:
            original = subprocess.check_output(['git', 'show', base + ':' + full], cwd=REPO)
            if original == f.read_bytes():
                continue
        if rel.startswith('app/src/main/assets/'):
            name = rel[len('app/src/main/assets/'):]
            assert name in RUNTIME_ALLOWED or name.startswith('tcgp/generated/'), 'Unrelated runtime change: ' + rel
        chosen.append((rel, f))
    delete_paths = [f[len('source/'):] for f in deleted]
    assert all(allowed(f) for f in delete_paths), 'Unexpected deletion'
    archive_audit = None
    if args.source_archive:
        with zipfile.ZipFile(args.source_archive) as z:
            prefix = 'lucky-dex/source/'
            before = {i.filename[len(prefix):]: z.read(i) for i in z.infolist() if i.filename.startswith(prefix) and not i.is_dir()}
        changed_set = {rel for rel, _ in chosen}
        unexpected = []
        for rel, original in before.items():
            f = ROOT / rel
            if not f.exists():
                if rel not in delete_paths:
                    unexpected.append(rel)
            elif f.read_bytes() != original and rel not in changed_set:
                unexpected.append(rel)
        assert not unexpected, 'Changes omitted from patch: ' + str(unexpected)
        assert (ROOT / 'app/luckydex-dev.keystore').read_bytes() == before['app/luckydex-dev.keystore']
        # Main app/Android files must preserve all non-version bytes.
        for rel in ['app/src/main/assets/app-v0167.js', 'app/build.gradle', 'package.json', 'package-lock.json']:
            expected = before[rel].replace(b'0.69.32', b'0.69.33')
            if rel == 'app/build.gradle':
                expected = expected.replace(b'versionCode 7013', b'versionCode 7014')
            assert (ROOT / rel).read_bytes() == expected, 'Non-version change: ' + rel
        archive_audit = {'baselineSourceFiles': len(before), 'byteIdenticalOriginalFiles': sum((ROOT / rel).exists() and (ROOT / rel).read_bytes() == data for rel, data in before.items()), 'unexpectedChanges': [], 'signerPreserved': True}
        for rel, f in chosen:
            assert rel not in before or f.read_bytes() != before[rel], 'Unchanged file in patch: ' + rel
    args.output.mkdir(parents=True, exist_ok=True)
    output = args.output / ('LuckyDex_patch_' + RELEASE + '.zip')
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for rel, f in chosen:
            z.write(f, rel)
    with zipfile.ZipFile(output) as z:
        assert z.testzip() is None, 'Patch CRC failed'
        assert z.namelist() == [rel for rel, _ in chosen]
        for rel, f in chosen:
            assert z.read(rel) == f.read_bytes(), 'Packaged bytes differ: ' + rel
    if delete_paths:
        (args.output / ('LuckyDex_delete_' + RELEASE + '.txt')).write_text('\n'.join(delete_paths) + '\n')
    manifest = {'release': RELEASE, 'gitBaseline': base, 'sourceRelativePaths': True,
                'patch': output.name, 'bytes': output.stat().st_size, 'sha256': sha(output.read_bytes()),
                'fileCount': len(chosen), 'files': [{'path': rel, 'bytes': f.stat().st_size, 'sha256': sha(f.read_bytes())} for rel, f in chosen],
                'deleted': delete_paths, 'archiveAudit': archive_audit, 'zipCRC': 'PASS', 'allPackagedBytesMatch': True}
    (args.output / ('LuckyDex_patch_' + RELEASE + '_manifest.json')).write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({k: manifest[k] for k in ['patch', 'bytes', 'sha256', 'fileCount', 'deleted', 'archiveAudit', 'zipCRC']}, indent=2))


if __name__ == '__main__':
    main()
