#!/usr/bin/env python3
"""Fail closed if a changed-files LuckyDex ZIP cannot unzip into source/."""
import sys
import zipfile
from pathlib import PurePosixPath


def check(zip_path):
    with zipfile.ZipFile(zip_path) as z:
        paths = [p for p in z.namelist() if not p.endswith('/')]
        assert paths, 'Patch ZIP has no files'
        assert len(paths) == len(set(paths)), 'Patch ZIP contains duplicate paths'
        for member in paths:
            p = PurePosixPath(member)
            assert (not member.startswith('/') and '\\' not in member and
                    '..' not in p.parts and p.parts[0] not in
                    ('source', '.github', 'lucky-dex-main', '.git')), (
                    f'Unsafe or non-source-relative ZIP path: {member}')
            assert (p.parts[0] in ('app', 'docs', 'scripts', 'tests', 'data',
                                   'gradle', 'gradle.properties', 'settings.gradle',
                                   'README.md', 'requirements-dev.txt')), (
                                   f'Unexpected ZIP root (review manually): {member}')
        for required in ('app/build.gradle', 'docs/LUCKYDEX_MASTER_RULES.txt'):
            assert required in paths, f'Missing essential patch member: {required}'
        print(f'OK: {len(paths)} source-relative patch files in {zip_path}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: verify-source-relative-patch.py PATCH.zip')
    check(sys.argv[1])
