"""Lost Origin stage 1: shared descriptors plus explicitly implemented Lost Zone paths.
Unimplemented effects remain gated. Never infer from an attack name alone.
"""
import re
import swsh10_verified as previous
from swsh9_verified import E,seq,coin,cond,bonus,activated
from swsh8_verified import discard,status
from sm7_verified import passive

def optional(label,fx):return E('chooseOption',options=[{'label':label,'effect':fx},{'label':'Skip','effect':E('noop')}])
def evolved(fx):return dict(type='triggered',event='evolved',fromHandOnly=True,effect=fx)
def attack(row,a):
 t=a[3]
 if t=="Flip a coin. If heads, during your opponent's next turn, they can't play any Supporter cards from their hand. If tails, during your opponent's next turn, they can't play any Item cards from their hand.":return E('coinFlip',heads=E('actionLock',side='opponent',cardType='Supporter',duration='opponentTurn'),tails=E('actionLock',side='opponent',cardType='Item',duration='opponentTurn'))
 if t=='Search your deck for any number of Wurmple, Silcoon, Beautifly, Cascoon, and Dustox, reveal them, and put them into your hand. Then, shuffle your deck.':return E('searchChosen',amount=30,filter={'kind':'pokemon','name':['Wurmple','Silcoon','Beautifly','Cascoon','Dustox']},optional=True)
 if t=="Flip a coin. If heads, during your opponent's next turn, the Defending Pokémon can't attack.":return coin(E('lock',target='opponentActive',action='attack',duration='opponentTurn'))
 if t=="During your opponent's next turn, prevent all damage done to this Pokémon by attacks if that damage is 60 or less.":return E('preventDamage',target='self',duration='opponentTurn',maxDamage=60)
 if t=="Your opponent's Active Pokémon is now Confused and Poisoned. During Pokémon Checkup, put 8 damage counters on that Pokémon instead of 1.":return seq(status('confusion'),E('status',target='opponentActive',status='poison',amount=80))
 if t=="You may have your opponent switch their Active Pokémon with 1 of their Benched Pokémon.":return optional('Switch opponent’s Active Pokémon',E('forceOpponentSwitch',chooseBy='defender'))
 if t=="Your opponent's Active Pokémon is now Asleep.":return status('sleep')
 if t=="If your opponent's Active Pokémon is affected by a Special Condition, this attack also does 60 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('multiTargetDamage',target='opponentBench',amount=60,count=1,condition=cond('opponentStatus'))
 if t=="During your opponent's next turn, this Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).":return E('modifier',stat='damageReduction',target='self',amount=30,duration='opponentTurn')
 if t=='Attach a Fire Energy card from your discard pile to this Pokémon.':return E('attachEnergyFromDiscard',target='self',energyType='Fire',amount=1)
 if t=="Flip a coin. If heads, discard an Energy from your opponent's Active Pokémon.":return coin(discard(1,'opponentActive'))
 if t=="Your opponent's Active Pokémon is now Burned and Confused.":return seq(status('burn'),status('confusion'))
 if t=="Flip a coin. If heads, your opponent's Active Pokémon is now Burned.":return coin(status('burn'))
 if t=='If Poliwag is on your Bench, this attack does 60 more damage. If Poliwhirl is on your Bench, this attack does 90 more damage. If Poliwrath is on your Bench, this attack does 120 more damage.':return seq(*(bonus(n,cond('pokemonPresent',zone='bench',filter={'name':name})) for name,n in [('Poliwag',60),('Poliwhirl',90),('Poliwrath',120)]))
 if t=="This attack does 20 damage to 1 of your opponent's Pokémon for each Water Energy attached to this Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=20,energyType='Water',countProvidedType=True)
 if t=='Each player reveals the top 2 cards of their deck, then draws those cards.':return seq(E('inspectTop',side='self',amount=2),E('inspectTop',side='opponent',amount=2),E('draw',side='self',amount=2),E('draw',side='opponent',amount=2))
 if t=="This attack's damage isn't affected by Weakness.":return E('damageRule',ignoreWeakness=True)
 if t=="If the Defending Pokémon is a Basic Pokémon, it can't attack during your opponent's next turn.":return E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'stage':'Basic'}))
 if t=='If you have used your VSTAR Power, this attack does 120 more damage.':return bonus(120,cond('swsh11VstarUsed'))
 if t=="If your opponent's Active Pokémon has a Pokémon Tool attached, this attack does 80 more damage.":return bonus(80,cond('opponentHasTool'))
 if t=="Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. This attack does 40 damage to the new Active Pokémon.":return E('sm7Rule',rule='sm9DragOff',amount=40)
 if t=="This attack does 90 damage to 2 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) (You can't use more than 1 VSTAR Power in a game.)":return E('multiTargetDamage',target='opponentBench',amount=90,count=2)
 if t=='Search your deck for a Lightning Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.':return E('searchChosen',amount=1,filter={'kind':'pokemon','subtype':'Lightning'})
 if t=="Put 1 damage counter on your opponent's Active Pokémon.":return E('placeDamageCounters',target='opponentActive',amount=10)
 return previous.attack(row,a)

