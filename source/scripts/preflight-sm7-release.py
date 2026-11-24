#!/usr/bin/env python3
"""Canonical catalogue and matched Termux/Gradle gates for partial SM7 integration."""
import argparse,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07446-celestial-storm-integration.test.cjs','tests/v07447-celestial-storm-outcomes.test.cjs', 'tests/v07448-celestial-storm-continuation.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 c=json.loads((ROOT/'scripts/sm7_release_contract.json').read_text())
 assert c['set']=='sm7' and c['release']=='0.69.423' and c['stage']=='continuation'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['trainerPrints'],c['energyPrints'])==(187,232,51,43,2)
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm7','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm7','--check-release','--report','docs/SM7_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
