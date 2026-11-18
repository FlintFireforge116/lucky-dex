"""HeartGold & SoulSilver (HGSS1) explicit, conservative printed-effect mappings.

A nonempty effect that cannot be faithfully resolved is gated rather than a fake
noop. LEGEND assembly is gated as a unit until the two-half board zone exists.
"""
import re
N={'type':'noop'}
def S(*x):return {'type':'sequence','effects':list(x)}
def Q(h=None,t=None):return {'type':'coinFlip',**({'heads':h} if h else {}),**({'tails':t} if t else {})}
def ST(s,target='opponentActive'):return {'type':'status','target':target,'status':s}
def H(n,target='self'):return {'type':'heal','amount':n,'target':target}
def DISC(n=1,target='self',typ=None):return {'type':'discardEnergyCard','amount':n,'target':target,**({'energyType':typ,'strictEnergyType':True} if typ else {})}
def COIN(n,amount,replace=True):return {'type':'coinDamage','coins':n,'amount':amount,'mode':'replace' if replace else 'add'}
def SEARCH(n=1,source='deck',**kw):return {'type':'searchChosen','source':source,'amount':n,'filter':kw}
def PICK(n,target='opponentPokemon'):return {'type':'selectedDamage','amount':n,'target':target,'ignoreWeakness':True,'ignoreResistance':True}
def BENCH(n,side='opponent'):return {'type':'benchDamage','amount':n,'side':side,'all':True}
def BONUS(n,cond=None):return {'type':'bonusDamage','amount':n,**({'condition':cond} if cond else {})}
def SWITCH():return {'type':'switch','side':'self'}
def DRAW(n):return {'type':'draw','amount':n}
def LOCK():return {'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'}
def GUARD(n):return {'type':'modifier','stat':'damageReduction','amount':n,'scope':'self','duration':'opponentTurn'}
def OPT(label,eff):return {'type':'chooseOption','options':[{'label':label,'effect':eff},{'label':'Do not use','effect':N}]}
STATUS={'Paralyzed':'paralysis','Asleep':'sleep','Poisoned':'poison','Burned':'burn','Confused':'confusion'}
# Every mapping below is either a direct re-use of an established mechanic or
# a straightforward printed instruction with the same timing/target.
ATTACKS={
('2','Bubblebeam'):Q(ST('paralysis')),
('4','Hyper Beam'):DISC(1,'opponentActive'),
('5','Triple Kick'):COIN(3,20),
('5','Close Combat'):GUARD(-20),
('6','Mass Attack'):S(BONUS(20),{'type':'benchCountDamage','side':'both','amount':10}),
('6','Leaf Guard'):GUARD(30),
('8','Extrasensory'):BONUS(40,{'type':'handSizesEqual'}),
('9','Muddy Water'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':20,'upTo':True},
('10','Iron Tail'):COIN('untilTails',30),
('10','Thunderbolt'):DISC('all'),
('11','Poison Jab'):ST('poison'),
('12','Psyshock'):Q(ST('paralysis')),
('13','Double Return'):None, # dynamic counters + one coin
('14','Acceleration Bolt'):None, # 2 basic energy, chosen target
('14','Thunder'):Q(t={'type':'selfDamage','amount':20}),
('15','Leech Life'):{'type':'drain'},
('15','Poisonous Saliva'):ST('poison'),
('16','Cure Powder'):H(30,'selfAll'),
('16','Whirlwind'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
('17','Eeeeeeek'):S({'type':'handShuffle','draw':6},ST('sleep','self')),
('18','Energy Absorption'):{'type':'attachEnergyFromDiscard','amount':2,'target':'self','upTo':True},
('18','Big Eggsplosion'):None, # coin for each actual attached energy
('19','Collect'):DRAW(2),
('19','Spin Turn'):SWITCH(),
('20','Spinning Tail'):S(BONUS(20),BENCH(20)), # Active once plus each opponent Bench once
('21','Find a Friend'):SEARCH(1,kind='pokemon'),
('21','Quick Blow'):COIN(1,20,False),
('22','Timid Tackle'):S({'type':'selfDamage','amount':20},SWITCH()),
('22','Chomp'):{'type':'damageFromDamage','source':'self','amount':1},
('23','Psychic Shot'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':10,'upTo':True},
('24','Ice Beam'):Q(ST('paralysis')),
('24','Ice Blade'):PICK(30),
('25','Quick Draw'):DRAW(3),
('25','Swift'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},
('26','Sleep Powder'):ST('sleep'),
('26','Giant Bloom'):H(20),
('27','Sharpen Claws'):None, # random opponent-hand 0-3 card discard
('27','Sneaky Attack'):BONUS(30,{'type':'selfHasEnergyType','energyType':'Darkness'}),
('28','Playground'):None, # each player chooses any number of Basic from deck and falls asleep
('29','Poison Sting'):ST('poison'),
('29','Fury Swipes'):COIN(3,30),
('30','Energy Antics'):None, # opponent chooses energy transfer, then self sleeps
('32','Fire Spin'):DISC(2),
('33','Mischievous Punch'):S({'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True},ST('sleep','self')),
('34','Super Poison Breath'):ST('poison'),
('34','Super Explosion'):{'type':'selfDamage','amount':90},
('36','Energy Link'):{'type':'attachEnergyFromDiscard','amount':1,'target':'self'},
('36','Double-edge'):{'type':'selfDamage','amount':40},
('37','Recover'):S(DISC(1,'self','Water'),H(130)),
('37','Hyper Cannon'):{'type':'allHeadsEffect','coins':2,'heads':BONUS(50)},
('38','Big Bite'):LOCK(),
('39','Snowy Present'):None,
('39','Hail'):S(BONUS(10),BENCH(10)), # Active once and each opponent Bench once
('40','Rock Hurl'):{'type':'damageRule','ignoreResistance':True},
('40','Double Spin'):COIN(2,70),
('41','Glare'):Q(ST('paralysis')),
('41','Fade Out'):{'type':'returnToHand','target':'self','returnBasicEnergy':True},
('42','Thunder Spear'):PICK(20),
('42','Thundershock'):Q(ST('paralysis')),
('43','Green Draw'):{'type':'fieldCountDraw','side':'self','filter':{'subtype':'Grass'}},
('43','Double Headbutt'):COIN(2,20,False),
('44','Graffiti'):None, # self sleep + attack cost +C until opponent turn
('45','Group Swim'):SEARCH(1,kind='pokemon',subtype='Water'),
('45','Aqua Slash'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'},
('47','Moomoo Squeeze'):SEARCH(1,kind='trainer',name='Moomoo Milk'),
('47','Body Slam'):Q(ST('paralysis')),
('48','Sleep Drain'):S(ST('sleep'),H(40)),
('49','Flamethrower'):DISC(1),
('50','Offensive Needle'):Q(ST('poison'),ST('paralysis')),
('51','Knock Away'):COIN(1,10,False),
('52','Big Yawn'):S(ST('sleep'),ST('sleep','self')),
('52','Madkinesis'):{'type':'energyDamage','source':'self','energyType':'Psychic','amount':20,'mode':'add'},
('53','Cosmic Cyclone'):None, # many chosen Energy to shuffle back; no auto choose
('54','Hidden Power'):N,
('55','Hidden Power'):N,
('56','Double Slap'):COIN(2,40),
('56','Expand'):GUARD(10),
('58','Happy Punch'):Q(H(30)),
('60','Minimize'):GUARD(20),
('62','Sleep Inducer'):None, # choose opponent Bench, switch, then sleep
('63','Continuous Eggsplosion'):COIN('untilTails',10),
('64','Show Off'):SEARCH(2,basicEnergy=True),
('67','Bounce'):OPT('Switch Hoppip with one of your Benched Pokémon',SWITCH()),
('68','Hypnoblast'):ST('sleep'),
('69','Mimic'):{'type':'handShuffle','draw':'opponentHandCount'},
('69','Lick'):Q(ST('paralysis')),
('70','Smokescreen'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
('71','Comet Punch'):COIN(4,10),
('73','Static Electricity'):None, # number of Mareep in both players' in-play zone
('74','Water Splash'):COIN(1,10,False),
('75','Pay Day'):DRAW(1),
('76','Double-edge Claw'):{'type':'selfDamage','amount':10},
('77','Flail'):{'type':'damageFromDamage','source':'self','amount':1},
('78','Quick Attack'):COIN(1,10,False),
('79','Defense Curl'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn'}),
('80','Scout'):{'type':'revealHand','side':'opponent'},
('81','Whimsy Tackle'):{'type':'coinAttackGate','heads':N},
('82','Roar'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
('83','Spider Web'):LOCK(),
('85','Cure Kernels'):H(20,'selfPokemon'),
('87','Singe'):Q(ST('burn')),
('87','Ember'):Q(t=DISC(1,'self','Fire')),
('88','Tail Whip'):Q({'type':'lock','action':'attack','target':'opponentActive','duration':'opponentTurn'}),
('105','Lightning Crush'):Q(BONUS(40),DISC(1,'opponentActive')),
('107','Earthquake'):BENCH(10,'self'),
('108','Hydro Crunch'):{'type':'damageFromDamage','source':'opponent','amount':1},
('110','Flare Destroy'):S(DISC(1,'self'),DISC(1,'opponentActive')),
('123','Thrash'):Q(BONUS(20),{'type':'selfDamage','amount':20}),
}

# Existing generic patterns ONLY when the printed sentence has exact semantics.
def attack(row,a):
 k=(str(row[0]),a[0]);text=(a[3] or '').strip();name=row[1]
 if k in ATTACKS:return ATTACKS[k]
 if not text:return N
 m=re.fullmatch(r'The Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',text)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',text)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does \d+ damage plus (\d+) more damage\.',text)
 if m:return COIN(1,int(m[1]),False)
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]))
 if text=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 if text=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 if text=="This attack's damage isn't affected by Resistance.":return {'type':'damageRule','ignoreResistance':True}
 if text=="This attack's damage isn't affected by Weakness or Resistance.":return {'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}
 m=re.fullmatch(r'Draw (a card|\d+ cards)\.',text)
 if m:return DRAW(1 if m[1]=='a card' else int(m[1].split()[0]))
 m=re.fullmatch(r'(?:Flip a coin\. If heads, )?discard an Energy card attached to the Defending Pokémon\.',text,re.I)
 if m:return Q(DISC(1,'opponentActive')) if text.startswith('Flip') else DISC(1,'opponentActive')
 m=re.fullmatch('Flip a coin\\. If tails, '+re.escape(name)+r' does (\d+) damage to itself\.',text)
 if m:return Q(t={'type':'selfDamage','amount':int(m[1])})
 m=re.fullmatch(re.escape(name)+r' does (\d+) damage to itself\.',text)
 if m:return {'type':'selfDamage','amount':int(m[1])}
 return None

def BODY(name,e):return {'name':name,'type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':e}
def POWER(name,e):return {'name':name,'type':'activated','printedPowerType':'power','disabledByStatus':True,'oncePerTurn':True,'effect':e}
# New Prime traits require exact placement timings/repeated turns. Unknowns gated.
ABILITIES={
('7','Roast Reveal'):None, # discard actual Fire Energy from hand to draw3
('8','Night Sight'):POWER('Night Sight',DRAW(1)),
('11','Shell Barricade'):BODY('Shell Barricade',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfOnBench'}}),
('12','Second Sight'):None, # choose whose deck and reorder three cards in specified order
('17','Sweet Sleeping Face'):BODY('Sweet Sleeping Face',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}),
('23','Sleep Pendulum'):POWER('Sleep Pendulum',Q(ST('sleep'))),
('28','Sweet Sleeping Face'):BODY('Sweet Sleeping Face',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}),
('30','Sweet Sleeping Face'):BODY('Sweet Sleeping Face',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}),
('31','Sunshine Grace'):POWER('Sunshine Grace',SEARCH(1,kind='pokemon',subtype='Grass')),
('33','Sweet Sleeping Face'):BODY('Sweet Sleeping Face',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}),
('44','Sweet Sleeping Face'):BODY('Sweet Sleeping Face',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}),
('46','Green Shield'):None, # must protect *all* Grass Pokemon, not merely itself
('54','RETURN'):None,
('55','FLASH'):None,
('105','Conductivity'):None, # energyAttached on opposing Pokemon, hand-only, exact damage
('106','Blissful Nurse'):None, # evolve trigger, remove all damage & energy only from damaged
('107','Exoskeleton'):BODY('Exoskeleton',{'type':'modifier','stat':'damageReduction','amount':20,'duration':'whileInPlay','scope':'self'}),
('108','Rain Dance'):None, # repeatable per-turn, all hand Water to matching Water Pokemon
('109','Leaf Trans'):None, # repeatable once per attachment, transfer Water? Grass only
('110','Afterburner'):None, # discard Fire -> chosen Pokemon 10 damage, once/turn
('111','Sacred Rainbow'):None,('112','Sacred Rainbow'):None,
('113','Ocean Grow'):None,('114','Ocean Grow'):None,
}

def ability(row,p):return ABILITIES.get((str(row[0]),p[0]))

TRAINERS={
 '89':('Supporter',DRAW(2)),
 '90':('Supporter',{'type':'handShuffle','draw':'opponentHandCount'}),
 '91':('Item',None), # moving basic Energy between ANY two friendly Pokemon needs exact two targets
 '92':('Supporter',SEARCH(4,source='discard',basicEnergy=True)),
 '93':('Item',{'type':'removeStatuses','target':'self','statuses':['burn','poison','sleep','paralysis','confusion']}),
 '94':('Item',None), # must retain single chosen Pokemon for both coin results
 '95':('Item',Q(SEARCH(1,kind='pokemon'))),
 '96':('Item',None), # choose exactly 1 Supporter from top 7
 '97':('Supporter',SEARCH(3,kind='pokemon',stage='Basic')),
 '98':('Item',{'type':'tradeHandForDeck','handFilter':{'kind':'pokemon'},'deckFilter':{'kind':'pokemon'}}),
 '99':('Item',Q({'type':'forceOpponentSwitch','chooseBy':'attacker'})),
 '100':('Supporter',SEARCH(1,kind='pokemon',stage=['Stage 1','Stage 2'])),
 '101':('Supporter',{'type':'handShuffle','draw':6}),
 '102':('Item',SWITCH()),
 'ONE':('Item',{'type':'revealHand','side':'opponent'}),
}
