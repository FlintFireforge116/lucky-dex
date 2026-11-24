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
 'Hyperspace Ring':('Search your deck for up to 2 Item cards, reveal them, and put them into your hand. Then, shuffle your deck.',e('searchChosen',amount=2,filter={'kind':'trainer','trainerType':['Item','Tool']})),
 'Spit Poison':("Your opponent's Active Pokémon is now Poisoned.",status('poison')),
 'Allotment':('Draw a card.',e('draw',amount=1)),
 'Glare':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",coin(status('paralysis'))),
 'Dangerous Rogue':("This attack does 20 more damage for each of your opponent's Benched Pokémon.",e('benchCountDamage',side='opponent',amount=20,mode='add')),
 'Swing Around':('Flip 2 coins. This attack does 20 more damage for each heads.',e('coinDamage',coins=2,amount=20,mode='add')),
 'Absorb Vitality':("Heal from this Pokémon the same amount of damage you did to your opponent's Active Pokémon.",e('sm5Rule',rule='gigaDrain')),
 'Sonic Evil':("This attack's damage isn't affected by Weakness or Resistance.",e('damageRule',ignoreWeakness=True,ignoreResistance=True)),
 'Find a Friend':('Search your deck for a Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.',e('searchChosen',amount=1,filter={'kind':'pokemon'})),
 'Fairy Lock':("The Defending Pokémon can't retreat during your opponent's next turn.",e('lock',action='retreat',target='opponentActive',duration='opponentTurn')),
 'Overrun':("This attack does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",e('multiTargetDamage',target='opponentBench',amount=20,count=1)),
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

