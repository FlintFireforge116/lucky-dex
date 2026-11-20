#!/usr/bin/env python3
"""Authentic 153-print Boundaries Crossed catalog, pinned to source text."""
import json,re,hashlib
from pathlib import Path
import bw7_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/bw7-print-compact.json'
PIN='de0a1dcf24d908a0df59c1ae74f62d3c2ae2a0f12fa3f1f1609c02ac8f7d48b2'
OUT=ROOT/'app/src/main/assets/tcg-classic-boundaries-crossed.js'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}
def generate():
 assert hashlib.sha256(SRC.read_bytes()).hexdigest()==PIN,'Source print integrity mismatch'
 rows=json.loads(SRC.read_text());assert len(rows)==153 and [x[0] for x in rows]==[str(i) for i in range(1,154)]
 cards=[]
 for row in rows:
  n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules=row
  kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  stage=subtypes[0] if subtypes else '';typ=types[0] if types else 'Colorless'
  reasons=[V.GATE[n]] if n in V.GATE else [];moves=[];powers=[]
  for title,cost,dmg,txt in attacks:
   eff=V.attack(row,[title,cost,dmg,txt]);
   if eff is None:reasons.append('Unmapped attack: '+title)
   base=int(re.search(r'\d+',dmg)[0]) if re.search(r'\d+',dmg) and '×' not in dmg else 0
   moves.append({'name':title,'cost':cost,'damage':base,'damageText':dmg or None,'text':txt,'allowAsleep':n=='69' and title=='Dream Waltz','effect':eff or {'type':'unsupported','reason':'Unmapped attack'}})
  for title,powertype,txt in abilities:
   eff=V.ABILITY.get(title)
   if eff is None:reasons.append('Unmapped Ability: '+title)
   else:powers.append({'name':title,'text':txt,'type':eff['type'],'printedPowerType':'ability','disabledByStatus':False,**eff})
  trainer=V.TRAINERS.get(n) if kind=='trainer' else None
  if kind=='trainer' and not trainer:reasons.append('Unmapped Trainer')
  enabled=not reasons
  c={'id':'bw7-'+n,'setId':'bw7','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
     'rarity':rarity,'image':f'https://images.pokemontcg.io/bw7/{n}.png',
     'imageLarge':f'https://images.pokemontcg.io/bw7/{n}_hires.png',
     'battleEnabled':enabled,'deckEligible':enabled,'support':{'status':'FULL' if enabled else 'PARTIAL','reasons':reasons}}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[x] for a in attacks for x in a[1] if x in SYMBOL))
   terms=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
   roles=[]
   for role,keywords in [('draw',['draw ','into your hand']),('search',['search your deck']),('ramp',['attach',' energy']),('heal',['heal ','recover']),('status',['poisoned','burned','asleep','paralyzed','confused']),('control', ["can't retreat",'discard','move '])]:
    if any(x in terms for x in keywords):roles.append(role)
   c.update(stage=stage,hp=int(hp),types=[typ],subtype=typ,evolvesFrom=evolves or None,retreat=retreat,
      weakness=weak or None,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
      resistance=res or None,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
      attacks=moves,abilities=powers,tags=(['pokemon-ex'] if 'EX' in subtypes else [])+(['full-art'] if 141<=int(n)<=146 else ['secret-rare'] if 147<=int(n)<=153 else []),
      prizeCards=2 if 'EX' in subtypes else 1,pokemonEX='EX' in subtypes,isPokemonSP=False,isLevelX=False,
      deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,'conditionalAttackEnergyTypes':[],
        'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   ace='ACE SPEC' in subtypes
   c.update(trainerType=trainer[0],text='\n'.join(rules),effect=trainer[1],tags=(['ace-spec'] if ace else [])+(['full-art'] if 147<=int(n)<=149 else ['secret-rare'] if int(n)>=150 else []),aceSpec=ace,maxDeckCopies=1 if ace else 4)
  cards.append(c)
 return cards

def main():
 cards=generate();header="""/* Black & White Boundaries Crossed: 153 authentic prints from pinned metadata */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGBW7=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'bw7',name:'Boundaries Crossed',series:'Black & White',releaseDate:'2012-11-07',cardCount:153,printedTotal:153});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
"""
 OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 cov={'printed':len(cards),'battleReady':sum(x['battleEnabled'] for x in cards),'gated':{x['id']:x['support']['reasons'] for x in cards if not x['battleEnabled']}}
 (ROOT/'docs/BW7_BUILD_COVERAGE.json').write_text(json.dumps(cov,indent=2)+'\n')
 print('Boundaries Crossed',cov['battleReady'],'/153', 'attacks',sum(len(c.get('attacks',[])) for c in cards),'abilities',sum(len(c.get('abilities',[])) for c in cards))
if __name__=='__main__':main()
