"""Plasma Freeze (BW9) exact-print effect coverage. Unimplemented rules gate cards."""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
import bw8_verified as B8
import bw7_verified as B7
R=lambda k:{'type':'neoRule','rule':'bw9:'+k}
E=lambda t,**kw:{'type':t,**kw}
A={
('2','Hide'):Q(E('preventDamage',target='self',duration='opponentTurn',effects=True)),
('3','Swift Sting'):R('swiftSting'),('5','Blockade'):R('blockade'),
('8','Energy Bloom'):R('energyBloom'),('10','Rapid-Fire Needles'):R('rapidFireNeedles'),('10','Payback'):R('payback'),
('11','Energy Crush'):R('energyCrush'),('12','Vengeance'):R('vengeance'),
('13','Heat Boiler'):R('heatBoiler'),('13','Dynamite Press'):R('dynamitePress'),
('16','Absorb Life'):H(30),('17','Purifying Flame'):R('purifyingFlame'),('17','Fusion Flare'):R('fusionFlare'),
('20','Refreshing Rain'):R('refreshingRain'),('20','Gold Breaker'):BONUS(50,{'type':'opponentEx'}),
('22','Mud Gun'):R('mudGun'),('26','Seismic Punch'):R('seismicPunch'),('26','Splashing Turn'):SWITCH(),
('28','Surefire Spin'):R('surefireSpin'),('29','ChillMAX'):E('coinDamageByEnergy',countCards=True,amount=60,mode='replace'),
('30','Call Sign'):SEARCH(1,kind='pokemon',subtype='Water'),('30','Cryofreeze'):R('cryofreeze'),
('31','Frost Spear'):E('selectedDamage',target='opponentBench',amount=30,ignoreWeakness=True,ignoreResistance=True),
('31','Blizzard Burn'):E('lock',action='attack',target='self',duration='nextOwnTurn'),
('34','Electri-Defuse'):R('electriDefuse'),('36','Special Tackle'):R('specialTackle'),
('37','Minor Errand-Running'):SEARCH(2,kind='energy',basicEnergy=True),
('38','Raiden Knuckle'):R('raidenKnuckle'),('38','Thunderous Noise'):R('thunderousNoise'),
('39','Mach Claw'):E('damageRule',ignoreResistance=True),('39','Fusion Bolt'):R('fusionBolt'),
('43','Hit Back'):R('hitBack'),('45','Lure Poison'):R('lurePoison'),
('46','Poison Suction'):R('poisonSuction'),('46','Sludge Crash'):R('sludgeCrash'),
('48','Psy Alert'):E('drawToHandSize',size=6),('48','Shadow Ball'):E('selectedDamage',target='opponentPokemon',amount=40,activeWeaknessResistance=True,benchWeaknessResistance=True),
('50','Calculate'):E('reorderTop',count=4,deckSide='self'),
('53','Helix Force'):R('helixForce'),('54','Transfer Pain'):R('transferPain'),
('56','Slap of Misfortune'):R('slapOfMisfortune'),('57','Elongating Arms'):E('selectedDamage',target='opponentPokemon',amount=30),
('58','Lovestrike'):R('lovestrike'),('60','Karate Chop'):R('karateChop'),
('63','Pivot Throw'):R('pivotThrow'),('66','Hail'):R('hail'),('66','Vilify'):R('vilify'),
('67','Mind Jack'):R('mindJack'),('67','Fearsome Shadow'):E('revealHand',side='opponent'),
('70','Piston Headbutt'):R('pistonHeadbutt'),('73','Dragon Slayer'):R('dragonSlayer'),
('78','Tractorbeam'):R('tractorbeam'),('78','Obsidian Fang'):R('obsidianFang'),
('79','Metal Defender'):R('metalDefender'),('80','Astonish'):Q(E('shuffleRandomHandCard',side='opponent')),
('80','Big Ol\' Bite'):S(H(30),LOCK()),('83','Deafen'):R('deafen'),
('84','Dragon Vortex'):R('dragonVortex'),('84','Tri Bullet'):E('multiTargetDamage',target='opponentPokemon',count=3,amount=30,activeWeaknessResistance=True),
('85','Barrier Break'):E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
('86','Luster Purge'):DISC('all'),('88','Transfer Junk'):R('transferJunk'),
('89','Growl'):R('growl'),('90','Signs of Evolution'):R('signsOfEvolution'),
('91','Dual Draw'):R('dualDraw'),('92','Powerful Vision'):R('powerfulVision'),
('92','Fly'):R('fly'),('93','Max Milk'):R('maxMilk'),
('94','Imittack'):R('imittack'),('97','Strong Breeze'):E('shuffleIntoDeck',target='opponentActive'),
('98','Windfall'):R('windfall'),('98','Jet Blast'):R('jetBlast'),
('109','Heat Boiler'):R('heatBoiler'),('109','Dynamite Press'):R('dynamitePress'),
('110','Raiden Knuckle'):R('raidenKnuckle'),('110','Thunderous Noise'):R('thunderousNoise'),
('111','Helix Force'):R('helixForce'),('112','Barrier Break'):E('damageRule',ignoreWeakness=True,ignoreResistance=True,ignoreEffects=True),
('113','Luster Purge'):DISC('all'),('114','Windfall'):R('windfall'),('114','Jet Blast'):R('jetBlast'),
('117','Attack Command'):R('attackCommand'),('118','Psychic'):R('psychic'),
('120','Mach Cut'):R('machCut'),('120','Dragonblade'):E('discardTop',side='self',amount=2),
}
ABILITY={
 'Propagation':{'type':'activated','oncePerTurn':True,'effect':R('propagation')},
 'Flare Navigate':{'type':'activated','oncePerTurn':True,'effect':R('flareNavigate')},
 'Laid-Back':{'type':'passive','effect':R('laidBack')},
 'Freeze Zone':{'type':'passive','effect':R('freezeZone')},
 'Magnetic Draw':{'type':'activated','oncePerTurn':True,'effect':E('drawToHandSize',size=4)},
 'Bench Barrier':{'type':'passive','effect':R('benchBarrier')},
 'Plasma Search':{'type':'activated','oncePerTurn':True,'effect':R('plasmaSearch')},
 'Power Connect':{'type':'passive','effect':R('powerConnect')},
 'Six Feet Under':{'type':'activated','oncePerTurn':True,'effect':R('sixFeetUnder')},
 'Dark Shade':{'type':'passive','effect':R('darkShade')},
 'Bright Down':{'type':'passive','effect':R('brightDown')},
 'Color Change':{'type':'passive','effect':R('colorChange')},
 'Diving Draw':B7.ABILITY.get('Diving Draw',{'type':'activated','oncePerTurn':True,'effect':R('divingDraw')}),
 'Safeguard':{'type':'passive','effect':R('safeguard')},
 'Garbotoxin':{'type':'passive','effect':R('garbotoxin')},
}
TRAINERS={
 '99':('Tool',R('floatStone')),'100':('Stadium',R('frozenCity')),
 '101':('Supporter',R('ghetsis')),'102':('Supporter',R('shadowTriad')),'103':('Item',R('superiorEnergyRetrieval')),
 '104':('Tool',R('plasmaBadge')),'105':('Item',R('plasmaBall')),
 '107':('Tool',R('lifeDew')),'108':('Tool',R('rockGuard')),
 '115':('Supporter',R('ghetsis')),'116':('Supporter',R('juniper')),
 '121':('Item',R('maxPotion')),'122':('Item',R('ultraBall')),
}
GATE={
 # These mechanics need nonstandard source-zone UI / cross-turn exclusions.
 '4':'Propagation requires playable Ability while Pokémon is in discard, which normal board-only Ability actions do not support.',
 '56':'Six Feet Under requires multi-target damage-counter distribution and KO sequencing.',
 '94':'Imittack must present target attack choice and recursively execute its actual effect with copied energy requirements.',
}

def attack(row,a):
 n,name=str(row[0]),a[0];txt=(a[3] or '').strip()
 if (n,name) in A:return A[n,name]
 if not txt:return N
 # Existing BW8 generic mappings are only reused if id-agnostic.
 safe=B8.attack(row,a)
 if safe is not None and not (safe.get('type')=='neoRule' and str(safe.get('rule','')).startswith(('bw8:','bw7:'))):return safe
 # Generic BW5/6 reusable text parser, with unknowns gated.
 reuse=B7._safe_reuse(txt)
 if reuse and not(str(reuse.get('rule','')).startswith(('bw8:','bw7:','bw6:','bw5:'))):return reuse
 return None
