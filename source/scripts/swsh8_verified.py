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

# Stage 2: verified V/VMAX packet; match full text, including alternate prints.
from sm7_verified import activated,passive
_old_attack=attack
_old_trainer=trainer
def attack(row,a):
 t=a[3]
 e=_old_attack(row,a)
 if e is not None:return e
 if t=="If this Pokémon was damaged by an attack during your opponent's last turn, this attack does that much more damage.":return E('sm7Rule',rule='swsh2CounterDamage')
 if t=='You may discard any number of your Benched Pokémon. This attack does 40 more damage for each Benched Pokémon you discarded in this way.':return E('chooseDiscardForBonus',zone='bench',max=5,amount=40)
 m=re.fullmatch(r"This attack also does (\d+) damage to (\d+) of your opponent's Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)",t)
 if m:return E('multiTargetDamage',target='opponentBench',amount=int(m[1]),count=int(m[2]))
 m=re.fullmatch(r'Your opponent reveals their hand\. This attack does (\d+) damage for each Trainer card you find there\.',t)
 if m:return seq(E('filteredHandCountDamage',side='opponent',filter={'kind':'trainer'},amount=int(m[1]),mode='replace'),E('revealHand',side='opponent'))
 if t=='Discard 2 Fire Energy from this Pokémon.':return discard(2,energyType='Fire',strictEnergyType=True)
 if t=="Your opponent's Active Pokémon is now Burned. During your next turn, this Pokémon can't attack.":return seq(status('burn'),E('lock',target='self',action='attack',duration='nextOwnTurn'))
 if t=="Discard the top 2 cards of your opponent's deck.":return E('discardTop',side='opponent',amount=2)
 if t=="This attack does 60 more damage for each damage counter on your opponent's Active Pokémon.":return E('damageFromDamage',source='opponent',amount=6,mode='add')
 if t=='You may switch this Pokémon with 1 of your Benched Pokémon.':return E('chooseOption',options=[{'label':'Switch this Pokémon','effect':E('switch',target='self',optional=False)},{'label':'Keep in play','effect':E('noop')}])
 if t=='This attack does 30 more damage for each Lightning Energy attached to all of your Pokémon.':return E('energyDamage',source='self',all=True,energyType='Lightning',countProvidedType=True,amount=30,mode='add')
 if t=="During your next turn, this Pokémon can't use Max Bolt.":return E('lock',target='self',action='attack',attackName='Max Bolt',duration='nextOwnTurn')
 if t=='Search your deck for an Energy card and attach it to 1 of your Fusion Strike Pokémon. Then, shuffle your deck.':return E('sm7Rule',rule='sm9SearchAttach',amount=1,includeSpecial=True,targetFilter={'tag':'fusion-strike'})
 if t=='You may shuffle this Pokémon and all attached cards into your deck.':return E('chooseOption',options=[{'label':'Shuffle this Pokémon into deck','effect':E('shuffleIntoDeck',target='self',includeAttached=True)},{'label':'Keep in play','effect':E('noop')}])
 if t=="Choose 1 of your Benched Fusion Strike Pokémon's attacks and use it as this attack.":return E('copyAttack',source='selfBench',filter={'tag':'fusion-strike'},swsh2Copy=True,sm12Copy=True,nonGxOnly=True)
 if t=="This attack's damage isn't affected by any effects on your opponent's Active Pokémon.":return E('damageRule',ignoreEffects=True)
 if t=="Your opponent's Active Pokémon is now Asleep.":return status('sleep')
 if t=='Put 3 damage counters on this Pokémon.':return E('selfDamage',amount=30,asCounters=True)
 if t=="This attack does 60 damage for each of your opponent's Pokémon V and Pokémon-GX in play.":return E('fieldCountDamage',side='opponent',filter={'tag':['pokemon-v','pokemon-gx']},amount=60,mode='replace')
 if t=="During your next turn, this Pokémon's attacks do 80 more damage to your opponent's Active Pokémon (before applying Weakness and Resistance).":return E('nextAttackBonus',attackName='*',amount=80)
 if t=="This attack does 60 damage for each Energy attached to all of your opponent's Pokémon.":return E('energyDamage',source='opponent',all=True,amount=60,mode='replace')
 return None

def ability(row,a):
 t=a[2]
 if t=="As long as this Pokémon is in the Active Spot, your opponent can't play any Pokémon Tool cards from their hand.":return passive(E('actionLock',side='opponent',cardType='Tool',duration='whileActive'),activeOnly=True)
 if t=='Once during your turn, you may draw cards until you have as many cards in your hand as you have Fusion Strike Pokémon in play.':return activated(E('drawToHandSize',size=0,fieldFilter={'tag':'fusion-strike'}))
 if t=='This Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).':return passive(mod('damageReduction',30))
 return None

def trainer(row):
 t=row[13][0] if row[13] else ''
 if t=="During this turn, your Fusion Strike Pokémon's attacks do 30 more damage to your opponent's Active Pokémon (before applying Weakness and Resistance).":return 'Item',E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='turn',filter={'tag':'fusion-strike'})
 return _old_trainer(row)
