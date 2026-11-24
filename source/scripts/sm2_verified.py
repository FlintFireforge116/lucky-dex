"""Guardians Rising SM2 source-locked effect adapter.

No guessed fallback effects: unmapped printed rules gate the whole collector print.
Identical printed mechanics from SM1 reuse the audited SM1 descriptors, while
SM2-specific mechanics are keyed by exact attack name and text.
"""
import re
from sm1_verified import N, S, Q, ST, H, DISC, COIN, SEARCH, BENCH, BONUS, SWITCH, DRAW, LOCK, GUARD, OPT
from sm1_verified import attack as sm1_attack, ABILITIES as SM1_ABILITIES
from xy8_verified import attack as generic_attack
E=lambda t,**kw:{'type':t,**kw}

# Mechanic reuse must match BOTH title and printed text, never collector number.
_reprints={}
def _norm(txt):
    txt=re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)', '', txt or '', flags=re.I)
    return re.sub(r'\s+', ' ', txt).strip().casefold()

def _source_effects():
    import json
    from pathlib import Path
    f=Path(__file__).resolve().parents[1]/'data/classic/sm1-print-compact.json'
    if not f.exists():return
    for row in json.loads(f.read_text(encoding='utf-8')):
        for a in row[7]:
            effect=sm1_attack(row,a)
            if effect is not None:
                _reprints.setdefault((a[0],_norm(a[3]),a[2]),effect)
_source_effects()

# These attack descriptors are already understood by the shared battle core.
EXACT={
 'Pollen Hazard': S(ST('burn'),ST('confusion'),ST('poison')),
 'Blot':H(10),
 'Horn Leech':H(30),
 'Roaring Seas':DISC(1,'opponentActive'),
 'Gigatron-GX':E('benchDamage',side='opponent',amount=60,all=True),
 'Tapu Thunder-GX':E('energyDamage',source='opponent',all=True,amount=50,mode='replace'),
 'Dangerous Rogue-GX':E('benchCountDamage',side='opponent',amount=50,mode='replace'),
 'Giga Hammer':E('lock',action='attack',target='self',attackName='Giga Hammer',duration='nextOwnTurn'),
 'Algorithm-GX':SEARCH(5,kind='any'),
 'Magical Ribbon':SEARCH(3,kind='any'),
 'Big Wheel-GX':E('handShuffle',draw=10),
 'Burning Slam-GX':ST('burn'),
 'Adamantine Press':GUARD(30),
 'Shred':E('damageRule',ignoreEffects=True),
 'Spike Cannon':COIN(4,30),
 'Bright Flame':DISC(2,'self','Fire'),
 'Blizzard Edge':DISC(2),
 'Super Zap Cannon':DISC(2),
 'Charge Beam':E('attachEnergyFromDiscard',target='self',amount=1),
 'Ice Blade':E('selectedDamage',target='opponentPokemon',amount=50),
 'Berserk':BONUS(70,{'type':'selfBenchDamaged'}),
 'Righteous Edge':E('discardEnergyCard',amount=1,target='opponentActive',specialOnly=True),
 'Torrential Vortex':E('discardEnergyCard',amount=1,target='opponentActive',specialOnly=True),
 'Energy Drive':S(E('energyDamage',source='both',amount=20,mode='replace'),E('damageRule',ignoreWeakness=True,ignoreResistance=True)),
 'Total Shelter-GX':E('preventDamage',target='self',duration='opponentTurn',preventEffects=True),
 'Ultra Uppercut-GX':N,
 'Grand Echo-GX':H(9999,'selfAll'),
 'Hollow Hunt-GX':E('sm1Rule',rule='hollowHunt'),
 'Tiger Swing':COIN(2,50,False),
 'Hustling Strike':E('fieldCountDamage',side='self',benchOnly=True,filter={'subtype':'Fire'},amount=20,mode='add'),
 'Bubble Beat':E('energyDamage',source='self',all=True,energyType='Water',amount=20,mode='add'),
}
# Exact matching title alone is insufficient for most recurring attacks.
# Exceptions are used only when the printed description has been verified.
SAFE_EXACT_TEXT={
 'Pollen Hazard':'Your opponent\'s Active Pokémon is now Burned, Confused, and Poisoned.',
 'Gigatron-GX':'This attack does 60 damage to each of your opponent\'s Benched Pokémon.',
 'Tapu Thunder-GX':'This attack does 50 damage times the amount of Energy attached to all of your opponent\'s Pokémon.',
 'Dangerous Rogue-GX':'This attack does 50 damage for each of your opponent\'s Benched Pokémon.',
 'Giga Hammer':"This Pokémon can't use Giga Hammer during your next turn.",
 'Algorithm-GX':'Search your deck for up to 5 cards',
 'Magical Ribbon':'Search your deck for up to 3 cards',
 'Big Wheel-GX':'Shuffle your hand into your deck. Then, draw 10 cards.',
 'Burning Slam-GX':"Your opponent's Active Pokémon is now Burned.",
 'Spike Cannon':'Flip 4 coins. This attack does 30 damage for each heads.',
 'Bright Flame':'Discard 2 Fire Energy from this Pokémon.',
 'Blizzard Edge':'Discard 2 Energy from this Pokémon.',
 'Super Zap Cannon':'Discard 2 Energy from this Pokémon.',
 'Charge Beam':'Attach an Energy card from your discard pile to this Pokémon.',
 'Ice Blade':'This attack does 50 damage to 1 of your opponent\'s Pokémon.',
 'Berserk':'If your Benched Pokémon have any damage counters on them',
 'Righteous Edge':'Discard a Special Energy from your opponent\'s Active Pokémon.',
 'Torrential Vortex':'Discard a Special Energy from your opponent\'s Active Pokémon.',
 'Energy Drive':'This attack does 20 damage times the amount of Energy attached to both Active Pokémon.',
 'Total Shelter-GX':'Prevent all effects of attacks, including damage, done to this Pokémon',
 'Grand Echo-GX':'Heal all damage from all of your Pokémon.',
 'Hollow Hunt-GX':'Put 3 cards from your discard pile into your hand.',
 'Tiger Swing':'Flip 2 coins. This attack does 50 more damage for each heads.',
 'Hustling Strike':'This attack does 20 more damage for each of your Benched Fire Pokémon.',
 'Bubble Beat':'This attack does 20 more damage times the amount of Water Energy attached to your Pokémon.',
 'Pollen Hazard':"Your opponent's Active Pokémon is now Burned, Confused, and Poisoned.",
 'Blot':'Heal 10 damage from this Pokémon.',
 'Horn Leech':'Heal 30 damage from this Pokémon.',
 'Roaring Seas':"Discard an Energy from your opponent's Active Pokémon.",
 'Adamantine Press':'During your opponent\'s next turn, this Pokémon takes 30 less damage',
 'Shred':"This attack's damage isn't affected by any effects",
}

