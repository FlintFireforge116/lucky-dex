"""Brilliant Stars stage one: exact text matches, reuse existing verified effects."""
import re
import swsh8_verified as previous
from swsh8_verified import E,activated,bonus,cond,mod,seq,coin

def attack(row,a):
 t=a[3]
 if 'VSTAR Power' in t:return None  # requires full VSTAR integration gate
 e=previous.attack(row,a)
 if e is not None:return e
 m=re.fullmatch(r'This attack does (\d+) more damage for each Prize card your opponent has taken\.',t)
 if m:return E('pointDamage',side='opponent',prizesTaken=True,amount=int(m[1]),mode='add')
 if t=="If your opponent's Active Pokémon is a Pokémon V, this attack does 120 more damage.":return bonus(120,cond('opponentMatches',filter={'tag':'pokemon-v'}))
 if t=='This attack does 20 more damage for each Benched Pokémon (both yours and your opponent\'s).':return E('benchCountDamage',side='both',amount=20,mode='add')
 if t=='If this Pokémon has any damage counters on it, this attack does 100 more damage.':return bonus(100,cond('selfDamaged'))
 if t=="Flip a coin. If heads, your opponent's Active Pokémon is now Confused.":return coin(E('status',target='opponentActive',status='confusion'))
 if t=='Put up to 2 Item cards from your discard pile into your hand.':return E('searchChosen',source='discard',amount=2,filter={'kind':'trainer','trainerType':'Item'},optional=True)
 if t=="During your opponent's next turn, the Defending Pokémon can't attack.":return E('lock',target='opponentActive',action='attack',duration='opponentTurn')
 if t=='This attack does 10 more damage for each damage counter on this Pokémon.':return E('damageFromDamage',source='self',amount=1,mode='add')
 if t=='Search your deck for up to 2 Special Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.':return E('searchChosen',amount=2,filter={'kind':'energy','specialEnergy':True},optional=True)
 if t=='Search your deck for a Supporter card, reveal it, and put it into your hand. Then, shuffle your deck.':return E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Supporter'})
 if t=='This attack does 10 more damage for each card in your hand.':return E('handCountDamage',source='self',amount=10,mode='add')
 if t=="If your opponent's Active Pokémon already has any damage counters on it, this attack does 150 more damage.":return bonus(150,cond('opponentDamaged'))
 if t=="Discard the top card of your opponent's deck.":return E('discardTop',side='opponent',amount=1)
 if t=='Discard the top 2 cards of your deck.':return E('discardTop',side='self',amount=2)
 return None

def ability(row,a):
 if a[2]=='Once during your turn, if this Pokémon is in the Active Spot, you may draw a card.':return activated(E('draw',amount=1),activeOnly=True)
 if a[2]=='You must discard a card from your hand in order to use this Ability. Once during your turn, you may draw 2 cards.':return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('draw',amount=2)))
 if a[2]=='Once during your turn, you may draw cards until you have 5 cards in your hand.':return activated(E('drawToHandSize',size=5))
 return None

def trainer(row):
 t=row[13][0]
 if t=='Draw 3 cards.':return 'Supporter',E('draw',amount=3)
 if t=="Switch 1 of your opponent's Benched Pokémon with their Active Pokémon.":return 'Supporter',E('forceOpponentSwitch',chooseBy='attacker')
 if t=='Heal 20 damage from each of your Pokémon.':return 'Item',E('heal',target='selfAll',amount=20)
 if t=='Discard your hand and draw 7 cards.':return 'Supporter',seq(E('discardHand',side='self',amount=999),E('draw',amount=7))
 if t=='You can use this card only if you discard 2 other cards from your hand. Search your deck for a Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.':return 'Item',E('sm7Rule',rule='sm10Pay',amount=2,filter={},after=E('searchChosen',amount=1,filter={'kind':'pokemon'}),trainer=True)
 if t=="The attacks of the Pokémon this card is attached to do 30 more damage to your opponent's Active Pokémon V (before applying Weakness and Resistance).":return 'Tool',mod('attackDamageActiveOnly',30,opponentFilter={'tag':'pokemon-v'})
 m=re.fullmatch(r"The attacks of the Pokémon this card is attached to do 30 more damage to your opponent's Active (Psychic|Dragon) Pokémon \(before applying Weakness and Resistance\)\.",t)
 if m:return 'Tool',mod('attackDamageActiveOnly',30,opponentFilter={'subtype':m[1]})
 return None

