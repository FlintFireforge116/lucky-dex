"""Burning Shadows (SM3) source-locked Stage-1 effects.

Never infer gameplay solely from an attack's name. Source-identical mechanics
may reuse prior verified adapters; anything else must be explicitly mapped or
remain gated until an outcome test proves it works. Unknown cards are visible in
collection but excluded from both player and CPU battle deck generation.
"""
from __future__ import annotations
from copy import deepcopy
from pathlib import Path
import json,re
from sm2_verified import attack as previous_attack
from sm1_verified import attack as sun_moon_attack
from sm1_verified import N, S, Q, ST, H, DISC, COIN, SEARCH, BENCH, BONUS, SWITCH, DRAW, LOCK, GUARD
from sm1_verified import TRAINERS as SM1_TRAINERS, ABILITIES as SM1_ABILITIES
from sm2_verified import TRAINERS as SM2_TRAINERS, ABILITIES as SM2_ABILITIES
E=lambda t,**kw:{'type':t,**kw}
ROOT=Path(__file__).resolve().parents[1]

def norm(s):
    s=re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)', '', s or '',flags=re.I)
    return re.sub(r'\s+', ' ',s).strip().casefold()

# An exact reusable move means the same attack name, printed damage, text and
# energy cost, not just a familiar name (e.g. "Flare", "Claw", "Rip Claw").
ATTACKS={}
ABILITIES={}
TRAINERS={}
for set_id, parser, trainers, abilities in (
    ('sm1',sun_moon_attack,SM1_TRAINERS,SM1_ABILITIES),
    ('sm2',previous_attack,SM2_TRAINERS,SM2_ABILITIES)):
    rows=json.loads((ROOT/f'data/classic/{set_id}-print-compact.json').read_text(encoding='utf8'))
    for row in rows:
        for a in row[7]:
            effect=parser(row,a)
            if effect is not None and effect.get('type')!='unsupported':
                ATTACKS[(a[0],tuple(a[1]),a[2],norm(a[3]))]=deepcopy(effect)
        for a in row[8]:
            if a[0] in abilities:
                ABILITIES[(a[0],norm(a[2]))]=deepcopy(abilities[a[0]])
        if row[2]=='Trainer' and row[0] in trainers:
            TRAINERS[(row[1],norm(' '.join(row[13] or [])))]=deepcopy(trainers[row[0]])

# Safe previously-proven generic moves; require exact printed effect text.
# Pure damage attacks don't require a descriptor beyond noop.
BONUS_MOVES={
 'Body Slam':("Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",Q(ST('paralysis'))),
 'Flamethrower':('Discard an Energy from this Pokémon.',DISC(1,'self')),
 'Recover':('Discard an Energy from this Pokémon. If you do, heal all damage from this Pokémon.',E('discardHeal',amount=1,target='self',heal=9999)),
 'Tackle':('',N),
}

