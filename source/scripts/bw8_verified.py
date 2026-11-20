"""Plasma Storm BW8 explicit printed-rule mappings.

Unknown effects are gated; a printed effect must never silently be a no-op.
Special Energy and Team Plasma cards are identified by PHYSICAL card refs.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
import bw7_verified as B7
R=lambda key:{'type':'neoRule','rule':'bw8:'+key}
D=lambda n=1,target='self':{'type':'discardEnergyCard','target':target,'amount':n}
T=lambda key:R(key)
A={
 ('3','Guard Press'):GUARD(20), ('3','Rumble Stomp'):COIN('untilTails',20,False),
 ('4','Sting Missile'):{'type':'shuffleIntoDeck','target':'self'},
 ('5','Gather Order'):R('gatherOrder'),('5','Damage Beat'):R('damageBeat'),
 ('7','Random Peck'):COIN(2,20,False),('9','Swaddle Guard'):GUARD(40),
 ('10','Cleave'):R('cleave'), ('11','Ambush'):Q(BONUS(30)),
 ('12','Astonish'):Q({'type':'shuffleRandomHandCard','side':'opponent'}),
 ('13','Astonish'):Q({'type':'shuffleRandomHandCard','side':'opponent'}),
 ('13','Miracle Powder'):Q(R('miraclePowder')),
 ('14','Destructive Flame'):Q(R('destructiveFlame')),('14','Power Flame'):R('plasmaBonus40'),
 ('16','Loud Howl'):{'type':'forceOpponentSwitch','chooseBy':'defender'},('16','Fire Tail Slap'):D(),
 ('17','Torment'):{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},
 ('17','Malevolent Fire'):D('all'),
 ('18','Turbo Energize'):R('turboEnergize'),('18','Intensifying Burn'):BONUS(50,{'type':'opponentEx'}),
 ('20','Flame Blast'):{'type':'energyDamage','source':'self','energyType':'Fire','amount':20,'mode':'add'},
 ('22','Surprise Attack'):{'type':'coinAttackGate','heads':N},
 ('23','Luring Flame'):R('luringFlame'),('23','Fiery Licks'):R('fieryLicks'),
 ('25','Blizzard'):BENCH(10),('25','Frost Prison'):R('plasmaParalyze'),
 ('28','Frost Stone'):Q(S(BONUS(20),ST('paralysis'))),
 ('31','Groovy Dance'):R('groovyDance'),
 ('34','Seafaring'):R('seafaring'),
 ('35','Snow Squall'):{'type':'damageRule','ignoreResistance':True},
 ('37','Enefountain'):R('enefountain'),('37','Blizzard'):BENCH(10),
 ('39','Aqua Bullet'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':10,'upTo':True},
 ('40','Hail'):R('hail'),
 ('41','Powerful Rage'):R('powerfulRage'),('41','Glacier Drop'):{'type':'discardTop','side':'opponent','amount':1},
 ('46','Gyro Ball'):S(SWITCH(),{'type':'forceOpponentSwitch','chooseBy':'defender'}),
 ('47','Double Assist'):R('doubleAssist'),
 ('48','Agility'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('48','Powervolt'):R('plasmaBonus40'),
 ('49','Electribonus'):R('electribonus'),('49','Poltergeist'):R('poltergeist'),
 ('51','Discharge'):R('discharge'),
 ('55','Ultra-Toxic Fang'):R('ultraToxicFang'),
 ('57','Smokescreen'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('58','Smogbank'):R('smogbank'),
 ('61','Powerful Storm'):R('powerfulStorm'),('61','Swift Lunge'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('62','Hex'):R('hex'),('62','Shadow Claw'):{'type':'discardHand','side':'opponent','amount':1,'random':True},
 ('63','Pile Up'):Q({'type':'searchChosen','amount':1,'filter':{'trainerType':'Tool'}}),
 ('65','Tool Drop'):R('toolDrop'),
 ('66','Biosmog'):S(ST('poison'),Q(D(1,'opponentActive'))),
 ('67','Ensnarl'):R('ensnarl'),('67','Double Ducts'):COIN(2,80),
 ('70','Damakinesis'):R('damakinesis'),
 ('72','Spinning Turn'):SWITCH(),('72','Wreck'):R('wreck'),
 ('73','Rock Throw'):N,
 ('78','Hurricane Kick'):R('hurricaneKick'),
 ('80','Dynamic Punch'):Q(S(BONUS(20),ST('confusion'))),
 ('81','Facade'):R('facade'),
 ('82','Scout'):{'type':'revealHand','side':'opponent'},
 ('83','Scout'):{'type':'revealHand','side':'opponent'},
 ('84','Silent Claw'):R('silentClaw'),
 ('86','Reinforced Headbutt'):BONUS(50,{'type':'selfHasTool'}),
 ('87','Cargo Jet'):R('cargoJet'),('87','Steel Wing'):GUARD(20),
 ('88','Rigidify'):GUARD(20),
 ('89','Gear Smash'):COIN(2,20,False),
 ('90','Heavy Bullet'):Q({'type':'selectedDamage','target':'opponentBench','amount':20,'ignoreWeakness':True,'ignoreResistance':True}),
 ('91','Hard Crunch'):BONUS(30,{'type':'opponentDamaged'}),
 ('92','Call for Backup'):SEARCH(1,kind='pokemon'),
 ('93','Righteous Edge'):R('righteousEdge'),
 ('93','Steel Bullet'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},
 ('94','Guard Press'):GUARD(20),
 ('95','Black Ballista'):D(3),
 ('96','White Inferno'):R('whiteInferno'),
 ('98','Moon Impact'):N,
 ('100','Raging Pecks'):S(COIN(3,30),ST('confusion','self')),
 ('101','Teampact'):R('teampact'),
 ('103','Sweet Kiss'):DRAW(1),('111','Collect'):DRAW(1), # patched below to draw to opponent
 ('104','Return'):{'type':'drawToHandSize','size':6},
 ('105','Shout'):Q({'type':'discardHand','side':'opponent','amount':1,'random':True}),
 ('107','Destructive Sound'):R('destructiveSound'),('107','Round'):R('round'),
 ('108','Plasma Gale'):R('plasmaGale'),
 ('110','Reckless Charge'):{'type':'selfDamage','amount':10},
 ('112','Fast Swipe'):{'type':'discardHand','side':'opponent','amount':1,'random':True},
 ('113','Second Bite'):R('secondBite'),
 ('114','Tool Breaker'):R('toolBreaker'),
 ('115','Incessant Peck'):COIN('untilTails',20,False),
 ('116','Wild Edge'):R('wildEdge'),
 ('131','Turbo Energize'):R('turboEnergize'),('131','Intensifying Burn'):BONUS(50,{'type':'opponentEx'}),
 ('132','Blizzard'):BENCH(10),('132','Frost Prison'):R('plasmaParalyze'),
 ('133','Righteous Edge'):R('righteousEdge'),
 ('133','Steel Bullet'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},
 ('134','Plasma Gale'):R('plasmaGale'),
 ('136','Split Bomb'):{'type':'multiTargetDamage','target':'opponentPokemon','count':2,'amount':40,'activeWeaknessResistance':True},
 ('136','Scorching Fire'):DISC(1,'self','Fire'),
 ('137','Hydro Pump'):{'type':'energyDamage','source':'self','energyType':'Water','amount':10,'mode':'add'},
}
# Correct the gift-card destination; never draw the other player's card into our hand.
A['103','Sweet Kiss']=R('opponentDraw1')

ABILITY={
 'Fair-Weather Heal':{'type':'activated','oncePerTurn':True,'effect':R('fairWeatherHeal')},
 'Freefloating':{'type':'passive','effect':R('freefloating')},
 'Rain Dish':{'type':'triggered','event':'checkup','effect':R('rainDish')},
 'Rough Skin':{'type':'triggered','event':'damagedByAttack','activeOnly':True,'opponentAttackOnly':True,'effect':R('roughSkin')},
 'Final Wish':{'type':'triggered','event':'knockedOut','activeOnly':False,'opponentAttackOnly':True,'effect':R('finalWish')},
 'Spiteful Spirit':{'type':'triggered','event':'knockedOut','activeOnly':True,'opponentAttackOnly':True,'effect':S(ST('confusion','opponentActive'),ST('poison','opponentActive'))},
 'Dual Brains':{'type':'passive','effect':R('dualBrains')},
 'Night Sight':{'type':'activated','oncePerTurn':True,'effect':DRAW(1)},
 'Free Flight':{'type':'passive','effect':R('freeFlight')},
 'Aftermath':{'type':'triggered','event':'knockedOut','activeOnly':False,'opponentAttackOnly':True,'effect':{'type':'discardTop','side':'opponent','amount':3}},
 'Premonition':{'type':'activated','oncePerTurn':True,'effect':{'type':'reorderTop','count':2,'deckSide':'self'}},
 'Dual Armor':{'type':'passive','effect':R('dualArmor')},
 'Plasma Steel':{'type':'passive','effect':R('plasmaSteel')},
 'Moon Guidance':{'type':'activated','oncePerTurn':True,'effect':R('moonGuidance')},
 'Block':{'type':'passive','effect':R('block')},
 'Bright Veil':{'type':'passive','effect':R('brightVeil')},
 'Overflow':{'type':'passive','effect':R('overflow')},
 'Big Wing':{'type':'activated','oncePerTurn':True,'activeOnly':True,'effect':{'type':'forceOpponentSwitch','chooseBy':'attacker'}},
 'Deluge':B7.ABILITY['Deluge'],
}
TRAINERS={
 '117':('Item',R('bicycle')),
 '118':('Supporter',R('colress')),'135':('Supporter',R('colress')),
 '119':('Item',R('colressMachine')),
 '120':('Item',R('escapeRope')),
 '121':('Item',R('ether')),
 '122':('Tool',R('eviolite')),
 '123':('Item',R('hypnotoxicLaser')),
 '124':('Stadium',R('plasmaFrigate')),
 '125':('Supporter',R('teamPlasmaGrunt')),
 '126':('Stadium',R('virbankCityGym')),
 '128':('Item',R('dowsingMachine')),
 '129':('Item',R('scrambleSwitch')),
 '130':('Tool',R('victoryPiece')),
 '138':('Item',R('randomReceiver')),
}
GATE={'104':'Bright Veil requires selective prevention of opponents’ Item effects targeting a Pokémon; do not simulate as no-op.'}

def attack(row,a):
 n,name=str(row[0]),a[0];txt=(a[3] or '').strip()
 if (n,name) in A:return A[n,name]
 if not txt:return N
 m=re.fullmatch(r'(?:The )?Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return ST({'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return Q(ST({'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',txt)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN('untilTails',int(m[1]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN('untilTails',int(m[1]))
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',txt)
 if m:return H(int(m[1]))
 if txt=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
 if txt=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 if txt=="Discard an Energy attached to this Pokémon.":return D()
 if txt=="This Pokémon does 90 damage to itself.":return {'type':'selfDamage','amount':90}
 if txt=='Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.':return {'type':'forceOpponentSwitch','chooseBy':'defender'}
 if txt=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 m=re.fullmatch(r'Flip a coin\. If tails, this attack does nothing\.',txt)
 if m:return {'type':'coinAttackGate','heads':N}
 if txt.startswith("During your opponent's next turn, any damage") and 'reduced by' in txt:
  m=re.search(r'reduced by (\d+)',txt)
  if m:return GUARD(int(m[1]))
 # Known-safe matching printed text from previous decks. Never use neoRules
 # from another print with a hidden id-dependent handler.
 reused=B7._safe_reuse(txt)
 if reused:return reused
 return None
