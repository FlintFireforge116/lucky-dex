"""XY12 Evolutions: print-number exact effects, never invent unsupported effects.

All source-level metadata is pinned and complete. Nontrivial attack/Ability
mechanics must use verified handlers or remain gated until tested.
"""
from xy8_verified import attack as generic_attack
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD,OPT
E=lambda t,**kw:{'type':t,**kw}
ATK={
 ('2','Crisis Vine'):S(ST('paralysis'),ST('poison')),
 ('4','Stiffen'):GUARD(40),('6','Stiffen'):GUARD(40),
 ('9','Ember'):DISC(1,'self','Fire'),('10','Flamethrower'):DISC(1,'self','Fire'),
 ('11','Fire Spin'):DISC(3),
 ('12','Combustion Blast'):E('lock',action='attack',target='self',attackName='Combustion Blast',duration='nextOwnTurn'),
 ('15','Fire Blast'):DISC(1,'self','Fire'),
 ('17','Hind Kick'):SWITCH(),
 ('20','Flamethrower'):DISC(1,'self','Fire'),
 ('21','Rapid Spin'):S(SWITCH(),E('forceOpponentSwitch',chooseBy='defender')),
 ('21','Splash Bomb'):Q(N,E('selfDamage',amount=30)),
 ('22','Hydro Bombard'):E('multiTargetDamage',target='opponentBench',amount=30,count=2,upTo=True),
 ('24','Amnesia'):E('chooseAttackLock',target='opponentActive',duration='opponentTurn'),('24','Double Slap'):COIN(2,50),
 ('25','Whirlpool'):DISC(1,'opponentActive'),
 ('26','Slack Off'):S(H(60),E('lock',action='attack',target='self',duration='nextOwnTurn')),
 ('27','Loll Roll Spin'):S(ST('confusion','selfActive'),E('nextAttackBonus',attackName='Loll Roll Spin',amount=100)),
 ('28','Growl'):E('modifier',stat='attackDamage',amount=-20,scope='opponentActive',duration='opponentTurn'),
 ('29','Super Deep Dive'):S(H(40),SWITCH()),('29','Take Down'):E('selfDamage',amount=20),
 ('33','Flail'):E('damageFromDamage',source='self',amount=1,mode='replace'),('34','Dragon Rage'):E('neoRule',rule='hgss3:45:doubleHeadstrike'),('35','Thunder Jolt'):Q(N,E('selfDamage',amount=10)),
 ('36','Energize'):E('attachEnergyFromDiscard',target='self',energyType='Lightning',amount=1),
 ('37','Self-Destruct'):E('selfDamage',amount=50),('38','Self-Destruct'):E('selfDamage',amount=80),
 ('41','Thunder Punch'):Q(BONUS(10),E('selfDamage',amount=10)),
 ('42','Thunder'):E('selfDamage',amount=30),('42','Thunderbolt'):DISC('all'),
 ('43','Double Stab'):COIN(2,10),('44','Fury Attack'):COIN(3,30),
 ('45','Rumble'):LOCK(),('45','Tail Swing'):E('benchDamage',side='opponent',amount=20,all=True,filter={'stage':'Basic'}),
 ('48','Dream Eater'):E('attackRequirement',condition={'type':'opponentStatus','status':'sleep'}),
 ('50','Foul Gas'):Q(ST('poison'),ST('confusion')),
 ('51','Psychic'):E('energyDamage',source='opponent',amount=20,mode='add'),
 ('52','Energy Absorption'):E('attachEnergyFromDiscard',target='self',amount=1),
 ('52','Regeneration'):H(60),
 ('54','Sand Attack'):E('attackCoinGate',target='opponentActive',duration='opponentTurn'),
 ('55','Dig Through'):E('multiTargetDamage',target='opponentBench',amount=30,count=1,upTo=True),
 ('56','Earthquake'):E('benchDamage',side='self',amount=20,all=True),
 ('57','Dual Chop'):COIN(2,20),('58','Submission'):E('selfDamage',amount=20),
 ('61','Harden'):E('preventDamage',target='self',duration='opponentTurn',maxDamage=60),
 ('63','Metronome'):E('copyAttack',source='opponentActive'),
 ('64','Mirror Move'):E('mirrorLastAttackResult'),
 ('64','Feather Lance'):E('multiTargetDamage',target='opponentBench',amount=20,count=1,upTo=True),
 ('65','Mach Cyclone'):OPT('Switch your opponent’s Active Pokémon',E('forceOpponentSwitch',chooseBy='attacker')),
 ('67','Crunch'):DISC(1,'opponentActive'),
 ('68','Leek Slap'):E('lock',action='attack',target='self',attackName='Leek Slap',duration='nextOwnTurn'),
 ('69','Fury Attack'):COIN(3,10),
 ('70','Scrunch'):Q(E('preventDamage',target='self',duration='opponentTurn')),
 ('70','Double-Edge'):E('selfDamage',amount=80),('110','Fly'):E('neoRule',rule='xy4:fly'),
 # Conversion 3 needs expiry-safe type selection; leave gated until timed override exists.
 ('72','Hyper Beam'):DISC(1,'opponentActive'),
 ('109','ふみつけ[Stomp]'):Q(BONUS(10)),
}
# Official alternate art reprints: same attack effects by exact printed pair.
for src,alts in [('2',['100']),('13',['101']),('22',['102']),('52',['103']),('64',['104']),('65',['105']),('72',['106'])]:
 for (number,name),effect in list(ATK.items()):
  if number==src:
   for alt in alts:ATK[(alt,name)]=effect

ABILITIES={}
UNVERIFIED_ABILITIES=set()

TRAINERS={
 '73':('Tool',N),'75':('Tool',N),'81':('Tool',N),'86':('Tool',N),'89':('Tool',N),
 '76':('Item',E('xy10DevolutionSpray')),
 '77':('Item',SEARCH(2,source='discard',kind='energy',basicEnergy=True)),
 '78':('Item',E('removeStatuses',target='selfActive',statuses=['poison','burn','sleep','paralysis','confusion'])),
 '79':('Item',S(E('shuffleChosenHand',side='self',amount=2,required=True),DRAW(1))),
 '82':('Item',E('reorderTop',deckSide='self',count=5)),
 '83':('Item',E('chooseTarget',target='selfPokemon',effect=H(30,'selfPokemon'))),
 '85':('Item',E('benchFromDiscard',side='self',amount=1,filter={'kind':'pokemon','stage':'Basic'})),
 '84':('Supporter',S(E('drawToHandSize',size=7),E('endTurn'))),
 '88':('Item',E('switch',side='self')),
 # Prize-reveal action requires a real state renderer; gated until implemented.
}
# Trainer reprints share exact rules where present, not their card numbers only.
for main,alt in [('74','107'),('80','108')]:
 if main in TRAINERS:TRAINERS[alt]=TRAINERS[main]

BASIC={'91':'Grass','92':'Fire','93':'Water','94':'Lightning','95':'Psychic','96':'Fighting','97':'Darkness','98':'Metal','99':'Fairy'}
ENERGIES={'90':E('specialEnergy',provides={'Colorless':2})}

def attack(row,printed):
 number,title=str(row[0]),printed[0]
 if (number,title) in ATK:return ATK[(number,title)]
 # Synthetic source number ensures unrelated earlier-set numbers cannot cause
 # an accidental same-number override in the shared XY8 parser.
 return generic_attack(['_xy12_generic_',*list(row)[1:]],printed)
