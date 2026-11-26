"""Celebrations main set: reviewed full-text mappings; unresolved effects fail closed."""
from copy import deepcopy
from pathlib import Path
import json
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
from swsh3_verified import Q,R
from swsh5_verified import BS
from swsh2_verified import discard
ROWS=json.loads((Path(__file__).resolve().parents[1]/'data/classic/cel25-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=ROWS[no-1];a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):B[tuple(ROWS[no-1][8][0])]=effect
def tr(no,kind,effect):r=ROWS[no-1];T[(r[1],tuple(r[13]))]=(kind,effect)
def attack(row,a):
 if (a[0],tuple(a[1]),a[2],a[3]) in A:return deepcopy(A[(a[0],tuple(a[1]),a[2],a[3])])
 if not a[3]:return E('noop')
 return None
def ability(row,a):return deepcopy(B.get(tuple(a)))
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13]))))
def energy(row):return None
def prism_ready(row):return False
at(1,'Sacred Fire',E('selectedDamage',target='opponentPokemon',amount=50))
at(1,'Fire Blast',discard(1))
at(2,'Scorching Wind',E('benchDamage',side='opponent',all=True,amount=20))
at(2,'Black Flame',bonus(80,cond('pokemonPresent',zone='bench',filter={'name':'Zekrom'})))
at(4,'Overdrive Smash',E('nextAttackBonus',attackName='Overdrive Smash',amount=80))
ab(4,passive(E('actionLock',side='opponent',cardType='Stadium',duration='whileActive'),activeOnly=True))
at(5,'Thunder Jolt',coin(E('noop'),E('selfDamage',amount=10)))
at(6,'Thunder Shock',coin(status('paralysis')))
at(6,'Fly',E('coinAttackGate',heads=E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)))
at(7,'Max Balloon',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'Basic'}))
at(9,'Max Surfer',E('benchDamage',side='opponent',all=True,amount=30))
at(10,'Field Crush',BS('FieldCrush'))
at(10,'White Thunder',bonus(80,cond('pokemonPresent',zone='bench',filter={'name':'Reshiram'})))
at(13,'Star Protection',coin(E('preventDamage',target='self',duration='opponentTurn')))
at(15,'Psychic Shot',E('selectedDamage',target='opponentBench',amount=30))
at(16,'Storm Slash',E('energyDamage',source='self',energyType='Psychic',countProvidedType=True,amount=30,mode='add'))
ab(16,activated(seq(R('SearchAttach',amount=1,energyTypes=['Psychic']),E('endTurn'))))
at(17,'Magma Volcano',seq(E('topDeckCountDamage',count=5,amount=80,filter={'kind':'energy'},mode='replace'),E('discardTop',side='self',amount=5)))
ab(18,passive(E('modifier',stat='damageReduction',scope='team',filter={'subtype':'Fighting'},opponentFilter={'stage':'VMAX'},amount=20,duration='whileInPlay',nonStacking=True)))
at(20,'Temporal Backflow',E('searchChosen',source='discard',amount=1,filter={}))
at(20,'Metal Blast',E('energyDamage',source='self',energyType='Metal',countProvidedType=True,amount=20,mode='add'))
at(22,'Aero Ball',E('energyDamage',source='both',amount=20,mode='replace',countProvidedType=True))
at(22,'Deep Crush',E('lock',target='self',action='attack',duration='nextOwnTurn'))
tr(23,'Supporter',seq(E('discardHand',side='self',amount=999),E('draw',amount=7)))
ab(11,activated(E('selectTopToHand',count=6,filter={'kind':'trainer','trainerType':'Item'},optional=True),activeOnly=True))
at(21,'Solar Geyser',Q('DiscardAttach',left=2,benchOnly=True,basicOnly=True,sameTarget=True,optional=True))
ab(21,activated(E('neoRule',rule='bw7:rushIn'),benchOnly=True))

at(3,'Aqua Storm',E('sm7Rule',rule='cel25AquaStorm'))
at(12,'Breath of Life',R('SearchAttach',amount=3,distinctTypes=True))
at(15,'Lunar Pain',E('sm7Rule',rule='cel25LunarPain'))
at(19,'Cry of Destruction',E('sm7Rule',rule='cel25CryOfDestruction'))
