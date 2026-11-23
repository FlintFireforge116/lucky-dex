#!/usr/bin/env python3
"""Deterministic battle-test descriptors; not substituted for canonical prints."""
import json,sys
sys.path.insert(0,'scripts')
import sm5_stage2_verified as V
print(json.dumps({'attacks':{k:e for k,(_,e) in V.ATTACKS.items()},'trainers':{k:e for k,(_,e) in V.TRAINERS.items()}},ensure_ascii=False))
