#!/usr/bin/env python3
"""Offline Unbroken Bonds release contract and gameplay preflight."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07463-unbroken-bonds-integration.test.cjs','tests/v07464-unbroken-bonds-outcomes.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm10','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm10','--check-release','--require-complete','--report','docs/SM10_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
  run(sys.executable,'scripts/preflight-det1-release.py','--full')
if __name__=='__main__':main()
