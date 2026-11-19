"""Call of Legends: explicitly recognised attack/Power effects.

All cards are collected, but an unrecognised printed effect is gated from
Classic CPU/player decks.  Never turn an unknown clause into a noop.
"""
import re
import hgss1_verified as H
N,S,Q,ST,HEAL,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD=(
 H.N,H.S,H.Q,H.ST,H.H,H.DISC,H.COIN,H.SEARCH,H.PICK,H.BENCH,H.BONUS,H.SWITCH,H.DRAW,H.LOCK,H.GUARD)
R=lambda namespace,name: {'type':'neoRule','rule':f'{namespace}:{name}'}

def attack(row, a):
 n,name=str(row[0]),row[1];title,cost,damage,text=a; text=(text or '').strip()
 # Verified printed reprints of HGSS rules, with prior handlers that act on
 # the current source Pokémon, not a hard-coded original collector number.
 hand={
 ('1','Fairy Power'):R('hgss1','3:fairyPower'),
 ('2','Cell Storm'):S(DISC(2,'self','Psychic'),HEAL(60)),
 ('3','Time Rewind'):{'type':'handShuffle','draw':0},
 ('4','Solar Suggestion'):R('hgss3','2:solarSuggestion'),
 ('5','Mirror Shot'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('5','Everyone Explode Now'):R('hgss3','3:everyoneExplode'),
 ('6','Volcano Stomp'):Q({'type':'discardTop','side':'opponent','amount':4},{'type':'discardTop','side':'self','amount':4}),
 ('7','Hyper Beam'):DISC(1,'opponentActive'),
 ('8','Triple Kick'):COIN(3,20),('8','Close Combat'):GUARD(-20),
 ('9','Scorching Wing'):Q(t=DISC('all','self','Fire')),
 ('10','Fire Counterattack'):R('hgss3','5:fireCounterattack'),('10','Dark Roar'):R('hgss3','5:darkRoar'),
 ('11','Time Hollow'):None,
 ('12','Destructive Tsunami'):R('col1','12:destructiveTsunami'),
 ('13','Miasma Wind'):R('hgss3','17:miasmaWind'),('13','Sooting Scent'):ST('sleep'),
 ('14','Dimension Sphere'):R('col1','14:dimensionSphere'),
 ('14','Sky Uppercut'):{'type':'damageRule','ignoreResistance':True},
 ('15','Linear Attack'):PICK(30),
 ('16','Hard Crush'):None,('16','Mantle Bazooka'):DISC(2,'self','Fire'),
 ('18','Shocking Bolt'):R('col1','18:shockingBolt'),('19','Wormhole'):S(SWITCH(),{'type':'forceOpponentSwitch','chooseBy':'defender'}),
 ('20','Inferno Spear'):S(DISC(1,'self','Fire'),DISC(1,'self','Lightning')),
 ('21','Tail Rap'):COIN(2,20),('22','Moonlight Fang'):{'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True,'attackerFilter':{'hasAbility':True}},
 ('22','Quick Blow'):Q(BONUS(30)),
 ('23','Acceleration Bolt'):R('hgss1','14:accelerationBolt'),('23','Thunder'):Q(t={'type':'selfDamage','amount':20}),
 ('24','Eeeeeeek'):S({'type':'handShuffle','draw':6},ST('sleep','self')),
 ('25','Spinning Tail'):S(BONUS(20),BENCH(20)),
 ('26','Timid Tackle'):S({'type':'selfDamage','amount':20},SWITCH()),
 ('26','Chomp'):{'type':'damageFromDamage','source':'self','amount':1},
 ('27','Sleep Powder'):ST('sleep'),('27','Giant Bloom'):HEAL(20),
 ('28','Sleeping Spell'):Q(ST('sleep')),('28','Poltergeist'):R('hgss3','19:poltergeist'),
 ('29','Juggling'):COIN(4,10),('30','Headwind'):R('hgss4','29:headwind'),
 ('30','Quick Attack'):Q(BONUS(30)),
 ('31','Steel Coat'):R('hgss3','21:steelCoat'),
 ('32','Psyshock'):Q(ST('paralysis')),
 ('33','Layabout'):R('col1','33:layabout'),
 ('33','Clomp Clomp Clobber'):R('col1','33:clomp'),
 ('34','Grind'):{'type':'energyDamage','source':'self','countCards':True,'amount':20,'mode':'replace'},
 ('34','Plow Over'):Q(ST('paralysis'),R('col1','34:plowOver')),
 ('35','Fire Spin'):DISC(2),
 ('36','Mischievous Punch'):S({'type':'damageRule','ignoreWeakness':True,'ignoreResistance':True},ST('sleep','self')),
 ('37','Cross Chop'):Q(BONUS(30)),
 ('38','Super Poison Breath'):ST('poison'),('38','Super Explosion'):{'type':'selfDamage','amount':90},
 ('39','Swords Dance'):{'type':'nextAttackBonus','attackName':'Lost Claw','amount':50},
 ('39','Lost Claw'):R('col1','39:lostClaw'),
 ('41','Big Bite'):LOCK(),('42','Rock Hurl'):{'type':'damageRule','ignoreResistance':True},
 ('42','Double Spin'):COIN(2,70),
 ('43','Thunder Spear'):PICK(20),('43','Thundershock'):Q(ST('paralysis')),
 ('44','Flamethrower'):R('hgss1','49:flamethrower'),
 ('45','Agility'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('46','Play with Fire'):S(ST('burn'),ST('sleep','self')),
 ('47','Sleepy Lost'):S(R('col1','47:sleepyLost'),ST('sleep','self')),
 ('48','Twister'):None,
 ('49','Flamethrower'):R('hgss1','49:flamethrower'),
 ('50','Tumble Over'):{'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'},
 ('51','Poison Buildup'):ST('poison','self'),
 ('51','Poison Effect'):S(BONUS(60,{'type':'selfStatus','status':'poison'}),R('col1','51:curePoison')),
 ('52','Spiral Drain'):HEAL(20),('52','Dual Splash'):{'type':'multiTargetDamage','target':'opponentPokemon','count':2,'amount':30},
 ('53','Nap'):HEAL(10),('53','Reckless Charge'):{'type':'selfDamage','amount':10},
 ('54','Minimize'):GUARD(20),('55','Fireworks'):Q(t=DISC(1,'self','Fire')),
 ('57','Detect'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}),
 ('57','Sky Uppercut'):{'type':'damageRule','ignoreResistance':True},
 ('60','Smokescreen'):{'type':'attackCoinGate','target':'opponentActive','duration':'opponentTurn'},
 ('64','Selfish Draw'):R('col1','64:selfishDraw'),
 ('64','Destructive Jaw'):Q(S(ST('paralysis'),DISC(1,'opponentActive'))),
 ('65','Dual Draw'):S(DRAW(3),{'type':'draw','amount':3,'side':'opponent'}),
 ('66','Rock Smash'):Q(BONUS(10)),
 ('67','Messenger'):R('hgss4','71:messenger'),
 ('68','Focus Energy'):{'type':'nextAttackBonus','attackName':'Surprise Attack','amount':40},
 ('68','Surprise Attack'):{'type':'coinAttackGate','heads':N},
 ('69','Prehistoric Wisdom'):R('col1','69:wisdom'),
 ('69','Granite Head'):GUARD(30),
 ('70','Whismy Tackle'):{'type':'coinAttackGate','heads':N},
 ('71','Roar'):{'type':'forceOpponentSwitch','chooseBy':'defender'},
 ('72','Nutritional Support'):R('col1','72:nutrition'),
 ('72','Poisonpowder'):ST('poison'),
 ('73','Fake Tears'):Q(R('col1','73:fakeTears')),
 ('74','Aqua Tail'):{'type':'coinDamageByEnergy','amount':20,'energyType':'Water','countAttachedEnergyType':True},
 ('75','Singe'):Q(ST('burn')),
 ('75','Ember'):Q(t=R('hgss1','87:emberDiscard')),
 }
 if (n,title) in hand: return hand[n,title]
 if n=='SL3' and title=='Wild Blaze':return {'type':'discardTop','amount':3}
 if n=='SL9' and title=='Raging Thunder':return R('col1','SL9:ragingThunder')
 if n=='SL11' and title=='Tsunami':return S(BONUS(20),BENCH(20))
 # SL print shares its attack rules with the identically named regular print.
 if n.startswith('SL'):
  for normal in ('2','3','6','9','12','15','19','20'):
   if (normal,title) in hand and (name,title) in [
     ('Deoxys','Cell Storm'),('Dialga','Time Rewind'),('Groudon','Volcano Stomp'),
     ('Ho-Oh','Scorching Wing'),('Kyogre','Destructive Tsunami'),
     ('Lugia','Linear Attack'),('Palkia','Wormhole'),('Rayquaza','Inferno Spear')]:
    return hand[normal,title]
 # Literal, standard clauses and harmless printed vanilla attacks.
 return H.attack(['0',name],a)

SLEEP_BODY={'type':'preventDamage','target':'self','duration':'whileInPlay','condition':{'type':'selfStatus','status':'sleep'}}

def ability(row,p):
 n,name=str(row[0]),p[0]
 if name=='Sweet Sleeping Face':return {'type':'passive','effect':SLEEP_BODY}
 if name=='Self-Generation':return {'type':'triggered','event':'benched','fromHandOnly':True,'effect':R('col1','18:selfGeneration')}
 if name=='Roast Reveal':return {'type':'activated','oncePerTurn':True,'effect':R('hgss1','7:roastReveal')}
 if name=='Extreme Speed':return {'type':'passive','effect':{'type':'modifier','stat':'retreatCost','amount':-1,'duration':'whileInPlay','scope':'self','perEnergyCards':True,'energyType':{'SL3':'Fire','SL9':'Lightning','SL11':'Water'}.get(n,'Colorless')}}
 if name=='Trick Reveal':return {'type':'activated','oncePerTurn':True,'effect':S({'type':'revealHand','side':'self'},{'type':'revealHand','side':'opponent'})}
 if name=='Second Sight':return {'type':'activated','oncePerTurn':True,'effect':R('hgss1','12:secondSight')}
 if name=='Ultra-Thick Skin':return {'type':'passive','effect':{'type':'modifier','stat':'damageReduction','amount':10,'duration':'whileInPlay','scope':'self','condition':{'type':'selfEnergyAtLeast','amount':1,'countSpecial':True}}}
 # Only claim Powers implemented by the engine. Remaining Powers are gated.
 return None

TRAINERS={
 '76':('Supporter',S(DRAW(3),R('col1','76:cheer'))),
 '81':('Stadium',{'type':'stadiumAction','effect':R('col1','81:lostWorld')}),
 '84':('Item',R('col1','84:researchRecord')),
 '77':('Supporter',{'type':'handShuffle','draw':'opponentHandCount'}),
 '78':('Item',S(Q(SEARCH(1,kind='pokemon',stage='Basic')),Q(SEARCH(1,kind='pokemon',stage='Basic')))),
 '79':('Supporter',R('hgss2','77:interviewersQuestions')),
 '82':('Supporter',SEARCH(1,kind='pokemon',stage=['Stage 1','Stage 2'])),
 '83':('Supporter',{'type':'handShuffle','draw':6}),
 '80':('Item',R('col1','80:lostRemover')),
 '85':('Supporter',R('col1','85:sagesTraining')),
}
