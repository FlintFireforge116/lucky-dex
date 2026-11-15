"""LV.X card-specific outcome definitions, reusing core level-up/inheritance."""
def R(k): return {'type':'neoRule','rule':'dp6:'+k}
def seq(*a):return {'type':'sequence','effects':list(a)}
ATTACKS={
 140:{'Deep Balance':R('140:deepBalance')},
 141:{'Night Slash':{'type':'chooseOption','options':[{'label':'Keep Gliscor Active','effect':{'type':'noop'}},{'label':'Switch Gliscor with a Benched Pokémon','effect':{'type':'switch','side':'self'}}]}},
 142:{'Cyber Shock':seq({'type':'discardEnergyCard','target':'self','energyType':'Lightning','strictEnergyType':True,'amount':1},{'type':'discardEnergyCard','target':'self','energyType':'Metal','strictEnergyType':True,'amount':1},{'type':'status','target':'opponentActive','status':'paralysis'})},
 143:{'Healing Look':{'type':'heal','target':'selfBenchAll','amount':30},'Supreme Blast':R('143:supremeBlast')},
 144:{'Giga Burn':{'type':'discardEnergyCard','target':'self','amount':'all'}},
 145:{'Hard Crush':R('145:hardCrush'),'Upthrow':R('145:upthrow')},
 146:{'Zen Blade':{'type':'lock','action':'attack','target':'self','attackName':'Zen Blade','duration':'nextOwnTurn'}},
}
ABILITIES={
 140:{'name':'Psychic Aura','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'weaknessGuard','target':'selfAll','duration':'whileInPlay'}},
 141:{'name':'Shoot Poison','type':'triggered','event':'levelUp','activeOnly':True,'printedPowerType':'power','disabledByStatus':False,'effect':{'type':'chooseOption','options':[{'label':'Do not use Shoot Poison','effect':{'type':'noop'}},{'label':'Paralyze and Poison the Defending Pokémon','effect':seq({'type':'status','target':'opponentActive','status':'paralysis'},{'type':'status','target':'opponentActive','status':'poison'})}]}},
 142:{'name':'Electric Trans','type':'activated','oncePerTurn':False,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':{'type':'redistributeEnergy','allowedEnergyTypes':['Lightning','Metal'],'includeSpecialEnergy':True}},
 144:{'name':'Psybarrier','type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'preventDamage','target':'self','duration':'whileInPlay','attackerFilter':{'stage':'Basic'},'effects':True}},
 146:{'name':'Trade Off','type':'activated','oncePerTurn':True,'printedPowerType':'power','disabledByStatus':True,'allSpecialConditions':True,'effect':R('146:tradeOff')},
}
