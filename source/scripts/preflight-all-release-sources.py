#!/usr/bin/env python3
"""Run every historical APK release source gate before packaging, not only the newest set."""
import runpy,subprocess,sys
from pathlib import Path
from release_version import verify_release_version,self_test
ROOT=Path(__file__).resolve().parents[1]

def main():
    self_test()
    version=verify_release_version(ROOT)
    print('Checking historical release gates for',version,flush=True)
    for sid,fn in [('xy9','check_contract'),('xy10','check'),('xy11','check'),('xy12','check'),('sm1','check_source'),('sm2','check'),('sm3','check'),('sm4','check'),('sm5','check'),('sm6','check_static')]:
        print('Historical gate:',sid,flush=True)
        runpy.run_path(str(ROOT/'scripts'/f'preflight-{sid}-release.py'))[fn]()
    for sid in ('sm7','sm75','sm8','sm9','det1','sm10','sm11','sm115','sma'):
        subprocess.run([sys.executable,str(ROOT/'scripts'/f'preflight-{sid}-release.py')],cwd=ROOT,check=True)
    print('All 19 historical/new release source gates PASS',flush=True)
if __name__=='__main__':main()
