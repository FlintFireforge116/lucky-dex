"""Ultra Prism Stage 4: individual Unit Energy cards and conditional Prism Boost.

Each exact official row is checked before enabling. Full Prism Star gameplay is
required separately from the energy descriptor; generated cards retain their
printed one-per-deck and Lost Zone flags.
"""
from __future__ import annotations
import re
from copy import deepcopy

def norm(x):return re.sub(r'\s+',' ',str(x or '')).strip().casefold()

ENERGY={
 'Unit Energy GrassFireWater':('While this card is attached to a Pokémon, it provides Grass, Fire, and Water Energy but provides only 1 Energy at a time.', {'type':'specialEnergy','provides':{'Colorless':1}}),
 'Unit Energy LightningPsychicMetal':('While this card is attached to a Pokémon, it provides Lightning, Psychic, and Metal Energy but provides only 1 Energy at a time.', {'type':'specialEnergy','provides':{'Colorless':1}}),
 'Super Boost Energy ◇':('While this card is attached to a Stage 2 Pokémon, it provides every type of Energy but provides only 1 Energy at a time. If you have 3 or more Stage 2 Pokémon in play, it provides every type of Energy but provides 4 Energy at a time.', {'type':'specialEnergy','provides':{'Colorless':1}}),
}

def energy(row):
 if row[2]!='Energy' or row[1] not in ENERGY:return None
 text=norm(' '.join(row[13] or []))
 if norm(ENERGY[row[1]][0]) not in text:return None
 return deepcopy(ENERGY[row[1]][1])

ABILITIES={
 'Intimidating Fang':("As long as this Pokémon is your Active Pokémon, your opponent's Active Pokémon's attacks do 30 less damage (before applying Weakness and Resistance).",{'type':'passive','activeOnly':True,'effect':{'type':'modifier','stat':'attackDamage','amount':-30,'scope':'opponentActive','duration':'whileInPlay'}}),
 'Power Huddle':("As long as this Pokémon is on your Bench, your Passimian's attacks do 30 more damage to your opponent's Active Evolution Pokémon (before applying Weakness and Resistance).",{'type':'passive','benchOnly':True,'effect':{'type':'modifier','stat':'attackDamage','amount':30,'scope':'team','duration':'whileInPlay','filter':{'name':'Passimian'},'opponentFilter':{'evolved':True}}}),
 'Flashing Head':("Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon that have any Special Energy attached to them.",{'type':'passive','effect':{'type':'modifier','stat':'damageReduction','amount':999,'scope':'self','duration':'whileInPlay','opponentFilter':{'hasSpecialEnergy':True}}}),
 'Earthen Shield':("Prevent all damage done to your Metal Pokémon by attacks from your opponent's Pokémon that have any Special Energy attached to them.",{'type':'passive','effect':{'type':'modifier','stat':'damageReduction','amount':999,'scope':'team','duration':'whileInPlay','filter':{'subtype':'Metal'},'opponentFilter':{'hasSpecialEnergy':True}}}),
}

def ability(row,a):
 if a[0] not in ABILITIES:return None
 printed,descriptor=ABILITIES[a[0]]
 return deepcopy(descriptor) if norm(printed)==norm(a[2]) else None