def ability(row,a):
 t=a[2]
 if t=='Once during your turn, you may draw cards until you have 6 cards in your hand.':return activated(E('drawToHandSize',size=6))
 if t=='When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may make both Active Pokémon Asleep and Poisoned.':return evolved(optional('Make both Active Pokémon Asleep and Poisoned',seq(*(E('status',target=who,status=st) for who in ['selfActive','opponentActive'] for st in ['sleep','poison']))))
 if t=="When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may discard the top 3 cards of your opponent's deck.":return evolved(optional('Discard opponent’s top 3 cards',E('discardTop',side='opponent',amount=3)))
 if t=="If you have 4 or more cards in the Lost Zone, ignore all Energy in this Pokémon's attack costs.":return passive(E('conditionalAttackCost',cost='',condition=cond('swsh11LostAtLeast',amount=4)))
 if t=='If this Pokémon has any Energy attached, it has no Retreat Cost.':return passive(E('modifier',stat='retreatCost',amount=-999,scope='self',duration='whileInPlay',condition=cond('selfMatches',filter={'hasAnyEnergy':True})))
 if t=="When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.":return evolved(optional('Flip for Paralysis',coin(status('paralysis'))))
 if t=="All of your Pokémon take 30 less damage from attacks from your opponent's Dragon Pokémon (after applying Weakness and Resistance). You can't apply more than 1 Spirit Charm Ability at a time.":return passive(E('modifier',stat='damageReduction',amount=30,scope='team',duration='whileInPlay',opponentFilter={'subtype':'Dragon'},nonStacking=True))
 return None

def trainer(row):
 t=row[13][0]
 if t=="Search your deck for up to 3 Evolution Pokémon that don't have a Rule Box, reveal them, and put them into your hand. Then, shuffle your deck. (Pokémon V, Pokémon-GX, etc. have Rule Boxes.)":return 'Supporter',E('searchChosen',amount=3,filter={'kind':'pokemon','evolved':True,'hasRuleBox':False},optional=True)
 if t=='Look at the top 5 cards of your deck and put 3 of them into your hand. Put the other cards in the Lost Zone.':return 'Supporter',E('sm7Rule',rule='swsh11Colress')
 if t=='Draw 2 cards. If your Active Pokémon has "Hisuian" in its name, draw 2 more cards.':return 'Supporter',seq(E('draw',amount=2),E('draw',amount=2,condition=cond('activeMatches',filter={'nameContains':'Hisuian'}),optionalCondition=True))
 if t=='Search your deck for up to 4 basic Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.':return 'Supporter',E('searchChosen',amount=4,filter={'kind':'energy','basicEnergy':True},optional=True)
 if t=='Look at the top 7 cards of your deck. You may reveal any number of Pokémon Tool cards you find there and put them into your hand. Shuffle the other cards back into your deck.':return 'Item',E('sm7Rule',rule='swsh11ToolBox')
 if t=='Discard 1 of your Benched Pokémon V and all attached cards.':return 'Supporter',E('discardBenchPokemon',filter={'tag':'pokemon-v'},condition=cond('pokemonPresent',zone='bench',filter={'tag':'pokemon-v'}))
 if t=='Attach a basic Darkness Energy card from your discard pile to 1 of your Benched Darkness Pokémon.':return previous.trainer(row)
 # Collapsed Stadium is ID-specific and must use the shared continuous hook.
 if row[0]=='215' and row[1]=='Collapsed Stadium':return previous.trainer(row)
 return None

