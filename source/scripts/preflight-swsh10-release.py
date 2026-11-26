#!/usr/bin/env python3
"""Astral Radiance stage two release gate."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07545-astral-radiance.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','swsh10','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','swsh10','--check-release','--report','docs/SWSH10_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
