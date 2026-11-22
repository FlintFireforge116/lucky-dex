"""Fates Collide xy10 — conservative reuse of verified XY9/XY8 Classic effects.

Every print is resolved by (official card number, exact attack title). Never
conflate same-name cards or mark partial printed effects as battle-enabled.
Complex Fossil, global effects and delayed KO remain gated pending outcome tests.
"""
from xy8_verified import attack as generic_attack
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw: {'type':t,**kw}
ATK={
 ('1','Hide a Berry'):S(DRAW(2),E('xy10HandToDeckBottom',side='self')),
 ('1','Wrap'):Q(ST('paralysis')),
 ('3','Solar Ray'):H(20,'selfAll'),
 ('3','Leaf Cutter'):Q(BONUS(30)),
 ('7','Coil'):S(E('nextAttackBonus',attackName='Coil',amount=60),E('nextAttackBonus',attackName='Slashing Strike',amount=60)),
 ('7','Slashing Strike'):E('lock',action='attack',attackName='Slashing Strike',target='selfActive',duration='nextOwnTurn'),
 ('5','Blot'):H(10),
 ('8','Find a Friend'):SEARCH(1,kind='pokemon'),
 ('10','Tail Whip'):Q(E('attackCoinGate',target='opponentActive',duration='opponentTurn')),
 ('11','Invite Out'):Q(E('forceOpponentSwitch',chooseBy='attacker')),
 ('12','Destructive Flame'):Q(DISC(1,'opponentActive')),
 ('13','Psystorm'):E('energyDamage',source='both',allInPlay=True,amount=20,mode='replace'),
 ('16','Freezing Breath'):Q(ST('paralysis'),ST('sleep')),
 ('20','Second Bite'):E('damageFromDamage',source='opponent',amount=1,mode='add'),
 ('20','Crystal Ray'):E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':['Stage 1','Stage 2','BREAK','Level-Up']}),
 ('21','Burning Icicles'):E('multiTargetDamage',target='opponentBench',amount=20,count=2,upTo=True,condition={'type':'selfHasEnergyType','energyType':'Fire'}),
 ('21','Blizzard Burn'):E('lock',action='attack',target='selfActive',duration='nextOwnTurn'),
 ('22','Swing Around'):COIN(2,20,False),
 ('26','Zen Force'):E('damageFromDamage',source='opponent',amount=3,mode='add'),
 ('27','Division'):E('benchFromDeck',amount=2,choose=True,filter={'kind':'pokemon','name':'Koffing'}),
 ('28','Thick Liquid'):S(ST('confusion','selfActive'),ST('poison','selfActive'),ST('confusion'),ST('poison')),
 ('28','Balloon Bomb'):E('coinRepeatEffect',coins=2,effect=E('discardTop',side='opponent',amount=2)),
 ('31','Knock Back'):E('forceOpponentSwitch',chooseBy='defender'),
 ('33','Mini Link'):BONUS(30,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Solosis'}}),
 ('34','Double Link'):S(BONUS(30,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Solosis'}}),BONUS(60,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Duosion'}})),
 ('35','Link Fusion'):S(BONUS(30,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Solosis'}}),BONUS(60,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Duosion'}}),BONUS(90,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Reuniclus'}})),
 ('39','Cling'):E('drain'),
 ('39','X-Scissor'):Q(BONUS(60)),
 ('40','Reckless Charge'):E('selfDamage',amount=10),
 ('41','Mountain Munch'):E('discardTop',side='opponent',amount=1),
 ('42','Thrash'):Q(BONUS(20),E('selfDamage',amount=20)),
 ('43','Bedrock Press'):GUARD(20),
 ('44','Twin Bursts'):BONUS(60,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Mothim'}}),
 ('48','Backflip'):DRAW(1),
 ('48','Wicked Jab'):Q(ST('paralysis')),
 ('52','Lookout'):E('forceOpponentSwitch',chooseBy='attacker'),
 ('52','Aura Break'):E('lock',action='attack',target='opponentActive',duration='opponentTurn',condition={'type':'opponentMatches','filter':{'subtype':['Darkness','Fairy']}}),
 ('53','Rumble'):LOCK(),
 ('53','Geostrike'):E('benchDamage',side='self',amount=10,all=True),
 ('54','Land\'s Pulse'):BONUS(20,{'type':'stadiumInPlay'}),
 ('54','Cell Storm'):H(30),
 ('58','Bone Drop'):E('selectedDamage',target='opponentPokemon',amount=60,filter={'hasAbility':True}),
 ('59','Strike Back'):E('damageFromDamage',source='self',amount=2,mode='replace'),
 ('59','Iron Head'):COIN('untilTails',20,False),
 ('60','Iron Defense'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('63','Vacuum Wave'):E('damageRule',ignoreWeakness=True,ignoreResistance=True),
 ('63','Fight Alone'):E('xy10FieldDeficitDamage',amount=60),
 ('66','Expand'):GUARD(30),
 ('67','Mimic'):E('handShuffle',draw='opponentHandCount'),
 ('67','Juggling'):COIN(4,20),
 ('69','Mist Purge'):S(BONUS(30,{'type':'selfHasSpecialEnergy'}),E('heal',target='selfAll',amount=30,condition={'type':'selfHasSpecialEnergy'})),
 ('72','Wonder Stage'):BONUS(50,{'type':'stadiumInPlay'}),
 ('73','Big Storm'):E('discardStadium'),
 ('74','Turmoil Strike'):E('selectedDamage',target='opponentPokemon',amount=50,filter={'damaged':True}),
 ('76','Jet Draft'):E('neoRule',rule='xy8:derail'),
 ('77','Swallow'):E('drain'),
 ('78','Intensifying Burn'):BONUS(60,{'type':'opponentEx'}),
 ('79','Flash of Destruction'):DISC(2),
 ('80','Round'):E('neoRule',rule='xy9:round'),
 ('81','Stomp'):Q(BONUS(40)),
 ('82','Ambush'):Q(BONUS(40)),
 ('83','Powerful Gain'):S(BONUS(60,{'type':'xy8HealedThisTurn'}),E('heal',target='self',amount=30,condition={'type':'xy8HealedThisTurn'})),
 ('83','Shining Wind'):E('weaknessGuard',duration='opponentTurn'),
 ('84','Drain Slap'):H(20),
 ('84','Do the Wave'):E('benchCountDamage',side='self',amount=10,mode='add'),
 ('85','Magical Symphony'):E('multiTargetDamage',target='opponentBench',amount=50,count=1,upTo=True,condition={'type':'supporterPlayed'}),
 ('86','Cleaning Up'):E('discardTool',target='opponentPokemon',amount=1),
 ('88','Covet'):S(E('revealHand',side='opponent'),E('xy10HandToDeckBottom',side='opponent')),
 ('89','Sweeping Cure'):E('chooseTarget',target='selfBench',effect=H(90,'selfPokemon')),
 ('89','Knock Away'):Q(BONUS(30)),
 # Source-number inheritance of true alternate-art prints, never by same-name alone.
}
for src,alternates in [('20',['116']),('25',['117','125']),('26',['118']),('55',['119']),('64',['120']),('69',['121']),('73',['122']),('83',['123']),('43',['43a']),('54',['54a'])]:
 for (number,title),effect in list(ATK.items()):
  if number==src:
   for alt in alternates:ATK[(alt,title)]=effect

# Simple deterministic card descriptions are routed through the mature XY8
# parser. Unknown printed sentences MUST remain gated by the generator.
TRAINERS={
 '90':('Tool',N), # Alakazam Spirit Link: matching-Mega turn exemption
 '91':('Tool',N), # Altaria Spirit Link
 '92':('Tool',N), # Audino Spirit Link
 '93':('Tool',E('preventEffects',scope='self',duration='whileInPlay')),
 '99':('Item',E('chooseTarget',target='selfPokemon',filter={'hasEnergyType':'Fairy'},effect=H(50,'selfPokemon'))),
 '100':('Stadium',E('modifier',stat='retreatCost',amount=-99,scope='both',duration='whileInPlay',filter={'hasEnergyType':'Fairy'})),
 '103':('Supporter',E('fieldCountDraw',side='opponent',benchOnly=True,filter={'stage':'Basic'})),
 '109':('Item',E('revealUntilMatching',filter={'kind':'trainer','trainerType':'Supporter'})),
 '105':('Supporter',E('handShuffle',side='both',draw='pointsRemaining')),
 '105a':('Supporter',E('handShuffle',side='both',draw='pointsRemaining')),
 '112':('Supporter',E('coinRepeatEffect',coins=2,effect=E('discardTop',side='opponent',amount=2))),
 '124':('Supporter',E('coinRepeatEffect',coins=2,effect=E('discardTop',side='opponent',amount=2))),
 '107':('Supporter',SEARCH(2,kind='pokemon',stage='Basic')),
 '111':('Supporter',E('handShuffle',draw=5)),
 '111a':('Supporter',E('handShuffle',draw=5)),
 # Scorched Earth and Ultra Ball must be tested for physical Energy from hand;
 # they are not mapped as generic search/draw because the cost matters.
}
ABILITIES={
 'Serpentine Strangle':{'type':'triggered','event':'evolved','effect':Q(ST('paralysis'))},
 'Sparkle Veil':{'type':'passive','activeOnly':True,'effect':E('modifier',stat='damageReduction',amount=30,scope='team',duration='whileActive')},
 'Regi Power':{'type':'passive','effect':E('xy10RegiPower')},
 'Pressure':{'type':'passive','activeOnly':True,'effect':E('xy10LugiaPressure')},
}
ENERGIES={
 '114':E('specialEnergy',provides={'Colorless':2}),
 '115':E('specialEnergy',provides={'Fighting':1}),
 # Strong Energy's +20 bonus needs a correctly scoped continuous hook;
 # retain it gated until validated against physical attachment, off-type and stacking.
}

def attack(row,printed_attack):
 number,title=str(row[0]),printed_attack[0]
 effect=ATK.get((number,title))
 if effect is not None:return effect
 return generic_attack(['_xy10_generic_',*list(row)[1:]],printed_attack)
