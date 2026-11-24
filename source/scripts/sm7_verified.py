"""Celestial Storm: full-text reuse and deliberately gated novel mechanics."""
from __future__ import annotations
from copy import deepcopy
from pathlib import Path
import json,re,subprocess
from xy8_verified import attack as generic_attack
ROOT=Path(__file__).resolve().parents[1]
E=lambda t,**kw:dict(type=t,**kw)
def norm(s):return re.sub(r'\s+',' ',str(s or '')).strip().casefold()
def attack_text(s):return norm(re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)\s*$','',s or '',flags=re.I))
def seq(*fx):return E('sequence',effects=list(fx))
def coin(fx,tails=None):return E('coinFlip',heads=fx,tails=tails or E('noop'))
def status(s):return E('status',target='opponentActive',status=s)
def bonus(a,cond):return E('bonusDamage',amount=a,condition=cond)
def cond(t,**kw):return E(t,**kw)
def activated(fx,**kw):return dict(type='activated',oncePerTurn=True,effect=fx,**kw)
def passive(fx,**kw):return dict(type='passive',effect=fx,**kw)
# Reuse only exact, fully implemented older prints. A descriptor with an
# expansion-specific rule or ID needs an explicitly reviewed override below.
JS="""const a='./app/src/main/assets/';const names=['sun-moon','guardians-rising','burning-shadows','crimson-invasion','ultra-prism','forbidden-light'];const cards=names.flatMap(n=>require(a+'tcg-classic-'+n+'.js').CARDS).filter(c=>c.battleEnabled);process.stdout.write(JSON.stringify(cards));"""
PRIOR=json.loads(subprocess.check_output(['node','-e',JS],cwd=ROOT,text=True))
PORTABLE={'actionLock','attachEnergy','attachEnergyFromDiscard','attackCoinGate','attackDamageGate','attackRequirement','benchCountDamage','benchDamage','benchFromDeck','benchFromDiscard','bonusDamage','chooseAttackLock','chooseDiscardForBonus','chooseOption','chooseTarget','coinAttackGate','coinDamage','coinDamageByEnergy','coinDamageStatus','coinFlip','coinTierBonus','damage','damageFromDamage','damageRule','discardCountDamage','discardEnergyCard','discardStadium','discardTop','distributeDiscardCounters','distributeDiscardEnergy','distributeEnergy','drain','draw','drawToHandSize','energyDamage','evolveFromDeck','fieldCountDamage','forceOpponentSwitch','handCountDamage','handShuffle','heal','healSelf','healingBlock','inspectTop','knockOut','lock','modifier','moveDamage','moveEnergy','multiTargetDamage','multiTargetHeal','nextAttackBonus','noop','placeDamageCounters','pointDamage','pointsGainedLastTurnDamage','preventDamage','redistributeEnergy','reorderTop','retaliateDamage','retreatCostDamage','returnOpponentBench','revealHand','searchChosen','selectedDamage','selectedEnergyDamage','selectedSelfBenchDamage','selfDamage','selfDamagePenalty','sequence','shuffleIntoDeck','shuffleRandomHandCard','status','statusCountDamage','switch','trimHand','preventEffects','evolutionTimingOverride','rareCandy','specialEnergy','recover'}
# Check every nested effect (condition/filter dictionaries are not effects).
# Set-local card references or bespoke rules must never be inherited silently.
def portable(fx):
 if not isinstance(fx,dict) or fx.get('type') not in PORTABLE:return False
 if re.search(r'"(?:sm\d+|xy\d+|bw\d+)-\d+[a-z]?"',json.dumps(fx)):return False
 if fx.get('rule'):return False
 for k in ('effects','heads','tails','effect','then','else'):
  val=fx.get(k)
  if isinstance(val,list) and any(not portable(x) for x in val):return False
  if isinstance(val,dict) and not portable(val):return False
 return True
