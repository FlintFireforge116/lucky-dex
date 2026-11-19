#!/usr/bin/env python3
"""Emerging Powers: offline, deterministic print-to-battle catalog generator."""
import json,re,hashlib
from pathlib import Path
import bw2_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/bw2-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-emerging-powers.js'
PIN='04bb88464c9a0fc17950f39b31db701a60b98566df7fabb7a77bb37db01a75df'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}

def generate():
 if hashlib.sha256(SRC.read_bytes()).hexdigest()!=PIN:raise SystemExit('Black & White source digest mismatch: refusing unverified print data')
 rows=json.loads(SRC.read_text());assert len(rows)==98 and [x[0] for x in rows]==[str(i) for i in range(1,99)]
 cards=[]
 for row in rows:
  n,name,sup,stage,hp,typ,evolves,attacks,abilities,weak,res,retreat,rarity,rules=row
  kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup];reasons=[]; converted=[];powers=[]
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
  c={'id':'bw2-'+n,'setId':'bw2','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/bw2/{n}.png','imageLarge':f'https://images.pokemontcg.io/bw2/{n}_hires.png',
   'battleEnabled':enabled,'deckEligible':enabled and kind!='energy','support':{'status':'FULL' if enabled else 'PARTIAL','reasons':reasons}}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[x] for a in attacks for x in a[1] if x in SYMBOL))
   roles=[];terms=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
   for role,words in [('draw',['draw ','into your hand']),('search',['search your deck']),('ramp',['attach',' energy']),('heal',['heal ','recover']),('status',['poisoned','burned','asleep','paralyzed','confused']),('control',["can't retreat",'discard','move '])]:
    if any(word in terms for word in words):roles.append(role)
   c.update(stage=stage,hp=int(hp),types=[typ],subtype=typ,evolvesFrom=evolves or None,retreat=retreat,
    weakness=weak or None,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res or None,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
    attacks=converted,abilities=powers,tags=['full-art'] if int(n) in (113,114) else ['secret-rare'] if n=='115' else [],
    isPokemonSP=False,isLevelX=False,deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,
    'preferredEnergyTypes':needed,'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   c.update(trainerType=trainer[0] if trainer else stage,text='\n'.join(rules),effect=trainer[1] if trainer else {'type':'unsupported'})
  else:
   c.update(basicEnergy=True,specialEnergy=False,energyType=name.removesuffix(' Energy'),subtype=name.removesuffix(' Energy'),text='')
  cards.append(c)
 return cards

def main():
 cards=generate();header="""/* Emerging Powers 98-print verified source */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGBW2=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'bw2',name:'Emerging Powers',series:'Black & White',releaseDate:'2011-08-31',cardCount:98,printedTotal:98});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
"""
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))))
 summary={'printed':len(cards),'battleReady':sum(x['battleEnabled'] for x in cards),'gated':{x['id']:x['support']['reasons'] for x in cards if not x['battleEnabled']}}
 (ROOT/'docs/BW2_BUILD_COVERAGE.json').write_text(json.dumps(summary,indent=2)+'\n')
 print('Emerging Powers:',summary['battleReady'],'/98 battle ready;',len(summary['gated']),'gated',summary['gated'])
if __name__=='__main__':main()
