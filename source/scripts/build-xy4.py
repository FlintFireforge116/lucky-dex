#!/usr/bin/env python3
"""XY Phantom Forces (xy4) official printed catalogue, pinned GitHub blob and conservatively gated effects.
GitHub Actions builds this automatically before Android asset merge; no manual Termux script.
"""
from __future__ import annotations
import base64,hashlib,json,re,urllib.request
from pathlib import Path
import xy4_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/xy4-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-phantom-forces.js'
COVER=ROOT/'docs/XY4_BUILD_COVERAGE.json'
BLOB='85ab15304b4741c1f5601ee786fc8f3a764326f9'
URL='https://api.github.com/repos/PokemonTCG/pokemon-tcg-data/git/blobs/'+BLOB
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy'}
BASIC={}
def get_source():
 if SRC.exists():rows=json.loads(SRC.read_text(encoding='utf-8'))
 else:
  req=urllib.request.Request(URL,headers={'User-Agent':'LuckyDex-XY4-verified','Accept':'application/vnd.github+json'})
  with urllib.request.urlopen(req,timeout=75) as resp:data=json.load(resp)
  original=base64.b64decode(data['content'])
  sha=hashlib.sha1(f'blob {len(original)}\0'.encode()+original).hexdigest()
  if sha!=BLOB:raise RuntimeError('XY4 pinned source hash mismatch: '+sha)
  official=json.loads(original)
  rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
    [[a['name'],[next((k for k,v in SYMBOL.items() if v==en),'C') for en in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
    [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
    c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
    c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
    c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType')]
    for c in official]
 # Persist the immutable official source for independent CI audit.
 SRC.parent.mkdir(parents=True,exist_ok=True)
 normalized=json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n'
 if not SRC.exists() or SRC.read_text(encoding='utf-8')!=normalized:
  SRC.write_text(normalized,encoding='utf-8')
 if len(rows)!=124 or [str(r[0]) for r in rows] != [str(i) for i in range(1,25)]+['24a']+[str(i) for i in range(25,66)]+['65a']+[str(i) for i in range(66,123)]:
  raise RuntimeError('XY4 must conserve all 124 official printed rows, including alternate 24a and 65a')
 if sum(len(r[7]) for r in rows)!=162 or sum(len(r[8]) for r in rows)!=15:
  raise RuntimeError('XY4 printed attacks / abilities changed: expected 162 / 15')
 return rows

def generate(rows):
 cards=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class=row
  n=str(n);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  issues=[V.GATE[n]] if n in V.GATE else []
  aa=[];pw=[]
  for title,cost,damage,printed in attacks:
   eff=V.attack(row,[title,cost,damage,printed])
   if eff is None:issues.append('Unimplemented printed attack: '+title)
   m=re.search(r'\d+',damage or '')
   base=int(m.group()) if m and '×' not in damage else 0
   aa.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,
     'effect':eff if eff is not None else {'type':'unsupported','reason':'Printed rule needs dedicated mechanics'}})
  for title,ability_type,printed in abilities:
   effect=V.ABILITIES.get(title)
   if effect is None:issues.append('Unimplemented printed Ability: '+title)
   else:pw.append({'name':title,'text':printed,'printedPowerType':'ability','disabledByStatus':False,**effect})
  if kind=='trainer' and n not in V.TRAINERS:issues.append('Unimplemented Trainer rules')
  ok=not issues;ex='EX' in subtypes;mega='MEGA' in subtypes
  card={'id':'xy4-'+n,'setId':'xy4','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/xy4/{n}.png','imageLarge':f'https://images.pokemontcg.io/xy4/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':issues},
   'tags':(['pokemon-ex'] if ex else [])+(['mega-evolution'] if mega else []),'teamPlasma':False}
  if kind=='pokemon':
   symbols=[t for _,cost,_,_ in attacks for t in cost if t in SYMBOL]
   needed=list(dict.fromkeys(SYMBOL[s] for s in symbols))
   printed=' '.join([a[3] for a in attacks]+[a[2] for a in abilities]).lower()
   roles=[]
   for token,role in [(r'\bdraw\b|\bdraws\b','draw'),('search your deck','search'),(r'\bheal\b','heal'),('is now asleep','status'),('is now poisoned','status'),('is now burned','status'),('is now paralyzed','status'),('is now confused','status'),('discard an energy attached to your opponent','control')]:
    if re.search(token,printed) and role not in roles:roles.append(role)
   if n in ('24','24a','61','74','120'):roles.append('ramp')
   if n in ('26','42','44'):roles.append('night-march')
   partners={'24':['Manectric-EX'],'24a':['Manectric-EX'],'120':['Manectric-EX'],
     '35':['Gengar-EX'],'121':['Gengar-EX'],'61':['Metal Pokémon','Metal Energy'],
     '26':['Lampent','Pumpkaboo'],'42':['Joltik','Pumpkaboo'],'44':['Joltik','Lampent'],
     '65':['Metal Energy'],'65a':['Metal Energy'],'74':['Darkness Energy'],
     '77':['Dragon Pokémon'],'67':['Grass Pokémon','Fairy Pokémon']}.get(n,[])
   card.update(stage='Stage 1' if mega else next((s for s in subtypes if s in ('Basic','Stage 1','Stage 2','Restored')),'Basic'),
     hp=int(hp or 0),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
     retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
     resistance=res,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
     attacks=aa,abilities=pw,prizeCards=2 if ex else 1,pokemonEX=ex,megaEvolution=mega,isPokemonSP=False,isLevelX=False,
     deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,
       'conditionalAttackEnergyTypes':[],'preferredPartners':([evolves] if evolves else [])+partners,'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   obj=V.TRAINERS.get(n);card.update(trainerType=obj[0] if obj else (subtypes[0] if subtypes else 'Item'),
      text='\n'.join(rules),effect=obj[1] if obj else {'type':'unsupported'},aceSpec=False,maxDeckCopies=4)
  elif kind=='energy':
   if n=='111':
    card.update(basicEnergy=False,specialEnergy=True,energyType='Colorless',subtype='Colorless',
     text='\n'.join(rules),effect={'type':'specialEnergy','provides':{'Colorless':2}})
   elif n=='112':
    # The game engine has to support the type restriction AND reduced retreat
    # cost before a Mystery Energy print can enter any automatic deck.
    card.update(basicEnergy=False,specialEnergy=True,energyType='Psychic',subtype='Psychic',
     text='\n'.join(rules),effect={'type':'specialEnergy','provides':{'Psychic':1}})
   else:
    issues.append('Unrecognised special Energy');card['battleEnabled']=False;card['deckEligible']=False
  else:
   raise RuntimeError('Unexpected XY4 card kind: '+str(kind))
  cards.append(card)
 return cards

def main():
 rows=get_source()
 cards=generate(rows)
 header='''/* XY Phantom Forces xy4: official 124 collector rows; pinned community Git blob %s. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGXY4=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'xy4',name:'Phantom Forces',series:'XY',releaseDate:'2014-11-05',cardCount:119,printedTotal:124});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''%BLOB
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 coverage={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),
  'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
  'attacks':sum(len(r[7]) for r in rows),'abilities':sum(len(r[8]) for r in rows),
  'implementedAbilities':sum(len(c.get('abilities',[])) for c in cards),
  'sourceGitBlob':BLOB}
 COVER.parent.mkdir(parents=True,exist_ok=True)
 COVER.write_text(json.dumps(coverage,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print('XY Phantom Forces:',coverage['battleReady'],'battle-ready / 124 printed rows,',coverage['attacks'],'attacks,',coverage['abilities'],'abilities')
 if coverage['gated']:print('GATED:',', '.join(coverage['gated']))
if __name__=='__main__':main()
