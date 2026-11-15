"""Reuse previous Deoxys/Castform transformations for all 8 dp6 forms.

Only card-specific combat outcomes are added; the shared transform operation
maintains the physical Pokémon slot, energy, status, damage and linked tools.
"""
def seq(*effects): return {'type':'sequence','effects':list(effects)}
N={'type':'noop'}
RULE=lambda value:{'type':'neoRule','rule':'dp6:'+value}
ATTACKS={
 1:{'Energy Crush':RULE('1:energyCrush')},
 24:{'Psychic Boost':RULE('24:psychicBoost')},
 25:{'Psychic Defense':seq(RULE('25:psychicDefense'),
                         {'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'opponentTurn'})},
 26:{'Speed Shot':{'type':'selectedDamage','target':'opponentPokemon','amount':30,
                  'ignoreWeakness':True,'ignoreResistance':True,'ignoreEffects':True}},
 48:{'Weather Ball':RULE('48:weatherBall')},
 49:{'Water Pulse':{'type':'status','target':'opponentActive','status':'sleep'}},
 50:{'Hail':RULE('50:hail')},
 51:{'Ember':{'type':'discardEnergyCard','target':'self','energyType':'Fire','strictEnergyType':True,'amount':1}},
}
ABILITIES={}
for n in (1,24,25,26):
 ABILITIES[n]={'name':'Form Change','type':'activated','oncePerTurn':True,'formGroup':'deoxys',
     'printedPowerType':'power','disabledByStatus':False,'effect':RULE('formChange:deoxys')}
for n in (48,49,50,51):
 ABILITIES[n]={'name':'Temperament','type':'activated','oncePerTurn':True,'formGroup':'castform',
     'printedPowerType':'power','disabledByStatus':False,'effect':RULE('formChange:castform')}
