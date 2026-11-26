"""Evolving Skies: exact full-print reprints and reviewed shared effects."""
from copy import deepcopy
from pathlib import Path
import json,subprocess
import swsh6_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
from swsh3_verified import Q,mod,trig,R,search
ROOT=Path(__file__).resolve().parents[1]
ROWS=json.loads((ROOT/'data/classic/swsh7-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
# Full printed identity, excluding collector number and rarity only. No name-only cloning.
def sig(r):return json.dumps(r[1:12]+r[13:],ensure_ascii=False,separators=(',',':'))
prior_sets={'swsh1':'sword-shield','swsh2':'rebel-clash','swsh3':'darkness-ablaze','swsh35':'champions-path','swsh4':'vivid-voltage','swsh45':'shining-fates','swsh45sv':'shining-fates-shiny-vault','swsh5':'battle-styles','swsh6':'chilling-reign'}
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

from swsh5_verified import BS
# Whole-print reprints and exact reviewed descriptors only.
def attack(row,a):
 c=REPRINT.get(sig(row))
 if c:return deepcopy(c['attacks'][row[7].index(a)]['effect'])
 return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(['_swsh7_',*row[1:]],a)
def ability(row,a):
 c=REPRINT.get(sig(row))
 if c:return {k:deepcopy(v) for k,v in c['abilities'][row[8].index(a)].items() if k not in ('name','text','printedPowerType','disabledByStatus')}
 return deepcopy(B.get(tuple(a))) or V.ability(['_swsh7_',*row[1:]],a)
def trainer(row):
 c=REPRINT.get(sig(row))
 if c:return c['trainerType'],deepcopy(c['effect'])
 return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return None
def prism_ready(row):return False
# Stage 1: reviewed reuse, never infer an effect solely from its attack name.
at(8,'Grass Knot',E('retreatCostDamage',amount=60,mode='replace'))
at(10,'Dizzying Flower',coin(status('sleep'),status('confusion')))
for n,title in [(13,'Shadow Claw'),(97,'Nipping Cyclone'),(99,'Shakedown')]:at(n,title,E('discardHand',side='opponent',amount=1,random=True))
at(14,'Missing in the Forest',E('discardCountDamage',side='opponent',filter={'kind':'trainer','trainerType':'Supporter'},amount=40,mode='replace'))
ab(16,activated(E('searchChosen',amount=2,filter={'basicEnergy':True},optional=True)))
at(20,'Victory Dive',E('searchChosen',amount=2,filter={},optional=True))
for n,t in [(27,'Poisonous Prison'),(100,'Trash Stench'),(101,'G-Max Malodor')]:at(n,t,seq(status('poison'),E('lock',target='opponentActive',action='retreat',duration='opponentTurn')))
at(28,'Get Angry',E('damageFromDamage',source='self',amount=2,mode='replace'))
at(31,'Blizzard Rondo',E('benchCountDamage',side='both',amount=20,mode='add'))
ab(31,activated(E('draw',amount=1),activeOnly=True))
at(39,'Synchrodraw',E('handShuffle',side='self',draw='opponentHandCount'))
for n,t in [(40,'Heavy Snow'),(130,'Shatter')]:at(n,t,E('discardStadium'))
at(47,'Blockface',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'Basic'}))
ab(55,activated(Q('DiscardAttach',left=1,energyType='Lightning',benchOnly=True,optional=True)))
at(64,'Zen Shot',E('selectedDamage',target='opponentPokemon',amount=60,filter={'tag':'pokemon-v'}))
at(65,'Max Mindstorm',E('energyDamage',source='opponent',all=True,amount=60,mode='replace'))
at(67,'Go and Collect',search(1,kind='trainer'))
at(69,'Synchro Woofer',bonus(80,cond('handSizesEqual')))
at(70,'Rewind Beam',E('devolve',target='opponentActive',condition=cond('opponentMatches',filter={'evolved':True})))
ab(76,trig('benched',E('chooseOption',options=[{'label':'Discard Stadium','effect':E('discardStadium')},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
at(80,'Rapid Hunt',E('searchChosen',amount=2,filter={'tag':'rapid-strike'},optional=True))
at(81,'Clean Hit',bonus(50,cond('opponentMatches',filter={'evolved':True})))
for n,t in [(87,'Protect'),(108,'Hard Roll')]:at(n,t,coin(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)))
for n,ty in [(82,'Fighting'),(93,'Darkness'),(63,'Psychic')]:ab(n,trig('benched',Q('HandAttach',left=2,energyType=ty,sourceSelf=True,basicOnly=True,optional=True),fromHandOnly=True))
at(93,'Fiery Wrath',E('pointDamage',side='opponent',prizesTaken=True,amount=50,mode='add'))
at(94,'Moonlight Blade',bonus(80,cond('selfDamaged')))
ab(95,trig('evolved',E('chooseOption',options=[{'label':'Switch opposing Pokémon','effect':E('forceOpponentSwitch',chooseBy='attacker')},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
ab(109,activated(E('forceOpponentSwitch',chooseBy='defender')))
ab(111,activated(seq(E('discardHand',side='self',amount=999),E('draw',amount=3))))
at(112,'Chrono Wind',E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'tag':'pokemon-v'})))
at(113,'Call for Family',E('benchFromDeck',amount=1,filter={'kind':'pokemon','stage':'Basic'},choose=True))
at(117,'Boomburst',seq(E('bonusDamage',amount=20),E('benchDamage',side='opponent',all=True,amount=20)))
at(117,'Synchro Loud',bonus(120,cond('handSizesEqual')))
at(120,'Acidic Mucus',E('fieldCountDamage',side='opponent',filter={'hasAbility':True},amount=50,mode='replace'))
for n in (120,121):at(n,'Fighting Tackle',bonus(80,cond('opponentMatches',filter={'tag':'pokemon-v'})))
at(122,'Breaking Swipe',E('modifier',stat='attackDamage',scope='opponentActive',amount=-30,duration='opponentTurn'))
at(124,'Dragon Energy',E('selfDamagePenalty',amount=2,mode='add'))
at(125,'Vee-Search',E('searchChosen',amount=3,filter={'kind':'pokemon','tag':'pokemon-v'},optional=True))
at(137,'Valiant Talons',bonus(60,cond('opponentMatches',filter={'evolved':True})))
at(138,'Tailwind Draw',seq(E('draw',amount=1),E('draw',amount=3,condition=cond('sm7FirstSecond'),optionalCondition=True)))
at(140,'Nitro Dive',bonus(80,cond('selfHasEnergyType',energyType='Fire')))
for no,ty in [(145,'Fighting'),(156,'Lightning')]:tr(no,'Tool',mod('attackDamageActiveOnly',30,opponentFilter={'subtype':ty}))
tr(154,'Item',E('searchChosen',source='discard',amount=2,filter={'kind':'pokemon','hpAtMost':90},optional=True))
at(169,'Flaming Breath',R('SearchAttach',amount=1,energyTypes=['Fire'],sourceSelf=True))
at(191,'Shred',E('damageRule',ignoreEffects=True))
at(191,'Dragon Gale',E('benchDamage',side='self',all=True,amount=20))
# Same full printed text as the earlier reviewed Stadium, regardless of reprint rarity.
# The actual Stadium action dispatch must be verified before enabling #234.

# Existing search/turn-end sequence, tested with both controllers.
ab(7,activated(seq(R('SearchAttach',amount=1,energyTypes=['Grass']),E('endTurn'))))
ab(74,activated(seq(E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Item'}),E('endTurn'))))
ab(135,passive(E('modifier',stat='attackDamage',scope='opponentActive',amount=-30,duration='whileActive'),activeOnly=True))

# Stage 2: verified shared effects and explicitly typed pre-attack payment.
def ES(rule,**kw):return E('sm7Rule',rule='swsh7'+rule,**kw)
at(6,'Rally Back',bonus(90,cond('koByOpponentAttackLastTurn')))
at(18,'Max Detonate',seq(E('topDeckCountDamage',count=5,amount=100,filter={'kind':'energy'},mode='replace'),E('discardTop',side='self',amount=5)))
at(19,'Angry Fang',ES('AngryFang'))
ab(41,passive(E('preventDamage',target='self',duration='whileInPlay',attackerFilter={'stage':'VMAX','notName':'Glaceon VMAX'})))
at(46,'Schooling Shot',E('energyDamage',source='self',basicOnly=True,amount=30,mode='add'))
ab(46,passive(ES('GroupPower')))
at(48,'Ancient Freeze',E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'tag':['pokemon-v','pokemon-gx']})))
at(51,'Max Thunder Rumble',E('multiTargetDamage',target='opponentBench',amount=100,count=1,filter={'damaged':True}))
at(60,'Teraspark',seq(discard('all',energyType='Lightning',strictEnergyType=True),E('multiTargetDamage',target='opponentBench',amount=40,count=2)))
at(62,'Wake-Up Slap',seq(bonus(90,cond('opponentStatus')),E('removeStatus',target='opponentActive')))
ab(65,passive(ES('SolarRevelation')))
at(75,'Precious Touch',Q('HandAttach',left=1,benchOnly=True,heal=120))
at(75,'Max Harmony',E('fieldCountDamage',side='self',benchOnly=True,distinctPokemonTypes=True,amount=30,mode='add'))
at(110,'Spiral Burst',ES('SpiralBurst'))
at(111,'Max Burst',ES('MaxBurst'))
at(115,'Dragon Counter',E('pointsGainedLastTurnDamage',amount=100,mode='add'))
at(119,'Berserk',bonus(90,cond('selfBenchDamaged')))
at(121,'Thick Mucus',ES('ThickMucus'))
at(123,'G-Max Pulverization',E('damageRule',ignoreEffects=True))
ab(123,passive(E('preventDamage',target='self',duration='whileInPlay',attackerFilter={'hasSpecialEnergy':True})))
tr(141,'Supporter',seq(E('draw',amount=2),E('removeStatus',target='selfActive')))
tr(144,'Stadium',E('stadiumAction',effect=E('heal',target='selfAll',amount=30,filter={'subtype':['Metal','Dragon']})))
tr(149,'Supporter',ES('Gordie'))
tr(158,'Tool',BS('Scroll'))
tr(161,'Stadium',E('stadiumAction',effect=E('benchFromDeck',amount=1,filter={'kind':'pokemon','stage':'Basic','subtype':['Lightning','Dragon']},choose=True)))
tr(164,'Supporter',ES('Zinnia'))
tr(234,'Stadium',E('stadiumAction',effect=E('searchChosen',amount=1,filter={'kind':'pokemon','subtype':'Grass','evolved':True})))

# Stage 3: reviewed shared rules and narrow Evolving Skies handlers.
at(21,'Surging Flames',E('sm7Rule',rule='sm75Recycle',amount=20))
at(30,'Bubble Pod',ES('BubblePod'))
ab(34,trig('evolved',E('chooseOption',options=[{'label':'Use Enthusiastic Dance','effect':E('modifier',stat='attackDamageActiveOnly',scope='team',filter={'stage':'Basic'},amount=100,duration='turn')},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
at(43,'Element Chain',ES('ElementChain'))
at(53,'Blinding Beam',E('attackCoinGate',target='opponentActive',duration='opponentTurn'))
# Primeval Beak is mapped in stage 7 below.
at(59,'Spark Trap',ES('SparkTrap'))
at(63,'Psylaser',seq(discard('all',energyType='Psychic',strictEnergyType=True),E('selectedDamage',target='opponentPokemon',amount=120)))
at(88,'Pressure Shot',ES('PressureShot'))
at(90,'Shaky Wave',seq(E('modifier',stat='attackCostColorless',amount=1,target='opponentActive',duration='opponentTurn'),E('modifier',stat='retreatCost',amount=1,target='opponentActive',duration='opponentTurn')))
at(92,'Hunting Claw',ES('HuntingClaw'))
at(97,'Shiftadieu',E('returnToHand',target='opponentActive',returnBasicEnergy=True,condition=cond('opponentDamaged')))
# Garbodor's Tool-capacity reduction needs a mandatory owner-controlled discard choice.
at(131,'Rout',E('benchCountDamage',side='opponent',amount=30,mode='add'))
ab(131,passive(ES('ActFreely')))
tr(142,'Item',seq(E('chooseEvolutionFromDeck'),E('endTurn')))
tr(147,'Tool',mod('attackCostColorless',-1,filter={'tag':'pokemon-v','nameContains':['Vaporeon','Jolteon','Flareon']}))
tr(148,'Tool',mod('damageReduction',20,filter={'hasAbility':False}))
at(153,'Meteor',seq(discard(2),E('selectedDamage',target='opponentPokemon',amount=90)))
tr(153,'Tool',BS('Scroll'))
tr(163,'Item',ES('ToyCatcher'))
ab(1,passive(ES('ViseCoach')))
ab(106,activated(ES('TemptingTune')))
tr(150,'Item',ES('LuckyIcePop'))
tr(152,'Supporter',ES('Raihan'))
tr(162,'Item',ES('SwitchingCups'))

# Stage 4: targeted counters, physical hand/deck movement and conditional Tools.
at(56,'Electron Crush',ES('ElectronCrush'))
at(66,'Mirror Pain',ES('MirrorPain'))
at(77,'Pandemonium',ES('Pandemonium'))
at(79,'Tricky Steps',ES('TrickySteps'))
at(80,'Shadow Flicker',ES('ShadowFlicker'))
at(82,'Zapper Kick',ES('ZapperKick'))
ab(105,trig('evolved',ES('FumblingHands'),fromHandOnly=True))
at(118,'Judgment Surge',ES('JudgmentSurge'))
at(128,'Live Painting',ES('LivePainting'))
tr(155,'Tool',ES('RibbonBadge'))
tr(157,'Stadium',E('stadiumAction',effect=ES('ShoppingCenter')))
tr(159,'Tool',ES('SnowLeafBadge'))
at(50,'Big Sparking',ES('BigSparking'))
ab(73,dict(type='activated',oncePerTurn=False,effect=ES('RapidConnection')))
tr(160,'Tool',ES('SpiritMask'))

# Stage 5: shared extra attack/turn and typed payment, deck evolution, replacement.
ab(3,trig('energyAttached',ES('SolarEvolution'),fromHandOnly=True))
ab(4,passive(ES('FluffyBarrage')))
at(83,'Yoga Loop',ES('YogaLoop'))
at(116,'Extreme Freeze',ES('ExtremeFreeze'))
ab(103,activated(ES('PhantomTransformation')))

# Stage 6: prize-only effects, two-Tool capacity and Supporter protection.
ab(101,passive(E('toolCapacity',amount=2)))
tr(146,'Item',ES('DreamBall'))
tr(151,'Tool',ES('MoonSunBadge'))
def energy(row):
 if row[0]=='165':return E('specialEnergy',provides={'Colorless':1})
 return None

# Stage 7: defender-scoped physical hand attachment lock.
at(58,'Primeval Beak',ES('PrimevalBeak'))

# Stage 8: player/hand-only Supporter protection (not direct Pokémon effects).
ab(38,passive(ES('DewGuard')))