def energy(row):return None # Double Turbo Energy damage penalty needs a separate audit

def prism_ready(row):return False

# Stage 2: exact printed text, shared VSTAR marker for attack and ability.
_stage1_attack=attack
_stage1_ability=ability
_stage1_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=="Discard 2 Energy from this Pokémon. (You can't use more than 1 VSTAR Power in a game.)":return E('discardEnergyCard',target='self',amount=2)
 if t=='This attack does 50 damage for each of your Evolution Pokémon in play.':return E('fieldCountDamage',side='self',filter={'evolved':True},amount=50,mode='replace')
 if t=='This attack does 10 more damage for each Pokémon in your discard pile.':return E('discardCountDamage',side='self',filter={'kind':'pokemon'},amount=10,mode='add')
 if t=='If this Pokémon evolved from Burmy during this turn, this attack does 90 more damage.':return bonus(90,cond('evolvedThisTurn'))
 if t=="If any of your Pokémon were Knocked Out by damage from an attack from your opponent's Pokémon during their last turn, your opponent's Active Pokémon is now Paralyzed.":return E('status',target='opponentActive',status='paralysis',condition=cond('koByOpponentAttackLastTurn'))
 if t=="Flip a coin. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon.":return coin(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True))
 if t=='Shuffle this Pokémon and all attached cards into your deck.':return E('shuffleIntoDeck',target='self',includeAttached=True)
 if t=="This attack does 50 damage for each Energy attached to all of your opponent's Pokémon.":return E('energyDamage',source='opponent',all=True,amount=50,mode='replace')
 if t=="This attack also does 30 damage to 1 of your Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('selectedSelfBenchDamage',amount=30)
 if t=='This attack does 30 damage for each Pokémon Tool attached to all of your Pokémon.':return E('toolCountDamage',amount=30,mode='replace')
 if t=='If you and your opponent have the same number of Benched Pokémon, this attack does 90 more damage.':return bonus(90,cond('benchCountsEqual'))
 if t=="If your opponent has exactly 1 Prize card remaining, this attack does 60 more damage, and your opponent's Active Pokémon is now Confused.":return seq(bonus(60,cond('opponentPrizesRemaining',amount=1)),E('status',target='opponentActive',status='confusion',condition=cond('opponentPrizesRemaining',amount=1)))
 if t=="This attack does 50 damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.":return E('retreatCostDamage',amount=50,mode='replace')
 if t=='If Electivire is on your Bench, this attack does 120 more damage.':return bonus(120,cond('pokemonPresent',zone='bench',filter={'name':'Electivire'}))
 if t=='If this Pokémon has any Fire Energy attached, this attack does 80 more damage.':return bonus(80,cond('selfEnergyAtLeast',energyType='Fire',amount=1,countSpecial=True))
 if t=="If your opponent's Active Pokémon is an Evolution Pokémon, this attack does 30 more damage.":return bonus(30,cond('opponentMatches',filter={'evolved':True}))
 if t=="If the Defending Pokémon is a Basic Pokémon, it can't attack during your opponent's next turn.":return E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'stage':'Basic'}))
 return _stage1_attack(row,a)