ATTACKS={}; TEXTS={}; ABILITIES={}; TRAINERS={}
for c in PRIOR:
 for a in c.get('attacks',[]):
  f=a.get('effect'); t=attack_text(a.get('text')); d=a.get('damageText') or ''
  if t and portable(f) and f['type']!='noop':
   ATTACKS.setdefault((a['name'],t,d),[]).append(f)
   TEXTS.setdefault((t,d),[]).append(f)
 for a in c.get('abilities',[]):
  if portable(a.get('effect')):
   ABILITIES.setdefault((a['name'],norm(a.get('text'))),[]).append({k:v for k,v in a.items() if k not in ('name','text','printedPowerType','disabledByStatus')})
 if c.get('kind')=='trainer' and portable(c.get('effect')) and c['effect']['type']!='noop':
  TRAINERS.setdefault((c['name'],norm(c.get('text'))),[]).append((c['trainerType'],c['effect']))
def unique(items):
 if items and all(x==items[0] for x in items):return deepcopy(items[0])
 return None
# Explicit full-text overrides, not card-name-only mappings.
A={};B={};T={}
def add(text,fx):A[attack_text(text)]=fx
def ab(name,text,fx):B[(name,norm(text))]=fx
def tr(name,text,t,fx):T[(name,norm(text))]=(t,fx)
add('Your opponent\'s Active Pokémon is now Asleep and Poisoned.',seq(status('sleep'),status('poison')))
add('Flip a coin. If heads, your opponent\'s Active Pokémon is now Paralyzed and Poisoned.',coin(seq(status('paralysis'),status('poison'))))
add('Flip a coin. If heads, prevent all effects of attacks, including damage, done to this Pokémon during your opponent\'s next turn.',coin(E('preventDamage',target='self',duration='opponentTurn',preventEffects=True)))
add('Heal from this Pokémon the same amount of damage you did to your opponent\'s Active Pokémon.',E('sm5Rule',rule='gigaDrain'))
add('This Pokémon can\'t attack during your next turn.',E('lock',action='attack',target='self',duration='nextOwnTurn'))
add('Discard an Energy from this Pokémon.',E('discardEnergyCard',target='self',amount=1))
add('Discard 2 Fire Energy from this Pokémon.',E('discardEnergyCard',target='self',amount=2,energyType='Fire'))
add('If you have the same number of cards in your hand as your opponent, this attack does 90 more damage.',bonus(90,cond('handSizesEqual')))
add('This attack does 20 damage times the amount of Energy attached to all of your Pokémon.',E('energyDamage',source='self',all=True,amount=20,mode='replace'))
add('During your opponent\'s next turn, prevent all damage done to this Pokémon by attacks from Evolution Pokémon.',E('preventDamage',target='self',duration='opponentTurn',attackerFilter={'evolved':True}))
add('Switch 1 of your opponent\'s Benched Pokémon with their Active Pokémon. The new Active Pokémon is now Burned and Confused.',seq(E('forceOpponentSwitch',chooseBy='attacker'),status('burn'),status('confusion')))
add('Flip a coin. If heads, your opponent\'s Active Pokémon is now Paralyzed. If tails, your opponent\'s Active Pokémon is now Burned.',coin(status('paralysis'),status('burn')))
add('Heal all damage from this Pokémon.',E('healSelf',amount=9999))
add('This attack does 20 more damage times the amount of Water Energy attached to this Pokémon.',E('energyDamage',source='self',energyType='Water',amount=20,mode='add'))
add('This attack does 40 less damage for each damage counter on this Pokémon.',E('sm5Rule',rule='loomOver',amount=40)) # reviewed separately; omit unless engine supports parameter
A.pop(attack_text('This attack does 40 less damage for each damage counter on this Pokémon.'))
add('If your opponent\'s Active Pokémon is a Basic Pokémon, this attack does 80 more damage.',bonus(80,cond('opponentMatches',filter={'stage':'Basic'})))
add('Choose a random card from your opponent\'s hand. Your opponent reveals that card and shuffles it into their deck.',E('shuffleRandomHandCard',side='opponent',amount=1))
add('This attack does 50 more damage for each Special Condition affecting your opponent\'s Active Pokémon.',E('statusCountDamage',source='opponent',amount=50,mode='add'))
add('This attack does 50 damage for each of your Evolution Dragon Pokémon in play.',E('fieldCountDamage',side='self',filter={'subtype':'Dragon','evolved':True},amount=50,mode='replace'))
ab('Evolutionary Advantage','If you go second, this Pokémon can evolve during your first turn.',passive(E('evolutionTimingOverride',firstTurn=True)))
ab('Poison Payback',"If this Pokémon is your Active Pokémon and is damaged by an opponent's attack (even if this Pokémon is Knocked Out), the Attacking Pokémon is now Poisoned.",{'type':'triggered','event':'damagedByAttack','activeOnly':True,'opponentAttackOnly':True,'effect':E('sm6Rule',rule='poisonPoint')})
ab('Fragrance Trap',"Once during your turn (before your attack), you may flip a coin. If heads, switch 1 of your opponent's Benched Pokémon with their Active Pokémon.",activated(coin(E('forceOpponentSwitch',chooseBy='attacker'))))
ab('Aqua Lift','If this Pokémon has any Water Energy attached to it, it has no Retreat Cost.',passive(E('modifier',stat='retreatCost',amount=-999,scope='self',duration='whileInPlay',condition=cond('selfHasEnergyType',energyType='Water'))))
ab('Floating Electrons','If this Pokémon has any Energy attached to it, it has no Retreat Cost.',passive(E('modifier',stat='retreatCost',amount=-999,scope='self',duration='whileInPlay',condition=cond('selfMatches',filter={'hasAnyEnergy':True}))))
ab('Swing Dance','Once during your turn (before your attack), you may draw a card.',activated(E('draw',amount=1)))
# Exact rule string from the previous tested print, excluding generic Trainer footer.
for name,rule,kind,fx in [
 ('Energy Switch','Move a basic Energy from 1 of your Pokémon to another of your Pokémon.','Item',E('sm1Rule',rule='energySwitch')),
 ('Super Scoop Up','Flip a coin. If heads, put 1 of your Pokémon and all cards attached to it into your hand.','Item',E('neoRule',rule='hgss2:83:superScoopUp')),
 ('Hau','Draw 3 cards.','Supporter',E('draw',amount=3)),
 ('Switch','Switch your Active Pokémon with 1 of your Benched Pokémon.','Item',E('switch',side='self')),
 ('Apricorn Maker','Search your deck for up to 2 Item cards that have the word "Ball" in their name, reveal them, and put them into your hand. Then, shuffle your deck.','Supporter',E('searchChosen',amount=2,filter={'kind':'trainer','trainerType':['Item','Tool'],'nameContains':'Ball'})),
 ('Fisherman','Put 4 basic Energy cards from your discard pile into your hand.','Supporter',E('searchChosen',amount=4,source='discard',filter={'kind':'energy','basicEnergy':True})),
 ('Lisia','Search your deck for up to 2 ◇ (Prism Star) cards, reveal them, and put them into your hand. Then, shuffle your deck.','Supporter',E('searchChosen',amount=2,filter={'prismStar':True})),
]:tr(name,rule,kind,fx)

