#!/usr/bin/env python3
"""Guardians Rising SM2 source, generated-card and Gradle APK gate checks.

Default checks are network-free; --full uses the bundled *pinned* SM2 source, then
runs battle and deckbuilder tests on the actual 180 official collector prints.
"""
from __future__ import annotations
import json,subprocess,sys,argparse,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/sm2_release_contract.json').read_text())
 assert (c['set'],c['stage'],c['release'])==('sm2','stage1','0.69.442')
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonGX'],c['gxAttackPrints'],c['energyPrints'])==(180,287,30,42,42,4)
 assert c['pin']=='0d2296a8c32fac6442c9b407653d30f8e9c3f0d6'
 compact=ROOT/'data/classic/sm2-print-compact.json'
 assert compact.exists(),'Bundled SM2 catalogue missing; release must not rely on a network fetch'
 assert hashlib.sha256(compact.read_bytes()).hexdigest()==c['compactSha256'],'SM2 bundled source checksum differs from release contract'
 assert len(c['variants'])==11 and len(set(c['variants']))==11
 gen=(ROOT/'scripts/build-sm2.py').read_text()
 for term in (c['pin'],"load_pinned_set('sm2'",'sm2-print-compact.json','!=180','!=287','!=30','!=42','!=4','Guardians Rising'):
  assert term in gen,'SM2 generator missing: '+term
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.442['\"]",gradle) and 'versionCode 7442' in gradle
 for task in ('preflightSM2ContractForApk','generateSM2ForApk','auditSM2ForApk'):
  assert "tasks.register('"+task+"'" in gradle,task
 assert "dependsOn tasks.named('auditSM1ForApk')" in gradle
 assert "dependsOn tasks.named('generateSM2ForApk')" in gradle
 assert "dependsOn tasks.named('auditSM2ForApk')" in gradle
 for test in ('tests/v07407-guardians-rising-integration.test.cjs','tests/v07408-guardians-rising-berserk-condition.test.cjs','tests/v07409-guardians-rising-audit.test.cjs','tests/v07410-guardians-rising-continuation.test.cjs','tests/v07411-guardians-rising-last-34.test.cjs','tests/v07412-guardians-rising-independent-outcomes.test.cjs','tests/v07333-classic-deck-quality.test.cjs','tests/v07404-basic-energy-search-coins.test.cjs','tests/v07406-basic-energy-search-special-cases.test.cjs'):
  assert "'"+test+"'" in gradle and (ROOT/test).is_file(),'Missing SM2 APK test '+test
 for file in ('tcg-classic-battle-data.js','tcg-classic-opponents.js','tcg-classic-deck-builder.js','tcg-classic-set-picker.js'):
  assert 'sm2' in (ROOT/'app/src/main/assets'/file).read_text(),file+' missing SM2'
 assert 'tcg-classic-guardians-rising.js' in (ROOT/'app/src/main/assets/index.html').read_text()
 for file in ('sm1','xy9','xy10','xy11','xy12'):
  assert json.loads((ROOT/f'scripts/{file}_release_contract.json').read_text())['release']==c['release'],file+' release version mismatch'
 for p in ['app/src/main/assets/index.html','app/src/main/assets/app-v0167.js']:
  assert '0.69.442' in (ROOT/p).read_text(),p+' not versioned'
 print('PASS SM2 source gate: pinned 180 prints / 287 attacks / 30 Abilities / 42 GX / 4 Energy; registered all surfaces and chained into APK build.')

def full():
 subprocess.run([sys.executable,'scripts/build-sm2.py'],cwd=ROOT,check=True)
 d=json.loads((ROOT/'docs/SM2_BUILD_COVERAGE.json').read_text());c=json.loads((ROOT/'scripts/sm2_release_contract.json').read_text())
 assert (d['printed'],d['attacks'],d['abilities'],d['pokemonGX'],d['gxAttackPrints'],d['energyPrints'],d['sourceGitBlob'])==(180,287,30,42,42,4,c['pin'])
 assert d['battleReady']==180,'SM2 completion must retain all 180 battle-enabled prints'
 assert len(d['gated'])==180-d['battleReady']
 assert d['battleReady']+len(d['gated'])==180 and all(d['gated'].values()),'Each gated print needs named blockers'
 subprocess.run(['node','--test','tests/v07407-guardians-rising-integration.test.cjs','tests/v07408-guardians-rising-berserk-condition.test.cjs','tests/v07409-guardians-rising-audit.test.cjs','tests/v07410-guardians-rising-continuation.test.cjs','tests/v07411-guardians-rising-last-34.test.cjs','tests/v07412-guardians-rising-independent-outcomes.test.cjs','tests/v07333-classic-deck-quality.test.cjs','tests/v07404-basic-energy-search-coins.test.cjs','tests/v07406-basic-energy-search-special-cases.test.cjs'],cwd=ROOT,check=True)
 print(f"PASS SM2 full APK gate: {d['battleReady']}/180 playable, {len(d['gated'])} gated; both deck selectors audited")

def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('--full',action='store_true');args=a.parse_args()
 check()
 if args.full:full()
if __name__=='__main__':
 try:main()
 except (AssertionError,ValueError,subprocess.CalledProcessError) as e:
  print('SM2 RELEASE PREFLIGHT FAILED:',str(e),file=sys.stderr);sys.exit(1)
