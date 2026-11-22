"""XY11 Steam Siege: print-specific, conservative mechanics-first mappings.

Blank printed attacks become real vanilla damage; other descriptions must
match a verified reusable handler or remain unplayable until a proper rule
implementation exists. Alternate artworks are cloned from their exact print.
"""
from xy8_verified import attack as generic_attack
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw: {'type':t,**kw}
ATK={
 ('2','Leaf Storm'):E('heal',target='selfAll',amount=40,filter={'subtype':'Grass'}),
 ('5','Fluffy Transport'):E('forceOpponentSwitch',chooseBy='attacker'),
 ('9','Bide'):Q(E('koGuard',target='self',mode='survive',remainingHp=10,duration='opponentTurn',attackOnly=True),N),
 ('5','Solar Step'):E('pointDamage',side='self',prizesRemaining=True,amount=20,mode='replace'),
 ('6','Scout'):E('revealHand',side='opponent'),
 ('7','Assault Boom'):BONUS(70,{'type':'opponentHasTool'}),
 ('8','Barrier Break'):E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
 ('10','Harden'):E('preventDamage',target='self',duration='opponentTurn',maxDamage=60),
 ('11','Extrasensory'):BONUS(60,{'type':'handSizesEqual'}),
 ('13','Crazy Spore'):S(ST('confusion'),ST('poison')),
 ('13','Strange Reaction'):E('status',status='paralysis',target='opponentActive',condition={'type':'opponentStatus','status':'confusion'}),
 ('15','Shimmering Scales'):Q(ST('confusion'),ST('paralysis')),
 ('15','Power Hurricane'):DISC('all'),
 ('16','Returning Flames'):SEARCH(2,source='discard',kind='energy',basicEnergy=True,subtype='Fire'),
 ('17','Fire Blast'):DISC(1,'self','Fire'),
 ('18','Ember'):Q(N,DISC(1,'self','Fire')),
 ('20','Flare Blitz'):DISC('all','self','Fire'),
 ('21','Flare Blitz'):DISC('all','self','Fire'),
 ('22','Lunge'):E('coinAttackGate',heads=N),
 ('23','Flame Charge'):E('xy11Rule',rule='flameCharge'),
 ('23','Incinerate'):E('xy11Rule',rule='incinerate'),
 ('24','Kaiser Tackle'):E('selfDamage',amount=50),
 ('25','Power Heater'):E('xy11Rule',rule='powerHeater'),
 ('27','Healing Wave'):E('xy11Rule',rule='healingWave'),
 ('27','Dwindling Wave'):E('selfDamagePenalty',amount=1,mode='add'),
 ('29','Sticky Shot'):S(E('modifier',stat='attackCost',amount=1,target='opponentActive',duration='opponentTurn'),E('modifier',stat='retreatCost',amount=1,target='opponentActive',duration='opponentTurn')) ,
 ('29','Water Pulse'):ST('sleep'),
 ('32','Pike'):E('multiTargetDamage',target='opponentBench',amount=30,count=1,upTo=True),
 ('35','Lock-On'):LOCK(), # Plus next-turn +120: gated STRICT.
 ('36','Ice Block'):H(30),
 ('37','Crunch'):Q(E('discardEnergyCard',target='opponentActive',amount=1)),
 ('37','Melting Floe'):E('xy11Rule',rule='meltingFloe'),
 ('38','Thunder Wave'):Q(ST('paralysis')),
 ('39','Thunder Shock'):Q(ST('paralysis')),
 ('40','Gigavolt'):Q(BONUS(40),ST('paralysis')),
 ('42','Double Thread'):E('multiTargetDamage',target='opponentPokemon',count=2,amount=30,benchWeaknessResistance=True),
 ('42','Electroweb'):LOCK(),
 ('43','Come Along'):E('benchFromDeck',amount=1,filter={'kind':'pokemon','name':'Nidoran ♀'}),
 ('44','Nido Press'):BONUS(40,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Nidorina'}}),
 ('45','Power Lariat'):E('fieldCountDamage',side='self',benchOnly=True,filter={'stage':['Stage 1','Stage 2']},amount=30,mode='add'),
 ('47','Eerie Wave'):ST('confusion'),
 ('48','Slightly Simmer'):E('xy11Rule',rule='slightlySimmer'),
 ('49','Flickering Flames'):ST('sleep'),
 ('52','Focus Energy'):E('nextAttackBonus',attackName='Flop',amount=40),
 ('50','Past Friends'):E('discardCountDamage',side='self',filter={'kind':'trainer','trainerType':'Supporter'},amount=10,mode='add'),
 ('51','Hyperspace Punch'):E('multiTargetDamage',target='opponentPokemon',amount=20,count=2,upTo=False),
 ('51','Portal Strike'):E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='Portal Strike'),
 ('53','Swagger'):Q(E('discardEnergyCard',target='opponentActive',amount=1)),
 ('53','Spirited Throw'):BONUS(60,{'type':'opponentHpGreater'}), # Engine compares remaining HP (not printed maximum).
 ('54','Thunder Wave'):Q(ST('paralysis')),
 ('55','Bounce Back'):E('forceOpponentSwitch',chooseBy='defender'),
 ('55','Rock Tomb'):LOCK(),
 ('56','X-Scissor'):Q(BONUS(20)),
 ('57','Guard Claw'):GUARD(30),
 ('58','Poison Up'):E('xy11Rule',rule='poisonUp'),
 ('59','Poison Jab'):Q(ST('poison')),
 ('60','Nyan Roll'):Q(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)),
 ('62','Nightmare'):ST('sleep'),
 ('63','Charge Order'):E('fieldCountDamage',side='self',amount=10,mode='replace',filter={'name':'Pawniard'}),
 ('66','Baleful Night'):E('benchDamage',side='opponent',all=True,amount=30,filter={'damaged':True}),
 ('64','Retaliate'):BONUS(60,{'type':'koByOpponentAttackLastTurn'}),
 ('64','Mach Claw'):E('damageRule',ignoreResistance=True),
 ('65','Oblivion Wing'):E('attachEnergyFromDiscard',target='selfBench',energyType='Darkness',amount=1),
 ('65','Darkness Blade'):Q(N,E('lock',action='attack',target='self',duration='nextOwnTurn')),
 ('67','Wild Edge'):OPT('Use Wild Edge boost (+50 damage and 20 recoil)',S(BONUS(50),E('selfDamage',amount=20))),
 ('67','Iron Tail'):COIN('untilTails',100),
 ('68','Canyon Axe'):BENCH(10),
 ('69','Rock Head'):GUARD(20),
 ('70','Fortress of Rage'):E('fieldCountDamage',side='self',benchOnly=True,filter={'damaged':True},amount=10,mode='add'),
 ('73','Gear Spinner'):E('nextAttackBonus',attackName='Gear Spinner',amount=70),
 ('74','Revenge Blast'):E('pointDamage',side='opponent',prizesTaken=True,amount=30,mode='add'),
 ('74','Quick Guard'):S(E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'Basic'}),E('lock',action='attack',target='self',attackName='Quick Guard',duration='nextOwnTurn')),
 ('75','Soul Blaster'):E('nextAttackBonus',attackName='Soul Blaster',amount=-60), # printed sets base to 60: gated STRICT.
 ('76','Bubble Drain'):H(10),
 ('77','Bubble Drain'):H(30),
 ('78','Link Blast'):BONUS(70,{'type':'equalEnergyCount'}),
 ('78','Luminous Blade'):DISC(),
 ('79','Despair Ray'):E('chooseDiscardForBonus',zone='bench',max=3,amount=10),
 ('81','Geomancy'):E('distributeEnergy',source='zone',target='selfBench',energyType='Fairy',amount=2,distinctTargets=True),
 ('81','Rainbow Spear'):DISC(),
 ('82','Life Stream'):E('energyDamage',source='self',amount=20,mode='replace',all=True),
 ('83','Proud Fang'):BONUS(60,{'type':'pokemonPresent','side':'opponent','zone':'inPlay','filter':{'stage':'BREAK'}}),
 ('83','Giga Claw'):E('coinAnyHeadsGate',coins=2),
 ('84','Roar'):E('forceOpponentSwitch',chooseBy='defender'),
 ('85','Double Hit'):COIN(2,20),
 ('85','Power Breath'):DISC(),
 ('86','Cruel Fang'):E('modifier',stat='attackDamage',amount=-40,scope='opponentActive',duration='opponentTurn'),
 ('87','Calamity Blast'):S(DISC(3),E('multiTargetDamage',target='opponentBench',amount=50,count=2,upTo=False)),
 ('88','Stall'):E('discardEnergyCard',target='opponentPokemon',amount=1), # first turn condition gated STRICT.
 ('89','Raid'):BONUS(30,{'type':'evolvedThisTurn'}),
 ('91','Furry Chance'):E('topDeckDiscardBonus',side='opponent',amount=60,filter={'kind':'energy'}),
 ('93','Sky Drop'):E('xy11Rule',rule='skyDrop'),
 ('90','Fiddle Around'):E('reorderTop',deckSide='opponent',count=3), # Shared exact selectable top-three ordering.
 ('91','Double Hit'):COIN(2,50),
 ('92','Reckless Charge'):E('selfDamage',amount=10),
 ('93','Ambush'):Q(BONUS(50)),
 ('26','Volcanic Heat'):E('lock',action='attack',target='selfActive',duration='nextOwnTurn'),
 ('97','Acrobatics'):COIN(2,20,False),
}
# These descriptors look similar to existing effects but miss essential
# printed targeting, gating, or timing clauses and MUST NOT be marked ready.
STRICT={
 ('11','Wicked Wind'),
 ('20','Flare Up'),
 ('32','Ultimate Blade'),('35','Lock-On'),
 ('45','Power Lariat'),('46','Transfer Pain'),
 ('47','Burst Curse'),('49','Mirror Mirror'),
 ('57','Rushing Water'),
 ('62','Damage Play'),
 ('70','Counter Head'),('73','Gear Spinner'),
 ('75','Soul Blaster'),
 ('86','Dark Burn'),
 ('88','Stall'),
 ('96','Aero Blitz'),
}
# Reuse exact printed-equivalent trainers, never generic probabilistic guesses.
TRAINERS={
 '99':('Item',S(E('revealHand',side='opponent'),E('benchBasicsFromOpponentHand'))),
 '105':('Item',E('xy11Rule',rule='specialCharge')),
 '98':('Item',E('xy10Final',rule='fossilBottom',name='Shieldon')),
 '100':('Item',E('xy10Final',rule='fossilBottom',name='Anorith')),
 '101':('Tool',N), # Spirit Link: shared Mega turn rule needs XY11 entry.
 '106':('Tool',N),
 '114':('Supporter',E('neoRule',rule='xy4:sycamore')),
}
# The official alternate art prints have *identical* rules but remain
# separate cards and source numbers; only exact print pairs are shared.
for src,alts in [('26',['107','115']),('67',['108']),('68',['109']),('75',['110']),('78',['111','116']),('79',['112'])]:
 for (number,title),effect in list(ATK.items()):
  if number==src:
   for alt in alts:ATK[(alt,title)]=effect
 for (number,title) in list(STRICT):
  if number==src:
   for alt in alts:STRICT.add((alt,title))
