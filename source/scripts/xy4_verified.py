"""Phantom Forces xy4 conservative audit contract.

Every effect claimed FULL must correspond to a real implemented engine rule. New
mechanics that need global timing/choice hooks remain gated until completion.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
E=lambda t,**kw:{'type':t,**kw}
R=lambda k:E('neoRule',rule='xy4:'+k)
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
ATTACKS={
 ('2','Noxious Scales'):S(ST('confusion'),ST('poison')),
 ('4','Windfall'):E('handShuffle',draw=6),
 ('5','Nap'):H(20),
 ('7','Leaf Storm'):H(20,'selfAll'),
 ('10','Acrobatics'):COIN(2,30,False),
 ('10','Jet Shoot'):GUARD(-40),
 ('11','Roar'):E('forceOpponentSwitch',chooseBy='defender'),
 ('14','Guard Claw'):GUARD(20),
 ('15','Fury Strikes'):COIN(3,10),
 ('16','Crunch'):Q(DISC(1,'opponentActive')),
 ('17','Second Strike'):BONUS(80,{'type':'opponentDamaged'}),
 ('19','Neon Sign'):SEARCH(2,kind='pokemon'),
 ('20','Confuse Ray'):ST('confusion'),
 ('22','Surf'):N,
 ('23','Overrun'):E('multiTargetDamage',target='opponentBench',amount=20,count=1,upTo=True),
 ('23','Assault Laser'):BONUS(60,{'type':'opponentHasTool'}),
 ('24','Turbo Bolt'):R('turboBolt'),
 ('24a','Turbo Bolt'):R('turboBolt'),
 ('25','Pachi'):Q(BONUS(30)),
 ('26','Night March'):R('nightMarch'),
 ('27','Electroweb'):LOCK(),
 ('28','Tail Rap'):COIN(2,20,False),
 ('29','Quick Attack'):Q(BONUS(10)),
 ('31','Skill Dive'):E('selectedDamage',target='opponentPokemon',amount=10),
 ('32','Swoop Across'):R('swoopAcross'),
 ('33','Skill Dive'):E('selectedDamage',target='opponentPokemon',amount=30),
 ('34','Night Attack'):E('selectedDamage',target='opponentPokemon',amount=30),
 ('34','Dark Corridor'):S(ST('poison'),SWITCH()),
 ('35','Phantom Gate'):E('copyAttack',side='opponent',chooseBy='attacker'),
 ('36','Psychic Assault'):E('damageFromDamage',source='opponent',amount=1),
 ('38','Swallow Up'):R('swallowUp'),
 ('39','See Through'):E('revealHand',side='opponent'),
 ('39','Double Headbutt'):COIN(2,20),
 ('40','Dream Dance'):S(ST('sleep'),ST('sleep','self')),
 ('41','Trip Over'):Q(BONUS(10)),
 ('42','Night March'):R('nightMarch'),
 ('44','Night March'):R('nightMarch'),
 ('45','Horror Note'):E('handCountDamage',amount=10),
 ('46','Rock Cannon'):COIN('untilTails',20),
 ('47','Poison Jab'):Q(ST('poison')),
 ('49','Core Heal'):S(DISC(1,typ='Fighting'),H(50)),
 ('51','Ambush'):Q(BONUS(10)),
 ('52','Hypnoblast'):ST('sleep'),
 ('52','Nightmare Mambo'):BONUS(60,{'type':'opponentStatus','status':'sleep'}),
 ('53','Lunge'):E('coinAttackGate',heads=N),
 ('54','Crunch'):Q(DISC(1,'opponentActive')),
 ('55','Confuse Ray'):Q(ST('confusion')),
 ('56','Fake Out'):Q(ST('paralysis')),
 ('57','Gentle Bite'):E('modifier',stat='damageReduction',amount=60,scope='opponentActive',duration='opponentTurn'),
 ('57','Mach Claw'):E('damageRule',ignoreResistance=True),
 ('58','MAXamar'):R('maxamar'),
 ('59','Iron Wing'):DISC(1,typ='Metal'),
 ('62','Full Metal Impact'):DISC(2,typ='Metal'),
 ('63','Steel Drop'):BONUS(40,{'type':'stadiumInPlay'}),
 ('63','Steam Blast'):DISC(),
 ('64','Poke Through'):E('discardHand',side='opponent',amount=1),
 ('64','Spiral Rush'):COIN('untilTails',30,False),
 ('65','Slash Blast'):E('energyDamage',source='self',energyType='Metal',amount=20,mode='add'),
 ('65a','Slash Blast'):E('energyDamage',source='self',energyType='Metal',amount=20,mode='add'),
 ('66','Call for Family'):E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Basic'}),
 ('66','Dull Light'):ST('confusion'),
 ('67','Lead'):SEARCH(1,kind='trainer',trainerType='Supporter'),
 ('67','Bright Garden'):R('brightGarden'),
 ('68','Lick Away'):E('removeStatus',target='self'),
 ('69','Light Pulse'):E('preventEffects',target='self',duration='opponentTurn'),
 ('70','Nuzzle'):Q(ST('paralysis')),
 ('70','Spiral Drain'):H(20),
 ('71','Diamond Storm'):H(30,'selfAll'),
 ('72','Gnaw Off'):Q(BONUS(10)),
 ('73','Slam'):COIN(2,30),
 ('74','Crazy Headbutt'):DISC(),
 ('75','Gooey'):H(10),
 ('76','Gooey'):H(30),
 ('77','Dragon Pulse'):E('discardTop',side='self',amount=1),
 ('78','Whirlwind'):E('forceOpponentSwitch',chooseBy='defender'),
 ('79','Drill Peck'):N,
 ('80','Nap'):H(30),
 ('81','Charge Dash'):R('chargeDash'),
 ('82','Psybite'):BONUS(30,{'type':'selfHasEnergyType','energyType':'Psychic'}),
 ('83','Screaming Fit'):S(ST('confusion'),ST('confusion','self')),
 ('84','Energy Press'):E('energyDamage',source='opponent',amount=30,mode='add'),
 ('85','Boomburst'):R('boomburst'),
 ('86','Daunt'):E('modifier',stat='damageReduction',amount=40,scope='opponentActive',duration='opponentTurn'),
 ('88','Smithereen Smash'):Q(DISC(1,'opponentActive')),
 ('88','Earthquake'):E('benchDamage',side='self',amount=10,all=True),
 ('89','Quick Attack'):Q(BONUS(20)),
 ('90','Tight Jaw'):Q(ST('paralysis')),
}
for a,b in [('23','113'),('24','120'),('34','114'),('35','121'),('58','115'),('62','122'),('67','116')]:
 for (num,name),effect in list(ATTACKS.items()):
  if num==a:ATTACKS[(b,name)]=effect

# No silent interpretation of mandatory Ability effects. Metal Links, Night March
# and some entry effects will be promoted once their engine hooks are verified.
ABILITIES={
 'Metal Links':{'type':'activated','oncePerTurn':True,'benchOnly':True,'effect':R('metalLinks')},
}
# Trainer rules already represented by proven generic effects; named targets,
# Tools, global Stadiums and opponent attachments need dedicated follow-up logic.
TRAINERS={
 '93':('Stadium',N),
 '94':('Item',E('discardEnergyCard',target='opponentPokemon',amount=1)), # restricted below: special-only
 '96':('Item',E('revealHand',side='opponent')),
 '101':('Supporter',E('neoRule',rule='xy2:sycamore')),
 '103':('Item',Q(DRAW(3))),
 '104':('Supporter',E('handShuffle',draw=5)),
 '107':('Supporter',DRAW(3)),
 '109':('Item',E('searchChosen',source='discard',amount=1,filter={'kind':'trainer','trainerType':'Supporter'},excludePlayedTrainer=True)),
}
for source,alt in [('91','117'),('99','118'),('110','119')]:
 if source in TRAINERS:TRAINERS[alt]=TRAINERS[source]
# Enhanced Hammer would discard *any* Energy if enabled with a generic
# descriptor: leave the card gated until it selects Special Energy specifically.
TRAINERS.pop('94',None)
# Sycamore needs an exact discard-hand-to-7 draw, no unverified cross-set alias.
TRAINERS.pop('101',None)

GATE={
 '2':'Dizzying Wind requires a next-turn Trainer coin-gate on both types of Trainers.',
 '6':'Protect must prevent all effects as well as damage on the right turn.',
 '7':'Coordinate needs per-Bench Tool search and attachment choices.',
 '12':'Flare Command needs conditional Fire discard and a Bench switching choice.',
 '17':'Hyper Whirlpool repeats Energy discards per successful flip until tails.',
 '21':'Meddling must target the opponent discard and select exact attachments.',
 '24':'Turbo Bolt must recover exactly two Basic Energy from discard to one chosen Bench target.',
 '24a':'Turbo Bolt must recover exactly two Basic Energy from discard to one chosen Bench target.',
 '25':'Trick Sticker changes Weakness into next turn.',
 '30':'Parabolic Spark discards selectable Lightning Energy across board to calculate attack.',
 '32':'Sneaky Bite requires an on-evolution damage-counter placement choice.',
 '33':'Surprise Bite requires an on-evolution damage-counter placement choice.',
 '34':'Night Attack must place damage counters directly, ignoring Weakness and Resistance, on any opposing Pokémon.',
 '35':'Phantom Gate requires selecting and resolving the opponent’s real attack.',
 '36':'Bide Barricade suppresses non-Psychic Abilities across play/hand/discard.',
 '40':'Dream of Memories must select three distinct discarded cards.',
 '42':'Cursed Drop splits three damage counters across selected opposing Pokémon.',
 '43':'Fainting Spell responds to damage KO with a coin and counter-KO.',
 '45':'Gourgantic depends on attached Grass Energy and live maximum HP.',
 '47':'Submission Hold prevents manual Energy attachment to the defending Pokémon.',
 '50':'High Density Armor only prevents 50 at full HP.',
 '55':'B Cancel disables evolution of the defending Pokémon next turn.',
 '58':'Hyper Hypnosis requires optional sleep on attaching Energy from hand.',
 '61':'Metal Links requires a selected discarded Metal Energy and selected Bench target.',
 '62':'Chrono Wind needs the EX-only attack lock.',
 '65':'Mighty Shield blocks attacks by opposing Pokémon with Special Energy.',
 '65a':'Mighty Shield blocks attacks by opposing Pokémon with Special Energy.',
 '69':'Tasting needs once-per-turn activation and extra Active draw.',
 '71':'Sparkle needs the next-turn attack coin gate, both player/CPU.',
 '74':'Dark Impulse attaches discarded Darkness Energy to Active once per turn.',
 '77':'Slip Trip globally blocks hand Tool attachments.',
 '79':'Fly must prevent effects/damage on heads, and attack fails on tails.',
 '80':'Lucky Punch needs exactly seven cards in hand at attack time.',
 '81':'Tender Vengeance counts damage counters across Bench only on successful flip.',
 '91':'AZ requires discarding every attachment and returning an exact Pokémon.',
 '92':'Battle Compressor discards up to three selected physical deck cards.',
 '94':'Enhanced Hammer must target Special Energy only.',
 '95':'Gengar Spirit Link must prevent the specific Mega Evolution turn ending.',
 '97':'Head Ringer attaches to opposing EX and adds one Colorless attack cost.',
 '98':'Jamming Net attaches to opposing EX and reduces attack damage.',
 '99':'Lysandre’s Trump Card must shuffle both real discards excluding itself.',
 '100':'Manectric Spirit Link prevents its Mega Evolution turn ending.',
 '101':'Sycamore discards actual hand then draws exactly seven.',
 '102':'Robo Substitute is a special 30 HP Basic with no Prize and no retreat.',
 '105':'Steel Shelter globally prevents and removes conditions on Metal Pokémon.',
 '106':'Target Whistle moves a Basic from opponent discard onto opponent Bench.',
 '108':'Trick Coin rerolls an attack’s entire coin sequence once.',
 '110':'Xerosic discards a chosen Tool or Special Energy from either side.',
 '117':'AZ alternate art remains bound to the exact AZ effect.',
 '118':'Lysandre’s Trump Card alternate art must use the full discard-shuffle rule.',
 '119':'Xerosic alternate art must use the full selected Tool/Energy discard.',
 '114':'Gengar-EX alternate print shares the direct-counter Night Attack requirement.',
 '115':'Malamar-EX alternate print requires optional Hyper Hypnosis when attaching from hand.',
 '120':'Turbo Bolt must recover exactly two Basic Energy from discard to one chosen Bench target.',
 '121':'Phantom Gate requires selecting and resolving an opposing attack.',
 '122':'Dialga-EX alternate print shares the EX-only Chrono Wind attack-lock requirement.',
}
# The cards with existing reliable attack mappings but gated other mandatory
# mechanics remain collectible yet excluded from automated battle decks.

def attack(row,a):
 key=(str(row[0]),a[0]);t=(a[3] or '').strip()
 if key in ATTACKS:return ATTACKS[key]
 if not t:return N
 m=re.fullmatch(r"(?:Your opponent.s Active Pokémon|The Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return ST(STATUS[m[1]])
 m=re.fullmatch(r"Flip a coin\. If heads, (?:your opponent.s Active Pokémon|the Defending Pokémon) is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.",t)
 if m:return Q(ST(STATUS[m[1]]))
 m=re.fullmatch(r"Flip a coin\. If heads, this attack does (\d+) more damage\.",t)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r"Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.",t)
 if m:return COIN(int(m[1]),int(m[2]))
 if t=='Flip a coin. If tails, this attack does nothing.':return E('coinAttackGate',heads=N)
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.?',t)
 if m:return H(int(m[1]))
 if t=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if t=='Discard an Energy attached to this Pokémon.':return DISC()
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',t)
 if m:return E('selfDamage',amount=int(m[1]))
 if t=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 return None
