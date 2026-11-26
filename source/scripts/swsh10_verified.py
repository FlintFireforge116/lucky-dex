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

# Stage two: reusable effect paths, with unresolved cards left gated.
from sm7_verified import passive
_stage1_attack=attack
_stage1_ability=ability
_stage1_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=='If you have more cards in your hand than your opponent, this attack does 80 more damage.':return bonus(80,cond('sm8MoreHand'))
 if t=='This attack does 70 damage for each damage counter on this Pokémon.':return E('damageFromDamage',source='self',amount=7,mode='replace')
 if t=='Flip a coin. If tails, this Pokémon also does 60 damage to itself. If heads, this attack does 60 more damage.':return E('coinFlip',heads=E('bonusDamage',amount=60),tails=E('selfDamage',amount=60))
 if t=="If any of your Pokémon were Knocked Out by damage from an attack from your opponent's Pokémon during their last turn, this attack does 90 more damage, and your opponent's Active Pokémon is now Confused.":return seq(bonus(90,cond('koByOpponentAttackLastTurn')),E('status',target='opponentActive',status='confusion',condition=cond('koByOpponentAttackLastTurn')))
 if t=="Discard 2 Energy from this Pokémon. This attack does 90 damage to 2 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(discard(2),E('multiTargetDamage',target='opponentPokemon',amount=90,count=2,activeWeaknessResistance=True))
 if t=='Your opponent reveals their hand. Discard a Trainer card you find there.':return seq(E('revealHand',side='opponent'),E('discardChosenHand',side='opponent',selectBy='attacker',amount=1,filter={'kind':'trainer'},allowEmptyAttack=True))
 if t=="Discard 2 Energy from this Pokémon. Your opponent's Active Pokémon is now Paralyzed.":return seq(discard(2),status('paralysis'))
 if t=='Put a Trainer card from your discard pile into your hand.':return E('searchChosen',source='discard',amount=1,filter={'kind':'trainer'})
 if t=="Discard 2 Lightning Energy from this Pokémon. This attack does 120 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(discard(2,energyType='Lightning',strictEnergyType=True),E('selectedDamage',target='opponentBench',amount=120))
 if t=='If you have the same number of cards in your hand as your opponent, this attack does 80 more damage.':return bonus(80,cond('handSizesEqual'))
 m=re.fullmatch(r'If your Benched Pokémon have any damage counters on them, this attack does (\d+) more damage\.',t)
 if m:return bonus(int(m[1]),cond('selfBenchDamaged'))
 if t=='This attack does 30 more damage for each Darkness Energy attached to all of your Pokémon.':return E('energyDamage',source='self',all=True,energyType='Darkness',countProvidedType=True,amount=30,mode='add')
 if t=='Shuffle up to 3 Metal Energy cards from your discard pile into your deck.':return E('sm7Rule',rule='sm9Recycle',amount=3,filter={'kind':'energy','subtype':'Metal'},includeBasicLedger=True,ledgerEnergyType='Metal',optional=True)
 if t=="This attack does 50 less damage for each Colorless in your opponent's Active Pokémon's Retreat Cost.":return E('retreatCostDamage',amount=50,mode='add',negative=True)
 if t=='Attach up to 2 Metal Energy cards from your discard pile to this Pokémon.':return E('sm7Rule',rule='sm12DiscardAttach',left=2,energyType='Metal',sourceSelf=True,optional=True)
 return _stage1_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=="During your turn, you may attach up to 3 Water Energy cards from your discard pile to your Water Pokémon in any way you like. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('sm7Rule',rule='sm12DiscardAttach',left=3,energyType='Water',targetType='Water',optional=True),vstarPower=True)
 if t=="During your turn, you may put up to 2 Item cards from your discard pile into your hand. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('searchChosen',source='discard',amount=2,filter={'kind':'trainer','trainerType':'Item'},optional=True),vstarPower=True)
 if t=='You must discard an Energy card from your hand in order to use this Ability. Once during your turn, you may draw 2 cards.':return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={'kind':'energy'},after=E('draw',amount=2)))
 if t=='Once during your turn, you may search your deck for a Supporter card, reveal it, and put it into your hand. Then, shuffle your deck.':return activated(E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Supporter'},optional=True))
 if t=='Once during your turn, you may draw a card.':return activated(E('draw',amount=1))
 if t=="As long as this Pokémon is on your Bench, your Pokémon's attacks do 30 more damage to your opponent's Active Pokémon VMAX (before applying Weakness and Resistance).":return dict(type='passive',benchOnly=True,effect=E('modifier',stat='attackDamageActiveOnly',amount=30,scope='team',duration='whileInPlay',opponentFilter={'tag':'pokemon-vmax'}))
 if t=="Prevent all damage done to this Pokémon by attacks from your opponent's Fire Pokémon.":return passive(E('modifier',stat='damageReduction',amount=999,scope='self',duration='whileInPlay',opponentFilter={'subtype':'Fire'}))
 return _stage1_ability(row,a)
def trainer(row):
 t=row[13][0]
 if t=='You can use this card only if you discard 2 Metal Energy cards from your hand. Search your deck for up to 2 cards and put them into your hand. Then, shuffle your deck.':return 'Supporter',E('sm7Rule',rule='sm10Pay',amount=2,filter={'kind':'energy','basicEnergy':True,'subtype':'Metal'},after=E('searchChosen',amount=2,filter={},optional=True))
 if t=="Pokémon with a Rule Box in play (both yours and your opponent's) have no Abilities. (Pokémon V, Pokémon-GX, etc. have Rule Boxes.)":return 'Stadium',E('sm7Rule',rule='swsh6Path')
 return _stage1_trainer(row)

# Stage three: full printed signatures, including alternate prints.
_stage2_attack=attack
_stage2_ability=ability
_stage2_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=="This attack does 20 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) Switch this Pokémon with 1 of your Benched Pokémon.":return seq(E('bonusDamage',amount=20),E('benchDamage',side='opponent',all=True,amount=20),E('switch',target='self',optional=False))
 if t=='If a Stadium is in play, this attack does 120 more damage. Then, discard that Stadium.':return seq(bonus(120,cond('stadiumInPlay')),E('discardStadium',condition=cond('stadiumInPlay')))
 if t=="Choose a random card from your opponent's hand. Your opponent reveals that card and shuffles it into their deck.":return E('shuffleRandomHandCard',side='opponent',amount=1,reveal=True)
 if t=="This attack does 30 damage for each damage counter on your opponent's Active Pokémon.":return E('damageFromDamage',source='opponent',amount=3,mode='replace')
 if t=="This attack does 80 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('selectedDamage',target='opponentPokemon',amount=80,activeWeaknessResistance=True)
 if t=="Flip 2 coins. If both of them are heads, your opponent's Active Pokémon is Knocked Out.":return E('allHeadsEffect',coins=2,heads=E('knockOut',target='opponentActive'))
 if t=='If you have at least 3 Darkness Energy in play, this attack does 90 more damage.':return bonus(90,cond('swsh10FieldEnergyAtLeast',energyType='Darkness',amount=3))
 if t=="If your opponent's Active Pokémon already has any damage counters on it, this attack does 110 more damage.":return bonus(110,cond('opponentDamaged'))
 if t=="Flip a coin. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon.":return coin(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True))
 if t=='Your opponent reveals their hand.':return E('revealHand',side='opponent')
 if t=='Flip a coin. If heads, put an Item card from your discard pile into your hand.':return coin(E('searchChosen',source='discard',amount=1,filter={'kind':'trainer','trainerType':'Item'}))
 if t=='Put up to 2 cards from your discard pile into your hand.':return E('searchChosen',source='discard',amount=2,filter={},optional=True)
 if t=="This attack does 20 more damage for each of your opponent's Benched Pokémon.":return E('benchCountDamage',side='opponent',amount=20,mode='add')
 if t=="This attack does 50 more damage for each Energy attached to your opponent's Active Pokémon.":return E('energyDamage',source='opponent',amount=50,mode='add',countSpecial=True)
 if t=="Put 2 damage counters on 1 of your opponent's Benched Pokémon.":return E('placeDamageCounters',target='opponentBench',amount=20)
 return _stage2_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=='Once during your turn, if you have a Stadium in play, you may heal 50 damage from this Pokémon.':return activated(E('healSelf',amount=50,condition=cond('ownStadiumInPlay')))
 if t=='This Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).':return passive(E('modifier',stat='damageReduction',amount=30,scope='self',duration='whileInPlay'))
 if t=="As long as this Pokémon is on your Bench, your Active Pokémon's Retreat Cost is ColorlessColorless less.":return dict(type='passive',benchOnly=True,effect=E('modifier',stat='retreatCost',amount=-2,scope='active',duration='whileInPlay'))
 if t=="If your opponent has any Pokémon VMAX in play, this Pokémon's attacks cost ColorlessColorlessColorless less.":return passive(E('modifier',stat='attackCostColorless',amount=-3,scope='self',duration='whileInPlay',condition=cond('pokemonPresent',side='opponent',zone='inPlay',filter={'tag':'pokemon-vmax'})))
 if t=="During your turn, you may put 4 damage counters on 1 of your opponent's Pokémon. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('chooseTarget',target='opponentPokemon',forceChoose=True,effect=E('placeDamageCounters',target='opponentPokemon',amount=40)),vstarPower=True)
 if t=="Once during your turn, if this Pokémon is in the Active Spot, you may draw cards until you have 4 cards in your hand. You can't use more than 1 Dragon's Hoard Ability each turn.":return activated(E('drawToHandSize',size=4),activeOnly=True,sharedOncePerTurn='Dragon\'s Hoard')
 if t=="Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon V.":return passive(E('preventDamage',target='self',duration='whileInPlay',attackerFilter={'tag':'pokemon-v'}))
 if t=='Once during your turn, if this Pokémon is in the Active Spot, you may search your deck for up to 2 Pokémon Tool cards, reveal them, and put them into your hand. Then, shuffle your deck.':return activated(E('searchChosen',amount=2,filter={'kind':'trainer','trainerType':'Tool'},optional=True),activeOnly=True)
 return _stage2_ability(row,a)
