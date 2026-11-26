"""Fusion Strike stage 1: full-text mappings, no name-only effect guesses."""
import re
from sm7_verified import E,seq,coin,status,cond
from swsh2_verified import discard
from swsh3_verified import mod
from swsh8_source import TEXT

def attack(row,a):
 t=a[3]
 if not t:return E('noop')
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',t)
 if m:return E('coinDamage',coins=1,amount=int(m[1]),mode='add')
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage for each heads\.',t)
 if m:return E('coinDamage',coins=int(m[1]),amount=int(m[2]),mode='replace')
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',t)
 if m:return E('healSelf',amount=int(m[1]))
 m=re.fullmatch(r'This Pokémon also does (\d+) damage to itself\.',t)
 if m:return E('selfDamage',amount=int(m[1]))
 m=re.fullmatch(r'Draw (a card|\d+ cards)\.',t)
 if m:return E('draw',amount=1 if m[1]=='a card' else int(m[1].split()[0]))
 if t==TEXT[6]:return E('lock',target='self',action='attack',duration='nextOwnTurn')
 for i,st in [(7,'burn'),(14,'confusion'),(16,'poison')]:
  if t==TEXT[i]:return status(st)
 if t==TEXT[11]:return coin(status('paralysis'))
 if t==TEXT[15]:return E('switch',target='self',optional=False)
 if t==TEXT[17]:return discard(1,'opponentActive')
 if t==TEXT[19]:return discard(1)
 return None

def ability(row,a):return None

def trainer(row):
 n,name,sup,subs,hp,types,ev,at,ab,w,r,retreat,rar,rules,tc,trait=row
 first=rules[0] if rules else ''
 # Match the complete distinctive effect sentence, including exact restrictions.
 if first=='Search your deck for up to 3 Pokémon V, reveal them, and put them into your hand. Then, shuffle your deck.':return 'Supporter',E('searchChosen',amount=3,filter={'kind':'pokemon','tag':'pokemon-v'},optional=True)
 if first=='Draw 2 cards. Flip a coin. If heads, draw 2 more cards.':return 'Supporter',seq(E('draw',amount=2),coin(E('draw',amount=2)))
 if first=='Search your deck for up to 3 Fusion Strike Pokémon, reveal them, and put them into your hand. Then, shuffle your deck.':return 'Supporter',E('searchChosen',amount=3,filter={'kind':'pokemon','tag':'fusion-strike'},optional=True)
 if first=='Heal 70 damage from your Active Pokémon.':return 'Supporter',E('heal',target='selfActive',amount=70)
 if first=="Draw 2 cards. If you go second and it's your first turn, draw 3 more cards.":return 'Supporter',seq(E('draw',amount=2),E('draw',amount=3,condition=cond('sm7FirstSecond'),optionalCondition=True))
 if first=='Each player shuffles their hand into their deck and draws 4 cards.':return 'Supporter',E('handShuffle',side='both',draw=4)
 if first=='You can play this card only if you discard another card from your hand. Search your deck for a Basic Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.':return 'Item',E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('searchChosen',amount=1,filter={'kind':'pokemon','stage':'Basic'}),trainer=True)
 if first=='Shuffle your hand into your deck. Then, draw 5 cards.':return 'Supporter',E('handShuffle',draw=5)
 if first=="The attacks of the Pokémon this card is attached to do 30 more damage to your opponent's Active Water Pokémon (before applying Weakness and Resistance).":return 'Tool',mod('attackDamageActiveOnly',30,opponentFilter={'subtype':'Water'})
 if first=="Once during each player's turn, that player may put a basic Energy card from their discard pile into their hand.":return 'Stadium',E('stadiumAction',effect=E('searchChosen',source='discard',amount=1,filter={'kind':'energy','basicEnergy':True}))
 return None

def energy(row):return None

def prism_ready(row):return False