def energy(row):return None
prism_ready=previous.prism_ready

# Stage 2: exact text, shared attack descriptors and physical Lost Zone choices.
_stage1_attack=attack
def attack(row,a):
 t=a[3]
 if t=="Put 3 damage counters on your opponent's Pokémon in any way you like.":return E('distributeDiscardCounters',amount=10,remaining=3)
 if t=="You can use this attack only if you have 10 or more cards in the Lost Zone. Put 12 damage counters on your opponent's Pokémon in any way you like.":return seq(E('attackRequirement',condition=cond('swsh11LostAtLeast',amount=10)),E('distributeDiscardCounters',amount=10,remaining=12))
 if t=="Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. The new Active Pokémon is now Confused.":return E('sequence',condition=cond('benchAtLeast',side='opponent',amount=1),effects=[E('forceOpponentSwitch',chooseBy='attacker'),status('confusion')])
 if t=="This attack does 10 damage for each damage counter on all of your opponent's Pokémon.":return E('damageFromDamage',source='opponent',all=True,amount=1,mode='replace')
 if t=='If you have no cards in your hand, this attack does 150 more damage.':return bonus(150,cond('handSizeOneOf',values=[0]))
 if t=="Flip 4 coins. This attack does 50 damage for each heads. If at least 2 of them are heads, your opponent's Active Pokémon is now Paralyzed.":return E('coinDamageStatus',coins=4,amount=50,minHeads=2,status='paralysis')
 if t=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if t=='Put up to 2 basic Energy cards from your discard pile into your hand.':return E('searchChosen',source='discard',amount=2,filter={'kind':'energy','basicEnergy':True},optional=True)
 if t=='Search your deck for up to 2 Fighting Energy cards and attach them to your Benched Pokémon in any way you like. Then, shuffle your deck.':return E('distributeEnergy',source='zone',target='selfBench',energyType='Fighting',amount=2,optional=True)
 return _stage1_attack(row,a)
_stage1_ability=ability
def ability(row,a):
 t=a[2]
 if t=="All of your Pokémon take 20 less damage from attacks from your opponent's Pokémon V (after applying Weakness and Resistance).":return passive(E('modifier',stat='damageReduction',amount=20,scope='team',duration='whileInPlay',opponentFilter={'tag':'pokemon-v'}))
 if t=='Once during your turn, if this Pokémon is in the Active Spot, you may look at the top 2 cards of your deck and put 1 of them into your hand. Put the other card in the Lost Zone.':return activated(E('sm7Rule',rule='swsh11FlowerSelecting'),activeOnly=True)
 return _stage1_ability(row,a)

# Stage 3: full print catalogue; reuse exact shared damage and choice descriptors.
_stage2_attack=attack
_stage2_ability=ability
def attack(row,a):
 t=a[3]
 if t=="This attack's damage isn't affected by Weakness. If your opponent's Active Pokémon is a Pokémon V, this attack does 50 more damage.":return seq(E('damageRule',ignoreWeakness=True),bonus(50,cond('opponentMatches',filter={'tag':'pokemon-v'})))
 if t=="This attack does 30 more damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.":return E('retreatCostDamage',amount=30,mode='add')
 if t=="This attack does 40 more damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.":return E('retreatCostDamage',amount=40,mode='add')
 if t=='This attack does 20 damage for each card in your hand.':return E('handCountDamage',source='self',amount=20,mode='replace')
 if t=='This attack does 50 more damage for each Prize card you have taken.':return E('pointDamage',side='self',prizesTaken=True,amount=50,mode='add')
 if t=='If this Pokémon has a Pokémon Tool attached, this attack does 60 more damage, and your opponent\'s Active Pokémon is now Confused.':return seq(bonus(60,cond('selfHasTool')),E('status',target='opponentActive',status='confusion',condition=cond('selfHasTool')))
 if t=='Search your deck for a Darkness Energy card and attach it to 1 of your Pokémon. Then, shuffle your deck.':return E('sm7Rule',rule='sm9SearchAttach',amount=1,energyTypes=['Darkness'])
 if t=='Attach any number of Water Energy cards from your hand to your Pokémon in any way you like.':return E('sm7Rule',rule='sm12HandAttach',left=99,basicOnly=True,energyType='Water',optional=True)
 if t=='This attack does 50 damage for each of your Pokémon that has any damage counters on it.':return E('fieldCountDamage',side='self',filter={'damaged':True},amount=50,mode='replace')
 if t=='This attack does 10 less damage for each damage counter on this Pokémon.':return E('selfDamagePenalty',amount=1)
 if t=='Look at the top 4 cards of your deck and put 2 of them into your hand. Put the other cards in the Lost Zone.':return E('sm7Rule',rule='swsh11AbyssSeeking')
 if t=="This attack's damage isn't affected by any effects on your opponent's Active Pokémon.":return E('damageRule',ignoreEffects=True)
 return _stage2_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=="During your turn, you may heal all damage from this Pokémon. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('heal',target='self',amount=999),vstarPower=True)
 if t=="During your turn, you may discard your hand and draw 7 cards. (You can't use more than 1 VSTAR Power in a game.)":return activated(seq(E('discardHand',side='self',amount=999),E('draw',amount=7)),vstarPower=True)
 if t=="During your turn, you may make your opponent's Active Pokémon Paralyzed and Poisoned. During Pokémon Checkup, put 3 damage counters on that Pokémon instead of 1. (You can't use more than 1 VSTAR Power in a game.)":return activated(seq(status('paralysis'),E('status',target='opponentActive',status='poison',amount=30)),vstarPower=True)
 return _stage2_ability(row,a)

