#!/usr/bin/env python3
"""Offline Evolving Skies release contract and gameplay preflight."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07512-evolving-skies-integration.test.cjs', 'tests/v07512-evolving-skies-outcomes.test.cjs', 'tests/v07520-evolving-skies-independent-audit.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','swsh7','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','swsh7','--check-release','--report','docs/SWSH7_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
