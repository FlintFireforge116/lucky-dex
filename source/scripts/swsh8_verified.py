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

# Stage 3: exact full-text signatures; reuse validated shared primitives.
from sm7_verified import bonus
from swsh1_verified import PATTERNS as SWSH1_PATTERNS
_stage2_attack=attack
_stage2_ability=ability
_stage2_trainer=trainer
def attack(row,a):
 t=a[3];e=_stage2_attack(row,a)
 if e is not None:return e
 for pattern,fn in SWSH1_PATTERNS:
  m=re.fullmatch(pattern,t)
  if m:return fn(m,a)
 if t=='Flip a coin. If tails, this attack does nothing.':return E('coinDamage',coins=1,amount=int(a[2]),mode='replace')
 if t=='Search your deck for a Caterpie and put it onto your Bench. Then, shuffle your deck.':return E('benchFromDeck',amount=1,filter={'kind':'pokemon','stage':'Basic','name':'Caterpie'},choose=True)
 if t in ('Search your deck for up to 2 Basic Pokémon and put them onto your Bench. Then, shuffle your deck.','Search your deck for a Basic Pokémon and put it onto your Bench. Then, shuffle your deck.'):
  n=2 if 'up to 2' in t else 1
  return E('benchFromDeck',amount=n,filter={'kind':'pokemon','stage':'Basic'},choose=True,optional=n==2)
 if t=='You may draw cards until you have 6 cards in your hand.':return E('chooseOption',options=[{'label':'Draw until you have 6 cards','effect':E('drawToHandSize',size=6)},{'label':'Do not draw','effect':E('noop')}])
 if t=="Discard a Grass Energy from your opponent's Active Pokémon.":return discard(1,'opponentActive',energyType='Grass',strictEnergyType=True,allowNoTarget=True)
 if t=='Put up to 2 Pokémon from your discard pile into your hand.':return E('searchChosen',source='discard',amount=2,filter={'kind':'pokemon'},optional=True)
 if t=='Search your deck for a Fire Energy card and attach it to 1 of your Pokémon. Then, shuffle your deck.':return E('sm7Rule',rule='sm9SearchAttach',amount=1,energyTypes=['Fire'])
 if t=='Attach a basic Energy card from your discard pile to 1 of your Benched Pokémon.':return E('attachEnergyFromDiscard',target='selfBench',amount=1,basicEnergy=True)
 if t=="During your next turn, this Pokémon's attacks do 90 more damage to your opponent's Active Pokémon (before applying Weakness and Resistance).":return E('nextAttackBonus',attackName='*',amount=90)
 if t=='Attach a Water Energy card from your hand to this Pokémon.':return E('attachEnergy',source='hand',target='self',amount=1,energyType='Water')
 if t=="This attack does 20 damage for each of your Benched Pokémon that has the Let's All Rollout attack.":return E('fieldCountDamage',side='self',benchOnly=True,filter={'attackName':"Let's All Rollout"},amount=20,mode='replace')
 if t=="Your opponent reveals their hand.":return E('revealHand',side='opponent')
 if t=='Your opponent reveals their hand. This attack does 60 damage for each Supporter card you find there.':return seq(E('filteredHandCountDamage',side='opponent',filter={'kind':'trainer','trainerType':'Supporter'},amount=60,mode='replace'),E('revealHand',side='opponent'))
 if t=="This attack does 10 more damage for each damage counter on your opponent's Active Pokémon.":return E('damageFromDamage',source='opponent',amount=1,mode='add')
 if t=='Flip a coin. If tails, this Pokémon also does 10 damage to itself.':return E('coinFlip',tails=E('selfDamage',amount=10))
 m=re.fullmatch(r"This attack does (\d+) damage to 1 of your opponent's (Benched Pokémon|Pokémon)\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)",t)
 if m:return E('selectedDamage',target='opponentBench' if m[2]=='Benched Pokémon' else 'opponentPokemon',amount=int(m[1]))
 if t=='Search your deck for up to 2 Water Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.':return E('searchChosen',amount=2,filter={'kind':'energy','basicEnergy':True,'subtype':'Water'},optional=True)
 if t=="This attack's damage isn't affected by Weakness or Resistance.":return E('damageRule',ignoreWeakness=True,ignoreResistance=True)
 if t=='Search your deck for up to 2 cards and put them into your hand. Then, shuffle your deck.':return E('searchChosen',amount=2,filter={},optional=True)
 if t=='This attack does 30 damage for each of your Fusion Strike Pokémon in play.':return E('fieldCountDamage',side='self',filter={'tag':'fusion-strike'},amount=30,mode='replace')
 if t=='Put a card from your discard pile into your hand.':return E('searchChosen',source='discard',amount=1,filter={})
 if t=="If your opponent's Active Pokémon is a Pokémon V, this attack does 60 more damage.":return bonus(60,cond('opponentMatches',filter={'tag':'pokemon-v'}))
 if t=='If your opponent has exactly 1 Prize card remaining, this attack does 160 more damage.':return bonus(160,cond('opponentPrizesRemaining',amount=1))
 if t=="Your opponent's Active Pokémon is now Poisoned. During Pokémon Checkup, put 4 damage counters on that Pokémon instead of 1.":return E('status',target='opponentActive',status='poison',amount=40)
 if t=="Discard a random card from your opponent's hand.":return E('discardHand',side='opponent',amount=1,random=True)
 if t=="Flip a coin. If heads, discard an Energy from your opponent's Active Pokémon.":return coin(discard(1,'opponentActive'))
 if t=='This attack does 30 damage for each damage counter on this Pokémon.':return E('damageFromDamage',source='self',amount=3,mode='replace')
 if t=="This attack does 30 damage for each Energy attached to your opponent's Active Pokémon.":return E('energyDamage',source='opponent',amount=30,mode='replace')
 if t=='Search your deck for a Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.':return E('searchChosen',amount=1,filter={'kind':'pokemon'})
 return None

