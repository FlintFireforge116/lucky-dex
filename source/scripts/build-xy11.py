#!/usr/bin/env python3
"""Steam Siege XY11: immutable official prints, strict playable-effect gating.

The 116-card catalogue is always complete. A card is playable only when all
its printed effects (including abilities) have a real implemented handler.
"""
from __future__ import annotations
import json,re
from pathlib import Path
from pinned_tcg_source import load_pinned_set
import xy11_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/xy11-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-steam-siege.js'
COVER=ROOT/'docs/XY11_BUILD_COVERAGE.json'
BLOB='22ea97ca00b595fe6b121494fd45dd65692deee6'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy'}
REVERSE={v:k for k,v in SYMBOL.items()}

def get_source():
 if SRC.exists():rows=json.loads(SRC.read_text(encoding='utf-8'))
 else:
  original=load_pinned_set('xy11',BLOB,timeout=75)
  rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
    [[a['name'],[REVERSE.get(en,'C') for en in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
    [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
    c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
    c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
    c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType'),c.get('ancientTrait')]
    for c in original]
 if len(rows)!=116 or [str(x[0]) for x in rows]!=[str(i) for i in range(1,117)]:
  raise RuntimeError('XY11 must contain exactly distinct print numbers 1..116')
 if sum(len(r[7]) for r in rows)!=161 or sum(len(r[8]) for r in rows)!=18:
  raise RuntimeError('XY11 printed attack / Ability counts changed (expected 161 / 18)')
 if sum('BREAK' in r[3] for r in rows)!=7:
  raise RuntimeError('XY11 official data should contain seven Pokémon BREAK')
 if sum(len(r[5])>1 for r in rows)!=12:
  raise RuntimeError('XY11 must preserve all twelve dual-type prints, including alternate art')
 # All source rows are normalized, including alternate artwork cards.
 SRC.parent.mkdir(parents=True,exist_ok=True)
 if not SRC.exists():SRC.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 return rows

def generate(rows):
 cards=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class,trait=row
  n=str(n);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  problems=[];attack_objs=[];power_objs=[]
  if trait:problems.append('Unverified printed Ancient Trait')
  for title,cost,damage,printed in attacks:
   eff=V.attack(row,[title,cost,damage,printed]);
   if eff is None:problems.append('Unimplemented printed attack: '+title)
   m=re.search(r'\d+',damage or '')
   base=int(m.group()) if m and '×' not in damage else 0
   attack_objs.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,
    'effect':eff if eff is not None else {'type':'unsupported','reason':'Requires exact printed-rule implementation'}})
  for title,ability_type,printed in abilities:
   impl=V.ABILITIES.get(title)
   if title in V.UNVERIFIED_ABILITIES or impl is None:
    problems.append('Unimplemented printed Ability: '+title)
   else:power_objs.append({'name':title,'text':printed,'printedPowerType':'ability','disabledByStatus':False,**impl})
  if kind=='trainer' and n not in V.TRAINERS:problems.append('Unimplemented Trainer rules')
  if kind=='energy':problems.append('Unverified physical Energy rules')
  if kind=='trainer' and n in ('101','106'):
   # Tool can only be enabled if its named Mega turn exemption exists.
   pass
  ok=not problems;ex='EX' in subtypes;mega='MEGA' in subtypes
  card={'id':'xy11-'+n,'setId':'xy11','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/xy11/{n}.png','imageLarge':f'https://images.pokemontcg.io/xy11/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':problems},
   'tags':(['pokemon-ex'] if ex else [])+(['mega-evolution'] if mega else [])+(['pokemon-break'] if 'BREAK' in subtypes else []),'teamPlasma':False}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[s] for _,cost,_,_ in attacks for s in cost if s in SYMBOL))
   printed=' '.join([a[3] for a in attacks]+[a[2] for a in abilities]).lower()
   roles=[]
   for regexp,role in [(r'\bdraw\b|\bdraws\b','draw'),('search your deck','search'),(r'\bheal\b','heal'),('is now asleep','status'),('is now poisoned','status'),('is now burned','status'),('is now paralyzed','status'),('is now confused','status'),('discard an energy attached to your opponent','control')]:
    if re.search(regexp,printed) and role not in roles:roles.append(role)
   partners=[evolves] if evolves else []
   if mega:partners.append(name.replace('M ',''));roles.append('mega-evolution')
   card.update(stage='Stage 1' if mega else next((s for s in subtypes if s in ('Basic','Stage 1','Stage 2','BREAK','Restored')),'Basic'),
    hp=int(hp or 0),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
    retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
    attacks=attack_objs,abilities=power_objs,ancientTrait=trait,prizeCards=2 if ex else 1,pokemonEX=ex,megaEvolution=mega,
    breakEvolution='BREAK' in subtypes,isPokemonSP=False,isLevelX=False,upgradeInheritance='previous' if 'BREAK' in subtypes else None,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,
      'conditionalAttackEnergyTypes':[],'preferredPartners':partners,'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   spec=V.TRAINERS.get(n)
   card.update(trainerType=spec[0] if spec else next((s for s in subtypes if s in ('Item','Supporter','Stadium','Pokémon Tool')),'Item'),
    text='\n'.join(rules),effect=spec[1] if spec else {'type':'unsupported'},aceSpec=False,maxDeckCopies=4)
  else:card.update(basicEnergy=False,specialEnergy=True,subtype=types[0] if types else 'Colorless',effect={'type':'unsupported'})
  cards.append(card)
 return cards

def main():
 rows=get_source();cards=generate(rows)
 release='''/* Steam Siege XY11 — 116 prints, pinned Git blob %s. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGXY11=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'xy11',name:'Steam Siege',series:'XY',releaseDate:'2016-08-03',cardCount:116,printedTotal:116});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''%BLOB
 OUT.write_text(release.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 report={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
  'attacks':sum(len(r[7]) for r in rows),'abilities':sum(len(r[8]) for r in rows),'pokemonBreak':sum('BREAK' in r[3] for r in rows),'dualTypePrints':sum(len(r[5])>1 for r in rows),'sourceGitBlob':BLOB}
 COVER.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(f'Steam Siege: {report["battleReady"]}/{len(cards)} fully implemented, {len(report["gated"])} explicitly gated; 161 attacks, 18 abilities, seven BREAK, twelve dual-type prints')
 if report['gated']:print('Gated:',', '.join(report['gated']))
if __name__=='__main__':main()