add("During your opponent's next turn, prevent all damage done to this Pokémon by attacks if that damage is 40 or less.",E('preventDamage',target='self',duration='opponentTurn',maxDamage=40))
add('This attack does 40 less damage for each damage counter on this Pokémon.',E('selfDamagePenalty',amount=4,mode='add'))
add('This attack does 10 more damage for each other Pokémon in play (both yours and your opponent\'s).',seq(E('benchCountDamage',side='both',amount=10,mode='add'),E('bonusDamage',amount=10)))
add('Flip a coin until you get tails. For each heads, heal 50 damage from this Pokémon.',E('coinUntilTails',effect=E('healSelf',amount=50)))
add('Shuffle your hand into your deck. Then, draw a card for each Benched Pokémon (both yours and your opponent\'s).',E('handShuffle',draw='bothBenchCount'))
add("If, before doing damage, your opponent's Active Pokémon has less remaining HP than this Pokémon, this attack does 80 more damage.",bonus(80,cond('opponentHpLess')))
add("This attack does 20 more damage times the amount of Energy attached to your opponent's Active Pokémon.",E('energyDamage',source='opponent',amount=20,mode='add'))
for n in [10,30,40]:
 add(f"During your opponent's next turn, this Pokémon takes {n} less damage from attacks (after applying Weakness and Resistance).",E('modifier',stat='damageReduction',amount=n,scope='self',duration='opponentTurn'))
