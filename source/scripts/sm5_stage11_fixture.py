import json
import sm5_stage11_verified as v
print(json.dumps({'attacks':{k:e for k,(_,e) in v.ATTACKS.items()}},separators=(',',':')))
