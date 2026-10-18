"""Audit the supplied v0.45.0 archive and package LuckyDex v0.45.1 source."""
from pathlib import Path
import argparse, hashlib, zipfile

ROOT=Path(__file__).resolve().parents[1]
BASELINE_SHA='924fac4b3f38a672d1399f5ec3e1e02d9772e72d00d4c2c151e68f34e9f91f71'
ALLOWED_CHANGED={
 'README.md','package.json','package-lock.json','app/build.gradle',
 'app/src/main/assets/index.html','app/src/main/assets/app-v0167.js',
 'app/src/main/assets/arcade-elemental-gauntlet-core.js',
 'app/src/main/assets/arcade-elemental-gauntlet.js',
 'app/src/main/assets/arcade-elemental-gauntlet.css',
 'tests/helpers/current-target-range-release.cjs',
}
ALLOWED_ADDED={
 'TEST_REPORT_v0.45.1.md','scripts/package-source-v0451.py',
 'tests/v0451-elemental-gauntlet-intensity.test.cjs','tests/v0451-release.test.cjs',
}

def sha(b): return hashlib.sha256(b).hexdigest()

def main():
 p=argparse.ArgumentParser();p.add_argument('--baseline',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 assert sha(a.baseline.read_bytes())==BASELINE_SHA,'wrong baseline archive'
 with zipfile.ZipFile(a.baseline) as z:
  assert z.testzip() is None
  base={i.filename:z.read(i.filename) for i in z.infolist() if not i.is_dir()}
 changed=[];removed=[]
 for rel,data in base.items():
  f=ROOT/rel
  if not f.exists(): removed.append(rel)
  elif f.read_bytes()!=data: changed.append(rel)
 assert not removed,'unexpected removals: '+', '.join(removed[:10])
 unexpected=[x for x in changed if x not in ALLOWED_CHANGED]
 assert not unexpected,'unexpected changes: '+', '.join(unexpected)
 skip={'.git','node_modules','.gradle','.idea','__pycache__'}
 files=[]
 for f in ROOT.rglob('*'):
  if not f.is_file(): continue
  rel=f.relative_to(ROOT).as_posix()
  if any(part in skip for part in f.relative_to(ROOT).parts): continue
  if f.name=='local.properties' or f.suffix in {'.apk','.aab','.pyc','.zip'}: continue
  if rel not in base and rel not in ALLOWED_ADDED:
   if rel.startswith('qa/') or rel.startswith('artifacts/') or rel.startswith('build/') or '/build/' in rel: continue
   raise AssertionError('unexpected added file: '+rel)
  files.append((rel,f))
 found_added={r for r,_ in files if r not in base}
 missing=ALLOWED_ADDED-found_added
 assert not missing,'missing intended added files: '+', '.join(sorted(missing))
 files.sort();a.output.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(a.output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for rel,f in files:z.write(f,rel)
 with zipfile.ZipFile(a.output) as z:
  assert z.testzip() is None
  assert len(z.namelist())==len(files)
  for rel,f in files: assert z.read(rel)==f.read_bytes(),rel
 print(f'PASS source package: baseline {len(base)} files; {len(changed)} approved changes; {len(found_added)} intended additions; {len(files)} packaged files')
 print(f'SHA256 {sha(a.output.read_bytes())}')
 print(f'BYTES {a.output.stat().st_size}')

if __name__=='__main__':main()
