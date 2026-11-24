#!/usr/bin/env python3
"""Sun & Moon SM1 strict pre-push source + full generated-catalogue preflight."""
from __future__ import annotations
import argparse,json,re,subprocess,sys,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
C=ROOT/'scripts/sm1_release_contract.json'
def check_source():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads(C.read_text(encoding='utf-8'))
 assert c['set']=='sm1' and c['stage']=='complete' and c['release']=='0.69.419'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonGX'],c['gxAttackPrints'],c['energyPrints'])==(173,238,26,27,27,13)
 assert c['pin']=='b3f5cd6f524ce45d59462fd2a56e237ff06063dc'
 assert c['expectedPlayableMinimum']==173 and len(c['requiredEnabledNumbers'])==173
 assert len(set(c['requiredEnabledNumbers']))==len(c['requiredEnabledNumbers'])
 gradle=(ROOT/'app/build.gradle').read_text(encoding='utf-8')
 assert re.search(r"versionName\s+['\"]0\.69\.419['\"]",gradle)
 assert 'versionCode 7419' in gradle
 assert "dependsOn tasks.named('auditXY12ForApk')" in gradle
 for name in ['preflightSM1ContractForApk','generateSM1ForApk','auditSM1ForApk']:
  assert name in gradle,'Missing SM1 Gradle gate: '+name
 for name in ['xy9','xy10','xy11','xy12']:
  assert json.loads((ROOT/f'scripts/{name}_release_contract.json').read_text())['release']==c['release'],name+' release version drift'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 assert 'tcg-classic-sun-moon.js' in html and 'v0.69.419' in html
 assert "__LUCKYDEX_BUILD='0.69.419'" in (ROOT/'app/src/main/assets/app-v0167.js').read_text()
 for name in ['tcg-classic-battle-data.js','tcg-classic-set-picker.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js']:
  assert "sm1" in (ROOT/'app/src/main/assets'/name).read_text(),'SM1 unregistered in '+name
 gen=(ROOT/'scripts/build-sm1.py').read_text()
 assert c['pin'] in gen and '!=173' in gen and '!=238' in gen and '!=26' in gen
 for name in ('tests/v07399-sun-moon-integration.test.cjs','tests/v07400-sun-moon-completion.test.cjs','tests/v07401-sun-moon-independent-audit.test.cjs','tests/v07401b-sm1-deck-picker-availability.test.cjs','tests/v07333-classic-deck-quality.test.cjs'):
  assert name in gradle and (ROOT/name).is_file(),'SM1 must run '+name
 assert 'tests/v07376-breakthrough-complete.test.cjs' in gradle, 'SM1 must preserve the earlier XY8 APK audit gate'
 print('PASS SM1 structural: pinned 173 prints (including Eevee 101a), GX, physical Energy, version, full APK gates.')
def full():
 subprocess.run([sys.executable,'scripts/build-sm1.py'],cwd=ROOT,check=True)
 c=json.loads(C.read_text());d=json.loads((ROOT/'docs/SM1_BUILD_COVERAGE.json').read_text())
 assert (d['printed'],d['attacks'],d['abilities'],d['pokemonGX'],d['gxAttackPrints'],d['energyPrints'],d['sourceGitBlob'])==(173,238,26,27,27,13,c['pin'])
 assert d['battleReady']==c['expectedPlayableMinimum']
 assert not d['gated'], 'Completed SM1 must have zero gated cards'
 for n in c['requiredEnabledNumbers']:
  assert 'sm1-'+n not in d['gated'],'Required playable SM1 card gated: '+n
 assert (ROOT/'app/src/main/assets/tcg-classic-sun-moon.js').stat().st_size>25000
 env={**os.environ,'GITHUB_ACTIONS':'true'}
 subprocess.run(['node','--test','tests/v07399-sun-moon-integration.test.cjs','tests/v07400-sun-moon-completion.test.cjs','tests/v07401-sun-moon-independent-audit.test.cjs','tests/v07401b-sm1-deck-picker-availability.test.cjs','tests/v07333-classic-deck-quality.test.cjs','tests/v07376-breakthrough-complete.test.cjs'],cwd=ROOT,check=True,env=env)
 print(f"PASS SM1 FULL: {d['battleReady']}/173 playable, {len(d['gated'])} explicit gates; cross-set deck-builder quality PASS")
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--full',action='store_true');args=parser.parse_args()
 check_source()
 if args.full:full()
 else:subprocess.run(['node','--test','tests/v07399-sun-moon-integration.test.cjs','tests/v07401-sun-moon-independent-audit.test.cjs','tests/v07401b-sm1-deck-picker-availability.test.cjs'],cwd=ROOT,check=True)
if __name__=='__main__':
 try:main()
 except (AssertionError,ValueError,subprocess.CalledProcessError) as e:
  print('SM1 RELEASE PREFLIGHT FAILED:',e,file=sys.stderr);sys.exit(1)
