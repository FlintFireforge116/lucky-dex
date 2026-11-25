"""Sword & Shield exact printed-rule mappings, gated where unsupported."""
from copy import deepcopy
from pathlib import Path
import json,re
import sm12_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
ROWS=json.loads((Path(__file__).resolve().parents[1]/'data/classic/swsh1-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
def attack(row,a):
 t=a[3]; exact=A.get((a[0],tuple(a[1]),a[2],t))
 if exact is not None:return deepcopy(exact)
 for pattern,fn in PATTERNS:
  m=re.fullmatch(pattern,t)
  if m:return fn(m,a)
 return V.attack(['_swsh1_',*row[1:]],a)
def ability(row,a):return deepcopy(B.get(tuple(a))) or V.ability(['_swsh1_',*row[1:]],a)
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13]))))
def energy(row):return None
def prism_ready(row):return False
def discard(n=1,target='self',**kw):return E('discardEnergyCard',target=target,amount=n,**kw)
def lock(title=None):return E('lock',target='self',action='attack',duration='nextOwnTurn',**({'attackName':title} if title else {}))
def search(n,**f):return E('searchChosen',amount=n,filter=f)
def bench(n):return E('benchDamage',side='opponent',all=True,amount=n)
def mod(stat,n,scope='self',duration='whileInPlay',**kw):return E('modifier',stat=stat,scope=scope,amount=n,duration=duration,**kw)
PATTERNS=[
 (r'This attack does (\d+) more damage for each of your Benched Pokémon\.',lambda m,a:E('benchCountDamage',side='self',amount=int(m[1]),mode='add')),
 (r'This attack does (\d+) more damage for each (Water|Psychic|Fire|Metal|Lightning|Grass|Fighting|Darkness) Energy attached to this Pokémon\.',lambda m,a:E('energyDamage',source='self',energyType=m[2],countProvidedType=True,amount=int(m[1]),mode='add')),
 (r"This attack does (\d+) more damage for each Energy attached to your opponent's Active Pokémon\.",lambda m,a:E('energyDamage',source='opponent',amount=int(m[1]),mode='add')),
 (r"During your next turn, this Pokémon can't use (.+)\.",lambda m,a:lock(m[1])),
 (r"During your next turn, this Pokémon can't attack\.",lambda m,a:lock()),
 (r"During your opponent's next turn, the Defending Pokémon can't retreat\.",lambda m,a:E('lock',target='opponentActive',action='retreat',duration='opponentTurn')),
 (r"This attack also does (\d+) damage to each of your opponent's Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)",lambda m,a:bench(int(m[1]))),
 (r"This attack also does (\d+) damage to (\d+) of your opponent's Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)",lambda m,a:E('multiTargetDamage',target='opponentBench',amount=int(m[1]),count=int(m[2]))),
 (r"This Pokémon also does (\d+) damage to itself\.",lambda m,a:E('selfDamage',amount=int(m[1]))),
 (r"This Pokémon is now Asleep\.",lambda m,a:E('status',target='self',status='sleep')),
 (r"Discard all Energy from this Pokémon\.",lambda m,a:discard('all')),
 (r"Discard (\d+) Energy from your opponent's Active Pokémon\.",lambda m,a:discard(int(m[1]),'opponentActive')),
 (r"Discard an Energy from your opponent's Active Pokémon\.",lambda m,a:discard(1,'opponentActive')),
 (r"Discard a Special Energy from your opponent's Active Pokémon\.",lambda m,a:discard(1,'opponentActive',specialOnly=True)),
 (r"Discard the top (\d+) cards of your opponent's deck\.",lambda m,a:E('discardTop',side='opponent',amount=int(m[1]))),
 (r"Discard the top card of your opponent's deck\.",lambda m,a:E('discardTop',side='opponent',amount=1)),
 (r"Discard the top (\d+) cards of your deck\.",lambda m,a:E('discardTop',side='self',amount=int(m[1]))),
 (r"If your opponent's Active Pokémon already has any damage counters on it, this attack does (\d+) more damage\.",lambda m,a:bonus(int(m[1]),cond('opponentDamaged'))),
 (r"If your opponent's Active Pokémon is Poisoned, this attack does (\d+) more damage\.",lambda m,a:bonus(int(m[1]),cond('opponentStatus',status='poison'))),
 (r"If your opponent's Active Pokémon is Asleep, this attack does (\d+) more damage\.",lambda m,a:bonus(int(m[1]),cond('opponentStatus',status='sleep'))),
 (r"Flip a coin until you get tails\. This attack does (\d+) damage for each heads\.",lambda m,a:E('coinDamage',coins='untilTails',amount=int(m[1]),mode='replace')),
 (r"Flip a coin until you get tails\. This attack does (\d+) more damage for each heads\.",lambda m,a:E('coinDamage',coins='untilTails',amount=int(m[1]),mode='add')),
 (r"During your opponent's next turn, this Pokémon takes (\d+) less damage from attacks \(after applying Weakness and Resistance\)\.",lambda m,a:mod('damageReduction',int(m[1]),duration='opponentTurn')),
 (r"Attach a (Fire|Water|Grass|Metal|Lightning|Psychic|Fighting|Darkness) Energy card from your discard pile to this Pokémon\.",lambda m,a:E('attachEnergyFromDiscard',target='self',energyType=m[1],amount=1)),
 (r"Draw (\d+) cards\.",lambda m,a:E('draw',amount=int(m[1]))),
 (r"Each player draws (\d+) cards\.",lambda m,a:seq(E('draw',amount=int(m[1])),E('draw',side='opponent',amount=int(m[1])))),
]
at(4,'Paralyze Poison',seq(status('poison'),coin(status('paralysis'))))
at(8,'Bite Together',bonus(60,cond('pokemonPresent',side='self',zone='bench',filter={'name':'Durant'})))
at(36,'Bright Flame',E('coinFlip',tails=discard(2)))
at(79,'Electro Wheel',seq(discard(1),E('switch',target='self',optional=False)))
at(94,'Coordinated Strike',bonus(80,cond('pokemonPresent',side='self',zone='bench',filter={'name':'Hitmonchan'})))
at(95,'Coordinated Beatdown',bonus(20,cond('pokemonPresent',side='self',zone='bench',filter={'name':'Hitmonlee'})))
at(120,'Lode Search',E('searchChosen',source='discard',amount=1,filter={'kind':'trainer'}))
at(120,'Crazy Claws',E('damageFromDamage',source='opponent',amount=6,mode='add'))
at(134,'Charge Order',E('fieldCountDamage',side='self',benchOnly=True,amount=30,mode='add',filter={'name':'Pawniard'}))
at(155,'Spit Shot',seq(discard('all'),E('selectedDamage',target='opponentPokemon',amount=160)))
ab(91,activated(E('heal',target='selfActive',amount=20)))
ab(110,passive(mod('damageReduction',30)))
ab(128,passive(mod('attackDamage',20,scope='team',filter={'subtype':'Metal'})))
# Verified standard Trainer descriptors; do not inherit historical collector-ID handlers.
tr(156,'Tool',mod('retreatCost',-2))
tr(158,'Tool',mod('maxHp',30))
tr(159,'Item',coin(E('chooseTarget',target='opponentPokemon',chooser='owner',filter={'hasAnyEnergy':True},effect=E('discardEnergyCard',target='opponentPokemon',amount=1))))
tr(160,'Item',E('searchChosen',source='discard',amount=2,filter={'kind':'energy','basicEnergy':True}))
tr(161,'Item',search(1,kind='energy',basicEnergy=True))
tr(163,'Item',search(1,kind='pokemon',evolved=True))
tr(165,'Supporter',E('draw',amount=3))
tr(173,'Supporter',search(1,kind='pokemon'))
tr(175,'Item',coin(E('forceOpponentSwitch',chooseBy='attacker')))
tr(177,'Item',E('chooseTarget',target='selfPokemon',effect=E('heal',target='selfPokemon',amount=30)))
tr(183,'Item',E('switch',target='self'))
tr(185,'Tool',mod('attackDamage',10))

