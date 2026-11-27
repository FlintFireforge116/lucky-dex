"""Stage 1: explicit reviewed shared effects. Unknown mechanics remain gated."""
import swsh11_verified as previous
from swsh9_verified import E,seq,coin,cond,bonus,activated
from swsh8_verified import discard,status
from sm7_verified import passive

# The inherited definitions below were individually checked against the pinned text.
REUSE={13:['Energy Digging'],17:['Jump On'],18:['Hypnotic Gaze','Scorching Breath'],20:['Flame Cloak'],21:['Take Down'],25:['Lead'],27:['Energy Crush'],29:['Quick Dive','Merciless Strike'],30:['Reprisal'],32:['Flare Shot'],40:['Water Arrow','Mellow Wave'],41:['Collect'],44:['Water Pulse'],52:['Strong Volt'],54:['Lucky Find'],56:['Battle Claw'],57:['Switching Bolt','Lightning Wall'],58:['Max Thunder and Lightning'],60:['Hypnotic Ray'],62:['Psychic Assault'],63:['Confuse Ray'],65:['Shady Stamp'],12:['Hypno Hammer'],14:['Leaf Drain'],15:['Touchdown']}

def attack(row,a):
 n=int(row[0]); title,cost,damage,t=a
 if not t and damage.isdigit():return E('noop')
 if title in REUSE.get(n,[]):return previous.attack(row,a)
 if n==6 and title=='Bright Beam':return E('chooseDiscardForBonus',zone='hand',max=3,amount=70,filter={'kind':'energy'})
 if n==7 and title=='Noble Light':return seq(E('heal',target='selfAll',amount=30),E('heal',target='opponentAll',amount=30))
 if n==10 and title=='Swelling Scent':return E('distributeEnergy',source='zone',target='selfBench',energyType='Grass',amount=2,optional=True)
 if (n,title) in [(20,'Fighting Tackle'),(33,'White Drop')]:return bonus(100 if n==20 else 50,cond('opponentMatches',filter={'tag':'pokemon-v'}))
 if n==24 and title=='White Blaze':return E('coinFlip',heads=E('noop'),tails=E('lock',target='self',action='attack',duration='nextOwnTurn'))
 if n in (26,27) and title=='Flare Parade':return E('discardCountDamage',side='self',filter={'kind':'trainer','name':'Serena'},amount=60,mode='replace')
 if n==35 and title=='Tentacle Lock':return E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'evolved':True}))
 if n==36 and title=='Wild Freeze':return seq(E('selfDamage',amount=50),status('paralysis'))
 if n==37 and title=='Gulp Down':return E('drain')
 if n==38 and title=='Special Wave':return bonus(120,cond('selfMatches',filter={'hasSpecialEnergy':True}))
 if n==39 and title=='Ascension':return E('evolveFromDeck')
 if n==45 and title=='Sea Feast':return E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic','subtype':'Water'},choose=True,optional=True)
 if n==48 and title=='Drowning Ball':return coin(seq(status('paralysis'),discard(1,'opponentActive')))
 if n==53 and title=='Overhaul':return E('handShuffle',side='self',draw=6)
 if n==59 and title=='Mind Ruler':return E('handCountDamage',source='opponent',amount=20,mode='replace')
 if n==61 and title=='Psy Call':return E('benchFromDeck',amount=2,filter={'kind':'pokemon','stage':'Stage 1'},choose=True,optional=True)
 return None

