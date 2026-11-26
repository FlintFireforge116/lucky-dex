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
