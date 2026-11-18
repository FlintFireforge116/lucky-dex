#!/usr/bin/env python3
"""Build Platinum—Arceus from a verified, unmodified 2009 printed-card archive.

One pass catalogues all 111 collector IDs, but only real effects are battle-enabled.
Unsupported mechanics remain visible in collection and are excluded from decks.
"""
import hashlib,json,re
from pathlib import Path
import pl4_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/pl4-print-source.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-arceus.js'
EXPECTED_GIT_BLOB='2cbff9e0d363c2fc516328bd03aada50c4d99373'
NUMBERS={str(n) for n in range(1,100)}|{'AR'+str(n) for n in range(1,10)}|{'SH'+str(n) for n in range(10,13)}
COLOR={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
VALID_EFFECTS={'noop','sequence','status','draw','heal','bonusDamage','coinDamage','coinFlip','selfDamage','discardEnergyCard','coinAttackGate','attackCoinGate','damageRule','modifier','lock','forceOpponentSwitch','selectedDamage','benchDamage','preventDamage','removeStatuses','switch','searchChosen','playFossil','chooseAttackLock','neoRule','coinUntilTailsDamage','multiTargetDamage','attachEnergyFromDiscard','attachEnergy','damageFromDamage','chooseOption','stadiumAction','koGuard','energyDamage','actionLock','firstDamageGuard','coinAnyHeadsGate','shuffleRandomHandCard','evolutionTimingOverride','weaknessGuard'}
IMPLEMENTED_PL4={'95:meteorBlast','8:topAccelerator','31:leafSupply','49:cloakScale','3:magmaMantle','4:primalScythe','5:gadgetBolt','6:cloakParty','9:damageRoller','9:entangleRecoil','9:entangleTackle','12:lightningStrike','13:unearth','16:curse','18:wreck','19:tumbleDown','20:vortexChop','21:relaxingShower','23:timeSpiral','23:primalTentacles','24:continuousCrush','25:babySteps','26:dowsingCode','32:darknessGrace','33:wideLaser','51:cloakShard','51:serveTrash','71:megaShot','86:energyRestore','90:professorOakVisit','97:levelDown','97:compoundPain','98:doubleFall','SH10:dragonRage','AR1:prizeCount','AR9:metalBarrier','94:multiType','94:omniscient','fossilReaction','AR5:rippleSwell','AR5:skySpear','91:ultimateZone','29:recruit','43:discharge','45:waterBall','46:ascension','48:dragonBump','53:raid','69:harden','99:bigGrowth'}

def supported(e):
 if not isinstance(e,dict) or e.get('type') not in VALID_EFFECTS:return False
 t=e['type']
 if t=='sequence':return len(e.get('effects',[]))>0 and all(supported(x) for x in e['effects'])
 if t=='coinFlip':return bool(e.get('heads') or e.get('tails')) and all(supported(e[k]) for k in ('heads','tails') if k in e)
 if t=='stadiumAction':return supported(e.get('effect'))
 if t=='chooseOption':return bool(e.get('options')) and all(supported(x.get('effect')) for x in e['options'])
 if t=='coinAttackGate':return supported(e.get('heads'))
 if t=='neoRule':return e.get('rule')=='dp1:babyEvolve' or str(e.get('rule','')).startswith('pl4:') and e['rule'][4:] in IMPLEMENTED_PL4
 if t=='coinUntilTailsDamage':return False # unknown action kind, don't activate
 return True

def build():
 if not SRC.exists():raise SystemExit('Missing data/classic/pl4-print-source.json: run sh source/scripts/prepare-arceus.sh in ~/lucky-dex first')
 data=SRC.read_bytes()
 blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 if blob!=EXPECTED_GIT_BLOB:raise SystemExit(f'Arceus archive failed immutable Git SHA check: {blob} != {EXPECTED_GIT_BLOB}; do not build')
 source=json.loads(data.decode('utf8'))
 if len(source)!=111 or {str(c['number']) for c in source}!=NUMBERS:raise SystemExit('Arceus source must have all 99 numbered, 9 AR and 3 SH collector prints')
 out=[]
 for c in source:
  n=str(c['number']);kind='pokemon' if c['supertype']=='Pokémon' else 'trainer';issues=[]
  subtypes=c.get('subtypes') or [];stage=subtypes[0] if subtypes else 'Basic'
  attacks=[];abilities=[]
  for a in c.get('attacks') or []:
   fx=V.attack(c,a)
   if not supported(fx):issues.append('Unverified attack: '+a['name']);fx=V.N
   raw=str(a.get('damage') or '');m=re.search(r'\d+',raw)
   damage=int(m.group()) if m else 0
   # Selected damage is dealt to the actual selected target, not twice
   # to the Active via a nominal printed damage column.
   if fx.get('type')=='selectedDamage':damage=0
   attacks.append({'name':a['name'],'cost':''.join(COLOR[t] for t in (a.get('cost') or [])),
     'damage':damage,'damageText':raw or None,'text':a.get('text') or '', 'effect':fx})
  for p in c.get('abilities') or []:
   mapped=V.ability(c,p)
   if mapped is None or not supported(mapped.get('effect')):issues.append('Unverified '+p.get('type','Power')+': '+p['name']);mapped={'effect':V.N}
   abilities.append({'name':p['name'],'text':p.get('text') or '',
     'type':'activated' if p['type']=='Poké-Power' else 'passive',
     'printedPowerType':'power' if p['type']=='Poké-Power' else 'body',
     'disabledByStatus':p['type']=='Poké-Power',**mapped})
  trainer=V.TRAINERS.get(n) if kind=='trainer' else None
  if kind=='trainer' and (not trainer or not supported(trainer[1])):issues.append('Unverified Trainer effect')
  if kind=='pokemon' and not c.get('hp'):issues.append('Missing verified Pokémon HP')
  row={'id':'pl4-'+n,'setId':'pl4','number':n,'name':c['name'],'source':'tcg','battleFormat':'classic','kind':kind,
       'rarity':c.get('rarity') or '', 'image':f'https://images.pokemontcg.io/pl4/{n}.png',
       'imageLarge':f'https://images.pokemontcg.io/pl4/{n}_hires.png',
       'battleEnabled':not issues,'deckEligible':not issues,
       'support':{'status':'PARTIAL' if issues else 'FULL','reasons':issues}}
  if kind=='pokemon':
   weak=(c.get('weaknesses') or [{}])[0];res=(c.get('resistances') or [{}])[0]
   energy=list(dict.fromkeys(x for a in c.get('attacks',[]) for x in a.get('cost',[]) if x!='Colorless'))
   text=' '.join([(x.get('text') or '') for x in (c.get('attacks') or [])+(c.get('abilities') or [])]).lower()
   roles=[role for role,keyword in [('draw','draw'),('search','search'),('heal','remove'),('status','poison'),('control','retreat'),('ramp','attach')] if keyword in text]
   sp='SP' in subtypes
   row.update({'stage':stage,'hp':int(c['hp']), 'types':c.get('types') or ['Colorless'],
    'subtype':(c.get('types') or ['Colorless'])[0], 'evolvesFrom':c.get('evolvesFrom') or (c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None),
    'retreat':int(c.get('convertedRetreatCost') or 0),'weakness':weak.get('type'),'weaknessValue':weak.get('value'),
    'weaknesses':c.get('weaknesses') or [],'resistance':res.get('type'),'resistanceValue':res.get('value'),
    'resistances':c.get('resistances') or [],'attacks':attacks,'abilities':abilities,
    'isLevelX':stage=='Level-Up','levelUpFrom':c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None,
    'isPokemonSP':sp,'tags':['pokemon-sp'] if sp else [],
    'deckMeta':{'roles':roles,'synergy':roles,'energyTypes':energy,'preferredEnergyTypes':energy,
     'preferredPartners':(['Arceus'] if c['name'].startswith('Arceus') else ['Kabutops'] if c['name']=='Kabuto' else ['Omastar'] if c['name']=='Omanyte' else []),'inflicts':[],'payoffs':[]}})
  else:
   row.update({'trainerType':(trainer[0] if trainer else stage).replace('Pokémon Tool','Tool'),
      'text':'\n'.join([p.get('type','Poké-Power')+' — '+p['name']+': '+p.get('text','') for p in c.get('abilities') or []]+list(c.get('rules') or [])),
      'printedAbilities':c.get('abilities') or [],'effect':trainer[1] if trainer else V.N})
  out.append(row)
 return out

def main():
 cards=build()
 code='''/* LuckyDex Platinum—Arceus (pl4): verified physical 111-print catalogue.
 * Only fully mapped attacks/abilities enter Classic battles and CPU decks.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGArceus=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'pl4',name:'Arceus',series:'Platinum',releaseDate:'2009-11-04',cardCount:99,printedTotal:111});
const CARDS=Object.freeze(__RECORDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(code.replace('__RECORDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),'utf8')
 count=sum(c['battleEnabled'] for c in cards)
 print(f'Arceus pl4: {len(cards)} authentic collector prints, {count} battle-enabled, {len(cards)-count} gated')
 for c in cards:
  if not c['battleEnabled']:print('GATED',c['id'],':','; '.join(c['support']['reasons']))

if __name__=='__main__':main()