def ability(row,a):
 if row[0]=='38' and a[0]=='Jumbo-Sized':return passive(E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay'))
 return None

def trainer(row):
 name=row[1];t=row[13][0]
 if name=='Energy Switch':return 'Item',E('sm1Rule',rule='energySwitch')
 if name=='Lance':return 'Supporter',E('searchChosen',amount=3,filter={'kind':'pokemon','subtype':'Dragon'},optional=True)
 if name=='Professor Laventon':return 'Supporter',E('searchChosen',source='discard',amount=3,filter={'kind':'pokemon','nameContains':'Hisuian'},optional=True)
 if name=='Unidentified Fossil':return 'Item',E('playFossil',hp=60,subtype='Colorless',canRetreat=False)
 if name=='Worker':return 'Supporter',seq(E('draw',amount=3),E('discardStadium',condition=cond('stadiumInPlay'),optionalCondition=True))
 return None

def energy(row):return None
prism_ready=previous.prism_ready

# Stage 2: selected support cards and matching Pokémon payoffs.
_stage1_attack,_stage1_ability,_stage1_trainer=attack,ability,trainer

def attack(row,a):
 n=int(row[0]);title=a[0]
 if n==2 and title=='Miracle Powder':return coin(E('chooseOption',options=[{'label':label,'effect':status(key)} for label,key in [('Asleep','sleep'),('Burned','burn'),('Confused','confusion'),('Paralyzed','paralysis'),('Poisoned','poison')]]))
 if n==16 and title=='Aroma Shot':return E('removeStatus',target='self')
 if n==23 and title=='Assisting Flame':return E('sm7Rule',rule='sm12DiscardAttach',left=2,energyType='Fire',optional=True)
 if n==42 and title=='Big Mouth':return bonus(130,cond('sm10Supporter',name='Candice'))
 if n==43 and title=='Frosty Jail':return seq(bonus(90,cond('sm10Supporter',name='Candice')),E('status',target='opponentActive',status='paralysis',condition=cond('sm10Supporter',name='Candice')))
 if n==44 and title=='Fossil Finding':return E('sm7Rule',rule='sm9Recycle',amount=4,filter={'name':['Unidentified Fossil','Rare Fossil']},optional=True)
 if n==50 and title=='Ambushing Spark':return bonus(100,cond('swsh12OpponentVstarUsed'))
 if n==55 and title=='Mystery Bolt':return seq(E('attackRequirement',condition=cond('sm12NoSupporterDiscard')),E('selectedDamage',target='opponentPokemon',amount=100))
 return _stage1_attack(row,a)

def ability(row,a):
 n=int(row[0]);title=a[0]
 if n==16 and title=='Elegant Heal':return activated(E('heal',target='selfAll',amount=20))
 if n==22 and title=='Heat Boost':return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={'kind':'energy','basicEnergy':True,'subtype':'Fire'},after=E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='turn',filter={'subtype':'Fire'})))
 if n==58 and title=='Transistor':return passive(E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='whileInPlay',filter={'stage':'Basic','subtype':'Lightning'}))
 return _stage1_ability(row,a)

def trainer(row):
 name=row[1]
 if name=='Serena':return 'Supporter',E('sm7Rule',rule='swsh12Serena')
 if name=='Brandon':return 'Supporter',E('sm7Rule',rule='swsh12Brandon')
 if name=='Candice':return 'Supporter',E('sm7Rule',rule='sm9TopPick',count=7,amount=7,filter={'anyOf':[{'kind':'pokemon','subtype':'Water'},{'kind':'energy','subtype':'Water','basicEnergy':True}]},destination='hand',rest='shuffle',optional=True)
 if name=='Capturing Aroma':return 'Item',E('coinFlip',heads=E('searchChosen',amount=1,filter={'kind':'pokemon','evolved':True}),tails=E('searchChosen',amount=1,filter={'kind':'pokemon','stage':'Basic'}))
 if name=='Gym Trainer':return 'Supporter',seq(E('draw',amount=2),E('draw',amount=2,condition=cond('koLastOpponentTurn'),optionalCondition=True))
 if name=='Primordial Altar':return 'Stadium',E('stadiumAction',effect=seq(E('inspectTop',side='self',amount=1),E('chooseOption',options=[{'label':'Keep top card','effect':E('noop')},{'label':'Discard top card','effect':E('discardTop',side='self',amount=1)}])))
 if name=='Gapejaw Bog':return 'Stadium',E('noop')
 return _stage1_trainer(row)

