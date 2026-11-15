"""Legends Awakened v0.69.257: reuse battle effects; add printed card-specific rules only."""
def R(key):return {'type':'neoRule','rule':'dp6:'+key}
def seq(*effects):return {'type':'sequence','effects':list(effects)}
def coin(heads=None,tails=None):return {'type':'coinFlip',**({'heads':heads} if heads else {}),**({'tails':tails} if tails else {})}
N={'type':'noop'}
# Only audited complete prints are promoted. Remaining archived entries stay gated.
BE_READY={8,10,12,15,23,28,30,34,41,46,57,83,105,126}
ATTACKS={
8:{'Plasma':{'type':'attachEnergyFromDiscard','amount':1,'energyType':'Lightning','target':'self'},'Shock Bolt':{'type':'discardEnergyCard','target':'self','amount':'all','energyType':'Lightning','strictEnergyType':True}},
10:{'Extra Comet Punch':R('10:extraCometPunch')},
12:{'Frog Hop':coin({'type':'bonusDamage','amount':40})},
15:{'Crush Grip':R('15:crushGrip')},
23:{'Energy Assist':R('23:energyAssist')},
28:{'Explosion':{'type':'selfDamage','amount':40}},
30:{'Heavy Metal':{'type':'coinDamageByEnergy','energyType':'Metal','countAttachedEnergyType':True,'amount':20,'mode':'add'}},
34:{'Extrasensory':{'type':'bonusDamage','amount':50,'condition':{'type':'handSizesEqual'}}},
41:{'Black Soot':coin(seq({'type':'status','target':'opponentActive','status':'burn'},{'type':'status','target':'opponentActive','status':'paralysis'}))},
46:{'Guard Claw':{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'opponentTurn'},'X-Scissor':coin({'type':'bonusDamage','amount':20})},
57:{'Burning Sensation':R('57:burningSensation'),'Bright Flame':coin(tails={'type':'discardEnergyCard','target':'self','energyType':'Fire','strictEnergyType':True,'amount':2})},
83:{'Take Down':{'type':'selfDamage','amount':10}},
105:{'Astonish':{'type':'shuffleRandomHandCard','side':'opponent'},'Absorb':{'type':'heal','target':'self','amount':20}},
126:{'Gut Blow':R('126:gutBlow')},
}
ABILITIES={
 8:{'name':'Rivalry','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':N},
10:{'name':'Magnetic Reversal','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':coin({'type':'forceOpponentSwitch','chooseBy':'attacker'})},
12:{'name':'Enthusiasm','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':N},
15:{'name':'Slow Start','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':N},
23:{'name':'Attracting Body','type':'triggered','event':'damagedByAttack','activeOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':coin({'type':'status','target':'opponentActive','status':'confusion'})},
28:{'name':'Iron Shell','type':'triggered','event':'energyAttached','fromHandOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':R('28:ironShell')},
30:{'name':'Smelt','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('30:smelt')},
34:{'name':'Psychic Bind','type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('34:psychicBind')},
41:{'name':'White Smoke','type':'passive','activeOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':N},
57:{'name':'Revenge Fang','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':N},
83:{'name':'Metal Chain','type':'triggered','event':'energyAttached','fromHandOnly':True,'energyType':'Metal','printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':{'type':'benchFromDeck','amount':1,'choose':True,'filter':{'name':'Beldum','kind':'pokemon'}}},
126:{'name':'Baby Evolution','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':False,'effect':R('126:babyEvolution')},
}
