"""Verified stage-one subset from pinned Fusion Strike Git blob.
The source packets are exact compact projections checked against connector output.
No fabricated rows for the remaining prints. Full source can replace this subset later.
"""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PIN='d88289e9b1469bc1c27cf268461f9efdec00134d'
TOTAL=284
S={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy','N':'Dragon','C':'Colorless'}
SUB=['Basic','Stage 1','Stage 2','V','Single Strike','Rapid Strike','Fusion Strike','VMAX']
RAR=['Common','Uncommon','Rare Holo V','Rare','Rare Ultra']
TEXT=['','Flip a coin. If heads, this attack does 20 more damage.','Heal 30 damage from this Pokémon.','Heal 20 damage from this Pokémon.','Flip a coin. If heads, this attack does 30 more damage.','This Pokémon also does 30 damage to itself.',"During your next turn, this Pokémon can't attack.","Your opponent's Active Pokémon is now Burned.",'Draw a card.','Flip 3 coins. This attack does 80 damage for each heads.','Flip a coin. If heads, this attack does 50 more damage.',"Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",'This Pokémon also does 20 damage to itself.','Draw 2 cards.',"Your opponent's Active Pokémon is now Confused.",'Switch this Pokémon with 1 of your Benched Pokémon.',"Your opponent's Active Pokémon is now Poisoned.","Discard an Energy from your opponent's Active Pokémon.",'Flip 2 coins. This attack does 40 damage for each heads.','Discard an Energy from this Pokémon.','Flip a coin. If heads, this attack does 100 more damage.','Flip 2 coins. This attack does 20 damage for each heads.','Draw 3 cards.','Flip 3 coins. This attack does 10 damage for each heads.','Flip 3 coins. This attack does 30 damage for each heads.','Flip a coin. If heads, this attack does 40 more damage.']
def packet(name,checksum):
 b=(ROOT/'data/classic'/name).read_bytes();h=2166136261
 for x in b:h=((h^x)*16777619)&0xffffffff
 if h!=checksum:raise ValueError(f'SWSH8 transfer checksum mismatch: {name}')
 return b.decode('utf-8').splitlines()
def rows():
 result={}
 for line in packet('swsh8-stage1-source.txt',228192):
  n,name,sub,hp,types,evolves,w,r,retreat,rar,*attacks=line.split('|');subs=[SUB[int(x)] for x in sub];a=[]
  for attack in attacks:
   title,cost,damage,text=attack.split('~');a.append([title,list(cost),damage,TEXT[int(text)]])
  result[n]=[n,name,'Pokémon',subs,hp,[S[x] for x in types],evolves or None,a,[],S.get(w),S.get(r),int(retreat),RAR[int(rar)],['V rule: When your Pokémon V is Knocked Out, your opponent takes 2 Prize cards.'] if 'V' in subs else [],None,None]
 assert len(result)==96
 for line in packet('swsh8-stage1-trainers.jsonl',2340477580):
  row=json.loads(line)
  if len(row)==3:
   n,original,rarity=row;row=result[original].copy();row[0]=n;row[12]=rarity
  assert row[0] not in result
  result[row[0]]=row
 assert len(result)==135
 return sorted(result.values(),key=lambda r:int(r[0]))
if __name__=='__main__':
 r=rows();p=ROOT/'data/classic/swsh8-print-compact.json';p.write_text(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 print(hashlib.sha256(p.read_bytes()).hexdigest(),sum(len(x[7]) for x in r),sum('V' in x[3] for x in r))
