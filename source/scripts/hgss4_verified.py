"""Source-locked HGSS Triumphant Stage 1, conservative executable rule mappings.
A printed clause without a verified mechanic GATES its entire print from decks/CPU.
This table is deliberate: it never silently substitutes a noop for a real action.
"""
import hgss1_verified as H
N=H.N; S=H.S; Q=H.Q; ST=H.ST; H_L=H.H; DISC=H.DISC
BONUS=H.BONUS; SEARCH=H.SEARCH; PICK=H.PICK; DRAW=H.DRAW
BENCH=H.BENCH; COIN=H.COIN; LOCK=H.LOCK; OPT=H.OPT
SWITCH=H.SWITCH; GUARD=H.GUARD

def status(name,target='opponentActive',amount=None):
 return {'type':'status','target':target,'status':name,**({'amount':amount} if amount is not None else {})}

def choice(label,e):
 return {'type':'chooseOption','options':[{'label':label,'effect':e},{'label':'Do not use','effect':N}]}

# Attack effects guaranteed by reused canonical shared-engine primitives.
ATTACKS={
 ('1','Second Strike'):BONUS(40,{'type':'opponentDamaged'}),
 ('1','Guard Claw'):GUARD(20),
 ('2','Stadium Power'):BONUS(30,{'type':'stadiumInPlay'}),
 ('4','Toxic Fang'):Q(status('poison',amount=20)),
 ('8','Ring of Fire'):S(ST('burn'),LOCK()),
 ('9','Sun Flash'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('11','Stun Spore'):Q(ST('paralysis')),
 ('12','Acidic Drain'):S(ST('burn'),ST('poison'),H_L(30)),
 ('19','Sand Impact'):{'type':'coinDamageByEnergy','amount':20,'energyType':'Fighting','countAttachedEnergyType':True,'mode':'add'},
 ('24','Fury Cutter'):{'type':'coinTierBonus','coins':3,'tiers':{'1':20,'2':40,'3':100}},
 ('42','Eruption'):{'type':'topDeckBothDiscardBonus','amount':20},
 ('44','Bone Impact'):S(BONUS(60,{'type':'stadiumInPlay'}),{'type':'discardStadium'}),
 ('48','Blizzard'):Q(BENCH(10,'opponent'),BENCH(10,'self')),
 ('55','Imitate'):{'type':'drawToHandSize','matchSide':'opponent'},
 ('83','Magnetic Bomb'):Q(BONUS(10),{'type':'selfDamage','amount':10}),
 ('16','Saliva Lure'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('16','Stick and Absorb'):S(H_L(30),LOCK()),
 ('18','Calming Wind'):{'type':'removeStatuses','target':'self','statuses':['burn','poison','sleep','paralysis','confusion']},
 ('21','Sparking Ball'):S(PICK(20),ST('sleep','self')),
 ('25','Selfdestruct'):S(BENCH(10,'self'),BENCH(10,'opponent')),
 ('26','Vital Throw'):choice('Add 20 damage and take 20 recoil',S(BONUS(20),{'type':'selfDamage','amount':20})),
 ('26','Hundred Furious Punches'):{'type':'energyDamage','source':'self','energyType':'Fighting','amount':10,'mode':'add'},
 ('28','Return'):{'type':'drawToHandSize','size':6},
 ('28','Prize Count'):BONUS(50,{'type':'ownPointsAtLeast','amount':1}), # gated below if condition not proven for printed comparison
 ('30','Strip Bare'):{'type':'allHeadsEffect','coins':2,'heads':{'type':'discardHand','target':'opponent','amount':'all'}},
 ('30','Rage'):{'type':'damageFromDamage','source':'self','amount':1,'mode':'add'},
 ('31','Underwater Dive'):S(Q(H_L(30)),Q(H_L(30))),
 ('31','Swallow Up'):BONUS(50,{'type':'opponentHpLess'}),
 ('32','Search and Invite'):SEARCH(2,kind='pokemon'),
 ('32','Slam'):COIN(2,40),
 ('33','Shock Bolt'):Q(t=DISC('all','self','Lightning')),
 ('34','Lightning Strike'):choice('Add 60 damage and discard all Lightning Energy',S(BONUS(60),DISC('all','self','Lightning'))),
 ('35','Sleep Poison'):S(ST('sleep'),ST('poison')),
 ('38','Licking Shot'):PICK(10),
 ('38','Stick and Absorb'):S(H_L(20),LOCK()),
 ('40','Knuckle Down'):{'type':'damageRule','ignoreEffects':True},
 ('41','Play with Fire'):S(ST('burn'),ST('sleep','self')),
 ('44','Bonemerang'):COIN(2,60),
 ('49','3-D Attack'):COIN(3,20),
 ('51','Hidden Power'):N,
 ('52','Double Attack'):{'type':'multiTargetDamage','target':'opponentPokemon','count':2,'amount':20},
 ('54','Shoot Through'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':10,'upTo':True},
 ('54','U-turn'):SWITCH(),
 ('56','Mountain Eater'):S({'type':'discardTop','side':'self','amount':1},H_L(20)),
 ('57','Inviting Scent'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('57','Careless Tackle'):{'type':'selfDamage','amount':10},
 ('58','Iron Defense'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('59','Focus Energy'):{'type':'nextAttackBonus','attackName':'Bite','amount':30},
 ('60','Bone Rush'):COIN('untilTails',20),
 ('61','Sand Veil'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('61','Mini Earthquake'):BENCH(10,'self'),
 ('64','Sweet Scent'):{'type':'heal','amount':30,'target':'selfPokemon'},
 ('66','Tongue Whip'):PICK(30,'opponentBench'),
 ('68','Magnetic Switch'):SWITCH(),
 ('69','Friend Search'):{'type':'selectTopToHand','count':5,'amount':1,'filter':{'kind':'pokemon'}},
 ('69','Double Kick'):COIN(2,20),
 ('71','Messenger'):SEARCH(1,kind='pokemon'),
 ('73','Recover'):S(DISC(1),H_L(40)),
 ('74','Tripping Headbutt'):Q(PICK(30)),
 ('76','Paralyzing Clamp'):{'type':'coinAttackGate','heads':ST('paralysis')},
 ('77','Sleep Pearl'):S(ST('sleep'),SWITCH()),
 ('78','Wing Flick'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('81','Leech Life'):{'type':'drain'},
 ('83','Magnetic Bomb'):Q(BONUS(10)),
 ('93','Gigashock'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':10,'upTo':True},
 ('98','Linear Attack'):PICK(40),
 ('98','Sonicboom'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True},
}
# Printed conditions/decisions requiring special work cannot be approximated.
for key in [('26','Vital Throw'),('28','Prize Count'),('30','Strip Bare'),('34','Lightning Strike'),('64','Sweet Scent')]:
 ATTACKS.pop(key,None)

ABILITIES={
 ('8','Fiery Spirit'):{'type':'passive','effect':{'type':'preventStatus','status':'confusion','scope':'self','duration':'whileInPlay'}},
 ('11','Poison Moth Wind'):{'type':'activated','oncePerTurn':True,'effect':Q(ST('poison'),ST('poison','self'))},
 ('12','Tangling Tendrils'):{'type':'passive','activeOnly':True,'effect':{'type':'modifier','stat':'retreatCost','amount':2,'duration':'whileInPlay','scope':'opponentActive'}},
 ('21','Sweet Sleeping Face'):{'type':'passive','effect':{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}},
 ('41','Sweet Sleeping Face'):{'type':'passive','effect':{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}},
 ('49','Mapping'):{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':SEARCH(1,kind='trainer',trainerType='Stadium')},
 ('51','CURE'):{'type':'triggered','event':'benched','fromHandOnly':True,'effect':{'type':'removeStatuses','target':'selfActive','statuses':['burn','poison','sleep','paralysis','confusion']}},
 ('84','Free Flight'):{'type':'passive','effect':{'type':'modifier','stat':'retreatCost','amount':-10,'scope':'self','duration':'whileInPlay','condition':{'type':'selfNoEnergy'}}},
}
TRAINERS={
 # None of these special cards receives a misleading generic substitute.
}

def attack(row,a):
 key=(str(row[0]),a[0]);effect=ATTACKS.get(key)
 if effect is not None:return effect
 # The fallback only matches a handful of exact, literal printed rules.
 return H.attack(['0',row[1]],a)

def ability(row,p):return ABILITIES.get((str(row[0]),p[0]))
