"""Ultra Prism Stage 6, text-locked additional GX/attack/Ability and Trainer effects.

The official printed text is matched verbatim (whitespace-normalised). Each
mapping is opt-in; unsupported or changed cards remain gated by build-sm5.py.
"""
from copy import deepcopy
import re

def E(name, **kw): return {'type':name, **kw}
def norm(s): return re.sub(r'\s+', ' ', str(s or '')).strip().casefold()

ATTACKS = {
 'Frost Bullet': ("This attack does 30 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)", E('benchDamage', side='opponent', amount=30)),
 'Wash Arrow': ("This attack does 50 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)", E('selectedDamage', target='opponentBench', amount=50)),
 'Frost Crush': ("This attack does 20 more damage times the amount of Energy attached to all of your opponent's Pokémon.", E('energyDamage', source='opponent', all=True, amount=20, mode='add')),
 'Rebel-GX': ("This attack does 50 damage for each of your opponent's Benched Pokémon. (You can't use more than 1 GX attack in a game.)", E('benchCountDamage', side='opponent', amount=50, mode='replace')),
 'Flickering Spores': ("Your opponent's Active Pokémon is now Asleep.", E('status', target='opponentActive', status='sleep')),
 'Psychic': ("This attack does 20 more damage times the amount of Energy attached to your opponent's Active Pokémon.", E('energyDamage', source='opponent', amount=20, mode='add')),
 'Moongeist Beam': ("The Defending Pokémon can't be healed during your opponent's next turn.", E('healingBlock', target='opponentActive', duration='opponentTurn')),
 'Push Down': ("You may have your opponent switch their Active Pokémon with 1 of their Benched Pokémon.", E('chooseOption', options=[{'label':'Switch the opponent', 'effect':E('forceOpponentSwitch', chooseBy='defender')},{'label':'Do not switch', 'effect':E('noop')} ])),
 'Lunar Fall-GX': ("Knock Out 1 of your opponent's Basic Pokémon that isn't a Pokémon-GX. (You can't use more than 1 GX attack in a game.)", E('sm5Rule', rule='lunarFall')),
 'Special Mow': ("Discard a Special Energy from your opponent's Active Pokémon.", E('sm5Rule', rule='specialMow')),
}

ABILITIES = {
 'Invasion': ("Once during your turn (before your attack), if this Pokémon is on your Bench, you may switch it with your Active Pokémon.", {'type':'activated','oncePerTurn':True,'benchOnly':True,'effect':E('switch',source='ability')}),
 'Ultra Road': ("Once during your turn (before your attack), you may switch your Active Pokémon with 1 of your Benched Pokémon.", {'type':'activated','oncePerTurn':True,'effect':E('switch')}),
 'Gyro Unit': ("Your Basic Pokémon in play have no Retreat Cost.", {'type':'passive','effect':E('modifier', stat='retreatCost',amount=-999, scope='team', duration='whileInPlay',filter={'stage':'Basic'})}),
 'Magnetic Circuit': ("As often as you like during your turn (before your attack), you may attach a Metal Energy card from your hand to 1 of your Pokémon.", {'type':'activated','oncePerTurn':False,'requiresBasicEnergyFromHand':'Metal','effect':E('chooseTarget',target='selfPokemon',effect=E('attachEnergy',source='hand',amount=1,energyType='Metal',target='selfPokemon'))}),
 'Roto Motor': ("If you have 9 or more Pokémon Tool cards in your discard pile, ignore all Energy in the attack cost of each of this Pokémon's attacks.", {'type':'passive','effect':E('conditionalAttackCost',cost='')}),
 'Freezing Gaze': ("As long as this Pokémon is your Active Pokémon, your opponent's Pokémon-GX and Pokémon-EX in play, in their hand, and in their discard pile have no Abilities, except for Freezing Gaze.", {'type':'passive','activeOnly':True,'effect':E('abilitySuppression', duration='whileActive',scope='opponent',filter={'isExOrGX':True})}),
}

TRAINERS = {
 'Pal Pad': ('Item', E('sm5Rule', rule='palPad')),
}
TRAINER_RULES = {
 'Pal Pad': ('Shuffle 2 Supporter cards from your discard pile into your deck.',),
}

def attack(row, a):
    entry=ATTACKS.get(a[0]);return deepcopy(entry[1]) if entry and norm(a[3])==norm(entry[0]) else None

def ability(row, a):
    entry=ABILITIES.get(a[0]);return deepcopy(entry[1]) if entry and norm(a[2])==norm(entry[0]) else None

def trainer(row):
    entry=TRAINERS.get(row[1]);req=TRAINER_RULES.get(row[1]);rules=norm(' '.join(row[13] or []))
    return deepcopy(entry) if row[2]=='Trainer' and entry and req and all(norm(t) in rules for t in req) else None