# SM6 consolidated exact-print continuation.
STAGE_ATTACKS={'Tropical Shake': ("This attack does 20 more damage for each type of basic Energy card in your discard pile. You can't add more than 100 "
                    'damage in this way.',
                    {'type': 'sm6Rule', 'rule': 'tropicalShake'}),
 'Growth': ('Attach a Grass Energy card from your hand to this Pokémon.',
            {'type': 'attachEnergy', 'source': 'hand', 'amount': 1, 'energyType': 'Grass', 'target': 'self'}),
 'Milk Drink': ('Flip 2 coins. For each heads, heal 40 damage from this Pokémon.', {'type': 'sm6Rule', 'rule': 'milkDrink'}),
 'White Ray': ('If you have only 1 Prize card remaining, this attack does 90 more damage.',
               {'type': 'bonusDamage', 'amount': 90, 'condition': {'type': 'sm6OwnPrizes', 'values': [1]}}),
 'Ember': ('Discard an Energy from this Pokémon.', {'type': 'discardEnergyCard', 'target': 'self', 'amount': 1}),
 'Fire Spin': ('Discard 2 Energy from this Pokémon.', {'type': 'discardEnergyCard', 'target': 'self', 'amount': 2}),
 'Dominating Fangs': ('If Lysandre Labs is in play, this attack does 60 more damage.',
                      {'type': 'bonusDamage', 'amount': 60, 'condition': {'type': 'stadiumInPlay', 'cardId': 'sm6-111'}}),
 'Frost Wall': ("During your opponent's next turn, prevent all damage done to this Pokémon by attacks from Evolution Pokémon.",
                {'type': 'preventDamage', 'target': 'self', 'duration': 'opponentTurn', 'attackerFilter': {'evolved': True}}),
 'Break Open': ("If your opponent has a Stadium card in play, discard it. If you do, your opponent's Active Pokémon is now Paralyzed.",
                {'type': 'sm6Rule', 'rule': 'breakOpen'}),
 'Bubble Trap': ('If 1 of your Pokémon used Bubble during your last turn, this attack does 80 more damage.',
                 {'type': 'bonusDamage', 'amount': 80, 'condition': {'type': 'sm6LastAttack', 'name': 'Bubble'}}),
 'Searching Magnet': ('Search your deck for up to 3 Lightning Energy cards, reveal them, and put them into your hand. Then, shuffle your '
                      'deck.',
                      {'type': 'searchChosen', 'amount': 3, 'filter': {'kind': 'energy', 'basicEnergy': True, 'subtype': 'Lightning'}}),
 'Cablegram': ("If you have exactly 3 Prize cards remaining, your opponent's Active Pokémon is now Paralyzed.",
               {'type': 'status', 'status': 'paralysis', 'target': 'opponentActive', 'condition': {'type': 'sm6OwnPrizes', 'values': [3]}}),
 'Memory Skip': ("Choose 1 of your opponent's Active Pokémon's attacks. That Pokémon can't use that attack during your opponent's next "
                 'turn.',
                 {'type': 'chooseAttackLock', 'target': 'opponentActive', 'duration': 'opponentTurn'}),
 'Psychic': ("This attack does 30 more damage times the amount of Energy attached to your opponent's Active Pokémon.",
             {'type': 'energyDamage', 'source': 'opponent', 'amount': 30, 'mode': 'add'}),
 'Curse of the Blade': ("Put 3 damage counters on each of your opponent's Pokémon that has a Pokémon Tool card attached to it.",
                        {'type': 'sm6Rule', 'rule': 'curseBlade'}),
 'Stinger-GX': ('Both players shuffle their Prize cards into their decks. Then, each player puts the top 3 cards of their deck face down '
                "as their Prize cards. (You can't use more than 1 GX attack in a game.)",
                {'type': 'sm6Rule', 'rule': 'stinger'}),
 'Exact Revenge': ("If any of your Psychic Pokémon were Knocked Out by damage from an opponent's attack during their last turn, this "
                   'attack does 70 more damage.',
                   {'type': 'bonusDamage', 'amount': 70, 'condition': {'type': 'sm6PsychicKO'}}),
 'Crunch': ("Flip a coin. If heads, discard an Energy from your opponent's Active Pokémon.",
            {'type': 'coinFlip',
             'heads': {'type': 'discardEnergyCard', 'target': 'opponentActive', 'amount': 1},
             'tails': {'type': 'noop'}}),
 'Calm Strike': ('If you have used your GX attack, this attack does 60 more damage.',
                 {'type': 'bonusDamage', 'amount': 60, 'condition': {'type': 'sm6OwnGX'}}),
 'Verdict-GX': ("Prevent all damage done to this Pokémon by attacks from Pokémon-GX and Pokémon-EX during your opponent's next turn. (You "
                "can't use more than 1 GX attack in a game.)",
                {'type': 'preventDamage', 'target': 'self', 'duration': 'opponentTurn', 'attackerFilter': {'isExOrGX': True}}),
 'Diamond Rain': ('Heal 30 damage from each of your Benched Pokémon.', {'type': 'heal', 'target': 'selfBenchAll', 'amount': 30}),
 'Untamed Punch': ('If this Pokémon has any damage counters on it, this attack does 50 more damage, and both Active Pokémon are now '
                   'Confused.',
                   {'type': 'sequence',
                    'effects': [{'type': 'bonusDamage', 'amount': 50, 'condition': {'type': 'selfDamaged'}},
                                {'type': 'status', 'status': 'confusion', 'target': 'opponentActive', 'condition': {'type': 'selfDamaged'}},
                                {'type': 'status', 'status': 'confusion', 'target': 'self', 'condition': {'type': 'selfDamaged'}}]}),
 'Doom Count-GX': ("If your opponent's Active Pokémon has exactly 4 damage counters on it, that Pokémon is Knocked Out. (You can't use "
                   'more than 1 GX attack in a game.)',
                   {'type': 'sm6Rule', 'rule': 'doomCount'}),
 "Lord's Valley": ('If you have exactly 2, 4, or 6 Prize cards remaining, discard the top 10 cards of your deck.',
                   {'type': 'discardTop', 'amount': 10, 'condition': {'type': 'sm6OwnPrizes', 'values': [2, 4, 6]}}),
 'Sanctuary-GX': ("Move all damage counters from each of your Pokémon to your opponent's Active Pokémon. (You can't use more than 1 GX "
                  'attack in a game.)',
                  {'type': 'sm6Rule', 'rule': 'sanctuary'}),
 'Photon Geyser': ('Discard all basic Psychic Energy from this Pokémon. This attack does 80 more damage for each card you discarded in '
                   'this way.',
                   {'type': 'sm6Rule', 'rule': 'photonGeyser'}),
 'Sky-Scorching Light-GX': ("You can use this attack only if the total of both players' remaining Prize cards is 6 or less. Put 6 damage "
                            "counters on each of your opponent's Pokémon. (You can't use more than 1 GX attack in a game.)",
                            {'type': 'sequence',
                             'effects': [{'type': 'attackRequirement', 'condition': {'type': 'sm6CombinedPrizes', 'amount': 6}},
                                         {'type': 'placeDamageCounters', 'target': 'opponentAll', 'amount': 60}]}),
 'Destructive Sound': ('Your opponent reveals their hand. Discard all Item cards you find there.',
                       {'type': 'sm6Rule', 'rule': 'destructiveSound'})}
