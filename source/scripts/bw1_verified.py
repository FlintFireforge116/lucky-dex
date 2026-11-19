"""Black & White base set printed-effects layer: unknown mechanics remain gated."""
import re
import hgss1_verified as H
N,S,Q,ST,HEAL,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD=H.N,H.S,H.Q,H.ST,H.H,H.DISC,H.COIN,H.SEARCH,H.PICK,H.BENCH,H.BONUS,H.SWITCH,H.DRAW,H.LOCK,H.GUARD
R=lambda key:{'type':'neoRule','rule':'bw1:'+key}
A={
('2','Leaf Blade'):Q(BONUS(30)),
('4','Wring Out'):Q(S(ST('paralysis'),DISC(1,'opponentActive'))),
('5','Leaf Storm'):R('leafStorm'),
('6','Leaf Tornado'):{'type':'redistributeEnergy','allowedEnergyTypes':['Grass'],'includeSpecialEnergy':True},
('9','Magical Leaf'):Q(S(BONUS(10),HEAL(10))),
('10','Petal Dance'):S(COIN(3,30),ST('confusion','self')),
('10','Leaf Storm'):R('leafStorm'),
('11','Mega Drain'):HEAL(20),
('12','Constant Rattle'):{'type':'coinTierBonus','coins':3,'tiers':{'0':0,'1':10,'2':30,'3':60},'mode':'replace'},
('12','Giga Drain'):{'type':'drain'},
('13','Leech Seed'):HEAL(10),
('14','Nature Power'):R('naturePower'),
('14','Horn Leech'):HEAL(20),
('16','Take Down'):{'type':'selfDamage','amount':10},
('17','Flame Charge'):R('flameCharge'),
('18','Flamethrower'):DISC(1),
('19','Flare Blitz'):DISC('all','self','Fire'),
('22','Flame Burst'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':20,'upTo':True},
('25','Thrash'):Q(BONUS(20),{'type':'selfDamage','amount':20}),
('26','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
('26','Blue Flare'):DISC(2,'self','Fire'),
('30','Aqua Tail'):{'type':'coinDamageByEnergy','amount':10,'energyType':'Water','countAttachedEnergyType':True},
('31','Pike'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':30,'upTo':False},
('32','Hydro Pump'):{'type':'energyDamage','source':'self','energyType':'Water','amount':10,'mode':'add'},
('35','Crunch'):Q(DISC(1,'opponentActive')),
('37','Feather Dance'):R('featherDance'),
('37','Aqua Ring'):SWITCH(),
('39','Hydro Pump'):{'type':'energyDamage','source':'self','energyType':'Water','amount':10,'mode':'add'},
('42','Wild Charge'):{'type':'selfDamage','amount':10},
('43','Electrispark'):BENCH(10),
('45','Leech Life'):{'type':'drain'},
('46','Leech Life'):{'type':'drain'},
('47','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
('47','Bolt Strike'):{'type':'selfDamage','amount':40},
('48','Dream Eater'):{'type':'attackRequirement','condition':{'type':'opponentStatus','status':'sleep'}},
('49','Dream Eater'):{'type':'attackRequirement','condition':{'type':'opponentStatus','status':'sleep'}},
('51','Attract'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
('55','Cell Culture'):R('cellCulture'),
('56','Recover'):S(DISC(1),HEAL(999)),
('57','Psywave'):{'type':'energyDamage','source':'opponent','amount':10,'mode':'add'},
('60','Bulk Up'):R('bulkUp'),
('61','Circle Throw'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
('63','Sand Tomb'):LOCK(),
('64','Torment'):R('torment'),
('65','Torment'):R('torment'),
('65','Krookoroll'):BONUS(40,{'type':'opponentDamaged'}),
('67','Taunt'):{'type':'forceOpponentSwitch','chooseBy':'attacker'},
('67','Sucker Punch'):BONUS(30,{'type':'selfHasEnergyType','energyType':'Darkness'}),
('69','Spit Acid'):S(ST('burn'),Q(ST('paralysis'))),
('71','Nasty Plot'):SEARCH(1),
('71','Foul Play'):{'type':'copyAttack','source':'opponentActive','ignoreUseCosts':True},
('73','Blindside'):R('blindside'),
('73','Punishment'):BONUS(60,{'type':'opponentMatches','filter':{'stage':'Stage 2'}}),
('80','Pickup'):SEARCH(1,source='discard',kind='trainer',trainerType='Item'),
('83','Odor Sleuth'):R('odorSleuth'),
('83','Giga Impact'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'},
('86','Fly'):{'type':'neoRule','rule':'hgss3:39:fly'},
('89','Do the Wave'):{'type':'benchCountDamage','side':'self','amount':20},
('90','Double Stomp'):COIN(2,20,False),
('91','Revenge'):BONUS(70,{'type':'koLastOpponentTurn'}),
('91','Head Charge'):Q(t={'type':'selfDamage','amount':20}),
('113','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
('113','Blue Flare'):DISC(2,'self','Fire'),
('114','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
('114','Bolt Strike'):{'type':'selfDamage','amount':40},
('115','Energize'):SEARCH(1,source='discard',kind='energy',basicEnergy=True), # dedicated rule below overrides generic selection
('115','Thunderbolt'):DISC('all'),
}
A['115','Energize']=R('energize')
# Trainer wording exact, and these mechanics reused rather than re-implemented.
TRAINERS={
 '92':('Item',R('energyRetrieval')),
 '93':('Item',R('energySearch')),
 '94':('Item',R('energySwitch')),
 '95':('Item',{'type':'removeStatuses','target':'self','statuses':['burn','poison','sleep','paralysis','confusion']}),
 '96':('Item',{'type':'modifier','stat':'attackDamage','amount':10,'scope':'team','duration':'turn'}),
 '97':('Item',Q(SEARCH(1,kind='pokemon'))),
 '98':('Item',{'type':'reorderTop','count':5,'deckSide':'self'}),
 '99':('Item',{'type':'tradeHandForDeck','handFilter':{'kind':'pokemon'},'deckFilter':{'kind':'pokemon'}}),
 '100':('Item',{'type':'chooseTarget','target':'selfPokemon','effect':{'type':'heal','target':'selfPokemon','amount':30}}),
 '101':('Supporter',R('professorJuniper')),
 '102':('Item',R('revive')),
 '103':('Item',R('superScoop')),
 '104':('Item',SWITCH()),
}
ABILITY={
 'Royal Heal':{'type':'triggered','event':'checkup','effect':R('royalHeal')},
 'Inferno Fandango':{'type':'activated','oncePerTurn':False,'effect':R('infernoFandango')},
 'Shell Armor':{'type':'passive','effect':{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'whileInPlay'}},
 'Damage Swap':{'type':'activated','oncePerTurn':False,'effect':R('damageSwap')},
 'Shift Gear':{'type':'activated','oncePerTurn':False,'effect':{'type':'redistributeEnergy','allowedEnergyTypes':['Metal'],'includeSpecialEnergy':True}},
}
def attack(row,a):
 num,title=str(row[0]),a[0];text=a[3] or ''
 if (num,title) in A:return A[num,title]
 if not text:return N
 if 'This Pokémon does ' in text and 'damage to itself.' in text:
  m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',text)
  if m:return {'type':'selfDamage','amount':int(m[1])}
 if text=='Heal 20 damage from this Pokémon.':return HEAL(20)
 if text=='Heal from this Pokémon the same amount of damage you did to the Defending Pokémon.':return {'type':'drain'}
 if text=='The Defending Pokémon is now Asleep.':return ST('sleep')
 if text=='The Defending Pokémon is now Burned.':return ST('burn')
 if text=='The Defending Pokémon is now Confused.':return ST('confusion')
 if text=='The Defending Pokémon is now Poisoned.':return ST('poison')
 if text=='This Pokémon can\'t attack during your next turn.':return {'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'}
 if text=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',text)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',text)
 if m:return Q(ST(H.STATUS[m[1]]))
 m=re.fullmatch(r'The Defending Pokémon can\'t retreat during your opponent\'s next turn\.',text)
 if m:return LOCK()
 m=re.fullmatch(r'Draw (a card|\d+ cards)\.',text)
 if m:return DRAW(1 if m[1]=='a card' else int(m[1].split()[0]))
 if text=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 return None
