"""Independently reviewed printed attack outcomes for Legends Awakened.

Only explicit (collector number, move name) keys are eligible. The general
text parser remains conservative. Callers must confirm all moves on a print
have an implementation and that it has no unimplemented Poke-Power/Body.
"""

def seq(*effects):
    return {'type':'sequence','effects':list(effects)}
def status(value,target='opponentActive'):
    return {'type':'status','status':value,'target':target}
def coin(heads=None,tails=None):
    return {'type':'coinFlip',**({'heads':heads} if heads else {}),**({'tails':tails} if tails else {})}
def bonus(amount,condition=None):
    return {'type':'bonusDamage','amount':amount,**({'condition':condition} if condition else {})}
def heal(amount,target='self'):
    return {'type':'heal','amount':amount,'target':target}
def guard(amount):
    return {'type':'modifier','stat':'damageReduction','amount':amount,'target':'self','duration':'opponentTurn'}

# Each is an exact printed attack, not an effect invented from a substring.
# The printed-text audit in tests checks this mapping against the archival source.
EXTRA={
  3:{'Destiny Bond':seq({'type':'discardEnergyCard','target':'self','energyType':'Psychic','strictEnergyType':True,'amount':1}, {'type':'destinyBond'}),
     'Icy Breath':seq(status('sleep'),{'type':'benchDamage','side':'opponent','all':True,'amount':10})},
  4:{'Shadow Force':seq({'type':'selectedDamage','target':'opponentBench','amount':20}, coin({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True})),
     'Brutal Edge':{'type':'damageFromDamage','source':'opponent','amount':1}},
  17:{'Sonic Wave':seq({'type':'benchDamage','side':'opponent','all':True,'amount':10},{'type':'forceOpponentSwitch','chooseBy':'defender'}),
      'Pursue and Turn':seq(bonus(20,{'type':'opponentDamageAtLeast','amount':20}),{'type':'switch','side':'self','condition':{'type':'opponentDamageAtLeast','amount':20}})},
  22:{'Gripthrow':coin({'type':'returnToHand','target':'opponentActive','returnBasicEnergy':True}),
      'Prop-up Pinchers':bonus(30,{'type':'selfHasTechnicalMachine'})},
  29:{'Drought':{'type':'chooseOption','options':[
           {'label':'Do not attach any Fighting Energy','effect':{'type':'noop'}},
           {'label':'Attach 1 Fighting Energy from hand','effect':{'type':'chooseTarget','target':'selfPokemon','effect':{'type':'attachEnergy','target':'selfPokemon','source':'hand','energyType':'Fighting','amount':1}}},
           {'label':'Attach 2 Fighting Energy from hand','effect':{'type':'chooseTarget','target':'selfPokemon','effect':{'type':'attachEnergy','target':'selfPokemon','source':'hand','energyType':'Fighting','amount':2}}}]},
      'Major Earthquake':seq({'type':'discardEnergyCard','target':'self','energyType':'Fighting','strictEnergyType':True,'amount':2},{'type':'benchDamage','side':'self','all':True,'amount':10})},
  32:{'Drizzle':{'type':'chooseOption','options':[
           {'label':'Do not attach any Water Energy','effect':{'type':'noop'}},
           {'label':'Attach 1 Water Energy from hand','effect':{'type':'chooseTarget','target':'selfPokemon','effect':{'type':'attachEnergy','target':'selfPokemon','source':'hand','energyType':'Water','amount':1}}},
           {'label':'Attach 2 Water Energy from hand','effect':{'type':'chooseTarget','target':'selfPokemon','effect':{'type':'attachEnergy','target':'selfPokemon','source':'hand','energyType':'Water','amount':2}}}]},
      'High Tide':seq({'type':'discardEnergyCard','target':'self','energyType':'Water','strictEnergyType':True,'amount':2},{'type':'benchDamage','side':'opponent','all':True,'amount':20})},
  58:{'Rushing Water':{'type':'moveEnergy','source':'opponentActive','target':'opponentBench','amount':1},'Confuse Ray':status('confusion')},
  93:{'Call for Family':{'type':'benchFromDeck','amount':2,'choose':True,'filter':{'kind':'pokemon','stage':'Basic','subtype':['Grass','Psychic']}},'Hypnosis':status('sleep')},
  101:{'Triple Kick':{'type':'coinDamage','coins':3,'amount':20,'mode':'replace'},'Gut Spin':{'type':'chooseOption','condition':{'type':'selfStackContains','name':'Tyrogue'},'options':[{'label':'Keep Hitmontop Active','effect':{'type':'noop'}},{'label':'Switch Hitmontop with a Benched Pokémon','effect':{'type':'switch','side':'self'}}]}},
  102:{'Smokescreen':{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},'Reverse Thrust':{'type':'switch','side':'self'}},
  107:{'Show Off':{'type':'searchChosen','source':'deck','amount':1,'filter':{'basicEnergy':True}},'Payback':bonus(20,{'type':'opponentPrizesRemaining','amount':1})},
  121:{'Psybeam':status('confusion'),'Bounce':{'type':'chooseOption','options':[{'label':'Keep Spoink Active','effect':{'type':'noop'}},{'label':'Switch Spoink with a Benched Pokémon','effect':{'type':'switch','side':'self'}}]}},
  122:{'Recover':seq({'type':'discardEnergyCard','target':'self','amount':1},heal(30)),'Spinning Attack':{'type':'noop'}},
  47:{'Eruption':{'type':'topDeckBothDiscardBonus','amount':30},'Take Down':{'type':'selfDamage','amount':20}},
  59:{'Energy Split':{'type':'dp6EnergySplit'},'Aqua Bolt':{'type':'energyDamage','source':'self','energyType':'Water','amount':10}},
  70:{'Aqua Pump':{'type':'chooseDiscardForBonus','zone':'hand','max':2,'amount':10,'filter':{'basicEnergy':True,'subtype':'Water'}},'Waterfall':{'type':'noop'}},
  71:{'Star Boomerang':{'type':'chooseOption','options':[{'label':'Keep Starmie Active','effect':{'type':'noop'}},{'label':'Return Starmie and all attachments to your hand','effect':{'type':'returnToHand','target':'self','returnBasicEnergy':True}}]},
      'Core Flash':{'type':'selectedDamage','target':'opponentPokemon','filter':{'hasAbility':True},'amount':50}},
  11:{'Hypnoblast':status('sleep'),'Psychic':{'type':'energyDamage','source':'opponent','amount':10}},
  20:{'Parallel Gain':heal(10,'selfAll'),'Blend Pollen':seq({'type':'fieldCountDamage','side':'self','amount':20,'filter':{'name':['Vileplume','Bellossom']}},coin(status('burn')))},
  61:{'Focus Blast':{'type':'selectedDamage','target':'opponentPokemon','amount':30},'Spike Lariat':bonus(20,{'type':'opponentDamaged'})},
  62:{'Spark':{'type':'benchDamage','side':'opponent','amount':10},'Thunderous Claw':coin(tails={'type':'discardEnergyCard','target':'self','energyType':'Lightning','strictEnergyType':True,'amount':'all'})},
  63:{'Heavy Bone':coin(tails={'type':'lock','action':'attack','target':'self','attackName':'Heavy Bone','duration':'nextOwnTurn'}),'Bone Rush':{'type':'coinDamage','coins':'untilTails','amount':50,'mode':'replace'}},
  65:{'Psyshock':coin(status('paralysis')),'Bullet Punch':{'type':'coinDamage','coins':2,'amount':20,'mode':'add'}},
  72:{'Swallow Up':bonus(50,{'type':'opponentHpLess'}),'Gunk Shot':status('poison')},
  74:{'Herd Charge':{'type':'coinDamageByPokemon','amount':20,'filter':{'name':'Tauros'},'mode':'replace'},'Thrash':coin(heads=bonus(20),tails={'type':'selfDamage','amount':10})},
  86:{'Rest':seq({'type':'removeStatus','target':'self'},heal(40),status('sleep','self')),'Double Kick':{'type':'coinDamage','coins':2,'amount':20,'mode':'replace'}},
  88:{'Razor Fin':{'type':'noop'},'Aqua Spark':bonus(10,{'type':'selfHasEnergyType','energyType':'Water'})},
  94:{'Light Poison':{'type':'coinAttackGate','heads':status('poison')},'Jump On':coin(bonus(10))},
  97:{'Space Out':seq(heal(20),status('sleep','self')),'Stinky Nectar':coin(seq(status('confusion'),status('poison')))},
  98:{'Amnesia':{'type':'chooseAttackLock','duration':'opponentTurn'},'Gastro Acid':coin(status('paralysis'))},
  106:{'Pay Day':coin({'type':'draw','amount':1}),'Fury Swipes':{'type':'coinDamage','coins':3,'amount':10,'mode':'replace'}},
  109:{'Sharpen':{'type':'noop'},'Nose Poke':bonus(20,{'type':'pokemonPresent','zone':'bench','filter':{'name':'Probopass'}})},
  113:{'Tackle':{'type':'noop'},'Selfdestruct':seq({'type':'benchDamage','side':'self','all':True,'amount':10},{'type':'benchDamage','side':'opponent','all':True,'amount':10},{'type':'selfDamage','amount':50})},
  114:{'Tackle':{'type':'noop'},'Twiddle':coin(status('confusion'),status('sleep'))},
  119:{'Growl':{'type':'modifier','stat':'attackDamage','amount':-20,'scope':'opponentActive','duration':'opponentTurn'},'Scratch':{'type':'noop'}},
  124:{'Focus Energy':{'type':'nextAttackBonus','attackName':'Peck','amount':20},'Peck':{'type':'noop'}},
  35:{'Focus Punch':{'type':'attackRequirement','condition':{'type':'notDamagedByAttackLastOpponentTurn'},'allowWhenFailed':True},'Submission':{'type':'selfDamage','amount':20}},
  53:{'Expand':guard(10),'Whirlwind':{'type':'forceOpponentSwitch','chooseBy':'defender'}},
  89:{'Knock Off':coin({'type':'discardHand','side':'opponent','amount':1}),'Irongrip':{'type':'noop'}},
  96:{'Sleep Powder':status('sleep'),'Frustration':{'type':'selectedDamage','target':'opponentPokemon','amount':30,'filter':{'damaged':False}}},
  103:{'Roar':{'type':'forceOpponentSwitch','chooseBy':'defender'},'Bite':{'type':'noop'}},
  123:{'Sniff Out':coin({'type':'searchChosen','source':'discard','amount':1,'filter':{}}),'Lunge Out':{'type':'noop'}},
  125:{'Crystal Barrier':coin({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),'Mysterious Beam':coin({'type':'discardEnergyCard','target':'opponentActive','amount':1})},
  128:{'U-turn':{'type':'switch','side':'self'},'Agility':coin({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True})},
}

# Damage shape is explicit: plus signs must have a damage modifier, times
# signs must have a coin multiplier, while constant/zero damage can be normal.
def verified_effect(collector,attack):
    from dp6_extra_print_snapshots import PRINTS
    from_cost = {'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P',
                 'Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
    record = PRINTS.get(int(collector))
    if not record: return None,False
    actual_name = attack.get('name')
    original_cost = attack.get('cost') or []
    cost = ''.join(from_cost.get(x,'?') for x in original_cost) if isinstance(original_cost,list) else original_cost
    candidate = (actual_name,cost,str(attack.get('damage') or ''),attack.get('text') or '')
    if candidate not in record[-1]: return None,False
    spec=EXTRA.get(int(collector),{}).get(actual_name)
    if spec is None:return None,False
    damage=str(attack.get('damage') or '')
    if damage.endswith('+') and spec.get('type') not in ('bonusDamage','energyDamage','damageFromDamage','topDeckBothDiscardBonus','coinDamage','coinDamageByEnergy','chooseDiscardForBonus','sequence','coinFlip','neoRule'):
        return None,False
    if damage.endswith('×') and not (spec.get('type') in ('coinDamage','coinDamageByPokemon','fieldCountDamage','energyDamage','neoRule') and (spec.get('mode')=='replace' or spec.get('type')=='neoRule')):
        return None,False
    return spec,True

# v0.69.255 Stage 4 exact printed-attack mapping; audited upstream names/text/costs.
from dp6_batch4_verified import ATTACKS as BATCH4_ATTACKS
EXTRA.update(BATCH4_ATTACKS)

# v0.69.256: shared archived Deoxys and Castform effects.
from dp6_batch5_verified import ATTACKS as BATCH5_ATTACKS
EXTRA.update(BATCH5_ATTACKS)

from dp6_batch6_verified import ATTACKS as BATCH6_ATTACKS
EXTRA.update(BATCH6_ATTACKS)

from dp6_batch7_verified import ATTACKS as BATCH7_ATTACKS
EXTRA.update(BATCH7_ATTACKS)