add('This attack does 10 more damage for each damage counter on this Pokémon.',E('damageFromDamage',source='self',amount=1,mode='add'))
add("If this Pokémon's remaining HP is 30 or less, this attack does 160 more damage.",bonus(160,cond('selfRemainingHpAtMost',amount=30)))
add("This attack does 40 damage for each Steven's Resolve card in your discard pile.",E('discardCountDamage',filter={'kind':'trainer','name':"Steven's Resolve"},amount=40,mode='replace'))
add('If this Pokémon has a Pokémon Tool card attached to it, this attack does 20 more damage.',bonus(20,cond('selfHasTool')))
add("If your opponent's Active Pokémon is an Evolution Pokémon, this attack does 100 more damage.",bonus(100,cond('opponentMatches',filter={'evolved':True})))
add("If your opponent's Active Pokémon has an Ability, this attack does 60 more damage.",bonus(60,cond('opponentMatches',filter={'hasAbility':True})))
add("If your opponent has exactly 6 Prize cards remaining, this attack does 90 more damage.",bonus(90,cond('opponentPrizesRemaining',amount=6)))
add('This attack does 50 more damage for each Prize card you have taken.',E('pointDamage',side='self',prizesTaken=True,amount=50,mode='add'))
add("Heal all damage from this Pokémon. It can't attack during your next turn.",seq(E('healSelf',amount=9999),E('lock',action='attack',target='self',duration='nextOwnTurn')))
add("Discard an Energy from this Pokémon. It can't attack during your next turn.",seq(E('discardEnergyCard',target='self',amount=1),E('lock',action='attack',target='self',duration='nextOwnTurn')))
add('Your opponent switches their Active Pokémon with 1 of their Benched Pokémon.',E('forceOpponentSwitch',chooseBy='defender'))
add('This attack does 30 damage to 2 of your opponent\'s Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)',E('multiTargetDamage',target='opponentPokemon',amount=30,count=2))
add('Flip a coin. If heads, if this Pokémon would be Knocked Out by damage from an attack during your opponent\'s next turn, it is not Knocked Out, and its remaining HP becomes 10.',coin(E('koGuard',mode='survive',target='self',duration='opponentTurn',remainingHp=10)))
ab('Exoskeleton','This Pokémon takes 20 less damage from attacks (after applying Weakness and Resistance).',passive(E('modifier',stat='damageReduction',amount=20,scope='self',duration='whileInPlay')))
ab('Danger Perception',"If this Pokémon's remaining HP is 100 or less, its attacks do 80 more damage to your opponent's Active Pokémon (before applying Weakness and Resistance).",passive(E('modifier',stat='attackDamage',amount=80,scope='self',duration='whileInPlay',condition=cond('selfRemainingHpAtMost',amount=100))))
tr('Copycat',"Shuffle your hand into your deck. Then, draw a card for each card in your opponent's hand.",'Supporter',E('handShuffle',draw='opponentHandCount'))