STAGE_ABILITIES={'Blessings of the Frost': ('When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may attach a '
                            'Grass Energy card from your discard pile to 1 of your Pokémon.',
                            {'type': 'triggered',
                             'event': 'evolved',
                             'fromHandOnly': True,
                             'effect': {'type': 'sm6Rule',
                                        'rule': 'discardAttach',
                                        'energyType': 'Grass',
                                        'benchOnly': False,
                                        'fromHand': True}}),
 'Mystical Torch': ("Once during your turn (before your attack), you may leave your opponent's Active Pokémon Burned.",
                    {'type': 'activated', 'oncePerTurn': True, 'effect': {'type': 'status', 'status': 'burn', 'target': 'opponentActive'}}),
 'Frubbles': ('If this Pokémon has any Water Energy attached to it, it has no Retreat Cost.',
              {'type': 'passive', 'effect': {'type': 'sm6Rule', 'rule': 'frubbles'}}),
 'Gale Shuriken': ('When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may put 2 damage counters '
                   "on 1 of your opponent's Pokémon.",
                   {'type': 'triggered',
                    'event': 'evolved',
                    'fromHandOnly': True,
                    'effect': {'type': 'sm6Rule', 'rule': 'shuriken', 'amount': 20}}),
 'Shuriken Flurry': ('When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may put 3 damage '
                     "counters on 1 of your opponent's Pokémon.",
                     {'type': 'triggered',
                      'event': 'evolved',
                      'fromHandOnly': True,
                      'effect': {'type': 'sm6Rule', 'rule': 'shuriken', 'amount': 30}}),
 'Psychic Recharge': ('Once during your turn (before your attack), you may attach a Psychic Energy card from your discard pile to 1 of '
                      'your Benched Pokémon.',
                      {'type': 'activated',
                       'oncePerTurn': True,
                       'effect': {'type': 'sm6Rule', 'rule': 'discardAttach', 'energyType': 'Psychic', 'benchOnly': True}}),
 'Tyrannical Heart': ("As long as you don't have more Pokémon in play than your opponent, this Pokémon's attacks do 60 more damage (before "
                      'applying Weakness and Resistance), and it takes 30 less damage from attacks (after applying Weakness and '
                      'Resistance).',
                      {'type': 'passive',
                       'effect': {'type': 'sequence',
                                  'effects': [{'type': 'modifier',
                                               'stat': 'attackDamage',
                                               'amount': 60,
                                               'scope': 'self',
                                               'duration': 'whileInPlay',
                                               'condition': {'type': 'sm6NotMorePokemon'}},
                                              {'type': 'modifier',
                                               'stat': 'damageReduction',
                                               'amount': 30,
                                               'scope': 'self',
                                               'duration': 'whileInPlay',
                                               'condition': {'type': 'sm6NotMorePokemon'}}]}}),
 'Earthen Aura': ("Damage from this Pokémon's attacks isn't affected by Weakness or Resistance.",
                  {'type': 'passive', 'effect': {'type': 'sm6Rule', 'rule': 'earthenAura'}}),
 'Sticky Membrane': ("As long as this Pokémon is your Active Pokémon, your opponent's Pokémon's attacks cost Colorless more.",
                     {'type': 'passive', 'effect': {'type': 'sm6Rule', 'rule': 'stickyMembrane'}})}
