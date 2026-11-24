#!/usr/bin/env python3
"""Evolutions XY12 source release and full generated print preflight.

Completion requires every official print to be playable with tested effects;
run --full to regenerate pinned metadata and verify independent gameplay gates.
"""
from __future__ import annotations
import argparse,json,os,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CONTRACT=ROOT/'scripts/xy12_release_contract.json'

def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads(CONTRACT.read_text(encoding='utf-8'))
 assert c['set']=='xy12' and c['stage']=='complete'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonBreak'],c['dualTypePrints'],c['energyPrints'])==(113,129,11,4,0,10)
 assert c['pin']=='7e80c06b0f3e5621058a29e26c90023d1033e65f'
 assert c['release']=='0.69.437'
 assert c['expectedPlayableMinimum']==len(c['requiredEnabledNumbers']) and c['expectedPlayableMinimum']==113
 assert len(c['requiredEnabledNumbers'])==len(set(c['requiredEnabledNumbers']))
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.437['\"]",gradle)
 assert 'versionCode 7437' in gradle
 for task in ('preflightXY12ContractForApk','generateXY12ForApk','auditXY12ForApk'):
  assert task in gradle,'Missing APK gate: '+task
 for name in ('xy9','xy10','xy11'):
  assert json.loads((ROOT/f'scripts/{name}_release_contract.json').read_text())['release']==c['release'],name+' release drift'
 assert 'tcg-classic-evolutions.js' in (ROOT/'app/src/main/assets/index.html').read_text()
 assert "v0.69.437" in (ROOT/'app/src/main/assets/index.html').read_text()
 assert "__LUCKYDEX_BUILD='0.69.437'" in (ROOT/'app/src/main/assets/app-v0167.js').read_text()
 for name in ('tcg-classic-battle-data.js','tcg-classic-set-picker.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js'):
  assert 'xy12' in (ROOT/'app/src/main/assets'/name).read_text(),name+' missing XY12'
 script=(ROOT/'scripts/build-xy12.py').read_text()
 assert c['pin'] in script and '!=113' in script and '!=129' in script
 assert 'XY12_BUILD_COVERAGE.json' in script and 'battleEnabled' in script
 assert 'dependsOn tasks.named(\'auditXY11ForApk\')' in gradle
 print('PASS XY12 structural: pinned 113-print source, version, registration, checked gating and Gradle pipeline.')

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--full',action='store_true')
 args=parser.parse_args();check()
 if args.full:
  subprocess.run([sys.executable,'scripts/build-xy12.py'],cwd=ROOT,check=True)
  c=json.loads(CONTRACT.read_text())
  d=json.loads((ROOT/'docs/XY12_BUILD_COVERAGE.json').read_text())
  assert (d['printed'],d['attacks'],d['abilities'],d['pokemonBreak'],d['dualTypePrints'],d['sourceGitBlob'])==(113,129,11,4,0,c['pin'])
  assert d['battleReady']==c['expectedPlayableMinimum']
  assert len(d['gated'])==113-c['expectedPlayableMinimum']
  for number in c['requiredEnabledNumbers']:
   assert 'xy12-'+number not in d['gated'],f'Required enabled card {number} is gated'
  assert (ROOT/'app/src/main/assets/tcg-classic-evolutions.js').stat().st_size>15000
  env={**os.environ,'GITHUB_ACTIONS':'true'}
  subprocess.run(['node','--test','tests/v07396-evolutions-integration.test.cjs','tests/v07397-evolutions-completion.test.cjs','tests/v07398-evolutions-independent-audit.test.cjs'],cwd=ROOT,check=True,env=env)
  subprocess.run(['node','--test','tests/v07333-classic-deck-quality.test.cjs'],cwd=ROOT,check=True,env=env)
  print(f"PASS XY12 FULL: {d['printed']} official prints, {d['battleReady']} explicitly enabled, {len(d['gated'])} safely gated, CI deck builder PASS")
 else:
  subprocess.run(['node','--test','tests/v07396-evolutions-integration.test.cjs','tests/v07397-evolutions-completion.test.cjs','tests/v07398-evolutions-independent-audit.test.cjs'],cwd=ROOT,check=True)
  print('SOURCE ONLY: run --full to regenerate all official prints and run full CI deck checks')
if __name__=='__main__':
 try:main()
 except (AssertionError,ValueError,subprocess.CalledProcessError) as error:
  print('XY12 RELEASE PREFLIGHT FAILED:',error,file=sys.stderr);sys.exit(1)
