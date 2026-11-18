"""Conservative, print-text-driven attack mappings for Supreme Victors (pl3).

Only a provable mechanic goes live. Unknown text never becomes a fake no-op.
This file intentionally differs from a blanket 'all cards enabled' mapping.
"""
import re
N={'type':'noop'}
def S(*x):return {'type':'sequence','effects':list(x)}
def Q(h=None,t=None):return {'type':'coinFlip',**({'heads':h} if h else {}),**({'tails':t} if t else {})}
def ST(status,target='opponentActive'):return {'type':'status','target':target,'status':status}
def BONUS(x,condition=None):return {'type':'bonusDamage','amount':x,**({'condition':condition} if condition else {})}
def H(x,target='self'):return {'type':'heal','amount':x,'target':target}
def SELF(x):return {'type':'selfDamage','amount':x}
def DRAW(n):return {'type':'draw','amount':n}
def LOCK(action='retreat'):return {'type':'lock','action':action,'target':'opponentActive','duration':'opponentTurn'}
def GUARD(n):return {'type':'modifier','stat':'damageReduction','amount':n,'scope':'self','duration':'opponentTurn'}
def PICK_DMG(n,where='opponentBench',ignore=True):return {'type':'selectedDamage','amount':n,'target':where,'ignoreWeakness':ignore,'ignoreResistance':ignore}
def BENCH_DMG(n,side='opponent',all_=True):return {'type':'benchDamage','amount':n,'side':side,'all':all_}
def COINS(n,m):return {'type':'coinDamage','coins':n,'amount':m,'mode':'replace'}
def DISC(n=1,who='opponentActive',typ=None):return {'type':'discardEnergyCard','amount':n,'target':who,**({'energyType':typ,'strictEnergyType':True} if typ else {})}
def SEARCH(source='deck',amount=1,**kw):return {'type':'searchChosen','source':source,'amount':amount,'filter':kw}
def SWITCH():return {'type':'switch','side':'self'}
def OPTIONAL(e,label):return {'type':'chooseOption','options':[{'label':label,'effect':e},{'label':'Do not use','effect':N}]}
def ACTIVE_POWER(name,e,**kw):return {'name':name,'type':'activated','printedPowerType':'power','disabledByStatus':True,'effect':e,'oncePerTurn':True,**kw}
def PASSIVE(name,e,**kw):return {'name':name,'type':'passive','printedPowerType':'body','disabledByStatus':False,'effect':e,**kw}
STAT={'Paralyzed':'paralysis','Poisoned':'poison','Asleep':'sleep','Burned':'burn','Confused':'confusion'}

