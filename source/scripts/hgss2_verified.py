"""Conservative verified HGSS Unleashed printed mechanics, no fake noop effects.

Each returned effect is executable by the current Classic engine. Complex
interactions are explicitly gated until their physical choices can be tested.
"""
import re
import hgss1_verified as H
N=H.N
S=H.S
Q=H.Q
ST=H.ST
DISC=H.DISC
COIN=H.COIN
SEARCH=H.SEARCH
PICK=H.PICK
BENCH=H.BENCH
BONUS=H.BONUS
H_L=H.H

def seq(*effects):return {'type':'sequence','effects':list(effects)}
def rule(n,slug):return {'type':'neoRule','rule':f'hgss2:{n}:{slug}'}
def draws(n):return {'type':'draw','amount':n}
def guard(n):return {'type':'modifier','stat':'damageReduction','amount':n,'scope':'self','duration':'opponentTurn'}
def switch():return {'type':'switch','side':'self'}
def lock():return {'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'}
def coinBonus(n):return Q(BONUS(n))
def fullheads(n,amount):return COIN(n,amount)
def benchFirst(n):return {'type':'benchDamage','amount':n,'side':'opponent','all':False}
def benchBasics(n=1):return {'type':'benchFromDeck','amount':n,'filter':{'kind':'pokemon','stage':'Basic'},'choose':True}

