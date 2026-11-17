"""Deliberately conservative Platinum card effect mappings.

A print only becomes battle/deck eligible when *all* of its printed outcomes
are mapped, using engines that already exist. Unknown interactions are gated;
printed move text is never swapped for a made-up generic attack.
"""
N={'type':'noop'}
def S(*effects):return {'type':'sequence','effects':list(effects)}
def Q(h=None,t=None):return {'type':'coinFlip',**({'heads':h} if h else {}),**({'tails':t} if t else {})}
def ST(s,target='opponentActive'):return {'type':'status','status':s,'target':target}
def B(n,condition=None):return {'type':'bonusDamage','amount':n,**({'condition':condition} if condition else {})}
def D(n=1):return {'type':'draw','amount':n}
def H(n=10,target='self'):return {'type':'heal','amount':n,'target':target}
def SELF(n):return {'type':'selfDamage','amount':n}
def BENCH(n,side='opponent',all=True,**opts):return {'type':'benchDamage','side':side,'amount':n,'all':all,**opts}
def SELECT(n,target='opponentBench',**opts):return {'type':'selectedDamage','amount':n,'target':target,**opts}
def LOCK(action='retreat',target='opponentActive',duration='opponentTurn',**extra):return {'type':'lock','action':action,'target':target,'duration':duration,**extra}
def COINS(n,amount):return {'type':'coinDamage','coins':n,'amount':amount,'mode':'replace'}
def SEARCH(source='deck',amount=1,**filters):return {'type':'searchChosen','source':source,'amount':amount,'filter':filters}
def MOVE():return {'type':'moveEnergy','source':'self','target':'selfBench','amount':1}
def DISC(amount=1,who='self',**extra):return {'type':'discardEnergyCard','target':who,'amount':amount,**extra}
def GUARD(n):return {'type':'modifier','stat':'damageReduction','amount':n,'scope':'self','duration':'opponentTurn'}
def O(e,label='Use this effect'):return {'type':'chooseOption','options':[{'label':label,'effect':e},{'label':'Keep things as they are','effect':N}]}
def SWITCH():return {'type':'switch','side':'self'}
def P(name,effect,kind='activated',**opts):return {'name':name,'type':kind,'printedPowerType':'body' if kind=='passive' else 'power','disabledByStatus':kind!='passive','effect':effect,**opts}

