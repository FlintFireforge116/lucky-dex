"""Emerging Powers — literal card-text effects, unverified mechanics gated.
Source: PokemonTCG/pokemon-tcg-data cards/en/bw2.json, preserved in bw2-print-compact.json.
"""
import re
import hgss1_verified as H
N,S,Q,ST,HEAL,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD=H.N,H.S,H.Q,H.ST,H.H,H.DISC,H.COIN,H.SEARCH,H.PICK,H.BENCH,H.BONUS,H.SWITCH,H.DRAW,H.LOCK,H.GUARD
R=lambda k:{'type':'neoRule','rule':'bw2:'+k}
A={
 ('2','Fire\'s Power'):R('firePower'),
 ('7','Nurturing'):R('nurturing'),
 ('10','Cotton Guard'):GUARD(10),
 ('61','Crunch'):Q(DISC(1,'opponentActive')),
 ('68','Rear Guard'):GUARD(30),
 ('11','Helping Hand'):R('helpingHand'),
 ('11','Cotton Guard'):GUARD(30),
 ('12','Encore'):R('encore'),
 ('12','U-turn'):SWITCH(),
 ('14','Bemusing Aroma'):Q(S(ST('paralysis'),ST('poison')),ST('confusion')),
 ('16','Push Down'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('17','Giga Drain'):{'type':'drain'},
 ('17','Sacred Sword'):R('sacredSword'),
 ('19',"Water's Power"):R('waterPower'),
 ('19','Flamethrower'):DISC(1),
 ('23',"Grass' Power"):R('grassPower'),
 ('23','Rushing Water'):R('rushingWater'),
 ('24','Flail'):{'type':'damageFromDamage','source':'self','amount':1},
 ('24','Final Gambit'):R('finalGambit'),
 ('25','Splatter'):PICK(30),
 ('26','Roost'):S(HEAL(40),{'type':'lock','action':'retreat','target':'self','duration':'nextOwnTurn'}),
 ('27','Wing Dance'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('28','Rest'):S(HEAL(60),ST('sleep','self')),
 ('30','Sheer Cold'):{'type':'lock','action':'attack','target':'opponentActive','duration':'opponentTurn'},
 ('31','Superpower'):R('superpower'),
 ('32','Acrobatics'):COIN(2,20,False),
 ('35','Charge'):R('charge'),
 ('35','Disaster Volt'):DISC(1),
 ('37','Phat Sound'):R('phatSound'),
 ('39','Venoshock'):BONUS(60,{'type':'opponentStatus','status':'poison'}),
 ('40','Toxic Claws'):{'type':'status','target':'opponentActive','status':'poison','amount':20},
 ('40','Wild Horn'):COIN(2,20,False),
 ('41','Reflect'):GUARD(40),
 ('41','Telekinesis'):PICK(50),
 ('42','Psychic Assault'):R('psychicAssault'),
 ('46','Deleting Glare'):Q(R('deletingGlare')),
 ('47','Madkinesis'):{'type':'energyDamage','source':'self','energyType':'Psychic','amount':20,'mode':'add'},
 ('48','Mental Shock'):Q(ST('confusion'),DISC(1,'opponentActive')),
 ('49','Harden'):R('harden'),
 ('51','Smack Down'):R('smackDown'),
 ('52','Hard Crash'):Q(BONUS(20),{'type':'selfDamage','amount':20}),
 ('53','Shear'):R('shear'),
 ('53','Rock Bullet'):{'type':'energyDamage','source':'self','energyType':'Fighting','amount':20,'mode':'add'},
 ('54','Hone Claws'):{'type':'modifier','stat':'attackDamage','amount':30,'scope':'self','duration':'nextOwnTurn'},
 ('56','Drill Run'):DISC(1,'opponentActive'),
 ('57','Dig'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('57','Earthquake'):BENCH(10,'self'),
 ('58','Scarf Hold'):Q({'type':'lock','action':'attack','target':'opponentActive','duration':'opponentTurn'}),
 ('59','Five Fierce Chops'):S(COIN(5,20),{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'}),
 ('62','Thrash'):Q(BONUS(20),{'type':'selfDamage','amount':20}),
 ('63','Sacred Sword'):R('sacredSword'),
 ('64','Knock Off'):Q(R('knockOff')),
 ('65','Feint Attack'):{'type':'selectedDamage','amount':30,'target':'opponentPokemon','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},
 ('65','Claw Rend'):BONUS(30,{'type':'opponentDamaged'}),
 ('69','Bone Rush'):COIN('untilTails',30),
 ('69','Dark Pulse'):R('darkPulse'),
 ('72','Gyro Ball'):S(SWITCH(),{'type':'forceOpponentSwitch','chooseBy':'defender'}),
 ('73','Iron Defense'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('73','Power Whip'):R('powerWhip'),
 ('75','Guard Press'):GUARD(20),
 ('76','Charge Beam'):R('chargeBeam'),
 ('76','Zap Cannon'):Q(t=R('zapCannonLock')),
 ('77','Metal Horns'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('77','Sacred Sword'):R('sacredSword'),
 ('79','Watcheck'):{'type':'reorderTop','deckSide':'opponent','count':5},
 ('79','Quick Tail Smash'):R('quickTailSmash'),
 ('82','Tailwind'):R('tailwind'),
 ('82','Feather Strike'):Q(BONUS(40),DISC(1,'opponentActive')),
 ('83','Powerful Slap'):{'type':'coinDamageByEnergy','amount':40},
 ('83','Heal Pulse'):{'type':'chooseTarget','target':'selfPokemon','effect':HEAL(50,'selfPokemon')},
 ('85','Captivate'):{'type':'forceOpponentSwitch','chooseBy':'attacker'},
 ('85','Fluffy Tail'):ST('sleep'),
 ('88','Brave Bird'):{'type':'selfDamage','amount':30},
 ('89','Energy Wheel'):R('energyWheel'),
 ('89','Hurricane'):R('hurricane'),
 ('97','Charge'):R('charge'),
 ('97','Disaster Volt'):DISC(1),
 ('98','Energy Wheel'):R('energyWheel'),
 ('98','Hurricane'):R('hurricane'),
}
TRAINERS={
 '90':('Supporter',{'type':'drawToHandSize','size':6}),
 '91':('Supporter',DRAW(3)),
 '92':('Item',Q(R('crushingHammer'))),
 '93':('Item',R('greatBall')),
 '94':('Item',R('maxPotion')),
 '95':('Item',{'type':'forceOpponentSwitch','chooseBy':'attacker'}),
 '96':('Item',Q(R('recycle'))),
}
ABILITY={
 'Magic Room':{'type':'passive','effect':N},
 'Black Eyes':{'type':'activated','oncePerTurn':True,'activeOnly':True,'effect':R('blackEyes')},
}
def attack(row,a):
 n,title=str(row[0]),a[0];text=a[3] or ''
 if (n,title) in A:return A[n,title]
 if not text:return N
 if text=='Draw a card.':return DRAW(1)
 if text.startswith('Heal '):
  m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',text)
  if m:return HEAL(int(m[1]))
 if text.startswith('This Pokémon does '):
  m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',text)
  if m:return {'type':'selfDamage','amount':int(m[1])}
 if text=='The Defending Pokémon is now Asleep.':return ST('sleep')
 if text=='The Defending Pokémon is now Burned.':return ST('burn')
 if text=='The Defending Pokémon is now Confused.':return ST('confusion')
 if text=='The Defending Pokémon is now Poisoned.':return ST('poison')
 if text=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',text)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',text)
 if m:return Q(ST(H.STATUS[m[1]]))
 m=re.fullmatch(r'The Defending Pokémon is now (Asleep|Paralyzed|Poisoned|Burned|Confused)\.',text)
 if m:return ST(H.STATUS[m[1]])
 if text=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 if text=='The Defending Pokémon can\'t attack during your opponent\'s next turn.':return {'type':'lock','action':'attack','target':'opponentActive','duration':'opponentTurn'}
 if text=='Discard an Energy attached to this Pokémon.':return DISC(1)
 if text=='Discard an Energy attached to the Defending Pokémon.':return DISC(1,'opponentActive')
 if text=='Heal from this Pokémon the same amount of damage you did to the Defending Pokémon.':return {'type':'drain'}
 return None
