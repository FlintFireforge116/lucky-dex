"""XY8 BREAKthrough: mechanic-first, print-accurate mapping.

No speculative noop fallbacks. Pure damage is noop, all other attack text
requires an exact reusable pattern or print-specific mapping. BREAK reuses
LV.X previous-card inheritance, with normal Evolution timing; unmapped
printed BREAK attacks, persistent modifiers and special energies are gated.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw:{'type':t,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
# The printed number, not only attack name, is used where rules differ.
ATTACKS={
 ('1','Blot'):H(10),

 ('3','Heavy Suplex'):E('retreatCostDamage',source='opponent',amount=20,mode='add'),
 ('4','Swagger'):Q(E('discardEnergyCard',amount=1,target='opponentActive')),
 ('6','Fire Fling'):SEARCH(3,source='discard',kind='energy',basicEnergy=True,subtype='Fire'),
 ('6','Hand Fling'):E('handCountDamage',source='self',amount=10,mode='replace'),
 ('7','Nosh'):H(20),
 ('9','Tree Climb'):SEARCH(1,kind='energy',basicEnergy=True,subtype='Grass'),
 ('11','Spike Lariat'):BONUS(60,{'type':'opponentDamaged'}),
 ('11','Adamantine Press'):GUARD(20),
 ('12','Tough Hammer'):S(E('selfDamage',amount=30),E('multiTargetDamage',target='opponentBench',amount=30,count=1,upTo=True)),
 ('14','Protect'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('17','Overrun'):E('multiTargetDamage',target='opponentBench',amount=30,count=1,upTo=True),
 ('17','Horn Leech'):H(30),
 ('18','Ember'):DISC(1,'self','Fire'),
 # Both effects operate on physical top-deck refs and retain deck/discard ownership.
 ('19','Mini Eruption'):E('topDeckDiscardBonus',amount=30,filter={'kind':'energy'}),
 ('20','Massive Eruption'):S(E('topDeckCountDamage',side='self',count=5,amount=80,filter={'kind':'energy'},mode='replace'),E('discardTop',side='self',amount=5)),
 ('20','Flare Destroy'):S(DISC(),DISC(1,'opponentActive')),
 ('21','Melting Horn'):E('discardTop',side='opponent',amount=2),
 ('21','Grand Flame'):E('attachEnergyFromDiscard',target='selfBench',subtype='Fire',amount=1),

 ('24','Water Fling'):SEARCH(3,source='discard',kind='energy',basicEnergy=True,subtype='Water'),
 ('24','Hand Fling'):E('handCountDamage',source='self',amount=10,mode='replace'),
 ('27','Reckless Charge'):E('selfDamage',amount=10),
 # Soaking Horn needs a real heal-this-turn flag; gate pending engine integration.
 ('28','Reckless Charge'):E('selfDamage',amount=10),
 ('30','Deep Sea Swirl'):E('handShuffle',draw=7),
 ('31','Wild River'):SWITCH(),('32','Ion Pool'):E('discardStadium'),
 ('33','Hug'):LOCK(),
 ('34','Instant Freeze'):BONUS(100,{'type':'handSizesEqual'}),

 ('40','Ice Age'):E('status',status='paralysis',target='opponentActive',condition={'type':'opponentMatches','filter':{'subtype':'Dragon'}}),
 ('42','Green Fling'):SEARCH(3,source='discard',kind='energy',basicEnergy=True,subtype='Grass'),
 ('42','Hand Fling'):E('handCountDamage',source='self',amount=10,mode='replace'),
 ('43','Stiffen'):GUARD(20),
 # Frigid Breath locks *both* Supporter and Stadium through the next turn, not merely a Supporter.
 ('48','Agility'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),

 ('50','Grand Bolt'):DISC('all'),
 ('53','Electro Ball'):DISC(),('54','Thunder Blast'):DISC(1,'self','Lightning'),
 ('55','Thunder Lance'):E('energyDamage',source='self',energyType='Lightning',amount=20,mode='add'),
 ('56','Revenge'):BONUS(80,{'type':'koByOpponentAttackLastTurn'}),('56','Thunder Blast'):DISC(),
 ('58','Sleep Poison'):Q(S(ST('sleep'),ST('poison'))),
 ('59','Poison Ring'):S(ST('poison'),LOCK()),
 ('60','Sinister Fog'):S(ST('poison'),BENCH(10)),
 ('61','Photon Wave'):E('modifier',stat='attackDamage',amount=-30,scope='opponentActive',duration='opponentTurn'),
 ('62','Shatter Shot'):E('energyDamage',source='self',energyType='Psychic',amount=30,mode='replace'),

 # Psychic Infinity requires combined Active Energy and Weakness exemption.
 ('65','Haunt'):E('placeDamageCounters',target='opponentActive',amount=20),
 ('66','Curse Deeply'):ST('confusion'),
 ('67','Mirror Barrier'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('68','Nap'):H(30),
 ('69','Beckon'):SEARCH(1,source='discard',kind='trainer',trainerType='Supporter'),
 ('70','Moonlight Gain'):H(20),
 ('71','Odor Sleuth'):Q(SEARCH(1,source='discard')),
 ('72','Wave Amplification'):E('nextAttackBonus',attackName='Returning Echo',amount=60),
 ('72','Returning Echo'):Q(t=E('returnToHand',target='self',returnBasicEnergy=True)),
 ('73','Psych Up'):E('nextAttackBonus',attackName='Psych Up',amount=20),
 ('74','Mind Bullet'):E('selectedEnergyDamage',target='opponentPokemon',amount=20),
 ('76','Swift'):E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
 ('77','Whimsy Tackle'):E('coinAttackGate',heads=N),
 ('78','Sharpshooting'):E('selectedDamage',target='opponentPokemon',amount=30),
 ('78','Bone Windmill'):E('switch',side='self',condition={'type':'opponentEx'}),
 # BREAK uses shared LV.X previous-card attacks; printed card effects still require verification.
 ('81','Push Down'):E('forceOpponentSwitch',chooseBy='defender'),

 ('83','Nose Jet'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('84','Sensitive Blade'):BONUS(70,{'type':'supporterPlayed'}),
 ('85','Accelerating Spin'):S(E('attachEnergyFromDiscard',target='self',energyType='Fighting',amount=2),SWITCH()),
 ('85','Prima Rondo'):BONUS(50,{'type':'selfHasEnergyType','energyType':'Psychic'}),
 ('86','Pompous Punch'):E('discardHand',side='opponent',amount=1),
 # Derail must select a physical Special Energy rather than count-based Zone energy.
 ('90','Whiny Voice'):E('shuffleRandomHandCard',side='opponent'),
 ('91','Mind Jack'):E('benchCountDamage',side='opponent',amount=30,mode='add'),
 ('92','Foul Play'):E('copyAttack',source='opponentActive'),
 ('94','Pitch-Black Spear'):E('selectedDamage',target='opponentBench',amount=60,filter={'isEx':True}),
 ('95','Payback'):BONUS(60,{'type':'opponentPrizesAtMost','amount':1}),
 ('96','Pain Amplifier'):E('placeDamageCounters',target='opponentAll',amount=30,filter={'damaged':True}),
 ('98','Roar'):E('forceOpponentSwitch',chooseBy='defender'),
 ('99','Startling Bark'):Q(S(E('shuffleRandomHandCard',side='opponent'),E('shuffleRandomHandCard',side='opponent'),E('shuffleRandomHandCard',side='opponent'))),
 ('99','Tantrum'):ST('confusion','self'),
 ('101','Wish'):Q(SEARCH(1)),
 ('102','Aromatherapy'):H(30,'selfAll'),
 ('102','Magical Leaf'):Q(S(BONUS(20),H(20))),
 ('103','Wonder Shine'):ST('confusion'),
 ('105','Flail'):E('damageFromDamage',source='self',amount=1,mode='replace'),
 ('106','Hug'):LOCK(),

 ('109','Extra Chop'):E('selfDamage',amount=10),
 ('110','Dragon Slayer'):BONUS(40,{'type':'opponentMatches','filter':{'subtype':'Dragon'}}),
 ('111','Dragon Pulse'):E('discardTop',side='self',amount=3),
 ('112','Tuning'):E('handShuffle',draw='opponentHandCount'),
 ('112','Air Slash'):DISC(),
 ('113','Synchro Woofer'):BONUS(80,{'type':'handSizesEqual'}),
 ('115','Simultaneous Peck'):E('xy7EpicSplash'),
 ('115','Doduo Delivery'):DRAW(2),('116','Doduo Delivery'):DRAW(2),
 ('119','Proclaim the Night'):E('actionLock',cardType='Item',side='opponent',duration='opponentTurn'),
 ('120','High Flight'):S(E('filteredHandCountDamage',side='self',amount=20,filter={'kind':'trainer','trainerType':'Item'},mode='replace'),E('filteredHandCountDamage',side='opponent',amount=20,filter={'kind':'trainer','trainerType':'Item'},mode='add'),E('revealHand',side='self'),E('revealHand',side='opponent')),
 ('121','Flop'):N,
 ('122','Drag Off'):E('forceOpponentSwitch',chooseBy='attacker',timing='beforeDamage'),
 ('122','Swing Around'):COIN(2,40,False),
 ('124','Bind Wound'):E('chooseTarget',target='selfPokemon',effect=H(20,'selfPokemon')),
 ('125','Call for Pals'):E('benchFromDeck',amount=4,filter={'kind':'pokemon','name':'Starly'},choose=True),
 ('127','Cyclone Slash'):E('forceOpponentSwitch',chooseBy='defender',timing='beforeDamage'),
 ('127','Brave Bird'):E('selfDamage',amount=20),
 ('131','Blot'):H(10),
 ('132','Mysterious Beam'):Q(DISC(1,'opponentActive')),
}
# Alternate-art prints are distinct IDs; effects are shared by their genuine
# matching card number, not by name only (two Mewtwo-EX attacks differ).
for src,alts in [('21',['153']),('22',['154']),('34',['155']),('35',['156']),('61',['157','163']),('62',['158','164']),('63',['159']),('64',['160'])]:
 for (n,name),effect in list(ATTACKS.items()):
  if n==src:
   for alt in alts:ATTACKS[(alt,name)]=effect

TRAINERS={
 '136':('Supporter',SEARCH(4,source='discard',kind='energy',basicEnergy=True)),
 # Float Stone: zero Retreat Cost requires a real continuous Tool passive.
 '138':('Supporter',E('chooseOption',options=[{'label':'Draw until 5 cards','effect':E('drawToHandSize',size=5)},{'label':'+20 damage this turn','effect':E('modifier',stat='attackDamage',scope='team',duration='turn',amount=20)}])),
 # Glalie Spirit Link requires a matching Mega evolution hook.
 '140':('Item',SEARCH(1,kind='pokemon',retreatAtLeast=3)),
 # Houndoom Spirit Link requires a matching Mega evolution hook.
 '143':('Supporter',E('handShuffle',side='both',draw=4)),
 # Mewtwo Spirit Link requires a matching Mega evolution hook.
 '146':('Item',SEARCH(2,kind='energy',basicEnergy=True)),
 '146a':('Item',SEARCH(2,kind='energy',basicEnergy=True)),
 # Reserved Ticket must put the selected card on top, never into hand.
 '148':('Supporter',SEARCH(1,kind='trainer')),
 # Super Rod must shuffle *chosen* real cards (Pokémon and Basic Energy) from discard into deck.
 # Brigette requires a choice of 1 Basic EX or up to 3 non-EX Basics; gate until selection is proper.
 '162':('Supporter',E('chooseOption',options=[{'label':'Draw until 5 cards','effect':E('drawToHandSize',size=5)},{'label':'+20 damage this turn','effect':E('modifier',stat='attackDamage',scope='team',duration='turn',amount=20)}])),
}
# Conservative: no BREAK Pokemon until the shared engine inherits previous
# attacks, Abilities, weakness, resistance and retreat accurately.
ABILITIES={
 'Abyssal Hand':{'type':'activated','oncePerTurn':True,'effect':E('drawToHandSize',size=5)},
 'Dignified Fighter':{'type':'passive','effect':E('modifier',stat='attackDamage',amount=20,scope='team',duration='whileInPlay',filter={'stage':'Basic'})},
 'Thick Fat':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay',opponentFilter={'subtype':['Fire','Water']})},
 # Stand In requires switching this specific bench source, not a generic random switch.
 'Premonition':{'type':'activated','oncePerTurn':True,'effect':E('reorderTop',deckSide='self',count=5)},
 'Plump Body':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay')},
 'Retreat Aid':{'type':'passive','benchOnly':True,'effect':E('modifier',stat='retreatCost',amount=-2,scope='team',duration='whileInPlay')},
 'Shining Body':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=20,scope='self',duration='whileInPlay',condition={'type':'selfHasEnergyType','energyType':'Lightning'})},
 'Floral Breeze':{'type':'activated','oncePerTurn':True,'effect':S(H(30,'selfActive'),E('removeStatuses',target='selfActive',statuses=['poison','burn','sleep','paralysis','confusion']))},
}

def attack(row,a):
 num,title=str(row[0]),a[0];text=(a[3] or '').strip()
 if (num,title) in ATTACKS:return ATTACKS[(num,title)]
 if not text:return N
 m=re.fullmatch(r'(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',text)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',text)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',text)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN('untilTails',int(m[1]))
 if text=='Flip a coin. If tails, this attack does nothing.':return E('coinAttackGate',heads=N)
 if text=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if text=='Discard an Energy attached to this Pokémon.':return DISC()
 if text=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',text)
 if m:return H(int(m[1]))
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',text)
 if m:return E('selfDamage',amount=int(m[1]))
 m=re.fullmatch(r'Switch this Pokémon with 1 of your Benched Pokémon\.',text)
 if m:return SWITCH()
 m=re.fullmatch(r'This attack does (\d+) damage to 1 of your opponent.s Benched Pokémon\. \(Don.t apply Weakness and Resistance for Benched Pokémon\.\)',text)
 if m:return E('multiTargetDamage',target='opponentBench',amount=int(m[1]),count=1,upTo=True)
 return None