# SM7 continuation: full printed-text mappings; staged choices share the SM7 handler.
R=lambda rule,**kw:E('sm7Rule',rule=rule,**kw)
add("You may switch 1 of your opponent's Benched Pokémon with their Active Pokémon. Your opponent's Active Pokémon is now Asleep and Poisoned.",R('spiderTrap'))
add("Your opponent reveals their hand. Choose a Supporter card you find there. Your opponent shuffles that card into their deck.",R('clearRoom'))
add("Choose 1 of your opponent's Pokémon. Your opponent shuffles that Pokémon and all cards attached to it into their deck.",R('den'))
add("Discard all Special Energy from each of your opponent's Pokémon.",R('specialSweep'))
add("If your Illumise used Pheromone Signals during your last turn, this attack does 100 more damage.",bonus(100,cond('sm7Pheromone')))
add("This attack does 50 damage to 1 of your opponent's Pokémon. This damage isn't affected by Weakness, Resistance, or any other effects on that Pokémon.",E('selectedDamage',target='opponentPokemon',amount=50,ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True))
add("Discard 2 Energy from your opponent's Pokémon.",E('sm1Rule',rule='darkCall'))
add('Discard all Energy from both Active Pokémon.',seq(E('discardEnergyCard',target='self',amount='all'),E('discardEnergyCard',target='opponentActive',amount='all')))
add("Search your deck for a number of Basic Pokémon up to the number of your opponent's Benched Pokémon and put those Pokémon onto your Bench. Then, shuffle your deck.",R('evenGame'))
add("This Pokémon can't use Grand Wave during your next turn.",E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='Grand Wave'))
add('You may discard any number of cards from your hand. Then, draw cards until you have 5 cards in your hand.',R('ditchDraw'))
add("For each card in your opponent's hand, put 1 damage counter on their Active Pokémon.",R('breakdown'))
add("If 1 of your opponent's Pokémon in play has the same name as 1 of your Pokémon in play, this attack does 70 more damage.",bonus(70,cond('sm7SameName')))
add('You may switch this Pokémon with 1 of your Benched Pokémon.',E('sm3Rule',rule='aquaRing'))
add("This attack does 50 damage to 1 of your opponent's Pokémon. This damage isn't affected by Weakness or Resistance.",E('selectedDamage',target='opponentPokemon',amount=50,ignoreWeakness=True,ignoreResistance=True))
add('During your next turn, the Defending Pokémon takes 20 more damage from attacks (after applying Weakness and Resistance).',E('modifier',target='opponentActive',scope='self',stat='damageTaken',amount=20,duration='nextOwnTurn'))
add('If there is any Stadium card in play, this attack does 50 more damage. Then, discard that Stadium card.',seq(bonus(50,cond('stadiumInPlay')),E('discardStadium')))
add('Search your deck for Alolan Raticate or Alolan Raticate-GX, reveal it, and put it into your hand. Then, shuffle your deck.',E('searchChosen',amount=1,filter={'name':['Alolan Raticate','Alolan Raticate-GX']}))
add('Discard up to 2 cards from your hand. This attack does 40 damage for each card you discarded in this way.',E('chooseDiscardForBonus',zone='hand',max=2,amount=40))
add('Search your deck for up to 6 Item cards, reveal them, and put them into your hand. Then, shuffle your deck.',E('searchChosen',amount=6,filter={'kind':'trainer','trainerType':['Item','Tool']}))
add('Flip a coin for each Pokémon you have in play. This attack does 30 damage for each heads.',E('coinDamageByPokemon',amount=30,mode='replace'))
add("Choose 1 of your opponent's Active Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.",E('chooseAttackLock',duration='opponentTurn'))
add("If your opponent's Active Pokémon is a Pokémon-GX or a Pokémon-EX, this attack does 30 more damage (before applying Weakness and Resistance).",bonus(30,cond('opponentMatches',filter={'isExOrGX':True})))
add('If this Pokémon has any damage counters on it, this attack does 50 more damage.',bonus(50,cond('selfDamaged')))
add("Discard a Fire Energy from your opponent's Active Pokémon.",R('firefighting'))
# Bench-only filter needs an explicit rule, not a generic all-field target.
add("This attack does 30 damage to each of your opponent's Benched Pokémon that has any damage counters on it. (Don't apply Weakness and Resistance for Benched Pokémon.)",R('dangerousConcert'))
ab('Power Draw','Once during your turn (before your attack), you may discard a card from your hand. If you do, draw 3 cards.',activated(R('powerDraw')))
ab('Smooth Over','Once during your turn (before your attack), you may search your deck for a card, shuffle your deck, then put that card on top of it.',activated(R('smoothOver')))
ab('Icy Barrier',"As long as this Pokémon is your Active Pokémon, your opponent can't play any Stadium cards from their hand.",passive(E('actionLock',side='opponent',cardType='Stadium',duration='whileActive'),activeOnly=True))
ab('Shadow Shield','If this Pokémon has any Psychic Energy attached to it, it takes 20 less damage from attacks (after applying Weakness and Resistance).',passive(E('modifier',stat='damageReduction',scope='self',duration='whileInPlay',amount=20,condition=cond('selfHasEnergyType',energyType='Psychic'))))
ab('Conductive Body','As long as this Pokémon is your Active Pokémon, its Retreat Cost is Colorless less for each Beldum on your Bench.',passive(E('modifier',stat='retreatCost',scope='self',duration='whileActive',amount=-1,perBenchFilter={'name':'Beldum'}),activeOnly=True))
ab('Full Metal Body','If this Pokémon has any Metal Energy attached to it, it has no Weakness.',passive(E('weaknessGuard',duration='whileInPlay',condition=cond('selfHasEnergyType',energyType='Metal'))))
ab('Ultra Wall',"Your Ultra Beasts take 10 less damage from your opponent's attacks (after applying Weakness and Resistance).",passive(E('modifier',stat='damageReduction',scope='team',duration='whileInPlay',amount=10,filter={'tag':'ultra-beast'})))
ab('Dragon Wind',"If this Pokémon is your Active Pokémon, once during your turn (before your attack), you may switch 1 of your opponent's Benched Pokémon with their Active Pokémon.",activated(E('forceOpponentSwitch',chooseBy='attacker'),activeOnly=True))
ab('Magic Evens',"Prevent all damage done to this Pokémon by your opponent's attacks if that damage is exactly 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, or 260.",passive(R('magicEvens')))
ab('Excavate','Once during your turn (before your attack), you may look at the top card of your deck. You may discard that card.',activated(R('excavate')))
# Match the complete canonical rules for every print (including alternate art).
for row in json.loads((ROOT/'data/classic/sm7-print-compact.json').read_text()):
 if row[2]!='Trainer':continue
 rule=row[13][0]; name=row[1]
 mapping={
 'Acro Bike':('Item',R('acroBike')),
 "Bill's Maintenance":('Supporter',R('bill')),
 'Life Herb':('Item',E('neoRule',rule='pl1:lifeHerb')),
 'Lure Ball':('Item',E('neoRule',rule='skyridge:lureBall')),
 'Last Chance Potion':('Item',R('lastPotion')),
 'Hustle Belt':('Tool',E('modifier',stat='attackDamage',scope='self',duration='whileInPlay',amount=60,condition=cond('sm7Hustle'))),
 'Rare Candy':('Item',E('rareCandy')),
 'Tate & Liza':('Supporter',E('chooseOption',options=[{'label':'Shuffle hand and draw 5','effect':E('handShuffle',draw=5)},{'label':'Switch Active Pokémon','effect':E('switch',side='self')} ])),
 'TV Reporter':('Supporter',R('tvReporter')),
 'Underground Expedition':('Supporter',R('underground')),
 'PokéNav':('Item',R('pokeNav')),
 'Friend Ball':('Item',R('friendBall')),
 'Energy Recycle System':('Item',R('energyRecycle')),
 }
 if name in mapping:tr(name,rule,*mapping[name])

