#!/usr/bin/env python3
"""Canonical catalogue and matched Termux/Gradle gates for SM8 completion."""
import argparse,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07456-lost-thunder-integration.test.cjs', 'tests/v07457-lost-thunder-outcomes.test.cjs', 'tests/v07458-lost-thunder-independent-audit.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 c=json.loads((ROOT/'scripts/sm8_release_contract.json').read_text())
 assert c['set']=='sm8' and c['release']=='0.69.440' and c['stage']=='integration'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['trainerPrints'],c['energyPrints'])==(240,315,61,47,1)
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm8','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm8','--check-release','--report','docs/SM8_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
