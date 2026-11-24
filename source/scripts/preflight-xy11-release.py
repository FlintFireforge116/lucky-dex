#!/usr/bin/env python3
"""Steam Siege XY11 release preflight; --full generates pinned official 116-print data.

Without --full, assertions are structural and do not count as a generated
catalogue audit. This check runs before Gradle's network fetch in Actions.
"""
from __future__ import annotations
import argparse,json,os,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import xy11_verified as V

def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/xy11_release_contract.json').read_text())
 assert c['set']=='xy11' and c['stage']=='independent-audit'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonBreak'],c['dualTypePrints'])==(116,161,18,7,12)
 assert c['pin']=='22ea97ca00b595fe6b121494fd45dd65692deee6'
 assert c['expectedPlayableMinimum']>=35 and len(c['requiredEnabledNumbers'])>=35
 g=(ROOT/'app/build.gradle').read_text()
 m=re.search(r"versionName\s+['\"]([^'\"]+)['\"]",g)
 assert m and m.group(1)==c['release']=='0.69.433'
 assert 'versionCode 7433' in g
 for n in ('xy9_release_contract.json','xy10_release_contract.json'):
  assert json.loads((ROOT/'scripts'/n).read_text())['release']==c['release'],n+' release drift'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 boot=(ROOT/'app/src/main/assets/app-v0167.js').read_text()
 assert f'id="titleBuildVersion">v{c["release"]}</span>' in html
 assert f'LUCKY DEX · v{c["release"]}' in html
 assert f"window.__LUCKYDEX_BUILD='{c['release']}'" in boot
 assert 'tcg-classic-steam-siege.js' in html
 assert 'LuckyDexClassicTCGXY11' in (ROOT/'app/src/main/assets/tcg-classic-battle-data.js').read_text()
 for name in ['tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js']:
  assert "'xy11'" in (ROOT/'app/src/main/assets'/name).read_text(),name+' missing Steam Siege'
 for task in ('preflightXY11ContractForApk','generateXY11ForApk','auditXY11ForApk'):
  assert task in g,'Missing XY11 build gate '+task
 assert "dependsOn tasks.named('auditXY10ForApk')" in g
 assert "dependsOn tasks.named('auditXY11ForApk')" in g
 assert "'tests/v07390-steam-siege-integration.test.cjs'" in g
 assert "'tests/v07391-steam-siege-audit.test.cjs'" in g
 assert 'tests/v07393-steam-siege-abilities.test.cjs' in g
 assert 'tests/v07394-steam-siege-completion.test.cjs' in g
 assert 'tests/v07395-steam-siege-independent-audit.test.cjs' in g
 assert 'tests/v07403-wild-edge-cpu-turn.test.cjs' in g
 assert 'tests/v07404-basic-energy-search-coins.test.cjs' in g
 assert 'tests/v07405-basic-energy-search-completeness-audit.test.cjs' in g
 assert 'tests/v07406-basic-energy-search-special-cases.test.cjs' in g
 assert 'build-xy11.py' in g
 builder=(ROOT/'scripts/build-xy11.py').read_text()
 assert c['pin'] in builder and 'len(rows)!=116' in builder
 assert '!=161' in builder and '!=18' in builder
 assert 'V.attack(' in builder and "'type':'unsupported'" in builder
 assert "'Restored'" in builder and "'BREAK'" in builder and 'megaEvolution=' in builder
 assert ('67','Wild Edge') in V.ATK
 assert ('79','Despair Ray') not in V.STRICT
 assert V.TRAINERS['98'][1]['rule']=='fossilBottom'
 assert V.TRAINERS['100'][1]['rule']=='fossilBottom'
 assert V.TRAINERS['114'][1]=={'type':'neoRule','rule':'xy4:sycamore'}
 assert not V.UNVERIFIED_ABILITIES and ('26','Volcanic Heat') in V.ATK
 assert len(set(c['requiredEnabledNumbers'])) == len(c['requiredEnabledNumbers']) and len(c['requiredEnabledNumbers']) <= c['expectedPlayableMinimum'] <= c['printedTotal']
 print('PASS XY11: release, pinned source, 116-print metadata, gating, registration, cross-set version sync.')

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--full',action='store_true',help='Generate pinned 116 prints, then validate strict generated set and interactions')
 args=p.parse_args();check()
 if args.full:
  subprocess.run([sys.executable,'scripts/build-xy11.py'],cwd=ROOT,check=True)
  assert (ROOT/'data/classic/xy11-print-compact.json').exists()
  report=json.loads((ROOT/'docs/XY11_BUILD_COVERAGE.json').read_text())
  contract=json.loads((ROOT/'scripts/xy11_release_contract.json').read_text())
  assert report['printed']==116 and report['battleReady']==116 and not report['gated'],report
  for n in contract['requiredEnabledNumbers']:
   assert 'xy11-'+n not in report['gated'],'Required Steam Siege print is gated: '+n
  assert (ROOT/'app/src/main/assets/tcg-classic-steam-siege.js').stat().st_size>10000
  subprocess.run(['node','--test','tests/v07390-steam-siege-integration.test.cjs','tests/v07391-steam-siege-audit.test.cjs','tests/v07392-steam-siege-batch2.test.cjs','tests/v07393-steam-siege-abilities.test.cjs','tests/v07394-steam-siege-completion.test.cjs','tests/v07395-steam-siege-independent-audit.test.cjs','tests/v07403-wild-edge-cpu-turn.test.cjs','tests/v07404-basic-energy-search-coins.test.cjs','tests/v07405-basic-energy-search-completeness-audit.test.cjs','tests/v07406-basic-energy-search-special-cases.test.cjs'],cwd=ROOT,check=True,env={**os.environ,'GITHUB_ACTIONS':'true'})
  # Match the earlier Gradle/CI deck-quality gate, which covers all populated
  # expansions and would otherwise fail before the XY11-specific audit runs.
  subprocess.run(['node','--test','tests/v07333-classic-deck-quality.test.cjs'],cwd=ROOT,check=True,env={**os.environ,'GITHUB_ACTIONS':'true'})
  print('PASS XY11: pinned catalogue, strict gameplay tests and cross-set deck quality')
 else:
  env={**os.environ};env.pop('GITHUB_ACTIONS',None)
  subprocess.run(['node','--test','tests/v07390-steam-siege-integration.test.cjs','tests/v07391-steam-siege-audit.test.cjs','tests/v07392-steam-siege-batch2.test.cjs','tests/v07393-steam-siege-abilities.test.cjs','tests/v07394-steam-siege-completion.test.cjs','tests/v07395-steam-siege-independent-audit.test.cjs','tests/v07403-wild-edge-cpu-turn.test.cjs','tests/v07404-basic-energy-search-coins.test.cjs','tests/v07405-basic-energy-search-completeness-audit.test.cjs','tests/v07406-basic-energy-search-special-cases.test.cjs'],cwd=ROOT,check=True,env=env)
  print('SOURCE ONLY: no official XY11 catalogue audit. Run --full on Termux before pushing.')
if __name__=='__main__':
 try:main()
 except (AssertionError,subprocess.CalledProcessError,ValueError) as e:
  print('XY11 RELEASE PREFLIGHT FAILED:',e,file=sys.stderr);sys.exit(1)
