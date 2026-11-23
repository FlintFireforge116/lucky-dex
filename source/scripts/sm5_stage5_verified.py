"""Ultra Prism Stage 5: exact-print verified five non-Energy Prism Stars.

Every card remains gated unless its full printed action and/or Ability matches
exactly; no name-only parser, missing mechanics or fake Energy-zone substitutions.
"""
import re
from copy import deepcopy

def norm(s):return re.sub(r'\s+',' ',str(s or '')).strip().casefold()
def E(t,**kw):return {'type':t,**kw}

ATTACKS={
 'Crisis Dive': ('Discard 2 Energy from this Pokémon.', E('discardEnergyCard',target='self',amount=2)),
 'Full Moon Star': ("For each of your opponent's Pokémon in play, attach a Psychic Energy card from your discard pile to your Pokémon in any way you like.", E('sm5Rule',rule='prismDiscardEnergy',energyType='Psychic')),
 'Psystorm': ('This attack does 20 damage times the amount of Energy attached to all Pokémon.', E('energyDamage',amount=20,mode='replace',source='both',allInPlay=True,countCards=True)),
 'Abyssal Sleep': ("Your opponent's Active Pokémon is now Asleep. Your opponent flips 2 coins instead of 1 between turns. If either of them is tails, that Pokémon is still Asleep.", E('status',target='opponentActive',status='sleep',recoveryCoins=2)),
 'Radiant Star': ("For each of your opponent's Pokémon in play, attach a Metal Energy card from your discard pile to your Pokémon in any way you like.", E('sm5Rule',rule='prismDiscardEnergy',energyType='Metal')),
 'Corona Impact': ("This Pokémon can't attack during your next turn.", E('lock',action='attack',target='self',duration='nextOwnTurn')),
}
ABILITIES={
 'Chaotic Star': ('When you play this Pokémon from your hand onto your Bench during your turn, you may attach 2 Psychic Energy cards from your hand to it.', {'type':'triggered','event':'benched','fromHandOnly':True,'effect':E('sm5Rule',rule='prismHandEnergy',energyType='Psychic',amount=2)}),
 'Nightmare Star': ('When you play this Pokémon from your hand onto your Bench during your turn, you may attach 2 Darkness Energy cards from your hand to it.', {'type':'triggered','event':'benched','fromHandOnly':True,'effect':E('sm5Rule',rule='prismHandEnergy',energyType='Darkness',amount=2)}),
}
TRAINERS={
 'Cyrus ◇': ('Supporter', E('sm5Rule',rule='cyrusPrism')),
}
TRAINER_RULES={
 'Cyrus ◇': ('You can play this card only if your Active Pokémon is a Water or Metal Pokémon.', "Your opponent chooses 2 Benched Pokémon and shuffles the others, and all cards attached to them, into their deck."),
}

PRISM_PRINTS={'58':'Giratina ◇','62':'Lunala ◇','77':'Darkrai ◇','89':'Solgaleo ◇','120':'Cyrus ◇'}

def attack(row,a):
 entry=ATTACKS.get(a[0]);return deepcopy(entry[1]) if entry and norm(a[3])==norm(entry[0]) else None

def ability(row,a):
 entry=ABILITIES.get(a[0]);return deepcopy(entry[1]) if entry and norm(a[2])==norm(entry[0]) else None

def trainer(row):
 entry=TRAINERS.get(row[1]);req=TRAINER_RULES.get(row[1]);text=norm(' '.join(row[13] or []))
 if entry and req and all(norm(s) in text for s in req):return deepcopy(entry)
 return None

def prism_ready(row):
 if str(row[0]) not in PRISM_PRINTS or row[1]!=PRISM_PRINTS[str(row[0])]:return False
 if row[2]=='Trainer':return trainer(row) is not None
 return bool(row[7]) and all(attack(row,a) is not None for a in row[7]) and all(ability(row,a) is not None for a in row[8])
