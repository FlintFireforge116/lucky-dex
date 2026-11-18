"""Audited card-specific attack/effect mappings for Platinum—Rising Rivals.

Missing rules stay inspectable but are never inserted in automated battle decks.
Do not substitute a harmless 'noop' for an attack with printed requirements.
"""
N={'type':'noop'}
def S(*a):return {'type':'sequence','effects':list(a)}
def Q(h=None,t=None):return {'type':'coinFlip',**({'heads':h} if h is not None else {}),**({'tails':t} if t is not None else {})}
def ST(status,target='opponentActive',**kw):return {'type':'status','status':status,'target':target,**kw}
def B(n,cond=None):return {'type':'bonusDamage','amount':n,**({'condition':cond} if cond else {})}
def CONDIT(t,**kw):return {'type':t,**kw}
def H(n,target='self'):return {'type':'heal','amount':n,'target':target}
def SELF(n):return {'type':'selfDamage','amount':n}
def BENCH(n,side='opponent',all=True,**kw):return {'type':'benchDamage','amount':n,'side':side,'all':all,**kw}
def SELECT(n,where='opponentPokemon',**kw):return {'type':'selectedDamage','amount':n,'target':where,'ignoreWeakness':True,'ignoreResistance':True,**kw}
def LOCK(action='retreat',target='opponentActive',duration='opponentTurn',**kw):return {'type':'lock','action':action,'target':target,'duration':duration,**kw}
def DRAW(n=1):return {'type':'draw','amount':n}
def SEARCH(source='deck',amount=1,**kw):return {'type':'searchChosen','source':source,'amount':amount,'filter':kw}
def COINS(n,amount):return {'type':'coinDamage','coins':n,'amount':amount,'mode':'replace'}
def GUARD(n):return {'type':'modifier','stat':'damageReduction','amount':n,'scope':'self','duration':'opponentTurn'}
def DISC(n=1,who='self',**kw):return {'type':'discardEnergyCard','amount':n,'target':who,**kw}
def SWITCH():return {'type':'switch','side':'self'}
def OPT(effect,label='Use the optional effect'):return {'type':'chooseOption','options':[{'label':label,'effect':effect},{'label':'Do not use', 'effect':N}]}
def R(key,**kw):return {'type':'neoRule','rule':'pl2:'+key,**kw}
def P(name,effect,kind='activated',**kw):return {'name':name,'type':kind,'printedPowerType':'body' if kind=='passive' else 'power','disabledByStatus':kind!='passive','effect':effect,**kw}
DAMAGED={'type':'opponentDamageAtLeast','amount':10}
SELF_DAMAGED={'type':'selfDamageAtLeast','amount':10}
EVOLVED={'type':'opponentStage','stage':['Stage 1','Stage 2','Level-Up']}

