"""Ultra Prism Stage 9. Printed-text locked effects, never name-only enablement."""
from copy import deepcopy
import re

def n(x):return re.sub(r'\s+',' ',str(x or '')).strip().casefold()
def e(t,**kw):return {'type':t,**kw}
def seq(*es):return e('sequence',effects=list(es))
A={
 'Chomp Chomp':('Heal 20 damage from this Pokémon.',e('healSelf',amount=20)),
 'Earthquake':("This attack does 20 damage to each of your Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",e('benchDamage',side='self',all=True,amount=20)),
 'Surprise Attack':('Flip a coin. If tails, this attack does nothing.',e('coinDamage',coins=1,amount=30,mode='replace')),
 'Loom Over':('This attack does 10 less damage for each damage counter on this Pokémon.',e('sm5Rule',rule='loomOver')),
 'Roar':("Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.",e('forceOpponentSwitch',chooseBy='defender')),
 'Controlled Burn':("Discard the top card of your opponent's deck.",e('discardTop',side='opponent',amount=1)),
 'Flamethrower':('Discard an Energy from this Pokémon.',e('discardEnergyCard',target='self',amount=1)),
 'Super Singe':("Your opponent's Active Pokémon is now Burned.",e('status',target='opponentActive',status='burn')),
 'Bubble Beam':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",e('coinFlip',heads=e('status',target='opponentActive',status='paralysis'),tails=e('noop'))),
 'Ice Shard':("If your opponent's Active Pokémon is a Fighting Pokémon, this attack does 40 more damage.",e('sm5Rule',rule='iceShard')),
 'Thunder':('This Pokémon does 30 damage to itself.',e('selfDamage',amount=30)),
 'Deep Currents':('Shuffle 5 Water Energy cards from your discard pile into your deck.',e('sm5Rule',rule='deepCurrents')),
 'Steel Short':("If your opponent's Active Pokémon is a Metal Pokémon, it is now Paralyzed.",e('status',target='opponentActive',status='paralysis',condition={'type':'opponentMatches','filter':{'subtype':'Metal'}})),
 'Creepy Wind':("Your opponent's Active Pokémon is now Confused.",e('status',target='opponentActive',status='confusion')),
 'Dangerous Stinger':("Your opponent's Active Pokémon is now Paralyzed and Poisoned.",seq(e('status',target='opponentActive',status='paralysis'),e('status',target='opponentActive',status='poison'))),
 'Hypnosis':("Your opponent's Active Pokémon is now Asleep.",e('status',target='opponentActive',status='sleep')),
 'Guard Press':('During your opponent\'s next turn, this Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).',e('modifier',stat='damageReduction',amount=30,scope='self',duration='opponentTurn')),
 'Boiling Impact':('Discard 2 Energy from this Pokémon.',e('discardEnergyCard',target='self',amount=2)),
 'Psychic Resonance':('If your opponent has any Psychic Pokémon in play, this attack does 60 more damage.',e('sm5Rule',rule='psychicResonance')),
 'Merciless Strike':("If your opponent's Active Pokémon already has any damage counters on it, this attack does 30 more damage.",e('sm5Rule',rule='mercilessStrike')),
 'Identify':('Your opponent reveals their hand. If you find a Pokémon there, this attack does 80 more damage.',e('sm5Rule',rule='identify')),
 'Lap Up':('Draw 3 cards.',e('draw',amount=3)),
 'Call for Family':('Search your deck for up to 2 Basic Pokémon and put them onto your Bench. Then, shuffle your deck.',e('benchFromDeck',amount=2,filter={'stage':'Basic'})),
 'Resource Management':('Put 3 cards from your discard pile on the bottom of your deck in any order.',e('sm5Rule',rule='resourceManagement')),
 'Giga Drain':("Heal from this Pokémon the same amount of damage you did to your opponent's Active Pokémon.",e('sm5Rule',rule='gigaDrain')),
 'Sneaky Smash':('You can use this attack only if you go second, and only on your first turn. Discard an Energy from 1 of your opponent\'s Pokémon.',e('sm5Rule',rule='sneakySmash')),
 'Palette of Friends':('This attack does 10 damage for each different type of Pokémon on your Bench.',e('sm5Rule',rule='paletteOfFriends')),
}

def attack(row,a):
 x=A.get(a[0]);return deepcopy(x[1]) if x and n(a[3])==n(x[0]) else None
