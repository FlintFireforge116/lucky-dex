"""Crimson Invasion SM4: verified reprints and conservative generic engine adapters.

All unsupported effects remain battle gated. No unsupported no-op is permitted.
"""
from __future__ import annotations
from copy import deepcopy
from pathlib import Path
import json,re
import sm1_verified as S1
import sm2_verified as S2
import sm3_verified as S3
from xy8_verified import attack as generic_attack
E=lambda t,**kw:{'type':t,**kw}
N=E('noop')
ROOT=Path(__file__).resolve().parents[1]
def norm(s):
 s=re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)', '',s or '',flags=re.I)
 return re.sub(r'\s+',' ',s).strip().casefold()
EXACT_ATTACKS={}
EXACT_TRAINERS={}
EXACT_ABILITIES={}
for set_id,parser,trs,abs_ in (
  ('sm1',S1.attack,S1.TRAINERS,S1.ABILITIES),
  ('sm2',S2.attack,S2.TRAINERS,S2.ABILITIES),
  ('sm3',S3.attack,S3.TRAINERS,S3.ABILITIES)):
 rows=json.loads((ROOT/f'data/classic/{set_id}-print-compact.json').read_text())
 for row in rows:
  for a in row[7]:
   eff=parser(row,a)
   if eff is not None and eff.get('type')!='unsupported':
    EXACT_ATTACKS[(a[0],tuple(a[1]),a[2],norm(a[3]))]=deepcopy(eff)
  for a in row[8]:
   if a[0] in abs_:EXACT_ABILITIES[(a[0],norm(a[2]))]=deepcopy(abs_[a[0]])
  if row[2]=='Trainer' and str(row[0]) in trs:
   EXACT_TRAINERS[(row[1],norm(' '.join(row[13] or [])))]=deepcopy(trs[str(row[0])])

ATTACK_TEXT={}
ATTACK_MAP={}
ABILITIES={}
TRAINERS={}
BASIC={'124':'Water'}
ENERGIES={}

def attack(row,a):
 title,cost,dmg,printed=a
 if not norm(printed):return N
 key=(title,tuple(cost),dmg,norm(printed))
 if key in EXACT_ATTACKS:return deepcopy(EXACT_ATTACKS[key])
 if title in ATTACK_MAP and norm(ATTACK_TEXT[title]) in norm(printed):return deepcopy(ATTACK_MAP[title])
 # Generic parser is independent of the SM4 collector number; its unknown
 # rules return None. Same title alone is never sufficient proof.
 pseudo=['_sm4_generic_',*row[1:]]
 candidate=generic_attack(pseudo,a)
 return deepcopy(candidate) if candidate and candidate.get('type')!='unsupported' else None

rows=json.loads((ROOT/'data/classic/sm4-print-compact.json').read_text())
for row in rows:
 if row[2]=='Trainer':
  key=(row[1],norm(' '.join(row[13] or [])))
  if key in EXACT_TRAINERS:TRAINERS[str(row[0])]=deepcopy(EXACT_TRAINERS[key])
 for title,abi_type,printed in row[8]:
  key=(title,norm(printed))
  if key in EXACT_ABILITIES:ABILITIES[title]=deepcopy(EXACT_ABILITIES[key])

# Stage 1: independently inspected printed rules using existing, tested engine
# descriptors. The exact pinned text is still matched at the attack call site.
from sm1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
SM4_SIMPLE={
'Sucker Punch':BONUS(30,{'type':'selfHasEnergyType','energyType':'Darkness'}),
'Spike Rend':BONUS(60,{'type':'opponentDamaged'}),
'Hunt':S(E('forceOpponentSwitch',chooseBy='attacker',timing='beforeDamage'),E('damage',target='opponentActive',amount=40)),
'Recover':E('discardHeal',amount=1,target='self',heal=9999),
'Continuous Headbutt':None,
'Rest':S(ST('sleep','self'),H(90,'self')),
'Pika Draw':DRAW(1),
'Energy Catch':SEARCH(3,source='discard',kind='energy',basicEnergy=True),
'Ominous Eyes':E('placeDamageCounters',target='opponentPokemon',amount=10),
'Psych Up':E('nextAttackBonus',attackName='Psych Up',amount=60),
'Nasty Plot':SEARCH(2,kind='any'),
'Severe Poison':E('status',status='poison',target='opponentActive',counters=4),
'Fixer of the Forest':SEARCH(3,source='discard',kind='trainer',trainerType='Pokémon Tool'),
'Three-Step Strike':COIN(3,10),
'Earthquake':E('benchDamage',side='self',amount=10,all=True),
'Cross-Cut':BONUS(60,{'type':'opponentMatches','filter':{'evolved':True}}),
'Knuckle Impact':E('lock',action='attack',target='self',duration='nextOwnTurn'),
'Double Hit':COIN(2,60),
'Crunch':Q(DISC(1,'opponentActive')),
'Turbo Arm':E('attachEnergyFromDiscard',target='selfBench',amount=1,basicEnergy=True),
'Fury Attack':COIN(3,30),
'Double Slap':COIN(2,20),
'Lead':SEARCH(1,kind='trainer',trainerType='Supporter'),
'Bright Horns':E('lock',action='attack',target='self',attackName='Bright Horns',duration='nextOwnTurn'),
'Noble Roar':E('forceOpponentSwitch',chooseBy='defender'),
'Clanging Scales':E('modifier',stat='damageReduction',amount=-30,scope='self',duration='opponentTurn'),
'Cotton Guard':GUARD(30),
'Bug Search':E('revealHand',side='opponent'),
'Giant Stomp':E('discardStadium'),
'Dig':Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
'Hammer Arm':E('discardTop',side='opponent',amount=1),
'Armor Press':GUARD(30),
'Turbo Drive':E('attachEnergyFromDiscard',target='selfBench',amount=1,basicEnergy=True),
'Rebel-GX':E('benchCountDamage',side='opponent',amount=50,mode='replace'),
'Draconic Disaster':S(BONUS(100,{'type':'stadiumInPlay'}),E('discardStadium',condition={'type':'stadiumInPlay'})),
'Special Artillery':E('chooseDiscardForBonus',target='self',specialOnly=True,amount=1,bonus=80),
'Ink Spit':E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
'Waterfall Evolution':E('evolveFromDeck'),
'Bell of Silence':E('actionLock',cardType='AbilityPokemon',side='opponent',duration='opponentTurn'),
'War Cry':BONUS(90,{'type':'benchCountLess'}),
'Revenge Cannon':E('damageFromDamage',source='selfBench',amount=1,mode='add'),
'Spike Rend':BONUS(60,{'type':'opponentDamaged'}),
'Gale Blade':E('chooseOption',options=[{'label':'Shuffle this Pokémon into your deck','effect':E('shuffleIntoDeck',target='self',includeAttached=True)},{'label':'Do not shuffle','effect':N}]),
}
# Descriptors with unknown renderer semantics remain gated pending outcome tests.
for _name in ('Hunt','Severe Poison','Fixer of the Forest','Special Artillery','Bell of Silence','War Cry','Revenge Cannon','Gale Blade','Waterfall Evolution','Energy Catch','Clanging Scales'):
 SM4_SIMPLE.pop(_name,None)