STAGE_TRAINERS={'Bonnie': ('Supporter',
            ['You can play this card only if there is any Stadium card in play.',
             'Discard that Stadium card. During this turn, your Zygarde-GX can use its GX attack even if you have used your GX attack.',
             'You may play only 1 Supporter card during your turn (before your attack).'],
            {'type': 'sm6Rule', 'rule': 'bonnie'}),
 'Crasher Wake': ('Supporter',
                  ['Discard 2 Water Energy cards from your hand. If you do, search your deck for up to 2 cards and put them into your '
                   'hand. Then, shuffle your deck.',
                   'You may play only 1 Supporter card during your turn (before your attack).'],
                  {'type': 'sm6Rule',
                   'rule': 'discardSearch',
                   'amount': 2,
                   'costFilter': {'kind': 'energy', 'basicEnergy': True, 'subtype': 'Water'},
                   'searchFilter': {},
                   'searchAmount': 2}),
 'Diantha': ('Supporter',
             ["You can play this card only if 1 of your Fairy Pokémon was Knocked Out during your opponent's last turn.",
              'Put 2 cards from your discard pile into your hand.',
              'You may play only 1 Supporter card during your turn (before your attack).'],
             {'type': 'sm6Rule', 'rule': 'diantha'}),
 'Fossil Excavation Map': ('Item',
                           ['Choose 1:\n'
                            '• Search your deck for an Unidentified Fossil card, reveal it, and put it into your hand. Then, shuffle your '
                            'deck.\n'
                            '• Put an Unidentified Fossil card from your discard pile into your hand.',
                            'You may play as many Item cards as you like during your turn (before your attack).'],
                           {'type': 'chooseOption',
                            'options': [{'label': 'Search deck for Unidentified Fossil',
                                         'effect': {'type': 'searchChosen', 'amount': 1, 'filter': {'name': 'Unidentified Fossil'}}},
                                        {'label': 'Recover Unidentified Fossil from discard',
                                         'effect': {'type': 'searchChosen',
                                                    'source': 'discard',
                                                    'amount': 1,
                                                    'filter': {'name': 'Unidentified Fossil'}}}]}),
 'Judge': ('Supporter',
           ['Each player shuffles their hand into their deck and draws 4 cards.',
            'You may play only 1 Supporter card during your turn (before your attack).'],
           {'type': 'handShuffle', 'side': 'both', 'draw': 4}),
 'Lysandre Labs': ('Stadium',
                   ["Pokémon Tool cards in play (both yours and your opponent's) have no effect.",
                    'This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card '
                    "with the same name is in play, you can't play this card."],
                   {'type': 'sm6Rule', 'rule': 'lysandreLabs'}),
 'Metal Frying Pan': ('Tool',
                      ["Attach a Pokémon Tool to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it.",
                       "The Metal Pokémon this card is attached to takes 30 less damage from your opponent's attacks (after applying "
                       'Weakness and Resistance) and has no Weakness.',
                       'You may play as many Item cards as you like during your turn (before your attack).'],
                      {'type': 'sequence',
                       'effects': [{'type': 'modifier',
                                    'stat': 'damageReduction',
                                    'amount': 30,
                                    'scope': 'self',
                                    'duration': 'whileInPlay',
                                    'filter': {'subtype': 'Metal'}},
                                   {'type': 'weaknessGuard', 'duration':'whileInPlay', 'condition':{'type':'selfMatches','filter':{'subtype':'Metal'}}, 'filter': {'subtype': 'Metal'}}]}),
 'Mysterious Treasure': ('Item',
                         ['Discard a card from your hand. If you do, search your deck for a Psychic or Dragon Pokémon, reveal it, and put '
                          'it into your hand. Then, shuffle your deck.',
                          'You may play as many Item cards as you like during your turn (before your attack).'],
                         {'type': 'sm6Rule',
                          'rule': 'discardSearch',
                          'amount': 1,
                          'costFilter': {},
                          'searchFilter': {'kind': 'pokemon', 'subtype': ['Psychic', 'Dragon']},
                          'searchAmount': 1}),
 'Ultra Recon Squad': ('Supporter',
                       ['Discard up to 2 Ultra Beast cards from your hand. Draw 3 cards for each card you discarded in this way.',
                        'You may play only 1 Supporter card during your turn (before your attack).'],
                       {'type': 'sm6Rule', 'rule': 'recon'}),
 'Ultra Space': ('Stadium',
                 ["Once during each player's turn, that player may search their deck for an Ultra Beast card, reveal it, put it into their "
                  'hand, and shuffle their deck.',
                  'This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card '
                  "with the same name is in play, you can't play this card."],
                 {'type': 'stadiumAction',
                  'effect': {'type': 'searchChosen', 'amount': 1, 'filter': {'kind': 'pokemon', 'tag': 'ultra-beast'}}}),
 'Beast Ring': ('Item',
                ['You can play this card only if your opponent has exactly 3 or 4 Prize cards remaining.',
                 'Search your deck for up to 2 basic Energy cards and attach them to 1 of your Ultra Beasts. Then, shuffle your deck.',
                 'You may play as many Item cards as you like during your turn (before your attack).'],
                {'type': 'sm6Rule', 'rule': 'beastRing'})}