# These correspond to complete, inspected SM3 printed mechanics; each maps to
# shared effects already exercised by previous card-set regression tests.
# The exact required phrase is checked below, so homonymous attacks in future
# sets cannot accidentally inherit these effects.
SM3_ATTACKS={
 'Bye-Bye Heal':("Heal all damage from all of your Pokémon. Shuffle this Pokémon",S(E('heal',target='selfAll',amount=9999),E('shuffleIntoDeck',target='self',includeAttached=True))),
 'Crosswise Whip':('Flip 4 coins. This attack does 50 damage for each heads.',COIN(4,50)),
 'Comet Punch':('Flip 4 coins. This attack does 40 damage for each heads.',COIN(4,40)),
 'First Impression':('If this Pokémon was on the Bench and became your Active Pokémon this turn',BONUS(90,{'type':'movedFromBenchThisTurn'})),
 'Armor Press':('this Pokémon takes 20 less damage from attacks',GUARD(20)),
 'Crimson Storm':('Discard 3 Fire Energy from this Pokémon.',DISC(3,'self','Fire')),
 'Raging Out-GX':("Discard the top 10 cards of your opponent's deck.",E('discardTop',side='opponent',amount=10)),
 'Sacred Fire':("This attack does 50 damage to 1 of your opponent's Pokémon.",E('selectedDamage',target='opponentPokemon',amount=50)),
 'Phoenix Burn':("This Pokémon can't use Phoenix Burn during your next turn.",E('lock',action='attack',target='self',attackName='Phoenix Burn',duration='nextOwnTurn')),
 'Flare Recharge':('Attach a Fire Energy card from your discard pile to 1 of your Benched Pokémon.',E('attachEnergyFromDiscard',target='selfBench',energyType='Fire',amount=1)),
 'Flame Cloak':('Attach a Fire Energy card from your discard pile to this Pokémon.',E('attachEnergyFromDiscard',target='self',energyType='Fire',amount=1)),
 'Water Arrow':('This attack does',E('selectedDamage',target='opponentPokemon',amount=0)),
 'Splashing Dodge':('Flip a coin. If heads, prevent all effects of attacks',Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True))),
 'Splash Burn':('This attack does 30 damage to each of your Benched Pokémon.',E('benchDamage',side='self',amount=30,all=True)),
 'Aqua Reflect':('Move a Water Energy from this Pokémon to 1 of your Benched Pokémon.',E('moveEnergy',source='self',target='selfBench',energyType='Water',amount=1)),
 'Thunder Punch':('Flip a coin. If heads, this attack does 60 more damage. If tails',Q(BONUS(60),E('selfDamage',amount=20))),
 'Giga Impact':("This Pokémon can't attack during your next turn.",E('lock',action='attack',target='self',duration='nextOwnTurn')),
 'Drift Ashore':('Search your deck for a card and put it into your hand.',SEARCH(1,kind='any')),
 'Shadowy Knot':("This attack does 50 damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.",E('retreatCostDamage',amount=50,mode='replace')),
 'Dark Guidance':('Put a Basic Pokémon from your discard pile onto your Bench.',E('benchFromDiscard',side='self',amount=1,filter={'kind':'pokemon','stage':'Basic'})),
 'Mind Jack':("This attack does 30 more damage for each of your opponent's Benched Pokémon.",E('benchCountDamage',side='opponent',amount=30,mode='add')),
 'Allure':('Draw 3 cards.',DRAW(3)),
 'Hand Kinesis':('This attack does 10 damage for each card in your hand.',E('handCountDamage',source='self',amount=10,mode='replace')),
 'Double Draw':('Draw 2 cards.',DRAW(2)),
 'Solar Heat':('If there is any Stadium card in play, this attack does 20 more damage.',BONUS(20,{'type':'stadiumInPlay'})),
 'Double Stomp':('Flip 2 coins. This attack does 40 more damage for each heads.',COIN(2,40,False)),
 'Kick Away':('Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.',E('forceOpponentSwitch',chooseBy='defender')),
 'Dangerous Claws':("If your opponent's Active Pokémon is a Basic Pokémon, this attack does 30 more damage.",BONUS(30,{'type':'opponentMatches','filter':{'stage':'Basic'}})),
 'Enhanced Fang':('If this Pokémon has a Pokémon Tool card attached to it, this attack does 50 more damage.',BONUS(50,{'type':'selfHasTool'})),
 'Zap Cannon':("This Pokémon can't use Zap Cannon during your next turn.",E('lock',action='attack',target='self',attackName='Zap Cannon',duration='nextOwnTurn')),
 'See Through':('Your opponent reveals their hand.',E('revealHand',side='opponent')),
 'Bouffant Head':("During your opponent's next turn, this Pokémon takes 30 less damage",GUARD(30)),
 'Mix-Up':("Flip a coin. If heads, discard the top 3 cards of your opponent's deck.",Q(E('discardTop',side='opponent',amount=3))),
 'Tantrum':('This Pokémon is now Confused.',ST('confusion','self')),
 'Cross-Cut':("If your opponent's Active Pokémon is an Evolution Pokémon, this attack does 60 more damage.",BONUS(60,{'type':'opponentMatches','filter':{'evolved':True}})),
 'Bedrock Breaker':('Discard any Stadium card in play.',E('discardStadium')),
 'Distort':("Your opponent can't play any Item cards from their hand during their next turn.",E('actionLock',cardType='Item',side='opponent',duration='opponentTurn')),
 'Sonic Volume':("Your opponent can't play any Special Energy cards from their hand during their next turn.",E('actionLock',cardType='SpecialEnergy',side='opponent',duration='opponentTurn')),
 'Boomburst-GX':("This attack does 50 damage to each of your opponent's Pokémon.",S(BONUS(50),E('benchDamage',side='opponent',amount=50,all=True))),
 'Rock Wrecker':("This attack's damage isn't affected by Weakness or Resistance. This Pokémon can't attack during your next turn.",S(E('damageRule',ignoreWeakness=True,ignoreResistance=True),E('lock',action='attack',target='self',duration='nextOwnTurn'))),
 'Brick Break':("This attack's damage isn't affected by Resistance or any effects on your opponent's Active Pokémon.",E('damageRule',ignoreResistance=True,ignoreEffects=True)),
 'Muscle Punch-GX':("This attack's damage isn't affected by Resistance.",E('damageRule',ignoreResistance=True)),
}

def attack(row,a):
    title,cost,damage,printed=a
    if not norm(printed):return N
    if title=='Water Arrow' and ('This attack does 10 damage' in printed or 'This attack does 30 damage' in printed):
        import re
        amount=int(re.search(r'This attack does (\d+) damage',printed).group(1))
        return E('selectedDamage',target='opponentPokemon',amount=amount)
    verified=SM3_ATTACKS.get(title)
    if verified and norm(verified[0]) in norm(printed):return deepcopy(verified[1])
    key=(title,tuple(cost),damage,norm(printed))
    if key in ATTACKS:return deepcopy(ATTACKS[key])
    # Proven generic attack adapter must still match the whole text. This
    # doesn't turn vague or novel effect text into noop.
    match=BONUS_MOVES.get(title)
    if match and norm(match[0])==norm(printed):return deepcopy(match[1])
    # Shared generic parser is conservative: only exact whole-text patterns.
    # Never copy the SM2-specific number overrides into SM3.
    candidate=previous_attack(row,a)
    return deepcopy(candidate) if candidate and candidate.get('type')!='unsupported' else None

# Print-specific trainer types are declared only where identical to an
# earlier fully implemented Trainer. New SM3 effects stay gated.
TRAINER_EFFECTS={}
rows=json.loads((ROOT/'data/classic/sm3-print-compact.json').read_text(encoding='utf8'))
for row in rows:
    if row[2]!='Trainer':continue
    key=(row[1],norm(' '.join(row[13] or [])))
    if key in TRAINERS:TRAINER_EFFECTS[str(row[0])]=deepcopy(TRAINERS[key])

# These Basic Energy prints are real card data, not Special Energy effects.
BASIC={'167':'Fire','168':'Darkness','169':'Fairy'}
ENERGIES={}
TRAINERS=TRAINER_EFFECTS

# Activated and passive Abilities are only reused when their text matches.
ABILITY_EFFECTS={}
for row in rows:
    for a in row[8]:
        key=(a[0],norm(a[2]))
        if key in ABILITIES:ABILITY_EFFECTS[a[0]]=deepcopy(ABILITIES[key])
ABILITIES=ABILITY_EFFECTS