# Stage 4: physical Lost Zone Energy choices and the shared distinct-type search.
_stage3_attack=attack
_stage3_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=='Put this Pokémon and all attached cards in the Lost Zone.':return E('sm7Rule',rule='sm8LostPokemon',target='self')
 if t=='Put all Energy attached to this Pokémon in the Lost Zone.':return E('sm7Rule',rule='swsh11LoseEnergy',source='self',amount='all')
 if t=="Put 2 Energy attached to this Pokémon in the Lost Zone. This attack also does 120 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(E('sm7Rule',rule='swsh11LoseEnergy',source='self',amount=2),E('multiTargetDamage',target='opponentBench',amount=120,count=1))
 if t=='Put 2 Energy attached to your Pokémon in the Lost Zone.':return E('sm7Rule',rule='swsh11LoseEnergy',source='team',amount=2)
 if t=="You can use this attack only if you have 10 or more cards in the Lost Zone. Your opponent's Active Pokémon is Knocked Out. (You can't use more than 1 VSTAR Power in a game.)":return seq(E('attackRequirement',condition=cond('swsh11LostAtLeast',amount=10)),E('knockOut',target='opponentActive'))
 if t=="Put an Energy attached to your opponent's Active Pokémon in the Lost Zone.":return E('sm7Rule',rule='swsh11LoseEnergy',source='opponent',amount=1)
 if t=="At the end of your opponent's next turn, the Defending Pokémon will be Knocked Out.":return E('scheduleDelayed',event='endOpponentNextTurn',targetMode='defender',effect=E('knockOut',target='eventPokemon'))
 if t=='Put a card from your discard pile into your hand.':return E('searchChosen',source='discard',amount=1,filter={})
 if t=='Discard an Energy from this Pokémon and heal all damage from it.':return seq(E('attackRequirement',condition=cond('selfMatches',filter={'hasAnyEnergy':True})),E('discardEnergyCard',target='self',amount=1),E('heal',target='self',amount=999))
 if t=='This attack does 100 damage for each Special Condition affecting this Pokémon.':return E('statusCountDamage',source='self',amount=100,mode='replace')
 return _stage3_attack(row,a)
def trainer(row):
 t=row[13][0]
 if t=='You can use this card only if you have 7 or more cards in the Lost Zone. Search your deck for up to 2 basic Energy cards of different types and attach them to your Pokémon in any way you like. Then, shuffle your deck.':return 'Item',E('sm7Rule',rule='sm9SearchAttach',amount=2,distinctTypes=True,condition=cond('swsh11LostAtLeast',amount=7))
 return _stage3_trainer(row)

