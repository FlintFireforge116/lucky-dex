"""Dragon Majesty: exact-print adapters and conservative reuse of verified rules."""
from copy import deepcopy
import json,re
import sm7_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
from pathlib import Path
ROWS=json.loads((Path(__file__).resolve().parents[1]/'data/classic/sm75-print-compact.json').read_text())
# Match complete printed signature including costs and damage, not merely attack names.
A={}; B={}; T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no)); a=next(a for a in r[7] if a[0]==title); A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no)); a=r[8][0]; B[tuple(a)]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no)); T[(r[1],tuple(r[13]))]=(kind,effect)
R=lambda rule,**kw:E('sm7Rule',rule=rule,**kw)
# Earlier SM7 audit established that flexible provided types count for typed attack damage.
for no,amount in [(16,10),(17,20),(18,50),(21,10),(26,20)]:at(no,'Hydro Pump',E('energyDamage',source='self',energyType='Water',amount=amount,mode='add',countProvidedType=True))
at(8,'Damage Rush',E('coinDamage',coins='untilTails',amount=30,mode='add'))
at(10,'Charring Breath',E('attackDamageGate',condition=cond('opponentStatus',status='burn')))
at(13,'Call for Family',E('benchFromDeck',amount=1,choose=True,filter={'kind':'pokemon','stage':'Basic'}))
at(14,'Ring of Fire',seq(status('burn'),E('lock',action='retreat',target='opponentActive',duration='opponentTurn')))
at(18,'Maelstrom-GX',R('fieldDamage',amount=40,onlySide='opponent'))
at(23,'Sweep Away',E('discardTop',amount=3))
at(32,'Mini Earthquake',E('benchDamage',side='self',amount=10,all=True))
for no,title in [(38,'Sonic Edge'),(41,'Sonic Edge'),(46,'Shred'),(48,'Shred')]:at(no,title,E('damageRule',ignoreEffects=True))
at(41,'Bright Tone',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'isExOrGX':True}))
at(41,'Euphoria-GX',seq(status('sleep'),E('heal',target='selfAll',amount=9999)))
at(46,'Bolt Strike',coin(E('noop'),E('selfDamage',amount=50)))
at(48,'Dragon Nova-GX',seq(status('burn'),status('paralysis')))
for no,amount in [(48,80),(49,60)]:at(no,'Raging Blade',bonus(amount,cond('selfDamaged')))
at(52,'Rigidify',E('modifier',stat='damageReduction',scope='self',amount=20,duration='opponentTurn'))
at(54,'Raging Uppercut',bonus(120,cond('selfDamageAtLeast',amount=80)))
at(78,'Photon Geyser',E('sm6Rule',rule='photonGeyser'))
# Active-only damage bonus on Dragon attacks; no hard-coded print IDs required.
ab(40,passive(E('modifier',stat='attackDamage',scope='active',filter={'subtype':'Dragon'},amount=20,duration='whileInPlay')))
ab(44,passive(E('modifier',stat='retreatCost',scope='team',filter={'isExOrGX':False},amount=-999,duration='whileInPlay')))
ab(43,passive(E('modifier',stat='damageReduction',scope='self',amount=20,duration='whileInPlay',condition=cond('selfEnergyAtLeast',amount=1))))
# Repeated discard-to-Bench selections use a separate tested handler below.
at(37,'Dragonporter-GX',R('dragonporter'))
# Both Trainer variants reference the same canonical full rule signatures.
tr(58,'Supporter',R('blainesLastStand'))
tr(60,'Item',R('fieryFlint'))
def attack(row,a):return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(row,a)
def ability(row,a):return deepcopy(B.get(tuple(a))) or V.ability(row,a)
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return V.energy(row)
def prism_ready(row):return False
# Fiery Flint reuses the existing paid-discard search, including the hybrid Basic Energy search rules.
tr(60,'Item',E('sm6Rule',rule='discardSearch',amount=2,costFilter={},searchAmount=4,searchFilter={'kind':'energy','basicEnergy':True,'subtype':'Fire'}))
at(9,'Heat Assist',R('fireHandSpread',amount=3))
at(11,'Vermilion-GX',R('fireHandSpread',amount=5))
at(11,'Flame Charge',R('flameCharge'))
ab(5,{'type':'triggered','event':'energyAttached','fromHandOnly':True,'effect':E('removeStatus',target='self')})
# Passive stat modifiers use printed conditions and apply symmetrically.
ab(2,{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':R('burningFighter')})
ab(3,passive(E('modifier',stat='attackDamage',scope='self',amount=30,duration='whileInPlay',perOpponentFilter={'isExOrGX':True})))
at(6,'Fire Stream',seq(E('discardEnergyCard',target='self',amount=1,energyType='Fire',strictEnergyType=True),E('benchDamage',side='opponent',amount=20,all=True)))
ab(6,activated(E('sm6Rule',rule='discardAttach',energyType='Fire',benchOnly=True)))
tr(63,'Stadium',R('welaVolcano'))
tr(62,'Item',R('switchRaft'))
tr(61,'Supporter',R('lance'))
def prism_ready(row):return row[1]=='Lance ◇' and trainer(row) is not None
ab(45,{'type':'triggered','event':'damagedByAttack','activeOnly':True,'opponentAttackOnly':True,'effect':E('placeDamageCounters',target='opponentActive',amount=30)})
tr(59,'Tool',E('triggeredEffect',event='damagedByAttack',activeOnly=True,opponentAttackOnly=True,condition=cond('selfMatches',filter={'subtype':'Dragon'}),effect=E('placeDamageCounters',target='opponentActive',amount=30)))

# Completion: exact SM75 rules, including hybrid discard Energy inventory.
at(7,'Infinity',R('sm75Recycle',amount=20))
at(24,'Riptide',R('sm75Recycle',amount=20,energyType='Water'))
at(20,'Wild Tail',R('sm75WildTail'))
ab(20,{'type':'triggered','event':'damagedByAttack','activeOnly':True,'opponentAttackOnly':True,'effect':R('sm75Commotion')})
ab(24,{'type':'activated','oncePerTurn':False,'effect':R('sm75Downpour')})
ab(26,{'type':'activated','oncePerTurn':False,'effect':R('sm75WashOut')})
at(27,'Bubble Shoot',E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=20,energyType='Water',countProvidedType=True))
ab(30,passive(E('preventStatus',duration='whileInPlay',scope='team',filter={'subtype':'Water'},status='confusion',clearExisting=True)))
ab(31,passive(seq(E('modifier',stat='maxHp',scope='team',filter={'name':'Wishiwashi-GX'},amount=20,duration='whileInPlay'),E('modifier',stat='attackDamage',scope='active',filter={'name':'Wishiwashi-GX'},amount=20,duration='whileInPlay'))))
at(33,'Dark Destruction',E('sm4Rule',rule='darkDestruction'))
ab(33,activated(E('sm4Rule',rule='weedOut')))
ab(39,passive(E('preventEffects',duration='whileInPlay',scope='team',filter={'subtype':'Dragon'})))
at(50,'Explosive Jet',R('sm75ExplosiveJet'))
at(51,'Dragon Wisdom',R('sm75DragonWisdom'))
tr(64,'Supporter',R('sm75Zinnia'))
def prism_ready(row):return row[1] in ('Lance ◇','Victini ◇')
