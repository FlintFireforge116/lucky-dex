"""Primal Clash (XY5) strict Stage 1 battle effect mapping.

Only reuse engine descriptors with proven semantics. Ancient Traits, Primal-specific
turn timing, and effectful cards with no correct handler remain out of battles.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw:{'type':t,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
ATTACKS={
 ('1','Multiply'):E('benchFromDeck',amount=1,filter={'kind':'pokemon','name':'Weedle'}),
 ('3','Twineedle'):COIN(2,50),
 ('4','Absorb'):H(20),('5','Mega Drain'):H(20),('5','Grass Knot'):E('retreatCostDamage',amount=10,mode='add'),
 ('6','Quick Attack'):Q(BONUS(10)),('7','Agility'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('9','Leaf Blade'):Q(BONUS(30)),('9','Power Poison'):S(DISC(),ST('poison')),
 ('12','Solar Ray'):H(20,'selfAll'),
 ('14','Spiral Gyration'):S(ST('confusion'),SWITCH()),('14','Air Slash'):DISC(),
 ('15','Spore'):ST('sleep'),('16','Dynamic Punch'):Q(S(BONUS(20),ST('confusion'))),
 ('17','Acrobatics'):COIN(2,20,False),('17','Pester'):BONUS(30,{'type':'opponentStatus'}),
 ('19','Dark Forest'):LOCK(),('19','Wood Blast'):E('energyDamage',source='self',energyType='Grass',amount=20,mode='add'),
 ('20','Roar'):E('forceOpponentSwitch',chooseBy='defender'),('21','Flickering Flames'):ST('sleep'),
 ('22','Grass Fire'):DISC(1,'opponentActive','Grass'),
 ('23','Flame Burst'):E('multiTargetDamage',target='opponentBench',count=2,amount=20,upTo=True),('23','Flamethrower'):DISC(),
 ('24','Indomitable Blaze'):BONUS(60,{'type':'opponentEx'}),
 ('25','Ember'):Q(t=DISC(1,typ='Fire')),
 ('27','Quick Attack'):Q(BONUS(20)),('28','Heat Blow'):DISC(),('29','Tumbling Attack'):Q(BONUS(30)),
 ('30','Bubble'):Q(ST('paralysis')),
 ('31','Knockout Needle'):E('allHeadsEffect',coins=2,heads=BONUS(40)),
 ('32','Lunge'):E('coinAttackGate',heads=N),('34','Endeavor'):COIN(2,20,False),
 ('35','Water Arrow'):E('selectedDamage',target='opponentPokemon',amount=60),
 ('36','Hydro Pump'):E('energyDamage',source='self',energyType='Water',amount=30,mode='add'),
 ('37','Splash Dance'):E('nextAttackBonus',attackName='Splash Dance',amount=60),
 ('38','High Breaching'):ST('sleep','self'),
 ('40','Rising Lunge'):Q(BONUS(30)),
 ('41','Earthquake'):BENCH(20,'self'),
 ('42','Knock Off'):E('discardHand',side='opponent',amount=1),
 ('43','Float On'):Q(t=E('selfDamage',amount=10)),
 ('45','Ball Roll'):COIN('untilTails',30),
 ('47','Freezing Headbutt'):Q(ST('paralysis')),
 ('48','Knock Over'):OPT('Discard the Stadium in play',E('discardStadium')),
 ('48','Frozen Splash'):BONUS(70,{'type':'opponentMatches','filter':{'subtype':'Fighting'}}),
 ('50','Powerful Storm'):E('energyDamage',source='self',all=True,amount=20,mode='replace'),
 ('50','Crunch'):Q(DISC(1,'opponentActive')),
 ('51','Captivate'):E('forceOpponentSwitch',chooseBy='attacker'),
 ('51','Psychic'):E('energyDamage',source='opponent',amount=10,mode='add'),
 ('52','Psy Bolt'):Q(ST('paralysis')),
 ('53','Spring Tides'):COIN('untilTails',30),('53','Ocean Cyclone'):BENCH(10,'opponent'),
 ('54','Water Pulse'):ST('sleep'),
 ('55','Tidal Storm'):E('neoRule',rule='xy5:tidalStorm'),
 ('86','Gaia Volcano'):E('neoRule',rule='xy5:gaiaVolcano'),
 ('56','Deep Sea Swirl'):E('handShuffle',draw=6),('56','Life Saver'):SEARCH(2,source='discard',kind='pokemon',subtype='Water'),
 ('58','Dive'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('58','Take Down'):E('selfDamage',amount=20),
 ('60','Thunder Fang'):Q(ST('paralysis')),
 ('61','Lightning Turn'):SWITCH(),
 ('62','Water Splash'):Q(BONUS(10)),('63','Buzz Flip'):COIN(4,30),
 ('64','Thrash'):Q(BONUS(20),E('selfDamage',amount=20)),
 ('68','Double Kick'):COIN(2,40),('69','Poison Jab'):ST('poison'),('69','Dynamite Punch'):E('selfDamage',amount=20),
 ('70','Lost in the Waves'):E('returnToHand',target='self',returnBasicEnergy=True),
 ('81','Yoga Kick'):E('damageRule',ignoreWeakness=True,ignoreResistance=True),
 ('72','Dancing Tentacles'):S(ST('confusion'),ST('poison')),
 ('72','Stick and Absorb'):S(H(30),LOCK()),
 ('74','Take Down'):E('selfDamage',amount=10),('75','Take Down'):E('selfDamage',amount=10),
 ('76','Stone Edge'):Q(BONUS(40)),('77','Hammer Arm'):E('discardTop',side='opponent',amount=1),
 ('78','Stiffen'):GUARD(40),('83','Solar Generator'):SEARCH(2,kind='energy',specialEnergy=True),('84','Rock Smash'):Q(BONUS(20)),('84','Break Ground'):BENCH(10,'self'),
 ('85','Rip Claw'):Q(DISC(1,'opponentActive')),
 ('88','Double-Edge'):E('selfDamage',amount=20),('89','Fury Swipes'):COIN(3,10),
 ('91','Jagged Fang'):S(DISC(),DISC(1,'opponentActive')),
 ('93','Steel Headbutt'):Q(BONUS(30)),('93','Raging Hammer'):E('damageFromDamage',source='self',amount=1),
 ('95','Triple Smash'):COIN(3,30),('95','Reinforced Nose'):BONUS(50,{'type':'selfHasTool'}),
 ('96','Drill Run'):Q(DISC(1,'opponentActive')),
 ('100','Protect Charge'):GUARD(20),('101','Lock Up'):LOCK(),
 ('103','Bubble Beam'):Q(ST('paralysis')),
 ('103','Superpower'):OPT('Do 30 more damage and 30 self-damage',S(BONUS(30),E('selfDamage',amount=30))),
 ('104','Dwindling Wave'):E('selfDamagePenalty',amount=1),
 ('104','Tail Rap'):COIN(2,30),
 ('105','Life Leap'):E('drain'),
 ('105','Shining Wind'):E('weaknessGuard',duration='opponentTurn'),
 ('106','Brilliant Arrow'):E('neoRule',rule='xy5:brilliantArrow'),
 ('94','Megaton Slam'):E('neoRule',rule='xy5:megatonSlam'),
 ('107','Shred'):E('damageRule',ignoreEffects=True),
 ('109','Sand Attack'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('110','Sand Tomb'):LOCK(),
 ('111','Sand Attack'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('112','Fury Swipes'):COIN(3,30),('112','Dash Attack'):E('multiTargetDamage',target='opponentBench',count=1,amount=30,upTo=True),
 ('113','Charm'):E('modifier',stat='damageReduction',amount=20,scope='opponentActive',duration='opponentTurn'),
 ('114','Play Rough'):Q(BONUS(30)),
 ('115','Staggering Steps'):Q(ST('confusion'),ST('confusion','self')),
 ('115','Uproar'):S(BONUS(10),BENCH(10,'opponent')),
 ('116','Scrunch'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('118','Yawn'):ST('sleep'),('118','Continuous Headbutt'):COIN('untilTails',80),
 ('117','Drench'):BONUS(20,{'type':'selfHasEnergyType','energyType':'Water'}),
 ('119','Derail'):E('neoRule',rule='xy5:derail'),
 ('121','Rototiller'):E('neoRule',rule='xy5:rototiller'),
 ('120','Trip Over'):Q(BONUS(30)),
 ('121','Burrow'):E('discardTop',side='opponent',amount=1),
}
# Alternate-art prints carry the same effects as their regular prints.
for original,alternate in [('19','145'),('29','146'),('38','147'),('54','148'),('55','149'),('85','150'),('86','151'),('91','152'),('93','153'),('94','154'),('105','155'),('106','156')]:
 for (n,name),eff in list(ATTACKS.items()):
  if n==original:ATTACKS[(alternate,name)]=eff

# Stage 1 enables only a proven subset of Trainer effects; complex exact
# choice, event, Stadium, Spirit Link, and Special Energy rules remain gated.
TRAINERS={
 '125':('Item',SEARCH(1,kind='pokemon',subtype='Water')),
 '127':('Item',E('neoRule',rule='bw8:escapeRope')),
 '129':('Item',H(20,'selfAll')),
 '134':('Supporter',Q(E('handShuffle',draw=7),E('handShuffle',draw=4))),
 '135':('Item',E('rareCandy')),
 '162':('Item',E('neoRule',rule='xy4:enhancedHammer')),
 '163':('Item',SWITCH()),
}
# Spirit Links have genuine Tool placement, with matching Mega/Primal
# turn-ending exception enforced by shared core evolution code.
for n in ('123','130','131','132'):
 TRAINERS[n]=('Tool',E('noop'))
# Retrieval searches real physical discard refs, not new Energy from Zone.
# Recover real printed Basic Energy cards from physical discard first, or
# choose the separately tracked discarded Basic Energy Zone by type.
TRAINERS['126']=('Item',E('energyRetrieval',amount=2,energyCardIds={
 'Grass':'dp1-123','Fire':'dp1-124','Water':'dp1-125','Lightning':'dp1-126',
 'Psychic':'dp1-127','Fighting':'dp1-128','Darkness':'dp1-129','Metal':'dp1-130',
 'Fairy':'xy1-140'}))
# Weakness Policy must remain gated until the damage engine reads it.
TRAITS_IMPLEMENTED={'Ω Barrage','α Growth','α Recovery'}
ABILITIES={
 'Water Veil':{'type':'triggered','event':'energyAttached','fromHandOnly':True,
   'effect':E('removeStatuses',target='self',statuses=['poison','burn','sleep','paralysis','confusion'])},
 'Barrier Shrine':{'type':'passive','effect':E('noop')},
 'Rock Wall':{'type':'passive','effect':E('noop')},
 'Miracle Guard':{'type':'passive','effect':E('noop')},
 'Sap Sipper':{'type':'passive','effect':E('noop')},
 'Nurture and Heal':{'type':'activated','oncePerTurn':True,'effect':E('neoRule',rule='xy5:nurtureHeal')},
 'Captivating Rhythm':{'type':'activated','oncePerTurn':True,'effect':E('neoRule',rule='xy5:captivatingRhythm')},
 'Diving Search':{'type':'activated','oncePerTurn':True,'effect':E('neoRule',rule='xy5:divingSearch')},
 'Sparkling Ripples':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('neoRule',rule='xy5:sparklingRipples')},
 'Energy Connect':{'type':'activated','oncePerTurn':False,'effect':E('neoRule',rule='xy5:energyConnect')},
 'Unruly Claw':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':E('neoRule',rule='xy5:unrulyClaw')},
 'Sand Flap':{'type':'activated','oncePerTurn':True,'effect':E('neoRule',rule='xy5:sandFlap')},
}
# Rough Seas is a once-per-turn Stadium action for either side.
TRAINERS['137']=('Stadium',E('stadiumAction',effect=E('heal',target='selfAll',amount=30,filter={'subtype':['Water','Lightning']})))
TRAINERS['138']=('Stadium',E('stadiumAction',effect=E('neoRule',rule='xy5:scorchedEarth')))
TRAINERS['122']=('Item',E('neoRule',rule='xy5:acroBike'))
TRAINERS['136']=('Item',E('neoRule',rule='xy5:repeatBall'))
# Shrine of Memories, Silent Lab and Weakness Policy use global battle hooks.
TRAINERS['139']=('Stadium',E('noop'))
TRAINERS['140']=('Stadium',E('noop'))
TRAINERS['142']=('Tool',E('noop'))
TRAINERS['164']=TRAINERS['142']
TRAINERS['159']=TRAINERS['134'];TRAINERS['161']=TRAINERS['125']
# Existing combat engine supports Item/Supporter, but not an Ancient Trait
# action queue or the three new Primal Spirit Links. Explicitly exclude them.
GATE={}

def attack(row,a):
 key=(str(row[0]),a[0]); t=(a[3] or '').strip()
 if key in ATTACKS:return ATTACKS[key]
 if not t:return N
 m=re.fullmatch(r"(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r"Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r"Flip a coin\. If heads, this attack does (\d+) more damage\.",t)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r"Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.",t)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r"Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.",t)
 if m:return COIN('untilTails',int(m[1]))
 if t=='Flip a coin. If tails, this attack does nothing.':return E('coinAttackGate',heads=N)
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.?',t)
 if m:return H(int(m[1]))
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',t)
 if m:return E('selfDamage',amount=int(m[1]))
 if t=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if t=='Discard an Energy attached to this Pokémon.':return DISC()
 if t=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 return None
