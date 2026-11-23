"""Stage 7: exact-print-locked SM5 battle mappings; no optimistic enabling."""
from copy import deepcopy
import re

def N(s):return re.sub(r'\s+',' ',str(s or '')).strip().casefold()
def E(t,**kw):return {'type':t,**kw}
def S(*args):return E('sequence',effects=list(args))
ATTACKS={
 'Quick Dive':("This attack does 50 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",E('selectedDamage',target='opponentPokemon',amount=50)),
 'Psywave':("This attack does 20 damage times the amount of Energy attached to your opponent's Active Pokémon.",E('energyDamage',source='opponent',amount=20,mode='replace')),
 'Rumbling Wires':("Discard the top card of your opponent's deck.",E('discardTop',amount=1,side='opponent')),
 'Dragon Pulse':("Discard the top 2 cards of your deck.",E('discardTop',amount=2,side='self')),
 'Rocket Fall':("This attack does 30 more damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.",E('retreatCostDamage',amount=30,mode='add')),
 'Evil Admonition':("This attack does 50 damage for each of your opponent's Pokémon that has an Ability.",E('fieldCountDamage',side='opponent',amount=50,mode='replace',filter={'hasAbility':True})),
 'Spinning Fan':("This attack does 20 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",S(E('bonusDamage',amount=20,mode='replace'),E('benchDamage',side='opponent',all=True,amount=20))),
 'Toss Aside':("Discard random cards from your opponent's hand until they have 3 cards in their hand.",E('trimHand',side='opponent',maxSize=3)),
 'Swagger':("Flip a coin. If heads, discard an Energy from your opponent's Active Pokémon.",E('coinFlip',heads=E('discardEnergyCard',target='opponentActive',amount=1),tails=E('noop'))),
 'Rip and Run':("Discard a random card from your opponent's hand. Switch this Pokémon with 1 of your Benched Pokémon.",S(E('discardHand',side='opponent',amount=1),E('switch'))),
 'Wind Wheel':("Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.",E('forceOpponentSwitch',chooseBy='defender')),
 'Damage Transport':("Move 4 damage counters from each of your Pokémon to your opponent's Active Pokémon.",E('sm5Rule',rule='damageTransport')),
 'Lunar Payback':("Discard an Energy from this Pokémon. If you do, switch all damage counters on this Pokémon with those on your opponent's Active Pokémon.",E('sm5Rule',rule='lunarPayback')),
}
TRAINERS={
 'Peeking Red Card':('Item',S(E('revealHand',side='opponent'),E('chooseOption',options=[{'label':'Shuffle and redraw their hand', 'effect':E('handShuffle',side='opponent',draw='same')},{'label':'Leave their hand unchanged','effect':E('noop')}]))),
}
TRAINER_RULES={
 'Peeking Red Card':("Your opponent reveals their hand. You may have your opponent count the cards in their hand, shuffle those cards into their deck, then draw that many cards.",),
}

def attack(row,a):
 entry=ATTACKS.get(a[0]);return deepcopy(entry[1]) if entry and N(entry[0])==N(a[3]) else None
ABILITIES={
 'Rock Hiding':('If this Pokémon has any Fighting Energy attached to it, it has no Retreat Cost.',{'type':'passive','effect':E('modifier',stat='retreatCost',amount=-999,scope='self',duration='whileInPlay',condition={'type':'selfHasEnergyType','energyType':'Fighting'})}),
}
def ability(row,a):
 entry=ABILITIES.get(a[0]);return deepcopy(entry[1]) if entry and N(entry[0])==N(a[2]) else None
def trainer(row):
 entry=TRAINERS.get(row[1]);rules=TRAINER_RULES.get(row[1]);text=N(' '.join(row[13] or []))
 return deepcopy(entry) if row[2]=='Trainer' and entry and rules and all(N(q) in text for q in rules) else None
