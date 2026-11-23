"""Ultra Prism Stage 2: text-locked effects with matching runtime primitives.

These MUST be checked against the immutable official print rows. No title-only
matches, no unsupported-to-noop coercion, no guessed new Prism Star rules.
"""
from __future__ import annotations
import re
from copy import deepcopy

def E(t,**kw):return {'type':t,**kw}
N=E('noop')
def S(*effects):return E('sequence',effects=list(effects))
def COIN(heads):return E('coinFlip',heads=heads,tails=N)
def STATUS(status,target='opponentActive',**kw):return E('status',status=status,target=target,**kw)
def BONUS(amount,condition):return E('bonusDamage',amount=amount,condition=condition)
def LOCK(action,target,duration='opponentTurn',**kw):return E('lock',action=action,target=target,duration=duration,**kw)
def norm(s):return re.sub(r'\s+',' ',s or '').strip().casefold()

# Name and *complete* print text must match the official sm5.json row.
# Duplicate-art prints get precisely the same effect as their regular print.
ATTACKS={
 'Super Speed':('Flip a coin. If heads, prevent all effects of attacks, including damage, done to this Pokémon during your opponent\'s next turn.',COIN(E('preventDamage',target='self',duration='opponentTurn'))),
 'Mega Drain':('Heal 30 damage from this Pokémon.',E('heal',target='self',amount=30)),
 'Soothing Scent':("Your opponent's Active Pokémon is now Asleep.",STATUS('sleep')),
 'Bubble':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",COIN(STATUS('paralysis'))),
 'Panic Poison':("Your opponent's Active Pokémon is now Burned, Confused, and Poisoned.",S(STATUS('burn'),STATUS('confusion'),STATUS('poison'))),
 "Hunter's Nails":("If your opponent's Active Pokémon is affected by a Special Condition, this attack does 60 more damage.",BONUS(60,{'type':'opponentStatus'})),
 'Searing Flame':("Your opponent's Active Pokémon is now Burned.",STATUS('burn')),
 'Aqua Blast':('Discard a Water Energy from this Pokémon.',E('discardEnergyCard',target='self',amount=1,energyType='Water',strictEnergyType=True)),
 'Hypno Hammer':("Your opponent's Active Pokémon is now Asleep.",STATUS('sleep')),
 'Water Pulse':("Your opponent's Active Pokémon is now Asleep.",STATUS('sleep')),
 'Steel Short':("If your opponent's Active Pokémon is a Metal Pokémon, it is now Paralyzed.",E('status',target='opponentActive',status='paralysis',condition={'type':'opponentMatches','filter':{'subtype':'Metal'}})),
 'Disconnect':("Your opponent can't play any Item cards from their hand during their next turn.",E('actionLock',cardType='Item',side='opponent',duration='opponentTurn')),
 'Nuzzle':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",COIN(STATUS('paralysis'))),
 'Plasma Slice':("This Pokémon can't attack during your next turn.",LOCK('attack','self','nextOwnTurn')),
 'Lightless World':('Put 2 Supporter cards from your discard pile into your hand.',E('searchChosen',source='discard',amount=2,filter={'kind':'trainer','trainerType':'Supporter'})),
 'Terrify':("If the Defending Pokémon is a Basic Pokémon, it can't attack during your opponent's next turn.",LOCK('attack','opponentActive',condition={'type':'opponentMatches','filter':{'stage':'Basic'}})),
 'Clean Hit':("If your opponent's Active Pokémon is an Evolution Pokémon, this attack does 60 more damage.",BONUS(60,{'type':'opponentMatches','filter':{'evolved':True}})),
 'Detect':('Flip a coin. If heads, prevent all effects of attacks, including damage, done to this Pokémon during your opponent\'s next turn.',COIN(E('preventDamage',target='self',duration='opponentTurn'))),
 'Sand Tomb':("The Defending Pokémon can't retreat during your opponent's next turn.",LOCK('retreat','opponentActive')),
 'Rock Hurl':("This attack's damage isn't affected by Resistance.",E('damageRule',ignoreResistance=True)),
 'Mean Look':("The Defending Pokémon can't retreat during your opponent's next turn.",LOCK('retreat','opponentActive')),
 'Ambush':('Flip a coin. If heads, this attack does 20 more damage.',COIN(E('bonusDamage',amount=20))),
 'Icy Wind':("Your opponent's Active Pokémon is now Asleep.",STATUS('sleep')),
 'Gas Bond':('Both Active Pokémon are now Confused.',S(STATUS('confusion','selfActive'),STATUS('confusion'))),
 'Psy Bolt':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",COIN(STATUS('paralysis'))),
 'Ascension':('Search your deck for a card that evolves from this Pokémon and put it onto this Pokémon to evolve it. Then, shuffle your deck.',E('evolveFromDeck')),
 'Overclock':('Draw cards until you have 6 cards in your hand.',E('drawToHandSize',size=6)),
 'Shred':("This attack's damage isn't affected by any effects on your opponent's Active Pokémon.",E('damageRule',ignoreEffects=True)),
 'Stompy Stomp':('Flip 2 coins. This attack does 40 damage for each heads.',E('coinDamage',coins=2,amount=40,mode='replace')),
 'Gentle Bite':("During your opponent's next turn, the Defending Pokémon's attacks do 40 less damage (before applying Weakness and Resistance).",E('modifier',stat='attackDamage',amount=-40,scope='opponentActive',duration='opponentTurn')),
 'Scout':('Your opponent reveals their hand.',E('revealHand',side='opponent')),
 'Take Down':('This Pokémon does 10 damage to itself.',E('selfDamage',amount=10)),
 'Profound Knowledge':("Your opponent's Active Pokémon is now Confused.",STATUS('confusion')),
 'Psychic Resonance':("If your opponent has any Psychic Pokémon in play, this attack does 60 more damage.",BONUS(60,{'type':'pokemonPresent','side':'opponent','zone':'inPlay','filter':{'subtype':'Psychic'}})),
 'Searching Magnet':('Search your deck for up to 3 Metal Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.',E('searchChosen',amount=3,filter={'kind':'energy','basicEnergy':True,'subtype':'Metal'})),
 'Charge':('Search your deck for a Lightning Energy card and attach it to this Pokémon. Then, shuffle your deck.',E('attachEnergy',amount=1,energyType='Lightning',target='self')),
 'Synthesis':('Search your deck for a Grass Energy card and attach it to 1 of your Pokémon. Then, shuffle your deck.',E('chooseTarget',target='selfPokemon',effect=E('attachEnergy',amount=1,energyType='Grass',target='selfPokemon'))),
}