def trainer(row):
 t=row[13][0]
 if t=='Draw cards until you have 1 more card in your hand than your opponent.':return 'Supporter',E('drawToHandSize',matchSide='opponent',offset=1)
 if t=='You can use this card only if your opponent has 3 or fewer Prize cards remaining. Each player shuffles their hand into their deck. Then, you draw 6 cards, and your opponent draws 2 cards.':return 'Supporter',E('handShuffle',side='both',draw=6,opponentDraw=2,condition=cond('swsh10OpponentPrizesAtMost',amount=3))
 return _stage2_trainer(row)

# Stage four: complete source projection; reuse effect descriptors, not guessed text.
_stage3_attack=attack
_stage3_ability=ability
_stage3_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=="This attack does 50 damage to 1 of your opponent's Pokémon for each of your Beedrill V in play. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('selectedEnergyDamage',target='opponentPokemon',source='self',amount=50,fieldFilter={'name':'Beedrill V'})
 if t=='You can use this attack only if you go second, and only during your first turn. Search your deck for up to 3 cards and put them into your hand. Then, shuffle your deck.':return seq(E('attackRequirement',condition=cond('sm7FirstSecond')),E('searchChosen',amount=3,filter={},optional=True))
 if t=="During your opponent's next turn, prevent all damage done to this Pokémon by attacks from Evolution Pokémon.":return E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'evolved':True})
 if t=="Put 3 damage counters on your opponent's Benched Pokémon in any way you like.":return E('sm7Rule',rule='sm10CounterSpread',amount=3,benchOnly=True)
 if t=="If your opponent's Active Pokémon has exactly 4 damage counters on it, that Pokémon is Knocked Out. (You can't use more than 1 VSTAR Power in a game.)":return E('knockOut',target='opponentActive',condition=cond('swsh10OpponentDamageExact',amount=40))
 if t=='If your opponent has 3 or fewer cards in their hand, this attack does nothing.':return E('attackRequirement',allowWhenFailed=True,condition=cond('swsh10OpponentHandAtLeast',amount=4))
 if t=='You may discard up to 3 Energy cards from your hand. This attack does 30 more damage for each card you discarded in this way.':return E('chooseDiscardForBonus',zone='hand',max=3,amount=30,filter={'kind':'energy'})
 if t=='This attack does 20 more damage for each Energy attached to all of your Pokémon.':return E('energyDamage',source='self',all=True,amount=20,mode='add')
 if t=="Discard 3 Energy from this Pokémon. This attack does 220 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)":return seq(discard(3),E('selectedDamage',target='opponentPokemon',amount=220,activeWeaknessResistance=True))
 if t=='This attack does 30 more damage for each damage counter on all of your Benched Pawniard.':return E('damageFromDamage',source='self',all=True,benchOnly=True,filter={'name':'Pawniard'},amount=3,mode='add')
 if t=='This attack does 40 more damage for each Metal Energy attached to this Pokémon.':return E('energyDamage',source='self',energyType='Metal',countProvidedType=True,amount=40,mode='add')
 return _stage3_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=="Your Grass Pokémon in play, except any Kricketune, get +40 HP. You can't apply more than 1 Swelling Tune Ability at a time.":return passive(E('modifier',stat='maxHp',amount=40,scope='team',duration='whileInPlay',filter={'subtype':'Grass','notName':'Kricketune'},nonStacking=True))
 if t=="You must discard a Psychic Energy card from your hand in order to use this Ability. Once during your turn, you may make your opponent's Active Pokémon Burned and Confused.":return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={'kind':'energy','subtype':'Psychic'},after=seq(status('burn'),status('confusion'))))
 if t=='If this Pokémon has any damage counters on it, it has no Retreat Cost.':return passive(E('modifier',stat='retreatCost',amount=-999,scope='self',duration='whileInPlay',condition=cond('selfDamaged')))
 if t=="During your turn, you may draw cards until you have 8 cards in your hand. (You can't use more than 1 VSTAR Power in a game.)":return activated(E('drawToHandSize',size=8),vstarPower=True)
 if t=='You must discard a card from your hand in order to use this Ability. Once during your turn, you may draw 3 cards.':return activated(E('sm7Rule',rule='sm10Pay',amount=1,filter={},after=E('draw',amount=3)))
 if t=="Your Pokémon take 30 less damage from attacks from your opponent's Pokémon V (after applying Weakness and Resistance).":return passive(E('modifier',stat='damageReduction',amount=30,scope='team',duration='whileInPlay',opponentFilter={'tag':'pokemon-v'}))
 if t=='Each of your Pokémon that has any Grass Energy attached to it can\'t be affected by any Special Conditions. (Remove any Special Conditions affecting those Pokémon.)':return passive(E('preventStatus',scope='team',duration='whileInPlay',clearExisting=True,filter={'hasEnergyType':'Grass'}))
 return _stage3_ability(row,a)
