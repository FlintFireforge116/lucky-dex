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

def attack(row,a):
    title, cost, dmg, printed = a
    text=_norm(printed)
    if not text:return N
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
 '119':('Item',E('attachEnergyFromDiscard',target='selfBench',energyType='Water',amount=1,filter={'subtype':'Water'})),
 '124':('Item',E('discardEnergyCard',amount=1,target='opponentPokemon',specialOnly=True)),
 '129':('Item',E('moveEnergy',source='selfBench',target='selfActive',amount=1)),
 '144':('Supporter',DRAW(3)),
 '165':('Item',E('rareCandy')),
}
for a,b in [('119',['161']),('124',['124a','162'])]:
    for x in b:TRAINERS[x]=TRAINERS[a]

ABILITIES={
 'Armor':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay')},
 'Slush Rush':{'type':'activated','oncePerTurn':True,'effect':DRAW(1)},
 'Hot Poison':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':S(ST('burn'),ST('poison'))},
 'Steelworker':{'type':'passive','effect':E('modifier',stat='attackDamage',amount=10,scope='team',duration='whileInPlay',filter={'subtype':'Metal'})},
 'Bulletproof':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=10,scope='self',duration='whileInPlay')},
 'Fresh Egg':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':H(80,'selfActive')},
 'Rake It In':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':DRAW(3)},
 'Roadblock':{'type':'passive','effect':N}, # Classic has max 3 Bench, so the printed max-4 rule is inert
 'Bloodthirsty Eyes':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('forceOpponentSwitch',chooseBy='attacker')},
 'Wonder Tag':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':SEARCH(1,kind='trainer',trainerType='Supporter')},
 'Feather Arrow':SM1_ABILITIES['Feather Arrow'],
}