# Every entry below is checked against the original printed attack NAME; no
# guessed text substitutions are ever allowed by the generator.
ATTACKS={
'1':{'Burn Out':OPT(S(B(30),ST('burn','self')),'Burn Arcanine for 30 extra damage'), 'Flames of Rage':R('1:rageFlames')},
'2':{'Bounce Back':{'type':'forceOpponentSwitch','chooseBy':'defender'},'Smack Attack':H(10)},
'3':{'Darkness Sleep':ST('sleep',condition=DAMAGED)},
'4':{'Incite':SEARCH('discard',2,kind='trainer',trainerType='Supporter'), 'Giant Wave':LOCK('attack','self','nextOwnTurn',attackName='Giant Wave')},
'5':{'Sand Wall':R('5:sandWall'), 'Power Swing':R('5:powerSwing')},
'6':{'Sleep Inducer':R('6:sleepInducer'), 'Wake-Up Slap':S(B(20,{'type':'opponentStatus'}),{'type':'removeStatus','target':'opponentActive'})},
'7':{'Detour':R('7:detour'),'Swift':{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True}},
'8':{'Combo Throw':{'type':'energyDamage','source':'opponent','amount':10}},
'9':{'Bite':N,'Trash Bolt':R('9:trashBolt')},
'10':{'Psychic Removal':R('10:psychicRemoval'),'Grudge':R('10:grudge')},
'11':{'Trample':R('11:trample'),'Rend':B(20,DAMAGED)},
'12':{'Poison Bind':S(ST('poison'),LOCK()),'Long Whip':R('12:longWhip')},
'13':{'Conform':R('13:conform'),'Seal Off':R('13:sealOff')},
'14':{'Return Blow':R('14:returnBlow'),'Metal Fang':R('14:metalFang'),'Heavy Impact':N},
'15':{'Needle Shock':R('15:needleShock')},
'16':{'Hand Refresh':R('16:handRefresh'),'Payback':R('16:payback')},
'17':{'Body Slam':Q(ST('paralysis')),'Mega Impact':N},
'18':{'Hypnosis':ST('sleep'),'Psywave':{'type':'energyDamage','source':'opponent','amount':10}},
'19':{'Tail Slap':N,'Evolving Flare':R('19:evolvingFlare')},
'20':{'Chop Up':BENCH(10,all=True,filter={'damaged':True}),'Feint':{'type':'damageRule','ignoreResistance':True}},
'21':{'Calling Wave':R('21:callingWave'),'Wave Splash':N},
'22':{'Tackle':N,'Muddy Bomb':R('22:muddyBomb'),'Raging Sea':R('22:ragingSea')},
'23':{'Rage':{'type':'damageFromDamage','source':'self','amount':1},'Double-edge':SELF(60)},
'24':{'Focus Energy':{'type':'nextAttackBonus','attackName':'Megahorn','amount':50},'Megahorn':{'type':'coinAttackGate','heads':N}},
'25':{'Save Sand':R('25:saveSand'),'Groundquake':R('25:groundquake')},
'26':{'Quick Attack':Q(B(30)),'Evolving Thunder':R('26:evolvingThunder')},
'27':{'Avalanche':Q(BENCH(10))},
'28':{'Magic Heal':R('28:magicHeal'),'Barrier Attack':GUARD(10)},
'29':{'Fling Away':R('29:flingAway'),'Giga Horn':R('29:gigaHorn')},
'30':{'Mega Punch':N,'Ruthless Tail':{'type':'benchCountDamage','amount':10,'side':'opponent'}},
'31':{'Thunder Throw':{'type':'multiTargetDamage','target':'opponentBench','amount':10,'count':2},'Repeat Lightning':R('31:repeatLightning')},
'32':{'Double Lariat':COINS(2,30),'Rock Tumble':{'type':'damageRule','ignoreResistance':True}},
'33':{'Pick and Collect':SEARCH('discard',4,basicEnergy=True),'Roll Over':R('33:rollOver')},
'34':{'Muddy Water':BENCH(10,all=False),'Evolving Aqua':R('34:evolvingAqua')},
'35':{'Leaf Needle':R('35:leafNeedle')},
'36':{'Cold Crush':R('36:coldCrush')},
'37':{'Skill Dive':SELECT(10),'Whirlwind':{'type':'forceOpponentSwitch','chooseBy':'defender'}},
'38':{'Recover':R('38:recover'),'Mysterious Beam':Q(R('38:beam'))},
'39':{'Reckless Bomb':S(BENCH(20),SELF(100)),'Reflect Energy':{'type':'moveEnergy','source':'self','target':'selfBench','amount':1}},
'40':{'Confuse Ray':ST('confusion'),'Attack and Hide':R('40:attackHide')},
'41':{'Ice Blade':SELECT(30),'Ice Bind':R('41:iceBind')},
'42':{'Bite and Crush':R('42:biteCrush')},
'43':{'Split Bomb':{'type':'multiTargetDamage','target':'opponentPokemon','amount':20,'count':2},'High Jump Kick':N},
'44':{'Heavy Metal':R('44:heavyMetal'),'Granite Head':GUARD(10)},
'45':{'Plus Energy':R('45:plusEnergy'),'Soothing Scent':ST('sleep')},
'46':{'Cross-Cut':B(20,EVOLVED),'Brush Off':R('46:brushOff')},
'47':{'Pickup Power':R('47:pickupPower'),'Fire Mane':N},
'48':{'Cut':N,'Crushing Blow':Q(R('38:beam'))},
'49':{'Crunch':R('49:crunch'),'Sharp Fang':N},
'50':{'Synchro Gain':R('50:synchroGain'),'Powerful Spin':LOCK('attack','self','nextOwnTurn')},
'51':{'Mend':R('51:mend'),'Squeeze':Q(S(B(50),ST('paralysis')))},
'52':{'Fly':R('52:fly'),'Blessed Fruit':R('52:blessedFruit'),'Solarbeam':N},
'53':{'Energy Typhoon':R('53:energyTyphoon'),'Quick Attack':Q(B(20))},
'54':{'Sleep Pulse':ST('sleep'),'Earthquake':BENCH(10,'self')},
'55':{'Collect':DRAW(2),'Primal Breath':R('55:primalBreath')},
'56':{'Tail Code':R('56:tailCode'),'Snap Attack':R('56:snapAttack')},
'57':{'Iron Head':R('57:ironHead'),'Ram':N},
'58':{'Scary Face':Q(S(LOCK('attack'),LOCK('retreat'))),'Whirlpool':Q(R('38:beam'))},
'59':{'Signs of Evolution':SEARCH('deck',2,evolvesFrom='Eevee'),'Bounce':SWITCH()},
'60':{'Tackle':N,'Fire Tail Slap':Q(t=DISC(1,energyType='Fire',strictEnergyType=True))},
'61':{'Shell Scatter':R('61:shellScatter'),'Bomb Risk':S(BENCH(10),BENCH(10,'self'),Q(t=SELF(80)))},
'62':{'Irongrip':N,'Loaded Needle':Q(B(30),ST('poison'))},
'63':{'Stoke':R('63:stoke'),'Take Down':SELF(10)},
'64':{'Push Down':{'type':'forceOpponentSwitch','chooseBy':'defender'},'Endeavor':R('64:endeavor')},
'65':{'Corner':LOCK(),'Fire Fang':ST('burn')},
'66':{'Dangerous Evolution':R('66:dangerousEvolution')},
'67':{'Triple Smash':COINS(3,20)},
'68':{'Offensive Gas':R('68:offensiveGas'),'Gas Bomb':R('68:gasBomb')},
'69':{'Rest':R('69:rest')},
'70':{'Errand-Running':SEARCH('deck',1,kind='trainer')},
'71':{'Scratch':N,'Offer Help':SEARCH('deck',1,kind='trainer',trainerType='Supporter')},
'72':{'Leer':Q(LOCK('attack')),'Horn Hazard':{'type':'coinAttackGate','heads':N}},
'73':{'Jump Tackle':SELF(10),'Stress Poison':R('73:stressPoison')},
'74':{'Toxic':ST('poison',amount=20),'Frustration':R('74:frustration')},
'75':{'Blind':{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},'Feint Attack':R('75:feintAttack')},
'76':{'Punch and Run':OPT(SWITCH(),'Switch Quagsire GL with a Benched Pokémon')},
'77':{'Find Ice':SEARCH('deck',2,basicEnergy=True,energyType='Water'),'Sheer Cold':Q(LOCK('attack'))},
'78':{'Harden':R('78:harden'),'Astonish':{'type':'shuffleRandomHandCard','side':'opponent'}},
'79':{'Ripple':Q(R('79:ripple')),'Brine':R('79:brine')},
'80':{'Healing Sea':R('80:healingSea'),'Mud Shot':N},
'81':{'Toss and Turn':B(30,{'type':'selfStatus','status':'sleep'}),'Heavy Press':Q(B(40),ST('sleep','self'))},
'82':{'Powder Snow':ST('sleep'),'Ice Ball':N},
'83':{'Cosmic Draw':R('83:cosmicDraw'),'Swift':{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True}},
'84':{'Grind':{'type':'energyDamage','source':'self','amount':10,'mode':'replace'}},
'85':{'Giga Drain':R('85:gigaDrain')},
'86':{'Rescue String':R('86:rescueString'),'Needling Sting':Q(B(10))},
'87':{'Damage Breakdown':R('87:damageBreakdown'),'Smog':ST('poison')},
'95':{'Damage Porter':R('95:damagePorter')},
'103':{'Mind Shock':{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}},
'104':{'Energy Cyclone':R('104:energyCyclone')},
'105':{'Extreme Attack':R('105:extremeAttack')},
'106':{'Aimed Cut':{'type':'damageFromDamage','source':'opponent','amount':1}},
'107':{'Double Shoot':R('107:doubleShoot')},
'108':{'Fire Spin':DISC(2)},
'109':{'Flash Impact':R('109:flashImpact')},
'110':{'Darkness Magic':R('110:darknessMagic')},
'111':{'Exercise':R('111:exercise')},
'112':{'Gnaw':N,'Thunder Jolt':Q(t=SELF(10))},
'113':{'Thundershock':Q(ST('paralysis')),'Fly':R('52:fly')},
'114':{'Surf':N},
'RT1':{'Spin Storm':R('RT1:spinStorm'),'Air Slash':Q(t=DISC(1))},
'RT2':{'Hail':R('RT2:hail'),'Crushing Ice':R('RT2:crushingIce')},
'RT3':{'Warm Up':R('RT3:warmUp'),'Heat Burn':ST('burn')},
'RT4':{'Slash':N,'Mow Down':Q(R('RT4:mowDown'))},
'RT5':{'Cleanse Away':H(30,'selfBenchAll'),'Drain Wash':R('RT5:drainWash')},
}

