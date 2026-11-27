"""Stage 1: explicit reviewed shared effects. Unknown mechanics remain gated."""
import swsh11_verified as previous
from swsh9_verified import E,seq,coin,cond,bonus,activated
from swsh8_verified import discard,status
from sm7_verified import passive

# The inherited definitions below were individually checked against the pinned text.
REUSE={13:['Energy Digging'],17:['Jump On'],18:['Hypnotic Gaze','Scorching Breath'],20:['Flame Cloak'],21:['Take Down'],25:['Lead'],27:['Energy Crush'],29:['Quick Dive','Merciless Strike'],30:['Reprisal'],32:['Flare Shot'],40:['Water Arrow','Mellow Wave'],41:['Collect'],44:['Water Pulse'],52:['Strong Volt'],54:['Lucky Find'],56:['Battle Claw'],57:['Switching Bolt','Lightning Wall'],58:['Max Thunder and Lightning'],60:['Hypnotic Ray'],62:['Psychic Assault'],63:['Confuse Ray'],65:['Shady Stamp'],12:['Hypno Hammer'],14:['Leaf Drain'],15:['Touchdown']}

def attack(row,a):
 n=int(row[0]); title,cost,damage,t=a
 if not t and damage.isdigit():return E('noop')
 if title in REUSE.get(n,[]):return previous.attack(row,a)
 if n==6 and title=='Bright Beam':return E('chooseDiscardForBonus',zone='hand',max=3,amount=70,filter={'kind':'energy'})
 if n==7 and title=='Noble Light':return seq(E('heal',target='selfAll',amount=30),E('heal',target='opponentAll',amount=30))
 if n==10 and title=='Swelling Scent':return E('distributeEnergy',source='zone',target='selfBench',energyType='Grass',amount=2,optional=True)
 if (n,title) in [(20,'Fighting Tackle'),(33,'White Drop')]:return bonus(100 if n==20 else 50,cond('opponentMatches',filter={'tag':'pokemon-v'}))
 if n==24 and title=='White Blaze':return E('coinFlip',heads=E('noop'),tails=E('lock',target='self',action='attack',duration='nextOwnTurn'))
 if n in (26,27) and title=='Flare Parade':return E('discardCountDamage',side='self',filter={'kind':'trainer','name':'Serena'},amount=60,mode='replace')
 if n==35 and title=='Tentacle Lock':return E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'evolved':True}))
 if n==36 and title=='Wild Freeze':return seq(E('selfDamage',amount=50),status('paralysis'))
 if n==37 and title=='Gulp Down':return E('drain')
 if n==38 and title=='Special Wave':return bonus(120,cond('selfMatches',filter={'hasSpecialEnergy':True}))
 if n==39 and title=='Ascension':return E('evolveFromDeck')
 if n==45 and title=='Sea Feast':return E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic','subtype':'Water'},choose=True,optional=True)
 if n==48 and title=='Drowning Ball':return coin(seq(status('paralysis'),discard(1,'opponentActive')))
 if n==53 and title=='Overhaul':return E('handShuffle',side='self',draw=6)
 if n==59 and title=='Mind Ruler':return E('handCountDamage',source='opponent',amount=20,mode='replace')
 if n==61 and title=='Psy Call':return E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Stage 1'},choose=True,optional=True)
 return None

