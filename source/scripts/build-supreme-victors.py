#!/usr/bin/env python3
"""Generate 153 authentic Supreme Victors prints, gating unresolved mechanics.

No network/download/test fixture. This generator is run as part of the APK
build so the committed catalogue and CI checks cannot silently diverge.
"""
from pathlib import Path
import hashlib,json,re
import pl3_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/pl3-print-source.json'
COMPACT=ROOT/'data/classic/pl3-print-compact.b64'
OUT=ROOT/'app/src/main/assets/tcg-classic-supreme-victors.js'
EXPECTED_SOURCE_SHA='9630216d1cc77f0319a2b21b947c4aab5adf78ecc8586d8739f4729ac09ea312'
EXPECTED_COMPACT_SHA='e8ee64788720563f60f5273cd05c209e6da4e02f24fa22f39cf963b3104eba06'
NUMBERS={str(i) for i in range(1,151)}|{'SH7','SH8','SH9'}
COLOR={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}

# Individual Trainer handlers. Unsupported support cards remain visible but
# are never put in 30-card automated battles until their full text works.
TRAINERS={
 '135':('Stadium',{'type':'modifier','stat':'retreatCost','amount':-1,'scope':'team','duration':'whileInPlay','filter':{'tag':'pokemon-sp'}}),
 '136':('Supporter',{'type':'selectTopToHand','count':7}),
 '140':('Item',{'type':'searchChosen','source':'discard','amount':1,'filter':{'kind':'trainer','trainerType':'Supporter'},'excludePlayedTrainer':True}),
 '139':('Supporter',{'type':'neoRule','rule':'pl3:139:palmer'}),
}

def supported(e):
 if not isinstance(e,dict):return False
 t=e.get('type')
 if t=='sequence':return bool(e.get('effects')) and all(supported(x) for x in e['effects'])
 if t=='coinFlip':return bool(e.get('heads') or e.get('tails')) and all(supported(e[k]) for k in ('heads','tails') if k in e)
 if t=='chooseOption':return bool(e.get('options')) and all(supported(x.get('effect')) for x in e['options'])
 if t=='coinAttackGate':return supported(e.get('heads')) or e.get('heads')==V.N
 if t=='neoRule':return e.get('rule')=='dp1:babyEvolve' or str(e.get('rule','')).startswith('pl3:')
 return t in {'noop','draw','heal','bonusDamage','coinDamage','selfDamage','status','modifier','selectedDamage','benchDamage','lock','forceOpponentSwitch','searchChosen','coinDamageByEnergy','coinBenchDamage','removeStatuses','attachEnergyFromDiscard','koGuard','preventDamage','modifier','removeStatuses','chooseAttackLock','preventDamage','damageRule','damageFromDamage','energyDamage','multiTargetDamage','discardEnergyCard','discardTop','coinAttackGate','attackCoinGate','benchFromDeck','switch','drawToHandSize','selfDamagePenalty','fieldCountDamage','selectTopToHand','drain','discardCountDamage','returnToHand','nextAttackBonus','moveEnergy','chooseAttackLock','attachEnergy','attachEnergyFromDiscard','shuffleRandomHandCard'}

