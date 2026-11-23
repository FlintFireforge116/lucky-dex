#!/usr/bin/env python3
"""Offline SM5 source and generated-card gate. Requires one-time --prepare."""
from __future__ import annotations
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07424-ultra-prism-integration.test.cjs','tests/v07425-ultra-prism-reuse.test.cjs']
def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/sm5_release_contract.json').read_text())
 assert (c['set'],c['stage'],c['release'])==('sm5','stage1','0.69.405')
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonGX'],c['gxAttackPrints'],c['prismStarPrints'],c['trainerPrints'],c['energyPrints'])==(178,237,37,27,27,6,36,5)
 assert c['pin']=='66cbd13b706b789de3b8cce2f5c9fc95135a33b0'
 assert c['variants']==['119a','122a','125a','135a','153a']
 path=ROOT/'data/classic/sm5-print-compact.json'
 assert path.is_file(),'SM5 source missing. Run: python3 scripts/build-sm5.py --prepare before pushing'
 pin=json.loads((ROOT/'docs/SM5_CANONICAL_SOURCE.json').read_text())
 assert pin['sourceGitBlob']==c['pin'] and pin['compactSha256']==hashlib.sha256(path.read_bytes()).hexdigest(),'SM5 print data checksum mismatch'
 rows=json.loads(path.read_text())
 assert len(rows)==178 and len({r[0] for r in rows})==178
 assert [r[0] for r in rows]==[x for n in range(1,174) for x in ([str(n),str(n)+'a'] if str(n)+'a' in c['variants'] else [str(n)])]
 assert (sum(len(r[7]) for r in rows),sum(len(r[8]) for r in rows),sum('GX' in r[3] for r in rows))==(237,37,27)
 assert (sum('Prism Star' in r[3] for r in rows),sum(r[2]=='Trainer' for r in rows),sum(r[2]=='Energy' for r in rows))==(6,36,5)
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.405['\"]",gradle) and 'versionCode 7405' in gradle
 for task in ['preflightSM5ContractForApk','generateSM5ForApk','auditSM5ForApk']:
  assert "tasks.register('"+task+"'" in gradle,task+' missing'
 assert "dependsOn tasks.named('auditSM4ForApk')" in gradle
 assert "dependsOn tasks.named('auditSM5ForApk')" in gradle
 for f in TESTS:assert (ROOT/f).is_file() and "'"+f+"'" in gradle,f+' missing mandatory gate'
 for f in ('tcg-classic-battle-data.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js'):
  assert 'sm5' in (ROOT/'app/src/main/assets'/f).read_text(),f+' missing SM5 registration'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 assert 'tcg-classic-ultra-prism.js' in html and 'v0.69.405' in html
 assert "__LUCKYDEX_BUILD='0.69.405'" in (ROOT/'app/src/main/assets/app-v0167.js').read_text()
 for sid in ['xy9','xy10','xy11','xy12','sm1','sm2','sm3','sm4']:
  assert json.loads((ROOT/f'scripts/{sid}_release_contract.json').read_text())['release']=='0.69.405'
 print('SM5 source gate PASS: SHA-pinned official 178 prints, 237 attacks, 37 Abilities, 27 GX, 6 Prism Star')
def full():
 subprocess.run([sys.executable,'scripts/build-sm5.py'],cwd=ROOT,check=True)
 d=json.loads((ROOT/'docs/SM5_BUILD_COVERAGE.json').read_text())
 assert (d['printed'],d['attacks'],d['abilities'],d['pokemonGX'],d['gxAttackPrints'],d['prismStarPrints'],d['energyPrints'])==(178,237,37,27,27,6,5)
 assert d['battleReady']>=1 and d['battleReady']+len(d['gated'])==178
 assert all(d['gated'].values())
 subprocess.run(['node','--test',*TESTS],cwd=ROOT,check=True)
 print(f"SM5 release gate PASS: {d['battleReady']}/178 playable, {len(d['gated'])} explicitly gated")
if __name__=='__main__':
 try:
  p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
  check()
  if a.full:full()
 except (AssertionError,RuntimeError,ValueError,subprocess.CalledProcessError,FileNotFoundError) as e:
  print('SM5 RELEASE PREFLIGHT FAILED:',str(e),file=sys.stderr);sys.exit(1)
