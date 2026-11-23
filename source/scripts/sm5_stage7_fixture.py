import json,sm5_stage7_verified as s
print(json.dumps({'attacks':{n:d for n,(_,d) in s.ATTACKS.items()},'trainers':{n:[k,e] for n,(k,e) in s.TRAINERS.items()},'abilities':{n:d for n,(_,d) in s.ABILITIES.items()}},ensure_ascii=False))
