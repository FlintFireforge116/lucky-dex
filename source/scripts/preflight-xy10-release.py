#!/usr/bin/env python3
"""Fates Collide source preflight; `--full` generates and verifies all official prints.

Fast mode NEVER claims 129/129 card/audit coverage: the official immutable
catalogue is built during GitHub Actions. For pre-push verification use --full
to generate official prints and run the actual post-generation audit locally.
This detects test errors that only occur with non-Pokemon generated cards.
"""
from __future__ import annotations
import argparse,json,re,sys,subprocess,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import xy10_verified as v

def check():
 # Do not rely on Gradle's own preflight task to check build.gradle syntax: a
 # malformed Groovy build file fails before any Gradle task can run.
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/xy10_release_contract.json').read_text())
 assert c['set']=='xy10' and c['printedTotal']==129 and c['attackPrints']==147 and c['abilities']==21 and c['pokemonBreak']==5
 assert c['stage'] in ('mechanic-first','mechanic-reuse-2','mechanic-reuse-3','mechanic-reuse-4') and c['expectedPlayableMinimum']>=30
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
 for test in ['v07383-fates-collide-integration.test.cjs','v07383-fates-collide-effects.test.cjs','v07384-fates-collide-stage2.test.cjs','v07385-fates-collide-stage3.test.cjs','v07386-fates-collide-stage4.test.cjs']:
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
 for key in [('9','Flying Flare'),('51','Diamond Gift'),('82','Cacophony')]:
  assert key not in v.ATK,'Unverified interactive attack was silently enabled: '+str(key)
 for id in ['94','95','96','97','98','102','108']:
  assert id not in v.TRAINERS,'Unverified nontrivial trainer rule enabled: '+id
 assert 'Kinesis' not in v.ABILITIES and 'Flare Witch' not in v.ABILITIES
 for key in [('1','Hide a Berry'),('7','Coil'),('21','Blizzard Burn'),('52','Aura Break'),('63','Fight Alone'),('86','Cleaning Up'),('88','Covet')]:assert key in v.ATK, 'Stage 2 mapping missing '+str(key)
 for id in ['103','109']:assert id in v.TRAINERS,'Stage 2 Trainer missing '+id
 assert v.ENERGIES.get('115',{}).get('provides')=={'Fighting':1}
 assert 'Regi Power' in v.ABILITIES and 'Pressure' in v.ABILITIES
 assert 'Safeguard' in v.ABILITIES
 for n in ['101','104','113']:assert n in v.TRAINERS, 'XY10 Stage 3 Trainer missing '+n
 assert ('55','Endgame') in v.ATK and ('119','Endgame') in v.ATK
 for key in [('61','Guard Press'),('71','Light Steps'),('73','Dragon Trail'),('122','Dragon Trail')]:assert key in v.ATK,'Stage 4 attack missing '+str(key)
 for ability in ['Wormadam First','Dangerous Tentacle','Hand Block','Metal Fortress']:assert ability in v.ABILITIES,'Stage 4 ability missing '+ability
 for n in ['4','19','23','61','71','73','122']:assert n in c['requiredEnabledNumbers'],'Stage 4 catalogue contract missing '+n
 print('PASS: XY10 source-only contract, version sync, registry entries, stale-test guards and pinned-source preflight.')

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--full',action='store_true',help='Mandatory before publishing: generate pinned 129-print source, then run the same strict post-generation audit as GitHub CI')
 args=parser.parse_args();check()
 if args.full:
  subprocess.run([sys.executable,'scripts/build-xy10.py'],cwd=ROOT,check=True)
  assert (ROOT/'data/classic/xy10-print-compact.json').is_file(), 'The pinned 129-print dataset was not generated'
  assert (ROOT/'app/src/main/assets/tcg-classic-fates-collide.js').stat().st_size>10000, 'The generated Fates Collide runtime is missing or still a stub'
  env={**os.environ,'GITHUB_ACTIONS':'true'}
  subprocess.run(['node','--test','tests/v07383-fates-collide-integration.test.cjs','tests/v07383-fates-collide-effects.test.cjs','tests/v07384-fates-collide-stage2.test.cjs','tests/v07385-fates-collide-stage3.test.cjs','tests/v07386-fates-collide-stage4.test.cjs'],cwd=ROOT,check=True,env=env)
  print('PASS: Full official XY10 generated 129-print catalogue, deck and effect audit.')
 else:
  # This preflight is run in GitHub Actions *before* generateXY10ForApk.
  # Do not pass GITHUB_ACTIONS=true into source-only tests: that environment
  # variable rightly makes the pinned-catalogue audit mandatory only once
  # the official source and generated assets actually exist.
  source_only_env={**os.environ}
  source_only_env.pop('GITHUB_ACTIONS',None)
  subprocess.run(['node','--test','tests/v07383-fates-collide-integration.test.cjs','tests/v07383-fates-collide-effects.test.cjs','tests/v07384-fates-collide-stage2.test.cjs','tests/v07385-fates-collide-stage3.test.cjs','tests/v07386-fates-collide-stage4.test.cjs'],cwd=ROOT,check=True,env=source_only_env)
  print('SOURCE ONLY: Pinned catalogue test deferred. BEFORE PUSHING, run: python3 scripts/preflight-xy10-release.py --full')
if __name__=='__main__':
 try: main()
 except (AssertionError,subprocess.CalledProcessError) as e:
  print('XY10 RELEASE PREFLIGHT FAILED:',e,file=sys.stderr);sys.exit(1)