def ability(row,a):
 if row[0]=='38' and a[0]=='Jumbo-Sized':return passive(E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay'))
 return None

def trainer(row):
 name=row[1];t=row[13][0]
 if name=='Energy Switch':return 'Item',E('sm1Rule',rule='energySwitch')
 if name=='Lance':return 'Supporter',E('searchChosen',amount=3,filter={'kind':'pokemon','subtype':'Dragon'},optional=True)
 if name=='Professor Laventon':return 'Supporter',E('searchChosen',source='discard',amount=3,filter={'kind':'pokemon','nameContains':'Hisuian'},optional=True)
 if name=='Unidentified Fossil':return 'Item',E('playFossil',hp=60,subtype='Colorless',canRetreat=False)
 if name=='Worker':return 'Supporter',seq(E('draw',amount=3),E('discardStadium',condition=cond('stadiumInPlay'),optionalCondition=True))
 return None

def energy(row):return None
prism_ready=previous.prism_ready

# Stage 2: selected support cards and matching Pokémon payoffs.
_stage1_attack,_stage1_ability,_stage1_trainer=attack,ability,trainer

def attack(row,a):
 n=int(row[0]);title=a[0]
 if n==2 and title=='Miracle Powder':return coin(E('chooseOption',options=[{'label':label,'effect':status(key)} for label,key in [('Asleep','sleep'),('Burned','burn'),('Confused','confusion'),('Paralyzed','paralysis'),('Poisoned','poison')]]))
 if n==16 and title=='Aroma Shot':return E('removeStatus',target='self')
 if n==23 and title=='Assisting Flame':return E('sm7Rule',rule='sm12DiscardAttach',left=2,energyType='Fire',optional=True)
 if n==42 and title=='Big Mouth':return bonus(130,cond('sm10Supporter',name='Candice'))
 if n==43 and title=='Frosty Jail':return seq(bonus(90,cond('sm10Supporter',name='Candice')),E('status',target='opponentActive',status='paralysis',condition=cond('sm10Supporter',name='Candice')))
 if n==44 and title=='Fossil Finding':return E('sm7Rule',rule='sm9Recycle',amount=4,filter={'name':['Unidentified Fossil','Rare Fossil']},optional=True)
 if n==50 and title=='Ambushing Spark':return bonus(100,cond('swsh12OpponentVstarUsed'))
 if n==55 and title=='Mystery Bolt':return seq(E('attackRequirement',condition=cond('sm12NoSupporterDiscard')),E('selectedDamage',target='opponentPokemon',amount=100))
 return _stage1_attack(row,a)

def ability(row,a):
 n=int(row[0]);title=a[0]
 if n==16 and title=='Elegant Heal':return activated(E('heal',target='selfAll',amount=20))
 if n==22 and title=='Heat Boost':return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={'kind':'energy','basicEnergy':True,'subtype':'Fire'},after=E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='turn',filter={'subtype':'Fire'})))
 if n==58 and title=='Transistor':return passive(E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='whileInPlay',filter={'stage':'Basic','subtype':'Lightning'}))
 return _stage1_ability(row,a)

def trainer(row):
 name=row[1]
 if name=='Serena':return 'Supporter',E('sm7Rule',rule='swsh12Serena')
 if name=='Brandon':return 'Supporter',E('sm7Rule',rule='swsh12Brandon')
 if name=='Candice':return 'Supporter',E('sm7Rule',rule='sm9TopPick',count=7,amount=7,filter={'anyOf':[{'kind':'pokemon','subtype':'Water'},{'kind':'energy','subtype':'Water','basicEnergy':True}]},destination='hand',rest='shuffle',optional=True)
 if name=='Capturing Aroma':return 'Item',E('coinFlip',heads=E('searchChosen',amount=1,filter={'kind':'pokemon','evolved':True}),tails=E('searchChosen',amount=1,filter={'kind':'pokemon','stage':'Basic'}))
 if name=='Gym Trainer':return 'Supporter',seq(E('draw',amount=2),E('draw',amount=2,condition=cond('koLastOpponentTurn'),optionalCondition=True))
 if name=='Primordial Altar':return 'Stadium',E('stadiumAction',effect=seq(E('inspectTop',side='self',amount=1),E('chooseOption',options=[{'label':'Keep top card','effect':E('noop')},{'label':'Discard top card','effect':E('discardTop',side='self',amount=1)}])))
 if name=='Gapejaw Bog':return 'Stadium',E('noop')
 return _stage1_trainer(row)
