"""Legends Awakened v0.69.258: reuse prior shared mechanics; full printed outcomes.

Do not promote these prints without passing action-level tests for attacks + Powers.
"""
def R(key):return {'type':'neoRule','rule':'dp6:'+key}
NOOP={'type':'noop'}
BE_READY={6,13,14,18,36,38,39,76,78,79,80,81}
ATTACKS={
 6:{'Magma Storm':R('6:magmaStorm')},
 13:{'Metal Bomber':R('13:metalBomber')},
 14:{'Sky Judgement':{'type':'discardEnergyCard','target':'self','amount':'all'}},
 18:{'Crush Claw':R('18:crushClaw')},
 36:{'Ice Reflect':R('36:iceReflect')},
 38:{'Stone Edge':{'type':'coinFlip','heads':{'type':'bonusDamage','amount':30}}},
 39:{'Rotating Claws':R('39:rotatingClaws')},
 76:{'Hidden Power':R('76:hiddenPower')},
 78:{'Hidden Power':R('78:hiddenPower')},
 79:{'Hidden Power':{'type':'benchDamage','side':'self','all':True,'amount':10}},
 80:{'Hidden Power':{'type':'draw','amount':1}},
 81:{'Hidden Power':R('81:hiddenPower')},
}
ABILITIES={
6:{'name':'Flash Fire','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('6:flashFire')},
13:{'name':'Steel Coating','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':NOOP},
14:{'name':'Speed Gain','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('14:speedGain')},
18:{'name':'Fossil Armor','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':NOOP},
36:{'name':'Regi Move','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('36:regiMove')},
38:{'name':'Regi Cycle','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('38:regiCycle')},
39:{'name':'Regi Heal','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('39:regiHeal')},
76:{'name':'JUNK','type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('76:junk')},
78:{'name':'UNSEEN','type':'passive','benchOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':NOOP},
79:{'name':'VACATION','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('79:vacation')},
80:{'name':'WALL','type':'passive','activeOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':NOOP},
81:{'name':'YAWN','type':'activated','oncePerTurn':True,'benchOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('81:yawn')},
}
