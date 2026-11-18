"""Conservative *printed-text* rule mapping for Platinum—Arceus.

Never mark a print usable when part of an attack/Power is unimplemented.
Each fallback is explicit; none of the non-empty unknown text becomes a noop.
"""
import re
from pl4_completion import ATTACKS as COMPLETION_ATTACKS, ABILITIES as COMPLETION_ABILITIES, TRAINERS as COMPLETION_TRAINERS
N={'type':'noop'}
def S(*items):return {'type':'sequence','effects':list(items)}
def Q(heads=None,tails=None):return {'type':'coinFlip',**({'heads':heads} if heads else {}),**({'tails':tails} if tails else {})}
def ST(status):return {'type':'status','target':'opponentActive','status':status}
def COIN(n,amount,replace=False):return {'type':'coinDamage','coins':n,'amount':amount,**({'mode':'replace'} if replace else {})}
def DRAW(n):return {'type':'draw','amount':n}
def DISC(target='self',energy=None,amount=1):return {'type':'discardEnergyCard','target':target,'amount':amount,**({'energyType':energy,'strictEnergyType':True} if energy else {})}
def HEAL(n,target='self'):return {'type':'heal','amount':n,'target':target}
def BENCH(n,side='opponent'):return {'type':'benchDamage','amount':n,'side':side,'all':True}
def PICK(n,target='opponentPokemon'):return {'type':'selectedDamage','target':target,'amount':n,'ignoreWeakness':True,'ignoreResistance':True}
def SEARCH(amount=1,source='deck',**filter):return {'type':'searchChosen','source':source,'amount':amount,'filter':filter}
STATUS={'Paralyzed':'paralysis','Asleep':'sleep','Poisoned':'poison','Burned':'burn','Confused':'confusion'}
SPECIAL={
 ('1','Burning Tail'):DISC('self','Fire'),
 ('3','Fire Fang'):ST('burn'),
 ('4','Rock Slide'):None, # Two distinct bench targets, no duplicate targeting
 ('7','Top Chop'):DRAW(1),
 ('7','Tumbling Attack'):COIN(1,30),
 ('10','Leaf Guard'):{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'opponentTurn'},
 ('11','Corner'):{'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'},
 ('14','Antigravity'):{'type':'modifier','stat':'retreatCost','amount':-10,'scope':'self','duration':'nextTurn'},
 ('15','Worry Seed'):Q(ST('confusion')),
 ('17','Sharpshooting'):PICK(40),
 ('17','Poison Jab'):ST('poison'),
 ('18','Avalanche'):Q(BENCH(10)),
 ('19','Rock Tumble'):{'type':'damageRule','ignoreResistance':True},
 ('20','Push Out'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('21','Hover Heal'):{'type':'removeStatuses','target':'self'},
 ('22','Swift'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},
 ('24','Water Pulse'):ST('sleep'),
 ('25','Baby Steps'):None, # top-5 ordered physical-card choice
 ('26','Ambush'):COIN(1,40),
 ('27','Thunder Blast'):DISC('self','Lightning'),
 ('28','Rising Lunge'):COIN(1,20),
 ('30','Poison Claws'):ST('poison'),
 ('31','Dual Cut'):COIN(2,70,True),
 ('33','Wide Laser'):None, # 10 to Active and Bench; no damage twice
 ('34','Speed Dive'):N,
 ('35','Slam'):COIN(2,30,True),
 ('36','Lick'):Q(ST('paralysis')),
 ('36','Night Shade'):PICK(10,'opponentBench'),
 ('37','Double-edge'):{'type':'selfDamage','amount':10},
 ('38','Detect'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('39','Quick Attack'):COIN(1,10),
 ('40','Endure'):None, # one-turn survive-and-10-HP rule differs from prevention
 ('41','Tongue Spring'):PICK(20),
 ('42','Shadow Bind'):{'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'},
 ('46','Combustion'):N,
 ('47','Searing Flame'):ST('burn'),
 ('47','Flare'):N,
 ('48','Scrunch'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn'}),
 ('49','Magical Needle'):None, # Must choose exactly one damaged Benched target
 ('50','Hang Down'):N,
 ('51','Cloak Shard'):None, # bench target + conditional type
 ('52','Super Singe'):Q(ST('burn')),
 ('53','Fury Attack'):COIN(3,30,True),
 ('54','Hypnosis'):Q(ST('sleep')),
 ('55','Bunny Hop'):None, # undamaged-only target restriction
 ('59','Call for Friends'):SEARCH(1,kind='pokemon',stage='Basic',subtype='Fire'),
 ('61','Astonish'):None, # concealed selection and exact shuffled physical ref
 ('62','Thunder Jolt'):Q(tails={'type':'selfDamage','amount':10}),
 ('65','Stone Barrage'):{'type':'coinUntilTailsDamage','amount':10},
 ('66','Collect'):DRAW(1),
 ('68','Sand Attack'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('69','Knock Away'):COIN(1,10),
 ('70','Collect'):DRAW(3),
 ('70','Tickle'):Q(ST('paralysis')),
 ('72','Stomp'):COIN(1,20),
 ('73','Lunge'):{'type':'coinAttackGate','heads':N},
 ('74','Swagger'):Q(DISC('opponentActive')),
 ('75','Ice Breath'):Q(ST('paralysis')),
 ('75','Double Headbutt'):COIN(2,20,True),
 ('76','Absorb'):HEAL(10),
 ('76','Sleep Powder'):ST('sleep'),
 ('77','Collect'):DRAW(1),
 ('77','Stun Spore'):Q(ST('paralysis')),
 ('78','Tail Crush'):COIN(1,10),
 ('80','Slashing Strike'):None, # Fixed named-attack lock, not a choice
 ('95','Meteor Blast'):None, # tails changes base damage BEFORE modifiers
 ('96','Psychic Bolt'):S(DISC('self','Lightning'),DISC('self','Psychic')),
 ('98','Steam Blast'):DISC('self'),
 ('SH10','Dragon Rage'):None, # Both coins must be heads
 ('SH11','Blue Fire'):DISC('self','Fire',amount='all'),
 ('SH12','Payback'):None, # exact opponent Prize conditional
 ('AR1','Prize Count'):None,
 ('AR2','Leaf Refresh'):HEAL(30,'selfBenchAll'),
 ('AR3','Bright Flame'):Q(tails=DISC('self',amount=2)),
 ('AR4','Fastwave'):{'type':'damageRule','ignoreResistance':True,'ignoreEffects':True},
 ('AR5','Ripple Swell'):None, # 6 Arceus in play cannot fit default 3-Bench format
 ('AR5','Sky Spear'):None, # all physical Energy to Lost Zone, not discard
 ('AR6','Lightning Turn'):{'type':'switch','side':'self'},
 ('AR7','Mind Bend'):ST('confusion'),
 ('AR8','Break Ground'):BENCH(10,'self'),
 ('AR9','Metal Barrier'):None, # LV.X-only prevention, not blanket protection
}

def attack(c,a):
 key=(str(c['number']),a['name'])
 if key in COMPLETION_ATTACKS:return COMPLETION_ATTACKS[key]
 if key in SPECIAL:return SPECIAL[key]
 txt=(a.get('text') or '').strip()
 if not txt:return N
 m=re.fullmatch(r'The Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',txt)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',txt)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does \d+ damage plus (\d+) more damage\.',txt)
 if m:return COIN(1,int(m[1]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),True)
 if txt=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 if txt=="The Defending Pokémon can't retreat during your opponent's next turn.":return {'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'}
 if txt=='This attack\'s damage isn\'t affected by Resistance.':return {'type':'damageRule','ignoreResistance':True}
 if txt=='This attack\'s damage isn\'t affected by Weakness or Resistance.':return {'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}
 m=re.fullmatch(r'Draw (a card|\d+ cards)\.',txt)
 if m:return DRAW(1 if m[1]=='a card' else int(m[1].split()[0]))
 m=re.fullmatch(r'Flip a coin\. If heads, discard an Energy card attached to the Defending Pokémon\.',txt)
 if m:return Q(DISC('opponentActive'))
 m=re.fullmatch(r'Discard a (Fire|Water|Grass|Lightning|Psychic|Fighting|Darkness|Metal) Energy (?:card )?attached to '+re.escape(c['name'])+r'\.',txt)
 if m:return DISC('self',m[1])
 m=re.fullmatch(r'(.+) does (\d+) damage to itself\.',txt)
 if m and m[1]==c['name']:return {'type':'selfDamage','amount':int(m[2])}
 m=re.fullmatch(r'Flip a coin\. If tails, '+re.escape(c['name'])+r' does (\d+) damage to itself\.',txt)
 if m:return Q(tails={'type':'selfDamage','amount':int(m[1])})
 return None

def ability(c,p):
 key=(str(c['number']),p['name'])
 if key in COMPLETION_ABILITIES:return COMPLETION_ABILITIES[key]
 # Explicitly block every unverified passive/Poké-Power. Even a correctly
 # displayed Poké-Body must never silently do nothing in a live match.
 if p['name']=='Baby Evolution':return {'type':'activated','printedPowerType':'power','oncePerTurn':True,'disabledByStatus':True,'effect':{'type':'neoRule','rule':'dp1:babyEvolve','targetName':'Pikachu'}}
 return None

TRAINERS={
 '82':('Item',SEARCH(1,kind='pokemon',name='Arceus')),
 '85':('Supporter',SEARCH(3,kind='trainer',trainerType='Tool')),
 # Fossil-print Poké-Powers/reaction triggers are not covered by plain playFossil.
}

TRAINERS.update(COMPLETION_TRAINERS)