def trainer(row):
 t=row[13][0]
 if t=='Search your deck for a Pokémon that has no Retreat Cost, reveal it, and put it into your hand. Then, shuffle your deck.':return 'Item',E('searchChosen',amount=1,filter={'kind':'pokemon','retreat':0})
 if t=="Once during each player's turn, that player may shuffle their hand into their deck and draw 5 cards. If they do, their turn ends.":return 'Stadium',E('stadiumAction',effect=seq(E('handShuffle',side='self',draw=5),E('endTurn')))
 if t=='All Special Energy attached to Pokémon (both yours and your opponent\'s) provide Colorless Energy and have no other effect.':return 'Stadium',E('noop') # continuous stadium suppression hook
 if t=="Look at the top card of your deck. You may put that card into your hand. If you don't, discard that card and draw a card.":return 'Item',E('sm7Rule',rule='swsh10TrekkingShoes')
 return _stage3_trainer(row)

# Stage five: exact-text shared Trainer and attack handlers.
_stage4_attack=attack
_stage4_ability=ability
_stage4_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=="Discard an Energy from this Pokémon. If you do, discard an Energy from your opponent's Active Pokémon.":return E('sm7Rule',rule='sm12Kindle')
 if t=="Discard up to 2 Pokémon Tools from your opponent's Pokémon.":return E('sm7Rule',rule='swsh2ToolScrapper',left=2,opponentOnly=True)
 if t=='This attack does 30 damage for each Pokémon in your discard pile. (You can\'t use more than 1 VSTAR Power in a game.)':return E('discardCountDamage',filter={'kind':'pokemon'},amount=30,mode='replace')
 if t=='You may put an Energy attached to this Pokémon into your hand. If you do, this attack does 100 more damage.':return E('sm7Rule',rule='swsh8Spiral',bonus=100)
 return _stage4_attack(row,a)
