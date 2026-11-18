#!/usr/bin/env python3
"""Reproducible offline generator for the 124 real HGSS Base collector prints.

Only the authenticated 124-row compact transcription is used. Conservatively
exclude any unverified interaction from battles and CPU auto decks. No network
fetch or LLM card-text guessing in CI.
"""
import json, hashlib, re
from pathlib import Path
import hgss1_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/hgss1-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-heartgold-soulsilver.js'
EXPECTED_SHA256='e34fc017cbd948bea3f4fa18a627d55efaf2d217dbc4a2ec8afe102f1846a9f2'
EXPECTED_NUMBERS={str(n) for n in range(1,124)}|{'ONE'}
LETTER={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
# These explicit gates avoid partially implementing LEGEND placement (two cards,
# one in-play Pokemon, one Prize result), or opponent-deck/private-hand effects.
ALWAYS_GATE={'111':'Dual-half LEGEND assembly and pairing not yet implemented',
 '112':'Dual-half LEGEND assembly and pairing not yet implemented',
 '113':'Dual-half LEGEND assembly and pairing not yet implemented',
 '114':'Dual-half LEGEND assembly and pairing not yet implemented'}

def load():
 blob=SRC.read_bytes()
 if hashlib.sha256(blob).hexdigest()!=EXPECTED_SHA256:
  raise SystemExit('HGSS1 locked source transcription changed: refuse to build')
 rows=json.loads(blob)
 if len(rows)!=124 or {str(x[0]) for x in rows}!=EXPECTED_NUMBERS:
  raise SystemExit('Expected all HGSS1 prints 1..123 + ONE, without duplicates')
 if any(len(x)!=14 for x in rows):raise SystemExit('Malformed HGSS1 print record')
 if [r[1] for r in rows if r[0] in ['111','112','113','114']]!=['Ho-Oh LEGEND','Ho-Oh LEGEND','Lugia LEGEND','Lugia LEGEND']:
  raise SystemExit('LEGEND physical half identity changed')
 return rows

def roles(row,attacks,abilities):
 def walk(v):
  if isinstance(v,dict):
   yield v
   for k in ['effects','effect','heads','tails','options']:
    yield from walk(v.get(k))
  elif isinstance(v,list):
   for u in v:yield from walk(u)
 fx=[j for x in attacks+abilities for j in walk(x.get('effect'))]
 types={x.get('type') for x in fx}
 role=[]
 if types.intersection({'draw','handShuffle','fieldCountDraw'}):role.append('draw')
 if 'searchChosen' in types:role.append('search')
 if 'heal' in types or 'drain' in types:role.append('heal')
 if 'status' in types:role.append('status')
 if types.intersection({'lock','attackCoinGate','forceOpponentSwitch','moveEnergy'}):role.append('control')
 if types.intersection({'attachEnergy','attachEnergyFromDiscard'}):role.append('ramp')
 return role

def generate():
 cards=[]
 for r in load():
  number,name,supertype,subtypes,hp,types,evolves,printed_attacks,printed_abilities,weaknesses,resistances,retreat,rarity,rules=r
  number=str(number);kind='pokemon' if supertype=='Pokémon' else 'trainer' if supertype=='Trainer' else 'energy'
  stage=(subtypes or ['Basic'])[0]
  issues=[ALWAYS_GATE[number]] if number in ALWAYS_GATE else []
  attacks=[];abilities=[]
  for a in printed_attacks:
   aname,cost,damage,text=a
   effect=V.attack(r,a)
   if effect is None:issues.append('Unverified attack: '+aname);effect=V.N
   d=re.search(r'\d+',str(damage or ''))
   dmg=int(d.group()) if d else 0
   # Selected damage must not also hit the default Defending Pokemon.
   if effect.get('type')=='selectedDamage':dmg=0
   attacks.append({'name':aname,'cost':''.join(LETTER[t] for t in cost),'damage':dmg,
    'damageText':damage or None,'text':text or '', 'effect':effect})
  for p in printed_abilities:
   name0,printed_type,body=p
   mapping=V.ability(r,p)
   if mapping is None:issues.append('Unverified '+printed_type+': '+name0);mapping={'effect':V.N}
   abilities.append({'name':name0,'text':body or '','type':'activated' if printed_type=='Poké-Power' else 'passive',
    'printedPowerType':'power' if printed_type=='Poké-Power' else 'body','disabledByStatus':printed_type=='Poké-Power',**mapping})
  trainer=V.TRAINERS.get(number) if kind=='trainer' else None
  if kind=='trainer' and (not trainer or trainer[1] is None):issues.append('Unverified Trainer effect')
  if kind=='pokemon' and not hp:issues.append('Missing printed Pokémon HP')
  row={'id':'hgss1-'+number,'setId':'hgss1','number':number,'name':name,'source':'tcg','battleFormat':'classic',
    'kind':kind,'rarity':rarity or '', 'image':f'https://images.pokemontcg.io/hgss1/{number}.png',
    'imageLarge':f'https://images.pokemontcg.io/hgss1/{number}_hires.png',
    'battleEnabled':not issues,'deckEligible':not issues,
    'support':{'status':'FULL' if not issues else 'PARTIAL','reasons':issues}}
  if kind=='pokemon':
   weak=(weaknesses or [{}])[0];res=(resistances or [{}])[0]
   energy=list(dict.fromkeys(x for a in printed_attacks for x in a[1] if x!='Colorless'))
   rs=roles(r,attacks,abilities)
   partners=[]
   if stage in ('Stage 1','Stage 2'):partners=[evolves] if evolves else []
   elif stage=='LEGEND':partners=['Ho-Oh LEGEND' if number in ['111','112'] else 'Lugia LEGEND']
   row.update({'stage':stage,'hp':int(hp),'types':types or ['Colorless'],'subtype':(types or ['Colorless'])[0],
    'evolvesFrom':evolves or None,'retreat':int(retreat or 0),
    'weakness':weak.get('type'),'weaknessValue':weak.get('value'),'weaknesses':weaknesses,
    'resistance':res.get('type'),'resistanceValue':res.get('value'),'resistances':resistances,
    'attacks':attacks,'abilities':abilities,
    'isPokemonSP':False,'isLevelX':False,'tags':['pokemon-prime'] if 'Prime' in subtypes else ['pokemon-legend'] if 'LEGEND' in subtypes else [],
    'legendHalf':number in ['111','112','113','114'],
    'legendPair':('Ho-Oh LEGEND' if number in ['111','112'] else 'Lugia LEGEND') if number in ['111','112','113','114'] else None,
    'deckMeta':{'roles':rs,'synergy':rs,'energyTypes':energy,'preferredEnergyTypes':energy,'preferredPartners':partners,'inflicts':[],'payoffs':[]}})
  elif kind=='trainer':
   row.update({'trainerType':trainer[0] if trainer else stage,'text':'\n'.join(rules),
     'printedAbilities':[],'effect':trainer[1] if trainer and trainer[1] is not None else V.N})
  else:
   # Basic Energy is supplied by the Classic energy zone, not a deck slot.
   basic='Basic' in subtypes
   row.update({'basicEnergy':basic,'specialEnergy':not basic,'energyType':name.removesuffix(' Energy') if basic else None,
    'text':'\n'.join(rules),
    'effect':None if basic else {'type':'specialEnergy','provides':{'Colorless':2} if number=='103' else {'Miracle':1}}})
   row['deckEligible']=not basic
  cards.append(row)
 return cards

def main():
 cards=generate()
 code='''/* LuckyDex HGSS Base (hgss1): 124 authentic collector prints, offline locked.
 * Unknown timing/choices, especially dual-half LEGEND, stay non-battle-ready.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGHGSS1=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'hgss1',name:'HeartGold & SoulSilver',series:'HeartGold & SoulSilver',releaseDate:'2010-02-10',cardCount:123,printedTotal:124});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(code.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),'utf8')
 eligible=sum(c['deckEligible'] for c in cards)
 print(f'HGSS1: {len(cards)} collector prints, {eligible} deck-eligible, {sum(c["battleEnabled"] for c in cards)} mechanically mapped; {len(cards)-sum(c["battleEnabled"] for c in cards)} gated')
 for c in cards:
  if c['support']['reasons']:print('GATED',c['id'],c['name'],':','; '.join(c['support']['reasons']))

if __name__=='__main__':main()
