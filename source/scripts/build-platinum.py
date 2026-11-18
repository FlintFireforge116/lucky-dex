#!/usr/bin/env python3
"""Build all 133 Platinum (pl1) printed card records with strict combat gating.

The original printed text comes from the archived public PokemonTCG card data,
not from generated labels or guessed mechanics. Card-by-card effects must be
verified before the corresponding card is enabled for battle/autobuild.
"""
import json, re, pathlib
import pl1_verified as V
ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/pl1-print-source.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-platinum.js'
SYMBOL={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
EXPECTED={str(n) for n in range(1,131)}|{'SH4','SH5','SH6'}
def supported(e):
 if not isinstance(e,dict):return False
 kind=e.get('type')
 if kind=='sequence':return all(supported(x) for x in e.get('effects',[]))
 if kind=='coinFlip':return any(k in e for k in ('heads','tails')) and all(supported(e[k]) for k in ('heads','tails') if k in e)
 if kind=='chooseOption':return all(supported(x.get('effect')) for x in e.get('options',[]))
 if kind=='neoRule':return e.get('rule') in ({'pl1:'+r for r in V.PL1_RULES}|V.REUSED_RULES)
 return kind in {'noop','bonusDamage','status','heal','draw','sequence','coinFlip','coinDamage','selfDamage','discardEnergyCard','lock','modifier','preventDamage','benchDamage','selectedDamage','benchCountDamage','damageFromDamage','energyDamage','energyTypeCountDamage','discardCountDamage','fieldCountDamage','moveEnergy','drawToHandSize','attackCoinGate','coinAttackGate','searchChosen','attachEnergy','attachRandomEnergyFromDiscard','multiTargetDamage','discardHand','actionLock','removeStatus','removeStatuses','discardStadium','benchFromDeck','evolveFromDeck','koGuard','forceOpponentSwitch','switch','retaliateDamage','nextAttackBonus','shuffleRandomHandCard','trimHand','returnToHand','attackRequirement','chooseAttackLock','preventEffects','preventStatus','previousEvolutionAttacks','evolutionTimingOverride','selfDamagePenalty','neoRule','weaknessGuard','coinBenchDamage','selfDamageIfDefenderKnockedOut','playFossil'}
def read():
 if not SRC.exists():raise SystemExit('Missing official data/classic/pl1-print-source.json — run sh scripts/prepare-platinum.sh')
 records=json.loads(SRC.read_text('utf8'))
 nums=[str(row.get('number')) for row in records]
 if len(nums)!=133 or set(nums)!=EXPECTED or len(set(nums))!=133:raise SystemExit('Platinum data incomplete or mismatched: expected 1–130 plus SH4, SH5, SH6')
 cards=[]
 for c in records:
  n=str(c['number']);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[c['supertype']]
  stage=(c.get('subtypes') or ['Basic'])[0]
  problems=[];attacks=[];powers=[]
  for x in c.get('attacks') or []:
   effect=V.ATTACKS.get(n,{}).get(x['name'])
   if not supported(effect):problems.append('Unverified attack: '+x['name']);effect=V.N
   dmg=str(x.get('damage') or '')
   # The printed "-" means an effect-based attack, not automatically zero damage
   # to the Active; Platinum Over Slash explicitly hits every opponent Pokémon.
   base=int(re.search(r'\d+',dmg)[0]) if re.search(r'\d+',dmg) else 0
   if n=='10' and x['name']=='Over Slash':base=10
   attacks.append({'name':x['name'],'cost':''.join(SYMBOL[z] for z in x.get('cost') or []),
       'damage':base,'damageText':dmg or None,'text':x.get('text') or '', 'effect':effect})
  known=V.ABILITIES.get(n,[])
  for x in c.get('abilities') or []:
   match=next((p for p in known if p['name']==x['name']),None)
   if not match or not supported(match['effect']):problems.append('Unverified ability: '+x['name'])
   powers.append({'name':x['name'],'text':x.get('text') or '',
     'type':'activated' if x['type']=='Poké-Power' else 'passive',
     'printedPowerType':'power' if x['type']=='Poké-Power' else 'body',
     'disabledByStatus':x['type']=='Poké-Power', 'effect':V.N, **(match or {})})
  if kind=='trainer':
   trainer=V.TRAINERS.get(n)
   if not trainer or not supported(trainer[1]):problems.append('Trainer effect not verified')
  if kind=='energy' and n not in V.ENERGY:problems.append('Special Energy attachment behaviour not verified')
  # Armor/Skull Fossils evolve into Shieldon/Cranidos; both lines are now
  # represented as actual play-as-Basic Trainer cards with on-KO Stones.
  if kind=='pokemon' and stage=='Level-Up' and not c['name'].endswith(' LV.X'):problems.append('Missing LV.X prerequisite')
  active=not problems
  card={'id':'pl1-'+n,'setId':'pl1','number':n,'name':c['name'],'source':'tcg','battleFormat':'classic',
    'kind':kind,'rarity':c.get('rarity') or '', 'image':f'https://images.pokemontcg.io/pl1/{n}.png',
    'imageLarge':f'https://images.pokemontcg.io/pl1/{n}_hires.png',
    'battleEnabled':active,'deckEligible':active,'support':{'status':'FULL' if active else 'PARTIAL','reasons':problems}}
  if kind=='pokemon':
   weakness=(c.get('weaknesses') or [{}])[0];resistance=(c.get('resistances') or [{}])[0]
   required=set(SYMBOL[t] for a in c.get('attacks') or [] for t in a.get('cost') or [] if t!='Colorless')
   colors=[t for t,v in SYMBOL.items() if v in required]
   raw=' '.join([a.get('text') or '' for a in c.get('attacks') or []]+[p.get('text') or '' for p in c.get('abilities') or []]).lower()
   roles=[role for role,term in [('draw','draw'),('search','search'),('status','asleep'),('heal','remove'),('control','retreat'),('ramp','attach')] if term in raw]
   is_sp='SP' in (c.get('subtypes') or [])
   card.update({'stage':stage,'hp':int(c.get('hp') or 0),'types':c.get('types') or ['Colorless'],
       'subtype':(c.get('types') or ['Colorless'])[0], 'evolvesFrom':c.get('evolvesFrom') or (c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None),
       'retreat':c.get('convertedRetreatCost') or 0,
       'weakness':weakness.get('type'),'weaknessValue':weakness.get('value'),'weaknesses':[weakness] if weakness else [],
       'resistance':resistance.get('type'),'resistanceValue':resistance.get('value'),'resistances':[resistance] if resistance else [],
       'attacks':attacks,'abilities':powers,'isLevelX':stage=='Level-Up',
       'isPokemonSP':is_sp,'tags':['pokemon-sp'] if is_sp else [],
       'levelUpFrom':c['name'].removesuffix(' LV.X') if stage=='Level-Up' else None,
       'deckMeta':{'roles':roles,'synergy':roles,'energyTypes':colors,'preferredEnergyTypes':colors,
                   'preferredPartners':[],'inflicts':[],'payoffs':[]}})
  elif kind=='trainer':
   fallback={'type':'noop'}
   card.update({**({'hp':int(c.get('hp') or 50),'types':['Colorless'],'subtype':'Colorless','stage':'Basic','retreat':99,'abilities':powers,'fossil':True} if n in ('119','120') else {}),'trainerType':V.TRAINERS.get(n,(stage,fallback))[0],
     **({'expires':'endOwnTurn'} if n=='112' else {}),
     'text':'\n'.join(c.get('rules') or []),'effect':V.TRAINERS.get(n,(stage,fallback))[1]})
  else:card.update({'specialEnergy':True,'text':'\n'.join(c.get('rules') or []),
    'effect':V.ENERGY.get(n,{'type':'noop'})})
  cards.append(card)
 return cards

def main():
 cards=read();print(f'Platinum: {len(cards)} collector prints, {sum(c["battleEnabled"] for c in cards)} fully mapped, {sum(not c["battleEnabled"] for c in cards)} gated')
 # All original text is retained for the 133 prints, even if battle gated.
 script='''/* LuckyDex Platinum (pl1): 133 official collector prints.\n * Incomplete outcomes are not executable in battles or used by autobuild.\n */\n(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGPlatinum=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';\nconst SET=Object.freeze({id:'pl1',name:'Platinum',series:'Platinum',releaseDate:'2009-02-11',cardCount:133,printedTotal:133});\nconst CARDS=Object.freeze(__RECORDS__.map(c=>Object.freeze(c)));\nconst INDEX=new Map(CARDS.map(c=>[c.id,c]));\nreturn {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};\n});\n'''
 OUT.write_text(script.replace('__RECORDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),'utf8')
 for c in cards:
  if not c['battleEnabled']:print('GATED',c['id'],c['name'],':',', '.join(c['support']['reasons']))
if __name__=='__main__':main()