ATTACK_MAP.update({n:d for n,d in SM4_SIMPLE.items() if d is not None})
for row in rows:
 for a in row[7]:
  name=a[0]
  if name in ATTACK_MAP:
   # A mapping is scoped to the full observed printed text, not name only.
   if name not in ATTACK_TEXT:ATTACK_TEXT[name]=a[3]
   elif norm(ATTACK_TEXT[name])!=norm(a[3]):
    ATTACK_MAP.pop(name,None);ATTACK_TEXT.pop(name,None)
# Explicit per-print headbutt damage multipliers.
CONTINUOUS={('13','Continuous Headbutt'):COIN('untilTails',30),('14','Continuous Headbutt'):COIN('untilTails',80)}
_PREVIOUS_ATTACK=attack
def attack(row,a):
 key=(str(row[0]),a[0])
 if key in CONTINUOUS and ('Flip a coin until you get tails.' in a[3]):return deepcopy(CONTINUOUS[key])
 return _PREVIOUS_ATTACK(row,a)

# Basic reactive and continuous Abilities whose modifiers are enforced by
# existing shared battle-core hooks. Genuinely novel event listeners stay gated.
ABILITIES.update({
 'Surge Surfer':{'type':'passive','effect':E('modifier',stat='retreatCost',amount=-99,scope='self',duration='whileInPlay',condition={'type':'stadiumInPlay'})},
 'Rock Peak Growl':{'type':'passive','effect':E('modifier',stat='attackDamage',amount=10,scope='team',duration='whileInPlay',filter={'name':'Registeel'})},
 'Gyro Unit':{'type':'passive','effect':E('modifier',stat='retreatCost',amount=-99,scope='team',duration='whileInPlay',filter={'stage':'Basic'})},
 'Submerge':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=999,scope='self',duration='whileInPlay',benchTargetsOnly=True)},
})

SM4_FOLLOWUP={
 'Double Claws':E('discardEnergyCard',target='opponentActive',amount=2),
 'Ocean Cyclone':E('benchDamage',side='opponent',amount=10,all=True),
 'Psychic':E('energyDamage',source='opponent',amount=20,mode='add'),
 'Dark Arts':E('handCountDamage',source='opponent',amount=20,mode='replace'),
 'Iron Hand':E('heal',target='self',amount=30,condition={'type':'pokemonPresent','zone':'selfBench','filter':{'name':'Regice'}}),
 'Turbo Arm':E('attachEnergyFromDiscard',target='selfBench',amount=1,basicEnergy=True),
 'Rebel-GX':E('benchCountDamage',side='opponent',amount=50,mode='replace'),
 'MamoswineDummy':N,
 'Clanging Scales':E('modifier',stat='damageReduction',amount=-30,scope='self',duration='opponentTurn'),
 'War Cry':E('fieldCountDamage',side='opponent',amount=90,mode='add',condition={'type':'benchCountLess'}),
 'Tropical Head':E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=20),
 'Bright Horns':E('lock',action='attack',target='self',attackName='Bright Horns',duration='nextOwnTurn'),
 'Burning Bonemerang':E('coinDamageStatus',coins=2,amount=70,condition='anyHeads',status='burn'),
 'Three-Step Strike':COIN(3,10),
 'Buster Swing':E('damageRule',ignoreResistance=True),
}
# Status-on-coins, optional reshuffle and conditional-GX outcomes require
# dedicated tests before promotion.
for _k in ('Iron Hand','War Cry','Clanging Scales','Burning Bonemerang','MamoswineDummy'):
 SM4_FOLLOWUP.pop(_k,None)
# Only promote when the canonical text has been checked against the exact
# selected descriptor at least once, not from a homonymous move.
for _name,_eff in SM4_FOLLOWUP.items():
 matches=[a[3] for row in rows for a in row[7] if a[0]==_name]
 if matches and len({norm(t) for t in matches})==1 and norm(matches[0]):
  ATTACK_TEXT[_name]=matches[0]
  ATTACK_MAP[_name]=_eff

# Gogoat's printed target-specific damage and Regice's Regirock gate need
# additional engine validation, so are deliberately still disabled.
# Undo mappings unsupported by effect validation or not yet outcome-proven.
ATTACK_MAP.pop('Recover',None)
