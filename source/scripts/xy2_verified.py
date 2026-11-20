"""XY Flashfire xy2 conservative, printed-effect mapping.

Every supported effect is an existing generic rule or an implemented xy2: action;
unknown effects are gated rather than silently replaced by noop.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD

E=lambda typ,**args:{'type':typ,**args}
R=lambda key:E('neoRule',rule='xy2:'+key)
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
ATTACKS={
 ('2','Harden'):R('harden'),
 ('3','Quiver Dance'):R('quiverDance'),
 ('5','Call for Family'):R('callForFamily1'),
 ('7','Deranged Dance'):R('derangedDance'),
 ('9','Whiplash'):R('whiplash'),
 ('10','Exciting Shake'):R('excitingShake'),('10','Prickly Needles'):R('pricklyNeedles'),
 ('61','Chip Off'):R('chipOff'),
 ('11','Stoke'):Q(R('stoke')),('11','Fire Blast'):DISC(),
 ('12','Combustion Blast'):E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='Combustion Blast'),
 ('13','Crimson Dive'):E('selfDamage',amount=50),
 ('14','Agility'):Q(E('preventDamage',target='self',duration='opponentTurn',effects=True)),
 ('15','Agility'):Q(E('preventDamage',target='self',duration='opponentTurn',effects=True)),
 ('15','Overrun'):E('benchDamage',side='opponent',count=1,amount=20),
 ('16','Flamethrower'):Q(t=DISC()),
 ('20','Scorching Fang'):R('scorchingFang'),
 ('21','Poison Sting'):ST('poison'),
 ('23','Energy Grace'):R('energyGrace'),
 ('25','Rest'):S(H(60),ST('sleep','self')),
 ('26','Powder Snow'):ST('sleep'),('26','Big Tusk'):R('bigTusk'),
 ('27','Heart Wink'):R('heartWink'),('27','Spike Draw'):DRAW(1),
 ('29','Rescue'):R('rescue'),('29','Screw Tail'):Q(R('opponentDiscardEnergy')),
 ('30','Stomp Off'):E('discardTop',side='opponent',amount=1),
 ('31','Frost Barrier'):GUARD(20),('31','Shatter'):E('discardStadium'),
 ('33','Electricounter'):R('electricounter'),
 ('34','Fang Snipe'):R('fangSnipe'),('34','Wild Charge'):E('selfDamage',amount=30),
 ('35','Dual Bullet'):E('multiTargetDamage',target='opponentPokemon',count=2,amount=50,activeWeaknessResistance=True),
 ('101','Dual Bullet'):E('multiTargetDamage',target='opponentPokemon',count=2,amount=50,activeWeaknessResistance=True),
 ('36','Destructive Beam'):Q(R('opponentDiscardEnergy')),
 ('37','Parabolic Charge'):SEARCH(2,kind='energy'),
 ('38','Revival'):R('revival'),('38','Sneaky Placement'):R('sneakyPlacement'),
 ('39','Cursed Drop'):R('cursedDrop'),
 ('40','Pain Pellets'):R('painPellets'),
 ('41','Triple Poison'):R('triplePoison'),('102','Triple Poison'):R('triplePoison'),
 ('41','Smash Uppercut'):E('damageRule',ignoreResistance=True),('102','Smash Uppercut'):E('damageRule',ignoreResistance=True),
 ('43','Ear Influence'):R('earInfluence'),('43','Psychic'):R('psychic'),
 ('45','Flail'):R('flail'),
 ('46','Double-Edge'):E('selfDamage',amount=20),
 ('47','Explosion'):E('selfDamage',amount=100),
 ('49','Rock Rush'):R('rockRush'),
 ('50','Flash Claw'):R('flashClaw'),
 ('52','Call for Family'):R('callForFamily2'),
 ('52','Claw Rend'):BONUS(30,{'type':'opponentDamaged'}),
 ('53','Smokescreen'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('55','Push Down'):E('forceOpponentSwitch',chooseBy='defender'),('55','Acid Spray'):Q(R('opponentDiscardEnergy')),
 ('57','Dark Clamp'):LOCK(),
 ('59','Corner'):LOCK(),
 ('60','Iron Crash'):R('ironCrash'),
 ('61','Chip Off'):R('chipOff'),
 ('62','Aromatherapy'):H(10,'selfAll'),
 ('65','Petal Blizzard'):BENCH(10),('66','Petal Blizzard'):BENCH(20),
 ('66','Brilliant Search'):SEARCH(3),
 ('68','Crystal Barrier'):Q(E('preventDamage',target='self',duration='opponentTurn',effects=True)),('68','Wonder Blast'):R('wonderBlast'),
 ('69','Wild Blaze'):E('discardTop',side='self',amount=5),('108','Wild Blaze'):E('discardTop',side='self',amount=5),
 ('70','Revenge'):R('revenge'),
 ('71','Poison Breath'):Q(ST('poison')),
 ('72','Gooey'):H(10),('73','Gooey'):H(30),('74','Heavy Whip'):Q(BONUS(40)),
 ('75','Peck Off'):R('peckOff'),
 ('76','Sand-Attack'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('77','Clutch'):LOCK(),('77','Strong Gust'):R('strongGust'),
 ('78','Triple Draw'):DRAW(3),('103','Triple Draw'):DRAW(3),
 ('79','Wham Bam Punch'):COIN('untilTails',30,False),('109','Wham Bam Punch'):COIN('untilTails',30,False),
 ('80','Sleepy Press'):S(H(20),ST('sleep','self')),
 ('82','Buried Treasure Hunt'):R('buriedTreasureHunt'),
 ('83','Powerful Friends'):R('powerfulFriends'),
 ('84','Bounce'):SWITCH(),
 ('85','Sitdown Bounce'):Q(t=E('lock',action='attack',target='self',duration='nextOwnTurn')),
 ('100','Stoke'):Q(R('stoke')),('100','Fire Blast'):DISC(),
 ('107','Crimson Dive'):E('selfDamage',amount=50),
}
# Number-specific aliases for the identical full-art prints.
for a,b in [('11','100'),('35','101'),('41','102'),('78','103'),('13','107'),('69','108'),('79','109')]:
 for (number,name),effect in list(ATTACKS.items()):
  if number==a:ATTACKS.setdefault((b,name),effect)

ABILITIES={
 'Adaptive Evolution':{'type':'passive','effect':R('adaptiveEvolution')},
 'Flower Veil':{'type':'passive','effect':R('flowerVeil')},
 'Stir and Snooze':{'type':'passive','effect':R('stirAndSnooze')},
 'Thorn Tempest':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':R('thornTempest')},
 'Intimidating Mane':{'type':'passive','effect':R('intimidatingMane')},
 'Poison Barrier':{'type':'passive','effect':R('poisonBarrier')},
 'Leaf Draw':{'type':'activated','oncePerTurn':True,'effect':R('leafDraw')},
 'Counterattack Quills':{'type':'triggered','event':'damagedByAttack','activeOnly':True,'opponentAttackOnly':True,'effect':R('counterattackQuills')},
 'Energy Grace':{'type':'activated','oncePerTurn':True,'effect':R('energyGrace')},
 'Shadow Void':{'type':'activated','oncePerTurn':False,'effect':R('shadowVoid')},
 'Gooey Regeneration':{'type':'activated','oncePerTurn':False,'effect':R('gooeyRegeneration')},
 'Big Jump':{'type':'activated','oncePerTurn':True,'effect':E('returnToHand',target='self',returnBasicEnergy=True)},
}
# Trainer effects must have a real player/CPU target-resolution route.
TRAINERS={
 '88':('Supporter',R('blacksmith')),
 '88a':('Supporter',R('blacksmith')),
 '89':('Item',R('fieryTorch')),
 '90':('Supporter',E('forceOpponentSwitch',chooseBy='attacker')),
 '91':('Stadium',N),
 '92':('Item',R('palPad')),
 '93':('Supporter',R('pokemonCenterLady')),
 '94':('Supporter',SEARCH(2,kind='pokemon',stage='Basic')),
 '95':('Tool',N),
 '96':('Item',R('sacredAsh')),
 '97':('Item',R('megaphone')),
 '98':('Item',R('trickShovel')),
 '99':('Item',R('ultraBall')),
 '104':('Supporter',E('forceOpponentSwitch',chooseBy='attacker')),
 '105':('Supporter',R('pokemonCenterLady')),
 '106':('Supporter',SEARCH(2,kind='pokemon',stage='Basic')),
}
GATE={
 '1':'Adaptive Evolution requires immediate evolution from hand on play and first turn.',
 '2':'Adaptive Evolution and first-turn special evolution timing.',
 '7':'Leaf Draw needs physical Grass hand discard and Ability activation.',
 '9':'Whiplash is repeat coin flips each requiring a chosen physical opposing Energy.',
 '10':'Exciting Shake changes next-turn Prickly Needles coin count.',
 '20':'Scorching Fang optional Fire discard/damage choice needs guaranteed attack UI.',
 '23':'Energy Grace needs a self-KO and exact 3 basic discarded Energy, then Prize timing.',
 '27':'Heart Wink needs opponent first-draw suppression for one turn.',
 '29':'Rescue chooses three Pokemon from discard and shuffles physical refs into deck.',
 '34':'Fang Snipe requires selecting a Trainer from revealed opposing hand.',
 '35':'Dual Bullet distributes 50 damage to exactly two selected opposing Pokemon.',
 '38':'Revival places a Basic Pokemon from opposing discard, respecting bench limit.',
 '39':'Cursed Drop distributes four exact damage counters on any opposing Pokemon.',
 '40':'Shadow Void needs repeatable moving allied damage onto Dusknoir and exact Pain Pellets target.',
 '43':'Ear Influence needs choosing and moving multiple counters on opposing board.',
 '49':'Rock Rush needs optional multiple physical Fighting hand discards and scaling damage.',
 '50':'Flash Claw needs opponent-owned card choice rather than automatic discard.',
 '60':'Thorn Tempest triggers on evolution from hand, with all opponent slots, before attack.',
 '61':'Chip Off is an opponent random-hand discard down to 4, preserving card UIDs.',
 '64':'Flower Veil increases maximum HP globally for Grass Pokémon.',
 '71':'Poison Barrier blocks retreat for every opponent Poisoned Pokémon.',
 '74':'Gooey Regeneration repeatable Energy-discard-to-heal action.',
 '80':'Stir and Snooze sleep check uses special two-coin between-turn rule.',
 '82':'Buried Treasure Hunt chooses two of top four physical cards and discards other two.',
 '85':'Big Jump returns whole evolution stack and attachments to hand.',
 '95':'Protection Cube needs suppression of own attack recoil damage, not opponent damage.',
 '101':'Dual Bullet distributes 50 damage to exactly two selected opposing Pokemon.',
 '98':'Trick Shovel requires own/opponent top-deck inspection and optional discard choice.',
}
# Explicit, static mechanics use global engine rules even though their
# passive effect descriptor has no standalone activation UI. In v0.69.326,
# active-only Poison Barrier retreat lock and Protection Cube recoil prevention
# are verified in real battle-state tests before removing their gates.
GATE.pop('98')
# Audited global mechanics, timed attacks, physical discard, and evolution-trigger effects.
for _audited in ('1','2','10','60','61','64','71','80','95',
 '7','9','20','21','23','27','29','34','35','38','39','40','43','49','50','74','82','85','101'):
 GATE.pop(_audited,None)

def attack(row,a):
 n,title=str(row[0]),a[0]
 if (n,title) in ATTACKS:return ATTACKS[n,title]
 txt=(a[3] or '').strip()
 if not txt:return N
 m=re.fullmatch(r'(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',txt)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage (?:times the number of heads|for each heads)\.',txt)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN('untilTails',int(m[1]),False)
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',txt)
 if m:return H(int(m[1]))
 if txt=='Your opponent\'s Active Pokémon is now Poisoned.':return ST('poison')
 if txt=='Your opponent\'s Active Pokémon is now Asleep.':return ST('sleep')
 if txt=='Your opponent\'s Active Pokémon is now Confused.':return ST('confusion')
 if txt=='Your opponent\'s Active Pokémon is now Paralyzed.':return ST('paralysis')
 if txt=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
 if txt=='This Pokémon does 20 damage to itself.':return E('selfDamage',amount=20)
 if txt=='This Pokémon does 30 damage to itself.':return E('selfDamage',amount=30)
 if txt=='This Pokémon does 100 damage to itself.':return E('selfDamage',amount=100)
 if txt=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if txt=='Discard an Energy attached to this Pokémon.':return DISC()
 if txt=='Your opponent switches his or her Active Pokémon with 1 of his or her Benched Pokémon.':return E('forceOpponentSwitch',chooseBy='defender')
 if txt=='Draw a card.':return DRAW(1)
 if txt=='Draw 3 cards.':return DRAW(3)
 if txt=='Your opponent\'s Active Pokémon is now Asleep.':return ST('sleep')
 if txt=='Flip a coin. If tails, this attack does nothing.':return E('coinAttackGate',heads=N)
 # Unsupported printable text is not guessed from older sets' collector IDs.
 return None