# Poké-Powers and passive Bodies require a real lifecycle hook. Unmapped
# powers deliberately gate their entire card, even where attacks are simple.
ABILITIES={
 '19':[P('Undevelop',R('undevelop'),oncePerTurn=True)],
 '26':[P('Undevelop',R('undevelop'),oncePerTurn=True)],
 '34':[P('Undevelop',R('undevelop'),oncePerTurn=True)],
 '69':[P('Baby Evolution',{'type':'neoRule','rule':'dp1:babyEvolve','targetName':'Snorlax'},oncePerTurn=True)],
 '70':[P('Baby Evolution',{'type':'neoRule','rule':'dp1:babyEvolve','targetName':'Snorlax'},oncePerTurn=True)],
 '50':[P('Aqua Recycle',R('aquaRecycle'),oncePerTurn=True)],
 '84':[P('Gather Sand',R('gatherSand'),oncePerTurn=True,activeOnly=True)],
 '85':[P('Overgrow',{'type':'modifier','stat':'attackDamage','amount':30,'scope':'self','duration':'whileInPlay','condition':{'type':'selfRemainingHpAtMost','amount':60}},kind='passive')],
 '15':[P('Flutter Wings',SEARCH('deck',1,kind='pokemon',subtype='Grass'),oncePerTurn=True)],
 '81':[P('Bad Sleeping Habits',N,kind='passive')],
 '76':[P('Submerge',{'type':'preventDamage','target':'self','scope':'self','duration':'whileInPlay'},kind='passive',benchOnly=True)],
 '66':[P('Exoskeleton',{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'whileInPlay'},kind='passive')],
}

