#!/usr/bin/env python3
"""Offline Cosmic Eclipse release contract and gameplay preflight."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07472-cosmic-eclipse-integration.test.cjs','tests/v07473-cosmic-eclipse-outcomes.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm12','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm12','--check-release','--require-complete','--report','docs/SM12_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