# Supreme Victors follow-up: only printed effects with executable handlers.
# Rules marked pl3: are handled before damage in resolveAttack or by a
# physical-card choice after damage in supremeVictorsRule.
def R(key):return {'type':'neoRule','rule':'pl3:'+key}
ADDITIONAL_ATTACKS={
 ('2','Luring Flame'):R('2:luringFlame'),
 ('4','Dump and Draw'):R('4:dumpDraw'),
 ('4','Electric Current'):R('4:electricCurrent'),
 ('9','Drain Punch'):R('9:drainPunch'),
 ('9','Rainbow Lariat'):R('9:rainbowLariat'),
 ('10','Deep Scrap'):R('10:deepScrap'),
 ('21','Super Psywave'):R('21:superPsywave'),
 ('26','Ghost Hand'):BENCH_DMG(10,'self',False),
 ('26','Cursed Wrath'):{'type':'discardCountDamage','amount':10,'mode':'replace','filter':{'tag':'pokemon-sp'}},
 ('27','Rushing Water'):{'type':'moveEnergy','source':'opponentActive','target':'opponentBench','amount':1},
 ('27','Escort'):BONUS(20,{'type':'supporterPlayed'}),
 ('33','Turnaround Standby'):S({'type':'nextAttackBonus','attackName':'Swallow','amount':40},{'type':'nextAttackBonus','attackName':'Bite','amount':40}),
 ('33','Swallow'):{'type':'drain'},
 ('34','Channeling'):{'type':'draw','amount':2,'side':'opponent'},
 ('34','Chakra Points'):R('34:chakraPoints'),
 ('41','Astonish'):{'type':'shuffleRandomHandCard','side':'opponent'},
 ('53','Swallow'):Q({'type':'drain'}),
 ('66','Energy Absorption'):R('66:energyAbsorption'),
 ('71','Call for Family'):{'type':'benchFromDeck','amount':2,'choose':True,'filter':{'kind':'pokemon','stage':'Basic','subtype':'Lightning'}},
 ('71','Trash Charge'):{'type':'attachEnergyFromDiscard','amount':1,'energyType':'Lightning','target':'selfPokemon','upTo':True},
 ('74','Draw In'):{'type':'attachEnergyFromDiscard','amount':2,'energyType':'Fire','target':'self','upTo':True},
 ('75','Gripthrow'):Q({'type':'returnToHand','target':'opponentActive','returnBasicEnergy':True}),
 ('75','Sever'):BONUS(30,{'type':'opponentMatches','filter':{'stage':'Stage 2'}}),
 ('76','Greedy Draw'):R('76:greedyDraw'),
 ('76','Hand Charge'):{'type':'attachEnergy','amount':1,'source':'hand','energyType':'Lightning','target':'selfPokemon'},
 ('79','Grand Swell'):R('79:grandSwell'),
 ('79','Amnesia'):{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},
 ('82','Discharge'):R('82:discharge'),
 ('96','Growth'):{'type':'attachEnergy','amount':1,'source':'hand','energyType':'Grass','target':'self'},
 ('104','Count and Draw'):R('104:countAndDraw'),
 ('24','Ice Shard'):BONUS(50,{'type':'opponentMatches','filter':{'subtype':'Fighting'}}),
 ('43','Horn Pierce'):R('43:hornPierce'),
 ('43','Endure'):Q({'type':'koGuard','mode':'survive','remainingHp':10,'duration':'opponentTurn','attackOnly':True}),
 ('12','Drag Off'):R('12:dragOff'),
 ('12','Push Over'):{'type':'energyDamage','source':'self','energyType':'Fighting','amount':10},
 ('42','Needle'):Q(S(ST('paralysis'),ST('poison'))),
 ('42','Dig Down'):R('42:digDown'),
 ('44','Spike Wound'):{'type':'selectedDamage','target':'opponentPokemon','amount':30,'filter':{'damaged':True},'ignoreWeakness':True,'ignoreResistance':True},
}

