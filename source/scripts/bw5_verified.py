"""Dark Explorers: printed-card mappings. Unknown nontrivial effects stay gated.
All `bw5:` rules have battle implementations or targeted tests before enabling.
"""
import re
import bw4_verified as B4
import bw3_verified as B3
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
R=lambda k:{'type':'neoRule','rule':'bw5:'+k}
OPT=lambda e,lab='Use the optional attack effect':{'type':'chooseOption','options':[{'label':lab,'effect':e},{'label':'Do not use','effect':N}]}
A={
 ('17','Blaze Kick'):Q(BONUS(30),ST('burn')),
 ('22','Burning Wind'):R('burningWind'),
 ('24','Lazy Headbutt'):ST('sleep','self'),
 ('60','Shadow Drain'):{'type':'drain'},
 ('64','Sand Dive'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn'}),
 ('68','Crushing Blow'):Q(DISC(1,'opponentActive')),
 ('76','Charge Beam'):Q(R('energyDiscardAttachSelf')),
 ('5','Lure Poison'):R('lurePoison'),
 ('5','Spit Squall'):R('spitSquall'),
 ('6','Energy Assist'):R('energyAssist'),
 ('8','Heavy Bullet'):Q({'type':'selectedDamage','target':'opponentBench','amount':20,'ignoreWeakness':True,'ignoreResistance':True}),
 ('11','Deck and Cover'):R('deckAndCover'),
 ('12','Sand-Attack'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('12','Fire Slash'):R('fireSlash'),
 ('13','Grand Flame'):R('fireDiscardAttach'),
 ('18','Flame Cloak'):Q(R('fireDiscardAttachSelf')),
 ('19','Hot Lick'):R('hotLick'),
 ('23','Big Yawn'):S(ST('sleep','self'),ST('sleep')),
 ('23','Shot in the Dark'):R('shotInDark'),
 ('25','Muddy Water'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':20,'upTo':True},
 ('26','Smash Turn'):OPT(SWITCH(),'Switch Kyogre-EX with a Benched Pokémon'),
 ('26','Dual Splash'):R('dualSplash'),
 ('29','Attack Command'):R('attackCommand'),
 ('30','Reflect Energy'):R('reflectEnergy'),
 ('36','Healing Dance'):H(30,'selfAll'),
 ('37','Electrigun'):R('electrigun'),
 ('38','Volt Bolt'):R('voltBolt'),
 ('39','Tag Draw'):R('tagDraw'),
 ('40','Negative Ion'):R('negativeIon'),
 ('40','Electrishower'):R('electrishower'),
 ('43','Electrisilk'):R('electrisilk'),
 ('44','Charge Beam'):Q(R('energyDiscardAttachSelf')),
 ('45','Spark'):{'type':'selectedDamage','target':'opponentBench','amount':10,'ignoreWeakness':True,'ignoreResistance':True},
 ('46','Shock Bolt'):B3.R('shockBolt'),
 ('47','Suction Heal'):{'type':'drain'},
 ('47','Slurp Shakedown'):R('slurpShakedown'),
 ('48','Psy Report'):{'type':'revealHand','side':'opponent'},
 ('49','Hand Press'):R('handPress'),
 ('51','Astonish'):Q(R('astonish')),
 ('52','Chuck'):R('chuck'),
 ('54','Tromp'):BENCH(10),
 ('54','Giant Claw'):R('giantClaw'),
 ('56','Tunnel Strike'):{'type':'selectedDamage','target':'opponentBench','amount':30,'ignoreWeakness':True,'ignoreResistance':True},
 ('56','Dig Uppercut'):R('digUppercut'),
 ('57','Reinforced Drill'):R('reinforcedDrill'),
 ('61','Shadow Shutdown'):R('shadowShutdown'),
 ('62','Junk Hunt'):R('junkHunt'),
 ('63','Night Spear'):{'type':'selectedDamage','target':'opponentBench','amount':30,'ignoreWeakness':True,'ignoreResistance':True},
 ('66','Bombast'):R('bombast'),
 ('69','Ascension'):R('ascension'),
 ('71','Brutal Bash'):R('brutalBash'),
 ('71','Dark Rush'):R('darkRush'),
 ('72','Fury Cutter'):R('furyCutter'),
 ('74','Joust'):{'type':'discardTool','target':'opponentActive','amount':1},
 ('74','Cavalry Lance'):R('cavalryLance'),
 ('77','Metal Blast'):{'type':'energyDamage','source':'self','energyType':'Metal','amount':20,'mode':'add'},
 ('77','Lock Gear'):R('lockGear'),
 ('81','Continuous Tumble'):COIN('untilTails',30),
 ('88','Special Fang'):R('specialFang'),
 ('88','Ferocious Bellow'):R('ferociousBellow'),
 ('89','Stunning Uppercut'):R('stunningUppercut'),
 ('90','Blow Through'):R('blowThrough'),
 ('90','Power Blast'):Q(t=DISC(1,'self')),
}
# Duplicate full-art EX effects keep exact printed identity.
for dst,src in [('103','13'),('104','26'),('105','38'),('106','54'),('107','63'),('108','90')]:
 for (num,title),eff in list(A.items()):
  if num==src:A[dst,title]=eff
A.update({
 ('103','Grand Flame'):R('fireDiscardAttach'),('104','Dual Splash'):R('dualSplash'),('105','Volt Bolt'):R('voltBolt'),
 ('106','Giant Claw'):R('giantClaw'),('107','Night Spear'):A['63','Night Spear'],
 ('108','Blow Through'):R('blowThrough'),('108','Power Blast'):A['90','Power Blast'],
 ('109','Mind Shock'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True},
 ('110','Rock Slide'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':10},
})
ABILITY={
 'Floral Fragrance':{'type':'activated','oncePerTurn':True,'effect':R('floralFragrance')},
 'Scorching Scales':{'type':'passive','effect':R('scorchingScales')},
 'Airhead':{'type':'passive','effect':R('airhead')},
 'Diving Draw':{'type':'activated','oncePerTurn':True,'effect':R('divingDraw')},
 'Solar Revelation':{'type':'passive','effect':R('solarRevelation')},
 'Ancient Scream':{'type':'passive','effect':R('ancientScream')},
 'Dark Cloak':{'type':'passive','effect':R('darkCloak')},
 'Softboiled':{'type':'activated','oncePerTurn':True,'effect':R('softboiled')},
 'Psychic Mirage':B4.ABILITY['Psychic Mirage'],
 'Ancient Power':B3.ABILITY['Ancient Power'],
}
TRAINERS={
 '91':('Supporter',DRAW(3)),
 '92':('Tool',R('darkClaw')),
 '93':('Item',R('darkPatch')),
 '94':('Item',R('enhancedHammer')),
 '95':('Supporter',R('hooligans')),
 '96':('Supporter',B3.R('n')),
 '97':('Item',R('oldAmber')),
 '98':('Supporter',R('juniper')),
 '99':('Item',R('randomReceiver')),
 '100':('Item',{'type':'rareCandy'}),
 '101':('Stadium',{'type':'stadiumAction','effect':R('twistMountain')}),
 '102':('Item',R('ultraBall')),
 '111':('Item',{'type':'forceOpponentSwitch','chooseBy':'attacker'}),
}
GATE={}
# Return None unless the printed semantics are supported. Never conceal unhandled
# attacks behind an unconditional noop.
def attack(row,a):
 n,title=str(row[0]),a[0];s=(a[3] or '').strip();eff=A.get((n,title));
 if eff:return eff
 if not s:return N
 m=re.fullmatch(r'The Defending Pokémon is now (Asleep|Paralyzed|Poisoned|Burned|Confused)\.',s)
 if m:return ST({'Asleep':'sleep','Paralyzed':'paralysis','Poisoned':'poison','Burned':'burn','Confused':'confusion'}[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Asleep|Paralyzed|Poisoned|Burned|Confused)\.',s)
 if m:return Q(ST({'Asleep':'sleep','Paralyzed':'paralysis','Poisoned':'poison','Burned':'burn','Confused':'confusion'}[m[1]]))
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',s)
 if m:return {'type':'selfDamage','amount':int(m[1])}
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',s)
 if m:return H(int(m[1]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',s)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',s)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip a coin\. If tails, this attack does nothing\.',s)
 if m:return {'type':'coinAttackGate','heads':N}
 m=re.fullmatch(r'This Pokémon can\'t use ([^.]+) during your next turn\.',s)
 if m:return {'type':'lock','action':'attack','attackName':m[1],'target':'self','duration':'nextOwnTurn'}
 if s=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 if s=="This attack's damage isn't affected by Weakness or Resistance.":return {'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}
 if s=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 if s=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 if s=="Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.":return {'type':'forceOpponentSwitch','chooseBy':'defender'}
 if s=='Discard an Energy attached to this Pokémon.':return DISC(1,'self')
 if s=='Discard all Lightning Energy attached to this Pokémon.':return B3.R('shockBolt')
 if s=='This attack does 10 damage to each of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)':return BENCH(10)
 if s=='Flip a coin until you get tails. This attack does 20 more damage for each heads.':return {'type':'coinDamage','coins':'untilTails','amount':20,'mode':'add'}
 return None