# No empty safe defaults for the Stadiums, Trainers or Special Energy:
# only options implemented by the shared engine get battleEnabled=True.
TRAINERS={
 '88':('Supporter',R('88:aarons')),
 '89':('Supporter',R('89:bebes')),
 '90':('Supporter',R('90:berthas')),
 '91':('Supporter',R('91:flints')),
 '92':('Supporter',R('92:lucians')),
 '93':('Stadium',R('93:contestHall')),
 '94':('Stadium',R('94:sunyshore')),
 '95':('Technical Machine',R('95:technicalMachine')),
 '96':('Item',R('96:spRadar')),
 '97':('Supporter',R('97:expedition')),
 '98':('Supporter',R('98:volkner')),
 'RT6':('Supporter',R('RT6:charon')),
}
ENERGY={
 '99':{'type':'specialEnergy','provides':{'Darkness':1},'bonusDamageOnDarkness':10},
 '100':{'type':'specialEnergy','provides':{'Metal':1},'damageReductionOnMetal':10},
 '101':{'type':'specialEnergy','provides':{'Colorless':1}},
 '102':{'type':'specialEnergy','provides':{'Colorless':1}},
}
# Only this subset of card-specific runtime cases has an implementation so far.
PL2_VERIFIED_RULES=set()

# Safely reusable, print-specific effects verified against the source archive.
# No new runtime branches are required for these cases.
ATTACKS['6']['Sleep Inducer']=S({'type':'forceOpponentSwitch','chooseBy':'defender'},ST('sleep'))
ATTACKS['9']['Trash Bolt']={'type':'discardChosenHand','filter':{'kind':'energy'},'amount':1,'side':'self','required':True,'zeroDamageIfFailed':True}
ATTACKS['13']['Conform']=ST('confusion',condition={'type':'handSizesEqual'})
ATTACKS['22']['Raging Sea']={'type':'benchCountDamage','side':'self','amount':10,'filter':{'damaged':True}}
ATTACKS['31']['Repeat Lightning']={'type':'benchCountDamage','side':'opponent','amount':10,'filter':{'damaged':True}}
ATTACKS['33']['Roll Over']=Q(S(ST('sleep'),ST('sleep','self')),ST('sleep','self'))
ATTACKS['36']['Cold Crush']=S(DISC(1,'self'),DISC(1,'opponentActive'))
ATTACKS['42']['Bite and Crush']={'type':'coinDamage','coins':2,'amount':10}
ATTACKS['57']['Iron Head']={'type':'coinDamage','coins':'untilTails','amount':10,'mode':'replace'}
ATTACKS['61']['Shell Scatter']=S(BENCH(10),LOCK('attack','self','nextOwnTurn',attackName='Shell Scatter'))
ATTACKS['64']['Endeavor']={'type':'coinDamage','coins':2,'amount':20}
ATTACKS['68']['Offensive Gas']=Q(S(ST('confusion'),ST('poison')))
ATTACKS['68']['Gas Bomb']=SELF(30)
ATTACKS['69']['Rest']=S(H(60),{'type':'removeStatus','target':'self'},ST('sleep','self'))
ATTACKS['73']['Stress Poison']=S(B(20,{'type':'selfDamaged'}),ST('poison',condition={'type':'selfDamaged'}))
ATTACKS['74']['Frustration']=SELECT(40,'opponentPokemon',filter={'damaged':False})
ATTACKS['75']['Feint Attack']=SELECT(30,'opponentPokemon',ignoreEffects=True)
ATTACKS['79']['Ripple']=Q(S({'type':'damage','amount':10,'target':'opponentActive'},BENCH(10)))
ATTACKS['79']['Brine']=SELECT(20,'opponentPokemon',filter={'damaged':True})
ATTACKS['83']['Cosmic Draw']={'type':'draw','amount':3,'condition':{'type':'pokemonPresent','side':'opponent','filter':{'evolved':True}}}
ATTACKS['113']['Fly']={'type':'coinAttackGate','heads':{'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}}
ATTACKS['52']['Fly']=ATTACKS['113']['Fly']
ATTACKS['RT2']['Hail']=BENCH(10)
ATTACKS['RT2']['Crushing Ice']={'type':'retreatCostDamage','amount':10}
ATTACKS['RT5']['Cleanse Away']=H(30,'selfBenchAll')
# Printing-specific conditional bonus for Eevee's immediate evolution turn.
ATTACKS['19']['Evolving Flare']=S(B(20,{'type':'evolvedThisTurn'}),ST('burn',condition={'type':'evolvedThisTurn'}))
ATTACKS['26']['Evolving Thunder']=R('26:evolvingThunder')  # bench condition requires event hook
ATTACKS['34']['Evolving Aqua']=R('34:evolvingAqua')
ATTACKS['77']['Find Ice']=SEARCH('deck',2,basicEnergy=True,subtype='Water')
ATTACKS['83']['Cosmic Draw']={'type':'draw','amount':3,'condition':{'type':'pokemonPresent','side':'opponent','zone':'inPlay','filter':{'evolved':True}}}
# Rotom's explicit shift Powers use the battle engine's existing typeOverride
# state, which expires when the current player turn ends (never dual-type).
for number,new_type in [('RT1','Colorless'),('RT2','Water'),('RT3','Fire'),('RT4','Grass'),('RT5','Water')]:
 ABILITIES[number]=[P({'RT1':'Fan Shift','RT2':'Frost Shift','RT3':'Heat Shift','RT4':'Mow Shift','RT5':'Wash Shift'}[number],R('rotomShift',to=new_type),oncePerTurn=True)]
PL2_VERIFIED_RULES.add('rotomShift')
ATTACKS['RT1']['Spin Storm']=Q({'type':'returnToHand','target':'opponentActive','returnBasicEnergy':True})
ATTACKS['RT4']['Mow Down']=Q({'type':'discardEnergyCard','target':'opponentAll','amount':1})
ATTACKS['RT5']['Drain Wash']={'type':'coinUntilTails','effect':{'type':'discardHand','side':'opponent','amount':1}}

# Additional independent reuse pass: these effects are implemented in the
# shared engine, including activation conditions and the physical evolution stack.
for number in ('19','26'):
 ABILITIES[number]=[P('Undevelop',{'type':'devolve','target':'self'},oncePerTurn=True)]
ATTACKS['26']['Evolving Thunder']=BENCH(10,condition={'type':'evolvedThisTurn'})
ATTACKS['85']['Giga Drain']={'type':'drain','fraction':1}
ATTACKS['66']['Dangerous Evolution']=S(ST('poison'),Q({'type':'evolveFromDeck'}))


# v0.69.268: independently checked print-specific continuations. Rules below
# have corresponding executable handlers and outcome tests; unhandled cards
# remain explicitly gated rather than receiving plausible-looking placeholder
# damage.
ATTACKS['10']['Psychic Removal']=Q(Q({'type':'discardEnergyCard','target':'opponentActive','amount':'all'}))
ATTACKS['10']['Grudge']=R('10:grudge')
ATTACKS['11']['Trample']=R('11:trample')
ATTACKS['12']['Long Whip']=R('12:longWhip')
ATTACKS['14']['Return Blow']=R('pl1mirror')  # exact last-opponent-turn damage, not a new coin roll
ATTACKS['14']['Metal Fang']=R('14:metalFang')
ATTACKS['16']['Hand Refresh']=R('16:handRefresh')
ATTACKS['16']['Payback']=R('16:payback')
ATTACKS['22']['Muddy Bomb']=R('22:muddyBomb')
ATTACKS['28']['Magic Heal']=R('28:magicHeal')
ATTACKS['34']['Evolving Aqua']=R('34:evolvingAqua')
ABILITIES['34']=[P('Undevelop',{'type':'devolve','target':'self'},oncePerTurn=True)]
ATTACKS['38']['Recover']=R('38:recover')
ATTACKS['38']['Mysterious Beam']=Q({'type':'discardEnergyCard','target':'opponentActive','amount':1})
ATTACKS['44']['Heavy Metal']=R('44:heavyMetal')
ATTACKS['47']['Pickup Power']=R('47:pickupPower')
ATTACKS['48']['Crushing Blow']=Q({'type':'discardEnergyCard','target':'opponentActive','amount':1})
ATTACKS['50']['Synchro Gain']=H(40,'self')
ATTACKS['50']['Synchro Gain']['condition']={'type':'equalEnergyCount'}
ABILITIES['50']=[P('Aqua Recycle',R('50:aquaRecycle'),oncePerTurn=True)]
ATTACKS['51']['Mend']=R('51:mend')
ATTACKS['52']['Blessed Fruit']=R('52:blessedFruit')
ATTACKS['53']['Energy Typhoon']=R('53:energyTyphoon')
ATTACKS['56']['Tail Code']={'type':'moveEnergy','source':'opponentActive','target':'opponentBench','amount':1}
ATTACKS['56']['Snap Attack']=R('56:snapAttack')
ATTACKS['63']['Stoke']=R('63:stoke')
ATTACKS['80']['Healing Sea']=R('80:healingSea')
ATTACKS['86']['Rescue String']=R('86:rescueString')
ATTACKS['RT3']['Warm Up']=R('RT3:warmUp')
ABILITIES['84']=[P('Gather Sand',R('84:gatherSand'),oncePerTurn=True,activeOnly=True)]
ABILITIES['42']=[P('Sand Armor',{'type':'modifier','stat':'damageReduction','amount':10,'scope':'self','duration':'whileInPlay','condition':{'type':'selfHasEnergyType','energyType':'Fighting'}},kind='passive')]
ABILITIES['81']=[P('Bad Sleeping Habits',R('81:badSleepingHabits'),kind='passive')]
ABILITIES['108']=[P('Intimidating Roar',{'type':'forceOpponentSwitch','chooseBy':'defender'},oncePerTurn=True)]
TRAINERS['88']=('Supporter',R('88:aarons'))
TRAINERS['90']=('Supporter',R('90:berthas'))
TRAINERS['96']=('Item',R('96:spRadar'))
TRAINERS['98']=('Supporter',R('98:volkner'))
PL2_VERIFIED_RULES.update({
 'pl1mirror','10:grudge','11:trample','12:longWhip','14:metalFang',
 '16:handRefresh','16:payback','22:muddyBomb','28:magicHeal',
 '34:evolvingAqua','38:recover','44:heavyMetal','47:pickupPower',
 '50:aquaRecycle','51:mend','52:blessedFruit','53:energyTyphoon','56:snapAttack',
 '63:stoke','80:healingSea','86:rescueString','RT3:warmUp',
 '84:gatherSand','81:badSleepingHabits',
 '88:aarons','90:berthas','96:spRadar','98:volkner'})

# Additional battle-outcome and lifecycle coverage in the same continuation.
# Arcanine's optional Burn Out bonus must be applied before Weakness, so keep
# this print gated until its pre-damage option can be offered correctly.
ATTACKS['15']['Needle Shock']=R('15:needleShock')
ATTACKS['29']['Fling Away']=R('29:flingAway')
ATTACKS['29']['Giga Horn']=R('29:gigaHorn')
ABILITIES['29']=[P('Territoriality',R('29:territoriality'),kind='passive')]
ATTACKS['35']['Leaf Needle']=R('35:leafNeedle')
ABILITIES['35']=[P('Royal Gain',R('35:royalGain'),kind='passive')]
ABILITIES['67']=[P('Colorful Body',R('67:colorfulBody'),kind='passive')]
TRAINERS['89']=('Supporter',R('89:bebes'))
TRAINERS['91']=('Supporter',R('91:flints'))
ABILITIES['103']=[P('Damage Switch',R('103:damageSwitch'))]
ATTACKS['110']['Darkness Magic']=R('110:darknessMagic')
ABILITIES['110']=[P('Magical Return',R('110:magicalReturn'))]
ATTACKS['111']['Exercise']=R('111:exercise')
ABILITIES['111']=[P('Big Appetite',S({'type':'drawToHandSize','size':6},ST('sleep','self')),oncePerTurn=True,activeOnly=True)]
PL2_VERIFIED_RULES.update({
 '1:flamesOfRage','1:flareCondition','15:needleShock',
 '29:flingAway','29:gigaHorn','29:territoriality',
 '35:leafNeedle','35:royalGain','67:colorfulBody',
 '89:bebes','91:flints','103:damageSwitch','110:darknessMagic','110:magicalReturn','111:exercise'})
