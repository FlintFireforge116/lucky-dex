"""Audit that only reviewed v0.51.0 source files differ from the supplied ZIP."""
import argparse, hashlib, json, zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {
    'README.md', 'package.json', 'package-lock.json', 'app/build.gradle',
    'app/src/main/assets/index.html', 'app/src/main/assets/app-v0167.js',
    'app/src/main/assets/arcade-pokemon-seek-core.js',
    'app/src/main/assets/arcade-pokemon-seek.js',
    'app/src/main/assets/arcade-pokemon-seek.css',
    'app/src/main/assets/arcade-platform.js',
    'app/src/main/assets/arcade-records.js',
    'app/src/main/assets/arcade-records-core.js',
    'app/src/main/assets/achievements-v0341.js',
    'app/src/main/assets/arcade-world.js',
    'app/src/main/assets/arcade-session.js',
    'tests/v0501-dream-world-polish.test.cjs',
    'tests/v0505-pokemon-seek-core.test.cjs',
    'tests/v0505-pokemon-seek-integration.test.cjs',
}
def sha(data):
    return hashlib.sha256(data).hexdigest()
def main():
    p=argparse.ArgumentParser();p.add_argument('baseline');a=p.parse_args()
    baseline=Path(a.baseline); changed=[]; unexpected=[]; unchanged=0; missing=[]; signer={}
    with zipfile.ZipFile(baseline) as z:
        for name in z.namelist():
            if name.endswith('/'):continue
            file=ROOT/name
            if not file.is_file():missing.append(name);continue
            before=sha(z.read(name));after=sha(file.read_bytes())
            if before!=after:
                changed.append(name)
                if name not in ALLOWED:unexpected.append(name)
            else:unchanged+=1
            if name=='app/luckydex-dev.keystore':signer={'baselineSha256':before,'currentSha256':after,'identical':before==after}
    report={'baseline':baseline.name,'baselineSha256':sha(baseline.read_bytes()),'unchangedFiles':unchanged,'changedFiles':changed,'unexpectedChanges':unexpected,'missingFiles':missing,'signer':signer}
    out=ROOT/'artifacts/v0510/baseline-comparison.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2));assert not unexpected and not missing
if __name__=='__main__':main()