# Exact printing match is enforced by build-platinum.py. A missing name means
# the card stays inspectable, but disabled for battles until its rule is audited.
ATTACKS={
 '1':{'Gigavolt':Q(B(30),ST('paralysis')),'Reflect Energy':MOVE()},
 '3':{'Clutch':LOCK(),'Fire Spin':DISC(2)},
 '4':{'Power Heal':S({'type':'damageFromDamage','source':'self','amount':1},H(20)),'Rear Kick':N},
 '7':{'Deafen':S({'type':'actionLock','actions':['Trainer','Stadium'],'duration':'opponentTurn'}),'Second Strike':B(20,{'type':'opponentDamageAtLeast','amount':20})},
 '10':{'Over Slash':BENCH(10),'Wrack Down':N},
 '12':{'Splashing Turn':O(SWITCH()),'Pearl Breath':BENCH(10)},
 '14':{'Flower Aroma':S(H(20),ST('sleep')),'Damage Aid':S(B(50,{'type':'opponentStatus'}),{'type':'removeStatus','target':'opponentActive'})},
 '15':{'Growth':{'type':'attachEnergy','target':'self','energyType':'Grass','source':'hand','amount':1},'Air Slash':Q(t=DISC(1))},
 '17':{'Call for Family':{'type':'benchFromDeck','amount':2,'filter':{'stage':'Basic','pokemonSP':True}},'Team Attack':{'type':'fieldCountDamage','amount':10,'filter':{'pokemonSP':True}}},
 '18':{'Midnight Eyes':ST('sleep'),'Healing Song':S(H(10),H(10,'selfBench'))},
 '20':{'Iron Defense':Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}), 'Iron Tackle':SELF(30)},
 '22':{'Return':{'type':'drawToHandSize','size':6},'Double-edge':SELF(60)},
 '23':{'Energy Stream':Q({'type':'attachRandomEnergyFromDiscard','target':'self','amount':1}), 'Diamond Blow':LOCK('attack','self','nextOwnTurn')},
 '24':{'Push Down':{'type':'forceOpponentSwitch','chooseBy':'defender'},'Magnitude':S(BENCH(10),BENCH(10,'self'))},
 '26':{'Knock Off':{'type':'discardHand','side':'opponent','amount':1,'random':True},'Jet Smash':S(SELECT(70,'opponentPokemon',ignoreWeakness=True,ignoreResistance=True),LOCK('attack','self','nextOwnTurn',attackName='Jet Smash'))},
 '28':{'Dragon Claw':N,'Dragonbreath':{'type':'coinAttackGate','heads':ST('paralysis')}},
 '31':{'Rage':{'type':'damageFromDamage','source':'self','amount':1}},
 '32':{'Revenge Melody':{'type':'discardCountDamage','amount':20,'mode':'replace','filter':{'names':['Kricketot','Kricketune']}},'Bug Buzz':S(B(30,{'type':'opponentStatus','status':'sleep'}),{'type':'removeStatus','target':'opponentActive','status':'sleep'})},
 '35':{'Sweet Kiss':{'type':'draw','side':'opponent','amount':1}},
 '37':{'Tsunami':BENCH(10),'Water Pulse':Q(ST('sleep'))},
 '38':{'Energy Blow':{'type':'energyDamage','source':'self','amount':10},'Aromatherapy':S(H(20),H(20,'selfBench'))},
 '39':{'Green Blast':{'type':'energyTypeCountDamage','energyType':'Grass','amount':10},'Soothing Scent':ST('sleep')},
 '40':{'Deep Poison':B(40,{'type':'opponentStatus','status':'poison'})},
 '43':{'Stretch Vine':{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':10},'Absorb':H(20),'Vine Extract':S(ST('poison',),ST('burn'))},
 '44':{'Ascension':{'type':'evolveFromDeck'},'Poison Thread':ST('poison')},
 '45':{'Firebreathing':Q(B(20)),'High Jump Kick':N},
 '46':{'Rock Smash':Q(B(20)),'Knock Over':O({'type':'discardStadium'})},
 '49':{'Absorb':H(10),'Razor Leaf':N},
 '51':{'Teleportation Burst':O(SWITCH()),'Super Psy Bolt':N},
 '52':{'Gentle Slap':N},
 '53':{'Aura Sphere':BENCH(10,all=False),'Do the Wave':{'type':'benchCountDamage','amount':10}},
 '55':{'Upper Hand':{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},'Psybeam':Q(ST('confusion'))},
 '56':{'Fire Tail Slap':Q(t=DISC(1,energyType='Fire',strictEnergyType=True)),'Paralyzing Gaze':Q(ST('paralysis'))},
 '57':{'Strange Poison':Q(ST('poison'),ST('poison','self')),'Strange Sludge':S(B(20,{'type':'selfStatus','status':'poison'}),ST('confusion'))},
 '59':{'Surf':N,'Bubblebeam':Q(ST('paralysis'))},
 '60':{'Stealth Rock':SELECT(30,'opponentPokemon',ignoreWeakness=True,ignoreResistance=True),'Hyper Beam':Q(DISC(1,'opponentActive'))},
 '61':{'Shed Skin':H(40),'Bite and Escape':O(SWITCH()),'Paralyze Poison':S(ST('poison'),Q(ST('paralysis')))},
 '62':{'Endure':Q({'type':'koGuard','mode':'surviveAt10','target':'self','duration':'opponentTurn'}),'Rock Slide':{'type':'multiTargetDamage','target':'opponentBench','amount':10,'count':2}},
 '63':{'Ascension':{'type':'evolveFromDeck'},'Sticky String':Q(ST('paralysis'))},
 '64':{'Reckless Charge':Q(t=SELF(10)),'Fight Back':B(20,{'type':'selfDamageAtLeast','amount':10})},
 '65':{'Double Slap':COINS(2,20),'Rocket Tackle':S(SELF(10),Q({'type':'preventDamage','target':'self','duration':'opponentTurn'}))},
 '68':{'Poison Breath':Q(ST('poison')),'Sweet Saliva':H(10,'selfBench')},
 '69':{'Healing Trial':Q(H(30),H(30,'opponentActive')),'Pulled Punch':{'type':'bonusDamage','amount':-30,'condition':{'type':'opponentDamageAtLeast','amount':10}}},
 '70':{'Bite':N,'Fire Punch':N},
 '71':{'Collect':D(1),'Shoot Through':BENCH(10,all=False)},
 '72':{'Dig Under':SELECT(10,'opponentBench',ignoreWeakness=True,ignoreResistance=True),'Trip Over':Q(B(20))},
 '73':{'Call for Family':{'type':'benchFromDeck','amount':1,'filter':{'stage':'Basic'}},'Spring Out':SELECT(10,'opponentBench',ignoreWeakness=True,ignoreResistance=True)},
 '74':{'Roar':{'type':'forceOpponentSwitch','chooseBy':'defender'},'Thunder Fang':Q(ST('paralysis'))},
 '75':{'Division':{'type':'benchFromDeck','amount':1,'filter':{'name':'Grimer'}},'Poison Gas':ST('poison')},
 '78':{'Lullaby':ST('sleep'),'Rollout':N},
 '79':{'Grind':{'type':'energyDamage','source':'self','amount':10,'mode':'replace'},'Ice Beam':Q(ST('paralysis'))},
 '80':{'Stretch Tongue':SELECT(10,'opponentPokemon',ignoreWeakness=True,ignoreResistance=True),'Knock Off':{'type':'discardHand','side':'opponent','amount':1,'random':True}},
 '82':{'Minor Errand-Running':SEARCH('deck',1,basicEnergy=True),'Expand':GUARD(10)},
 '83':{'Take Back':Q(SEARCH('discard',1,kind='trainer')),'Tackle':N},
 '84':{'Pull':{'type':'forceOpponentSwitch','chooseBy':'defender'},'Rollout':N},
 '85':{'Muddy Water':BENCH(10,all=False),'Pound':N},
 '86':{'Howl':{'type':'benchFromDeck','amount':1,'filter':{'name':'Poochyena'}},'Lunge':{'type':'coinAttackGate','heads':N}},
 '87':{'Latent Power':{'type':'coinAttackGate','heads':N,'tails':ST('confusion','self')}},
 '88':{'Poor Sleep':Q(S(B(30),ST('sleep','self')))},
 '90':{'Splash':N,'Trickle':COINS(2,20)},
 '91':{'Light Punch':N,'Steady Punch':Q(B(10))},
 '92':{'Hypnotic Gaze':ST('sleep')},
 '93':{'Heal Bell':S(H(10),H(10,'selfBench')),'Take Down':SELF(10)},
 '95':{'Flail':{'type':'damageFromDamage','source':'self','amount':10},'Slack Off':S(H(1000),LOCK('attack','self','nextOwnTurn'))},
 '96':{'Skull Bash':N,'Bite':N},
 '97':{'Sing':ST('sleep'),'Run Around':O(SWITCH())},
 '98':{'Show Off':SEARCH('deck',1,basicEnergy=True),'Take Down':Q(t=SELF(10))},
 '99':{'Focus Energy':{'type':'nextAttackBonus','attackName':'Fire Shard','amount':60},'Fire Shard':{'type':'coinAttackGate','heads':N}},
 '100':{'Super Singe':Q(ST('burn')),'Flame Ball':MOVE()},
 '101':{'Ram':N,'Body Slam':Q(ST('paralysis'))},
 '103':{'Ram':N,'Poison Sting':Q(ST('poison'))},
 '128':{'Thundershock':Q(ST('paralysis')),'Thunderpunch':Q(B(10),SELF(10))},
 '129':{'Jab':N,'Special Punch':N},
 '130':{'Swords Dance':{'type':'nextAttackBonus','attackName':'Slash','amount':30},'Slash':N},
 'SH4':{'Blot':H(10),'Jump On':Q(B(20))},
 'SH5':{'Roost':S(H(40),LOCK('retreat','self','opponentTurn')),'Mirror Move':{'type':'retaliateDamage'},'Fury Attack':COINS(3,10)},
 'SH6':{'Find Wildfire':SEARCH('deck',2,basicEnergy=True,subtype='Fire'),'Brushfire':BENCH(10,filter={'subtype':'Grass'}),'Inflame':{'type':'discardHand','amount':1,'filter':{'basicEnergy':True,'subtype':'Fire'},'required':True}},
}

# Only Powers known to have correct trigger timing and full target selection.
# Other Poké-Powers/Bodies are not silently treated as noop.
ABILITIES={
 '47':[P('Flash Bite',{'type':'selectedDamage','target':'opponentPokemon','amount':10},kind='triggered',event='benched',fromHandOnly=True)],
 '76':[P('Baby Evolution',{'type':'evolveTargetFromDeck','filter':{'name':'Chansey'}},kind='activated',oncePerTurn=True)],
}
TRAINERS={
 '108':('Item',Q(S({'type':'removeStatuses','target':'selfPokemon'},H(60,'selfPokemon')))),
 '113':('Item',Q(SEARCH('deck',1,kind='pokemon'))),
 '115':('Item',SEARCH('discard',1,kind='pokemon')),
}
ENERGY={}

# Explicit corrections after auditing engine target/choice semantics. These
# keys must not silently stand in for effects that the generic engine cannot
# execute as printed. They remain catalogued but gated from combat/autobuild.
for card_no, names in {
 '15':['Growth'],             # zone-generated energy is not a card from hand
 '23':['Energy Stream'],      # player must choose Energy from discard
 '39':['Green Blast'],       # must count Grass Energy on ALL own Pokémon
 '44':['Ascension'],         # player chooses exact evolved print from deck
 '47':['Toxic Fang'],        # doubled Poison between-turn damage
 '60':['Hyper Beam'],        # opponent energy choice not yet fully verified
 '63':['Ascension'],         # player selects evolution print
 'SH5':['Mirror Move'],      # last-turn damage copied, not future retaliation
 'SH6':['Inflame'],         # requires chosen Fire Energy in hand or attack fails
}.items():
 for name in names:ATTACKS.get(card_no,{}).pop(name,None)
ABILITIES.clear()  # powers require an event-driven, card-specific timing audit
# Do not assume the generic trainer effect provides all printed choice steps.
TRAINERS.pop('108',None)

ATTACKS['7']['Deafen']=S({'type':'actionLock','cardType':'Trainer','duration':'opponentTurn'},
                           {'type':'actionLock','cardType':'Stadium','duration':'opponentTurn'})
ATTACKS['17']['Call for Family']={'type':'benchFromDeck','amount':2,'choose':True,'filter':{'stage':'Basic','tag':'pokemon-sp'}}
ATTACKS['17']['Team Attack']={'type':'fieldCountDamage','amount':10,'filter':{'tag':'pokemon-sp'}}
ATTACKS['32']['Revenge Melody']={'type':'discardCountDamage','amount':20,'mode':'replace','filter':{'name':['Kricketot','Kricketune']}}
ATTACKS['62']['Endure']=Q({'type':'koGuard','mode':'survive','remainingHp':10,'target':'self','duration':'opponentTurn'})
ATTACKS['64']['Fight Back']=B(20,{'type':'selfDamaged'})
ATTACKS['73']['Call for Family']['choose']=True
ATTACKS['75']['Division']['choose']=True
ATTACKS['86']['Howl']['choose']=True
ATTACKS['95']['Flail']={'type':'damageFromDamage','source':'self','amount':1}
ATTACKS['38']['Aromatherapy']=H(20,'selfAll')
ATTACKS['93']['Heal Bell']=H(10,'selfAll')
ATTACKS['68']['Sweet Saliva']=H(10,'selfBenchAll')
ATTACKS['79']['Grind']={'type':'energyDamage','source':'self','amount':10,'mode':'replace','countCards':True}
ATTACKS['18']['Healing Song']=H(10,'selfAll')
ATTACKS['43']['Vine Extract']=S(
 {'type':'status','target':'opponentActive','status':'burn','condition':{'type':'opponentDamaged'}},
 {'type':'status','target':'opponentActive','status':'poison','condition':{'type':'opponentDamaged'}})
# Status-changing effects never automatically get damage when the printing says
# that the damage is to the Bench instead of Active (e.g. attacks printed "-").

# Make optional resolutions explicit; never force a switch just because a move
# provides that option. Both human and CPU can choose sensibly.
for number,name in [('12','Splashing Turn'),('51','Teleportation Burst'),('61','Bite and Escape'),('97','Run Around')]:
 ATTACKS[number][name]=O(SWITCH(),'Switch with one of your Benched Pokémon')
ATTACKS['46']['Knock Over']=O({'type':'discardStadium'},'Discard the Stadium in play')