# Stage 3: next pinned Pokémon packet; existing reusable mechanics.
_stage2_attack,_stage2_ability,_stage2_energy=attack,ability,energy

def attack(row,a):
 n=int(row[0]);title=a[0]
 if n in (14,46) and title=='Four as One':
  return bonus(70 if n==14 else 170,cond('pokemonPresentAll',side='self',zone='bench',names=['Cobalion','Terrakion','Keldeo' if n==14 else 'Virizion']))
 if n==24 and title=='Sparkling Wing':return E('sm7Rule',rule='sm9SearchAttach',amount=2,sameTarget=True)
 if n==34 and title=='Snow Mirage':return seq(E('damageRule',ignoreEffects=True),E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'hasAbility':True}))
 if n==34 and title=='Silvery Snow Star':return seq(E('fieldCountDamage',side='opponent',filter={'tag':'pokemon-v'},amount=70,mode='replace'),E('damageRule',ignoreWeakness=True,ignoreResistance=True))
 if n==67 and title=='Memory Skip':return E('chooseAttackLock',duration='opponentTurn')
 if n==70 and title=='Pouty Slap':return coin(discard(1,'opponentActive'))
 if n==70 and title=='Chomp Down':return E('discardHand',side='opponent',amount=1,random=True)
 if n==73 and title=='Vigorous Kick':return bonus(90,cond('pokemonPresent',side='opponent',zone='inPlay',filter={'tag':'pokemon-vmax'}))
 if n==77 and title=='Cell Spear':return E('placeDamageCounters',target='opponentBench',amount=20)
 if n==80 and title=='Psychic Arrow':return E('selectedDamage',target='opponentPokemon',amount=60,activeWeaknessResistance=True,benchWeaknessResistance=True)
 if n==84 and title=='Draining Kiss':return E('heal',target='self',amount=30)
 if n==87 and title=='Reckless Charge':return E('selfDamage',amount=10)
 if n==91 and title=='Knock Away':return coin(E('bonusDamage',amount=20))
 if n==93 and title=='Find a Friend':return E('searchChosen',amount=1,filter={'kind':'pokemon'})
 if n==95 and title=='Fossil Drop':return E('chooseDiscardForBonus',zone='hand',max=1,amount=120,filter={'kind':'trainer','name':'Unidentified Fossil'})
 return _stage2_attack(row,a)

def ability(row,a):
 n=int(row[0]);title=a[0]
 if n==4 and title=='Hidden Threads':return passive(E('modifier',stat='attackCostColorless',amount=1,scope='opponentTeam',duration='whileInPlay',filter={'tag':'pokemon-vstar'},nonStacking=True))
 if n==15 and title=='Needle Line':return dict(type='triggered',event='damagedByAttack',activeOnly=True,opponentAttackOnly=True,effect=E('placeDamageCounters',target='opponentActive',amount=30))
 if n in (68,69) and title=='Refinement':return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('draw',amount=2)))
 if n==72 and title=='Yoga Guard':return passive(E('preventDamage',target='self',duration='whileInPlay'),benchOnly=True)
 if n==73 and title=='Chakra Awakening':return passive(E('modifier',stat='attackCostColorless',amount=-3,scope='self',duration='whileInPlay',condition=cond('handSizeOneOf',values=[4])))
 if n==82 and title=='Inviting Ears':return dict(type='triggered',event='evolved',fromHandOnly=True,effect=E('searchChosen',amount=2,filter={'kind':'trainer','trainerType':'Supporter'},optional=True))
 if n==94 and title=='Mystery Charge':return activated(E('sm7Rule',rule='sm12DiscardAttach',left=1,energyType='Fighting',optional=True,condition=cond('sm12NoSupporterDiscard')))
 return _stage2_ability(row,a)

