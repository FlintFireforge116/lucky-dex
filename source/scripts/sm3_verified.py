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


# SM3 continuation: a printed-text guard is mandatory for EVERY new mapping.
# No attack may be enabled merely because its name appears in this table.
SM3_CONTINUATION_ATTACKS={
 'Giga Drain':('Heal from this Pokémon the same amount of damage you did',E('drain')),
 'Pitch':("Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.",E('forceOpponentSwitch',chooseBy='defender')),
 'Bubble Net':("Energy can't be attached to the Defending Pokémon from your opponent's hand",E('actionLock',side='opponent',cardType='EnergyActive',duration='opponentTurn')),
 'Diabolical Claws':('This attack does 50 damage for each Prize card you have taken.',E('pointDamage',side='self',amount=50,prizesTaken=True)),
 "Queen's Haze-GX":("Discard all Energy from your opponent's Active Pokémon.",E('discardEnergyCard',target='opponentActive',amount='all')),
 'Venting Anger':('This attack does 50 damage for each Magikarp in your discard pile.',E('discardCountDamage',side='self',filter={'name':'Magikarp'},amount=50,mode='replace')),
 'Aqua Shock':("If your opponent's Active Pokémon has any Water Energy attached to it",BONUS(30,{'type':'opponentEnergyAtLeast','energyType':'Water','amount':1,'countSpecial':True})),
 'Small Appetite':("If your opponent's Active Pokémon's maximum HP is 100 or more",E('attackDamageGate',condition={'type':'opponentMatches','filter':{'hpAtMost':99}})),
 "Night Roam":("Put 1 damage counter on each Pokémon (both yours and your opponent's).",S(E('selfDamage',amount=10),E('benchDamage',side='self',amount=10,all=True),E('placeDamageCounters',target='opponentAll',amount=10))),
 'Poison Boost':('If this Pokémon is Poisoned, this attack does 80 more damage.',S(BONUS(80,{'type':'selfStatus','status':'poison'}),E('removeStatuses',target='self',statuses=['poison'],condition={'type':'selfStatus','status':'poison'}))),
 'Toppling Wind':('n/a',N), # Ability, never used as attack
 'Quick Guard':('Prevent all damage done to this Pokémon by attacks from Basic Pokémon',S(E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'Basic'}),E('lock',action='attack',target='self',attackName='Quick Guard',duration='nextOwnTurn'))),
 'Vigorous Dash':('This Pokémon does 30 damage to itself. This attack does 30 damage',S(E('selfDamage',amount=30),E('selectedDamage',target='opponentBench',amount=30))),
 'Focus Energy':("During your next turn, this Pokémon's Bite attack's base damage is 60.",E('nextAttackBonus',attackName='Bite',amount=50)),
 'Division':('Search your deck for Alolan Grimer and put it onto your Bench.',E('benchFromDeck',amount=1,filter={'name':'Alolan Grimer','stage':'Basic'},choose=True)),
 'Chemical Breath':("This attack does 70 more damage for each Special Condition affecting your opponent's Active Pokémon.",E('statusCountDamage',amount=70,mode='add')),
 'Crunch':('Discard an Energy',E('discardEnergyCard',target='opponentActive',amount=1)),
 'Tri Hazard-GX':("Switch 1 of your opponent's Benched Pokémon with their Active Pokémon.",S(E('forceOpponentSwitch',chooseBy='attacker'),ST('burn'),ST('poison'),ST('paralysis'))),
 'Hone Claws':("During your next turn, this Pokémon's Slash attack's base damage is 80.",E('nextAttackBonus',attackName='Slash',amount=60)),
 'Dark Raid':('If your opponent has already used their GX attack',BONUS(80,{'type':'opponentGxUsed'})),
 'Energy Slosh':('You may move all Energy attached to this Pokémon to 1 of your Benched Pokémon.',E('moveEnergy',source='self',target='selfBench',amount='all',includeSpecialEnergy=True)),
 'Core Enforcer':('Discard a Darkness Energy and a Fairy Energy attached to this Pokémon.',S(E('discardEnergyCard',target='self',amount=1,energyType='Darkness',strictEnergyType=True),E('discardEnergyCard',target='self',amount=1,energyType='Fairy',strictEnergyType=True))),
 'Calculate':('Look at the top 6 cards of your deck and put them back in any order.',E('reorderTop',count=6,deckSide='self')),
 'Knock Over':('You may discard any Stadium card in play.',E('chooseOption',options=[{'label':'Keep Stadium','effect':N},{'label':'Discard Stadium','effect':E('discardStadium')}],optional=True)),
 'Lycanfang-GX':('Discard 2 Energy from this Pokémon.',E('discardEnergyCard',target='self',amount=2)),
}
# Names are disambiguated by both printed text and, where necessary, exact number.
SM3_CONTINUATION_ABILITIES={
 'Evoshock':('When you play this Pokémon from your hand to evolve',{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':ST('paralysis')}),
 'Toppling Wind':('When you play this Pokémon from your hand to evolve',{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('discardTop',side='opponent',amount=3)}),
 'Honey Gather':('Once during your turn (before your attack), you may search your deck for up to 2 basic Energy cards',{'type':'activated','oncePerTurn':True,'effect':E('searchChosen',source='deck',amount=2,filter={'basicEnergy':True})}),
}


# Stage 3: only printed-text matched mechanics; unsupported prints stay gated.
SM3_STAGE3_ATTACKS={
 'Downer Shock':('Flip a coin. If heads, your opponent', E('coinFlip',heads=ST('sleep'),tails=ST('confusion'))),
 'Leaf Supply':('You may attach a Grass Energy card from your hand to 1 of your Pokémon.',E('sm3Rule',rule='leafSupply')),
 'Brine':('This attack does 90 damage to 1 of your opponent',E('sm3Rule',rule='brine')),
 'Tornado Shot':('Discard a Water Energy from this Pokémon.',S(E('discardEnergyCard',target='self',amount=1,energyType='Water',strictEnergyType=True),E('sm3Rule',rule='tornadoShotBench'))),
 'Aqua Ring':('You may switch this Pokémon with 1 of your Benched Pokémon.',E('sm3Rule',rule='aquaRing')),
 'Hydro Shot':('Discard 2 Water Energy from this Pokémon.',S(E('discardEnergyCard',target='self',amount=2,energyType='Water',strictEnergyType=True),E('selectedDamage',target='opponentPokemon',amount=120))),
 'Tapu Storm-GX':("Shuffle your opponent's Active Pokémon and all cards attached to it into their deck.",E('sm3Rule',rule='tapuStorm')),
 'Prismatic Burst':('Discard all Psychic Energy from this Pokémon.',E('sm3Rule',rule='prismaticBurst')),
 'Black Ray-GX':('This attack does 100 damage to each of your opponent',E('damage',target='opponentAll',filter={'isExOrGX':True},amount=100)),
 'Gutsy Hammer':('This Pokémon does 10 damage to itself for each damage counter on it.',E('sm3Rule',rule='gutsyHammer')),
 'Rule of Evil':('This attack does 60 damage to each Pokémon that has an Ability',E('sm3Rule',rule='ruleOfEvil')),
 'Dead End-GX':('If your opponent\'s Active Pokémon is affected by a Special Condition',E('knockOut',target='opponentActive',condition={'type':'opponentStatus'})),
 'Infinite Force':('This attack does 30 damage times the amount of Energy attached to both Active Pokémon.',E('energyDamage',source='both',amount=30,mode='replace')),
 'Twilight-GX':('Shuffle 10 cards from your discard pile into your deck.',E('sm3Rule',rule='twilight')),
 'Diamond Storm':('Heal 30 damage from each of your Fairy Pokémon.',E('heal',target='selfAll',filter={'subtype':'Fairy'},amount=30)),
 'Strength Sap':('Heal from this Pokémon 30 damage times the amount of Energy attached',E('sm3Rule',rule='strengthSap')),
 'Code Check':('Look at 1 of your opponent\'s face-down Prize cards.',E('sm3Rule',rule='codeCheck')),
 'Night Raid':('Your opponent reveals their hand. Discard a Pokémon from it.',E('sm3Rule',rule='nightRaid')),
 "Nature's Judgment":('You may discard all Energy from this Pokémon.',E('sm3Rule',rule='naturesJudgment')),
 'Tapu Wilderness-GX':('Heal all damage from this Pokémon.',E('healSelf',amount=9999)),
 'Eternal Flame-GX':('Put 3 in any combination of Fire Pokémon-GX or Fire Pokémon-EX from your discard pile',E('sm3Rule',rule='eternalFlame')),
 'Synchronoise':("This attack does 20 damage to each of your opponent's Benched Pokémon that shares a type",E('sm3Rule',rule='synchronoise')),

}
SM3_STAGE3_ABILITIES={
 'Disgusting Pollen':('As long as this Pokémon is your Active Pokémon, your opponent',{'type':'passive','activeOnly':True,'effect':E('sm3Rule',rule='disgustingPollen')}),
 'Guts':('If this Pokémon would be Knocked Out by damage from an attack',{'type':'passive','effect':E('koGuard',mode='surviveCoin',remainingHp=10,attackOnly=True)}),
 'Wimp Out':('During your first turn, this Pokémon has no Retreat Cost.',{'type':'passive','effect':E('sm3Rule',rule='wimpOut')}),
 'Luminous Barrier':('Prevent all effects of attacks, including damage',{'type':'passive','effect':E('sm3Rule',rule='luminousBarrier')}),
 'Thick Fat':('This Pokémon takes 30 less damage from the attacks of your opponent',{'type':'passive','effect':E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay',opponentFilter={'subtype':['Fire','Water']})}),
 'More Poison':("Put 1 more damage counter on your opponent's Poisoned Pokémon between turns.",{'type':'passive','effect':E('sm3Rule',rule='morePoison')}),
 "Light's End":('Prevent all damage done to this Pokémon by attacks from Colorless Pokémon.',{'type':'passive','effect':E('sm3Rule',rule='lightsEnd')}),
 'Heal Block':('If you have Solrock in play',{'type':'passive','effect':E('healingBlock',scope='both',condition={'type':'pokemonPresent','zone':'inPlay','filter':{'name':'Solrock'}})}),
 'Secret Spring':('Once during your turn (before your attack), you may attach a Fairy Energy card from your hand',{'type':'activated','oncePerTurn':True,'effect':E('sm3Rule',rule='secretSpring')}),
 'Stance':('When you play this Pokémon from your hand to evolve',{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)}),
}

def attack(row,a):
    title,cost,damage,printed=a
    if not norm(printed):return N
    if title=='Water Arrow' and ('This attack does 10 damage' in printed or 'This attack does 30 damage' in printed):
        import re
        amount=int(re.search(r'This attack does (\d+) damage',printed).group(1))
        return E('selectedDamage',target='opponentPokemon',amount=amount)
    stage3=SM3_STAGE3_ATTACKS.get(title)
    if stage3 and norm(stage3[0]) in norm(printed):return deepcopy(stage3[1])
    newly=SM3_CONTINUATION_ATTACKS.get(title)
    if newly and norm(newly[0]) in norm(printed):return deepcopy(newly[1])
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
# Trainer effects are validated against their individual pinned printed rules.
SM3_TRAINER_MAP={
    '113':('Bodybuilding Dumbbells',E('modifier',stat='maxHp',amount=40,scope='self',duration='whileInPlay',filter={'stage':'Stage 1'})),
    '114':('Escape Rope',E('neoRule',rule='bw8:escapeRope')),
    '117':('Lana',E('heal',target='selfAll',filter={'hasEnergyType':'Water'},amount=50)),
    '118':('Mount Lanakila',E('modifier',stat='retreatCost',amount=1,scope='both',duration='whileInPlay',filter={'stage':'Basic'})),
    '119':('Olivia',E('searchChosen',source='deck',amount=2,filter={'pokemonGX':True})),
    '121':('Po Town',N), # Trigger implemented in battle-core for BOTH players on hand evolution.
    '122':('Rotom Dex Poké Finder Mode',E('chooseOption',options=[
        {'label':'Reorder top four physical deck cards','effect':E('reorderTop',count=4)},
        {'label':'Shuffle the physical deck instead','effect':E('shuffleDeck',side='self')}],optional=True)),
    '124':('Super Scoop Up',E('neoRule',rule='hgss2:83:superScoopUp')),
    '126':('Weakness Policy',E('weaknessGuard',duration='whileInPlay')),
    '127':('Wicke',E('handShuffle',side='both',draw='same')),
}
# New Trainers: retain individual identity and enforce actual printed choices.
for _n,_name,_rule in [
  ('112','Acerola','acerola'),('112a','Acerola','acerola'),('142','Acerola','acerola'),
  ('115','Guzma','guzma'),('115a','Guzma','guzma'),('143','Guzma','guzma'),
  ('125','Tormenting Spray','tormentingSpray')]:
    SM3_TRAINER_MAP[_n]=(_name,E('sm3Rule',rule=_rule))
# Alternate and secret printed variants share exactly the same public rules.
for original,variants in {'113':['161'],'114':['163'],'124':['166'],'127':['147']}.items():
    for number in variants:SM3_TRAINER_MAP[number]=SM3_TRAINER_MAP[original]
for row in rows:
    if row[2]!='Trainer':continue
    number=str(row[0]);pair=SM3_TRAINER_MAP.get(number)
    if pair and row[1]==pair[0] and row[13]:TRAINER_EFFECTS[number]=(row[3][0],deepcopy(pair[1]))

BASIC={'167':'Fire','168':'Darkness','169':'Fairy'}
ENERGIES={}
TRAINERS=TRAINER_EFFECTS

# Activated and passive Abilities are only reused when their text matches.
ABILITY_EFFECTS={}
for row in rows:
    for a in row[8]:
        key=(a[0],norm(a[2]))
        if key in ABILITIES:ABILITY_EFFECTS[a[0]]=deepcopy(ABILITIES[key])
# Ability content is checked against the pinned print before registry promotion.
for row in rows:
    for title,ability_type,printed in row[8]:
        pair=SM3_CONTINUATION_ABILITIES.get(title)
        if pair and norm(pair[0]) in norm(printed):ABILITY_EFFECTS[title]=deepcopy(pair[1])
for row in rows:
    for title,ability_type,printed in row[8]:
        pair=SM3_STAGE3_ABILITIES.get(title)
        if pair and norm(pair[0]) in norm(printed):ABILITY_EFFECTS[title]=deepcopy(pair[1])
ABILITIES=ABILITY_EFFECTS
