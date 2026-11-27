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

# Stage 2: reuse reviewed descriptors; unimplemented setup/variable-payment effects stay gated.
_stage1_attack=attack
_stage1_ability=ability
from swsh11_verified import evolved,optional
from swsh9_verified import coin

def ability(row,a):
 n=int(row[0])
 if n==21:return passive(E('modifier',stat='retreatCost',amount=-999,scope='self',duration='whileInPlay',condition=cond('selfEnergyAtLeast',energyType='Fire',amount=1,countSpecial=True)))
 if n==45:return activated(seq(E('draw',amount=3),E('endTurn')))
 if n==48:return evolved(optional('Flip for Paralysis',coin(status('paralysis'))))
 return _stage1_ability(row,a)

def attack(row,a):
 n=int(row[0]);title,cost,damage,t=a
 if not t and damage.isdigit():return E('noop')
 if n==22 and title=='Bursting Power':return E('sm7Rule',rule='sm12HandAttach',left=2,basicOnly=True,optional=True)
 if n==22 and title=='Flare Juggling':return E('energyDamage',source='opponent',amount=30,mode='add')
 if n==25:return E('lock',target='self',action='attack',duration='nextOwnTurn')
 if n==26:return bonus(80,cond('selfEnergyAtLeast',energyType='Water',amount=1,countSpecial=True))
 if n==27:return E('benchFromDeck',amount=1,filter={'kind':'pokemon','stage':'Basic'},choose=True)
 if n==28:return status('confusion' if title=='Tail Trickery' else 'burn')
 if n==30:return E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Item'})
 if n in (31,32):return E('heal',target='self',amount=30)
 if n==35:return E('handShuffle',side='self',draw=5)
 if (n,title) in [(36,'Wave Summoning'),(38,'Frost Charge')]:return E('sm7Rule',rule='sm9SearchAttach',amount=1,energyTypes=['Water'],sourceSelf=True)
 if n==37 and title=='Dual Splash':return E('multiTargetDamage',target='opponentPokemon',amount=50,count=2)
 if n==37 and title=='Aqua Typhoon':return E('lock',target='self',action='attack',attackName=title,duration='nextOwnTurn')
 if n==40:return E('selfDamage',amount=10)
 if n==41:return E('selectedDamage',target='opponentPokemon',amount=30)
 if n==43 and title=='Electrostep':return seq(E('selectedDamage',target='opponentPokemon',amount=40),E('sm7Rule',rule='swsh5ElectroSwitch'))
 if n==43 and title=='Scar Strikes':return bonus(100,cond('opponentDamaged'))
 if n==44:return E('searchChosen',amount=2,filter={'kind':'trainer'},optional=True)
 if n in (45,46):return E('sm7Rule',rule='swsh11ScrapShort')
 if n==47:return coin(status('paralysis'))
 if n==50:return E('selfDamage',amount=50)
 return _stage1_attack(row,a)

# Stage 3: existing damage, physical deck search, hand cost and status handlers.
_stage2_attack=attack

def attack(row,a):
 n=int(row[0]);title,cost,damage,t=a
 if n<51:return _stage2_attack(row,a)
 if not t and damage.isdigit():return E('noop')
 if n==51:return E('multiTargetDamage',target='opponentPokemon',amount=30,count=1)
 if n==52:return E('selfDamage',amount=20)
 if n==53:return E('lock',target='self',action='attack',duration='nextOwnTurn')
 if n==54 and title=='Max Fist':return E('discardEnergyCard',target='self',amount=2)
 if n==55 and title=='Crushing Beat':return E('chooseOption',condition=cond('stadiumInPlay'),options=[{'label':'Discard Stadium','effect':E('discardStadium')},{'label':'Keep Stadium','effect':E('noop')}])
 if n==56 and title=='Call for Family':return E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Basic'},choose=True,optional=True)
 if n==56:return E('coinDamage',coins='untilTails',amount=30,mode='add')
 if n==57:return coin(status('paralysis'))
 if n==58:return E('energyDamage',source='self',all=True,amount=20,mode='replace')
 if n==59 and title=='Limit Break':return bonus(90,cond('opponentPrizesAtMost',amount=3))
 if n==60 and title=='Energy Mix':return E('sm7Rule',rule='sm9SearchAttach',amount=1,includeSpecial=True,targetFilter={'tag':'fusion-strike'})
 if n==60:return E('chooseOption',options=[{'label':'Shuffle this Pokémon into deck','effect':E('shuffleIntoDeck',target='self',includeAttached=True)},{'label':'Keep in play','effect':E('noop')}])
 if n==61 and title=='Double Draw':return E('draw',amount=2)
 if n in (61,63,66):return status('confusion')
 if n==62 and title=='Cycle Draw':return E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('draw',amount=3))
 if n==62:return E('energyDamage',source='self',energyType='Psychic',countProvidedType=True,amount=30,mode='add')
 if n==64 and title=='Energy Burst':return E('energyDamage',source='both',amount=20,mode='replace')
 if n==64:return E('heal',target='self',amount=30)
 if n==65 and title=='Teleportation Burst':return E('switch',target='self')
 if n==67 and title=='Draining Kiss':return E('heal',target='self',amount=20)
 if n==67:return bonus(70,cond('handSizesEqual'))
 if n==73:return coin(E('forceOpponentSwitch',chooseBy='attacker'))
 if n==75:return status('poison')
 if n in (77,78):return E('coinDamage',coins=3,amount=10 if n==77 else 40,mode='replace')
 if n==79:return E('discardTop',side='opponent',amount=3)
 if n==80:return E('selfDamage',amount=30)
 return None