# Independent Guardians Rising attack-effect audit, v0.69.403.
# Promote ONLY effects that have a one-to-one tested descriptor in the shared
# battle engine; all remaining unique mechanics keep the whole print gated.
AUDITED_EXACT={
 'Muddy Acid': Q(DISC(1,'opponentActive')),
 'Poltergeist': S(E('revealHand',side='opponent'),E('filteredHandCountDamage',side='opponent',filter={'kind':'trainer'},amount=30,mode='replace')),
 'Scamper Away': E('shuffleIntoDeck',target='self',includeAttached=True),
 'Resolute Claws': S(BONUS(70,{'type':'opponentMatches','filter':{'pokemonGX':True}}),BONUS(70,{'type':'opponentEx'})),
 'Venoshock': BONUS(40,{'type':'opponentStatus','status':'poison'}),
 'Super Intense Poison': E('status',target='opponentActive',status='poison',amount=100),
 'Dive': Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 'Open Sea': E('heal',amount=30,target='selfAll',filter={'subtype':'Water'}),
 'Double Shot': E('multiTargetDamage',target='opponentBench',count=2,amount=10,upTo=True),
 'Settle the Score': E('pointsGainedLastTurnDamage',amount=80,mode='add'),
 'Cosmicsplosion': E('knockOut',target='self'),
 'Fangs of the Sunne': E('lock',action='attack',target='self',attackName='Fangs of the Sunne',duration='nextOwnTurn'),
 'Stick and Absorb': S(H(20), LOCK()),
 'Petal Blizzard': S(BONUS(10), BENCH(10)),
 'Petal Dance': S(COIN(3,40), ST('confusion','self')),
 'Beacon': SEARCH(2,kind='pokemon'),
 'Seething Tentacles': Q(BONUS(40),ST('paralysis')),
 'Crunch': Q(DISC(1,'opponentActive')),
 'Raging Floe': BONUS(80,{'type':'selfDamaged'}),
 'Triple Spin': COIN(3,10),
 'Ice Shard': BONUS(30,{'type':'opponentMatches','filter':{'subtype':'Fighting'}}),
 'Hail': S(BONUS(20),BENCH(20)),
 'Sharpshooting': E('selectedDamage',target='opponentPokemon',amount=10,ignoreWeakness=True,ignoreResistance=True),
 'Bail Out': SEARCH(1,source='discard',kind='pokemon'),
 'Thunder Punch': Q(BONUS(20),E('selfDamage',amount=20)),
 'Stomp Off': E('discardTop',side='opponent',amount=1),
 'Acid Spray': Q(DISC(1,'opponentActive')),
 'Filch': DRAW(2),
 'Shatter Shot': E('energyDamage',source='self',energyType='Psychic',amount=40,mode='replace'),
 'Dual Chop': COIN(2,30),
 'Ice Shard': BONUS(30,{'type':'opponentMatches','filter':{'subtype':'Fighting'}}),
 'Double Kick': COIN(2,30),
 'Enhanced Stomp': BONUS(60,{'type':'selfHasTool'}),
 'Swift': E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
 'Whirlwind': E('forceOpponentSwitch',chooseBy='defender'),
 'Feint Attack': E('selectedDamage',target='opponentPokemon',amount=30,ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
 'Limitation': E('actionLock',cardType='Supporter',side='opponent',duration='opponentTurn'),
 'Core Beam': DISC(1,'self','Metal'),
 'Energy Link': E('attachEnergyFromDiscard',target='self',amount=1),
 'Shining Arrow': E('selectedDamage',target='opponentPokemon',amount=50,ignoreWeakness=True,ignoreResistance=True),
 'Follow Me': E('forceOpponentSwitch',chooseBy='attacker'),
 'Meteor Mash': E('nextAttackBonus',attackName='Meteor Mash',amount=60),
 'Continuous Tumble': COIN('untilTails',10),
 'Sweet Kiss': E('draw',side='opponent',amount=1),
 'Bubble': Q(ST('paralysis')),
 'Power Cyclone': E('moveEnergy',source='self',target='selfBench',amount=1),
 'Agility': Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 'Weather Teller': SEARCH(2,kind='trainer',trainerType='Stadium'),
 'Growl': E('modifier',stat='attackDamage',amount=-20,scope='opponentActive',duration='opponentTurn'),
 'Dangerous Blow': BONUS(60,{'type':'opponentMatches','filter':{'stage':'Basic'}}),
}
AUDITED_TEXT={
 'Muddy Acid': 'Flip a coin. If heads, discard an Energy from your opponent',
 'Poltergeist': 'Your opponent reveals their hand. This attack does 30 damage for each Trainer card',
 'Scamper Away': 'Shuffle this Pokémon and all cards attached to it into your deck.',
 'Resolute Claws': "If your opponent's Active Pokémon is a Pokémon-GX or a Pokémon-EX",
 'Venoshock': "If your opponent's Active Pokémon is Poisoned, this attack does 40 more damage.",
 'Super Intense Poison': 'Put 10 damage counters instead of 1 on that Pokémon between turns.',
 'Dive': 'Flip a coin. If heads, prevent all effects of attacks, including damage',
 'Open Sea': 'Heal 30 damage from each of your Water Pokémon.',
 'Double Shot': "This attack does 10 damage to 2 of your opponent's Benched Pokémon.",
 'Settle the Score': 'This attack does 80 more damage for each Prize card your opponent took on their last turn.',
 'Cosmicsplosion': 'This Pokémon is Knocked Out.',
 'Fangs of the Sunne': "This Pokémon can't use Fangs of the Sunne during your next turn.",
 'Stick and Absorb': 'Heal 20 damage from this Pokémon.',
 'Petal Blizzard': 'This attack does 10 damage to each of your opponent',
 'Petal Dance': 'Flip 3 coins. This attack does 40 damage for each heads.',
 'Beacon': 'Search your deck for up to 2 Pokémon',
 'Seething Tentacles': 'Flip a coin. If heads, this attack does 40 more damage.',
 'Crunch': 'Flip a coin. If heads, discard an Energy from your opponent',
 'Raging Floe': 'If this Pokémon has any damage counters on it, this attack does 80 more damage.',
 'Triple Spin': 'Flip 3 coins. This attack does 10 damage for each heads.',
 'Ice Shard': "If your opponent's Active Pokémon is a Fighting Pokémon",
 'Hail': 'This attack does 20 damage to each of your opponent',
 'Sharpshooting': 'This attack does 10 damage to 1 of your opponent',
 'Bail Out': 'Put a Pokémon from your discard pile into your hand.',
 'Thunder Punch': 'If heads, this attack does 20 more damage.',
 'Stomp Off': "Discard the top card of your opponent's deck.",
 'Acid Spray': 'Flip a coin. If heads, discard an Energy from your opponent',
 'Filch': 'Draw 2 cards.',
 'Shatter Shot': 'This attack does 40 damage times the amount of Psychic Energy attached to this Pokémon.',
 'Dual Chop': 'Flip 2 coins. This attack does 30 damage for each heads.',
 'Double Kick': 'Flip 2 coins. This attack does 30 damage for each heads.',
 'Enhanced Stomp': 'If this Pokémon has a Pokémon Tool card attached to it',
 'Swift': "This attack's damage isn't affected by Weakness, Resistance",
 'Whirlwind': 'Your opponent switches their Active Pokémon',
 'Feint Attack': 'This attack does 30 damage to 1 of your opponent',
 'Limitation': "Your opponent can't play any Supporter cards",
 'Core Beam': 'Discard a Metal Energy from this Pokémon.',
 'Energy Link': 'Attach an Energy card from your discard pile to this Pokémon.',
 'Shining Arrow': 'This attack does 50 damage to 1 of your opponent',
 'Follow Me': "Switch 1 of your opponent's Benched Pokémon with their Active Pokémon.",
 'Meteor Mash': "During your next turn, this Pokémon's Meteor Mash attack does 60 more damage",
 'Continuous Tumble': 'Flip a coin until you get tails. This attack does 10 damage for each heads.',
 'Sweet Kiss': 'Your opponent draws a card.',
 'Bubble': 'Flip a coin. If head',
 'Power Cyclone': 'Move an Energy from this Pokémon to 1 of your Benched Pokémon.',
 'Agility': 'Flip a coin. If heads, prevent all effects of attacks',
 'Weather Teller': 'Search your deck for up to 2 Stadium cards',
 'Growl': "During your opponent's next turn, the Defending Pokémon's attacks do 20 less damage",
 'Dangerous Blow': "If your opponent's Active Pokémon is a Basic Pokémon",
}
# Avoid importing a descriptor from an unrelated print with the same title.
# A source-text assertion is required even for one-off mappings.

# Guardians Rising continuation: exact printed effects supported by the shared
# battle interpreter, with attack text assertions below. Never enable an effect
# by attack title alone.
CONTINUED_EXACT={
 'Wings of the Moone': E('distributeEnergy',source='self',target='selfBench',amount='all',includeSpecialEnergy=True),
 'Shell Trap': E('retaliateDamage',target='self',duration='opponentTurn',amount=80),
 'Nitro Tank-GX': E('distributeDiscardEnergy',target='selfPokemon',energyType='Fire',amount=5),
 'Ice Path-GX': E('moveDamage',target='self',destination='opponentActive',amount='all'),
 'Blue Surge-GX': E('distributeEnergy',source='self',target='selfBench',amount='all',includeSpecialEnergy=True),
 'Plea-GX': E('returnOpponentBench',count=2),
 'Passionate Dance': E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic','subtype':'Fire'},choose=True),
 'Borne Ashore': E('chooseOption',options=[
     {'label':'Bench a Basic Pokemon from your discard','effect':E('benchFromDiscard',side='self',amount=1,filter={'kind':'pokemon','stage':'Basic'})},
     {'label':"Bench a Basic Pokemon from opponent's discard",'effect':E('benchFromDiscard',side='opponent',amount=1,filter={'kind':'pokemon','stage':'Basic'})}]),
 'Rock Polish': E('modifier',stat='retreatCost',amount=-99,scope='self',duration='nextOwnTurn'),
 'Electromagnetic Rock Wrecker': E('coinDamageByEnergy',energyType='Lightning',countAttachedEnergyType=True,amount=80,mode='replace'),
 'Heavy Slam': E('retreatCostDamage',amount=30,negative=True,mode='add'),
 'Raging Thunder': E('selectedSelfBenchDamage',amount=30),
 'Feather Dance': E('nextAttackBonus',attackName='Pom-Pom Punch',amount=80),
 'Amnesia': E('chooseAttackLock',duration='opponentTurn'),
 'Facade': E('bonusDamage',amount=80,condition={'type':'selfStatusAny'}),
 'Trashalanche': E('discardCountDamage',side='opponent',filter={'kind':'trainer','trainerType':'Item'},amount=20,mode='replace'),
 'Blown Kiss': E('placeDamageCounters',target='opponentPokemon',amount=10),
 'Link Blast': BONUS(80,{'type':'equalEnergyCount'}),
 'Tractorbeam': S(E('forceOpponentSwitch',chooseBy='attacker'),E('damage',target='opponentActive',amount=30)),
 'Supernatural Dance': E('distributeDiscardCounters',amount=10),
 "Raven's Claw": E('damageFromDamage',source='opponent',all=True,amount=1,mode='add'),
 'Revelation Dance': E('attackDamageGate',condition={'type':'stadiumInPlay'}),
 'Tapu Cure-GX': E('multiTargetHeal',target='selfBench',amount=9999,count=2),
 'Finishing Stinger': E('attackDamageGate',condition={'type':'opponentDamaged'}),
 'Karate Chop': E('selfDamagePenalty',amount=1,mode='add'),
 'Power Whip': E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=20),
 'Beat Slider': E('forceOpponentSwitch',chooseBy='defender'),
 'Bind Wound': Q(E('chooseTarget',target='selfPokemon',effect=H(30,'selfPokemon'))),
 'Turbo Storm': E('attachEnergyFromDiscard',target='selfBench',amount=2),
 'Slam': COIN(2,60),
}
CONTINUED_TEXT={
 'Wings of the Moone':'Move all Energy from this Pokémon to your Benched Pokémon in any way you like.',
 'Shell Trap': 'During your opponent\'s next turn, if this Pokémon is damaged by an attack',
 'Nitro Tank-GX': 'Attach 5 Fire Energy cards from your discard pile to your Pokémon in any way you like.',
 'Ice Path-GX': 'Move all damage counters from this Pokémon to your opponent\'s Active Pokémon.',
 'Blue Surge-GX': 'Move all Energy from this Pokémon to your Benched Pokémon in any way you like.',
 'Plea-GX': 'Put 2 of your opponent\'s Benched Pokémon and all cards attached to them into your opponent\'s hand.',
 'Passionate Dance':'Search your deck for up to 3 Basic Fire Pokémon and put them onto your Bench.',
 'All the Presents':'Flip a coin until you get tails. For each heads, you may search your deck for a card',
 'Borne Ashore':"Put a Basic Pokémon from either player's discard pile onto its owner's Bench.",
 'Rock Polish':'During your next turn, this Pokémon has no Retreat Cost.',
 'Electromagnetic Rock Wrecker':'Flip a coin for each Lightning Energy attached to this Pokémon.',
 'Heavy Slam':"This attack does 30 less damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.",
 'Raging Thunder':'This attack does 30 damage to 1 of your Benched Pokémon.',
 'Feather Dance':"During your next turn, this Pokémon's Pom-Pom Punch attack's base damage is 100.",
 'Amnesia':"Choose 1 of your opponent's Active Pokémon's attacks.",
 'Facade':'If this Pokémon is Burned or Poisoned, this attack does 80 more damage.',
 'Trashalanche':"This attack does 20 damage for each Item card in your opponent's discard pile.",
 'Blown Kiss':"Put 1 damage counter on 1 of your opponent's Pokémon.",
 'Link Blast':"If this Pokémon and your opponent's Active Pokémon have the same amount of Energy",
 'Tractorbeam':"Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. This attack does 30 damage to the new Active Pokémon.",
 'Supernatural Dance':"For each Pokémon in your opponent's discard pile, put 1 damage counter on your opponent's Pokémon",
 "Raven's Claw":"This attack does 10 more damage for each damage counter on all of your opponent's Pokémon.",
 'Revelation Dance':'If there is no Stadium card in play, this attack does nothing.',
 'Tapu Cure-GX':'Heal all damage from 2 of your Benched Pokémon.',
 'Finishing Stinger':"If your opponent's Active Pokémon has no damage counters on it before this attack does damage, this attack does nothing.",
 'Karate Chop':'This attack does 10 less damage for each damage counter on this Pokémon.',
 'Power Whip':'This attack does 20 damage times the amount of Energy attached to this Pokémon to 1 of your opponent',
 'Beat Slider':'Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.',
 'Bind Wound':'Flip a coin. If heads, heal 30 damage from 1 of your Pokémon.',
 'Turbo Storm':'Attach 2 basic Energy cards from your discard pile to 1 of your Benched Pokémon.',
 'Slam':'Flip 2 coins. This attack does 60 damage for each heads.',
 'Hypno Roll':'This attack can be used if this Pokémon is Asleep.',
}