# Stage 5: shared knockout routing, prize protection and checkup modifiers.
_stage4_trainer=trainer
_stage4_ability=ability
def trainer(row):
 if row[0]=='161' and row[1]=='Lost City':return 'Stadium',E('noop') # actual KO destination handled in core
 if row[0] in ['162','217'] and row[1]=='Lost Vacuum':return 'Item',E('sm7Rule',rule='swsh11LostVacuum')
 return _stage4_trainer(row)
def energy(row):
 if row[0]=='171' and row[1]=='Gift Energy':return E('specialEnergy',provides={'Colorless':1}) # attack-damage KO trigger in core
 return None
def ability(row,a):
 if (row[0],a[0]) in [('17','Elder Tree Barrier'),('149','All Just a Dream'),('29','Scorching Aura'),('123','Poison Peak')]:return passive(E('noop')) # core KO/checkup hooks
 return _stage4_ability(row,a)

# Stage 6: exact conditional attack effects and Lost Zone support.
_stage5_attack=attack
_stage5_ability=ability
_stage5_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=="During your next turn, this Pokémon's attacks do 120 more damage to your opponent's Active Pokémon (before applying Weakness and Resistance).":return E('nextAttackBonus',attackName='*',amount=120)
 if t=='Each player reveals their hand. If a card in your opponent\'s hand has the same name as a card in your hand, this attack does 90 more damage.':return seq(bonus(90,cond('swsh11SharedHandName')),E('revealHand',side='self'),E('revealHand',side='opponent'))
 if t=="Choose 2 of your opponent's Pokémon and put 2 damage counters on each of them.":return E('sm7Rule',rule='swsh11DistinctCounters')
 if t=='This attack does 20 damage for each Pokémon Tool card in the Lost Zone (both yours and your opponent\'s).':return seq(E('discardCountDamage',zone='lostZone',side='self',filter={'kind':'trainer','trainerType':'Tool'},amount=20,mode='replace'),E('discardCountDamage',zone='lostZone',side='opponent',filter={'kind':'trainer','trainerType':'Tool'},amount=20,mode='add'))
 if t=="Look at the top card of your opponent's deck. You may have your opponent shuffle their deck.":return seq(E('inspectTop',side='opponent',amount=1),optional('Shuffle opponent’s deck',E('shuffleDeck',side='opponent')))
 if t=='Discard your hand. If you discarded 5 or more cards in this way, this attack does 150 more damage.':return seq(bonus(150,cond('swsh11HandAtLeast',amount=5)),E('discardHand',side='self',amount=999))
 if t=='Attach up to 2 Fighting Energy cards from your hand to your Pokémon in any way you like.':return E('sm7Rule',rule='sm12HandAttach',left=2,energyType='Fighting',optional=True)
 if t=="Put the top card of your opponent's deck in the Lost Zone.":return E('sm7Rule',rule='swsh11LostTop',side='opponent',amount=1)
 if t=="Put the top 3 cards of your deck in the Lost Zone.":return E('sm7Rule',rule='swsh11LostTop',amount=3)
 if t=="Move 2 damage counters from each of your Pokémon to 1 of your opponent's Pokémon.":return E('sm7Rule',rule='swsh11Moonglow')
 return _stage5_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=='Once during your turn, you may have either player shuffle their hand and put it on the bottom of their deck. If that player put any cards on the bottom of their deck in this way, they draw 4 cards.':return activated(E('sm7Rule',rule='swsh11Seething'))
 if t=='Once during your turn, you may draw 3 cards. If you use this Ability, your turn ends.':return activated(seq(E('draw',amount=3),E('endTurn')))
 return _stage5_ability(row,a)
def trainer(row):
 if row[1]=='Fantina':return 'Supporter',E('modifier',stat='damageReduction',scope='team',amount=120,duration='opponentTurn',opponentFilter={'tag':'pokemon-v'},condition=cond('swsh11LostAtLeast',amount=10))
 return _stage5_trainer(row)