# Final SM6 printed signatures. Shared rule handlers are below the existing stage adapter.
STAGE_ATTACKS.update({'Ultra Evolution': ('Flip a coin. If heads, search your deck for Vivillon and put it onto this Scatterbug '
                     'to evolve it. Then, shuffle your deck.',
                     {'type': 'sm6Rule', 'rule': 'ultraEvolution'}),
 'Limbo Limbo': ('Search your deck for up to 2 basic Energy cards and attach them to your Pokémon in any way '
                 'you like. Then, shuffle your deck.',
                 {'type': 'sm6Rule', 'rule': 'energySpread', 'amount': 2}),
 'Standing By': ("During your next turn, this Pokémon's Sharpshooting attack does 120 damage instead of 40.",
                 {'type': 'nextAttackBonus', 'attackName': 'Sharpshooting', 'amount': 80}),
 'Psychic Abduction': ('You can use this attack only if you go second, and only on your first turn. Shuffle '
                       "1 of your opponent's Benched Pokémon and all cards attached to it into their deck.",
                       {'type': 'sm6Rule', 'rule': 'psychicAbduction'}),
 'Energy Teaser': ("Move an Energy from 1 of your opponent's Benched Pokémon to another of their Pokémon.",
                   {'type': 'sm6Rule', 'rule': 'moveOpposingEnergy', 'benchOnly': True}),
 'Ticking Knock Out': ('During your next turn, if the Defending Pokémon is damaged by an attack, it will be '
                       'Knocked Out.',
                       {'type': 'sm6Rule', 'rule': 'tickingKO'}),
 'Twister': ("Flip 2 coins. For each heads, discard an Energy from your opponent's Active Pokémon. If both "
             'of them are tails, this attack does nothing.',
             {'type': 'sm6Rule', 'rule': 'twister'}),
 'Secret Blessings': ('Shuffle 3 in any combination of Pokémon and basic Energy cards from your discard pile '
                      'into your deck.',
                      {'type': 'sm6Rule', 'rule': 'secretBlessings'}),
 'Swirling Petals': ("Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. If you do, "
                     'switch this Pokémon with 1 of your Benched Pokémon.',
                     {'type': 'sm6Rule', 'rule': 'swirlingPetals'}),
 'Trinity Star': ('You can use this attack only if you have Grass, Water, and Lightning Pokémon on your '
                  'Bench. Search your deck for up to 3 basic Energy cards and attach them to your Pokémon in '
                  'any way you like. Then, shuffle your deck.',
                  {'type': 'sm6Rule', 'rule': 'energySpread', 'amount': 3, 'trinity': True}),
 'Mountaintop Mining': ('You may do 40 more damage. If you do, discard the top 2 cards of your deck.',
                        {'type': 'sm6Rule', 'rule': 'mountaintopMining'}),
 'Knockout Reviver': ("During your opponent's next turn, if this Pokémon is Knocked Out, your opponent can't "
                      'take any Prize cards for it.',
                      {'type': 'sm6Rule', 'rule': 'knockoutReviver'})})
