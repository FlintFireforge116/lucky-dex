"""SM5 Stage 12: remaining physical Prize, evolution, Energy and burn rules.

Every mapping is opt-in on the SHA-pinned official printed text. Do not
mark a card usable when any other printed attack/Ability is unsupported.
"""
from copy import deepcopy
import re
N=lambda s:re.sub(r'\s+',' ',str(s or '')).strip().casefold()
E=lambda rule:{'type':'sm5Rule','rule':rule}
ATTACKS={
 'Volt Bolt':('Discard all Lightning Energy from this Pokémon. This attack does 150 damage to 1 of your opponent\'s Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)',
     {'type':'sequence','effects':[{'type':'selectedDamage','target':'opponentPokemon','amount':150},{'type':'discardEnergyCard','target':'self','energyType':'Lightning','strictEnergyType':True,'amount':'all'}]}),
 'Exeggutor\'s Paradise':('For each of your Benched Exeggcute, search your deck for an Alolan Exeggutor or Alolan Exeggutor-GX and put it onto that Exeggcute to evolve it. Then, shuffle your deck.',E('exeggutorsParadise')),
}
ABILITIES={
 'Flaming Fighter':('Put 6 damage counters instead of 2 on your opponent\'s Burned Pokémon between turns.',
     {'type':'passive','effect':E('flamingFighter')}),
}
TRAINERS={
 'Missing Clover':('Item',E('missingClover')),
}
TRAINER_RULES={
 'Missing Clover':('You may play 4 Missing Clover cards at once.', 'If you played 1 card, look at the top card of your deck.', 'If you played 4 cards, take a Prize card.'),
}
def attack(row,a):
    x=ATTACKS.get(a[0]);return deepcopy(x[1]) if x and N(a[3])==N(x[0]) else None
def ability(row,a):
    x=ABILITIES.get(a[0]);return deepcopy(x[1]) if x and N(a[2])==N(x[0]) else None
def trainer(row):
    x=TRAINERS.get(row[1]);req=TRAINER_RULES.get(row[1]);txt=N(' '.join(row[13] or []))
    return deepcopy(x) if row[2]=='Trainer' and x and req and all(N(part) in txt for part in req) else None
