import json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sm5_stage5_verified as v
print(json.dumps({'attacks':{k:effect for k,(_,effect) in v.ATTACKS.items()},'abilities':{k:effect for k,(_,effect) in v.ABILITIES.items()},'trainers':{k:entry[1] for k,entry in v.TRAINERS.items()}},separators=(',',':')))