def ability(row,a):
 t=a[2];e=_stage2_ability(row,a)
 if e is not None:return e
 if t=='This Pokémon takes 20 less damage from attacks (after applying Weakness and Resistance).':return passive(mod('damageReduction',20))
 if t=='The Retreat Cost of each of your Pokémon that has any Fire Energy attached is ColorlessColorless less.':return passive(E('modifier',stat='retreatCost',amount=-2,scope='team',duration='whileInPlay',filter={'hasEnergyType':'Fire'}))
 if t=='Once during your turn (before your attack), you may attach a Lightning Energy card from your discard pile to 1 of your Benched Pokémon.':return activated(E('attachEnergyFromDiscard',target='selfBench',energyType='Lightning',amount=1))
 return None

def trainer(row):
 t=row[13][0] if row[13] else ''
 if t=='You can use this card only if you discard another Item card from your hand. Flip a coin. If heads, search your deck for a card and put it into your hand. Then, shuffle your deck.':return 'Item',E('sm7Rule',rule='sm10Pay',amount=1,filter={'kind':'trainer','trainerType':'Item'},after=coin(E('searchChosen',amount=1,filter={})),trainer=True)
 for values,word in [([1,3,5],'1, 3, or 5'),([2,4,6],'2, 4, or 6')]:
  if t==f'Draw 2 cards. If your opponent has exactly {word} Prize cards remaining, draw 2 more cards.':return 'Supporter',seq(E('draw',amount=2),*[E('draw',amount=2,condition=cond('opponentPrizesRemaining',amount=n),optionalCondition=True) for n in values])
 return _stage2_trainer(row)

# Stage 4: complete print catalogue; use existing shared rules with exact text.
_stage3_attack=attack
_stage3_ability=ability
_stage3_trainer=trainer

