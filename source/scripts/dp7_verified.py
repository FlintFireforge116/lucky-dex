"""Audited Stormfront (DP7) mechanics built on existing Classic TCG engine.

Only promote a print when ALL attacks and its abilities have real effects.
The archival printed text always wins over heuristic substring matching.
"""
import re
N={'type':'noop'}
def S(*effects):return {'type':'sequence','effects':list(effects)}
def Q(h=None,t=None):return {'type':'coinFlip',**({'heads':h} if h else {}),**({'tails':t} if t else {})}
def ST(x,who='opponentActive'):return {'type':'status','target':who,'status':x}
def B(x,cond=None):return {'type':'bonusDamage','amount':x,**({'condition':cond} if cond else {})}
def COINS(n,x):return {'type':'coinDamage','coins':n,'amount':x,'mode':'replace'}
def R(k):return {'type':'neoRule','rule':'dp7:'+k}
def L(action,target='opponentActive',duration='opponentTurn',**opts):return {'type':'lock','action':action,'target':target,'duration':duration,**opts}
def SH(n):return {'type':'heal','target':'self','amount':n}
def D(n=1):return {'type':'draw','amount':n}
def ER(t,n=1,target='self'):return {'type':'discardEnergyCard','target':target,'energyType':t,'strictEnergyType':True,'amount':n}
def SELF(n):return {'type':'selfDamage','amount':n}
def BENCH(n,who='opponent',all=True,**opts):return {'type':'benchDamage','side':who,'amount':n,'all':all,**opts}
def SELECT(n,who='opponentPokemon',**opts):return {'type':'selectedDamage','target':who,'amount':n,**opts}
def GUARD(n):return {'type':'modifier','stat':'damageReduction','amount':n,'scope':'self','duration':'opponentTurn'}
def POW(name,kind,effect,**extras):return {'name':name,'type':kind,'printedPowerType':'power' if kind!='passive' else 'body','disabledByStatus':kind=='activated','effect':effect,**extras}
def BEN(name,effect,**opts):return POW(name,'triggered',effect,event='benched',fromHandOnly=True,**opts)
def EVO(name,effect,**opts):return POW(name,'triggered',effect,event='evolved',fromHandOnly=True,**opts)
def BODY(name,effect=N,**opts):return POW(name,'passive',effect,**{'disabledByStatus':False,**opts})
def ACT(name,effect,**opts):return POW(name,'activated',effect,**{'oncePerTurn':True,'allSpecialConditions':True,**opts})

ATTACKS={
 1:{'Damage Even':R('1:damageEven'),'Night Spin':R('1:nightSpin')},
 2:{'Steel Wing':GUARD(20),'Whirlpool':R('2:whirlpool')},
 3:{'Close Combat':{'type':'modifier','stat':'damageReduction','amount':-30,'scope':'self','duration':'opponentTurn'},'Spreading Fire':S(ER('Fire',2),BENCH(20))},
 4:{'Quick Swim':SELECT(20,ignoreWeakness=True,ignoreResistance=True),'Elegant Swim':Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True})},
 5:{'Speed Shot':SELECT(30,ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),'Crush Volt':{'type':'discardEnergyCard','target':'self','amount':1}},
 6:{'Gyro Ball':R('6:gyroBall')},
 7:{'Crash Chant':R('7:crashChant'),'Horror Chant':R('7:horrorChant')},
 8:{'Slice':L('attack','self','nextOwnTurn',attackName='Slice'),'Split Ball':{'type':'moveEnergy','source':'self','target':'selfBench','amount':1},'Burst Ball':R('8:burstBall')},
 9:{'Mega Punch':N,'Giga Power':R('9:gigaPower')},