def build():
 assert SRC.exists() and COMPACT.exists(),'Supreme Victors print files missing; do not synthesize replacement records'
 assert hashlib.sha256(SRC.read_bytes()).hexdigest()==EXPECTED_SOURCE_SHA,'Supreme Victors official printed source was modified'
 assert hashlib.sha256(COMPACT.read_bytes()).hexdigest()==EXPECTED_COMPACT_SHA,'Supreme Victors compact archive was modified'
 archive=json.loads(SRC.read_text('utf8'))
 assert len(archive)==153 and {str(c['number']) for c in archive}==NUMBERS
 assert sum(len(c.get('attacks',[])) for c in archive)==254
 assert sum(len(c.get('abilities',[])) for c in archive)==34
 result=[]
 for c in archive:
  number=str(c['number']);kind={'Pokémon':'pokemon','Trainer':'trainer'}[c['supertype']]
  stage=(c.get('subtypes') or ['Basic'])[0];issues=[];attacks=[];abilities=[]
  for attack in c.get('attacks',[]):
   effect=V.attack(c,attack)
   if effect is None or not supported(effect):issues.append('Unverified attack: '+attack['name']);effect=V.N
   damageText=str(attack.get('damage') or '')
   digits=re.search(r'\d+',damageText)
   attacks.append({'name':attack['name'],'cost':''.join(COLOR[x] for x in attack.get('cost') or []),
       'damage':int(digits.group()) if digits else 0,'damageText':damageText or None,
       'text':attack.get('text') or '', 'effect':effect})
  for power in c.get('abilities',[]):
   entry=V.ability(c,power)
   if entry is None or not supported(entry.get('effect')):issues.append('Unverified '+power['type']+': '+power['name']);entry={'effect':V.N}
   abilities.append({'name':power['name'],'text':power.get('text') or '',
      'type':'activated' if power['type']=='Poké-Power' else 'passive',
      'printedPowerType':'power' if power['type']=='Poké-Power' else 'body',
      'disabledByStatus':power['type']=='Poké-Power',**entry})
  if kind=='trainer':
   effect=TRAINERS.get(number)
   if not effect or not supported(effect[1]):issues.append('Trainer not implemented')
  enabled=not issues
  row={'id':'pl3-'+number,'setId':'pl3','number':number,'name':c['name'],
   'source':'tcg','battleFormat':'classic','kind':kind,'rarity':c.get('rarity') or '',
   'image':f'https://images.pokemontcg.io/pl3/{number}.png','imageLarge':f'https://images.pokemontcg.io/pl3/{number}_hires.png',
   'battleEnabled':enabled,'deckEligible':enabled,
   'support':{'status':'FULL' if enabled else 'PARTIAL','reasons':issues}}
  if kind=='pokemon':
   weak=(c.get('weaknesses') or [{}])[0];res=(c.get('resistances') or [{}])[0]
   energy=list(dict.fromkeys(x for a in c.get('attacks',[]) for x in a.get('cost',[]) if x!='Colorless'))
   raw=' '.join([(x.get('text') or '') for x in c.get('attacks',[]) + c.get('abilities',[])]).lower()
   roles=[r for r,word in [('draw','draw'),('search','search'),('status','asleep'),('heal','remove'),('control','retreat'),('ramp','attach')] if word in raw]
   sp='SP' in (c.get('subtypes') or [])
   row.update({'stage':stage,'hp':int(c.get('hp') or 0),'types':c.get('types') or ['Colorless'],
    'subtype':(c.get('types') or ['Colorless'])[0],
    'evolvesFrom':c.get('evolvesFrom') or (c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None),
    'retreat':int(c.get('convertedRetreatCost') or 0),
    'weakness':weak.get('type'),'weaknessValue':weak.get('value'),'weaknesses':[weak] if weak else [],
    'resistance':res.get('type'),'resistanceValue':res.get('value'),'resistances':[res] if res else [],
    'attacks':attacks,'abilities':abilities,'isLevelX':stage=='Level-Up','isPokemonSP':sp,
    'tags':['pokemon-sp'] if sp else [], 'levelUpFrom':c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None,
    'deckMeta':{'roles':roles,'synergy':roles,'energyTypes':energy,'preferredEnergyTypes':energy,
     'preferredPartners':[],'inflicts':[],'payoffs':[]}})
  else:
   row.update({'trainerType':TRAINERS.get(number,(stage,V.N))[0],
    'text':'\n'.join(c.get('rules') or []),'effect':TRAINERS.get(number,(stage,V.N))[1]})
  result.append(row)
 return result


def main():
 cards=build()
 code="""/* LuckyDex Supreme Victors (pl3): official 153 collector prints.\n * Unverified mechanics remain visible but are excluded from combat.\n */\n(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGSupremeVictors=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';\nconst SET=Object.freeze({id:'pl3',name:'Supreme Victors',series:'Platinum',releaseDate:'2009-08-19',cardCount:147,printedTotal:153});\nconst CARDS=Object.freeze(__RECORDS__.map(c=>Object.freeze(c)));\nconst INDEX=new Map(CARDS.map(c=>[c.id,c]));\nreturn {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};\n});\n"""
 OUT.write_text(code.replace('__RECORDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),'utf8')
 count=sum(c['battleEnabled'] for c in cards)
 print(f'Supreme Victors: {len(cards)} authentic prints, {count} battle-enabled, {len(cards)-count} gated')
 for c in cards:
  if not c['battleEnabled']: print('GATED',c['id'],':',','.join(c['support']['reasons']))

if __name__=='__main__':main()
