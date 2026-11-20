"""Next Destinies: print-matched effect definitions; unsupported cards gated."""
import re
import bw3_verified as B3
import bw2_verified as B2
import bw1_verified as B1
from hgss1_verified import N,S,Q,ST,H as HEAL,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
R=lambda key:{'type':'neoRule','rule':'bw4:'+key}
CARD_DISC=lambda count=1,energy=None:{'type':'discardEnergyCard','amount':count,'target':'self',**({'energyType':energy,'strictEnergyType':True} if energy else {})}
A={
 ('1','Power Pinch'):R('powerPinch'),
 ('4','Draining Cut'):S(COIN(2,40),{'type':'drain'}),
 ('5','Synthesis'):R('synthesis'),('5','Revenge Blast'):R('revengeBlast'),
 ('7','Stadium Drain'):R('stadiumDrain'),
 ('8','Find a Friend'):Q(SEARCH(1,kind='pokemon')),
 ('10','Stoke'):Q(R('stoke')),
 ('12','Fire Spin'):Q(t=CARD_DISC(2)),
 ('13','Crunch'):Q(DISC(1,'opponentActive')),
 ('14','Fire Blast'):CARD_DISC(1,'Fire'),
 ('16','Stadium Burn'):R('stadiumBurn'),
 ('19','Ember'):Q(t=CARD_DISC(1)),
 ('20','Flame Burst'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':30},
 ('20','Inferno'):S(CARD_DISC('all'),ST('burn')),
 ('21','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
 ('21','Blue Flare'):CARD_DISC(2,'Fire'),
 ('22','Brave Fire'):Q(t={'type':'selfDamage','amount':50}),
 ('23','Recover'):S(CARD_DISC(1),HEAL(999)),
 ('24','Swift'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},
 ('25','Call for Family'):{'type':'benchFromDeck','amount':2,'filter':{'stage':'Basic'}},
 ('26','Water Arrow'):{'type':'selectedDamage','target':'opponentPokemon','amount':20,'ignoreWeakness':True,'ignoreResistance':True},
 ('29','Stadium Wave'):R('stadiumWave'),
 ('30','Bared Fangs'):R('baredFangs'),
 ('33','Crushing Ice'):R('crushingIce'),
 ('35','Vengeful Wish'):R('vengefulWish'),
 ('36','Sniffle'):R('sniffle'),
 ('37','Daunt'):R('daunt'),
 ('38','Frozen Wings'):R('frozenWings'),('38','Hail Blizzard'):{'type':'lock','action':'attack','attackName':'Hail Blizzard','target':'self','duration':'nextOwnTurn'},
 ('41','Random Spark'):{'type':'selectedDamage','target':'opponentPokemon','amount':50,'ignoreWeakness':True,'ignoreResistance':True},
 ('46','Flash Impact'):R('flashImpact'),('46','Crunch'):Q(DISC(1,'opponentActive')),
 ('48','Disconnect'):{'type':'actionLock','cardType':'Item','duration':'opponentTurn'},
 ('48','Lightning Crash'):R('lightningCrash'),
 ('53','Toxic Secretion'):{'type':'status','status':'poison','target':'opponentActive','amount':20},
 ('54','X Ball'):R('xBall'),('54','Psydrive'):CARD_DISC(1),
 ('60','Synchrodraw'):R('synchrodraw'),('60','DarMAXitan'):R('darmaxitan'),
 ('62','Brain Control'):R('brainControl'),
 ('64','Aura Sphere'):{'type':'selectedDamage','amount':20,'target':'opponentBench','ignoreWeakness':True,'ignoreResistance':True},
 ('65','Sand Jet'):{'type':'selectedDamage','amount':20,'target':'opponentBench','ignoreWeakness':True,'ignoreResistance':True},
 ('66','Sand Bazooka'):R('sandBazooka'),
 ('68','Haul In'):R('haulIn'),('68','Meditate'):R('meditate'),
 ('70','Dark Penalty'):R('darkPenalty'),
 ('71','Surprise Punch'):R('surprisePunch'),
 ('72','Whirlwind'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('74','Hammer Kick'):R('hammerKick'),
 ('76','Oracle Inflict'):R('oracleInflict'),
 ('79','Round'):R('round'),
 ('81','Nasty Plot'):SEARCH(1),('81','Shadow Claw'):R('shadowClaw'),
 ('82','Giga Power'):R('gigaPower'),('82','Raging Hammer'):{'type':'damageFromDamage','source':'self','amount':1},
 ('83','Scout'):{'type':'revealHand','side':'opponent'},
 ('84','Call for Family'):{'type':'benchFromDeck','amount':1,'filter':{'stage':'Basic'}},
 ('85','Echoed Voice'):R('echoedVoice'),
}
# Preserve independent EX full-art card IDs with identical rules.
for dst,src in [('94','5'),('95','22'),('96','38'),('97','51'),('98','54'),('99','82')]:
 for (n,title),eff in list(A.items()):
  if n==src:A[dst,title]=eff
A.update({
 ('51','Strong Volt'):CARD_DISC(2),
 ('56','Psychic'):{'type':'energyDamage','source':'opponent','amount':10,'mode':'add'},
 ('59','Fluffy Dream'):ST('sleep','self'),
 ('57','Mind Shock'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True},
 ('98','Psydrive'):CARD_DISC(1),
 ('95','Brave Fire'):Q(t={'type':'selfDamage','amount':50}),
 ('96','Frozen Wings'):R('frozenWings'),('96','Hail Blizzard'):{'type':'lock','action':'attack','attackName':'Hail Blizzard','target':'self','duration':'nextOwnTurn'},
 ('100','Heat Crash'):N,
 ('101','Eerie Glow'):S(ST('burn'),ST('confusion')),
 ('102','Nasty Plot'):SEARCH(1),('102','Foul Play'):{'type':'copyAttack','source':'opponentActive','ignoreUseCosts':True},
 ('103','Berserker Blade'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':40},
 ('5','Revenge Blast'):R('revengeBlast'),('94','Revenge Blast'):R('revengeBlast'),
 ('50','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
 ('50','Bolt Strike'):{'type':'selfDamage','amount':40},
 ('97','Strong Volt'):CARD_DISC(2),
})
ABILITY={
 'Sporprise':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':R('sporprise')},
 'Blazing Mane':{'type':'triggered','event':'damagedByAttack','opponentAttackOnly':True,'activeOnly':True,'effect':ST('burn','opponentActive')},
 'Slippery Soles':{'type':'activated','oncePerTurn':True,'effect':R('slipperySoles')},
 'Psychic Mirage':{'type':'passive','effect':R('psychicMirage')},
 'Forewarn':{'type':'activated','oncePerTurn':True,'effect':R('forewarn')},
 'Reflexive Retaliation':{'type':'triggered','event':'damagedByAttack','opponentAttackOnly':True,'activeOnly':True,'effect':R('retaliation')},
 'Giant Fan':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':R('giantFan')},
 'Heal Block':{'type':'passive','effect':{'type':'healingBlock','scope':'both'}},
 'Smooth Coat':{'type':'passive','effect':R('smoothCoat')},
 'Inferno Fandango':B1.ABILITY['Inferno Fandango'],
 'Cursed Shadow':B3.ABILITY['Cursed Shadow'],
 'Dark Aura':B3.ABILITY['Dark Aura'],
}
TRAINERS={
 '86':('Supporter',R('cilan')),
 '87':('Tool',R('expShare')),
 '88':('Item',R('heavyBall')),
 '89':('Item',R('levelBall')),
 '90':('Stadium',{'type':'stadiumAction','effect':R('pokemonCenter')}),
 '91':('Stadium',R('skyarrowBridge')),
}
# The Tool activation needs a pre-KO transfer hook; leave it out of generated decks until verified.
GATE={}
def attack(row,a):
 n,title=str(row[0]),a[0];text=a[3].strip()
 if (n,title) in A:return A[n,title]
 if not text:return N
 if text=='Draw 3 cards.':return DRAW(3)
 if text=='The Defending Pokémon is now Asleep.':return ST('sleep')
 if text=='The Defending Pokémon is now Burned.':return ST('burn')
 if text=='The Defending Pokémon is now Confused.':return ST('confusion')
 if text=='The Defending Pokémon is now Poisoned.':return ST('poison')
 if text=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
 if text=='Heal 30 damage from this Pokémon.':return HEAL(30)
 if text=='Heal 40 damage from this Pokémon.':return HEAL(40)
 if text=='This Pokémon does 10 damage to itself.':return {'type':'selfDamage','amount':10}
 if text=='This Pokémon does 20 damage to itself.':return {'type':'selfDamage','amount':20}
 if text=='This Pokémon does 60 damage to itself.':return {'type':'selfDamage','amount':60}
 if text=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 if text=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 if text=='Flip a coin. If heads, discard an Energy attached to the Defending Pokémon.':return Q(DISC(1,'opponentActive'))
 if text=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 if text=='Discard an Energy attached to this Pokémon.':return CARD_DISC(1)
 if text=='Discard 2 Energy attached to this Pokémon.':return CARD_DISC(2)
 if text=='Discard a Fire Energy attached to this Pokémon.':return CARD_DISC(1,'Fire')
 if text=='Discard 2 Fire Energy attached to this Pokémon.':return CARD_DISC(2,'Fire')
 if text=='This Pokémon can\'t use Hail Blizzard during your next turn.':return {'type':'lock','action':'attack','attackName':'Hail Blizzard','target':'self','duration':'nextOwnTurn'}
 if text=='The Defending Pokémon is now Asleep.':return ST('sleep')
 if text=='The Defending Pokémon is now Confused.':return ST('confusion')
 if text=='Flip a coin. If heads, the Defending Pokémon is now Asleep.':return Q(ST('sleep'))
 if text=='Flip a coin. If heads, the Defending Pokémon is now Paralyzed.':return Q(ST('paralysis'))
 if text=='Flip a coin. If heads, the Defending Pokémon is now Confused.':return Q(ST('confusion'))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',text)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) (?:damage )?times the number of heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',text)
 if m:return S(COIN(int(m[1]),int(m[2]),False))
 m=re.fullmatch(r'Flip a coin\. If tails, this Pokémon does (\d+) damage to itself\.',text)
 if m:return Q(t={'type':'selfDamage','amount':int(m[1])})
 for mod in [B3.attack,B2.attack,B1.attack]:
  try:eff=mod(row,a)
  except (ValueError,TypeError,KeyError,AttributeError):eff=None
  if eff is not None:return eff
 return None