# Stage 4: dynamic Prize reduction, named discard attachment and the Metal/Dragon batch.
_stage3_attack=attack
_stage3_ability=ability

def ability(row,a):
 n=int(row[0])
 if n==20:return passive(E('modifier',stat='attackCost',amount=-1,scope='self',duration='whileInPlay',perOpponentPrizeTaken=True))
 if n==69:return activated(E('attachEnergyFromDiscard',target='selfPokemon',energyType='Psychic',amount=1,filter={'name':'Lunatone'}))
 if n==97:return passive(E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay',condition=cond('selfEnergyAtLeast',amount=1,countSpecial=True)))
 if n==98:return activated(seq(E('discardHand',side='self',amount=999),E('draw',amount=5),E('endTurn')))
 if n==99:return activated(E('modifier',stat='damageReduction',amount=100,scope='team',duration='opponentTurn'),vstarPower=True)
 if n in (101,102):return activated(seq(E('discardHand',side='self',amount=999),E('draw',amount=3)))
 if n==104:return passive(E('preventDamage',target='self',duration='whileInPlay',attackerFilter={'hasSpecialEnergy':True}))
 return _stage3_ability(row,a)

def attack(row,a):
 n=int(row[0]);title,cost,damage,t=a
 if n==54 and title=='Reactive Pulse':return E('fieldCountDamage',side='opponent',filter={'hasAbility':True},amount=60,mode='replace')
 if n<81:return _stage3_attack(row,a)
 if not t and damage.isdigit():return E('noop')
 if n==83:return seq(E('attackRequirement',allowWhenFailed=True,condition=cond('movedFromBenchThisTurn')),E('damageRule',ignoreWeakness=True))
 if n in (84,85,90):return E('coinDamage',coins=2 if n==90 else 1,amount={84:20,85:60,90:30}[n],mode='add')
 if n==86 and title=='X-Scissor':return E('coinDamage',coins=1,amount=30,mode='add')
 if n==86:return bonus(80,cond('opponentMatches',filter={'stage':'Basic'}))
 if n in (87,91):return E('selfDamage',amount=10)
 if n==88:return E('coinUntilTails',effect=E('discardTop',side='opponent',amount=1))
 if n==93:return E('draw',amount=2)
 if n==94:return seq(E('benchCountDamage',side='self',amount=10,mode='add'),E('damageRule',ignoreWeakness=True,ignoreEffects=True))
 if n in (95,96) and title in ('Piercing Strike','Break Edge'):return E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True)
 if n==95:return bonus(160,cond('opponentMatches',filter={'tag':'pokemon-vmax'}))
 if n==96:return E('selfDamage',amount=30)
 if n==97:return bonus(120,cond('koLastOpponentTurn'))
 if n==98:return E('pointDamage',side='opponent',prizesTaken=True,amount=30,mode='add')
 if n==99:return E('lock',target='self',action='attack',duration='nextOwnTurn')
 if n==100 and title=='Dragon Pulse':return E('discardTop',side='self',amount=2)
 if n==100:return E('sm7Rule',rule='swsh7SpiralBurst')
 if n in (101,102):return E('sm7Rule',rule='swsh7MaxBurst')
 if n==103:return E('modifier',stat='attackDamage',scope='opponentActive',amount=-30,duration='opponentTurn')
 if n==104:return E('damageRule',ignoreEffects=True)
 if n==108:return bonus(80,cond('opponentMatches',filter={'tag':'pokemon-v'}))
 if n==110:return E('coinDamage',coins=1,amount=30,mode='replace')
 return None

