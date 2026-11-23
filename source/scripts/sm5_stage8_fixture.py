import json
import sm5_stage8_verified as v
print(json.dumps({'attacks':{k:effect for k,(_,effect) in v.ATTACKS.items()},'abilities':{k:effect for k,(_,effect) in v.ABILITIES.items()},'trainers':{k:effect for k,(_,effect) in v.TRAINERS.items()}},separators=(',',':')))
