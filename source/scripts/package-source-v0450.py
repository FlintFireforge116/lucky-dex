"""Audit the supplied v0.44.0 archive and package LuckyDex v0.45.0 source."""
from pathlib import Path
import argparse, hashlib, zipfile

ROOT=Path(__file__).resolve().parents[1]
BASELINE_SHA='37454930d9bd623630b20d4795a5a05069b17ee1be877db0ff16ae496dd8839f'
ALLOWED_CHANGED={
 'README.md','CODEX_HANDOVER.md','package.json','package-lock.json','app/build.gradle',
 'app/src/main/assets/index.html','app/src/main/assets/app-v0167.js',
 'app/src/main/assets/achievements-v0341.js','app/src/main/assets/arcade-goldenrod-adapters.js',
 'app/src/main/assets/arcade-goldenrod-state.js','app/src/main/assets/arcade-goldenrod.js',
 'app/src/main/assets/arcade-platform.js','app/src/main/assets/arcade-records.js',
 'app/src/main/assets/arcade-session.js','app/src/main/assets/arcade-special-stats.js',
 'app/src/main/assets/arcade-world.js','app/src/main/assets/cosmetics-core-v0413.js',
 'tests/helpers/current-target-range-release.cjs','tests/v0390-arcade-records-registry.test.cjs',
 'tests/v0410-goldenrod-adapters.test.cjs','tests/v0410-goldenrod-state.test.cjs',
 'tests/v0420-target-range-adapter.test.cjs','tests/v0420-target-range-tournament.test.cjs',
 'tests/v0431-power-trial.test.cjs','tests/v0436-impact-trial.test.cjs',
}
ALLOWED_ADDED={
 'TEST_REPORT_v0.45.0.md','scripts/package-source-v0450.py',
 'app/src/main/assets/arcade-elemental-gauntlet-core.js',
 'app/src/main/assets/arcade-elemental-gauntlet.js',
 'app/src/main/assets/arcade-elemental-gauntlet.css',
 'tests/v0450-elemental-gauntlet.test.cjs','tests/v0450-release.test.cjs',
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
 assert not removed, 'unexpected removals: '+', '.join(removed[:10])
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
   # Ignore generated QA/cache outputs that were not part of the supplied source.
   if rel.startswith('qa/') or rel.startswith('artifacts/') or rel.startswith('build/') or '/build/' in rel: continue
   raise AssertionError('unexpected added file: '+rel)
  files.append((rel,f))
 found_added={r for r,_ in files if r not in base}
 missing=ALLOWED_ADDED-found_added
 assert not missing,'missing intended added files: '+', '.join(sorted(missing))
 files.sort()
 a.output.parent.mkdir(parents=True,exist_ok=True)
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
