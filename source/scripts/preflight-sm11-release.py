#!/usr/bin/env python3
"""Offline Unified Minds release contract and gameplay preflight."""
import argparse,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07466-unified-minds-integration.test.cjs','tests/v07467-unified-minds-outcomes.test.cjs']
def main():
 p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
 def run(*args):subprocess.run(args,cwd=ROOT,check=True)
 run(sys.executable,'scripts/check-gradle-source.py','--self-test')
 run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm11','--release-only')
 if a.full:
  run(sys.executable,'scripts/audit-expansion-readiness.py','--set','sm11','--check-release','--report','docs/SM11_CURRENT_GAP_LEDGER.md')
  run('node','--test',*TESTS)
  run(sys.executable,'scripts/preflight-sm10-release.py','--full')
if __name__=='__main__':main()
