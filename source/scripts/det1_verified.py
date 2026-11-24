"""Detective Pikachu: printed effects; use only exact known mappings."""
from copy import deepcopy
import sm9_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
A={
('1','Find a Friend'):E('searchChosen',amount=1,filter={'kind':'pokemon','subtype':'Grass'}),
('2','Punch and Run'):E('switch',target='self',mandatory=True),
('3','Sleep Spore'):status('sleep'),
('4','Reckless Charge'):E('selfDamage',amount=10),
('5','Wild Tackle'):E('selfDamage',amount=50),
('7','Panic'):E('status',target='self',status='confusion'),
('8','Hold Still'):E('healSelf',amount=10),
('9','Furious Shurikens'):E('multiTargetDamage',target='opponentPokemon',amount=50,count=2,activeWeaknessResistance=True),
('10','Scout'):E('revealHand',side='opponent'),
('11','Juggling'):E('coinDamage',coins=4,amount=20,mode='replace'),
('12','Psyjack'):E('chooseAttackLock',duration='opponentTurn'),
('12','Break Burn'):E('discardEnergyCard',target='self',energyType='Psychic',amount=2,strictEnergyType=True),
('13','Directing Traffic'):E('reorderTop',deckSide='self',count=5),
('14','Healing Melody'):E('heal',target='selfAll',amount=10),
('16','Continuous Lick'):E('coinDamage',coins='untilTails',amount=20,mode='replace'),
# Copy Anything is explicitly gated pending full copied-cost and GX validation.
('18','Pitch'):E('forceOpponentSwitch',chooseBy='defender'),
}
B={
 '2':activated(E('chooseTarget',target='selfPokemon',forceChoose=True,effect=E('heal',target='selfPokemon',amount=30))),
 '11':{'type':'triggered','event':'benched','fromHandOnly':True,'effect':E('sm7Rule',rule='det1Pantomime')},
 '6':passive(E('modifier',stat='damageReduction',scope='team',amount=30,duration='whileInPlay'),activeOnly=True),
 # Greninja remains gated until exact Active and Bench damage-instance prevention is covered.
}
def attack(row,a):
 if row[0]=='17':return None
 return deepcopy(A.get((row[0],a[0]))) or V.attack(row,a)
def ability(row,a):return deepcopy(B.get(row[0]))
def trainer(row):return None
def energy(row):return None
def prism_ready(row):return False
