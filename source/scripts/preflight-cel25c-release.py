#!/usr/bin/env python3
"""Offline Classic Collection contract and gameplay gate."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07523-celebrations-collection.test.cjs', 'tests/v07525-celebrations-independent-audit.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','cel25c','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','cel25c','--check-release','--require-complete','--report','docs/CEL25C_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
