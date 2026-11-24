#!/usr/bin/env python3
"""Canonical catalogue and matched Termux/Gradle gates for SM75 completion."""
import argparse,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07452-dragon-majesty-integration.test.cjs','tests/v07453-dragon-majesty-outcomes.test.cjs','tests/v07454-dragon-majesty-completion.test.cjs', 'tests/v07455-dragon-majesty-independent-audit.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 c=json.loads((ROOT/'scripts/sm75_release_contract.json').read_text())
 assert c['set']=='sm75' and c['release']=='0.69.440' and c['stage']=='complete'
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['trainerPrints'],c['energyPrints'])==(80,115,18,13,0)
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm75','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm75','--check-release','--require-complete','--report','docs/SM75_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
