#!/usr/bin/env python3
"""SM6 contract: static guard before APK generation; exact catalogue afterward.

The full gate NEVER equates mapped attack text with a playable card.
It emits a print-level blocker ledger; complete status is a separate gate.
"""
from __future__ import annotations
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07440-forbidden-light-integration.test.cjs','tests/v07441-forbidden-light-mechanics.test.cjs','tests/v07442-forbidden-light-outcomes.test.cjs','tests/v07443-forbidden-light-continuation.test.cjs','tests/v07444-forbidden-light-completion.test.cjs', 'tests/v07445-forbidden-light-independent-audit.test.cjs']

def check_static():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 contract=json.loads((ROOT/'scripts/sm6_release_contract.json').read_text())
 assert contract['set']=='sm6' and contract['release']=='0.69.426' and contract['stage']=='complete'
 assert (contract['printedTotal'],contract['attackPrints'],contract['abilities'],contract['trainerPrints'],contract['energyPrints'])==(150,211,25,27,3)
 assert contract['pin']=='7c9956b85945322c9c981db7a231be36fc524224'
 assert contract['variants']==['2a','102a','112a','113a']
 for name in TESTS:assert (ROOT/name).is_file(),'Missing SM6 test: '+name
 subprocess.run([sys.executable,'scripts/audit-expansion-readiness.py','--set','sm6','--release-only'],cwd=ROOT,check=True)
 print('SM6 source release contract PASS: 150 official prints and static Gradle parity')

def check_generated():
 import importlib.util
 spec=importlib.util.spec_from_file_location('build_sm6',ROOT/'scripts/build-sm6.py')
 m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 rows=m.get_source()
 assert len(rows)==150
 assert sum(len(r[7]) for r in rows)==211
 assert sum(len(r[8]) for r in rows)==25
 assert sum(r[2]=='Trainer' for r in rows)==27
 assert sum(r[2]=='Energy' for r in rows)==3
 assert sum('GX' in r[3] for r in rows)==26
 assert sum('Prism Star' in r[3] for r in rows)==5
 coverage=json.loads((ROOT/'docs/SM6_BUILD_COVERAGE.json').read_text())
 assert coverage['printed']==150 and coverage['attacks']==211 and coverage['abilities']==25
 assert coverage['battleReady']==150 and not coverage['gated'], 'SM6 completion requires zero gated prints'
 print(f'SM6 generated source: {coverage["battleReady"]}/150 playable; {len(coverage["gated"])} gated')

def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 check_static()
 if a.full:
  check_generated()
  subprocess.run([sys.executable,'scripts/audit-expansion-readiness.py','--set','sm6','--check-release','--report','docs/SM6_CURRENT_GAP_LEDGER.md'],cwd=ROOT,check=True)
  subprocess.run(['node','--test',*TESTS],cwd=ROOT,check=True)
if __name__=='__main__':
 try:main()
 except (AssertionError,RuntimeError,ValueError,subprocess.CalledProcessError) as e:
  print('SM6 PREFLIGHT FAILED:',e,file=sys.stderr);sys.exit(1)