ab(139,passive(E('preventDamage',target='self',duration='whileInPlay',attackerFilter={'stage':'VMAX'})))

# v468: reuse audited effects by complete print signature, not attack name.
def R(rule,**kw):return E('sm7Rule',rule='sm9'+rule,**kw)
def Q(rule,**kw):return E('sm7Rule',rule='sm12'+rule,**kw)
def S(rule,**kw):return E('sm7Rule',rule='sm10'+rule,**kw)
def W(rule,**kw):return E('sm7Rule',rule='swsh1'+rule,**kw)
def trig(event,fx,**kw):return dict(type='triggered',event=event,effect=fx,**kw)
at(7,'Powerful Needles',E('coinDamageByEnergy',countProvidedEnergy=True,amount=60,mode='replace'))
at(24,'Combustion Pillar',E('topDeckDiscardBonus',amount=90,filter={'kind':'energy','subtype':'Fire'}))
at(25,'Energy Burst',E('energyDamage',source='both',amount=30,mode='replace',countProvidedType=True))
at(25,'Spreading Flames',Q('DiscardAttach',left=3,energyType='Fire',optional=True))
at(21,'Blessing of Fluff',R('SearchAttach',amount=3,energyTypes=['Grass'],benchOnly=True))
at(43,'Super Slice',E('allHeadsBonus',coins=2,amount=120,mode='replace'))
at(59,'Silent Shot',E('discardHand',side='opponent',amount=1,random=True))
at(61,'Vise Bite',E('retreatCostDamage',amount=30,mode='add'))
at(75,'Fighting Fangs',bonus(90,cond('opponentMatches',filter={'tag':['pokemon-v','pokemon-gx']})))
at(77,'Shocking Needles',E('coinDamageStatus',coins=4,amount=30,minHeads=2,status='paralysis'))
at(83,'Fade Out',E('returnToHand',target='self',returnBasicEnergy=True))
at(90,'Poltergeist',seq(E('filteredHandCountDamage',side='opponent',filter={'kind':'trainer'},amount=50,mode='replace'),E('revealHand',side='opponent')))
at(107,'Sand Attack',E('attackCoinGate',target='opponentActive',duration='opponentTurn'))
at(109,'Coil',mod('attackDamage',120,duration='nextOwnTurn'))
at(110,'Power Press',bonus(70,cond('sm9ExtraEnergy',cost=''.join(next(a[1] for r in ROWS if r[0]=='110' for a in r[7] if a[0]=='Power Press'))+'F')))
at(125,'Instigate',W('BottomHands',enemyOnly=True))
at(127,'Hone Claws',E('nextAttackBonus',attackName='Slash',amount=60))
at(147,'Energy Assist',Q('DiscardAttach',left=1,benchOnly=True))
ab(14,activated(R('SearchAttach',amount=2,energyTypes=['Grass'],sameTarget=True)))
ab(56,trig('evolved',E('searchChosen',amount=1,filter={'kind':'trainer'},optional=True),fromHandOnly=True))
ab(58,trig('evolved',E('searchChosen',amount=2,filter={'kind':'trainer'},optional=True),fromHandOnly=True))
ab(82,passive(E('preventStatus',scope='team',duration='whileInPlay',clearExisting=True)))
ab(147,activated(S('Pay',amount=1,filter={},after=E('draw',amount=2))))
at(119,'Obstruct',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'Basic'}))
tr(162,'Item',E('sm1Rule',rule='energySwitch'))
tr(164,'Item',E('selectTopToHand',count=7,filter={'kind':'pokemon'},optional=True))
tr(169,'Supporter',W('BottomHands'))
tr(170,'Item',Q('DiscardAttach',left=1,energyType='Metal',benchOnly=True,targetType='Metal'))
tr(174,'Item',E('selectTopToHand',count=7,filter={'trainerType':'Supporter'},optional=True))
tr(178,'Supporter',seq(E('discardHand',side='self',amount=999),E('draw',amount=7)))
tr(179,'Item',S('Pay',amount=1,filter={},after=search(1,kind='pokemon',stage='Basic'),trainer=True))
tr(181,'Item',seq(E('drawToHandSize',size=6),E('endTurn')))

