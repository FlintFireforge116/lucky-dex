"""Crown Zenith stage one: explicitly reviewed existing handlers, gated otherwise."""
from swsh9_verified import E,seq,cond,bonus,activated
from swsh8_verified import status
from sm7_verified import passive
from swsh12_verified import prism_ready

TRAINERS = {123: ('Supporter',
       {'benchOnly': True,
        'count': 5,
        'discardRest': True,
        'includeSpecial': True,
        'rule': 'sm9TopAttach',
        'targetFilter': {'subtype': 'Fighting'},
        'type': 'sm7Rule'}),
 124: ('Supporter', {'basicOnly': True, 'benchOnly': True, 'left': 1, 'rule': 'sm12HandAttach', 'type': 'sm7Rule'}),
 125: ('Item',
       {'heads': {'chooser': 'owner',
                  'effect': {'amount': 1, 'target': 'opponentPokemon', 'type': 'discardEnergyCard'},
                  'filter': {'hasAnyEnergy': True},
                  'target': 'opponentPokemon',
                  'type': 'chooseTarget'},
        'tails': {'type': 'noop'},
        'type': 'coinFlip'}),
 127: ('Item',
       {'amount': 2, 'filter': {'basicEnergy': True, 'kind': 'energy'}, 'source': 'discard', 'type': 'searchChosen'}),
 128: ('Item', {'amount': 1, 'filter': {'basicEnergy': True, 'kind': 'energy'}, 'type': 'searchChosen'}),
 129: ('Item', {'rule': 'energySwitch', 'type': 'sm1Rule'}),
 130: ('Supporter', {'amount': 3, 'type': 'draw'}),
 131: ('Supporter', {'amount': 3, 'type': 'draw'}),
 132: ('Item', {'count': 7, 'filter': {'kind': 'pokemon'}, 'optional': True, 'type': 'selectTopToHand'}),
 133: ('Supporter', {'amount': 3, 'type': 'draw'}),
 134: ('Supporter',
       {'amount': 30, 'duration': 'turn', 'scope': 'team', 'stat': 'attackDamageActiveOnly', 'type': 'modifier'}),
 135: ('Item', {'rule': 'swsh11LostVacuum', 'type': 'sm7Rule'}),
 136: ('Supporter', {'left': 4, 'rule': 'swsh4Nessa', 'type': 'sm7Rule'}),
 137: ('Item',
       {'heads': {'amount': 1, 'filter': {'kind': 'pokemon'}, 'type': 'searchChosen'},
        'tails': {'type': 'noop'},
        'type': 'coinFlip'}),
 138: ('Item',
       {'heads': {'chooseBy': 'attacker', 'type': 'forceOpponentSwitch'},
        'tails': {'type': 'noop'},
        'type': 'coinFlip'}),
 139: ('Item',
       {'effect': {'amount': 30, 'target': 'selfPokemon', 'type': 'heal'},
        'target': 'selfPokemon',
        'type': 'chooseTarget'}),
 140: ('Supporter', {'rule': 'swsh7Raihan', 'type': 'sm7Rule'}),
 141: ('Item', {'type': 'rareCandy'}),
 142: ('Item',
       {'amount': 2,
        'filter': {'hpAtMost': 90, 'kind': 'pokemon'},
        'optional': True,
        'source': 'discard',
        'type': 'searchChosen'}),
 144: ('Item', {'target': 'self', 'type': 'switch'}),
 145: ('Item', {'rule': 'swsh10TrekkingShoes', 'type': 'sm7Rule'}),
 146: ('Item',
       {'after': {'amount': 1, 'filter': {'kind': 'pokemon'}, 'type': 'searchChosen'},
        'amount': 2,
        'filter': {},
        'rule': 'sm10Pay',
        'trainer': True,
        'type': 'sm7Rule'}),
 147: ('Supporter', {'rule': 'swsh8Elesa', 'type': 'sm7Rule'}),
 148: ('Supporter', {'amount': 3, 'type': 'draw'}),
 149: ('Supporter', {'amount': 3, 'type': 'draw'}),
 150: ('Supporter',
       {'effects': [{'amount': 999, 'side': 'self', 'type': 'discardHand'}, {'amount': 7, 'type': 'draw'}],
        'type': 'sequence'}),
 151: ('Supporter',
       {'condition': {'filter': {'tag': 'pokemon-v'}, 'type': 'pokemonPresent', 'zone': 'bench'},
        'filter': {'tag': 'pokemon-v'},
        'type': 'discardBenchPokemon'})}

def trainer(row): return TRAINERS.get(int(row[0]))
def energy(row): return None
def ability(row,a):
 if int(row[0])==14 and a[0]=='Ivy Star':return activated(E('forceOpponentSwitch',chooseBy='attacker'),vstarPower=True)
 return None

def attack(row,a):
 n=int(row[0]);title,cost,damage,t=a
 if not t and damage.isdigit():return E('noop')
 if n==1:return E('coinDamage',coins=2,amount=10,mode='replace')
 if n==2:return seq(status('confusion'),status('poison'))
 if n==3:return seq(E('coinDamage',coins=3,amount=80,mode='replace'),E('switch',target='self'))
 if n==5:return E('heal',target='self',amount=30)
 if n==6:return E('discardEnergyCard',target='opponentActive',amount=1,specialOnly=True)
 if n==8:return seq(E('bonusDamage',amount=10),E('benchDamage',amount=10,side='opponent',all=True))
 if n==9 and title=='Shoot Through':return E('multiTargetDamage',target='opponentBench',amount=20,count=1)
 if n==9 and title=='Jet Wing':return E('lock',target='self',action='attack',duration='nextOwnTurn')
 if n==10:return E('coinDamage',coins=1,amount=20,mode='add')
 if n==12 and title=='Festering Saliva':return seq(status('burn'),status('poison'))
 if n==12 and title=='Bind Down':return E('lock',target='opponentActive',action='retreat',duration='opponentTurn')
 if n in (13,14) and title=='Leaf Guard':return E('modifier',stat='damageReduction',scope='self',amount=30,duration='opponentTurn')
 if n==13 and title=='Slashing Strike':return E('lock',target='self',action='attack',attackName=title,duration='nextOwnTurn')
 if n==15 and title=='Energize':return E('attachEnergyFromDiscard',target='self',energyType='Lightning',amount=1)
 if n==15 and title=='Surprise Attack':return E('coinDamage',coins=1,amount=50,mode='replace')
 if n==16 and title=='Drag Off':return E('sm7Rule',rule='sm9DragOff',amount=20)
 if n==16 and title=='Triple Whip':return E('coinDamage',coins=3,amount=70,mode='replace')
 if n==17 and title=="King's Instructions":return E('searchChosen',amount=2,filter={},optional=True)
 if n==17 and title=='Bloomshine':return E('heal',target='selfAll',amount=20)
 if n==18 and title=='Incinerate':return E('discardTool',target='opponentActive',amount='all',timing='beforeDamage')
 if n==19 and title=='Explosive Fire':return bonus(100,cond('selfDamaged'))
 if n==19 and title=='Star Blaze':return E('discardEnergyCard',target='self',amount=2)
 if n==20 and title=='Combustion Blast':return E('lock',target='self',action='attack',attackName=title,duration='nextOwnTurn')
 return None
