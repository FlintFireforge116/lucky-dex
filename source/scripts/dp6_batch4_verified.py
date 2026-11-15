"""Legends Awakened exact printed moves, power metadata and battle effects.

Cards are only enabled once their full attack+ability set has tests. Keep them
separate from generic text parsing to prevent silent lost clauses.
"""
def seq(*effects): return {'type':'sequence','effects':list(effects)}
def status(value,target='opponentActive'): return {'type':'status','status':value,'target':target}
def coin(heads=None,tails=None): return {'type':'coinFlip',**({'heads':heads} if heads else {}),**({'tails':tails} if tails else {})}
def bonus(amount,condition=None): return {'type':'bonusDamage','amount':amount,**({'condition':condition} if condition else {})}
def heal(amount,target='self'): return {'type':'heal','amount':amount,'target':target}
from dp6_batch4_prints import PRINTS

RULE = lambda name: {'type':'neoRule','rule':'dp6:'+name}
N = {'type':'noop'}
BE_READY = {2,5,9,31,33,37,43,56,60,66,68,69,73,85,99,100,118,120}

ATTACKS = {
2:{'Hyper Beam':coin({'type':'discardEnergyCard','target':'opponentActive','amount':1}),
   'Draco Meteor':RULE('2:dracoMeteor')},
5:{'Burning Poison':RULE('5:burningPoison'),
   'Pester':bonus(40,{'type':'opponentStatus'})},
9:{'Ice Fang':coin(seq(status('paralysis'),{'type':'discardEnergyCard','target':'opponentActive','amount':1})),
   'Charge Through':RULE('9:chargeThrough')},
31:{'One Desire':RULE('31:oneDesire'),'Doom Desire':seq({'type':'discardEnergyCard','target':'self','amount':'all'}, {'type':'scheduleDelayed','event':'endOpponentNextTurn','targetMode':'defender','effect':{'type':'knockOut'}})},
33:{'Collect':{'type':'draw','amount':3},'Cross-Cut':bonus(30,{'type':'opponentMatches','filter':{'evolved':True}})},
37:{'Gigaton Punch':coin(seq(bonus(20),{'type':'benchDamage','side':'opponent','amount':20}))},
43:{'Psychic Restore':{'type':'chooseOption','options':[{'label':'Keep Uxie Active','effect':N},{'label':'Put Uxie and attachments on bottom of deck','effect':RULE('43:psychicRestore')}] }},
56:{'Magical Step':RULE('56:magicalStep'),'Grind':{'type':'energyDamage','source':'self','amount':20,'mode':'replace'}},
60:{'Comet Punch':{'type':'coinDamage','coins':4,'amount':20,'mode':'replace'},'Baton Pass':RULE('60:batonPass')},
66:{'Bite On':RULE('66:biteOn'),'Harass':{'type':'fieldCountDamage','side':'self','amount':10,'mode':'replace'}},
68:{'Feint Attack':{'type':'selectedDamage','target':'opponentPokemon','amount':30,'ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True},'Fasten Claws':coin(bonus(10))},
69:{'Charge Dash':RULE('69:chargeDash'),'Icy Wind':status('sleep')},
73:{'Mach Descent':bonus(30,{'type':'movedFromBenchThisTurn'})},
85:{'Vine Bind':coin(RULE('85:vineBind')),'Careless Tackle':{'type':'selfDamage','amount':10}},
99:{'Counter Punch':{'type':'retaliateDamage','amount':40,'duration':'opponentTurn'},'Gut Strike':bonus(30,{'type':'selfStackContains','name':'Tyrogue'})},
100:{'Gut Kick':RULE('100:gutKick'),'Mega Kick':N},
118:{'Recharge':RULE('118:recharge'),'Double Kick':{'type':'coinDamage','coins':2,'amount':20,'mode':'replace'}},
120:{'Rob':{'type':'shuffleHandMatching','side':'opponent','filter':{'trainerType':['Pokémon Tool','Technical Machine','Tool']}},'Slash':N},
}

ABILITIES = {
33:{'name':'Healing Tail','type':'triggered','event':'checkup','activeOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':{'type':'heal','target':'selfBenchAll','amount':10}},
37:{'name':'Recover Mechanism','type':'triggered','event':'energyAttached','fromHandOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':{'type':'removeStatus','target':'self'}},
43:{'name':'Set Up','type':'triggered','event':'benched','fromHandOnly':True,'printedPowerType':'power','disabledByStatus':True,'effect':{'type':'drawToHandSize','size':7}},
73:{'name':'Big Wing','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'modifier','stat':'retreatCost','amount':-99,'scope':'self','duration':'whileInPlay','condition':{'type':'selfNoEnergy'}}},
}
