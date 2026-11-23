"""Forbidden Light (SM6) full-set, exact-print effect adapter.

Deliberately fail closed. The legacy SM1–SM5 verified adapters are reused first
for identical print text; bespoke SM6 mechanics are opted in by full printed
attack/Ability/Trainer wording. Do NOT replace missing clauses with noop.
"""
from __future__ import annotations
from copy import deepcopy
import re
import sm5_verified as PREVIOUS

def n(s):return re.sub(r'\s+',' ',str(s or '')).strip().casefold()
def e(kind,**kw):return {'type':kind,**kw}
def seq(*actions):return e('sequence',effects=list(actions))
def coin(effect):return e('coinFlip',heads=effect,tails=e('noop'))
def status(name):return e('status',target='opponentActive',status=name)
def bonus(amount,cond):return e('bonusDamage',amount=amount,condition=cond)
# The second element is an actual battle descriptor, not a printed text placeholder.
ATTACKS={
 'Multiply':('Search your deck for Exeggcute and put it onto your Bench. Then, shuffle your deck.',e('benchFromDeck',amount=1,filter={'name':'Exeggcute'})),
 'Vivid Powder':("Your opponent's Active Pokémon is now Asleep and Poisoned.",seq(status('sleep'),status('poison'))),
 'Double-Edge':('This Pokémon does 30 damage to itself.',e('selfDamage',amount=30)),
 'Alolan Club':('This attack does 20 damage for each of your Pokémon in play that has Alolan in its name.',e('fieldCountDamage',side='self',filter={'nameContains':'Alolan'},amount=20,mode='replace')),
 'Burdensome Bone':("This Pokémon can't attack during your next turn.",e('lock',action='attack',target='self',duration='nextOwnTurn')),
 'Beast Raid':('This attack does 20 damage for each of your Ultra Beasts in play.',e('fieldCountDamage',side='self',filter={'tag':'ultra-beast'},amount=20,mode='replace')),
 'Jet Needle':("This attack's damage isn't affected by Weakness or Resistance.",e('damageRule',ignoreWeakness=True,ignoreResistance=True)),
 'Sky Drop':("This attack does 20 less damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.",e('retreatCostDamage',amount=20,negative=True,mode='add')),
 'Cell Connector':('Attach 2 Fighting Energy cards from your discard pile to this Pokémon.',e('attachEnergyFromDiscard',amount=2,energyType='Fighting',target='self')),

 'Act Tough':('If this Pokémon has any Darkness Energy attached to it, this attack does 30 more damage.',bonus(30,{'type':'selfHasEnergyType','energyType':'Darkness'})),
 'Peace Maker':('If your opponent has an Ultra Beast in play, this attack does 30 more damage.',bonus(30,{'type':'pokemonPresent','side':'opponent','zone':'inPlay','filter':{'tag':'ultra-beast'}})),
 'Seven Shock':("If you have exactly 7 cards in your hand, your opponent's Active Pokémon is now Paralyzed.",e('status',status='paralysis',target='opponentActive',condition={'type':'handSizeOneOf','values':[7]})),
 'Sledgehammer':('If your opponent has exactly 4 Prize cards remaining, this attack does 90 more damage.',bonus(90,{'type':'opponentPrizesRemaining','amount':4})),
 'Soaking Horn':('If this Pokémon was healed during this turn, this attack does 80 more damage.',bonus(80,{'type':'xy8HealedThisTurn'})),
 'Aura Strike':('If this Pokémon evolved from Riolu during this turn, this attack does 90 more damage.',bonus(90,{'type':'evolvedThisTurn'})),
 'Cantankerous Beatdown-GX':("This attack does 30 damage for each damage counter on this Pokémon. (You can't use more than 1 GX attack in a game.)",e('damageFromDamage',source='self',amount=3,mode='replace')),
 'Mind Splash':('If Uxie is on your Bench, this attack does 50 more damage.',bonus(50,{'type':'pokemonPresent','side':'self','zone':'bench','filter':{'name':'Uxie'}})),
 'Haze Slash':('You may shuffle this Pokémon and all cards attached to it into your deck.',e('sm5Rule',rule='happyTurn')),
 'Mist Guard':("Prevent all damage done to this Pokémon by attacks from Dragon Pokémon during your opponent's next turn.",e('preventDamage',target='self',duration='opponentTurn',attackerFilter={'subtype':'Dragon'})),

 'Shadowy Hunter-GX':("This attack does 130 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) (You can't use more than 1 GX attack in a game.)",e('selectedDamage',target='opponentBench',amount=130)),
 'Sharpshooting':("This attack does 40 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",e('selectedDamage',target='opponentPokemon',amount=40)),
 'Blizzard Burn':("This Pokémon can't attack during your next turn.",e('lock',action='attack',target='self',duration='nextOwnTurn')),
 'Frozen Ground':("Your opponent can't play any Stadium cards from their hand during their next turn.",e('actionLock',cardType='Stadium',side='opponent',duration='opponentTurn')),
 'Sauna Blast':("This attack does 20 damage to each of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",e('benchDamage',side='opponent',all=True,amount=20)),
 'Spider Web':("The Defending Pokémon can't retreat during your opponent's next turn.",e('lock',action='retreat',target='opponentActive',duration='opponentTurn')),
 'Volt Wave':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",coin(status('paralysis'))),
 'Dazzle Blast':("Your opponent's Active Pokémon is now Confused.",status('confusion')),
 'Hypnoblast':("Your opponent's Active Pokémon is now Asleep.",status('sleep')),
 'Teleportation Burst':('Switch this Pokémon with 1 of your Benched Pokémon.',e('switch')),
 'Metal Sound':("Your opponent's Active Pokémon is now Confused.",status('confusion')),
 'Draining Blade':('Heal 30 damage from this Pokémon.',e('heal',target='self',amount=30)),
 'Hyperspace Ring':('Search your deck for up to 2 Item cards, reveal them, and put them into your hand. Then, shuffle your deck.',e('searchChosen',amount=2,filter={'kind':'trainer','trainerType':'Item'})),
 'Spit Poison':("Your opponent's Active Pokémon is now Poisoned.",status('poison')),
 'Allotment':('Draw a card.',e('draw',amount=1)),
 'Glare':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",coin(status('paralysis'))),
 'Dangerous Rogue':("This attack does 20 more damage for each of your opponent's Benched Pokémon.",e('benchCountDamage',side='opponent',amount=20,mode='add')),
 'Swing Around':('Flip 2 coins. This attack does 20 more damage for each heads.',e('coinDamage',coins=2,amount=20,mode='add')),
 'Absorb Vitality':("Heal from this Pokémon the same amount of damage you did to your opponent's Active Pokémon.",e('sm5Rule',rule='gigaDrain')),
 'Sonic Evil':("This attack's damage isn't affected by Weakness or Resistance.",e('damageRule',ignoreWeakness=True,ignoreResistance=True)),
 'Find a Friend':('Search your deck for a Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.',e('searchChosen',amount=1,filter={'kind':'pokemon'})),
 'Fairy Lock':("The Defending Pokémon can't retreat during your opponent's next turn.",e('lock',action='retreat',target='opponentActive',duration='opponentTurn')),
 'Overrun':("This attack does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",e('benchDamage',side='opponent',amount=20)),
 'Flail':('This attack does 10 damage for each damage counter on this Pokémon.',e('damageFromDamage',source='self',amount=1,mode='replace')),
 'Absorb':('Heal 30 damage from this Pokémon.',e('heal',target='self',amount=30)),
 'Collect':('Draw a card.',e('draw',amount=1)),
 'Return':('You may draw cards until you have 5 cards in your hand.',e('drawToHandSize',size=5,optional=True)),
 'Supersonic':("Your opponent's Active Pokémon is now Confused.",status('confusion')),
 'Resonance':("If your opponent's Active Pokémon is Confused, this attack does 70 more damage.",bonus(70,{'type':'opponentStatus','status':'confusion'})),
 'Electrichain':('If you have any Lightning Pokémon on your Bench, this attack does 30 more damage.',bonus(30,{'type':'pokemonPresent','side':'self','zone':'bench','filter':{'subtype':'Lightning'}})),
 'Crunch':('Discard an Energy from your opponent\'s Active Pokémon.',e('discardEnergyCard',target='opponentActive',amount=1)),
 'Rock Cannon':('Flip a coin until you get tails. This attack does 80 damage for each heads.',e('coinDamage',coins='untilTails',amount=80,mode='replace')),
}
# Printed names can vary for repeated mechanics. The exact wording above
# prevents an unrelated same-title print from acquiring the wrong effect.
ABILITIES={
 'MagnezoneLightningCircuit':('As often as you like during your turn (before your attack), you may attach a Lightning Energy card from your hand to 1 of your Pokémon.',{'type':'activated','oncePerTurn':False,'requiresBasicEnergyFromHand':'Lightning','effect':e('chooseTarget',target='selfPokemon',effect=e('attachEnergy',source='hand',amount=1,energyType='Lightning',target='selfPokemon'))}),
 'Princess\'s Cheers':("As long as this Pokémon is on your Bench, your Fighting Pokémon's attacks do 20 more damage to your opponent's Active Pokémon (before applying Weakness and Resistance).",{'type':'passive','benchOnly':True,'effect':e('modifier',stat='attackDamage',amount=20,scope='team',duration='whileInPlay',filter={'subtype':'Fighting'})}),
 'Roto Motor':('If you have 9 or more Pokémon Tool cards in your discard pile, ignore all Energy in the attack cost of each of this Pokémon\'s attacks.',{'type':'passive','effect':e('conditionalAttackCost',cost='')}),
 'Evolutionary Advantage':('If you go second, this Pokémon can evolve during your first turn.',{'type':'passive','effect':e('evolutionTimingOverride',firstTurn=True)}),
 'Flaming Fighter':("Put 6 damage counters instead of 2 on your opponent's Burned Pokémon between turns.",{'type':'passive','effect':e('sm5Rule',rule='flamingFighter')}),
}
TRAINERS={
 'Lady':('Supporter',e('searchChosen',amount=4,filter={'kind':'energy','basicEnergy':True})),
 'Unidentified Fossil':('Item',e('playFossil',hp=60,subtype='Colorless',canRetreat=False)),
}
TRAINER_RULES={
 'Lady':'Search your deck for up to 4 basic Energy cards, reveal them, and put them into your hand.',
 'Unidentified Fossil':'Play this card as if it were a 60-HP Colorless Basic Pokémon.',
 'Metal Frying Pan':'The Metal Pokémon this card is attached to takes 30 less damage from your opponent\'s attacks',
 'Ultra Space':'Once during each player\'s turn, that player may search their deck for an Ultra Beast card',
}

