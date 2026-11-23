#!/usr/bin/env python3
"""Pinned Sun & Moon—Guardians Rising SM2 (180 distinct official prints).

All cards are listed; only cards with implemented, validated effects are playable.
No dummy generic effects are ever substituted for unsupported printed rules.
"""
from __future__ import annotations
import json,re
from pathlib import Path
from pinned_tcg_source import load_pinned_set
import sm2_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/sm2-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-guardians-rising.js'
COVER=ROOT/'docs/SM2_BUILD_COVERAGE.json'
BLOB='0d2296a8c32fac6442c9b407653d30f8e9c3f0d6'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy'}
REVERSE={v:k for k,v in SYMBOL.items()}

def get_source():
 if SRC.exists():rows=json.loads(SRC.read_text(encoding='utf-8'))
 else:
  raw=load_pinned_set('sm2',BLOB,timeout=75)
  rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
    [[a['name'],[REVERSE.get(en,'C') for en in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
    [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
    c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
    c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
    c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType'),c.get('ancientTrait')]
    for c in raw]
 numbers=[str(x[0]) for x in rows]
 extras={str(i):[str(i)+'a'] for i in (19,21,51,60,92,121,124,125,128,130,157)}
 expected=[x for i in range(1,170) for x in ([str(i)]+extras.get(str(i),[]))]
 if len(rows)!=180 or numbers!=expected or len(set(numbers))!=180:
  raise RuntimeError('SM2 requires 180 unique prints: #1–#169 plus eleven a-numbered variants')
 if sum(len(r[7]) for r in rows)!=287 or sum(len(r[8]) for r in rows)!=30:
  raise RuntimeError('SM2 pinned attack/Ability counts differ from 287/30')
 if sum('GX' in r[3] for r in rows)!=42 or sum(r[2]=='Energy' for r in rows)!=4:
  raise RuntimeError('SM2 pinned GX/Energy count has changed (42 GX, 4 Energy)')
 if sum(a[0].endswith('-GX') for r in rows for a in r[7])!=42:
  raise RuntimeError('SM2 must contain exactly 42 printed GX attacks')
 SRC.parent.mkdir(parents=True,exist_ok=True)
 if not SRC.exists():SRC.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 return rows

def generate(rows):
 cards=[]
 for row in rows:
  n,name,sup,subs,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class,trait=row
  n=str(n);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  problems=[];attack_objs=[];powers=[]
  if trait:problems.append('Ancient Trait not supported')
  for a in attacks:
   title,cost,damage,printed=a
   eff=V.attack(row,a)
   if eff is None:problems.append('Unimplemented attack: '+title)
   m=re.search(r'\d+',damage or '')
   base=int(m.group()) if m and '×' not in damage and 'x' not in damage else 0
   attack_objs.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,
    'gxAttack':title.endswith('-GX'),'effect':eff if eff is not None else {'type':'unsupported','reason':'SM2 unsupported attack mechanic'}})
  for title,abi_type,printed in abilities:
   impl=V.ABILITIES.get(title)
   if impl is None:
    problems.append('Unimplemented Ability: '+title)
    powers.append({'name':title,'text':printed,'printedPowerType':'ability','disabledByStatus':False,'type':'passive','effect':{'type':'unsupported','reason':'SM2 unimplemented Ability'}})
   else:powers.append({'name':title,'text':printed,'printedPowerType':'ability','disabledByStatus':False,**impl})
  if kind=='trainer' and n not in V.TRAINERS:problems.append('Unimplemented Trainer rules')
  if kind=='energy' and n not in V.BASIC and n not in V.ENERGIES:problems.append('Unimplemented Energy effect')
  ok=not problems;gx='GX' in subs
  card={'id':'sm2-'+n,'setId':'sm2','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/sm2/{n}.png','imageLarge':f'https://images.pokemontcg.io/sm2/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':problems},
   'tags':['pokemon-gx'] if gx else [],'teamPlasma':False}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[s] for _,cost,_,_ in attacks for s in cost if s in SYMBOL))
   printed=' '.join([a[3] for a in attacks]+[a[2] for a in abilities]).lower()
   roles=[]
   for phrase,role in [('draw','draw'),('search your deck','search'),('heal','heal'),('is now poisoned','status'),('is now paralyzed','status'),('is now confused','status'),('discard an energy from your opponent','control')]:
    if phrase in printed and role not in roles:roles.append(role)
   card.update(stage=next((s for s in subs if s in ('Basic','Stage 1','Stage 2','BREAK','Restored')),'Basic'),
    hp=int(hp or 0),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
    retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
    attacks=attack_objs,abilities=powers,ancientTrait=trait,prizeCards=2 if gx else 1,pokemonGX=gx,isPokemonGX=gx,
    pokemonEX=False,pokemonEx=False,megaEvolution=False,breakEvolution=False,isLevelX=False,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,
      'conditionalAttackEnergyTypes':[],'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   spec=V.TRAINERS.get(n)
   card.update(trainerType=spec[0] if spec else next((s for s in subs if s in ('Item','Supporter','Stadium','Pokémon Tool')),'Item'),
    text='\n'.join(rules),effect=spec[1] if spec else {'type':'unsupported'},aceSpec=False,maxDeckCopies=4)
  elif n in V.BASIC:
   card.update(basicEnergy=True,specialEnergy=False,energyType=V.BASIC[n],subtype=V.BASIC[n],effect={'type':'noop'},text='\n'.join(rules))
  else:
   card.update(basicEnergy=False,specialEnergy=True,energyType='Colorless',subtype='Colorless',effect=V.ENERGIES.get(n,{'type':'unsupported'}),text='\n'.join(rules))
  cards.append(card)
 return cards

def main():
 rows=get_source();cards=generate(rows)
 release='''/* Sun & Moon—Guardians Rising SM2 pinned 180-print source; unsupported rules gated. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGSM2=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'sm2',name:'Guardians Rising',series:'Sun & Moon',releaseDate:'2017-05-05',cardCount:180,printedTotal:180});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(release.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 report={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
  'attacks':sum(len(r[7]) for r in rows),'abilities':sum(len(r[8]) for r in rows),'pokemonGX':sum('GX' in r[3] for r in rows),
  'gxAttackPrints':sum(a[0].endswith('-GX') for r in rows for a in r[7]),'energyPrints':sum(r[2]=='Energy' for r in rows),'sourceGitBlob':BLOB}
 COVER.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(f'Guardians Rising SM2: {report["battleReady"]}/180 playable, {len(report["gated"])} safely gated; 287 attacks, 30 Abilities, 42 GX prints')
 if report['gated']:print('Gated:', ', '.join(report['gated']))
if __name__=='__main__':main()
