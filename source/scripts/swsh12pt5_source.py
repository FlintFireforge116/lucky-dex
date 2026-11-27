#!/usr/bin/env python3
"""Pinned Crown Zenith source inventory; preparation only, not battle registration."""
import json
from pathlib import Path
PIN = '6d0748e2be253b335093187554e6a947a66c3089'
PINNED_COMMIT = '90f27d0e14cefe48ccb2b8922a7a356b2fcf0072'
GALLERY_PIN = 'b3760db93bd9fb9f5e0f5e24a05c50b7058f5c63'
PRINTED_TOTAL = 160
ATTACK_PRINTS = 194
ABILITY_PRINTS = 21
TRAINER_PRINTS = 29
ENERGY_PRINTS = 8
PACKETS = (('swsh12pt5-stage0-pokemon-a.jsonl', 2105825884), ('swsh12pt5-stage0-support.jsonl', 253090390), ('swsh12pt5-stage2-pokemon-b.jsonl', 655009990), ('swsh12pt5-stage3-pokemon-c.jsonl', 3053875564))
STAGED_IDS = set(range(1,81)) | set(range(123,160))
def rows():
    result=[]
    root=Path(__file__).resolve().parents[1]/'data/classic'
    for filename, expected in PACKETS:
        raw=(root/filename).read_bytes(); h=2166136261
        for b in raw:
            h=((h^b)*16777619)&0xffffffff
        if h!=expected: raise ValueError('Crown Zenith packet checksum mismatch: '+filename)
        result.extend(json.loads(line) for line in raw.splitlines())
    ids=[int(r[0]) for r in result]
    if len(ids)!=len(STAGED_IDS) or set(ids)!=STAGED_IDS or any(len(r)!=16 for r in result):
        raise ValueError('Crown Zenith staged record inventory mismatch')
    return sorted(result,key=lambda r:int(r[0]))
if __name__=='__main__':
    print(f'Crown Zenith: {len(rows())}/{PRINTED_TOTAL} source prints prepared; checksums PASS.')
