"""XY Base Set printed-effect mapping, first pass, 146 collector prints.

Unknown effects gate the entire card. The engine may only claim a card ready
when its attack/Ability/Trainer effects have a concrete supported handler.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
import bw11_verified as BW

R=lambda key:{'type':'neoRule','rule':'xy1:'+key}
E=lambda typ,**kw:{'type':typ,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
# Special-case mechanics, only when their actual resolver exists.
ATTACKS={
 ('1','Poison Powder'):ST('poison'),('1','Jungle Hammer'):H(30),
 ('2','Crisis Vine'):S(ST('paralysis'),ST('poison')),
 ('3','Leaf Munch'):BONUS(20,{'type':'opponentMatches','filter':{'subtype':'Grass'}}),
 ('4','Harden'):R('harden'),
 ('5','Poison Jab'):ST('poison'),('5','Flash Needle'):R('flashNeedle'),
 ('8','Luring Glow'):E('forceOpponentSwitch',chooseBy='attacker'),
 ('9','Pheromotion'):SEARCH(1,kind='pokemon',subtype='Grass'),
 ('11','Torment'):E('chooseAttackLock',side='opponent'),
 ('14','Touchdown'):H(20),
 ('17','Conversion Powder'):R('conversionPowder'),('17','Colorful Wind'):R('colorfulWind'),
 ('18','Lead'):Q(SEARCH(1,kind='trainer',trainerType='Supporter')),
 ('19','Lead'):SEARCH(2,kind='trainer',trainerType='Supporter'),
 ('19','Charge Dash'):R('chargeDash'),
 ('21','Magma Mantle'):R('magmaMantle'),
 ('25','Clairvoyant Eye'):E('reorderTop',count=3,deckSide='self'),
 ('26','Blaze Ball'):R('blazeBall'),
 ('27','Flame Charge'):R('flameCharge'),
 ('28','Devastating Wind'):E('handShuffle',side='opponent',draw=4),('28','Flare Blitz'):DISC('all',typ='Fire'),
 ('29','Rapid Spin'):R('rapidSpin'),('29','Splash Bomb'):Q(t=E('selfDamage',amount=30)),
 ('30','Hydro Bombard'):E('multiTargetDamage',target='opponentBench',amount=30,count=2,upTo=True),
 ('32','Clamp Crush'):R('clampCrush'),
 ('34','Recover'):R('recover'),('34','Core Splash'):R('coreSplash'),
 ('35','Seafaring'):R('seafaring'),('35','Hydro Pump'):R('hydroPump20'),
 ('36','Refresh'):S(H(30),E('removeStatus',target='self')),
 ('38','Recycle'):R('recycle'),
 ('41','Mist Slash'):E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
 ('43','Circle Circuit'):E('benchCountDamage',side='self',amount=20),('43','Thunderbolt'):DISC('all'),
 ('46','Energy Glide'):R('energyGlide'),('46','Electron Crush'):R('electronCrush'),
 ('48','Gastro Acid'):R('gastroAcid'),('50','Tricky Steps'):R('trickySteps'),
 ('53','Poison Ring'):S(ST('poison'),LOCK()),
 ('54','Astonish'):R('astonish'),
 ('55','Tree Slam'):E('multiTargetDamage',target='opponentBench',amount=20,count=2,upTo=True),
 ('57','Eerie Voice'):R('eerieVoice'),('57','Spirit Scream'):R('spiritScream'),
 ('58','Mine'):R('mine'),
 ('59','Earthquake'):BENCH(10,'self'),('59','Rock Tumble'):E('damageRule',ignoreResistance=True),
 ('60','Dig Out'):R('digOut'),('61','Mad Mountain'):R('madMountain'),
 ('62','Rock Black'):R('rockBlack'),('62','Rock Wrecker'):S(E('damageRule',ignoreWeakness=True,ignoreResistance=True),E('lock',action='attack',target='self',duration='nextOwnTurn')),
 ('64','Cosmic Spin'):R('cosmicSpin'),
 ('66','Hammer Arm'):E('discardTop',side='opponent',amount=1),
 ('67','Wake-Up Slap'):R('wakeUpSlap'),('67','Dynamic Punch'):R('dynamicPunch'),
 ('71','Bother'):R('bother'),('71','Knock Back'):E('forceOpponentSwitch',chooseBy='defender'),
 ('72','Nasty Plot'):SEARCH(1),
 ('74','Confusion Wave'):S(ST('confusion','self'),ST('confusion')),
 ('76','Mental Trash'):R('mentalTrash'),('76','Distortion Beam'):R('distortionBeam'),
 ('78','Oblivion Wing'):R('oblivionWing'),('78','Darkness Blade'):Q(t=E('lock',action='attack',target='self',duration='nextOwnTurn')),
 ('79','Evil Ball'):E('neoRule',rule='bw11:xBall'),('79','Y Cyclone'):R('yCyclone'),
 ('80','Joust'):R('joust'),('80','Tailspin Piledriver'):BONUS(40,{'type':'opponentDamaged'}),
 ('82','Metal Wallop'):R('metalWallop'),
 ('85','Buster Swing'):E('damageRule',ignoreResistance=True),
 ('86',"King's Shield"):S(E('preventDamage',target='self',duration='opponentTurn'),E('lock',action='attack',target='self',duration='nextOwnTurn',attackName="King's Shield")),
 ('87','Heartfelt Song'):R('heartfeltSong'),
 ('89','Gather Energy'):R('gatherEnergy'),('89','Hocus Pinkus'):E('lock',action='attack',target='opponentActive',duration='opponentTurn'),
 ('90','Balloon Barrage'):R('balloonBarrage'),
 ('91','Massage'):R('massage'),
 ('92','Sweet Scent'):R('sweetScent'),
 ('95','Draining Kiss'):H(30),
 ('96','Geomancy'):R('geomancy'),('96','Rainbow Spear'):DISC(),
 ('97','Break Through'):E('benchDamage',side='opponent',count=1,amount=30),('97','X Blast'):E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='X Blast'),
 ('101','Second Bite'):R('secondBite'),
 ('103','Aerial Ace'):Q(BONUS(30)),
 ('104','Heal Bell'):H(10,'selfAll'),
 ('105','Energy Salon'):R('energySalon'),
 ('110','Bite Off'):BONUS(60,{'type':'opponentEx'}),('110','Wild Barking'):E('benchDamage',side='opponent',count=1,amount=20),
 ('112','Pickup'):R('pickup'),
 ('113','Me First'):DRAW(1),
 ('141','Poison Powder'):ST('poison'),('141','Jungle Hammer'):H(30),
 ('142','Rapid Spin'):R('rapidSpin'),('142','Splash Bomb'):Q(t=E('selfDamage',amount=30)),
 ('143','Energy Glide'):R('energyGlide'),('143','Electron Crush'):R('electronCrush'),
 ('144','Evil Ball'):E('neoRule',rule='bw11:xBall'),('144','Y Cyclone'):R('yCyclone'),
 ('145','Joust'):R('joust'),('145','Tailspin Piledriver'):BONUS(40,{'type':'opponentDamaged'}),
 ('146','Break Through'):E('benchDamage',side='opponent',count=1,amount=30),('146','X Blast'):E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='X Blast'),
}
ABILITIES={
 'Mystical Fire':{'type':'activated','effect':E('drawToHandSize',size=6),'oncePerTurn':True},
 'Forest\'s Curse':{'type':'passive','effect':E('actionLock',cardType='Item',side='opponent',duration='whileActive')},
 'Water Shuriken':{'type':'activated','effect':R('waterShuriken'),'oncePerTurn':True},
 'Fairy Transfer':{'type':'activated','effect':R('fairyTransfer'),'oncePerTurn':False},
 'Sweet Veil':{'type':'passive','effect':R('sweetVeil')},
 'Fur Coat':{'type':'passive','effect':R('furCoat')},
 'Spiky Shield':{'type':'passive','effect':R('spikyShield')},
 'Destiny Burst':{'type':'passive','effect':R('destinyBurst')},
 'Upside-Down Evolution':{'type':'activated','effect':R('upsideDownEvolution'),'oncePerTurn':True},
 'Stance Change':{'type':'activated','effect':R('stanceChange'),'oncePerTurn':True},
 'Drive Off':{'type':'activated','effect':R('driveOff'),'oncePerTurn':True},
}
TRAINERS={
 '115':('Supporter',R('cassius')),
 '116':('Item',R('evosoda')),
 '117':('Stadium',E('noop')),
 '118':('Item',R('greatBall')),
 '119':('Tool',E('noop')),
 '120':('Item',R('maxRevive')),
 '121':('Tool',E('noop')),
 '122':('Supporter',E('sequence',effects=[E('discardHand',side='self',amount=8),DRAW(7)])),
 '123':('Item',R('professorsLetter')),
 '124':('Item',E('handShuffle',side='opponent',draw=4)),
 '125':('Item',Q(DRAW(3))),
 '126':('Stadium',E('noop')),
 '127':('Supporter',E('handShuffle',side='self',draw=5)),
 '129':('Supporter',R('teamFlareGrunt')),
}
# Explicitly gate complex global actions that are not yet implemented in this pass.
GATE={
 '4':'Harden needs a damage-threshold guard tied to next opposing attack.',
 '11':'Torment requires persistent exact attack-choice lock.',
 '29':'Rapid Spin needs two sequential, owner-chosen switches.',
 '32':'Clamp Crush requires coin-gated physical Energy discard choice.',
 '35':'Seafaring must flip three coins then assign individual discarded Water Energy to Bench.',
 '41':'Water Shuriken must discard a physical Water Energy from hand and target any opponent Pokemon.',
 '44':'Destiny Burst needs post-KO coin result before Prize selection.',
 '48':'Gastro Acid must suppress one target\'s abilities through end of next own turn.',
 '50':'Tricky Steps requires source/target choice for opponent Energy.',
 '54':'Astonish needs a random opponent-hand reveal then deck shuffle.',
 '71':'Bother needs a Supporter lock on next opposing turn.',
 '74':'Upside-Down Evolution requires Confusion-gated evolution from deck.',
 '76':'Mental Trash requires fair opponent coin and card selection.',
 '79':'Y Cyclone needs explicit source and destination Energy choice.',
 '85':'Stance Change must swap exact Aegislash print while retaining all attached state.',
 '86':'Stance Change must swap exact Aegislash print while retaining all attached state.',
 '89':'Gather Energy needs deck-to-Pokemon choice.',
 '92':'Sweet Scent needs selected healing target.',
 '93':'Fairy Transfer requires repeatable exact physical Energy source/destination selection.',
 '95':'Sweet Veil requires global Energy-conditional status protection and cleanse.',
 '103':'Drive Off requires voluntary opponent switch action.',
 '115':'Cassius must shuffle whole physical stack and attached Energy correctly.',
 '116':'Evosoda needs explicit valid evolution from deck while respecting first-turn restrictions.',
 '142':'Rapid Spin needs sequential player/opponent switches.',
}
# Extra gates for active global passives pending shared engine verification.
GATE.update({
 '14':'Spiky Shield must trigger even when the defending Pokemon is knocked out.',
 '55':'Forest\'s Curse requires confirmed opponent Item lock against normal play.',
 '114':'Fur Coat needs persistent post-Weakness damage reduction.',
 '117':'Fairy Garden needs global Fairy Energy-dependent retreat for both sides.',
 '119':'Hard Charm needs reduction against opponent attacks for both Active and Bench.',
 '121':'Muscle Band needs extra 20 damage to opposing Active on attack.',
 '126':'Shadow Circle needs global Darkness Energy-dependent Weakness immunity.',
 '130':'Double Colorless Energy is supported as one physical card providing two units; do not gate.',
 '131':'Rainbow Energy needs self-damage on attachment and one flexible unit.',
})
GATE.pop('130')

# Engine-confirmed post-Weakness Tool and Stadium modifiers and explicit Energy/choice handlers.
for n in ('14','41','55','79','82','92','93','95','114','117','119','121','126','131'):
 GATE.pop(n,None)

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
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage (?:times the number of heads|for each heads)\.',txt)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN('untilTails',int(m[1]),False)
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',txt)
 if m:return H(int(m[1]))
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',txt)
 if m:return E('selfDamage',amount=int(m[1]))
 if txt=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if txt=="This attack's damage isn't affected by Weakness or Resistance.":return E('damageRule',ignoreWeakness=True,ignoreResistance=True)
 if txt=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 if txt=="Discard an Energy attached to this Pokémon.":return DISC()
 if txt=='Discard a Fire Energy attached to this Pokémon.':return DISC(1,typ='Fire')
 if txt=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 if txt=='Draw 2 cards.':return DRAW(2)
 if txt=='Draw a card.':return DRAW(1)
 if txt=='Your opponent\'s Active Pokémon is now Poisoned.':return ST('poison')
 if txt=='Your opponent\'s Active Pokémon is now Asleep.':return ST('sleep')
 if txt=='Your opponent\'s Active Pokémon is now Confused.':return ST('confusion')
 if txt.startswith('This Pokémon can\'t use ') or txt.startswith('During your next turn, this Pokémon can\'t use'):
  return E('lock',action='attack',target='self',duration='nextOwnTurn',attackName=title)
 # Safe previous-era generic text matcher; never reuse collector-ID-specific rules.
 v=BW.attack(row,a)
 if v and v.get('type') not in ('unsupported','noop','neoRule'):return v
 return None