# Complete SM2-specific effects. An explicit rule name is checked against the
# pinned printed text before it is made playable; avoid attack-name fallbacks.
SM2_RULE_ATTACKS={
 'Kindle':('Discard an Energy from this Pokémon. If you do, discard an Energy from your opponent',E('sm2Rule',rule='kindle')),
 'Sludge Shock':("The Defending Pokémon can't be healed during your opponent",E('sm2Rule',rule='sludgeShock')),
 'Roll Call':('Search your deck for a Poliwag, a Poliwhirl, and a Poliwrath',E('sm2Rule',rule='rollCall')),
 'Hyper Jump':('You may shuffle this Pokémon and all cards attached to it into your deck.',E('sm2Rule',rule='hyperJump')),
 'All the Presents':('Flip a coin until you get tails. For each heads',E('sm2Rule',rule='allPresents')),
 'Frozen Breath':('You may discard 2 Water Energy from this Pokémon',E('sm2Rule',rule='frozenBreath')),
 'Copycat':("If your opponent's Pokémon used an attack that isn't a GX attack during their last turn",E('sm2Rule',rule='copycat')),
 'Landslip':('Discard the top 3 cards of your deck',E('sm2Rule',rule='landslip')),
 'Future Sight':("Look at the top 4 cards of either player's deck",E('sm2Rule',rule='futureSight')),
 'Doom News':('At the end of your opponent',E('sm2Rule',rule='doomNews')),
 'The Wages of Fluff':('If the Defending Pokémon is Knocked Out during your next turn',E('sm2Rule',rule='wagesOfFluff')),
 'Division':('Search your deck for up to 2 Sliggoo and put them onto your Bench',E('benchFromDeck',amount=2,filter={'name':'Sliggoo','kind':'pokemon'},choose=True)),
 'Amass':('Search your deck for a basic Energy card and attach it to this Pokémon.',E('sm2Rule',rule='amass')),
 'Swallow Dive':('If this Pokémon used Agility during your last turn',E('sm2Rule',rule='swallowDive')),
 'Glance':("Look at the top card of your opponent's deck.",E('inspectTop',side='opponent',amount=1)),
 'Scrutinize':("Look at the top 2 cards of your opponent's deck, discard 1 of them",E('sm2Rule',rule='scrutinize')),
 'Flame Charge':('Search your deck for a Fire Energy card and attach it to this Pokémon',E('sm2Rule',rule='flameCharge')),
 'Loop-the-Loop':('Put all Energy attached to this Pokémon into your hand.',E('sm2Rule',rule='loopTheLoop')),
 'Hypno Roll':('This attack can be used if this Pokémon is Asleep',E('sm2Rule',rule='hypnoRoll')),
}

