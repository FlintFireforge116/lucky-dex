"""XY6 Roaring Skies: conservative, print-accurate stage-one battle effects.

Only effects backed by existing battle-engine descriptors are activated.
Unlike a catalogue import, Stage 1 does not pretend to support Delta traits,
new bench size rules, or new abilities. Those cards remain visible and gated.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw: {'type':t,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
ATTACKS={
 ('1','Loathe'):Q(SWITCH()),
 ('2','Shake It Off'):E('fieldCountDamage',side='opponent',filter={'subtype':'Colorless'},amount=20,mode='replace'),
 ('3','Flock'):E('benchFromDeck',amount=1,filter={'kind':'pokemon','name':'Wurmple'},choose=True),
 ('4','String Shot'):Q(ST('paralysis')),
 ('5','Whirlwind'):OPT('Have opponent switch their Active Pokémon',E('forceOpponentSwitch',chooseBy='defender')),
 ('6','Poison Sting'):ST('poison'),
 ('6','Iron Defense'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('7','Psybeam'):ST('confusion'),('7','Twilight Poison'):S(ST('sleep'),ST('poison')),
 ('9','Slight Intrusion'):E('selfDamage',amount=10),
 ('11','Hopeless Scream'):E('damageFromDamage',source='self',amount=5,mode='replace'),
 ('12','Stomp'):Q(BONUS(20)),
 ('13','Me First'):DRAW(1),('13','Psy Bolt'):Q(ST('paralysis')),
 ('15','Grand Loop'):S(DRAW(3),OPT('Switch this Pokémon with your Bench',SWITCH())),
 ('15','Brave Bird'):E('selfDamage',amount=20),
 ('16','Find Ice'):SEARCH(3,kind='energy',basicEnergy=True),
 ('19','Swallow'):E('drain'),('19','Water Pulse'):ST('sleep'),
 ('21','Thunder Wave'):Q(ST('paralysis')),('21','Big Explosion'):E('selfDamage',amount=60),
 ('22','Continuous Tumble'):COIN('untilTails',20),
 ('25','Random Spark'):E('selectedDamage',target='opponentPokemon',amount=30),
 ('26','Headlock'):Q(BONUS(30),ST('paralysis')),
 ('26','Voltage Rush'):E('selfDamage',amount=50),
 ('34','Swift Lunge'):OPT('Have opponent switch their Active Pokémon',E('forceOpponentSwitch',chooseBy='defender')),
 ('36','Stun Poison'):Q(S(ST('paralysis'),ST('poison'))),
 ('37','Rock Slide'):E('multiTargetDamage',target='opponentBench',count=2,amount=20,upTo=True),
 ('38','Sand Attack'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('39','Midair Strike'):Q(BONUS(40)),
 ('40','Mach Claw'):E('damageRule',ignoreResistance=True),
 ('41','Rip Off'):E('shuffleRandomHandCard',side='opponent'),('41','Psybeam'):Q(ST('confusion')),
 ('43','Sweet Kiss'):E('draw',side='opponent',amount=1),
 ('45','Powerful Slap'):E('coinDamageByEnergy',amount=50,countCards=True),
 ('45','Aura Sphere'):E('multiTargetDamage',target='opponentBench',count=1,amount=20,upTo=True),
 ('48','Play Rough'):Q(BONUS(20)),
 ('49','Slam'):COIN(2,20),('50','Shed Skin'):H(30),('50','Slam'):COIN(2,60),
 ('51','Mach Press'):E('allHeadsEffect',coins=2,heads=ST('paralysis')),
 ('54','Continuous Headbutt'):COIN('untilTails',30),
 ('55','Leer'):Q(ST('paralysis')),('55','Almost Flight'):E('selfDamage',amount=10),
 ('57','Shatter'):E('discardStadium'),
 ('57','Power Howl'):E('filteredHandCountDamage',side='opponent',filter={},amount=20,mode='replace'),
 ('57','Steam Blast'):DISC(3),
 ('61','Dragon Ascent'):DISC(2),
 ('62','Shred'):E('damageRule',ignoreEffects=True),
 ('63','Bright Wing'):DISC(1,'self','Fire'),
 ('66','Drill Run'):Q(DISC(1,'opponentActive')),
 ('67',"Feelin' Fine"):DRAW(1),('67','Fury Swipes'):COIN(3,20),
 ('68','Burrow'):E('discardTop',side='opponent',amount=1),
 ('69','Call for Family'):E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Basic'},choose=True),
 ('69','Blow Through'):BONUS(30,{'type':'stadiumInPlay'}),
 ('70','Double Peck'):COIN(2,10),
 ('71','Clutch'):LOCK(),('71','Aerial Ace'):Q(BONUS(30)),
 ('75','Intensifying Burn'):BONUS(50,{'type':'opponentEx'}),
 ('75','Dragon Pulse'):E('discardTop',side='self',amount=3),
 ('77','Sky Return'):E('returnToHand',target='self',returnBasicEnergy=True),
 ('79','Fly'):E('coinAttackGate',heads=E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('80','Quick Attack'):Q(BONUS(30)),
 ('82','Acrobatics'):COIN(2,10,False),
}
# Never use a generic attack if it does not implement the printed result.
# Explicit alternate artworks are the SAME physical attack text, but unique prints.
for original,alternate in [('26','98'),('34','99'),('35','100'),('58','101'),('59','102'),('62','103'),('75','104'),('76','105'),('77','77a'),('77','106')]:
 for (num,name),effect in list(ATTACKS.items()):
  if num==original:ATTACKS[(alternate,name)]=effect

# Effects of these Trainers are already supported by the shared engine.
# Spirit Links additionally require matching evolution IDs in battle-core.
TRAINERS={
 '83':('Tool',N), # Gallade Spirit Link
 '85':('Tool',N), # Latios Spirit Link
 '87':('Tool',N), # Rayquaza Spirit Link
 '88':('Item',E('benchFromDiscard',side='self',amount=1,filter={'kind':'pokemon','stage':'Basic'})),
 '90':('Supporter',S(SEARCH(1,kind='trainer',trainerType='Supporter'),SEARCH(1,kind='energy',basicEnergy=True))),
 '91':('Item',SWITCH()),
 '93':('Item',E('neoRule',rule='xy2:ultraBall')),
 '96':('Supporter',SEARCH(3,kind='pokemon',subtype='Colorless')),
 '108':('Supporter',SEARCH(3,kind='pokemon',subtype='Colorless')),
 '109':('Item',E('neoRule',rule='xy2:energySwitch')),
 '110':('Item',SEARCH(1,source='discard',kind='trainer',trainerType='Supporter')),
}
# Ancient Traits: for now, preserve every printed trait but gate its card.
# Special Energy's two-unit all-type conversion also requires a new energy hook.
TRAITS_IMPLEMENTED=set()
ABILITIES={}

def attack(row,a):
 num,title=str(row[0]),a[0];txt=(a[3] or '').strip()
 if (num,title) in ATTACKS:return ATTACKS[num,title]
 if not txt:return N
 m=re.fullmatch(r'(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',txt)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN('untilTails',int(m[1]))
 if txt=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if txt=='Discard an Energy attached to this Pokémon.':return DISC()
 if txt=='Discard the top card of your opponent\'s deck.':return E('discardTop',side='opponent',amount=1)
 if txt=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 if txt.startswith('This Pokémon does ') and txt.endswith(' damage to itself.'):
  m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',txt)
  if m:return E('selfDamage',amount=int(m[1]))
 return None
