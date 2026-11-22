#!/usr/bin/env python3
"""XY BREAKthrough (xy8): full pinned print catalogue, conservative mechanic-first implementation.

Used by :app:generateXY8ForApk. Fetches immutable official source, never
conflates alternate art prints, and gates every missing printed effect.
"""
from __future__ import annotations
import base64,hashlib,json,re,urllib.request
from pathlib import Path
import xy8_verified as V
from pinned_tcg_source import load_pinned_set
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/xy8-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-breakthrough.js'
COVER=ROOT/'docs/XY8_BUILD_COVERAGE.json'
BLOB='951db4c259e70ca2fbd4daa2705e797af19fa25c'
# Fetch pinned upstream Git raw content (verified against BLOB), not rate-limited REST.
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy'}
REVERSE={v:k for k,v in SYMBOL.items()}

def get_source():
 if SRC.exists():rows=json.loads(SRC.read_text(encoding='utf-8'))
 else:
  official=load_pinned_set('xy8', BLOB, timeout=75)
  rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
    [[a['name'],[REVERSE.get(en,'C') for en in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
    [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
    c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
    c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
    c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType'),c.get('ancientTrait')]
    for c in official]
 if len(rows)!=165 or [str(r[0]) for r in rows]!=([str(i) for i in range(1,147)]+['146a']+[str(i) for i in range(147,165)]):
  raise RuntimeError('XY8 official catalogue requires #1 through #164 plus 146a')
 if sum(len(r[7]) for r in rows)!=220 or sum(len(r[8]) for r in rows)!=19:
  raise RuntimeError('XY8 attack / Ability counts changed; expected 220 / 19')
 # The live audit checks both text and Ancient Trait data; never throw away
 # a printed trait merely to make its attacks appear usable.
 if sum('BREAK' in r[3] for r in rows)!=6:
  raise RuntimeError('XY8 must contain six BREAK evolutions')
 SRC.parent.mkdir(parents=True,exist_ok=True)
 normalized=json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n'
 if not SRC.exists() or SRC.read_text(encoding='utf-8')!=normalized:SRC.write_text(normalized,encoding='utf-8')
 return rows

def generate(rows):
 cards=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class,trait=row
  n=str(n);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  issues=[];aa=[];pw=[]
  if trait: issues.append('Unverified Ancient Trait')
  if 'BREAK' in subtypes:issues.append('BREAK Evolution needs engine inheritance and testing')
  for title,cost,damage,printed in attacks:
   eff=V.attack(row,[title,cost,damage,printed]);
   if eff is None:issues.append('Unimplemented printed attack: '+title)
   m=re.search(r'\d+',damage or '')
   base=int(m.group()) if m and '×' not in damage else 0
   aa.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,
    'effect':eff if eff is not None else {'type':'unsupported','reason':'Needs a dedicated printed-rule implementation'}})
  for title,ability_type,printed in abilities:
   impl=V.ABILITIES.get(title)
   if impl is None:issues.append('Unimplemented printed Ability: '+title)
   else:pw.append({'name':title,'text':printed,'printedPowerType':'ability','disabledByStatus':False,**impl})

  if kind=='trainer' and n not in V.TRAINERS:issues.append('Unimplemented Trainer rules')
  if kind=='energy':issues.append('Unaudited Special Energy continuous effect')
  ok=not issues;ex='EX' in subtypes;mega='MEGA' in subtypes
  card={'id':'xy8-'+n,'setId':'xy8','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/xy8/{n}.png','imageLarge':f'https://images.pokemontcg.io/xy8/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':issues},
   'tags':(['pokemon-ex'] if ex else [])+(['mega-evolution'] if mega else [])+(['pokemon-break'] if 'BREAK' in subtypes else []),'teamPlasma':False}
  if kind=='pokemon':
   symbols=[s for _,cost,_,_ in attacks for s in cost if s in SYMBOL]
   needed=list(dict.fromkeys(SYMBOL[s] for s in symbols))
   printed=' '.join([a[3] for a in attacks]+[a[2] for a in abilities]).lower()
   roles=[]
   for regex,role in [(r'\bdraw\b|\bdraws\b','draw'),('search your deck','search'),(r'\bheal\b','heal'),('is now asleep','status'),('is now poisoned','status'),('is now burned','status'),('is now paralyzed','status'),('is now confused','status'),('discard an energy attached to your opponent','control')]:
    if re.search(regex,printed) and role not in roles:roles.append(role)
   if n in ('15','54') and 'ramp' not in roles:roles.append('ramp')  # energy acceleration only where verified
   partners=([evolves] if evolves else [])
   if mega:partners.append(name.replace('M ',''))
   if mega:roles.append('mega-evolution')
   card.update(stage='Stage 1' if mega else next((s for s in subtypes if s in ('Basic','Stage 1','Stage 2','BREAK')),'Basic'),
    hp=int(hp or 0),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
    retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
    attacks=aa,abilities=pw,ancientTrait=trait,prizeCards=2 if ex else 1,pokemonEX=ex,megaEvolution=mega,breakEvolution='BREAK' in subtypes,
    isPokemonSP=False,isLevelX=False,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,
      'conditionalAttackEnergyTypes':[],'preferredPartners':partners,'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   obj=V.TRAINERS.get(n)
   card.update(trainerType=obj[0] if obj else next((s for s in subtypes if s in ('Item','Supporter','Stadium','Pokémon Tool')),'Item'),
    text='\n'.join(rules),effect=obj[1] if obj else {'type':'unsupported'},aceSpec=False,maxDeckCopies=4)
  elif kind=='energy':
   # Dangerous Energy (Darkness) and Flash Energy (Lightning) are handled
   # by engine-wide attachment, retaliation and weakness hooks. Physical
   # Special Energy cards remain distinct from generated basic Zone units.
   t='Fire' if n=='151' else 'Colorless'
   card.update(basicEnergy=False,specialEnergy=True,energyType=t,subtype=t,text='\n'.join(rules),
      effect={'type':'specialEnergy','provides':{t:1},'attachOnlyTypes':[t]})
  cards.append(card)
 return cards

def main():
 rows=get_source();cards=generate(rows)
 header='''/* XY BREAKthrough xy8: 165 official prints; pinned Git blob %s. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGXY8=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'xy8',name:'BREAKthrough',series:'XY',releaseDate:'2015-11-04',cardCount:164,printedTotal:165});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''%BLOB
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 COVER.parent.mkdir(parents=True,exist_ok=True)
 report={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),
    'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
    'attacks':sum(len(r[7]) for r in rows),'abilities':sum(len(r[8]) for r in rows),
    'pokemonBreak':sum('BREAK' in r[3] for r in rows),'sourceGitBlob':BLOB}
 COVER.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(f'BREAKthrough: {report["battleReady"]} battle ready / {report["printed"]} verified prints; '
       f'{report["attacks"]} attacks, {report["abilities"]} Abilities, {report["pokemonBreak"]} Pokémon BREAK')
 if report['gated']:print('GATED:',', '.join(report['gated']))
if __name__=='__main__':main()