def ability(row,a):
 t=a[2]
 if t=="During your turn, you may heal 120 damage from each of your Benched Grass Pokémon. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('heal',target='selfBenchAll',amount=120,filter={'subtype':'Grass'}),vstarPower=True)
 if t=='When you play this Pokémon from your hand onto your Bench during your turn, you may search your deck for a Supporter card, reveal it, and put it into your hand. Then, shuffle your deck.':return dict(type='triggered',event='benched',fromHandOnly=True,effect=E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Supporter'},optional=True))
 if t=='Once during your turn, you may search your deck for a Grass Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.':return activated(E('searchChosen',amount=1,filter={'kind':'pokemon','subtype':'Grass'},optional=True))
 if t=='You must discard 2 cards from your hand in order to use this Ability. Once during your turn, you may draw a card.':return activated(E('sm7Rule',rule='sm10Pay',amount=2,filter={},after=E('draw',amount=1)))
 if t=="Once during your turn, you may attach a Darkness Energy card from your discard pile to this Pokémon. You can't use more than 1 Direflame Wings Ability each turn.":return activated(E('attachEnergyFromDiscard',target='self',energyType='Darkness',amount=1),sharedOncePerTurn='Direflame Wings')
 return _stage1_ability(row,a)

def trainer(row):
 t=row[13][0]
 if t=='Attach a basic Energy card from your discard pile to 1 of your Benched Pokémon.':return 'Supporter',E('attachEnergyFromDiscard',target='selfBench',amount=1,basicEnergy=True)
 if t=="Draw cards until you have 5 cards in your hand. If any of your Pokémon were Knocked Out during your opponent's last turn, draw cards until you have 8 cards in your hand instead.":return seq_trainer()
 return _stage1_trainer(row)

def seq_trainer():
 return 'Supporter',seq(E('drawToHandSize',size=5),E('drawToHandSize',size=8,condition=cond('sm12OwnKoLastTurn'),optionalCondition=True))

# Stage 3: complete main-set source, reuse validated target/choice machinery.
from sm7_verified import passive
_stage2_attack=attack
_stage2_ability=ability
_stage2_trainer=trainer

def attack(row,a):
 t=a[3]
 if t=="If this Pokémon has any damage counters on it, this attack does 70 more damage. This attack's damage isn't affected by Weakness.":return seq(bonus(70,cond('selfDamaged')),E('damageRule',ignoreWeakness=True))
 if t=='Discard all Energy from this Pokémon.':return E('discardEnergyCard',target='self',amount='all')
 if t=='You may attach up to 2 basic Energy cards from your hand to your Pokémon in any way you like.':return E('sm7Rule',rule='sm12HandAttach',left=2,basicOnly=True,optional=True)
 if t=='Search your deck for up to 5 Water Energy cards and attach them to your Pokémon in any way you like. Then, shuffle your deck.':return E('sm7Rule',rule='sm9SearchAttach',amount=5,energyTypes=['Water'])
 if t=='Flip a coin. If heads, search your deck for up to 5 Water Energy cards and attach them to your Pokémon in any way you like. Then, shuffle your deck.':return coin(E('sm7Rule',rule='sm9SearchAttach',amount=5,energyTypes=['Water']))
 if t=='Search your deck for up to 3 basic Energy cards and attach them to your Pokémon V in any way you like. Then, shuffle your deck.':return E('sm7Rule',rule='sm9SearchAttach',amount=3,targetFilter={'tag':'pokemon-v'})
 if t=="During your opponent's next turn, they can't play any Pokémon Tool or Special Energy cards from their hand.":return seq(*(E('actionLock',side='opponent',cardType=k,duration='opponentTurn') for k in ['Tool','SpecialEnergy']))
 if t=="This attack does 60 damage to 1 of your opponent's Pokémon for each Energy attached to this Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) (You can't use more than 1 VSTAR Power in a game.)":return E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=60,countProvidedType=True)
 if t=="This attack does 30 damage to 1 of your opponent's Pokémon for each Darkness Energy attached to this Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=30,energyType='Darkness',countProvidedType=True)
 if t=='Attach up to 2 basic Energy cards from your discard pile to 1 of your Benched Pokémon.':return E('sm7Rule',rule='sm12DiscardAttach',left=2,benchOnly=True,sameTarget=True,optional=True)
 if t=="If your opponent's Active Pokémon is a Pokémon VMAX, this attack does 160 more damage, and discard 3 Energy from this Pokémon.":return seq(bonus(160,cond('opponentMatches',filter={'tag':'pokemon-vmax'})),E('discardEnergyCard',target='self',amount=3,condition=cond('opponentMatches',filter={'tag':'pokemon-vmax'})))
 if t=="Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. This attack does 40 damage to the new Active Pokémon.":return E('sm7Rule',rule='sm9DragOff',amount=40)
 if t=="Your opponent shuffles their Active Pokémon and all attached cards into their deck.":return E('shuffleIntoDeck',target='opponentActive',includeAttached=True)
 if t=="If any of your Pokémon were Knocked Out by damage from an attack from your opponent's Pokémon during their last turn, this attack does 120 more damage.":return bonus(120,cond('koByOpponentAttackLastTurn'))
 if t=="Put 2 damage counters on your opponent's Pokémon in any way you like.":return E('sm7Rule',rule='sm10CounterSpread',amount=2)
 if t=="During your next turn, this Pokémon can't use Dragon Strike.":return E('lock',target='self',action='attack',attackName='Dragon Strike',duration='nextOwnTurn')
 if t=="Your opponent's Active Pokémon is now Confused and Poisoned.":return seq(E('status',target='opponentActive',status='confusion'),E('status',target='opponentActive',status='poison'))
 if t=="Discard a random card from your opponent's hand.":return E('discardHand',side='opponent',amount=1,random=True)
 if t=="If this Pokémon has any damage counters on it, this attack does 70 more damage.":return bonus(70,cond('selfDamaged'))
 if t=='This attack does 40 damage to 1 of your opponent\'s Pokémon for each Fusion Strike Energy attached to all of your Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)':return E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=40,swsh9FusionField=True)
 return _stage2_attack(row,a)

