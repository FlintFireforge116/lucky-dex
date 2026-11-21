"""Furious Fists XY3: conservative printed-text contract.

No invented effects: when a printed Ability, Trainer, attack, Tool or Special
Energy needs a handler the shared engine cannot yet prove, gate that print.
Keep every print discoverable in the source catalogue for subsequent passes.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
E=lambda typ,**kw:{'type':typ,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
# Use real, already implemented shared effects; no XY3-only neoRule stubs.
ATTACKS={
 ('1','Knock Off'):E('shuffleRandomHandCard',side='opponent'), # corrected below: print DISCARD, not shuffle -> gated
 ('2','Spit Poison'):ST('poison'),
 ('3','Spiral Drain'):H(30),
 ('4','Guard Press'):GUARD(20),
 ('7','Soothing Scent'):ST('sleep'),
 ('7','Magical Leaf'):Q(S(BONUS(30),H(30))),
 ('8','Jump On'):Q(BONUS(10)),
 ('10','Ember'):DISC(1,typ='Fire'),
 ('11','Flame Charge'):E('neoRule',rule='xy1:flameCharge'),
 ('11','Twin Bursts'):BONUS(80,{'type':'pokemonPresent','side':'self','zone':'bench','filter':{'name':'Electivire'}}),
 ('12','Quick Attack'):Q(BONUS(30)),
 ('13','Midair Strike'):Q(BONUS(20)),
 ('14','Clutch'):LOCK(),
 ('15','Spiral Current'):S(ST('confusion'),LOCK()),
 ('16','Finishing Blow'):BONUS(50,{'type':'opponentDamaged'}),
 ('17','Steamroll'):E('multiTargetDamage',target='opponentBench',count=1,amount=30,upTo=True),
 ('17','Submission'):E('selfDamage',amount=30),
 ('19','Blizzard'):E('benchDamage',side='opponent',all=True,amount=10),
 ('19','Ice Edge'):Q(BONUS(30)),
 ('20','Quaking Punch'):E('actionLock',cardType='Item',side='opponent',duration='opponentTurn'),
 ('20','Grenade Hammer'):E('multiTargetDamage',target='selfBench',count=2,amount=30),
 ('21','Fury Swipes'):COIN(3,10),
 ('22','Igloo Hold'):E('retreatCostDamage',amount=20),
 ('22','Mountain Drop'):BONUS(40,{'type':'stadiumInPlay'}),
 ('23','Bubble'):Q(ST('paralysis')),
 ('24','Reverse Thrust'):SWITCH(),
 ('24','Splash Cannon'):E('energyDamage',source='self',energyType='Water',amount=20),
 ('27','Thunder Shock'):Q(ST('paralysis')),
 ('28','Thunder Shock'):Q(ST('paralysis')),
 ('29','Ambush'):Q(BONUS(20)),
 ('30','Gigavolt'):Q(BONUS(30),ST('paralysis')),
 ('31','Electric Tail'):Q(ST('paralysis')),
 ('33','Raging Thunder Punch'):BONUS(30,{'type':'opponentHasTool'}),
 ('33','Lightning Slam'):E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='Lightning Slam'),
 ('34','Entrainment'):E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Basic'}),
 ('34','Energy Short'):E('energyDamage',target='opponent',amount=20),
 ('36','Hypnoblast'):ST('sleep'),
 ('37','Hug'):LOCK(),
 ('38','Poison Sting'):Q(ST('poison')),
 ('39','Psy Bolt'):Q(ST('paralysis')),
 ('41','Psy Report'):E('revealHand',side='opponent'),
 ('42','Rock Smash'):Q(BONUS(30)),
 ('43','Wreck'):BONUS(60,{'type':'stadiumInPlay'}),
 ('46','Machamp Crush'):E('modifier',stat='damageReduction',amount=40,scope='opponentActive',duration='opponentTurn'),
 ('47','Stretch Kick'):E('multiTargetDamage',target='opponentBench',count=1,amount=30,upTo=True),
 ('48','Bullet Punch'):COIN(2,20,False),
 ('49','Quick Draw'):DRAW(1),
 ('49','Helicoptero'):SWITCH(),
 ('50','Giga Drain'):E('drain'),
 ('50','Sky Uppercut'):E('damageRule',ignoreResistance=True),
 ('53','Mountain Munch'):E('discardTop',side='opponent',amount=1),
 ('54','Missile Jab'):E('damageRule',ignoreResistance=True),
 ('54','Corkscrew Smash'):E('drawToHandSize',size=6),
 ('5','Big Bang Horn'):E('selfDamagePenalty',amount=1),
 ('55','Rising Fist'):DISC(1,target='opponentActive'),
 ('55a','Rising Fist'):DISC(1,target='opponentActive'),
 ('56','Lunge'):E('coinAttackGate',heads=N),
 ('57','Aero Turn'):E('returnToHand',target='self',returnBasicEnergy=True),
 ('58','Shout of Power'):E('attachEnergyFromDiscard',target='selfBench',amount=1,basicOnly=True),
 ('60','Comet Punch'):COIN(4,10),
 ('61','Crunch'):Q(DISC(1,target='opponentActive')),
 ('62','Chew Up'):BONUS(90,{'type':'opponentHasSpecialEnergy'}),
 ('62','Giga Impact'):E('lock',action='attack',target='self',duration='nextOwnTurn'),
 ('63','Flying Press'):E('attackRequirement',condition={'type':'opponentEx'}),
 ('64','Moonsault Stomp'):BONUS(40,{'type':'stadiumInPlay'}),
 ('65','Venoshock'):BONUS(40,{'type':'opponentStatus','status':'poison'}),
 ('65','Venomous Fang'):ST('poison'),
 ('67','Machine Gun Headbutt'):S(COIN(3,50),ST('confusion','self')),
 ('68','Hammer Arm'):E('discardTop',side='opponent',amount=1),
 ('69','Moonlight'):H(30),
 ('70','Moonblast'):E('modifier',stat='damageReduction',amount=10,scope='opponentActive',duration='opponentTurn'),
 ('71','Follow Me'):E('forceOpponentSwitch',chooseBy='attacker'),
 ('71','Moonblast'):E('modifier',stat='damageReduction',amount=30,scope='opponentActive',duration='opponentTurn'),
 ('72','Echoed Voice'):E('nextAttackBonus',attackName='Echoed Voice',amount=50),
 ('73','Fairy Lock'):LOCK(),
 ('75','Charge Energy'):E('neoRule',rule='xy1:professorsLetter'),
 ('76','Sand Sweep'):H(30,'selfAll'),
 ('77','Boomburst'):E('benchDamage',side='opponent',amount=30,all=True),
 ('78','Lunge'):E('coinAttackGate',heads=N),
 ('79','Lickichop'):COIN('untilTails',30,False),
 ('81','Big Yawn'):S(ST('sleep'),ST('sleep','self')),
 ('82','Reckless Charge'):Q(t=E('selfDamage',amount=20)),
 ('83','Amnesia'):E('chooseAttackLock',side='opponent'),
 ('83','Knuckle Sandwich'):DISC(),
 ('85','Thorough Crunch'):E('coinDiscardEnergyDamage',coins=2,damage=0),
 ('86','Push Down'):E('chooseOption',options=[{'label':'Switch opponent Active','effect':E('forceOpponentSwitch',chooseBy='attacker')},{'label':'Leave opponent Active','effect':N}]),
 ('86','Twister Throw'):BONUS(60,{'type':'handSizesEqual'}),
}
for original,copy in [('4','105'),('20','106'),('54','107'),('74','108'),('5','112'),('55','113')]:
 for (n,title),effect in list(ATTACKS.items()):
  if n==original:ATTACKS[(copy,title)]=effect
# Effects below look similar to other mechanics but are NOT safely equivalent.
# Explicit gate them until their actual target/choice/conditional logic is ready.
for key in [('1','Knock Off'),('20','Grenade Hammer'),('34','Energy Short'),('43','Wreck'),
 ('46','Machamp Crush'),('58','Shout of Power'),('63','Flying Press'),('67','Machine Gun Headbutt'),
 ('77','Boomburst'),('83','Amnesia'),('85','Thorough Crunch'),('34','Entrainment'),('57','Aero Turn'),('4','Guard Press'),('105','Guard Press'),
 ('70','Moonblast'),('71','Moonblast')]:
 ATTACKS.pop(key,None)
# Some Ability text cannot be implemented through the generic passive descriptor
# without an additional global hook, so these prints are deliberately gated.
ABILITIES={}
TRAINERS={
 '88':('Supporter',E('drawToHandSize',matchSide='opponent')),
 '89':('Item',E('neoRule',rule='aquapolis:energySwitch')),
 '93':('Item',E('removeStatus',target='selfActive')),
 '100':('Item',E('neoRule',rule='expedition:superScoopUp')),
 '109':('Supporter',E('drawToHandSize',matchSide='opponent')),
}
GATE={
 '1':'Knock Off must randomly discard an actual opponent-hand card, not shuffle it.',
 '3':'Wafting Scent needs optional exact Grass Energy discard and dual Confusion/Poison on activation.',
 '4':'Guard Press is a timed damage reduction and Giga Power an optional choice with recoil.',
 '5':'Mega Heracross must not be auto-built while its required Heracross-EX print is gated.',
 '105':'Secret Rare Heracross-EX shares the unresolved timed reduction and optional attack choice.',
 '106':'Full-art Seismitoad-EX needs real Item-lock and selected self-Bench damage.',
 '112':'Secret Rare Mega Heracross cannot be legal without the gated Heracross-EX base.',
 '9':'Afterimage Strike needs conditional, on-hit prevention for the following turn.',
 '14':'Burning Shot needs 2 Energy discarded, exact opposing target choice and KO timing.',
 '18':"King's Song changes attack costs for the whole Poliwag family.",
 '20':'Quaking Punch must actually prevent Items and Grenade Hammer damages two chosen friendly Bench Pokémon.',
 '25':'Restored Amaura must be Benched through a legal named Sail Fossil or Fossil Researcher effect.',
 '61':'Restored Tyrunt must be Benched through a legal named Jaw Fossil or Fossil Researcher effect.',
 '62':'Tyrantrum requires a legally playable Restored Tyrunt chain.',
 '26':'Ice Shield reduces all incoming damage to eligible Water Pokémon with Water Energy.',
 '30':'Tag Team Spark needs actual Energy on Magmortar and Gigavolt needs a visible flip.',
 '31':'Positive Hand requires an optional basic Energy discard from hand.',
 '32':'Negative Discard recovers two actual Basic Energy from the discard zone.',
 '34':'Entrainment must Bench up to two chosen Basics and Energy Short counts defending Energy units.',
 '35':'Sinister Suggestion changes all opponent flips to tails during their next turn.',
 '36':'Hand Control must compel an opponent Supporter, with attacking-player choices.',
 '37':'Victory Kiss requires once-per-turn Bench activation with choice.',
 '40':'Fortunate Eye must reveal and reorder five cards from opponent deck.',
 '41':'Teleport Room replaces Stadium by name from physical discard.',
 '43':'Wreck must discard Stadium after applying its damage bonus.',
 '46':'Fighting Fury globally buffs all Fighting Pokémon attacks by 20.',
 '52':'Thick Fat requires attacker-type conditional 30 reduction.',
 '55':'Rising Fist needs chosen opposing physical Energy discard.',
 '55a':'Rising Fist needs chosen opposing physical Energy discard.',
 '57':'Aero Turn must return the entire evolution stack and attachments to hand.',
 '58':'Shout of Power attaches a real discarded Basic Energy to chosen Benched Pokémon.',
 '59':'Bad-Influence Evolution is conditional on a Dark Pokémon on Bench.',
 '63':'Shining Spirit suppresses attack Weakness and Resistance for Hawlucha.',
 '64':'Counterattack needs a damage response even when Hawlucha-EX is KO.',
 '67':'Machine Gun Headbutt must Confuse after damage/coin animation.',
 '68':'Clobber needs optional discard of an actual Item from hand.',
 '72':'Curly Ribbon moves a chosen Energy to opposing Bench.',
 '73':'Secret Key changes Fairy Pokémon resistance to -40.',
 '74':'Bust In needs on-Bench-play Energy transfer and optional Active switch.',
 '76':'Rainbow Shower must attach multiple physical Basic Energy from hand to chosen Pokémon.',
 '77':'Boomburst damages entire opposing board including Active, and Echolocation reacts to incoming attacks.',
 '79':'Knock Off must discard a random real card from opponent hand.',
 '80':'Energy Evolution requires an actual attachment-triggered type-matched Eeveelution evolution.',
 '83':'Amnesia needs chosen attack lock that persists into opponent turn.',
 '84':'Safety Check must inspect a facedown Prize card without revealing it to opponent.',
 '85':'Held-Item Inspection chooses Item from opponent hand and shuffles it into deck.',
 '90':'Fighting Stadium gives both players +20 only versus Pokémon-EX.',
 '91':'Focus Sash prevents KO at full HP for attached Fighting Pokémon.',
 '92':'Fossil Researcher must Bench a chosen combination of Amaura and Tyrunt, not generic Pokémon.',
 '94':'Jaw Fossil searches bottom 7 real deck cards, specifically Tyrunt.',
 '95':'Korrina must select Fighting Pokémon plus Item with correct choices.',
 '96':'Maintenance must shuffle exactly two chosen hand cards, then draw one.',
 '97':'Mountain Ring globally prevents all Bench attack damage.',
 '98':'Sail Fossil searches bottom 7 real deck cards, specifically Amaura.',
 '99':'Sparkling Robe blocks and cures all Special Conditions.',
 '101':'Tool Retriever must return up to two chosen attached Pokémon Tools.',
 '102':'Training Center adds 30 max HP to Stage 1 and Stage 2 both sides.',
 '103':'Herbal Energy only attaches to Grass and heals 30 on attachment.',
 '104':'Strong Energy only attaches to Fighting and adds 20 attack damage.',
 '108':'Bust In needs on-Bench-play Energy transfer and optional Active switch.',
 '110':'Fossil Researcher needs proper named Bench candidates.',
 '111':'Korrina needs Fighting Pokémon and Item choice.',
 '113':'Rising Fist requires selected opposing Energy discard.',
}
# Dynamic printed-effects parsers: only exact cases validated by the shared engine.
def attack(row,a):
 n,title=str(row[0]),a[0]
 if (n,title) in ATTACKS:return ATTACKS[(n,title)]
 t=(a[3] or '').strip()
 if not t:return N
 m=re.fullmatch(r"(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r"Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',t)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',t)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip a coin\. If tails, this attack does nothing\.',t)
 if m:return E('coinAttackGate',heads=N)
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',t)
 if m:return H(int(m[1]))
 if t=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if t=='Discard an Energy attached to this Pokémon.':return DISC()
 if t=='Your opponent\'s Active Pokémon is now Poisoned.':return ST('poison')
 if t=='Your opponent\'s Active Pokémon is now Asleep.':return ST('sleep')
 if t=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
 if t=='This Pokémon does 30 damage to itself.':return E('selfDamage',amount=30)
 if t=='This Pokémon does 20 damage to itself.':return E('selfDamage',amount=20)
 if t=='Draw a card.':return DRAW(1)
 if t=='Discard the top card of your opponent\'s deck.':return E('discardTop',side='opponent',amount=1)
 return None
