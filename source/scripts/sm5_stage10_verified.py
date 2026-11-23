"""Ultra Prism Stage 10: pinned-print opt-in mechanics; no placeholders."""
from copy import deepcopy
import re

def n(s): return re.sub(r'\s+', ' ', str(s or '')).strip().casefold()
def e(rule):return {'type':'sm5Rule','rule':rule}
ATTACKS={
 'Timeless-GX':("Take another turn after this one. (Skip the between-turns step.) (You can't use more than 1 GX attack in a game.)",e('timelessGX')),
 'Zero Vanish-GX':("Shuffle all Energy from each of your opponent's Pokémon into their deck. (You can't use more than 1 GX attack in a game.)",e('zeroVanishGX')),
 'Sol Burst-GX':("Search your deck for up to 5 Energy cards and attach them to your Pokémon in any way you like. Then, shuffle your deck. (You can't use more than 1 GX attack in a game.)",e('solBurstGX')),
 'Spatial Control':('Move any number of Energy from your Benched Pokémon to this Pokémon.',e('spatialControl')),
 'Fire Blaster':('You may discard 2 Energy from this Pokémon. If you do, this attack does 80 more damage.',e('fireBlaster')),
 'Happy Turn':('You may shuffle this Pokémon and all cards attached to it into your deck.',e('happyTurn')),
}
ABILITIES={
 'Psychic Transfer':('As often as you like during your turn (before your attack), you may move a Psychic Energy from 1 of your Pokémon to another of your Pokémon.',{'type':'activated','oncePerTurn':False,'effect':e('psychicTransfer')}),
 'Blessings of the Frost':('When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may attach a Water Energy card from your discard pile to 1 of your Pokémon.',{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':e('blessingsFrost')}),
}
TRAINERS={
 'Ancient Crystal':('Pokémon Tool',e('ancientCrystal')),
}
TRAINER_RULES={
 'Ancient Crystal':('The Regirock, Regice, Registeel, or Regigigas this card is attached to takes 30 less damage from your opponent\'s attacks (after applying Weakness and Resistance).',),
}
def attack(row,a):
 q=ATTACKS.get(a[0]);return deepcopy(q[1]) if q and n(q[0])==n(a[3]) else None
def ability(row,a):
 q=ABILITIES.get(a[0]);return deepcopy(q[1]) if q and n(q[0])==n(a[2]) else None
def trainer(row):
 q=TRAINERS.get(row[1]);t=n(' '.join(row[13] or []));r=TRAINER_RULES.get(row[1]);return deepcopy(q) if row[2]=='Trainer' and q and r and all(n(x) in t for x in r) else None