def energy(row):
 if row[1]=='V Guard Energy':return E('specialEnergy',provides={'Colorless':1})
 return _stage2_energy(row)

# Stage 4: pinned Fighting, Darkness and Metal prints, plus reviewed existing gates.
_stage3_attack,_stage3_ability=attack,ability

def attack(row,a):
 n=int(row[0]);title=a[0]
 if n==8 and title=='Regal Blender':return E('redistributeEnergy',includeSpecialEnergy=True,optional=True)
 if n==8 and title=='Star Winder':return seq(E('energyDamage',source='self',countProvidedType=True,amount=60,mode='replace'),E('switch',target='self',mandatory=True))
 if n==92 and title=='Overspin':return E('attackDamageGate',condition=cond('sm8NotEvolved'))
 if n==96 and title=='Reaping Claw':return E('knockOut',target='opponentActive',condition=cond('swsh12OpponentRemainingHpAtMost',amount=100))
 if n==97 and title=='Cavern Tackle':return seq(E('attackRequirement',condition=cond('swsh12NoCavernTackle')),E('preventDamage',target='self',duration='opponentTurn'))
 if n in (98,107) and title in ('Allure','Triple Draw'):return E('draw',amount=2 if n==98 else 3)
 if n in (98,118,124) and title in ('Acrobatics','Bullet Punch','Gear Grind'):return E('coinDamage',coins=2,amount={98:20,118:30,124:80}[n],mode='replace' if n==124 else 'add')
 if n==99 and title=='Corner':return E('lock',target='opponentActive',action='retreat',duration='opponentTurn')
 if n==100 and title=='Sandpot Trap':return seq(E('bonusDamage',amount=30),E('benchDamage',side='opponent',all=True,amount=30))
 if n==101 and title=='Mystery Press':return bonus(130,cond('sm12NoSupporterDiscard'))
 if n==102 and title=='Peat Shoulder':return E('selfDamagePenalty',amount=1,mode='add')
 if n==106 and title=='Flock':return E('benchFromDeck',amount=2,filter={'kind':'pokemon','name':'Murkrow','stage':'Basic'},choose=True,optional=True)
 if n==110 and title=='Diving Uppercut':return E('modifier',stat='damageReduction',amount=-50,scope='self',duration='opponentTurn')
 if n==112 and title=='Crunch':return coin(discard(1,'opponentActive'))
 if n==114 and title=='Poison Sting':return status('poison')
 if n==115 and title=='Venoshock':return bonus(120,cond('opponentStatus',status='poison'))
 if n==117 and title=='Magnetic Lift':return E('neoRule',rule='dp6:31:oneDesire')
 if n==120 and title=='Astral Misfortune':return E('allHeadsEffect',coins=2,heads=E('knockOut',target='opponentActive'))
 if n==123 and title=='Call Sign':return E('searchChosen',amount=1,filter={'kind':'pokemon'})
 return _stage3_attack(row,a)

