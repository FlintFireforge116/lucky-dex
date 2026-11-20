"""BW11 Legendary Treasures / Radiant Collection verified printed effect mappings.

Every advanced effect is explicit. Unsupported printed text gates the WHOLE
card so neither player nor CPU can accidentally resolve it as a no-op.
"""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
import bw7_verified as B7

R=lambda k:{'type':'neoRule','rule':'bw11:'+k}
E=lambda t,**kw:{'type':t,**kw}
SNAME={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
A={
 ('3','Share'):R('share'),('5','Ambush Bite'):R('ambushBite'),('7','Wring Out'):R('wringOut'),
 ('8','Leaf Tornado'):R('leafTornado'),('15','Leaf Wallop'):R('leafWallop'),
 ('16','Gaia Blaster'):R('gaiaBlaster'),('17','Draw In'):R('drawIn'),
 ('18','Raging Claws'):R('outrage'),
 ('19','Split Bomb'):E('multiTargetDamage',target='opponentPokemon',count=2,amount=40,activeWeaknessResistance=True),
 ('19','Scorching Fire'):DISC(1,typ='Fire'),('21','Color Coordination'):R('colorCoordination'),
 ('22','Fire Blast'):DISC(1,typ='Fire'),('23','Stored Power'):R('storedPower'),
 ('24','Turbo Energize'):R('turboEnergize'),('24','Intensifying Burn'):BONUS(50,{'type':'opponentEx'}),
 ('27','Flamethrower'):DISC(),('28','Outrage'):R('outrage'),('28','Blue Flare'):DISC(2,typ='Fire'),
 ('29','Brave Fire'):Q(t=E('selfDamage',amount=50)),('30','Flailing Flop'):Q(t=E('selfDamage',amount=10)),
 ('31','Howling Rampage'):R('howlingRampage'),('35',"Emperor's Strike"):R('emperorStrike'),
 ('36','Pull Out'):R('pullOut'),('36','Aqua Boomerang'):R('aquaBoomerang'),
 ('38','Aqua Tail'):R('aquaTail'),('39','Hydro Pump'):R('hydroPump'),
 ('41','Round'):R('round'),('42','Round'):R('round'),('43','Outrage'):R('outrage'),('43','Glaciate'):S(BONUS(30),BENCH(30)),
 ('44','Frozen Wings'):R('discardOpponentSpecial'),('44','Hail Blizzard'):E('lock',action='attack',target='self',duration='nextOwnTurn',attackName='Hail Blizzard'),
 ('45','Secret Sword'):R('secretSword'),('46','Random Spark'):E('selectedDamage',target='opponentPokemon',amount=50,activeWeaknessResistance=True),
 ('47','Tag Draw'):R('tagDraw'),('47','Positive Ion'):Q(BONUS(10)),
 ('48','Negative Ion'):GUARD(30),('48','Electrishower'):S(BONUS(10),BENCH(10)),
 ('49','Call for Family'):R('callForFamily2'),('104','Call for Family'):R('callForFamily1'),('50','Charge'):R('charge'),('50','Disaster Volt'):DISC(),
 ('51','Outrage'):R('outrage'),('51','Bolt Strike'):E('selfDamage',amount=40),
 ('52','Strong Volt'):DISC(2),('53','Psyslash'):DISC(2),('54','X Ball'):R('xBall'),('54','Psydrive'):DISC(),
 ('56','Fortunate Draw'):R('fortunateDraw'),('58','Absorb Life'):H(10),
 ('63','Revenge'):R('revenge70'),('65','Energy Gift'):R('energyGift'),
 ('66','Psychic'):R('psychic'),('76','Future Sight'):E('reorderTop',count=5,deckSide='self'),
 ('76','Net Force'):R('netForce'),('77','Cursed Drop'):R('cursedDrop'),('77','Eerie Glow'):S(ST('burn'),ST('confusion')),
 ('78','Psychic'):R('psychic'),('78','Echoed Voice'):R('echoedVoice'),
 ('80','Aura Sphere'):E('benchDamage',side='opponent',count=1,amount=20),
 ('81','Pandemonium Blade'):R('pandemoniumBlade'),
 ('82','Dig Out'):R('digOut'),('82','Break Ground'):BENCH(10,'self'),
 ('83','Muddy Water'):E('benchDamage',side='opponent',count=1,amount=20),
 ('84','Retaliate'):R('revenge60'),('85','Abundant Harvest'):R('abundantHarvest'),
 ('85','Gaia Hammer'):S(BENCH(10,'opponent'),BENCH(10,'self')),
 ('86','Magical Dance'):R('magicalDance'),('87','Hexed Mirror'):R('hexedMirror'),
 ('88','Night Spear'):E('benchDamage',side='opponent',count=1,amount=30),
 ('89','Ascension'):R('ascension'),('90','Brutal Bash'):R('brutalBash'),('90','Dark Rush'):R('darkRush'),
 ('91','Energy Press'):R('energyPress'),('91','Iron Breaker'):R('ironBreaker'),
 ('92','Cleave'):R('cleave'),('93','Dragon Pulse'):E('discardTop',side='self',amount=2),
 ('93','Shred'):E('damageRule',ignoreEffects=True),
 ('95','Shred'):E('damageRule',ignoreEffects=True),
 ('96','Mach Cut'):R('discardOpponentSpecial'),('96','Dragonblade'):E('discardTop',side='self',amount=2),
 ('99','Dragonblast'):DISC(2,typ='Darkness'),
 ('100','Freeze Shock'):E('lock',action='attack',target='self',duration='nextOwnTurn'),
 ('101','Dragon Stream'):R('dragonStream'),('101','Ice Burn'):S(DISC(2,typ='Fire'),ST('burn')),
 ('102','Plasma Gale'):R('plasmaGale'),('105','Echoed Voice'):R('echoedVoice'),
 ('106','Clutch'):LOCK(),('107','Revenge'):R('revenge70'),
 ('108','Energy Wheel'):R('energyWheel'),('108','Hurricane'):R('hurricane'),
 ('114','Outrage'):R('outrage'),('114','Blue Flare'):DISC(2,typ='Fire'),
 ('115','Outrage'):R('outrage'),('115','Bolt Strike'):E('selfDamage',amount=40),
 ('RC1','Growth'):R('growth'),('RC4','Rest'):S(H(999),ST('sleep','self')),
 ('RC9','Tiptoe Step'):R('tiptoeStep'),('RC10','Eternal Radiance'):R('eternalRadiance'),
 ('RC11','Brilliant Voice'):R('brilliantVoice'),('RC11','Round'):R('round'),
 ('RC13','Captivate'):Q(E('forceOpponentSwitch',chooseBy='attacker')),('RC16','Picnic Weather'):R('picnicWeather'),('RC20','No Attack'):N,
 ('RC21','Synthesis'):R('synthesis'),('RC21','Revenge Blast'):R('revengeBlast'),
 ('RC22','Outrage'):R('outrage'),('RC22','Blue Flare'):DISC(2,typ='Fire'),
 ('RC23','Call for Family'):R('callForFamily2'),('RC24','Replace'):R('replace'),
 ('RC25','Brilliant Voice'):R('brilliantVoice'),('RC25','Round'):R('round')
}
ABILITY={
 'Royal Heal':{'type':'passive','effect':R('royalHeal')},
 'Leaf Tailor':{'type':'passive','effect':R('leafTailor')},
 'Victory Star':{'type':'passive','effect':R('victoryStar')},
 'Inferno Fandango':{'type':'activated','effect':R('infernoFandango'),'oncePerTurn':False},
 'Shell Armor':{'type':'passive','effect':R('shellArmor')},
 'Rush In':{'type':'activated','effect':R('rushIn'),'oncePerTurn':True},
 'Safeguard':{'type':'passive','effect':R('safeguard')},
 'Garbotoxin':{'type':'passive','effect':R('garbotoxin')},
 'Magic Room':{'type':'passive','effect':E('actionLock',cardType='Item',side='opponent',duration='whileActive')},
 'Reflexive Retaliation':{'type':'passive','effect':R('reflexiveRetaliation')},
 'Sealing Scream':{'type':'passive','effect':R('sealingScream')},
 'Dark Cloak':{'type':'passive','effect':R('darkCloak')},
 'Dark Trance':{'type':'activated','effect':R('darkTrance'),'oncePerTurn':False},
 'Overflow':{'type':'passive','effect':R('overflow')},
 'Smooth Coat':{'type':'passive','effect':R('smoothCoat')},
 'Rough Skin':{'type':'passive','effect':R('roughSkin')},
 'Royal Garden':{'type':'passive','effect':R('royalGarden')},
 'Versatile':{'type':'passive','effect':R('versatile')}
}
TRAINERS={
 '109':('Supporter',{'type':'drawToHandSize','size':6}),
 '110':('Supporter',R('cedricJuniper')),
 '111':('Item',R('crushingHammer')),
 '112':('Item',R('energySwitch')),
 'RC20':('Supporter',R('elesa')),
}
# Explicitly gated until cross-system/complex choice semantics are verified.
GATE={
 '23':'Victory Star requires rerolling an entire attack coin sequence only once per turn.',
 '56':'Fortunate Draw uses Rock-Paper-Scissors, not a coin flip; requires a fair opponent/CPU input.',
 '110':'Cedric Juniper height guessing requires a proper blinded opponent/CPU decision.',
 'RC16':'Picnic Weather needs Restored Bench/Discard card stacking and complete attach trigger.',
 '87':'Sealing Scream requires global ACE SPEC blocking on both players.',
 '80':'Reflexive Retaliation needs post-damage trigger timing (including KO).',
 '106':'Rough Skin needs post-damage trigger timing (including KO).',
}

def attack(row,a):
 n,title=str(row[0]),a[0];txt=(a[3] or '').strip()
 if (n,title) in A:return A[n,title]
 if not txt:return N
 m=re.fullmatch(r'(?:The )?Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return ST(SNAME[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Asleep|Burned|Poisoned|Paralyzed|Confused)\.',txt)
 if m:return Q(ST(SNAME[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',txt)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]))
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN(int(m[1]),int(m[2]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) more damage for each heads\.',txt)
 if m:return COIN('untilTails',int(m[1]),False)
 m=re.fullmatch(r'Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.',txt)
 if m:return COIN('untilTails',int(m[1]))
 m=re.fullmatch(r'Heal (\d+) damage from this Pokémon\.',txt)
 if m:return H(int(m[1]))
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',txt)
 if m:return E('selfDamage',amount=int(m[1]))
 if txt=="The Defending Pokémon can't retreat during your opponent's next turn.":return LOCK()
 if txt=="This attack's damage isn't affected by Resistance.":return E('damageRule',ignoreResistance=True)
 if txt=="This attack's damage isn't affected by any effects on the Defending Pokémon.":return E('damageRule',ignoreEffects=True)
 if txt=='Discard an Energy attached to this Pokémon.':return DISC()
 if txt=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 if txt.startswith('This Pokémon can\'t use ') or txt.startswith('During your next turn, this Pokémon can\'t use'):
  return E('lock',action='attack',target='self',duration='nextOwnTurn',attackName=title)
 # This is the ID-INDEPENDENT print-text reuse table; never copy older-set
 # neoRule print handlers that might refer to a different collector number.
 reused=B7._safe_reuse(txt)
 if reused and reused.get('type') not in ('noop','unsupported','neoRule'):return reused
 return None
