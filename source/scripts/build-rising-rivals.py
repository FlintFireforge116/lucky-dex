#!/usr/bin/env python3
"""Generate Rising Rivals from its checked-in official printed archive.

All card prints are shown in the catalogue. Only cards for which every
printed move/ability has executable, verified semantics enter combat and
30-card deck construction. This is an incremental implementation.
"""
import json,re,pathlib,sys,hashlib
import pl2_verified as V
ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/pl2-print-source.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-rising-rivals.js'
SYMBOL={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
# Snapshot digest of real official records, not a test-only generated fixture.
EXPECTED_SHA256='e13db36df7a9dbc51a92a2dfff53d5f543380497d96005ca63e0538fa8f0b23e'
EXPECTED={str(n) for n in range(1,115)}|{'RT'+str(n) for n in range(1,7)}
SIMPLE={'devolve','drain','coinUntilTails','discardHand','damage','noop','bonusDamage','status','heal','draw','sequence','coinFlip','coinDamage','selfDamage','discardEnergyCard','lock','modifier','preventDamage','benchDamage','selectedDamage','benchCountDamage','damageFromDamage','energyDamage','moveEnergy','attackCoinGate','coinAttackGate','searchChosen','multiTargetDamage','damageRule','forceOpponentSwitch','switch','shuffleRandomHandCard','nextAttackBonus','removeStatus','attackRequirement','specialEnergy','discardChosenHand','drawToHandSize','coinBenchDamage','coinAnyHeadsGate','coinRepeatEffect','retreatCostDamage','knockOut','topDeckDiscardBonus','returnToHand','moveDamage','attachEnergy','benchFromDeck','discardStadium','evolveFromDeck','stadiumAction'}
def supported(e):
 if not isinstance(e,dict):return False
 t=e.get('type')
 if t=='neoRule':return e.get('rule') in ({'pl2:'+r for r in V.PL2_VERIFIED_RULES}|{'dp1:babyEvolve'})
 if t=='sequence':return bool(e.get('effects')) and all(supported(x) for x in e['effects'])
 if t=='coinFlip':return any(z in e for z in ('heads','tails')) and all(supported(e[z]) for z in ('heads','tails') if z in e)
 if t=='stadiumAction':return supported(e.get('effect'))
 if t=='chooseOption':return bool(e.get('options')) and all(supported(x.get('effect')) for x in e['options'])
 if t=='coinUntilTails':return supported(e.get('effect'))
 return t in SIMPLE

def build():
 if not SRC.exists():raise SystemExit('Rising Rivals printed archive missing. Never substitute dummy rows.')
 actual_digest=hashlib.sha256(SRC.read_bytes()).hexdigest()
 assert actual_digest==EXPECTED_SHA256, f'Rising Rivals source differs from the audited archive: {actual_digest}'
 archive=json.loads(SRC.read_text('utf8'))
 nums=[str(c['number']) for c in archive]
 assert len(nums)==120 and len(set(nums))==120 and set(nums)==EXPECTED,'Rising Rivals archive must be 1–114 + RT1–RT6'
 assert sum(len(x.get('attacks',[])) for x in archive)==188,'Printed attack count changed'
 assert sum(len(x.get('abilities',[])) for x in archive)==45,'Printed ability count changed'
 cards=[]
 for c in archive:
  n=str(c['number']);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[c['supertype']]
  stage=(c.get('subtypes') or ['Basic'])[0];problems=[];attacks=[];abilities=[]
  for x in c.get('attacks') or []:
   e=V.ATTACKS.get(n,{}).get(x['name']);printed=x.get('text') or ''
   if not supported(e) or (printed and e==V.N):problems.append('Unverified attack: '+x['name']);e=V.N
   dmg=str(x.get('damage') or '');digits=re.search(r'\d+',dmg)
   attacks.append({'name':x['name'],'cost':''.join(SYMBOL[t] for t in x.get('cost') or []),
     'damage':(20 if n=='39' and x['name']=='Reckless Bomb' else 10 if (n=='61' and x['name']=='Shell Scatter') or (n=='RT2' and x['name']=='Hail') else int(digits.group()) if digits else 0),'damageText':dmg or None,'text':printed,'effect':e})
  for x in c.get('abilities') or []:
   match=next((p for p in V.ABILITIES.get(n,[]) if p['name']==x['name']),None)
   if not match or not supported(match['effect']) or (x.get('text') and match['effect']==V.N):problems.append('Unverified ability: '+x['name'])
   abilities.append({'name':x['name'],'text':x.get('text') or '',
    'type':'activated' if x['type']=='Poké-Power' else 'passive','printedPowerType':'power' if x['type']=='Poké-Power' else 'body',
    'disabledByStatus':x['type']=='Poké-Power','effect':V.N,**(match or {})})
  if kind=='trainer':
   tr=V.TRAINERS.get(n)
   if not tr or not supported(tr[1]):problems.append('Trainer not implemented')
  if kind=='energy':
   if n not in V.ENERGY:problems.append('Special Energy not implemented')
  active=not problems
  item={'id':'pl2-'+n,'setId':'pl2','number':n,'name':c['name'],'source':'tcg','battleFormat':'classic',
   'kind':kind,'rarity':c.get('rarity') or '', 'image':f'https://images.pokemontcg.io/pl2/{n}.png',
   'imageLarge':f'https://images.pokemontcg.io/pl2/{n}_hires.png','battleEnabled':active,'deckEligible':active,
   'support':{'status':'FULL' if active else 'PARTIAL','reasons':problems}}
  if kind=='pokemon':
   weak=(c.get('weaknesses') or [{}])[0];resist=(c.get('resistances') or [{}])[0]
   energy=list(dict.fromkeys(t for x in c.get('attacks') or [] for t in x.get('cost') or [] if t!='Colorless'))
   raw=' '.join([x.get('text') or '' for x in c.get('attacks') or []]+[x.get('text') or '' for x in c.get('abilities') or []]).lower()
   roles=[r for r,term in [('draw','draw'),('search','search'),('status','asleep'),('heal','remove'),('control','retreat'),('ramp','attach')] if term in raw]
   sp='SP' in (c.get('subtypes') or [])
   item.update({'stage':stage,'hp':int(c.get('hp') or 0),'types':c.get('types') or ['Colorless'],
     'subtype':(c.get('types') or ['Colorless'])[0], 'evolvesFrom':c.get('evolvesFrom') or (c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None),
     'retreat':int(c.get('convertedRetreatCost') or 0),'weakness':weak.get('type'),'weaknessValue':weak.get('value'),'weaknesses':[weak] if weak else [],
     'resistance':resist.get('type'),'resistanceValue':resist.get('value'),'resistances':[resist] if resist else [],
     'attacks':attacks,'abilities':abilities,'isLevelX':stage=='Level-Up','isPokemonSP':sp,'tags':['pokemon-sp'] if sp else [],
     'levelUpFrom':c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None,
     'deckMeta':{'roles':roles,'synergy':roles,'energyTypes':energy,'preferredEnergyTypes':energy,
       'preferredPartners':[],'inflicts':[],'payoffs':[]}})
  elif kind=='trainer':
   item.update({'trainerType':V.TRAINERS.get(n,(stage,V.N))[0],
     'text':'\n'.join(c.get('rules') or []),'effect':V.TRAINERS.get(n,(stage,V.N))[1],
     **({'technicalMachine':True,'tags':['pokemon-sp']} if n=='95' else {}),
     **({'attacks':attacks} if attacks else {})})
  else:item.update({'specialEnergy':True,'text':'\n'.join(c.get('rules') or []),'effect':V.ENERGY.get(n,V.N)})
  cards.append(item)
 return cards

def main():
 cards=build();enabled=sum(x['battleEnabled'] for x in cards)
 script='''/* LuckyDex Rising Rivals (pl2): original 120 collector prints.\n * All 188 attacks/45 abilities retain authentic descriptions.\n * Unimplemented outcomes cannot appear in automated battles or decks.\n */\n(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGRisingRivals=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';\nconst SET=Object.freeze({id:'pl2',name:'Rising Rivals',series:'Platinum',releaseDate:'2009-05-16',cardCount:111,printedTotal:120});\nconst CARDS=Object.freeze(__RECORDS__.map(c=>Object.freeze(c)));\nconst INDEX=new Map(CARDS.map(c=>[c.id,c]));\nreturn {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};\n});\n'''
 OUT.write_text(script.replace('__RECORDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),'utf8')
 print(f'Rising Rivals: {len(cards)} collector prints, {enabled} battle/deck enabled, {len(cards)-enabled} gated.')
 for c in cards:
  if not c['battleEnabled']:print('GATED',c['id'],':',', '.join(c['support']['reasons']))
if __name__=='__main__':main()