def attack(row,a):
    title, cost, dmg, printed = a
    text=_norm(printed)
    if not text:return N
    if title in SM2_RULE_ATTACKS:
        required,descriptor=SM2_RULE_ATTACKS[title]
        if _norm(required) in text:return descriptor

    if title in CONTINUED_EXACT and _norm(CONTINUED_TEXT[title]) in text:
        return CONTINUED_EXACT[title]
    if title in AUDITED_EXACT and _norm(AUDITED_TEXT[title]) in text:
        return AUDITED_EXACT[title]
    key=(title,text,dmg)
    if key in _reprints:return _reprints[key]
    x=EXACT.get(title)
    if x is not None and _norm(SAFE_EXACT_TEXT.get(title,'')) in text and SAFE_EXACT_TEXT.get(title):return x
    # The old XY8 parser is used without the old expansion's collector-number
    # overrides; those belonged to different cards.
    temp=['_sm2_',*row[1:]]
    a2=list(a)
    a2[3]=re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)', '', a2[3]).strip()
    return generic_attack(temp,a2)

BASIC={'167':'Grass','168':'Lightning','169':'Fighting'}
ENERGIES={'166':E('specialEnergy',provides={'Colorless':2})}
# Only Trainer effects already supported by the existing battle renderer.
TRAINERS={
 '125':('Item',E('sm2FieldBlower')),
 '130':('Item',E('sm2RescueStretcher')),
 '126':('Supporter',E('sm2Hala')),
 '128':('Item',E('sm2MaxPotion')),
 '119':('Item',E('attachEnergyFromDiscard',target='selfBench',energyType='Water',amount=1,filter={'subtype':'Water'})),
 '124':('Item',E('discardEnergyCard',amount=1,target='opponentPokemon',specialOnly=True)),
 '129':('Item',E('moveEnergy',source='selfBench',target='selfActive',amount=1)),
 '144':('Supporter',DRAW(3)),
 '165':('Item',E('rareCandy')),
 '116':('Stadium',E('sm2Rule',rule='aetherParadise')),
 '117':('Stadium',E('sm2Rule',rule='altarMoone')),
 '118':('Stadium',E('sm2Rule',rule='altarSunne')),
 '120':('Stadium',E('stadiumAction',effect=E('sm2Rule',rule='brookletHill'))),
 '121':('Pokémon Tool',E('modifier',stat='attackDamage',amount=30,scope='self',duration='whileInPlay',sm2ChoiceBand=True)),
 '122':('Item',E('sm2Rule',rule='energyLoto')),
 '123':('Item',E('sm2Rule',rule='energyRecycler')),
 '127':('Supporter',E('sm2Rule',rule='mallow')),

}
TRAINERS['121a']=TRAINERS['121']
TRAINERS['145']=TRAINERS['127']
for a,b in [('119',['161']),('124',['124a','162']),('126',['143']),('128',['128a','164']),('125',['125a','163']),('130',['130a'])]:
    for x in b:TRAINERS[x]=TRAINERS[a]