# Stage 7: deck ordering, filtered discard/switch, and Stadium effects.
_stage6_attack=attack
_stage6_ability=ability
_stage6_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=='If you have a Stadium in play, this attack does 80 more damage.':return bonus(80,cond('ownStadiumInPlay'))
 if t=="Look at the top 4 cards of either player's deck and put them back in any order.":return E('chooseOption',options=[{'label':'Your deck','effect':E('reorderTop',deckSide='self',count=4)},{'label':'Opponent’s deck','effect':E('reorderTop',deckSide='opponent',count=4)}])
 if t=='Switch this Pokémon with 1 of your Benched Darkness Pokémon.':return E('sm7Rule',rule='swsh11DarkSwitch')
 if t=="If your opponent has a Stadium in play, discard it. If you discarded a Stadium in this way, discard 2 Energy from your opponent's Active Pokémon.":return E('sm7Rule',rule='swsh11FieldTrap')
 if t=='Flip a coin until you get tails. Search your deck for a number of cards up to the number of heads and put them into your hand. Then, shuffle your deck.':return E('sm7Rule',rule='swsh11AllGrab')
 return _stage6_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=='Once during your turn, if this Pokémon is on your Bench, you may shuffle it and all attached cards into your deck.':return activated(E('shuffleIntoDeck',target='self',includeAttached=True),benchOnly=True)
 return _stage6_ability(row,a)
def trainer(row):
 if row[1]=='Miss Fortune Sisters':return 'Supporter',E('sm7Rule',rule='swsh11MissFortune')
 if row[1]=='Lake Acuity':return 'Stadium',E('noop') # continuous typed Energy check in modifierAmount
 return _stage6_trainer(row)

# Stage 8: selectable pre-damage resources, physical prize exchange and damage movement.
_stage7_attack=attack
_stage7_ability=ability
_stage7_trainer=trainer
def attack(row,a):
 t=a[3]
 if a[0]=='Scrap Short':return E('sm7Rule',rule='swsh11ScrapShort')
 if a[0]=='Max Frost':return E('sm7Rule',rule='swsh11MaxFrost')
 if a[0]=='Floe Return':return E('sm7Rule',rule='swsh11FloeReturn')
 if a[0]=='Upstream Spirits':return E('sm7Rule',rule='swsh11UpstreamSpirits')
 if a[0]=='Dynamic Tail':return E('sm7Rule',rule='swsh11DynamicTail')
 return _stage7_attack(row,a)
def ability(row,a):
 if a[0]=='Glaciated World':return activated(E('sm7Rule',rule='swsh11GlaciatedWorld'))
 if a[0]=='Wild Style':return passive(E('noop')) # shared attack-cost hook
 return _stage7_ability(row,a)
def trainer(row):
 if row[1]=='Arc Phone':return 'Item',E('sm7Rule',rule='swsh11ArcPhone')
 if row[1]=='Damage Pump':return 'Item',E('sm7Rule',rule='swsh11DamagePump')
 return _stage7_trainer(row)

# Stage 9: exact named-recipient Energy support, discard-pile Ability and protection.
_stage8_attack=attack
_stage8_ability=ability
def attack(row,a):
 if row[0]=='62' and a[0]=='Wonder Storm':return E('energyDamage',source='self',all=True,energyType='Psychic',countProvidedType=True,amount=20,mode='replace')
 if row[0]=='66' and a[0]=='Screaming Circle':return E('sm7Rule',rule='swsh11ScreamingCircle')
 if row[0]=='71' and a[0]=='Tempting Trap':return seq(E('lock',target='opponentActive',action='retreat',duration='opponentTurn'),E('modifier',target='opponentActive',scope='self',stat='damageTaken',amount=90,duration='nextOwnTurn'))
 if row[0]=='85' and a[0]=='Splash Loop':return seq(*(E('sm7Rule',rule='sm12ReturnEnergy',left=1) for _ in range(2)))
 return _stage8_attack(row,a)
def ability(row,a):
 if row[0]=='62' and a[0]=='Moon-Watching Party':return activated(E('sm7Rule',rule='swsh11MoonParty'),activeOnly=True)
 if row[0]=='66' and a[0]=='Netherworld Gate':return dict(type='activated',oncePerTurn=True,fromDiscard=True,effect=E('noop')) # zone action in core
 if row[0]=='40' and a[0]=='Oceanic Accompaniment':return dict(type='activated',oncePerTurn=False,effect=E('sm7Rule',rule='sm12HandAttach',left=1,energyType='Water',basicOnly=True,targetFilter={'attackName':'Swim Freely'}))
 if row[0]=='134' and a[0]=='Metal Lodging':return passive(E('noop')) # shared attack protection hook
 return _stage8_ability(row,a)
