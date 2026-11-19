#!/usr/bin/env python3
"""Source-pinned 103-print Pokémon TCG HGSS Triumphant generator.

The exact official collector transcription is bundled. Every printed card
now has an executable battle handler; CI rejects unexpected gating.
"""
import hashlib,json,re
from pathlib import Path
import hgss4_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/hgss4-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-triumphant.js'
EXPECTED_SHA256='77c7859b072a1be81422cb962a02d6b4b59934ea4739025aa0f17db660c6fbde'
EXPECTED_NUMBERS={str(i) for i in range(1,103)}|{'FOUR'}
LETTER={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
LEGENDS={'99':('Darkrai & Cresselia LEGEND','100'),'100':('Darkrai & Cresselia LEGEND','99'),
 '101':('Palkia & Dialga LEGEND','102'),'102':('Palkia & Dialga LEGEND','101')}

def load():
 blob=SRC.read_bytes()
 if hashlib.sha256(blob).hexdigest()!=EXPECTED_SHA256:raise SystemExit('HGSS4 official print transcription hash changed; refusing to generate')
 rows=json.loads(blob)
 if len(rows)!=103 or {str(r[0]) for r in rows}!=EXPECTED_NUMBERS or any(len(r)!=14 for r in rows):raise SystemExit('HGSS4 requires all 103 distinct printed collector numbers')
 if any(rows[int(n)-1][1]!=name for n,(name,_) in LEGENDS.items()):raise SystemExit('HGSS4 paired LEGEND identities incorrect')
 return rows

def roles(attacks,abilities):
 def walk(v):
  if isinstance(v,dict):
   yield v
   for key in ('effect','effects','heads','tails','options'):yield from walk(v.get(key))
  elif isinstance(v,list):
   for x in v:yield from walk(x)
 kinds={x.get('type') for a in attacks+abilities for x in walk(a.get('effect'))}
 roles=[]
 for role,fx in [('draw',{'draw','handShuffle','drawToHandSize'}),('search',{'searchChosen','benchFromDeck'}),('ramp',{'attachEnergyFromDiscard','attachEnergy'}),('heal',{'heal','drain'}),('status',{'status'}),('control',{'lock','forceOpponentSwitch','attackCoinGate','modifier'})]:
  if kinds&fx:roles.append(role)
 return roles

def generate():
 cards=[]
 for r in load():
  number,name,supertype,subtypes,hp,types,evolves,printed_attacks,printed_abilities,weaknesses,resistances,retreat,rarity,rules=r
  number=str(number);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[supertype];stage=(subtypes or ['Basic'])[0]
  errors=[];attacks=[];abilities=[]
  for a in printed_attacks:
   attack_name,cost,dmg_text,text=a;effect=V.attack(r,a)
   if effect is None:errors.append('Unverified attack: '+attack_name);effect=V.N
   dm=re.search(r'\d+',str(dmg_text or ''));damage=int(dm.group()) if dm else 0
   if re.search(r'\d+\s*[×x]\s*$',str(dmg_text or ''),re.I):damage=0
   if effect.get('type') in ('selectedDamage','topDeckCountDamage') or effect.get('rule') in ('hgss4:20:plasmaArrow',):damage=0
   attacks.append({'name':attack_name,'cost':''.join(LETTER[t] for t in cost),'damage':damage,
    'damageText':dmg_text or None,'text':text or '','effect':effect})
  for p in printed_abilities:
   pname,ptype,ptext=p;mapping=V.ability(r,p)
   if mapping is None:errors.append('Unverified '+ptype+': '+pname);mapping={'effect':V.N}
   abilities.append({'name':pname,'text':ptext,'type':'activated' if ptype=='Poké-Power' else 'passive',
    'printedPowerType':'power' if ptype=='Poké-Power' else 'body','disabledByStatus':ptype=='Poké-Power',**mapping})
  trainer=V.TRAINERS.get(number) if kind=='trainer' else None
  if kind=='trainer' and trainer is None:errors.append('Unverified printed Trainer effect')
  # Rescue Energy has a dedicated KO return trigger in the Classic engine.
  if kind=='pokemon' and not hp:errors.append('Missing printed HP')
  c={'id':'hgss4-'+number,'setId':'hgss4','number':number,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
   'rarity':rarity or '', 'image':f'https://images.pokemontcg.io/hgss4/{number}.png',
   'imageLarge':f'https://images.pokemontcg.io/hgss4/{number}_hires.png','battleEnabled':not errors,'deckEligible':not errors,
   'support':{'status':'FULL' if not errors else 'PARTIAL','reasons':errors}}
  if kind=='pokemon':
   weak=(weaknesses or [{}])[0];res=(resistances or [{}])[0]
   energy=list(dict.fromkeys(t for att in printed_attacks for t in att[1] if t!='Colorless'))
   partners=[evolves] if stage in ('Stage 1','Stage 2') and evolves else [name] if stage=='LEGEND' else []
   meta_roles=roles(attacks,abilities)
   c.update({'stage':stage,'hp':int(hp),'types':types or ['Colorless'],'subtype':(types or ['Colorless'])[0],
    'evolvesFrom':evolves or None,'retreat':int(retreat or 0),'weakness':weak.get('type'),'weaknessValue':weak.get('value'),'weaknesses':weaknesses,
    'resistance':res.get('type'),'resistanceValue':res.get('value'),'resistances':resistances,'attacks':attacks,'abilities':abilities,
    'isPokemonSP':False,'isLevelX':False,'tags':['pokemon-prime'] if 'Prime' in subtypes else ['pokemon-legend'] if stage=='LEGEND' else [],
    'legendHalf':number in LEGENDS,'legendPair':LEGENDS[number][0] if number in LEGENDS else None,
    'prizeCards':2 if number in LEGENDS else 1,
    'deckMeta':{'roles':meta_roles,'synergy':meta_roles,'energyTypes':energy,'preferredEnergyTypes':energy,
      'preferredPartners':partners,'inflicts':[],'payoffs':[]}})
  elif kind=='trainer':c.update({'trainerType':trainer[0] if trainer else stage,'text':'\n'.join(rules), 'effect':trainer[1] if trainer else V.N,})
  else:c.update({'specialEnergy':True,'basicEnergy':False,'energyType':'Colorless',
      'subtype':'Colorless','text':'\n'.join(rules),
      'effect':{'type':'specialEnergy','provides':{'Colorless':1}}})
  cards.append(c)
 for left,right in [('99','100'),('101','102')]:
  a,b=cards[int(left)-1],cards[int(right)-1]
  if a['battleEnabled']!=b['battleEnabled']:
   for c in (a,b):c['battleEnabled']=c['deckEligible']=False;c['support']={'status':'PARTIAL','reasons':['Matching LEGEND half not independently verified']}
 return cards

def main():
 cards=generate()
 js='''/* LuckyDex HeartGold & SoulSilver — Triumphant: 103 source-pinned prints. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGHGSS4=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'hgss4',name:'Triumphant',series:'HeartGold & SoulSilver',releaseDate:'2010-11-03',cardCount:102,printedTotal:103});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(js.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 print(f'HGSS4 Triumphant: {len(cards)} authenticated prints, {sum(c["battleEnabled"] for c in cards)} battle-ready; {sum(not c["battleEnabled"] for c in cards)} gated')
 for c in cards:
  if c['support']['reasons']:print('GATED',c['id'],c['name'],':','; '.join(c['support']['reasons']))
if __name__=='__main__':main()