# Cards printed with exact visible rules; the reusable engine resolves all
# actual choices and physical hand/zone movements. Stadium activation is
# one-per-player-per-turn through the existing Stadium action gate.
TRAINERS={
 'Cynthia':('Supporter',E('handShuffle',draw=6)),
 'Gardenia':('Supporter',E('chooseTarget',target='selfPokemon',filter={'hasEnergyType':'Grass'},effect=E('heal',target='selfPokemon',amount=80))),
 'Lana':('Supporter',E('heal',target='selfAll',filter={'hasEnergyType':'Water'},amount=50)),
 'Looker':('Supporter',E('draw',amount=3,fromBottom=True)),
 'Mars':('Supporter',E('sm5Rule',rule='mars')),
 'Order Pad':('Item',COIN(E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Item'}))),
 'Looker Whistle':('Item',E('searchChosen',amount=2,filter={'name':'Looker'})),
 'Pokémon Fan Club':('Supporter',E('searchChosen',amount=2,filter={'kind':'pokemon','stage':'Basic'})),
 'Volkner':('Supporter',S(E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Item'}),E('searchChosen',amount=1,filter={'kind':'energy','basicEnergy':True,'subtype':'Lightning'}))),
 'Mt. Coronet':('Stadium',E('stadiumAction',effect=E('searchChosen',source='discard',amount=2,filter={'kind':'energy','basicEnergy':True,'subtype':'Metal'}))),
}
# Compare only card-specific rule segment, not shared Item/Supporter boilerplate.
TRAINER_RULES={
 'Cynthia':'Shuffle your hand into your deck. Then, draw 6 cards.',
 'Gardenia':'Heal 80 damage from 1 of your Pokémon that has any Grass Energy attached to it.',
 'Lana':'Heal 50 damage from each of your Pokémon that has any Water Energy attached to it.',
 'Looker':'Draw 3 cards from the bottom of your deck.',
 'Mars':'Draw 2 cards. If you do, discard a random card from your opponent\'s hand.',
 'Order Pad':'Flip a coin. If heads, search your deck for an Item card, reveal it, and put it into your hand. Then, shuffle your deck.',
 'Looker Whistle':'Search your deck for up to 2 cards named Looker, reveal them, and put them into your hand. Then, shuffle your deck.',
 'Pokémon Fan Club':'Search your deck for up to 2 Basic Pokémon, reveal them, and put them into your hand. Then, shuffle your deck.',
 'Volkner':'Search your deck for an Item card and a Lightning Energy card, reveal them, and put them into your hand. Then, shuffle your deck.',
 'Mt. Coronet':"Once during each player's turn, that player may put 2 Metal Energy cards from their discard pile into their hand.",
}

def attack(row,a):
    found=ATTACKS.get(a[0]);return deepcopy(found[1]) if found and norm(a[3])==norm(found[0]) else None

def trainer(row):
    name=row[1];found=TRAINERS.get(name)
    if not found:return None
    printed=' '.join(row[13] or [])
    if norm(TRAINER_RULES[name]) not in norm(printed):return None
    return deepcopy(found)
