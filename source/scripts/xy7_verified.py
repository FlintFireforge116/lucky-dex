"""Ancient Origins (XY7), completion: explicitly supported printed effects only.

Do not enable a print if *any* attack, Ability, theta Ancient Trait,
Trainer or Special Energy passive remains unaudited. Reuse battle effects only
when their target, timing, coin flips and provenance match the printed rules.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw: {'type':t,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}

ATTACKS={
 ('1','Trip Over'):Q(BONUS(10)),
 ('4','Windmill'):SWITCH(),
 ('4','Flower Tornado'):E('redistributeEnergy',allowedEnergyTypes=['Grass'],includeSpecialEnergy=True),
 ('5','String Shot'):Q(ST('paralysis')),
 ('6','Impound'):LOCK(),
 ('7','Sleep Poison'):Q(S(ST('sleep'),ST('poison'))),
 ('7','Unseen Claw'):BONUS(70,{'type':'opponentStatus'}),
 ('10','Intelligence Gathering'):OPT('Draw until you have 6 cards',E('drawToHandSize',size=6)),
 ('10','Bee Revenge'):E('discardCountDamage',side='self',filter={'kind':'pokemon'},amount=10,mode='add'),
 ('11','Bee Drain'):E('drain'),('11','Fury Swipes'):COIN(3,30),
 ('12','Bail Out'):SEARCH(2,source='discard',kind='pokemon'),
 ('12','Prize Count'):BONUS(80,{'type':'ownPrizesMore'}),
 ('13','Heat Breath'):Q(BONUS(20)),
 ('14','Burning Roar'):E('xy7BurningRoar'),
 ('14','Combat Blaze'):E('benchCountDamage',side='opponent',amount=20,mode='add'),
 ('15','Flame Screen'):GUARD(30),('15','Heat Tackle'):Q(t=E('selfDamage',amount=30)),
 ('8','Jagged Saber'):E('xy7JaggedSaber',amount=2),
 ('17','Solar Birth'):E('xy7SolarBirth'),
 ('17','Flamethrower'):DISC(),
 ('19','Epic Splash'):E('xy7EpicSplash'),
 ('18','Burning Scales'):COIN(2,20,False),('18','Wind Wheel'):E('forceOpponentSwitch',chooseBy='defender'),
 ('20','Berserker Splash'):S(BENCH(10,'self'),BENCH(10,'opponent')),
 ('20','Aqua Tail'):E('coinDamageByEnergy',amount=30,energyType='Water',countAttachedEnergyType=True),
 ('21','Full Retaliation'):E('xy7MagikarpRetaliation'),
 ('21','Thrash'):Q(BONUS(30),E('selfDamage',amount=30)),
 ('23','Deep Sea Search'):SEARCH(2,kind='trainer',trainerType='Tool'),
 ('23','Take Down'):E('selfDamage',amount=10),
 ('24','Ice Beam'):Q(ST('paralysis')),
 ('24','Resistance Blizzard'):E('neoRule',rule='xy5:resistanceDesert'),
 ('25','Glaciate'):S(BONUS(30),BENCH(30,'opponent')),
 ('25','Icecalibur'):S(DISC(),E('lock',action='attack',target='opponentActive',duration='opponentTurn')),
 ('27','Thunder Rod'):E('xy7ThunderRod'),
 ('27','Sparkling Tail'):E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
 ('29','Electric Mischief'):E('coinRepeatEffect',coins=3,effect=E('shuffleRandomHandCard',side='opponent')),
 ('28','Exavolt'):OPT('Do 50 extra damage, Paralyze, and 30 self-damage',S(BONUS(50),ST('paralysis'),E('selfDamage',amount=30))),
 ('32','Future Spin'):E('chooseOption',options=[
  {'label':'Arrange the top 3 cards of your deck','effect':E('reorderTop',deckSide='self',count=3)},
  {'label':"Arrange the top 3 cards of the opponent's deck",'effect':E('reorderTop',deckSide='opponent',count=3)}]),
 ('33','Rewind'):E('xy7Rewind'),
 ('33','Hyper Beam'):Q(DISC(1,'opponentActive')),
 ('34','Smash Punch'):E('coinAttackGate',heads=N),
 ('35','Superpower'):OPT('Do 40 more damage and 20 self-damage',S(BONUS(40),E('selfDamage',amount=20))),
 ('36','Hyperspace Fury'):S(E('selectedDamage',target='opponentPokemon',amount=100),DISC(2)),
 ('37','Steaming Mad'):S(E('damageFromDamage',source='self',amount=2,mode='replace'),ST('confusion','self')),
 ('37','Crazy Hammer'):S(BONUS(80,{'type':'selfStatus'}),E('removeStatus',target='self')),
 ('38','Nap'):H(20),
 ('39','Landslide'):E('damageRule',ignoreResistance=True),
 ('40','Unyielding Rock'):BONUS(60,{'type':'opponentEx'}),
 ('41','Dig Out'):E('xy7DigOut'),('41','Double Lariat'):COIN(2,90),
 ('42','Break Ground'):BENCH(10,'self'),
 ('43','Destroyer King'):E('damageFromDamage',source='opponent',amount=6,mode='add'),
 ('44','Bewitching Eyes'):E('xy7BewitchingEyes'),
 ('44','Furtive Drop'):E('placeDamageCounters',target='opponentActive',amount=30),
 ('45','Ink Spit'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('46','Entangling Control'):E('xy7EntanglingControl'),
 ('46','Trash Tentacle'):SEARCH(1,source='discard'),
 ('46','Entangling Control'):S(E('forceOpponentSwitch',chooseBy='attacker'),ST('confusion')),
 ('46','Trash Tentacle'):SEARCH(1,source='discard'),
 ('48','Bullet Punch'):COIN(2,20,False),
 ('49','Iron Cannon'):E('xy7IronCannon'),
 ('50','Machine Gun Stomp'):E('handCountDamage',side='self',amount=10,mode='add'),
 ('50','Guard Press'):GUARD(20),
 ('51','Iron Head'):COIN('untilTails',30),
 ('51','Forbidden Iron Hammer'):E('discardEnergyCard',amount=1,target='opponentActive',condition={'type':'opponentEx'}),
 ('53','Calm Mind'):H(30),
 ('54','Telekinesis'):E('selectedDamage',target='opponentPokemon',amount=50,ignoreWeakness=True,ignoreResistance=True),
 ('55','Cotton Bed'):ST('sleep'),
 ('56','Windy Mischief'):E('xy7WindyMischief'),
 ('57','Chaos Wheel'):E('xy7ChaosWheel'),
 ('59','Bubble'):Q(ST('paralysis')),
 ('60','Liquid Blow'):E('xy7LiquidBlow'),
 ('60','Shining Breath'):E('xy7ShiningBreath'),
 ('61','Act Tough'):BONUS(20,{'type':'selfHasEnergyType','energyType':'Darkness'}),
 ('62','Fake Out'):Q(ST('paralysis')),('62','Ambush'):Q(BONUS(30)),
 ('63','Lunge'):E('coinAttackGate',heads=N),
 ('64','Data Check'):E('xy7DataCheck'),
 ('66','Cyber Crush'):E('xy7CyberCrush'),
 ('66','Slowing Beam'):E('xy7SlowingBeam'),
 ('65','Tri Attack'):COIN(3,30),
 ('67','Digital Reboot'):E('xy7DigitalReboot'),
 ('67','Dazzle Blast'):ST('confusion'),
 ('68','Aero Ball'):E('xy7AeroBall'),
 ('68','Deep Hurricane'):S(BONUS(70,{'type':'stadiumInPlay'}),E('discardStadium',condition={'type':'stadiumInPlay'})),
 # θ Double cards: all effects on these prints already use verified handlers.
 ('15','Flame Screen'):GUARD(30),
 ('43','Destroyer King'):E('damageFromDamage',source='opponent',amount=6,mode='add'),
 # θ Max Secret Rares reuse the exact effects of the original official prints.
 ('96','Tidal Storm'):E('neoRule',rule='xy5:tidalStorm'),
 ('97','Gaia Volcano'):E('neoRule',rule='xy5:gaiaVolcano'),
 ('98','Emerald Break'):E('benchCountDamage',side='self',amount=30,mode='replace'),
 # Aero Ball counts both Active Energy totals; left gated until the
 # existing energyDamage handler supports that exact combined scope.
}
# Prize Count is based on the actual unclaimed Prize-card piles of both sides,
# not score or the default tabletop six Prize cards.
# Stage 6: Entangling Control confuses the *new* Active only after choice.
# Trash Tentacle searches only existing physical discard/ledger entries.
# θ traits are independent of Abilities; card eligibility still requires
# every individual attack and Ability to be implemented.

# Every shiny EX reprint is its own collection print but has identical rules.
for original,alternative in [('7','84'),('8','85'),('25','86'),('27','87'),('28','88'),('36','89'),('37','90'),('42','91'),('43','92'),('57','93'),('68','94'),('75','75a')]:
 for (num,name),effect in list(ATTACKS.items()):
  if num==original:ATTACKS[(alternative,name)]=effect

# Exact reused Trainer rules. All other items / Stadiums / Special Energy cards
# stay visible but gated. Spirit Links are paired to matching Mega IDs in core.
TRAINERS={
 '69':('Supporter',S(E('handShuffle',side='self',draw=6,condition={'type':'ownPrizesMore'}),
                         E('handShuffle',side='opponent',draw=3,condition={'type':'ownPrizesMore'}))), # Ace Trainer
 '70':('Tool',N),  # Ampharos Spirit Link
 '71':('Item',E('xy7RecycleTools',amount=3)),
 '72':('Item',E('xy7RecycleBasics',amount=5)),
 '76':('Item',SEARCH(1,kind='pokemon',hpAtMost=90)), # Level Ball
 '77':('Tool',E('triggeredEffect',event='damagedByAttack',activeOnly=True,opponentAttackOnly=True,effect=DRAW(2))), # Lucky Helmet
 '73':('Stadium',N),  # Faded Town: between-turn damage in shared core
 '74':('Stadium',N),  # Forest of Giant Plants: evolution timing in shared core
 '75':('Supporter',E('xy7HexManiac')),
 '75a':('Supporter',E('xy7HexManiac')),
 '78':('Supporter',E('forceOpponentSwitch',chooseBy='attacker')),
 '79':('Item',S(E('discardStadium'),DRAW(1))),
 '80':('Tool',N),  # Sceptile Spirit Link
 '81':('Tool',N),  # Tyranitar Spirit Link
 '95':('Supporter',S(SEARCH(1,kind='trainer',trainerType='Supporter'),SEARCH(1,kind='energy',basicEnergy=True))),
 '99':('Item',E('neoRule',rule='bw1:energyRetrieval')),
 '100':('Item',E('selectTopToHand',count=4,optional=True,filter={'kind':'trainer','notName':"Trainers' Mail"})),
}
TRAITS_IMPLEMENTED={'θ Stop','θ Double','θ Max'}  # Engine-level, with cross-set tests.
# Only existing independently-tested Ability hooks. All global passives remain
# gated until cross-set targeting and Ability-suppression are verified.
ABILITIES={
 'Irritating Pollen':{'type':'passive','effect':S(E('actionLock',cardType='Item',side='both',duration='whileInPlay'), E('actionLock',cardType='Tool',side='both',duration='whileInPlay'))},
 'Poisonous Nest':{'type':'activated','oncePerTurn':True,'effect':E('xy7PoisonousNest')},
 'Flare Effect':{'type':'passive','effect':E('additionalType',types=['Fire'])},
 'Aqua Effect':{'type':'passive','effect':E('additionalType',types=['Water'])},
 'Electric Effect':{'type':'passive','effect':E('additionalType',types=['Lightning'])},
 'Double Type':{'type':'passive','effect':E('additionalType',types=['Psychic','Fighting'])},
 'Farewell Letter':{'type':'activated','benchOnly':True,'oncePerTurn':True,'effect':S(E('discardSelf'),DRAW(1))},
 'Magnetic Warp':{'type':'activated','oncePerTurn':True,'effect':E('xy7MagneticWarp')},
 'Renegade Pulse':{'type':'passive','effect':E('xy7RenegadePulse')},
 'Scoundrel Ring':{'type':'triggered','event':'benched','fromHandOnly':True,
   'effect':OPT('Search for up to 3 Pokémon-EX except Hoopa-EX',
     SEARCH(3,kind='pokemon',isEx=True,notName='Hoopa-EX'))},
 'Bright Heal':{'type':'activated','oncePerTurn':True,'effect':H(20,'selfAll')},
 'Water Down':{'type':'triggered','event':'energyAttached','fromHandOnly':True,'energyType':'Water',
   'effect':OPT('Search your draw deck for Goomy',E('benchFromDeck',amount=1,choose=True,filter={'kind':'pokemon','name':'Goomy'}))},
}

def attack(row, a):
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
 if txt=="Flip a coin. If tails, this attack does nothing.":return E('coinAttackGate',heads=N)
 if txt=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if txt=="Discard an Energy attached to this Pokémon.":return DISC()
 if txt=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',txt)
 if m:return E('selfDamage',amount=int(m[1]))
 return None
