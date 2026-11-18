#!/usr/bin/env python3
"""Offline, source-locked HeartGold SoulSilver Unleashed printed-card generator.

96 distinct physical prints: #1–95 + Alph Lithograph TWO. No online dependency,
no fake noop for unimplemented effects. Stage 1 safely gates complex mechanics.
"""
import hashlib,json,re
from pathlib import Path
import hgss2_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/hgss2-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-unleashed.js'
EXPECTED_SHA256='203cd8045793f74e38db5ce8c4561e239bdbe5cdb0db5147794c1e48e7b526db'
EXPECTED_NUMBERS={str(i) for i in range(1,96)}|{'TWO'}
LETTER={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
LEGENDS={'90':('Entei & Raikou LEGEND','91'),'91':('Entei & Raikou LEGEND','90'),
 '92':('Raikou & Suicune LEGEND','93'),'93':('Raikou & Suicune LEGEND','92'),
 '94':('Suicune & Entei LEGEND','95'),'95':('Suicune & Entei LEGEND','94')}

def load():
 blob=SRC.read_bytes()
 if hashlib.sha256(blob).hexdigest()!=EXPECTED_SHA256:raise SystemExit('HGSS2 compact transcription SHA256 mismatch: refusing to build')
 rows=json.loads(blob)
 if len(rows)!=96 or {str(r[0]) for r in rows}!=EXPECTED_NUMBERS or any(len(r)!=14 for r in rows):raise SystemExit('HGSS2 expected 96 authentic collector prints 1-95 plus TWO')
 if any(rows[int(n)-1][1]!=name for n,(name,_) in LEGENDS.items()):raise SystemExit('HGSS2 LEGEND physical half identity mismatch')
 return rows

def roles(attacks,abilities):
 tags=[]
 def traverse(obj):
  if isinstance(obj,dict):
   yield obj
   for k in ('effect','effects','heads','tails','options'):yield from traverse(obj.get(k))
  elif isinstance(obj,list):
   for x in obj:yield from traverse(x)
 types={e.get('type') for a in attacks+abilities for e in traverse(a.get('effect'))}
 for role,fx in [('draw',{'draw','handShuffle','drawToHandSize'}),('search',{'searchChosen','benchFromDeck'}),('ramp',{'attachEnergy','attachEnergyFromDiscard'}),('heal',{'heal','drain'}),('status',{'status'}),('control',{'lock','forceOpponentSwitch','moveEnergy','attackCoinGate'})]:
  if types&fx:tags.append(role)
 return tags

def generate():
 out=[]
 for row in load():
  num,name,supertype,subtypes,hp,types,evolves,printed_attacks,printed_abilities,weaknesses,resistances,retreat,rarity,rules=row
  num=str(num);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[supertype];stage=(subtypes or ['Basic'])[0]
  issues=[];attacks=[];abilities=[]
  for aname,cost,damage,body in printed_attacks:
   effect=V.attack(row,(aname,cost,damage,body))
   if effect is None:issues.append(f'Unverified attack: {aname}');effect=V.N
   d=re.search(r'\d+',str(damage or ''));n=int(d.group()) if d else 0
   # Any × damage is a multiplication formula, not a base hit.
   if re.search(r'\d+\s*[×x]\s*$',str(damage or '')):n=0
   if effect.get('type')=='selectedDamage' or effect.get('type') in ('energyDamage','coinDamage'):n=0
   # '20+' Rage retains its printed base 20 before adding 10 per counter.
   attacks.append({'name':aname,'cost':''.join(LETTER[t] for t in cost),'damage':n,'damageText':damage or None,'text':body or '', 'effect':effect})
  for pname,printed_type,text in printed_abilities:
   effect=V.ability(row,(pname,printed_type,text))
   if effect is None:issues.append(f'Unverified {printed_type}: {pname}');effect={'effect':V.N}
   abilities.append({'name':pname,'text':text,'type':'activated' if printed_type=='Poké-Power' else 'passive','printedPowerType':'power' if printed_type=='Poké-Power' else 'body','disabledByStatus':printed_type=='Poké-Power',**effect})
  trainer=V.TRAINERS.get(num)
  if kind=='trainer' and trainer is None:issues.append('Unverified Trainer effect')
  if kind=='pokemon' and not hp:issues.append('Missing HP')
  ref={'id':f'hgss2-{num}','setId':'hgss2','number':num,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,'rarity':rarity or '',
   'image':f'https://images.pokemontcg.io/hgss2/{num}.png','imageLarge':f'https://images.pokemontcg.io/hgss2/{num}_hires.png',
   'battleEnabled':not issues,'deckEligible':not issues,'support':{'status':'FULL' if not issues else 'PARTIAL','reasons':issues}}
  if kind=='pokemon':
   weak=(weaknesses or [{}])[0];res=(resistances or [{}])[0];energy=list(dict.fromkeys(t for att in printed_attacks for t in att[1] if t!='Colorless'))
   rs=roles(attacks,abilities)
   if stage=='LEGEND':partners=[name]
   elif stage in ('Stage 1','Stage 2'):partners=[evolves] if evolves else []
   else:partners=[]
   if num=='34':partners=['Plusle']
   if num=='36':partners=['Minun']
   ref.update({'stage':stage,'hp':int(hp),'types':types or ['Colorless'],'subtype':(types or ['Colorless'])[0],
    'evolvesFrom':evolves or None,'retreat':int(retreat or 0),'weakness':weak.get('type'),'weaknessValue':weak.get('value'),'weaknesses':weaknesses,
    'resistance':res.get('type'),'resistanceValue':res.get('value'),'resistances':resistances,
    'attacks':attacks,'abilities':abilities,'isPokemonSP':False,'isLevelX':False,'tags':['pokemon-prime'] if 'Prime' in subtypes else ['pokemon-legend'] if stage=='LEGEND' else [],
    'legendHalf':stage=='LEGEND','legendPair':LEGENDS[num][0] if num in LEGENDS else None,'prizeCards':2 if stage=='LEGEND' else 1,
    'deckMeta':{'roles':rs,'synergy':rs,'energyTypes':energy,'preferredEnergyTypes':energy,'preferredPartners':partners,'inflicts':[],'payoffs':[]}})
  elif kind=='trainer':
   ref.update({'trainerType':trainer[0] if trainer else stage,'text':'\n'.join(rules),'effect':trainer[1] if trainer else V.N})
   if num=='80':ref['expires']='endOwnTurn'  # PlusPower is temporary, unlike a Tool
  else:raise SystemExit('Unexpected energy print in HGSS2')
  out.append(ref)
 # Physical halves must both be playable or both gated: never break a pair.
 for first,second in [('90','91'),('92','93'),('94','95')]:
  a,b=out[int(first)-1],out[int(second)-1]
  if bool(a['battleEnabled'])!=bool(b['battleEnabled']):
   for c in (a,b):
    c['battleEnabled']=c['deckEligible']=False;c['support']={'status':'PARTIAL','reasons':['Partner LEGEND half not independently verified']}
 return out

def main():
 cards=generate()
 code='''/* LuckyDex HGSS Unleashed (hgss2): 96 authenticated physical collector prints.
 * Unsupported printed effects are gated from decks and battles until verified.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGHGSS2=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'hgss2',name:'Unleashed',series:'HeartGold & SoulSilver',releaseDate:'2010-05-12',cardCount:95,printedTotal:96});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(code.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),'utf8')
 print(f'HGSS2 Unleashed: {len(cards)} prints; {sum(c["battleEnabled"] for c in cards)} battle-enabled; {sum(not c["battleEnabled"] for c in cards)} gated')
 for c in cards:
  if c['support']['reasons']:print('GATED',c['id'],c['name'],':','; '.join(c['support']['reasons']))
if __name__=='__main__':main()
