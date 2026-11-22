"""XY9 BREAKpoint mechanic-first mapping — no unsupported printed effects may pass.

Shares the validated XY8 generic attack parser, LV.X/BREAK inheritance and
existing battle effect DSL. Compound effects must be tested as *outcomes*.
Uncertain mechanics remain gated until their engine hooks are verified.
"""
from xy8_verified import attack as _generic_xy8
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw:{'type':t,**kw}
ATK={
 ('1','Blot'):H(10),
 ('2','Body Slam'):Q(ST('paralysis')),
 ('3','Green Force'):E('drain'),
 ('5','Bug Hunch'):SEARCH(3,kind='pokemon',subtype='Grass'),
 ('7','Aromatherapy'):H(10,'selfAll'),
 ('8','Boo-Hoo'):E('energyAttachStatusTrap',target='opponentActive',status='sleep'),
 ('9','Mountain Munch'):E('discardTop',side='opponent',amount=1),
 ('9','Scrape Down'):E('discardTop',side='opponent',amount=4,condition={'type':'selfDamaged'}),
 ('11','Flamethrower'):DISC(),
 ('13','Eruption'):E('topDeckBothDiscardBonus',amount=60),
 ('14','Spiral Punch'):COIN('untilTails',20,False),
 ('14','Strong Flare'):DISC(2),
 ('15','Reinforced Flame'):BONUS(20,{'type':'selfHasTool'}),
 ('17','Derail'):E('neoRule',rule='xy8:derail'),
 # Basic-Energy movement is identical to the existing redistributor, but
 # must allow the owner to select both source and destination.
 ('19','Tail Lure'):SEARCH(1,kind='pokemon'),
 ('21','Psych Up'):E('nextAttackBonus',attackName='Psych Up',amount=40),
 ('22','Razor Shell'):Q(BONUS(10)),
 ('23','Clamp'):E('coinAttackGate',heads=ST('paralysis')),
 ('24','Sudden Grip'):E('status',status='paralysis',target='opponentActive',condition={'type':'evolvedThisTurn'}),
 ('26','Stormy Seas'):E('neoRule',rule='xy9:stormySeas'),
 ('26','Splash Burn'):E('benchDamage',side='self',amount=10,all=True),
 ('27','Blast Geyser'):E('neoRule',rule='xy9:blastGeyser'),
 ('28','Errand-Running'):SEARCH(1,kind='trainer'),
 ('31','Pearl Hurricane'):E('multiTargetDamage',target='opponentBench',amount=30,count=1,upTo=True),
 ('32','Mineral Pump'):H(30,'selfBenchAll'),
 ('35','Shaky Fall'):S(ST('confusion'),LOCK()),
 ('37','Brave Bird'):E('selfDamage',amount=20),
 ('39','Water Duplicates'):E('benchFromDeck',amount=3,choose=True,filter={'kind':'pokemon','name':'Frogadier'}),
 ('42','Knuckle Punch'):N,
 ('43','Knuckle Punch'):N,
 ('44','Roar'):E('forceOpponentSwitch',chooseBy='defender'),
 ('46','Snarl'):E('modifier',stat='attackDamage',amount=-20,scope='opponentActive',duration='opponentTurn'),
 ('47','Wild Fury'):COIN('untilTails',40,False),
 ('48','Reckless Charge'):E('selfDamage',amount=10),
 ('52','Miraculous Shine'):E('devolve',target='opponentAll'),
 ('52','Psyshock'):E('damageRule',ignoreEffects=True),
 ('55','Reflective Shield'):E('retaliateDamage',amount=50,duration='opponentTurn'),
 ('55','Psy Report'):E('revealHand',side='opponent'),
 ('56','Acid Spray'):Q(DISC(1,'opponentActive')),
 ('60','Stab'):E('placeDamageCounters',target='opponentActive',amount=10),
 ('61','Stab Deeply'):E('placeDamageCounters',target='opponentActive',amount=30),
 ('63','Hide'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('64','Ascension'):E('chooseEvolutionFromDeck'),
 ('65','Energy Press'):E('energyDamage',source='opponent',amount=10,mode='add'),
 ('66','Silent Fear'):E('placeDamageCounters',target='opponentAll',amount=30),
 ('69','Sand Tomb'):LOCK(),
 ('70','Bite Off'):BONUS(80,{'type':'opponentEx'}),
 ('72','Razor Wind'):E('coinAttackGate',heads=N),
 ('73','Otherworldly Return'):SEARCH(1,source='discard',kind='trainer'),
 ('74','Dark Pulse'):E('energyDamage',source='self',all=True,energyType='Darkness',amount=20,mode='add'),
 ('74','Dark Head'):BONUS(80,{'type':'opponentStatus','status':'sleep'}),
 ('75','Parting Shot'):S(E('modifier',stat='attackDamage',amount=-60,scope='opponentActive',duration='opponentTurn'),SWITCH()),
 ('75','Buster Swing'):E('damageRule',ignoreResistance=True),
 ('76','Steel Wing'):GUARD(20),
 ('76','Gale Thrust'):BONUS(60,{'type':'movedFromBenchThisTurn'}),
 ('77','Iron Crusher'):E('chooseOption',options=[{'label':'Discard an opposing Special Energy','effect':E('neoRule',rule='xy8:derail')},{'label':'Discard the Stadium','effect':E('discardStadium')},{'label':'Do not discard','effect':N}]),
 ('79','Harden'):E('preventDamage',target='self',duration='opponentTurn',maxDamage=60),
 ('82','Moon Barrier'):E('preventDamage',target='self',duration='opponentTurn',preventEffects=True,attackerFilter={'subtype':'Dragon'}),
 ('83','Hurricane Wing'):COIN(4,50),
 ('85','Dizzying Cologne'):BONUS(40,{'type':'opponentEx'}),
 ('86','Severe Poison'):E('status',status='poison',target='opponentActive',amount=40),
 ('86','Dragon Pulse'):E('discardTop',side='self',amount=1),
 ('87','Dangerous Suspicion'):S(DRAW(1),SWITCH()),
 ('88','Dirty Shock'):S(ST('poison'),E('discardTool',target='opponentActive')),
 ('89','Super Fang'):E('setRemainingHp',target='opponentActive',amount=10),
 ('90','Call for Family'):E('benchFromDeck',amount=1,choose=True,filter={'kind':'pokemon','stage':'Basic'}),
 ('91','Mystifying Horn'):Q(ST('confusion')),
 ('91','Big Charge'):BONUS(50,{'type':'pokemonPresent','zone':'bench','filter':{'tag':'mega-evolution'}}),
 ('92','Elemental Feather'):E('multiTargetDamage',target='opponentBench',amount=30,count=1,upTo=True),
 ('94','Nyan Press'):Q(BONUS(40),ST('paralysis')),
 ('31','Aqua Turbo'):E('neoRule',rule='xy9:aquaTurbo'),
 ('33','Round'):E('neoRule',rule='xy9:round'),
 ('40','Shadow Stitching'):E('neoRule',rule='xy9:shadowStitching'),
 ('40','Moonlight Slash'):E('neoRule',rule='xy9:moonlightSlash'),
 ('57','Offensive Bomb'):S(ST('confusion'),ST('poison')),
 ('62','Painful Sword'):E('neoRule',rule='xy9:painfulSword'),
 ('62','Megaton Slash'):E('multiTargetDamage',target='opponentBench',amount=10,count=2,upTo=True),
 ('68','Never Enough'):E('neoRule',rule='xy9:neverEnough'),
 ('70','Turbo Assault'):E('neoRule',rule='xy9:turboAssault'),
 ('80','Spike Lash'):E('neoRule',rule='xy9:spikeLash'),
 ('83','Mighty Wind'):E('neoRule',rule='xy9:mightyWind'),
 ('93','Act Cute'):E('neoRule',rule='xy9:actCute'),
 ('95','Collect'):DRAW(1),
 ('95','Tight Jaw'):Q(ST('paralysis')),
}
# Basic alternate art prints preserve *exactly* the same printed effects.
for src,alts in [('26',['114','123']),('27',['115']),('32',['116']),('52',['117']),('74',['118']),('76',['119']),('77',['120']),('92',['121'])]:
 for (n,name),effect in list(ATK.items()):
  if n==src:
   for alt in alts:ATK[(alt,name)]=effect

# Cards with the same name but different prints are never conflated.
TRAINERS={
 '98':('Supporter',E('neoRule',rule='xy9:delinquent')),
 '98a':('Supporter',E('neoRule',rule='xy9:delinquent')),
 '98b':('Supporter',E('neoRule',rule='xy9:delinquent')),
 '99':('Tool',S(E('modifier',stat='maxHp',amount=40,scope='self',duration='whileInPlay',filter={'stage':'Basic'}),E('modifier',stat='attackDamage',amount=10,scope='self',duration='whileInPlay',filter={'stage':'Basic'}))),
 '100':('Item',E('selectTopToHand',count=7,filter={'kind':'pokemon'},optional=True)),
 '101':('Tool',N), # Gyarados Spirit Link: existing Mega turn-ending exemption.
 '103':('Item',E('neoRule',rule='xy9:maxPotion')),
 '104':('Supporter',E('neoRule',rule='xy9:mistysDetermination')),
 '105':('Item',Q(E('forceOpponentSwitch',chooseBy='attacker'))),
 '106':('Item',E('chooseTarget',target='selfPokemon',effect=H(30,'selfPokemon'))),
 '107':('Supporter',S(E('discardHand',side='self',amount=99),DRAW(7))),
 '107a':('Supporter',S(E('discardHand',side='self',amount=99),DRAW(7))),
 '111':('Tool',N), # Scizor Spirit Link; hook is shared by matching Mega names.
 '112':('Supporter',DRAW(3)),
 '122':('Supporter',SEARCH(1,kind='trainer')),
}
# Only abilities whose effect and triggering context are already supported
# are enabled here. Global Tool-based suppression and 0-energy cost auras
# need cross-set passive tests before they can be marked playable.
ABILITIES={
 'Overgrow':{'type':'passive','effect':E('modifier',stat='attackDamage',amount=70,scope='self',duration='whileInPlay',condition={'type':'selfRemainingHpAtMost','amount':50})},
 'Hyper Transfer':{'type':'activated','oncePerTurn':False,'effect':E('redistributeEnergy',includeSpecialEnergy=False)},
 'Goodnight, Babies':{'type':'activated','oncePerTurn':True,'effect':S(ST('sleep','selfActive'),ST('sleep'))},
 'Aqua Tube':{'type':'passive','effect':E('modifier',stat='retreatCost',amount=-99,scope='team',duration='whileInPlay',filter={'hasEnergyType':'Water'})},
 'Giant Water Shuriken':{'type':'activated','oncePerTurn':True,'activeOnly':True,'effect':E('neoRule',rule='xy9:giantWaterShuriken')},
 'Garbotoxin':{'type':'passive','effect':E('abilitySuppression',duration='whileInPlay',scope='both',condition={'type':'selfHasTool'})},
 'Purifying Fire':{'type':'activated','oncePerTurn':True,'effect':E('neoRule',rule='xy9:purifyingFire')},
 'Antibodies':{'type':'passive','effect':E('preventStatus',duration='whileInPlay',scope='self')},
 'Nervous Seed':{'type':'passive','activeOnly':True,'effect':E('modifier',stat='attackCostColorless',amount=1,scope='opponentActive',duration='whileActive',filter={'stage':'Basic'})},
 # Purifying Fire requires specifically BASIC Fire Energy; generic typed-energy
 # predicates also accept Special Energy, so it stays gated for correctness.
}
# Splash Energy's KO-return requires exact card-stack ownership. Until that
# shared hook is verified, the card MUST remain gated.
ENERGIES={}

def attack(row,a):
 number,name=str(row[0]),a[0]
 if (number,name) in ATK:return ATK[(number,name)]
 # XY8's fallback includes only reusable exact printed-text patterns; passing
 # a sentinel number avoids accidentally inheriting a DIFFERENT XY8 attack
 # merely because a card number and attack name coincide.
 return _generic_xy8(['_xy9_generic_',*list(row)[1:]],a)
