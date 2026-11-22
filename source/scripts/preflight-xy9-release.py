#!/usr/bin/env python3
"""BREAKpoint release preflight (source mode or --full with real pinned cards).

Usage from the source directory:
  python3 scripts/preflight-xy9-release.py
  python3 scripts/preflight-xy9-release.py --full

--full requires the pinned official catalogue and runs the generated audits
with zero skipped catalogue checks. The fast source mode is not equivalent
and MUST NOT be reported as a complete APK verification.
"""
from __future__ import annotations
import argparse,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import xy9_verified as v

def check_contract():
 c=json.loads((ROOT/'scripts/xy9_release_contract.json').read_text())
 assert c['set']=='xy9' and c['printedTotal']==126
 assert c['expectedPlayable']+len(c['expectedGated'])==126
 assert len(c['expectedGated'])==len(set(c['expectedGated']))
 assert len(c['stage2Playable'])==len(set(c['stage2Playable']))
 assert not set(c['expectedGated']) & set(c['stage2Playable']), 'A Stage 2 playable print is still marked gated'
 assert not set(c['expectedGated']) & set(c['stage1BreakPlayable'])
 assert all(re.fullmatch(r'[0-9]+[ab]?',x) for x in c['expectedGated']+c['stage2Playable'])
 gradle=(ROOT/'app/build.gradle').read_text()
 m=re.search(r"versionName\s+['\"]([^'\"]+)['\"]",gradle)
 assert m, 'Missing Gradle versionName'
 version=m.group(1)
 assert c['release']==version, 'Release contract version and Gradle version differ'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 boot=(ROOT/'app/src/main/assets/app-v0167.js').read_text()
 assert 'id="titleBuildVersion">v'+version+'</span>' in html, 'Title version differs from Gradle'
 assert 'LUCKY DEX · v'+version in html, 'App UI version differs from Gradle'
 assert "window.__LUCKYDEX_BUILD='"+version+"'" in boot, 'Boot version differs from Gradle'
 assert "dependsOn tasks.named('preflightXY9ContractForApk')" in gradle
 assert 'v07379-breakpoint-release-contract.test.cjs' in gradle
 tests=[(ROOT/'tests/v07378-breakpoint-integration.test.cjs').read_text(),(ROOT/'tests/v07379-breakpoint-continuation.test.cjs').read_text()]
 for s in tests:assert 'releaseContract.expectedGated' in s,'Stage audit duplicated a gated-identity list; must reuse shared contract'
 assert 'Unaudited printed effect must stay gated:' not in tests[0],'Old Stage 1 gating assertion reintroduced'
 # Representative newly enabled paths. This is a source-only sanity check, NOT a substitute for catalogue comparison.
 needed={('40','Shadow Stitching'),('40','Moonlight Slash'),('57','Offensive Bomb'),('62','Painful Sword'),('62','Megaton Slash'),('68','Never Enough'),('70','Turbo Assault'),('80','Spike Lash'),('83','Mighty Wind'),('93','Act Cute')}
 missing=needed-set(v.ATK)
 assert not missing, 'A Stage 2 verified attack mapping was lost: '+str(sorted(missing))
 assert all(k in v.ABILITIES for k in ['Giant Water Shuriken','Garbotoxin','Purifying Fire']), 'A verified Ability mapping was lost'
 assert all(k in v.TRAINERS for k in ['98','98a','98b','99','103','104']), 'Verified Trainer mapping was lost'
 assert not any(k in v.TRAINERS for k in ['96','97','102','108','109','110']), 'An old unfinished Trainer is now mapped: update contract and verify print'
 assert '113' not in v.ENERGIES, 'Splash Energy is now mapped: update contract and audit new rule'
 print('XY9 source contract OK: '+str(c['expectedPlayable'])+'/126, '+str(len(c['expectedGated']))+' gated. Versions aligned.')

def run(args):
 print('+ '+' '.join(args),flush=True)
 subprocess.run(args,cwd=ROOT,check=True)

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--full',action='store_true',help='Run pinned source generator and all generated XY9 audits, failing on missing catalogue')
 args=p.parse_args();check_contract()
 tests=['tests/v07378-breakpoint-integration.test.cjs','tests/v07378-breakpoint-effects.test.cjs','tests/v07379-breakpoint-continuation.test.cjs','tests/v07379-breakpoint-release-contract.test.cjs']
 if args.full:
  run([sys.executable,'scripts/build-xy9.py'])
  assert (ROOT/'data/classic/xy9-print-compact.json').exists(), 'Pinned official 126-print source was not generated'
  # GITHUB_ACTIONS=true forces previously skipped generated-catalogue assertions.
  import os
  env=dict(os.environ,GITHUB_ACTIONS='true')
  print('+ node --test '+' '.join(tests)+' [mandatory generated catalogue]',flush=True)
  subprocess.run(['node','--test',*tests],cwd=ROOT,env=env,check=True)
  print('PASS: Complete pinned XY9 generated-catalogue audit; no skipped source-dependent tests permitted.')
 else:
  # Preflight only; avoids a false sense of coverage when the pinned cards do not exist.
  run(['node','--test','tests/v07379-breakpoint-release-contract.test.cjs'])
  print('PASS: Offline release contract. This DOES NOT verify the generated 126-print audit. Run --full before release.')

if __name__=='__main__':
 try:main()
 except (AssertionError,subprocess.CalledProcessError) as e:
  print('XY9 PRE-RELEASE FAILURE:',e,file=sys.stderr);sys.exit(1)