# SM7 consolidated continuation II. Match complete printed signatures.
rows7=json.loads((ROOT/'data/classic/sm7-print-compact.json').read_text())
def at(no,name,fx):
 row=next(r for r in rows7 if r[0]==str(no));add(next(a[3] for a in row[7] if a[0]==name),fx)
def abil(no,fx):
 row=next(r for r in rows7 if r[0]==str(no));a=row[8][0];ab(a[0],a[2],fx)
def trainer7(no,kind,fx):
 row=next(r for r in rows7 if r[0]==str(no));tr(row[1],row[13][0],kind,fx)
def trigger(event,fx):return {'type':'triggered','event':event,'fromHandOnly':True,'effect':fx}
for no,rule in [(10,'powerNature'),(61,'solShade'),(62,'sunbeam'),(95,'extend'),(115,'lazy'),(122,'unitColor')]:abil(no,passive(R(rule)))
abil(109,trigger('benched',R('stormyWinds')))
abil(31,trigger('benched',R('legendaryAscent')))
abil(66,activated(R('shadyMove'),activeOnly=True))
abil(121,trigger('evolved',R('searchFriends')))
at(66,'Shadow Chant',E('discardCountDamage',side='self',filter={'trainerType':'Supporter'},amount=10,maxAmount=100,mode='add'))
at(66,'Tomb Hunt-GX',E('searchChosen',source='discard',amount=3,filter={}))
at(109,'Dragon Break',E('energyDamage',source='self',all=True,basicOnly=True,energyTypes=['Grass','Lightning'],amount=30,mode='replace'))
at(109,'Tempest-GX',R('tempest'))
at(55,'Zappy Pom-Poms',R('fieldDamage',amount=30,filter={'isExOrGX':True}))
at(75,'Dust Devil',R('fieldDamage',amount=20,filter={'notSubtype':'Fighting'}))
at(87,'Trample',R('fieldDamage',amount=60,benchOnly=True,coinEach=True,ignoreMatchup=True))
at(73,'Rapid Spin',R('rapidSpin'))
at(29,'Flaming Honk',R('flamingHonk'))
at(100,'Moon Raker',R('moonRaker'))
at(107,'Dreamy Mist',R('dreamyMist'))
at(116,'Bawl',seq(E('attackRequirement',condition=cond('sm7FirstSecond')),E('actionLock',side='opponent',cardType='Trainer',duration='opponentTurn')))
trainer7(133,'Supporter',R('hiker'))
trainer7(139,'Supporter',R('maskedRoyal'))
trainer7(143,'Stadium',R('shrine'))
trainer7(144,'Stadium',R('skyPillar'))
trainer7(145,'Supporter',R('steven'))

