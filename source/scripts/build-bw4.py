#!/usr/bin/env python3
"""Next Destinies: offline, deterministic print-to-battle catalog generator."""
import json,re,hashlib
from pathlib import Path
import bw4_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/bw4-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-next-destinies.js'
PIN='8027b966110623fadf028820809bd46d301289d6594120a2de45e3883ea0018f'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}

def generate():
 if hashlib.sha256(SRC.read_bytes()).hexdigest()!=PIN:raise SystemExit('Black & White source digest mismatch: refusing unverified print data')
 rows=json.loads(SRC.read_text());assert len(rows)==103 and [x[0] for x in rows]==[str(i) for i in range(1,104)]
 cards=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules=row
  stage=subtypes[0] if subtypes else "";typ=types[0] if types else "Colorless"
  kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup];reasons=[V.GATE[n]] if n in V.GATE else []; converted=[];powers=[]
  for title,cost,dmg,txt in attacks:
   eff=V.attack(row,[title,cost,dmg,txt]);
   if eff is None:reasons.append('Unverified attack: '+title)
   m=re.search(r'\d+',dmg);d=int(m[0]) if m else 0
   if '×' in dmg:d=0
   if eff and eff.get('type') in ('coinDamage','benchCountDamage','coinDamageByEnergy','multiTargetDamage') and '×' in dmg:d=0
   converted.append({'name':title,'cost':cost,'damage':d,'damageText':dmg or None,'text':txt,'effect':eff or {'type':'unsupported','reason':'Printed attack lacks executable mechanic'}})
  for title,ptype,txt in abilities:
   eff=V.ABILITY.get(title)
   if eff is None:reasons.append('Unverified Ability: '+title)
   else:powers.append({'name':title,'text':txt,'type':eff['type'],'printedPowerType':'ability','disabledByStatus':False,**eff})
  trainer=V.TRAINERS.get(n) if kind=='trainer' else None
  if kind=='trainer' and trainer is None:reasons.append('Unverified Trainer effect')
  enabled=not reasons
  c={'id':'bw4-'+n,'setId':'bw4','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/bw4/{n}.png','imageLarge':f'https://images.pokemontcg.io/bw4/{n}_hires.png',
   'battleEnabled':enabled,'deckEligible':enabled and kind!='energy','support':{'status':'FULL' if enabled else 'PARTIAL','reasons':reasons}}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[x] for a in attacks for x in a[1] if x in SYMBOL))
   roles=[];terms=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
   for role,words in [('draw',['draw ','into your hand']),('search',['search your deck']),('ramp',['attach',' energy']),('heal',['heal ','recover']),('status',['poisoned','burned','asleep','paralyzed','confused']),('control',["can't retreat",'discard','move '])]:
    if any(word in terms for word in words):roles.append(role)
   # Retain typed-cost synergies for the new BW Ability and Restored lines.
   conditional_types=[]
   c.update(stage=stage,hp=int(hp),types=[typ],subtype=typ,evolvesFrom=evolves or None,retreat=retreat,
    weakness=weak or None,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res or None,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
    attacks=converted,abilities=powers,tags=(['pokemon-ex'] if 'EX' in subtypes else [])+(['full-art'] if n in ('94','95','96','97','98','99') else ['secret-rare'] if n in ('100','101','102','103') else []),
    prizeCards=2 if 'EX' in subtypes else 1,pokemonEX='EX' in subtypes,
    isPokemonSP=False,isLevelX=False,deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,
    'preferredEnergyTypes':list(dict.fromkeys(needed+conditional_types)),
    'conditionalAttackEnergyTypes':conditional_types,
    'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   c.update(trainerType=trainer[0] if trainer else stage,text='\n'.join(rules),effect=trainer[1] if trainer else {'type':'unsupported'},tags=['full-art'] if n=='101' else [])
  else:
   c.update(basicEnergy=False,specialEnergy=True,energyType='Colorless',subtype='Colorless',text='\n'.join(rules),effect={'type':'specialEnergy','provides':{'Colorless':2 if n=='92' else 1}})
  cards.append(c)
 return cards

def main():
 cards=generate();header="""/* Next Destinies 103-print verified source */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGBW4=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'bw4',name:'Next Destinies',series:'Black & White',releaseDate:'2012-02-08',cardCount:103,printedTotal:103});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
"""
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))))
 summary={'printed':len(cards),'battleReady':sum(x['battleEnabled'] for x in cards),'gated':{x['id']:x['support']['reasons'] for x in cards if not x['battleEnabled']}}
 (ROOT/'docs/BW4_BUILD_COVERAGE.json').write_text(json.dumps(summary,indent=2)+'\n')
 print('Next Destinies:',summary['battleReady'],'/103 battle ready;',len(summary['gated']),'gated',summary['gated'])
if __name__=='__main__':main()