def ability(row,a):
 t=a[2]
 if t=="During your turn, you may search your deck for up to 2 cards and put them into your hand. Then, shuffle your deck. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('searchChosen',amount=2,filter={},optional=True),vstarPower=True)
 if t=="Once during your turn, you may discard your hand and draw 5 cards. If you use this Ability, your turn ends.":return activated(seq(E('discardHand',side='self',amount=999),E('draw',amount=5),E('endTurn')))
 if t=="This Pokémon takes 100 less damage from attacks from your opponent's Pokémon V (after applying Weakness and Resistance).":return passive(mod('damageReduction',100,opponentFilter={'tag':'pokemon-v'}))
 if t=="Your Basic Pokémon take 20 less damage from attacks from your opponent's Pokémon (after applying Weakness and Resistance).":return passive(E('modifier',stat='damageReduction',amount=20,scope='team',duration='whileInPlay',filter={'stage':'Basic'}))
 if t=="When you play this Pokémon from your hand onto your Bench, you may have your opponent switch their Active Pokémon with 1 of their Benched Pokémon.":return dict(type='triggered',event='benched',fromHandOnly=True,effect=E('sm7Rule',rule='sm12OptionalSwitch'))
 if t=="When you play this Pokémon from your hand onto your Bench during your turn, you may prevent all damage done to this Mimikyu V by attacks from your opponent's Pokémon until the end of your opponent's next turn.":return dict(type='triggered',event='benched',fromHandOnly=True,effect=E('chooseOption',options=[{'label':'Protect Mimikyu V','effect':E('preventDamage',target='self',duration='opponentTurn')},{'label':'Skip','effect':E('noop')}]))
 if t=="When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may prevent all damage from and effects of attacks from your opponent's Pokémon done to this Pokémon until the end of your opponent's next turn.":return dict(type='triggered',event='evolved',fromHandOnly=True,effect=E('chooseOption',options=[{'label':'Protect Garchomp','effect':E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)},{'label':'Skip','effect':E('noop')}]))
 if t=="This Pokémon's attacks cost Colorless less for each of your opponent's Pokémon V in play.":return passive(mod('attackCost',-1,perOpponentFilter={'tag':'pokemon-v'}))
 return _stage2_ability(row,a)

def trainer(row):
 t=row[13][0]
 if t=="Your opponent reveals their hand, and you draw a card for each Trainer card you find there.":return 'Supporter',seq(E('revealHand',side='opponent'),E('draw',amount=0,swsh9OpponentTrainerCount=True))
 if t=="Search your deck for up to 3 Basic Pokémon that don't have a Rule Box and put them onto your Bench. Then, shuffle your deck. (Pokémon V, Pokémon-GX, etc. have Rule Boxes.)":return 'Supporter',E('benchFromDeck',amount=3,filter={'kind':'pokemon','stage':'Basic','hasRuleBox':False},choose=True,optional=True)
 if t=="If the Pokémon this card is attached to doesn't have a Rule Box, it takes 30 less damage from attacks from your opponent's Pokémon (after applying Weakness and Resistance). (Pokémon V, Pokémon-GX, etc. have Rule Boxes.)":return 'Tool',mod('damageReduction',30,filter={'hasRuleBox':False})
 return _stage2_trainer(row)