ABILITIES={
 'Armor':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay')},
 'Slush Rush':{'type':'activated','oncePerTurn':True,'effect':DRAW(1)},
 'Hot Poison':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':S(ST('burn'),ST('poison'))},
 'Steelworker':{'type':'passive','effect':E('modifier',stat='attackDamage',amount=10,scope='team',duration='whileInPlay',filter={'subtype':'Metal'})},
 'Bulletproof':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=10,scope='self',duration='whileInPlay')},
 'Fresh Egg':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':H(80,'selfActive')},
 'Rake It In':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':DRAW(3)},
 'Roadblock':{'type':'passive','effect':E('sm7Rule',rule='sm115Roadblock')}, # expanded Bench cap handled in core
 'Bloodthirsty Eyes':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('forceOpponentSwitch',chooseBy='attacker')},
 'Wonder Tag':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':SEARCH(1,kind='trainer',trainerType='Supporter')},
 'Feather Arrow':SM1_ABILITIES['Feather Arrow'],
 'Victory Star':{'type':'passive','effect':E('coinReroll',scope='attack')},
 'Shady Move':{'type':'activated','oncePerTurn':True,'effect':E('sm2Rule',rule='shadyMove')},
 'Schooling':{'type':'activated','oncePerTurn':True,'effect':E('sm2Rule',rule='schooling')},
 'Aero Trail':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':E('sm2Rule',rule='aeroTrail')},
 'Vital Dance':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':E('sm2Rule',rule='vitalDance')},
 'Daunting Pose':{'type':'passive','effect':E('sm2Rule',rule='dauntingPose')},
 'Flower Shield':{'type':'passive','effect':E('sm2Rule',rule='flowerShield')},
 'Comatose':{'type':'passive','effect':E('sm2Rule',rule='comatose')},
 'Geotech System':{'type':'activated','oncePerTurn':True,'effect':E('chooseOption',options=[
   {'label':'Attach Psychic Energy from discard','effect':E('attachEnergyFromDiscard',target='selfActive',amount=1,energyType='Psychic')},
   {'label':'Attach Metal Energy from discard','effect':E('attachEnergyFromDiscard',target='selfActive',amount=1,energyType='Metal')},
   {'label':'Do not attach','effect':N}])},
}
