"""Shining Fates and Shiny Vault: exact full-print reprints and reviewed shared effects."""
from copy import deepcopy
from pathlib import Path
import json,subprocess
import swsh4_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
from swsh3_verified import Q,mod,trig,R,search
ROOT=Path(__file__).resolve().parents[1]
ROWS=json.loads((ROOT/'data/classic/swsh45-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def ab(no,effect):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(r[8][0])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
# Full printed identity, excluding collector number and rarity only. No name-only cloning.
def sig(r):return json.dumps(r[1:12]+r[13:],ensure_ascii=False,separators=(',',':'))
prior_sets={'swsh1':'sword-shield','swsh2':'rebel-clash','swsh3':'darkness-ablaze','swsh35':'champions-path','swsh4':'vivid-voltage'}
js='const a="./app/src/main/assets/";process.stdout.write(JSON.stringify('+json.dumps(list(prior_sets.values()))+'.flatMap(n=>require(a+"tcg-classic-"+n+".js").CARDS)));'
PRIOR_CARDS=json.loads(subprocess.check_output(['node','-e',js],cwd=ROOT,text=True))
prior_by_id={c['id']:c for c in PRIOR_CARDS}
REPRINT={}
for sid in prior_sets:
 for r in json.loads((ROOT/f'data/classic/{sid}-print-compact.json').read_text()):
  c=prior_by_id.get(sid+'-'+r[0]);
  if c and c['battleEnabled']:REPRINT[sig(r)]=c
# Explicit exact printed mappings for new rules that already have a shared implementation.
for n,kind in [(3,'energy'),(24,'pokemon')]:ab(n,activated(R('TopPick',count=6,amount=1,filter={'kind':kind},destination='hand',rest='shuffle',optional=True),activeOnly=True))
at(5,'Attach Leaves',Q('DiscardAttach',left=2,benchOnly=True,energyType='Grass',optional=True))
at(10,'Swinging Chain',E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=30,energyType='Grass',countProvidedType=True))
ab(12,passive(mod('retreatCost',-999,condition=cond('ownStadiumInPlay'))))
at(15,'Enriching Seeds',E('chooseTarget',target='selfBench',effect=E('heal',target='selfBench',amount=999)))
ab(18,passive(mod('retreatCost',-999,condition=cond('stadiumInPlay'))))
at(21,'Amazing Surge',seq(E('bonusDamage',amount=80),E('benchDamage',side='opponent',amount=80,all=True)))
ab(27,passive(mod('damageReduction',30)))
at(29,'Call for Family',E('benchFromDeck',amount=1,filter={'kind':'pokemon','stage':'Basic'},choose=True))
at(56,'Helping Hand',R('SearchAttach',amount=1,benchOnly=True))
at(28,'Spit-Out Shot',E('selectedDamage',target='opponentBench',amount=50))
ab(34,trig('benched',E('searchChosen',amount=2,filter={'kind':'trainer','trainerType':'Item','nameContains':'Rotom'},optional=True),fromHandOnly=True))
at(45,'Stealth Poison',seq(status('poison'),E('switch',target='self')))
at(46,'Amazing Destruction',E('knockOut',target='opponentActive'))
at(48,'Call for Goons',E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic'},choose=True,optional=True))
at(50,'Stick On',Q('DiscardAttach',left=1,sourceSelf=True))
ab(50,activated(E('sm7Rule',rule='swsh45VTransformation')))
at(51,'Max Transform',E('copyAttack',source='opponentActive',swsh2Copy=True,sm12Copy=True))
at(52,'Signs of Evolution',search(1,kind='pokemon',evolvesFrom='Eevee'))
at(55,'Max Jet',E('coinDamageByEnergy',countProvidedEnergy=True,amount=80,mode='replace'))
tr(57,'Supporter',E('sm7Rule',rule='swsh45BallGuy'))
tr(61,'Tool',mod('maxHp',70,filter={'name':'Zamazenta V'}))
tr(62,'Tool',E('sm7Rule',rule='swsh45RustedSword'))
tr(58,'Supporter',E('forceOpponentSwitch',choose=True))
tr(60,'Supporter',seq(E('discardHand',side='self',amount=999),E('draw',amount=7)))
tr(59,'Supporter',seq(E('draw',amount=2),E('draw',amount=2,condition=cond('sm12OwnKoLastTurn'),optionalCondition=True)))
tr(63,'Item',seq(E('heal',target='selfActive',amount=50),E('heal',target='opponentActive',amount=50)))
tr(70,'Supporter',search(1,kind='pokemon'))
tr(72,'Supporter',search(1,kind='trainer'))
# Exact main-set/Vault reprints use the same descriptors; identity-dependent
# effects are migrated in the core, rather than pretending IDs are interchangeable.
def attack(row,a):
 c=REPRINT.get(sig(row));
 if c:return deepcopy(c['attacks'][row[7].index(a)]['effect'])
 return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(['_swsh45_',*row[1:]],a)
def ability(row,a):
 c=REPRINT.get(sig(row));
 if c:return {k:deepcopy(v) for k,v in c['abilities'][row[8].index(a)].items() if k not in ('name','text','printedPowerType','disabledByStatus')}
 if a[0]=='Shady Dealings' and a[2]=='When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may search your deck for up to 2 Trainer cards, reveal them, and put them into your hand. Then, shuffle your deck.':return trig('evolved',E('searchChosen',amount=2,filter={'kind':'trainer'},optional=True),fromHandOnly=True)
 return deepcopy(B.get(tuple(a))) or V.ability(['_swsh45_',*row[1:]],a)
def trainer(row):
 c=REPRINT.get(sig(row));
 if c:return c['trainerType'],deepcopy(c['effect'])
 return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return None
def prism_ready(row):return False