# Stage 4: exact text gates and parameterized shared choice effects.
_stage3_attack=attack
_stage3_ability=ability
_stage3_trainer=trainer

def attack(row,a):
 t=a[3]
 if t=='You can use this attack only if this Pokémon used Spore Ball during your last turn.':return E('attackRequirement',condition=cond('sm10LastAttackSelf',name='Spore Ball'))
 if t=='Reveal the top 5 cards of your deck. This attack does 80 damage for each Energy card you find there. Then, discard those Energy cards and shuffle the other cards back into your deck.':return E('topDeckCountDamage',count=5,amount=80,filter={'kind':'energy'},mode='replace',discardMatches=True,shuffleAfter=True)
 if t=="Put 3 damage counters on your opponent's Active Pokémon for each Prize card your opponent has taken.":return E('placeDamageCounters',target='opponentActive',amount=30,perOpponentPrizeTaken=True)
 if t=="Put 4 damage counters on your opponent's Pokémon in any way you like. If you played Acerola's Premonition from your hand during this turn, place 13 damage counters instead.":return E('sm7Rule',rule='sm10CounterSpread',amount=4,supporterBoost={'name':"Acerola's Premonition",'amount':13})
 if t=="If you played Marnie's Pride from your hand during this turn, this attack does 120 more damage.":return bonus(120,cond('sm10Supporter',name="Marnie's Pride"))
 if t=="Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon. If you discarded a Pokémon Tool in this way, this attack does 120 more damage.":return E('sm7Rule',rule='sm9ToolBuster',amount=120,mode='add')
 if t=="Before doing damage, discard a Special Energy from your opponent's Active Pokémon.":return E('discardEnergyCard',target='opponentActive',amount=1,specialOnly=True,timing='beforeDamage')
 if t=='Move a basic Energy from this Pokémon to 1 of your Benched Pokémon.':return E('moveEnergy',source='self',target='selfBench',amount=1,allowedEnergyTypes=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'])
 return _stage3_attack(row,a)

def ability(row,a):
 t=a[2]
 if t=='Prevent all effects of attacks from your opponent\'s Pokémon done to this Pokémon. (Damage is not an effect.)':return passive(E('preventEffects',duration='whileInPlay',scope='self'))
 if t=="The Retreat Cost of your opponent's Poisoned Pokémon is Colorless more.":return passive(E('modifier',stat='retreatCost',amount=1,scope='opponentActive',duration='whileInPlay',condition=cond('opponentStatus',status='poison')))
 return _stage3_ability(row,a)

def trainer(row):
 t=row[13][0]
 if t=='Put 1 of your Colorless Pokémon that has any damage counters on it and all attached cards into your hand.':return 'Supporter',E('chooseTarget',target='selfPokemon',filter={'subtype':'Colorless','damaged':True},effect=E('returnToHand',target='selfPokemon',returnBasicEnergy=True))
 if t=='You can use this card only if you discard a Fire Energy card from your hand. Look at the top 7 cards of your deck and put up to 2 of them into your hand. Shuffle the other cards back into your deck.':return 'Supporter',E('sm7Rule',rule='sm10Pay',amount=1,filter={'kind':'energy','basicEnergy':True,'subtype':'Fire'},after=E('sm7Rule',rule='sm9TopPick',count=7,amount=2,filter={},destination='hand',rest='shuffle',optional=True))
 return _stage3_trainer(row)

# Stage 5: reuse battle-tested target, evolution and continuous ability paths.
_stage4_attack=attack
_stage4_ability=ability

def attack(row,a):
 t=a[3]
 if t=='If any of your Benched Magmortar have any damage counters on them, this attack does 90 more damage.':return bonus(90,cond('pokemonPresent',zone='bench',filter={'name':'Magmortar','damaged':True}))
 if t=="This attack does 50 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(E('bonusDamage',amount=50),E('benchDamage',side='opponent',all=True,amount=50))
 if t=='Flip a coin. If heads, search your deck for a Haxorus and put it onto this Axew to evolve it. Then, shuffle your deck.':return E('sm6Rule',rule='ultraEvolution',evolutionName='Haxorus')
 if t=='Discard all Fighting Energy from this Pokémon. This attack does 60 more damage for each card you discarded in this way.':return E('sm7Rule',rule='sm9TypedDiscardDamage',energyType='Fighting',amount=60,mode='add')
 if t=='You may discard all Lightning Energy from this Pokémon. If you do, this attack does 120 more damage.':return E('sm7Rule',rule='swsh9OptionalAllLightning')
 return _stage4_attack(row,a)

def ability(row,a):
 t=a[2]
 if t=="Prevent all damage done to your Benched Pokémon by attacks from your opponent's Pokémon.":return passive(E('sm7Rule',rule='sm10BenchBarrier'))
 if t=="All of your Pokémon that have Grass Energy attached can't be Confused, and if they are already Confused, they recover from that Special Condition.":return passive(E('preventStatus',scope='team',duration='whileInPlay',status='confusion',clearExisting=True,filter={'hasEnergyType':'Grass'}))
 if t=='As often as you like during your turn, you may move a Special Energy from 1 of your Pokémon to another of your Pokémon.':return dict(type='activated',oncePerTurn=False,effect=E('sm7Rule',rule='swsh7RapidConnection',specialOnly=True,anyRecipient=True))
 if t=='Once during your turn, you may put 2 damage counters on this Pokémon. If you do, search your deck for a Fighting Energy card and attach it to this Pokémon. Then, shuffle your deck.':return activated(seq(E('placeDamageCounters',target='self',amount=20),E('sm7Rule',rule='sm9SearchAttach',amount=1,energyTypes=['Fighting'],sourceSelf=True)))
 return _stage4_ability(row,a)

_stage5_attack=attack
_stage4_trainer=trainer

def attack(row,a):
 t=a[3]
 if t=='Flip 3 coins. Attach a number of basic Energy cards up to the number of heads from your discard pile to your Benched Pokémon in any way you like.':return E('sm7Rule',rule='swsh9TriRecharge')
 return _stage5_attack(row,a)

def trainer(row):
 t=row[13][0]
 if t=="Once during each player's turn, that player may attach a Fire Energy card from their discard pile to 1 of their Benched Fire Pokémon. If a player attached Energy to a Pokémon in this way, put 2 damage counters on that Pokémon.":return 'Stadium',E('stadiumAction',effect=E('sm7Rule',rule='sm12DiscardAttach',left=1,energyType='Fire',benchOnly=True,targetType='Fire',counterAfter=20,optional=True))
 if t=="Shuffle up to 3 in any combination of Pokémon and Supporter cards, except for Team Yell's Cheer, from your discard pile into your deck.":return 'Supporter',E('sm7Rule',rule='sm9Recycle',amount=3,filter={'anyOf':[{'kind':'pokemon'},{'kind':'trainer','trainerType':'Supporter'}],'notName':"Team Yell's Cheer"},optional=True)
 if t=="Choose 1 or more:\n• Shuffle a Pokémon from your discard pile into your deck.\n• Shuffle a Pokémon Tool card from your discard pile into your deck.\n• Shuffle a Stadium card from your discard pile into your deck.\n• Shuffle an Energy card from your discard pile into your deck.":return 'Supporter',E('sm7Rule',rule='swsh9Roseanne')
 return _stage4_trainer(row)

# Stage 6: reuse the existing multi-Tool and two-coin hand disruption paths.
_stage5_ability=ability
_stage5_final_attack=attack

def ability(row,a):
 if a[2]=="This Pokémon may have up to 4 Pokémon Tools attached to it. If it loses this Ability, discard Pokémon Tools from it until only 1 remains.":return passive(E('toolCapacity',amount=4))
 return _stage5_ability(row,a)

def attack(row,a):
 if a[3]=="Flip 2 coins. If either of them is heads, your opponent reveals their hand. For each heads, choose a card you find there and put it on the bottom of your opponent's deck in any order.":return E('neoRule',rule='pl3:137:cyrusInitiative',reason='Ransack',reveal=True)
 return _stage5_final_attack(row,a)
