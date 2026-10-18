"""Audit the supplied v0.47.4 archive and package LuckyDex v0.48.0 source."""
from pathlib import Path
import argparse, hashlib, zipfile

ROOT=Path(__file__).resolve().parents[1]
BASELINE_SHA='bc339692d914d05bb924805fd2168c7f677488b526275e0509d48e4136044785'
ALLOWED_CHANGED={
 'README.md','package.json','package-lock.json','app/build.gradle',
 'app/src/main/assets/index.html','app/src/main/assets/app-v0167.js',
 'app/src/main/assets/arcade.css','app/src/main/assets/arcade-world.js',
 'app/src/main/assets/arcade-session.js','app/src/main/assets/arcade-platform.js',
 'app/src/main/assets/arcade-records.js','app/src/main/assets/achievements-v0341.js',
 'tests/helpers/current-target-range-release.cjs',
 'tests/v0390-arcade-records-registry.test.cjs',
 'tests/v0470-roulette-integration.test.cjs',
}
ALLOWED_ADDED={
 'TEST_REPORT_v0.48.0.md','scripts/package-source-v0480.py',
 'tests/v0480-slot-machine-core.test.cjs','tests/v0480-slot-machine-integration.test.cjs',
 'tests/v0480-arcade-catalog.test.cjs','tests/v0480-release.test.cjs',
 'app/src/main/assets/arcade-slot-machine-core.js',
 'app/src/main/assets/arcade-slot-machine.js',
 'app/src/main/assets/arcade-slot-machine.css',
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
 files=[]
 for rel,data in base.items():
  # Preserve every baseline entry, including historical QA/bytecode files.
  f=ROOT/rel
  files.append((rel,f))
 for rel in sorted(ALLOWED_ADDED):
  f=ROOT/rel
  assert f.exists(),'missing intended added file: '+rel
  files.append((rel,f))
 # Reject any other source-like additions outside generated/local directories.
 ignored_roots=('node_modules/','qa/','artifacts/','build/','.git/','.gradle/','.idea/')
 allowed=set(base)|ALLOWED_ADDED
 for f in ROOT.rglob('*'):
  if not f.is_file(): continue
  rel=f.relative_to(ROOT).as_posix()
  if rel in allowed: continue
  if rel.startswith(ignored_roots) or '/build/' in rel or '/__pycache__/' in rel: continue
  if f.name=='local.properties' or f.suffix in {'.apk','.aab','.pyc','.zip'}: continue
  raise AssertionError('unexpected added file: '+rel)
 files.sort(key=lambda x:x[0]);a.output.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(a.output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for rel,f in files:z.write(f,rel)
 with zipfile.ZipFile(a.output) as z:
  assert z.testzip() is None
  assert len(z.namelist())==len(files)
  assert len(set(z.namelist()))==len(files)
  for rel,f in files: assert z.read(rel)==f.read_bytes(),rel
 print(f'PASS source package: baseline {len(base)} files; {len(changed)} approved changes; {len(ALLOWED_ADDED)} intended additions; {len(files)} packaged files')
 print(f'SHA256 {sha(a.output.read_bytes())}')
 print(f'BYTES {a.output.stat().st_size}')

if __name__=='__main__':main()