def attack(row,a):
 t=a[3];e=_stage3_attack(row,a)
 if e is not None:return e
 if t=='Discard any number of Pokémon Tool cards from your hand. This attack does 50 damage for each card you discarded in this way.':return E('chooseDiscardForBonus',zone='hand',max=30,amount=50,filter={'kind':'trainer','trainerType':'Tool'})
 if t=='Discard up to 2 basic Energy cards from your hand. This attack does 60 damage for each card you discarded in this way.':return E('chooseDiscardForBonus',zone='hand',max=2,amount=60,filter={'kind':'energy','basicEnergy':True})
 if t=='Move an Energy from this Pokémon to 1 of your Benched Pokémon.':return E('moveEnergy',source='self',target='selfBench',amount=1)
 if t=='Move all Energy from this Pokémon to your Benched Pokémon in any way you like.':return E('distributeEnergy',source='self',target='selfBench',amount='all',includeSpecialEnergy=True)
 if t=='Attach a Fire Energy card from your discard pile to this Pokémon.':return E('attachEnergyFromDiscard',target='self',energyType='Fire',amount=1)
 if t=='Put an Energy attached to this Pokémon into your hand.':return E('sm7Rule',rule='swsh1ReturnAttachments',target='self',left=1)
 if t=='Put all Energy attached to this Pokémon into your hand.':return E('sm2Rule',rule='loopTheLoop')
 if t=='Put all Energy attached to this Pokémon into your hand. This attack does 100 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)':return seq(E('sm2Rule',rule='loopTheLoop'),E('selectedDamage',target='opponentBench',amount=100))
 if t=="Discard all Pokémon Tools from all of your opponent's Pokémon.":return E('discardTool',target='opponentAll',amount='all')
 if t=="Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon.":return E('discardTool',target='opponentActive',amount='all',timing='beforeDamage')
 if t=="If this Pokémon evolved from Eelektrik during this turn, your opponent's Active Pokémon is now Paralyzed.":return E('status',target='opponentActive',status='paralysis',condition=cond('evolvedThisTurn'))
 if t=="Discard 2 Lightning Energy from this Pokémon. This attack does 200 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(discard(2,energyType='Lightning',strictEnergyType=True),E('selectedDamage',target='opponentPokemon',amount=200))
 m=re.fullmatch(r"During your opponent's next turn, the Defending Pokémon's attacks do (\d+) less damage \(before applying Weakness and Resistance\)\.",t)
 if m:return E('modifier',stat='attackDamage',amount=-int(m[1]),target='opponentActive',duration='opponentTurn')
 if t=="You may choose to make your opponent's Active Pokémon Paralyzed. If you do, this Pokémon also does 70 damage to itself.":return E('chooseOption',options=[{'label':'Paralyze and take 70 damage','effect':seq(status('paralysis'),E('selfDamage',amount=70))},{'label':'Skip paralysis','effect':E('noop')}])
 if t=="During your opponent's next turn, the Defending Pokémon's attacks cost Colorless more, and its Retreat Cost is Colorless more.":return seq(E('modifier',stat='attackCostColorless',amount=1,target='opponentActive',duration='opponentTurn'),E('modifier',stat='retreatCost',amount=1,target='opponentActive',duration='opponentTurn'))
 if t=="Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. The new Active Pokémon is now Asleep.":return E('sequence',condition=cond('benchAtLeast',side='opponent',amount=1),effects=[E('forceOpponentSwitch',chooseBy='attacker'),status('sleep')])
 if t=="This attack does 30 more damage for each Energy attached to your opponent's Active Pokémon.":return E('energyDamage',source='opponent',amount=30,mode='add')
 if t=="If your opponent's Active Pokémon is a Basic Pokémon, it is Knocked Out.":return E('knockOut',target='opponentActive',condition=cond('opponentMatches',filter={'stage':'Basic'}))
 if t=='This attack does 20 damage for each damage counter on this Pokémon.':return E('damageFromDamage',source='self',amount=2,mode='replace')
 m=re.fullmatch(r"This attack also does (\d+) damage to each of your Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)",t)
 if m:return E('benchDamage',side='self',all=True,amount=int(m[1]))
 if t=="Put damage counters on your opponent's Active Pokémon until its remaining HP is 60.":return E('setRemainingHp',target='opponentActive',amount=60)
 if t=="Choose 1 of your opponent's Active Pokémon's attacks. During your opponent's next turn, that Pokémon can't use that attack.":return E('chooseAttackLock',duration='opponentTurn')
 if t=="If your opponent's Active Pokémon already has any damage counters on it, this attack does 90 more damage.":return bonus(90,cond('opponentDamaged'))
 if t=="Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. This attack does 30 damage to the new Active Pokémon.":return E('sequence',condition=cond('benchAtLeast',side='opponent',amount=1),effects=[E('forceOpponentSwitch',chooseBy='attacker'),E('damage',target='opponentActive',amount=30)])
 if t=="If your opponent's Active Pokémon is a Fire Pokémon, it is now Paralyzed.":return E('status',target='opponentActive',status='paralysis',condition=cond('opponentMatches',filter={'subtype':'Fire'}))
 if t=="During your opponent's next turn, prevent all damage done to this Pokémon by attacks from Pokémon that have an Ability.":return E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'hasAbility':True})
 if t=="During your opponent's next turn, prevent all damage done to this Pokémon by attacks from Pokémon VMAX.":return E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'stage':'VMAX'})
 if t=='Discard 2 Energy from this Pokémon.':return discard(2)
 if t=="During your opponent's next turn, if this Pokémon is damaged by an attack (even if it is Knocked Out), put 8 damage counters on the Attacking Pokémon.":return E('retaliateDamage',target='self',duration='opponentTurn',amount=80,sm10Counters=True)
 # Pokémon and Supporter union: kind and trainerType cannot express an OR across fields.
 return None

def ability(row,a):
 t=a[2];e=_stage3_ability(row,a)
 if e is not None:return e
 def evo(effect):return {'type':'triggered','event':'evolved','fromHandOnly':True,'effect':effect}
 if t=="When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may make your opponent's Active Pokémon Burned, Confused, and Poisoned.":return evo(E('chooseOption',options=[{'label':'Apply all three conditions','effect':seq(status('burn'),status('confusion'),status('poison'))},{'label':'Skip','effect':E('noop')}]))
 if t=='When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you must flip a coin. If heads, discard the top 5 cards of your opponent\'s deck. If tails, discard the top 5 cards of your deck.':return evo(E('coinFlip',heads=E('discardTop',side='opponent',amount=5),tails=E('discardTop',side='self',amount=5)))
 if t=='When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, you may put up to 2 Pokémon Tool cards from your discard pile into your hand.':return evo(E('searchChosen',source='discard',amount=2,filter={'kind':'trainer','trainerType':'Tool'},optional=True))
 if t=='If this Pokémon would be Knocked Out by damage from an attack, flip a coin. If heads, this Pokémon is not Knocked Out, and its remaining HP becomes 10.':return passive(E('koGuard',mode='surviveCoin',remainingHp=10,attackOnly=True))
 if t=="Your opponent's Single Strike Pokémon's attacks cost Colorless more.":return passive(E('modifier',stat='attackCostColorless',scope='opponentTeam',filter={'tag':'single-strike'},amount=1,duration='whileInPlay'))
 return None