# SM7 completion — explicit printed signatures, including physical card choices.
at(48,'Crush and Burn-GX',R('crushBurn'))
abil(48,activated(R('extraBomb')))
at(50,'Lightning Strike',R('lightningStrike'))
abil(50,passive(R('energyGrounding')))
at(52,'Double Charge',R('doubleCharge'))
abil(52,passive(R('electricStart')))
at(65,'Enemy Show',R('enemyShow'))
abil(65,trigger('evolved',R('redEyes')))
at(82,'Sandy Fear-GX',R('sandyFear'))
abil(83,passive(R('fallingStar')))
at(91,'Mining',R('mining'))
at(97,'Perish Dream',seq(E('status',target='self',status='sleep'),R('perishDream')))
abil(97,passive(R('wishStar')))
at(98,'Steelworks',R('steelworks'))
at(110,'Strike and Run',R('strikeRun'))
trainer7(125,'Item',R('beastBall'))
trainer7(141,'Item',R('rainbowBrush'))

def attack(row,a):
 title,cost,damage,printed=a;t=attack_text(printed)
 if not t:return E('noop')
 if t in A:return deepcopy(A[t])
 # Safe complete-text patterns with explicit effects; no partial regex matches.
 text=re.sub(r'\s*\(You can.t use more than 1 GX attack in a game\.\)\s*$','',printed,flags=re.I).strip()
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage for each heads\.',text)
 if m:return E('coinDamage',coins=int(m[1]),amount=int(m[2]),mode='replace')
 m=re.fullmatch(r'Search your deck for (?:up to )?(\d+) (.+?) and put (?:it|them) onto your Bench\. Then, shuffle your deck\.',text)
 if m and m[2] in ('Scyther','Basic Pokémon'):return E('benchFromDeck',amount=int(m[1]),filter={'name':'Scyther'} if m[2]=='Scyther' else {'stage':'Basic','kind':'pokemon'})
 m=re.fullmatch(r'Search your deck for (?:up to )?(\d+) Pokémon, reveal them, and put them into your hand\. Then, shuffle your deck\.',text)
 if m:return E('searchChosen',amount=int(m[1]),filter={'kind':'pokemon'})
 m=re.fullmatch(r'Search your deck for (?:up to )?(\d+) (Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy cards, reveal them, and put them into your hand\. Then, shuffle your deck\.',text)
 if m:return E('searchChosen',amount=int(m[1]),filter={'kind':'energy','basicEnergy':True,'subtype':m[2]})
 m=re.fullmatch(r'This attack does (\d+) damage to (\d+) of your opponent.s Benched Pokémon\. \(Don.t apply Weakness and Resistance for Benched Pokémon\.\)',text)
 if m:return E('multiTargetDamage',target='opponentBench',amount=int(m[1]),count=int(m[2]))
 m=re.fullmatch(r'This attack does (\d+) damage to (\d+) of your opponent.s Pokémon\. \(Don.t apply Weakness and Resistance for Benched Pokémon\.\)',text)
 if m and int(m[2])==1:return E('selectedDamage',target='opponentPokemon',amount=int(m[1]))
 m=re.fullmatch(r'Discard (\d+) Energy from this Pokémon\.',text)
 if m:return E('discardEnergyCard',target='self',amount=int(m[1]))
 m=re.fullmatch(r'Attach up to (\d+) (Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy cards from your hand to this Pokémon\.',text)
 if m:return E('attachEnergy',source='hand',target='self',amount=int(m[1]),energyType=m[2],optional=True)
 # Existing generic parser is anchored to complete sentences and never called
 # with a collector number that could collide with an older set-specific row.
 candidate=generic_attack(['_sm7_generic_',*row[1:]],[title,cost,damage,text])
 if candidate and candidate['type'] not in ('noop','unsupported'):return deepcopy(candidate)
 return unique(ATTACKS.get((title,t,damage))) or unique(TEXTS.get((t,damage)))
def ability(row,a):return deepcopy(B.get((a[0],norm(a[2])))) or unique(ABILITIES.get((a[0],norm(a[2]))))
def trainer(row):
 rules=row[13] or []; item=T.get((row[1],norm(rules[0] if rules else '')))
 if item:return deepcopy(item)
 return unique(TRAINERS.get((row[1],norm(' '.join(rules)))))
def energy(row):
 if row[1]=='Rainbow Energy' and norm(' '.join(row[13]))==norm('This card provides Colorless Energy. While in play, this card provides every type of Energy but provides only 1 Energy at a time. When you attach this card from your hand to 1 of your Pokémon, put 1 damage counter on that Pokémon.'):
  return E('specialEnergy',provides={'Miracle':1})
 return None
def prism_ready(row):return row[1] in ('Latios ◇','Latias ◇','Jirachi ◇') and all(attack(row,a) is not None for a in row[7])
