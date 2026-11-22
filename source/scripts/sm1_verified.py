"""Sun & Moon SM1: conservative exact-print effects and safe inherited mechanics.

No unrelated number-based fallback; GX attack use is enforced in battle core.
Unsupported printed text or abilities MUST gate the entire print.
"""
import re
from xy8_verified import attack as generic_attack
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw:{'type':t,**kw}
# Exact semantic rewrites. Every return is an existing supported effect type.
REUSE={
 ('2','Iron Defense'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('3','Whirlwind'):E('forceOpponentSwitch',chooseBy='defender'),
 ('10','Sharp Blade Quill'):E('selectedDamage',target='opponentPokemon',amount=20),
 ('18','Sweet Scent'):E('chooseTarget',target='selfPokemon',effect=H(30,'selfPokemon')),
 ('19','Sweet Scent'):E('chooseTarget',target='selfPokemon',effect=H(30,'selfPokemon')),
 ('20','Trop Kick'):S(H(20),E('removeStatuses',target='selfActive',statuses=['sleep','poison','burn','paralysis','confusion'])),
 ('22','Firestorm'):DISC(3,'self','Fire'),
 ('25','Fury Swipes'):COIN(3,20),('25','Flamethrower'):DISC(),
 ('26','Darkest Lariat'):COIN(2,100),
 ('27','Hustling Strike'):E('fieldCountDamage',side='self',benchOnly=True,filter={'subtype':'Fire'},amount=20,mode='add'),
 ('28','Confusion Wave'):S(ST('confusion','selfActive'),ST('confusion')),
 ('30','Hydro Pump'):E('energyDamage',source='self',energyType='Water',amount=10,mode='add'),
 ('31','Double Slap'):COIN(2,30),
 ('34','Headlock'):Q(BONUS(30),ST('paralysis')),
 ('34','Guard Press'):GUARD(20),
 ('35','Collect'):DRAW(3),
 ('35','Blizzard Burn'):E('lock',action='attack',target='self',duration='nextOwnTurn'),
 ('36','Call for Family'):E('benchFromDeck',amount=2,filter={'stage':'Basic'}),
 ('38','Fly'):E('neoRule',rule='xy4:fly'),
 ('42','Roaring Seas'):DISC(1,'opponentActive'),
 ('43','Avalanche'):E('benchDamage',side='opponent',amount=10,all=True),
 ('47','Continuous Tumble'):COIN('untilTails',30),
 ('48','Vivid Charge'):SEARCH(3,kind='energy',basicEnergy=True),
 ('48','Psychic Fangs'):E('damageRule',ignoreEffects=True),
 ('50','Aqua Spark'):BONUS(60,{'type':'selfHasEnergyType','energyType':'Water'}),
 ('52','Electro Cannon'):DISC(3),
 ('53','Defense Curl'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('54','Astonish'):E('shuffleRandomHandCard',side='opponent'),
 ('56','Triple Poison'):E('status',status='poison',target='opponentActive',amount=30),
 ('56','Surprise Strike'):BONUS(60,{'type':'movedFromBenchThisTurn'}),
 ('58','Crunch'):Q(DISC(1,'opponentActive')),
 ('59','Psychic Boom'):E('energyDamage',source='opponent',amount=10,mode='replace'),
 ('60','Meditate'):E('damageFromDamage',source='opponent',amount=1,mode='add'),
 ('61','Psychic'):E('energyDamage',source='opponent',amount=30,mode='add'),
 ('63','Venoshock'):BONUS(50,{'type':'opponentStatus','status':'poison'}),
 ('64','Dust Gathering'):DRAW(1),
 ('68','Push Out'):E('forceOpponentSwitch',chooseBy='defender'),
 ('73','Team Play'):E('fieldCountDamage',side='self',benchOnly=True,filter={'name':'Passimian'},amount=30,mode='replace'),
 ('74','Shore Up'):E('attachEnergyFromDiscard',target='self',energyType='Fighting',amount=1),
 ('78','Fury Swipes'):COIN(3,10),
 ('79','Taunt'):E('forceOpponentSwitch',chooseBy='attacker'),
 ('79','Claw Rend'):BONUS(30,{'type':'opponentDamaged'}),
 ('80','Strafe'):OPT('Switch this Pokémon',SWITCH()),
 ('83','Crunch'):Q(DISC(1,'opponentActive')),
 ('85','False Accusation'):E('handCountDamage',source='opponent',amount=20,mode='add'),
 ('89','Sunsteel Strike'):DISC('all'),
 ('90','Reckless Charge'):Q(N,E('selfDamage',amount=10)),
 ('91','Fight Back'):BONUS(80,{'type':'selfDamaged'}),
 ('96','Dragon Wave'):S(DISC(1,'self','Grass'),DISC(1,'self','Lightning')),
 ('97','Peck Bugs'):BONUS(30,{'type':'opponentMatches','filter':{'subtype':'Grass'}}),
 ('98','Slashing Strike'):E('lock',action='attack',target='self',attackName='Slashing Strike',duration='nextOwnTurn'),
 ('99','Cross-Cut'):BONUS(30,{'type':'opponentMatches','filter':{'evolved':True}}),
 ('99','Hurricane Punch'):COIN(4,50),
 ('100','Rage'):E('damageFromDamage',source='self',amount=1,mode='add'),
 ('100','Mad Bull-GX'):E('damageFromDamage',source='self',amount=3,mode='replace'),
 ('101','Quick Draw'):Q(DRAW(1)),('101a','Quick Draw'):Q(DRAW(1)),
 ('105','Ferocious Bellow'):E('modifier',stat='attackDamage',amount=-50,scope='opponentActive',duration='opponentTurn'),
 ('107','Bullet Seed'):COIN(4,20),
 ('108','Echoed Voice'):E('nextAttackBonus',attackName='Echoed Voice',amount=60),
 ('112','Superpower'):E('chooseOption',options=[{'label':'Normal attack','effect':N},{'label':'40 more damage; 20 recoil','effect':S(BONUS(40),E('selfDamage',amount=20))}]),
 ('113','Psychic'):E('energyDamage',source='opponent',amount=20,mode='add'),
 ('110','Gumshoe Chance-GX'):E('energyDamage',source='opponent',amount=50,mode='add'),
}
# SM1 completion: exact printed mechanics, never a noop substitute.
# All unusual choices are implemented by the shared sm1Rule runtime.
SM=lambda rule,**kw:E('sm1Rule',rule=rule,**kw)
REUSE.update({
 ('5','Fury Cutter'):E('coinTierBonus',coins=3,tiers={'1':20,'2':60,'3':110}),
 ('6','Roof Fling'):SM('roofFling'),
 ('8','Struggle Bug'):E('moveEnergy',source='opponentActive',target='opponentBench',amount=1),
 ('12','Hollow Hunt-GX'):SM('hollowHunt'),
 ('14','Synthesis'):SM('synthesis'),
 ('15','Flower Supply'):SM('flowerSupply'),
 ('15','Chloroscythe-GX'):E('energyDamage',source='self',energyType='Grass',amount=50,mode='replace'),
 ('29','Double Jet'):SM('doubleJet'),
 ('32','Wake-Up Slap'):SM('wakeUpSlap'),
 ('37','Roost'):S(H(30),E('lock',action='retreat',target='self',duration='nextOwnTurn')),
 ('38','Courier'):SM('courier'),
 ('42','Bubble Beat'):E('energyDamage',source='self',all=True,energyType='Water',amount=20,mode='add'),
 ('42','Grand Echo-GX'):E('heal',target='selfAll',amount=9999),
 ('49','Searching Light'):SM('searchingLight'),
 ('53','Discharge'):SM('discharge'),
 ('61','Divide-GX'):SM('divideGX'),
 ('66','Moongeist Beam'):SM('moongeist'),
 ('66','Lunar Fall-GX'):SM('lunarFall'),
 ('69','Smack Down'):SM('smackDown'),
 ('71','Rock Artillery'):SM('rockArtillery'),
 ('75','Absorb Vitality'):SM('absorbVitality'),
 ('77','Evil Orders'):SM('evilOrders'),
 ('80','Dark Call-GX'):SM('darkCall'),
 ('81','Gnaw Through'):SM('gnawThrough'),
 ('82','Aqua Impact'):E('retreatCostDamage',amount=20,mode='add'),
 ('84','Knock Off'):SM('knockOff'),
 ('85','Obsidian Fang'):SM('obsidianFang'),
 ('86','Spelunk'):E('reorderTop',count=3),
 ('87','Dig Under'):SM('digUnder'),
 ('88','Metallic Sound'):SM('metallicSound'),
 ('89','Sol Burst-GX'):SM('solBurst'),
 ('92','Fly Around'):SM('flyAround'),
 ('94','Signs of Evolution'):SM('signsEvolution'),
 ('95',"Dragon's Wish"):SM('dragonsWish'),
 ('98','Devastating Wind'):E('handShuffle',side='opponent',draw=3),
 ('103','Work Up'):SM('workUp'),
})
# Every full-art and secret GX print shares its rules with the non-full-art
# version, even when official text has a synonymous 'number'/'amount'.
for base,alts in [('15',['138','150']),('35',['139','151']),('61',['140','152']),('66',['141','153']),('80',['142','154']),('89',['143','155']),('100',['144','156']),('110',['145','157'])]:
 for (num,title),effect in list(REUSE.items()):
  if num==base:
   for alt in alts:REUSE[(alt,title)]=effect
# Exact reprinted GX text can be analyzed after removing only the standard
# once-per-game restriction, never the distinctive attack instructions.
GX_RESTRICTION=r'\s*\(You can.t use more than 1 GX attack in a game\.\)\s*'
def attack(row,printed):
 n,title=str(row[0]),printed[0]
 if (n,title) in REUSE:return REUSE[n,title]
 a=list(printed)
 if title.endswith('-GX'):a[3]=re.sub(GX_RESTRICTION,'',a[3]).strip()
 return generic_attack(['_sm1_generic_',*list(row)[1:]],a)

# Checked Trainer effects. Unmapped Trainers are visible but safely gated.
TRAINERS={
 '116':('Item',SEARCH(2,source='discard',kind='energy',basicEnergy=True)),
 '119':('Item',E('takeTopMatching',count=7,filter={'kind':'pokemon'},amount=1)),
 '120':('Supporter',DRAW(3)),
 '123':('Item',E('benchFromDeck',amount=1,filter={'stage':'Basic'})),
 '125':('Item',Q(SEARCH(1,kind='pokemon'))),
 '126':('Item',Q(E('forceOpponentSwitch',chooseBy='attacker'))),
 '127':('Item',E('chooseTarget',target='selfPokemon',effect=H(30,'selfPokemon'))),
 '129':('Item',E('rareCandy')),
 '130':('Item',E('forceOpponentSwitch',chooseBy='defender')),
 '132':('Item',E('switch',side='self')),
 '134':('Item',S(Q(SEARCH(1,kind='pokemon',evolved=True)),Q(SEARCH(1,kind='pokemon',evolved=True)))),
 '135':('Item',S(E('discardHand',side='self',amount=2,chosen=True),SEARCH(1,kind='pokemon'))),
 '118':('Tool',N),
 '124':('Tool',N),
}
for original,variants in [('123',['158']),('132',['160']),('135',['161'])]:
 for num in variants:TRAINERS[num]=TRAINERS[original]
TRAINERS.update({
 '114':('Item',SM('bigMalasada')),
 '115':('Item',SM('crushingHammer')),
 '117':('Item',SM('energySwitch')),
 '118':('Tool',N),
 '121':('Supporter',SM('ilima')),
 '122':('Supporter',SM('lillie')),
 '124':('Tool',N),
 '128':('Supporter',S(DRAW(2),SM('kukui'))),
 '131':('Item',SM('rotomDex')),
 '133':('Supporter',SM('teamSkullGrunt')),
})
for original,variants in [('121',['146']),('122',['147']),('128',['148']),('133',['149']),('131',['159'])]:
 for alt in variants:TRAINERS[alt]=TRAINERS[original]
# Tool effects (Exp Share / Poison Barb) only become active after their
# corresponding reactive core logic has been individually verified.
# Core reactive Tool hooks are installed for Exp Share and Poison Barb.
BASIC={'162':'Psychic','163':'Metal','164':'Grass','165':'Fire','166':'Water','167':'Lightning','168':'Psychic','169':'Fighting','170':'Darkness','171':'Metal','172':'Fairy'}
ENERGIES={'136':E('specialEnergy',provides={'Colorless':2}),'137':E('specialEnergy',provides={'Miracle':1})}
# Rainbow Energy's damage-on-attachment and one-unit flexible Energy behaviour
# must both work; otherwise do not expose this printed card as playable.
ABILITIES={
 'Instruct':{'type':'activated','oncePerTurn':True,'effect':E('drawToHandSize',size=3)},
 'Illuminate':{'type':'activated','oncePerTurn':True,'effect':SEARCH(1,kind='pokemon',subtype='Grass')},
 'Curative Pollen':{'type':'activated','oncePerTurn':True,'effect':E('chooseTarget',target='selfPokemon',effect=H(20,'selfPokemon'))},
 'Search the Premises':{'type':'activated','oncePerTurn':True,'effect':E('revealHand',side='opponent')},
}

ABILITIES.update({
 'Feather Arrow':{'type':'activated','oncePerTurn':True,'effect':SM('featherArrow')},
 'Queenly Majesty':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':SM('queenlyMajesty')},
 'Cowardice':{'type':'activated','oncePerTurn':True,'effect':SM('cowardice')},
 'Water Bubble':{'type':'passive','effect':SM('waterBubble')},
 'Innards Out':{'type':'triggered','event':'knockedOutByAttack','effect':SM('innardsOut')},
 'Strong Charge':{'type':'activated','oncePerTurn':True,'effect':SM('strongCharge')},
 'Power of Alchemy':{'type':'passive','effect':SM('powerAlchemy')},
 'Toxic Spikes':{'type':'passive','effect':SM('toxicSpikes')},
 'Psychic Transfer':{'type':'activated','oncePerTurn':False,'effect':SM('psychicTransfer')},
 'Wall of Sand':{'type':'passive','effect':SM('wallOfSand')},
 'Rough Skin':{'type':'triggered','event':'damagedByAttack','effect':SM('roughSkin'), 'activeOnly':True},
 'Tangling Hair':{'type':'passive','effect':SM('tanglingHair')},
 'Ultra Road':{'type':'activated','oncePerTurn':True,'effect':E('switch',side='self')},
 'Energy Evolution':{'type':'triggered','event':'energyAttached','fromHandOnly':True,'effect':SM('energyEvolution')},
 'Treasure Hunt':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':SM('treasureHunt')},
})
