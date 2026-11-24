#!/usr/bin/env python3
"""Offline Detective Pikachu release contract and gameplay preflight."""
import argparse,subprocess,sys,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07461-detective-pikachu-integration.test.cjs','tests/v07462-detective-pikachu-outcomes.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','det1','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','det1','--check-release','--report','docs/DET1_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
  run(sys.executable,'scripts/preflight-sm9-release.py')
  run('node','--test','tests/v07381-breakpoint-completion.test.cjs')
if __name__=='__main__':main()
