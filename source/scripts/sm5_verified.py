"""Ultra Prism SM5: strict printed-effect reuse, no optimistic dummy mechanics.

Every effect is either an exact previous-print match, a narrowly verified
shape of a generic engine descriptor, or an explicitly gated blocker.
"""
from __future__ import annotations
import json,re
from pathlib import Path
from copy import deepcopy
import sm1_verified as S1, sm2_verified as S2, sm3_verified as S3, sm4_verified as S4
from xy8_verified import attack as generic_attack
ROOT=Path(__file__).resolve().parents[1]
E=lambda name,**kw:{'type':name,**kw}
N=E('noop')
def norm(s):
 s=re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)','',s or '',flags=re.I)
 return re.sub(r'\s+',' ',s).strip().casefold()
ATTACKS={};TRAINERS={};ABILITIES={}
for sid,parser,tr,ab in [('sm1',S1.attack,S1.TRAINERS,S1.ABILITIES),('sm2',S2.attack,S2.TRAINERS,S2.ABILITIES),('sm3',S3.attack,S3.TRAINERS,S3.ABILITIES),('sm4',S4.attack,S4.TRAINERS,S4.ABILITIES)]:
 for row in json.loads((ROOT/f'data/classic/{sid}-print-compact.json').read_text()):
  for a in row[7]:
   eff=parser(row,a)
   if eff is not None and eff.get('type')!='unsupported':
    ATTACKS[(a[0],tuple(a[1]),a[2],norm(a[3]))]=deepcopy(eff)
  for a in row[8]:
   if a[0] in ab:ABILITIES[(a[0],norm(a[2]))]=deepcopy(ab[a[0]])
  if row[2]=='Trainer' and str(row[0]) in tr:
   TRAINERS[(row[1],norm(' '.join(row[13] or [])))]=deepcopy(tr[str(row[0])])

# Name + exact printed-text guard prevents same-named attacks with different
# rules from accidentally inheriting a previous expansion's effect.
ATTACK_OVERRIDES={
 'Continuous Eggsplosion':('Flip a coin until you get tails. This attack does 20 damage for each heads.',E('coinDamage',coins='untilTails',amount=20,mode='replace')),
 'Inviting Poison':("Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. The new Active Pokémon is now Poisoned.",E('sequence',effects=[E('forceOpponentSwitch',chooseBy='attacker'),E('status',status='poison',target='opponentActive')])),
 'Petal Dance':('Flip 3 coins. This attack does 30 damage for each heads. This Pokémon is now Confused.',E('sequence',effects=[E('coinDamage',coins=3,amount=30),E('status',target='self',status='confusion')])),
}

def attack(row,a):
 title,cost,damage,printed=a
 if not norm(printed):return deepcopy(N)
 entry=ATTACK_OVERRIDES.get(title)
 if entry and norm(entry[0])==norm(printed):return deepcopy(entry[1])
 key=(title,tuple(cost),damage,norm(printed))
 if key in ATTACKS:return deepcopy(ATTACKS[key])
 # Use generic adapter only if it explicitly understands the effect, never
 # if it silently drops clauses and leaves a fake no-op for a printed effect.
 candidate=generic_attack(['_sm5_generic_',*row[1:]],a)
 if candidate is None or candidate.get('type') in ('unsupported','noop'):return None
 return deepcopy(candidate)

def ability(row,a):
 key=(a[0],norm(a[2]))
 if key in ABILITIES:return deepcopy(ABILITIES[key])
 # Bench protection uses the already-tested SM4 Submerge passive.
 if a[0]=='Solid Unit' and norm(a[2])==norm('As long as this Pokémon is on your Bench, prevent all damage done to this Pokémon by attacks (both yours and your opponent\'s).'):
  return {'type':'passive','effect':E('modifier',stat='damageReduction',amount=999,scope='self',duration='whileInPlay',benchTargetsOnly=True)}
 if a[0]=='Water Bubble' and norm(a[2])==norm("Prevent all damage done to this Pokémon by attacks from your opponent's Fire Pokémon."):
  return {'type':'passive','effect':E('modifier',stat='damageReduction',amount=999,scope='self',duration='whileInPlay',opponentFilter={'subtype':'Fire'})}
 return None

def trainer(row):
 key=(row[1],norm(' '.join(row[13] or [])))
 return deepcopy(TRAINERS[key]) if key in TRAINERS else None

def energy(row):
 # Both Unit Energy types and Super Boost Energy Prism Star need bespoke
 # runtime handling. Providing all three types at once would be incorrect.
 return None
