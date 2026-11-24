#!/usr/bin/env python3
"""Offline, pinned SM3 preflight. --full includes generated catalogue and battle tests."""
from __future__ import annotations
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=('tests/v07413-burning-shadows-integration.test.cjs',
       'tests/v07414-burning-shadows-outcomes.test.cjs',
       'tests/v07415-burning-shadows-continuation.test.cjs',
       'tests/v07416-burning-shadows-stage3.test.cjs',
       'tests/v07417-burning-shadows-final-26.test.cjs',
       'tests/v07418-burning-shadows-independent-audit.test.cjs',
       'tests/v07404-basic-energy-search-coins.test.cjs',
       'tests/v07406-basic-energy-search-special-cases.test.cjs',
       'tests/v07385-fates-collide-stage3.test.cjs',
       'tests/v07333-classic-deck-quality.test.cjs')
def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/sm3_release_contract.json').read_text())
 assert (c['set'],c['stage'],c['release'])==('sm3','complete','0.69.426')
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonGX'],c['gxAttackPrints'],c['energyPrints'])==(177,274,27,40,40,3)
 assert c['pin']=='3476b25cb32b6e748c7fdd9405e6a5329a665d3d'
 assert c['minimumBattleEnabled']==177
 assert c['variants']==['18a','39a','88a','92a','105a','112a','115a','116a']
 p=ROOT/'data/classic/sm3-print-compact.json'
 assert p.exists(),'SM3 canonical compact source must be bundled (never fetch on GitHub build)'
 assert hashlib.sha256(p.read_bytes()).hexdigest()==c['compactSha256'],'SM3 catalogue checksum mismatch'
 rows=json.loads(p.read_text())
 assert len(rows)==177 and len({r[0] for r in rows})==177
 assert (sum(len(r[7]) for r in rows),sum(len(r[8]) for r in rows))==(274,27)
 gen=(ROOT/'scripts/build-sm3.py').read_text()
 for needle in (c['pin'],c['compactSha256'],'sm3-print-compact.json',"load_pinned_set('sm3'",'177','274','27','40','Burning Shadows'):
  assert needle in gen,'SM3 generator missing '+needle
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.426['\"]",gradle) and 'versionCode 7426' in gradle
 for name in ('preflightSM3ContractForApk','generateSM3ForApk','auditSM3ForApk'):
  assert "tasks.register('"+name+"'" in gradle,'Missing Gradle task '+name
 assert "dependsOn tasks.named('auditSM2ForApk')" in gradle
 assert "dependsOn tasks.named('generateSM3ForApk')" in gradle
 assert "dependsOn tasks.named('auditSM3ForApk')" in gradle
 for path in TESTS:assert (ROOT/path).is_file() and "'"+path+"'" in gradle,'Missing mandatory SM3 test '+path
 for f in ('tcg-classic-battle-data.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js'):
  assert 'sm3' in (ROOT/'app/src/main/assets'/f).read_text(),f+' missing Burning Shadows'
 assert 'tcg-classic-burning-shadows.js' in (ROOT/'app/src/main/assets/index.html').read_text()
 for name in ('sm1','sm2','xy9','xy10','xy11','xy12'):
  assert json.loads((ROOT/f'scripts/{name}_release_contract.json').read_text())['release']==c['release'],name+' contract version stale'
 for path in ('app/src/main/assets/index.html','app/src/main/assets/app-v0167.js'):
  assert '0.69.426' in (ROOT/path).read_text(),path+' version stale'
 print('PASS SM3 source gate: pinned 177 prints; 274 attacks, 27 Abilities, 40 GX, 3 Energy; all player/CPU/CDN surfaces registered.')
def full():
 subprocess.run([sys.executable,'scripts/build-sm3.py'],cwd=ROOT,check=True)
 x=json.loads((ROOT/'docs/SM3_BUILD_COVERAGE.json').read_text())
 assert x['printed']==177 and x['attacks']==274 and x['abilities']==27
 assert x['battleReady']==177 and len(x['gated'])==0,'SM3 completion requires all 177 prints implemented'
 assert all(x['gated'].values())
 subprocess.run(['node','--test',*TESTS],cwd=ROOT,check=True)
 print(f"PASS SM3 full build gate: {x['battleReady']} playable and {len(x['gated'])} explicitly gated")
if __name__=='__main__':
 try:
  parser=argparse.ArgumentParser();parser.add_argument('--full',action='store_true');a=parser.parse_args()
  check()
  if a.full:full()
 except (AssertionError,ValueError,subprocess.CalledProcessError) as e:
  print('SM3 RELEASE PREFLIGHT FAILED:',str(e),file=sys.stderr)
  sys.exit(1)