def attack(c,a):
    text=(a.get('text') or '').strip();name=a['name'];n=c['number'];dmg=a.get('damage') or ''
    if (n,name) in ADDITIONAL_ATTACKS:return ADDITIONAL_ATTACKS[(n,name)]
    if not text:return N
    m=re.fullmatch(r'Flip a coin\. If heads, this attack does \d+ damage plus (\d+) more damage\.',text)
    if m:return Q(BONUS(int(m[1])))
    m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',text)
    if m:return Q(ST(STAT[m[1]]))
    m=re.fullmatch(r'The Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',text)
    if m:return ST(STAT[m[1]])
    if text=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
    m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',text)
    if m:return COINS(int(m[1]),int(m[2]))
    m=re.fullmatch(r'Draw (a card|\d+ cards)\.',text)
    if m:return DRAW(1 if m[1]=='a card' else int(m[1].split()[0]))
    m=re.fullmatch(r'(.+) does (\d+) damage to itself\.',text)
    if m and (m[1]==c['name'] or m[1]==c['name'].split(' ')[0]):return SELF(int(m[2]))
    m=re.fullmatch(r'Flip a coin\. If tails, (.+) does (\d+) damage to itself\.',text)
    if m and m[1]==c['name']:return Q(t=SELF(int(m[2])))
    if text=='This attack\'s damage isn\'t affected by Weakness or Resistance.':return {'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True}
    if text=='This attack\'s damage isn\'t affected by Resistance.':return {'type':'damageRule','ignoreResistance':True}
    if text=='This attack\'s damage isn\'t affected by Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.':return {'type':'damageRule','ignoreResistance':True,'ignoreEffects':True}
    m=re.fullmatch(r'Remove (\d+) damage counters? from '+re.escape(c['name'])+r'\.',text)
    if m:return H(10*int(m[1]))
    m=re.fullmatch(r'During your opponent\'s next turn, any damage done to '+re.escape(c['name'])+r' by attacks is reduced by (\d+) \(after applying Weakness and Resistance\)\.',text)
    if m:return GUARD(int(m[1]))
    if text=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
    if text=="Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.":return {'type':'forceOpponentSwitch','chooseBy':'defender'}
    if text=="Flip a coin. If heads, discard an Energy card attached to the Defending Pokémon.":return Q(DISC())
    m=re.fullmatch(r'Flip a coin\. If tails, discard a (Fire|Water|Grass|Lightning|Psychic|Fighting|Darkness|Metal) Energy attached to '+re.escape(c['name'])+r'\.',text)
    if m:return Q(t=DISC(1,'self',m[1]))
    if text=="Search your deck for a Basic Pokémon and put it onto your Bench. Shuffle your deck afterward.":return {'type':'benchFromDeck','amount':1,'filter':{'kind':'pokemon','stage':'Basic'}}
    if text=="Flip a coin. If heads, the Defending Pokémon is now Confused.":return Q(ST('confusion'))
    if text=="Draw a card for each of your opponent's Pokémon that isn't an Evolved Pokémon.":return None # side=opponent is unsupported for fieldCountDraw
    if text=="Search your deck for a Stadium card, show it to your opponent, and put it into your hand. Shuffle your deck afterward.":return SEARCH('deck',1,kind='trainer',trainerType='Stadium')
    if text=="Search your deck for up to 2 Grass Energy cards and attach them to any of your Pokémon in any way you like. Shuffle your deck afterward.":return None  # needs distributed physical Energy
    if text=="Search your deck for up to 2 Lightning Basic Pokémon and put them onto your Bench. Shuffle your deck afterward.":return None # requires typed 2-target bench selection
    if text=="Search your deck for a Trainer card, show it to your opponent, and put it into your hand. Put Chatot G and all cards attached to it on top of your deck. Shuffle your deck afterward.":return None
    if text=="Remove 1 damage counter from each of your Pokémon.":return H(10,'selfAll')
    if text=="Remove 3 damage counters from each of your Pokémon.":return H(30,'selfAll')
    m=re.fullmatch(r'Search your deck for (?:a|1) (?:Basic )?(?:Trainer|Supporter|Stadium) card,? (?:show it to your opponent,? and )?put it into your hand\. Shuffle your deck afterward\.',text)
    if m:return None # actual card category missing in capture; explicit only
    # One-off audited mechanics whose printed conditions match reusable handlers.
    special={
      ('1','Feint Attack'):PICK_DMG(20,'opponentPokemon'),
      ('2','Luring Flame'):None, # must apply Burn after opponent finishes switch choice
      ('2','Vapor Kick'):BONUS(30,{'type':'pokemonPresent','zone':'inPlay','side':'opponent','filter':{'subtype':'Water'}}),
      ('3','Shadow Ball'):PICK_DMG(40,'opponentBench',False),
      ('5','Speed Impact'):None,
      ('6','Fire Arrow'):PICK_DMG(30,'opponentPokemon'),
      ('9','Drain Punch'):None,
      ('10','Raging Drill'):{'type':'damageFromDamage','source':'self','amount':1},
      ('11','Whirlwind'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
      ('13','Special Reaction'):None,
      ('15','Overrun'):BENCH_DMG(20,all_=False),
      ('17','Select Powder'):{'type':'chooseOption','options':[{'label':'Burn the Defending Pokémon','effect':ST('burn')},{'label':'Poison the Defending Pokémon','effect':ST('poison')}]},
      ('19','Searing Flame'):ST('burn'),
      ('19','Earth Power'):{'type':'coinBenchDamage','coins':2,'amount':10},
      ('20','Flame Jet'):Q(PICK_DMG(40,'opponentPokemon')),
      ('47','Rest'):S({'type':'removeStatuses','target':'self','statuses':['burn','poison','sleep','confusion','paralysis']},H(40),ST('sleep','self')),
      ('21','Heal Bell'):H(30,'selfAll'),
      ('23','Smash Turn'):OPTIONAL(SWITCH(),'Switch Crawdaunt G with a Benched Pokémon'),
      ('23','Hyper Beam'):Q(DISC()),
      ('25','Drill Peck'):N,
      ('28','Knock Back'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
      ('28','Hyper Beam'):Q(DISC()),
      ('30','Return'):{'type':'drawToHandSize','size':6},
      ('33','Bite'):N,
      ('35','Aqua Tail'):{'type':'coinDamageByEnergy','energyType':'Water','amount':20,'countAttachedEnergyType':True},
      ('34','Channeling'):None, # draws for opponent; cannot substitute self draw
      ('39','Brick Break'):{'type':'damageRule','ignoreResistance':True,'ignoreEffects':True},
      ('40','Magical Leaf'):Q(S(BONUS(20),H(20))),
      ('46','Pulled Punch'):BONUS(-20,{'type':'opponentDamaged'}),
      ('47','Giant Wave'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn','attackName':'Giant Wave'},
      ('49','Sing'):ST('sleep'),
      ('50','Overrun'):BENCH_DMG(10,all_=False),
      ('55','Petal Dance'):S(COINS(3,30),ST('confusion','self')),
      ('56','Giant Tail'):{'type':'coinAttackGate','heads':N},
      ('56','Mach Blow'):BONUS(60,{'type':'opponentMatches','filter':{'tag':'pokemon-sp'}}),
      ('59','Healing Scale'):H(10,'selfAll'),
      ('59','Sand Tomb'):LOCK(),
      ('60','Earthquake'):BENCH_DMG(10,'self'),
      ('62','Cut'):N,
      ('63','Ice Beam'):Q(ST('paralysis')),
      ('64','Stomp Off'):{'type':'discardTop','amount':1,'side':'opponent'},
      ('65','Smokescreen'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
      ('66','Energy Absorption'):None,  # needs two independently chosen, potentially different physical Energy cards
      ('66','Thunder Fang'):Q(ST('paralysis')),
      ('68','Skim Attack'):DRAW(2),
      ('69','Psychic'):{'type':'energyDamage','source':'opponent','amount':10},
      ('72','Flap'):N,
      ('71','Call for Family'):{'type':'benchFromDeck','amount':2,'filter':{'kind':'pokemon','stage':'Basic','subtype':'Lightning'}},
      ('74','Combustion'):N,
      ('77','Gigashock'):{'type':'multiTargetDamage','target':'opponentBench','amount':10,'count':2},
      ('78','Find'):SEARCH('discard',1,kind='trainer'),
      ('78','Biting Fang'):Q(BONUS(20)),
      ('80','Rock Tumble'):{'type':'damageRule','ignoreResistance':True},
      ('81','Poison Seed'):ST('poison'),
      ('82','Uproar'):S(BONUS(10),BENCH_DMG(10)),
      ('84','Sharpshooting'):PICK_DMG(10,'opponentPokemon'),
      ('84','Lock Up'):LOCK(),
      ('85','Air Crash'):Q(DISC()),
      ('86','Collect'):DRAW(1),
      ('88','Air Slash'):Q(t=DISC(1,'self')),
      ('86','Reckless Charge'):SELF(10),
      ('87','Take Down'):SELF(20),
      ('87','Hydro Pump'):{'type':'energyDamage','source':'self','energyType':'Water','amount':10,'maxCount':2,'excludeCostColorless':True},
      ('89','Quick Turn'):COINS(2,20),
      ('90','Pit Search'):SEARCH('deck',1,kind='trainer',trainerType='Stadium'),
      ('94','Bounce'):SWITCH(),
      ('94','Mini Drain'):H(10),
      ('95','Call for Family'):{'type':'benchFromDeck','amount':1,'filter':{'kind':'pokemon','stage':'Basic'}},
      ('95','Nosedive'):Q(t=SELF(10)),
      ('96','Growth'):None,
      ('98','Chime'):None,
      ('99','Nap'):H(20),
      ('103','Collect'):DRAW(1),
      ('104','Count and Draw'):None,
      ('106','Sand Attack'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
      ('108','Fireworks'):Q(t=DISC(1,'self','Fire')),
      ('107','Flail'):{'type':'damageFromDamage','source':'self','amount':1},
      ('113','Karate Chop'):{'type':'selfDamagePenalty','amount':1},
      ('115','Encore'):{'type':'chooseAttackLock','target':'opponentActive','duration':'opponentTurn'},
      ('112','Extra Punch'):BONUS(50,{'type':'opponentMatches','filter':{'stage':'Level-Up'}}),
      # Meditite subtracts 10 damage for every existing damage counter.
      ('113','Karate Chop'):{'type':'selfDamagePenalty','amount':1},
      ('116','Mud Sport'):BONUS(10,{'type':'selfMoreEnergy'}),
      ('117','Call for Family'):{'type':'benchFromDeck','amount':1,'filter':{'kind':'pokemon','stage':'Basic'}},
      ('117','Dash Attack'):PICK_DMG(10,'opponentBench'),
      ('134',''):None,
      ('SH9','Sonicboom'):{'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True},
      ('148','Diamond Dust'):Q(S(ST('paralysis'),BENCH_DMG(10))),
      ('149','Hyper Flame'):Q(DISC(1,'self','Fire'),DISC('all','self')),
      ('150','Lightning Burn'):Q(PICK_DMG(30,'opponentBench'),SELF(30)),
      ('SH7','Dwindling Wave'):{'type':'selfDamagePenalty','amount':1},
      ('SH8','Deep Sea Pressure'):{'type':'modifier','stat':'retreatCost','amount':2,'scope':'opponentActive','duration':'opponentTurn'},
      ('SH8','Aqua Wave'):{'type':'coinDamage','coins':2,'amount':10},
    }
    return special.get((n,name))

# Only Powers using an already-supported meaning (and trigger) are enabled.
# Continuous bodies and triggered effects are modelled as real battle-state
# modifiers / events, not attack text appended to the card.
ADDITIONAL_ABILITIES={
 ('12','Root Protector'):PASSIVE('Root Protector',{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'whileInPlay','opponentFilter':{'stage':'Basic'}}),
 ('62','Evolutionary Pollen'):{'name':'Evolutionary Pollen','type':'triggered','printedPowerType':'power','disabledByStatus':True,'event':'evolved','fromHandOnly':True,'effect':OPTIONAL(ST('sleep'),'Put opponent Active Pokémon Asleep')},
 ('42','Dig Down'):ACTIVE_POWER('Dig Down',R('42:digDown')),
 ('3','Pump Up'):PASSIVE('Pump Up',{'type':'modifier','stat':'maxHp','amount':40,'scope':'self','duration':'whileInPlay','condition':{'type':'opponentPrizesAtMost','amount':3}}),
 ('15','Extreme Speed'):PASSIVE('Extreme Speed',{'type':'modifier','stat':'retreatCost','amount':-1,'scope':'self','duration':'whileInPlay','perEnergyCards':True,'energyType':'Fire'}),
 ('17','Compound Eyes'):PASSIVE('Compound Eyes',{'type':'modifier','stat':'attackDamage','amount':30,'scope':'self','duration':'whileInPlay','condition':{'type':'opponentMatches','filter':{'hasBody':True}}}),
 ('24','Thick Fat'):PASSIVE('Thick Fat',{'type':'modifier','stat':'damageReduction','amount':30,'scope':'self','duration':'whileInPlay','opponentFilter':{'subtype':['Fire','Water']}}),
 ('40','Natural Cure'):{'name':'Natural Cure','type':'triggered','printedPowerType':'body','disabledByStatus':False,'event':'energyAttached','fromHandOnly':True,'effect':{'type':'removeStatuses','target':'self','statuses':['poison','burn','sleep','paralysis','confusion']}},
 ('44','Marvel Shell'):PASSIVE('Marvel Shell',{'type':'preventDamage','target':'self','duration':'whileInPlay','attackerFilter':{'hasAbility':True}}),
}

def ability(c,p):
    n=c['number'];name=p['name']
    if (n,name) in ADDITIONAL_ABILITIES:return ADDITIONAL_ABILITIES[(n,name)]
    if name=='Baby Evolution' and n in ('98','115'):
      return ACTIVE_POWER(name,{'type':'neoRule','rule':'dp1:babyEvolve','targetName':{'98':'Chimecho','115':'Mr. Mime'}[n]})
    if n=='25' and name=='Echo Draw':return ACTIVE_POWER(name,DRAW(1))
    if n=='68' and name=='Intimidating Pattern':return PASSIVE(name,{'type':'modifier','stat':'damageReduction','amount':20,'scope':'self','duration':'whileActive'})
    if n=='69' and name=='Metallic Lift':return PASSIVE(name,{'type':'modifier','stat':'retreatCost','amount':-99,'scope':'self','duration':'whileInPlay','condition':{'type':'selfHasEnergyType','energyType':'Metal'}})
    if n=='SH7' and name=='Aqua Mirage':return PASSIVE(name,{'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'handSizeOneOf','values':[0]}})
    return None
