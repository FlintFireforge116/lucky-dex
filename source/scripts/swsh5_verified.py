"""Shining Fates and Shiny Vault: exact full-print reprints and reviewed shared effects."""
from copy import deepcopy
from pathlib import Path
import json,subprocess
import swsh45_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
from swsh3_verified import Q,mod,trig,R,search
ROOT=Path(__file__).resolve().parents[1]
ROWS=json.loads((ROOT/'data/classic/swsh5-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
# Full printed identity, excluding collector number and rarity only. No name-only cloning.
def sig(r):return json.dumps(r[1:12]+r[13:],ensure_ascii=False,separators=(',',':'))
prior_sets={'swsh1':'sword-shield','swsh2':'rebel-clash','swsh3':'darkness-ablaze','swsh35':'champions-path','swsh4':'vivid-voltage','swsh45':'shining-fates','swsh45sv':'shining-fates-shiny-vault'}
js='const a="./app/src/main/assets/";process.stdout.write(JSON.stringify('+json.dumps(list(prior_sets.values()))+'.flatMap(n=>require(a+"tcg-classic-"+n+".js").CARDS)));'
PRIOR_CARDS=json.loads(subprocess.check_output(['node','-e',js],cwd=ROOT,text=True))
prior_by_id={c['id']:c for c in PRIOR_CARDS}
REPRINT={}
for sid in prior_sets:
 for r in json.loads((ROOT/f'data/classic/{sid}-print-compact.json').read_text()):
  c=prior_by_id.get(sid+'-'+r[0]);
  if c and c['battleEnabled']:REPRINT[sig(r)]=c
from swsh3_verified import S,N,W
from swsh2_verified import choose,discard
# Shared exact mappings; no strike-specific mechanics enabled until their descriptors are verified.
at(2,'Vine Whip',E('noop'))
ab(2,trig('evolved',E('chooseOption',options=[{'label':'Burn and poison','effect':seq(status('burn'),status('poison'))},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
at(3,'Panic Vine',seq(status('confusion'),E('lock',target='opponentActive',action='retreat',duration='opponentTurn')))
at(5,'Pull',E('forceOpponentSwitch',choose=True))
at(5,'Spiny Punch',bonus(70,cond('selfHasEnergyType',energyType='Darkness')))
at(1,'Venoshock',bonus(40,cond('opponentStatus',status='poison')))
at(20,'Heat Dash',Q('HandAttach',left=1,energyType='Fire',sourceSelf=True,optional=True,basicOnly=True))
for n,t,b in [(21,'V Bullet',50),(22,'Max Victory',120)]:at(n,t,bonus(b,cond('opponentMatches',filter={'tag':'pokemon-v'})))
at(22,'Spreading Flames',Q('DiscardAttach',left=3,energyType='Fire',optional=True))
at(33,'Aqua Burst',E('energyDamage',source='self',energyType='Water',countProvidedType=True,amount=40,mode='replace'))
at(34,'Find It',search(1,kind='trainer',trainerType='Item'))
at(39,'Knock Off',E('discardHand',side='opponent',amount=1))
at(47,'Jumping Kick',E('selectedDamage',target='opponentPokemon',amount=30))
at(48,'Scar Strikes',bonus(100,cond('opponentDamaged')))
at(51,'Max Shock',E('status',target='opponentActive',status='paralysis',condition=cond('sm10PrizeDeficit',amount=1)))
at(54,'Tantailizing',coin(E('forceOpponentSwitch',choose=True)))
at(63,'Prismatic Ray',E('multiTargetDamage',target='opponentBench',amount=20,count=2))
at(63,'Special Laser',bonus(120,cond('selfHasSpecialEnergy')))
ab(70,passive(mod('damageReduction',30)))
at(75,'Hammer Pressure',E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'evolved':True})))
at(77,'Spinning Whip',seq(status('confusion'),E('shuffleIntoDeck',target='self',includeAttached=True)))
at(80,'Coal Cannon',E('coinDamageByEnergy',countProvidedEnergy=True,amount=90,mode='replace'))
at(83,'Rapid Strike Squad',E('fieldCountDamage',side='self',filter={'tag':'rapid-strike'},amount=20,mode='replace'))
at(85,'Laser Focus',R('SearchAttach',amount=2,energyTypes=['Fighting'],sourceSelf=True))
at(86,'G-Max One Blow',seq(discard('all'),E('damageRule',ignoreEffects=True)))
at(88,'Gale Thrust',bonus(120,cond('movedFromBenchThisTurn')))
at(88,'G-Max Rapid Flow',seq(discard('all'),E('multiTargetDamage',target='opponentPokemon',amount=120,count=2,activeWeaknessResistance=True)))
for n,count in [(90,2),(91,3)]:ab(n,trig('evolved',E('chooseOption',options=[{'label':f'Draw {count} cards','effect':E('draw',amount=count)},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
at(93,'Scout',E('revealHand',side='opponent'))
at(97,'Cragalanche',E('discardTop',side='opponent',amount=2))
at(97,'Single Strike Crush',E('discardTop',side='self',amount=4))
at(98,'Gather Food',E('searchChosen',source='discard',amount=1,filter={'kind':'trainer','trainerType':'Item'}))
at(98,'Hangry Tackle',bonus(90,cond('handSizeOneOf',values=[0])))
at(100,'Piercing Strike',E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True))
at(103,'Swords Dance',E('nextAttackBonus',attackName='Slash',amount=70))
at(104,'Steel Slice',bonus(90,cond('opponentMatches',filter={'subtype':'Metal'})))
at(108,'Gigaton Bash',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'VMAX'}))
at(116,'Caturday',seq(E('draw',amount=3),E('status',target='self',status='sleep')))
at(120,'Hand Kinesis',E('handCountDamage',source='self',amount=10,mode='replace'))
tr(128,'Supporter',E('drawToHandSize',size=6))
tr(129,'Item',search(1,kind='pokemon',hpAtMost=90))
tr(138,'Stadium',E('modifier',stat='retreatCost',amount=-2,scope='both',duration='whileInPlay',filter={'tag':'rapid-strike'}))
at(13,'Vital Powder',E('multiTargetHeal',target='selfBench',amount=999,count=2))
at(26,'Burning Licks',E('coinRepeatEffect',coins=2,effect=discard(1,'opponentActive')))
at(28,'Derisive Roasting',E('statusCountDamage',source='opponent',amount=90,mode='replace'))
at(31,'Smokescreen',E('attackCoinGate',target='opponentActive',duration='opponentTurn'))
at(50,'Spiral Thunder',E('energyDamage',source='opponent',all=True,amount=40,mode='add'))
at(64,'Radar',E('reorderTop',deckSide='self',count=4))
at(67,"Steamin' Mad Strike",E('fieldCountDamage',side='self',benchOnly=True,filter={'damaged':True},amount=50,mode='replace'))
at(84,"Land's Pulse",bonus(30,cond('stadiumInPlay')))
at(92,'Splattering Poison',seq(E('status',target='self',status='poison'),status('poison')))
at(92,'Unhinged Hammer',bonus(120,cond('selfStatus')))
at(94,'Voltage Dive',bonus(80,cond('opponentHasSpecialEnergy')))
ab(94,passive(E('preventStatus',scope='self',duration='whileInPlay',status='sleep',clearExisting=True)))
ab(118,passive(mod('attackDamage',60,opponentFilter={'subtype':'Grass'})))
tr(122,'Item',seq(search(1),E('endTurn')))
tr(124,'Item',E('sm2Rule',rule='energyRecycler'))
tr(125,'Item',E('neoRule',rule='bw8:escapeRope'))
ab(25,passive(E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='whileInPlay',filter={'tag':'single-strike'})))
ab(37,dict(type='activated',sharedOncePerTurn='rapidStrikeSearch',effect=search(1,tag='rapid-strike')))
tr(121,'Supporter',seq(E('handShuffle',side='self',draw=4),E('draw',amount=3,condition=cond('sm12OwnKoLastTurn'),optionalCondition=True)))
# v500 shared strike energy and continuation.
def BS(rule,**kw):return E('sm7Rule',rule='swsh5'+rule,**kw)
ab(6,dict(type='activated',sharedOncePerTurn='excitingStage',effect=BS('ExcitingStage')))
ab(8,dict(type='activated',oncePerTurn=False,effect=BS('SpringBloom')))
at(10,'Devour',BS('Devour'))
at(16,"Nature's Judgment",BS('Nature'))
at(18,'Sour Spit',E('modifier',stat='attackCost',amount=2,target='opponentActive',duration='opponentTurn'))
at(19,'G-Max Rolling',E('selfDamagePenalty',amount=1))
at(40,'Swirling Slice',BS('Swirling'))
ab(40,passive(BS('Emperor')))
at(42,'Sediment Sink',BS('Sediment'))
ab(52,trig('benched',BS('BallSearch'),fromHandOnly=True))
at(67,'Field Crush',BS('FieldCrush'))
at(82,'Big Sand Cannon',BS('BigSand'))
ab(96,activated(BS('Roar')))
tr(123,'Supporter',BS('Cheryl'))
tr(126,'Tool',BS('ExpShare'))
tr(127,'Item',BS('Fan'))
tr(137,'Stadium',E('stadiumAction',effect=BS('Tower')))
tr(139,'Item',BS('Urn'))
# v501: additional exact handlers.
ab(30,passive(BS('Overheater')))
at(53,'Defiant Spark',BS('Defiant'))
at(62,'Jealous Eyes',BS('Jealous'))
ab(62,trig('benched',E('chooseOption',options=[{'label':'Protect Mimikyu V','effect':E('preventDamage',target='self',duration='opponentTurn')},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
at(107,'Full Metal Blade',discard(2,energyType='Metal',strictEnergyType=True))
ab(107,activated(BS('Stance')))
ab(108,activated(BS('Stance')))
tr(130,'Supporter',BS('Phoebe'))
# Active portion is ordinary attack damage; bench portion is a separate effect.
at(131,'Matchless Maelstrom',seq(BS('Maelstrom'),E('benchDamage',side='opponent',all=True,amount=30)))
at(133,'Furious Anger',E('damageFromDamage',source='self',amount=1,mode='add'))
tr(131,'Tool',BS('Scroll'))
tr(133,'Tool',BS('Scroll'))
tr(132,'Supporter',BS('Mustard',rapid=True))
tr(134,'Supporter',BS('Mustard',rapid=False))
# Exact print lookup only, otherwise use already-reviewed attack signatures.
def attack(row,a):
 c=REPRINT.get(sig(row))
 if c:return deepcopy(c['attacks'][row[7].index(a)]['effect'])
 return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(['_swsh5_',*row[1:]],a)
def ability(row,a):
 c=REPRINT.get(sig(row))
 if c:return {k:deepcopy(v) for k,v in c['abilities'][row[8].index(a)].items() if k not in ('name','text','printedPowerType','disabledByStatus')}
 return deepcopy(B.get(tuple(a))) or V.ability(['_swsh5_',*row[1:]],a)
def trainer(row):
 c=REPRINT.get(sig(row))
 if c:return c['trainerType'],deepcopy(c['effect'])
 return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):
 if row[1]=='Rapid Strike Energy':return E('specialEnergy',provides={'Water':2})
 if row[1]=='Single Strike Energy':return E('specialEnergy',provides={'Fighting':1})
 return None
def prism_ready(row):return False
