"""SM5 Stage 11: canonical-text locked mechanics, no permissive fallback."""
from copy import deepcopy
import re

def N(s):return re.sub(r'\s+',' ',str(s or '')).strip().casefold()
def E(rule):return {'type':'sm5Rule','rule':rule}
ATTACKS={
 'Dust Cannon':("This attack does 10 more damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.",{'type':'retreatCostDamage','amount':10,'mode':'add'}),
 'Draco Meteor Barrage':('Flip a coin for each Grass Energy attached to this Pokémon. This attack does 80 damage for each heads.',{'type':'coinDamageByEnergy','energyType':'Grass','amount':80,'countAttachedEnergyType':True,'mode':'replace'}),
 'Iron Head':('Flip a coin until you get tails. This attack does 10 damage for each heads.',{'type':'coinDamage','coins':'untilTails','amount':10,'mode':'replace'}),
 'Spike Armor':("During your opponent's next turn, if this Pokémon is damaged by an attack (even if this Pokémon is Knocked Out), put 6 damage counters on the Attacking Pokémon.",{'type':'retaliateDamage','target':'self','duration':'opponentTurn','amount':60}),
 'Hone Claws':("During your next turn, this Pokémon's Pierce attack's base damage is 90.",{'type':'nextAttackBonus','attackName':'Pierce','amount':60}),
 'Weak Kneed':("If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing.",{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'}),
 'Sticky Smokescreen':("If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips 2 coins. If either of them is tails, that attack does nothing.",E('stickySmokescreen')),
 'Exact Revenge':("If any of your Fighting Pokémon were Knocked Out by damage from an opponent's attack during their last turn, this attack does 70 more damage.",E('exactRevenge')),
 'Own the Place':("If your opponent has a Stadium card in play, discard it. If you do, prevent all effects of attacks, including damage, done to this Pokémon during your opponent's next turn.",E('ownThePlace')),
 'Dangerous Lick':("Flip a coin until you get tails. This attack does 50 more damage for each heads. If the first flip is tails, your opponent's Active Pokémon is now Paralyzed.",E('dangerousLick')),
 'Coax':('Search your deck for up to 3 Basic Pokémon of different types and put them onto your Bench. Then, shuffle your deck.',E('coax')),
 'Snuggly Generator':('For each of your Benched Pokémon that has the Nuzzle attack, search your deck for a Lightning Energy card and attach it to that Pokémon. Then, shuffle your deck.',E('snugglyGenerator')),
 'Flower Tornado':('Move any number of Grass Energy from your Pokémon to your other Pokémon in any way you like.',E('flowerTornado')),
 'Magical Swap':("Move any number of damage counters on your opponent's Pokémon to their other Pokémon in any way you like.",E('magicalSwap')),
}
def attack(row, a):
 q=ATTACKS.get(a[0]);return deepcopy(q[1]) if q and N(q[0])==N(a[3]) else None
