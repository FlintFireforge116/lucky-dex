#!/usr/bin/env python3
"""BW11 Legendary Treasures (115 numbered + 25 Radiant Collection prints).

Pinned community PokemonTCG/pokemon-tcg-data Git blob. Gradle calls this
before APK asset merging; no manual Termux prepare step is required.
"""
from __future__ import annotations
import base64,hashlib,json,re,urllib.request
from pathlib import Path
import bw11_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/bw11-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-legendary-treasures.js'
COVER=ROOT/'docs/BW11_BUILD_COVERAGE.json'
BLOB='e4e09d569e76c71943e2399221c9f904b4420096'
URL='https://api.github.com/repos/PokemonTCG/pokemon-tcg-data/git/blobs/'+BLOB
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}

def get_source():
 if SRC.exists():rows=json.loads(SRC.read_text(encoding='utf-8'))
 else:
  req=urllib.request.Request(URL,headers={'User-Agent':'LuckyDex-BW11-verified','Accept':'application/vnd.github+json'})
  with urllib.request.urlopen(req,timeout=60) as resp:data=json.load(resp)
  original=base64.b64decode(data['content'])
  sha=hashlib.sha1(f'blob {len(original)}\0'.encode()+original).hexdigest()
  if sha!=BLOB:raise RuntimeError('BW11 pinned source hash mismatch: '+sha)
  official=json.loads(original)
  rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
    [[a['name'],[next((k for k,v in SYMBOL.items() if v==en),'C') for en in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
    [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
    c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
    c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
    c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType')]
    for c in official]
  SRC.parent.mkdir(parents=True,exist_ok=True)
  SRC.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 expected=[str(i) for i in range(1,116)]+['RC'+str(i) for i in range(1,26)]
 if len(rows)!=140 or [r[0] for r in rows]!=expected:
  raise RuntimeError('BW11 must preserve exactly 115 numbered + 25 Radiant Collection prints')
 if sum(len(r[7]) for r in rows)!=220 or sum(len(r[8]) for r in rows)!=19:
  raise RuntimeError('BW11 220 attacks / 19 Abilities source counts changed')
 return rows

def generate(rows):
 cards=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class=row
  kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  issues=([V.GATE[n]] if n in V.GATE else [])
  aa=[];pw=[]
  for title,cost,damage,printed in attacks:
   eff=V.attack(row,[title,cost,damage,printed])
   if eff is None:issues.append('Unimplemented printed attack: '+title)
   base=int(re.search(r'\d+',damage).group()) if re.search(r'\d+',damage) and '×' not in damage else 0
   aa.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,
              'effect':eff if eff is not None else {'type':'unsupported','reason':'Printed rule needs implementation'}})
  for title,ability_type,printed in abilities:
   effect=V.ABILITY.get(title)
   if effect is None:issues.append('Unimplemented printed Ability: '+title)
   else:pw.append({'name':title,'text':printed,'printedPowerType':'ability','disabledByStatus':False,**effect})
  if kind=='trainer' and n not in V.TRAINERS:issues.append('Unimplemented Trainer rules')
  ok=not issues
  ex='EX' in subtypes
  tags=(['pokemon-ex'] if ex else [])+(['radiant-collection'] if str(n).startswith('RC') else [])
  card={'id':'bw11-'+n,'setId':'bw11','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/bw11/{n}.png','imageLarge':f'https://images.pokemontcg.io/bw11/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':issues},'tags':tags,'teamPlasma':False}
  if kind=='pokemon':
   # Costs are physical symbols; a Dragon-type attacker may require two real
   # distinct Basic Energy types. Conditional payoffs are not invented.
   needed=list(dict.fromkeys(SYMBOL[s] for _,cost,_,_ in attacks for s in cost if s in SYMBOL))
   conditional={'21':['Fire','Water','Grass','Lightning','Psychic','Fighting','Darkness','Metal']}.get(n,[])
   text=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
   roles=[]
   if re.search(r'\bdraw\b|\bdraws\b',text):roles.append('draw')
   if 'search your deck' in text:roles.append('search')
   if re.search(r'\bheal\b',text):roles.append('heal')
   if any(w in text for w in ['is now asleep','is now poisoned','is now burned','is now paralyzed','is now confused']):roles.append('status')
   if any(w in text for w in ['defending pokémon can\'t retreat','discard an energy attached to the defending','switch 1 of your opponent']):roles.append('control')
   if n in ('17','23','24','27','50','RC1','RC21','RC16'):roles.append('ramp')
   partners={'8':['Grass Energy'],'12':['Energy cards'], '17':['Fire Energy'], '23':['Fire Pokémon'], '24':['Basic Energy'],
      '27':['Fire Pokémon'], '47':['Minun'], '48':['Plusle'], '87':['ACE SPEC'], '102':['Plasma Energy'],
      'RC11':['Round Pokémon'], 'RC25':['Round Pokémon'], 'RC24':['Attack-copy partners']}.get(n,[])
   card.update(stage=next((s for s in subtypes if s in ('Basic','Stage 1','Stage 2','Restored')),'Basic'),hp=int(hp or 0),
     types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
     retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
     resistance=res,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
     attacks=aa,abilities=pw,prizeCards=2 if ex else 1,pokemonEX=ex,isPokemonSP=False,isLevelX=False,
     deckMeta={'roles':roles,'synergy':roles,'energyTypes':list(dict.fromkeys(needed+conditional)),
       'preferredEnergyTypes':list(dict.fromkeys(needed+conditional)),'conditionalAttackEnergyTypes':conditional,
       'preferredPartners':([evolves] if evolves else [])+partners,'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   obj=V.TRAINERS.get(n)
   card.update(trainerType=obj[0] if obj else trainer_class or 'Supporter',text='\n'.join(rules),
       effect=obj[1] if obj else {'type':'unsupported'},aceSpec=False,maxDeckCopies=4)
  else:
   # Double Colorless is a physical Special Energy, not two separate counters.
   card.update(basicEnergy=False,specialEnergy=True,energyType='Colorless',subtype='Colorless',text='\n'.join(rules),
       effect={'type':'specialEnergy','provides':{'Colorless':2}})
  cards.append(card)
 return cards

def main():
 rows=get_source();cards=generate(rows)
 header='''/* Legendary Treasures BW11: official 115 prints + 25 Radiant Collection, pinned blob %s. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGBW11=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'bw11',name:'Legendary Treasures',series:'Black & White',releaseDate:'2013-11-06',cardCount:115,printedTotal:140,radiantCollection:25});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''%BLOB
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 coverage={'printed':len(cards),'numbered':115,'radiantCollection':25,'battleReady':sum(c['battleEnabled'] for c in cards),
    'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
    'attacks':sum(len(c.get('attacks',[])) for c in cards),'abilities':sum(len(c.get('abilities',[])) for c in cards),'sourceGitBlob':BLOB}
 COVER.write_text(json.dumps(coverage,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print('Legendary Treasures BW11:',coverage['battleReady'],'battle-ready / 140 prints,',coverage['attacks'],'attacks,',coverage['abilities'],'abilities')
 if coverage['gated']:print('GATED:',', '.join(coverage['gated']))
if __name__=='__main__':main()
