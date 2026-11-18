"""HGSS Undaunted literal printed rules: mappings only where executable semantics match.

A missing mapping is an explicit battle gate, never a fake noop. Every attack
with blank printed text is a legitimate direct-damage noop.
"""
import re
import hgss1_verified as H
import hgss2_verified as U
N=H.N; ST=H.ST; S=H.S; Q=H.Q; H_L=H.H; COIN=H.COIN
BONUS=H.BONUS; SEARCH=H.SEARCH; PICK=H.PICK; DRAW=H.DRAW
GUARD=H.GUARD; OPT=H.OPT; BENCH=H.BENCH

def rule(number,slug):return {'type':'neoRule','rule':f'hgss3:{number}:{slug}'}
def status(s,target='opponentActive'):return ST(s,target)
def damage_guard():return {'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}
def bonus_coin(amt):return Q(BONUS(amt))
ATTACKS={
 ('1',"Dance 'til Dawn"):S(COIN(3,30),ST('sleep','self')),
 ('2','Psybeam'):Q(ST('confusion')),
 ('3','Everyone Explode Now'):rule('3','everyoneExplode'),
 ('3','Mirror Shot'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('4','Poison Jab'):ST('poison'),
 ('6','Searing Flame'):ST('burn'),
 ('8','Tail Rap'):COIN(2,20),
 ('9','Air Cutter'):{'type':'coinAttackGate','heads':N},
 ('10','Quick Blow'):bonus_coin(30),
 ('11','Incessant Peck'):COIN('untilTails',20,False),
 ('12','Balloon Tackle'):{'type':'selfDamage','amount':20},
 ('13','Spike Spread'):S(BONUS(10),BENCH(10)),
 ('14','Backward Belt Throw'):rule('14','backwardBeltThrow'),
 ('15','Whirlwind'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('16','Vengeance'):rule('16','vengeance'),
 ('16','Shadow Bind'):H.LOCK(),
 ('17','Miasma Wind'):rule('17','miasmaWind'),
 ('17','Soothing Scent'):ST('sleep'),
 ('18','Quad Smash'):COIN(4,50),
 ('19','Poltergeist'):rule('19','poltergeist'),
 ('19','Sleeping Spell'):Q(ST('sleep')),
 ('20','Plasma Arrow'):rule('20','plasmaArrow'),
 ('21','Steel Coat'):rule('21','steelCoat'),
 ('22','Fresh-Picked Fruit'):rule('22','freshFruit'),
 ('23','Mach Wind'):{'type':'modifier','stat':'retreatCost','amount':-10,'scope':'self','duration':'nextOwnTurn'},
 ('24','Dazzling Pollen'):Q(BONUS(20),ST('confusion')),
 ('25','Feint Attack'):{'type':'sequence','effects':[{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},PICK(30)]},
 ('44','Enraged Assault'):rule('44','enragedAssault'),
 ('26','Flamethrower'):{'type':'neoRule','rule':'hgss1:49:flamethrower'},
 ('27','Miracle Powder'):Q({'type':'chooseOption','options':[{'label':s.title(),'effect':ST(s)} for s in ('sleep','poison','burn','paralysis','confusion')]}),
 ('28','Agility'):Q(damage_guard()),
 ('29','Scrap Attack'):Q({'type':'attachEnergyFromDiscard','amount':1,'energyType':'Metal','target':'self'}),
 ('30','Double Smash'):COIN(2,50),
 ('32','Charging Horn'):bonus_coin(20),
 ('33','Spark'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':20,'upTo':True},
 ('34','Razor-Sharp Incisors'):{'type':'damageFromDamage','source':'opponent','amount':1,'mode':'replace'},
 ('37','Stun Gas'):Q(ST('poison'),ST('paralysis')),
 ('37','Fury Swipes'):COIN(3,30),
 ('38','Full-Belly Refresh'):S({'type':'removeStatuses','target':'self','statuses':['burn','poison','sleep','paralysis','confusion']},H_L(30)),
 ('38','Startling Trip'):Q(ST('confusion'),ST('confusion','self')),
 ('39','Chase Up'):SEARCH(1),
 ('41','Spiral Drain'):H_L(20),
 ('41','Dual Splash'):{'type':'multiTargetDamage','target':'opponentPokemon','count':2,'amount':30},
 ('42','Metal Sound'):Q(ST('confusion')),
 ('43','Single Smash'):{'type':'coinAttackGate','heads':N},
 ('46','Minimize'):GUARD(20),
 ('46','Pull'):Q({'type':'forceOpponentSwitch','chooseBy':'defender'}),
 ('48','Call for Family'):{'type':'benchFromDeck','amount':1,'filter':{'kind':'pokemon','stage':'Basic'},'choose':True},
 ('48','Tickle'):Q(ST('paralysis')),
 ('49','Stun Poison'):Q(S(ST('paralysis'),ST('poison'))),
 ('50','Sticky Liquid'):{'type':'modifier','stat':'retreatCost','amount':1,'scope':'opponentActive','duration':'opponentTurn'},
 ('51','Detect'):Q(damage_guard()),
 ('51','Sky Uppercut'):{'type':'damageRule','ignoreResistance':True},
 ('54','Jump On'):bonus_coin(10),
 ('55','Slap Down'):COIN(2,10,False),
 ('57','Dual Draw'):S(DRAW(3),{'type':'draw','amount':3,'side':'opponent'}),
 ('60','Find a Friend'):Q(SEARCH(1,kind='pokemon',subtype='Grass')),
 ('61','Slam'):COIN(2,10),
 ('63','Focus Energy'):{'type':'nextAttackBonus','attackName':'Surprise Attack','amount':40},
 ('63','Surprise Attack'):{'type':'coinAttackGate','heads':N},
 ('65','Slashing Strike'):{'type':'lock','action':'attack','attackName':'Slashing Strike','target':'self','duration':'nextOwnTurn'},
 ('68','Beat Up'):rule('68','beatUp'),
 ('68','Fury Swipes'):COIN(3,10),
 ('69','Double Scratch'):COIN(2,10),
 ('81','Solar Ray'):H_L(10,'selfAll'),
 ('82','Dark Clamp'):H.LOCK(),
 ('83','Mega Thunderbolt'):H.DISC('all'),
 ('84','Metal Scissors'):{'type':'energyDamage','source':'self','energyType':'Metal','amount':20,'mode':'add'},
 ('86','Evoblast'):rule('86','evoblast'),
 ('87','Massive Eruption'):S({'type':'topDeckCountDamage','count':5,'amount':100,'filter':{'kind':'energy'}},{'type':'discardTop','side':'self','amount':5}),
 ('88','Massive Eruption'):S({'type':'topDeckCountDamage','count':5,'amount':100,'filter':{'kind':'energy'}},{'type':'discardTop','side':'self','amount':5}),
 ('89','Ozone Buster'):H.DISC('all','self','Fire'),
 ('90','Ozone Buster'):H.DISC('all','self','Fire'),
}
# Known generic parser matches precisely printed standard sentences; no
# generic fallback may turn an unsupported nonempty clause into noop.
def attack(row,a):
 n=str(row[0]);key=(n,a[0]);text=(a[3] or '').strip()
 if key in ATTACKS:return ATTACKS[key]
 if not text:return N
 return H.attack(['0',row[1]],a)

ABILITIES={
 ('1','Hustle Step'):{'type':'activated','oncePerTurn':True,'effect':H_L(10,'selfAll')},
 ('11','Retreat Aid'):{'type':'passive','effect':{'type':'modifier','stat':'retreatCost','amount':-2,'scope':'active','duration':'whileInPlay','condition':{'type':'selfOnBench'}}},
 ('40','DARK'):{'type':'triggered','event':'benched','fromHandOnly':True,'effect':SEARCH(1,kind='energy',name='Darkness Energy')},
 ('82','Fire Breath'):{'type':'activated','oncePerTurn':True,'effect':Q(ST('burn'))},
 ('83','Voltage Increase'):{'type':'activated','oncePerTurn':False,'effect':rule('83','voltageIncrease')},
 ('86','Cloud-Covered Moon'):{'type':'activated','oncePerTurn':True,'effect':Q({'type':'returnToHand','target':'self','returnBasicEnergy':True})},
}
def ability(row,p):
 mapped=ABILITIES.get((str(row[0]),p[0]))
 if not mapped:return None
 # The generator owns canonical ability name, text, and power/body classification.
 return mapped

TRAINERS={
 '73':('Item',{'type':'tradeHandForDeck','handFilter':{'kind':'energy'},'deckFilter':{'kind':'energy'}}),
 '77':('Supporter',{'type':'selectTopToHand','count':5,'amount':2,'remaining':'discard'}),
}