def ability(row,a):
 t=a[2]
 if t=='During your turn, you may search your deck for up to 5 in any combination of Grass Pokémon and Grass Energy cards, reveal them, and put them into your hand. Then, shuffle your deck. (You can\'t use more than 1 VSTAR Power in a game.)':return activated(E('searchChosen',amount=5,optional=True,filter={'anyOf':[{'kind':'pokemon','subtype':'Grass'},{'kind':'energy','subtype':'Grass'}]}),vstarPower=True)
 return _stage4_ability(row,a)
def trainer(row):
 t=row[13][0]
 if t=="Until the end of your turn, your opponent's Active Pokémon has no Abilities. (This includes Pokémon that come into play during that turn.)":return 'Item',E('sm7Rule',rule='swsh10Cologne')
 if t=='Flip 2 coins. Put a number of cards up to the number of heads from your discard pile on top of your deck in any order.':return 'Supporter',E('sm7Rule',rule='swsh10Cyllene')
 if t=='Draw 2 cards. If you drew any cards in this way, attach up to 2 Grass Energy cards from your hand to 1 of your Benched Pokémon.':return 'Supporter',E('sm7Rule',rule='swsh10Gardenia')
 if t=='Choose a card in your hand, and discard the other cards. If you do, draw 4 cards. (If you have no other cards in your hand, you can\'t use this card.)':return 'Supporter',E('sm7Rule',rule='swsh10Kamado')
 if t=='Choose 1 of your Pokémon, and then flip a coin until you get tails. For each heads, heal 40 damage from that Pokémon.':return 'Item',E('chooseTarget',target='selfPokemon',forceChoose=True,filter={'damaged':True},effect=E('coinUntilTails',effect=E('heal',target='selfPokemon',amount=40)))
 if t=='Switch your Active Basic Pokémon with 1 of your Benched Pokémon. If you do, heal 30 damage from the Pokémon you moved to your Bench.':return 'Item',E('sm7Rule',rule='swsh10SwitchCart')
 if t=='Play this card as if it were a 60-HP Basic Colorless Pokémon. At any time during your turn, you may discard this card from play. This card can\'t retreat.':return 'Item',E('playFossil',hp=60,subtype='Colorless',canRetreat=False)
 if t=='You can use this card only if you go second, and only during your first turn. Search your deck for a basic Energy card and attach it to 1 of your Pokémon. Then, shuffle your deck. Your turn ends.':return 'Item',E('sm7Rule',rule='swsh10WaitTurbo',condition=cond('sm7FirstSecond'))
 return _stage4_trainer(row)