10:{'Poison Leaf':ST('poison'),'Slice Drain':SH(20)},
11:{'Crash Impact':S(SELF(20),{'type':'forceOpponentSwitch','chooseBy':'defender'}),'Land Shake':R('11:landShake')},
12:{'Snow Play':R('12:snowPlay'),'Below Zero':{'type':'status','target':'opponentActive','status':'paralysis','condition':{'type':'evolvedThisTurn'}}},
13:{'Strange Spin':S(B(40,{'type':'handSizesEqual'}),{'type':'status','target':'opponentActive','status':'confusion','condition':{'type':'handSizesEqual'}}),'Heavy Potential':R('13:heavyPotential')},
14:{'Salty-sweet Pollen':{'type':'heal','target':'selfPokemon','amount':20},'Solarbeam':N},
15:{'Scorpion Grapple':Q(ST('paralysis'),L('retreat')),'Cross Poison':R('15:crossPoison'),'Derail':R('15:derail')},
16:{'Delivery':{'type':'searchChosen','source':'discard','amount':1,'filter':{}},'Lifting':R('16:lifting'),'Ominous Wind':Q(S(ST('confusion'),L('retreat')))},
17:{'Darkness Mist':B(20,{'type':'opponentDamageAtLeast','amount':20})},
18:{'Shadow Room':R('18:shadowRoom'),'Poltergeist':R('18:poltergeist')},
19:{'Tail Revenge':{'type':'discardCountDamage','amount':30,'mode':'replace','filter':{'name':'Magikarp'}},'Wreak Havoc':{'type':'coinUntilTails','effect':{'type':'discardTop','side':'opponent','amount':1}},'Dragon Beat':R('19:dragonBeat')},
20:{'Take Out':R('20:takeOut'),'Hurricane Punch':COINS(4,30),'Rage':{'type':'damageFromDamage','source':'self','amount':1}},
21:{'Ramming Strike':R('21:rammingStrike'),'Parade':S({'type':'fieldCountDamage','amount':10,'filter':{'name':'Swinub'}},{'type':'fieldCountDamage','amount':20,'filter':{'name':'Piloswine'}},{'type':'fieldCountDamage','amount':40,'filter':{'name':'Mamoswine'}})},
22:{'Rear Kick':N,'Shooting Fire':S(ER('Fire',2),SELECT(60))},
23:{'Bowed Whip':R('23:bowedWhip'),'Deep Poison':B(30,{'type':'opponentStatus','status':'poison'})},
24:{'Combustion':N,'Steam Twister':S(ER('Fire'),ER('Water'))},
25:{'Accelerate':R('25:accelerate'),'Pound Down':R('25:poundDown')},
26:{'Poison Claws':ST('poison'),'Plunder':R('26:plunder')},
27:{'Strong Breeze':R('27:strongBreeze'),'Clutch':L('retreat')},
28:{'Outbreak Power':R('28:outbreakPower'),'Iron Tail':{'type':'coinDamage','coins':'untilTails','amount':100,'mode':'replace'}},
29:{'Green Acid':R('29:greenAcid'),'Reaching Vine':{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':20}},
30:{'Grind':{'type':'energyDamage','source':'self','amount':20,'mode':'replace'},'Spinning Tail':R('30:spinningTail')},
31:{'Bee Drain':R('31:beeDrain'),'Bee Powder':{'type':'allHeadsEffect','coins':2,'heads':S(ST('burn'),ST('paralysis'),ST('poison'))}},
32:{'Amnesia':{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},'Surf':N},
33:{'Buddy-buddy':{'type':'searchChosen','source':'deck','amount':1,'filter':{'kind':'pokemon'}}},
34:{'Dark One-eye':R('34:darkOneEye'),'Ambush':Q(B(20))},
35:{'Confuse Ray':Q(ST('confusion')),'Trick Room':R('35:trickRoom')},
36:{'Low Current':{'type':'status','target':'opponentActive','status':'paralysis','condition':{'type':'damagedByAttackLastOpponentTurn'}},'Swift':{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True}},
37:{'Flash':{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},'Electro Diffusion':R('37:electroDiffusion')},
38:{'Go and Collect':{'type':'searchChosen','source':'deck','amount':1,'filter':{'kind':'trainer'}},'Fury Cutter':{'type':'coinTierBonus','coins':3,'tiers':{'0':0,'1':10,'2':20,'3':40}}},
39:{'Tail Shake':ST('sleep'),'Slam':COINS(2,60)},
40:{'Smog':ST('poison'),'Hoodwink':R('40:hoodwink')},
41:{'Steady Punch':Q(B(20)),'Brick Break':{'type':'damageRule','ignoreResistance':True,'ignoreEffects':True}},
42:{'Magnetic Resonance':R('42:magneticResonance'),'Magnetic Release':{'type':'energyDamage','source':'opponent','amount':10}},
43:{'Thunder Wave':Q(ST('paralysis')),'Removal Pulse':R('43:removalPulse')},
44:{'Collect':D(1),'Energy Milk':R('44:energyMilk'),'Stomp':Q(B(20))},
45:{'Electric Circuit':R('45:electricCircuit')},
46:{'Rouse':S({'type':'damageFromDamage','source':'self','amount':1},SH(40)),'Overrun':{'type':'selectedDamage','target':'opponentBench','amount':20}},
47:{'Rock Smash':Q(B(20))},
48:{'Impersonate':R('48:impersonate'),'Overconfident':R('48:overconfident')},
49:{'Swords Dance':{'type':'nextAttackBonus','attackName':'Slashing Strike','amount':30},'Slashing Strike':L('attack','self','nextOwnTurn',attackName='Slashing Strike')},
50:{'Body Slam':Q(ST('paralysis')),'Rollout':N},
51:{'Quick Attack':Q(B(20)),'Mach Blade':Q(SELECT(50))},
52:{'Wing Attack':N,'Shot Air':SELECT(30,'opponentBench')},
53:{'Scary Face':Q(S(L('attack'),L('retreat'))),'Headbutt':N},
54:{'Yawn':ST('sleep'),'Self-abandonment':R('54:selfAbandonment')},
55:{'Gyro Swap':R('55:gyroSwap'),'Psyshock':Q(ST('paralysis'))},
56:{'Nap':SH(20),'Bullet Seed':COINS(4,10)},
57:{'Alert':S(D(1),{'type':'chooseOption','options':[{'label':'Keep Combee Active','effect':N},{'label':'Switch Combee with your Bench','effect':{'type':'switch','side':'self'}}]})},
58:{'Constrict':Q(ST('paralysis')),'Linear Attack':SELECT(10)},
59:{'Silhouette':R('59:silhouette'),"Will-o'-the-wisp":N},
60:{'Tackle':N,'Surprise Attack':{'type':'coinAttackGate','heads':N}},
61:{'Aqua Liner':SELECT(10,'opponentBench'),'Mouth Pump':Q(B(10))},
62:{'Pitch-Dark':R('62:pitchDark'),'Trick Gas':{'type':'switch','side':'self'}},
63:{'Bite':N,'Rock Slide':{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':10}},
64:{'Kick':N,'Knock Back':{'type':'forceOpponentSwitch','chooseBy':'defender'}},
65:{'Sea Spray':R('65:seaSpray'),'Splash':N},
66:{'Magnetic Bomb':Q(B(10),SELF(10))},
67:{'Ram':N,'Random Spark':SELECT(20)},
68:{'Lullaby':ST('sleep'),'Nightmare Feast':R('68:nightmareFeast')},
69:{'Harden':R('69:harden'),'Bind':Q(ST('paralysis'))},
70:{'Pika Punch':N,'Speed Bolt':R('70:speedBolt')},
71:{'Smash Kick':N,'Agility':Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True})},
72:{'Headbutt':N,'Petal Spikes':R('72:petalSpikes')},
73:{'Stalk':L('retreat'),'Dangerous Claw':Q(ST('paralysis'),ST('poison'))},
74:{'Hide':Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),'Powder Snow':ST('sleep')},
75:{'Sand Attack':{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},'Double Stab':COINS(2,10)},
76:{'Gnaw and Run':{'type':'switch','side':'self'},'Double Scratch':COINS(2,20)},
77:{'Freezing Breath':Q(ST('paralysis'),ST('sleep')),'Take Down':Q(t=SELF(10))},
78:{'Ingrain':R('78:ingrain'),'Tickle':Q(ST('paralysis'))},
79:{'Call for Friends':{'type':'searchChosen','source':'deck','amount':1,'filter':{'kind':'pokemon','stage':'Basic'}},'Poison Breath':Q(ST('poison'))},
80:{'Screech':R('80:screech'),'Double Spin':COINS(2,10)},
81:{'Outlet':{'type':'searchChosen','source':'deck','amount':1,'filter':{'basicEnergy':True,'subtype':'Lightning'}},'Bouncing Ball':Q(t=SELF(10))},
98:{'Strong-Willed':{'type':'koGuard','mode':'surviveCoin','remainingHp':10,'duration':'opponentTurn','target':'self'}},
99:{'Voltage Shoot':R('99:voltageShoot')},
100:{'Giga Blaster':S({'type':'discardTop','side':'opponent','amount':1},{'type':'discardHand','side':'opponent','amount':1},L('attack','self','nextOwnTurn',attackName='Giga Blaster'))},
101:{'Scratch':N,'Ember':ER('Fire')},
102:{'Slash':N,'Flamethrower':ER('Fire')},
103:{'Fire Spin':{'type':'discardEnergyCard','target':'self','amount':2}},
'SH1':{'Tackle':N,'Big Explosion':SELF(50)},
'SH2':{'Counting Song':R('SH2:countingSong'),'Ram':N,'Night Bind':Q(R('SH2:nightBind'))},
'SH3':{'Fastball':Q(SELECT(20)),'Charge Beam':{'type':'attachEnergyFromDiscard','amount':1,'energyType':'Lightning','target':'self'},'Thundershock':Q(ST('paralysis'))},
}
# Abilities: passive effects use existing shared mechanic hooks when available.
ABILITIES={
 1:ACT('Shadow Command',R('1:shadowCommand')),
 2:EVO('Emperor Aura',R('2:emperorAura'),activeOnly=True),
 3:EVO('Blaze Dance',R('3:blazeDance')),
 4:ACT('Fin Luster',R('4:finLuster'),activeOnly=True),
 5:ACT('Magnetic Search',{'type':'searchChosen','source':'deck','amount':1,'filter':{'kind':'pokemon','subtype':['Lightning','Metal']}}),
 6:ACT('Super Connectivity',R('6:superConnectivity')),
 9:BODY('Regi Form'),
10:ACT('Energy Trans',{'type':'redistributeEnergy','allowedEnergyTypes':['Grass'],'includeSpecialEnergy':True},oncePerTurn=False),
11:EVO('Sunshine Song',R('11:sunshineSong')),
12:BODY('Snow Veil'),
13:ACT('Cycler',R('13:cycler')),
14:BODY('Sunny Day'),
17:BODY('Spirit Pulse'),
18:POW('Fainting Spell','triggered',Q({'type':'knockOut','target':'opponentActive'}),event='knockedOutByAttack',opponentAttackOnly=True),
22:POW('Burning Mane','triggered',ST('burn'),event='damagedByAttack',activeOnly=True),
23:POW('Hidden Poison','triggered',ST('poison'),event='damagedByAttack',activeOnly=True),
24:BODY('Battle Rush'),
25:BODY('Honeycomb Defender'),
26:EVO('Evolutionary Gas',{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},activeOnly=True),
27:BODY('Protect Wing',activeOnly=True),
29:POW('Green Renewal','triggered',SH(10),event='checkup',disabledByStatus=False),
30:POW('Darkness Drive','triggered',R('30:darknessDrive'),event='opponentPower'),
31:BODY('Green Dignity'),
32:BODY('Unaware'),
33:[BODY('Poison Enzyme'),ACT('Baby Evolution',R('33:babyEvolution'),allSpecialConditions=False)],
36:POW('Radiance','triggered',R('36:radiance'),event='damagedByAttack',activeOnly=True),
45:ACT('Baby Evolution',R('45:babyEvolution'),allSpecialConditions=False),
47:BODY('Energy Protection'),
48:BODY('Overeager'),
96:POW('Ectoplasm','triggered',R('96:ectoplasm'),event='knockedOutByAttack',activeOnly=True),
97:[BODY('Heat Metal'),POW('Heat Wave','triggered',R('97:heatWave'),event='dp7HeatWaveManual',benchOnly=True)],
98:BODY('No Guard',activeOnly=True),
99:BODY('Link Lightning'),
100:ACT('Sacrifice',R('100:sacrifice')),
103:BODY('Energy Burn'),
'SH1':BODY('Unburden'),
}
TRAINERS={
 82:('Stadium',{'type':'stadiumAction','effect':R('82:conductiveQuarry')}),
 83:('Tool',{'type':'neoRule','rule':'dp7:83:energyLink'}),
 84:('Item',R('84:energySwitch')),
 85:('Item',{'type':'benchFromDeck','amount':1,'choose':True,'filter':{'kind':'pokemon','stage':'Basic'}}),
 86:('Item',R('86:luxuryBall')),
 87:('Supporter',R('87:marleysRequest')),
 88:('Item',R('88:pokeBlower')),
 89:('Item',R('89:pokeDrawer')),
 90:('Item',R('90:pokeHealer')),
 91:('Item',R('91:premierBall')),
 92:('Item',{'type':'heal','target':'selfPokemon','amount':20}),
 93:('Item',{'type':'switch','side':'self'}),
}
ENERGY={'94':{'type':'specialEnergy','provides':{'Colorless':1},'onAttach':R('94:cycloneEnergy')},
        '95':{'type':'specialEnergy','provides':{'Colorless':1},'onAttach':R('95:warpEnergy')}}