STAGE_ABILITIES.update({'Abnormal Outbreak': ('You can use this Ability only if you go second. Once during your first turn (before '
                       'your attack), you may search your deck for a Spewpa and a Vivillon, reveal them, and '
                       'put them into your hand. Then, shuffle your deck.',
                       {'type': 'activated',
                        'oncePerTurn': True,
                        'effect': {'type': 'sm6Rule', 'rule': 'abnormalOutbreak'}}),
 'Unnerve': ('Whenever your opponent plays an Item or Supporter card from their hand, prevent all effects of '
             'that card done to this Pokémon.',
             {'type': 'passive', 'effect': {'type': 'sm6Rule', 'rule': 'unnerve'}}),
 'Jet Geyser': ('Once during your turn (before your attack), you may discard a Water Energy card from your '
                'hand. If you do, your opponent switches their Active Pokémon with 1 of their Benched '
                'Pokémon.',
                {'type': 'activated',
                 'oncePerTurn': True,
                 'effect': {'type': 'sm6Rule', 'rule': 'jetGeyser'},
                 'requiresBasicEnergyFromHand': 'Water'}),
 'Silent Waves': ("If you have Azelf in play, your opponent's Pokémon in play have no Resistance.",
                  {'type': 'passive', 'effect': {'type': 'sm6Rule', 'rule': 'silentWaves'}}),
 'Final Hour': ("If this Pokémon is your Active Pokémon and is Knocked Out by damage from an opponent's "
                "attack, put 3 damage counters on 1 of your opponent's Pokémon.",
                {'type': 'triggered',
                 'event': 'knockedOutByAttack',
                 'effect': {'type': 'sm6Rule', 'rule': 'finalHour'},
                 'activeOnly': True,
                 'opponentAttackOnly': True}),
 'Poison Point': ("If this Pokémon is your Active Pokémon and is damaged by an opponent's attack (even if "
                  'this Pokémon is Knocked Out), the Attacking Pokémon is now Poisoned.',
                  {'type': 'triggered',
                   'event': 'damagedByAttack',
                   'effect': {'type': 'sm6Rule', 'rule': 'poisonPoint'},
                   'activeOnly': True,
                   'opponentAttackOnly': True}),
 'Wondrous Gift': ('Once during your turn (before your attack), you may flip a coin. If heads, put an Item '
                   'card from your discard pile on top of your deck.',
                   {'type': 'activated',
                    'oncePerTurn': True,
                    'effect': {'type': 'sm6Rule', 'rule': 'wondrousGift'}}),
 'Hydration': ('Whenever you attach a Water Energy card from your hand to this Pokémon, heal 20 damage from '
               'it.',
               {'type': 'triggered',
                'event': 'energyAttached',
                'effect': {'type': 'sm6Rule', 'rule': 'hydration'},
                'energyType': 'Water',
                'fromHandOnly': True}),
 'First Law': ("Prevent all effects of your opponent's attacks, except damage, done to this Pokémon.",
               {'type': 'passive', 'effect': {'type': 'preventEffects', 'duration': 'whileInPlay'}})})
