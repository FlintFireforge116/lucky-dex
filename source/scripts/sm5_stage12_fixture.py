import json
import sm5_stage12_verified as v
print(json.dumps({'attacks':{k:e for k,(_,e) in v.ATTACKS.items()},'abilities':{k:e for k,(_,e) in v.ABILITIES.items()},'trainers':{k:e for k,(_,e) in v.TRAINERS.items()}},separators=(',',':')))