# NeoRule IDs are explicitly gated until the dp7 handler has the printed result.
# Literal NOOP is only valid for attacks with no printed effect at all.
RUNTIME_RULES={'7:crashChant','7:horrorChant','11:landShake','11:sunshineSong','16:lifting','21:rammingStrike','30:darknessDrive','48:impersonate','83:energyLink','87:marleysRequest','88:pokeBlower','89:pokeDrawer','90:pokeHealer','96:ectoplasm','97:heatWave','99:voltageShoot','100:sacrifice','94:cycloneEnergy','95:warpEnergy','2:emperorAura','3:blazeDance','4:finLuster','8:burstBall','13:cycler','25:accelerate','25:poundDown','34:darkOneEye','72:petalSpikes', '27:strongBreeze', '6:superConnectivity', '82:conductiveQuarry', '45:babyEvolution', '9:gigaPower', '1:nightSpin', '59:silhouette', '33:babyEvolution', '23:bowedWhip', '68:nightmareFeast', '44:energyMilk', 'SH2:countingSong', '31:beeDrain', '1:damageEven','1:shadowCommand','2:whirlpool','43:removalPulse', '18:shadowRoom', '35:trickRoom', '37:electroDiffusion', '69:harden', '20:takeOut', '6:gyroBall', '28:outbreakPower', '65:seaSpray', '78:ingrain', 'SH2:nightBind', '40:hoodwink', '15:derail', '55:gyroSwap', '12:snowPlay', '86:luxuryBall', '13:heavyPotential', '62:pitchDark', '26:plunder', '19:dragonBeat', '84:energySwitch', '30:spinningTail', '48:overconfident', '15:crossPoison', '70:speedBolt', '42:magneticResonance', '45:electricCircuit', '80:screech', '29:greenAcid', '36:radiance', '54:selfAbandonment', '91:premierBall', '18:poltergeist'}  # audited rules with explicit runtime dispatch
PASSIVE_READY={9,12,14,17,24,25,27,31,32,33,47,48,97,98,99,103,'SH1'}  # tested continuous hooks

# Some supported effect aliases require exact printed semantics and cannot use
# broad generic fallbacks (e.g. targeted effects before damage vs after).