# Inherited X/Y BREAK effects use previously tested LV.X machinery.
ABILITIES={
 'Restored Barrier':{'type':'passive','effect':N},
 'Sonic Vision':{'type':'passive','effect':N},
 'Play Ball':{'type':'triggered','event':'benched','effect':E('xy11Rule',rule='playBall')},
 'Steam Up':{'type':'activated','oncePerTurn':True,'effect':E('xy11Rule',rule='steamUp')},
 'Mega Boost':{'type':'activated','oncePerTurn':True,'effect':E('xy11Rule',rule='megaBoost')},
 'Shocking Light':{'type':'activated','oncePerTurn':True,'effect':E('xy11Rule',rule='shockingLight')},
 'Sinister Selection':{'type':'activated','oncePerTurn':True,'effect':E('xy11Rule',rule='sinisterSelection')},
 'Poison Enzyme':{'type':'passive','effect':N},
 'Tear Away':{'type':'activated','oncePerTurn':False,'effect':E('xy11Rule',rule='tearAway')},
 'Sudden Cyclone':{'type':'triggered','event':'benched','effect':E('xy11Rule',rule='suddenCyclone')}, # Executed by xy11RestoredBarrier in battle-effects' weakness paths
}
UNVERIFIED_ABILITIES={
 "King's Palace",
 'Heavy Bumper','Mystic Heart','Wonder Lock','Gale Wings',
}
# The 18 ability *prints* include alternative artworks reusing named effects.

def attack(row,printed):
 number,title=str(row[0]),printed[0]
 if (number,title) in STRICT:return None
 exact=ATK.get((number,title))
 if exact is not None:return exact
 # Supply an unrelated synthetic ID to prevent inherited attack-name-specific
 # mappings from another set accidentally changing a Steam Siege print.
 return generic_attack(['_xy11_generic_',*list(row)[1:]],printed)
