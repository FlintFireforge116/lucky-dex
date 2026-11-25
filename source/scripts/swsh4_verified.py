"""Vivid Voltage exact printed-rule mappings; fail closed on unsupported effects."""
from copy import deepcopy
from pathlib import Path
import json,re
import swsh35_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
ROWS=json.loads((Path(__file__).resolve().parents[1]/'data/classic/swsh4-print-compact.json').read_text())
A={};B={};T={};X={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
def attack(row,a):return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(['_swsh4_',*row[1:]],a)
def ability(row,a):return deepcopy(B.get(tuple(a))) or V.ability(['_swsh4_',*row[1:]],a)
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return deepcopy(X.get((row[1],tuple(row[13])))) or V.energy(row)
def prism_ready(row):return False


# Exact signatures using already implemented shared primitives.
from swsh3_verified import Q,mod,trig,N,W,S,R,search
from swsh2_verified import choose,discard
at(1,'Bug Hunch',search(2,kind='pokemon',subtype='Grass'))
for n,t in [(5,'Head Crack'),(105,'Torment')]:at(n,t,E('chooseAttackLock',target='opponentActive',duration='opponentTurn'))
at(8,'Iron Defense',coin(E('preventDamage',target='self',duration='opponentTurn')))
at(19,'Special Anchor',bonus(60,cond('selfHasSpecialEnergy')))
ab(21,activated(E('placeDamageCounters',target='opponentAll',amount=10),activeOnly=True))
at(25,'Royal Blaze',E('discardCountDamage',side='self',filter={'kind':'trainer','name':'Leon'},amount=50,mode='add'))
ab(25,activated(E('sm7Rule',rule='sm9TopPick',count=3,amount=1,filter={},destination='hand',rest='discard')))
for n,count in [(34,1),(35,2)]:at(n,'Aqua Wash',W('ReturnAttachments',target='opponentActive',left=count,optional=True))
at(39,'Vise Wave',E('status',target='opponentActive',status='paralysis',condition=cond('sm10Supporter',name='Nessa')))
at(41,'Flock',E('benchFromDeck',amount=2,filter={'kind':'pokemon','name':'Arrokuda','stage':'Basic'},choose=True,optional=True))
at(43,'Charge',R('SearchAttach',amount=2,energyTypes=['Lightning'],sourceSelf=True))
ab(52,trig('evolved',E('chooseOption',options=[{'label':'Draw 3 cards','effect':E('draw',amount=3)},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
at(56,'Shocking Pursuit',E('damageFromDamage',source='opponent',amount=2,mode='replace'))
ab(57,passive(mod('retreatCost',-999,condition=cond('selfEnergyAtLeast',amount=1,countSpecial=True))))
at(58,'Shocking Smash',coin(choose('opponentPokemon',discard(1,'opponentPokemon'),filter={'hasAnyEnergy':True})))
at(60,'Wild Shock',seq(E('selfDamage',amount=60),status('paralysis')))
at(61,'Fighting Lightning',bonus(80,cond('opponentMatches',filter={'tag':['pokemon-v','pokemon-gx']})))
at(65,'Psypower',S('CounterSpread',amount=2,filter={}))
at(65,'Commanding Tail',E('chooseOption',options=[{'label':'Opponent redraws four cards','effect':E('handShuffle',side='opponent',draw=4)},{'label':'Skip','effect':E('noop')}]))
at(72,'Auspicious Tone',seq(search(1,kind='pokemon'),search(1,kind='trainer',trainerType='Supporter')))
at(73,'Unamplified Soundwave',seq(E('attackRequirement',allowWhenFailed=True,condition=cond('handSizeOneOf',values=[0])),E('bonusDamage',amount=30),E('benchDamage',side='opponent',amount=30,all=True)))
at(78,'Geo Hunt',E('searchChosen',source='discard',amount=1,filter={}))
at(79,'Sensitive Ray',bonus(70,cond('supporterPlayed')))
ab(79,dict(type='passive',activeOnly=True,effect=E('modifier',stat='damageReduction',amount=30,scope='team',duration='whileInPlay')))
at(80,'Sweet Scent',choose('selfPokemon',E('heal',target='selfPokemon',amount=20)))
for n in (82,102):at(n,'Metal Armament',Q('DiscardAttach',left=1,sourceSelf=True))
at(82,'Amazing Sword',bonus(150,cond('pokemonPresent',side='opponent',zone='inPlay',filter={'stage':'VMAX'})))
at(87,'Earthquake',E('benchDamage',side='self',amount=20,all=True))
at(88,'Cycle Draw',S('Pay',amount=1,filter={},after=E('draw',amount=3)))
at(88,'Tornado Kick',bonus(80,cond('sm10Supporter',name='Bea')))
at(92,'Earthen Power',bonus(80,cond('ownStadiumInPlay')))
at(93,'Core Avenger',bonus(80,cond('sm10PrizeDeficit',amount=1)))
at(101,'Tentacle Buster',bonus(120,cond('sm10LastAttackSelf',name='Full Nelson')))
at(102,'Amazing Shield',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'VMAX'}))
at(104,'Ferocious Bellow',E('modifier',stat='attackDamage',amount=-50,scope='opponentActive',duration='opponentTurn'))
at(106,'Hazardous Claws',seq(discard(2),status('paralysis'),status('poison')))
at(109,'Tantrum',E('status',target='self',status='confusion'))
at(110,'Lucky Find',search(1,kind='trainer',trainerType='Item'))
at(114,'Double KO',seq(E('knockOut',target='opponentActive'),E('knockOut',target='self')))
at(118,'Leg Quake',E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'evolved':True})))
ab(118,passive(E('modifier',stat='retreatCost',amount=-999,scope='team',duration='whileInPlay')))
at(119,'Amazing Star',R('SearchAttach',amount=7))
ab(119,activated(E('sm7Rule',rule='sm9TopPick',count=2,amount=1,filter={},destination='hand',rest='top'),activeOnly=True))
at(120,'Spike Draw',E('draw',amount=1))
at(121,'Rewind Time',Q('DiscardAttach',left=2,energyType='Metal',sameTarget=True,optional=True))
at(124,'Swift Swing',seq(E('energyDamage',source='self',energyType='Metal',countProvidedType=True,amount=30,mode='replace'),E('switch',target='self',mandatory=True)))
at(127,'Max Hack',E('pointDamage',side='self',prizesTaken=True,amount=30,mode='add'))
at(128,'Overhaul',E('handShuffle',side='self',draw=6))
at(128,'Windup Cannon',E('benchCountDamage',side='opponent',amount=20,mode='add'))
ab(131,activated(seq(E('drawToHandSize',size=7),E('endTurn')),activeOnly=True))
at(132,'Wind Pressure',E('attackRequirement',allowWhenFailed=True,condition=cond('opponentHandSizeOneOf',values=list(range(6,61)))))
at(134,'Energy Assist',Q('DiscardAttach',left=2,benchOnly=True,sameTarget=True,optional=True))
for n,amount in [(136,20),(137,50)]:at(n,'Round',E('fieldCountDamage',side='self',filter={'attackName':'Round'},amount=amount,mode='replace'))
at(140,'White Wind',bonus(70,cond('opponentMatches',filter={'evolved':True})))
at(141,'Max Glide',E('searchChosen',amount=2,filter={},optional=True))
at(145,'Loop Cannon',W('ReturnAttachments',target='self',left=2))
at(172,'Zen Spoon',S('CounterSpread',amount=3,filter={}))
at(172,'Mind Ruler',E('handCountDamage',source='opponent',amount=30,mode='replace'))
tr(150,'Stadium',E('modifier',stat='damageReduction',amount=20,scope='both',duration='whileInPlay',filter={'stage':'Basic'}))
tr(154,'Supporter',E('modifier',stat='attackDamage',amount=30,scope='team',duration='turn'))