# v469: physical attachment returns and selected top-deck acceleration.
at(48,'Aqua Wash',W('ReturnAttachments',target='opponentActive',left=2,optional=True))
at(59,'Hydro Snipe',W('ReturnAttachments',target='opponentActive',left=1,optional=True))
at(49,'Body Surf',Q('HandAttach',left=1,energyType='Water',sourceSelf=True,switchAfter=True))
at(49,'Ocean Loop',W('ReturnAttachments',target='self',left=2,energyType='Water'))
at(116,'Stone Gift',Q('HandAttach',left=1,energyType='Fighting',heal=120))
at(69,'Strobe Shock',W('StrobeShock'))
at(137,'Muscular Nose',E('attackRequirement',condition=cond('selfDamageBelow',amount=80),allowWhenFailed=True))
at(86,'Gritty Comeback',W('SwapDamage'))
at(131,'Energy Slap',W('EnergySlap'))
ab(51,trig('damagedByAttack',E('sm6Rule',rule='poisonPoint'),activeOnly=True,opponentAttackOnly=True))
ab(117,trig('benched',W('Counters',amount=10),fromHandOnly=True))
ab(119,trig('evolved',W('Counters',amount=30),fromHandOnly=True))
ab(138,activated(W('IntrepidSword')))
ab(124,passive(W('MorePoison')))
tr(157,'Supporter',Q('HandAttach',left=1,benchOnly=True,basicOnly=True))
tr(172,'Item',E('sm5Rule',rule='palPad'))
tr(176,'Supporter',E('sm7Rule',rule='sm115CenterLady'))
tr(180,'Item',E('rareCandy'))
tr(184,'Supporter',W('ReturnAttachments',target='opponentPokemon',left=1))

