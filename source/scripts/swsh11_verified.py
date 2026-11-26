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
