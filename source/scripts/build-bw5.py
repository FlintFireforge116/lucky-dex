#!/usr/bin/env python3
"""Pinned print-grounded 111-card Dark Explorers Classic catalog generator."""
import json,re,hashlib
from pathlib import Path
import bw5_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/bw5-print-compact.json'
PIN='24e47e6f8ec3f39ab29b5c39c042573cff3af7fbb20e53ccb23bac662361f0f4'
OUT=ROOT/'app/src/main/assets/tcg-classic-dark-explorers.js'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}
def generate():
 assert hashlib.sha256(SRC.read_bytes()).hexdigest()==PIN,'Source hash mismatch: do not trust unexpected print data'
 rows=json.loads(SRC.read_text());assert len(rows)==111 and [x[0] for x in rows]==[str(i) for i in range(1,112)]
 out=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules=row
  kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  stage=subtypes[0] if subtypes else '';typ=types[0] if types else 'Colorless'
  reasons=[V.GATE[n]] if n in V.GATE else [];moves=[];powers=[]
  for title,cost,dmg,txt in attacks:
   eff=V.attack(row,[title,cost,dmg,txt]);
   if eff is None:reasons.append('Unmapped printed attack: '+title)
   hit=re.search(r'\d+',dmg);base=int(hit[0]) if hit else 0
   if '×' in dmg:base=0
   moves.append({'name':title,'cost':cost,'damage':base,'damageText':dmg or None,'text':txt,'effect':eff or {'type':'unsupported','reason':'Unmapped printed attack'}})
  for title,ptype,txt in abilities:
   eff=V.ABILITY.get(title)
   if eff is None:reasons.append('Unmapped Ability: '+title)
   else:powers.append({'name':title,'text':txt,'type':eff['type'],'printedPowerType':'ability','disabledByStatus':False,**eff})
  trainer=V.TRAINERS.get(n) if kind=='trainer' else None
  if kind=='trainer' and not trainer:reasons.append('Trainer not implemented')
  enabled=not reasons
  c={'id':'bw5-'+n,'setId':'bw5','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity,'image':f'https://images.pokemontcg.io/bw5/{n}.png','imageLarge':f'https://images.pokemontcg.io/bw5/{n}_hires.png',
   'battleEnabled':enabled,'deckEligible':enabled and kind!='energy','support':{'status':'FULL' if enabled else 'PARTIAL','reasons':reasons}}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[x] for a in attacks for x in a[1] if x in SYMBOL))
   roles=[];terms=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
   for role,words in [('draw',['draw ','into your hand']),('search',['search your deck']),('ramp',['attach',' energy']),('heal',['heal ','recover']),('status',['poisoned','burned','asleep','paralyzed','confused']),('control',["can't retreat",'discard','move '])]:
    if any(w in terms for w in words):roles.append(role)
   # No generic Basic Energy cards in deck (Classic Energy Zone), however
   # physical Special Energy is legal in the 30-card deck.
   c.update(stage=stage,hp=int(hp),types=[typ],subtype=typ,evolvesFrom=evolves or None,retreat=retreat,
    weakness=weak or None,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res or None,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
    attacks=moves,abilities=powers,tags=(['pokemon-ex'] if 'EX' in subtypes else [])+(['full-art'] if 103<=int(n)<=108 else ['secret-rare'] if int(n)>=109 else []),
    prizeCards=2 if 'EX' in subtypes else 1,pokemonEX='EX' in subtypes,isPokemonSP=False,isLevelX=False,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,'conditionalAttackEnergyTypes':[],
    'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   c.update(trainerType=trainer[0],text='\n'.join(rules),effect=trainer[1],tags=['secret-rare'] if n=='111' else [])
  else: c.update(basicEnergy=False,specialEnergy=True,text='\n'.join(rules))
  out.append(c)
 return out

def main():
 cards=generate();header="""/* Black & White Dark Explorers: pinned complete 111-print catalog */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGBW5=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'bw5',name:'Dark Explorers',series:'Black & White',releaseDate:'2012-05-09',cardCount:111,printedTotal:111});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
"""
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))))
 cov={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']}}
 (ROOT/'docs/BW5_BUILD_COVERAGE.json').write_text(json.dumps(cov,indent=2)+'\n')
 print('Dark Explorers',cov['battleReady'],'/111 battle ready; gated=',cov['gated'])
if __name__=='__main__':main()