def attack(row,a):
 title,cost,damage,printed=a
 # Reuse existing exact previous-print implementation first. This includes
 # Palkia/Dialga GX, Garchomp, Ultra Prism energy attacks, and generic status.
 previous=PREVIOUS.attack(row,a)
 if previous is not None and previous.get('type') not in ('unsupported','noop'):return previous
 if not n(printed):return e('noop')
 item=ATTACKS.get(title)
 if item and n(item[0])==n(printed):return deepcopy(item[1])
 return None

def ability(row,a):
 inherited=PREVIOUS.ability(row,a)
 if inherited is not None:return inherited
 title,_,printed=a
 if title=='Magnetic Circuit':item=ABILITIES['MagnezoneLightningCircuit']
 else:item=ABILITIES.get(title)
 return deepcopy(item[1]) if item and n(item[0])==n(printed) else None

def trainer(row):
 previous=PREVIOUS.trainer(row)
 if previous is not None:return previous
 name=row[1];entry=TRAINERS.get(name)
 if not entry:return None
 rules=n(' '.join(row[13] or []))
 return deepcopy(entry) if n(TRAINER_RULES[name]) in rules else None

def energy(row):
 if row[2]!='Energy':return None
 rules=n(' '.join(row[13] or []))
 # One physical Unit Energy can satisfy ONE colour pip, never three pips.
 if row[1]=='Unit Energy FightingDarknessFairy' and n('it provides Fighting, Darkness, and Fairy Energy but provides only 1 Energy at a time.') in rules:
  return e('specialEnergy',provides={'Colorless':1})
 return None

def prism_ready(row):
 # Deck-copy and Lost-Zone rules already exist; individual new print mechanics
 # are not promoted until the printed effects are tested.
 return False
