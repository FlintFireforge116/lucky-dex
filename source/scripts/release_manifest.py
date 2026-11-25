#!/usr/bin/env python3
"""Verify a packaged LuckyDex release without rebuilding or rerunning tests.

The manifest is a consistency check, not a signature or substitute for CI.
Generate it only after the full preparation command has passed on final files.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path, PurePosixPath
from release_version import verify_release_version

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = 'scripts/packaged_release_manifest.json'
SCHEMA = 1
REQUIRED = ('app/build.gradle', 'app/src/main/assets/index.html',
            'app/src/main/assets/app-v0167.js', 'scripts/prepare-release.sh',
            'scripts/release_manifest.py', 'scripts/release_version.py')
# Cover the historical generated TCG assets as well as the current patch.
PATTERNS = ('app/src/main/assets/tcg-classic*.js', 'app/src/main/assets/tcgp-*.js',
            'data/classic/*-print-compact.json', 'docs/*_CANONICAL_SOURCE.json',
            'docs/*_BUILD_COVERAGE.json', 'scripts/*_release_contract.json')


def checked_path(root, name):
    if not isinstance(name, str) or '\\' in name:
        raise ValueError(f'Invalid manifest path: {name!r}')
    p = PurePosixPath(name)
    if not p.parts or p.is_absolute() or '..' in p.parts or p.as_posix() != name or name == MANIFEST:
        raise ValueError(f'Invalid manifest path: {name!r}')
    path = root / name
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(f'Path escapes source root: {name}')
    return path


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def required_paths(root):
    return set(REQUIRED).union(*(set(p.relative_to(root).as_posix() for p in root.glob(pattern) if p.is_file()) for pattern in PATTERNS))


def full_script(root, name):
    if not isinstance(name, str) or not re.fullmatch(r'prepare-[a-z0-9-]+\.sh', name) or name == 'prepare-release.sh':
        raise ValueError('Invalid full preparation script in manifest')
    path = root / 'scripts' / name
    if not path.is_file():
        raise ValueError(f'Missing full preparation script: {path}')
    return path


def create(root, patch_paths, script):
    version = verify_release_version(root)
    full_script(root, script)
    names = required_paths(root) | set(patch_paths) | {'scripts/' + script}
    names.discard(MANIFEST)
    files = {n: digest(checked_path(root, n)) for n in sorted(names)}
    return {'schema': SCHEMA, 'release': version, 'fullPrepare': script, 'files': files}


def verify(root, manifest):
    if manifest.get('schema') != SCHEMA:
        raise ValueError('Unsupported release manifest schema')
    version = verify_release_version(root)
    if manifest.get('release') != version:
        raise ValueError(f'Manifest version {manifest.get("release")} differs from source {version}')
    script = full_script(root, manifest.get('fullPrepare'))
    files = manifest.get('files')
    if not isinstance(files, dict):
        raise ValueError('Missing release file hashes')
    omitted = (required_paths(root) | {script.relative_to(root).as_posix()}) - files.keys()
    if omitted:
        raise ValueError('Unlisted required files: ' + ', '.join(sorted(omitted)))
    errors = []
    for name, expected in files.items():
        path = checked_path(root, name)
        if not isinstance(expected, str) or not re.fullmatch(r'[0-9a-f]{64}', expected):
            errors.append('invalid SHA-256: ' + name)
        elif not path.is_file():
            errors.append('missing: ' + name)
        elif digest(path) != expected:
            errors.append('changed: ' + name)
    if errors:
        raise ValueError('Packaged files differ from the verified release:\n  ' + '\n  '.join(errors))
    return version, len(files)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    mode = p.add_mutually_exclusive_group()
    mode.add_argument('--full', action='store_true', help='Verify package, then run the original complete preparation chain')
    mode.add_argument('--create', type=Path, metavar='PATCH_PATH_LIST', help='Release author only: manifest from a newline-delimited list of patch members after full validation')
    p.add_argument('--full-script', help='Original set preparation script basename (with --create)')
    args = p.parse_args()
    try:
        if args.create:
            if not args.full_script:
                p.error('--create needs --full-script')
            manifest = create(ROOT, args.create.read_text().splitlines(), args.full_script)
            (ROOT / MANIFEST).write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
        else:
            if args.full_script:
                p.error('--full-script requires --create')
            manifest = json.loads((ROOT / MANIFEST).read_text())
            version, count = verify(ROOT, manifest)
            print(f'LuckyDex {version}: {count} packaged/source files verified (SHA-256); version checks PASS.', flush=True)
            if args.full:
                subprocess.run(['sh', str(full_script(ROOT, manifest['fullPrepare']))], cwd=ROOT, check=True)
            else:
                print('Fast preparation PASS — no generation or gameplay tests run on this device. Full checks remain in release validation and CI.')
    except (OSError, ValueError, AssertionError, subprocess.CalledProcessError) as exc:
        p.exit(1, f'Release preparation FAILED: {exc}\nDo not commit this package. Check the ZIP and source version; for a development rebuild, use the original set prepare script.\n')


if __name__ == '__main__':
    main()
