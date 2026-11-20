"""Boundaries Crossed: print-grounded effects, no invented Energy or Prize cards.
Repeated print text may borrow a previously audited generic effect; bespoke rules
route to bw7: handlers in the shared battle engine.
"""
import json,re
from pathlib import Path
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
import bw6_verified as B6
R=lambda x:{'type':'neoRule','rule':'bw7:'+x}
ROOT=Path(__file__).resolve().parents[1]
REUSABLE=json.loads((ROOT/'data/classic/bw7-reusable-effects.json').read_text())
A={
 ('2','Foul Odor'):S(ST('confusion','self'),ST('confusion')),
 ('3','Pollen Spray'):S(ST('sleep'),ST('poison')),
 ('4','Grass Knot'):R('grassKnot'),
 ('4','Petal Dance'):S(COIN(3,50),ST('confusion','self')),
 ('6','Hundred Furious Lashes'):R('hundredFurious'),
 ('8','Giga Horn'):R('gigaHorn'),
 ('10','Leaf Drain'):Q(H(30)),
 ('15','Fluffy Tag'):R('fluffyTag'),
 ('17','Magical Leaf'):Q(S(BONUS(30),H(30))),
 ('18','Draw In'):R('drawInFire'),
 ('20','Split Bomb'):{'type':'multiTargetDamage','target':'opponentPokemon','count':2,'amount':40,'activeWeaknessResistance':True},
 ('23','Relentless Flames'):COIN('untilTails',30),
 ('28','Continuous Tumble'):COIN('untilTails',20),
 ('28','Damage Counterpunch'):BONUS(60,{'type':'selfDamaged'}),
 ('31','Hydro Pump'):{'type':'energyDamage','source':'self','energyType':'Water','amount':10,'mode':'add'},
 ('33','Firefighting'):R('firefighting'),
 ('34','Confuse Ray'):ST('confusion'),
 ('35','Amnesia'):{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},
 ('37','Deep Dive'):R('deepDive'),
 ('38','Present'):Q(SEARCH(1)),
 ('43','Defog'):R('defog'),
 ('54','Electriwave'):BENCH(30,'opponent'),
 ('60','Extrasensory'):R('extrasensory'),
 ('61','Confuse Ray'):ST('confusion'),
 ('62','Astonish'):R('astonish'),
 ('69','Telekinesis'):R('telekinesis'),
 ('69','Dream Waltz'):R('dreamWaltz'),
 ('71','Jet Woofer'):R('jetWoofer'),
 ('74','Venoshock'):R('venoshock'),
 ('76','Destructive Beam'):Q(DISC(1,'opponentActive')),
 ('77','Echoed Voice'):B6.B4.R('echoedVoice'),
 ('79','Earthquake'):BENCH(10,'self'),
 ('81','Poison Ring'):S(ST('poison'),LOCK()),
 ('83','Smithereen Smash'):Q(DISC(1,'opponentActive')),
 ('89',"Land's Judgment"):R('landsJudgment'),
 ('90','Captivate'):Q({'type':'forceOpponentSwitch','chooseBy':'attacker'}),
 ('91','Tail Trickery'):ST('confusion'),
 ('91','Assist'):Q(R('assist')),
 ('94','Steel Slash'):R('steelSlash'),
 ('98','Sand Pulse'):BENCH(10,'opponent'),
 ('99','Flying Beatdown'):R('flyingBeatdown'),
 ('102','Damage Rush'):COIN('untilTails',20),
 ('103','Dragon Stream'):Q(R('dragonStream')),
 ('103','Ice Burn'):S({'type':'discardEnergyCard','target':'self','amount':2,'energyType':'Fire','strictEnergyType':True},ST('burn')),
 ('105','Gnaw Through'):R('gnawThrough'),
 ('105','Super Fang'):R('superFang'),
 ('111','Double Draw'):DRAW(2),
 ('114','Gather Energy'):R('gatherEnergy'),
 ('117','Healing Melody'):Q(R('healingMelody')),
 ('118','Patrol'):{'type':'reorderTop','count':3,'deckSide':'self'},
 ('119','Psych Up'):R('psychUp'),
 ('125','Air Slash'):Q(t={'type':'discardEnergyCard','target':'self','amount':1}),
 ('126','Hip Bump'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('67','Psychic Protection'):{'type':'weaknessGuard','target':'self','duration':'opponentTurn'},
 ('143','Psychic Protection'):{'type':'weaknessGuard','target':'self','duration':'opponentTurn'},
 ('150','Ghost Hammer'):{'type':'weaknessGuard','target':'self','duration':'opponentTurn'},
}
for dst,src in [('141','9'),('142','49'),('143','67'),('144','89'),('145','101'),('146','103')]:
 for (n,title),eff in list(A.items()):
  if n==src:A[dst,title]=eff
A.update({
 ('144',"Land's Judgment"):R('landsJudgment'),
 ('146','Dragon Stream'):Q(R('dragonStream')),
 ('146','Ice Burn'):S({'type':'discardEnergyCard','target':'self','amount':2,'energyType':'Fire','strictEnergyType':True},ST('burn')),
 ('89','Hammerhead'):R('hammerhead'),('144','Hammerhead'):R('hammerhead'),
 ('101','Freeze Shock'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'},
 ('145','Freeze Shock'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'},
 ('25','Firebreathing'):Q(BONUS(20)),('26','Firebreathing'):Q(BONUS(30)),
 ('35','Aquafall'):{'type':'discardEnergyCard','target':'self','amount':'all'},
 ('20','Scorching Fire'):{'type':'discardEnergyCard','target':'self','amount':1,'energyType':'Fire','strictEnergyType':True},
 ('119','Hypnoblast'):ST('sleep'),
 ('16','Sleep Powder'):Q(ST('sleep')),
 ('18','Flare'):N,
 ('57','Flame Charge'):{'type':'neoRule','rule':'bw1:flameCharge'},
 ('151','Retaliate'):BONUS(60,{'type':'koByOpponentAttackLastTurn'}),
 ('66','Revenge'):BONUS(70,{'type':'koByOpponentAttackLastTurn'}),
 ('49','Secret Sword'):{'type':'energyDamage','source':'self','energyType':'Water','amount':20,'mode':'add'},
 ('142','Secret Sword'):{'type':'energyDamage','source':'self','energyType':'Water','amount':20,'mode':'add'},
 ('95','Claw'):{'type':'coinAttackGate','heads':N},
 ('115','Whimsy Tackle'):{'type':'coinAttackGate','heads':N},
 ('123','Razor Wind'):{'type':'coinAttackGate','heads':N},
 ('54','Shock Wave'):{'type':'damageRule','ignoreResistance':True},
 ('63','Shadow Punch'):{'type':'damageRule','ignoreResistance':True},
 ('37','Aqua Sonic'):{'type':'damageRule','ignoreResistance':True},
 ('43','Aerial Ace'):Q(BONUS(20)),
 ('41','Destructive Whirlpool'):{'type':'discardEnergyCard','target':'opponentActive','amount':1},
 ('41','Waterfall'):N,
 ('100','Flash Freeze'):{'type':'discardEnergyCard','target':'self','amount':1},
})
ABILITY={
 'Allergy Panic':{'type':'passive','effect':R('allergyPanic')},
 'Time Recall':{'type':'passive','effect':R('timeRecall')},
 'Shell Shield':{'type':'passive','effect':R('shellShield')},
 'Deluge':{'type':'activated','oncePerTurn':False,'effect':R('deluge')},
 'Stickiness':{'type':'passive','effect':R('stickiness')},
 'Rush In':{'type':'activated','oncePerTurn':True,'effect':R('rushIn')},
 'Sinister Hand':{'type':'activated','oncePerTurn':False,'effect':R('sinisterHand')},
 'Sparkling Particles':{'type':'triggered','event':'checkup','effect':R('sparklingParticles')},
 'Long-Distance Hypnosis':{'type':'activated','oncePerTurn':True,'effect':R('longDistanceHypnosis')},
 'Poison Point':{'type':'triggered','event':'damagedByAttack','opponentAttackOnly':True,'activeOnly':True,'effect':ST('poison','opponentActive')},
 'Sturdy':{'type':'passive','effect':R('sturdy')},
 'Sand Slammer':{'type':'triggered','event':'checkup','activeOnly':True,'effect':R('sandSlammer')},
 'Transform':{'type':'activated','oncePerTurn':False,'effect':R('transform')},
 'Sentinel':{'type':'passive','effect':R('sentinel')},
 'Busybody':{'type':'activated','fromHand':True,'oncePerTurn':True,'effect':R('busybody')},
 'Fight Song':B6.ABILITY['Fight Song'],
}
TRAINERS={
 '127':('Stadium',R('aspertiaCityGym')),
 '128':('Item',R('energySearch')),
 '129':('Item',{'type':'neoRule','rule':'bw2:greatBall'}),
 '130':('Supporter',R('hugh')),
 '131':('Item',R('pokeBall')),
 '132':('Item',{'type':'heal','target':'selfPokemon','amount':30}),
 '133':('Tool',R('rockyHelmet')),
 '134':('Supporter',R('skyla')),
 '135':('Item',{'type':'switch','side':'self'}),
 '136':('Item',R('townMap')),
 '137':('Item',R('computerSearch')),
 '138':('Tool',R('crystalEdge')),
 '139':('Tool',R('crystalWall')),
 '140':('Item',{'type':'heal','target':'selfActive','amount':90}),
 '147':('Supporter',{'type':'drawToHandSize','size':6}),
 '148':('Supporter',{'type':'draw','amount':3}),
 '149':('Supporter',R('skyla')),
 '153':('Tool',R('rockyHelmet')),
}
# Fail closed on explicitly blocked prints; avoid describing an unsupported
# card as complete without a real rule handler.
GATE={}

def _safe_reuse(text):
 for match in REUSABLE.get(text,[]):
  e=match.get('effect')
  if e and e.get('type') not in ('unsupported','noop') and e.get('type')!='neoRule':return e
 return None

def attack(row,a):
 n,title=str(row[0]),a[0];text=(a[3] or '').strip()
 if (n,title) in A:return A[(n,title)]
 if not text:return N
 m=re.fullmatch(r'(?:The )?Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',text)
 if m:return ST({'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',text)
 if m:return Q(ST({'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',text)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.',text)
 if m:return COIN('untilTails',int(m[1]))
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',text)
 if m:return H(int(m[1]))
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',text)
 if m:return {'type':'selfDamage','amount':int(m[1])}
 if text=='Discard an Energy attached to this Pokémon.':return {'type':'discardEnergyCard','target':'self','amount':1}
 if text=='This attack\'s damage isn\'t affected by Resistance.':return {'type':'damageRule','ignoreResistance':True}
 if text=='This attack\'s damage isn\'t affected by Weakness or Resistance.':return {'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}
 if text=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 if text=='Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.':return {'type':'forceOpponentSwitch','chooseBy':'defender'}
 if text.startswith('During your next turn, this Pokémon can\'t use') or text.startswith('This Pokémon can\'t use'):
  return {'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn','attackName':title}
 reused=_safe_reuse(text)
 if reused:return reused
 # A non-empty printed attack must NOT silently become noop.
 return None
