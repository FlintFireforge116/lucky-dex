import json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sm5_stage4_verified as v
print(json.dumps({'energies':{k:e for k,(_,e) in v.ENERGY.items()},'abilities':{k:a for k,(_,a) in v.ABILITIES.items()}},separators=(',',':')))