# Stage 5: complete main-set inventory; reuse validated battle handlers.
_stage4_attack=attack
_stage4_ability=ability

def ability(row,a):
 n=int(row[0])
 if n==46:return activated(E('xy10VeilOfDarkness'),vstarPower=True)
 if n==111:return passive(E('preventDamage',target='self',duration='whileInPlay'),benchOnly=True)
 return _stage4_ability(row,a)

def attack(row,a):
 n=int(row[0]);title,cost,damage,t=a
 if n==59 and title=='Psypump':return E('sm7Rule',rule='sm12DiscardAttach',left=2,energyType='Psychic',sameTarget=True,optional=True)
 if n==74:return seq(*(bonus(-80,cond('opponentEnergyAtLeast',amount=i,countSpecial=True)) for i in (1,2,3)))
 if n==106 and title=='Adrena-Tackle':return E('attackRequirement',allowWhenFailed=True,condition=cond('selfDamaged'))
 if n==76 and title=='Lost Claw':return E('neoRule',rule='col1:39:lostClaw')
 if n<111:return _stage4_attack(row,a)
 if not t and damage.isdigit():return E('noop')
 if n==111:return E('coinDamage',coins=1,amount=30,mode='replace')
 if n==112:return E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('draw',amount=2))
 if n==113:return seq(E('damageFromDamage',source='self',amount=1,mode='add'),E('status',target='self',status='confusion'))
 if n==114:return E('lock',target='self',action='attack',duration='nextOwnTurn')
 if n==116 and title=='Double Dip Fangs':return E('sm7Rule',rule='swsh5DoubleDip')
 if n==116:return E('selfDamage',amount=30)
 if n==120 and title=='Body Slam':return coin(status('paralysis'))
 if n==120:return E('draw',amount=3)
 if n==121:return E('coinDamage',coins='untilTails',amount=30,mode='replace')
 if n==122 and title=='Overhead Throw':return E('selectedSelfBenchDamage',amount=10)
 if n==122:return E('coinDamage',coins='untilTails',amount=30,mode='add')
 if n==160:return E('selfDamage',amount=30)
 return None

# Stage 6: shared targeted effects, selection and discard accounting.
_stage5_attack=attack
_stage5_ability=ability
_stage5_trainer=trainer

def attack(row,a):
 n=int(row[0]);title,cost,damage,t=a
 if n==23 and title=='Fireball Fever':return E('sm7Rule',rule='czFireballFever')
 if n==23 and title=='Ember Star':return E('sm7Rule',rule='czEmberStar')
 if n==36 and title=='Dynamic Wave':return seq(E('sm7Rule',rule='swsh1ReturnAttachments',target='self',left=3),E('multiTargetDamage',target='opponentPokemon',count=1,amount=180,activeWeaknessResistance=True))
 if n==42 and title=='Shorting Spark':return E('sm7Rule',rule='czShortingSpark')
 if n==55 and title=='Lightning Storm Star':return E('sm7Rule',rule='czLightningStorm')
 if n==82 and title=='Rocket Poison':return E('sm7Rule',rule='czRocketPoison')
 if n==115 and title=='Gather Flowers':return E('sm7Rule',rule='sm9Recycle',amount=2,filter={'kind':'energy'},includeBasicLedger=True,optional=True)
 if n==118 and title=='Stakeout Headbutt':return bonus(120,cond('czOpponentMovedLastTurn'))
 return _stage5_attack(row,a)

def ability(row,a):
 n=int(row[0])
 if n==66:return activated(E('sm7Rule',rule='czWitchDomain'))
 if n==114:return activated(E('sm7Rule',rule='czStarGuardian',condition=cond('opponentPrizesRemaining',amount=1)),vstarPower=True)
 return _stage5_ability(row,a)

def trainer(row):
 if int(row[0])==126:return 'Supporter',E('sm7Rule',rule='czDiggingDuo')
 return _stage5_trainer(row)
