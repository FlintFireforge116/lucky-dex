"""Ultra Prism Stage 3: complete-print-locked GX and Ability outcomes.

All Stage 3 mappings match the full official text, not attack names alone.
Unknown Prism Star, Unit Energy, and choice-driven GX rules remain gated.
"""
from __future__ import annotations
import re
from copy import deepcopy

def E(t,**kw):return {'type':t,**kw}
def S(*children):return E('sequence',effects=list(children))
def norm(s):return re.sub(r'\s+',' ',s or '').strip().casefold()
def ST(s):return E('status',target='opponentActive',status=s)
def GATE():return E('attackRequirement',condition={'type':'ownPrizesMore'})
def AMT(t,amt,mode='add',**kw):return E(t,amount=amt,mode=mode,**kw)
# A full-text match, INCLUDING any GX parenthetical, is required.
ATTACKS={
 'Total Command':('This attack does 20 damage for each Benched Pokémon (both yours and your opponent\'s).',AMT('benchCountDamage',20,'replace',side='both')),
 'Whirlpool':('Discard an Energy from your opponent\'s Active Pokémon.',E('discardEnergyCard',target='opponentActive',amount=1)),
 'Burst Punch':('Your opponent\'s Active Pokémon is now Burned.',ST('burn')),
 'Dark Flash':('This attack\'s damage isn\'t affected by Resistance.',E('damageRule',ignoreResistance=True)),
 'Polar Spear-GX':('This attack does 50 damage for each damage counter on your opponent\'s Active Pokémon. (You can\'t use more than 1 GX attack in a game.)',AMT('damageFromDamage',5,'replace',source='opponent')),
 'Moon\'s Eclipse-GX':('You can use this attack only if you have more Prize cards remaining than your opponent. Prevent all effects of attacks, including damage, done to this Pokémon during your opponent\'s next turn. (You can\'t use more than 1 GX attack in a game.)',S(GATE(),E('preventDamage',target='self',duration='opponentTurn',preventEffects=True))),
 'Meteor Tempest':('Discard 3 Energy from this Pokémon.',E('discardEnergyCard',target='self',amount=3)),
 'Sun\'s Eclipse-GX':('You can use this attack only if you have more Prize cards remaining than your opponent. (You can\'t use more than 1 GX attack in a game.)',GATE()),
 'Missile Jab':('This attack\'s damage isn\'t affected by Resistance.',E('damageRule',ignoreResistance=True)),
 'Evil Admonition':('This attack does 50 damage for each of your opponent\'s Pokémon that has an Ability.',AMT('fieldCountDamage',50,'replace',side='opponent',filter={'hasAbility':True})),
 'Hydro Pressure':('This attack does 20 more damage times the amount of Water Energy attached to this Pokémon.',AMT('energyDamage',20,'add',source='self',energyType='Water')),
 'Rumbling Wires':('Discard the top card of your opponent\'s deck.',E('discardTop',side='opponent',amount=1)),
 'Rocket Fall':('This attack does 30 more damage for each Colorless in your opponent\'s Active Pokémon\'s Retreat Cost.',AMT('retreatCostDamage',30,'add')),
 'Cruel Spike':('Your opponent\'s Active Pokémon is now Confused.',ST('confusion')),
 'Beauty-GX':('This attack does 50 damage for each Prize card your opponent has taken. (You can\'t use more than 1 GX attack in a game.)',AMT('pointDamage',50,'replace',side='opponent',prizesTaken=True)),
 'Outrage':('This attack does 10 more damage for each damage counter on this Pokémon.',AMT('damageFromDamage',1,'add',source='self')),
 'Dragon Pulse':('Discard the top 2 cards of your deck.',E('discardTop',side='self',amount=2)),
 'Sunsteel Strike':('Discard all Energy from this Pokémon.',E('discardEnergyCard',target='self',amount='all')),
 'Psywave':('This attack does 20 damage times the amount of Energy attached to your opponent\'s Active Pokémon.',AMT('energyDamage',20,'replace',source='opponent')),
 'Wild Crash':('If your opponent\'s Active Pokémon is a Basic Pokémon, it is Knocked Out.',E('knockOut',target='opponentActive',condition={'type':'opponentMatches','filter':{'stage':'Basic'}})),
 'Wind Wheel':('Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.',E('forceOpponentSwitch',chooseBy='defender')),
 'Zap Cannon':('This Pokémon can\'t use Zap Cannon during your next turn.',E('lock',action='attack',target='self',attackName='Zap Cannon',duration='nextOwnTurn')),
}
# Some abilities can safely reuse existing activated and passive effect hooks.
ABILITIES={
 'Breath of the Leaves':('If this Pokémon is your Active Pokémon, once during your turn (before your attack), you may heal 50 damage from 1 of your Pokémon that has any Energy attached to it.',{'type':'activated','oncePerTurn':True,'effect':E('chooseTarget',target='selfPokemon',filter={'hasAnyEnergy':True},effect=E('heal',target='selfPokemon',amount=50))}),
 'Illuminate':('Once during your turn (before your attack), you may search your deck for a Fairy Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.',{'type':'activated','oncePerTurn':True,'effect':E('searchChosen',amount=1,filter={'kind':'pokemon','subtype':'Fairy'})}),
 'Precognitive Aura':('Once during your turn (before your attack), if you have Garchomp in play, you may search your deck for a card and put it into your hand. Then, shuffle your deck.',{'type':'activated','oncePerTurn':True,'effect':E('searchChosen',amount=1,filter={'kind':['pokemon','trainer','energy']},condition={'type':'pokemonPresent','zone':'inPlay','filter':{'name':'Garchomp'}})}),
}
# Fossil uses the existing special Basic-Item placement pipeline.
TRAINERS={
 'Unidentified Fossil':('Item',E('playFossil',hp=60,subtype='Colorless',canRetreat=False)),
}
TRAINER_RULES={
 'Unidentified Fossil':('Play this card as if it were a 60-HP Colorless Basic Pokémon. At any time during your turn (before your attack), you may discard this card from play.','This card can\'t retreat.'),
}

def attack(row,a):
 match=ATTACKS.get(a[0]);return deepcopy(match[1]) if match and norm(a[3])==norm(match[0]) else None

def ability(row,a):
 match=ABILITIES.get(a[0]);return deepcopy(match[1]) if match and norm(a[2])==norm(match[0]) else None

def trainer(row):
 match=TRAINERS.get(row[1]);rules=TRAINER_RULES.get(row[1]);text=norm(' '.join(row[13] or []))
 if match and rules and all(norm(t) in text for t in rules):return deepcopy(match)
 return None