# Stage six: reuse the verified extra-turn lifecycle and selected-target paths.
_stage5_attack=attack
def attack(row,a):
 t=a[3]
 if t=="Take another turn after this one. (Skip Pokémon Checkup.) (You can't use more than 1 VSTAR Power in a game.)":return E('sm5Rule',rule='timelessGX')
 if t=='Search your deck for up to 3 basic Energy cards of different types and attach them to your Pokémon in any way you like. Then, shuffle your deck.':return E('sm7Rule',rule='sm9SearchAttach',amount=3,distinctTypes=True)
 if t=='You can use this attack only if you go second, and only during your first turn. Choose up to 2 of your Benched Pokémon. For each of those Pokémon, search your deck for a basic Energy card and attach it to that Pokémon. Then, shuffle your deck.':return seq(E('attackRequirement',condition=cond('sm7FirstSecond')),E('sm7Rule',rule='sm9SearchAttach',amount=2,benchOnly=True,distinctTargets=True))
 if t=="This attack also does 60 damage to 1 of your opponent's Benched Pokémon V. (Don't apply Weakness and Resistance for Benched Pokémon.)":return E('benchDamage',side='opponent',amount=60,filter={'tag':'pokemon-v'})
 if t=='Your opponent reveals their hand. If they have 4 or more cards in their hand, choose all but 3, and your opponent shuffles the chosen cards into their deck.':return seq(E('revealHand',side='opponent'),E('sm7Rule',rule='swsh10OminousProse'))
 return _stage5_attack(row,a)

