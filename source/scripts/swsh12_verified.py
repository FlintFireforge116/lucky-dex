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