# v470: reuse shared choices, typed knockout history and checkup handlers.
at(6,'Cotton Ride',coin(E('shuffleIntoDeck',target='opponentActive',includeAttached=True)))
at(9,'Anchor Anger',bonus(90,cond('swsh1GrassAttackKO')))
ab(19,activated(E('reorderTop',deckSide='opponent',count=3)))
at(39,'Hundred Foot Flames',W('FireMill'))
at(47,'Ripping Horn',R('EnergyFlip',coins=3))
ab(64,dict(type='activated',oncePerTurn=False,effect=Q('HandAttach',left=1,energyType='Water',benchOnly=True,targetType='Water',basicOnly=True)))
ab(85,dict(type='activated',oncePerTurn=False,effect=W('LifeShaker')))
at(88,'Sleepy Pulse',E('status',target='opponentActive',status='sleep',recoveryCoins=2))
at(99,'Bedrock Shake',seq(E('benchDamage',side='opponent',all=True,amount=60,filter={'damaged':True}),E('benchDamage',side='self',all=True,amount=60,filter={'damaged':True})))
at(126,'Thief',seq(E('revealHand',side='opponent'),E('xy10HandToDeckBottom',side='opponent')))
ab(132,trig('damagedByAttack',W('SnapTrap'),activeOnly=True,opponentAttackOnly=True))
at(135,'Iron Wings',W('IronWings'))
at(144,'Carry Off',W('CarryOff'))
ab(148,activated(W('PrimateWisdom')))
at(151,'Pluck',E('discardTool',target='opponentActive',amount='all',timing='beforeDamage'))
tr(166,'Item',W('HyperPotion'))
tr(167,'Tool',W('LuckyEgg'))
tr(168,'Tool',W('LumBerry'))
tr(171,'Item',W('OrdinaryRod'))
tr(182,'Tool',W('SitrusBerry'))
# Bench-to-Active trigger is dispatched by the shared monitored action path.
ab(34,trig('swsh1Libero',Q('DiscardAttach',left=2,energyType='Fire',sourceSelf=True,optional=True)))
at(113,'Octolock',W('Octolock'))
