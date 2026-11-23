import json
import sm5_stage9_verified as v
print(json.dumps({'attacks':{name:effect for name,(_,effect) in v.A.items()}},separators=(',',':')))
