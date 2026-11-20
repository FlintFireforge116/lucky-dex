"""Noble Victories print-grounded mappings. Unverified effects are gated, never no-op'd."""
import re
import hgss1_verified as H
N,S,Q,ST,HEAL,DISC,COIN,SEARCH,PICK,BENCH,BONUS,SWITCH,DRAW,LOCK,GUARD=H.N,H.S,H.Q,H.ST,H.H,H.DISC,H.COIN,H.SEARCH,H.PICK,H.BENCH,H.BONUS,H.SWITCH,H.DRAW,H.LOCK,H.GUARD
R=lambda k:{'type':'neoRule','rule':'bw3:'+k}
A={
 ('3','Cutting Arm'):COIN(2,20,False),
 ('5','Aromax'):{'type':'chooseTarget','target':'selfBench','effect':HEAL(999,'selfBench')},
 ('6','Withdraw'):Q({'type':'preventDamage','target':'self','duration':'opponentTurn'}),
 ('8','Mysterious Evolution'):R('mysteriousEvolution'),
 ('10','Toxic'):{'type':'status','target':'opponentActive','status':'poison','amount':20},
 ('11','Mysterious Evolution'):R('mysteriousEvolution'),
 ('12','Slashing Strike'):R('slashingStrike'),
 ('12','Acid Spray'):Q(DISC(1,'opponentActive')),
 ('13','Leaf Wallop'):R('leafWallop'),
 ('14','Stored Power'):R('storedPower'),
 ('15','V-create'):R('vcreate'),
 ('18','Incinerate'):{'type':'discardTool','target':'opponentActive','amount':1},
 ('19','Ember'):Q(t=DISC(1,'self','Fire')),
 ('21','Fiery Dance'):R('fieryDance'),
 ('23','Round'):R('round'),('24','Round'):R('round'),
 ('26','Crunch'):DISC(1,'opponentActive'),
 ('29','Double Freeze'):{'type':'coinDamageStatus','coins':2,'amount':40,'minHeads':1,'status':'paralysis'},
 ('31','Hydro Pump'):{'type':'energyDamage','source':'self','energyType':'Water','amount':20,'mode':'add'},
 ('32','Ice Shard'):BONUS(40,{'type':'opponentMatches','filter':{'subtype':'Fighting'}}),
 ('33','Ice Chain'):{'type':'forceOpponentSwitch','chooseBy':'attacker'},
 ('33','Frost Vanish'):{'type':'chooseOption','options':[{'label':'Return Cryogonal and attachments to hand','effect':{'type':'returnToHand','target':'self'}},{'label':'Remain in play','effect':N}]},
 ('34','Outrage'):{'type':'damageFromDamage','source':'self','amount':1},
 ('34','Glaciate'):S({'type':'damage','target':'opponentActive','amount':30},BENCH(30)),
 ('36','Shock Bolt'):Q(t=R('shockBolt')),
 ('37','Electrichain'):R('electrichain'),
 ('40','Electric Ball'):N,
 ('43','V-blast'):R('vblast'),
 ('46','Damagriiigus'):R('damagriiigus'),
 ('48','Garbage Collection'):R('garbageCollection'),
 ('52','Future Sight'):{'type':'reorderTop','deckSide':'self','count':5},
 ('52','Net Force'):R('netForce'),
 ('55','First Contact'):{'type':'benchFromDeck','amount':2,'filter':{'stage':'Basic'}},
 ('56','Synchronoise'):R('synchronoise'),
 ('60','Eerie Glow'):S(ST('burn'),ST('confusion')),
 ('61','Core Cannon'):R('coreCannon'),
 ('64','Top Down'):R('topDown'),
 ('65','Chip Away'):{'type':'damageRule','ignoreEffects':True},
 ('67','Rock Slide'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':10},
 ('71','Dynamic Punch'):Q(S(BONUS(20),ST('confusion'))),
 ('72','Hammer Arm'):{'type':'discardTop','amount':1,'side':'opponent'},
 ('73','Retaliate'):BONUS(60,{'type':'koByOpponentAttackLastTurn'}),
 ('74','Abundant Harvest'):R('abundantHarvest'),
 ('74','Gaia Hammer'):S(BENCH(10),BENCH(10,'self')),
 ('75','Iron Head'):COIN('untilTails',10),
 ('79','Berserker Blade'):{'type':'multiTargetDamage','target':'opponentBench','count':2,'amount':40},
 ('82','Energy Stream'):R('energyStream'),
 ('82','Metal Scissors'):{'type':'energyDamage','source':'self','energyType':'Metal','amount':20,'mode':'add'},
 ('83','Devour'):R('devour'),
 ('84','Energy Press'):{'type':'energyDamage','source':'opponent','amount':20,'mode':'add'},
 ('85','Do the Wave'):{'type':'benchCountDamage','side':'self','amount':10},
 ('97','Leaf Wallop'):R('leafWallop'),
 ('98','Stored Power'):R('storedPower'),
 ('99','Retaliate'):BONUS(60,{'type':'koByOpponentAttackLastTurn'}),
 ('100','Energy Press'):{'type':'energyDamage','source':'opponent','amount':20,'mode':'add'},
}
# Every Ability is printed as an Ability (not a Poké-Power), so historic
# Power/Body locks do not apply. The shared engine owns the passive effects.
ABILITY={
 'Leaf Tailor':{'type':'passive','effect':R('leafTailor')},
 'Victory Star':{'type':'passive','effect':{'type':'coinReroll','scope':'attack'}},
 'Solid Rock':{'type':'passive','effect':R('solidRock')},
 'Cursed Body':{'type':'triggered','event':'damagedByAttack','opponentAttackOnly':True,'activeOnly':True,'effect':ST('confusion')},
 'Dynamotor':{'type':'activated','oncePerTurn':True,'effect':R('dynamotor')},
 'Durable Body':{'type':'passive','effect':{'type':'koGuard','mode':'surviveCoin','remainingHp':10,'attackOnly':True}},
 'Cursed Shadow':{'type':'activated','oncePerTurn':True,'activeOnly':True,'effect':R('cursedShadow')},
 'Craftsmanship':{'type':'passive','effect':{'type':'modifier','stat':'maxHp','amount':20,'scope':'self','duration':'whileInPlay','perEnergyCards':True,'energyType':'Fighting'}},
 'Ancient Power':{'type':'passive','effect':R('ancientPower')},
 'Dark Aura':{'type':'passive','effect':R('darkAura')},
 'Rough Skin':{'type':'triggered','event':'damagedByAttack','opponentAttackOnly':True,'activeOnly':True,'effect':R('roughSkin')},
}
TRAINERS={
 '90':('Item',R('coverFossil')),
 '91':('Tool',N),
 '92':('Supporter',R('n')),
 '93':('Item',R('plumeFossil')),
 '94':('Tool',R('rockyHelmet')),
 '95':('Item',R('superRod')),
 '96':('Item',Q(SEARCH(1,kind='trainer',trainerType='Supporter'))),
 '101':('Supporter',R('n')),
}
# These depend on unimplemented Restored/Fossil entry rules; do not allow
# misleading battle actions until correct start-of-game/bench restrictions exist.
GATE={}  # Both Restored Pokémon are playable ONLY via Cover/Plume Fossil.

def attack(row,a):
 n,title=str(row[0]),a[0];s=(a[3] or '').strip()
 if (n,title) in A:return A[n,title]
 if not s:return N
 if s=='Draw 2 cards.':return DRAW(2)
 if s=='Draw a card.':return DRAW(1)
 if s=='Heal 10 damage from this Pokémon.':return HEAL(10)
 if s=='Heal 30 damage from this Pokémon.':return HEAL(30)
 m=re.fullmatch(r'This Pokémon does (\d+) damage to itself\.',s)
 if m:return {'type':'selfDamage','amount':int(m[1])}
 m=re.fullmatch(r'The Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',s)
 if m:return ST(H.STATUS[m[1]])
 m=re.fullmatch(r'Flip a coin\. If heads, the Defending Pokémon is now (Paralyzed|Asleep|Poisoned|Burned|Confused)\.',s)
 if m:return Q(ST(H.STATUS[m[1]]))
 m=re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) more damage\.',s)
 if m:return Q(BONUS(int(m[1])))
 m=re.fullmatch(r'Flip 2 coins\. This attack does (\d+) more damage for each heads\.',s)
 if m:return COIN(2,int(m[1]),False)
 m=re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.',s)
 if m:return COIN(int(m[1]),int(m[2]))
 if s=='Flip a coin. If tails, this attack does nothing.':return {'type':'coinAttackGate','heads':N}
 if s=='The Defending Pokémon can\'t retreat during your opponent\'s next turn.':return LOCK()
 if s=='The Defending Pokémon can\'t attack during your opponent\'s next turn.':return {'type':'lock','action':'attack','target':'opponentActive','duration':'opponentTurn'}
 if s=='This attack\'s damage isn\'t affected by Resistance.':return {'type':'damageRule','ignoreResistance':True}
 if s=='This Pokémon can\'t attack during your next turn.':return {'type':'lock','action':'attack','target':'self','duration':'nextOwnTurn'}
 if s=='Switch this Pokémon with 1 of your Benched Pokémon.':return SWITCH()
 if s=='Switch the Defending Pokémon with 1 of your opponent\'s Benched Pokémon.':return {'type':'forceOpponentSwitch','chooseBy':'attacker'}
 if s=='Does 20 more damage for each Energy attached to the Defending Pokémon.':return {'type':'energyDamage','source':'opponent','amount':20,'mode':'add'}
 if s=='Does 20 more damage for each Water Energy attached to this Pokémon.':return {'type':'energyDamage','source':'self','energyType':'Water','amount':20,'mode':'add'}
 if s=='If the Defending Pokémon already has any damage counters on it, this attack does 50 more damage.':return BONUS(50,{'type':'opponentDamaged'})
 if s=='Discard an Energy attached to the Defending Pokémon.':return DISC(1,'opponentActive')
 if s=='The Defending Pokémon is now Poisoned.':return ST('poison')
 if s=='The Defending Pokémon is now Burned.':return ST('burn')
 if s=='The Defending Pokémon is now Confused.':return ST('confusion')
 if s=='Flip a coin. If tails, this Pokémon does 30 damage to itself.':return Q(t={'type':'selfDamage','amount':30})
 if s=='Flip a coin. If heads, prevent all effects of attacks, including damage, done to this Pokémon during your opponent\'s next turn.':return Q({'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True})
 if s=='During your opponent\'s next turn, any damage done to this Pokémon by attacks is reduced by 20 (after applying Weakness and Resistance).':return GUARD(20)
 if s=='During your opponent\'s next turn, each of this Pokémon\'s attacks does 40 more damage (before applying Weakness and Resistance).':return R('leafWallop')
 if s=='This attack\'s damage isn\'t affected by any effects on the Defending Pokémon.':return {'type':'damageRule','ignoreEffects':True}
 return None
