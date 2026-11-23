import json
import sm5_stage6_verified as v
print(json.dumps({'attacks':{k:eff for k,(_,eff) in v.ATTACKS.items()},'abilities':{k:eff for k,(_,eff) in v.ABILITIES.items()},'trainers':{k:eff for k,(_,eff) in v.TRAINERS.items()}},separators=(',',':')))