def ability(row,a):
 n=int(row[0]);title=a[0]
 if n==102 and title=='Hard Coat':return passive(E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay'))
 if n==120 and title=='Entrusted Wishes':return dict(type='triggered',event='knockedOutByAttack',activeOnly=True,opponentAttackOnly=True,effect=E('searchChosen',amount=3,filter={},optional=True))
 if n==125 and title=='Triple Gears':return dict(type='triggered',event='evolved',fromHandOnly=True,effect=E('sm7Rule',rule='sm9SearchAttach',amount=3))
 return _stage3_ability(row,a)

# Stage 5: physical discard and Special Energy acceleration.
_stage4_attack,_stage4_ability=attack,ability

def attack(row,a):
 n=int(row[0]);title=a[0]
 if n==128 and title=='Gear Throw':return E('selectedDamage',target='opponentPokemon',amount=30)
 if n==128 and title=='Special Laser':return bonus(120,cond('selfMatches',filter={'hasSpecialEnergy':True}))
 if n in (129,145) and title in ('Slam','Double Kick'):return E('coinDamage',coins=2,amount=30 if n==129 else 100,mode='replace')
 if n==130 and title=='Wrap':return coin(status('paralysis'))
 if n==131 and title=='Energy Hurricane':return E('sm7Rule',rule='sm9SearchAttach',amount=3)
 if n==134 and title=='Shout of Power':return E('sm7Rule',rule='sm12DiscardAttach',left=1,benchOnly=True,optional=True)
 if n==138 and title=='Read the Wind':return E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('draw',amount=3))
 if n in (138,139) and title in ('Aero Dive','Tempest Dive'):return E('chooseOption',condition=cond('stadiumInPlay'),options=[{'label':'Discard Stadium','effect':E('discardStadium')},{'label':'Keep Stadium','effect':E('noop')}])
 if n==141 and title=='Dizzying Spin':return seq(E('bonusDamage',amount=10),E('benchDamage',side='opponent',all=True,amount=10),status('confusion'))
 if n==142 and title=='Continuous Spin':return E('coinDamage',coins='untilTails',amount=20,mode='replace')
 if n==144 and title=='Try Bouncing':return E('coinDamage',coins=1,amount=30,mode='replace')
 if n==148 and title=='Jump On':return coin(E('bonusDamage',amount=30))
 return _stage4_attack(row,a)

def ability(row,a):
 n=int(row[0]);title=a[0]
 if n==139 and title=='Summoning Star':return activated(E('sm7Rule',rule='swsh12SummoningStar'),vstarPower=True)
 if n==147 and title=='Primal Turbo':return activated(E('sm7Rule',rule='swsh12PrimalTurbo'))
 return _stage4_ability(row,a)


# Stage 6: reuse verified effect handlers and exact alternate-print signatures.
_stage5_attack,_stage5_ability=attack,ability

def attack(row,a):
 n=int(row[0]);title=a[0]
 if n==133 and title=='Radiant Hunt':return E('chooseTarget',target='opponentPokemon',filter={'tag':'radiant'},effect=E('knockOut',target='opponentPokemon',filter={'tag':'radiant'}))
 if n==133 and title=='Seventh Echo':return E('drawToHandSize',size=7)
 if n==135 and title=='Celestial Roar':return E('neoRule',rule='bw6:celestialRoar')
 if n==135 and title=='Dragon Laser':return E('benchDamage',side='opponent',target='opponentBench',amount=30)
 if n==143 and title=='Magical Echo':return E('chooseTarget',target='selfBench',effect=E('moveDamage',target='selfBench',destination='opponentActive',amount='all'))
 if n==149 and title=='Eerie Cry':return E('placeDamageCounters',target='opponentAll',filter={'damaged':True},amount=30)
 if n==149 and title=='Mind Bend':return status('confusion')
 return _stage5_attack(row,a)

_stage6_attack=attack
ALT_BASE={170: 7, 171: 15, 172: 24, 173: 33, 174: 35, 175: 57, 176: 65, 177: 65, 178: 70, 179: 90, 180: 108, 181: 108, 182: 128, 183: 135, 184: 135, 185: 138, 186: 138, 187: 140, 196: 8, 197: 34, 198: 58, 199: 66, 200: 71, 201: 136, 202: 139, 210: 8, 211: 139}
def _base_row(row):
 # Source packet is byte-verified against the upstream catalogue. Require full
 # gameplay signature equivalence, not just matching names, before delegation.
 n=int(row[0]);base=ALT_BASE.get(n)
 if base is None:return row
 from swsh12_source import rows
 if not hasattr(_base_row,'index'):_base_row.index={int(r[0]):r for r in rows()}
 original=_base_row.index[base]
 assert all(row[i]==original[i] for i in range(1,16) if i!=12), (n,base)
 return original

