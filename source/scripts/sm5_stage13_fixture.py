import json
import sm5_stage13_verified as v
print(json.dumps({"attacks":{k:d for k,(_,d) in v.ATTACKS.items()},"abilities":{},"trainers":{}},separators=(",",":")))
