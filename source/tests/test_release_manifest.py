"""Fast-path failure injection; no dependencies or production-file mutation."""
import json
import sys
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import release_manifest as m


class ReleaseManifestTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.version = '0.69.504'
        for path in m.REQUIRED:
            self.write(path, 'fixture')
        self.write('app/build.gradle', "versionName '0.69.504'\nversionCode 7504\n")
        self.write('app/src/main/assets/index.html', '<span id="titleBuildVersion">v0.69.504</span> LUCKY DEX · v0.69.504')
        self.write('app/src/main/assets/app-v0167.js', "window.__LUCKYDEX_BUILD='0.69.504'")
        self.write('scripts/test_release_contract.json', json.dumps({'release': self.version}))
        self.write('scripts/prepare-example.sh', '#!/bin/sh\nexit 0\n')
        self.asset = 'app/src/main/assets/tcg-classic-example.js'
        self.write(self.asset, 'const cards = [];')
        self.patch = 'docs/notes.md'
        self.write(self.patch, 'release notes')
        self.manifest = m.create(self.root, [self.patch], 'prepare-example.sh')

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')

    def test_verified_release(self):
        self.assertEqual(m.verify(self.root, self.manifest), (self.version, len(self.manifest['files'])))

    def test_modified_catalogue(self):
        self.write(self.asset, 'const cards = [1];')
        with self.assertRaisesRegex(ValueError, 'changed: .*tcg-classic-example'):
            m.verify(self.root, self.manifest)

    def test_missing_catalogue(self):
        (self.root / self.asset).unlink()
        with self.assertRaisesRegex(ValueError, 'missing: .*tcg-classic-example'):
            m.verify(self.root, self.manifest)

    def test_modified_patch(self):
        self.write(self.patch, 'changed notes')
        with self.assertRaisesRegex(ValueError, 'changed: docs/notes.md'):
            m.verify(self.root, self.manifest)

    def test_wrong_version(self):
        self.manifest['release'] = '0.69.503'
        with self.assertRaisesRegex(ValueError, 'Manifest version'):
            m.verify(self.root, self.manifest)

    def test_stale_contract(self):
        self.write('scripts/test_release_contract.json', json.dumps({'release': '0.69.503'}))
        with self.assertRaises(AssertionError):
            m.verify(self.root, self.manifest)

    def test_missing_manifest_entry(self):
        del self.manifest['files'][self.asset]
        with self.assertRaisesRegex(ValueError, 'Unlisted required files'):
            m.verify(self.root, self.manifest)

    def test_unsafe_path(self):
        self.manifest['files']['../escape'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'Invalid manifest path'):
            m.verify(self.root, self.manifest)

    def test_invalid_full_script(self):
        self.manifest['fullPrepare'] = 'prepare-release.sh'
        with self.assertRaisesRegex(ValueError, 'Invalid full preparation script'):
            m.verify(self.root, self.manifest)

    def test_extra_catalogue(self):
        self.write('app/src/main/assets/tcg-classic-unexpected.js', 'unexpected')
        with self.assertRaisesRegex(ValueError, 'Unlisted required files'):
            m.verify(self.root, self.manifest)

    def test_shell_fast_and_full_modes(self):
        # Exercise actual shell dispatch from outside the fixture source root.
        for name in ('prepare-release.sh', 'release_manifest.py', 'release_version.py'):
            shutil.copyfile(m.ROOT / 'scripts' / name, self.root / 'scripts' / name)
        self.write('scripts/prepare-example.sh', '#!/bin/sh\nset -eu\ntouch full-ran\n')
        manifest = m.create(self.root, [self.patch], 'prepare-example.sh')
        self.write(m.MANIFEST, json.dumps(manifest))
        args = ['sh', str(self.root / 'scripts/prepare-release.sh')]
        result = subprocess.run(args, cwd=self.root.parent, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('Fast preparation PASS', result.stdout)
        self.assertFalse((self.root / 'full-ran').exists())
        result = subprocess.run(args + ['--full'], cwd=self.root.parent, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.root / 'full-ran').exists())
        self.assertFalse((self.root / 'scripts/__pycache__').exists())

    def test_cli_missing_manifest_fails(self):
        for name in ('prepare-release.sh', 'release_manifest.py', 'release_version.py'):
            shutil.copyfile(m.ROOT / 'scripts' / name, self.root / 'scripts' / name)
        result = subprocess.run(['sh', str(self.root / 'scripts/prepare-release.sh')], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Do not commit this package', result.stderr)


if __name__ == '__main__':
    unittest.main()
