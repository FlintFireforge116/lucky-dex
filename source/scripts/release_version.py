"""One shared version invariant for all expansion release gates."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def verify_release_version(root=ROOT,gradle=None):
    gradle=(root/'app/build.gradle').read_text() if gradle is None else gradle
    names=re.findall(r'\bversionName\s+[\'\"](\d+\.\d+\.\d+)[\'\"]',gradle)
    codes=re.findall(r'\bversionCode\s+(\d+)\b',gradle)
    assert len(names)==len(codes)==1, 'Missing or duplicate Android version fields'
    version=names[0]
    assert int(codes[0])==7000+int(version.split('.')[-1]), f'Android versionCode {codes[0]} does not match {version}'
    assets=root/'app/src/main/assets'
    html=(assets/'index.html').read_text()
    boot=(assets/'app-v0167.js').read_text()
    assert f'id="titleBuildVersion">v{version}</span>' in html, 'Title version differs from Gradle'
    assert f'LUCKY DEX · v{version}' in html, 'App UI version differs from Gradle'
    assert f"window.__LUCKYDEX_BUILD='{version}'" in boot, 'Boot version differs from Gradle'
    for path in sorted((root/'scripts').glob('*_release_contract.json')):
        actual=json.loads(path.read_text())['release']
        assert actual==version, f'{path.name}: {actual} != {version}'
    return version

def self_test():
    from tempfile import TemporaryDirectory
    with TemporaryDirectory() as temp:
        root=Path(temp); (root/'scripts').mkdir();assets=root/'app/src/main/assets';assets.mkdir(parents=True)
        contract=root/'scripts/example_release_contract.json'
        def fixture(version):
            (assets/'index.html').write_text(f'<span id="titleBuildVersion">v{version}</span> LUCKY DEX · v{version}')
            (assets/'app-v0167.js').write_text(f"window.__LUCKYDEX_BUILD='{version}'")
            contract.write_text(json.dumps({'release':version}))
            return f"versionName '{version}'\nversionCode {7000+int(version.split('.')[-1])}"
        for version in ('0.69.901','0.69.902'):
            gradle=fixture(version);assert verify_release_version(root,gradle)==version
        for desc,invalid in [('stale code',gradle.replace('7902','7901')),('duplicate version',gradle+'\nversionCode 7902')]:
            try:verify_release_version(root,invalid)
            except AssertionError:pass
            else:raise AssertionError('Failed to reject '+desc)
        contract.write_text(json.dumps({'release':'0.69.901'}))
        try:verify_release_version(root,gradle)
        except AssertionError:pass
        else:raise AssertionError('Failed to reject stale contract')
    print('Shared version guard regression PASS: future version accepted, stale code/contract rejected')

if __name__=='__main__':
    self_test()
    print('Shared release version PASS:',verify_release_version())
