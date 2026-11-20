"""Pinned Plasma Blast BW10 card mappings. Unknown or unsupported effects are gated."""
import re
from hgss1_verified import N,S,Q,ST,H,DISC,COIN,SEARCH,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD
import bw9_verified as P
R=lambda key:{'type':'neoRule','rule':'bw10:'+key}
E=lambda kind,**kw:{'type':kind,**kw}
STATUS={'Asleep':'sleep','Burned':'burn','Poisoned':'poison','Paralyzed':'paralysis','Confused':'confusion'}
A={
('1','Sweet Scent'):R('sweetScent'),
('4','Lifesplosion'):R('lifesplosion'),('5','Return'):E('drawToHandSize',size=6),('5','Energy Press'):R('energyPress'),
('8','Retribution'):R('retribution'),
('9','Emerald Slash'):R('emeraldSlash'),('10','Call for Family'):R('grassCallFamily'),
('11','Megalo Cannon'):E('benchDamage',amount=20,side='opponent',count=1),
('13','Solar Transporter'):R('solarTransporter'),('13','Leech Life'):E('drain'),
('16','Hydro Pump'):R('hydroPump'),('17','Cleanse Away'):R('cleanseAway'),
('19','Sharpshooting'):E('selectedDamage',target='opponentPokemon',amount=30,ignoreWeakness=True,ignoreResistance=True),
('22','Reflect Energy'):R('reflectEnergy'),('23','Blizzard'):E('benchDamage',amount=10,side='opponent',all=True),
('24','Fossil Hunt'):R('fossilHunt'),('28','Fossil Clutch'):R('fossilClutch'),
('26','Bang Heads'):S(ST('confusion'),ST('confusion','self')),('29','Splatter'):E('selectedDamage',target='opponentPokemon',amount=20,ignoreWeakness=True,ignoreResistance=True),
('30','Outrage'):R('outrage'),('30','Giga Frost'):DISC(2,typ='Water'),
('33','Crush and Burn'):R('crushAndBurn'),
('34','Wind Blast'):E('selectedDamage',target='opponentBench',amount=40,ignoreWeakness=True,ignoreResistance=True),
('35','Derail'):R('derail'),('36','Psypower'):R('psypower'),
('38','Psyjamming'):R('psyjamming'),('40','Precognitive Dream'):S(DRAW(3),ST('sleep','self')),
('44','Telekinesis of Nobility'):SWITCH(),('46','Iron Fist of Justice'):R('ironFistOfJustice'),
('48','Last-Chance Chop'):R('lastChanceChop'),('49','Close Combat'):R('closeCombat'),
('50','Knock Off'):R('knockOff'),('50','Reinforced Lariat'):R('reinforcedLariat'),
('51','Shoulder Throw'):R('shoulderThrow'),('52','Kick of Righteousness'):R('kickOfRighteousness'),
('54','Swift Dive'):R('swiftDive'),('56','Blazing Claws'):R('blazingClaws'),
('59','Aura of the Land'):S(BENCH(20,'self'),BENCH(20,'opponent')),('60','Hypnostrike'):S(ST('sleep'),ST('sleep','self')),
('61','Steamroll'):E('benchDamage',amount=20,side='opponent',count=1),('61','Slashing Strike'):R('slashingStrike'),
('64','Gaia Crush'):R('gaiaCrush'),('65','Reverse Edge'):R('reverseEdge'),('65','Fast Forward'):R('fastForward'),
('66','Strafe'):E('chooseOption',options=[{'label':'Switch to a Benched Pokémon','effect':SWITCH()},{'label':'Stay Active','effect':N}]),
('66','Dimension Heal'):R('dimensionHeal'),('67','Strong Bond'):R('strongBond'),
('69','Dragonaxe'):R('dragonaxe'),('69','Strike of the Champion'):R('strikeOfTheChampion'),
('70','Big Swing'):R('bigSwing'),('70','Shred'):E('damageRule',ignoreEffects=True),
('71','Call for Family'):R('callFamily'),
('74','Tri Attack'):COIN(3,50),('76','Adrenalash'):R('adrenalash'),
('77','Misinformation'):R('misinformation'),
('92','G Booster'):S(E('damageRule',ignoreEffects=True),R('gBooster')),('93','G Scope'):E('selectedDamage',target='opponentBench',amount=100,ignoreWeakness=True,ignoreResistance=True),
('97','Megalo Cannon'):E('benchDamage',amount=20,side='opponent',count=1),
('98','Hypnostrike'):S(ST('sleep'),ST('sleep','self')),
('99','Reverse Edge'):R('reverseEdge'),('99','Fast Forward'):R('fastForward'),
('100','Strafe'):E('chooseOption',options=[{'label':'Switch to a Benched Pokémon','effect':SWITCH()},{'label':'Stay Active','effect':N}]),
('100','Dimension Heal'):R('dimensionHeal'),
('103','Double Draw'):DRAW(2),('103','Leaf Wallop'):R('leafWallop'),
('104','Shadow Punch'):E('damageRule',ignoreResistance=True),
}
ABILITY={
 'Tool Reversal':{'type':'activated','effect':R('toolReversal'),'oncePerTurn':False},
 'Prehistoric Call':{'type':'activated','effect':R('prehistoricCall'),'oncePerTurn':True},
 'Verdant Wind':{'type':'passive','effect':R('verdantWind')},
 'Red Signal':{'type':'passive','effect':R('redSignal')},
 'Deluge':{'type':'activated','effect':{'type':'neoRule','rule':'bw7:deluge'},'oncePerTurn':False},
 'Safeguard':P.ABILITY['Safeguard'],
 'Cursed Glare':{'type':'passive','effect':R('cursedGlare')},
 'Drifting Balloon':{'type':'passive','effect':R('driftingBalloon')},
 'Mental Shroud':{'type':'passive','effect':R('mentalShroud')},
 'Toolbox':{'type':'passive','effect':R('toolbox')},
 'Badge of Discipline':{'type':'passive','effect':R('badgeDiscipline')},
 'Stellar Guidance':{'type':'passive','effect':R('stellarGuidance')},
 'Breakwing':{'type':'passive','effect':R('breakwing')},
 'Plasma Transfer':{'type':'activated','effect':R('plasmaTransfer'),'oncePerTurn':False},
 'Propagation':P.ABILITY['Propagation'],
 'Sinister Hand':{'type':'activated','effect':R('sinisterHand'),'oncePerTurn':False},
}
TRAINERS={
 '78':('Supporter',R('caitlin')),'79':('Item',R('coverFossil')),
 '80':('Item',R('energyRetrieval')),'81':('Supporter',R('iris')),
 '82':('Item',R('plumeFossil')),'83':('Item',R('pokemonCatcher')),
 '84':('Supporter',P.TRAINERS['116'][1]),'85':('Item',R('rareCandy')),
 '86':('Tool',R('reversalTrigger')),'87':('Item',R('rootFossil')),
 '88':('Tool',R('silverBangle')),'89':('Tool',R('silverMirror')),
 '90':('Item',P.TRAINERS['122'][1]),
 '92':('Tool',R('gBoosterTool')),'93':('Tool',R('gScopeTool')),
 '94':('Item',R('masterBall')),'95':('Item',R('scoopUpCyclone')),
 '101':('Supporter',R('iris')),'105':('Item',R('rareCandy')),
}
# No silent no-ops: these prints need explicit zones, ability triggers or
# control flows before they are eligible for the live CPU/deck builder.
GATE={
 '2':'Tool Reversal: repeatable activation and exact attached Tool return require action UI.',
 '3':'Prehistoric Call: Abilities from discard are not part of the normal board-only activation UI.',
 '4':'Lifesplosion: benching Stage 2 Pokémon without a previous evolution requires a special resolution path.',
 '8':'Retribution: previous-turn KO must preserve exact Escavalier identity.',
 '11':'Red Signal: optional switch must trigger on a physical Plasma Energy attached from hand.',
 '27':'Prehistoric Call: discard pile Ability requires an out-of-play action.',
 '33':'Crush and Burn: multi-source, multi-Pokémon Energy choice requires exact physical source accounting.',
 '36':'Psypower requires freely distributing three damage counters between different targets.',
 '38':'Psyjamming requires selecting and moving multiple physical Special Energy cards owned by opponent.',
 '41':'Toolbox requires four Tools and replacement selection when Ability is lost.',
 '53':'Prehistoric Call: discard pile Ability requires an out-of-play action.',
 '60':'Stellar Guidance must trigger only on bench placement from hand.',
 '69':'Strike of the Champion needs direct KO and prize-timing integration.',
 '74':'Plasma Transfer requires a repeatable physical Plasma Energy move action.',
 '95':'Scoop Up Cyclone must return the whole stack with exact attached Basic and Special Energy references.',
 '97':'Red Signal must trigger from hand-attached Plasma Energy.',
 '98':'Stellar Guidance must trigger only on bench placement from hand.',
 '102':'Propagation requires activation from discard pile (also gated in BW9).',
 '104':'Sinister Hand damage movement requires repeatable choice of both Pokémon.',
 '28':'Carracosta depends on Restored Tirtouga from the gated fossil chain.',
 '54':'Archeops depends on Restored Archen from the gated fossil chain.',
 '35':'Drifting Balloon modifies printed attack costs dynamically for opponent Team Plasma counts.',
 '86':'Reversal Trigger requires a KO-on-opponent-attack triggered search.',
}
# Extra gating is intentionally conservative on abilities / high-level effects.
for n in ('9','96'):
    GATE.setdefault(n,'Verdant Wind special condition immunity and immediate cleanse need global status hooks.')
for n in ('23',):GATE.setdefault(n,'Cursed Glare must block Special Energy being attached from hand to all opponents.')
for n in ('37',):GATE.setdefault(n,'Mental Shroud requires changing Weakness globally with Uxie and Azelf in play.')
for n in ('49',):GATE.setdefault(n,'Badge of Discipline modifies Fighting damage type rules.')
for n in ('64',):GATE.setdefault(n,'Breakwing triggers when the evolution enters play from hand.')

# BW10 new per-print attack texts not in A must be exact-rule safe; defer to
# previously audited generic parser, never re-use id-specific older-set neoRule.
def attack(row,attack):
    number,name=str(row[0]),attack[0];txt=(attack[3] or '').strip()
    if (number,name) in A:return A[number,name]
    if not txt:return N
    # Do not pass BW10 print numbers through BW9's number/name table: a
    # coincidental collector-number match can apply the wrong legacy action.
    reuse=P.B8.attack(row,attack)
    if reuse is not None and reuse.get('type')!='neoRule':return reuse
    reuse=P.B7._safe_reuse(txt)
    if reuse is not None and reuse.get('type')!='neoRule':return reuse
    return None