STAGE_TRAINERS.update({'Eneporter': ('Item',
               ["Move a Special Energy from 1 of your opponent's Pokémon to another of their Pokémon.",
                'You may play as many Item cards as you like during your turn (before your attack).'],
               {'type': 'sm6Rule', 'rule': 'moveOpposingEnergy', 'specialOnly': True}),
 'Lysandre ◇': ('Supporter',
                ["For each of your Fire Pokémon in play, put a card from your opponent's discard pile in the "
                 'Lost Zone.',
                 'You may play only 1 Supporter card during your turn (before your attack).',
                 "◇ (Prism Star) Rule: You can't have more than 1 ◇ card with the same name in your deck. If "
                 'a ◇ card would go to the discard pile, put it in the Lost Zone instead.'],
                {'type': 'sm6Rule', 'rule': 'lysandrePrism'})})

STAGE_ATTACKS["Wink Wink"] = ('Your opponent reveals their hand. You may discard a Supporter card you find there and use the effect of that card as the effect of this attack.', e("sm6Rule",rule="winkWink"))

def attack(row,a):
 title,cost,damage,printed=a
 stage=STAGE_ATTACKS.get(title)
 if stage and n(stage[0])==n(printed):return deepcopy(stage[1])
 # Audited overrides: printed Tools were Items in 2018; Overrun is mandatory when a Bench exists.
 if title in ('Hyperspace Ring','Overrun') and n(ATTACKS[title][0])==n(printed):return deepcopy(ATTACKS[title][1])
 # Reuse existing exact previous-print implementation first. This includes
 # Palkia/Dialga GX, Garchomp, Ultra Prism energy attacks, and generic status.
 previous=PREVIOUS.attack(row,a)
 if previous is not None and previous.get('type') not in ('unsupported','noop'):return previous
 if not n(printed):return e('noop')
 item=ATTACKS.get(title)
 if item and n(item[0])==n(printed):return deepcopy(item[1])
 return None

def ability(row,a):
 stage=STAGE_ABILITIES.get(a[0])
 if stage and n(stage[0])==n(a[2]):return deepcopy(stage[1])
 inherited=PREVIOUS.ability(row,a)
 if inherited is not None:return inherited
 title,_,printed=a
 if title=='Magnetic Circuit':item=ABILITIES['MagnezoneLightningCircuit']
 else:item=ABILITIES.get(title)
 return deepcopy(item[1]) if item and n(item[0])==n(printed) else None

def trainer(row):
 stage=STAGE_TRAINERS.get(row[1])
 if stage and [n(x) for x in stage[1]]==[n(x) for x in row[13]]:return (stage[0],deepcopy(stage[2]))
 previous=PREVIOUS.trainer(row)
 if previous is not None:return previous
 name=row[1];entry=TRAINERS.get(name)
 if not entry:return None
 rules=n(' '.join(row[13] or []))
 return deepcopy(entry) if n(TRAINER_RULES[name]) in rules else None

def energy(row):
 if row[2]!='Energy':return None
 if row[1]=='Beast Energy ◇' and 'ultra beast' in n(' '.join(row[13])):return e('specialEnergy',provides={'Colorless':1})
 rules=n(' '.join(row[13] or []))
 # One physical Unit Energy can satisfy ONE colour pip, never three pips.
 if row[1]=='Unit Energy FightingDarknessFairy' and n('it provides Fighting, Darkness, and Fairy Energy but provides only 1 Energy at a time.') in rules:
  return e('specialEnergy',provides={'Colorless':1})
 return None

def prism_ready(row):
 # Deck-copy and Lost-Zone rules already exist; individual new print mechanics
 # are not promoted until the printed effects are tested.
 return row[0] in ('31','74','96','110')
