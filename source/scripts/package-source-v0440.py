"""Audit the supplied v0.43.1 archive and package the local v0.44.0 source.

Never writes to the baseline archive or its repository. QA caches, generated
builds and machine-local dependencies are excluded from the release source.
"""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASELINE_SHA = '3465e1716efe96188a8ba26b65f29ddbc273670c20f0667b5c9b2511cc8a55ea'
ALLOWED_CHANGED = {
    'README.md', 'CODEX_HANDOVER.md', 'package.json', 'package-lock.json',
    'app/build.gradle', 'app/src/main/assets/index.html',
    'app/src/main/assets/app-v0167.js',
    'app/src/main/assets/cosmetics-catalog-v0413.js',
    'app/src/main/assets/cosmetics-core-v0413.js',
    'app/src/main/assets/cosmetics-customise-v0413.js',
    'app/src/main/assets/cosmetics-v0413.css',
    'scripts/run-tests.cjs',
    'tests/helpers/current-target-range-release.cjs',
    'tests/v0431-impact-defense-release.test.cjs',
    'tests/v0413-cosmetics-assets.test.cjs',
    'tests/v0413-customise-ui.test.cjs',
    'tests/v0413-reconciliation.test.cjs',
    'tests/v0413-card-backs.test.cjs',
}
ART_PREFIX = 'app/src/main/assets/cosmetics/sleeves/'
# Small acquisition records are required by offline integrity/reproduction tools.
# Full-resolution photos, generated source PNGs and test snapshots stay out.
INCLUDED_QA = {
    'qa/v0440/physical/catalogue-enumeration.json',
    'qa/v0440/physical/catalogue-seed.tsv',
    'qa/v0440/pocket/serebii-sleeves-source.html',
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--baseline', type=Path, required=True)
    p.add_argument('--output', type=Path, default=ROOT.parent / 'LuckyDex_source_v0.44.0.zip')
    p.add_argument('--audit-only', action='store_true')
    args = p.parse_args()
    assert sha(args.baseline.read_bytes()) == BASELINE_SHA, 'Wrong baseline archive'
    changed, removed, identical = [], [], []
    with zipfile.ZipFile(args.baseline) as baseline:
        assert baseline.testzip() is None, 'Baseline CRC failed'
        entries = {i.filename: i for i in baseline.infolist() if not i.is_dir()}
        for rel, info in entries.items():
            target = ROOT / rel
            if not target.exists():
                assert rel.startswith(ART_PREFIX) and rel.endswith('.webp'), 'Unexpected removal: ' + rel
                removed.append(rel)
            elif target.read_bytes() != baseline.read(info):
                assert rel in ALLOWED_CHANGED or rel.startswith(ART_PREFIX), 'Unexpected change: ' + rel
                changed.append(rel)
            else:
                identical.append(rel)
        # Enforce byte-minimal version-only changes in protected gameplay/build files.
        for rel in ['app/src/main/assets/app-v0167.js', 'app/build.gradle', 'package.json', 'package-lock.json']:
            expected = baseline.read(rel).replace(b'0.43.1', b'0.44.0')
            if rel == 'app/build.gradle':
                expected = expected.replace(b'versionCode 4301', b'versionCode 4400')
            assert (ROOT / rel).read_bytes() == expected, 'Non-version change: ' + rel
    files = []
    skipped = {'qa', '.git', '.tools', '.gradle', 'node_modules', 'build', '__pycache__'}
    for f in ROOT.rglob('*'):
        if not f.is_file():
            continue
        rel = f.relative_to(ROOT).as_posix()
        # Retain original non-runtime evidence exactly as supplied, without new QA output.
        if rel not in entries:
            if (any(s in skipped for s in f.relative_to(ROOT).parts) or rel.startswith('artifacts/')) and rel not in INCLUDED_QA:
                continue
            if f.name == 'local.properties' or f.suffix in {'.zip', '.apk', '.aab', '.pyc'}:
                continue
            if rel.startswith('app/'):
                assert rel.startswith(ART_PREFIX), 'Unexpected new app file: ' + rel
        files.append((rel, f))
    files.sort()
    report = {
        'baselineVersion': '0.43.1', 'releaseVersion': '0.44.0',
        'baselineArchiveSHA256': BASELINE_SHA, 'baselineFiles': len(entries),
        'unchangedBaselineFiles': len(identical), 'changedBaselineFiles': sorted(changed),
        'removedSupersededPlaceholderAssets': sorted(removed),
        'addedFiles': sorted(rel for rel, _ in files if rel not in entries),
        'sourceFiles': len(files), 'unexpectedChanges': [],
        'protectedVersionFilesHaveOnlyIdentityChanges': True,
    }
    assert len(removed) == 22, 'Unexpected placeholder removal count'
    audit = ROOT / 'qa/v0440/release-preservation.json'
    audit.parent.mkdir(parents=True, exist_ok=True)
    audit.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(f'PASS baseline audit: {len(identical)} unchanged, {len(changed)} approved changes, {len(removed)} replaced placeholders removed')
    if args.audit_only:
        return
    assert (ROOT / 'TEST_REPORT_v0.44.0.md').exists(), 'Release report missing'
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for rel, f in files:
            z.write(f, rel)
    with zipfile.ZipFile(args.output) as z:
        assert z.testzip() is None, 'Release CRC failed'
        assert len(z.namelist()) == len(files)
        for rel, f in files:
            assert z.read(rel) == f.read_bytes(), 'Packaged bytes differ: ' + rel
    report.update({'archive': args.output.name, 'archiveBytes': args.output.stat().st_size,
                   'archiveSHA256': sha(args.output.read_bytes()), 'zipCRC': 'PASS',
                   'allPackagedFilesMatchSource': True})
    audit.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(f'PASS archive: {len(files)} files, {report["archiveBytes"]:,} bytes, SHA256 {report["archiveSHA256"]}')


if __name__ == '__main__':
    main()
