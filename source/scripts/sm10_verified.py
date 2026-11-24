"""Unbroken Bonds: exact complete printed signatures, reuse audited shared descriptors."""
from copy import deepcopy
from pathlib import Path
import json
import sm9_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
ROWS=json.loads((Path(__file__).resolve().parents[1]/'data/classic/sm10-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
def attack(row,a):return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(row,a)
def ability(row,a):return deepcopy(B.get(tuple(a))) or V.ability(row,a)
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return None
def prism_ready(row):return False
def extra(cost):return cond('sm9ExtraEnergy',cost=cost)
at(20,'Outrage',E('damageFromDamage',source='self',amount=1,mode='add'))
at(20,'Flare Strike',E('lock',target='self',action='attack',attackName='Flare Strike',duration='nextOwnTurn'))
at(20,'Double Blaze-GX',seq(bonus(100,extra('RRRRRR')),E('damageRule',ignoreEffects=True,condition=extra('RRRRRR'))))
at(61,'Severe Poison',E('status',target='opponentActive',status='poison',amount=80))
at(61,'Poison Absorption',E('healSelf',amount=100,condition=cond('opponentStatus',status='poison')))
at(61,'Nasty Goo Mix-GX',seq(status('paralysis'),status('poison'),E('status',target='opponentActive',status='poison',amount=150,condition=extra('CCCC'))))
at(120,'Steel Fist',E('attachEnergy',source='deck',target='self',energyType='Metal',amount=1))
at(130,'Magical Miracle-GX',E('handShuffle',side='opponent',draw=0,condition=extra('YYYYYY')))
tr(177,'Supporter',seq(status('confusion'),status('poison')))
# Portable, complete printed effects; complex timing/payment paths remain gated.
for no,title,t in [(23,'Flame Charge','Fire'),(50,'Call Forth Cold','Water')]:at(no,title,E('attachEnergy',source='deck',target='self',energyType=t,amount=1))
at(50,'Hail Prison',seq(E('discardEnergyCard',target='self',amount=2,energyType='Water',strictEnergyType=True),status('paralysis')))
at(24,'Flare Blitz',E('discardEnergyCard',target='self',amount='all',energyType='Fire',strictEnergyType=True))
at(9,'Radar Eyes',E('selectTopToHand',count=7))
at(11,'Assassin Flight',seq(E('attackRequirement',condition=cond('opponentStatus')),E('multiTargetDamage',target='opponentBench',amount=90,count=1)))
at(12,'Ten-Card Return-GX',E('handShuffle',side='self',draw=10))
at(14,'Burning Venom',seq(status('burn'),status('poison')))
at(15,'Reactive Poison',E('statusCountDamage',source='opponent',amount=60,mode='add'))
at(17,'Chlorowhip',E('healSelf',amount=60,condition=extra('GG')))
at(18,'Electrical Signal',E('searchChosen',amount=2,filter={'kind':'pokemon','subtype':'Lightning'}))
at(19,'Big Cut',bonus(120,cond('sm6OwnPrizes',values=[4])))
at(22,'Grand Flame',E('attachEnergyFromDiscard',target='selfBench',energyType='Fire',amount=2))
for no,n in [(27,1),(79,1),(80,3),(147,2),(159,1)]:at(no,'Caturday',seq(E('draw',amount=n),E('status',target='self',status='sleep')))
for no,n in [(34,20),(35,30)]:ab(no,passive(E('modifier',stat='damageReduction',scope='self',amount=n,duration='whileInPlay')))
at(39,'Swirly Rush',bonus(90,cond('pokemonPresentAll',zone='bench',names=['Poliwag','Poliwhirl'])))
at(45,'Dual Blizzard',seq(E('discardEnergyCard',target='self',amount=2),E('multiTargetDamage',target='opponentPokemon',amount=60,count=2,activeWeaknessResistance=True)))
at(64,'Venoshock',bonus(50,cond('opponentStatus',status='poison')))
at(66,'Severe Poison',E('status',target='opponentActive',status='poison',amount=40))
at(72,'Stir the Brain',E('handCountDamage',side='opponent',amount=10,mode='add'))
at(75,'Psyshock',E('damageRule',ignoreEffects=True))
at(81,'Red Knuckles',bonus(60,cond('opponentMatches',filter={'tag':'ultra-beast'})))
at(82,'Revenge',bonus(90,cond('koByOpponentAttackLastTurn')))
at(82,'Acme of Heroism-GX',E('koGuard',mode='survive',target='self',duration='opponentTurn',remainingHp=10,condition=extra('FFCC')))
at(86,'Home Ground',bonus(60,cond('ownStadiumInPlay')))
at(91,'Bone Rush',E('coinDamage',coins='untilTails',amount=50,mode='replace'))
at(91,'Assault Boom',bonus(70,cond('opponentHasTool')))
at(95,'Hefty Cannon',E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'stage':'Basic'})))
at(95,'Break Ground',E('benchDamage',side='self',all=True,amount=20))
ab(98,passive(E('modifier',stat='retreatCost',scope='self',amount=-999,duration='whileInPlay',condition=cond('selfNoEnergy'))))
for no in [103,163]:at(no,'Power Cyclone',E('moveEnergy',source='self',target='selfBench',amount=1))
at(104,'Knuckle Blast',bonus(60,cond('ownPrizesMore')))
at(107,'Dark Pulse',E('energyDamage',source='self',all=True,energyType='Darkness',countProvidedType=True,amount=30,mode='add'))
at(111,'Bad Fangs',E('energyDamage',source='self',energyType='Darkness',countProvidedType=True,amount=20,mode='add'))
at(112,'Anguish Cry',E('damageFromDamage',source='self',amount=3,mode='add'))
ab(112,activated(E('selfDamage',amount=10)))
at(117,'Mist Slash',E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True))
at(119,'Dark Pressure',E('discardTop',side='opponent',amount=1))
ab(122,passive(E('modifier',stat='damageReduction',scope='team',filter={'subtype':'Metal'},amount=10,duration='whileInPlay')))
at(128,'Steel Melt',bonus(40,cond('opponentMatches',filter={'subtype':'Metal'})))
at(135,'Orb Polish',E('searchChosen',source='discard',amount=3,filter={'kind':'energy'}))
ab(140,passive(E('coinDamageGuard',preventAll=True)))
at(140,'Energy Blow',E('energyDamage',source='self',amount=30,mode='add'))
at(144,'Escaping Incisors',E('switch',target='self',mandatory=True,condition=cond('opponentMatches',filter={'evolved':True})))
at(146,'Drill Run Double',coin(E('discardEnergyCard',target='opponentActive',amount=2)))
at(149,'Vengeance',E('discardCountDamage',side='self',filter={'kind':'pokemon'},amount=20,maxAmount=180,mode='add'))
at(151,'Accelerating Stab',E('lock',target='self',action='attack',attackName='Accelerating Stab',duration='nextOwnTurn'))
at(162,'Mimic',E('handShuffle',side='self',draw='opponentHandCount'))
tr(173,'Item',E('searchChosen',source='discard',amount=3,filter={'kind':'energy','basicEnergy':True,'subtype':'Fire'}))
tr(182,'Item',E('selectTopToHand',count=7,filter={'kind':'trainer','trainerType':'Supporter'},optional=True))
# Leave cards with conditional payment, choices across multiple recipients, or bespoke continuous rules gated.
tr(176,'Supporter',E('sm7Rule',rule='sm9TopPick',count=4,amount=2,filter={},destination='hand',rest='shuffle'))
tr(172,'Tool',E('preventDamage',duration='whileInPlay',target='self',filter={'subtype':'Fairy'},attackerFilter={'subtype':'Lightning','isExOrGX':True}))
