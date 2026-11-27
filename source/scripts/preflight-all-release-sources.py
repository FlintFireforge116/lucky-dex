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
    for sid in ('sm7','sm75','sm8','sm9','det1','sm10','sm11','sm115','sma','sm12','swsh1','swsh2','swsh3','swsh35','swsh4','swsh45','swsh45sv','swsh5','swsh6'):
        subprocess.run([sys.executable,str(ROOT/'scripts'/f'preflight-{sid}-release.py')],cwd=ROOT,check=True)
    print('All 29 historical/new release source gates PASS',flush=True)
    # These runtime tests run in the APK task graph even when the current set
    # preflight is green. Run them on every Termux prepare before committing.
    subprocess.run(['node','--test','tests/v07401b-sm1-deck-picker-availability.test.cjs','tests/v07407-guardians-rising-integration.test.cjs','tests/v07452-dragon-majesty-integration.test.cjs','tests/v07468-classic-deck-performance.test.cjs'],cwd=ROOT,check=True)
    print('Shared set-picker, narrow-pool deck and performance gates PASS',flush=True)
    # XY3's shared HP and energy hooks are live across all expansions. The
    # outcome tests must also run in source-only preparation, even when the
    # older canonical print source is only materialised by APK Gradle.
    subprocess.run(['node','--test','tests/v07334-furious-fists-stage1.test.cjs','tests/v07335-furious-fists-completion.test.cjs','tests/v07336-furious-fists-independent-audit.test.cjs'],cwd=ROOT,check=True)
    print('Historical XY3 shared-engine outcomes PASS (generated catalogue checks require CI source)',flush=True)
if __name__=='__main__':main()
