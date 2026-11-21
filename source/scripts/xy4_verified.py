"""Phantom Forces xy4 conservative audit contract.

Every effect claimed FULL must correspond to a real implemented engine rule. New
mechanics that need global timing/choice hooks remain gated until completion.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
E=lambda t,**kw:{'type':t,**kw}
R=lambda k:E('neoRule',rule='xy4:'+k)
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
ATTACKS={
 ('2','Noxious Scales'):S(ST('confusion'),ST('poison')),
 ('4','Windfall'):E('handShuffle',draw=6),
 ('4','Surprise Strike'):BONUS(50,{'type':'movedFromBenchThisTurn'}),
 ('5','Nap'):H(20),
 ('6','Protect'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('7','Leaf Storm'):H(20,'selfAll'),
 ('7','Coordinate'):R('coordinate'),
 ('10','Acrobatics'):COIN(2,30,False),
 ('10','Jet Shoot'):GUARD(-40),
 ('11','Roar'):E('forceOpponentSwitch',chooseBy='defender'),
 ('14','Guard Claw'):GUARD(20),
 ('15','Fury Strikes'):COIN(3,10),
 ('16','Crunch'):Q(DISC(1,'opponentActive')),
 ('17','Second Strike'):BONUS(80,{'type':'opponentDamaged'}),
 ('19','Neon Sign'):SEARCH(2,kind='pokemon'),
 ('20','Confuse Ray'):ST('confusion'),
 ('22','Surf'):N,
 ('22','Super Deep Dive'):S(H(30),SWITCH()),
 ('21','Meddling'):R('meddling'),
 ('23','Overrun'):E('multiTargetDamage',target='opponentBench',amount=20,count=1,upTo=True),
 ('23','Assault Laser'):BONUS(60,{'type':'opponentHasTool'}),
 ('24','Turbo Bolt'):R('turboBolt'),
 ('17','Hyper Whirlpool'):R('hyperWhirlpool'),
 ('34','Night Attack'):R('nightAttack'),
 ('40','Dream of Memories'):R('dreamOfMemories'),
 ('79','Fly'):R('fly'),
 ('80','Lucky Punch'):E('attackRequirement',condition={'type':'handSizeOneOf','values':[7]}),
 ('81','Tender Vengeance'):R('tenderVengeance'),
 ('24a','Turbo Bolt'):R('turboBolt'),
 ('25','Pachi'):Q(BONUS(30)),
 ('26','Night March'):R('nightMarch'),
 ('27','Electroweb'):LOCK(),
 ('28','Tail Rap'):COIN(2,20,False),
 ('29','Quick Attack'):Q(BONUS(10)),
 ('31','Skill Dive'):E('selectedDamage',target='opponentPokemon',amount=10),
 ('32','Swoop Across'):R('swoopAcross'),
 ('33','Skill Dive'):E('selectedDamage',target='opponentPokemon',amount=30),
 ('34','Night Attack'):R('nightAttack'),
 ('34','Dark Corridor'):S(ST('poison'),SWITCH()),
 ('35','Phantom Gate'):E('copyAttack',source='opponentPokemon',ignoreUseCosts=True,chooseBy='attacker'),
 ('36','Psychic Assault'):E('damageFromDamage',source='opponent',amount=1),
 ('38','Swallow Up'):R('swallowUp'),
 ('39','See Through'):E('revealHand',side='opponent'),
 ('39','Double Headbutt'):COIN(2,20),
 ('40','Dream Dance'):S(ST('sleep'),ST('sleep','self')),
 ('41','Trip Over'):Q(BONUS(10)),
 ('42','Night March'):R('nightMarch'),
 ('42','Cursed Drop'):R('cursedDrop3'),
 ('43','Cursed Drop'):R('cursedDrop6'),
 ('44','Night March'):R('nightMarch'),
 ('45','Horror Note'):E('handCountDamage',amount=10),
 ('46','Rock Cannon'):COIN('untilTails',20),
 ('47','Poison Jab'):Q(ST('poison')),
 ('47','Submission Hold'):R('submissionHold'),
 ('49','Core Heal'):S(DISC(1,typ='Fighting'),H(50)),
 ('50','Overdrive Smash'):E('nextAttackBonus',attackName='Overdrive Smash',amount=40),
 ('51','Ambush'):Q(BONUS(10)),
 ('52','Hypnoblast'):ST('sleep'),
 ('52','Nightmare Mambo'):BONUS(60,{'type':'opponentStatus','status':'sleep'}),
 ('53','Lunge'):E('coinAttackGate',heads=N),
 ('54','Crunch'):Q(DISC(1,'opponentActive')),
 ('55','Confuse Ray'):Q(ST('confusion')),
 ('55','B Cancel'):R('bCancel'),
 ('56','Fake Out'):Q(ST('paralysis')),
 ('57','Gentle Bite'):E('modifier',stat='damageReduction',amount=60,scope='opponentActive',duration='opponentTurn'),
 ('57','Mach Claw'):E('damageRule',ignoreResistance=True),
 ('58','MAXamar'):R('maxamar'),
 ('59','Iron Wing'):DISC(1,typ='Metal'),
 ('62','Full Metal Impact'):DISC(2,typ='Metal'),
 ('62','Chrono Wind'):R('chronoWind'),
 ('63','Steel Drop'):BONUS(40,{'type':'stadiumInPlay'}),
 ('63','Steam Blast'):DISC(),
 ('64','Poke Through'):E('discardHand',side='opponent',amount=1),
 ('64','Spiral Rush'):COIN('untilTails',30,False),
 ('65','Slash Blast'):E('energyDamage',source='self',energyType='Metal',amount=20,mode='add'),
 ('65a','Slash Blast'):E('energyDamage',source='self',energyType='Metal',amount=20,mode='add'),
 ('66','Call for Family'):E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Basic'}),
 ('66','Dull Light'):ST('confusion'),
 ('67','Lead'):SEARCH(1,kind='trainer',trainerType='Supporter'),
 ('67','Bright Garden'):R('brightGarden'),
 ('68','Lick Away'):E('removeStatus',target='self'),
 ('69','Light Pulse'):R('lightPulse'),
 ('70','Nuzzle'):Q(ST('paralysis')),
 ('70','Spiral Drain'):H(20),
 ('71','Diamond Storm'):H(30,'selfAll'),
 ('71','Sparkle'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('72','Gnaw Off'):Q(BONUS(10)),
 ('73','Slam'):COIN(2,30),
 ('74','Crazy Headbutt'):DISC(),
 ('75','Gooey'):H(10),
 ('76','Gooey'):H(30),
 ('77','Dragon Pulse'):E('discardTop',side='self',amount=1),
 ('78','Whirlwind'):E('forceOpponentSwitch',chooseBy='defender'),
 ('79','Drill Peck'):N,
 ('80','Nap'):H(30),
 ('81','Charge Dash'):R('chargeDash'),
 ('82','Psybite'):BONUS(30,{'type':'selfHasEnergyType','energyType':'Psychic'}),
 ('83','Screaming Fit'):S(ST('confusion'),ST('confusion','self')),
 ('84','Energy Press'):E('energyDamage',source='opponent',amount=30,mode='add'),
 ('85','Boomburst'):R('boomburst'),
 ('86','Daunt'):E('modifier',stat='damageReduction',amount=40,scope='opponentActive',duration='opponentTurn'),
 ('88','Smithereen Smash'):Q(DISC(1,'opponentActive')),
 ('88','Earthquake'):E('benchDamage',side='self',amount=10,all=True),
 ('89','Quick Attack'):Q(BONUS(20)),
 ('90','Tight Jaw'):Q(ST('paralysis')),
}
for a,b in [('23','113'),('24','120'),('34','114'),('35','121'),('58','115'),('62','122'),('67','116')]:
 for (num,name),effect in list(ATTACKS.items()):
  if num==a:ATTACKS[(b,name)]=effect

# No silent interpretation of mandatory Ability effects. Metal Links, Night March
# and some entry effects will be promoted once their engine hooks are verified.
ABILITIES={
 'Metal Links':{'type':'activated','oncePerTurn':True,'effect':R('metalLinks')},
 'Dark Impulse':{'type':'activated','oncePerTurn':True,'effect':R('darkImpulse')},
 'Tasting':{'type':'activated','oncePerTurn':True,'effect':R('tasting')},
 'Flare Command':{'type':'activated','oncePerTurn':True,'effect':R('flareCommand')},
 'Sneaky Bite':{'type':'triggered','event':'evolved','effect':R('sneakyBite')},
 'Surprise Bite':{'type':'triggered','event':'evolved','effect':R('surpriseBite')},
 'Fainting Spell':{'type':'triggered','event':'knockedOutByAttack','opponentAttackOnly':True,'effect':R('faintingSpell')},
 'Hyper Hypnosis':{'type':'triggered','event':'energyAttached','fromHandOnly':True,'effect':R('hyperHypnosis')},
 'Gourgantic':{'type':'passive','effect':R('gourgantic')},
 'High Density Armor':{'type':'passive','effect':R('highDensityArmor')},
 'Mighty Shield':{'type':'passive','effect':R('mightyShield')},
 'Bide Barricade':{'type':'passive','effect':R('bideBarricade')},
 'Slip Trip':{'type':'passive','effect':R('slipTrip')},
}
# Trainer rules already represented by proven generic effects; named targets,
# Tools, global Stadiums and opponent attachments need dedicated follow-up logic.
TRAINERS={
 '95':('Tool',N),
 '100':('Tool',N),
 '108':('Tool',N),
 '105':('Stadium',N),
 '91':('Supporter',R('az')),
 '92':('Item',R('battleCompressor')),
 '94':('Item',R('enhancedHammer')),
 '99':('Supporter',R('trumpCard')),
 '101':('Supporter',R('sycamore')),
 '106':('Item',R('targetWhistle')),
 '110':('Supporter',R('xerosic')),
 '93':('Stadium',N),
 '96':('Item',E('revealHand',side='opponent')),
 '103':('Item',Q(DRAW(3))),
 '104':('Supporter',E('handShuffle',draw=5)),
 '107':('Supporter',DRAW(3)),
 '109':('Item',E('searchChosen',source='discard',amount=1,filter={'kind':'trainer','trainerType':'Supporter'},excludePlayedTrainer=True)),
}
for source,alt in [('91','117'),('99','118'),('110','119')]:
 if source in TRAINERS:TRAINERS[alt]=TRAINERS[source]
# All enabled Trainers use exact physical-card effects (including Special-only Hammer).

GATE={
 '2':'Dizzying Wind requires a next-turn Trainer coin-gate on both types of Trainers.',
 '25':'Trick Sticker changes Weakness into next turn.',
 '30':'Parabolic Spark discards selectable Lightning Energy across board to calculate attack.',
 '97':'Head Ringer attaches to opposing EX and adds one Colorless attack cost.',
 '98':'Jamming Net attaches to opposing EX and reduces attack damage.',
 '102':'Robo Substitute is a special 30 HP Basic with no Prize and no retreat.',
}
# The cards with existing reliable attack mappings but gated other mandatory
# mechanics remain collectible yet excluded from automated battle decks.

def attack(row,a):
 key=(str(row[0]),a[0]);t=(a[3] or '').strip()
 if key in ATTACKS:return ATTACKS[key]
 if not t:return N
 m=re.fullmatch(r"(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r"Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r"Flip a coin\. If heads, this attack does (\d+) more damage\.",t)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r"Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.",t)
 if m:return COIN(int(m[1]),int(m[2]))
 if t=='Flip a coin. If tails, this attack does nothing.':return E('coinAttackGate',heads=N)
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.?',t)
 if m:return H(int(m[1]))
 if t=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if t=='Discard an Energy attached to this Pokémon.':return DISC()
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',t)
 if m:return E('selfDamage',amount=int(m[1]))
 if t=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 return None
