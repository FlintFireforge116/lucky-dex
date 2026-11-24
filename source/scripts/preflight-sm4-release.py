#!/usr/bin/env python3
"""Crimson Invasion SM4 offline APK release gate; --full adds generated data and battle tests."""
from __future__ import annotations
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=('tests/v07419-crimson-invasion-integration.test.cjs',
       'tests/v07420-crimson-invasion-outcomes.test.cjs',
       'tests/v07421-crimson-invasion-continuation.test.cjs',
       'tests/v07422-crimson-invasion-completion.test.cjs',
       'tests/v07423-crimson-invasion-independent-audit.test.cjs',
       'tests/v07418-burning-shadows-independent-audit.test.cjs',
       'tests/v07385-fates-collide-stage3.test.cjs',
       'tests/v07404-basic-energy-search-coins.test.cjs',
       'tests/v07406-basic-energy-search-special-cases.test.cjs')
def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/sm4_release_contract.json').read_text())
 assert (c['set'],c['stage'],c['release'])==('sm4','stage1','0.69.422')
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonGX'],c['gxAttackPrints'],c['energyPrints'])==(126,193,23,25,25,4)
 assert c['pin']=='0b99823554d4da6d2da4fcafa030f9b675008490'
 assert c['variants']==['63a','84a']
 src=ROOT/'data/classic/sm4-print-compact.json';assert src.is_file(),'SM4 canonical prints must be bundled offline'
 assert hashlib.sha256(src.read_bytes()).hexdigest()==c['compactSha256']
 rows=json.loads(src.read_text())
 assert len(rows)==126 and len(set(row[0] for row in rows))==126
 assert (sum(len(r[7]) for r in rows),sum(len(r[8]) for r in rows))==(193,23)
 assert (sum('GX' in r[3] for r in rows),sum(r[2]=='Energy' for r in rows))==(25,4)
 gen=(ROOT/'scripts/build-sm4.py').read_text()
 for needle in ('sm4-print-compact.json',c['compactSha256'],c['pin'],"load_pinned_set('sm4'",'126','193','23','25'):
  assert needle in gen,'missing SM4 generator invariant '+needle
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.422['\"]",gradle) and 'versionCode 7422' in gradle
 for task in ('preflightSM4ContractForApk','generateSM4ForApk','auditSM4ForApk'):
  assert "tasks.register('"+task+"'" in gradle,'missing Gradle task '+task
 assert "dependsOn tasks.named('auditSM3ForApk')" in gradle
 assert "dependsOn tasks.named('auditSM4ForApk')" in gradle
 for f in TESTS:assert (ROOT/f).is_file() and "'"+f+"'" in gradle,f+' absent from mandatory APK test gates'
 for f in ('tcg-classic-battle-data.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js'):
  assert 'sm4' in (ROOT/'app/src/main/assets'/f).read_text(),f+' lacks SM4'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 assert 'tcg-classic-crimson-invasion.js' in html and 'v0.69.422' in html
 assert "__LUCKYDEX_BUILD='0.69.422'" in (ROOT/'app/src/main/assets/app-v0167.js').read_text()
 for name in ('xy9','xy10','xy11','xy12','sm1','sm2','sm3'):
  assert json.loads((ROOT/f'scripts/{name}_release_contract.json').read_text())['release']=='0.69.422',name+' release contract stale'
 print('SM4 source gate PASS: canonical 126 prints bundled offline, shared UI/CPU/builder and version contracts')
def full():
 subprocess.run([sys.executable,'scripts/build-sm4.py'],cwd=ROOT,check=True)
 j=json.loads((ROOT/'docs/SM4_BUILD_COVERAGE.json').read_text())
 c=json.loads((ROOT/'scripts/sm4_release_contract.json').read_text())
 assert (j['printed'],j['attacks'],j['abilities'],j['pokemonGX'],j['energyPrints'])==(126,193,23,25,4)
 assert j['battleReady']>=c['minimumBattleEnabled'] and j['battleReady']+len(j['gated'])==126
 assert all(j['gated'].values())
 subprocess.run(['node','--test',*TESTS],cwd=ROOT,check=True)
 print(f"SM4 full build gate PASS: {j['battleReady']}/126 playable, {len(j['gated'])} explicitly gated")
if __name__=='__main__':
 try:
  p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');args=p.parse_args()
  check()
  if args.full:full()
 except (AssertionError,ValueError,subprocess.CalledProcessError) as e:
  print('SM4 RELEASE PREFLIGHT FAILED:',str(e),file=sys.stderr);sys.exit(1)
