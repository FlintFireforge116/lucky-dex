"""v0.69.259 final Legends Awakened effects.
Exact printed actions; use the existing Classic choice queue and zones.
"""
def R(k):return {'type':'neoRule','rule':'dp6:'+k}
def seq(*xs):return {'type':'sequence','effects':list(xs)}
def status(x):return {'type':'status','target':'opponentActive','status':x}
ATTACKS={
7:{'Aqua Stream':R('7:aquaStream'),'Dragon Pump':R('7:dragonPump')},
16:{'Transfer Pain':R('16:transferPain')},
19:{'Lock Up':{'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'}},
21:{'Drain Down':R('21:drainDown'),'Acid':{'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'}},
40:{'Curse and Deceive':R('40:curseAndDeceive')},
42:{'Hidden Power':R('42:hiddenPower')},
44:{'Burning Scent':R('44:burningScent'),'Energy Dissolve':R('44:energyDissolve')},
45:{'Disturbing Pollen':{'type':'coinFlip','heads':{'type':'sequence','effects':[{'type':'actionLock','side':'opponent','cardType':t,'duration':'opponentTurn'} for t in ('Trainer','Item','Tool','Supporter','Stadium')]}}},
54:{'Psychic Strategy':R('54:psychicStrategy'),'Super Eggsplosion':R('54:superEggsplosion')},
67:{'Chip Off':R('67:chipOff')},
75:{'Tentacle Strike':R('75:tentacleStrike'),'Dangerous Poison':R('75:dangerousPoison')},
77:{'Hidden Power':R('77:hiddenPower')},
82:{'Hidden Power':R('82:hiddenPower')},
}
ABILITIES={
16:{'name':'Curse Breath','type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('16:curseBreath')},
19:{'name':'Time Walk','type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('19:timeWalk')},
27:{'name':'Ditto DNA','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'noop'}},
40:{'name':'Resent','type':'triggered','event':'knockedOutByAttack','opponentAttackOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('40:resent')},
42:{'name':'!','type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('42:exclamation')},
45:{'name':'Energy Reaction','type':'triggered','event':'energyAttached','fromHandOnly':True,'energyType':None,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('45:energyReaction')},
67:{'name':'Cast-off Shell','type':'triggered','event':'evolved','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('67:castOffShell')},
77:{'name':'RETIRE','type':'activated','oncePerTurn':True,'benchOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('77:retire')},
82:{'name':'?','type':'activated','oncePerTurn':True,'benchOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('82:question')},
}
TRAINER_EFFECTS={
129:{'trainerType':'Tool','effect':{'type':'noop'}},
130:{'trainerType':'Supporter','effect':R('130:buckTraining')},
131:{'trainerType':'Supporter','effect':R('131:cynthiaFeelings')},
132:{'trainerType':'Item','effect':R('132:energyPickup')},
133:{'trainerType':'Item','effect':R('133:pokeRadar')},
134:{'trainerType':'Stadium','effect':{'type':'noop'}},
135:{'trainerType':'Stadium','effect':{'type':'stadiumAction','effect':R('135:starkMountain')}},
136:{'trainerType':'Tool','effect':{'type':'noop'},'technicalMachine':True},
137:{'trainerType':'Tool','effect':{'type':'noop'},'technicalMachine':True},
}
TRAINER_ATTACKS={136:{'Evoluter':R('136:evoluter')},137:{'Devoluter':R('137:devoluter')}}
