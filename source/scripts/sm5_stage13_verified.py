"""SM5 Stage 13: exact-text locked remaining attack behaviour.

The six mappings here do not silently delegate missing clauses to a generic
adapter. Turbo Drive uses the physical discard and the discarded-Basic ledger;
no fresh Energy-Zone card can be attached by it.
"""
from copy import deepcopy
import re

def N(s): return re.sub(r'\s+', ' ', str(s or '')).strip().casefold()
def E(rule): return {'type':'sm5Rule','rule':rule}
ATTACKS={
 'Fury Swipes':('Flip 3 coins. This attack does 10 damage for each heads.',{'type':'coinDamage','coins':3,'amount':10,'mode':'replace'}),
 'Splatter':("This attack does 20 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",{'type':'selectedDamage','target':'opponentPokemon','amount':20}),
 'Agility':("Flip a coin. If heads, prevent all effects of attacks, including damage, done to this Pokémon during your opponent's next turn.",{'type':'coinFlip','heads':{'type':'preventDamage','target':'self','duration':'opponentTurn','preventEffects':True},'tails':{'type':'noop'}}),
 'Slam':('Flip 2 coins. This attack does 50 damage for each heads.',{'type':'coinDamage','coins':2,'amount':50,'mode':'replace'}),
 'Turbo Drive':('Attach a basic Energy card from your discard pile to 1 of your Benched Pokémon.',E('turboDrive')),
 'Fast Raid':('If you go first, you can use this attack on your first turn.',E('fastRaid')),
}
def attack(row,a):
    entry=ATTACKS.get(a[0]);return deepcopy(entry[1]) if entry and N(a[3])==N(entry[0]) else None
