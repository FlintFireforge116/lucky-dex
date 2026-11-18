"""Platinum Arceus completion pass: printed card effects only.

Complex cards use pl4: rules implemented in the shared Classic effects engine.
Cards not mapped completely are intentionally gated; never replace text with noop.
"""
N={'type':'noop'}
def R(key): return {'type':'neoRule','rule':'pl4:'+key}
def S(*effects): return {'type':'sequence','effects':list(effects)}
def ST(x): return {'type':'status','target':'opponentActive','status':x}
def B(n,cond=None):return {'type':'bonusDamage','amount':n,**({'condition':cond} if cond else {})}
def H(n,target='self'):return {'type':'heal','target':target,'amount':n}
def C(n,amount,mode='replace'):return {'type':'coinDamage','coins':n,'amount':amount,'mode':mode}
def CH(heads=None,tails=None):return {'type':'coinFlip',**({'heads':heads} if heads else {}),**({'tails':tails} if tails else {})}
def SEARCH(n,**f):return {'type':'searchChosen','source':'deck','amount':n,'filter':f}
def OPT(label,e):return {'type':'chooseOption','options':[{'label':label,'effect':e},{'label':'Do not use','effect':N}]}
def P(name,e,**kw):return {'name':name,'type':'activated','printedPowerType':'power','oncePerTurn':True,'disabledByStatus':True,'effect':e,**kw}
def T(name,event,e,body=False,**kw):return {'name':name,'type':'triggered','printedPowerType':'body' if body else 'power','disabledByStatus':not body,'event':event,'effect':e,**kw}
def BODY(name,e,**kw):return {'name':name,'type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':e,**kw}