def attack(row,a):return _stage6_attack(_base_row(row),a)
def ability(row,a):return _stage5_ability(_base_row(row),a)

# Stage 7: narrowly scoped knockout, fossil, evolution and choice mechanics.
_stage6_final_attack,_stage6_final_ability,_stage6_energy=attack,ability,energy

def attack(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==31 and title=='Gritty Claws':return E('koGuard',target='self',mode='survive',remainingHp=10,duration='opponentTurn',attackOnly=True,fullHpDamageOnly=True)
 if n==32 and title=='Secret Attack':return E('copyAttack',source='previousEvolution')
 if n==35 and title=='Primal Guidance':return E('benchFromDeck',amount=2,filter={'kind':'pokemon','evolvesFrom':['Mysterious Fossil','Claw Fossil','Root Fossil','Skull Fossil','Armor Fossil','Dome Fossil','Helix Fossil','Cover Fossil','Plume Fossil','Root Fossil Lileep','Helix Fossil Omanyte','Dome Fossil Kabuto','Claw Fossil Anorith','Armor Fossil Shieldon','Unidentified Fossil','Rare Fossil']},choose=True,optional=True)
 if n==65 and title=='Victory Symbol':return E('sm7Rule',rule='swsh12VictorySymbol')
 if n==75 and title=='Warning':return E('sm7Rule',rule='swsh12Warning')
 if n==86 and title=='Smart Service':return E('searchChosen',amount=1,filter={})
 if n==107 and title=='Callous Wings':return E('sm7Rule',rule='swsh12CallousWings')
 if n==126 and title=='Follow-Up':return E('sm7Rule',rule='sm9SearchAttach',amount=2,benchOnly=True,distinctTargets=True)
 return _stage6_final_attack(row,a)

def ability(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==62 and title=='Selfish Lips':return passive(E('sm7Rule',rule='swsh12SelfishLips'))
 if n==126 and title=='Justified Law':return passive(E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='whileInPlay',filter={'stage':'Basic'},opponentFilter={'subtype':'Darkness'}))
 return _stage6_final_ability(row,a)

def energy(row):
 if row[1]=='Regenerative Energy':return E('specialEnergy',provides={'Colorless':1})
 return _stage6_energy(row)

# Stage 8: connected attack sequence, exact Energy movement, and selected effects.
_stage7_attack,_stage7_ability,_stage7_trainer=attack,ability,trainer

def attack(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==49 and title=='Pika Strike':return bonus(180,cond('swsh12LastAttack',name='Dedenne',attack='Dede-Short'))
 if n==85 and title=='Dede-Short':return seq(E('attackRequirement',condition=cond('swsh12LastAttack',name='Togedemaru',attack='Toge Dash')),status('paralysis'))
 if n==116 and title=='Peko Blaster':return seq(E('attackRequirement',condition=cond('swsh12LastAttack',name='Dedenne',attack='Dede-Short')),E('bonusDamage',amount=60),E('benchDamage',side='opponent',all=True,amount=60))
 if n==127 and title=='Toge Dash':return coin(E('sm6Rule',rule='knockoutReviver'))
 if n==90 and title=='Rock Bullet':return E('energyDamage',source='self',energyType='Fighting',countProvidedType=True,amount=30,mode='add')
 return _stage7_attack(row,a)

def ability(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==59 and title=='Painful Spoons':return activated(E('sm7Rule',rule='swsh12PainfulSpoons'))
 if n==90 and title=='Irresistible Force':return dict(type='activated',oncePerTurn=False,effect=E('sm7Rule',rule='swsh12IrresistibleForce'))
 return _stage7_ability(row,a)

def trainer(row):
 if row[1]=='Furisode Girl':return 'Supporter',E('sm7Rule',rule='swsh12FurisodeGirl')
 return _stage7_trainer(row)

# Stage 9: targeted top-deck attachment, VSTAR switch, opponent choice and reactive effects.
_stage8_attack,_stage8_ability,_stage8_trainer=attack,ability,trainer

def attack(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==64 and title=='Eerie Voice':return E('placeDamageCounters',target='opponentAll',amount=20)
 if n==71 and title=='Sudden Eater':return bonus(90,cond('movedFromBenchThisTurn'))
 if n==137 and title=='Colorful Palette':return E('sm7Rule',rule='sm9TopAttach',count=5,includeSpecial=False,sameTarget=True)
 return _stage8_attack(row,a)

def ability(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==64 and title=='Spiteful Magic':return dict(type='triggered',event='damagedByAttack',opponentAttackOnly=True,effect=E('sm7Rule',rule='swsh12SpitefulMagic'))
 if n==71 and title=='Star Rondo':return activated(E('sm7Rule',rule='swsh12StarRondo'),vstarPower=True)
 return _stage8_ability(row,a)

def trainer(row):
 if row[1]=='Wallace':return 'Supporter',E('sm7Rule',rule='swsh12Wallace')
 if row[1]=='Emergency Jelly':return 'Tool',E('noop') # exact end-turn hook in core
 return _stage8_trainer(row)

# Stage 10: real retreat history, delayed hand-attachment trap, and damage-only Prize bonus.
_stage9_attack=attack

def attack(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==74 and title=='Dreaming Tone':return E('energyAttachStatusTrap',target='opponentActive',status='sleep')
 if n==108 and title=='Pursuit Blast':return E('selectedDamage',target='opponentBench',amount=30,retreatedLastTurnAmount=120)
 if n==108 and title=='Shrieking Poison':return seq(status('confusion'),status('poison'))
 if n==105 and title=='Venomous Fang':return status('poison')
 if n==105 and title=='Critical Bite':return E('selectedDamage',target='opponentPokemon',amount=30)
 return _stage9_attack(row,a)

# Stage 11: natural draw, dual Ability events, distinct Bench counters and multi-copy Items.
_stage10_attack,_stage10_ability,_stage10_trainer=attack,ability,trainer

def attack(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==78 and title=='Cell Fork':return E('sm7Rule',rule='swsh12CellFork',left=2,used=[])
 if n==113 and title=='Double-Edge':return E('selfDamage',amount=30)
 if n==119 and title=='Meteor Mash':return E('nextAttackBonus',attackName='Meteor Mash',amount=100)
 return _stage10_attack(row,a)

def ability(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==78 and title=='Persistent Cells':return passive(E('sm7Rule',rule='swsh12PersistentCells'))
 if n==113 and title=='Bully of the Sands':return dict(type='triggered',event='evolved',effect=E('sm7Rule',rule='swsh12BullyOfTheSands'))
 if n==119 and title=='Emergency Entry':return passive(E('sm7Rule',rule='swsh12EmergencyEntry'))
 return _stage10_ability(row,a)

def trainer(row):
 if row[1]=='Quad Stone':return 'Item',E('sm7Rule',rule='swsh12QuadStone')
 return _stage10_trainer(row)

# Stage 12: discard-zone revival, gained weakness aura and Supporter protection.
_stage11_attack,_stage11_ability,_stage11_trainer=attack,ability,trainer

def attack(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==66 and title=='Tri Power':return E('coinDamage',coins=3,amount=70,mode='replace')
 if n==66 and title=='Star Cipher':return E('sm7Rule',rule='swsh12StarCipher')
 if n==140 and title=='Rainbow Burn':return E('energyTypeCountDamage',amount=30,mode='add')
 return _stage11_attack(row,a)

def ability(row,a):
 n=int(_base_row(row)[0]);title=a[0]
 if n==140 and title=='Reviving Flame':return activated(E('sm7Rule',rule='swsh12RevivingFlame'))
 return _stage11_ability(row,a)

def trainer(row):
 if row[1]=='Leafy Camo Poncho':return 'Tool',E('noop')
 return _stage11_trainer(row)
