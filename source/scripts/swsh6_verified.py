"""Chilling Reign: exact full-print reprints and reviewed shared effects."""
from copy import deepcopy
from pathlib import Path
import json,subprocess
import swsh5_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
from swsh3_verified import Q,mod,trig,R,search
ROOT=Path(__file__).resolve().parents[1]
ROWS=json.loads((ROOT/'data/classic/swsh6-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
# Full printed identity, excluding collector number and rarity only. No name-only cloning.
def sig(r):return json.dumps(r[1:12]+r[13:],ensure_ascii=False,separators=(',',':'))
prior_sets={'swsh1':'sword-shield','swsh2':'rebel-clash','swsh3':'darkness-ablaze','swsh35':'champions-path','swsh4':'vivid-voltage','swsh45':'shining-fates','swsh45sv':'shining-fates-shiny-vault','swsh5':'battle-styles'}
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
 return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(['_swsh6_',*row[1:]],a)
def ability(row,a):
 c=REPRINT.get(sig(row))
 if c:return {k:deepcopy(v) for k,v in c['abilities'][row[8].index(a)].items() if k not in ('name','text','printedPowerType','disabledByStatus')}
 return deepcopy(B.get(tuple(a))) or V.ability(['_swsh6_',*row[1:]],a)
def trainer(row):
 c=REPRINT.get(sig(row))
 if c:return c['trainerType'],deepcopy(c['effect'])
 return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):
 if row[0] in ('157','159'):return E('specialEnergy',provides={'Miracle':1})
 if row[0]=='158':return E('specialEnergy',provides={'Colorless':1})
 return None
def prism_ready(row):return False
# First pass: shared effects with full printed text matching; no ID-dependent
# reprints or newly invented effect names. Complex reactive rules remain gated.
at(3,'Persist Sting',E('knockOut',target='opponentActive',condition=cond('opponentHasSpecialEnergy')))
at(6,'Single-Horn Throw',E('allHeadsBonus',coins=2,amount=160,mode='add'))
at(7,'Leaflet Dance',Q('HandAttach',left=30,energyType='Grass',basicOnly=True,optional=True))
ab(8,activated(E('heal',target='selfAll',filter={'subtype':'Grass'},amount=20)))
at(12,'Winter Horn',bonus(80,cond('ownStadiumInPlay')))
at(15,'Tread On',E('retreatCostDamage',amount=50,mode='add'))
at(17,'Knock Off',E('discardHand',side='opponent',amount=1,random=True))
at(23,'Flame Charge',R('SearchAttach',amount=1,energyTypes=['Fire'],sourceSelf=True))
at(25,'Dynamite Tackle',bonus(150,cond('selfDamageAtLeast',amount=100)))
at(29,'Wintry Call',search(2,name='Melony',kind='trainer'))
at(30,'Cut Down',coin(discard(1,'opponentActive')))
ab(36,trig('evolved',Q('DiscardAttach',left=1,energyType='Water',optional=True),fromHandOnly=True))
at(39,'Hail Prison',seq(discard(2),status('paralysis')))
at(40,'Ocean Loop',W('ReturnAttachments',target='self',left=1))
at(41,'Keep Calling',E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic','tag':'rapid-strike'},choose=True,optional=True))
ab(43,activated(choose('opponentPokemon',E('placeDamageCounters',target='opponentPokemon',amount=20))))
at(44,'Rapid-Fisted Rush',E('fieldCountDamage',side='self',filter={'tag':'rapid-strike'},amount=30,mode='replace'))
at(46,'Ride of the High King',E('benchCountDamage',side='opponent',amount=30,mode='add'))
at(52,'Assisting Spark',Q('HandAttach',left=1,energyType='Lightning',benchOnly=True,basicOnly=True,optional=True))
at(57,'Pain Burst',E('damageFromDamage',source='opponent',amount=4,mode='add'))
ab(58,activated(S('Pay',amount=2,filter={},after=E('draw',amount=1))))
at(66,'Reinforced Punch',bonus(90,cond('selfHasTool')))
at(76,'Dig',coin(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)))
at(79,'Leek Strike',seq(bonus(90,cond('selfHasTool')),E('damageRule',ignoreResistance=True,condition=cond('selfHasTool'))))
at(81,'Dynablade',E('fieldCountDamage',side='opponent',filter={'tag':'pokemon-v'},amount=60,mode='replace'))
at(87,'Rogue Fangs',E('discardCountDamage',side='self',filter={'kind':'pokemon','tag':'single-strike'},amount=10,mode='add'))
ab(89,passive(mod('damageReduction',30)))
at(92,'Synchro Buster',bonus(80,cond('handSizesEqual')))
ab(92,passive(E('modifier',stat='retreatCost',scope='opponentActive',amount=2,duration='whileInPlay'),activeOnly=True))
at(93,'Training',R('SearchAttach',amount=1,sourceSelf=True))
at(95,"Mixin' Toxin",seq(status('confusion'),Q('DiscardAttach',left=1,energyType='Darkness',sourceSelf=True)))
at(95,'Smog Burst',E('energyDamage',source='self',all=True,energyType='Darkness',countProvidedType=True,amount=20,mode='add'))
ab(97,dict(type='activated',sharedOncePerTurn='direflameWings',effect=Q('DiscardAttach',left=1,energyType='Darkness',sourceSelf=True)))
at(99,'Concoction',S('Pay',amount=1,filter={},after=E('draw',amount=3)))
at(100,'Max Toxify',E('status',target='opponentActive',status='poison',amount=120))
at(108,'Field Crush',BS('FieldCrush'))
at(108,'Fists of Strife',bonus(100,cond('selfDamaged')))
at(112,'Synchro Hammer',bonus(90,cond('equalEnergyCount')))
at(113,'Max Rush',E('nextAttackBonus',attackName='Max Rush',amount=150))
at(115,'Raging Bull',seq(E('damageFromDamage',source='self',amount=2,mode='add'),E('status',target='self',status='confusion')))
at(121,'Weather Force',E('drawToHandSize',size=6))
at(123,'Return',E('drawToHandSize',size=6,optional=True))
at(124,'Blow Through',bonus(20,cond('stadiumInPlay')))
at(125,'Max Wind Spirit',seq(bonus(120,cond('stadiumInPlay')),E('discardStadium',condition=cond('stadiumInPlay'))))
at(127,'Scrounge',E('searchChosen',source='discard',amount=1,filter={'kind':'trainer','trainerType':'Tool'}))
tr(131,'Supporter',E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic','tag':'rapid-strike'},choose=True,optional=True))
for no,ty in [(133,'Metal'),(138,'Fire'),(143,'Darkness'),(155,'Grass')]:
 tr(no,'Tool',mod('attackDamageActiveOnly',30,opponentFilter={'subtype':ty}))
tr(134,'Supporter',seq(E('draw',amount=2),E('draw',amount=2,condition=cond('opponentMatches',filter={'stage':'VMAX'}),optionalCondition=True)))
tr(145,'Supporter',seq(E('searchChosen',source='discard',amount=2,filter={'kind':'pokemon'},optional=True),E('searchChosen',source='discard',amount=2,filter={'kind':'energy','basicEnergy':True},optional=True)))
tr(150,'Supporter',seq(E('discardHand',side='self',amount=999),E('searchChosen',amount=2,filter={'kind':'trainer'},optional=True)))
tr(156,'Item',E('searchChosen',source='discard',amount=1,filter={'kind':'trainer','trainerType':'Supporter','tag':'single-strike'}))

# Stage 2 — shared primitives and reviewed Chilling Reign effects.
def CR(rule,**kw):return E('sm7Rule',rule='swsh6'+rule,**kw)
tr(129,'Supporter',CR('Agatha'))
tr(132,'Supporter',CR('Caitlin'))
tr(135,'Stadium',E('healingBlock',scope='both'))
tr(139,'Supporter',CR('Flannery'))
tr(140,'Item',CR('FogCrystal'))
tr(141,'Tool',CR('Chestplate'))
tr(142,'Supporter',CR('Honey'))
tr(144,'Supporter',CR('Karen'))
tr(146,'Supporter',CR('Melony'))
tr(148,'Stadium',CR('Path'))
tr(151,'Tool',BS('Scroll'))
at(151,'Gravdrop',E('energyDamage',source='opponent',amount=50,mode='add'))
tr(153,'Supporter',CR('Siebold'))
tr(154,'Tool',BS('Scroll'))
at(154,'Bullet Breakthrough',E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True))
at(123,'Sky Return',E('returnToHand',target='self',returnBasicEnergy=True))
at(104,'Shadow Ripper',E('chooseOption',options=[{'label':'Return this Pokémon and attachments','effect':E('returnToHand',target='self',returnBasicEnergy=True)},{'label':'Keep in play','effect':E('noop')}]))
at(49,'Searchlight Tail',CR('Searchlight'))
at(19,'Pack Call',CR('PackCall'))
at(64,'Photon Laser',bonus(90,cond('teamEnergyAtLeast',amount=5)))
at(64,'Crescent Glow',CR('CrescentGlow'))
ab(28,passive(CR('Crisis')))
ab(10,passive(CR('Toughness')))
ab(34,passive(CR('Weather')))
at(22,'High-Pressure Blast',CR('HighPressure'))
at(33,'Rainfall',seq(E('bonusDamage',amount=20),E('benchDamage',side='opponent',all=True,amount=20)))

at(46,'Max Lance',CR('MaxLance'))
at(18,'Raging Repeated Strike',CR('RepeatedStrike'))

# Stage 3: reuse turn locks, selected counters and delayed KO; exact variants inherit.
at(74,'Shadow Mist',seq(*(E('actionLock',cardType=t,side='opponent',duration='opponentTurn') for t in ['SpecialEnergy','Stadium'])))
at(74,'Astral Barrage',Q('FixedCounters',left=2,amount=50))
at(75,'Max Geist',E('energyDamage',source='self',all=True,energyType='Psychic',countProvidedType=True,amount=30,mode='add'))
ab(75,activated(Q('HandAttach',left=1,energyType='Psychic',basicOnly=True,benchOnly=True,targetType='Psychic',drawAfter=2)))
at(99,'Word of Ruin',E('scheduleDelayed',event='endOpponentNextTurn',targetMode='defender',effect=E('knockOut',target='eventPokemon')))
at(80,'Thunderous Kick',E('discardEnergyCard',target='opponentActive',amount=1,specialOnly=True,timing='beforeDamage'))
ab(80,passive(CR('FightingInstinct')))
at(167,'Libra Horn',CR('LibraHorn'))
ab(57,trig('knockedOutByAttack',E('searchChosen',amount=2,filter={},optional=True),opponentAttackOnly=True))
at(60,'Mirage Step',E('benchFromDeck',amount=3,filter={'kind':'pokemon','name':'Kirlia'},choose=True,optional=True))
ab(101,trig('knockedOutByAttack',E('placeDamageCounters',target='opponentActive',amount=60),activeOnly=True,opponentAttackOnly=True))
ab(118,trig('energyAttached',E('chooseOption',options=[{'label':'Make opposing Active Confused','effect':status('confusion')},{'label':'Skip','effect':E('noop')}]),fromHandOnly=True))
ab(83,passive(CR('SpitefulSlate')))
ab(122,passive(CR('Chromashift')))
ab(96,passive(CR('EnergyFactory')))
tr(147,'Stadium',CR('OldCemetery'))