# Map new or formerly gated attacks to real effect implementations.
ATTACKS={
 ('2','Ground Frost'):B(-50,{'type':'stadiumInPlay'}),
 ('3','Magma Mantle'):R('3:magmaMantle'),
 ('4','Primal Scythe'):R('4:primalScythe'),
 ('4','Rock Slide'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':10,'upTo':True},
 ('5','Flash'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('5','Gadget Bolt'):R('5:gadgetBolt'),
 ('6','Cloak Party'):R('6:cloakParty'),
 ('6','Energy Assist'):{'type':'attachEnergyFromDiscard','amount':1,'target':'selfBench','basicOnly':True},
 ('8','Shoot Through'):{'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':20,'upTo':True},
 ('9','Damage Roller'):R('9:damageRoller'),
 ('9','Entangle Tackle'):R('9:entangleTackle'),
 ('10','Swallow Up'):B(70,{'type':'opponentHpLess'}),
 ('11','Convert Blow'):S(B(30,{'type':'selfHasEnergyType','energyType':'Fighting'}),{'type':'status','target':'opponentActive','status':'poison','condition':{'type':'selfHasEnergyType','energyType':'Psychic'}}),
 ('12','Charge Beam'):CH({'type':'attachEnergyFromDiscard','amount':1,'target':'self','upTo':True}),
 ('12','Lightning Strike'):R('12:lightningStrike'),
 ('14','Oracle Arrow'):{'type':'selectedDamage','amount':40,'target':'opponentPokemon','filter':{'damaged':True},'ignoreWeakness':True,'ignoreResistance':True},
 ('16','Shadow Skip'):S({'type':'multiTargetDamage','target':'opponentBench','count':1,'amount':10,'upTo':True},OPT('Switch Gengar with a Benched Pokémon',{'type':'switch','side':'self'})),
 ('18','Wreck'):R('18:wreck'),
 ('19','Tumble Down'):R('19:tumbleDown'),
 ('20','Vortex Chop'):R('20:vortexChop'),
 ('22','Second Bite'):{'type':'damageFromDamage','source':'opponent','amount':1},
 ('23','Time Spiral'):R('23:timeSpiral'),
 ('23','Primal Tentacles'):R('23:primalTentacles'),
 ('24','Continuous Crush'):R('24:continuousCrush'),
 ('25','Baby Steps'):R('25:babySteps'),
 ('27','Boosted Voltage'):{'type':'benchDamage','amount':20,'side':'opponent','all':True,'filter':{'evolved':False},'condition':{'type':'selfHasTool'}},
 ('29','Recruit'):R('29:recruit'),
 ('29','Extend Fang'):B(40,{'type':'selfHasTool'}),
 ('43','Discharge'):R('43:discharge'),
 ('45','Water Ball'):R('45:waterBall'),
 ('46','Ascension'):R('46:ascension'),
 ('48','Dragon Bump'):R('48:dragonBump'),
 ('30','Leaf Blast'):{'type':'energyDamage','source':'self','energyType':'Grass','amount':20,'mode':'replace'},
 ('31','Leaf Supply'):R('31:leafSupply'),
 ('32','Darkness Grace'):R('32:darknessGrace'),
 ('33','Wide Laser'):R('33:wideLaser'),
 ('34','Extrasensory'):B(30,{'type':'handSizesEqual'}),
 ('40','Endure'):CH({'type':'koGuard','mode':'survive','remainingHp':10,'duration':'opponentTurn','attackOnly':True}),
 ('49','Magical Needle'):{'type':'heal','amount':20,'target':'selfBench','choose':True},
 ('49','Cloak Scale'):R('49:cloakScale'),
 ('50','Cloak Headbutt'):B(30,{'type':'pokemonPresent','side':'self','zone':'inPlay','filter':{'name':'Wormadam Trash Cloak'}}),
 ('51','Cloak Shard'):R('51:cloakShard'),
 ('51','Serve Trash'):R('51:serveTrash'),
 ('53','Raid'):R('53:raid'),
 ('55','Bunny Hop'):{'type':'selectedDamage','amount':20,'target':'opponentPokemon','filter':{'damaged':False},'ignoreWeakness':True,'ignoreResistance':True},
 ('61','Astonish'):{'type':'shuffleRandomHandCard','side':'opponent'},
 ('65','Stone Barrage'):{'type':'coinDamage','coins':'untilTails','amount':10,'mode':'replace'},
 ('65','Stone Barrage'):{'type':'coinDamage','coins':'untilTails','amount':10,'mode':'replace'},
 ('67','Fast Evolution'):SEARCH(2,kind='pokemon',stage=['Stage 1','Stage 2']),
 ('69','Harden'):R('69:harden'),
 ('71','Mega Shot'):R('71:megaShot'),
 ('80','Slashing Strike'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn','attackName':'Slashing Strike'},
 ('95','Meteor Blast'):R('95:meteorBlast'),
 ('SH10','Dragon Rage'):R('SH10:dragonRage'),
 ('SH12','Payback'):B(30,{'type':'opponentPrizesRemaining','amount':1}),
 ('AR1','Prize Count'):R('AR1:prizeCount'),
 ('AR5','Ripple Swell'):R('AR5:rippleSwell'),
 ('AR5','Sky Spear'):R('AR5:skySpear'),
 ('AR9','Metal Barrier'):R('AR9:metalBarrier'),
 ('99','Big Growth'):R('99:bigGrowth'),
 ('97','Compound Pain'):R('97:compoundPain'),
}

ABILITIES={
 ('1','Fire Formation'):BODY('Fire Formation',{'type':'modifier','stat':'attackDamage','amount':10,'scope':'self','duration':'whileInPlay','perBenchFilter':{'subtype':'Fire'}}),
 ('2','Snow Gift'):T('Snow Gift','evolved',OPT('Search your deck for any one card',SEARCH(1)),fromHandOnly=True),
 ('7','Competitiveness'):BODY('Competitiveness',{'type':'modifier','stat':'attackDamage','amount':30,'scope':'self','duration':'whileInPlay','condition':{'type':'noSupporterInPlay'}}),
 ('8','Top Accelerator'):P('Top Accelerator',R('8:topAccelerator')),
 ('13','Unearth'):P('Unearth',R('13:unearth')),
 ('15','Cloudy Sky'):BODY('Cloudy Sky',{'type':'modifier','stat':'damageReduction','amount':10,'scope':'team','duration':'whileInPlay','filter':{'subtype':['Grass','Fire']}}),
 ('16','Curse'):P('Curse',R('16:curse')),
 ('21','Relaxing Shower'):P('Relaxing Shower',R('21:relaxingShower')),
 ('26','Dowsing Code'):T('Dowsing Code','benched',OPT('Return up to 2 Pokémon Tools from discard to deck',R('26:dowsingCode')),fromHandOnly=True),
 ('28','Wild Guard'):BODY('Wild Guard',{'type':'preventDamage','target':'self','duration':'whileInPlay','attackerFilter':{'tag':'pokemon-sp'},'effects':True}),
 ('30','Green Breath'):T('Green Breath','energyAttached',H(20),fromHandOnly=True,energyType='Grass'),
 ('32','Keystone Seal'):BODY('Keystone Seal',{'type':'actionLock','cardType':'Trainer','side':'both','duration':'whileActive'}),
 ('41','Hidden Poison'):T('Hidden Poison','damagedByAttack',ST('poison'),body=True,activeOnly=True,opponentAttackOnly=True),
 ('56','Cloak Evolution'):BODY('Cloak Evolution',{'type':'evolutionTimingOverride','sameTurn':True}),
 ('57','Cloak Evolution'):BODY('Cloak Evolution',{'type':'evolutionTimingOverride','sameTurn':True}),
 ('58','Cloak Evolution'):BODY('Cloak Evolution',{'type':'evolutionTimingOverride','sameTurn':True}),
 ('94','Multi-type'):BODY('Multi-type',R('94:multiType')),
 ('94','Omniscient'):BODY('Omniscient',R('94:omniscient')),
 ('95','Multitype'):BODY('Multitype',R('94:multiType')),
 ('96','Multitype'):BODY('Multitype',R('94:multiType')),
 ('97','Level-Down'):P('Level-Down',R('97:levelDown')),
 ('98','Double Fall'):T('Double Fall','levelUp',OPT('Take extra Prize cards for Salamence knockouts this turn',R('98:doubleFall')),fromHandOnly=True,activeOnly=True),
 ('99','Healing Growth'):P('Healing Growth',CH({'type':'heal','target':'selfPokemon','amount':40,'choose':True})),
 ('SH10','Star Barrier'):BODY('Star Barrier',{'type':'weaknessGuard','duration':'whileInPlay','condition':{'type':'selfEnergyAtLeast','amount':1}}),
 ('SH11','Star Barrier'):BODY('Star Barrier',{'type':'weaknessGuard','duration':'whileInPlay','condition':{'type':'selfEnergyAtLeast','amount':1}}),
 ('SH12','Star Barrier'):BODY('Star Barrier',{'type':'weaknessGuard','duration':'whileInPlay','condition':{'type':'selfEnergyAtLeast','amount':1}}),
}

TRAINERS={
 '83':('Tool',{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfOnBench'},'effects':False}),
 '84':('Tool',{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'whileInPlay'}),
 '86':('Item',R('86:energyRestore')),
 '87':('Tool',S({'type':'modifier','stat':'maxHp','amount':20,'scope':'self','duration':'whileInPlay'},{'type':'modifier','stat':'attackDamage','amount':20,'scope':'self','duration':'whileInPlay'})),
 '88':('Tool',N),
 '89':('Item',{'type':'playFossil','hp':50,'subtype':'Colorless','canRetreat':False,'countsAsKnockout':True,'fossilName':'Old Amber','statusImmune':True}),
 '90':('Supporter',R('90:professorOakVisit')),
 '91':('Stadium',{'type':'stadiumAction','effect':R('91:ultimateZone')}),
 '92':('Item',{'type':'playFossil','hp':50,'subtype':'Colorless','canRetreat':False,'countsAsKnockout':True,'fossilName':'Dome Fossil','statusImmune':True}),
 '93':('Item',{'type':'playFossil','hp':50,'subtype':'Colorless','canRetreat':False,'countsAsKnockout':True,'fossilName':'Helix Fossil','statusImmune':True}),
}
