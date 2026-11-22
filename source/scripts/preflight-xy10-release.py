#!/usr/bin/env python3
"""Fates Collide source preflight; `--full` generates and verifies all official prints.

Fast mode NEVER claims 129/129 card/audit coverage: the official immutable
catalogue is built during GitHub Actions. Prevents stale stage expectations,
missing registry hooks, version mismatch, and invalid shared effect mappings.
"""
from __future__ import annotations
import argparse,json,re,sys,subprocess,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import xy10_verified as v

def check():
 c=json.loads((ROOT/'scripts/xy10_release_contract.json').read_text())
 assert c['set']=='xy10' and c['printedTotal']==129 and c['attackPrints']==147 and c['abilities']==21 and c['pokemonBreak']==5
 assert c['stage']=='mechanic-first' and c['expectedPlayableMinimum']>=30
 assert isinstance(c['requiredEnabledNumbers'],list) and len(c['requiredEnabledNumbers'])>=20
 assert len(set(c['requiredEnabledNumbers']))==len(c['requiredEnabledNumbers'])
 assert c['pin']=='aa097c8da85e960a5afa4f3b96312f64dcbec871'
 gradle=(ROOT/'app/build.gradle').read_text()
 m=re.search(r"versionName\s+['\"]([^'\"]+)['\"]",gradle)
 assert m,'Missing Gradle versionName'
 version=m.group(1)
 n=re.search(r'versionCode\s+(\d+)',gradle)
 assert n and int(n.group(1))==7000+int(version.split('.')[-1]),'versionCode/versionName mismatch'
 assert version==c['release'],'XY10 contract release/version mismatch'
 assert json.loads((ROOT/'scripts/xy9_release_contract.json').read_text())['release']==version,'Previous completed XY9 release contract must match running app'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 boot=(ROOT/'app/src/main/assets/app-v0167.js').read_text()
 assert f'id="titleBuildVersion">v{version}</span>' in html and f'LUCKY DEX · v{version}' in html
 assert f"window.__LUCKYDEX_BUILD='{version}'" in boot
 for item in ['preflightXY10ContractForApk','generateXY10ForApk','auditXY10ForApk']:
  assert item in gradle,'Missing stage '+item
 assert "dependsOn tasks.named('preflightXY10ContractForApk')" in gradle
 assert "dependsOn tasks.named('auditXY9ForApk')" in gradle
 for test in ['v07383-fates-collide-integration.test.cjs','v07383-fates-collide-effects.test.cjs']:
  assert test in gradle,'Missing mandatory generated catalogue audit '+test
 data=(ROOT/'app/src/main/assets/tcg-classic-battle-data.js').read_text()
 assert 'LuckyDexClassicTCGXY10' in data and '...xy10.CARDS' in data and 'xy10.cardById(id)' in data
 for name in ['tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js']:
  assert "'xy10'" in (ROOT/'app/src/main/assets'/name).read_text(),name+' not integrated'
 assert 'tcg-classic-fates-collide.js' in html
 builder=(ROOT/'scripts/build-xy10.py').read_text()
 assert c['pin'] in builder and 'len(rows)!=129' in builder and '!=147' in builder and '!=21' in builder
 assert len(v.ATK)==len(set(v.ATK)) and len(v.TRAINERS)==len(set(v.TRAINERS))
 assert '114' in v.ENERGIES and v.ENERGIES['114']['provides']=={'Colorless':2}
 for id in ['90','91','92']:
  assert id in v.TRAINERS,'Missing Spirit Link '+id
 assert ('13','Psystorm') in v.ATK and v.ATK['13','Psystorm']['allInPlay'] is True
 assert ('26','Zen Force') in v.ATK
 # Printed-rule honesty: no unsupported Fossil, cross-zone Tool, unimplemented
 # activated Abilities or target-restricted forced switches advertised as ready.
 for key in [('9','Flying Flare'),('51','Diamond Gift'),('88','Covet')]:
  assert key not in v.ATK,'Unverified interactive attack was silently enabled: '+str(key)
 for id in ['94','95','96','97','98','102','104','108','115']:
  assert id not in v.TRAINERS,'Unverified nontrivial trainer rule enabled: '+id
 assert 'Kinesis' not in v.ABILITIES and 'Flare Witch' not in v.ABILITIES
 print('PASS: XY10 source-only contract, version sync, registry entries, stale-test guards and pinned-source preflight.')

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--full',action='store_true',help='Generate pinned official 129-print source and run mandatory generated-card audit')
 args=parser.parse_args();check()
 if args.full:
  subprocess.run([sys.executable,'scripts/build-xy10.py'],cwd=ROOT,check=True)
  env={**os.environ,'GITHUB_ACTIONS':'true'}
  subprocess.run(['node','--test','tests/v07383-fates-collide-integration.test.cjs','tests/v07383-fates-collide-effects.test.cjs'],cwd=ROOT,check=True,env=env)
  print('PASS: Full official XY10 generated 129-print catalogue, deck and effect audit.')
 else:
  subprocess.run(['node','--test','tests/v07383-fates-collide-integration.test.cjs','tests/v07383-fates-collide-effects.test.cjs'],cwd=ROOT,check=True)
  print('SOURCE ONLY: Pinned catalogue test skipped locally; it is mandatory during the GitHub APK build.')
if __name__=='__main__':
 try: main()
 except (AssertionError,subprocess.CalledProcessError) as e:
  print('XY10 RELEASE PREFLIGHT FAILED:',e,file=sys.stderr);sys.exit(1)