ab(74,passive(E('preventEffects',duration='whileInPlay',scope='self')))
at(84,'Fickle Impact',E('attackRequirement',allowWhenFailed=True,condition=cond('sm6OwnPrizes',values=[1,3,5])))
at(85,'Deck Distiller',E('coinUntilTails',effect=E('discardTop',side='opponent',amount=1)))
ab(32,trig('energyAttached',E('removeStatus',target='self'),fromHandOnly=True))
at(9,'Energy Press',E('energyDamage',source='opponent',amount=30,mode='replace',countProvidedType=True))

at(44,'G-Max Volt Tackle',E('sm7Rule',rule='swsh4VoltTackle'))
tr(155,'Tool',E('previousEvolutionAttacks'))
ab(144,trig('evolved',R('TopAttach',count=3,includeSpecial=False),fromHandOnly=True))
tr(151,'Item',seq(E('revealHand',side='opponent'),E('inspectTop',side='opponent',amount=1)))

# v488 shared continuation. Exact printed signatures including alternate arts.
def VV(rule,**kw):return E('sm7Rule',rule='swsh4'+rule,**kw)
at(29,'Fast Flight',seq(E('discardHand',side='self',amount=99),E('draw',amount=6)))
at(49,'Damaging Spark',E('benchDamage',side='opponent',all=True,amount=30,filter={'damaged':True}))
at(97,'Heavy Slam',E('retreatCostDamage',amount=30,mode='add',negative=True))
at(99,'Eruption Shot',VV('EruptionShot'))
at(138,'Amazing Burst',VV('AmazingBurst'))
at(42,'Targeted Skewer',VV('TargetedSkewer'))
ab(125,trig('damagedByAttack',E('sm7Rule',rule='swsh2Retaliate',amount=30),activeOnly=True,opponentAttackOnly=True))
ab(81,trig('evolved',E('chooseOption',options=[{'label':'Each player draws a card','effect':seq(E('draw',amount=1),E('draw',side='opponent',amount=1))},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
ab(68,trig('evolved',VV('Devolution'),fromHandOnly=True))
ab(64,activated(VV('LunarBlessing')))
tr(146,'Supporter',VV('Allister'))
tr(147,'Supporter',R('TopAttach',count=5,benchOnly=True,targetFilter={'subtype':'Fighting'},includeSpecial=True,discardRest=True))
tr(148,'Supporter',E('draw',amount=2))
tr(149,'Supporter',VV('CaraLiss',left=2))
tr(153,'Supporter',seq(E('draw',amount=2),E('draw',amount=2,condition=cond('stadiumInPlay',cardId='swsh4-161'),optionalCondition=True)))
tr(156,'Item',VV('Cheese',left=2))
tr(157,'Supporter',VV('Nessa',left=4))
tr(158,'Supporter',VV('Opal'))
tr(159,'Tool',VV('RockyHelmet'))
tr(161,'Stadium',VV('Wyndon'))
for no,typ in [(162,'Grass'),(163,'Metal'),(164,'Fighting'),(165,'Water')]:
 row=next(r for r in ROWS if r[0]==str(no));X[(row[1],tuple(row[13]))]=E('specialEnergy',provides={typ:1})

# v489: exact signatures, reuse staged evolution and attachment handlers.
at(9,'Amazing Bloom',N('Breeder',left=8,amazingBloom=True))
at(15,'Flower Bearing',coin(E('shuffleIntoDeck',target='opponentActive',includeAttached=True,bottomOnly=True)))
at(22,'Jungle Rising',E('sm7Rule',rule='sm12HandAttach',left=2,benchOnly=True,basicOnly=True,optional=True,healAll=True))
at(48,'Thunder Snipe',VV('ThunderSnipe'))
at(111,'Trash Cyclone',VV('TrashCyclone'))
at(113,'Stealy Claws',VV('StealyClaws'))
tr(160,'Tool',VV('TelescopicSight'))

at(40,'Continuous Gulp Missile',VV('GulpMissile'))

# v490 shared delayed attachment trap, choice payments, movement and Prize rules.
at(59,'Electrified Bite Mark',VV('BiteMark'))
at(59,'Electro Sprinkler',seq(E('selectedSelfBenchDamage',amount=30),E('multiTargetDamage',target='opponentBench',amount=30,count=1)))
at(76,'Flying Fury',VV('FlyingFury'))
ab(46,activated(seq(E('sm7Rule',rule='sm9SearchAttach',amount=2,energyTypes=['Lightning'],targetFilter={'subtype':'Lightning'}),E('knockOut',target='self')),benchOnly=True))
ab(174,passive(VV('Spear')))
tr(152,'Tool',E('modifier',stat='maxHp',amount=-100,scope='self',duration='whileInPlay',filter={'stage':'VMAX'}))

# v491: direct-from-hand evolution placement, conditional suppression, and coin-gated copying.
ab(3,passive(E('sm7Rule',rule='swsh4ElusiveMaster')))
for no in [26,30,47]:ab(no,passive(E('sm7Rule',rule='swsh4Awakening')))
at(63,'Mini-Metronome',E('copyAttack',source='opponentActive',swsh2Copy=True,sm12Copy=True,swsh4CoinCopy=True))