# Printed status and damage behavior is verified even when the surrounding
# evolutionary line belongs to an older set. Unverified mandatory clauses are
# never silently replaced with noop.
ATTACKS={
 ('2','Hard Crush'):seq({'type':'topDeckCountDamage','count':3,'amount':50,'filter':{'kind':'energy'}},{'type':'discardTop','side':'self','amount':3}),
 ('2','Mantle Bazooka'):DISC(2,'self','Fire'),
 ('3','Deep Sea Swirl'):{'type':'handShuffle','draw':5},
 ('6','Ink Bomb'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('7','Big Chorus'):{'type':'coinDamageByPokemon','filter':{'subtype':'Water'},'amount':30},
 ('9','Push Over'):{'type':'energyDamage','source':'self','energyType':'Fighting','amount':20,'mode':'replace'},
 ('9','Rumble'):lock(),
 ('10','Giga Drain'):{'type':'drain'},
 ('11','Psywave'):{'type':'energyDamage','source':'opponent','amount':20,'mode':'replace'},
 ('11','Confuse Ray'):Q(ST('confusion')),
 ('12','Twineedle'):COIN(2,50),
 ('12','Paralyze Poison'):seq(ST('poison'),Q(ST('paralysis'))),
 ('14','Supersonic'):ST('confusion'),
 ('14','Hurricane Wing'):COIN(4,30),
 ('15','Repeating Drill'):COIN(5,20),
 ('17','Water Arrow'):PICK(30),
 ('18','Confuse Ray'):Q(ST('confusion')),
 ('18','Reflect Energy'):{'type':'moveEnergy','source':'self','target':'selfBench','amount':1},
 ('19','Bulk Up'):seq({'type':'nextAttackBonus','attackName':'Bulk Up','amount':30},{'type':'nextAttackBonus','attackName':'Magnum Punch','amount':30}),
 ('21','Steamroll'):benchFirst(20),
 ('21','Dynamic Punch'):Q(seq(BONUS(40),ST('confusion'))),
 ('23','Power Blow'):{'type':'energyDamage','source':'self','amount':20,'mode':'replace'},
 ('24','Guard Press'):guard(20),
 ('24','Steel Swing'):COIN(2,80),
 ('26','Tail Crush'):coinBonus(20),
 ('26','Hyper Beam'):{'type':'neoRule','rule':'hgss1:4:hyperBeam'},
 ('27','Cross Chop'):coinBonus(30),
 ('22','Bebop Punch'):seq(PICK(0),COIN('untilTails',50)),
 ('29','Return'):{'type':'drawToHandSize','size':6},
 ('30','Mean Look'):lock(),
 ('31','Sleep Powder'):Q(ST('sleep')),
 ('32','Speed Evolution'):{'type':'evolveFromDeck'},
 ('32','Poison Sting'):ST('poison'),
 ('34','Call for Family'):benchBasics(2),
 ('34','Tag Team Boost'):BONUS(20,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Plusle'}}),
 ('35','Flare Bonus'):{'type':'neoRule','rule':'hgss1:7:roastReveal'},
 ('36','Collect'):draws(2),
 ('36','Thunder Jolt'):Q(t={'type':'selfDamage','amount':10}),
 ('37','Hypnoblast'):ST('sleep'),
 ('38','Rage'):{'type':'damageFromDamage','source':'self','amount':1},
 ('40','Muddy Water'):benchFirst(10),
 ('41','Crimson Bull'):seq(COIN(3,30),ST('confusion','self')),
 ('42','Water Arrow'):PICK(20),
 ('43','Tail Code'):{'type':'moveEnergy','source':'opponentActive','target':'opponentBench','amount':1},
 ('43','Tail Smash'):{'type':'coinAttackGate','heads':N},
 ('44','Reaction'):H.OPT('Switch Beldum with a Benched Pokémon',switch()),
 ('45','Muddy Water'):benchFirst(10),
 ('46','Drawup Power'):SEARCH(1,kind='energy'),
 ('49','Fin Smack'):COIN(2,20),
 ('50','Mountain Eater'):seq({'type':'discardTop','side':'opponent','amount':1},H_L(20)),
 ('53','Karate Chop'):{'type':'selfDamagePenalty','amount':1},
 ('54','Sharpshooting'):PICK(10),
 ('55','Teleport'):switch(),
 ('56','Boundless Power'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'},
 ('57','Swing Around'):COIN(2,20,False),
 ('58','Call for Family'):benchBasics(1),
 ('59','Water Arrow'):PICK(20),
 ('60','Double Chop'):COIN(2,20),
 ('61','Petal Dance'):seq(COIN(3,20),ST('confusion','self')),
 ('62','Roost'):seq(H_L(40),{'type':'lock','action':'retreat','target':'self','duration':'nextOwnTurn'}),
 ('64','Call for Family'):benchBasics(2),
 ('64','Mystifying Horns'):ST('confusion'),
 ('65','Take Down'):{'type':'selfDamage','amount':10},
 ('66','Green Call'):{'type':'coinRepeatEffect','coins':2,'effect':SEARCH(1,kind='pokemon',subtype='Grass')},
 ('67','Leech Seed'):{'type':'drain','amount':10},
 ('68','Fireworks'):Q(t=DISC(1,'self','Fire')),
 ('69','Speed Evolution'):{'type':'evolveFromDeck'},
 ('70','Double Attack'):{'type':'neoRule','rule':'hgss2:70:doubleAttack'},
 ('87','Energy Stream'):{'type':'neoRule','rule':'hgss1:36:energyLink'},
 ('88','Power Claw'):{'type':'damageRule','ignoreDefenderEffects':True},
 ('88','Megaton Tail'):{'type':'discardTop','side':'self','amount':3},
 ('89','Hammer Arm'):{'type':'discardTop','side':'opponent','amount':1},
 ('90','Detonation Spin'):DISC(1,'self','Fire'),
 ('91','Detonation Spin'):DISC(1,'self','Fire'),
 ('92','Thunderbolt Spear'):{'type':'selfDamage','amount':50},
 ('93','Thunderbolt Spear'):{'type':'selfDamage','amount':50},
 ('92','Aurora Gain'):H_L(50),
 ('93','Aurora Gain'):H_L(50),
 ('94','Bursting Inferno'):ST('burn'),
 ('95','Bursting Inferno'):ST('burn'),
}
# Some attacks are explicitly blank and thus noop by design. Generic parser is
# invoked only on clear verbatim patterns from prior audited HGSS functionality.
def attack(row,a):
 key=(str(row[0]),a[0]);text=(a[3] or '').strip();damage=str(a[2] or '')
 if key in ATTACKS:return ATTACKS[key]
 if not text:return N
 generic=H.attack(['0',row[1]],a)
 if generic is not None:return generic
 # One visible clause with exactly the standard effect schema.
 if text=='The Defending Pokémon is now Confused.':return ST('confusion')
 if text=='The Defending Pokémon is now Burned.':return ST('burn')
 if text=='The Defending Pokémon is now Poisoned.':return ST('poison')
 if text=='The Defending Pokémon is now Asleep.':return ST('sleep')
 if text.startswith('Does ') and ' damage times the amount of Energy attached to ' in text and text.endswith('.'):
  m=re.match(r'Does (\d+) damage times the amount of Energy attached to (.+)\.',text)
  if m:return {'type':'energyDamage','source':'opponent' if 'Defending' in m[2] else 'self','amount':int(m[1]),'mode':'replace'}
 if text=='During your opponent\'s next turn, any damage done to Steelix by attacks is reduced by 20 (after applying Weakness and Resistance).':return guard(20)
 return None

# Powers are triggered/activated only when the shared engine supports their
# printed timing. Otherwise gate the card from live battle, but keep the print.
ABILITIES={
 ('25','Hot Snort'):{'type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':True,'effect':Q(ST('burn'))},
 ('28','Sunny Heal'):{'type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'effect':H_L(10,'selfActive')},
 ('89','Berserk'):{'type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'modifier','stat':'attackDamage','amount':60,'scope':'self','duration':'whileInPlay','condition':{'type':'selfDamaged'}}},
 ('38','Boost Gas'):{'type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'modifier','stat':'retreatCost','amount':-10,'scope':'self','duration':'whileInPlay','condition':{'type':'selfEnergyAtLeast','amount':1}}},
}
def ability(row,p):return ABILITIES.get((str(row[0]),p[0]))

TRAINERS={
 '72':('Item',{'type':'coinRepeatEffect','coins':2,'effect':SEARCH(1,kind='pokemon',stage='Basic')}),
 '73':('Supporter',Q(draws(3),draws(2))),
 '78':('Supporter',{'type':'handShuffle','side':'both','draw':4}),
 '81':('Item',{'type':'forceOpponentSwitch','chooseBy':'defender'}),
 # This print permits Stage 1 OR Stage 2 from a Basic; current engine only supports Stage 2.
 # Keep it gated until both printed destinations are legal.
 # '82':('Item',{'type':'rareCandy'}),
 '80':('AttachedTrainer',{'type':'modifier','stat':'postWeaknessAttackDamage','amount':10,'duration':'whileInPlay','scope':'self'}),
 'TWO':('Item',{'type':'shuffleDeck'}),
}
