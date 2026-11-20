"""Dragons Exalted: printed effect mappings. Unimplemented effects must remain gated.
The game uses a 30-card physical deck plus a distinct Basic Energy Zone; cards
asking for *discard* or *hand* Energy cannot mint new Energy Zone entries.
"""
import re
import bw1_verified as B1
import bw3_verified as B3
import bw4_verified as B4
import bw5_verified as B5
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
R=lambda key:{'type':'neoRule','rule':'bw6:'+key}
A={
 ('3','Acrobatics'):COIN(2,30,False),
 ('4','Whirlwind'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('5','Agility'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('6','Sleep Poison'):Q(S(ST('sleep'),ST('poison'))),
 ('7','Harden'):R('harden'),
 ('8','Triple Energy'):R('tripleEnergy'),
 ('8','Drainpour'):H(40,'selfBench'),
 ('9','Tangle Drag'):{'type':'forceOpponentSwitch','chooseBy':'attacker'},
 ('10','Dig'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('11','Night Slash'):{'type':'chooseOption','options':[{'label':'Switch Ninjask with a Benched Pokémon','effect':SWITCH()},{'label':'Stay Active','effect':N}]},
 ('12','Relaxing Fragrance'):S(H(30),{'type':'removeStatus','target':'self'}),
 ('15','Squeeze'):Q(S(BONUS(20),ST('paralysis'))),
 ('16','Reinforced Needle'):R('reinforcedNeedle'),
 ('19','Hexed Flame'):R('hexedFlame'),
 ('21','Flame Screen'):{'type':'modifier','target':'self','stat':'damageReduction','amount':20,'duration':'opponentTurn'},
 ('22','Rainbow Burn'):R('rainbowBurn'),
 ('23','Soggy Rush'):COIN('untilTails',10),
 ('24','Swing Around'):COIN(2,30,False),
 ('26','Water Cannon'):R('waterCannon'),
 ('27','Add-a-Dash'):R('addADash'),
 ('28','Clear Search'):SEARCH(3),
 ('29','Unstoppable Roll'):R('unstoppableRoll'),
 ('31','Ice Entomb'):S(ST('paralysis'),{'type':'lock','action':'attack','attackName':'Ice Entomb','target':'self','duration':'nextOwnTurn'}),
 ('36','Echoed Voice'):B4.R('echoedVoice'),
 ('38','Thunder Jolt'):R('thunderJolt'),
 ('101',"Smack ‘n' Slack"):ST('sleep','self'),
 ('38','Cotton Guard'):{'type':'modifier','target':'self','stat':'damageReduction','amount':20,'duration':'opponentTurn'},
 ('39','Cotton Guard'):{'type':'modifier','target':'self','stat':'damageReduction','amount':20,'duration':'opponentTurn'},
 ('40','Electrobullet'):{'type':'selectedDamage','target':'opponentBench','amount':20,'ignoreWeakness':True,'ignoreResistance':True},
 ('43','Energy Crush'):R('energyCrush'),
 ('43','Flash Impact'):R('flashImpact'),
 ('44','Energy Assist'):R('energyAssist'),
 ('45','Call for Family'):{'type':'benchFromDeck','amount':2,'filter':{'stage':'Basic'}},
 ('46','Replace'):R('replace'),
 ('47','Hazardous Scales'):S(ST('sleep'),ST('burn'),ST('poison')),
 ('48','Cursed Drop'):R('cursedDrop'),
 ('49','Sneaky Placement'):{'type':'selectedDamage','target':'opponentPokemon','amount':10,'ignoreWeakness':True,'ignoreResistance':True},
 ('51','Shadow Steal'):R('shadowSteal'),
 ('51','Plentiful Placement'):{'type':'selectedDamage','target':'opponentPokemon','amount':40,'ignoreWeakness':True,'ignoreResistance':True},
 ('52','Psychic'):{'type':'energyDamage','source':'opponent','amount':10,'mode':'add'},
 ('55','Future Sight'):{'type':'reorderTop','count':5,'deckSide':'self'},
 ('57','Doom Decree'):R('doomDecree'),
 ('57','Black Magic'):{'type':'benchCountDamage','side':'opponent','amount':20,'mode':'add'},
 ('59','Devolution Punch'):{'type':'devolve','target':'opponentActive'},
 ('59','Ghost Hammer'):{'type':'weaknessGuard','target':'self','duration':'opponentTurn'},
 ('61','Vortex Chop'):R('vortexChop'),
 ('63','Reverse Spin'):R('reverseSpin'),
 ('64','Rapid Spin'):R('rapidSpin'),
 ('66','Rock Cannon'):COIN('untilTails',30),
 ('66','Earthquake'):BENCH(10,'self'),
 ('67','Revenge Cannon'):R('revengeCannon'),
 ('68','Squeeze'):Q(S(BONUS(20),ST('paralysis'))),
 ('68','Superpower'):R('superpower'),
 ('69','Defensive Stance'):S(H(30),SWITCH()),
 ('69','Karate Chop'):R('karateChop'),
 ('70','Muddy Water'):{'type':'selectedDamage','target':'opponentBench','amount':20,'ignoreWeakness':True,'ignoreResistance':True},
 ('71','Pump-up Smash'):R('pumpUpSmash'),
 ('73','Whirlwind'):{'type':'chooseOption','options':[{'label':'Make opponent switch Active','effect':{'type':'forceOpponentSwitch','chooseBy':'defender'}},{'label':'Leave opponent Active','effect':N}]},
 ('73','Diving Swipe'):{'type':'discardHand','side':'opponent','amount':1,'random':True},
 ('77','Smogscreen'):S(ST('poison'),{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'}),
 ('79','Wreak Havoc'):R('wreakHavoc'),
 ('80','Giga Horn'):R('gigaHorn'),
 ('81','Triple Laser'):R('tripleLaser'),
 ('82','Magnetic Lines'):R('magneticLines'),
 ('82','Heavy Nose'):BONUS(30,{'type':'opponentDamaged'}),
 ('83','Pull Out'):R('pullOut'),
 ('83','Iron Head'):COIN('untilTails',30),
 ('85','Celestial Roar'):R('celestialRoar'),
 ('85','Dragon Burst'):R('dragonBurst'),
 ('87','Sand-Attack'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('88','Shred'):{'type':'damageRule','ignoreEffects':True},
 ('90','Mach Cut'):{'type':'discardEnergyCard','target':'opponentActive','specialOnly':True,'amount':1},
 ('90','Dragonblade'):{'type':'discardTop','amount':2,'side':'self'},
 ('92','Shred'):{'type':'damageRule','ignoreEffects':True},
 ('92','Dragon Pulse'):{'type':'discardTop','amount':3,'side':'self'},
 ('94','Guard Press'):{'type':'modifier','target':'self','stat':'damageReduction','amount':10,'duration':'opponentTurn'},
 ('96','Draw In'):R('drawIn'),
 ('97','Dragonblast'):{'type':'discardEnergyCard','target':'self','amount':2,'energyType':'Darkness','strictEnergyType':True},
 ('98','Consume'):{'type':'drain'},
 ('100','Hand Fling'):{'type':'handCountDamage','amount':10,'mode':'replace'},
 ('103','Crushing Blow'):{'type':'discardEnergyCard','target':'opponentActive','amount':1},
 ('106','Bang Heads'):S(ST('confusion','self'),ST('confusion')),
 ('107','Amnesia'):{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},
 ('107','Tumbling Tackle'):S(ST('sleep','self'),ST('sleep')),
 ('108','Wake-up Beam'):{'type':'removeStatus','target':'opponentActive'},
 ('110','Gold Breaker'):R('goldBreaker'),
 ('111','Chirp'):R('chirp'),
 ('119','Rainbow Burn'):R('rainbowBurn'),
 ('120','Replace'):R('replace'),
 ('121','Pump-up Smash'):R('pumpUpSmash'),
 ('122','Triple Laser'):R('tripleLaser'),
 ('123','Celestial Roar'):R('celestialRoar'),
 ('123','Dragon Burst'):R('dragonBurst'),
 ('124','Shred'):{'type':'damageRule','ignoreEffects':True},
 ('124','Dragon Pulse'):{'type':'discardTop','amount':3,'side':'self'},
 ('125','Leaf Tornado'):R('leafTornado'),
 ('126','Psywave'):{'type':'energyDamage','source':'opponent','amount':10,'mode':'add'},
 ('127','Bombast'):B5.R('bombast'),
 ('128','Dragon Pulse'):{'type':'discardTop','amount':2,'side':'self'},
 ('128','Shred'):{'type':'damageRule','ignoreEffects':True},
}
ABILITY={
 'Leave It to the Wind':{'type':'activated','oncePerTurn':True,'effect':{'type':'returnToHand','target':'self','includeAttachments':True}},
 'Cast-off Shell':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':R('castOffShell')},
 'Le Parfum':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':SEARCH(1)},
 'Bright Look':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':{'type':'forceOpponentSwitch','chooseBy':'attacker'}},
 'Rebirth':{'type':'activated','oncePerTurn':True,'fromDiscard':True,'effect':R('rebirth')},
 'Electromagnetic Wall':{'type':'triggered','event':'opponentEnergyAttached','opponentOnly':True,'fromHandOnly':True,'activeOnly':True,'effect':R('electromagneticWall')},
 'Versatile':{'type':'passive','effect':R('versatile')},
 'Empty Shell':{'type':'passive','effect':{'type':'koPointBonus','amount':-1}},
 'Safeguard':{'type':'passive','effect':R('safeguard')},
 'Garbotoxin':{'type':'passive','effect':R('garbotoxin')},
 'Toppling Wind':{'type':'triggered','event':'evolved','fromHandOnly':True,'effect':{'type':'discardTop','amount':3,'side':'opponent'}},
 'Fight Song':{'type':'passive','effect':R('fightSong')},
 'Dragon Call':{'type':'activated','oncePerTurn':True,'effect':R('dragonCall')},
 'Dark Trance':{'type':'activated','oncePerTurn':False,'effect':R('darkTrance')},
 'Unobservant':{'type':'passive','effect':R('unobservant')},
 'Bouffer':{'type':'passive','effect':R('bouffer')},
 'Royal Heal':B1.ABILITY['Royal Heal'],
 'Damage Swap':B1.ABILITY['Damage Swap'],
}
TRAINERS={
 '113':('Item',{'type':'devolutionSpray'}),
 '114':('Tool',R('giantCape')),
 '115':('Tool',R('rescueScarf')),
 '116':('Item',R('toolScrapper')),
}
GATE={}

def attack(row,a):
 n,title=str(row[0]),a[0];s=(a[3] or '').strip()
 if (n,title) in A:return A[n,title]
 if not s:return N
 if s in ('The Defending Pokémon is now Asleep.','The Defending Pokémon is now Burned.','The Defending Pokémon is now Poisoned.','The Defending Pokémon is now Paralyzed.','The Defending Pokémon is now Confused.'):
  return ST({'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}[s.split()[-1][:-1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',s)
 if m:return Q(ST({'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',s)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',s)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',s)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',s)
 if m:return {'type':'selfDamage','amount':int(m[1])}
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',s)
 if m:return H(int(m[1]))
 if s=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
 if s=='Discard an Energy attached to this Pokémon.':return {'type':'discardEnergyCard','target':'self','amount':1}
 if s=="This attack's damage isn't affected by Weakness or Resistance.":return {'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}
 if s=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 if s=="This attack's damage isn't affected by any effects on the Defending Pokémon.":return {'type':'damageRule','ignoreEffects':True}
 m=re.fullmatch(r'Flip a coin\. If heads, discard an Energy attached to the Defending Pokémon\.',s)
 if m:return Q(DISC(1,'opponentActive'))
 m=re.fullmatch(r'This Pokémon can\'t use ([^.]+) during your next turn\.',s)
 if m:return {'type':'lock','target':'self','action':'attack','attackName':m[1],'duration':'nextOwnTurn'}
 if s=='During your opponent\'s next turn, any damage done to this Pokémon by attacks is reduced by 20 (after applying Weakness and Resistance).':return {'type':'modifier','target':'self','stat':'damageReduction','amount':20,'duration':'opponentTurn'}
 if s=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 return None