_stage5_ability=ability
def ability(row,a):
 t=a[2]
 if t=='Once during your turn, you may look at the top 6 cards of your deck and attach any number of Metal Energy cards you find there to your Pokémon in any way you like. Shuffle the other cards back into your deck.':return activated(E('sm7Rule',rule='sm9TopAttach',count=6,energyTypes=['Metal'],includeSpecial=False))
 return _stage5_ability(row,a)

_stage5_trainer=trainer
def trainer(row):
 t=row[13][0]
 if t=='Whenever either player puts a Basic Pokémon from their hand onto their Bench, put 2 damage counters on that Pokémon.':return 'Stadium',E('noop') # from-hand Basic placement hook
 return _stage5_trainer(row)

# Stage seven: selective reveal, bilateral discard recovery and matchup effects.
_stage6_attack=attack
_stage6_ability=ability
_stage6_trainer=trainer
def attack(row,a):
 t=a[3]
 if t=='Reveal any number of Sweet Honey cards from your hand. This attack does 60 damage for each card you revealed in this way.':return E('sm7Rule',rule='swsh10HoneyRush')
 if t=="Put a Basic Pokémon from either player's discard pile onto that player's Bench.":return E('sm7Rule',rule='swsh10BorneAshore')
 return _stage6_attack(row,a)
def ability(row,a):
 if a[2]=='If you have Uxie and Azelf in play, each of your Pokémon has no Weakness.':return passive(E('weaknessGuard',duration='whileInPlay',scope='team',condition=cond('pokemonPresentAll',names=['Uxie','Azelf'])))
 return _stage6_ability(row,a)
def trainer(row):
 t=row[13][0]
 if t=='Reveal the top card of your deck. If that card is a Fighting Energy card, attach it to 1 of your Benched Pokémon. If it is not a Fighting Energy card, put it into your hand.':return 'Item',E('sm7Rule',rule='swsh10Pickaxe')
 if t=="When applying Weakness to damage from the attacks of the Pokémon this card is attached to done to your opponent's Active Pokémon, apply it as ×3.":return 'Tool',E('weaknessMultiplier',multiplier=3)
 return _stage6_trainer(row)
