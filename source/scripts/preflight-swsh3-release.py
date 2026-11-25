#!/usr/bin/env python3
"""Offline Darkness Ablaze release contract and gameplay preflight."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07480-darkness-ablaze-integration.test.cjs','tests/v07481-darkness-ablaze-outcomes.test.cjs','tests/v07482-darkness-ablaze-independent-audit.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','swsh3','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','swsh3','--check-release','--require-complete','--report','docs/SWSH3_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
if __name__=='__main__':main()
