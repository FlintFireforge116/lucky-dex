#!/usr/bin/env python3
"""Decode audited compact Rising Rivals printed card source supplied with patch."""
from pathlib import Path
import base64,json
root=Path(__file__).resolve().parents[1]
raw=base64.b64decode((root/'data/classic/pl2-print-compact.b64').read_text().strip())
assert len(raw)%2==0
codes=[int.from_bytes(raw[i:i+2], 'big') for i in range(0,len(raw),2)]
d={i:bytes([i]) for i in range(256)}
# The compact-source encoder reserved an unused duplicate of the initial '['.
d[256]=b'['
w=d[codes[0]]
output=bytearray(w)
n=257
for k in codes[1:]:
    if k in d: entry=d[k]
    elif k==n: entry=w+w[:1]
    else: raise ValueError(f'invalid compressed record code {k} dict {n}')
    output+=entry
    if n<65536: d[n]=w+entry[:1];n+=1
    w=entry
S={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','C':'Colorless'}
def types(s):return [S[x] for x in s]
data=json.loads(output.decode('utf-8'))
assert len(data)==120 and {str(x[0]) for x in data}=={str(i) for i in range(1,115)}|{'RT1','RT2','RT3','RT4','RT5','RT6'}
records=[]
for n,name,kind,sub,hp,colors,evol,ret,weak,wval,res,rval,att,pows,rules,rarity in data:
    row={'id':'pl2-'+str(n),'name':name,'supertype':{'P':'Pokémon','T':'Trainer','E':'Energy'}[kind],'subtypes':sub.split(','),'number':str(n),'rarity':rarity}
    if hp:row['hp']=str(hp)
    if colors:row['types']=types(colors)
    if evol:row['evolvesFrom']=evol
    if ret:row['convertedRetreatCost']=ret
    if weak:row['weaknesses']=[{'type':types(weak)[0],'value':wval}]
    if res:row['resistances']=[{'type':types(res)[0],'value':rval}]
    if att:row['attacks']=[{'name':a,'cost':types(cost),'damage':damage,'text':desc} for a,cost,damage,desc in att]
    if pows:row['abilities']=[{'name':a,'type':'Poké-Power' if k=='power' else 'Poké-Body','text':desc} for a,k,desc in pows]
    if rules:row['rules']=rules.split('\n')
    records.append(row)
out=root/'data/classic/pl2-print-source.json'
out.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Rising Rivals official printed archive: {len(records)} cards, {sum(len(c.get("attacks",[])) for c in records)} attacks, {sum(len(c.get("abilities",[])) for c in records)} powers/bodies')
