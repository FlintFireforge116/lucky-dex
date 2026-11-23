#!/usr/bin/env python3
"""Stage 3 isolated test fixtures. Never a replacement for pinned source prints."""
import json,sys
sys.path.insert(0,'scripts')
import sm5_stage3_verified as v
print(json.dumps({'attacks':{k:effect for k,(_,effect) in v.ATTACKS.items()},'abilities':{k:abi for k,(_,abi) in v.ABILITIES.items()},'trainers':{k:tr for k,(_,tr) in v.TRAINERS.items()}},ensure_ascii=False))
