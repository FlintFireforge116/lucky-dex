#!/usr/bin/env python3
"""Canonical catalogue and matched Termux/Gradle gates for SM9 completion."""
import argparse,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07459-team-up-integration.test.cjs', 'tests/v07460-team-up-outcomes.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 c=json.loads((ROOT/'scripts/sm9_release_contract.json').read_text())
 assert c['set']=='sm9' and c['release']=='0.69.452' and c['stage']=='complete'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['trainerPrints'],c['energyPrints'])==(198,260,36,43,0)
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm9','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm9','--check-release','--require-complete','--report','docs/SM9_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS,'tests/v07381-breakpoint-completion.test.cjs')
if __name__=='__main__':main()
