"""XY6 Roaring Skies: conservative, print-accurate stage-one battle effects.

Only effects backed by existing battle-engine descriptors are activated.
Unlike a catalogue import, Stage 1 does not pretend to support Delta traits,
new bench size rules, or new abilities. Those cards remain visible and gated.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw: {'type':t,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
ATTACKS={
 ('1','Loathe'):Q(SWITCH()),
 ('2','Shake It Off'):E('fieldCountDamage',side='opponent',filter={'subtype':'Colorless'},amount=20,mode='replace'),
 ('3','Flock'):E('benchFromDeck',amount=1,filter={'kind':'pokemon','name':'Wurmple'},choose=True),
 ('4','String Shot'):Q(ST('paralysis')),
 ('5','Whirlwind'):OPT('Have opponent switch their Active Pokémon',E('forceOpponentSwitch',chooseBy='defender')),
 ('6','Poison Sting'):ST('poison'),
 ('6','Iron Defense'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('7','Psybeam'):ST('confusion'),('7','Twilight Poison'):S(ST('sleep'),ST('poison')),
 ('8','Wind Shard'):E('selectedDamage',target='opponentBench',amount=50),
 ('9','Slight Intrusion'):E('selfDamage',amount=10),
 ('11','Hopeless Scream'):E('damageFromDamage',source='self',amount=5,mode='replace'),
 ('12','Stomp'):Q(BONUS(20)),
 ('13','Me First'):DRAW(1),('13','Psy Bolt'):Q(ST('paralysis')),
 ('15','Grand Loop'):S(DRAW(3),OPT('Switch this Pokémon with your Bench',SWITCH())),
 ('15','Brave Bird'):E('selfDamage',amount=20),
 ('16','Find Ice'):SEARCH(3,kind='energy',basicEnergy=True),
 ('17','Chilling Sigh'):ST('sleep'),('17','Tri Edge'):COIN(3,40,False),
 ('28','Psywave'):E('energyDamage',source='opponent',amount=10,mode='replace'),
 ('19','Swallow'):E('drain'),('19','Water Pulse'):ST('sleep'),
 ('20','Tail Whip'):Q(E('lock',action='attack',target='opponentActive',duration='opponentTurn')),
 ('21','Thunder Wave'):Q(ST('paralysis')),('21','Big Explosion'):E('selfDamage',amount=60),
 ('22','Continuous Tumble'):COIN('untilTails',20),
 ('22','Energy Bomb'):OPT('Move all Energy attached to Electrode to your Benched Pokémon',E('distributeEnergy',source='self',target='selfBench',amount='all',includeSpecialEnergy=True)),
 ('25','Random Spark'):E('selectedDamage',target='opponentPokemon',amount=30),
 ('26','Headlock'):Q(BONUS(30),ST('paralysis')),
 ('26','Voltage Rush'):E('selfDamage',amount=50),
 ('30','Bleh'):E('neoRule',rule='xy4:enhancedHammer'),
 ('32','Evolution Jammer'):E('actionLock',side='opponent',cardType='Evolution',duration='opponentTurn'),
 ('32','Curse Deeply'):E('placeDamageCounters',target='opponentActive',amount=50),
 ('34','Swift Lunge'):OPT('Have opponent switch their Active Pokémon',E('forceOpponentSwitch',chooseBy='defender')),
 ('35','Unwavering Blade'):E('benchDamage',side='opponent',amount=30,all=True,filter={'damaged':True}),
 ('36','Stun Poison'):Q(S(ST('paralysis'),ST('poison'))),
 ('37','Rock Slide'):E('multiTargetDamage',target='opponentBench',count=2,amount=20,upTo=True),
 ('38','Sand Attack'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('39','Midair Strike'):Q(BONUS(40)),
 ('40','Mach Claw'):E('damageRule',ignoreResistance=True),
 ('41','Rip Off'):E('shuffleRandomHandCard',side='opponent'),('41','Psybeam'):Q(ST('confusion')),
 ('43','Sweet Kiss'):E('draw',side='opponent',amount=1),
 ('45','Powerful Slap'):E('coinDamageByEnergy',amount=50,countCards=True),
 ('45','Aura Sphere'):E('multiTargetDamage',target='opponentBench',count=1,amount=20,upTo=True),
 ('47','Spin Tackle'):Q(t=E('selfDamage',amount=20)),
 ('48','Play Rough'):Q(BONUS(20)),
 ('49','Slam'):COIN(2,20),('50','Shed Skin'):H(30),('50','Slam'):COIN(2,60),
 ('51','Mach Press'):E('allHeadsEffect',coins=2,heads=ST('paralysis')),
 ('54','Continuous Headbutt'):COIN('untilTails',30),
 ('55','Leer'):Q(ST('paralysis')),('55','Almost Flight'):E('selfDamage',amount=10),
 ('57','Shatter'):E('discardStadium'),
 ('57','Power Howl'):E('filteredHandCountDamage',side='opponent',filter={},amount=20,mode='replace'),
 ('57','Steam Blast'):DISC(3),
 ('60','Dragon Strike'):Q(t=E('lock',action='attack',target='self',attackName='Dragon Strike',duration='nextOwnTurn')),
 ('61','Dragon Ascent'):DISC(2),
 ('62','Shred'):E('damageRule',ignoreEffects=True),
 ('63','Bright Wing'):DISC(1,'self','Fire'),
 ('66','Drill Run'):Q(DISC(1,'opponentActive')),
 ('67',"Feelin' Fine"):DRAW(1),('67','Fury Swipes'):COIN(3,20),
 ('68','Burrow'):E('discardTop',side='opponent',amount=1),
 ('69','Call for Family'):E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Basic'},choose=True),
 ('69','Blow Through'):BONUS(30,{'type':'stadiumInPlay'}),
 ('70','Double Peck'):COIN(2,10),
 ('71','Clutch'):LOCK(),('71','Aerial Ace'):Q(BONUS(30)),
 ('72','Peck'):N,('72','Wing Attack'):N,
 ('75','Intensifying Burn'):BONUS(50,{'type':'opponentEx'}),
 ('76','Emerald Break'):E('benchCountDamage',side='self',amount=30,mode='replace'),
 ('81','Feather Dance'):E('nextAttackBonus',attackName='Sky Attack',amount=80),
 ('81','Sky Attack'):E('coinAttackGate',heads=N),
 ('75','Dragon Pulse'):E('discardTop',side='self',amount=3),
 ('77','Sky Return'):E('returnToHand',target='self',returnBasicEnergy=True),
 ('79','Fly'):E('coinAttackGate',heads=E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('80','Quick Attack'):Q(BONUS(30)),
 ('82','Acrobatics'):COIN(2,10,False),
}
# Stage 5 — individually verified Roaring Skies effects. Preserve alternate art
# equivalents via the shared copy mapping directly below.
ATTACKS.update({
 ('10','Afterimage Assault'):E('benchFromDeck',amount=2,filter={'kind':'pokemon','name':'Ninjask'},choose=True),
 ('11','Cursed Rain'):S(E('placeDamageCounters',target='opponentAll',amount=10),SWITCH()),
 ('33','Close Encounter'):DRAW(2),
 ('33','Overdrive Smash'):E('nextAttackBonus',attackName='Overdrive Smash',amount=60),
 ('34','Piercing Prizes'):E('neoRule',rule='xy6:piercingPrizes'),
 ('42','Diminutive Desire'):E('selectTopToHand',count=7),
 ('42','Doom Desire'):S(DISC('all'),E('scheduleDelayed',event='endOpponentNextTurn',targetMode='defender',effect=E('knockOut',target='opponentActive'))),
 ('58','Fast Raid'):N, # Attacking on the first turn is already permitted by the Classic engine.
 ('58','Light Pulse'):E('neoRule',rule='xy6:lightPulse'),
 ('59','Sonic Ace'):S(E('selectedDamage',target='opponentPokemon',amount=120),DISC(2)),
 ('64','Energy Stream'):E('attachEnergyFromDiscard',target='self',amount=1),
 ('73','Bind Wound'):E('chooseTarget',target='selfPokemon',effect=H(20,'selfPokemon')),
 ('78','Homing Pidove'):S(E('inspectTop',side='self',amount=1),OPT('Shuffle your deck',E('shuffleDeck',side='self'))),
})

# Stage 6: preserve physical card identity, explicit selections and their printed
# order.  Remaining unresolved attacks and Abilities are still deliberately gated.
ATTACKS.update({
 ('14','Peck Off'):E('discardTool',target='opponentActive',amount='all',timing='beforeDamage'),
 ('23','Raging Thunder'):E('benchDamage',side='self',amount=40),
 ('29','Future Sight'):E('chooseOption',options=[
  {'label':'Arrange the top 5 cards of your deck','effect':E('reorderTop',deckSide='self',count=5)},
  {'label':"Arrange the top 5 cards of your opponent's deck",'effect':E('reorderTop',deckSide='opponent',count=5)},
 ]),
 ('29','Stressful Eye'):S(E('revealHand',side='opponent'),E('discardChosenHand',side='opponent',selectBy='attacker',amount=1,filter={'kind':'trainer'})),
 ('48','Look for Keys'):E('revealUntilMatching',filter={'kind':'trainer','trainerType':'Item'}),
 ('53','Song of Echoes'):E('handShuffle',draw='bothBenchCount'),
 ('80','Strong Winds'):E('shuffleAllAttached'),
 ('52','Wrapped in Wind'):E('attachChosenBasicFromHand',amount=2,target='self'),
 ('44','Go Fetch'):E('neoRule',rule='xy6GoFetch'),
})

# Never use a generic attack if it does not implement the printed result.
# Explicit alternate artworks are the SAME physical attack text, but unique prints.
for original,alternate in [('26','98'),('34','99'),('35','100'),('58','101'),('59','102'),('62','103'),('75','104'),('76','105'),('77','77a'),('77','106')]:
 for (num,name),effect in list(ATTACKS.items()):
  if num==original:ATTACKS[(alternate,name)]=effect

# Effects of these Trainers are already supported by the shared engine.
# Spirit Links additionally require matching evolution IDs in battle-core.
TRAINERS={
 '83':('Tool',N), # Gallade Spirit Link
 '84':('Tool',N), # Healing Scarf: triggered by on-hand Energy attachments in battle core
 '85':('Tool',N), # Latios Spirit Link
 '86':('Item',E('attachEnergyFromDiscard',target='selfPokemon',filter={'tag':'mega-evolution'},amount=1)), # Mega Turbo; choose actual Mega and discarded Basic Energy
 '87':('Tool',N), # Rayquaza Spirit Link
 '89':('Stadium',N), # Sky Field: physical 8-slot Bench + ordered discard to printed 5 in battle core
 '88':('Item',E('benchFromDiscard',side='self',amount=1,filter={'kind':'pokemon','stage':'Basic'})),
 '90':('Supporter',S(SEARCH(1,kind='trainer',trainerType='Supporter'),SEARCH(1,kind='energy',basicEnergy=True))),
 '91':('Item',SWITCH()),
 '92':('Item',E('selectTopToHand',count=4,optional=True,filter={'kind':'trainer','notName':"Trainers' Mail"})),
 '92a':('Item',E('selectTopToHand',count=4,optional=True,filter={'kind':'trainer','notName':"Trainers' Mail"})),
 '93':('Item',E('neoRule',rule='xy2:ultraBall')),
 '96':('Supporter',SEARCH(3,kind='pokemon',subtype='Colorless')),
 '108':('Supporter',SEARCH(3,kind='pokemon',subtype='Colorless')),
 '95':('Tool',N), # Wide Lens: bench damage uses the universal attack-matchup adjustment.
 '109':('Item',E('neoRule',rule='xy2:energySwitch')),
 '110':('Item',SEARCH(1,source='discard',kind='trainer',trainerType='Supporter')),
 '94':('Supporter',E('chooseEvolutionFromDeck',excludeEx=True)),
 '107':('Supporter',E('chooseEvolutionFromDeck',excludeEx=True)),
}
# All three printed Δ Ancient Traits are enforced by the shared battle core.
# Special Energy's two-unit all-type conversion still requires an energy hook.
TRAITS_IMPLEMENTED={'Δ Evolution','Δ Plus','Δ Wild'}
ABILITIES={
 'Miraculous Scales':{'type':'passive','effect':N},
 'Jewel Armor':{'type':'passive','effect':N},
 'Clear Humming':{'type':'passive','effect':N},
 # An optional on-bench, from-hand trigger. Uses the shared choice flow, never
 # fires on a deck/discard summon, and cannot exceed the Classic hand cap.
 'Set Up':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':OPT('Draw until you have 6 cards',E('drawToHandSize',size=6))},
 'Max Wind':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('chooseTarget',target='selfPokemon',effect=H(999,'selfPokemon'),optional=True)},
 'Wing Buzz':{'type':'activated','activeOnly':True,'oncePerTurn':True,'effect':E('neoRule',rule='xy6:wingBuzz')},
 'Serene Grace':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':OPT('Attach Basic Energy from the top 8 Energy Zone cards',E('attachTopZoneEnergy',count=8))},
 'Tool Concealment':{'type':'passive','effect':N},
 'Cursed Eyes':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':OPT('Move 3 damage counters between opposing Pokémon',E('moveOpposingCounters',amount=30))},
 'Exoskeleton':{'type':'passive','effect':E('modifier',stat='damageReduction',amount=10,scope='self',duration='whileInPlay')},
 'Dragon Road':{'type':'passive','effect':E('modifier',stat='retreatCost',amount=-2,scope='team',duration='whileInPlay',filter={'subtype':'Dragon'},condition={'type':'stadiumInPlay'})},
 'Turboblaze':{'type':'activated','oncePerTurn':True,'activeOnly':True,'requiresBasicEnergyFromHand':'Fire','effect':E('chooseTarget',forceChoose=True,target='selfPokemon',filter={'subtype':'Dragon'},effect=E('attachEnergy',target='selfPokemon',amount=1,source='hand',energyType='Fire'))},
}

def attack(row,a):
 num,title=str(row[0]),a[0];txt=(a[3] or '').strip()
 if (num,title) in ATTACKS:return ATTACKS[num,title]
 if not txt:return N
 m=re.fullmatch(r'(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',txt)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN('untilTails',int(m[1]))
 if txt=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if txt=='Discard an Energy attached to this Pokémon.':return DISC()
 if txt=='Discard the top card of your opponent\'s deck.':return E('discardTop',side='opponent',amount=1)
 if txt=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 if txt.startswith('This Pokémon does ') and txt.endswith(' damage to itself.'):
  m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',txt)
  if m:return E('selfDamage',amount=int(m[1]))
 return None
