"""Champion’s Path exact printed-rule mappings; fail closed on unsupported effects."""
from copy import deepcopy
from pathlib import Path
import json,re
import swsh3_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
ROWS=json.loads((Path(__file__).resolve().parents[1]/'data/classic/swsh35-print-compact.json').read_text())
A={};B={};T={};X={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
def attack(row,a):return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(['_swsh35_',*row[1:]],a)
def ability(row,a):return deepcopy(B.get(tuple(a))) or V.ability(['_swsh35_',*row[1:]],a)
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return deepcopy(X.get((row[1],tuple(row[13])))) or V.energy(row)
def prism_ready(row):return False


# Match complete printed signatures, not attack names alone.
from swsh3_verified import Q,mod,trig,N
at(5,'Float Up',deepcopy(next(v for k,v in V.V.A.items() if k[0]=='Float Up')))
at(8,'Grand Flame',Q('DiscardAttach',left=2,benchOnly=True,sameTarget=True,energyType='Fire',optional=True))
at(13,'Draw Up',Q('DiscardAttach',left=3,sourceSelf=True,energyType='Water',optional=True))
at(16,'Swelling Pulse',bonus(80,cond('xy8HealedThisTurn')))
ab(20,trig('damagedByAttack',status('confusion'),activeOnly=True,opponentAttackOnly=True))
at(21,'Hollow Missile',E('sm7Rule',rule='sm10CounterSpread',amount=3,benchOnly=True))
ab(21,trig('opponentEnergyAttached',N('BitingWhirlpool',amount=30),activeOnly=True,fromHandOnly=True))
at(22,'Sugary Sprinkles',E('heal',target='selfBenchAll',amount=30))
for n,t in [(22,'Sweet Splash'),(32,'Tie Up')]:at(n,t,E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'stage':'Basic'})))
at(26,'Macho Revenge',E('discardCountDamage',side='self',filter={'kind':'pokemon','subtype':'Fighting'},amount=20,mode='replace'))
at(28,'Power Blast',E('discardEnergyCard',target='self',amount=1,energyType='Fighting',strictEnergyType=True))
at(42,'Bad Brawl',bonus(90,cond('sm10Supporter',name='Piers')))
at(44,'Attack from Behind',bonus(50,cond('opponentStatus',status='confusion')))
ab(47,passive(mod('damageReduction',30)))
ab(49,passive(N('DeepForestCamo')))
tr(51,'Item',E('removeStatus',target='selfActive'))

# v485 completion: exact printed signatures.
def CP(rule):return E('sm7Rule',rule='swsh35'+rule)
at(23,'Adornment',CP('Adornment'))
at(23,'G-Max Whisk',CP('Whisk'))
ab(37,activated(CP('WickedRuler')))
tr(64,'Item',CP('RotomPhone'))
tr(66,'Item',CP('FoodTin'))
