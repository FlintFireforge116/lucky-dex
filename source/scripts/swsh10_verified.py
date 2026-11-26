"""Stage one: exact text matches only; new mechanics fail closed."""
import re
import swsh9_verified as prev
from swsh9_verified import E,seq,coin,cond,bonus,activated
from swsh8_verified import discard,status

def attack(row,a):
 t=a[3]
 if t=='Draw cards until you have 6 cards in your hand.':return E('drawToHandSize',size=6)
 if t=="Your opponent's Active Pokémon is now Burned. During your opponent's next turn, that Pokémon can't retreat.":return seq(status('burn'),E('lock',target='opponentActive',action='retreat',duration='opponentTurn'))
 if t=='Search your deck for up to 2 basic Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.':return E('searchChosen',amount=2,filter={'kind':'energy','basicEnergy':True},optional=True)
 if t=='Flip a coin. If heads, heal 10 damage from this Pokémon.':return coin(E('healSelf',amount=10))
 if t=="This attack's damage isn't affected by Weakness or Resistance, or by any effects on your opponent's Active Pokémon.":return E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True)
 if t=="Discard an Energy from this Pokémon. During your opponent's next turn, the Defending Pokémon can't attack.":return seq(discard(1),E('lock',target='opponentActive',action='attack',duration='opponentTurn'))
 if t=="If the Defending Pokémon is a Pokémon V, it can't attack during your opponent's next turn.":return E('lock',target='opponentActive',action='attack',duration='opponentTurn',condition=cond('opponentMatches',filter={'tag':'pokemon-v'}))
 if t=="This attack does 20 more damage for each of your Benched Pokémon.":return E('benchCountDamage',side='self',amount=20,mode='add')
 if t=="This attack does 30 more damage for each of your opponent's Benched Pokémon.":return E('benchCountDamage',side='opponent',amount=30,mode='add')
 if t=="This attack does 80 damage for each Special Condition affecting your opponent's Active Pokémon.":return E('statusCountDamage',source='opponent',amount=80,mode='replace')
 if t=="If this Pokémon has any Fire Energy attached, this attack does 80 more damage, and your opponent's Active Pokémon is now Burned.":return seq(bonus(80,cond('selfEnergyAtLeast',energyType='Fire',amount=1,countSpecial=True)),E('status',target='opponentActive',status='burn',condition=cond('selfEnergyAtLeast',energyType='Fire',amount=1,countSpecial=True)))
 if t=='Flip a coin. If heads, during your opponent\'s next turn, prevent all damage done to this Pokémon by attacks.':return coin(E('preventDamage',target='self',duration='opponentTurn'))
 if t=="Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.":return E('forceOpponentSwitch',chooseBy='defender')
 if t=="This attack does 10 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(E('bonusDamage',amount=10),E('benchDamage',side='opponent',all=True,amount=10))
 if t=="Your opponent's Active Pokémon is now Poisoned. During Pokémon Checkup, put 5 damage counters on that Pokémon instead of 1.":return E('status',target='opponentActive',status='poison',amount=50)
 if t=='If you have a Stadium in play, this attack does 90 more damage.':return bonus(90,cond('ownStadiumInPlay'))
 if t=='If this Pokémon has a Pokémon Tool attached, this attack does 90 more damage.':return bonus(90,cond('selfHasTool'))
 m=re.fullmatch(r'Search your deck for (an?|up to \d+) (Item|Stadium) cards?, reveal (?:it|them), and put (?:it|them) into your hand. Then, shuffle your deck\.',t)
 if m:return E('searchChosen',amount=1 if m[1] in ('a','an') else int(m[1].split()[-1]),filter={'kind':'trainer','trainerType':m[2]},optional=m[1] not in ('a','an'))
 if t=='Search your deck for a card and put it into your hand. Then, shuffle your deck.':return E('searchChosen',amount=1,filter={})
 return prev.attack(row,a)

def ability(row,a):
 # Optional trigger must retain the choice rather than automatically heal.
 m=re.fullmatch(r'When you play this Pokémon from your hand (onto your Bench|to evolve 1 of your Pokémon) during your turn, you may heal (\d+) damage from your Active Pokémon\.',a[2])
 if m:return dict(type='triggered',event='benched' if m[1]=='onto your Bench' else 'evolved',fromHandOnly=True,effect=E('chooseOption',options=[{'label':'Heal Active Pokémon','effect':E('heal',target='selfActive',amount=int(m[2]))},{'label':'Skip','effect':E('noop')}]))
 return None

def trainer(row):
 t=row[13][0]
 if t=='Each player reveals their hand. Draw 3 cards.':return 'Supporter',seq(E('revealHand',side='opponent'),E('revealHand',side='self'),E('draw',amount=3))
 if t=='Attach a basic Darkness Energy card from your discard pile to 1 of your Benched Darkness Pokémon.':return 'Item',E('attachEnergyFromDiscard',target='selfBench',energyType='Darkness',amount=1,filter={'subtype':'Darkness'},basicEnergy=True)
 if t=='Search your deck for a Water Pokémon and an Item card, reveal them, and put them into your hand. Then, shuffle your deck.':return 'Supporter',seq(E('searchChosen',amount=1,filter={'kind':'pokemon','subtype':'Water'}),E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Item'}))
 if t=='Your Active Pokémon is now Burned. Heal 40 damage from it.':return 'Item',seq(E('status',target='selfActive',status='burn'),E('heal',target='selfActive',amount=40))
 if t=='Look at the top 7 cards of your deck. You may reveal an Energy card you find there and put it into your hand. Shuffle the other cards back into your deck.':return 'Item',E('selectTopToHand',count=7,filter={'kind':'energy'},optional=True)
 # Fossil and Path to the Peak remain gated pending exact runtime coverage.
 return prev.trainer(row)
energy=prev.energy
prism_ready=prev.prism_ready
